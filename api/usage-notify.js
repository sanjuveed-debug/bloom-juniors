const DEFAULT_NOTIFY_TO = 'sanju.veed@gmail.com'

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function readBody(req) {
  if (!req.body) return {}
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      return {}
    }
  }
  return req.body
}

function cleanEnvValue(value) {
  return String(value || '')
    .replace(/\\r/g, '')
    .replace(/\\n/g, '')
    .trim()
}

function getHost(req) {
  return req.headers['x-forwarded-host'] || req.headers.host || ''
}

function getOriginHost(req) {
  const origin = req.headers.origin || req.headers.referer
  if (!origin) return ''

  try {
    return new URL(origin).host
  } catch {
    return ''
  }
}

function getMaskedIp(req) {
  const raw = String(req.headers['x-forwarded-for'] || '')
    .split(',')[0]
    .trim()

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

function getApproxLocation(req) {
  const city = req.headers['x-vercel-ip-city']
  const region = req.headers['x-vercel-ip-country-region']
  const country = req.headers['x-vercel-ip-country']

  return [city, region, country].filter(Boolean).join(', ') || 'unknown'
}

function getLogDetails(details) {
  return {
    guardianName: details.guardianName,
    guardianEmail: details.guardianEmail,
    profileName: details.profileName,
    visitorId: details.visitorId,
    isNewInstall: details.isNewInstall,
    location: details.location,
    maskedIp: details.maskedIp,
    pageUrl: details.pageUrl,
  }
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
      <p style="margin-top:16px;font-size:12px;color:#64748b">
        User agent: ${escapeHtml(details.userAgent)}
      </p>
    </div>
  `
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const host = getHost(req)
  const originHost = getOriginHost(req)
  if (originHost && host && originHost !== host) {
    res.status(403).json({ error: 'Cross-origin requests are not allowed' })
    return
  }

  const body = readBody(req)
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
    location: getApproxLocation(req),
    maskedIp: getMaskedIp(req),
  }

  console.log('usage-notify event', getLogDetails(details))

  const apiKey = cleanEnvValue(process.env.RESEND_API_KEY)
  const from = cleanEnvValue(process.env.USAGE_NOTIFY_FROM)
  const to = cleanEnvValue(process.env.USAGE_NOTIFY_TO || DEFAULT_NOTIFY_TO)

  if (!apiKey || !from) {
    console.warn('usage-notify email skipped: missing email config', getLogDetails(details))
    res.status(202).json({ ok: false, skipped: true, reason: 'missing_email_config' })
    return
  }

  const emailResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
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
    console.error('usage-notify email failed', {
      status: emailResponse.status,
      details: errorText,
      ...getLogDetails(details),
    })
    res.status(502).json({ error: 'Failed to send email', details: errorText })
    return
  }

  const emailResult = await emailResponse.json().catch(() => ({}))
  console.log('usage-notify email sent', {
    resendId: emailResult.id || 'unknown',
    to,
    ...getLogDetails(details),
  })

  res.status(202).json({ ok: true, id: emailResult.id || null })
}
