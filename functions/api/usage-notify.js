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

function buildSubject({ profileName, isNewInstall }) {
  return `${isNewInstall ? 'New' : 'Active'} Bloom Juniors visitor: ${profileName}`
}

function buildText(details) {
  return [
    'Bloom Juniors usage notification',
    '',
    `Guardian: ${details.guardianName}`,
    `Relationship: ${details.guardianRelationship}`,
    `Guardian email: ${details.guardianEmail}`,
    `Profile: ${details.profileName}`,
    `Avatar: ${details.avatar}`,
    `Device: ${details.device}`,
    `Visitor ID: ${details.visitorId}`,
    `First seen: ${details.firstSeenAt}`,
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
    ['Relationship', details.guardianRelationship],
    ['Guardian email', details.guardianEmail],
    ['Profile', details.profileName],
    ['Avatar', details.avatar],
    ['Device', details.device],
    ['Visitor ID', details.visitorId],
    ['First seen', details.firstSeenAt],
    ['Local time', details.localTimestamp],
    ['Timezone', details.timezone],
    ['Language', details.language],
    ['Approx location', details.location],
    ['Masked IP', details.maskedIp],
    ['URL', details.pageUrl],
  ]
  return `
    <div style="font-family:Arial,sans-serif;padding:20px;color:#0f172a">
      <h2 style="margin:0 0 12px">Bloom Juniors usage notification</h2>
      <p style="margin:0 0 16px">
        ${details.isNewInstall ? 'A new browser installation opened the app.' : 'A returning installation opened the app today.'}
      </p>
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
    guardianRelationship: String(body.guardianRelationship || 'unknown'),
    guardianEmail: String(body.guardianEmail || 'unknown'),
    profileName: String(body.profileName || 'Unknown'),
    avatar: String(body.avatar || 'none'),
    device: String(body.device || 'unknown'),
    visitorId: String(body.visitorId || 'visitor-unknown'),
    firstSeenAt: String(body.firstSeenAt || 'unknown'),
    isNewInstall: Boolean(body.isNewInstall),
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
      subject: buildSubject(details),
      text: buildText(details),
      html: buildHtml(details),
    }),
  })

  if (!emailResponse.ok) {
    const errorText = await emailResponse.text()
    return json({ error: 'Failed to send email', details: errorText }, 502)
  }

  const result = await emailResponse.json().catch(() => ({}))
  return json({ ok: true, id: result.id || null }, 202)
}
