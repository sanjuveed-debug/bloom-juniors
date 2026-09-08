import {
  buildReactivationCandidates,
  markReactivationSent,
  REACTIVATION_CAMPAIGN_ID,
  REACTIVATION_INACTIVE_DAYS,
} from '../../src/utils/founderReactivation.js'
import { buildPersonalizedReminder, buildReminderDeepLink } from '../../src/utils/personalizedReminder.js'
import { authenticateFounder, json, readAuthUsers, readRows } from './_founder-auth.js'

const MAX_SENDS = 50

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function campaignHtml({ profile, recommendation }) {
  const childName = escapeHtml(profile?.name || 'Your child')
  const activity = escapeHtml(recommendation.moduleLabel || 'Bloom Juniors')
  const link = escapeHtml(buildReminderDeepLink({
    ...recommendation,
    content: `${REACTIVATION_CAMPAIGN_ID}_${recommendation.content}`,
  }, 'return_reminder'))
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #dbe4ee;background:#ffffff">
      <div style="background:#1e3a5f;padding:26px;text-align:center;color:#ffffff">
        <p style="font-size:12px;font-weight:700;letter-spacing:.12em;margin:0 0 8px">BLOOM JUNIORS</p>
        <h1 style="font-size:24px;margin:0">One short adventure is ready</h1>
      </div>
      <div style="padding:28px;color:#172033">
        <p style="font-size:17px;line-height:1.6;margin:0 0 12px">We made returning simpler. ${childName}'s next activity is ready in ${activity}.</p>
        <p style="font-size:15px;line-height:1.6;margin:0 0 24px">It is designed as one clear stopping point, so there is no pressure to keep going.</p>
        <p style="text-align:center;margin:0 0 24px"><a href="${link}" style="display:inline-block;background:#c2410c;color:#ffffff;text-decoration:none;padding:13px 24px;font-weight:700">Start the next activity</a></p>
        <p style="font-size:14px;line-height:1.6;margin:0 0 18px">What made it difficult to return? Reply with one sentence. Your answer will help us improve Bloom.</p>
        <p style="font-size:11px;line-height:1.5;color:#64748b;margin:0">You enabled learning reminders for this profile. You can turn them off at any time in Parent Zone.</p>
      </div>
    </div>`
}

async function sendEmail(env, candidate, recommendation) {
  const payload = {
    from: String(env.USAGE_NOTIFY_FROM || ''),
    to: [candidate.email],
    subject: `${candidate.profile?.name || 'Your child'}'s next Bloom adventure is ready`,
    html: campaignHtml({ profile: candidate.profile, recommendation }),
  }
  const replyTo = String(env.REACTIVATION_REPLY_TO || '').trim()
  if (replyTo) payload.reply_to = replyTo
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `${REACTIVATION_CAMPAIGN_ID}-${candidate.userId}`,
    },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(`Resend rejected reactivation: ${response.status}`)
}

async function saveProgress(url, serviceKey, candidate, progress) {
  const query = `user_id=eq.${encodeURIComponent(candidate.row.user_id)}&profile_id=eq.${encodeURIComponent(candidate.row.profile_id)}`
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
  if (!response.ok) throw new Error(`Could not save campaign state: ${response.status}`)
}

export async function onRequestPost({ request, env }) {
  const auth = await authenticateFounder(request, env)
  if (auth.error) return auth.error
  const { supabaseUrl, serviceKey } = auth

  const body = await request.json().catch(() => ({}))
  if (body.campaignId !== REACTIVATION_CAMPAIGN_ID || body.confirm !== 'send') {
    return json({ error: 'Explicit campaign confirmation required' }, 400)
  }
  if (!env.RESEND_API_KEY || !env.USAGE_NOTIFY_FROM) {
    return json({ error: 'Reactivation email is not configured' }, 503)
  }

  try {
    const [profiles, progressRows, guardians, authUsers] = await Promise.all([
      readRows(supabaseUrl, serviceKey, 'child_profiles', 'id,user_id,name,age_group,created_at,school_id'),
      readRows(supabaseUrl, serviceKey, 'child_progress', 'user_id,profile_id,progress,updated_at'),
      readRows(supabaseUrl, serviceKey, 'guardian_profiles', 'user_id,email,school_id,registered_at'),
      readAuthUsers(supabaseUrl, serviceKey),
    ])
    const candidates = buildReactivationCandidates(
      { profiles, progressRows, guardians, authUsers },
      { now: new Date(), inactiveDays: REACTIVATION_INACTIVE_DAYS, campaignId: REACTIVATION_CAMPAIGN_ID },
    )
    let sent = 0
    let failed = 0
    for (const candidate of candidates.slice(0, MAX_SENDS)) {
      try {
        const now = new Date()
        const recommendation = buildPersonalizedReminder({
          progress: candidate.progress,
          profile: candidate.profile,
          now,
        })
        await sendEmail(env, candidate, recommendation)
        await saveProgress(
          supabaseUrl,
          serviceKey,
          candidate,
          markReactivationSent(candidate.progress, { campaignId: REACTIVATION_CAMPAIGN_ID, sentAt: now.getTime() }),
        )
        sent += 1
      } catch {
        failed += 1
      }
    }
    return json({
      ok: true,
      campaignId: REACTIVATION_CAMPAIGN_ID,
      eligible: candidates.length,
      attempted: Math.min(candidates.length, MAX_SENDS),
      sent,
      failed,
    })
  } catch {
    return json({ error: 'Could not run the reactivation campaign' }, 502)
  }
}
