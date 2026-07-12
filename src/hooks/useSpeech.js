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

function browserVoiceFor(azureVoice) {
  const voices = window.speechSynthesis?.getVoices?.() || []
  const lang = azureVoice?.startsWith('en-US') ? 'en-US' : 'en-GB'
  const preferredNames = lang === 'en-US'
    ? ['Microsoft Ana Online', 'Microsoft Ana', 'Samantha', 'Google US English']
    : ['Microsoft Sonia Online', 'Microsoft Libby Online', 'Daniel', 'Google UK English Female']
  return preferredNames.map(name => voices.find(v => v.name.includes(name))).find(Boolean)
    || voices.find(v => v.lang?.toLowerCase() === lang.toLowerCase())
    || voices.find(v => v.lang?.toLowerCase().startsWith('en'))
}

// ─── Shared audio singleton ────────────────────────────────────────────────────
// iOS locks each Audio() element individually — it must be .play()-ed during a
// user gesture before it can play programmatically. By reusing ONE element across
// all speak() calls, a single gesture (e.g. tapping a letter) unlocks it for all
// subsequent auto-speak calls from useEffect / setTimeout.
let _sharedAudio = null
function getSharedAudio() {
  if (!_sharedAudio) _sharedAudio = new Audio()
  return _sharedAudio
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
  const browserUtteranceRef = useRef(null)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
      pendingRef.current = null
      const audio = getSharedAudio()
      audio.pause()
      audio.onplay = null
      audio.onended = null
      audio.onerror = null
      audioRef.current = null
      recognitionRef.current?.stop?.()
      window.speechSynthesis?.cancel()
      browserUtteranceRef.current = null
    }
  }, [])

  const stopSpeaking = useCallback(() => {
    pendingRef.current = null
    const audio = getSharedAudio()
    audio.pause()
    audio.onplay = null
    audio.onended = null
    audio.onerror = null
    audioRef.current = null
    window.speechSynthesis?.cancel()
    browserUtteranceRef.current = null
    setSpeaking(false)
  }, [])

  const primeSpeech = useCallback(() => {
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') return
    const utterance = new SpeechSynthesisUtterance(' ')
    utterance.volume = 0
    window.speechSynthesis.speak(utterance)
  }, [])

  const speak = useCallback((text, options = {}) => {
    const { queue = false, mood, rate: rateOverride, voice: voiceOverride, ssmlInner = null, onEnd } = options

    const audio = getSharedAudio()

    if (queue && ((audioRef.current && !audio.paused && !audio.ended) || window.speechSynthesis?.speaking)) {
      pendingRef.current = { text, options: { mood, rate: rateOverride, voice: voiceOverride, ssmlInner, onEnd } }
      return
    }

    pendingRef.current = null
    stopSpeaking()

    const prepared = preprocessText(text)
    if (!prepared) { onEnd?.(); return }

    const moodRatePercent = mood ? (MOOD_RATE[mood] ?? 0) : 0
    const overridePercent = rateOverride != null ? Math.round((rateOverride - 1) * 100) : null
    const ratePercent = overridePercent ?? moodRatePercent
    const voice = voiceOverride === 'gb' ? AZURE_VOICE_GB : (voiceOverride || defaultVoice || AZURE_VOICE)

    const finishSpeech = () => {
      if (!isMounted.current) return
      setSpeaking(false)
      browserUtteranceRef.current = null
      const pending = pendingRef.current
      if (pending) {
        pendingRef.current = null
        speak(pending.text, pending.options)
      }
      onEnd?.()
    }

    const speakWithBrowser = () => {
      if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') { finishSpeech(); return }
      const utterance = new SpeechSynthesisUtterance(prepared)
      utterance.lang = voice.startsWith('en-US') ? 'en-US' : 'en-GB'
      utterance.voice = browserVoiceFor(voice) || null
      utterance.rate = Math.max(0.65, Math.min(1.25, 1 + ratePercent / 100))
      utterance.pitch = mood === 'celebrate' ? 1.08 : voice.includes('AnaNeural') ? 1.05 : 1
      utterance.volume = 1
      utterance.onstart = () => isMounted.current && setSpeaking(true)
      utterance.onend = finishSpeech
      utterance.onerror = finishSpeech
      browserUtteranceRef.current = utterance
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    }

    // Mark this element as the active one. If a gesture triggered this call,
    // the .play() below unlocks the shared element for all future calls too.
    audioRef.current = audio
    audio.play().catch(() => {})

    fetchAzureTTS(prepared, ratePercent, voice, ssmlInner)
      .then((blob) => {
        if (!isMounted.current || audioRef.current !== audio) return
        const url = URL.createObjectURL(blob)
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
          onEnd?.()
        }
        audio.onerror = () => {
          URL.revokeObjectURL(url)
          if (audioRef.current === audio) audioRef.current = null
          speakWithBrowser()
        }
        audio.src = url
        audio.load()
        audio.play().catch(() => {
          URL.revokeObjectURL(url)
          if (audioRef.current === audio) audioRef.current = null
          speakWithBrowser()
        })
      })
      .catch(() => {
        if (audioRef.current === audio) audioRef.current = null
        speakWithBrowser()
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
