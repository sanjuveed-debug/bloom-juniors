import test from 'node:test'
import assert from 'node:assert/strict'
import { onRequestPost } from '../functions/api/parent-pin.js'

function request(pin, action = 'verify') {
  return new Request('https://bloomjuniors.com/api/parent-pin', {
    method: 'POST',
    headers: { Authorization: 'Bearer child-browser-session', 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, pin }),
  })
}

const env = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'server-secret' }

test('parent PIN is checked server-side and never returned to the browser', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url, options = {}) => {
    if (String(url).endsWith('/auth/v1/user')) {
      assert.equal(options.headers.Authorization, 'Bearer child-browser-session')
      return Response.json({ id: 'guardian-1' })
    }
    assert.match(String(url), /guardian_profiles/)
    assert.equal(options.headers.Authorization, 'Bearer server-secret')
    return Response.json([{ parent_pin: '1234' }])
  }

  try {
    const response = await onRequestPost({ request: request('1234'), env })
    const body = await response.json()
    assert.deepEqual(body, { ok: true, valid: true })
    assert.equal(JSON.stringify(body).includes('1234'), false)
    assert.equal(response.headers.get('Cache-Control'), 'no-store')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('wrong parent PIN returns only a boolean result', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url) => String(url).endsWith('/auth/v1/user')
    ? Response.json({ id: 'guardian-1' })
    : Response.json([{ parent_pin: '1234' }])

  try {
    const response = await onRequestPost({ request: request('9999'), env })
    assert.deepEqual(await response.json(), { ok: true, valid: false })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('parent PIN endpoint rejects requests without a valid cloud session', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response('no', { status: 401 })
  try {
    const response = await onRequestPost({ request: request('1234'), env })
    assert.equal(response.status, 401)
  } finally {
    globalThis.fetch = originalFetch
  }
})
