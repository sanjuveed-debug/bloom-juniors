import { normalizePushSubscription } from '../../src/utils/pushSubscription.js'
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

async function authenticatedUser(request, supabaseUrl, serviceKey) {
  const authorization = request.headers.get('Authorization') || ''
  if (!authorization.startsWith('Bearer ')) return null
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: authorization, apikey: serviceKey },
  })
  if (!response.ok) return null
  const user = await response.json().catch(() => null)
  return user?.id ? user : null
}

export async function onRequestPost({ request, env }) {
  const supabaseUrl = String(env.SUPABASE_URL || '').replace(/\/$/, '')
  const serviceKey = String(env.SUPABASE_SERVICE_ROLE_KEY || '')
  if (!supabaseUrl || !serviceKey) return json({ error: 'Service not configured' }, 503)

  const user = await authenticatedUser(request, supabaseUrl, serviceKey)
  if (!user) return json({ error: 'Authentication required' }, 401)

  let body = {}
  try { body = await request.json() } catch {}
  const profileId = String(body.profileId || '').slice(0, 120)
  if (!profileId) return json({ error: 'Profile required' }, 400)

  const response = await fetch(
    `${supabaseUrl}/rest/v1/child_progress?user_id=eq.${encodeURIComponent(user.id)}&profile_id=eq.${encodeURIComponent(profileId)}&select=progress&limit=1`,
    { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } },
  )
  if (!response.ok) return json({ error: 'Could not load notification settings' }, 502)
  const rows = await response.json().catch(() => [])
  const subscription = normalizePushSubscription(rows[0]?.progress?.returnReminder?.pushSubscription)
  if (!subscription) return json({ error: 'Notification subscription is not synced yet' }, 409)

  const profileResponse = await fetch(
    `${supabaseUrl}/rest/v1/child_profiles?user_id=eq.${encodeURIComponent(user.id)}&id=eq.${encodeURIComponent(profileId)}&select=id,name,age_group&limit=1`,
    { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } },
  )
  const profiles = profileResponse.ok ? await profileResponse.json().catch(() => []) : []
  const profile = profiles[0] || { id: profileId, name: 'Your child', age_group: 'early' }
  const recommendation = buildPersonalizedReminder({
    progress: rows[0]?.progress || {},
    profile,
    now: new Date(),
  })
  const push = await sendWebPush(subscription, {
    title: recommendation.title,
    body: recommendation.body,
    url: buildReminderDeepLink(recommendation, 'push_test'),
    tag: `bloom-test-${profileId}`,
  }, env)
  if (!push.ok) {
    return json({
      error: push.expired
        ? 'This notification subscription expired. Turn app notifications off and on again.'
        : `Push service rejected the notification (${push.status}).`,
    }, push.expired ? 410 : 502)
  }
  return json({
    ok: true,
    providerStatus: push.status,
    target: recommendation.target,
    content: recommendation.content,
  })
}
