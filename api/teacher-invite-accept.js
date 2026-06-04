function json(res, data, status = 200) {
  res.status(status).json(data)
}

function cleanEnv(value) {
  return String(value || '').trim()
}

async function getUser(req, supabaseUrl, serviceKey) {
  const jwt = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim()
  if (!jwt) return null

  const resp = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${jwt}`, apikey: serviceKey },
  })
  if (!resp.ok) return null
  return resp.json().catch(() => null)
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

  const user = await getUser(req, supabaseUrl, serviceKey)
  if (!user?.email) {
    json(res, { error: 'Unauthorized' }, 401)
    return
  }

  const token = String(req.body?.token || '').trim()
  if (!token) {
    json(res, { error: 'Missing token' }, 400)
    return
  }

  const inviteResp = await fetch(
    `${supabaseUrl}/rest/v1/teacher_invites?token=eq.${encodeURIComponent(token)}&select=id,school_id,email,expires_at,accepted_at,schools(name)`,
    { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } },
  )
  const invites = inviteResp.ok ? await inviteResp.json().catch(() => []) : []
  if (!Array.isArray(invites) || invites.length === 0) {
    json(res, { error: 'Token not found' }, 404)
    return
  }

  const invite = invites[0]
  if (invite.accepted_at) {
    json(res, { error: 'Already accepted' }, 409)
    return
  }
  if (new Date(invite.expires_at) < new Date()) {
    json(res, { error: 'Token expired' }, 410)
    return
  }
  if (invite.email.toLowerCase() !== String(user.email || '').toLowerCase()) {
    json(res, { error: 'Email does not match invite' }, 403)
    return
  }

  const patchResp = await fetch(`${supabaseUrl}/rest/v1/teacher_invites?id=eq.${invite.id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ accepted_at: new Date().toISOString() }),
  })

  if (!patchResp.ok) {
    const detail = await patchResp.text().catch(() => '')
    json(res, { error: 'Could not accept invite', detail }, 502)
    return
  }

  json(res, { ok: true, schoolId: invite.school_id, schoolName: invite.schools?.name || '' })
}
