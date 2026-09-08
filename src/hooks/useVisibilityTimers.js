import { useEffect, useRef } from 'react'
import { createPausableTimers } from '../utils/pausableTimers'

export function useVisibilityTimers() {
  const scheduler = useRef(null)
  if (!scheduler.current) scheduler.current = createPausableTimers()
  useEffect(() => {
    const timers = scheduler.current
    const sync = () => document.hidden ? timers.pause() : timers.resume()
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => {
      document.removeEventListener('visibilitychange', sync)
      timers.clearAll()
    }
  }, [])
  return scheduler.current
}
