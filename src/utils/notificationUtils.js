const TEXT      = '#422006'
const TEXT_FAINT = 'rgba(66,32,6,0.45)'

export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported'
  if (Notification.permission !== 'default') return Notification.permission
  return Notification.requestPermission()
}

// In-memory timer — lives as long as the page/tab is open.
// On Android Chrome PWA this is enough; the tab stays in the background.
let _timer = null

export function scheduleStreakReminder(childName, streak) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return
  cancelStreakReminder()

  const now   = new Date()
  const sixPM = new Date()
  sixPM.setHours(18, 0, 0, 0)
  if (now >= sixPM) return // already past 6 pm today

  const delay = sixPM.getTime() - now.getTime()
  _timer = setTimeout(() => {
    try {
      new Notification(`🔥 Don't break ${childName || 'your child'}'s streak!`, {
        body:  `${streak} day streak at risk — they haven't played yet today.`,
        icon:  '/bm-icon-192.png',
        badge: '/bm-icon-192.png',
        tag:   'bloom-streak-reminder',
      })
    } catch {}
  }, delay)
}

export function cancelStreakReminder() {
  if (_timer !== null) {
    clearTimeout(_timer)
    _timer = null
  }
}
