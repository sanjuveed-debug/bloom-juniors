function escapeHtml(v) {
  return String(v || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

function cleanEnvValue(v) {
  return String(v || '').replace(/\\r/g,'').replace(/\\n/g,'').trim()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
  const email = String(body.email || '').trim()
  const module = String(body.module || 'general').trim()

  if (!email || !email.includes('@')) {
    res.status(400).json({ error: 'Valid email required' })
    return
  }

  console.log('waitlist signup', { email, module })

  const apiKey = cleanEnvValue(process.env.RESEND_API_KEY)
  const from = cleanEnvValue(process.env.USAGE_NOTIFY_FROM)
  const notifyTo = cleanEnvValue(process.env.USAGE_NOTIFY_TO || 'sanju.veed@gmail.com')

  // Send confirmation to the user
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

    // Notify owner
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [notifyTo],
        subject: `New Premium waitlist signup: ${email}`,
        text: `New waitlist signup\n\nEmail: ${email}\nModule interest: ${module}\nTime: ${new Date().toISOString()}`,
      }),
    }).catch(() => null)
  }

  res.status(200).json({ ok: true })
}
