import { cors, json, signClassSession } from './_class-session.js'

function normalizeCode(value) {
  return String(value || '').trim().toUpperCase().replace(/\s+/g, '')
}

export async function onRequestGet(context) {
  const { request, env } = context
  const supabaseUrl = (env.SUPABASE_URL || '').trim()
  const serviceKey = (env.SUPABASE_SERVICE_ROLE_KEY || '').trim()

  if (!supabaseUrl || !serviceKey) return json({ error: 'Service not configured' }, 503)

  const code = normalizeCode(new URL(request.url).searchParams.get('code'))
  if (!/^[A-Z0-9-]{5,16}$/.test(code)) return json({ error: 'Enter a valid class code' }, 400)

  const classResp = await fetch(
    `${supabaseUrl}/rest/v1/school_classes?class_code=eq.${encodeURIComponent(code)}&select=id,school_id,name,age_group,schools(name)&limit=1`,
    { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } },
  )

  if (!classResp.ok) return json({ error: 'Class lookup failed' }, 502)

  const classRows = await classResp.json()
  const classRow = Array.isArray(classRows) ? classRows[0] : null
  if (!classRow?.id) return json({ error: 'Class code not found' }, 404)

  const pupilsResp = await fetch(
    `${supabaseUrl}/rest/v1/child_profiles?school_id=eq.${encodeURIComponent(classRow.school_id)}&class_id=eq.${encodeURIComponent(classRow.id)}&select=id,name,emoji,age_group,color_idx,created_at&order=name.asc`,
    { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } },
  )

  if (!pupilsResp.ok) return json({ error: 'Could not load pupils' }, 502)

  const pupils = await pupilsResp.json()
  const exp = Math.floor(Date.now() / 1000) + 12 * 60 * 60

  const roster = await Promise.all((Array.isArray(pupils) ? pupils : []).map(async pupil => ({
    id: pupil.id,
    name: pupil.name,
    emoji: pupil.emoji || null,
    ageGroup: pupil.age_group || classRow.age_group || 'early',
    colorIdx: Number.isFinite(pupil.color_idx) ? pupil.color_idx : 0,
    createdAt: pupil.created_at ? new Date(pupil.created_at).getTime() : Date.now(),
    sessionToken: await signClassSession(serviceKey, {
      profileId: pupil.id,
      classId: classRow.id,
      schoolId: classRow.school_id,
      exp,
    }),
  })))

  return json({
    ok: true,
    classCode: code,
    classId: classRow.id,
    className: classRow.name,
    schoolId: classRow.school_id,
    schoolName: classRow.schools?.name || '',
    pupils: roster,
  })
}

export async function onRequestOptions() {
  return cors('GET, OPTIONS')
}
