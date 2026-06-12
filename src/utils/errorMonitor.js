// Global error reporter: posts uncaught errors and unhandled promise
// rejections to /api/error-report (which emails the founder).
// Deduped per message, capped per session so a render loop can't spam.

const seen = new Set()
let sent = 0
const MAX_PER_SESSION = 3

function report(kind, message, stack) {
  try {
    const msg = String(message || 'unknown').slice(0, 300)
    if (sent >= MAX_PER_SESSION || seen.has(msg)) return
    seen.add(msg)
    sent += 1
    fetch('/api/error-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind,
        message: msg,
        stack: String(stack || '').slice(0, 1500),
        url: location.href,
        userAgent: navigator.userAgent,
        at: new Date().toISOString(),
      }),
      keepalive: true,
    }).catch(() => {})
  } catch {}
}

export function initErrorMonitor() {
  if (typeof window === 'undefined') return
  window.addEventListener('error', (e) => {
    // Ignore noisy cross-origin "Script error." with no detail
    if (e.message === 'Script error.' && !e.filename) return
    report('error', e.message, e.error?.stack)
  })
  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason
    report('unhandledrejection', reason?.message || String(reason), reason?.stack)
  })
}
