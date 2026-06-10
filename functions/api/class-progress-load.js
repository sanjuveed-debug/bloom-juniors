import { cors, json, verifyClassSession } from './_class-session.js'

export async function onRequestGet(context) {
  const { request, env } = context
  const supabaseUrl = (env.SUPABASE_URL || '').trim()
  const serviceKey = (env.SUPABASE_SERVICE_ROLE_KEY || '').trim()

  if (!supabaseUrl || !serviceKey) return json({ error: 'Service not configured' }, 503)

  const url = new URL(request.url)
  const profileId = url.searchParams.get('profileId') || ''
  const token = request.headers.get('X-Class-Session') || ''
  const session = await verifyClassSession(serviceKey, token)

  if (!session || session.profileId !== profileId) return json({ error: 'Invalid class session' }, 401)

  const profileResp = await fetch(
    `${supabaseUrl}/rest/v1/child_profiles?id=eq.${encodeURIComponent(profileId)}&school_id=eq.${encodeURIComponent(session.schoolId)}&class_id=eq.${encodeURIComponent(session.classId)}&select=id&limit=1`,
    { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } },
  )

  if (!profileResp.ok) return json({ error: 'Could not verify pupil' }, 502)
  const profileRows = await profileResp.json()
  const profile = Array.isArray(profileRows) ? profileRows[0] : null
  if (!profile?.id) return json({ error: 'Pupil not found' }, 404)

  const progressResp = await fetch(
    `${supabaseUrl}/rest/v1/child_progress?profile_id=eq.${encodeURIComponent(profileId)}&select=progress,updated_at&order=updated_at.desc&limit=1`,
    { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } },
  )

  if (!progressResp.ok) return json({ error: 'Could not load progress' }, 502)

  const rows = await progressResp.json()
  return json({ ok: true, progress: rows?.[0]?.progress || null })
}

export async function onRequestOptions() {
  return cors('GET, OPTIONS')
}
