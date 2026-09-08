self.addEventListener('push', event => {
  let data = {}
  try { data = event.data?.json() || {} } catch {
    data = { body: event.data?.text() || 'A new Bloom adventure is ready.' }
  }

  const title = String(data.title || 'Bloom Juniors')
  const options = {
    body: String(data.body || 'A new learning adventure is ready.'),
    icon: '/bj-192.png',
    badge: '/bj-192.png',
    tag: String(data.tag || 'bloom-return-reminder'),
    data: { url: String(data.url || '/?app=1&utm_source=return_push&utm_medium=push') },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const target = new URL(event.notification.data?.url || '/?app=1', self.location.origin).href
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    const existing = windows.find(client => new URL(client.url).origin === self.location.origin)
    if (existing) {
      await existing.navigate(target)
      return existing.focus()
    }
    return self.clients.openWindow(target)
  })())
})
