import { useEffect, useState } from 'react'

// Modules are mounted underneath the arrival card. Automatic narration waits
// for the child's explicit Play gesture and can fire again on a later visit.
export function useModuleStart(moduleId) {
  const [startSignal, setStartSignal] = useState(0)

  useEffect(() => {
    const onStarted = (event) => {
      if (event?.detail?.moduleId === moduleId) setStartSignal(value => value + 1)
    }
    window.addEventListener('bloom:module-started', onStarted)
    return () => window.removeEventListener('bloom:module-started', onStarted)
  }, [moduleId])

  return startSignal
}
