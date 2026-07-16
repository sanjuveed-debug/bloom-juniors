import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { VoiceContext } from '../contexts/VoiceContext'
import { speechController } from '../lib/speechController.js'

function getPreferredSpeechLang() {
  const lang = (navigator.language || 'en-US').toLowerCase()
  return lang.startsWith('en') ? lang : 'en-us'
}

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false)
  const [listening, setListening] = useState(false)
  const defaultVoice = useContext(VoiceContext)
  const ownerRef = useRef(Symbol('speech-owner'))
  const recognitionRef = useRef(null)

  useEffect(() => {
    const unsubscribe = speechController.subscribe(state => {
      if (state.owner === ownerRef.current) setSpeaking(Boolean(state.speaking || state.loading))
    })
    return () => {
      unsubscribe()
      speechController.release(ownerRef.current)
      recognitionRef.current?.stop?.()
    }
  }, [])

  const speak = useCallback((text, options = {}) => {
    speechController.speak(ownerRef.current, text, {
      ...options,
      voice: options.voice === 'gb' ? 'gb' : (options.voice || defaultVoice),
    })
  }, [defaultVoice])

  const stopSpeaking = useCallback(() => speechController.stopAll('manual'), [])
  const primeSpeech = useCallback(() => speechController.prime(), [])

  const listen = useCallback((onResult, onEnd) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    const recognition = new SpeechRecognition()
    recognition.lang = getPreferredSpeechLang()
    recognition.interimResults = false
    recognition.maxAlternatives = 3
    recognition.continuous = false
    recognition.onstart = () => setListening(true)
    recognition.onend = () => { setListening(false); onEnd?.() }
    recognition.onresult = event => {
      const results = Array.from(event.results[0]).map(result => result.transcript.toLowerCase().trim())
      onResult(results)
    }
    recognition.onerror = () => { setListening(false); onEnd?.() }
    recognitionRef.current = recognition
    recognition.start()
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop?.()
    setListening(false)
  }, [])

  return { speak, stopSpeaking, listen, stopListening, speaking, listening, primeSpeech }
}
