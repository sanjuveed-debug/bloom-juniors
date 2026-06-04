import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSpeech } from '../hooks/useSpeech'

// ── Growth helpers ─────────────────────────────────────────────────────────────

function getStage(score) {
  if (score >= 50) return 3
  if (score >= 25) return 2
  if (score >= 10) return 1
  return 0
}

const STAGE_LABELS = ['Seed', 'Sprout', 'Bloom', 'Thriving']

const PLOTS = [
  {
    id: 'phonics',
    label: 'Sound Garden',
    subject: 'phonics',
    stages: ['🌱', '🌿', '🌸', '🌺'],
    color: '#F472B6',
    glow: 'rgba(244,114,182,0.4)',
    speech: [
      'Your sound garden is just starting to grow!',
      'A little sprout! Keep practising your letter sounds.',
      'Beautiful blooms! Your phonics is flowering.',
      'Your sound garden is thriving! You know so many letter sounds.',
    ],
  },
  {
    id: 'math',
    label: 'Number Meadow',
    subject: 'maths',
    stages: ['🌱', '🌻', '🌻', '🌟'],
    color: '#FB923C',
    glow: 'rgba(251,146,60,0.4)',
    speech: [
      "Your number meadow is waiting to grow — let's count!",
      'A sunflower bud! Your counting is getting stronger.',
      'The sunflowers are blooming! Great maths practice.',
      'A golden meadow of sunflowers! You are a maths superstar.',
    ],
  },
  {
    id: 'tricky',
    label: 'Word Grove',
    subject: 'tricky words',
    stages: ['🌱', '🍀', '⭐', '✨'],
    color: '#A78BFA',
    glow: 'rgba(167,139,250,0.4)',
    speech: [
      'Your word grove needs some tricky word magic!',
      'A lucky clover! Your tricky words are growing.',
      'A star is shining in your word grove!',
      'Your word grove sparkles with stars — amazing spelling!',
    ],
  },
  {
    id: 'story',
    label: 'Story Hollow',
    subject: 'reading',
    stages: ['🌱', '🌿', '🌲', '🌳'],
    color: '#34D399',
    glow: 'rgba(52,211,153,0.4)',
    speech: [
      'Plant your first story seed by reading today!',
      'A little tree is growing from your stories.',
      'A strong tree! You are a growing reader.',
      'A mighty story tree! You love reading so much.',
    ],
  },
]

function getCentralTree(streak, totalStars) {
  if (streak >= 7 || totalStars >= 200) {
    return { emoji: '🌳', label: 'Ancient Bloom Oak', color: '#10B981', stage: 3 }
  }
  if (streak >= 3 || totalStars >= 75) {
    return { emoji: '🌲', label: 'Growing Bloom Pine', color: '#22C55E', stage: 2 }
  }
  if (streak >= 1 || totalStars >= 20) {
    return { emoji: '🌿', label: 'Young Bloom Sprout', color: '#86EFAC', stage: 1 }
  }
  return { emoji: '🌱', label: 'First Bloom Seed', color: '#BBF7D0', stage: 0 }
}

function getSky(hour) {
  if (hour >= 5 && hour < 8)  return { top: '#0F172A', mid: '#7C3AED', bot: '#FB923C', label: 'Dawn' }
  if (hour >= 8 && hour < 17) return { top: '#0C4A6E', mid: '#0EA5E9', bot: '#BAE6FD', label: 'Day' }
  if (hour >= 17 && hour < 20) return { top: '#1E1B4B', mid: '#7C3AED', bot: '#F97316', label: 'Dusk' }
  return { top: '#020617', mid: '#1E1B4B', bot: '#312E81', label: 'Night' }
}

function isWateredToday(sessions, moduleId) {
  if (!sessions?.length) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return sessions.some(s => s.module === moduleId && s.date >= today.getTime())
}

// ── Plot tile ─────────────────────────────────────────────────────────────────

function PlotTile({ plot, score, watered, onTap, idx }) {
  const stage = getStage(score)
  const emoji = plot.stages[stage]
  const stageLabel = STAGE_LABELS[stage]

  return (
    <motion.button
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + idx * 0.07, type: 'spring', stiffness: 300, damping: 22 }}
      whileTap={{ scale: 0.88 }}
      onClick={() => onTap(plot, stage)}
      className="relative flex flex-col items-center gap-1"
      style={{ minWidth: 64 }}
    >
      {/* Plot bed */}
      <div
        className="relative flex items-center justify-center rounded-[18px]"
        style={{
          width: 60, height: 60,
          background: `radial-gradient(circle at 50% 110%, ${plot.color}28 0%, rgba(0,0,0,0.18) 100%)`,
          border: `1.5px solid ${plot.color}44`,
          boxShadow: watered ? `0 0 16px ${plot.glow}, 0 4px 12px rgba(0,0,0,0.4)` : '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        {/* Soil base */}
        <div
          className="absolute bottom-0 inset-x-0 h-4 rounded-b-[16px]"
          style={{ background: `linear-gradient(to top, ${plot.color}18, transparent)` }}
        />

        {/* Plant emoji */}
        <motion.span
          style={{ fontSize: 28, position: 'relative', zIndex: 1 }}
          animate={{ y: [0, -3, 0], rotate: [0, 2, -2, 0] }}
          transition={{ duration: 2.4 + idx * 0.3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.8 }}
        >
          {emoji}
        </motion.span>

        {/* Watered droplet */}
        {watered && (
          <motion.div
            className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-xs"
            style={{ background: 'rgba(14,165,233,0.9)', boxShadow: '0 2px 8px rgba(14,165,233,0.6)' }}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ type: 'spring', stiffness: 400, delay: 0.4 + idx * 0.1 }}
          >
            💧
          </motion.div>
        )}

        {/* Stage glow for high stages */}
        {stage >= 2 && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-[16px]"
            style={{ background: `radial-gradient(circle at 50% 50%, ${plot.color}30, transparent)` }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>

      {/* Label */}
      <p
        className="font-round text-center leading-tight"
        style={{ fontSize: 10, color: 'rgba(255,255,255,0.62)', maxWidth: 64 }}
      >
        {plot.label}
      </p>
      <p
        className="font-bubble"
        style={{ fontSize: 9, color: plot.color }}
      >
        {stageLabel}
      </p>
    </motion.button>
  )
}

// ── Ambient particles ─────────────────────────────────────────────────────────

function Particles({ sky }) {
  const isNight = sky.label === 'Night'
  const particles = useMemo(() =>
    Array.from({ length: isNight ? 8 : 5 }, (_, i) => ({
      id: i,
      emoji: isNight ? '✨' : ['🌸', '🌿', '🍀', '⭐', '💫'][i % 5],
      x: 8 + (i * 13) % 84,
      delay: i * 0.6,
      duration: 3.5 + (i * 0.4) % 2.5,
    })), [isNight])

  return (
    <>
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="pointer-events-none absolute"
          style={{ left: `${p.x}%`, top: '20%', fontSize: 10, opacity: 0.6 }}
          animate={{ y: [-6, -22, -6], opacity: [0.3, 0.7, 0.3], x: [-4, 4, -4] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </>
  )
}

// ── Toast popup ───────────────────────────────────────────────────────────────

function PlotToast({ text, color, onClose }) {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-2 z-20 -translate-x-1/2 rounded-full px-4 py-1.5 text-center font-round text-xs font-bold text-white shadow-xl"
      style={{ background: `linear-gradient(135deg, ${color}, #1E1B4B)`, whiteSpace: 'nowrap', maxWidth: 220 }}
      initial={{ opacity: 0, y: -6, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.9 }}
    >
      {text}
    </motion.div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function BloomGarden({ progress, theme, onNavigate }) {
  const { speak } = useSpeech()
  const [toast, setToast] = useState(null)

  const sessions = progress?.sessions || []
  const totalStars = progress?.totalStars || 0
  const loginStreak = progress?.loginStreak || 0
  const hour = new Date().getHours()
  const sky = getSky(hour)
  const tree = getCentralTree(loginStreak, totalStars)

  const handlePlotTap = (plot, stage) => {
    speak(plot.speech[stage], { mood: 'guide' })
    setToast({ text: plot.speech[stage], color: plot.color })
    setTimeout(() => setToast(null), 3200)
    onNavigate?.(plot.id)
  }

  const handleTreeTap = () => {
    const msg = loginStreak >= 3
      ? `Your Bloom Tree has been growing for ${loginStreak} days in a row! Amazing!`
      : loginStreak >= 1
        ? `Your Bloom Tree is ${loginStreak === 1 ? 'one day' : `${loginStreak} days`} old — come back tomorrow to keep it growing!`
        : 'This is your Bloom Tree — it grows every day you come back to learn!'
    speak(msg, { mood: 'celebrate' })
    setToast({ text: loginStreak >= 1 ? `${loginStreak}-day streak 🔥` : 'Come back tomorrow!', color: tree.color })
    setTimeout(() => setToast(null), 3000)
  }

  const totalGarden = PLOTS.reduce((sum, p) => sum + getStage(progress[p.id]?.score || 0), 0)
  const maxGarden = PLOTS.length * 3
  const gardenPct = Math.round((totalGarden / maxGarden) * 100)

  return (
    <section className="mx-auto mt-4 max-w-6xl px-4 md:px-6 xl:px-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        className="relative overflow-hidden rounded-[26px]"
        style={{
          background: `linear-gradient(180deg, ${sky.top} 0%, ${sky.mid} 55%, ${sky.bot} 100%)`,
          border: '1.5px solid rgba(255,255,255,0.1)',
          boxShadow: '0 12px 36px rgba(0,0,0,0.45)',
          minHeight: 200,
        }}
      >
        {/* Ambient particles */}
        <Particles sky={sky} />

        {/* Toast */}
        <AnimatePresence>
          {toast && <PlotToast text={toast.text} color={toast.color} onClose={() => setToast(null)} />}
        </AnimatePresence>

        {/* Header row */}
        <div className="relative z-10 flex items-center justify-between px-4 pt-3 pb-1">
          <div>
            <p
              className="font-round text-[10px] font-black uppercase tracking-[0.16em]"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              {sky.label} · Living World
            </p>
            <p className="font-bubble text-base leading-tight text-white">
              Bloom Garden
            </p>
          </div>
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <span style={{ fontSize: 13 }}>🌱</span>
            <span className="font-bubble text-xs text-white">{gardenPct}% grown</span>
          </div>
        </div>

        {/* Garden scene */}
        <div className="relative z-10 flex items-end justify-around px-3 pb-4 pt-2">
          {/* Left 2 plots */}
          {PLOTS.slice(0, 2).map((plot, idx) => (
            <PlotTile
              key={plot.id}
              plot={plot}
              score={progress[plot.id]?.score || 0}
              watered={isWateredToday(sessions, plot.id)}
              onTap={handlePlotTap}
              idx={idx}
            />
          ))}

          {/* Central tree */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={handleTreeTap}
            className="relative flex flex-col items-center gap-1"
            style={{ minWidth: 72 }}
          >
            <div
              className="relative flex items-center justify-center rounded-[20px]"
              style={{
                width: 68, height: 68,
                background: `radial-gradient(circle at 50% 100%, ${tree.color}30, rgba(0,0,0,0.2))`,
                border: `2px solid ${tree.color}55`,
                boxShadow: `0 0 24px ${tree.color}60, 0 6px 16px rgba(0,0,0,0.5)`,
              }}
            >
              <motion.span
                style={{ fontSize: 34 }}
                animate={{ y: [0, -5, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                {tree.emoji}
              </motion.span>

              {/* Streak badge */}
              {loginStreak >= 1 && (
                <motion.div
                  className="absolute -top-2 -right-2 flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-bubble text-[9px] text-white"
                  style={{ background: 'rgba(249,115,22,0.9)', boxShadow: '0 2px 6px rgba(249,115,22,0.6)' }}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                >
                  🔥{loginStreak}
                </motion.div>
              )}

              {/* Glow pulse */}
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-[18px]"
                style={{ border: `2px solid ${tree.color}80` }}
                animate={{ scale: [1, 1.25], opacity: [0.6, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
              />
            </div>

            <p
              className="font-round text-center leading-tight"
              style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', maxWidth: 72 }}
            >
              Bloom Tree
            </p>
            <p className="font-bubble" style={{ fontSize: 9, color: tree.color }}>
              {['Seed', 'Sprout', 'Pine', 'Oak'][tree.stage]}
            </p>
          </motion.button>

          {/* Right 2 plots */}
          {PLOTS.slice(2, 4).map((plot, idx) => (
            <PlotTile
              key={plot.id}
              plot={plot}
              score={progress[plot.id]?.score || 0}
              watered={isWateredToday(sessions, plot.id)}
              onTap={handlePlotTap}
              idx={idx + 2}
            />
          ))}
        </div>

        {/* Ground strip */}
        <div
          className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.45), transparent)',
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}
        />

        {/* Stars row at bottom */}
        <div
          className="relative z-10 flex items-center justify-center gap-3 px-4 pb-3"
          style={{ marginTop: -8 }}
        >
          {PLOTS.map(plot => {
            const stage = getStage(progress[plot.id]?.score || 0)
            return (
              <div key={plot.id} className="flex items-center gap-1">
                {[0, 1, 2, 3].map(s => (
                  <div
                    key={s}
                    className="rounded-full"
                    style={{
                      width: 6, height: 6,
                      background: s <= stage ? plot.color : 'rgba(255,255,255,0.12)',
                      boxShadow: s <= stage ? `0 0 6px ${plot.color}` : 'none',
                    }}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </motion.div>
    </section>
  )
}
