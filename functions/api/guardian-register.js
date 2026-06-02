function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function getMaskedIp(request) {
  const raw = String(
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('x-forwarded-for') || ''
  ).split(',')[0].trim()
  if (!raw) return 'unknown'
  if (raw.includes('.')) {
    const parts = raw.split('.')
    return parts.length === 4 ? `${parts[0]}.${parts[1]}.${parts[2]}.x` : raw
  }
  if (raw.includes(':')) {
    const parts = raw.split(':').filter(Boolean)
    return `${parts.slice(0, 4).join(':')}::`
  }
  return raw
}

function getApproxLocation(request) {
  const cf = request.cf || {}
  return [cf.city, cf.region, cf.country].filter(Boolean).join(', ') || 'unknown'
}

function buildText(details) {
  return [
    'New Bloom Juniors guardian registration',
    '',
    `Guardian: ${details.guardianName}`,
    `Relationship: ${details.relationship}`,
    `Email: ${details.email}`,
    `Registered at: ${details.registeredAt}`,
    `Local time: ${details.localTimestamp}`,
    `Timezone: ${details.timezone}`,
    `Language: ${details.language}`,
    `Approx location: ${details.location}`,
    `Masked IP: ${details.maskedIp}`,
    `URL: ${details.pageUrl}`,
    `User agent: ${details.userAgent}`,
  ].join('\n')
}

function buildHtml(details) {
  const rows = [
    ['Guardian', details.guardianName],
    ['Relationship', details.relationship],
    ['Email', details.email],
    ['Registered at', details.registeredAt],
    ['Local time', details.localTimestamp],
    ['Timezone', details.timezone],
    ['Language', details.language],
    ['Approx location', details.location],
    ['Masked IP', details.maskedIp],
    ['URL', details.pageUrl],
  ]
  return `
    <div style="font-family:Arial,sans-serif;padding:20px;color:#0f172a">
      <h2 style="margin:0 0 12px">New Bloom Juniors guardian registration</h2>
      <p style="margin:0 0 16px">A parent or guardian completed the app registration gate.</p>
      <table style="border-collapse:collapse;width:100%;max-width:720px">
        <tbody>
          ${rows.map(([label, value]) => `
            <tr>
              <td style="padding:8px 12px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:700">${escapeHtml(label)}</td>
              <td style="padding:8px 12px;border:1px solid #e2e8f0">${escapeHtml(value)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p style="margin-top:16px;font-size:12px;color:#64748b">User agent: ${escapeHtml(details.userAgent)}</p>
    </div>
  `
}

export async function onRequest(context) {
  const { request, env } = context

  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  let body = {}
  try { body = await request.json() } catch {}

  const details = {
    guardianName: String(body.guardianName || 'Unknown'),
    relationship: String(body.relationship || 'unknown'),
    email: String(body.email || 'unknown'),
    registeredAt: String(body.registeredAt || 'unknown'),
    pageUrl: String(body.pageUrl || ''),
    language: String(body.language || 'unknown'),
    timezone: String(body.timezone || 'unknown'),
    localTimestamp: String(body.localTimestamp || 'unknown'),
    userAgent: String(body.userAgent || 'unknown'),
    location: getApproxLocation(request),
    maskedIp: getMaskedIp(request),
  }

  const apiKey = String(env.RESEND_API_KEY || '').trim()
  const from = String(env.USAGE_NOTIFY_FROM || '').trim()
  const to = String(env.USAGE_NOTIFY_TO || 'sanju.veed@gmail.com').trim()

  if (!apiKey || !from) {
    return json({ ok: false, skipped: true, reason: 'missing_email_config' }, 202)
  }

  const emailResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `New Bloom Juniors guardian registration: ${details.guardianName}`,
      text: buildText(details),
      html: buildHtml(details),
    }),
  })

  if (!emailResponse.ok) {
    const errorText = await emailResponse.text()
    return json({ error: 'Failed to send email', details: errorText }, 502)
  }

  const result = await emailResponse.json().catch(() => ({}))

  // Also send a welcome email to the new user
  if (details.email && details.email.includes('@')) {
    const welcomeHtml = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#8B00FF,#FF1D8E);padding:32px 28px;text-align:center">
          <h1 style="color:white;font-size:26px;margin:0 0 6px">Welcome to Bloom Juniors! 🌸</h1>
          <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0">You're all set — let the learning begin!</p>
        </div>
        <div style="padding:28px">
          <p style="font-size:15px;color:#374151;margin:0 0 16px">Hi ${escapeHtml(details.guardianName)},</p>
          <p style="font-size:15px;color:#374151;margin:0 0 16px">
            Thank you for joining Bloom Juniors! Your account is ready and your child can start learning right away.
          </p>
          <p style="font-size:14px;color:#6B7280;margin:0 0 24px">
            Bloom Juniors covers phonics, maths, reading, times tables, grammar and more — all designed to feel like play, not homework.
          </p>
          <div style="text-align:center;margin-bottom:24px">
            <a href="https://bloomjuniors.com?app=1"
              style="display:inline-block;background:linear-gradient(135deg,#8B00FF,#FF1D8E);color:white;text-decoration:none;padding:14px 32px;border-radius:50px;font-weight:700;font-size:15px">
              Open Bloom Juniors →
            </a>
          </div>
          <p style="font-size:12px;color:#9CA3AF;text-align:center;margin:0">
            Questions? Reply to this email anytime · hello@bloomjuniors.com
          </p>
        </div>
      </div>
    `
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [details.email],
        subject: `Welcome to Bloom Juniors, ${details.guardianName}! 🌸`,
        html: welcomeHtml,
      }),
    }).catch(() => {})
  }

  return json({ ok: true, id: result.id || null }, 202)
}
