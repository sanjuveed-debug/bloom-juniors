import test from 'node:test'
import assert from 'node:assert/strict'
import { onRequestPost as portal } from '../functions/api/stripe-portal.js'
import { onRequestPost as checkout } from '../functions/api/stripe-checkout.js'

const owner = '11111111-1111-4111-8111-111111111111'
const other = '22222222-2222-4222-8222-222222222222'
const env = { SUPABASE_URL: 'https://database.invalid', SUPABASE_SERVICE_ROLE_KEY: 'mock-service', STRIPE_SECRET_KEY: 'mock-stripe', STRIPE_PRICE_ID: 'price_mock' }
async function exercise(handler, { token = 'mock-user', body = {}, authStatus = 200, authThrows = false, stripeStatus = 200 } = {}) {
  const calls = [], original = globalThis.fetch
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options })
    if (String(url).includes('/auth/v1/user')) {
      if (authThrows) throw new Error('service unavailable')
      return Response.json({ id: owner, email: 'owner@example.test' }, { status: authStatus })
    }
    if (String(url).includes('/rest/v1/')) return Response.json([{ stripe_customer_id: 'cus_owner' }])
    if (String(url).startsWith('https://api.stripe.com/')) return Response.json({ url: 'https://billing.stripe.com/test-session' }, { status: stripeStatus })
    throw new Error(`Unexpected mocked request: ${url}`)
  }
  try {
    const request = new Request('https://bloomjuniors.com/api/billing-test', {
      method: 'POST', headers: { Origin: 'https://bloomjuniors.com', 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    })
    const response = await handler({ request, env })
    return { response, calls }
  } finally { globalThis.fetch = original }
}
for (const [name, handler] of [['portal', portal], ['checkout', checkout]]) {
  test(`${name}: anonymous caller cannot select an account`, async () => {
    const { response, calls } = await exercise(handler, { token: '', body: { userId: other, email: 'other@example.test' } })
    assert.equal(response.status, 401)
    assert.equal(calls.length, 0)
  })
  test(`${name}: invalid session is rejected before database or Stripe access`, async () => {
    const { response, calls } = await exercise(handler, { authStatus: 401, body: { userId: owner, email: 'owner@example.test' } })
    assert.equal(response.status, 401)
    assert.equal(calls.length, 1)
    assert.match(calls[0].url, /auth\/v1\/user$/)
  })
  test(`${name}: authenticated caller cannot name another account`, async () => {
    const { response, calls } = await exercise(handler, { body: { userId: other, email: 'other@example.test' } })
    assert.equal(response.status, 403)
    assert.equal(calls.length, 1)
  })
  test(`${name}: ownership is derived from the verified user`, async () => {
    const { response, calls } = await exercise(handler, { body: { email: 'other@example.test' } })
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('Cache-Control'), 'no-store')
    assert.equal(calls[0].options.headers.Authorization, 'Bearer mock-user')
    const stripe = calls.find(call => call.url.startsWith('https://api.stripe.com/'))
    assert.ok(stripe)
    const params = new URLSearchParams(stripe.options.body)
    if (name === 'checkout') {
      assert.equal(params.get('client_reference_id'), owner)
      assert.equal(params.get('customer_email'), 'owner@example.test')
    } else {
      assert.ok(calls.some(call => call.url.includes(`user_id=eq.${owner}`)))
      assert.equal(params.get('customer'), 'cus_owner')
    }
  })
  test(`${name}: auth outage fails closed`, async () => {
    const { response, calls } = await exercise(handler, { authThrows: true })
    assert.equal(response.status, 503)
    assert.equal(calls.length, 1)
  })
  test(`${name}: malformed body is rejected`, async () => {
    const { response } = await exercise(handler, { body: null })
    assert.equal(response.status, 400)
  })
  test(`${name}: Stripe failure does not return a portal or checkout URL`, async () => {
    const { response } = await exercise(handler, { stripeStatus: 500 })
    assert.equal(response.status, 502)
    assert.equal((await response.json()).url, undefined)
  })
}
