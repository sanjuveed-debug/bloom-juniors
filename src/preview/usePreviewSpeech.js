import { useCallback, useEffect, useState } from 'react'
// Device speech only in this isolated preview. Production keeps its own hook.
export function useSpeech() {
  const [speaking, setSpeaking] = useState(false)
  const stopSpeaking = useCallback(() => { window.speechSynthesis?.cancel(); setSpeaking(false) }, [])
  useEffect(() => () => window.speechSynthesis?.cancel(), [])
  const speak = useCallback((text, options = {}) => {
    window.speechSynthesis?.cancel()
    if (!window.speechSynthesis) { options.onEnd?.(); return }
    const utterance = new SpeechSynthesisUtterance(String(text).replace(/[\u{1F300}-\u{1FAFF}]/gu, ''))
    utterance.lang = 'en-GB'
    utterance.rate = options.rate || 0.85
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => { setSpeaking(false); options.onEnd?.() }
    utterance.onerror = () => { setSpeaking(false); options.onEnd?.() }
    window.speechSynthesis.speak(utterance)
  }, [])
  return { speak, stopSpeaking, speaking, listening: false, primeSpeech: () => {}, listen: (_result, end) => end?.(), stopListening: () => {} }
}
