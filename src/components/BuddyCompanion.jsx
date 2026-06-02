import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─────────────────────────────────────────────────────────────────────────────
// BuddyCompanion — the avatar IS the buddy
// Mascot companion reactions for the original learning guides.
// When they pick Rumi   → Rumi glows with starlight and sings
// ─────────────────────────────────────────────────────────────────────────────

const AVATAR_DATA = {
  yaagvi: {
    name:   'Yaagvi',
    image:  '/yaagvi-mascot-single.webp',
    color:  '#F59E0B',
    glow:   '#FDE68A',
    particles: { correct: ['⭐','✨','🌈','🎉','💛'], celebrate: ['⭐','🌟','🎉','🏆','✨'], wrong: ['💛','✨','🌈'] },
    speech: {
      idle:      ['Yaagvi is here with you.', 'Ready for one small step?', 'Let us try together.', 'I can help.'],
      happy:     ['Great try!', 'That was lovely work.', 'You are learning so well.', 'Nice focus.'],
      excited:   ['Brilliant!', 'You did it!', 'That was a strong answer.', 'Keep going.'],
      celebrate: ['Amazing work!', 'Yaagvi is proud of you.', 'You earned that win.', 'Fantastic learning.'],
      thinking:  ['Look carefully.', 'Try one more time.', 'Listen for the sound.', 'Take it slowly.'],
      encourage: ['It is okay. Try again.', 'You are very close.', 'I am still with you.', 'One small step.'],
      wow:       ['Wow, excellent!', 'That was a clever answer.', 'Super thinking.', 'You are shining.'],
    }
  },
  bloom: {
    name:   'Bloom',
    image:  null,           // SVG pig built below
    color:  '#FF1D8E',
    glow:   '#FF7DC0',
    particles: { correct: ['🐷','💕','🌸','🎀','⭐'], celebrate: ['🐷','🌟','💕','🎉','✨'], wrong: ['🌈','💛','🌸'] },
    speech: {
      idle:      ["Ready to learn?", "Let's jump into practice!", "I'm Bloom!", "This is so fun!"],
      happy:     ["Oink oink! 🐷💕", "That's brilliant!! 💕", "You're amazing! 🐷", "Bloom is cheering for you! 🌸"],
      excited:   ["OINK OINK!! 🐷🎉", "Let's go!! 🌸", "WHEEE!! 🎀", "Bloom loves this!! 🌈"],
      celebrate: ["OINK OINK OINK!! 🐷🌟", "BLOOM IS SO HAPPY!! 💕", "WE'RE CHAMPIONS!! 🏆🐷", "BEST DAY EVER!! 🌈"],
      thinking:  ["Hmm… let me think 🐷🤔", "Let me think… oink 🤔", "Carefully now! 👀", "Almost! Keep going! 💛"],
      encourage: ["Don't worry!", "Bloom never gives up!", "Keep going, friend!", "You can do it!"],
      wow:       ["OINK!! INCREDIBLE!! 🐷🌟", "BLOOM IS AMAZED!! 💕", "WOW WOW WOW!! 🎉🐷", "SPECTACULAR!! 🌸"],
    }
  },
  marina: {
    name:   'Marina',
    image:  null,
    color:  '#00C9A7',
    glow:   '#5EEAD4',
    particles: { correct: ['🌊','🌺','⭐','🐚','✨'], celebrate: ['🌊','🌟','🌺','🎉','⛵'], wrong: ['🌊','💛','🌴'] },
    speech: {
      idle:      ["The ocean calls!", "Let's explore together!", "I am Marina!", "Ready for adventure?"],
      happy:     ["The ocean smiles! 🌺✨", "The ocean cheers! 🌊", "You're a navigator! ⭐", "Wonderful!! 🌺"],
      excited:   ["Adventure awaits!! 🌊🎉", "The waves are dancing!! ⛵", "LET'S GO!! 🌺🌊", "WAHOO!! 🐚"],
      celebrate: ["YOU CROSSED THE HORIZON!! 🌊🌟", "MARINA IS SO PROUD!! 🌺", "CHAMPION NAVIGATOR!! 🏆⛵", "THE OCEAN CELEBRATES!! 🌊🎉"],
      thinking:  ["Where the wind blows… 🌊🤔", "The ocean knows… 💭", "Look carefully! 👀🌺", "I believe in you! 🌊"],
      encourage: ["The ocean never gives up! 🌊💛", "Neither do we! 🌺", "Keep sailing! ⛵💪", "You've got this! 🌊"],
      wow:       ["THE OCEAN ROARS!! 🌊🌟", "LIKE A WAVE!! 🌊✨", "MAGNIFICENT!! 🌺🎉", "WHAAAAOA!! ⛵🌟"],
    }
  },
  aurora: {
    name:   'Snow',
    image:  null,
    color:  '#00B4FF',
    glow:   '#7DD8FF',
    particles: { correct: ['❄️','⭐','💎','✨','🌨️'], celebrate: ['❄️','🌟','💫','🎉','💙'], wrong: ['❄️','💛','🔮'] },
    speech: {
      idle:      ["Snow day learning! ❄️✨", "Ice cool and ready! 🌨️", "Snow magic! ❄️💎", "Ready to learn! ❄️"],
      happy:     ["Beautiful as a snowflake! ❄️✨", "Brilliant!! 💎🌟", "The snow mountain cheers! 🏔️", "Amazing!! ❄️"],
      excited:   ["SNOW POWERS ON!! ❄️🎉", "HERE WE GOOO!! 🌨️", "MAGIC!! 💎✨", "SNOW LOVES THIS!! ❄️"],
      celebrate: ["THE SNOW KINGDOM CELEBRATES!! ❄️🌟", "SNOW IS SO PROUD!! 💎", "ICE STAR APPROVES!! 🏆❄️", "SNOW MAGIC!! 🌨️🎉"],
      thinking:  ["Hmm, even snowflakes wonder ❄️🤔", "Concentrate… ❄️💭", "Look carefully! 👀❄️", "Almost! 💙"],
      encourage: ["Even in winter, flowers bloom ❄️💛", "Keep going! 💎", "Never give up! ❄️💪", "I believe in you! 🌨️"],
      wow:       ["THE MOUNTAINS ECHO!! ❄️🌟", "MAGNIFICENT SNOW MAGIC!! 💎✨", "SNOW IS AMAZED!! ❄️🎉", "LET IT GLOOOW!! ✨"],
    }
  },
  rumi: {
    name:   'Rumi',
    image:  '/rumi-avatar.png',
    color:  '#8B00FF',
    glow:   '#C77DFF',
    particles: { correct: ['⭐','✨','💜','🌟','💫'], celebrate: ['⭐','🌟','💜','🎉','🎤'], wrong: ['💜','💛','✨'] },
    speech: {
      idle:      ["Shine bright! ⭐✨", "Stars are watching! 🌟", "Let's make music! 🎤💜", "Ready to glow! ⭐"],
      happy:     ["You're a superstar!! ⭐✨", "The stars align! 🌟", "AMAZING!! 💜🎵", "Rumi loves it! ⭐"],
      excited:   ["SUPERSTAR MOMENT!! ⭐🎉", "The crowd goes WILD!! 🎤✨", "LET'S GOOO!! 💜🌟", "SHINE BRIGHT!! ⭐"],
      celebrate: ["SUPERSTAR LEGEND!! ⭐🌟", "RUMI IS SO PROUD!! 💜", "THE WHOLE UNIVERSE CHEERS!! 🌌🎉", "SHOOTING STAR!! ⭐💜"],
      thinking:  ["Even stars take time… ⭐🤔", "Think carefully… 💭✨", "Look again! 👀⭐", "Almost there! 💜"],
      encourage: ["Every star falls first! ⭐💛", "Keep shining! ✨", "Don't stop! 💜💪", "Stars never quit! ⭐"],
      wow:       ["THE UNIVERSE SHOOK!! ⭐🌟", "SUPERNOVA!! 💜✨", "RUMI IS SPEECHLESS!! ⭐🎉", "STELLAR!! ✨🌌"],
    }
  }
}

// ── Particle burst on celebrate / correct ─────────────────────────────────────
function ParticleBurst({ active, particles, color }) {
  const items = active ? [...particles, ...particles].slice(0, 10) : []
  return (
    <AnimatePresence>
      {active && items.map((p, i) => {
        const angle = (i / items.length) * 2 * Math.PI - Math.PI / 2
        const dist  = 60 + (i % 4) * 20
        return (
          <motion.div key={`${i}-${active}`}
            className="absolute pointer-events-none select-none"
            style={{ left: '50%', top: '35%', fontSize: 16 + (i % 3) * 6, zIndex: 50 }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.2, rotate: 0 }}
            animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: 0, scale: 1.4, rotate: (i % 2 ? 1 : -1) * 200 }}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.4, 1], delay: i * 0.04 }}
          >
            {p}
          </motion.div>
        )
      })}
    </AnimatePresence>
  )
}

// ── Hearts float up on encourage ─────────────────────────────────────────────
function HeartFloat({ active, color }) {
  return (
    <AnimatePresence>
      {active && [0, 1, 2].map(i => (
        <motion.div key={i}
          className="absolute pointer-events-none select-none"
          style={{ left: `${35 + i * 15}%`, bottom: '80%', fontSize: 14 + i * 5, zIndex: 50 }}
          initial={{ y: 0, opacity: 1, scale: 0.5 }}
          animate={{ y: -65 - i * 15, opacity: 0, scale: 1.1 }}
          transition={{ duration: 1.4, delay: i * 0.2, ease: 'easeOut' }}
        >
          {['💛', '❤️', '💕'][i]}
        </motion.div>
      ))}
    </AnimatePresence>
  )
}

// ── Glow ring that pulses around the character ────────────────────────────────
function GlowRing({ color, mood }) {
  const intensity = {
    idle:      { scale: [1, 1.06, 1],   opacity: [0.3, 0.5, 0.3] },
    happy:     { scale: [1, 1.12, 1],   opacity: [0.4, 0.7, 0.4] },
    excited:   { scale: [1, 1.18, 1],   opacity: [0.5, 0.8, 0.5] },
    celebrate: { scale: [0.9, 1.4, 0.95, 1.35, 1], opacity: [0.6, 1, 0.7, 0.95, 0.6] },
    thinking:  { scale: [1, 1.04, 1],   opacity: [0.2, 0.35, 0.2] },
    encourage: { scale: [1, 1.08, 1],   opacity: [0.35, 0.55, 0.35] },
    wow:       { scale: [0.9, 1.45, 0.95, 1.4, 1], opacity: [0.7, 1, 0.8, 0.95, 0.7] },
    speak:     { scale: [1, 1.05, 1],   opacity: [0.3, 0.45, 0.3] },
  }
  const anim = intensity[mood] || intensity.idle
  const dur  = (mood === 'celebrate' || mood === 'wow') ? 0.6 : 2.2
  return (
    <motion.div
      className="absolute inset-0 rounded-full pointer-events-none"
      style={{ background: `radial-gradient(circle, ${color}55 0%, transparent 70%)` }}
      animate={anim}
      transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

// ── Bloom SVG — original playful guide artwork ────────────────────────────
function BloomSVG({ size }) {
  const s = size
  return (
    <svg width={s} height={s} viewBox="0 0 120 120" overflow="visible">
      <defs>
        <radialGradient id="pBody" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FF9DC8" />
          <stop offset="100%" stopColor="#FF1D8E" />
        </radialGradient>
        <radialGradient id="pFace" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFB8D8" />
          <stop offset="100%" stopColor="#FF6BAB" />
        </radialGradient>
      </defs>
      {/* Ears */}
      <ellipse cx="32" cy="32" rx="14" ry="10" fill="url(#pBody)" transform="rotate(-30,32,32)" />
      <ellipse cx="88" cy="32" rx="14" ry="10" fill="url(#pBody)" transform="rotate(30,88,32)" />
      <ellipse cx="32" cy="32" rx="9" ry="6" fill="#FF6BAB" transform="rotate(-30,32,32)" opacity="0.7" />
      <ellipse cx="88" cy="32" rx="9" ry="6" fill="#FF6BAB" transform="rotate(30,88,32)" opacity="0.7" />
      {/* Head */}
      <ellipse cx="60" cy="60" rx="46" ry="42" fill="url(#pFace)" />
      {/* Head shine */}
      <ellipse cx="44" cy="32" rx="14" ry="9" fill="rgba(255,255,255,0.25)" transform="rotate(-15,44,32)" />
      {/* Snout */}
      <ellipse cx="60" cy="74" rx="20" ry="15" fill="#FF8FAB" />
      <ellipse cx="53" cy="72" rx="5" ry="4" fill="#CC3366" opacity="0.8" />
      <ellipse cx="67" cy="72" rx="5" ry="4" fill="#CC3366" opacity="0.8" />
      {/* Eyes */}
      <circle cx="42" cy="52" r="10" fill="white" />
      <circle cx="78" cy="52" r="10" fill="white" />
      <circle cx="44" cy="51" r="6"  fill="#1a1a2e" />
      <circle cx="80" cy="51" r="6"  fill="#1a1a2e" />
      <circle cx="46" cy="49" r="2.5" fill="white" />
      <circle cx="82" cy="49" r="2.5" fill="white" />
      <circle cx="43" cy="53" r="1.2" fill="white" opacity="0.6" />
      <circle cx="79" cy="53" r="1.2" fill="white" opacity="0.6" />
      {/* Smile */}
      <path d="M44 83 Q60 95 76 83" fill="#CC1166" />
      <path d="M47 83 Q60 91 73 83" fill="white" />
      {/* Small playful crown */}
      <circle cx="60" cy="20" r="6" fill="#FFD700" />
      <circle cx="44" cy="26" r="4" fill="#FFD700" />
      <circle cx="76" cy="26" r="4" fill="#FFD700" />
    </svg>
  )
}

// ── Character image (or fallback SVG) with expression overlays ──────────────────
function CharacterDisplay({ avatarKey, size, mood }) {
  const cfg = AVATAR_DATA[avatarKey] || AVATAR_DATA.rumi
  const [imgError, setImgError] = useState(false)

  if (avatarKey === 'bloom' || !cfg.image || imgError) {
    return <BloomSVG size={size} />
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <img
        src={cfg.image}
        alt={cfg.name}
        onError={() => setImgError(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          // Remove blue tint when thinking, add warm glow on celebrate
          filter: mood === 'celebrate' || mood === 'wow'
            ? `drop-shadow(0 0 18px ${cfg.color}) brightness(1.08)`
            : mood === 'thinking'
            ? 'brightness(0.92) saturate(0.85)'
            : `drop-shadow(0 6px 18px ${cfg.color}60)`,
        }}
        draggable={false}
      />
      {/* Sparkle overlay on celebrate */}
      <AnimatePresence>
        {(mood === 'celebrate' || mood === 'wow') && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${cfg.color}30 0%, transparent 65%)`,
            }}
            animate={{ opacity: [0, 0.8, 0, 0.8, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Speech Bubble ─────────────────────────────────────────────────────────────
function SpeechBubble({ text, side, color }) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          key={text}
          className="absolute z-20 pointer-events-none"
          style={{
            bottom: '95%',
            [side === 'right' ? 'left' : 'right']: '-12px',
            minWidth: 120,
            maxWidth: 180,
          }}
          initial={{ scale: 0, opacity: 0, y: 14, originX: side === 'right' ? 0 : 1 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.6, opacity: 0, y: -8 }}
          transition={{ type: 'spring', stiffness: 480, damping: 26 }}
        >
          <div style={{
            background: 'white',
            borderRadius: 20,
            padding: '9px 14px',
            boxShadow: `0 6px 28px rgba(0,0,0,0.16), 0 0 0 2px ${color}30`,
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            fontSize: 12.5,
            color: '#1a1a2e',
            lineHeight: 1.45,
            textAlign: 'center',
          }}>
            {text}
          </div>
          <div style={{
            position: 'absolute',
            bottom: -9,
            [side === 'right' ? 'left' : 'right']: 24,
            width: 0, height: 0,
            borderLeft: '9px solid transparent',
            borderRight: '9px solid transparent',
            borderTop: '10px solid white',
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BuddyCompanion({
  avatar    = 'rumi',
  mood      = 'idle',
  size      = 130,
  side      = 'left',
  speak     = null,
  autoSpeak = true,
  className = '',
  style     = {},
  // legacy props (ignored, avatar-based now)
  bodyColor, eyeColor,
}) {
  const cfg      = AVATAR_DATA[avatar] || AVATAR_DATA.rumi
  const [bubble, setBubble] = useState(null)
  const timerRef = useRef(null)

  // ── Auto speech on mood change ──────────────────────────────────────────────
  useEffect(() => {
    const lines = cfg.speech[mood]
    if (!lines?.length) return
    if (!autoSpeak && !speak) return
    const text = speak || lines[Math.floor(Math.random() * lines.length)]
    clearTimeout(timerRef.current)
    setBubble(text)
    const delay = (mood === 'celebrate' || mood === 'wow') ? 4200 : 2800
    timerRef.current = setTimeout(() => setBubble(null), delay)
    return () => clearTimeout(timerRef.current)
  }, [mood, avatar])

  useEffect(() => {
    if (!speak) return
    setBubble(speak)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setBubble(null), 3500)
    return () => clearTimeout(timerRef.current)
  }, [speak])

  // ── Body animation — squash & stretch physics ───────────────────────────────
  const bodyAnim = {
    idle: {
      y:      [0, -7, 0],
      scaleY: [1, 1.04, 1],
      scaleX: [1, 0.97, 1],
      rotate: 0,
    },
    happy: {
      y:      [0, -13, 0, -10, 0],
      scaleY: [1, 1.09, 0.94, 1.06, 1],
      scaleX: [1, 0.93, 1.06, 0.95, 1],
      rotate: [-3, 3, -2, 2, 0],
    },
    excited: {
      y:      [0, -4, -22, -3, -18, -2, 0],
      scaleY: [1, 0.82, 1.22, 0.87, 1.18, 0.94, 1],
      scaleX: [1, 1.18, 0.82, 1.13, 0.86, 1.06, 1],
      rotate: [-4, 10, -8, 7, -4, 2, 0],
    },
    celebrate: {
      y:      [0, -6, -32, -5, -28, -4, -22, -2, 0],
      scaleY: [1, 0.78, 1.28, 0.82, 1.24, 0.86, 1.18, 0.94, 1],
      scaleX: [1, 1.22, 0.76, 1.18, 0.80, 1.14, 0.85, 1.06, 1],
      rotate: [-5, -16, 16, -12, 12, -7, 7, -2, 0],
    },
    thinking: {
      y:      [0, -3, 0],
      scaleY: 1,
      scaleX: 1,
      rotate: [-8, 8, -6, 6, -3, 3, 0],
    },
    encourage: {
      y:      [0, -6, 0, -5, 0],
      scaleY: [1, 1.05, 0.97, 1.04, 1],
      scaleX: [1, 0.96, 1.03, 0.97, 1],
      rotate: [-2, 2, -1, 1, 0],
    },
    speak: {
      y:      [0, -3, 0],
      scaleY: [1, 1.02, 1],
      scaleX: [1, 0.99, 1],
      rotate: 0,
    },
    wow: {
      y:      [0, -5, -28, -4, -24, -3, -18, -1, 0],
      scaleY: [1, 0.80, 1.26, 0.84, 1.22, 0.88, 1.16, 0.95, 1],
      scaleX: [1, 1.20, 0.78, 1.16, 0.82, 1.12, 0.87, 1.05, 1],
      rotate: [-3, 14, -12, 10, -8, 6, -3, 1, 0],
    },
  }

  const dur = (mood === 'celebrate' || mood === 'wow') ? 0.65
            : mood === 'excited'  ? 0.72
            : mood === 'thinking' ? 2.0
            : mood === 'happy'    ? 1.5
            : 2.5

  const isCelebrating = mood === 'celebrate' || mood === 'wow'
  const isEncouraging = mood === 'encourage'

  return (
    <div
      className={`relative flex items-end justify-center ${className}`}
      style={{ width: size, height: size * 1.35, ...style }}
    >
      {/* Glow ring beneath character */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center" style={{ height: size * 0.6 }}>
        <GlowRing color={cfg.color} mood={mood} />
      </div>

      {/* Particles */}
      <ParticleBurst
        active={isCelebrating}
        particles={isCelebrating ? cfg.particles.celebrate : cfg.particles.correct}
        color={cfg.color}
      />
      <HeartFloat active={isEncouraging} color={cfg.color} />

      {/* Speech bubble */}
      <SpeechBubble text={bubble} side={side} color={cfg.color} />

      {/* ── CHARACTER with squash+stretch + anticipation ── */}
      <motion.div
        style={{ transformOrigin: 'bottom center', width: size, flexShrink: 0 }}
        animate={bodyAnim[mood] || bodyAnim.idle}
        transition={{
          duration: dur,
          repeat: Infinity,
          ease: (mood === 'celebrate' || mood === 'wow') ? [0.36, 0.07, 0.19, 0.97] : 'easeInOut',
        }}
      >
        {/* Shadow that squashes/stretches opposite to body */}
        <motion.div
          className="absolute mx-auto"
          style={{
            bottom: -6, left: '15%', right: '15%',
            height: 10, borderRadius: '50%',
            background: 'rgba(0,0,0,0.18)',
            filter: 'blur(4px)',
          }}
          animate={{
            scaleX: isCelebrating ? [1, 1.4, 0.8, 1.35, 0.85, 1.2, 0.9, 1] : [1, 0.8, 1],
            opacity: isCelebrating ? [0.18, 0.06, 0.18, 0.07, 0.18, 0.1, 0.18, 0.18] : [0.18, 0.1, 0.18],
          }}
          transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut' }}
        />

        <CharacterDisplay avatarKey={avatar} size={size} mood={mood} />
      </motion.div>
    </div>
  )
}

// ── Hook — manages buddy mood from game events ────────────────────────────────
export function useBuddyMood() {
  const [mood,  setMood]  = useState('idle')
  const [speak, setSpeak] = useState(null)
  const timerRef = useRef(null)

  const trigger = (newMood, text = null, returnTo = 'idle', delay = 2800) => {
    clearTimeout(timerRef.current)
    setMood(newMood)
    setSpeak(text || null)
    timerRef.current = setTimeout(() => { setMood(returnTo); setSpeak(null) }, delay)
  }

  const onGameStart = () => trigger('excited',   null, 'happy',    2200)
  const onCorrect   = () => trigger('celebrate', null, 'happy',    3200)
  const onWrong     = (isSecond) => trigger(isSecond ? 'thinking' : 'encourage', null, 'idle', 3000)
  const onGameEnd   = () => { clearTimeout(timerRef.current); setMood('celebrate'); setSpeak(null) }
  const onIdle      = () => { clearTimeout(timerRef.current); setMood('idle') }
  const onWow       = () => trigger('wow', null, 'happy', 3400)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return { mood, speak, trigger, onGameStart, onCorrect, onWrong, onGameEnd, onIdle, onWow }
}
