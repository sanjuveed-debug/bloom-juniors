// Creates a Stripe Customer Portal session so parents can manage/cancel
// their subscription. Env vars: STRIPE_SECRET_KEY, SUPABASE_URL,
// SUPABASE_SERVICE_ROLE_KEY.

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
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function onRequestPost(context) {
  const { request, env } = context

  const origin = request.headers.get('Origin') || ''
  if (!isAllowedOrigin(origin)) return new Response('Forbidden', { status: 403 })

  const secretKey = String(env.STRIPE_SECRET_KEY || '').trim()
  const supabaseUrl = (env.SUPABASE_URL || '').trim()
  const serviceKey = (env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  if (!secretKey || !supabaseUrl || !serviceKey) return json({ error: 'Not configured' }, 503)

  let body
  try { body = await request.json() } catch { return json({ error: 'Invalid request' }, 400) }
  const userId = String(body.userId || '').trim()
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return json({ error: 'Sign in required' }, 401)

  // Look up the guardian's Stripe customer id
  const resp = await fetch(
    `${supabaseUrl}/rest/v1/guardian_profiles?user_id=eq.${encodeURIComponent(userId)}&select=stripe_customer_id&limit=1`,
    { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } },
  )
  if (!resp.ok) return json({ error: 'Lookup failed' }, 502)
  const rows = await resp.json()
  const customerId = rows?.[0]?.stripe_customer_id
  if (!customerId) return json({ error: 'No subscription found' }, 404)

  const portal = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      customer: customerId,
      return_url: 'https://bloomjuniors.com/',
    }).toString(),
  })
  const session = await portal.json()
  if (!portal.ok || !session.url) {
    console.error('[stripe-portal]', portal.status, JSON.stringify(session).slice(0, 200))
    return json({ error: 'Could not open billing portal' }, 502)
  }
  return json({ url: session.url })
}
