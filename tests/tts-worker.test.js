import test from 'node:test'
import assert from 'node:assert/strict'
import { getAzureRegionCandidates, onRequestPost } from '../functions/api/tts.js'

function makeRequest(text = 'Hello explorer') {
  return new Request('https://bloomjuniors.com/api/tts', {
    method: 'POST',
    headers: {
      Origin: 'https://bloomjuniors.com',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, voice: 'en-GB-LibbyNeural', rate: -8 }),
  })
}

test('Azure region candidates keep configured region first and remove duplicates', () => {
  assert.deepEqual(
    getAzureRegionCandidates('EastUS', 'uaenorth, eastus'),
    ['eastus', 'uaenorth', 'uksouth', 'centralindia']
  )
})

test('TTS worker returns Azure audio and reports the successful region', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url, options) => {
    assert.match(String(url), /uksouth\.tts\.speech\.microsoft\.com/)
    assert.equal(options.headers['Ocp-Apim-Subscription-Key'], 'test-key')
    return new Response(new Uint8Array([0x49, 0x44, 0x33, 0x04]), {
      status: 200,
      headers: { 'Content-Type': 'audio/mpeg' },
    })
  }

  try {
    const response = await onRequestPost({
      request: makeRequest(),
      env: { AZURE_TTS_KEY: 'test-key', AZURE_TTS_REGION: 'uksouth' },
    })
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('X-Bloom-TTS-Region'), 'uksouth')
    assert.equal((await response.arrayBuffer()).byteLength, 4)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('TTS worker falls back to another Azure region when the configured region rejects the key', async () => {
  const originalFetch = globalThis.fetch
  const attempted = []
  globalThis.fetch = async (url) => {
    attempted.push(String(url))
    if (String(url).includes('eastus')) {
      return new Response(new Uint8Array([0x49, 0x44, 0x33]), {
        status: 200,
        headers: { 'Content-Type': 'audio/mpeg' },
      })
    }
    return new Response('Access denied', { status: 401 })
  }

  try {
    const response = await onRequestPost({
      request: makeRequest('A unique uncached phrase'),
      env: { AZURE_TTS_KEY: 'test-key', AZURE_TTS_REGION: 'uaenorth' },
    })
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('X-Bloom-TTS-Region'), 'eastus')
    assert.ok(attempted.some((url) => url.includes('uaenorth')))
    assert.ok(attempted.some((url) => url.includes('eastus')))
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('TTS worker returns a safe readable diagnostic without exposing the key', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response('Unauthorized', { status: 401 })

  try {
    const response = await onRequestPost({
      request: makeRequest('Another uncached phrase'),
      env: { AZURE_TTS_KEY: 'secret-key-never-print', AZURE_TTS_REGION: 'uksouth' },
    })
    const body = await response.text()
    assert.equal(response.status, 424)
    assert.match(body, /uksouth:401/)
    assert.doesNotMatch(body, /secret-key-never-print/)
  } finally {
    globalThis.fetch = originalFetch
  }
})
