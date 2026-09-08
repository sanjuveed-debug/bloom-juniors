import test from 'node:test'
import assert from 'node:assert/strict'
import { createHmac, webcrypto } from 'node:crypto'
import { onRequestPost } from '../functions/api/stripe-webhook.js'

for (const type of ['checkout.session.completed', 'customer.subscription.updated', 'customer.subscription.deleted', 'invoice.payment_failed']) {
  for (const outcome of ['success', 'database-error', 'network-error', 'missing-row']) {
    test(`${type}: ${outcome} is acknowledged only after a persisted update`, async () => {
      const previousFetch = globalThis.fetch, previousCrypto = globalThis.crypto
      globalThis.crypto = webcrypto
      globalThis.fetch = async () => {
        if (outcome === 'network-error') throw new Error('offline')
        return Response.json(outcome === 'missing-row' ? [] : [{ user_id: 'test-owner' }], { status: outcome === 'database-error' ? 500 : 200 })
      }
      try {
        const secret = 'test-only-webhook-secret', t = Math.floor(Date.now() / 1000)
        const payload = JSON.stringify({ type, data: { object: { client_reference_id: 'test-owner', customer: 'cus_test', subscription: 'sub_test', status: 'active' } } })
        const signature = createHmac('sha256', secret).update(`${t}.${payload}`).digest('hex')
        const response = await onRequestPost({ request: new Request('https://example.test', { method: 'POST', body: payload, headers: { 'Stripe-Signature': `t=${t},v1=${signature}` } }), env: { STRIPE_WEBHOOK_SECRET: secret, SUPABASE_URL: 'https://database.invalid', SUPABASE_SERVICE_ROLE_KEY: 'test-only' } })
        assert.equal(response.status, outcome === 'success' ? 200 : 503)
        assert.equal((await response.json()).received, outcome === 'success' ? true : undefined)
      } finally { globalThis.fetch = previousFetch; globalThis.crypto = previousCrypto }
    })
  }
}
