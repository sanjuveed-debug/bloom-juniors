// Stripe webhook: keeps guardian_profiles.premium_status in sync.
// Configure in the Stripe dashboard: endpoint https://bloomjuniors.com/api/stripe-webhook
// with events: checkout.session.completed, customer.subscription.updated,
// customer.subscription.deleted, invoice.payment_failed.
// Env vars: STRIPE_WEBHOOK_SECRET (whsec_...), SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// Verify Stripe-Signature: t=...,v1=... where v1 = HMAC-SHA256(`${t}.${payload}`, secret)
async function verifyStripeSignature(payload, header, secret) {
  if (!header) return false
  const parts = Object.fromEntries(
    header.split(',').map(kv => kv.split('=').map(s => s.trim())).filter(p => p.length === 2),
  )
  const t = parts.t
  const v1 = parts.v1
  if (!t || !v1) return false
  // Reject stale events (>10 min) to limit replay
  if (Math.abs(Date.now() / 1000 - Number(t)) > 600) return false

  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(`${t}.${payload}`))
  const expected = [...new Uint8Array(mac)].map(b => b.toString(16).padStart(2, '0')).join('')
  if (expected.length !== v1.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ v1.charCodeAt(i)
  return diff === 0
}

async function patchGuardian(env, filter, fields) {
  const supabaseUrl = (env.SUPABASE_URL || '').trim()
  const serviceKey = (env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  if (!supabaseUrl || !serviceKey) return false

  const resp = await fetch(`${supabaseUrl}/rest/v1/guardian_profiles?${filter}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(fields),
  })
  if (!resp.ok) console.error('[stripe-webhook] supabase patch failed', resp.status, filter)
  return resp.ok
}

export async function onRequestPost(context) {
  const { request, env } = context
  const secret = String(env.STRIPE_WEBHOOK_SECRET || '').trim()
  if (!secret) return json({ error: 'Webhook not configured' }, 503)

  const payload = await request.text()
  const ok = await verifyStripeSignature(payload, request.headers.get('Stripe-Signature'), secret)
  if (!ok) return json({ error: 'Invalid signature' }, 400)

  let event
  try { event = JSON.parse(payload) } catch { return json({ error: 'Bad payload' }, 400) }

  const obj = event.data?.object || {}

  switch (event.type) {
    case 'checkout.session.completed': {
      const userId = obj.client_reference_id
      if (userId) {
        await patchGuardian(env, `user_id=eq.${encodeURIComponent(userId)}`, {
          premium_status: 'active',
          stripe_customer_id: obj.customer || null,
          stripe_subscription_id: obj.subscription || null,
          premium_since: new Date().toISOString(),
        })
      }
      break
    }
    case 'customer.subscription.updated': {
      const status = obj.status === 'active' || obj.status === 'trialing' ? 'active'
        : obj.status === 'past_due' ? 'past_due'
        : 'canceled'
      if (obj.customer) {
        await patchGuardian(env, `stripe_customer_id=eq.${encodeURIComponent(obj.customer)}`, {
          premium_status: status,
        })
      }
      break
    }
    case 'customer.subscription.deleted': {
      if (obj.customer) {
        await patchGuardian(env, `stripe_customer_id=eq.${encodeURIComponent(obj.customer)}`, {
          premium_status: 'canceled',
        })
      }
      break
    }
    case 'invoice.payment_failed': {
      if (obj.customer) {
        await patchGuardian(env, `stripe_customer_id=eq.${encodeURIComponent(obj.customer)}`, {
          premium_status: 'past_due',
        })
      }
      break
    }
    default:
      break
  }

  return json({ received: true })
}
