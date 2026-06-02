import { useCallback, useEffect, useRef } from 'react'

/**
 * Shared visibility-lifecycle hook for timer-bearing components.
 *
 * - timersRef   : array of pending timeout IDs (auto-cleared on hide + unmount)
 * - track(fn,ms): schedule a self-cleaning tracked timeout
 * - clearAll()  : cancel all pending timers immediately
 * - pausedAtRef : Date.now() when the tab was hidden, null while visible
 * - hiddenDurationRef: cumulative ms spent in background (for countdown reconciliation)
 */
export function useVisibilityTimers() {
  const timersRef       = useRef([])
  const pausedAtRef     = useRef(null)
  const hiddenDurationRef = useRef(0)

  // Clear timers on unmount
  useEffect(() => () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  // Clear timers on visibility hide; track hidden duration for resume reconciliation
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        pausedAtRef.current = Date.now()
        timersRef.current.forEach(clearTimeout)
        timersRef.current = []
      } else if (pausedAtRef.current !== null) {
        hiddenDurationRef.current += Date.now() - pausedAtRef.current
        pausedAtRef.current = null
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const track = useCallback((fn, delay) => {
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter(t => t !== id)
      fn()
    }, delay)
    timersRef.current.push(id)
    return id
  }, [])

  const clearAll = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  return { timersRef, track, clearAll, pausedAtRef, hiddenDurationRef }
}
