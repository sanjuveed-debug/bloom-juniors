import { authenticateBilling } from './_billing-auth.js'

// Creates a Stripe Checkout Session (subscription) for the signed-in guardian.
// Env vars (Cloudflare Pages → Settings → Environment variables):
//   STRIPE_SECRET_KEY  — sk_live_... / sk_test_...
//   STRIPE_PRICE_ID    — price_... (AED monthly price created in the Stripe dashboard)

const ALLOWED_ORIGINS = [
  'https://bloomjuniors.com',
  'https://www.bloomjuniors.com',
  'http://localhost:5173',
  'http://localhost:4173',
]

function isAllowedOrigin(origin) {
  if (!origin) return false
  if (ALLOWED_ORIGINS.includes(origin)) return true
  return /^https:\/\/[a-z0-9-]+\.bloom-juniors\.pages\.dev$/.test(origin)
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

export async function onRequestPost(context) {
  const { request, env } = context

  const origin = request.headers.get('Origin') || ''
  if (!isAllowedOrigin(origin)) return new Response('Forbidden', { status: 403 })

  const secretKey = String(env.STRIPE_SECRET_KEY || '').trim()
  const priceId = String(env.STRIPE_PRICE_ID || '').trim()
  if (!secretKey || !priceId) return json({ error: 'Payments not configured yet' }, 503)

  let body
  try { body = await request.json() } catch { return json({ error: 'Invalid request' }, 400) }

  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Invalid request' }, 400)
  const auth = await authenticateBilling(request, env)
  if (!auth.user) return json({ error: auth.error }, auth.status)
  const userId = auth.user.id
  if (body.userId && body.userId !== userId) return json({ error: 'Account mismatch' }, 403)
  const email = String(auth.user.email || '').trim()
  if (!email) return json({ error: 'Account email required' }, 400)


  const site = 'https://bloomjuniors.com'
  const params = new URLSearchParams({
    mode: 'subscription',
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    client_reference_id: userId,
    customer_email: email,
    success_url: `${site}/?premium=success`,
    cancel_url: `${site}/?premium=cancelled`,
    allow_promotion_codes: 'true',
  })

  const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  const session = await resp.json()
  if (!resp.ok || !session.url) {
    console.error('[stripe-checkout]', resp.status, 'Session creation failed')
    return json({ error: 'Could not start checkout. Try again shortly.' }, 502)
  }

  return json({ url: session.url })
}
