import { useEffect, useState } from 'react'
import { loadPremiumStatus } from '../services/cloudStore.js'

// Session-level cache so every screen doesn't refetch
let cached = null // null = not loaded yet, otherwise { premium: boolean }

// Returns { premium, loading }. Classroom accounts should bypass this check
// at the call site (school licence covers all content).
export function usePremium() {
  const [state, setState] = useState(cached || { premium: false, loading: cached === null })

  useEffect(() => {
    if (cached !== null) return
    let cancelled = false
    loadPremiumStatus()
      .then(status => {
        cached = { premium: status === 'active', loading: false }
        if (!cancelled) setState(cached)
      })
      .catch(() => {
        cached = { premium: false, loading: false }
        if (!cancelled) setState(cached)
      })
    return () => { cancelled = true }
  }, [])

  return state
}

// Call after a successful checkout return so the UI picks up the new status
export function clearPremiumCache() {
  cached = null
}
