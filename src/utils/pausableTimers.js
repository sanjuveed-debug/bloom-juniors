// Preserve feedback transitions while a child switches apps or locks a tablet.
export function createPausableTimers({ now = Date.now, schedule = setTimeout, cancel = clearTimeout } = {}) {
  const pending = new Set()
  let paused = false
  function arm(timer) {
    timer.started = now()
    timer.id = schedule(() => {
      pending.delete(timer)
      timer.fn()
    }, timer.remaining)
  }
  return {
    track(fn, delay) {
      const timer = { fn, remaining: Math.max(0, delay), id: null, started: now() }
      pending.add(timer)
      if (!paused) arm(timer)
      return timer
    },
    pause() {
      if (paused) return
      paused = true
      for (const timer of pending) {
        cancel(timer.id)
        timer.remaining = Math.max(0, timer.remaining - (now() - timer.started))
      }
    },
    resume() {
      if (!paused) return
      paused = false
      for (const timer of pending) arm(timer)
    },
    clearAll() {
      for (const timer of pending) cancel(timer.id)
      pending.clear()
    },
  }
}
