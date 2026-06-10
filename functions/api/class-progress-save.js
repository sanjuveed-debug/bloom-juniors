import { cors, json, verifyClassSession } from './_class-session.js'

function toJsonSafe(value) {
  try {
    return JSON.parse(JSON.stringify(value || {}))
  } catch {
    return {}
  }
}

export async function onRequestPost(context) {
  const { request, env } = context
  const supabaseUrl = (env.SUPABASE_URL || '').trim()
  const serviceKey = (env.SUPABASE_SERVICE_ROLE_KEY || '').trim()

  if (!supabaseUrl || !serviceKey) return json({ error: 'Service not configured' }, 503)

  const token = request.headers.get('X-Class-Session') || ''
  const session = await verifyClassSession(serviceKey, token)
  if (!session) return json({ error: 'Invalid class session' }, 401)

  let body = {}
  try { body = await request.json() } catch {}
  const profileId = String(body.profileId || '')
  if (!profileId || profileId !== session.profileId) return json({ error: 'Invalid pupil' }, 401)

  const profileResp = await fetch(
    `${supabaseUrl}/rest/v1/child_profiles?id=eq.${encodeURIComponent(profileId)}&school_id=eq.${encodeURIComponent(session.schoolId)}&class_id=eq.${encodeURIComponent(session.classId)}&select=id,user_id&limit=1`,
    { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } },
  )

  if (!profileResp.ok) return json({ error: 'Could not verify pupil' }, 502)
  const profileRows = await profileResp.json()
  const profile = Array.isArray(profileRows) ? profileRows[0] : null
  if (!profile?.id) return json({ error: 'Pupil not found' }, 404)

  const upsertResp = await fetch(`${supabaseUrl}/rest/v1/child_progress?on_conflict=user_id,profile_id`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      user_id: profile.user_id,
      profile_id: profileId,
      progress: toJsonSafe(body.progress),
      updated_at: new Date().toISOString(),
    }),
  })

  if (!upsertResp.ok) {
    const detail = await upsertResp.text().catch(() => '')
    return json({ error: 'Could not save progress', detail }, 502)
  }

  return json({ ok: true })
}

export async function onRequestOptions() {
  return cors('POST, OPTIONS')
}
