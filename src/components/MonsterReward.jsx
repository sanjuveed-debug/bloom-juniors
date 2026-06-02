import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

// ── AdaptedMind-style collectible monsters earned for milestones ──────────────
export const MONSTERS = [
  { id: 'spark',   name: 'Spark',    emoji: '⚡', body: '#FFD700', eye: '#FF6B00', stars: 10,  desc: 'Lightning fast learner!' },
  { id: 'bubbles', name: 'Bubbles',  emoji: '🫧', body: '#60A5FA', eye: '#1D4ED8', stars: 25,  desc: 'Floats through problems!' },
  { id: 'blaze',   name: 'Blaze',    emoji: '🔥', body: '#EF4444', eye: '#7F1D1D', stars: 50,  desc: 'On fire with knowledge!' },
  { id: 'sprout',  name: 'Sprout',   emoji: '🌱', body: '#22C55E', eye: '#14532D', stars: 75,  desc: 'Growing every day!' },
  { id: 'luna',    name: 'Luna',     emoji: '🌙', body: '#8B5CF6', eye: '#4C1D95', stars: 100, desc: 'Star gazer extraordinaire!' },
  { id: 'rocky',   name: 'Rocky',    emoji: '🪨', body: '#78716C', eye: '#1C1917', stars: 150, desc: 'Solid and unstoppable!' },
  { id: 'comet',   name: 'Comet',    emoji: '☄️', body: '#F97316', eye: '#431407', stars: 200, desc: 'Speed of a comet!' },
  { id: 'drizzle', name: 'Drizzle',  emoji: '🌧️', body: '#38BDF8', eye: '#0C4A6E', stars: 250, desc: 'Cool as a raindrop!' },
  { id: 'bloom',   name: 'Bloom',    emoji: '🌸', body: '#EC4899', eye: '#831843', stars: 300, desc: 'Blossoming brilliance!' },
  { id: 'nova',    name: 'Nova',     emoji: '🌟', body: '#FBBF24', eye: '#78350F', stars: 400, desc: 'A superstar explosion!' },
  { id: 'glacier', name: 'Glacier',  emoji: '🧊', body: '#7DE8E8', eye: '#164E63', stars: 500, desc: 'Cool under pressure!' },
  { id: 'thunder', name: 'Thunder',  emoji: '⛈️', body: '#6366F1', eye: '#1E1B4B', stars: 750, desc: 'The ultimate champion!' },
]

// ── Monster SVG character ─────────────────────────────────────────────────────
function MonsterSVG({ monster, size = 100 }) {
  const s = size
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`mg-${monster.id}`} cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="white" stopOpacity="0.5" />
          <stop offset="100%" stopColor={monster.body} />
        </radialGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="50" cy="94" rx="28" ry="6" fill="rgba(0,0,0,0.15)" />

      {/* Body */}
      <motion.ellipse cx="50" cy="55" rx="36" ry="38"
        fill={`url(#mg-${monster.id})`}
        stroke={monster.body} strokeWidth="2"
        animate={{ scaleY: [1, 0.97, 1], scaleX: [1, 1.03, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Horns / spikes */}
      <polygon points="30,22 24,4 38,18" fill={monster.body} opacity="0.85" />
      <polygon points="70,22 62,4 76,18" fill={monster.body} opacity="0.85" />

      {/* Eyes */}
      <circle cx="36" cy="46" r="11" fill="white" />
      <circle cx="64" cy="46" r="11" fill="white" />
      <motion.circle cx="38" cy="47" r="7" fill={monster.eye}
        animate={{ x: [-1, 1, -1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.circle cx="66" cy="47" r="7" fill={monster.eye}
        animate={{ x: [-1, 1, -1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
      />
      <circle cx="40" cy="45" r="2.5" fill="white" />
      <circle cx="68" cy="45" r="2.5" fill="white" />

      {/* Smile */}
      <path d="M36 64 Q50 76 64 64" fill="none" stroke={monster.eye} strokeWidth="3.5" strokeLinecap="round" />

      {/* Teeth */}
      <rect x="42" y="64" width="5" height="6" rx="2" fill="white" />
      <rect x="50" y="65" width="5" height="6" rx="2" fill="white" />

      {/* Arms */}
      <motion.ellipse cx="14" cy="62" rx="10" ry="7" fill={monster.body} opacity="0.85"
        animate={{ rotate: [-10, 10, -10] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '22px 62px' }}
      />
      <motion.ellipse cx="86" cy="62" rx="10" ry="7" fill={monster.body} opacity="0.85"
        animate={{ rotate: [10, -10, 10] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '78px 62px' }}
      />

      {/* Star badge */}
      <circle cx="72" cy="22" r="10" fill="#FFD700" />
      <text x="72" y="26" textAnchor="middle" fontSize="10" fill="white">⭐</text>
    </svg>
  )
}

// ── Single monster card (grid view) ──────────────────────────────────────────
export function MonsterCard({ monster, unlocked, totalStars, index }) {
  const pct = unlocked ? 100 : Math.min(100, Math.round((totalStars / monster.stars) * 100))

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 300, damping: 18 }}
      className="relative flex flex-col items-center gap-2 p-3 rounded-3xl"
      style={{
        background: unlocked
          ? `linear-gradient(135deg, ${monster.body}25, ${monster.body}10)`
          : 'rgba(0,0,0,0.06)',
        border: `2px solid ${unlocked ? monster.body : 'rgba(0,0,0,0.1)'}`,
        opacity: unlocked ? 1 : 0.65,
      }}
    >
      {unlocked ? (
        <MonsterSVG monster={monster} size={72} />
      ) : (
        <div className="relative" style={{ width: 72, height: 72 }}>
          <div className="absolute inset-0 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(0,0,0,0.08)' }}>
            <span style={{ fontSize: 36, filter: 'grayscale(1)', opacity: 0.4 }}>{monster.emoji}</span>
          </div>
          <span className="absolute inset-0 flex items-center justify-center text-3xl">🔒</span>
        </div>
      )}

      <p className="font-bubble text-xs text-center" style={{ color: unlocked ? monster.body : '#9CA3AF' }}>
        {unlocked ? monster.name : '???'}
      </p>

      {/* Progress bar to unlock */}
      {!unlocked && (
        <div className="w-full">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.1)' }}>
            <motion.div className="h-full rounded-full"
              style={{ background: monster.body, width: `${pct}%` }}
              initial={{ width: 0 }} animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <p className="font-round text-center mt-0.5" style={{ fontSize: 9, color: '#9CA3AF' }}>
            {monster.stars}⭐ to unlock
          </p>
        </div>
      )}

      {unlocked && (
        <p className="font-round text-center leading-tight" style={{ fontSize: 9, color: monster.body }}>
          {monster.desc}
        </p>
      )}
    </motion.div>
  )
}

// ── Full monster collection screen ───────────────────────────────────────────
export function MonsterCollection({ totalStars, onClose }) {
  const unlocked = MONSTERS.filter(m => totalStars >= m.stars)
  const locked   = MONSTERS.filter(m => totalStars < m.stars)

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'linear-gradient(160deg, #1a1a2e, #16213e, #0f3460)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-3 pt-safe">
        <h2 className="font-bubble text-2xl text-white drop-shadow">🐾 My Monsters</h2>
        <div className="flex items-center gap-3">
          <span className="font-bubble text-yellow-300">⭐ {totalStars}</span>
          <motion.button whileTap={{ scale: 0.85 }} onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl">
            ×
          </motion.button>
        </div>
      </div>

      <div className="px-4 overflow-y-auto scroll-ios flex-1 pb-10">
        {unlocked.length > 0 && (
          <>
            <p className="font-bubble text-sm text-yellow-300 mb-3">
              ✅ Collected ({unlocked.length}/{MONSTERS.length})
            </p>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {unlocked.map((m, i) => (
                <MonsterCard key={m.id} monster={m} unlocked totalStars={totalStars} index={i} />
              ))}
            </div>
          </>
        )}

        <p className="font-bubble text-sm text-white/50 mb-3">🔒 Locked ({locked.length})</p>
        <div className="grid grid-cols-3 gap-3">
          {locked.map((m, i) => (
            <MonsterCard key={m.id} monster={m} unlocked={false} totalStars={totalStars} index={i} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ── Monster unlock popup ──────────────────────────────────────────────────────
export default function MonsterReward({ monster, onClose }) {
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.5 },
      colors: [monster.body, '#FFD700', '#FF6B9D', '#38BDF8'],
    })
  }, [monster.body])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ scale: 0.3, rotate: -15, y: 60 }}
        animate={{ scale: 1, rotate: 0, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
        className="rounded-[36px] p-6 text-center max-w-xs w-full"
        style={{
          background: `linear-gradient(160deg, ${monster.body}30, white)`,
          border: `3px solid ${monster.body}`,
          boxShadow: `0 0 60px ${monster.body}60, 0 20px 40px rgba(0,0,0,0.3)`,
        }}
      >
        {/* NEW badge */}
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="inline-block px-4 py-1 rounded-full font-bubble text-sm text-white mb-3"
          style={{ background: '#EF4444' }}
        >🎉 NEW MONSTER!</motion.div>

        {/* Monster */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex justify-center mb-2"
        >
          <MonsterSVG monster={monster} size={130} />
        </motion.div>

        <motion.h2
          className="font-bubble text-3xl mb-1"
          style={{ color: monster.body }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1 }}
        >
          {monster.name}!
        </motion.h2>

        <p className="font-round text-gray-600 text-sm mb-1">{monster.emoji}</p>
        <p className="font-round text-gray-500 text-sm mb-5 italic">"{monster.desc}"</p>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="w-full py-4 rounded-2xl font-bubble text-lg text-white"
          style={{
            background: `linear-gradient(135deg, ${monster.body}, ${monster.body}AA)`,
            boxShadow: `0 6px 0 ${monster.body}55`,
          }}
        >
          Awesome! 🎊
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
