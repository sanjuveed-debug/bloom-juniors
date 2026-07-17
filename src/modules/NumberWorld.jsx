import React, { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useSpeech } from '../hooks/useSpeech'
import { dailySeedFor, mulberry32 } from '../utils/seededRandom'
import { speakThenAdvance } from '../utils/speechAdvance'
import { THEMES } from '../themes'
import SkillHint, { getHint } from '../components/SkillHint'
import InteractiveYaagvi, { useYaagviReactions } from '../components/InteractiveYaagvi'
import MatchingActivity from '../components/MatchingActivity'
import SubitisingFlash from '../components/SubitisingFlash'
import { buildNumberLineWindow } from '../utils/numberLine'
import { questionSignature } from '../utils/adaptiveLearning'

// ── Avatar object sets ────────────────────────────────────────────────────────
const OBJECT_SETS = {
  bloom:  { a: '🌸', b: '🦋', label: 'Bloom' },
  aurora:   { a: '❄️', b: '⛄', label: 'Snow'  },
  marina:  { a: '🌊', b: '🐚', label: 'Marina' },
  rumi:   { a: '⭐', b: '✨', label: 'Rumi'  },
}

// ── Operations ────────────────────────────────────────────────────────────────
const OPS = {
  count:    { label: 'Counting',    icon: '🔢', colour: '#FF9A3C', maxNum: 10,
    desc: 'How many objects are there?' },
  onemore:  { label: 'One More',    icon: '⬆️', colour: '#22C55E', maxNum: 20,
    desc: 'Count one step forward' },
  oneless:  { label: 'One Less',    icon: '⬇️', colour: '#14B8A6', maxNum: 20,
    desc: 'Count one step back' },
  add:      { label: 'Addition',    icon: '➕', colour: '#4D96FF', maxNum: 10,
    desc: 'Put two groups together' },
  subtract: { label: 'Subtraction', icon: '➖', colour: '#EF4444', maxNum: 10,
    desc: 'Take away from a group' },
  multiply: { label: 'Multiply',    icon: '✖️', colour: '#8B5CF6', maxNum: 5,
    desc: 'Equal groups of the same size' },
}

// ── Match Up activity ──────────────────────────────────────────────────────────
const MATCH_CONFIG = {
  label: 'Match Up', icon: '🎯', colour: '#FF6B9D',
  desc: 'Tap a sum, then tap its matching answer!',
}
const MATCH_PAIR_COUNT = 6

function generateMatchPairs(count, maxNum) {
  const pairs = []
  const usedAnswers = new Set()
  let attempts = 0
  while (pairs.length < count && attempts < count * 30) {
    attempts++
    let qText, answer
    if (Math.random() < 0.5) {
      const a = Math.floor(Math.random() * maxNum) + 1
      const b = Math.floor(Math.random() * maxNum) + 1
      answer = a + b
      qText = `${a} + ${b}`
    } else {
      const a = Math.floor(Math.random() * maxNum) + 2
      const b = Math.floor(Math.random() * (a - 1)) + 1
      answer = a - b
      qText = `${a} − ${b}`
    }
    if (usedAnswers.has(answer)) continue
    usedAnswers.add(answer)
    pairs.push({ id: `p${pairs.length}`, question: qText, answer: String(answer) })
  }
  return pairs
}

function getOpDifficulty(plays) {
  if (plays >= 6) return { level: 3, mult: 2.0 }
  if (plays >= 3) return { level: 2, mult: 1.5 }
  return { level: 1, mult: 1.0 }
}

function generateQuestion(op, maxNumOverride, rng = Math.random) {
  const max = maxNumOverride ?? OPS[op].maxNum
  switch (op) {
    case 'count': {
      const n = Math.floor(rng() * max) + 1
      return { q: `How many are there?`, a: n, n1: n, n2: 0, display: 'count' }
    }
    case 'onemore': {
      const n = Math.floor(rng() * (max - 1)) + 1
      return { q: `What is one MORE than ${n}?`, a: n + 1, n1: n, n2: 1, display: 'onemore' }
    }
    case 'oneless': {
      const n = Math.floor(rng() * (max - 1)) + 2
      return { q: `What is one LESS than ${n}?`, a: n - 1, n1: n, n2: -1, display: 'oneless' }
    }
    case 'add': {
      const a = Math.floor(rng() * max) + 1
      const b = Math.floor(rng() * (max - a)) + 1
      return { q: `${a} + ${b} = ?`, a: a + b, n1: a, n2: b, display: 'add' }
    }
    case 'subtract': {
      const a = Math.floor(rng() * max) + 2
      const b = Math.floor(rng() * (a - 1)) + 1
      return { q: `${a} − ${b} = ?`, a: a - b, n1: a, n2: b, display: 'sub' }
    }
    case 'multiply': {
      const a = Math.floor(rng() * max) + 1
      const b = Math.floor(rng() * max) + 1
      return { q: `${a} × ${b} = ?`, a: a * b, n1: a, n2: b, display: 'mul' }
    }
    default: return { q: '1 + 1 = ?', a: 2, n1: 1, n2: 1, display: 'add' }
  }
}

function makeChoices(answer) {
  const choices = new Set([answer])
  const offsets = [-3, -2, -1, 1, 2, 3, 4, -4]
  for (const o of offsets.sort(() => Math.random() - 0.5)) {
    if (choices.size >= 4) break
    const c = answer + o
    if (c > 0) choices.add(c)
  }
  while (choices.size < 4) choices.add(answer + choices.size + 1)
  return [...choices].sort(() => Math.random() - 0.5)
}

// ── Ten Frame ─────────────────────────────────────────────────────────────────
// A 2×5 grid of cells. Filled cells show the emoji, empty cells are blank boxes.
function TenFrame({ count, emoji, colour, maxCells = 10, delay = 0 }) {
  const cells = Math.min(count, maxCells)
  const rows  = maxCells === 10 ? 2 : Math.ceil(maxCells / 5)
  const cols  = 5

  return (
    <div className="inline-flex flex-col gap-1">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-1">
          {Array.from({ length: cols }).map((_, c) => {
            const idx    = r * cols + c
            const filled = idx < cells
            return (
              <motion.div
                key={c}
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: 36, height: 36,
                  background: filled ? colour + '20' : 'rgba(0,0,0,0.04)',
                  border: `2px solid ${filled ? colour : 'rgba(0,0,0,0.1)'}`,
                }}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: delay + idx * 0.05,
                  type: 'spring', stiffness: 400, damping: 18,
                }}
              >
                {filled && (
                  <span style={{ fontSize: 20, lineHeight: 1 }}>{emoji}</span>
                )}
              </motion.div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ── Mini ten frame for the answer choices ─────────────────────────────────────
function MiniTenFrame({ count, colour }) {
  const total = Math.min(count, 20)
  return (
    <div className="flex flex-wrap gap-0.5 justify-center max-w-[120px] mx-auto mt-1">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="w-3 h-3 rounded-sm"
          style={{ background: colour }} />
      ))}
    </div>
  )
}

// ── Number Line strip ─────────────────────────────────────────────────────────
function NumberLine({ current, answer, revealAnswer = false }) {
  const nums = buildNumberLineWindow(current, answer)
  return (
    <div className="w-full overflow-x-auto py-3">
      <div className="flex items-end gap-0 min-w-max mx-auto px-2">
        {nums.map((n, index) => {
          const isCurrent = n === current
          const isAnswer  = n === answer
          const answerVisible = isAnswer && revealAnswer
          return (
            <div key={n} className="flex flex-col items-center" style={{ minWidth: 32 }}>
              {/* Arrow above answer */}
              {isAnswer && (
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: [0, -6, 0], opacity: 1 }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  className="text-lg mb-0.5"
                >
                  {answer > current ? '⬆️' : '⬇️'}
                </motion.div>
              )}
              {!isAnswer && <div style={{ height: 28 }} />}

              {/* Number bubble */}
              <motion.div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bubble text-sm"
                style={{
                  background: isCurrent ? '#FF9A3C' : answerVisible ? '#22C55E' : isAnswer ? 'white' : 'rgba(0,0,0,0.07)',
                  color: isCurrent || answerVisible ? 'white' : isAnswer ? '#22C55E' : '#374151',
                  border: isCurrent ? '2.5px solid #FF6B00' : answerVisible ? '2.5px solid #16A34A' : isAnswer ? '2.5px dashed #22C55E' : '2px solid rgba(0,0,0,0.1)',
                  scale: isCurrent || isAnswer ? 1.2 : 1,
                }}
                initial={{ scale: 0.5 }}
                animate={{ scale: isCurrent || isAnswer ? 1.2 : 1 }}
                transition={{ delay: index * 0.03, type: 'spring' }}
              >
                {isAnswer && !revealAnswer ? '?' : n}
              </motion.div>

              {/* Track line */}
              <div className="w-full h-1.5 rounded-full mt-1"
                style={{ background: n <= Math.max(current, answer) && n >= Math.min(current, answer) ? '#22C55E40' : 'rgba(0,0,0,0.08)' }} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Addition Visual ───────────────────────────────────────────────────────────
// Two separate labeled ten frames with a + between them and = ?
function AddVisual({ n1, n2, emoji1, emoji2, colour }) {
  return (
    <div className="flex items-center justify-center gap-3 flex-wrap">
      {/* Group A */}
      <div className="flex flex-col items-center gap-1.5">
        <div className="font-bubble text-4xl" style={{ color: colour }}>{n1}</div>
        <TenFrame count={n1} emoji={emoji1} colour={colour} delay={0} />
      </div>

      {/* Plus */}
      <motion.div
        className="font-bubble text-4xl"
        style={{ color: '#374151' }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, repeatDelay: 1.5 }}
      >+</motion.div>

      {/* Group B */}
      <div className="flex flex-col items-center gap-1.5">
        <div className="font-bubble text-4xl" style={{ color: '#FF9A3C' }}>{n2}</div>
        <TenFrame count={n2} emoji={emoji2} colour="#FF9A3C" delay={n1 * 0.05 + 0.1} />
      </div>

      {/* Equals */}
      <div className="font-bubble text-4xl" style={{ color: '#374151' }}>=</div>
      <motion.div
        className="w-16 h-16 rounded-2xl flex items-center justify-center font-bubble text-3xl"
        style={{ background: colour + '20', border: `3px dashed ${colour}` }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >?</motion.div>
    </div>
  )
}

// ── Subtraction Visual ────────────────────────────────────────────────────────
// Full ten frame with n2 items animated to cross out / grey out
function SubVisual({ n1, n2, emoji, colour }) {
  const [phase, setPhase] = useState(0)  // 0=show all, 1=cross out

  useEffect(() => {
    const t = setTimeout(() => setPhase(1), 700)
    return () => clearTimeout(t)
  }, [n1, n2])

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Full group label */}
      <div className="flex items-center gap-3 font-bubble text-3xl">
        <span style={{ color: colour }}>{n1}</span>
        <span style={{ color: '#374151' }}>−</span>
        <motion.span
          style={{ color: '#EF4444' }}
          animate={{ scale: phase ? [1, 1.3, 1] : 1 }}
          transition={{ duration: 0.5 }}
        >{n2}</motion.span>
        <span style={{ color: '#374151' }}>=</span>
        <span style={{ color: '#374151' }}>?</span>
      </div>

      {/* Ten frame with crossed-out cells */}
      <div className="flex flex-col gap-1">
        {Array.from({ length: 2 }).map((_, r) => (
          <div key={r} className="flex gap-1">
            {Array.from({ length: 5 }).map((_, c) => {
              const idx      = r * 5 + c
              const filled   = idx < n1
              const crossOut = filled && idx >= (n1 - n2)
              return (
                <motion.div
                  key={c}
                  className="relative flex items-center justify-center rounded-lg overflow-hidden"
                  style={{
                    width: 38, height: 38,
                    background: filled
                      ? (crossOut ? '#EF444415' : colour + '20')
                      : 'rgba(0,0,0,0.04)',
                    border: `2px solid ${filled ? (crossOut ? '#EF4444' : colour) : 'rgba(0,0,0,0.1)'}`,
                  }}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.04, type: 'spring', stiffness: 400 }}
                >
                  {filled && (
                    <span style={{
                      fontSize: 20, lineHeight: 1,
                      opacity: phase && crossOut ? 0.25 : 1,
                      transition: 'opacity 0.4s ease',
                    }}>
                      {emoji}
                    </span>
                  )}
                  {/* X overlay for crossed-out items */}
                  {filled && crossOut && phase === 1 && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: (idx - (n1 - n2)) * 0.08, type: 'spring' }}
                    >
                      <span style={{ fontSize: 26, color: '#EF4444', fontWeight: 900, lineHeight: 1 }}>✕</span>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        ))}
      </div>

      {/* "Take away" label */}
      <motion.p
        className="font-round text-sm font-bold"
        style={{ color: '#EF4444' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: phase ? 1 : 0 }}
        transition={{ delay: 0.4 }}
      >
        ✕ Cross out {n2} — what's left?
      </motion.p>
    </div>
  )
}

// ── Multiplication Visual ─────────────────────────────────────────────────────
// Array of rows × columns with row and column labels
function MulVisual({ n1, n2, emoji, colour }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="font-bubble text-3xl" style={{ color: colour }}>
        {n1} groups of {n2}
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: n1 }).map((_, row) => (
          <div key={row} className="flex items-center gap-2">
            {/* Row label */}
            <div className="w-6 h-6 rounded-full flex items-center justify-center font-bubble text-xs text-white"
              style={{ background: colour, minWidth: 24 }}>
              {row + 1}
            </div>
            {/* Objects in row */}
            <div className="flex gap-1.5 p-2 rounded-xl"
              style={{ background: colour + '15', border: `1.5px solid ${colour}40` }}>
              {Array.from({ length: n2 }).map((_, col) => (
                <motion.span key={col}
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: (row * n2 + col) * 0.04, type: 'spring', stiffness: 400 }}
                  style={{ fontSize: 24, lineHeight: 1 }}>
                  {emoji}
                </motion.span>
              ))}
            </div>
            {/* Per-row count */}
            <div className="font-bubble text-sm opacity-60" style={{ color: colour }}>= {n2}</div>
          </div>
        ))}
      </div>
      <motion.p className="font-round text-sm font-bold mt-1"
        style={{ color: colour }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}>
        {n1} rows × {n2} each = ?
      </motion.p>
    </div>
  )
}

// ── Counting Visual ───────────────────────────────────────────────────────────
// Objects revealed one-by-one in a ten-frame — number NOT shown (child must count)
function CountVisual({ n, emoji, colour }) {
  const [revealed, setRevealed] = useState(0)

  useEffect(() => {
    setRevealed(0)
    let i = 0
    const t = setInterval(() => {
      i++
      setRevealed(i)
      if (i >= n) clearInterval(t)
    }, 220)
    return () => clearInterval(t)
  }, [n])

  return (
    <div className="flex flex-col items-center gap-3">
      <TenFrame count={revealed} emoji={emoji} colour={colour} maxCells={10} />
      <p className="font-round text-sm font-bold" style={{ color: colour }}>
        Count the {emoji} — tap the right number!
      </p>
    </div>
  )
}

// ── Number bond diagram for one more / one less ───────────────────────────────
function OneMorLessVisual({ n, answer, type, colour, revealAnswer = false }) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Number bond */}
      <div className="flex items-center gap-4">
        {/* Current number */}
        <motion.div
          className="w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-lg"
          style={{ background: `linear-gradient(135deg, ${colour}, ${colour}CC)` }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="font-bubble text-4xl text-white">{n}</span>
        </motion.div>

        {/* Arrow */}
        <div className="flex flex-col items-center">
          <motion.div
            className="font-bubble text-3xl"
            animate={{ x: type === 'more' ? [0, 6, 0] : [0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            {type === 'more' ? '→' : '←'}
          </motion.div>
          <p className="font-round text-xs font-bold" style={{ color: colour }}>
            {type === 'more' ? '+1 more' : '−1 less'}
          </p>
        </div>

        {/* Answer placeholder */}
        <motion.div
          className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
          style={{
            background: 'white',
            border: `4px dashed ${colour}`,
          }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <span className="font-bubble text-4xl" style={{ color: colour }}>?</span>
        </motion.div>
      </div>

      {/* Number line */}
      <NumberLine current={n} answer={answer} revealAnswer={revealAnswer} />
    </div>
  )
}

// ── Op selector card ──────────────────────────────────────────────────────────
function OpCard({ opKey, op, emoji1, emoji2, onSelect, index, diffLevel }) {
  const previews = {
    count:    () => <div className="flex gap-1 flex-wrap justify-center">{Array.from({length:5}).map((_,i)=><span key={i} style={{fontSize:18}}>{emoji1}</span>)}</div>,
    onemore:  () => <div className="font-bubble text-lg text-white">4 → <span style={{color:'#FFD700'}}>5</span></div>,
    oneless:  () => <div className="font-bubble text-lg text-white">6 → <span style={{color:'#FFD700'}}>5</span></div>,
    add:      () => <div className="font-bubble text-lg text-white">{emoji1}{emoji1} + {emoji2}{emoji2}</div>,
    subtract: () => <div className="font-bubble text-lg text-white">{emoji1}{emoji1}{emoji1} − {emoji1}<span style={{color:'#ff9999',textDecoration:'line-through'}}>{emoji1}</span></div>,
    multiply: () => (
      <div className="flex flex-col gap-0.5">
        {[0,1].map(r=><div key={r} className="flex gap-0.5">{[0,1,2].map(c=><span key={c} style={{fontSize:14}}>{emoji1}</span>)}</div>)}
      </div>
    ),
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 20, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 280 }}
      whileTap={{ scale: 0.91 }}
      onClick={() => onSelect(opKey)}
      className="relative rounded-3xl overflow-hidden flex flex-col shadow-xl"
      style={{ background: op.colour, minHeight: 130 }}
    >
      {diffLevel > 1 && (
        <div className="absolute top-2 right-2 z-20 bg-white/30 rounded-full px-2 py-0.5 font-bubble text-white text-xs leading-none">
          Lv.{diffLevel}
        </div>
      )}
      {/* Dot texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '14px 14px' }} />

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 p-4 gap-2">
        <div className="text-3xl">{op.icon}</div>
        <p className="font-bubble text-white text-lg leading-tight text-center">{op.label}</p>

        {/* Mini visual preview */}
        <div className="bg-white/20 rounded-xl px-3 py-1.5 min-h-[44px] flex items-center justify-center w-full">
          {previews[opKey]?.()}
        </div>

        <p className="font-round text-white/80 text-xs text-center leading-tight">{op.desc}</p>
      </div>
    </motion.button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function NumberWorld({ avatar, progress, profileName, onAddStars, onBack }) {
  const theme   = THEMES[avatar] || THEMES.rumi
  const objects = OBJECT_SETS[avatar] || OBJECT_SETS.rumi
  const { speak } = useSpeech()

  const [selectedOp,       setSelectedOp]       = useState(null)
  const [currentMaxNum,    setCurrentMaxNum]     = useState(null)
  const [question,         setQuestion]          = useState(null)
  const [choices,          setChoices]           = useState([])
  const [selected,         setSelected]          = useState(null)
  const [score,            setScore]             = useState(0)
  const [round,            setRound]             = useState(1)
  const [feedback,         setFeedback]          = useState(null)
  const [wrongAnswers,     setWrongAnswers]       = useState([])
  const [consecutiveWrong, setConsecutiveWrong]  = useState(0)
  const [showHint,         setShowHint]          = useState(false)
  const [answered,         setAnswered]          = useState(false)
  const totalRounds = 10

  const { reaction: yaagviReaction, react: reactYaagvi } = useYaagviReactions({
    activityKey: `${selectedOp || 'menu'}-${round}-${question?.q || ''}`,
    active: Boolean(
      selectedOp &&
      !['flash', 'match'].includes(selectedOp) &&
      question &&
      !answered &&
      round <= totalRounds
    ),
  })

  const [matchPairs,  setMatchPairs]  = useState([])
  const [matchResult, setMatchResult] = useState(null)
  const [flashResult, setFlashResult] = useState(null)
  const [flashKey,    setFlashKey]    = useState(0)
  const flashAwardedRef = useRef(false)

  const opPlayed = progress?.math?.opPlayed || {}
  const awardedRef = useRef(false)
  const matchAwardedRef = useRef(false)

  const timersRef  = useRef(new Set())
  const askedRef   = useRef(new Set())
  const seedStepRef = useRef(0)
  const questionHadWrongRef = useRef(false)

  useEffect(() => () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current.clear()
  }, [])

  const defer = useCallback((fn, ms) => {
    const id = window.setTimeout(() => {
      timersRef.current.delete(id)
      fn()
    }, ms)
    timersRef.current.add(id)
  }, [])

  const newQuestion = useCallback((op, maxNum) => {
    // Daily-seeded so the question set differs each day, with a per-round step
    // and retries so the same sum/number doesn't repeat within a session.
    let q
    for (let attempt = 0; attempt < 8; attempt++) {
      seedStepRef.current += 1
      const sessionNumber = opPlayed[op] || 0
      const seed = dailySeedFor(`numberworld-${op}-${maxNum}-${sessionNumber}`) + seedStepRef.current * 131
      q = generateQuestion(op, maxNum, mulberry32(seed))
      if (!askedRef.current.has(q.q)) break
    }
    askedRef.current.add(q.q)
    setQuestion(q)
    setChoices(makeChoices(q.a))
    setSelected(null)
    setFeedback(null)
    setAnswered(false)
    questionHadWrongRef.current = false
    reactYaagvi('question')
    defer(() => speak(q.q, { mood: 'instruct' }), 500)
  }, [speak, defer, reactYaagvi, opPlayed])

  const completeMath = useCallback((finalScore) => {
    if (awardedRef.current) return
    awardedRef.current = true
    reactYaagvi('complete')
    onAddStars('math', finalScore, {
      total: totalRounds, correct: finalScore, struggles: wrongAnswers, op: selectedOp,
      questionSignatures: [...askedRef.current].map(prompt => questionSignature('math', `${selectedOp}:${prompt}`)),
    })
  }, [onAddStars, selectedOp, totalRounds, wrongAnswers, reactYaagvi])

  const OP_OBJECTIVES = {
    count:    'Count the objects carefully, then tap the matching number.',
    onemore:  'Find the number that is one more — count one step forward!',
    oneless:  'Find the number that is one less — count one step back!',
    add:      'Put the two groups together and find the total.',
    subtract: 'Take away the crossed-out ones — how many are left?',
    multiply: 'Count the equal groups and find the total.',
  }

  const handleOpSelect = useCallback((op) => {
    awardedRef.current = false
    askedRef.current = new Set()
    const plays = opPlayed[op] || 0
    const { level, mult } = getOpDifficulty(plays)
    const maxNum = Math.floor(OPS[op].maxNum * mult)
    setSelectedOp(op)
    setCurrentMaxNum(maxNum)
    setRound(1)
    setScore(0)
    setWrongAnswers([])
    setConsecutiveWrong(0)
    newQuestion(op, maxNum)
    const levelMsg = level > 1 ? ` Level ${level}!` : ''
    speak(`${OPS[op].label}! ${OP_OBJECTIVES[op]}${levelMsg}`, { mood: 'instruct' })
    reactYaagvi('start')
  }, [newQuestion, speak, opPlayed, reactYaagvi])

  const handleMatchSelect = useCallback(() => {
    matchAwardedRef.current = false
    const plays = opPlayed.match || 0
    const { mult } = getOpDifficulty(plays)
    const maxNum = Math.floor(10 * mult)
    setMatchPairs(generateMatchPairs(MATCH_PAIR_COUNT, maxNum))
    setMatchResult(null)
    setSelectedOp('match')
    speak(`${MATCH_CONFIG.label}! ${MATCH_CONFIG.desc}`, { mood: 'instruct' })
    reactYaagvi('start')
  }, [opPlayed, speak, reactYaagvi])

  const handleFlashSelect = useCallback(() => {
    flashAwardedRef.current = false
    setFlashResult(null)
    setFlashKey(k => k + 1)
    setSelectedOp('flash')
    speak('Flash Count! Watch closely — the objects vanish fast. How many did you see?', { mood: 'instruct' })
    reactYaagvi('start')
  }, [speak, reactYaagvi])

  const handleFlashComplete = useCallback((correct, total) => {
    if (flashAwardedRef.current) return
    flashAwardedRef.current = true
    reactYaagvi('complete')
    confetti({ particleCount: 80, spread: 100, origin: { y: 0.5 } })
    speak(`Super speedy eyes, ${profileName || 'superstar'}!`, { mood: 'celebrate' })
    onAddStars('math', correct, { total, correct, struggles: [], op: 'flash' })
    setFlashResult({ correct, total })
  }, [onAddStars, profileName, speak, reactYaagvi])

  const handleMatchComplete = useCallback((misses, total) => {
    if (matchAwardedRef.current) return
    matchAwardedRef.current = true
    const finalScore = Math.max(0, total - misses)
    reactYaagvi('complete')
    confetti({ particleCount: 80, spread: 100, origin: { y: 0.5 } })
    speak(`Amazing matching, ${profileName || 'superstar'}!`, { mood: 'celebrate' })
    onAddStars('math', finalScore, { total, correct: finalScore, struggles: [], op: 'match' })
    setMatchResult({ finalScore, total })
  }, [onAddStars, profileName, speak, reactYaagvi])

  const handleChoice = useCallback((choice) => {
    if (selected !== null || answered) return
    setSelected(choice)
    const correct = choice === question.a

    if (correct) {
      setAnswered(true)
      const firstTry = !questionHadWrongRef.current
      if (firstTry) setScore(s => s + 1)
      setConsecutiveWrong(0)
      setFeedback({ type: 'correct', msg: `✅ ${question.a}! Brilliant!` })
      confetti({ particleCount: 55, spread: 75, origin: { x: 0.5, y: 0.6 }, colors: ['#FFD700','#22C55E','#4D96FF'] })

      const finalScore = score + (firstTry ? 1 : 0)
      reactYaagvi('correct', {
        streak: finalScore % 3 === 0 ? 3 : 1,
        isFinal: round >= totalRounds,
      })
      speakThenAdvance(speak, `Yes! ${question.a} is correct! Well done ${profileName || 'superstar'}!`, { mood: 'celebrate' }, () => {
        if (round >= totalRounds) {
          setRound(totalRounds + 1)
          completeMath(finalScore)
        } else {
          setRound(r => r + 1)
          newQuestion(selectedOp, currentMaxNum)
        }
      }, timersRef, { minMs: 1400, maxMs: 6000 })
    } else {
      const newWrong = consecutiveWrong + 1
      questionHadWrongRef.current = true
      setAnswered(true)
      setConsecutiveWrong(newWrong)
      setWrongAnswers(prev => [...prev, question.q])
      setFeedback({ type: 'wrong', msg: 'Good try. Use the picture or number line and have another go!' })
      reactYaagvi('wrong', { attempt: newWrong })

      speakThenAdvance(speak, 'Good try. Look at the picture or move one step on the number line, then try again.', { mood: 'instruct' }, () => {
        setSelected(null)
        setFeedback(null)
        setAnswered(false)
        if (newWrong >= 2) {
          setShowHint(true)
        }
      }, timersRef, { minMs: 1600, maxMs: 6000 })
    }
  }, [selected, answered, question, round, totalRounds, score, wrongAnswers,
      consecutiveWrong, selectedOp, currentMaxNum, speak, newQuestion, completeMath, profileName, reactYaagvi])

  // ── Op selector screen ──────────────────────────────────────────────────────
  if (!selectedOp) {
    return (
      <div className="min-h-screen pb-10 scroll-ios overflow-y-auto"
        style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
        <div className="flex items-center px-4 pb-4 pt-safe">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
            className="w-11 h-11 rounded-full flex items-center justify-center shadow mr-3"
            style={{ background: theme.card, color: theme.text }}>←</motion.button>
          <div>
            <h1 className="font-bubble text-3xl shimmer-text">Number World 🔢</h1>
            <p className="font-round text-sm opacity-60" style={{ color: theme.text }}>What shall we learn today?</p>
          </div>
        </div>

        <div className="px-4">
          <InteractiveYaagvi reaction={yaagviReaction} placement="strip" />
        </div>

        <div className="grid grid-cols-2 gap-4 px-4">
          {Object.entries(OPS).map(([key, op], i) => (
            <OpCard key={key} opKey={key} op={op}
              emoji1={objects.a} emoji2={objects.b}
              onSelect={handleOpSelect} index={i}
              diffLevel={getOpDifficulty(opPlayed[key] || 0).level} />
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: Object.keys(OPS).length * 0.07, type: 'spring', stiffness: 280 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleMatchSelect}
          className="relative rounded-3xl overflow-hidden flex items-center gap-3 shadow-xl mx-4 mt-4 px-5 py-4"
          style={{ background: `linear-gradient(135deg, ${MATCH_CONFIG.colour}, ${MATCH_CONFIG.colour}CC)` }}
        >
          <div className="text-3xl">{MATCH_CONFIG.icon}</div>
          <div className="text-left flex-1">
            <p className="font-bubble text-white text-lg leading-tight">{MATCH_CONFIG.label}</p>
            <p className="font-round text-white/80 text-xs">{MATCH_CONFIG.desc}</p>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: Object.keys(OPS).length * 0.07 + 0.07, type: 'spring', stiffness: 280 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleFlashSelect}
          className="relative rounded-3xl overflow-hidden flex items-center gap-3 shadow-xl mx-4 mt-3 px-5 py-4"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
        >
          <div className="text-3xl">⚡</div>
          <div className="text-left flex-1">
            <p className="font-bubble text-white text-lg leading-tight">Flash Count</p>
            <p className="font-round text-white/80 text-xs">Quick! Count them before they vanish!</p>
          </div>
        </motion.button>
      </div>
    )
  }

  // ── Flash Count (subitising) screen ─────────────────────────────────────────
  if (selectedOp === 'flash') {
    return (
      <div className="min-h-screen flex flex-col overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${theme.bg} 0%, white 60%, ${theme.bg} 100%)` }}>
        <div className="flex items-center justify-between px-4 pb-2 pt-safe shrink-0">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSelectedOp(null)}
            className="w-11 h-11 rounded-full flex items-center justify-center shadow"
            style={{ background: theme.card, color: theme.text }}>←</motion.button>
          <div className="flex items-center gap-1.5">
            <span className="text-xl">⚡</span>
            <p className="font-bubble text-base" style={{ color: '#D97706' }}>Flash Count</p>
          </div>
          <div className="w-11 h-11" />
        </div>

        <div className="flex-1 overflow-y-auto scroll-ios pb-32 pt-2">
          <div className="px-4">
            <InteractiveYaagvi reaction={yaagviReaction} placement="strip" />
          </div>
          {!flashResult ? (
            <SubitisingFlash
              key={flashKey}
              colour="#F59E0B"
              emoji={objects.a}
              onSpeak={(text) => speak(String(text), { mood: 'instruct' })}
              onComplete={handleFlashComplete}
            />
          ) : (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 16 }}
              className="flex flex-col items-center justify-center text-center pt-10 px-6">
              <motion.div className="text-8xl mb-3"
                animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}>
                {flashResult.correct === flashResult.total ? '🏆' : '⚡'}
              </motion.div>
              <h2 className="font-bubble text-4xl shimmer-text mb-1">Speedy Eyes!</h2>
              <p className="font-bubble text-5xl mb-1" style={{ color: '#D97706' }}>
                {flashResult.correct}/{flashResult.total}
              </p>
              <div className="flex gap-3 justify-center mt-5">
                <motion.button whileTap={{ scale: 0.9 }} onClick={handleFlashSelect}
                  className="bubble-btn px-6 py-3 text-base"
                  style={{ background: `linear-gradient(135deg, ${theme.secondary}, ${theme.primary})` }}>
                  Try Another
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
                  className="bubble-btn px-6 py-3 text-base"
                  style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
                  Home 🏠
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    )
  }

  // ── Match Up screen ──────────────────────────────────────────────────────────
  if (selectedOp === 'match') {
    return (
      <div className="min-h-screen flex flex-col overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${theme.bg} 0%, white 60%, ${theme.bg} 100%)` }}>

        <div className="flex items-center justify-between px-4 pb-2 pt-safe shrink-0">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSelectedOp(null)}
            className="w-11 h-11 rounded-full flex items-center justify-center shadow"
            style={{ background: theme.card, color: theme.text }}>←</motion.button>

          <div className="text-center">
            <div className="flex items-center gap-1.5 justify-center">
              <span className="text-xl">{MATCH_CONFIG.icon}</span>
              <p className="font-bubble text-base" style={{ color: MATCH_CONFIG.colour }}>{MATCH_CONFIG.label}</p>
            </div>
          </div>

          <div className="w-11 h-11" />
        </div>

        <div className="flex-1 overflow-y-auto scroll-ios px-4 pb-32">
          <InteractiveYaagvi reaction={yaagviReaction} placement="strip" />
          {!matchResult && (
            <>
              <p className="font-round text-sm text-center mb-4 opacity-70" style={{ color: theme.text }}>
                {MATCH_CONFIG.desc}
              </p>
              <MatchingActivity
                pairs={matchPairs}
                colour={MATCH_CONFIG.colour}
                onSpeak={(text) => speak(String(text), { mood: 'instruct' })}
                onComplete={handleMatchComplete}
              />
            </>
          )}

          {matchResult && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 16 }}
              className="flex flex-col items-center justify-center text-center pt-10">
              <motion.div className="text-8xl mb-3"
                animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}>
                {matchResult.finalScore === matchResult.total ? '🏆' : '🌟'}
              </motion.div>
              <h2 className="font-bubble text-4xl shimmer-text mb-1">All Matched!</h2>
              <p className="font-bubble text-5xl mb-1" style={{ color: MATCH_CONFIG.colour }}>
                {matchResult.finalScore}/{matchResult.total}
              </p>
              <p className="font-round text-lg mb-6 opacity-70" style={{ color: theme.text }}>
                {matchResult.finalScore === matchResult.total ? 'Perfect! Amazing work!' : 'Great effort! Practice makes perfect!'}
              </p>
              <div className="flex gap-3 justify-center">
                <motion.button whileTap={{ scale: 0.9 }}
                  onClick={handleMatchSelect}
                  className="bubble-btn px-6 py-3 text-base"
                  style={{ background: `linear-gradient(135deg, ${theme.secondary}, ${theme.primary})` }}>
                  Try Another
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
                  className="bubble-btn px-6 py-3 text-base"
                  style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
                  Home 🏠
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    )
  }

  // ── Results screen ──────────────────────────────────────────────────────────
  if (round > totalRounds) {
    const pct = Math.round((score / totalRounds) * 100)
    const medal = pct === 100 ? '🏆' : pct >= 70 ? '🥇' : pct >= 50 ? '🥈' : '🌟'
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
        style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 16 }}>
          <InteractiveYaagvi reaction={yaagviReaction} placement="inline" />
          <motion.div className="text-8xl mb-3"
            animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}>
            {medal}
          </motion.div>
          <h2 className="font-bubble text-4xl shimmer-text mb-1">Maths Master!</h2>
          <p className="font-bubble text-5xl mb-1" style={{ color: OPS[selectedOp].colour }}>
            {score}/{totalRounds}
          </p>
          <p className="font-round text-lg mb-6 opacity-70" style={{ color: theme.text }}>
            {pct === 100 ? 'Perfect! Amazing work!' : pct >= 70 ? 'Brilliant! Keep going!' : 'Great effort! Practice makes perfect!'}
          </p>
          <div className="flex gap-3 justify-center">
            <motion.button whileTap={{ scale: 0.9 }}
              onClick={() => { setSelectedOp(null); setRound(1); setScore(0) }}
              className="bubble-btn px-6 py-3 text-base"
              style={{ background: `linear-gradient(135deg, ${theme.secondary}, ${theme.primary})` }}>
              Try Another
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
              className="bubble-btn px-6 py-3 text-base"
              style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
              Home 🏠
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  const op     = OPS[selectedOp]
  const opColour = op.colour

  return (
    <div className="min-h-screen flex flex-col overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${theme.bg} 0%, white 60%, ${theme.bg} 100%)` }}>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 pb-2 pt-safe shrink-0">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSelectedOp(null)}
          className="w-11 h-11 rounded-full flex items-center justify-center shadow"
          style={{ background: theme.card, color: theme.text }}>←</motion.button>

        <div className="text-center">
          <div className="flex items-center gap-1.5 justify-center">
            <span className="text-xl">{op.icon}</span>
            <p className="font-bubble text-base" style={{ color: opColour }}>{op.label}</p>
          </div>
          {/* Round progress dots */}
          <div className="flex gap-1 justify-center mt-0.5">
            {Array.from({ length: totalRounds }).map((_, i) => (
              <div key={i} className="rounded-full transition-all duration-300"
                style={{
                  width: i < round - 1 ? 10 : 6,
                  height: 6,
                  background: i < round - 1 ? opColour : i === round - 1 ? opColour + '80' : 'rgba(0,0,0,0.1)',
                }} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: opColour + '20' }}>
          <span className="text-base">⭐</span>
          <span className="font-bubble text-base" style={{ color: opColour }}>{score}</span>
        </div>
      </div>

      {/* ── Question card ── */}
      <div className="flex-1 overflow-y-auto scroll-ios px-4 pb-32">
        <AnimatePresence mode="wait">
          {question && (
            <motion.div
              key={`${round}-${question.q}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ type: 'spring', stiffness: 340, damping: 26 }}
              className="rounded-3xl overflow-hidden shadow-xl mb-4"
              style={{ background: 'white', border: `3px solid ${opColour}30` }}
            >
              {/* Coloured header */}
              <div className="px-5 py-3 flex items-center justify-between"
                style={{ background: `linear-gradient(135deg, ${opColour}, ${opColour}CC)` }}>
                <div className="flex-1 min-w-0">
                  <p className="font-round text-white/70 text-xs mb-0.5">🎯 {OP_OBJECTIVES[selectedOp]}</p>
                  <p className="font-bubble text-white text-xl leading-tight">{question.q}</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => speak(question.q, { mood: 'instruct' })}
                  className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center shrink-0 ml-2"
                >
                  <span className="text-xl">🔊</span>
                </motion.button>
              </div>

              {/* Visual teaching area */}
              <div className="px-4 py-5 flex justify-center">
                {question.display === 'add' && (
                  <AddVisual n1={question.n1} n2={question.n2}
                    emoji1={objects.a} emoji2={objects.b} colour={opColour} />
                )}
                {question.display === 'sub' && (
                  <SubVisual n1={question.n1} n2={question.n2}
                    emoji={objects.a} colour={opColour} />
                )}
                {question.display === 'mul' && (
                  <MulVisual n1={question.n1} n2={question.n2}
                    emoji={objects.a} colour={opColour} />
                )}
                {question.display === 'count' && (
                  <CountVisual n={question.n1} emoji={objects.a} colour={opColour} />
                )}
                {(question.display === 'onemore' || question.display === 'oneless') && (
                  <OneMorLessVisual
                    n={question.n1}
                    answer={question.a}
                    type={question.display === 'onemore' ? 'more' : 'less'}
                    colour={opColour}
                    revealAnswer={feedback?.type === 'correct'}
                  />
                )}
                {question.display === 'add1' && (
                  <OneMorLessVisual n={question.n1} answer={question.a} type="more" colour={opColour} revealAnswer={feedback?.type === 'correct'} />
                )}
                {question.display === 'sub1' && (
                  <OneMorLessVisual n={question.n1} answer={question.a} type="less" colour={opColour} revealAnswer={feedback?.type === 'correct'} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <InteractiveYaagvi reaction={yaagviReaction} placement="strip" />

        {/* ── Answer choices ── */}
        <div className="grid grid-cols-2 gap-3">
          {choices.map((choice, ci) => {
            const isChosen  = selected === choice
            const isCorrect = question && choice === question.a
            const showRight = isChosen && isCorrect
            const showWrong = isChosen && !isCorrect
            const showReveal = feedback?.type === 'correct' && !isChosen && selected !== null && isCorrect

            return (
              <motion.button
                key={`${round}-${ci}`}
                data-answer-choice={choice}
                data-correct-answer={isCorrect ? 'true' : 'false'}
                initial={{ opacity: 0, y: 18, scale: 0.85 }}
                animate={{
                  opacity: 1, y: 0,
                  scale: showRight ? [1, 1.08, 1] : showWrong ? [1, 0.93, 1] : 1,
                }}
                transition={{ delay: ci * 0.07, type: 'spring', stiffness: 320, damping: 20 }}
                whileTap={!selected ? { scale: 0.91 } : {}}
                onClick={() => handleChoice(choice)}
                className="rounded-2xl py-4 px-3 flex flex-col items-center gap-1.5 shadow-md transition-all duration-200 relative overflow-hidden"
                style={{
                  background: showRight ? '#22C55E'
                    : showWrong   ? '#EF4444'
                    : showReveal  ? '#22C55E'
                    : 'white',
                  border: `3px solid ${
                    showRight || showReveal ? '#16A34A'
                    : showWrong ? '#DC2626'
                    : opColour + '50'
                  }`,
                  opacity: selected && !isChosen && !isCorrect ? 0.45 : 1,
                  cursor: selected ? 'default' : 'pointer',
                  minHeight: 90,
                }}
              >
                {/* Correct/wrong icon overlay */}
                {showRight  && <span className="text-2xl">✅</span>}
                {showWrong  && <span className="text-2xl">❌</span>}
                {showReveal && <span className="text-2xl">✅</span>}

                {/* Number only — no dot visual so child must count to match */}
                <span className="font-bubble text-4xl leading-none"
                  style={{ color: showRight || showWrong || showReveal ? 'white' : opColour }}>
                  {choice}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* ── Skill hint (after 2 wrong) ── */}
      {showHint && (
        <SkillHint
          hint={getHint('math', selectedOp)}
          onClose={() => {
            setShowHint(false)
            reactYaagvi('question')
          }}
          onTryAgain={() => {
            setShowHint(false)
            setConsecutiveWrong(0)
            setSelected(null)
            setFeedback(null)
            setAnswered(false)
            reactYaagvi('start')
          }}
        />
      )}

    </div>
  )
}
