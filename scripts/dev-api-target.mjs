export function resolveDevApiTarget(value = '') {
  if (!value.trim()) return null
  const url = new URL(value)
  if (!['http:', 'https:'].includes(url.protocol)
    || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
    || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('BLOOM_DEV_API_TARGET must be a local backend origin, such as http://127.0.0.1:8788')
  }
  return url.origin
}
