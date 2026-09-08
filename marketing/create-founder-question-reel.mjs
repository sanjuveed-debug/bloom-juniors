import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'marketing', 'viral-reel')
const founderPath = join(root, 'public', 'founder.jpg')
const sunsetPath = join(root, 'marketing', 'videos', 'post15-sunset.mp4')
const wonderPath = join(root, 'marketing', 'videos', 'post14-wonderwhy.mp4')
const voicePath = join(outDir, 'founder-question-voice.mp3')
const outputPath = join(outDir, 'bloom-founder-question-reel.mp4')

mkdirSync(outDir, { recursive: true })

const esc = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')

function flower(cx, cy, scale = 1) {
  const petals = Array.from({ length: 8 }, (_, index) =>
    `<ellipse cx="0" cy="${-42 * scale}" rx="${15 * scale}" ry="${30 * scale}"
      fill="${index % 2 ? '#F6AD55' : '#F56565'}" transform="rotate(${index * 45})"/>`
  ).join('')
  return `<g transform="translate(${cx} ${cy})">${petals}
    <circle r="${17 * scale}" fill="#FBD38D"/>
    <circle r="${8 * scale}" fill="#2F855A"/>
  </g>`
}

function textLines(lines, {
  x = 90,
  y = 300,
  size = 82,
  lineHeight = 94,
  fill = '#FFFFFF',
  weight = 800,
  anchor = 'start',
} = {}) {
  return lines.map((line, index) =>
    `<text x="${x}" y="${y + index * lineHeight}" text-anchor="${anchor}"
      font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}"
      fill="${fill}">${esc(line)}</text>`
  ).join('')
}

function baseSvg(content, background = '#102A43') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
    <rect width="1080" height="1920" fill="${background}"/>
    ${content}
  </svg>`
}

async function renderIntro() {
  const portrait = readFileSync(founderPath).toString('base64')
  const svg = baseSvg(`
    <circle cx="1020" cy="120" r="330" fill="#F6AD55" opacity=".16"/>
    <circle cx="60" cy="1800" r="310" fill="#38A169" opacity=".16"/>
    ${flower(112, 126, .75)}
    <text x="180" y="142" font-family="Arial, sans-serif" font-size="29"
      font-weight="800" letter-spacing="5" fill="#68D391">BLOOM JUNIORS</text>
    <text x="90" y="325" font-family="Arial, sans-serif" font-size="39"
      font-weight="800" letter-spacing="4" fill="#F6AD55">A QUESTION I KEPT</text>
    ${textLines(['WHY DOES', 'THE SUN LOOK', 'RED?'], { y: 470, size: 108, lineHeight: 122 })}
    <circle cx="270" cy="1425" r="196" fill="#FFFFFF" opacity=".12"/>
    <clipPath id="portrait"><circle cx="270" cy="1425" r="166"/></clipPath>
    <image href="data:image/jpeg;base64,${portrait}" x="104" y="1259" width="332" height="332"
      preserveAspectRatio="xMidYMid slice" clip-path="url(#portrait)"/>
    <text x="490" y="1388" font-family="Arial, sans-serif" font-size="47"
      font-weight="800" fill="#FFFFFF">I asked this</text>
    <text x="490" y="1450" font-family="Arial, sans-serif" font-size="47"
      font-weight="800" fill="#FFFFFF">as a child.</text>
    <text x="490" y="1514" font-family="Arial, sans-serif" font-size="32"
      font-weight="700" fill="#A7C7E7">Sanju, founder and dad</text>
    <rect x="90" y="1720" width="900" height="3" fill="#FFFFFF" opacity=".18"/>
    <text x="90" y="1790" font-family="Arial, sans-serif" font-size="28"
      font-weight="700" fill="#A7C7E7">@bloom_juniors</text>
  `)
  const source = Buffer.from(svg)
  await sharp(source).png().toFile(join(outDir, 'intro.png'))
  await sharp(source)
    .extract({ left: 0, top: 285, width: 1080, height: 1350 })
    .png()
    .toFile(join(outDir, 'cover-4x5.png'))
}

async function renderOverlay(name, eyebrow, lines, accent = '#F6AD55') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
    <rect x="48" y="82" width="984" height="285" rx="22" fill="#102A43" fill-opacity=".94"/>
    <rect x="80" y="113" width="8" height="220" rx="4" fill="${accent}"/>
    <text x="120" y="155" font-family="Arial, sans-serif" font-size="27"
      font-weight="800" letter-spacing="4" fill="${accent}">${esc(eyebrow)}</text>
    ${textLines(lines, { x: 120, y: 235, size: 58, lineHeight: 67 })}
    <rect x="48" y="1770" width="984" height="92" rx="20" fill="#FFFFFF" fill-opacity=".94"/>
    <text x="540" y="1828" text-anchor="middle" font-family="Arial, sans-serif"
      font-size="30" font-weight="800" fill="#102A43">bloomjuniors.com · free in your browser</text>
  </svg>`
  await sharp(Buffer.from(svg)).png().toFile(join(outDir, name))
}

async function renderOutro() {
  const svg = baseSvg(`
    <circle cx="980" cy="160" r="330" fill="#F6AD55" opacity=".18"/>
    <circle cx="90" cy="1780" r="340" fill="#38A169" opacity=".18"/>
    ${flower(540, 260, 1.2)}
    <text x="540" y="500" text-anchor="middle" font-family="Arial, sans-serif"
      font-size="30" font-weight="800" letter-spacing="5" fill="#68D391">YOUR TURN</text>
    ${textLines(['WHAT DID', 'YOU ALWAYS', 'WONDER?'], {
      x: 540, y: 660, size: 102, lineHeight: 118, anchor: 'middle',
    })}
    <rect x="150" y="1125" width="780" height="150" rx="24" fill="#F6AD55"/>
    <text x="540" y="1217" text-anchor="middle" font-family="Arial, sans-serif"
      font-size="47" font-weight="800" fill="#102A43">Tell me in the comments</text>
    <text x="540" y="1465" text-anchor="middle" font-family="Arial, sans-serif"
      font-size="50" font-weight="800" fill="#FFFFFF">Bloom Juniors</text>
    <text x="540" y="1530" text-anchor="middle" font-family="Arial, sans-serif"
      font-size="32" font-weight="700" fill="#A7C7E7">Built by a dad for curious minds.</text>
    <text x="540" y="1760" text-anchor="middle" font-family="Arial, sans-serif"
      font-size="31" font-weight="800" fill="#68D391">bloomjuniors.com</text>
  `)
  await sharp(Buffer.from(svg)).png().toFile(join(outDir, 'outro.png'))
}

async function createVoiceover() {
  const response = await fetch('https://bloomjuniors.com/api/tts?v=5', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://bloomjuniors.com',
    },
    body: JSON.stringify({
      text: 'Why does the Sun look red at sunset? Nobody explained questions like that when I was a child. So I built Bloom Juniors for my daughter. One real question. One prediction. One discovery. What did you always wonder?',
      voice: 'en-GB-RyanNeural',
      rate: -5,
      ssmlInner: 'Why does the Sun look red at sunset?<break time="350ms"/> Nobody explained questions like that when I was a child.<break time="300ms"/> So I built Bloom Juniors for my daughter.<break time="250ms"/> One real question. One prediction. One discovery.<break time="350ms"/> What did you always wonder?',
    }),
  })

  if (!response.ok) {
    throw new Error(`Voice generation failed (${response.status}): ${await response.text()}`)
  }
  writeFileSync(voicePath, Buffer.from(await response.arrayBuffer()))
}

function buildVideo() {
  const ffmpegArgs = [
    '-hide_banner', '-loglevel', 'warning', '-y',
    '-loop', '1', '-t', '2.8', '-i', join(outDir, 'intro.png'),
    '-ss', '0', '-t', '7.6', '-i', sunsetPath,
    '-ss', '7.5', '-t', '3.1', '-i', wonderPath,
    '-loop', '1', '-t', '3.2', '-i', join(outDir, 'outro.png'),
    '-i', voicePath,
    '-loop', '1', '-i', join(outDir, 'overlay-story.png'),
    '-loop', '1', '-i', join(outDir, 'overlay-discovery.png'),
    '-filter_complex',
    [
      '[0:v]fps=30,scale=1080:1920,format=yuv420p,zoompan=z=min(zoom+0.0007\\,1.04):d=1:s=1080x1920:fps=30,setpts=PTS-STARTPTS[intro]',
      '[1:v]fps=30,scale=1080:1920,setsar=1,setpts=PTS-STARTPTS[app1base]',
      '[app1base][5:v]overlay=0:0:shortest=1[app1]',
      '[2:v]fps=30,scale=1080:1920,setsar=1,setpts=PTS-STARTPTS[app2base]',
      '[app2base][6:v]overlay=0:0:shortest=1[app2]',
      '[3:v]fps=30,scale=1080:1920,format=yuv420p,setpts=PTS-STARTPTS[outro]',
      '[intro][app1][app2][outro]concat=n=4:v=1:a=0,format=yuv420p[v]',
      '[4:a]atempo=1.22,volume=1.1,loudnorm=I=-16:TP=-1.5:LRA=7[a]',
    ].join(';'),
    '-map', '[v]', '-map', '[a]',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-profile:v', 'high',
    '-level', '4.1', '-pix_fmt', 'yuv420p', '-r', '30',
    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
    '-movflags', '+faststart', '-shortest', outputPath,
  ]
  execFileSync('ffmpeg', ffmpegArgs, { stdio: 'inherit' })
}

await renderIntro()
await renderOverlay('overlay-story.png', 'WHY I BUILT IT', [
  'Nobody explained it.',
  'So I built the answer.',
])
await renderOverlay('overlay-discovery.png', 'HOW CHILDREN LEARN', [
  'Predict first.',
  'Then discover why.',
], '#68D391')
await renderOutro()
await createVoiceover()
buildVideo()

console.log(`\nCreated: ${outputPath}`)
console.log(`Cover:   ${join(outDir, 'cover-4x5.png')}`)
