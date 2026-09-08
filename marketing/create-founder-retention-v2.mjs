import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = join(root, 'marketing', 'founder-retention-v2')
const sourceDir = join(root, 'marketing', 'cross-platform-shorts')
const workDir = join(outputDir, 'work')

mkdirSync(workDir, { recursive: true })

const output = join(outputDir, 'my-daughter-stopped-coming-back-v2.mp4')
const preview = join(outputDir, 'my-daughter-stopped-coming-back-v2-windows-preview.wmv')
const cover = join(outputDir, 'my-daughter-stopped-coming-back-v2-cover-4x5.png')
const voice = join(workDir, 'voice.mp3')

const voiceText = 'I built a learning app for my daughter. Then she stopped opening it. I added more games. That was the wrong question. Children do not need more. They need a reason to return. What brings your child back?'

const scenes = [
  {
    kind: 'still',
    source: join(sourceDir, 'founder-premium-vertical-v2.png'),
    duration: 2.55,
    eyebrow: "A FOUNDER'S HONEST ADMISSION",
    lines: ['I BUILT A', 'LEARNING APP.'],
    accentLine: 1,
  },
  {
    kind: 'still',
    source: join(sourceDir, 'child-disengaged-v2.png'),
    duration: 2.55,
    eyebrow: 'THEN THIS HAPPENED',
    lines: ['MY DAUGHTER', 'STOPPED OPENING IT.'],
    accentLine: 1,
  },
  {
    kind: 'video',
    source: join(root, 'marketing', 'videos', 'post3-soundpop-hook.mp4'),
    offset: 0,
    duration: 1.35,
    eyebrow: 'MY FIRST RESPONSE',
    lines: ['ADD MORE.'],
  },
  {
    kind: 'video',
    source: join(root, 'marketing', 'videos', 'post9-numberworld-hook.mp4'),
    offset: 0.25,
    duration: 1.35,
    eyebrow: 'MORE FEATURES',
    lines: ['MORE GAMES.'],
  },
  {
    kind: 'video',
    source: join(root, 'marketing', 'videos', 'post6-treasure.mp4'),
    offset: 0.75,
    duration: 1.8,
    eyebrow: 'I LEARNT THIS THE HARD WAY',
    lines: ['WRONG QUESTION.'],
    accentLine: 0,
  },
  {
    kind: 'still',
    source: join(sourceDir, 'child-curious-v2.png'),
    duration: 3.05,
    eyebrow: 'THE REAL CHANGE',
    lines: ['A REASON', 'TO COME BACK.'],
    accentLine: 1,
  },
  {
    kind: 'still',
    source: join(sourceDir, 'child-curious-v2.png'),
    duration: 3.25,
    eyebrow: 'A QUESTION FOR PARENTS',
    lines: ['WHAT MAKES YOUR CHILD', 'RETURN?'],
    accentLine: 1,
    brand: true,
  },
]

const escapeXml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')

function textOverlay({ eyebrow, lines, accentLine = -1, brand = false, compact = false }) {
  const startY = compact ? 255 : 1400
  const lineHeight = compact ? 88 : 106
  const fontSizeFor = line => {
    if (line.length >= 20) return compact ? 57 : 62
    if (line.length >= 17) return compact ? 64 : 68
    if (line.length >= 14) return compact ? 70 : 76
    return compact ? 80 : 88
  }
  const text = lines.map((line, index) => `
    <text x="64" y="${startY + index * lineHeight}"
      font-family="Arial, sans-serif" font-size="${fontSizeFor(line)}" font-weight="900"
      fill="${index === accentLine ? '#F6AD55' : '#FFFFFF'}"
      stroke="#071522" stroke-width="2" paint-order="stroke">${escapeXml(line)}</text>
  `).join('')

  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920">
      <defs>
        <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#061522" stop-opacity="${compact ? '.64' : '.08'}"/>
          <stop offset=".56" stop-color="#061522" stop-opacity=".04"/>
          <stop offset="1" stop-color="#061522" stop-opacity=".92"/>
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#shade)"/>
      <rect x="64" y="${compact ? 92 : 1220}" width="88" height="7" fill="#F6AD55"/>
      <text x="64" y="${compact ? 158 : 1290}"
        font-family="Arial, sans-serif" font-size="27" font-weight="800"
        fill="#FFFFFF">${escapeXml(eyebrow)}</text>
      ${text}
      ${brand ? `
        <g transform="translate(68 1690)">
          <ellipse cx="28" cy="4" rx="12" ry="22" fill="#FB923C"/>
          <ellipse cx="28" cy="4" rx="12" ry="22" fill="#FB7185" transform="rotate(72 28 4)"/>
          <ellipse cx="28" cy="4" rx="12" ry="22" fill="#F97316" transform="rotate(144 28 4)"/>
          <ellipse cx="28" cy="4" rx="12" ry="22" fill="#FB7185" transform="rotate(216 28 4)"/>
          <ellipse cx="28" cy="4" rx="12" ry="22" fill="#FB923C" transform="rotate(288 28 4)"/>
          <circle cx="28" cy="4" r="14" fill="#0F766E"/>
          <circle cx="28" cy="4" r="8" fill="#FCD34D"/>
          <text x="70" y="0" font-family="Arial, sans-serif" font-size="32"
            font-weight="900" fill="#FFFFFF">Bloom Juniors</text>
          <text x="70" y="40" font-family="Arial, sans-serif" font-size="23"
            font-weight="700" fill="#F6AD55">bloomjuniors.com</text>
        </g>
      ` : ''}
    </svg>
  `)
}

async function createVoice() {
  const response = await fetch('https://bloomjuniors.com/api/tts?v=5', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://bloomjuniors.com' },
    body: JSON.stringify({
      text: voiceText,
      voice: 'en-GB-RyanNeural',
      rate: -2,
      ssmlInner: 'I built a learning app for my daughter.<break time="240ms"/> Then she stopped opening it.<break time="260ms"/> I added more games.<break time="230ms"/> That was the wrong question.<break time="260ms"/> Children do not need more. They need a reason to return.<break time="280ms"/> What brings your child back?',
    }),
  })
  if (!response.ok) throw new Error(`Voice generation failed: ${response.status}`)
  writeFileSync(voice, Buffer.from(await response.arrayBuffer()))
}

async function renderStill(scene, index) {
  const frame = join(workDir, `frame-${index}.jpg`)
  const segment = join(workDir, `segment-${index}.mp4`)
  await sharp(scene.source)
    .resize(1080, 1920, { fit: 'cover', position: 'centre' })
    .composite([{ input: textOverlay(scene), top: 0, left: 0 }])
    .jpeg({ quality: 95, chromaSubsampling: '4:4:4' })
    .toFile(frame)

  const frames = Math.ceil(scene.duration * 30)
  execFileSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-loop', '1', '-i', frame,
    '-vf', `zoompan=z='min(zoom+0.00045,1.045)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1080x1920:fps=30,format=yuv420p`,
    '-t', String(scene.duration),
    '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '15',
    '-profile:v', 'high', '-level', '4.1', '-r', '30',
    segment,
  ], { stdio: 'inherit' })
  return segment
}

async function renderVideo(scene, index) {
  const overlay = join(workDir, `overlay-${index}.png`)
  const segment = join(workDir, `segment-${index}.mp4`)
  await sharp(textOverlay({ ...scene, compact: true })).png().toFile(overlay)

  execFileSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-ss', String(scene.offset || 0), '-t', String(scene.duration), '-i', scene.source,
    '-loop', '1', '-i', overlay,
    '-filter_complex', '[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,eq=contrast=1.04:saturation=1.08[base];[base][1:v]overlay=0:0,format=yuv420p[v]',
    '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '15',
    '-profile:v', 'high', '-level', '4.1', '-r', '30',
    '-t', String(scene.duration), '-shortest',
    segment,
  ], { stdio: 'inherit' })
  return segment
}

await createVoice()

const segments = []
for (const [index, scene] of scenes.entries()) {
  segments.push(scene.kind === 'still'
    ? await renderStill(scene, index)
    : await renderVideo(scene, index))
}

const concatList = join(workDir, 'segments.txt')
writeFileSync(concatList, segments.map(path => `file '${path.replaceAll('\\', '/')}'`).join('\n'))

const silent = join(workDir, 'silent.mp4')
execFileSync('ffmpeg', [
  '-hide_banner', '-loglevel', 'error', '-y',
  '-f', 'concat', '-safe', '0', '-i', concatList,
  '-c', 'copy', silent,
], { stdio: 'inherit' })

execFileSync('ffmpeg', [
  '-hide_banner', '-loglevel', 'error', '-y',
  '-i', silent, '-i', voice,
  '-filter_complex', '[1:a]loudnorm=I=-16:TP=-1.5:LRA=7,apad=pad_dur=1[a]',
  '-map', '0:v', '-map', '[a]',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p',
  '-profile:v', 'high', '-level', '4.1', '-r', '30',
  '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
  '-movflags', '+faststart', '-shortest', output,
], { stdio: 'inherit' })

execFileSync('ffmpeg', [
  '-hide_banner', '-loglevel', 'error', '-y',
  '-i', output,
  '-c:v', 'wmv2', '-q:v', '2', '-r', '30',
  '-c:a', 'wmav2', '-b:a', '192k', '-ac', '2', '-ar', '44100',
  preview,
], { stdio: 'inherit' })

await sharp(join(workDir, 'frame-0.jpg'))
  .resize(1080, 1350, { fit: 'cover', position: 'centre' })
  .jpeg({ quality: 95 })
  .toFile(cover)

try {
  rmSync(workDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 250 })
} catch {
  console.warn(`Rendered successfully; temporary review files remain in ${workDir}`)
}

console.log(`Created ${output}`)
console.log(`Created ${preview}`)
console.log(`Created ${cover}`)
