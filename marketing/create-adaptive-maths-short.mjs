import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = join(root, 'marketing', 'adaptive-maths-short')
const workDir = join(outputDir, 'work')
const source = join(outputDir, 'adaptive-maths-proof.webm')

mkdirSync(workDir, { recursive: true })

const paths = {
  voice: join(workDir, 'voice.mp3'),
  hook: join(workDir, '01-hook.png'),
  retry: join(workDir, '02-retry.png'),
  think: join(workDir, '03-think.png'),
  solved: join(workDir, '04-solved.png'),
  outro: join(workDir, '05-outro.png'),
  video: join(outputDir, 'good-try-maths-reel.mp4'),
  preview: join(outputDir, 'good-try-maths-reel-windows-preview.wmv'),
  cover: join(outputDir, 'good-try-maths-cover-4x5.png'),
}

const voiceText = 'She tapped the wrong answer. Bloom said, good try, let us look once more. The same question stayed open, so she could think and try again. Then she solved it herself. A score shows the answer. The retry shows the learning.'

const escapeXml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')

function flower({ x = 944, y = 128 } = {}) {
  const petal = (rotation, colour) =>
    `<ellipse cx="0" cy="-22" rx="11" ry="20" fill="${colour}" transform="rotate(${rotation})"/>`
  return `
    <g transform="translate(${x} ${y})">
      ${petal(0, '#FB923C')}
      ${petal(72, '#FB7185')}
      ${petal(144, '#F97316')}
      ${petal(216, '#FB7185')}
      ${petal(288, '#FB923C')}
      <circle r="16" fill="#0F766E"/>
      <circle r="8" fill="#FCD34D"/>
    </g>
  `
}

function overlay({ eyebrow, lines, accent = '#F97316', dark = false }) {
  const fill = dark ? '#102A43' : '#FFF7ED'
  const ink = dark ? '#FFFFFF' : '#102A43'
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920">
      <rect x="42" y="78" width="996" height="330" rx="8"
        fill="${fill}" fill-opacity=".96"/>
      <rect x="42" y="78" width="12" height="330" rx="6" fill="${accent}"/>
      ${flower()}
      <text x="84" y="148" font-family="Arial, sans-serif" font-size="25"
        font-weight="800" fill="${accent}">${escapeXml(eyebrow)}</text>
      ${lines.map((line, index) => `
        <text x="84" y="${245 + index * 84}" font-family="Arial, sans-serif"
          font-size="${line.length > 20 ? 56 : 67}" font-weight="900"
          fill="${ink}">${escapeXml(line)}</text>
      `).join('')}
      <rect x="42" y="1745" width="996" height="98" rx="8"
        fill="#FFF7ED" fill-opacity=".96"/>
      <text x="540" y="1808" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="30" font-weight="800" fill="#102A43">Bloom Juniors · real learning, no ads</text>
    </svg>
  `
}

function outro() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920">
      <rect width="1080" height="1920" fill="#FFF7ED"/>
      <rect width="16" height="1920" fill="#F97316"/>
      ${flower({ x: 540, y: 290 })}
      <text x="540" y="505" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="27" font-weight="800" fill="#0F766E">THE BETTER SIGNAL</text>
      <text x="540" y="690" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="74" font-weight="900" fill="#102A43">THE RETRY</text>
      <text x="540" y="790" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="74" font-weight="900" fill="#F97316">SHOWS THE</text>
      <text x="540" y="890" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="74" font-weight="900" fill="#102A43">LEARNING.</text>
      <text x="540" y="1160" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="38" font-weight="700" fill="#52667A">How does your child's app</text>
      <text x="540" y="1215" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="38" font-weight="700" fill="#52667A">respond to mistakes?</text>
      <rect x="210" y="1470" width="660" height="112" rx="8" fill="#0F766E"/>
      <text x="540" y="1542" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="37" font-weight="800" fill="#FFFFFF">bloomjuniors.com</text>
    </svg>
  `
}

function cover() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350">
      <rect width="1080" height="1350" fill="#FFF7ED"/>
      <rect width="16" height="1350" fill="#F97316"/>
      ${flower({ x: 930, y: 110 })}
      <text x="72" y="110" font-family="Arial, sans-serif" font-size="26"
        font-weight="800" fill="#0F766E">WHAT HAPPENS AFTER A MISTAKE?</text>
      <text x="72" y="330" font-family="Arial, sans-serif" font-size="76"
        font-weight="900" fill="#102A43">SHE GOT IT</text>
      <text x="72" y="425" font-family="Arial, sans-serif" font-size="76"
        font-weight="900" fill="#102A43">WRONG.</text>
      <text x="72" y="555" font-family="Arial, sans-serif" font-size="76"
        font-weight="900" fill="#F97316">BLOOM SAID:</text>
      <text x="72" y="650" font-family="Arial, sans-serif" font-size="76"
        font-weight="900" fill="#102A43">GOOD TRY.</text>
      <rect x="72" y="765" width="936" height="14" rx="7" fill="#F97316"/>
      <text x="72" y="900" font-family="Arial, sans-serif" font-size="39"
        font-weight="800" fill="#102A43">SAME QUESTION · ANOTHER CHANCE</text>
      <text x="72" y="1200" font-family="Arial, sans-serif" font-size="31"
        font-weight="800" fill="#0F766E">Bloom Juniors · built by a parent</text>
    </svg>
  `
}

async function createVoice() {
  const response = await fetch('https://bloomjuniors.com/api/tts?v=5', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://bloomjuniors.com',
    },
    body: JSON.stringify({
      text: voiceText,
      voice: 'en-GB-RyanNeural',
      rate: 5,
      ssmlInner: 'She tapped the wrong answer.<break time="180ms"/> Bloom said, good try, let us look once more.<break time="210ms"/> The same question stayed open, so she could think and try again.<break time="220ms"/> Then she solved it herself.<break time="230ms"/> A score shows the answer. The retry shows the learning.',
    }),
  })
  if (!response.ok) throw new Error(`Voice generation failed (${response.status})`)
  writeFileSync(paths.voice, Buffer.from(await response.arrayBuffer()))
}

function durationOf(path) {
  return Number(execFileSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    path,
  ], { encoding: 'utf8' }).trim())
}

await sharp(Buffer.from(overlay({
  eyebrow: 'WHAT HAPPENS AFTER A MISTAKE?',
  lines: ['SHE GOT IT WRONG.', 'BLOOM SAID: GOOD TRY.'],
  accent: '#F97316',
}))).png().toFile(paths.hook)

await sharp(Buffer.from(overlay({
  eyebrow: 'STEP 1 · NO RUSHING ON',
  lines: ['THE SAME QUESTION', 'STAYS OPEN.'],
  accent: '#FCD34D',
  dark: true,
}))).png().toFile(paths.retry)

await sharp(Buffer.from(overlay({
  eyebrow: 'STEP 2 · TIME TO THINK',
  lines: ['LOOK ONCE MORE.', 'TRY AGAIN.'],
  accent: '#FB923C',
  dark: true,
}))).png().toFile(paths.think)

await sharp(Buffer.from(overlay({
  eyebrow: 'STEP 3 · HER OWN ANSWER',
  lines: ['SHE SOLVED IT', 'HERSELF.'],
  accent: '#68D391',
  dark: true,
}))).png().toFile(paths.solved)

await sharp(Buffer.from(outro())).png().toFile(paths.outro)
await sharp(Buffer.from(cover())).png().toFile(paths.cover)
await createVoice()

const duration = durationOf(paths.voice)
const outroStart = Math.max(12.2, duration - 3.1)

execFileSync('ffmpeg', [
  '-hide_banner', '-loglevel', 'warning', '-y',
  '-ss', '2.1', '-i', source,
  '-loop', '1', '-i', paths.hook,
  '-loop', '1', '-i', paths.retry,
  '-loop', '1', '-i', paths.think,
  '-loop', '1', '-i', paths.solved,
  '-loop', '1', '-i', paths.outro,
  '-i', paths.voice,
  '-filter_complex', [
    `[0:v]setpts=1.15*PTS,scale=1080:1920,setsar=1,tpad=stop_mode=clone:stop_duration=6[base]`,
    `[base][1:v]overlay=0:0:enable='between(t,0,3.4)'[v1]`,
    `[v1][2:v]overlay=0:0:enable='between(t,3.4,6.2)'[v2]`,
    `[v2][3:v]overlay=0:0:enable='between(t,6.2,9.3)'[v3]`,
    `[v3][4:v]overlay=0:0:enable='between(t,9.3,${outroStart})'[v4]`,
    `[v4][5:v]overlay=0:0:enable='gte(t,${outroStart})',format=yuv420p[v]`,
    '[6:a]loudnorm=I=-16:TP=-1.5:LRA=7[a]',
  ].join(';'),
  '-map', '[v]', '-map', '[a]',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '17',
  '-profile:v', 'high', '-level', '4.1', '-pix_fmt', 'yuv420p', '-r', '30',
  '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
  '-movflags', '+faststart', '-t', String(duration), paths.video,
], { stdio: 'inherit' })

execFileSync('ffmpeg', [
  '-hide_banner', '-loglevel', 'warning', '-y',
  '-i', paths.video,
  '-c:v', 'wmv2', '-q:v', '3', '-r', '30',
  '-c:a', 'wmav2', '-b:a', '192k', '-ac', '2', '-ar', '44100',
  paths.preview,
], { stdio: 'inherit' })

console.log(JSON.stringify({
  video: paths.video,
  preview: paths.preview,
  cover: paths.cover,
  duration,
}, null, 2))
