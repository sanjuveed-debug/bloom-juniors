import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

// Subitising Flash: objects appear briefly then vanish — the child picks how
// many there were. The flash prevents finger-counting (the point of subitising).
const TOTAL_ROUNDS = 8
const FLASH_MS = 1500

function makeRound(roundIdx) {
  const max = roundIdx < 3 ? 3 : roundIdx < 6 ? 5 : 6
  const n = Math.floor(Math.random() * max) + 1
  const positions = []
  let guard = 0
  while (positions.length < n && guard < 200) {
    guard++
    const x = 8 + Math.random() * 74
    const y = 8 + Math.random() * 70
    if (positions.every(p => Math.hypot(p.x - x, p.y - y) > 22)) positions.push({ x, y })
  }
  const options = new Set([n])
  while (options.size < 3) {
    const o = n + (Math.floor(Math.random() * 5) - 2)
    if (o >= 1 && o <= 8) options.add(o)
  }
  return { n, positions, options: [...options].sort(() => Math.random() - 0.5) }
}

export default function SubitisingFlash({ colour = '#F59E0B', emoji = '🐞', onSpeak, onComplete }) {
  const [roundIdx, setRoundIdx] = useState(0)
  const [round, setRound] = useState(() => makeRound(0))
  const [phase, setPhase] = useState('show') // show | pick | reveal
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const doneRef = useRef(false)
  const timersRef = useRef([])

  useEffect(() => () => timersRef.current.forEach(clearTimeout), [])
  const later = useCallback((fn, ms) => { timersRef.current.push(setTimeout(fn, ms)) }, [])

  useEffect(() => {
    if (phase !== 'show') return
    const t = setTimeout(() => setPhase('pick'), FLASH_MS)
    return () => clearTimeout(t)
  }, [phase, roundIdx])

  const pick = (opt) => {
    if (phase !== 'pick' || picked !== null) return
    setPicked(opt)
    const correct = opt === round.n
    const newScore = score + (correct ? 1 : 0)
    if (correct) {
      setScore(newScore)
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.5 } })
      onSpeak?.(`Yes! There were ${round.n}!`)
    } else {
      onSpeak?.(`There were ${round.n}. Watch closely!`)
    }
    setPhase('reveal') // slow-mo reveal: show the objects again
    later(() => {
      if (roundIdx + 1 >= TOTAL_ROUNDS) {
        if (!doneRef.current) {
          doneRef.current = true
          onComplete?.(newScore, TOTAL_ROUNDS)
        }
      } else {
        setRoundIdx(roundIdx + 1)
        setRound(makeRound(roundIdx + 1))
        setPicked(null)
        setPhase('show')
      }
    }, 2200)
  }

  return (
    <div className="px-4">
      <p className="font-round text-sm text-center font-bold mb-3" style={{ color: colour }}>
        {phase === 'show' ? '👀 Look fast — how many?' : phase === 'pick' ? 'How many did you see?' : picked === round.n ? '✅ Brilliant!' : `It was ${round.n} — look!`}
      </p>

      {/* Flash arena */}
      <div className="relative mx-auto rounded-3xl overflow-hidden"
        style={{ height: 260, maxWidth: 360, background: `${colour}12`, border: `3px dashed ${colour}50` }}>
        <AnimatePresence>
          {(phase === 'show' || phase === 'reveal') && round.positions.map((p, i) => (
            <motion.span
              key={`${roundIdx}-${i}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: phase === 'reveal' ? i * 0.3 : i * 0.04, type: 'spring', stiffness: 300 }}
              className="absolute"
              style={{ left: `${p.x}%`, top: `${p.y}%`, fontSize: 40 }}
            >{emoji}</motion.span>
          ))}
        </AnimatePresence>
        {phase === 'pick' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ fontSize: 56 }}>❓</motion.span>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-3 gap-3 mt-4 max-w-xs mx-auto">
        {round.options.map(opt => (
          <motion.button key={`${roundIdx}-${opt}`} whileTap={{ scale: 0.88 }}
            onClick={() => pick(opt)}
            disabled={phase !== 'pick'}
            className="py-4 rounded-2xl font-bubble text-3xl shadow-md transition-opacity"
            style={{
              background: picked === opt ? (opt === round.n ? '#22C55E' : '#EF4444') : 'white',
              color: picked === opt ? 'white' : colour,
              border: `3px solid ${picked === opt ? 'transparent' : colour + '50'}`,
              opacity: phase === 'show' ? 0.35 : 1,
            }}>
            {opt}
          </motion.button>
        ))}
      </div>

      <p className="font-round text-xs text-center mt-4 opacity-50">Round {roundIdx + 1} / {TOTAL_ROUNDS}</p>
    </div>
  )
}
