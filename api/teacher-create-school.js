function json(res, data, status = 200) {
  res.status(status).json(data)
}

function cleanEnv(value) {
  return String(value || '').trim()
}

function randomCode(len = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

async function getUserId(req, supabaseUrl, serviceKey) {
  const jwt = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim()
  if (!jwt) return null

  const resp = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${jwt}`, apikey: serviceKey },
  })
  if (!resp.ok) return null
  const user = await resp.json().catch(() => null)
  return user?.id || null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    json(res, { error: 'Method not allowed' }, 405)
    return
  }

  const supabaseUrl = cleanEnv(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)
  const serviceKey = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY)
  if (!supabaseUrl || !serviceKey) {
    json(res, { error: 'Service not configured' }, 503)
    return
  }

  const userId = await getUserId(req, supabaseUrl, serviceKey)
  if (!userId) {
    json(res, { error: 'Unauthorized' }, 401)
    return
  }

  const schoolName = String(req.body?.schoolName || '').trim().slice(0, 120)
  if (!schoolName) {
    json(res, { error: 'School name is required' }, 400)
    return
  }

  let schoolId = null
  let inviteCode = null

  for (let attempt = 0; attempt < 5; attempt += 1) {
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

    if (insertResp.status === 409) continue

    if (!insertResp.ok) {
      const detail = await insertResp.text().catch(() => '')
      json(res, { error: 'Could not create school', detail }, 502)
      return
    }

    const rows = await insertResp.json().catch(() => [])
    schoolId = rows[0]?.id || null
    break
  }

  if (!schoolId) {
    json(res, { error: 'Could not generate unique school code' }, 500)
    return
  }

  json(res, { ok: true, schoolId, schoolName, inviteCode })
}
