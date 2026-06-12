// Renders the Daily Success Card as a PNG (canvas) and shares it via the
// Web Share API — one tap from WhatsApp on mobile. Falls back to download.

function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(' ')
  const lines = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

export async function generateSuccessCardBlob({ emoji, headline, whatTheyDid, streakNote, starsToday }) {
  const W = 1080
  const H = 1350
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#1A1060')
  bg.addColorStop(0.5, '#2D1B69')
  bg.addColorStop(1, '#0B1426')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Glow
  const glow = ctx.createRadialGradient(W / 2, 200, 50, W / 2, 200, 600)
  glow.addColorStop(0, 'rgba(139,92,246,0.45)')
  glow.addColorStop(1, 'rgba(139,92,246,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, 700)

  ctx.textAlign = 'center'

  // Brand
  ctx.font = 'bold 44px system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.fillText('🌟 Bloom Juniors', W / 2, 110)

  // Big emoji
  ctx.font = '220px system-ui, sans-serif'
  ctx.fillText(emoji || '🏅', W / 2, 420)

  // Headline
  ctx.font = 'bold 76px system-ui, sans-serif'
  ctx.fillStyle = '#FFFFFF'
  let y = 560
  for (const line of wrapText(ctx, headline || 'A brilliant learning day!', W - 160)) {
    ctx.fillText(line, W / 2, y)
    y += 92
  }

  // The specific win
  ctx.font = '52px system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  y += 30
  for (const line of wrapText(ctx, whatTheyDid || '', W - 200)) {
    ctx.fillText(line, W / 2, y)
    y += 70
  }

  // Streak
  if (streakNote) {
    ctx.font = 'bold 48px system-ui, sans-serif'
    ctx.fillStyle = '#FBBF24'
    y += 24
    ctx.fillText(streakNote, W / 2, y)
    y += 60
  }

  // Stars
  if (starsToday > 0) {
    ctx.font = '64px system-ui, sans-serif'
    y += 40
    ctx.fillText('⭐'.repeat(Math.min(starsToday, 8)), W / 2, y)
  }

  // Footer
  ctx.font = 'bold 40px system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.fillText('Free & ad-free · bloomjuniors.com', W / 2, H - 90)

  return new Promise(resolve => c.toBlob(resolve, 'image/png'))
}

export async function shareSuccessCard(data) {
  const blob = await generateSuccessCardBlob(data)
  if (!blob) return false
  const file = new File([blob], 'bloom-juniors-win.png', { type: 'image/png' })

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'Bloom Juniors',
        text: `${data.whatTheyDid} 🌟 — bloomjuniors.com`,
      })
      return true
    } catch (e) {
      if (e.name === 'AbortError') return true // user cancelled the sheet — not a failure
    }
  }

  // Fallback: download
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'bloom-juniors-win.png'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
  return true
}
