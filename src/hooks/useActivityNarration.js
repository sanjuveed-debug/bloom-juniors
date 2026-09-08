import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'bloom_activity_voice_v1'

// Speak meaningful scene changes, never pointer movement or every placed item.
export function useActivityNarration({ cue, text, speak, stopSpeaking, primeSpeech }) {
  const [enabled, setEnabled] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) !== 'off' } catch { return true }
  })
  const latest = useRef({ text, speak, primeSpeech })
  latest.current = { text, speak, primeSpeech }
  const replay = () => {
    latest.current.primeSpeech?.()
    latest.current.speak(latest.current.text)
  }
  useEffect(() => {
    if (!enabled) return
    let timer
    const start = () => {
      document.removeEventListener('pointerdown', start)
      document.removeEventListener('keydown', start)
      latest.current.primeSpeech?.()
      latest.current.speak(latest.current.text)
    }
    if (navigator.userActivation?.hasBeenActive) timer = setTimeout(start, 150)
    else {
      document.addEventListener('pointerdown', start, { once: true })
      document.addEventListener('keydown', start, { once: true })
    }
    return () => {
      clearTimeout(timer)
      document.removeEventListener('pointerdown', start)
      document.removeEventListener('keydown', start)
    }
  }, [cue, enabled])
  useEffect(() => () => stopSpeaking(), [stopSpeaking])
  const toggle = () => {
    stopSpeaking()
    const next = !enabled
    setEnabled(next)
    try { localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off') } catch { /* optional preference */ }
    if (next) latest.current.primeSpeech?.()
  }
  return { enabled, toggle, replay }
}
