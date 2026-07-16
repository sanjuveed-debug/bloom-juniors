import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { sessionSeedFor, seededShuffle } from '../../utils/seededRandom'
import { useSpeech } from '../../hooks/useSpeech'
import MatchingActivity from '../../components/MatchingActivity'

const STARTER_TABLES = [2,3,4,5,10]
const ALL_TABLES = [2,3,4,5,6,7,8,9,10,11,12]

function getAvailableTables(played) {
  if (played >= 3) return ALL_TABLES
  return STARTER_TABLES
}

function getTimerSeconds(played) {
  return played >= 6 ? 8 : 10
}

function buildQuestions(table, played = 0) {
  const qs = Array.from({ length: 10 }, (_, i) => ({ a: table, b: i + 1, ans: table * (i + 1) }))
  return seededShuffle(qs, sessionSeedFor('timestables-' + table, played))
}

function wrongOptions(ans) {
  const opts = new Set([ans])
  while (opts.size < 4) {
    const delta = Math.floor(Math.random() * 10) - 5
    const w = ans + delta
    if (w > 0 && w !== ans) opts.add(w)
  }
  return [...opts].sort(() => Math.random() - 0.5)
}

export default function TimesTablesModule({ theme, onDone, onBack, played = 0 }) {
  const { speak } = useSpeech()
  const [manualUnlock, setManualUnlock] = useState(false)
  const availableTables = (manualUnlock || played >= 3) ? ALL_TABLES : getAvailableTables(played)
  const timerMax = getTimerSeconds(played)
  const [phase, setPhase] = useState('pick') // pick | quiz | match | result
  const [matchPairs, setMatchPairs] = useState([])
  const [table, setTable] = useState(null)
  const [questions, setQuestions] = useState([])
  const [q, setQ] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timerMax)
  const [feedback, setFeedback] = useState(null)
  const [options, setOptions] = useState([])
  const lockedRef = useRef(false)
  const completedRef = useRef(false)
  const timersRef = useRef([])

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }, [])

  const startTable = (t) => {
    const qs = buildQuestions(t)
    lockedRef.current = false
    completedRef.current = false
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    setTable(t)
    setQuestions(qs)
    setQ(0)
    setScore(0)
    setOptions(wrongOptions(qs[0].ans))
    setTimeLeft(timerMax)
    setFeedback(null)
    setPhase('quiz')
    speak(`The ${t} times table! Answer each one as fast as you can. You have ${timerMax} seconds per question.`, { mood: 'instruct' })
  }

  const advance = useCallback((correct, qs, qi, sc) => {
    if (completedRef.current) return
    const next = qi + 1
    if (next >= qs.length) {
      completedRef.current = true
      setPhase('result')
      onDone(sc, qs.length)
    } else {
      setQ(next)
      setOptions(wrongOptions(qs[next].ans))
      setTimeLeft(timerMax)
      setFeedback(null)
      lockedRef.current = false
    }
  }, [onDone, timerMax])

  useEffect(() => {
    if (phase !== 'quiz' || feedback) return
    if (timeLeft <= 0) {
      if (lockedRef.current) return
      lockedRef.current = true
      setFeedback({ correct: false, label: `Time's up! Answer: ${questions[q].ans}` })
      const id = window.setTimeout(() => {
        timersRef.current = timersRef.current.filter(t => t !== id)
        advance(false, questions, q, score)
      }, 1300)
      timersRef.current.push(id)
      return
    }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, timeLeft, feedback, q, questions, score, advance, timerMax])

  const handleAnswer = (ans) => {
    if (lockedRef.current || completedRef.current) return
    lockedRef.current = true
    const correct = ans === questions[q].ans
    const newScore = score + (correct ? 1 : 0)
    if (correct) {
      setScore(newScore)
      confetti({ particleCount: 40, spread: 60, origin: { x: 0.5, y: 0.4 } })
    }
    setFeedback({ correct, label: correct ? `✓ ${questions[q].ans}` : `✗ Answer: ${questions[q].ans}` })
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter(t => t !== id)
      advance(correct, questions, q, newScore)
    }, 1100)
    timersRef.current.push(id)
  }

  const startMatch = () => {
    const t = availableTables[Math.floor(Math.random() * availableTables.length)]
    const facts = buildQuestions(t, played).slice(0, 6)
    completedRef.current = false
    setTable(t)
    setMatchPairs(facts.map((f, i) => ({ id: `m${i}`, question: `${f.a} × ${f.b}`, answer: String(f.ans) })))
    setPhase('match')
    speak(`Match Up! Pair each ${t} times table fact with its answer.`, { mood: 'instruct' })
  }

  const handleMatchComplete = (misses, total) => {
    if (completedRef.current) return
    completedRef.current = true
    const correct = Math.max(0, total - misses)
    confetti({ particleCount: 80, spread: 100, origin: { y: 0.5 } })
    speak('All matched! Great work!', { mood: 'celebrate' })
    setScore(correct)
    setQuestions(Array.from({ length: total }, () => ({})))
    setPhase('result')
    onDone(correct, total)
  }

  if (phase === 'match') return (
    <div className="min-h-screen flex flex-col" style={{ background: theme.bg }}>
      <div className="flex items-center gap-3 px-5 pt-safe pt-4 pb-4" style={{ background: theme.headerBg }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setPhase('pick')} className="font-round text-white/60 text-sm">← Back</motion.button>
        <p className="font-bubble text-white text-lg">🎯 Match Up — {table}× table</p>
      </div>
      <div className="flex-1 pt-5 pb-10 overflow-y-auto">
        <MatchingActivity
          pairs={matchPairs}
          colour="#FACC15"
          onSpeak={(text) => speak(String(text), { mood: 'instruct' })}
          onComplete={handleMatchComplete}
        />
      </div>
    </div>
  )

  if (phase === 'pick') return (
    <div className="min-h-screen flex flex-col" style={{ background: theme.bg }}>
      <div className="flex items-center gap-3 px-5 pt-safe pt-4 pb-4" style={{ background: theme.headerBg }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="font-round text-white/60 text-sm">← Back</motion.button>
        <p className="font-bubble text-white text-lg">Times Tables</p>
        {played >= 3 && (
          <span className="ml-auto bg-white/20 rounded-full px-2 py-0.5 font-bubble text-white text-xs">
            {played >= 6 ? 'Lv.3 ⚡' : 'Lv.2'}
          </span>
        )}
      </div>
      <div className="flex-1 px-5 pt-6">
        <p className="font-round text-white/60 text-sm mb-4 text-center">Choose your table to practise</p>
        <div className="grid grid-cols-4 gap-3">
          {ALL_TABLES.map(t => {
            const unlocked = availableTables.includes(t)
            return (
              <motion.button key={t} whileTap={unlocked ? { scale: 0.88 } : {}}
                onClick={() => unlocked && startTable(t)}
                className="py-4 rounded-2xl font-bubble text-xl relative"
                style={{
                  background: unlocked ? theme.card : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${unlocked ? theme.primary + '50' : 'rgba(255,255,255,0.1)'}`,
                  color: unlocked ? 'white' : 'rgba(255,255,255,0.2)',
                }}>
                {t}×
                {!unlocked && <span className="absolute inset-0 flex items-center justify-center text-base">🔒</span>}
              </motion.button>
            )
          })}
        </div>
        {played < 3 && !manualUnlock && (
          <div className="mt-4 text-center">
            <p className="font-round text-white/40 text-xs mb-2">
              Complete 3 sessions to auto-unlock all tables
            </p>
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => setManualUnlock(true)}
              className="font-round text-xs px-4 py-2 rounded-full"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
              🔓 I already know these — unlock all
            </motion.button>
          </div>
        )}
        <p className="font-round text-white/30 text-xs text-center mt-2">
          10 questions · {timerMax} seconds each
        </p>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={startMatch}
          className="mt-5 w-full rounded-3xl px-5 py-4 flex items-center gap-3 shadow-xl"
          style={{ background: 'linear-gradient(135deg, #FACC15, #F59E0B)' }}
        >
          <span className="text-3xl">🎯</span>
          <span className="text-left flex-1">
            <span className="font-bubble text-white text-lg block leading-tight">Match Up</span>
            <span className="font-round text-white/80 text-xs">Pair the facts with their answers — no timer!</span>
          </span>
        </motion.button>
      </div>
    </div>
  )

  if (phase === 'result') {
    const pct = Math.round((score / questions.length) * 100)
    const star = pct >= 90 ? '🌟🌟🌟' : pct >= 70 ? '⭐⭐' : '⭐'
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: theme.bg }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-center">
          <div className="text-5xl mb-4">{star}</div>
          <h2 className="font-bubble text-white text-3xl mb-2">{score}/{questions.length}</h2>
          <p className="font-round text-white/60 text-base mb-2">{table}× table · {pct}% correct</p>
          <p className="font-round mb-8" style={{ color: theme.accent }}>
            {pct === 100 ? 'Perfect! You mastered it!' : pct >= 70 ? 'Great work! Keep practising!' : 'Keep going — you\'ll get there!'}
          </p>
          <div className="flex gap-4 justify-center">
            <motion.button whileTap={{ scale: 0.93 }} onClick={() => startTable(table)}
              className="px-6 py-3 rounded-2xl font-round text-white"
              style={{ background: theme.primary }}>
              Try Again
            </motion.button>
            <motion.button whileTap={{ scale: 0.93 }} onClick={onBack}
              className="px-6 py-3 rounded-2xl font-round text-white"
              style={{ background: theme.card, border: `1px solid ${theme.primary}50` }}>
              Home
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  const current = questions[q]
  const timerPct = (timeLeft / timerMax) * 100
  const timerColor = timeLeft <= 3 ? '#EF4444' : timeLeft <= Math.floor(timerMax * 0.6) ? '#F59E0B' : theme.accent

  return (
    <div className="min-h-screen flex flex-col" style={{ background: theme.bg }}>
      <div className="flex items-center gap-3 px-5 pt-safe pt-4 pb-3" style={{ background: theme.headerBg }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="font-round text-white/60 text-sm">← Back</motion.button>
        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ background: theme.accent, width: `${(q / questions.length) * 100}%` }} />
        </div>
        <span className="font-round text-white/60 text-sm">{q + 1}/{questions.length}</span>
      </div>

      {/* Timer bar */}
      <div className="h-1.5 w-full bg-white/10">
        <motion.div className="h-full transition-all" style={{ width: `${timerPct}%`, background: timerColor }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bubble text-sm"
            style={{ background: timerColor, color: 'white' }}>
            {timeLeft}
          </div>
          <span className="font-round text-white/40 text-xs">seconds</span>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl"
          style={{ background: `${theme.primary}25`, border: `1px solid ${theme.primary}40` }}>
          <span className="text-sm">🎯</span>
          <p className="font-round text-white/70 text-xs font-bold">Recall the {table}× table as fast as you can</p>
        </div>

        <div className="w-full max-w-sm p-8 rounded-3xl text-center"
          style={{ background: theme.card, border: `1px solid ${theme.primary}40` }}>
          <p className="font-round text-white/50 text-sm mb-2">{table}× table</p>
          <p className="font-bubble text-white text-5xl" style={{ textShadow: `0 0 20px ${theme.glow}` }}>
            {current.a} × {current.b} = ?
          </p>
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className={`px-6 py-3 rounded-2xl font-bubble text-xl ${feedback.correct ? 'bg-green-500/80' : 'bg-red-500/60'} text-white`}>
              {feedback.label}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          {options.map(opt => (
            <motion.button key={opt} data-companion-answer={opt === current.ans ? 'correct' : 'wrong'} whileTap={{ scale: 0.88 }} onClick={() => handleAnswer(opt)}
              className="py-5 rounded-2xl font-bubble text-white text-2xl"
              style={{
                background: feedback && opt === current.ans ? '#22C55E40' : theme.card,
                border: feedback && opt === current.ans ? '2px solid #22C55E' : `2px solid ${theme.primary}30`,
              }}>
              {opt}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
