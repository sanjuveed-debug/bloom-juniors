export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

export async function authenticateFounder(request, env) {
  const supabaseUrl = String(env.SUPABASE_URL || '').replace(/\/$/, '')
  const serviceKey = String(env.SUPABASE_SERVICE_ROLE_KEY || '')
  if (!supabaseUrl || !serviceKey) return { error: json({ error: 'Founder tools are not configured' }, 503) }

  const authorization = request.headers.get('Authorization') || ''
  if (!authorization.startsWith('Bearer ')) return { error: json({ error: 'Authentication required' }, 401) }
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: authorization, apikey: serviceKey },
  })
  if (!response.ok) return { error: json({ error: 'Authentication required' }, 401) }
  const user = await response.json().catch(() => null)
  if (!user?.id || !user?.email) return { error: json({ error: 'Authentication required' }, 401) }

  const configured = String(env.FOUNDER_EMAILS || 'sanjuveed@gmail.com,sanju.veed@gmail.com')
    .toLowerCase()
    .split(',')
    .map(email => email.trim())
    .filter(Boolean)
  if (!configured.includes(String(user.email).toLowerCase())) {
    return { error: json({ error: 'Founder access required' }, 403) }
  }
  return { user, supabaseUrl, serviceKey }
}

export async function readRows(url, serviceKey, table, select) {
  const response = await fetch(
    `${url}/rest/v1/${table}?select=${encodeURIComponent(select)}&limit=5000`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
  )
  if (!response.ok) throw new Error(`Could not read ${table}: ${response.status}`)
  const rows = await response.json().catch(() => [])
  return Array.isArray(rows) ? rows : []
}

export async function readAuthUsers(url, serviceKey) {
  const response = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=1000`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  })
  if (!response.ok) throw new Error(`Could not read auth users: ${response.status}`)
  const body = await response.json().catch(() => ({}))
  return (Array.isArray(body?.users) ? body.users : []).map(user => ({
    id: user.id,
    created_at: user.created_at,
    email: user.email,
    user_metadata: user.user_metadata && typeof user.user_metadata === 'object' ? user.user_metadata : {},
  }))
}
