import { cors, json, verifyClassSession } from './_class-session.js'

export async function onRequestGet({ request, env }) {
  const supabaseUrl = (env.SUPABASE_URL || '').trim()
  const serviceKey = (env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  if (!supabaseUrl || !serviceKey) return json({ error: 'Service not configured' }, 503)
  const date = new URL(request.url).searchParams.get('date') || ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: 'Invalid lesson date' }, 400)
  const session = await verifyClassSession(serviceKey, request.headers.get('X-Class-Session'))
  if (!session) return json({ error: 'Invalid class session' }, 401)
  const headers = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
  try {
    // Scope comes exclusively from the signed session, never request class IDs.
    const pupil = await fetch(`${supabaseUrl}/rest/v1/child_profiles?id=eq.${encodeURIComponent(session.profileId)}&school_id=eq.${encodeURIComponent(session.schoolId)}&class_id=eq.${encodeURIComponent(session.classId)}&select=id&limit=1`, { headers })
    if (!pupil.ok) return json({ error: 'Could not verify pupil' }, 502)
    const pupils = await pupil.json()
    if (!Array.isArray(pupils) || !pupils[0]?.id) return json({ error: 'Pupil not found' }, 404)
    const response = await fetch(`${supabaseUrl}/rest/v1/class_lessons?school_id=eq.${encodeURIComponent(session.schoolId)}&class_id=eq.${encodeURIComponent(session.classId)}&lesson_date=eq.${date}&select=module_ids&limit=1`, { headers })
    if (!response.ok) return json({ error: 'Could not load lesson' }, 502)
    const rows = await response.json()
    return json({ moduleIds: Array.isArray(rows?.[0]?.module_ids) ? rows[0].module_ids : null })
  } catch { return json({ error: 'Lesson service unavailable' }, 502) }
}

export async function onRequestOptions() { return cors('GET, OPTIONS') }
