// Serializes writes within a profile. Persist before debounce: closing a page
// must never be the only opportunity to retain an unsent update.
export function createProgressSyncQueue({ save, persist, clear, onSuccess = () => {}, onError = () => {},
  setTimer = setTimeout, cancelTimer = clearTimeout, delay = 2000,
  wait = ms => new Promise(resolve => setTimeout(resolve, ms)), retryDelay = 1500 }) {
  let pending = null
  let timer = null
  let running = null
  let disposed = false
  const cancel = () => { if (timer !== null) cancelTimer(timer); timer = null }

  function schedule(data) {
    if (disposed) return
    pending = data
    persist(data)
    cancel()
    timer = setTimer(() => { timer = null; void flush() }, delay)
  }

  function flush() {
    cancel()
    if (running) return running
    if (!pending) return Promise.resolve()
    running = (async () => {
      while (pending) {
        const sending = pending
        let saved = false
        for (let attempt = 0; attempt < 3; attempt++) {
          try { await save(sending); saved = true; break } catch {
            if (disposed || pending !== sending || attempt === 2) break
            await wait(retryDelay)
          }
        }
        if (saved) {
          if (pending === sending) {
            pending = null
            // Only acknowledge this exact snapshot. Another tab may have
            // persisted newer work while the request was in flight.
            const acknowledged = clear(sending)
            if (!disposed && acknowledged !== false) onSuccess()
          }
        } else if (pending === sending) {
          if (!disposed) onError()
          break // Retained for online retry or next hydration.
        }
      }
    })().finally(() => { running = null })
    return running
  }

  function dispose() {
    disposed = true
    cancel()
    // Best effort upload, backed by the already durable outbox.
    return flush()
  }
  return { schedule, flush, dispose }
}
