function json(res, data, status = 200) {
  res.status(status).json(data)
}

function cleanEnv(value) {
  return String(value || '').trim()
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    json(res, { valid: false, error: 'Method not allowed' }, 405)
    return
  }

  const supabaseUrl = cleanEnv(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)
  const serviceKey = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY)
  if (!supabaseUrl || !serviceKey) {
    json(res, { valid: false, error: 'Service not configured' })
    return
  }

  const token = String(req.query?.token || '').trim()
  if (token.length < 20) {
    json(res, { valid: false, error: 'Missing or short token' })
    return
  }

  const resp = await fetch(
    `${supabaseUrl}/rest/v1/teacher_invites?token=eq.${encodeURIComponent(token)}&select=id,school_id,email,expires_at,accepted_at,schools(name)`,
    { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } },
  )

  if (!resp.ok) {
    json(res, { valid: false, error: 'Lookup failed' })
    return
  }

  const rows = await resp.json().catch(() => [])
  if (!Array.isArray(rows) || rows.length === 0) {
    json(res, { valid: false, error: 'Token not found' })
    return
  }

  const invite = rows[0]
  if (invite.accepted_at) {
    json(res, { valid: false, error: 'Invite already accepted' })
    return
  }
  if (new Date(invite.expires_at) < new Date()) {
    json(res, { valid: false, error: 'Invite has expired' })
    return
  }

  json(res, {
    valid: true,
    schoolId: invite.school_id,
    schoolName: invite.schools?.name || '',
    email: invite.email,
  })
}
