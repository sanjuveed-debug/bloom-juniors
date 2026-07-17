function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

function cleanPin(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 4)
}

function constantTimeEqual(left, right) {
  const a = String(left || '')
  const b = String(right || '')
  let mismatch = a.length ^ b.length
  const length = Math.max(a.length, b.length)
  for (let index = 0; index < length; index += 1) {
    mismatch |= (a.charCodeAt(index) || 0) ^ (b.charCodeAt(index) || 0)
  }
  return mismatch === 0
}

async function authenticatedUser(request, supabaseUrl, serviceKey) {
  const authorization = request.headers.get('Authorization') || ''
  if (!authorization.startsWith('Bearer ')) return null
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: authorization, apikey: serviceKey },
  })
  if (!response.ok) return null
  const user = await response.json().catch(() => null)
  return user?.id ? user : null
}

export async function onRequestPost({ request, env }) {
  const supabaseUrl = String(env.SUPABASE_URL || '').replace(/\/$/, '')
  const serviceKey = String(env.SUPABASE_SERVICE_ROLE_KEY || '')
  if (!supabaseUrl || !serviceKey) return json({ error: 'Service not configured' }, 503)

  const user = await authenticatedUser(request, supabaseUrl, serviceKey)
  if (!user) return json({ error: 'Authentication required' }, 401)

  let body = {}
  try { body = await request.json() } catch {}
  const action = String(body.action || 'verify')
  const pin = cleanPin(body.pin)
  if (pin.length !== 4) return json({ error: 'PIN must be four digits' }, 400)

  const headers = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey }
  if (action === 'set') {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/guardian_profiles?user_id=eq.${encodeURIComponent(user.id)}`,
      {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ parent_pin: pin, updated_at: new Date().toISOString() }),
      },
    )
    if (!response.ok) return json({ error: 'Could not update PIN' }, 502)
    return json({ ok: true })
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/guardian_profiles?user_id=eq.${encodeURIComponent(user.id)}&select=parent_pin&limit=1`,
    { headers },
  )
  if (!response.ok) return json({ error: 'Could not verify PIN' }, 502)
  const rows = await response.json().catch(() => [])
  const storedPin = Array.isArray(rows) ? rows[0]?.parent_pin : null
  return json({ ok: true, valid: constantTimeEqual(storedPin, pin) })
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  })
}
