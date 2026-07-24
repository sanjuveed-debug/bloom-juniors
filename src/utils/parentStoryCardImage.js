function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}
function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 4) {
  const words = String(text).split(/\s+/)
  const lines = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width <= maxWidth || !line) line = next
    else { lines.push(line); line = word }
  }
  if (line) lines.push(line)
  const visible = lines.slice(0, maxLines)
  if (lines.length > maxLines) visible[maxLines - 1] = `${visible[maxLines - 1].replace(/[.…]+$/, '')}…`
  visible.forEach((value, index) => ctx.fillText(value, x, y + index * lineHeight))
  return y + visible.length * lineHeight
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

function canvasBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not create image')), 'image/png', 0.96)
  })
}

export async function generateParentStoryCard(story, profileName = 'My explorer') {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1350
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createLinearGradient(0, 0, 1080, 1350)
  gradient.addColorStop(0, '#2E1065')
  gradient.addColorStop(0.52, '#6D28D9')
  gradient.addColorStop(1, '#F9738A')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 1080, 1350)

  ctx.globalAlpha = 0.15
  ctx.fillStyle = '#FFFFFF'
  for (const [x, y, r] of [[80,120,180],[1000,280,240],[150,1240,260],[900,1120,190]]) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
  }
  ctx.globalAlpha = 1

  ctx.fillStyle = '#FDE68A'
  ctx.font = '800 34px Arial, sans-serif'
  ctx.fillText('BLOOM JUNIORS · WEEKLY LEARNING STORY', 72, 92)
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '900 72px Arial, sans-serif'
  wrapText(ctx, story.headline, 72, 185, 665, 82, 3)

  try {
    const image = await loadImage(story.companion?.companion?.image || '/yaagvi-3d-wave.png')
    const maxWidth = 300
    const maxHeight = 420
    const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight)
    const width = image.naturalWidth * scale
    const height = image.naturalHeight * scale
    ctx.save()
    ctx.shadowColor = 'rgba(17, 24, 39, 0.35)'
    ctx.shadowBlur = 28
    ctx.drawImage(image, 760 + (280 - width) / 2, 110, width, height)
    ctx.restore()
  } catch {
    ctx.font = '160px Arial'
    ctx.fillText('✨', 805, 330)
  }

  roundedRect(ctx, 62, 450, 956, 220, 42)
  ctx.fillStyle = 'rgba(255,255,255,0.94)'
  ctx.fill()
  ctx.fillStyle = '#4C1D95'
  ctx.font = '900 38px Arial, sans-serif'
  ctx.fillText(`${profileName}'s week`, 102, 515)
  const stats = [
    [String(story.current.sessions), 'ADVENTURES'],
    [String(story.current.stars), 'STARS'],
    [String(story.current.activeDays), 'ACTIVE DAYS'],
    [story.current.accuracy == null ? '—' : `${story.current.accuracy}%`, 'ACCURACY'],
  ]
  stats.forEach(([value, label], index) => {
    const x = 102 + index * 226
    ctx.fillStyle = index === 1 ? '#EA580C' : '#6D28D9'
    ctx.font = '900 54px Arial, sans-serif'
    ctx.fillText(value, x, 594)
    ctx.fillStyle = '#6B7280'
    ctx.font = '800 20px Arial, sans-serif'
    ctx.fillText(label, x, 630)
  })

  roundedRect(ctx, 62, 700, 956, 315, 42)
  ctx.fillStyle = 'rgba(255,255,255,0.94)'
  ctx.fill()
  ctx.fillStyle = '#EA580C'
  ctx.font = '900 27px Arial, sans-serif'
  ctx.fillText('THE STORY BEHIND THE STARS', 102, 760)
  ctx.fillStyle = '#2E1065'
  ctx.font = '700 36px Arial, sans-serif'
  wrapText(ctx, story.narrative, 102, 820, 875, 52, 4)
  ctx.fillStyle = '#7C3AED'
  ctx.font = '800 26px Arial, sans-serif'
  const strength = story.skills.strongest?.label || 'A new learning adventure'
  ctx.fillText(`Growing strength: ${strength}`, 102, 966)

  roundedRect(ctx, 62, 1045, 956, 170, 42)
  ctx.fillStyle = 'rgba(46,16,101,0.75)'
  ctx.fill()
  ctx.fillStyle = '#FDE68A'
  ctx.font = '900 28px Arial, sans-serif'
  ctx.fillText(`${story.companion.companion.name} · ${story.companion.stage.name}`, 102, 1102)
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '700 27px Arial, sans-serif'
  ctx.fillText(`${story.dream.project.name}: ${story.dream.progressPercent}% built`, 102, 1150)
  ctx.fillText(`${story.treasures.owned} treasures · ${story.world.discoveries} Secret World discoveries`, 102, 1190)

  ctx.fillStyle = '#FFFFFF'
  ctx.font = '800 24px Arial, sans-serif'
  ctx.fillText(`${story.period}  ·  bloomjuniors.com`, 72, 1290)
  return canvasBlob(canvas)
}

export async function shareParentStoryCard(story, profileName) {
  const blob = await generateParentStoryCard(story, profileName)
  const safeName = String(profileName || 'explorer').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const fileName = `${safeName || 'explorer'}-bloom-learning-story.png`
  const file = typeof File === 'function' ? new File([blob], fileName, { type: 'image/png' }) : null
  if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: `${profileName}'s Bloom Juniors learning story`,
      text: story.celebration,
      files: [file],
    })
    return 'shared'
  }
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  return 'downloaded'
}
