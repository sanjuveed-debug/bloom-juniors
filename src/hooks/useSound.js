import { useCallback, useRef } from 'react'

let audioCtx = null

function getCtx() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)() } catch {}
  }
  return audioCtx
}

function playTone(freq, duration, type = 'sine', volume = 0.3, delay = 0) {
  const ctx = getCtx()
  if (!ctx) return
  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay)
    gain.gain.setValueAtTime(volume, ctx.currentTime + delay)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration)
    osc.start(ctx.currentTime + delay)
    osc.stop(ctx.currentTime + delay + duration + 0.05)
  } catch {}
}

export function useSound() {
  const enabled = useRef(true)

  const playTap = useCallback(() => {
    if (!enabled.current) return
    playTone(880, 0.06, 'sine', 0.2)
  }, [])

  const playPop = useCallback(() => {
    if (!enabled.current) return
    playTone(600, 0.08, 'sine', 0.25)
    playTone(900, 0.05, 'sine', 0.15, 0.04)
  }, [])

  const playCorrect = useCallback(() => {
    if (!enabled.current) return
    // C E G ascending ding
    const notes = [523.25, 659.25, 783.99]
    notes.forEach((freq, i) => playTone(freq, 0.18, 'sine', 0.3, i * 0.1))
  }, [])

  const playWrong = useCallback(() => {
    if (!enabled.current) return
    playTone(220, 0.15, 'square', 0.2)
    playTone(180, 0.15, 'square', 0.15, 0.12)
  }, [])

  const playCelebrate = useCallback(() => {
    if (!enabled.current) return
    // Happy fanfare: C E G C5 E5
    const melody = [261.63, 329.63, 392, 523.25, 659.25]
    melody.forEach((freq, i) => playTone(freq, 0.2, 'sine', 0.35, i * 0.12))
    // Add shimmer
    setTimeout(() => {
      [1000, 1200, 1500].forEach((f, i) => playTone(f, 0.1, 'triangle', 0.1, i * 0.08))
    }, 700)
  }, [])

  const playSelect = useCallback(() => {
    if (!enabled.current) return
    playTone(440, 0.06, 'sine', 0.2)
    playTone(660, 0.1, 'sine', 0.25, 0.06)
  }, [])

  const playWhoosh = useCallback(() => {
    if (!enabled.current) return
    const ctx = getCtx()
    if (!ctx) return
    try {
      const bufferSize = ctx.sampleRate * 0.2
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
      const source = ctx.createBufferSource()
      source.buffer = buffer
      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(400, ctx.currentTime)
      filter.frequency.linearRampToValueAtTime(2000, ctx.currentTime + 0.2)
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25)
      source.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      source.start()
    } catch {}
  }, [])

  // Resume context on first user interaction (iOS requirement)
  const resume = useCallback(() => {
    if (audioCtx?.state === 'suspended') audioCtx.resume()
  }, [])

  return { playTap, playPop, playCorrect, playWrong, playCelebrate, playSelect, playWhoosh, resume }
}
