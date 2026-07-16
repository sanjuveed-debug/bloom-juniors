import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useVisibilityTimers } from '../hooks/useVisibilityTimers'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useSpeech } from '../hooks/useSpeech'
import { triggerHaptic } from '../hooks/useHaptic'
import { THEMES } from '../themes'
import { dailySeedFor, seededShuffle } from '../utils/seededRandom'

// ── Planet data (NASA Space Place inspired) ───────────────────────────────────
const PLANETS = [
  {
    id: 'sun',
    name: 'The Sun',
    color: '#FFD700',
    core: '#FF6B00',
    glow: '#FFD70080',
    nickname: '⭐ Our Star',
    size: 52,
    rings: false,
    facts: [
      '☀️ The Sun is a giant ball of hot gas — it is a STAR, not a planet!',
      '🌍 About 1 million Earths could fit inside the Sun!',
      '💡 The Sun gives us light and warmth — without it, Earth would be frozen!',
      '🚀 Light from the Sun takes 8 minutes to reach Earth — that\'s super fast!',
    ],
    stats: { type: 'Star', diameter: '1.4 million km', temp: '5,500°C surface' },
    color2: '#FFA500',
  },
  {
    id: 'mercury',
    name: 'Mercury',
    color: '#B0AEAE',
    core: '#888',
    glow: '#C0C0C080',
    nickname: '🏎️ Speedy Planet',
    size: 26,
    rings: false,
    facts: [
      '🏎️ Mercury zooms around the Sun in just 88 days — the shortest year!',
      '🌡️ Days are scorching hot (430°C) and nights are freezing cold (-180°C)!',
      '🌑 Mercury has NO moons at all',
      '🌍 Mercury is the smallest planet — smaller than some moons!',
    ],
    stats: { moons: 0, yearDays: '88 Earth days', type: 'Rocky planet' },
    color2: '#888',
  },
  {
    id: 'venus',
    name: 'Venus',
    color: '#E8C66E',
    core: '#B8860B',
    glow: '#FFD70070',
    nickname: '🔥 Hottest Planet',
    size: 34,
    rings: false,
    facts: [
      '🔥 Venus is the HOTTEST planet — over 450°C! Hotter than Mercury!',
      '🌟 Venus is the brightest thing in the night sky after the Moon',
      '🔄 Venus spins backwards — on Venus, the Sun rises in the west!',
      '☁️ Thick poisonous clouds trap heat like a greenhouse gone wild!',
    ],
    stats: { moons: 0, yearDays: '225 Earth days', type: 'Rocky planet' },
    color2: '#C8A030',
  },
  {
    id: 'earth',
    name: 'Earth',
    color: '#4D96FF',
    core: '#1a5c2a',
    glow: '#4D96FF70',
    nickname: '🏠 Our Home!',
    size: 36,
    rings: false,
    facts: [
      '💧 70% of Earth is covered in water — that\'s why it looks blue from space!',
      '🌬️ Our atmosphere is like a big invisible shield protecting all life',
      '🌙 Earth has one beautiful Moon that lights up our night sky',
      '🌱 Earth is the only planet we know has plants, animals and people!',
    ],
    stats: { moons: 1, yearDays: '365 Earth days', type: 'Rocky planet' },
    color2: '#22C55E',
  },
  {
    id: 'mars',
    name: 'Mars',
    color: '#E06B3A',
    core: '#A0391A',
    glow: '#FF450070',
    nickname: '🔴 Red Planet',
    size: 30,
    rings: false,
    facts: [
      '🏔️ Olympus Mons on Mars is 3× taller than Mount Everest — the tallest volcano!',
      '🤖 NASA sent robot rovers to explore Mars — like remote-control cars on another world!',
      '❄️ Mars has icy poles just like Earth — but made of frozen carbon dioxide!',
      '🌙 Mars has 2 tiny moons called Phobos and Deimos',
    ],
    stats: { moons: 2, yearDays: '687 Earth days', type: 'Rocky planet' },
    color2: '#C03010',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    color: '#C88B3A',
    core: '#8B4513',
    glow: '#FF9A3C70',
    nickname: '🐘 Giant Planet',
    size: 56,
    rings: false,
    facts: [
      '🐘 Jupiter is SO big that 1,300 Earths could fit inside it!',
      '🌀 The Great Red Spot is a storm BIGGER than Earth — raging for 300 years!',
      '🌙 Jupiter has 95 moons — more than any other planet!',
      '⚡ Jupiter has the most powerful magnetic field of all the planets',
    ],
    stats: { moons: 95, yearDays: '12 Earth years', type: 'Gas giant' },
    color2: '#F0B060',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    color: '#E8D5A3',
    core: '#C8A030',
    glow: '#FFD70060',
    nickname: '💍 Ringed Planet',
    size: 48,
    rings: true,
    facts: [
      '💍 Saturn\'s rings are billions of chunks of ice and rock — some tiny as a snowflake!',
      '🛁 Saturn is SO light it could float in a giant bathtub of water!',
      '🌙 Saturn has 146 moons — including Titan which has its own thick air!',
      '💨 Winds on Saturn blow at 1,800 km/h — faster than any storm on Earth!',
    ],
    stats: { moons: 146, yearDays: '29 Earth years', type: 'Gas giant' },
    color2: '#D4AA60',
  },
  {
    id: 'uranus',
    name: 'Uranus',
    color: '#7DE8E8',
    core: '#20B2AA',
    glow: '#00FFFF50',
    nickname: '🎳 Tilted Planet',
    size: 40,
    rings: false,
    facts: [
      '🎳 Uranus rolls on its side through space — like a bowling ball!',
      '❄️ Uranus is an ice giant full of frozen water, methane and ammonia',
      '💙 Its beautiful blue-green colour comes from a gas called methane',
      '🌙 Uranus has 27 moons — ALL named after Shakespeare characters!',
    ],
    stats: { moons: 27, yearDays: '84 Earth years', type: 'Ice giant' },
    color2: '#40D0D0',
  },
  {
    id: 'neptune',
    name: 'Neptune',
    color: '#3B5BDB',
    core: '#1A3AB0',
    glow: '#4D96FF60',
    nickname: '💨 Windy Planet',
    size: 38,
    rings: false,
    facts: [
      '💨 Neptune has the STRONGEST winds in the solar system — 2,100 km/h!',
      '🔭 Scientists found Neptune using maths before seeing it through a telescope!',
      '🥶 Neptune is extremely cold — about -200°C, the coldest planet!',
      '🌙 Neptune\'s largest moon Triton orbits the WRONG way — backwards!',
    ],
    stats: { moons: 14, yearDays: '165 Earth years', type: 'Ice giant' },
    color2: '#2040C0',
  },
]

const QUIZ_POOL = [
  { q: 'Which planet is closest to the Sun?', a: 'Mercury', opts: ['Venus', 'Mercury', 'Mars', 'Earth'] },
  { q: 'Which is the HOTTEST planet?', a: 'Venus', opts: ['Mercury', 'Mars', 'Venus', 'Jupiter'] },
  { q: 'Which planet do WE live on?', a: 'Earth', opts: ['Mars', 'Earth', 'Venus', 'Saturn'] },
  { q: 'Which planet is called the Red Planet?', a: 'Mars', opts: ['Jupiter', 'Mars', 'Mercury', 'Venus'] },
  { q: 'Which is the BIGGEST planet?', a: 'Jupiter', opts: ['Saturn', 'Uranus', 'Jupiter', 'Neptune'] },
  { q: 'Which planet has beautiful RINGS?', a: 'Saturn', opts: ['Uranus', 'Neptune', 'Jupiter', 'Saturn'] },
  { q: 'Which planet spins on its SIDE?', a: 'Uranus', opts: ['Neptune', 'Saturn', 'Uranus', 'Mars'] },
  { q: 'Which is the FARTHEST planet from the Sun?', a: 'Neptune', opts: ['Uranus', 'Neptune', 'Saturn', 'Jupiter'] },
  { q: 'How many moons does Earth have?', a: '1', opts: ['0', '1', '2', '3'] },
  { q: 'How many planets are in our solar system?', a: '8', opts: ['7', '8', '9', '10'] },
  { q: 'What is the SMALLEST planet?', a: 'Mercury', opts: ['Mercury', 'Mars', 'Venus', 'Earth'] },
  { q: 'What is the Sun?', a: 'A star', opts: ['A planet', 'A moon', 'A star', 'A comet'] },
  { q: 'Which planet could FLOAT in water?', a: 'Saturn', opts: ['Saturn', 'Jupiter', 'Uranus', 'Neptune'] },
  { q: 'How many moons does Mercury have?', a: '0', opts: ['0', '1', '2', '4'] },
  { q: 'Which planet has the most moons?', a: 'Saturn', opts: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'] },
]

// ── Animated Planet SVG ────────────────────────────────────────────────────────
function PlanetVisual({ planet, size = 110 }) {
  const cx = size / 2
  const cy = size / 2
  const r  = (size / 2) * 0.72

  const stripes = planet.id === 'jupiter'
    ? ['#D4924A', '#C07830', '#E8A860', '#A06020', '#D4924A']
    : planet.id === 'saturn'
    ? ['#E8D5A3', '#D4B870', '#E8D5A3']
    : planet.id === 'uranus'
    ? ['#7DE8E8', '#60D8D8']
    : planet.id === 'neptune'
    ? ['#3B5BDB', '#2A4ACA']
    : null

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`pg-${planet.id}`} cx="38%" cy="35%" r="60%">
          <stop offset="0%" stopColor="white" stopOpacity="0.6" />
          <stop offset="30%" stopColor={planet.color} />
          <stop offset="100%" stopColor={planet.core} />
        </radialGradient>
        <radialGradient id={`glow-${planet.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="transparent" />
          <stop offset="100%" stopColor={planet.glow || planet.color} stopOpacity="0.5" />
        </radialGradient>
        <clipPath id={`clip-${planet.id}`}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>

      {/* Glow ring */}
      <motion.circle cx={cx} cy={cy} r={r + 10}
        fill={`url(#glow-${planet.id})`}
        animate={{ r: [r + 8, r + 18, r + 8] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Planet body */}
      <circle cx={cx} cy={cy} r={r} fill={`url(#pg-${planet.id})`} />

      {/* Stripes for gas giants */}
      {stripes && stripes.map((c, i) => {
        const y = cy - r + (i * (r * 2) / stripes.length)
        const h = (r * 2) / stripes.length + 2
        return (
          <rect key={i} x={cx - r} y={y} width={r * 2} height={h}
            fill={c} opacity={0.45} clipPath={`url(#clip-${planet.id})`} />
        )
      })}

      {/* Saturn rings */}
      {planet.rings && (
        <>
          <ellipse cx={cx} cy={cy + r * 0.08} rx={r * 1.85} ry={r * 0.38}
            fill="none" stroke="#D4B870" strokeWidth={r * 0.28} opacity={0.55} />
          <ellipse cx={cx} cy={cy + r * 0.08} rx={r * 1.55} ry={r * 0.30}
            fill="none" stroke="#E8D5A3" strokeWidth={r * 0.14} opacity={0.65} />
        </>
      )}

      {/* Earth green patches */}
      {planet.id === 'earth' && (
        <>
          <ellipse cx={cx - r * 0.2} cy={cy} rx={r * 0.28} ry={r * 0.38}
            fill="#22C55E" opacity={0.55} clipPath={`url(#clip-${planet.id})`} />
          <ellipse cx={cx + r * 0.25} cy={cy + r * 0.2} rx={r * 0.22} ry={r * 0.28}
            fill="#22C55E" opacity={0.45} clipPath={`url(#clip-${planet.id})`} />
        </>
      )}

      {/* Sun rays */}
      {planet.id === 'sun' && Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 45 * Math.PI) / 180
        return (
          <motion.line key={i}
            x1={cx + Math.cos(angle) * (r + 4)} y1={cy + Math.sin(angle) * (r + 4)}
            x2={cx + Math.cos(angle) * (r + 18)} y2={cy + Math.sin(angle) * (r + 18)}
            stroke="#FFD700" strokeWidth={3} strokeLinecap="round" opacity={0.8}
            animate={{ opacity: [0.4, 1, 0.4], strokeWidth: [2, 4, 2] }}
            transition={{ duration: 1.2, delay: i * 0.15, repeat: Infinity }}
          />
        )
      })}

      {/* Highlight */}
      <ellipse cx={cx - r * 0.3} cy={cy - r * 0.35} rx={r * 0.28} ry={r * 0.18}
        fill="white" opacity={0.35} clipPath={`url(#clip-${planet.id})`} />
    </svg>
  )
}

// ── Stars background ───────────────────────────────────────────────────────────
function Stars() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    x: (i * 137.5) % 100,
    y: (i * 97.3) % 100,
    size: 1 + (i % 3),
    delay: (i * 0.13) % 3,
  }))
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s, i) => (
        <motion.div key={i}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.4, 1] }}
          transition={{ duration: 2 + (i % 4), delay: s.delay, repeat: Infinity }}
        />
      ))}
    </div>
  )
}

// ── Planet Card (grid view) ────────────────────────────────────────────────────
function PlanetCard({ planet, onSelect, index }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.6, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 300, damping: 18 }}
      whileTap={{ scale: 0.88 }}
      onClick={() => onSelect(planet)}
      className="relative flex flex-col items-center gap-2 p-3 rounded-3xl"
      style={{
        background: 'rgba(255,255,255,0.08)',
        border: `2px solid ${planet.color}50`,
        backdropFilter: 'blur(8px)',
      }}
    >
      <PlanetVisual planet={planet} size={72} />
      <p className="font-bubble text-white text-sm leading-tight text-center drop-shadow">{planet.name}</p>
      <p className="font-round text-xs leading-tight text-center" style={{ color: planet.color }}>
        {planet.nickname}
      </p>
    </motion.button>
  )
}

// ── Detail View ────────────────────────────────────────────────────────────────
function PlanetDetail({ planet, onBack, onQuiz, speak, stopSpeaking }) {
  const [factIdx, setFactIdx] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  // Auto-advance facts
  useEffect(() => {
    if (!autoPlay) return
    const t = setInterval(() => setFactIdx(i => (i + 1) % planet.facts.length), 4000)
    return () => clearInterval(t)
  }, [autoPlay, planet.facts.length])

  const readFact = useCallback(() => {
    setAutoPlay(false)
    speak(`${planet.name}. ${planet.facts[factIdx]}`, { rate: 0.88 })
  }, [planet, factIdx, speak])

  return (
    <motion.div
      key={planet.id}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="flex flex-col items-center gap-4 px-4 pb-6 pt-2"
    >
      {/* Back */}
      <div className="w-full flex items-center justify-between">
        <motion.button whileTap={{ scale: 0.85 }} onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl font-bubble text-white text-sm"
          style={{ background: 'rgba(255,255,255,0.15)' }}>
          ← Back
        </motion.button>
        <motion.button whileTap={{ scale: 0.85 }} onClick={onQuiz}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl font-bubble text-sm"
          style={{ background: '#FFD700', color: '#1a1a2e' }}>
          🎯 Quiz Me!
        </motion.button>
      </div>

      {/* Planet visual */}
      <motion.div
        animate={{ rotate: planet.id === 'sun' ? [0, 360] : [0, 8, -8, 0], y: [0, -10, 0] }}
        transition={planet.id === 'sun'
          ? { duration: 20, repeat: Infinity, ease: 'linear' }
          : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <PlanetVisual planet={planet} size={140} />
      </motion.div>

      {/* Name + nickname */}
      <div className="text-center">
        <h2 className="font-bubble text-3xl text-white drop-shadow-lg">{planet.name}</h2>
        <p className="font-round text-base mt-1" style={{ color: planet.color }}>{planet.nickname}</p>
      </div>

      {/* Stats chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {Object.entries(planet.stats).map(([k, v]) => (
          <div key={k} className="px-3 py-1 rounded-full font-round text-xs font-bold"
            style={{ background: `${planet.color}30`, color: planet.color, border: `1.5px solid ${planet.color}60` }}>
            {k === 'moons' ? `🌙 ${v} moons` : k === 'yearDays' ? `📅 ${v}` : `🏷️ ${v}`}
          </div>
        ))}
      </div>

      {/* Fun fact carousel */}
      <div className="w-full rounded-3xl p-4 relative overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.1)', border: `2px solid ${planet.color}50` }}>
        <p className="font-bubble text-xs mb-2" style={{ color: planet.color }}>✨ Did you know?</p>
        <AnimatePresence mode="wait">
          <motion.p key={factIdx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="font-round text-white text-sm leading-relaxed">
            {planet.facts[factIdx]}
          </motion.p>
        </AnimatePresence>

        {/* Fact dots */}
        <div className="flex gap-1.5 mt-3 justify-center">
          {planet.facts.map((_, i) => (
            <motion.button key={i} onClick={() => { setFactIdx(i); setAutoPlay(false) }}
              className="rounded-full transition-all"
              style={{
                width: i === factIdx ? 20 : 8, height: 8,
                background: i === factIdx ? planet.color : `${planet.color}50`,
              }} />
          ))}
        </div>
      </div>

      {/* Read aloud button */}
      <motion.button whileTap={{ scale: 0.9 }} onClick={readFact}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bubble text-sm"
        style={{ background: `linear-gradient(135deg, ${planet.color}, ${planet.color2 || planet.core})`, color: 'white' }}>
        🔊 Read This Fact!
      </motion.button>
    </motion.div>
  )
}

// ── Quiz View ──────────────────────────────────────────────────────────────────
function PlanetQuiz({ onBack, onDone, speak, onAddStars }) {
  const [questions] = useState(() => seededShuffle([...QUIZ_POOL], dailySeedFor('planets')).slice(0, 8))
  const [qIdx, setQIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const awardedRef = useRef(false)
  const lockedRef = useRef(false)
  const { track } = useVisibilityTimers()

  useEffect(() => {
    if (!done || awardedRef.current) return
    awardedRef.current = true
    const pct = score / questions.length
    const stars = pct === 1 ? 3 : pct >= 0.75 ? 2 : pct >= 0.5 ? 1 : 0
    if (stars > 0) {
      onAddStars?.('planets', stars, { total: questions.length, correct: score, struggles: [] })
    }
  }, [done, score, questions.length, onAddStars])

  const q = questions[qIdx]

  const pick = useCallback((opt) => {
    if (lockedRef.current) return
    lockedRef.current = true
    setSelected(opt)
    const correct = opt === q.a
    if (correct) {
      setScore(s => s + 1)
      triggerHaptic('correct')
      speak('Amazing! That\'s correct! You\'re a space genius! ⭐', { mood: 'celebrate' })
      confetti({ particleCount: 60, spread: 80, origin: { y: 0.5 } })
    } else {
      triggerHaptic('wrong')
      speak(`Oops! The answer is ${q.a}. You'll get it next time!`, { mood: 'instruct' })
    }
    track(() => {
      if (qIdx + 1 >= questions.length) { setDone(true) }
      else { setQIdx(i => i + 1); setSelected(null); lockedRef.current = false }
    }, 1600)
  }, [q, qIdx, questions.length, speak, track])

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    const medal = pct === 100 ? '🏆' : pct >= 75 ? '🥇' : pct >= 50 ? '🥈' : '🌟'
    return (
      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-5 px-6 py-8 text-center">
        <motion.div className="text-8xl"
          animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}>{medal}</motion.div>
        <h2 className="font-bubble text-3xl text-white">Space Explorer!</h2>
        <p className="font-bubble text-5xl" style={{ color: '#FFD700' }}>{score}/{questions.length}</p>
        <p className="font-round text-white/80 text-base">
          {pct === 100 ? 'Perfect score! You know ALL about space! 🚀'
            : pct >= 75 ? 'Brilliant! You\'re a real astronaut in training!'
            : 'Great start! Keep exploring the planets!'}
        </p>
        <div className="flex gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
            className="px-6 py-3 rounded-2xl font-bubble text-white text-sm"
            style={{ background: 'rgba(255,255,255,0.2)' }}>← Planets</motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onDone}
            className="px-6 py-3 rounded-2xl font-bubble text-sm"
            style={{ background: '#FFD700', color: '#1a1a2e' }}>🚀 Try Again!</motion.button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div className="flex flex-col gap-4 px-4 pb-6 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.button whileTap={{ scale: 0.85 }} onClick={onBack}
          className="px-4 py-2 rounded-2xl font-bubble text-white text-sm"
          style={{ background: 'rgba(255,255,255,0.15)' }}>← Back</motion.button>
        <div className="flex items-center gap-2">
          <span className="font-bubble text-yellow-300">⭐ {score}</span>
          <span className="font-round text-white/60 text-sm">{qIdx + 1}/{questions.length}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
        <motion.div className="h-full rounded-full" style={{ background: '#FFD700' }}
          animate={{ width: `${((qIdx) / questions.length) * 100}%` }}
          transition={{ duration: 0.5 }} />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={qIdx}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="rounded-3xl p-5 text-center"
          style={{ background: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.2)' }}>
          <p className="font-round text-white/60 text-xs mb-2">Question {qIdx + 1}</p>
          <p className="font-bubble text-white text-xl leading-snug">{q.q}</p>
        </motion.div>
      </AnimatePresence>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {q.opts.map((opt, i) => {
          const isCorrect  = selected && opt === q.a
          const isWrong    = selected === opt && opt !== q.a
          const isNeutral  = selected && opt !== q.a && opt !== selected
          return (
            <motion.button key={`${qIdx}-${i}`} data-companion-answer={opt === q.a ? 'correct' : 'wrong'}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: isCorrect ? [1, 1.08, 1] : isWrong ? [1, 0.93, 1] : 1,
                opacity: isNeutral ? 0.45 : 1,
              }}
              transition={{ delay: i * 0.07, type: 'spring', stiffness: 300 }}
              whileTap={!selected ? { scale: 0.9 } : {}}
              onClick={() => pick(opt)}
              className="p-4 rounded-2xl font-bubble text-sm text-center"
              style={{
                background: isCorrect ? 'linear-gradient(135deg, #22C55E, #16A34A)'
                  : isWrong ? 'linear-gradient(135deg, #EF4444, #DC2626)'
                  : 'rgba(255,255,255,0.15)',
                border: `2px solid ${isCorrect ? '#22C55E' : isWrong ? '#EF4444' : 'rgba(255,255,255,0.25)'}`,
                color: 'white',
                cursor: selected ? 'default' : 'pointer',
              }}>
              {isCorrect && '✅ '}{isWrong && '❌ '}{opt}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function PlanetWorld({ avatar, onBack, onAddStars }) {
  const [view, setView]       = useState('grid')   // 'grid' | 'detail' | 'quiz'
  const [selected, setSelected] = useState(null)
  const [quizKey, setQuizKey] = useState(0)
  const { speak, stopSpeaking } = useSpeech()
  const theme = THEMES[avatar] || THEMES.rumi

  const handleSelect = useCallback((planet) => {
    setSelected(planet)
    setView('detail')
    speak(`${planet.name}! ${planet.nickname}. Tap the fact card to learn more!`, { mood: 'guide' })
  }, [speak])

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0B0C2A 0%, #1A1B4B 40%, #0B0C2A 100%)' }}>
      <Stars />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pb-2 pt-safe">
        <motion.button whileTap={{ scale: 0.85 }} onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl font-bubble text-white text-sm"
          style={{ background: 'rgba(255,255,255,0.12)' }}>
          ← Home
        </motion.button>
        <div className="text-center">
          <h1 className="font-bubble text-2xl md:text-3xl text-white drop-shadow-lg">🚀 Planet World</h1>
          <p className="font-round text-white/60 text-xs">Explore our Solar System!</p>
        </div>
        <div className="w-20" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto scroll-ios">
        <AnimatePresence mode="wait">

          {/* Grid view */}
          {view === 'grid' && (
            <motion.div key="grid"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="px-4 py-2 pb-28">

              {/* Solar system intro */}
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="text-center mb-5">
                <p className="font-round text-white/70 text-sm leading-relaxed px-2">
                  Our solar system has <span className="text-yellow-300 font-bold">1 Sun</span> and <span className="text-blue-300 font-bold">8 planets</span> orbiting around it. Tap any planet to explore! 🌍
                </p>
              </motion.div>

              {/* Planet grid */}
              <div className="grid grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                {PLANETS.map((p, i) => (
                  <PlanetCard key={p.id} planet={p} onSelect={handleSelect} index={i} />
                ))}
              </div>

              {/* Fun space facts banner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6 rounded-3xl p-4"
                style={{ background: 'rgba(255,215,0,0.1)', border: '2px solid rgba(255,215,0,0.3)' }}>
                <p className="font-bubble text-yellow-300 text-sm mb-1">🌟 Space fact of the day!</p>
                <p className="font-round text-white/80 text-xs leading-relaxed">
                  Light travels so fast that it could go around Earth 7 times in just ONE second! ⚡
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* Detail view */}
          {view === 'detail' && selected && (
            <motion.div key="detail"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PlanetDetail
                planet={selected}
                onBack={() => { stopSpeaking(); setView('grid') }}
                onQuiz={() => { setQuizKey(key => key + 1); setView('quiz') }}
                speak={speak}
                stopSpeaking={stopSpeaking}
              />
            </motion.div>
          )}

          {/* Quiz view */}
          {view === 'quiz' && (
            <motion.div key="quiz"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PlanetQuiz
                key={quizKey}
                onBack={() => setView(selected ? 'detail' : 'grid')}
                onDone={() => { setQuizKey(key => key + 1) }}
                speak={speak}
                onAddStars={onAddStars}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
