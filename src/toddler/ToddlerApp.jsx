import React, { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useProgress } from '../hooks/useProgress'
import JarvisOrb from '../components/JarvisOrb'
import RetentionPanel from '../components/RetentionWidgets'
import MoodCheckIn from '../components/MoodCheckIn'
import ParentZone from '../components/ParentZone'
import { formatLocalDate } from '../utils/date.js'
import { shouldSendAutoDigest, markDigestSent, buildDigestPayload, sendDigestEmail } from '../utils/weeklyDigest.js'
import { useSpeech } from '../hooks/useSpeech'

// ── Toddler themes (3–4 year olds) ───────────────────────────────────────────
const TODDLER_THEMES = {
  jj: {
    name: 'Sunny',
    emoji: '☀️',
    bg: 'linear-gradient(160deg, #FF6B35 0%, #FFD93D 60%, #FF8E53 100%)',
    card: 'rgba(255,255,255,0.22)',
    primary: '#FF6B35',
    glow: '#FFD93D',
    particles: ['🌈', '⭐', '🎵', '🎶', '🌟'],
    tagline: 'Every day is a sunshine day!',
  },
  cloudy: {
    name: 'Cloudy',
    emoji: '⛅',
    bg: 'linear-gradient(160deg, #00B4FF 0%, #7DD8FF 60%, #00D4AA 100%)',
    card: 'rgba(255,255,255,0.22)',
    primary: '#00B4FF',
    glow: '#7DD8FF',
    particles: ['⛅', '⭐', '🌈', '🌤️', '✨'],
    tagline: 'Let\'s explore and play!',
  },
  bubbles: {
    name: 'Bubbles',
    emoji: '🐠',
    bg: 'linear-gradient(160deg, #1B4FBA 0%, #4A90D9 60%, #00C9A7 100%)',
    card: 'rgba(255,255,255,0.22)',
    primary: '#1B4FBA',
    glow: '#4A90D9',
    particles: ['🐠', '🌊', '⭐', '🐚', '💧'],
    tagline: 'Splash into learning!',
  },
  bingo: {
    name: 'Pip',
    emoji: '🟠',
    bg: 'linear-gradient(160deg, #FF8C42 0%, #FFD166 60%, #FF6B9D 100%)',
    card: 'rgba(255,255,255,0.22)',
    primary: '#FF8C42',
    glow: '#FFD166',
    particles: ['🎨', '⭐', '🌸', '🎀', '🌈'],
    tagline: 'Learning is the best adventure!',
  },
}

// ── Module registry (build out incrementally) ─────────────────────────────────
const TODDLER_MODULES = [
  { id: 'colours',  label: 'Colours',     emoji: '🎨', desc: 'Learn colours!',   bg: '#FF6B9D', comingSoon: false },
  { id: 'shapes',   label: 'Shapes',      emoji: '🔷', desc: 'Find the shapes!', bg: '#8B00FF', comingSoon: false },
  { id: 'numbers',  label: '1 2 3',       emoji: '🔢', desc: 'Count with me!',   bg: '#00B4FF', comingSoon: false },
  { id: 'animals',  label: 'Animals',     emoji: '🐘', desc: 'Animal sounds!',   bg: '#22C55E', comingSoon: false },
  { id: 'alphabet', label: 'A B C',       emoji: '🔤', desc: 'Learn letters!',   bg: '#FF9A3C', comingSoon: true  },
  { id: 'songs',    label: 'Songs',       emoji: '🎵', desc: 'Sing along!',      bg: '#E21C1C', comingSoon: true  },
]

// ── Avatar selector ───────────────────────────────────────────────────────────
function todayStamp() {
  return formatLocalDate()
}

function getToddlerDailyPath(progress = {}) {
  const today = todayStamp()
  const playable = TODDLER_MODULES.filter(module => !module.comingSoon)
  const seed = new Date().getDate()
  const first = playable[seed % playable.length] || playable[0]
  const second = playable[(seed + 2) % playable.length] || playable[1] || first
  const steps = [first, second].filter(Boolean).map(module => ({
    module,
    done: progress[module.id]?.lastPlayedDate === today,
  }))

  return {
    steps,
    next: steps.find(step => !step.done) || steps[steps.length - 1],
    doneCount: steps.filter(step => step.done).length,
  }
}

function ToddlerAvatarSelector({ onSelect }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(160deg, #1a0533 0%, #2d0a5e 50%, #0a1a3d 100%)' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8">
        <div className="text-6xl mb-3">🧸</div>
        <h1 className="font-bubble text-white text-3xl" style={{ textShadow: '0 0 30px rgba(255,215,0,0.8)' }}>
          Pick your buddy!
        </h1>
      </motion.div>

      <div className="grid grid-cols-2 gap-5 w-full max-w-sm">
        {Object.entries(TODDLER_THEMES).map(([key, theme], idx) => (
          <motion.button
            key={key}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1, type: 'spring', stiffness: 300 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelect(key)}
            className="flex flex-col items-center gap-3 p-5 rounded-3xl"
            style={{ background: theme.bg, boxShadow: `0 8px 24px ${theme.primary}60`, border: '3px solid rgba(255,255,255,0.3)' }}
          >
            <span className="text-6xl">{theme.emoji}</span>
            <span className="font-bubble text-white text-lg drop-shadow">{theme.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ── Coming Soon placeholder ───────────────────────────────────────────────────
function ComingSoonModule({ theme, onBack }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: theme.bg }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
        className="text-center">
        <div className="text-8xl mb-6">🚧</div>
        <h2 className="font-bubble text-white text-3xl mb-3">Coming Soon!</h2>
        <p className="font-round text-white/80 text-base mb-8">We're building this for you!</p>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          className="px-8 py-4 rounded-3xl font-bubble text-white text-xl"
          style={{ background: 'rgba(255,255,255,0.25)', border: '3px solid rgba(255,255,255,0.5)' }}>
          ← Go Back
        </motion.button>
      </motion.div>
    </div>
  )
}

// ── Colours module ────────────────────────────────────────────────────────────
const COLOUR_QUESTIONS = [
  { colour: 'Red',    hex: '#EF4444', emoji: '🍎', options: ['Red', 'Blue', 'Green'] },
  { colour: 'Blue',   hex: '#3B82F6', emoji: '🫐', options: ['Yellow', 'Blue', 'Pink'] },
  { colour: 'Yellow', hex: '#EAB308', emoji: '🌻', options: ['Yellow', 'Purple', 'Red'] },
  { colour: 'Green',  hex: '#22C55E', emoji: '🐸', options: ['Orange', 'Green', 'Blue'] },
  { colour: 'Pink',   hex: '#EC4899', emoji: '🌸', options: ['Pink', 'Green', 'Yellow'] },
]

function ColoursModule({ theme, onDone, onBack }) {
  const [q, setQ] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const current = COLOUR_QUESTIONS[q]
  const { speak } = useSpeech()
  const spokenQ = useRef(-1)
  const lockedRef = useRef(false)
  const completedRef = useRef(false)
  const timersRef = useRef([])

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }, [])

  useEffect(() => {
    if (spokenQ.current === q) return
    spokenQ.current = q
    speak(`What colour is this?`, { mood: 'question', rate: 0.8, queue: true })
  }, [q, speak])

  const handleAnswer = (answer) => {
    if (lockedRef.current || completedRef.current) return
    lockedRef.current = true
    const correct = answer === current.colour
    const nextScore = score + (correct ? 1 : 0)
    if (correct) {
      setScore(nextScore)
      confetti({ particleCount: 60, spread: 80, origin: { x: 0.5, y: 0.4 } })
      speak(`Yes! That is ${current.colour}! Amazing!`, { mood: 'celebrate', rate: 0.8 })
    } else {
      speak(`This colour is ${current.colour}. Keep going!`, { mood: 'instruct', rate: 0.8 })
    }
    setFeedback(correct ? 'correct' : 'wrong')
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter(t => t !== id)
      setFeedback(null)
      if (q + 1 >= COLOUR_QUESTIONS.length) {
        completedRef.current = true
        onDone(nextScore)
      } else {
        setQ(v => v + 1)
        lockedRef.current = false
      }
    }, 1200)
    timersRef.current.push(id)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: theme.bg }}>
      <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
        className="absolute top-safe left-4 mt-3 font-round text-white/70 text-sm">
        ← Back
      </motion.button>
      <div className="text-center mb-8">
        <div className="text-8xl mb-4">{current.emoji}</div>
        <p className="font-bubble text-white text-2xl">What colour is this?</p>
        <div className="w-24 h-24 rounded-full mx-auto mt-4 shadow-2xl border-4 border-white/50"
          style={{ background: current.hex }} />
      </div>
      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        {current.options.map(opt => (
          <motion.button key={opt} whileTap={{ scale: 0.85 }} onClick={() => handleAnswer(opt)}
            className="py-4 rounded-2xl font-bubble text-white text-lg shadow-lg"
            style={{
              background: feedback === 'correct' && opt === current.colour
                ? '#22C55E'
                : feedback === 'wrong' && opt === current.colour
                  ? '#22C55E'
                  : 'rgba(255,255,255,0.25)',
              border: '3px solid rgba(255,255,255,0.4)',
            }}>
            {opt}
          </motion.button>
        ))}
      </div>
      <p className="font-round text-white/70 text-sm mt-8">
        {q + 1} / {COLOUR_QUESTIONS.length}
      </p>
    </div>
  )
}

// ── Shapes module ─────────────────────────────────────────────────────────────
const SHAPE_QUESTIONS = [
  { shape: 'Circle',   svg: <circle cx="50" cy="50" r="40" />,                                     options: ['Circle', 'Square', 'Triangle'] },
  { shape: 'Square',   svg: <rect x="10" y="10" width="80" height="80" />,                         options: ['Triangle', 'Square', 'Circle'] },
  { shape: 'Triangle', svg: <polygon points="50,10 90,90 10,90" />,                                options: ['Square', 'Triangle', 'Star']   },
  { shape: 'Star',     svg: <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" />, options: ['Star', 'Circle', 'Square'] },
  { shape: 'Heart',    svg: <path d="M50,80 C10,50 10,10 50,30 C90,10 90,50 50,80Z" />,            options: ['Heart', 'Star', 'Triangle']    },
]

function ShapesModule({ theme, onDone, onBack }) {
  const [q, setQ] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const current = SHAPE_QUESTIONS[q]
  const { speak } = useSpeech()
  const spokenQ = useRef(-1)
  const lockedRef = useRef(false)
  const completedRef = useRef(false)
  const timersRef = useRef([])

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }, [])

  useEffect(() => {
    if (spokenQ.current === q) return
    spokenQ.current = q
    speak(`What shape is this?`, { mood: 'question', rate: 0.8, queue: true })
  }, [q, speak])

  const handleAnswer = (answer) => {
    if (lockedRef.current || completedRef.current) return
    lockedRef.current = true
    const correct = answer === current.shape
    const nextScore = score + (correct ? 1 : 0)
    if (correct) {
      setScore(nextScore)
      confetti({ particleCount: 60, spread: 80, origin: { x: 0.5, y: 0.4 } })
      speak(`Yes! It is a ${current.shape}! Well done!`, { mood: 'celebrate', rate: 0.8 })
    } else {
      speak(`This is a ${current.shape}. Have another try!`, { mood: 'instruct', rate: 0.8 })
    }
    setFeedback(correct ? 'correct' : 'wrong')
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter(t => t !== id)
      setFeedback(null)
      if (q + 1 >= SHAPE_QUESTIONS.length) {
        completedRef.current = true
        onDone(nextScore)
      } else {
        setQ(v => v + 1)
        lockedRef.current = false
      }
    }, 1200)
    timersRef.current.push(id)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: theme.bg }}>
      <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
        className="absolute top-safe left-4 mt-3 font-round text-white/70 text-sm">
        ← Back
      </motion.button>
      <div className="text-center mb-8">
        <p className="font-bubble text-white text-2xl mb-6">What shape is this?</p>
        <svg viewBox="0 0 100 100" className="w-40 h-40 mx-auto" fill="white" opacity="0.9">
          {current.svg}
        </svg>
      </div>
      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        {current.options.map(opt => (
          <motion.button key={opt} whileTap={{ scale: 0.85 }} onClick={() => handleAnswer(opt)}
            className="py-4 rounded-2xl font-bubble text-white text-base shadow-lg"
            style={{
              background: feedback && opt === current.shape ? '#22C55E' : 'rgba(255,255,255,0.25)',
              border: '3px solid rgba(255,255,255,0.4)',
            }}>
            {opt}
          </motion.button>
        ))}
      </div>
      <p className="font-round text-white/70 text-sm mt-8">{q + 1} / {SHAPE_QUESTIONS.length}</p>
    </div>
  )
}

// ── Numbers module ────────────────────────────────────────────────────────────
const NUMBER_QUESTIONS = [
  { count: 1, emoji: '🍎', options: [1, 2, 3] },
  { count: 2, emoji: '🐧', options: [1, 2, 3] },
  { count: 3, emoji: '🌟', options: [2, 3, 4] },
  { count: 4, emoji: '🎈', options: [3, 4, 5] },
  { count: 5, emoji: '🦋', options: [4, 5, 6] },
]

function NumbersModule({ theme, onDone, onBack }) {
  const [q, setQ] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const current = NUMBER_QUESTIONS[q]
  const { speak } = useSpeech()
  const spokenQ = useRef(-1)
  const lockedRef = useRef(false)
  const completedRef = useRef(false)
  const timersRef = useRef([])

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }, [])

  useEffect(() => {
    if (spokenQ.current === q) return
    spokenQ.current = q
    speak(`Count the pictures. How many are there?`, { mood: 'question', rate: 0.8, queue: true })
  }, [q, speak])

  const handleAnswer = (answer) => {
    if (lockedRef.current || completedRef.current) return
    lockedRef.current = true
    const correct = answer === current.count
    const nextScore = score + (correct ? 1 : 0)
    if (correct) {
      setScore(nextScore)
      confetti({ particleCount: 80, spread: 100, origin: { x: 0.5, y: 0.4 } })
      speak(`Yes! There are ${current.count}! Brilliant!`, { mood: 'celebrate', rate: 0.8 })
    } else {
      speak(`There are ${current.count}. Count again!`, { mood: 'instruct', rate: 0.8 })
    }
    setFeedback(correct ? 'correct' : 'wrong')
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter(t => t !== id)
      setFeedback(null)
      if (q + 1 >= NUMBER_QUESTIONS.length) {
        completedRef.current = true
        onDone(nextScore)
      } else {
        setQ(v => v + 1)
        lockedRef.current = false
      }
    }, 1200)
    timersRef.current.push(id)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: theme.bg }}>
      <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
        className="absolute top-safe left-4 mt-3 font-round text-white/70 text-sm">
        ← Back
      </motion.button>
      <div className="text-center mb-8">
        <p className="font-bubble text-white text-2xl mb-6">How many {current.emoji}?</p>
        <div className="flex flex-wrap justify-center gap-3 max-w-xs mx-auto mb-4">
          {Array.from({ length: current.count }).map((_, i) => (
            <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: i * 0.1, type: 'spring' }} className="text-5xl">
              {current.emoji}
            </motion.span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        {current.options.map(opt => (
          <motion.button key={opt} whileTap={{ scale: 0.85 }} onClick={() => handleAnswer(opt)}
            className="py-5 rounded-2xl font-bubble text-white text-3xl shadow-lg"
            style={{
              background: feedback && opt === current.count ? '#22C55E' : 'rgba(255,255,255,0.25)',
              border: '3px solid rgba(255,255,255,0.4)',
            }}>
            {opt}
          </motion.button>
        ))}
      </div>
      <p className="font-round text-white/70 text-sm mt-8">{q + 1} / {NUMBER_QUESTIONS.length}</p>
    </div>
  )
}

// ── Animals module ────────────────────────────────────────────────────────────
const ANIMAL_QUESTIONS = [
  { animal: 'Dog',      emoji: '🐶', sound: 'Woof!',   options: ['Dog', 'Cat', 'Cow']      },
  { animal: 'Cat',      emoji: '🐱', sound: 'Meow!',   options: ['Dog', 'Cat', 'Duck']     },
  { animal: 'Cow',      emoji: '🐮', sound: 'Moo!',    options: ['Cow', 'Pig', 'Sheep']    },
  { animal: 'Duck',     emoji: '🦆', sound: 'Quack!',  options: ['Frog', 'Duck', 'Bird']   },
  { animal: 'Elephant', emoji: '🐘', sound: 'Trumpet!', options: ['Elephant', 'Dog', 'Cat'] },
]

function AnimalsModule({ theme, onDone, onBack }) {
  const [q, setQ] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const current = ANIMAL_QUESTIONS[q]
  const { speak } = useSpeech()
  const spokenQ = useRef(-1)
  const lockedRef = useRef(false)
  const completedRef = useRef(false)
  const timersRef = useRef([])

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); timersRef.current = [] }, [])

  useEffect(() => {
    if (spokenQ.current === q) return
    spokenQ.current = q
    speak(`This animal says ${current.sound}. What animal is this?`, { mood: 'question', rate: 0.8, queue: true })
  }, [q, speak, current.sound])

  const handleAnswer = (answer) => {
    if (lockedRef.current || completedRef.current) return
    lockedRef.current = true
    const correct = answer === current.animal
    const nextScore = score + (correct ? 1 : 0)
    if (correct) {
      setScore(nextScore)
      confetti({ particleCount: 60, spread: 80, origin: { x: 0.5, y: 0.4 } })
      speak(`Yes! It is a ${current.animal}! Great job!`, { mood: 'celebrate', rate: 0.8 })
    } else {
      speak(`This is a ${current.animal}. Keep trying!`, { mood: 'instruct', rate: 0.8 })
    }
    setFeedback(correct ? 'correct' : 'wrong')
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter(t => t !== id)
      setFeedback(null)
      if (q + 1 >= ANIMAL_QUESTIONS.length) {
        completedRef.current = true
        onDone(nextScore)
      } else {
        setQ(v => v + 1)
        lockedRef.current = false
      }
    }, 1200)
    timersRef.current.push(id)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: theme.bg }}>
      <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
        className="absolute top-safe left-4 mt-3 font-round text-white/70 text-sm">
        ← Back
      </motion.button>
      <div className="text-center mb-8">
        <motion.div className="text-9xl mb-4"
          animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          {current.emoji}
        </motion.div>
        <p className="font-bubble text-white text-2xl">Says "{current.sound}"</p>
        <p className="font-round text-white/70 text-lg mt-1">What animal is this?</p>
      </div>
      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        {current.options.map(opt => (
          <motion.button key={opt} whileTap={{ scale: 0.85 }} onClick={() => handleAnswer(opt)}
            className="py-4 rounded-2xl font-bubble text-white text-base shadow-lg"
            style={{
              background: feedback && opt === current.animal ? '#22C55E' : 'rgba(255,255,255,0.25)',
              border: '3px solid rgba(255,255,255,0.4)',
            }}>
            {opt}
          </motion.button>
        ))}
      </div>
      <p className="font-round text-white/70 text-sm mt-8">{q + 1} / {ANIMAL_QUESTIONS.length}</p>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function ToddlerDashboard({ theme, profileId, profileName, progress, onNavigate, onSwitchProfiles, onParent }) {
  const totalStars = TODDLER_MODULES.reduce((acc, m) => acc + (progress[m.id]?.stars || 0), 0)
  const dailyPath = getToddlerDailyPath(progress)

  return (
    <div className="min-h-screen pb-32" style={{ background: theme.bg }}>
      {/* Floating particles */}
      {theme.particles.map((p, i) => (
        <motion.span key={i} className="fixed pointer-events-none select-none text-2xl"
          style={{ left: `${(i * 18 + 5) % 90}%`, bottom: '-5%', opacity: 0.3 }}
          animate={{ y: [0, -window.innerHeight - 50], opacity: [0.3, 0.6, 0] }}
          transition={{ duration: 5 + i * 1.2, repeat: Infinity, delay: i * 0.8 }}>
          {p}
        </motion.span>
      ))}

      {/* Header */}
      <div className="pt-safe px-5 pt-6 pb-4 flex items-center gap-4"
        style={{ background: 'rgba(0,0,0,0.2)' }}>
        <motion.div className="text-5xl"
          animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
          {theme.emoji}
        </motion.div>
        <div>
          <p className="font-bubble text-white text-xl drop-shadow">Hi, {profileName}! 👋</p>
          <p className="font-round text-white/80 text-sm">{theme.tagline}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {onSwitchProfiles && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onSwitchProfiles}
              className="rounded-full px-4 py-2.5 font-bubble text-xs text-[#2b1458] shadow-lg ring-2 ring-white/70"
              style={{ background: 'linear-gradient(135deg, #FFE45E, #FFB347, #FF5E7E)' }}
            >
              ↩ Switch
            </motion.button>
          )}
          {onParent && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onParent}
              className="rounded-full px-3 py-2.5 font-round text-xs text-white/50 border border-white/20 bg-white/10"
            >
              🔒
            </motion.button>
          )}
        </div>
        <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full">
          <span className="text-yellow-300 text-lg">⭐</span>
          <span className="font-bubble text-white text-lg">{totalStars}</span>
        </div>
      </div>

      {/* Module grid — big buttons for toddlers */}
      <div className="px-4 pt-5">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="rounded-[30px] p-4 shadow-2xl"
          style={{ background: 'rgba(255,255,255,0.24)', border: '3px solid rgba(255,255,255,0.34)' }}
        >
          <p className="font-round text-white/75 text-xs font-black uppercase tracking-[0.18em]">Today's Play Path</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div>
              <p className="font-bubble text-white text-2xl leading-tight">Tap the big button</p>
              <p className="font-round text-white/75 text-sm font-bold mt-1">Two tiny games, then a star party.</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => dailyPath.next?.module && onNavigate(dailyPath.next.module.id)}
              className="h-24 w-24 shrink-0 rounded-[28px] bg-white shadow-xl flex flex-col items-center justify-center"
            >
              <span className="text-5xl">{dailyPath.next?.module?.emoji || '▶'}</span>
              <span className="font-bubble text-xs" style={{ color: theme.primary }}>GO</span>
            </motion.button>
          </div>
          <div className="relative mt-4 grid grid-cols-2 gap-3">
            <div
              className="pointer-events-none absolute left-[24%] right-[24%] top-1/2 h-1 -translate-y-1/2 rounded-full opacity-80"
              style={{ background: 'repeating-linear-gradient(to right, rgba(255,255,255,0.78) 0 10px, transparent 10px 20px)' }}
            />
            {dailyPath.steps.map((step, idx) => (
              <motion.button
                key={step.module.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => onNavigate(step.module.id)}
                className="relative rounded-[24px] p-3 text-left"
                style={{
                  background: step.done ? 'rgba(255,255,255,0.92)' : step.module.bg,
                  border: step.done ? '3px solid #22C55E' : '3px solid rgba(255,255,255,0.25)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-4xl">{step.done ? '✅' : step.module.emoji}</span>
                  <span className="font-bubble rounded-full bg-white/24 px-2 py-0.5 text-white text-xs">{idx + 1}</span>
                </div>
                <span
                  className="font-bubble absolute right-3 top-12 rounded-full px-2 py-0.5 text-xs shadow-lg"
                  style={{ background: '#FDE68A', color: '#78350F' }}
                >
                  +5
                </span>
                <p className="font-bubble mt-2 text-base leading-tight" style={{ color: step.done ? theme.primary : 'white' }}>
                  {step.module.label}
                </p>
              </motion.button>
            ))}
          </div>
          <div className="mt-3 h-2 rounded-full bg-white/25 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: `${(dailyPath.doneCount / Math.max(dailyPath.steps.length, 1)) * 100}%` }}
            />
          </div>
        </motion.div>
      </div>

      <div className="px-4 pt-6">
        <p className="font-bubble text-white/80 text-sm uppercase tracking-widest mb-3">More games</p>
        <div className="grid grid-cols-2 gap-5">
        {TODDLER_MODULES.filter(m => !m.comingSoon).map((mod, idx) => (
          <motion.button
            key={mod.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.08, type: 'spring', stiffness: 280 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => onNavigate(mod.id)}
            className="relative flex flex-col items-center justify-center gap-3 py-7 rounded-3xl shadow-xl"
            style={{
              background: mod.comingSoon ? 'rgba(255,255,255,0.12)' : mod.bg,
              boxShadow: mod.comingSoon ? 'none' : `0 8px 24px ${mod.bg}80`,
              border: '3px solid rgba(255,255,255,0.25)',
              opacity: mod.comingSoon ? 0.5 : 1,
            }}
          >
            <span className="text-5xl">{mod.emoji}</span>
            <span className="font-bubble text-white text-lg drop-shadow leading-tight text-center px-2">
              {mod.label}
            </span>
            {mod.comingSoon && (
              <span className="absolute top-2 right-2 bg-white/20 rounded-full px-2 py-0.5 font-round text-white text-xs">
                Soon
              </span>
            )}
            {!mod.comingSoon && (progress[mod.id]?.stars || 0) > 0 && (
              <div className="absolute top-2 right-2 flex items-center gap-0.5">
                <span className="text-yellow-300 text-sm">⭐</span>
                <span className="font-round text-white text-xs">{progress[mod.id].stars}</span>
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>

      <RetentionPanel
        ageGroup="toddler"
        theme={{
          ...theme,
          text: '#1F1147',
          accent: theme.glow,
          secondary: theme.glow,
        }}
        profileName={profileName}
        missionTitle="Tiny Daily Mission"
        missionSubtitle="Two short activities are enough for today."
        steps={dailyPath.steps.map(step => ({
          id: step.module.id,
          label: step.module.label,
          done: step.done,
        }))}
        nextLabel={dailyPath.next?.module?.label}
        onNavigate={onNavigate}
        roomScore={totalStars}
        stickersCount={(progress.stickers || []).length}
        dark
      />

      {/* ── PARENT ZONE CTA ───────────────────────────────────────────────────── */}
      {onParent && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.95 }}
          onClick={onParent}
          className="mx-auto mt-6 flex w-[calc(100%-2rem)] max-w-6xl items-center gap-4 rounded-[24px] p-4"
          style={{
            background: `linear-gradient(135deg, ${theme.primary}18, ${theme.glow}18)`,
            border: `1.5px solid ${theme.primary}30`,
          }}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: `${theme.primary}20` }}>
            👨‍👩‍👧
          </div>
          <div className="flex-1 text-left">
            <p className="font-bubble text-base leading-none" style={{ color: theme.textDark || '#1F1147' }}>Parent Zone</p>
            <p className="font-round text-xs mt-0.5 opacity-60" style={{ color: theme.textDark || '#1F1147' }}>
              Progress reports · Daily goals · Settings
            </p>
          </div>
          <span className="font-bold text-xl opacity-40" style={{ color: theme.textDark || '#1F1147' }}>›</span>
        </motion.button>
      )}

      <JarvisOrb
        assistantOverride={{
          name: 'Yaagvi',
          title: 'Play buddy',
          sample: 'Tap the big button and I will help you play one tiny game.',
          image: '/yaagvi-mascot-single.webp',
          imagePosition: 'center',
          emoji: '⭐',
        }}
        themeOverride={{
          ...theme,
          text: '#1F1147',
          secondary: theme.glow,
        }}
        profileName={profileName}
        progress={progress}
        prompts={[
          `Hi ${profileName || 'there'}. I am Yaagvi. Tap the big button and we can play together.`,
          'Let us do one tiny game first. I will cheer you on.',
          dailyPath.next?.module
            ? `Your next game is ${dailyPath.next.module.label}. Tap go when you are ready.`
            : 'You did your play path. Great job.',
          'If you need help, tap me again.',
        ]}
        profileId={profileId}
        tourId="toddler-v1"
        tourVideo="/tours/yaagvi-tour-3-4.mp4"
        tourSteps={[
          {
            title: 'Start with one tiny game',
            body: 'This world is made for quick taps, colours, shapes, numbers, animals, alphabet, and songs.',
            tip: 'For ages 3 to 4, keep sessions short and playful.',
          },
          {
            title: 'Follow the daily path',
            body: 'The big daily button shows the next simple activity, so your child does not need to choose from too many things.',
            tip: 'Tap the big button first.',
          },
          {
            title: 'I stay nearby',
            body: 'Tap Yaagvi anytime and I will say what to try next, using short child-friendly prompts.',
            tip: 'Mascot sound starts after a tap on Apple devices.',
          },
          {
            title: 'Celebrate small wins',
            body: 'Stars and cheerful feedback help your child feel successful after each tiny activity.',
            tip: 'One good activity is enough for a young child.',
          },
        ]}
      />
    </div>
  )
}

// ── Main toddler app ──────────────────────────────────────────────────────────
export default function ToddlerApp({ profileId, profileName, profileAgeGroup, onSwitchProfiles, parentPin, onUpdateProfile, onLogout, guardianEmail, onUpdateGuardian, classroomMode }) {
  const { progress, update, resetProgress, addSticker } = useProgress(profileId)
  const todayKey = todayStamp()
  const moodLog = progress.moodLog || []
  const moodLoggedToday = moodLog.some(entry => entry.date === todayKey)
  const [screen, setScreen] = useState(moodLoggedToday ? 'home' : 'mood')
  const [rewardInfo, setRewardInfo] = useState(null)

  // Auto-assign default buddy on first visit so child skips the buddy picker
  useEffect(() => {
    if (!progress.toddlerAvatar) {
      update(p => ({ ...p, toddlerAvatar: 'jj' }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Weekly digest
  useEffect(() => {
    if (!guardianEmail || !profileId) return
    if (!shouldSendAutoDigest(profileId)) return
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const hasActivity = (progress.sessions || []).some(s => s.date >= sevenDaysAgo)
    if (!hasActivity) return
    markDigestSent(profileId)
    sendDigestEmail(buildDigestPayload({ progress, profileName, parentEmail: guardianEmail }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId, guardianEmail])

  const theme = TODDLER_THEMES[progress.toddlerAvatar] || TODDLER_THEMES.jj

  const handleAvatarSelect = useCallback((key) => {
    update(p => ({ ...p, toddlerAvatar: key }))
    setScreen(moodLoggedToday ? 'home' : 'mood')
  }, [update, moodLoggedToday])

  const handleMoodComplete = useCallback((mood) => {
    update(p => {
      const existing = p.moodLog || []
      const next = [...existing.filter(e => e.date !== todayKey), { date: todayKey, mood: mood.key, emoji: mood.emoji, at: Date.now() }]
      return { ...p, moodLog: next.slice(-60) }
    })
    setScreen('home')
  }, [update, todayKey])

  const handleModuleDone = useCallback((moduleId, stars) => {
    update(p => {
      const today = todayStamp()
      const firstTreasureToday = p[moduleId]?.lastPlayedDate !== today
      return {
        ...p,
        toddlerTreasurePoints: (p.toddlerTreasurePoints || 0) + (firstTreasureToday ? 5 : 0),
        [moduleId]: {
          ...p[moduleId],
          stars: Math.max(p[moduleId]?.stars || 0, stars),
          played: (p[moduleId]?.played || 0) + 1,
          lastPlayedDate: todayStamp(),
        },
      }
    })
    confetti({ particleCount: 120, spread: 140, origin: { x: 0.5, y: 0.3 } })
    const mod = TODDLER_MODULES.find(m => m.id === moduleId)
    setScreen('home')
    setRewardInfo({ mod, stars })
    setTimeout(() => setRewardInfo(null), 3000)
  }, [update])

  if (screen === 'avatar') {
    return <ToddlerAvatarSelector onSelect={handleAvatarSelect} />
  }

  if (screen === 'mood') {
    return <MoodCheckIn avatar={progress.toddlerAvatar} profileName={profileName} themeOverride={theme} onComplete={handleMoodComplete} onSkip={() => setScreen('home')} />
  }

  if (screen === 'parent') {
    return (
      <ParentZone
        avatar={progress.toddlerAvatar || 'rumi'}
        progress={progress}
        profileId={profileId}
        profileName={profileName}
        profileAgeGroup={profileAgeGroup}
        parentPin={parentPin}
        onBack={() => setScreen('home')}
        onSetChallenge={() => {}}
        onAddSticker={addSticker}
        onReset={resetProgress}
        onSwitchProfiles={onSwitchProfiles}
        onUpdateProgress={(patch) => update(p => ({ ...p, ...patch }))}
        onUpdateProfile={onUpdateProfile}
        onLogout={onLogout}
        guardianEmail={guardianEmail}
        onUpdateGuardian={onUpdateGuardian}
        classroomMode={classroomMode}
      />
    )
  }

  const moduleMap = {
    colours:  <ColoursModule  theme={theme} onDone={(s) => handleModuleDone('colours', s)}  onBack={() => setScreen('home')} />,
    shapes:   <ShapesModule   theme={theme} onDone={(s) => handleModuleDone('shapes', s)}   onBack={() => setScreen('home')} />,
    numbers:  <NumbersModule  theme={theme} onDone={(s) => handleModuleDone('numbers', s)}  onBack={() => setScreen('home')} />,
    animals:  <AnimalsModule  theme={theme} onDone={(s) => handleModuleDone('animals', s)}  onBack={() => setScreen('home')} />,
    alphabet: <ComingSoonModule theme={theme} onBack={() => setScreen('home')} />,
    songs:    <ComingSoonModule theme={theme} onBack={() => setScreen('home')} />,
  }

  if (moduleMap[screen]) return moduleMap[screen]

  return (
    <>
      <ToddlerDashboard
        theme={theme}
        profileId={profileId}
        profileName={profileName}
        progress={progress}
        onNavigate={setScreen}
        onSwitchProfiles={onSwitchProfiles}
        onParent={parentPin ? () => setScreen('parent') : undefined}
      />
      <AnimatePresence>
        {rewardInfo && (
          <motion.div
            key="reward"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(0,0,0,0.65)' }}
            onClick={() => setRewardInfo(null)}
          >
            <motion.div
              initial={{ scale: 0.5, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 1.05, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="w-full max-w-xs rounded-[32px] p-8 flex flex-col items-center gap-4 text-center"
              style={{
                background: `linear-gradient(160deg, ${theme.primary}cc, ${theme.glow}55)`,
                border: '3px solid rgba(255,255,255,0.35)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <motion.div
                animate={{ rotate: [0, -15, 15, -8, 0], scale: [1, 1.3, 1] }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-7xl"
              >
                {rewardInfo.mod?.emoji || '⭐'}
              </motion.div>

              <div>
                <p className="font-bubble text-white text-2xl">Well done!</p>
                <p className="font-round text-white/70 text-base mt-1">{rewardInfo.mod?.label}</p>
              </div>

              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)' }}
              >
                <span className="text-2xl">⭐</span>
                <span className="font-bubble text-white text-2xl">+5 stars</span>
              </motion.div>

              <div className="flex gap-1">
                {[1, 2, 3].map(n => (
                  <motion.span key={n}
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + n * 0.1, type: 'spring' }}
                    className="text-3xl" style={{ opacity: n <= rewardInfo.stars ? 1 : 0.2 }}>
                    ⭐
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
