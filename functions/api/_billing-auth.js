// Billing identity must come from the auth server, never the request body.
export async function authenticateBilling(request, env) {
  const authorization = request.headers.get('Authorization') || ''
  if (!/^Bearer\s+\S+$/i.test(authorization)) return { status: 401, error: 'Sign in required' }
  const url = String(env.SUPABASE_URL || '').trim().replace(/\/$/, '')
  const key = String(env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  if (!url || !key) return { status: 503, error: 'Authentication not configured' }
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const response = await fetch(`${url}/auth/v1/user`, {
      headers: { Authorization: authorization, apikey: key }, signal: controller.signal,
    })
    if (!response.ok) return { status: response.status >= 500 ? 503 : 401, error: 'Unable to verify sign in' }
    const user = await response.json()
    if (!/^[0-9a-f-]{36}$/i.test(user?.id || '')) return { status: 401, error: 'Sign in required' }
    return { user }
  } catch {
    return { status: 503, error: 'Unable to verify sign in. Try again shortly.' }
  } finally {
    clearTimeout(timeout)
  }
}
