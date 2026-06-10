function escapeHtml(v) {
  return String(v || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function buildDigestHtml({ parentName, childName, period, stats, modules, topModule, streakDays }) {
  const moduleRows = modules.map(m => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9">
        <span style="font-size:18px">${escapeHtml(m.emoji)}</span>
        <strong style="margin-left:8px;color:#1e293b">${escapeHtml(m.label)}</strong>
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;text-align:center;color:#64748b">${m.sessions}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;text-align:center">
        <span style="color:${m.accuracy >= 80 ? '#22c55e' : m.accuracy >= 60 ? '#f59e0b' : '#ef4444'};font-weight:700">${m.accuracy}%</span>
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;text-align:center;color:#64748b">${m.stars}⭐</td>
    </tr>
  `).join('')

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
      <div style="background:linear-gradient(135deg,#8B00FF,#FF1D8E);padding:32px 28px;text-align:center">
        <p style="color:rgba(255,255,255,0.7);font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:2px">Weekly Progress Report</p>
        <h1 style="color:white;font-size:28px;margin:0 0 4px">${escapeHtml(childName)}'s week</h1>
        <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:0">${escapeHtml(period)}</p>
      </div>
      <div style="display:flex;gap:0;border-bottom:1px solid #f1f5f9">
        ${[
          { label: 'Stars earned', value: stats.stars + ' ⭐' },
          { label: 'Minutes learning', value: stats.minutes + 'm' },
          { label: 'Sessions', value: stats.sessions },
          { label: 'Day streak', value: streakDays + ' 🔥' },
        ].map(p => `
          <div style="flex:1;text-align:center;padding:16px 8px;border-right:1px solid #f1f5f9">
            <p style="font-size:22px;font-weight:900;color:#1e293b;margin:0">${p.value}</p>
            <p style="font-size:11px;color:#94a3b8;margin:4px 0 0">${p.label}</p>
          </div>
        `).join('')}
      </div>
      ${topModule ? `
      <div style="margin:20px;background:linear-gradient(135deg,${topModule.color}18,white);border:1.5px solid ${topModule.color}35;border-radius:16px;padding:16px">
        <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#64748b;margin:0 0 6px">This week's star module</p>
        <p style="font-size:20px;margin:0;font-weight:900;color:#1e293b">${topModule.emoji} ${escapeHtml(topModule.label)}</p>
        <p style="font-size:13px;color:#64748b;margin:4px 0 0">${topModule.sessions} sessions · ${topModule.accuracy}% accuracy · ${topModule.stars} stars</p>
      </div>
      ` : ''}
      <div style="padding:0 20px 20px">
        <p style="font-weight:700;color:#1e293b;margin:0 0 12px">Module breakdown</p>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:#f8fafc">
              <th style="padding:8px 12px;text-align:left;color:#64748b;font-weight:600">Module</th>
              <th style="padding:8px 12px;text-align:center;color:#64748b;font-weight:600">Sessions</th>
              <th style="padding:8px 12px;text-align:center;color:#64748b;font-weight:600">Accuracy</th>
              <th style="padding:8px 12px;text-align:center;color:#64748b;font-weight:600">Stars</th>
            </tr>
          </thead>
          <tbody>${moduleRows}</tbody>
        </table>
      </div>
      <div style="background:#f8fafc;padding:24px;text-align:center">
        <a href="https://bloomjuniors.com?app=1"
          style="display:inline-block;background:linear-gradient(135deg,#8B00FF,#FF1D8E);color:white;text-decoration:none;padding:12px 28px;border-radius:50px;font-weight:900;font-size:14px">
          View full progress →
        </a>
        <p style="font-size:11px;color:#94a3b8;margin:16px 0 0">
          Bloom Juniors · You're receiving this because you requested a progress report.
        </p>
      </div>
    </div>
  `
}

function buildNudgeHtml({ childName }) {
  const name = escapeHtml(childName || 'your child')
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
      <div style="background:linear-gradient(135deg,#8B00FF,#FF1D8E);padding:36px 28px;text-align:center">
        <div style="font-size:64px;margin-bottom:12px">🌱</div>
        <h1 style="color:white;font-size:26px;margin:0 0 8px">Yaagvi misses ${name}!</h1>
        <p style="color:rgba(255,255,255,0.75);font-size:14px;margin:0">${name} hasn't had a learning session this week.</p>
      </div>

      <div style="padding:32px 28px;text-align:center">
        <p style="font-size:16px;color:#334155;line-height:1.6;margin:0 0 24px">
          Even <strong>5 minutes</strong> of learning keeps the streak alive and the Bloom Garden growing.
          Yaagvi is ready with a short activity whenever ${name} is.
        </p>

        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:28px">
          ${[
            { emoji: '🎤', label: 'Sound Pop', desc: '5 min phonics' },
            { emoji: '🔢', label: 'Number World', desc: '5 min maths' },
            { emoji: '🎨', label: 'Da Vinci Studio', desc: 'Creative play' },
          ].map(m => `
            <div style="background:#f8fafc;border-radius:16px;padding:14px 18px;text-align:center;min-width:100px">
              <div style="font-size:28px">${m.emoji}</div>
              <div style="font-weight:700;color:#1e293b;font-size:13px;margin-top:4px">${m.label}</div>
              <div style="color:#94a3b8;font-size:11px">${m.desc}</div>
            </div>
          `).join('')}
        </div>

        <a href="https://bloomjuniors.com?app=1"
          style="display:inline-block;background:linear-gradient(135deg,#8B00FF,#FF1D8E);color:white;text-decoration:none;padding:14px 36px;border-radius:50px;font-weight:900;font-size:16px;box-shadow:0 8px 24px rgba(139,0,255,0.3)">
          Start today's learning →
        </a>

        <p style="font-size:12px;color:#94a3b8;margin:24px 0 0">
          Bloom Juniors · Sent because ${name} hasn't learned this week.
        </p>
      </div>
    </div>
  `
}

export async function onRequest(context) {
  const { request, env } = context

  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  let body = {}
  try { body = await request.json() } catch {}

  const { parentEmail, parentName, childName, period, stats, modules, topModule, streakDays, type } = body

  if (!parentEmail || !parentEmail.includes('@')) return json({ error: 'Valid parent email required' }, 400)

  const apiKey = String(env.RESEND_API_KEY || '').trim()
  const from = String(env.USAGE_NOTIFY_FROM || '').trim()

  if (!apiKey || !from) {
    return json({ ok: false, skipped: true, reason: 'missing_email_config' }, 202)
  }

  const isNudge = type === 'nudge'
  const html = isNudge
    ? buildNudgeHtml({ childName })
    : buildDigestHtml({ parentName, childName, period, stats, modules: modules || [], topModule, streakDays: streakDays || 0 })

  const subject = isNudge
    ? `Yaagvi misses ${escapeHtml(childName || 'your child')}! 🌱`
    : `${escapeHtml(childName)}'s weekly learning report ⭐`

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [parentEmail], subject, html }),
  })

  if (!emailRes.ok) {
    const err = await emailRes.text()
    return json({ error: 'Failed to send', details: err }, 502)
  }

  return json({ ok: true })
}
