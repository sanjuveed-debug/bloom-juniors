import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Reusable tap-to-pair matching activity.
// pairs: [{ id, question, answer }] — question/answer can be strings or short JSX.
// onComplete(misses, total) is called once every pair has been matched.
export default function MatchingActivity({ pairs, colour = '#4D96FF', onSpeak, onComplete, tileTextClass = 'text-xl' }) {
  const questions = useMemo(() => shuffle(pairs.map(p => ({ id: p.id, text: p.question }))), [pairs])
  const answers   = useMemo(() => shuffle(pairs.map(p => ({ id: p.id, text: p.answer }))), [pairs])

  const [matched, setMatched] = useState(new Set())
  const [selectedQ, setSelectedQ] = useState(null)
  const [selectedA, setSelectedA] = useState(null)
  const [wrongPair, setWrongPair] = useState(null)
  const missesRef = useRef(0)
  const doneRef = useRef(false)

  const total = pairs.length

  useEffect(() => {
    if (!doneRef.current && matched.size === total && total > 0) {
      doneRef.current = true
      onComplete?.(missesRef.current, total)
    }
  }, [matched, total, onComplete])

  const checkMatch = useCallback((qId, aId) => {
    if (qId === aId) {
      confetti({ particleCount: 30, spread: 60, origin: { x: 0.5, y: 0.5 }, colors: [colour, '#FFD700', '#22C55E'] })
      setMatched(prev => new Set(prev).add(qId))
      setSelectedQ(null)
      setSelectedA(null)
    } else {
      missesRef.current += 1
      setWrongPair({ qId, aId })
      setTimeout(() => {
        setWrongPair(null)
        setSelectedQ(null)
        setSelectedA(null)
      }, 600)
    }
  }, [colour])

  const handleSelectQ = useCallback((id, text) => {
    if (matched.has(id) || wrongPair) return
    onSpeak?.(text)
    if (selectedA != null) checkMatch(id, selectedA)
    else setSelectedQ(id)
  }, [matched, wrongPair, selectedA, checkMatch, onSpeak])

  const handleSelectA = useCallback((id, text) => {
    if (matched.has(id) || wrongPair) return
    onSpeak?.(text)
    if (selectedQ != null) checkMatch(selectedQ, id)
    else setSelectedA(id)
  }, [matched, wrongPair, selectedQ, checkMatch, onSpeak])

  const tileStyle = (id, isSelected, isWrong, isMatched) => ({
    background: isMatched ? '#22C55E20' : isSelected ? colour : 'white',
    color: isMatched ? '#16A34A' : isSelected ? 'white' : colour,
    border: `3px solid ${isWrong ? '#EF4444' : isMatched ? '#22C55E' : colour + '60'}`,
    opacity: isMatched ? 0.45 : 1,
  })

  return (
    <div className="grid grid-cols-2 gap-3 px-2">
      <div className="flex flex-col gap-3">
        {questions.map(q => {
          const isMatched = matched.has(q.id)
          return (
            <motion.button
              key={q.id}
              layout
              animate={wrongPair?.qId === q.id ? { x: [0, -8, 8, -8, 0] } : {}}
              whileTap={!isMatched ? { scale: 0.95 } : {}}
              onClick={() => handleSelectQ(q.id, q.text)}
              disabled={isMatched}
              className={`rounded-2xl py-4 px-2 font-bubble ${tileTextClass} text-center shadow-md`}
              style={tileStyle(q.id, selectedQ === q.id, wrongPair?.qId === q.id, isMatched)}
            >
              {q.text} {isMatched && '✅'}
            </motion.button>
          )
        })}
      </div>
      <div className="flex flex-col gap-3">
        {answers.map(a => {
          const isMatched = matched.has(a.id)
          return (
            <motion.button
              key={a.id}
              layout
              animate={wrongPair?.aId === a.id ? { x: [0, 8, -8, 8, 0] } : {}}
              whileTap={!isMatched ? { scale: 0.95 } : {}}
              onClick={() => handleSelectA(a.id, a.text)}
              disabled={isMatched}
              className={`rounded-2xl py-4 px-2 font-bubble ${tileTextClass} text-center shadow-md`}
              style={tileStyle(a.id, selectedA === a.id, wrongPair?.aId === a.id, isMatched)}
            >
              {a.text} {isMatched && '✅'}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
