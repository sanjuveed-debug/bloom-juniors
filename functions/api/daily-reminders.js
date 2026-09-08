import {
  getReturnReminderEligibility,
  markReturnReminderSent,
  normalizeReturnReminder,
} from '../../src/utils/returnReminder.js'
import {
  buildPersonalizedReminder,
  buildReminderDeepLink,
} from '../../src/utils/personalizedReminder.js'
import { sendWebPush } from './_web-push.js'

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function reminderHtml({ childName, recommendation }) {
  const name = escapeHtml(childName || 'your child')
  const activity = escapeHtml(recommendation.moduleLabel)
  const chapterLine = recommendation.chapter
    ? `${escapeHtml(recommendation.chapter)} is the next chapter.`
    : `A short ${activity} activity is ready.`
  const link = escapeHtml(buildReminderDeepLink(recommendation, 'return_reminder'))

  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff7ed;border:1px solid #fed7aa;border-radius:16px;overflow:hidden">
      <div style="background:#1e3a5f;padding:28px;text-align:center">
        <div style="font-size:44px;margin-bottom:8px">🌟</div>
        <h1 style="color:#fff;font-size:24px;margin:0">A new adventure is ready</h1>
      </div>
      <div style="padding:28px;text-align:center;color:#422006">
        <p style="font-size:17px;line-height:1.6;margin:0 0 8px">${name} can continue in ${activity}.</p>
        <p style="font-size:15px;line-height:1.6;margin:0 0 24px;color:#6b4b32">${chapterLine}</p>
        <a href="${link}"
          style="display:inline-block;background:#c2410c;color:#fff;text-decoration:none;padding:13px 28px;border-radius:8px;font-weight:700">
          Continue the adventure
        </a>
        <p style="font-size:11px;line-height:1.5;color:#9a7b65;margin:24px 0 0">
          You enabled this gentle learning reminder. You can turn it off in Parent Zone at any time.
        </p>
      </div>
    </div>
  `
}

async function readRows(url, serviceKey, table, select) {
  const response = await fetch(
    `${url}/rest/v1/${table}?select=${encodeURIComponent(select)}`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
  )
  if (!response.ok) throw new Error(`Could not read ${table}: ${response.status}`)
  return response.json()
}

async function saveProgress(url, serviceKey, row, progress) {
  const query = `user_id=eq.${encodeURIComponent(row.user_id)}&profile_id=eq.${encodeURIComponent(row.profile_id)}`
  const response = await fetch(`${url}/rest/v1/child_progress?${query}`, {
    method: 'PATCH',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ progress, updated_at: new Date().toISOString() }),
  })
  if (!response.ok) throw new Error(`Could not update reminder state: ${response.status}`)
}

async function sendEmail(apiKey, from, recipient, child, recommendation) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [recipient],
      subject: recommendation.title,
      html: reminderHtml({
        childName: child.name,
        recommendation,
      }),
    }),
  })
  if (!response.ok) throw new Error(`Resend rejected reminder: ${response.status}`)
}

function authorized(request, secret) {
  const expected = String(secret || '')
  const supplied = String(request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')
  return expected.length >= 24 && supplied === expected
}

export async function onRequestPost({ request, env }) {
  if (!authorized(request, env.CRON_SECRET)) return json({ error: 'Unauthorized' }, 401)

  const supabaseUrl = String(env.SUPABASE_URL || '').replace(/\/$/, '')
  const serviceKey = String(env.SUPABASE_SERVICE_ROLE_KEY || '')
  const resendKey = String(env.RESEND_API_KEY || '')
  const from = String(env.USAGE_NOTIFY_FROM || '')
  if (!supabaseUrl || !serviceKey || !resendKey || !from) {
    return json({ error: 'Reminder service is not configured' }, 503)
  }

  const [progressRows, profiles, guardians] = await Promise.all([
    readRows(supabaseUrl, serviceKey, 'child_progress', 'user_id,profile_id,progress'),
    readRows(supabaseUrl, serviceKey, 'child_profiles', 'id,user_id,name,age_group'),
    readRows(supabaseUrl, serviceKey, 'guardian_profiles', 'user_id,email,school_id'),
  ])

  const profileByKey = new Map(profiles.map(profile => [`${profile.user_id}:${profile.id}`, profile]))
  const guardianByUser = new Map(guardians.map(guardian => [guardian.user_id, guardian]))
  const now = new Date()
  let due = 0
  let sent = 0
  let emailSent = 0
  let pushSent = 0
  let failed = 0
  const eligibility = {
    emailEnabled: 0,
    pushEnabled: 0,
    disabled: 0,
    visitedToday: 0,
    beforeTime: 0,
    alreadySent: 0,
  }

  for (const row of progressRows) {
    const reminder = normalizeReturnReminder(row.progress?.returnReminder)
    if (reminder.enabled) eligibility.emailEnabled += 1
    if (reminder.pushEnabled) eligibility.pushEnabled += 1
    const status = getReturnReminderEligibility(row.progress, now)
    if (!status.due) {
      if (status.reason === 'disabled') eligibility.disabled += 1
      if (status.reason === 'visited_today') eligibility.visitedToday += 1
      if (status.reason === 'before_time') eligibility.beforeTime += 1
      if (status.reason === 'already_sent') eligibility.alreadySent += 1
      continue
    }

    const profile = profileByKey.get(`${row.user_id}:${row.profile_id}`)
    const guardian = guardianByUser.get(row.user_id)
    if (!profile || !guardian || guardian.school_id) continue

    due += 1
    try {
      const recommendation = buildPersonalizedReminder({
        progress: row.progress,
        profile,
        now,
      })
      let delivered = false
      let pushExpired = false
      if (reminder.enabled && guardian.email) {
        try {
          await sendEmail(resendKey, from, guardian.email, profile, recommendation)
          emailSent += 1
          delivered = true
        } catch {}
      }
      if (reminder.pushEnabled && reminder.pushSubscription) {
        try {
          const push = await sendWebPush(reminder.pushSubscription, {
            title: recommendation.title,
            body: recommendation.body,
            url: buildReminderDeepLink(recommendation, 'return_push'),
            tag: `bloom-return-${row.profile_id}`,
          }, env)
          if (push.ok) {
            pushSent += 1
            delivered = true
          }
          pushExpired = push.expired
        } catch {}
      }
      if (!delivered) throw new Error('No reminder channel delivered')

      const nextProgress = markReturnReminderSent(row.progress, now)
      if (pushExpired) {
        nextProgress.returnReminder.pushEnabled = false
        nextProgress.returnReminder.pushSubscription = null
      }
      await saveProgress(supabaseUrl, serviceKey, row, nextProgress)
      sent += 1
    } catch {
      failed += 1
    }
  }

  return json({ ok: true, checked: progressRows.length, due, sent, emailSent, pushSent, failed, eligibility })
}
