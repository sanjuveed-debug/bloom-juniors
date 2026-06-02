import { useCallback, useMemo } from 'react'

const PATTERNS = {
  tap: 10,
  correct: 50,
  wrong: [50, 60, 50],
  star: [30, 40, 30, 40, 30],
  levelUp: 200,
  error: [80, 40, 80],
}

function safeVibrate(pattern) {
  if (typeof navigator === 'undefined') return false
  if (typeof navigator.vibrate !== 'function') return false
  try {
    return navigator.vibrate(pattern) === true
  } catch {
    return false
  }
}

export function useHaptic() {
  const supported = useMemo(() => {
    if (typeof navigator === 'undefined') return false
    return typeof navigator.vibrate === 'function'
  }, [])

  const vibrate = useCallback((pattern) => {
    if (!pattern) return false
    const resolved = typeof pattern === 'string' ? PATTERNS[pattern] : pattern
    if (resolved == null) return false
    return safeVibrate(resolved)
  }, [])

  const tap = useCallback(() => safeVibrate(PATTERNS.tap), [])
  const correct = useCallback(() => safeVibrate(PATTERNS.correct), [])
  const wrong = useCallback(() => safeVibrate(PATTERNS.wrong), [])
  const star = useCallback(() => safeVibrate(PATTERNS.star), [])
  const levelUp = useCallback(() => safeVibrate(PATTERNS.levelUp), [])

  return { supported, vibrate, tap, correct, wrong, star, levelUp }
}

export function triggerHaptic(pattern) {
  const resolved = typeof pattern === 'string' ? PATTERNS[pattern] : pattern
  if (resolved == null) return false
  return safeVibrate(resolved)
}

export default useHaptic
