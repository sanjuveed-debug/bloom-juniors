const textEncoder = new TextEncoder()

function base64UrlEncode(bytes) {
  const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('')
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64UrlDecode(value) {
  const padded = `${value}${'='.repeat((4 - value.length % 4) % 4)}`
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  const binary = atob(padded)
  return Uint8Array.from(binary, char => char.charCodeAt(0))
}

async function hmac(secret, payload) {
  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, textEncoder.encode(payload))
  return base64UrlEncode(new Uint8Array(signature))
}

export async function signClassSession(secret, payload) {
  const encodedPayload = base64UrlEncode(textEncoder.encode(JSON.stringify(payload)))
  const signature = await hmac(secret, encodedPayload)
  return `${encodedPayload}.${signature}`
}

export async function verifyClassSession(secret, token) {
  const [encodedPayload, signature] = String(token || '').split('.')
  if (!encodedPayload || !signature) return null

  const expected = await hmac(secret, encodedPayload)
  if (expected !== signature) return null

  let payload = null
  try {
    payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(encodedPayload)))
  } catch {
    return null
  }

  if (!payload?.profileId || !payload?.classId || !payload?.schoolId) return null
  if (Number(payload.exp || 0) < Math.floor(Date.now() / 1000)) return null
  return payload
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    },
  })
}

export function cors(methods = 'GET, POST, OPTIONS') {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': methods,
      'Access-Control-Allow-Headers': 'Content-Type, X-Class-Session',
    },
  })
}
