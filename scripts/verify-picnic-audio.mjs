import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'

// One short synthesis request; no child data is submitted.
const response = await fetch('https://bloomjuniors.com/api/tts?v=5', {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://bloomjuniors.com' },
  body: JSON.stringify({ text: 'Can you give each friend one plate?', voice: 'en-US-AnaNeural', rate: 0.85 }),
})
assert.equal(response.status, 200, `Speech endpoint returned ${response.status}`)
assert.match(response.headers.get('content-type'), /^audio\//)
const bytes = Buffer.from(await response.arrayBuffer())
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage()
  const result = await page.evaluate(async base64 => {
    const binary = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
    const context = new AudioContext()
    const decoded = await context.decodeAudioData(binary.buffer.slice(0))
    const nonSilent = decoded.getChannelData(0).some(sample => Math.abs(sample) > 0.001)
    const audio = new Audio(URL.createObjectURL(new Blob([binary], { type: 'audio/mpeg' })))
    await new Promise((resolve, reject) => {
      audio.onended = resolve; audio.onerror = reject
      audio.play().catch(reject)
      setTimeout(() => reject(new Error('Playback timeout')), 20000)
    })
    await context.close()
    return { duration: decoded.duration, nonSilent, ended: audio.ended }
  }, bytes.toString('base64'))
  assert.ok(result.duration > 0 && result.nonSilent && result.ended)
  console.log(JSON.stringify({ status: 200, bytes: bytes.length, ...result }))
} finally { await browser.close() }
