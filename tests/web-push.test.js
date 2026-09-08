import test from 'node:test'
import assert from 'node:assert/strict'
import { webcrypto } from 'node:crypto'

import { sendWebPush } from '../functions/api/_web-push.js'
import { onRequestPost as testPushRequest } from '../functions/api/test-push.js'

const crypto = globalThis.crypto || webcrypto

function base64Url(value) {
  return Buffer.from(value).toString('base64url')
}

test('web push encrypts the payload and adds VAPID authorization', async () => {
  const originalCrypto = globalThis.crypto
  const originalFetch = globalThis.fetch
  Object.defineProperty(globalThis, 'crypto', { value: crypto, configurable: true })

  const receiver = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits'],
  )
  const receiverPublic = await crypto.subtle.exportKey('raw', receiver.publicKey)
  const auth = crypto.getRandomValues(new Uint8Array(16))

  const vapid = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify'],
  )
  const vapidPublic = await crypto.subtle.exportKey('raw', vapid.publicKey)
  const vapidPrivate = await crypto.subtle.exportKey('jwk', vapid.privateKey)
  let request
  globalThis.fetch = async (url, options) => {
    request = { url, options }
    return new Response(null, { status: 201 })
  }

  try {
    const result = await sendWebPush({
      endpoint: 'https://push.example.test/subscription/123',
      keys: {
        p256dh: base64Url(receiverPublic),
        auth: base64Url(auth),
      },
    }, {
      title: 'Bloom Juniors',
      body: 'A chapter is ready.',
      url: '/?app=1',
    }, {
      VAPID_PUBLIC_KEY: base64Url(vapidPublic),
      VAPID_PRIVATE_KEY: vapidPrivate.d,
    })

    assert.deepEqual(result, { ok: true, expired: false, status: 201 })
    assert.equal(request.url, 'https://push.example.test/subscription/123')
    assert.equal(request.options.headers['Content-Encoding'], 'aes128gcm')
    assert.match(request.options.headers.Authorization, /^vapid t=.+, k=.+/)
    const body = new Uint8Array(request.options.body)
    assert.equal(body.length > 103, true)
    assert.equal(new DataView(body.buffer).getUint32(16), 4096)
    assert.equal(body[20], 65)
  } finally {
    globalThis.fetch = originalFetch
    Object.defineProperty(globalThis, 'crypto', { value: originalCrypto, configurable: true })
  }
})

test('test push endpoint requires a signed-in guardian', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(null, { status: 401 })
  try {
    const response = await testPushRequest({
      request: new Request('https://example.com/api/test-push', { method: 'POST' }),
      env: {
        SUPABASE_URL: 'https://project.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'service-key',
      },
    })
    assert.equal(response.status, 401)
    assert.deepEqual(await response.json(), { error: 'Authentication required' })
  } finally {
    globalThis.fetch = originalFetch
  }
})
