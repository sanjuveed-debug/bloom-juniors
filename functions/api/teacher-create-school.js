// POST /api/teacher-create-school
// Requires: Authorization: Bearer <supabase-jwt>
// Body: { schoolName }
// Creates a school owned by the caller and returns { ok, schoolId, schoolName, inviteCode }.
// Uses the service key to avoid the brief JWT-propagation window after signUp.

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  })
}

function randomCode(len = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no O/0 or I/1 to avoid confusion
  const buf = new Uint8Array(len)
  crypto.getRandomValues(buf)
  return Array.from(buf, b => chars[b % chars.length]).join('')
}

export async function onRequestPost(context) {
  const { request, env } = context

  const supabaseUrl = (env.SUPABASE_URL || '').trim()
  const serviceKey  = (env.SUPABASE_SERVICE_ROLE_KEY || '').trim()

  if (!supabaseUrl || !serviceKey) return json({ error: 'Service not configured' }, 503)

  // ── Auth check ──────────────────────────────────────────────────────
  const jwt = (request.headers.get('Authorization') || '').replace('Bearer ', '').trim()
  if (!jwt) return json({ error: 'Unauthorized' }, 401)

  const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${jwt}`, apikey: serviceKey },
  })
  if (!userResp.ok) return json({ error: 'Invalid session' }, 401)
  const { id: userId } = await userResp.json()

  // ── Parse body ──────────────────────────────────────────────────────
  let body = {}
  try { body = await request.json() } catch {}
  const schoolName = String(body.schoolName || '').trim().slice(0, 120)
  if (!schoolName) return json({ error: 'School name is required' }, 400)

  // ── Insert school (retry on invite_code collision — rare) ───────────
  let schoolId = null
  let inviteCode = null

  for (let attempt = 0; attempt < 5; attempt++) {
    inviteCode = randomCode(6)
    const insertResp = await fetch(`${supabaseUrl}/rest/v1/schools`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ name: schoolName, created_by: userId, invite_code: inviteCode }),
    })

    if (insertResp.status === 409) continue  // duplicate invite_code, retry

    if (!insertResp.ok) {
      const detail = await insertResp.text().catch(() => '')
      return json({ error: 'Could not create school', detail }, 502)
    }

    const rows = await insertResp.json()
    schoolId = rows[0]?.id
    break
  }

  if (!schoolId) return json({ error: 'Could not generate unique school code' }, 500)

  return json({ ok: true, schoolId, schoolName, inviteCode })
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
