export function normalizePushSubscription(value) {
  const source = value && typeof value === 'object' ? value : {}
  const endpoint = String(source.endpoint || '').slice(0, 2048)
  const p256dh = String(source.keys?.p256dh || '').slice(0, 256)
  const auth = String(source.keys?.auth || '').slice(0, 128)
  if (!endpoint.startsWith('https://') || !p256dh || !auth) return null
  return { endpoint, expirationTime: source.expirationTime || null, keys: { p256dh, auth } }
}
