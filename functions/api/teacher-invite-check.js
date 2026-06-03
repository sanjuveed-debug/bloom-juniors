// GET /api/teacher-invite-check?token=<token>
// Public endpoint — uses service key to validate without requiring a session.
// Returns { valid, schoolId, schoolName, email } or { valid: false, error }.

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  })
}

export async function onRequestGet(context) {
  const { request, env } = context

  const supabaseUrl = (env.SUPABASE_URL || '').trim()
  const serviceKey  = (env.SUPABASE_SERVICE_ROLE_KEY || '').trim()

  if (!supabaseUrl || !serviceKey) return json({ valid: false, error: 'Service not configured' })

  const token = new URL(request.url).searchParams.get('token') || ''
  if (token.length < 20) return json({ valid: false, error: 'Missing or short token' })

  const resp = await fetch(
    `${supabaseUrl}/rest/v1/teacher_invites?token=eq.${encodeURIComponent(token)}&select=id,school_id,email,expires_at,accepted_at,schools(name)`,
    { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } },
  )

  if (!resp.ok) return json({ valid: false, error: 'Lookup failed' })

  const rows = await resp.json()
  if (!Array.isArray(rows) || rows.length === 0) return json({ valid: false, error: 'Token not found' })

  const invite = rows[0]
  if (invite.accepted_at)                          return json({ valid: false, error: 'Invite already accepted' })
  if (new Date(invite.expires_at) < new Date())    return json({ valid: false, error: 'Invite has expired' })

  return json({
    valid: true,
    schoolId:   invite.school_id,
    schoolName: invite.schools?.name || '',
    email:      invite.email,
  })
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
