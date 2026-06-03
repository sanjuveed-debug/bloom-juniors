// POST /api/teacher-invite-send
// Requires: Authorization: Bearer <supabase-jwt>
// Body: { email, schoolId }
// Creates a 48-hour invite token and emails the recipient via Resend.

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  })
}

function randomToken(len = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const buf = new Uint8Array(len)
  crypto.getRandomValues(buf)
  return Array.from(buf, b => chars[b % chars.length]).join('')
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function onRequestPost(context) {
  const { request, env } = context

  const supabaseUrl   = (env.SUPABASE_URL || '').trim()
  const serviceKey    = (env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  const resendKey     = (env.RESEND_API_KEY || '').trim()
  const fromEmail     = (env.USAGE_NOTIFY_FROM || '').trim()

  if (!supabaseUrl || !serviceKey) return json({ error: 'Service not configured' }, 503)
  if (!resendKey || !fromEmail) return json({ error: 'Email service not configured' }, 503)

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
  const inviteeEmail = String(body.email || '').trim().toLowerCase()
  const schoolId     = String(body.schoolId || '').trim()

  if (!inviteeEmail.includes('@')) return json({ error: 'Invalid email' }, 400)
  if (!schoolId) return json({ error: 'Missing schoolId' }, 400)

  // ── Verify caller belongs to this school ───────────────────────────
  const profileResp = await fetch(
    `${supabaseUrl}/rest/v1/guardian_profiles?user_id=eq.${userId}&school_id=eq.${schoolId}&select=teacher_role`,
    { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } },
  )
  const profiles = profileResp.ok ? await profileResp.json() : []
  if (!Array.isArray(profiles) || profiles.length === 0) {
    return json({ error: 'Not authorised for this school' }, 403)
  }

  // ── Get school name ─────────────────────────────────────────────────
  const schoolResp = await fetch(
    `${supabaseUrl}/rest/v1/schools?id=eq.${schoolId}&select=name`,
    { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } },
  )
  const schools = schoolResp.ok ? await schoolResp.json() : []
  const schoolName = schools[0]?.name || 'your school'

  // ── Create invite record ────────────────────────────────────────────
  const token     = randomToken(32)
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

  const insertResp = await fetch(`${supabaseUrl}/rest/v1/teacher_invites`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ school_id: schoolId, email: inviteeEmail, token, invited_by: userId, expires_at: expiresAt }),
  })

  if (!insertResp.ok) {
    const detail = await insertResp.text().catch(() => '')
    return json({ error: 'Could not create invite', detail }, 502)
  }

  // ── Send email ──────────────────────────────────────────────────────
  const inviteUrl = `https://bloomjuniors.com/teacher-invite?token=${token}`
  const html = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:30px;text-align:center">
          <div style="font-size:44px;margin-bottom:10px">🏫</div>
          <h1 style="color:white;font-size:22px;margin:0 0 6px">Teacher Invite</h1>
          <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0">Join ${escapeHtml(schoolName)} on Bloom Juniors</p>
        </div>
        <div style="padding:28px">
          <p style="font-size:15px;color:#374151;margin:0 0 16px">Hi there,</p>
          <p style="font-size:15px;color:#374151;margin:0 0 20px">
            A colleague has invited you to set up your classroom on <strong>Bloom Juniors</strong> —
            a free, ad-free British curriculum learning platform for children aged 3–9.
          </p>
          <p style="font-size:14px;color:#6B7280;margin:0 0 24px">
            Once you join, you can add your class, track learning progress for each pupil, and access
            phonics, maths, reading and more — all curriculum-aligned.
          </p>
          <div style="text-align:center;margin:24px 0">
            <a href="${inviteUrl}"
              style="display:inline-block;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:white;text-decoration:none;padding:14px 34px;border-radius:50px;font-weight:700;font-size:15px">
              Accept Invite &amp; Set Up Classroom →
            </a>
          </div>
          <p style="font-size:12px;color:#9CA3AF;text-align:center;margin:0">
            This link expires in 48 hours &nbsp;·&nbsp; Questions? hello@bloomjuniors.com
          </p>
        </div>
      </div>
    `
  const emailResp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: fromEmail,
      to: [inviteeEmail],
      subject: `You're invited to join ${schoolName} on Bloom Juniors`,
      html,
    }),
  })

  if (!emailResp.ok) {
    const detail = await emailResp.text().catch(() => '')
    return json({ error: 'Invite created, but email could not be sent', detail }, 502)
  }

  return json({ ok: true })
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
