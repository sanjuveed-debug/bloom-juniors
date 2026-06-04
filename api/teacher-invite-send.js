function json(res, data, status = 200) {
  res.status(status).json(data)
}

function cleanEnv(value) {
  return String(value || '').trim()
}

function randomToken(len = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
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
  const resendKey = cleanEnv(process.env.RESEND_API_KEY)
  const fromEmail = cleanEnv(process.env.USAGE_NOTIFY_FROM)
  if (!supabaseUrl || !serviceKey) {
    json(res, { error: 'Service not configured' }, 503)
    return
  }
  if (!resendKey || !fromEmail) {
    json(res, { error: 'Email service not configured' }, 503)
    return
  }

  const userId = await getUserId(req, supabaseUrl, serviceKey)
  if (!userId) {
    json(res, { error: 'Unauthorized' }, 401)
    return
  }

  const inviteeEmail = String(req.body?.email || '').trim().toLowerCase()
  const schoolId = String(req.body?.schoolId || '').trim()
  if (!inviteeEmail.includes('@')) {
    json(res, { error: 'Invalid email' }, 400)
    return
  }
  if (!schoolId) {
    json(res, { error: 'Missing schoolId' }, 400)
    return
  }

  const profileResp = await fetch(
    `${supabaseUrl}/rest/v1/guardian_profiles?user_id=eq.${userId}&school_id=eq.${schoolId}&select=teacher_role`,
    { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } },
  )
  const profiles = profileResp.ok ? await profileResp.json().catch(() => []) : []
  if (!Array.isArray(profiles) || profiles.length === 0) {
    json(res, { error: 'Not authorised for this school' }, 403)
    return
  }

  const schoolResp = await fetch(
    `${supabaseUrl}/rest/v1/schools?id=eq.${schoolId}&select=name`,
    { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } },
  )
  const schools = schoolResp.ok ? await schoolResp.json().catch(() => []) : []
  const schoolName = schools[0]?.name || 'your school'

  const token = randomToken(32)
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
    json(res, { error: 'Could not create invite', detail }, 502)
    return
  }

  const inviteUrl = `https://bloomjuniors.com/teacher-invite?token=${token}`
  const html = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:30px;text-align:center">
          <div style="font-size:44px;margin-bottom:10px">School</div>
          <h1 style="color:white;font-size:22px;margin:0 0 6px">Teacher Invite</h1>
          <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0">Join ${escapeHtml(schoolName)} on Bloom Juniors</p>
        </div>
        <div style="padding:28px">
          <p style="font-size:15px;color:#374151;margin:0 0 16px">Hi there,</p>
          <p style="font-size:15px;color:#374151;margin:0 0 20px">
            A colleague has invited you to set up your classroom on <strong>Bloom Juniors</strong>.
          </p>
          <div style="text-align:center;margin:24px 0">
            <a href="${inviteUrl}"
              style="display:inline-block;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:white;text-decoration:none;padding:14px 34px;border-radius:50px;font-weight:700;font-size:15px">
              Accept Invite &amp; Set Up Classroom
            </a>
          </div>
          <p style="font-size:12px;color:#9CA3AF;text-align:center;margin:0">
            This link expires in 48 hours. Questions? hello@bloomjuniors.com
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
    json(res, { error: 'Invite created, but email could not be sent', detail }, 502)
    return
  }

  json(res, { ok: true })
}
