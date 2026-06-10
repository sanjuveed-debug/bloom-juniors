import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { getCached, setCached } from '../lib/ttsCache'
import { VoiceContext } from '../contexts/VoiceContext'

function preprocessText(text) {
  if (!text) return ''
  return text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ' ')
    .replace(/&/g, ' and ')
    .replace(/[!]{2,}/g, '!')
    .replace(/[?]{2,}/g, '?')
    .replace(/\.{3,}/g, '. ')
    .replace(/–|—/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.!?])/g, '$1')
    .trim()
}

const MOOD_RATE = {
  celebrate: 0,
  instruct: -8,
  phonics: -15,
  story: -16,
  question: -8,
  guide: -10,
}

const AZURE_VOICE = 'en-GB-LibbyNeural'
const AZURE_VOICE_GB = 'en-GB-LibbyNeural'

async function fetchAzureTTS(text, ratePercent, voice = AZURE_VOICE, ssmlInner = null) {
  const cacheKey = `v4|${voice}|${ratePercent}|${ssmlInner ?? text}`
  const cached = await getCached(cacheKey)
  if (cached) return cached

  const resp = await fetch('/api/tts?v=4', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice, rate: ratePercent, ...(ssmlInner ? { ssmlInner } : {}) }),
  })

  if (!resp.ok) {
    const body = await resp.text().catch(() => '')
    console.error('[TTS]', resp.status, body.slice(0, 300))
    throw new Error(`TTS ${resp.status}: ${body.slice(0, 100)}`)
  }

  const contentType = resp.headers.get('content-type') || ''
  if (!contentType.includes('audio')) throw new Error('TTS returned non-audio response')

  const blob = await resp.blob()
  setCached(cacheKey, blob)
  return blob
}

function getPreferredSpeechLang() {
  const lang = (navigator.language || 'en-US').toLowerCase()
  return lang.startsWith('en') ? lang : 'en-us'
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false)
  const [listening, setListening] = useState(false)
  const defaultVoice = useContext(VoiceContext)

  const recognitionRef = useRef(null)
  const isMounted = useRef(true)
  const audioRef = useRef(null)
  const pendingRef = useRef(null)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
      pendingRef.current = null
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current = null
      }
      recognitionRef.current?.stop?.()
      window.speechSynthesis?.cancel()
    }
  }, [])

  const stopSpeaking = useCallback(() => {
    pendingRef.current = null
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    window.speechSynthesis?.cancel()
    setSpeaking(false)
  }, [])

  // No-op kept for API compatibility — Azure speak() handles its own iOS priming
  const primeSpeech = useCallback(() => {}, [])

  const speak = useCallback((text, options = {}) => {
    const { queue = false, mood, rate: rateOverride, voice: voiceOverride, ssmlInner = null } = options

    if (queue && audioRef.current && !audioRef.current.paused && !audioRef.current.ended) {
      pendingRef.current = { text, options: { mood, rate: rateOverride, voice: voiceOverride, ssmlInner } }
      return
    }

    pendingRef.current = null
    stopSpeaking()
    const prepared = preprocessText(text)
    if (!prepared) return
    const moodRatePercent = mood ? (MOOD_RATE[mood] ?? 0) : 0
    const overridePercent = rateOverride != null ? Math.round((rateOverride - 1) * 100) : null
    const ratePercent = overridePercent ?? moodRatePercent
    const voice = voiceOverride === 'gb' ? AZURE_VOICE_GB : (voiceOverride || defaultVoice || AZURE_VOICE)

    // iOS Safari: gesture activation must be registered on the element via .play()
    // before the async fetch resolves. Empty src rejects immediately — that's expected.
    const audio = new Audio()
    audio.play().catch(() => {})
    audioRef.current = audio

    fetchAzureTTS(prepared, ratePercent, voice, ssmlInner)
      .then((blob) => {
        if (!isMounted.current || audioRef.current !== audio) return
        const url = URL.createObjectURL(blob)
        audio.src = url
        audio.load()
        audio.onplay = () => setSpeaking(true)
        audio.onended = () => {
          URL.revokeObjectURL(url)
          if (audioRef.current === audio) audioRef.current = null
          setSpeaking(false)
          const pending = pendingRef.current
          if (pending) {
            pendingRef.current = null
            speak(pending.text, pending.options)
          }
        }
        audio.onerror = () => {
          URL.revokeObjectURL(url)
          if (audioRef.current === audio) audioRef.current = null
          setSpeaking(false)
        }
        audio.play().catch(() => {
          URL.revokeObjectURL(url)
          if (audioRef.current === audio) audioRef.current = null
          setSpeaking(false)
        })
      })
      .catch(() => {
        if (audioRef.current === audio) audioRef.current = null
        setSpeaking(false)
      })
  }, [stopSpeaking, defaultVoice])

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
    recognition.onresult = (event) => {
      const results = Array.from(event.results[0]).map((r) => r.transcript.toLowerCase().trim())
      onResult(results)
    }
    recognition.onerror = () => { setListening(false); onEnd?.() }
    recognitionRef.current = recognition
    recognition.start()
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  return { speak, stopSpeaking, listen, stopListening, speaking, listening, primeSpeech }
}
