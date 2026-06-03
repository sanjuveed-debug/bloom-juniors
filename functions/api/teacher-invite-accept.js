// POST /api/teacher-invite-accept
// Requires: Authorization: Bearer <supabase-jwt>  (teacher just registered)
// Body: { token }
// Marks the invite as accepted and returns { ok, schoolId, schoolName }.

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  })
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
  const { email: userEmail } = await userResp.json()

  // ── Parse body ──────────────────────────────────────────────────────
  let body = {}
  try { body = await request.json() } catch {}
  const token = String(body.token || '').trim()
  if (!token) return json({ error: 'Missing token' }, 400)

  // ── Find the invite ─────────────────────────────────────────────────
  const inviteResp = await fetch(
    `${supabaseUrl}/rest/v1/teacher_invites?token=eq.${encodeURIComponent(token)}&select=id,school_id,email,expires_at,accepted_at,schools(name)`,
    { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } },
  )
  const invites = inviteResp.ok ? await inviteResp.json() : []
  if (!Array.isArray(invites) || invites.length === 0) return json({ error: 'Token not found' }, 404)

  const invite = invites[0]
  if (invite.accepted_at)                          return json({ error: 'Already accepted' }, 409)
  if (new Date(invite.expires_at) < new Date())    return json({ error: 'Token expired' }, 410)
  if (invite.email.toLowerCase() !== (userEmail || '').toLowerCase()) {
    return json({ error: 'Email does not match invite' }, 403)
  }

  // ── Mark accepted ───────────────────────────────────────────────────
  await fetch(`${supabaseUrl}/rest/v1/teacher_invites?id=eq.${invite.id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ accepted_at: new Date().toISOString() }),
  })

  return json({ ok: true, schoolId: invite.school_id, schoolName: invite.schools?.name || '' })
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
