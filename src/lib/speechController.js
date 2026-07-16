import { getCached, setCached } from './ttsCache.js'

const DEFAULT_VOICE = 'en-GB-LibbyNeural'
const SILENT_WAV = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAAAAAP///w=='

const MOOD_RATE = {
  celebrate: 0,
  instruct: -8,
  phonics: -15,
  story: -16,
  question: -8,
  guide: -10,
}

export function preprocessSpeechText(text) {
  if (!text) return ''
  return String(text)
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ' ')
    .replace(/&/g, ' and ')
    .replace(/[!]{2,}/g, '!')
    .replace(/[?]{2,}/g, '?')
    .replace(/\.{3,}/g, '. ')
    .replace(/[\u2013\u2014]/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.!?])/g, '$1')
    .trim()
}

export function getAzureTtsEndpoint(locationLike = globalThis.location) {
  const hostname = String(locationLike?.hostname || '').toLowerCase()
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'https://bloomjuniors.com/api/tts?v=5'
  }
  return '/api/tts?v=5'
}

function abortError() {
  const error = new Error('Speech request cancelled')
  error.name = 'AbortError'
  return error
}

export function createSpeechController({
  fetchImpl = (...args) => globalThis.fetch(...args),
  createAudio = () => new Audio(),
  createObjectURL = blob => URL.createObjectURL(blob),
  revokeObjectURL = url => URL.revokeObjectURL(url),
  getCachedImpl = getCached,
  setCachedImpl = setCached,
  endpoint = () => getAzureTtsEndpoint(),
  reportFailure,
} = {}) {
  let audio = null
  let active = null
  let pending = null
  let sequence = 0
  let primed = false
  let lastFailureAt = 0
  const listeners = new Set()

  const notify = payload => {
    for (const listener of listeners) {
      try { listener(payload) } catch {}
    }
  }

  const getAudio = () => {
    if (!audio) audio = createAudio()
    return audio
  }

  const clearAudio = () => {
    if (!audio) return
    audio.pause?.()
    audio.onplay = null
    audio.onended = null
    audio.onerror = null
    try { audio.removeAttribute?.('src') } catch {}
    try { audio.load?.() } catch {}
  }

  const cleanupRequest = request => {
    request?.abortController?.abort?.()
    if (request?.url) {
      try { revokeObjectURL(request.url) } catch {}
    }
  }

  const emitFailure = error => {
    const now = Date.now()
    if (now - lastFailureAt < 8000) return
    lastFailureAt = now
    if (reportFailure) reportFailure(error)
    else {
      console.error('[TTS] Azure voice unavailable', error)
      try {
        window.dispatchEvent(new CustomEvent('bloom:tts-unavailable', {
          detail: { message: String(error?.message || 'Azure voice unavailable') },
        }))
      } catch {}
    }
  }

  const requestAudio = async (request, signal) => {
    const cacheKey = `v5|${request.voice}|${request.ratePercent}|${request.ssmlInner ?? request.text}`
    const cached = await getCachedImpl(cacheKey)
    if (signal.aborted) throw abortError()
    if (cached) return cached

    const response = await fetchImpl(endpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: request.text,
        voice: request.voice,
        rate: request.ratePercent,
        ...(request.ssmlInner ? { ssmlInner: request.ssmlInner } : {}),
      }),
      signal,
    })
    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(`TTS ${response.status}: ${body.slice(0, 120)}`)
    }
    const contentType = response.headers?.get?.('content-type') || ''
    if (!contentType.includes('audio')) throw new Error('TTS returned non-audio response')
    const blob = await response.blob()
    if (signal.aborted) throw abortError()
    Promise.resolve(setCachedImpl(cacheKey, blob)).catch(() => {})
    return blob
  }

  const stopActive = ({ reason = 'cancelled', clearPending = false } = {}) => {
    sequence += 1
    const previous = active
    active = null
    if (clearPending) pending = null
    cleanupRequest(previous)
    clearAudio()
    if (previous) notify({ owner: previous.owner, speaking: false, loading: false, reason })
  }

  const finish = (id, { failed = false } = {}) => {
    if (!active || active.id !== id) return
    const completed = active
    const queued = pending
    pending = null
    active = null
    cleanupRequest(completed)
    clearAudio()
    notify({ owner: completed.owner, speaking: false, loading: false, failed })
    try { completed.onEnd?.() } catch {}
    if (!active && queued) start(queued)
  }

  const fail = (id, error) => {
    if (!active || active.id !== id || error?.name === 'AbortError') return
    emitFailure(error)
    finish(id, { failed: true })
  }

  const start = request => {
    stopActive({ reason: 'replaced', clearPending: false })
    const id = ++sequence
    const abortController = new AbortController()
    active = { ...request, id, abortController, url: null }
    notify({ owner: request.owner, speaking: false, loading: true })

    requestAudio(active, abortController.signal)
      .then(blob => {
        if (!active || active.id !== id || abortController.signal.aborted) return
        const sharedAudio = getAudio()
        const url = createObjectURL(blob)
        active.url = url
        sharedAudio.onplay = () => {
          if (active?.id === id) notify({ owner: request.owner, speaking: true, loading: false })
        }
        sharedAudio.onended = () => finish(id)
        sharedAudio.onerror = () => fail(id, new Error('Azure audio could not be played'))
        sharedAudio.src = url
        sharedAudio.load?.()
        Promise.resolve(sharedAudio.play?.()).catch(() => fail(id, new Error('Tap the speaker to allow voice playback')))
      })
      .catch(error => fail(id, error))
  }

  const speak = (owner, text, options = {}) => {
    const prepared = preprocessSpeechText(text)
    if (!prepared) { options.onEnd?.(); return }
    const moodRate = options.mood ? (MOOD_RATE[options.mood] ?? 0) : 0
    const overrideRate = options.rate != null ? Math.round((options.rate - 1) * 100) : null
    const request = {
      owner,
      text: prepared,
      voice: options.voice === 'gb' ? DEFAULT_VOICE : (options.voice || DEFAULT_VOICE),
      ratePercent: overrideRate ?? moodRate,
      ssmlInner: options.ssmlInner || null,
      onEnd: options.onEnd,
    }
    if (options.queue && active) {
      pending = request
      notify({ owner, speaking: false, loading: true, queued: true })
      return
    }
    pending = null
    start(request)
  }

  const prime = () => {
    if (primed || active) return
    primed = true
    const sharedAudio = getAudio()
    try {
      sharedAudio.volume = 0
      sharedAudio.src = SILENT_WAV
      sharedAudio.load?.()
      Promise.resolve(sharedAudio.play?.()).catch(() => {}).finally(() => {
        if (active) return
        sharedAudio.pause?.()
        sharedAudio.volume = 1
        try { sharedAudio.removeAttribute?.('src') } catch {}
        try { sharedAudio.load?.() } catch {}
      })
    } catch {}
  }

  return {
    speak,
    prime,
    stopAll(reason = 'manual') { pending = null; stopActive({ reason, clearPending: true }) },
    release(owner) {
      if (pending?.owner === owner) pending = null
      if (active?.owner === owner) stopActive({ reason: 'owner-unmounted', clearPending: false })
    },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener) },
    getState() { return { activeOwner: active?.owner || null, pendingOwner: pending?.owner || null, sequence } },
  }
}

export const speechController = createSpeechController()

export function stopAllSpeech(reason) {
  speechController.stopAll(reason)
}

if (typeof window !== 'undefined') {
  const primeOnFirstGesture = () => speechController.prime()
  document.addEventListener('pointerdown', primeOnFirstGesture, { once: true, passive: true })
  window.addEventListener('pagehide', () => speechController.stopAll('page-hidden'))
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') speechController.stopAll('page-hidden')
  })
}
