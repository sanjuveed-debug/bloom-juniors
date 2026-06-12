// Sends a warm welcome email right after guardian signup.
// Uses the same Resend config as usage-notify / weekly digests.

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

  const email = String(body.email || '').trim()
  const name = String(body.name || '').trim().slice(0, 60) || 'there'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Valid email required' }, 400)

  const apiKey = String(env.RESEND_API_KEY || '').trim()
  const from = String(env.USAGE_NOTIFY_FROM || '').trim()
  if (!apiKey || !from) return json({ ok: false, skipped: true }, 202)

  const text = [
    `Hi ${name},`,
    '',
    `Welcome to Bloom Juniors! Here's how to get the most out of the first week:`,
    '',
    `1. THE DAILY PATH — every day your child gets 2 short learning activities picked for them. Yaagvi (our mascot) guides them through it, so they don't need you hovering.`,
    '',
    `2. GAMES COME AFTER — once the path is done, the Game Arcade unlocks as the reward. Study first, play after. The habit builds itself.`,
    '',
    `3. ADD IT TO THE HOME SCREEN — open bloomjuniors.com on your child's tablet or phone and use "Add to Home Screen". One tap and they can start anytime.`,
    '',
    `4. CHECK THE PARENT ZONE — tap the Parent Zone card (your PIN protects it) to see exactly what your child practised, their accuracy, and their streak.`,
    '',
    `One small ask: we're in beta and building this with real families. If anything confuses you or your child, just reply to this email — I read every reply personally.`,
    '',
    `— Sanju`,
    `Founder, Bloom Juniors (and dad of one)`,
    `https://bloomjuniors.com`,
  ].join('\n')

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [email],
      subject: `Welcome to Bloom Juniors — here's how the first week works`,
      text,
    }),
  }).catch(() => {})

  return json({ ok: true })
}
