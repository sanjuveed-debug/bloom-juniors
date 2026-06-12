// Receives client-side crash reports and emails them to the founder.
// Reuses the Resend config already used by usage-notify.

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const ALLOWED_HOSTS = /^(https:\/\/(www\.)?bloomjuniors\.com|https:\/\/[a-z0-9-]+\.bloom-juniors\.pages\.dev|http:\/\/localhost:\d+)$/

export async function onRequestPost(context) {
  const { request, env } = context

  const origin = request.headers.get('Origin') || ''
  if (!ALLOWED_HOSTS.test(origin)) return new Response('Forbidden', { status: 403 })

  let body = {}
  try { body = await request.json() } catch { return json({ error: 'Bad payload' }, 400) }

  const kind = String(body.kind || 'error').slice(0, 40)
  const message = String(body.message || 'unknown').slice(0, 300)
  const stack = String(body.stack || '').slice(0, 1500)
  const url = String(body.url || '').slice(0, 300)
  const userAgent = String(body.userAgent || '').slice(0, 300)
  const at = String(body.at || new Date().toISOString()).slice(0, 40)

  const apiKey = String(env.RESEND_API_KEY || '').trim()
  const from = String(env.USAGE_NOTIFY_FROM || '').trim()
  const to = String(env.USAGE_NOTIFY_TO || 'sanju.veed@gmail.com').trim()
  if (!apiKey || !from) return json({ ok: false, skipped: true }, 202)

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `🐞 Bloom Juniors error: ${message.slice(0, 80)}`,
      text: [
        `Kind: ${kind}`,
        `Message: ${message}`,
        `URL: ${url}`,
        `Time: ${at}`,
        `UA: ${userAgent}`,
        '',
        'Stack:',
        stack || '(none)',
      ].join('\n'),
    }),
  }).catch(() => {})

  return json({ ok: true })
}
