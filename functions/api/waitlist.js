function escapeHtml(v) {
  return String(v || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function onRequest(context) {
  const { request, env } = context

  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  let body = {}
  try { body = await request.json() } catch {}

  const email = String(body.email || '').trim()
  const module = String(body.module || 'general').trim()

  if (!email || !email.includes('@')) return json({ error: 'Valid email required' }, 400)

  const apiKey = String(env.RESEND_API_KEY || '').trim()
  const from = String(env.USAGE_NOTIFY_FROM || '').trim()
  const notifyTo = String(env.USAGE_NOTIFY_TO || 'sanju.veed@gmail.com').trim()

  if (apiKey && from) {
    const confirmHtml = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0f172a">
        <div style="text-align:center;margin-bottom:24px">
          <div style="font-size:48px;margin-bottom:8px">⭐</div>
          <h1 style="font-size:26px;font-weight:900;color:#1a1550;margin:0">You're on the list!</h1>
        </div>
        <p style="font-size:15px;line-height:1.6;color:#334155">
          Hi there! Thanks for joining the Bloom Juniors Premium waitlist.
          We're putting the finishing touches on <strong>${escapeHtml(module)}</strong> and
          all the other Premium modules — and you'll be first to know when they launch.
        </p>
        <div style="background:linear-gradient(135deg,#8B00FF22,#FF1D8E22);border:1.5px solid #8B00FF33;border-radius:16px;padding:16px;margin:20px 0;text-align:center">
          <p style="font-size:13px;color:#6D28D9;font-weight:700;margin:0 0 4px">Early bird offer</p>
          <p style="font-size:18px;font-weight:900;color:#1a1550;margin:0">50% off first 3 months</p>
          <p style="font-size:12px;color:#64748b;margin:4px 0 0">For waitlist members only</p>
        </div>
        <p style="font-size:14px;color:#64748b;line-height:1.5">
          In the meantime, the free modules — Sound Pop, Number World, Story Room,
          Da Vinci Studio and Fun Exercise — are fully open for your child to enjoy.
        </p>
        <div style="text-align:center;margin-top:24px">
          <a href="https://bloomjuniors.com" style="display:inline-block;background:linear-gradient(135deg,#8B00FF,#FF1D8E);color:white;text-decoration:none;padding:12px 28px;border-radius:50px;font-weight:900;font-size:14px">
            Start learning free →
          </a>
        </div>
        <p style="font-size:11px;color:#94a3b8;text-align:center;margin-top:20px">
          Bloom Juniors · British curriculum for ages 3–9
        </p>
      </div>
    `

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "You're on the Bloom Juniors Premium waitlist! ⭐",
        html: confirmHtml,
      }),
    }).catch(() => null)

    const now = new Date()
    const readableTime = now.toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/London' })
    const sourceLabel = module === 'landing-premium' ? 'Premium waitlist (landing page)' : module === 'hero' ? 'Hero section (landing page)' : module

    const notifyHtml = `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0f172a">
        <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:12px;padding:16px 20px;margin-bottom:20px">
          <p style="margin:0;font-size:18px;font-weight:900;color:#166534">🎉 New waitlist signup!</p>
          <p style="margin:4px 0 0;font-size:13px;color:#15803d">Someone just joined the Bloom Juniors Premium waitlist.</p>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr style="border-bottom:1px solid #e2e8f0">
            <td style="padding:10px 0;color:#64748b;width:40%">Email</td>
            <td style="padding:10px 0;font-weight:700;color:#1a1550">${escapeHtml(email)}</td>
          </tr>
          <tr style="border-bottom:1px solid #e2e8f0">
            <td style="padding:10px 0;color:#64748b">Came from</td>
            <td style="padding:10px 0;font-weight:600">${escapeHtml(sourceLabel)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#64748b">Time</td>
            <td style="padding:10px 0">${readableTime}</td>
          </tr>
        </table>
        <div style="margin-top:20px;padding:12px 16px;background:#f8fafc;border-radius:8px;font-size:12px;color:#64748b">
          A confirmation email with the 50% early bird offer has been sent to the parent automatically.
        </div>
      </div>
    `

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [notifyTo],
        subject: `🎉 New waitlist signup: ${email}`,
        html: notifyHtml,
      }),
    }).catch(() => null)
  }

  return json({ ok: true })
}
