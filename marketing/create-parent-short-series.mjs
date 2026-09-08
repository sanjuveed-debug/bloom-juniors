import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = join(root, 'marketing', 'cross-platform-shorts')
const founderPath = join(root, 'public', 'founder.jpg')

const shorts = [
  {
    slug: 'reading-starts-before-words',
    clip: join(root, 'marketing', 'videos', 'post3-soundpop-hook.mp4'),
    accent: '#F6AD55',
    hook: ['KNOWS EVERY LETTER', 'BUT STILL', 'CANNOT READ?'],
    pointOneLabel: 'THE FOUNDATION',
    pointOne: ['Letter names are', 'not enough.'],
    pointTwoLabel: 'TRY THIS TODAY',
    pointTwo: ['Say "map" slowly.', 'Can they hear m-a-p?'],
    cta: ['STRONG READING', 'STARTS WITH SOUND'],
    voice: 'A child can know every letter name and still struggle to read. Reading starts with hearing each sound, then blending those sounds into a word. Try this today. Say map slowly. Can your child hear m, a, p?',
    ssml: 'A child can know every letter name and still struggle to read.<break time="250ms"/> Reading starts with hearing each sound, then blending those sounds into a word.<break time="250ms"/> Try this today. Say map slowly.<break time="200ms"/> Can your child hear mmm, ah, puh?',
  },
  {
    slug: 'the-screen-time-question',
    clip: join(root, 'marketing', 'videos', 'post14-wonderwhy.mp4'),
    startOffset: 4,
    accent: '#68D391',
    hook: ['WAS YOUR CHILD', 'THINKING...', 'OR JUST TAPPING?'],
    pointOneLabel: 'A BETTER SCREEN-TIME TEST',
    pointOne: ['Did they predict?', 'Did they explain?'],
    pointTwoLabel: 'THE REAL SIGNAL',
    pointTwo: ['Did one answer lead', 'to a new question?'],
    cta: ['CURIOSITY SHOULD', 'OUTLIVE THE SCREEN'],
    voice: 'I stopped asking only how many minutes my daughter spent on a screen. Now I ask: did she predict, explain, or ask a new question? If curiosity continues after the screen turns off, the screen did its job.',
    ssml: 'I stopped asking only how many minutes my daughter spent on a screen.<break time="250ms"/> Now I ask: did she predict, explain, or ask a new question?<break time="300ms"/> If curiosity continues after the screen turns off, the screen did its job.',
  },
  {
    slug: 'my-daughter-stopped-coming-back',
    clip: join(root, 'marketing', 'videos', 'post12-fulljourney.mp4'),
    startOffset: 1,
    accent: '#F6AD55',
    hook: ['MY OWN DAUGHTER', 'STOPPED OPENING', 'MY LEARNING APP.'],
    pointOneLabel: 'I LEARNT THIS THE HARD WAY',
    pointOne: ['More games were', 'not the answer.'],
    pointTwoLabel: 'WHAT CHILDREN NEED',
    pointTwo: ['A next chapter.', 'A world that remembers.'],
    cta: ['BUILD A REASON', 'TO COME BACK'],
    voice: 'My own daughter stopped opening the learning app I built. I kept adding more games, but more was not the answer. Children need a next chapter, a world that remembers them, and something worth returning to. What makes your child choose an app again?',
    ssml: 'My own daughter stopped opening the learning app I built.<break time="300ms"/> I kept adding more games, but more was not the answer.<break time="300ms"/> Children need a next chapter, a world that remembers them, and something worth returning to.<break time="300ms"/> What makes your child choose an app again?',
  },
]

mkdirSync(outputDir, { recursive: true })

const escapeXml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')

function linesSvg(lines, {
  x = 72,
  y = 250,
  size = 76,
  lineHeight = 86,
  fill = '#FFFFFF',
  anchor = 'start',
} = {}) {
  return lines.map((line, index) => `
    <text x="${x}" y="${y + index * lineHeight}" text-anchor="${anchor}"
      font-family="Arial, sans-serif" font-size="${size}" font-weight="800"
      fill="${fill}">${escapeXml(line)}</text>
  `).join('')
}

function overlaySvg({ accent, label, lines, hook = false }) {
  const panelHeight = hook ? 430 : 310
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920">
      <rect x="36" y="76" width="1008" height="${panelHeight}" rx="8"
        fill="#102A43" fill-opacity=".94"/>
      <rect x="68" y="110" width="8" height="${panelHeight - 68}" rx="4"
        fill="${accent}"/>
      <text x="108" y="154" font-family="Arial, sans-serif" font-size="26"
        font-weight="800" fill="${accent}">${escapeXml(label)}</text>
      ${linesSvg(lines, {
        x: 108,
        y: hook ? 245 : 232,
        size: hook ? 72 : 62,
        lineHeight: hook ? 82 : 72,
      })}
      <rect x="36" y="1780" width="1008" height="84" rx="8"
        fill="#FFFFFF" fill-opacity=".95"/>
      <text x="540" y="1834" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="29" font-weight="800" fill="#102A43">Bloom Juniors | Built for curious minds</text>
    </svg>
  `
}

function outroSvg(short, portraitData) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920">
      <rect width="1080" height="1920" fill="#102A43"/>
      <rect x="0" y="0" width="18" height="1920" fill="${short.accent}"/>
      <circle cx="890" cy="220" r="280" fill="${short.accent}" opacity=".13"/>
      <text x="90" y="170" font-family="Arial, sans-serif" font-size="28"
        font-weight="800" fill="${short.accent}">ONE SMALL FOUNDATION</text>
      ${linesSvg(short.cta, { x: 90, y: 355, size: 84, lineHeight: 100 })}
      <circle cx="230" cy="1260" r="142" fill="#FFFFFF" opacity=".14"/>
      <clipPath id="portrait"><circle cx="230" cy="1260" r="122"/></clipPath>
      <image href="data:image/jpeg;base64,${portraitData}" x="108" y="1138"
        width="244" height="244" preserveAspectRatio="xMidYMid slice"
        clip-path="url(#portrait)"/>
      <text x="405" y="1225" font-family="Arial, sans-serif" font-size="41"
        font-weight="800" fill="#FFFFFF">Sanju</text>
      <text x="405" y="1280" font-family="Arial, sans-serif" font-size="29"
        font-weight="700" fill="#A7C7E7">Founder and dad</text>
      <text x="90" y="1535" font-family="Arial, sans-serif" font-size="43"
        font-weight="800" fill="#FFFFFF">Try Bloom Juniors free</text>
      <text x="90" y="1597" font-family="Arial, sans-serif" font-size="31"
        font-weight="700" fill="${short.accent}">bloomjuniors.com</text>
    </svg>
  `
}

function coverSvg(short, portraitData) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350">
      <rect width="1080" height="1350" fill="#102A43"/>
      <rect width="16" height="1350" fill="${short.accent}"/>
      <circle cx="980" cy="90" r="245" fill="${short.accent}" opacity=".13"/>
      <text x="72" y="105" font-family="Arial, sans-serif" font-size="26"
        font-weight="800" fill="${short.accent}">A QUESTION FOR PARENTS</text>
      ${linesSvg(short.hook, { x: 72, y: 255, size: 72, lineHeight: 88 })}
      <circle cx="190" cy="965" r="118" fill="#FFFFFF" opacity=".14"/>
      <clipPath id="coverPortrait"><circle cx="190" cy="965" r="102"/></clipPath>
      <image href="data:image/jpeg;base64,${portraitData}" x="88" y="863"
        width="204" height="204" preserveAspectRatio="xMidYMid slice"
        clip-path="url(#coverPortrait)"/>
      <text x="345" y="945" font-family="Arial, sans-serif" font-size="39"
        font-weight="800" fill="#FFFFFF">Sanju</text>
      <text x="345" y="997" font-family="Arial, sans-serif" font-size="28"
        font-weight="700" fill="#A7C7E7">Founder and dad</text>
      <text x="72" y="1242" font-family="Arial, sans-serif" font-size="30"
        font-weight="800" fill="${short.accent}">bloomjuniors.com</text>
    </svg>
  `
}

async function createVoice(short, path) {
  const response = await fetch('https://bloomjuniors.com/api/tts?v=5', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://bloomjuniors.com',
    },
    body: JSON.stringify({
      text: short.voice,
      voice: 'en-GB-RyanNeural',
      rate: -3,
      ssmlInner: short.ssml,
    }),
  })

  if (!response.ok) {
    throw new Error(`Voice generation failed (${response.status}): ${await response.text()}`)
  }
  writeFileSync(path, Buffer.from(await response.arrayBuffer()))
}

function durationOf(path) {
  return Number(execFileSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    path,
  ], { encoding: 'utf8' }).trim())
}

function renderVideo(short, paths, duration) {
  const hookEnd = Math.min(3.4, duration * 0.22)
  const outroStart = Math.max(hookEnd + 6, duration - 3.2)
  const midpoint = hookEnd + ((outroStart - hookEnd) / 2)

  execFileSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'warning', '-y',
    '-stream_loop', '-1',
    ...(short.startOffset ? ['-ss', String(short.startOffset)] : []),
    '-t', String(duration), '-i', short.clip,
    '-loop', '1', '-i', paths.hook,
    '-loop', '1', '-i', paths.pointOne,
    '-loop', '1', '-i', paths.pointTwo,
    '-loop', '1', '-i', paths.outro,
    '-i', paths.voice,
    '-filter_complex', [
      '[0:v]fps=30,scale=1080:1920,setsar=1,setpts=PTS-STARTPTS[base]',
      `[base][1:v]overlay=0:0:enable='between(t,0,${hookEnd})'[hooked]`,
      `[hooked][2:v]overlay=0:0:enable='between(t,${hookEnd},${midpoint})'[one]`,
      `[one][3:v]overlay=0:0:enable='between(t,${midpoint},${outroStart})'[two]`,
      `[two][4:v]overlay=0:0:enable='gte(t,${outroStart})',format=yuv420p[v]`,
      '[5:a]volume=1.05,loudnorm=I=-16:TP=-1.5:LRA=7[a]',
    ].join(';'),
    '-map', '[v]', '-map', '[a]',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
    '-profile:v', 'high', '-level', '4.1', '-pix_fmt', 'yuv420p', '-r', '30',
    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
    '-movflags', '+faststart', '-shortest', paths.video,
  ], { stdio: 'inherit' })
}

function renderWindowsPreview(paths) {
  execFileSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'warning', '-y',
    '-i', paths.video,
    '-c:v', 'wmv2', '-q:v', '3', '-r', '30',
    '-c:a', 'wmav2', '-b:a', '192k', '-ac', '2', '-ar', '44100',
    paths.preview,
  ], { stdio: 'inherit' })
}

const portraitData = readFileSync(founderPath).toString('base64')

for (const short of shorts) {
  const paths = {
    hook: join(outputDir, `${short.slug}-hook.png`),
    pointOne: join(outputDir, `${short.slug}-point-1.png`),
    pointTwo: join(outputDir, `${short.slug}-point-2.png`),
    outro: join(outputDir, `${short.slug}-outro.png`),
    cover: join(outputDir, `${short.slug}-cover-4x5.png`),
    voice: join(outputDir, `${short.slug}-voice.mp3`),
    video: join(outputDir, `${short.slug}.mp4`),
    preview: join(outputDir, `${short.slug}-windows-preview.wmv`),
  }

  const hookSvg = overlaySvg({
    accent: short.accent,
    label: 'A QUESTION FOR PARENTS',
    lines: short.hook,
    hook: true,
  })
  await sharp(Buffer.from(hookSvg)).png().toFile(paths.hook)
  await sharp(Buffer.from(coverSvg(short, portraitData))).png().toFile(paths.cover)
  await sharp(Buffer.from(overlaySvg({
    accent: short.accent,
    label: short.pointOneLabel,
    lines: short.pointOne,
  }))).png().toFile(paths.pointOne)
  await sharp(Buffer.from(overlaySvg({
    accent: short.accent,
    label: short.pointTwoLabel,
    lines: short.pointTwo,
  }))).png().toFile(paths.pointTwo)
  await sharp(Buffer.from(outroSvg(short, portraitData))).png().toFile(paths.outro)

  await createVoice(short, paths.voice)
  const duration = durationOf(paths.voice) + 0.35
  renderVideo(short, paths, duration)
  renderWindowsPreview(paths)
  console.log(`Created ${paths.video}`)
  console.log(`Preview ${paths.preview}`)
}
