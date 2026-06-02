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
    relationship: details.relationship,
    email: details.email,
    registeredAt: details.registeredAt,
    location: details.location,
    maskedIp: details.maskedIp,
    pageUrl: details.pageUrl,
  }
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
    relationship: String(body.relationship || 'unknown'),
    email: String(body.email || 'unknown'),
    registeredAt: String(body.registeredAt || 'unknown'),
    pageUrl: String(body.pageUrl || ''),
    language: String(body.language || 'unknown'),
    timezone: String(body.timezone || 'unknown'),
    localTimestamp: String(body.localTimestamp || 'unknown'),
    userAgent: String(body.userAgent || 'unknown'),
    location: getApproxLocation(req),
    maskedIp: getMaskedIp(req),
  }

  console.log('guardian-register event', getLogDetails(details))

  const apiKey = cleanEnvValue(process.env.RESEND_API_KEY)
  const from = cleanEnvValue(process.env.USAGE_NOTIFY_FROM)
  const to = cleanEnvValue(process.env.USAGE_NOTIFY_TO || DEFAULT_NOTIFY_TO)

  if (!apiKey || !from) {
    console.warn('guardian-register email skipped: missing email config', getLogDetails(details))
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
      subject: `New Bloom Juniors guardian registration: ${details.guardianName}`,
      text: buildText(details),
      html: buildHtml(details),
    }),
  })

  if (!emailResponse.ok) {
    const errorText = await emailResponse.text()
    console.error('guardian-register email failed', {
      status: emailResponse.status,
      details: errorText,
      ...getLogDetails(details),
    })
    res.status(502).json({ error: 'Failed to send email', details: errorText })
    return
  }

  const emailResult = await emailResponse.json().catch(() => ({}))
  console.log('guardian-register email sent', {
    resendId: emailResult.id || 'unknown',
    to,
    ...getLogDetails(details),
  })

  res.status(202).json({ ok: true, id: emailResult.id || null })
}
