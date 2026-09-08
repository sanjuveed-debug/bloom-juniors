import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const input = join(root, 'Video', 'Bloom Juniors Reel (1).mp4')
const output = join(root, 'Video', 'Bloom Juniors Reel (1)-Instagram.mp4')
const preview = join(root, 'Video', 'Bloom Juniors Reel (1)-Instagram-preview.wmv')
const voice = join(root, 'Video', 'Bloom Juniors Reel (1)-voice.mp3')

mkdirSync(dirname(output), { recursive: true })

const narration = 'Twenty minutes of screen time. But doing what? With Bloom Juniors, the same twenty minutes become real learning. Tap each sound. Blend the word. They are reading, not watching. And parents can see exactly what is clicking. Ad-free learning for ages three to nine. Start free.'

const response = await fetch('https://bloomjuniors.com/api/tts?v=5', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Origin: 'https://bloomjuniors.com',
  },
  body: JSON.stringify({
    text: narration,
    voice: 'en-GB-RyanNeural',
    rate: 4,
    ssmlInner: 'Twenty minutes of screen time.<break time="240ms"/> But doing what?<break time="280ms"/> With Bloom Juniors, the same twenty minutes become real learning.<break time="220ms"/> Tap each sound. Blend the word.<break time="220ms"/> They are reading, not watching.<break time="240ms"/> And parents can see exactly what is clicking.<break time="220ms"/> Ad-free learning for ages three to nine.<break time="220ms"/> Start free.',
  }),
})

if (!response.ok) {
  throw new Error(`Narration request failed (${response.status}): ${await response.text()}`)
}
writeFileSync(voice, Buffer.from(await response.arrayBuffer()))

execFileSync('ffmpeg', [
  '-hide_banner', '-loglevel', 'error', '-y',
  '-i', input,
  '-i', voice,
  '-filter_complex', [
    '[0:v]scale=1080:1920:flags=lanczos,unsharp=5:5:0.22:5:5:0.0,format=yuv420p[v]',
    '[1:a]highpass=f=70,lowpass=f=15000,loudnorm=I=-16:TP=-1.5:LRA=7,apad=pad_dur=2[a]',
  ].join(';'),
  '-map', '[v]', '-map', '[a]',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '17',
  '-profile:v', 'high', '-level', '4.1', '-pix_fmt', 'yuv420p', '-r', '30',
  '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
  '-movflags', '+faststart', '-t', '17', output,
], { stdio: 'inherit' })

execFileSync('ffmpeg', [
  '-hide_banner', '-loglevel', 'error', '-y',
  '-i', output,
  '-c:v', 'wmv2', '-q:v', '2', '-r', '30',
  '-c:a', 'wmav2', '-b:a', '192k', '-ac', '2', '-ar', '44100',
  preview,
], { stdio: 'inherit' })

console.log(`Created ${output}`)
console.log(`Created ${preview}`)
