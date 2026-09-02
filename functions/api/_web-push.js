const encoder = new TextEncoder()

function bytes(...values) {
  const arrays = values.map(value => value instanceof Uint8Array ? value : new Uint8Array(value))
  const output = new Uint8Array(arrays.reduce((sum, value) => sum + value.length, 0))
  let offset = 0
  for (const value of arrays) {
    output.set(value, offset)
    offset += value.length
  }
  return output
}

function decodeBase64Url(value) {
  const base64 = String(value || '').replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
  return Uint8Array.from(binary, char => char.charCodeAt(0))
}

function encodeBase64Url(value) {
  let binary = ''
  for (const octet of new Uint8Array(value)) binary += String.fromCharCode(octet)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

async function hmac(keyBytes, data) {
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, data))
}

async function hkdfExpand(prk, info, length) {
  return (await hmac(prk, bytes(info, new Uint8Array([1])))).slice(0, length)
}

async function encryptPayload(subscription, payload) {
  const receiverPublic = decodeBase64Url(subscription.keys.p256dh)
  const authSecret = decodeBase64Url(subscription.keys.auth)
  const receiverKey = await crypto.subtle.importKey(
    'raw',
    receiverPublic,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    [],
  )
  const senderKeys = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits'],
  )
  const senderPublic = new Uint8Array(await crypto.subtle.exportKey('raw', senderKeys.publicKey))
  const sharedSecret = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'ECDH', public: receiverKey },
    senderKeys.privateKey,
    256,
  ))

  const authPrk = await hmac(authSecret, sharedSecret)
  const keyInfo = bytes(encoder.encode('WebPush: info\0'), receiverPublic, senderPublic)
  const ikm = await hkdfExpand(authPrk, keyInfo, 32)
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const prk = await hmac(salt, ikm)
  const cek = await hkdfExpand(prk, encoder.encode('Content-Encoding: aes128gcm\0'), 16)
  const nonce = await hkdfExpand(prk, encoder.encode('Content-Encoding: nonce\0'), 12)
  const contentKey = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt'])
  const plaintext = bytes(encoder.encode(JSON.stringify(payload)), new Uint8Array([2]))
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce, tagLength: 128 },
    contentKey,
    plaintext,
  ))

  const recordSize = new Uint8Array(4)
  new DataView(recordSize.buffer).setUint32(0, 4096)
  return bytes(salt, recordSize, new Uint8Array([senderPublic.length]), senderPublic, ciphertext)
}

async function vapidAuthorization(endpoint, publicKey, privateKey) {
  const rawPublic = decodeBase64Url(publicKey)
  const x = encodeBase64Url(rawPublic.slice(1, 33))
  const y = encodeBase64Url(rawPublic.slice(33, 65))
  const signingKey = await crypto.subtle.importKey(
    'jwk',
    { kty: 'EC', crv: 'P-256', x, y, d: privateKey, ext: true, key_ops: ['sign'] },
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  )
  const header = encodeBase64Url(encoder.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })))
  const claims = encodeBase64Url(encoder.encode(JSON.stringify({
    aud: new URL(endpoint).origin,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: 'mailto:hello@bloomjuniors.com',
  })))
  const unsigned = `${header}.${claims}`
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    signingKey,
    encoder.encode(unsigned),
  )
  return `vapid t=${unsigned}.${encodeBase64Url(signature)}, k=${publicKey}`
}

export async function sendWebPush(subscription, payload, env) {
  const publicKey = String(env.VAPID_PUBLIC_KEY || '')
  const privateKey = String(env.VAPID_PRIVATE_KEY || '')
  if (!publicKey || !privateKey) return { ok: false, expired: false, status: 503 }

  const body = await encryptPayload(subscription, payload)
  const authorization = await vapidAuthorization(subscription.endpoint, publicKey, privateKey)
  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      Authorization: authorization,
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      TTL: '86400',
      Urgency: 'normal',
    },
    body,
  })
  return {
    ok: response.ok,
    expired: response.status === 404 || response.status === 410,
    status: response.status,
  }
}
