import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useSpeech } from '../hooks/useSpeech'
import { THEMES } from '../themes'
import { getExerciseCompletionReward } from '../utils/moduleScoring'
import { useVisibilityTimers } from '../hooks/useVisibilityTimers'

const EXERCISES = [
  { name: 'Star Jumps',        emoji: '⭐', reps: 10, colour: '#F59E0B', animation: 'starjump',
    instruction: 'Jump and spread your arms and legs wide — like a star!' },
  { name: 'Touch Your Toes',   emoji: '🦶', reps: 8,  colour: '#22C55E', animation: 'bend',
    instruction: 'Bend down slowly and try to touch your toes, then stand back up tall!' },
  { name: 'Reach for Stars',   emoji: '🌟', reps: 10, colour: '#A78BFA', animation: 'reach',
    instruction: 'Stretch both arms way up high — reach for the stars!' },
  { name: 'March on the Spot', emoji: '🥁', reps: 20, colour: '#3B82F6', animation: 'march',
    instruction: 'Lift your knees up high and swing your arms — left, right, left, right!' },
  { name: 'Spin Around',       emoji: '🌀', reps: 4,  colour: '#EC4899', animation: 'spin',
    instruction: 'Spin slowly in a full circle, then spin the other way!' },
  { name: 'Clap Your Hands',   emoji: '👏', reps: 15, colour: '#F97316', animation: 'clap',
    instruction: 'Clap above your head, then clap at your sides. Keep going!' },
  { name: 'Frog Hops',         emoji: '🐸', reps: 8,  colour: '#4ADE80', animation: 'hop',
    instruction: 'Crouch down low like a frog, then spring up and jump! Ribbit!' },
  { name: 'Arm Circles',       emoji: '💪', reps: 8,  colour: '#14B8A6', animation: 'circle',
    instruction: 'Make big slow circles with both arms — forward, then backwards!' },
]

// ── Per-exercise animation parameters ────────────────────────────────────────
// COUNTER INTERVAL = 900ms. For perfect sync:
//   repeatType:'reverse' → total cycle = 2 × dur. Set dur=0.45 → cycle=900ms ✓
//   repeatType:'loop'    → total cycle = dur.      Set dur=0.9  → cycle=900ms ✓
// March is faster (2 steps per count) → dur=0.225 → cycle=450ms (2 per 900ms) ✓
const ANIM = {
  starjump: {
    leftArm:  { r: [-15, -130], dur: 0.45 },
    rightArm: { r: [15,   130], dur: 0.45 },
    leftLeg:  { r: [-5,   -32], dur: 0.45 },
    rightLeg: { r: [5,     32], dur: 0.45 },
    bodyY:    [-2, -22],  bodyDur: 0.45,
  },
  bend: {
    leftArm:  { r: [-15, 55],  dur: 0.45 },
    rightArm: { r: [15, -55],  dur: 0.45 },
    leftLeg:  { r: [-5],       dur: 0.45 },
    rightLeg: { r: [5],        dur: 0.45 },
    bodyY:    [0, 12],  bodyR: [0, 65],  bodyDur: 0.45,
  },
  reach: {
    leftArm:  { r: [-15, -168], dur: 0.45 },
    rightArm: { r: [15,   168], dur: 0.45 },
    leftLeg:  { r: [-8],        dur: 0.45 },
    rightLeg: { r: [8],         dur: 0.45 },
    bodyY:    [0, -18],  bodyDur: 0.45,
  },
  // Counter-phase march: leftLeg & rightArm in sync; rightLeg starts raised
  march: {
    leftArm:  { r: [22, -28],  dur: 0.225 },
    rightArm: { r: [-22,  28], dur: 0.225 },
    leftLeg:  { r: [-5, -48],  dur: 0.225 },
    rightLeg: { r: [38,   5],  dur: 0.225 },
    bodyY:    [0, -9],  bodyDur: 0.225,
  },
  spin: {
    leftArm:  { r: [-55], dur: 0.9 },
    rightArm: { r: [55],  dur: 0.9 },
    leftLeg:  { r: [-18], dur: 0.9 },
    rightLeg: { r: [18],  dur: 0.9 },
    bodyY:    [0],  bodyDur: 0.9,
    charR:    [0, 360],  charDur: 0.9,  // one full spin per count
  },
  clap: {
    leftArm:  { r: [-15, -92], dur: 0.45 },
    rightArm: { r: [15,   92], dur: 0.45 },
    leftLeg:  { r: [-5],       dur: 0.45 },
    rightLeg: { r: [5],        dur: 0.45 },
    bodyY:    [0, -6],  bodyDur: 0.45,
  },
  hop: {
    leftArm:  { r: [-58], dur: 0.45 },
    rightArm: { r: [58],  dur: 0.45 },
    leftLeg:  { r: [-34], dur: 0.45 },
    rightLeg: { r: [34],  dur: 0.45 },
    bodyY:    [6, -52],  bodyDur: 0.45, bodyEase: 'easeOut',
  },
  circle: {
    leftArm:  { r: [-15, -375], dur: 0.9, loop: true },  // one full circle per count
    rightArm: { r: [15,   375], dur: 0.9, loop: true },
    leftLeg:  { r: [-8],        dur: 0.9 },
    rightLeg: { r: [8],         dur: 0.9 },
    bodyY:    [0, -5],  bodyDur: 0.45,
  },
}

function makeTrans(dur = 0.7, ease = 'easeInOut', loop = false) {
  return { duration: dur, repeat: Infinity, repeatType: loop ? 'loop' : 'reverse', ease }
}

// ── SVG full-body character ───────────────────────────────────────────────────
function Character({ exercise, isAnimating }) {
  const a   = ANIM[exercise.animation] || ANIM.march
  const col = exercise.colour
  const skin = '#FBBF24'
  const hair = '#7C3AED'

  // Helper: only animate when exercise is running
  const r = (arr) => isAnimating ? arr : [arr[0]]

  const armTrans  = (d = a.leftArm.dur,  l = a.leftArm.loop)  => makeTrans(d, 'easeInOut', l)
  const rArmTrans = (d = a.rightArm.dur, l = a.rightArm.loop) => makeTrans(d, 'easeInOut', l)
  const legTrans  = makeTrans(a.leftLeg?.dur  || 0.6)
  const rLegTrans = makeTrans(a.rightLeg?.dur || 0.6)
  const bodyTrans = makeTrans(a.bodyDur || 0.7, a.bodyEase || 'easeInOut')
  const charTrans = a.charR ? makeTrans(a.charDur, 'linear', true) : {}

  return (
    <svg viewBox="0 0 200 330" width="200" height="330" style={{ overflow: 'visible' }}>
      {/* Ground shadow */}
      <motion.ellipse cx="100" cy="323" rx="36" ry="7" fill="rgba(0,0,0,0.10)"
        animate={isAnimating ? { scaleX: [1, 0.7, 1] } : {}}
        transition={makeTrans(a.bodyDur || 0.7)} />

      {/* ── Outer group — whole-body spin ──────────────────────────────────── */}
      <motion.g
        style={{ transformOrigin: '100px 160px' }}
        animate={a.charR ? (isAnimating ? { rotate: a.charR } : { rotate: 0 }) : { rotate: 0 }}
        transition={a.charR ? charTrans : {}}>

        {/* ── LEGS (behind body) ─────────────────────────────────────────── */}

        {/* Left leg */}
        <motion.g style={{ transformOrigin: '83px 202px' }}
          animate={{ rotate: r(a.leftLeg?.r || [-5]) }}
          transition={legTrans}>
          {/* Thigh */}
          <rect x="71" y="198" width="24" height="42" rx="12" fill={skin} />
          {/* Shin */}
          <rect x="73" y="236" width="20" height="38" rx="10" fill={skin} />
          {/* Sock */}
          <rect x="73" y="264" width="20" height="12" rx="6" fill="white" />
          {/* Shoe */}
          <ellipse cx="85" cy="278" rx="18" ry="9" fill="#1F2937" />
          <ellipse cx="87" cy="276" rx="13" ry="6" fill="#374151" />
        </motion.g>

        {/* Right leg */}
        <motion.g style={{ transformOrigin: '117px 202px' }}
          animate={{ rotate: r(a.rightLeg?.r || [5]) }}
          transition={rLegTrans}>
          <rect x="105" y="198" width="24" height="42" rx="12" fill={skin} />
          <rect x="107" y="236" width="20" height="38" rx="10" fill={skin} />
          <rect x="107" y="264" width="20" height="12" rx="6" fill="white" />
          <ellipse cx="115" cy="278" rx="18" ry="9" fill="#1F2937" />
          <ellipse cx="113" cy="276" rx="13" ry="6" fill="#374151" />
        </motion.g>

        {/* ── BODY GROUP (torso + head + arms) ───────────────────────────── */}
        <motion.g
          style={{ transformOrigin: '100px 198px' }}
          animate={{ y: r(a.bodyY || [0]), rotate: r(a.bodyR ? a.bodyR : [0]) }}
          transition={bodyTrans}>

          {/* ── LEFT ARM ──────────────────────────────────────────────────── */}
          <motion.g style={{ transformOrigin: '72px 93px' }}
            animate={{ rotate: r(a.leftArm?.r || [-15]) }}
            transition={armTrans(a.leftArm?.dur, a.leftArm?.loop)}>
            {/* Upper arm */}
            <rect x="56" y="87" width="22" height="44" rx="11" fill={skin} />
            {/* Elbow bump */}
            <circle cx="67" cy="131" r="12" fill={skin} />
            {/* Forearm */}
            <rect x="58" y="128" width="20" height="38" rx="10" fill={skin} />
            {/* Hand */}
            <circle cx="68" cy="170" r="13" fill={skin} />
            <circle cx="68" cy="170" r="10" fill="#F59E0B" />
          </motion.g>

          {/* ── RIGHT ARM ─────────────────────────────────────────────────── */}
          <motion.g style={{ transformOrigin: '128px 93px' }}
            animate={{ rotate: r(a.rightArm?.r || [15]) }}
            transition={rArmTrans(a.rightArm?.dur, a.rightArm?.loop)}>
            <rect x="122" y="87" width="22" height="44" rx="11" fill={skin} />
            <circle cx="133" cy="131" r="12" fill={skin} />
            <rect x="122" y="128" width="20" height="38" rx="10" fill={skin} />
            <circle cx="132" cy="170" r="13" fill={skin} />
            <circle cx="132" cy="170" r="10" fill="#F59E0B" />
          </motion.g>

          {/* ── TORSO ─────────────────────────────────────────────────────── */}
          {/* Shirt */}
          <rect x="68" y="78" width="64" height="88" rx="18" fill={col} />
          {/* Collar */}
          <path d="M88,78 Q100,90 112,78" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="4" strokeLinecap="round" />
          {/* Shirt pocket detail */}
          <rect x="76" y="96" width="18" height="14" rx="4" fill="rgba(255,255,255,0.20)" />
          {/* Shorts */}
          <rect x="68" y="158" width="64" height="48" rx="12" fill="#1D4ED8" />
          <line x1="100" y1="158" x2="100" y2="206" stroke="#1E3A8A" strokeWidth="3" />
          {/* Waistband */}
          <rect x="68" y="156" width="64" height="8" rx="4" fill="#1E40AF" />

          {/* ── NECK ──────────────────────────────────────────────────────── */}
          <rect x="88" y="66" width="24" height="20" rx="8" fill={skin} />

          {/* ── HEAD ──────────────────────────────────────────────────────── */}
          <circle cx="100" cy="42" r="34" fill={skin} />
          {/* Hair */}
          <path d="M66,36 Q100,8 134,36 Q128,16 100,12 Q72,16 66,36Z" fill={hair} />
          {/* Ear left */}
          <ellipse cx="66" cy="44" rx="7" ry="10" fill={skin} />
          {/* Ear right */}
          <ellipse cx="134" cy="44" rx="7" ry="10" fill={skin} />
          {/* Eyes white */}
          <ellipse cx="89" cy="40" rx="8" ry="9" fill="white" />
          <ellipse cx="111" cy="40" rx="8" ry="9" fill="white" />
          {/* Iris */}
          <circle cx="90" cy="41" r="5" fill="#1F2937" />
          <circle cx="112" cy="41" r="5" fill="#1F2937" />
          {/* Eye shine */}
          <circle cx="92" cy="39" r="2" fill="white" />
          <circle cx="114" cy="39" r="2" fill="white" />
          {/* Eyebrows */}
          <path d="M82,32 Q89,28 96,32" fill="none" stroke={hair} strokeWidth="3" strokeLinecap="round" />
          <path d="M104,32 Q111,28 118,32" fill="none" stroke={hair} strokeWidth="3" strokeLinecap="round" />
          {/* Nose */}
          <ellipse cx="100" cy="50" rx="4" ry="3" fill="#F59E0B" />
          {/* Smile */}
          <path d="M88,56 Q100,68 112,56" fill="none" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
          {/* Cheeks */}
          <ellipse cx="78" cy="54" rx="10" ry="7" fill="#FCA5A5" opacity="0.55" />
          <ellipse cx="122" cy="54" rx="10" ry="7" fill="#FCA5A5" opacity="0.55" />
        </motion.g>
      </motion.g>
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function FunExercise({ avatar, onAddStars, onBack, profileName }) {
  const theme      = THEMES[avatar] || THEMES.rumi
  const { speak }  = useSpeech()
  const [screen,   setScreen]   = useState('menu')
  const [exIdx,    setExIdx]    = useState(0)
  const [counter,  setCounter]  = useState(0)
  const [running,  setRunning]  = useState(false)
  const [sessionMode, setSessionMode] = useState('full')
  const [earnedWorkoutReward, setEarnedWorkoutReward] = useState(false)
  const [completedCurrentExercise, setCompletedCurrentExercise] = useState(false)
  const intervalRef = useRef(null)
  const ex = EXERCISES[exIdx]
  const { track } = useVisibilityTimers()

  const stopTimer = useCallback(() => clearInterval(intervalRef.current), [])

  const startExercise = (idx, nextSessionMode = sessionMode) => {
    stopTimer()
    const e = EXERCISES[idx]
    setSessionMode(nextSessionMode)
    setEarnedWorkoutReward(false)
    setCompletedCurrentExercise(false)
    setExIdx(idx)
    setCounter(0)
    setRunning(true)
    setScreen('exercise')
    speak(`Exercise ${idx + 1}: ${e.name}! ${e.instruction} Let's count to ${e.reps}!`, { mood: 'celebrate' })
    let count = 0
    intervalRef.current = setInterval(() => {
      count++
      setCounter(count)
      if (count >= e.reps) {
        clearInterval(intervalRef.current)
        setRunning(false)
        setCompletedCurrentExercise(true)
        speak(`${count}! Fantastic! You did it!`, { mood: 'celebrate' })
        confetti({ particleCount: 80, spread: 100, origin: { x: 0.5, y: 0.3 } })
        track(() => {
          const reward = getExerciseCompletionReward({
            sessionMode: nextSessionMode,
            exerciseIndex: idx,
            totalExercises: EXERCISES.length,
          })

          if (reward) {
            setEarnedWorkoutReward(true)
            setScreen('done')
            speak(`Amazing work, ${profileName || 'superstar'}! You finished all ${EXERCISES.length} exercises! Your body is getting stronger!`, { mood: 'celebrate' })
            onAddStars('exercise', reward.stars, reward.sessionData)
          } else if (nextSessionMode === 'single') {
            setScreen('done')
            speak(`Great job, ${profileName || 'superstar'}! You finished ${e.name}!`, { mood: 'celebrate' })
          } else {
            setScreen('rest')
          }
        }, 1500)
      }
    }, 900)
  }

  useEffect(() => () => stopTimer(), [])

  // ── Done ────────────────────────────────────────────────────────────────────
  if (screen === 'done') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
      style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
        <div className="text-8xl mb-4">🏆</div>
        <h2 className="font-bubble text-4xl shimmer-text mb-3">
          {sessionMode === 'single' ? 'Exercise Done!' : earnedWorkoutReward ? 'Workout Done!' : 'Session Done!'}
        </h2>
        <p className="font-round text-xl mb-6" style={{ color: theme.text }}>
          {sessionMode === 'single'
            ? completedCurrentExercise
              ? `${profileName ? `${profileName}, ` : ''}you finished ${ex.name}!`
              : `${profileName ? `${profileName}, ` : ''}nice effort with ${ex.name}!`
            : earnedWorkoutReward
              ? `${profileName ? `Amazing, ${profileName}!` : 'Amazing!'} All ${EXERCISES.length} exercises complete!`
              : `${profileName ? `${profileName}, ` : ''}nice movement today!`}
        </p>
        {earnedWorkoutReward && <div className="text-4xl mb-6">⭐⭐⭐⭐⭐</div>}
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          className="bubble-btn px-8 py-4 text-xl"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
          Back to Home 🏠
        </motion.button>
      </motion.div>
    </div>
  )

  // ── Rest ────────────────────────────────────────────────────────────────────
  if (screen === 'rest') {
    const next = EXERCISES[exIdx + 1]
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
        style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
        <div className="text-7xl mb-4">😮‍💨</div>
        <h2 className="font-bubble text-3xl mb-2" style={{ color: theme.primary }}>Take a breath!</h2>
        <p className="font-round text-lg mb-1" style={{ color: theme.text }}>
          {EXERCISES.length - exIdx - 1} exercises to go!
        </p>
        <p className="font-round text-base opacity-70 mb-8" style={{ color: theme.text }}>
          Next: {next.emoji} <strong>{next.name}</strong>
        </p>
        <motion.button whileTap={{ scale: 0.9 }}
          onClick={() => { speak(`Ready! ${EXERCISES[exIdx + 1].name}!`, { mood: 'instruct' }); track(() => startExercise(exIdx + 1, 'full'), 800) }}
          className="bubble-btn px-8 py-4 text-xl"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
          I'm Ready! 💪
        </motion.button>
      </div>
    )
  }

  // ── Menu ────────────────────────────────────────────────────────────────────
  if (screen === 'menu') return (
    <div className="min-h-screen flex flex-col"
      style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
      <div className="flex items-center justify-between px-4 pt-safe pb-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center shadow"
          style={{ background: theme.card, color: theme.text }}>←</motion.button>
        <p className="font-bubble text-xl" style={{ color: theme.primary }}>🏃 Fun Exercise</p>
        <div className="w-10" />
      </div>
      <div className="px-4 mb-5">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => startExercise(0, 'full')}
          className="w-full py-5 rounded-3xl font-bubble text-2xl text-white shadow-xl"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
          🚀 Start Full Workout!
          <p className="font-round text-sm mt-1 text-white/80">{EXERCISES.length} exercises · Let's move!</p>
        </motion.button>
      </div>
      <p className="font-bubble text-base px-4 mb-3" style={{ color: theme.primary }}>Or pick one:</p>
      <div className="grid grid-cols-2 gap-3 px-4 pb-6">
        {EXERCISES.map((e, i) => (
          <motion.button key={e.name} whileTap={{ scale: 0.93 }} onClick={() => startExercise(i, 'single')}
            className="rounded-3xl p-4 flex flex-col items-center gap-2 shadow-md"
            style={{ background: theme.card }}>
            <span className="text-4xl">{e.emoji}</span>
            <span className="font-bubble text-sm text-center" style={{ color: theme.text }}>{e.name}</span>
            <span className="font-round text-xs opacity-60" style={{ color: theme.text }}>× {e.reps}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )

  // ── Exercise screen ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-safe pb-2">
        <motion.button whileTap={{ scale: 0.9 }}
          onClick={() => { stopTimer(); setRunning(false); setScreen('menu') }}
          className="w-10 h-10 rounded-full flex items-center justify-center shadow"
          style={{ background: theme.card, color: theme.text }}>←</motion.button>
        <div className="text-center">
          <p className="font-bubble text-xl" style={{ color: theme.primary }}>{ex.emoji} {ex.name}</p>
          <p className="font-round text-xs opacity-60" style={{ color: theme.text }}>
            Exercise {exIdx + 1} of {EXERCISES.length}
          </p>
        </div>
        <div className="w-10" />
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 justify-center mb-2">
        {EXERCISES.map((_, i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-full transition-all"
            style={{ background: i <= exIdx ? theme.primary : theme.secondary + '44' }} />
        ))}
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4">

        {/* Full-body character */}
        <div className="relative flex items-end justify-center"
          style={{ height: 230, width: 200 }}>
          <div style={{ position: 'absolute', bottom: 0 }}>
            <Character exercise={ex} isAnimating={running} />
          </div>
          {/* Exercise emoji badge */}
          <motion.div
            animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="absolute -top-2 -right-2 text-4xl z-10">
            {ex.emoji}
          </motion.div>
        </div>

        {/* Counter ring */}
        <motion.div key={counter} initial={{ scale: 0.85 }} animate={{ scale: 1 }}
          className="w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-xl"
          style={{ background: `linear-gradient(135deg, ${ex.colour}, ${ex.colour}99)` }}>
          <span className="font-bubble text-5xl text-white leading-none">{counter}</span>
          <span className="font-round text-white/80 text-sm">of {ex.reps}</span>
        </motion.div>

        {/* Instruction */}
        <div className="w-full px-4 py-3 rounded-2xl text-center"
          style={{ background: theme.card }}>
          <p className="font-round text-sm" style={{ color: theme.text }}>{ex.instruction}</p>
        </div>

        {/* Skip */}
        <motion.button whileTap={{ scale: 0.9 }}
          onClick={() => {
            stopTimer(); setRunning(false)
            speak('Great effort! Moving on!', { mood: 'celebrate' })
            if (sessionMode === 'single') {
              setScreen('done')
            } else if (exIdx + 1 < EXERCISES.length) {
              setScreen('rest')
            } else {
              setScreen('done')
            }
          }}
          className="px-5 py-2 rounded-full font-round text-sm opacity-60"
          style={{ background: theme.secondary + '44', color: theme.text }}>
          Skip this one →
        </motion.button>
      </div>
      <div className="h-4" />
    </div>
  )
}
