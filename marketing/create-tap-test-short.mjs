import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = join(root, 'marketing', 'tap-test-short')
const sourceClip = join(root, 'marketing', 'videos', 'post15-sunset.mp4')

mkdirSync(outputDir, { recursive: true })

const paths = {
  voice: join(outputDir, 'tap-test-voice.mp3'),
  hook: join(outputDir, '01-hook.png'),
  predict: join(outputDir, '02-predict.png'),
  observe: join(outputDir, '03-observe.png'),
  explain: join(outputDir, '04-explain.png'),
  result: join(outputDir, '05-result.png'),
  outro: join(outputDir, '06-outro.png'),
  cover: join(outputDir, 'tap-test-cover-4x5.png'),
  video: join(outputDir, 'one-correct-tap.mp4'),
}

const voiceText = 'One correct tap can hide zero understanding. Try this instead. Ask your child to predict, watch the evidence, then explain what changed their mind. That answer tells you more than the score. What question does your child keep asking?'

const escapeXml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')

function textLines(lines, {
  x = 72,
  y = 260,
  size = 72,
  lineHeight = 84,
  fill = '#102A43',
  weight = 800,
  anchor = 'start',
} = {}) {
  return lines.map((line, index) => `
    <text x="${x}" y="${y + index * lineHeight}" text-anchor="${anchor}"
      font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}"
      fill="${fill}">${escapeXml(line)}</text>
  `).join('')
}

function flowerMark({ x = 932, y = 118, scale = 1 } = {}) {
  const petal = (rotation, colour) =>
    `<ellipse cx="0" cy="${-22 * scale}" rx="${11 * scale}" ry="${20 * scale}" fill="${colour}" transform="rotate(${rotation})"/>`
  return `
    <g transform="translate(${x} ${y})">
      ${petal(0, '#FB923C')}
      ${petal(72, '#FB7185')}
      ${petal(144, '#F97316')}
      ${petal(216, '#FB7185')}
      ${petal(288, '#FB923C')}
      <circle r="${16 * scale}" fill="#0F766E"/>
      <circle r="${8 * scale}" fill="#FCD34D"/>
    </g>
  `
}

function topCard({ eyebrow, lines, accent = '#F97316', emphasis = [] }) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920">
      <rect x="36" y="72" width="1008" height="510" rx="8" fill="#FFF7ED" fill-opacity=".97"/>
      <rect x="36" y="72" width="14" height="510" rx="7" fill="${accent}"/>
      ${flowerMark()}
      <text x="82" y="142" font-family="Arial, sans-serif" font-size="25"
        font-weight="800" fill="#0F766E">${escapeXml(eyebrow)}</text>
      ${textLines(lines, { x: 82, y: 250, size: 75, lineHeight: 88 })}
      ${emphasis.map(({ text, x, y, width }) => `
        <rect x="${x}" y="${y}" width="${width}" height="16" rx="8" fill="${accent}" opacity=".9"/>
        <text x="${x}" y="${y - 18}" font-family="Arial, sans-serif" font-size="28"
          font-weight="800" fill="${accent}">${escapeXml(text)}</text>
      `).join('')}
    </svg>
  `
}

function stepCard({ number, verb, prompt, accent }) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920">
      <rect x="48" y="98" width="984" height="290" rx="8" fill="#102A43" fill-opacity=".94"/>
      <circle cx="132" cy="185" r="47" fill="${accent}"/>
      <text x="132" y="202" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="47" font-weight="800" fill="#102A43">${number}</text>
      <text x="210" y="190" font-family="Arial, sans-serif" font-size="72"
        font-weight="800" fill="#FFFFFF">${escapeXml(verb)}</text>
      <text x="84" y="315" font-family="Arial, sans-serif" font-size="39"
        font-weight="700" fill="#EAF1FF">${escapeXml(prompt)}</text>
      <rect x="48" y="1738" width="984" height="104" rx="8" fill="#FFF7ED" fill-opacity=".96"/>
      <text x="540" y="1805" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="31" font-weight="800" fill="#102A43">Bloom Juniors · a founder-built learning app</text>
    </svg>
  `
}

function outro() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920">
      <rect width="1080" height="1920" fill="#FFF7ED"/>
      <rect x="0" width="16" height="1920" fill="#F97316"/>
      ${flowerMark({ x: 540, y: 300, scale: 2.2 })}
      <text x="540" y="535" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="28" font-weight="800" fill="#0F766E">A QUESTION FOR PARENTS</text>
      ${textLines(['WHAT QUESTION', 'DOES YOUR CHILD', 'KEEP ASKING?'], {
        x: 540,
        y: 720,
        size: 72,
        lineHeight: 92,
        anchor: 'middle',
      })}
      <text x="540" y="1150" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="34" font-weight="700" fill="#52667A">Tell me in the comments.</text>
      <rect x="182" y="1435" width="716" height="116" rx="8" fill="#0F766E"/>
      <text x="540" y="1509" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="38" font-weight="800" fill="#FFFFFF">bloomjuniors.com</text>
    </svg>
  `
}

function cover() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350">
      <rect width="1080" height="1350" fill="#FFF7ED"/>
      <rect x="0" width="16" height="1350" fill="#F97316"/>
      ${flowerMark({ x: 920, y: 110, scale: 1.2 })}
      <text x="72" y="115" font-family="Arial, sans-serif" font-size="26"
        font-weight="800" fill="#0F766E">THE 3-STEP SCREEN-TIME TEST</text>
      ${textLines(['ONE CORRECT TAP', 'CAN HIDE ZERO', 'UNDERSTANDING.'], {
        x: 72,
        y: 300,
        size: 72,
        lineHeight: 91,
      })}
      <rect x="72" y="660" width="936" height="16" rx="8" fill="#F97316"/>
      <text x="72" y="790" font-family="Arial, sans-serif" font-size="39"
        font-weight="800" fill="#102A43">PREDICT · WATCH · EXPLAIN</text>
      <text x="72" y="1175" font-family="Arial, sans-serif" font-size="31"
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
      rate: 2,
      ssmlInner: 'One correct tap can hide zero understanding.<break time="220ms"/> Try this instead.<break time="180ms"/> Ask your child to predict, watch the evidence, then explain what changed their mind.<break time="240ms"/> That answer tells you more than the score.<break time="260ms"/> What question does your child keep asking?',
    }),
  })

  if (!response.ok) {
    throw new Error(`Voice generation failed (${response.status}): ${await response.text()}`)
  }
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

await sharp(Buffer.from(topCard({
  eyebrow: 'THE SCREEN-TIME TRAP',
  lines: ['ONE CORRECT TAP', 'CAN HIDE ZERO', 'UNDERSTANDING.'],
  accent: '#F97316',
}))).png().toFile(paths.hook)

await sharp(Buffer.from(stepCard({
  number: '1',
  verb: 'PREDICT',
  prompt: 'What do you think will happen?',
  accent: '#FCD34D',
}))).png().toFile(paths.predict)

await sharp(Buffer.from(stepCard({
  number: '2',
  verb: 'WATCH',
  prompt: 'Look for evidence, not points.',
  accent: '#FB923C',
}))).png().toFile(paths.observe)

await sharp(Buffer.from(stepCard({
  number: '3',
  verb: 'EXPLAIN',
  prompt: 'What changed your mind?',
  accent: '#68D391',
}))).png().toFile(paths.explain)

await sharp(Buffer.from(topCard({
  eyebrow: 'THE BETTER SIGNAL',
  lines: ['THEIR EXPLANATION', 'TELLS YOU MORE', 'THAN THE SCORE.'],
  accent: '#0F766E',
}))).png().toFile(paths.result)

await sharp(Buffer.from(outro())).png().toFile(paths.outro)
await sharp(Buffer.from(cover())).png().toFile(paths.cover)
await createVoice()

const duration = durationOf(paths.voice)
const outroStart = Math.max(14, duration - 3.1)
const segment = (outroStart - 2.8) / 4
const predictEnd = 2.8 + segment
const observeEnd = predictEnd + segment
const explainEnd = observeEnd + segment

execFileSync('ffmpeg', [
  '-hide_banner', '-loglevel', 'warning', '-y',
  '-stream_loop', '-1', '-i', sourceClip,
  '-loop', '1', '-i', paths.hook,
  '-loop', '1', '-i', paths.predict,
  '-loop', '1', '-i', paths.observe,
  '-loop', '1', '-i', paths.explain,
  '-loop', '1', '-i', paths.result,
  '-loop', '1', '-i', paths.outro,
  '-i', paths.voice,
  '-filter_complex', [
    `[0:v]trim=duration=${duration},setpts=PTS-STARTPTS,split=2[bgsrc][fgsrc]`,
    '[bgsrc]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=28,eq=brightness=-0.14:saturation=0.75[bg]',
    '[fgsrc]scale=-2:1920[fg]',
    '[bg][fg]overlay=(W-w)/2:0[base]',
    `[base][1:v]overlay=0:0:enable='between(t,0,2.8)'[v1]`,
    `[v1][2:v]overlay=0:0:enable='between(t,2.8,${predictEnd})'[v2]`,
    `[v2][3:v]overlay=0:0:enable='between(t,${predictEnd},${observeEnd})'[v3]`,
    `[v3][4:v]overlay=0:0:enable='between(t,${observeEnd},${explainEnd})'[v4]`,
    `[v4][5:v]overlay=0:0:enable='between(t,${explainEnd},${outroStart})'[v5]`,
    `[v5][6:v]overlay=0:0:enable='gte(t,${outroStart})',format=yuv420p[v]`,
    '[7:a]loudnorm=I=-16:TP=-1.5:LRA=7[a]',
  ].join(';'),
  '-map', '[v]', '-map', '[a]',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
  '-profile:v', 'high', '-level', '4.1', '-pix_fmt', 'yuv420p', '-r', '30',
  '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
  '-movflags', '+faststart', '-t', String(duration), paths.video,
], { stdio: 'inherit' })

console.log(JSON.stringify({ video: paths.video, cover: paths.cover, duration }, null, 2))
