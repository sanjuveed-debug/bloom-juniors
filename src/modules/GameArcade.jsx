import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'

import { THEMES } from '../themes'
import { useSpeech } from '../hooks/useSpeech'
import { STUDY_MODULES, getArcadeUnlockStatus } from '../utils/arcadeUnlock'
import { formatLocalDate } from '../utils/date.js'

const ARCADE_GAMES = [
  {
    id: 'memory',
    emoji: '🧠',
    title: 'Magic Memory',
    desc: 'Flip cards, build streaks, and clear 3 themed worlds.',
    accent: '#FB7185',
    reward: 'Up to 5 stars',
  },
  {
    id: 'balloon',
    emoji: '🎈',
    title: 'Balloon Burst',
    desc: 'Pop the right balloons before the wave floats away.',
    accent: '#38BDF8',
    reward: 'Up to 5 stars',
  },
  {
    id: 'slice',
    emoji: '🍉',
    title: 'Fruit Slice Frenzy',
    desc: 'Swipe through flying fruit, dodge bombs, and build juicy combos.',
    accent: '#F59E0B',
    reward: 'Up to 6 stars',
  },
  {
    id: 'builder',
    emoji: '🧱',
    title: 'Inventor Blocks',
    desc: 'Snap rocket parts together like digital lego and launch your design.',
    accent: '#8B5CF6',
    reward: 'Up to 5 stars',
  },
  {
    id: 'shadow',
    emoji: '🔦',
    title: 'Shadow Match',
    desc: 'Match each friend to its mystery shadow across 3 rounds.',
    accent: '#6366F1',
    reward: 'Up to 5 stars',
  },
  {
    id: 'rocket',
    emoji: '🚀',
    title: 'Rocket Count',
    desc: 'Load exactly the right number of stars and blast off!',
    accent: '#F43F5E',
    reward: 'Up to 5 stars',
  },
]

// Daily rotation: 2 featured games per day (date-seeded, same approach as the
// adventure picker), one of which is the Daily Special worth double stars.
// The rest "rest" until tomorrow so the arcade feels fresh every day.
function getDailyArcade() {
  const dateStr = formatLocalDate()
  let seed = dateStr.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
  const pool = [...ARCADE_GAMES]
  for (let i = pool.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0
    const j = seed % (i + 1)
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return { featured: pool.slice(0, 2), resting: pool.slice(2), specialId: pool[0].id }
}

const SLICE_FRUITS = [
  { emoji: '🍉', color: '#22C55E' },
  { emoji: '🍓', color: '#FB7185' },
  { emoji: '🍊', color: '#F97316' },
  { emoji: '🍍', color: '#F59E0B' },
  { emoji: '🍇', color: '#8B5CF6' },
  { emoji: '🥝', color: '#65A30D' },
  { emoji: '🍌', color: '#FACC15' },
  { emoji: '🍎', color: '#EF4444' },
]

const SLICE_DURATION_SECONDS = 30

const BUILDER_SECTIONS = [
  {
    id: 'nose',
    label: 'Nose Cone',
    options: [
      { id: 'sun', name: 'Sun', primary: '#F97316', secondary: '#FDE68A', icon: '▲' },
      { id: 'mint', name: 'Mint', primary: '#10B981', secondary: '#A7F3D0', icon: '▲' },
      { id: 'galaxy', name: 'Galaxy', primary: '#8B5CF6', secondary: '#C4B5FD', icon: '▲' },
      { id: 'berry', name: 'Berry', primary: '#EC4899', secondary: '#F9A8D4', icon: '▲' },
    ],
  },
  {
    id: 'body',
    label: 'Body',
    options: [
      { id: 'sky', name: 'Sky', primary: '#60A5FA', secondary: '#DBEAFE', icon: '▥' },
      { id: 'gold', name: 'Gold', primary: '#F59E0B', secondary: '#FDE68A', icon: '▥' },
      { id: 'coral', name: 'Coral', primary: '#FB7185', secondary: '#FECDD3', icon: '▥' },
      { id: 'forest', name: 'Forest', primary: '#059669', secondary: '#BBF7D0', icon: '▥' },
    ],
  },
  {
    id: 'window',
    label: 'Window',
    options: [
      { id: 'single', name: 'Single', primary: '#93C5FD', secondary: '#EFF6FF', icon: '◉' },
      { id: 'double', name: 'Double', primary: '#60A5FA', secondary: '#E0F2FE', icon: '◎' },
      { id: 'star', name: 'Star', primary: '#FDE68A', secondary: '#FFF7ED', icon: '★' },
      { id: 'heart', name: 'Heart', primary: '#F9A8D4', secondary: '#FFF1F2', icon: '♥' },
    ],
  },
  {
    id: 'fins',
    label: 'Fins',
    options: [
      { id: 'flare', name: 'Flare', primary: '#EF4444', secondary: '#FCA5A5', icon: '◀▶' },
      { id: 'ice', name: 'Ice', primary: '#38BDF8', secondary: '#BAE6FD', icon: '◀▶' },
      { id: 'plasma', name: 'Plasma', primary: '#A855F7', secondary: '#DDD6FE', icon: '◀▶' },
      { id: 'lime', name: 'Lime', primary: '#84CC16', secondary: '#D9F99D', icon: '◀▶' },
    ],
  },
  {
    id: 'booster',
    label: 'Booster',
    options: [
      { id: 'flame', name: 'Flame', primary: '#F97316', secondary: '#FDE68A', icon: '🔥' },
      { id: 'turbo', name: 'Turbo', primary: '#38BDF8', secondary: '#E0F2FE', icon: '⚡' },
      { id: 'rainbow', name: 'Rainbow', primary: '#8B5CF6', secondary: '#F9A8D4', icon: '🌈' },
      { id: 'spark', name: 'Spark', primary: '#FACC15', secondary: '#FEF3C7', icon: '✨' },
    ],
  },
  {
    id: 'badge',
    label: 'Badge',
    options: [
      { id: 'star', name: 'Star', primary: '#FACC15', secondary: '#FEF3C7', icon: '⭐' },
      { id: 'moon', name: 'Moon', primary: '#C4B5FD', secondary: '#EEF2FF', icon: '🌙' },
      { id: 'planet', name: 'Planet', primary: '#34D399', secondary: '#CCFBF1', icon: '🪐' },
      { id: 'robot', name: 'Robot', primary: '#FB7185', secondary: '#FFE4E6', icon: '🤖' },
    ],
  },
]

const MEMORY_ROUNDS = [
  {
    id: 'garden',
    title: 'Garden Glow',
    subtitle: 'Match the garden friends.',
    bg: 'linear-gradient(145deg, #FB7185, #F59E0B)',
    pairs: [
      { id: 'bee', emoji: '🐝', label: 'Bee' },
      { id: 'flower', emoji: '🌸', label: 'Flower' },
      { id: 'ladybug', emoji: '🐞', label: 'Ladybug' },
      { id: 'sun', emoji: '🌞', label: 'Sun' },
    ],
  },
  {
    id: 'ocean',
    title: 'Ocean Spark',
    subtitle: 'Find the matching sea treasures.',
    bg: 'linear-gradient(145deg, #0EA5E9, #34D399)',
    pairs: [
      { id: 'whale', emoji: '🐋', label: 'Whale' },
      { id: 'shell', emoji: '🐚', label: 'Shell' },
      { id: 'fish', emoji: '🐠', label: 'Fish' },
      { id: 'dolphin', emoji: '🐬', label: 'Dolphin' },
      { id: 'starfish', emoji: '⭐', label: 'Starfish' },
    ],
  },
  {
    id: 'space',
    title: 'Space Parade',
    subtitle: 'Finish the final galaxy board.',
    bg: 'linear-gradient(145deg, #312E81, #8B5CF6)',
    pairs: [
      { id: 'rocket', emoji: '🚀', label: 'Rocket' },
      { id: 'planet', emoji: '🪐', label: 'Planet' },
      { id: 'moon', emoji: '🌙', label: 'Moon' },
      { id: 'alien', emoji: '👽', label: 'Alien' },
      { id: 'star', emoji: '🌟', label: 'Star' },
      { id: 'comet', emoji: '☄️', label: 'Comet' },
    ],
  },
]

const BALLOON_WAVES = [
  {
    id: 'letters-a',
    title: 'Letter Lift-Off',
    prompt: 'Pop only the balloons that show A.',
    targetLabel: 'A balloons',
    balloons: [
      { id: 'a1', text: 'A', color: '#FB7185', correct: true },
      { id: 'b1', text: 'B', color: '#FBBF24', correct: false },
      { id: 'a2', text: 'A', color: '#60A5FA', correct: true },
      { id: 'c1', text: 'C', color: '#A78BFA', correct: false },
      { id: 'd1', text: 'D', color: '#34D399', correct: false },
      { id: 'a3', text: 'A', color: '#F97316', correct: true },
      { id: 'm1', text: 'M', color: '#F472B6', correct: false },
      { id: 't1', text: 'T', color: '#22C55E', correct: false },
    ],
  },
  {
    id: 'numbers-five',
    title: 'Number Drift',
    prompt: 'Pop the balloons that show 5.',
    targetLabel: 'number 5',
    balloons: [
      { id: 'n5a', text: '5', color: '#60A5FA', correct: true },
      { id: 'n2', text: '2', color: '#FB7185', correct: false },
      { id: 'n9', text: '9', color: '#34D399', correct: false },
      { id: 'n5b', text: '5', color: '#F59E0B', correct: true },
      { id: 'n3', text: '3', color: '#A78BFA', correct: false },
      { id: 'n7', text: '7', color: '#F97316', correct: false },
      { id: 'n1', text: '1', color: '#22C55E', correct: false },
      { id: 'n5c', text: '5', color: '#F472B6', correct: true },
    ],
  },
  {
    id: 'color-blue',
    title: 'Colour Splash',
    prompt: 'Pop only the blue balloons.',
    targetLabel: 'blue balloons',
    balloons: [
      { id: 'blue1', text: '★', color: '#38BDF8', correct: true },
      { id: 'pink1', text: '●', color: '#FB7185', correct: false },
      { id: 'green1', text: '▲', color: '#34D399', correct: false },
      { id: 'blue2', text: '■', color: '#60A5FA', correct: true },
      { id: 'yellow1', text: '◆', color: '#FBBF24', correct: false },
      { id: 'purple1', text: '♥', color: '#A78BFA', correct: false },
      { id: 'orange1', text: '☀', color: '#F97316', correct: false },
      { id: 'blue3', text: '✦', color: '#0EA5E9', correct: true },
    ],
  },
  {
    id: 'stars',
    title: 'Star Storm',
    prompt: 'Pop the star balloons.',
    targetLabel: 'star balloons',
    balloons: [
      { id: 'star1', text: '⭐', color: '#FB7185', correct: true },
      { id: 'moon1', text: '🌙', color: '#60A5FA', correct: false },
      { id: 'sun1', text: '☀️', color: '#FBBF24', correct: false },
      { id: 'heart1', text: '💛', color: '#F472B6', correct: false },
      { id: 'star2', text: '⭐', color: '#34D399', correct: true },
      { id: 'rainbow1', text: '🌈', color: '#A78BFA', correct: false },
      { id: 'flower1', text: '🌸', color: '#F97316', correct: false },
      { id: 'star3', text: '⭐', color: '#22C55E', correct: true },
    ],
  },
]

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5)
}

function buildMemoryDeck(round) {
  return shuffle(
    round.pairs.flatMap(pair => ([
      { id: `${round.id}-${pair.id}-a`, pairId: pair.id, emoji: pair.emoji, label: pair.label },
      { id: `${round.id}-${pair.id}-b`, pairId: pair.id, emoji: pair.emoji, label: pair.label },
    ]))
  )
}

function getMemoryReward(totalMistakes) {
  if (totalMistakes <= 3) return 5
  if (totalMistakes <= 7) return 4
  return 3
}

function getBalloonReward(accuracy) {
  if (accuracy >= 90) return 5
  if (accuracy >= 75) return 4
  return 3
}

function getSliceReward(score, bombHits) {
  if (score >= 22 && bombHits === 0) return 6
  if (score >= 16) return 5
  if (score >= 10) return 4
  return 3
}

function getBuilderReward(colorVariety) {
  if (colorVariety >= 4) return 5
  if (colorVariety >= 3) return 4
  return 3
}

function getGameGradient(gameId) {
  if (gameId === 'memory') return 'linear-gradient(145deg, #FB7185, #F59E0B, #7C3AED)'
  if (gameId === 'balloon') return 'linear-gradient(145deg, #0EA5E9, #14B8A6, #22C55E)'
  if (gameId === 'builder') return 'linear-gradient(145deg, #312E81, #8B5CF6, #22C55E)'
  if (gameId === 'shadow') return 'linear-gradient(145deg, #1E1B4B, #6366F1, #A78BFA)'
  if (gameId === 'rocket') return 'linear-gradient(145deg, #881337, #F43F5E, #FB923C)'
  return 'linear-gradient(145deg, #F97316, #FACC15, #FB7185)'
}

function getGamePreview(gameId) {
  if (gameId === 'memory') return ['🐝', '🐬', '🚀']
  if (gameId === 'balloon') return ['🎈', '⭐', '5']
  if (gameId === 'builder') return ['🚀', '🧱', '⭐']
  if (gameId === 'shadow') return ['🦋', '🔦', '🐘']
  if (gameId === 'rocket') return ['🚀', '⭐', '7']
  return ['🍉', '🍓', '💣']
}

function getGameNote(gameId) {
  if (gameId === 'memory') return '3 rounds of bigger boards'
  if (gameId === 'balloon') return '4 waves with accuracy bonus'
  if (gameId === 'builder') return 'snap parts + launch'
  if (gameId === 'shadow') return '3 rounds of mystery shadows'
  if (gameId === 'rocket') return '5 launches, count to fuel up'
  return '30 second slicing rush'
}

function getBuilderSelectionMap(selection) {
  return Object.fromEntries(
    BUILDER_SECTIONS.map(section => [
      section.id,
      section.options.find(option => option.id === selection[section.id]) || null,
    ]),
  )
}

function segmentIntersectsCircle(a, b, center, radius) {
  const abx = b.x - a.x
  const aby = b.y - a.y
  const abLenSq = abx * abx + aby * aby

  if (abLenSq === 0) {
    const dx = a.x - center.x
    const dy = a.y - center.y
    return dx * dx + dy * dy <= radius * radius
  }

  const t = Math.max(0, Math.min(1, (((center.x - a.x) * abx) + ((center.y - a.y) * aby)) / abLenSq))
  const closestX = a.x + abx * t
  const closestY = a.y + aby * t
  const dx = closestX - center.x
  const dy = closestY - center.y

  return (dx * dx + dy * dy) <= radius * radius
}

function makeSliceItem(size, nextId) {
  const isBomb = Math.random() < 0.16
  const fruit = SLICE_FRUITS[Math.floor(Math.random() * SLICE_FRUITS.length)]
  const width = Math.max(size.width || 320, 320)
  const height = Math.max(size.height || 540, 540)
  const x = 54 + Math.random() * Math.max(width - 108, 40)

  return {
    id: `slice-${nextId}`,
    type: isBomb ? 'bomb' : 'fruit',
    emoji: isBomb ? '💣' : fruit.emoji,
    color: isBomb ? '#111827' : fruit.color,
    x,
    y: height + 50,
    vx: -3.6 + Math.random() * 7.2,
    vy: -(14 + Math.random() * 4),
    gravity: 0.28 + Math.random() * 0.06,
    radius: isBomb ? 30 : 34,
    rotation: Math.random() * 90,
    spin: -9 + Math.random() * 18,
    sliced: false,
    ttl: 0,
  }
}

function ArcadeHeader({ theme, title, subtitle, onBack, badge }) {
  return (
    <div className="flex items-center justify-between px-4 pt-safe pb-3">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onBack}
        className="flex h-11 w-11 items-center justify-center rounded-full shadow"
        style={{ background: theme.card, color: theme.text }}
      >
        ←
      </motion.button>

      <div className="text-center px-3">
        <p className="font-bubble text-[1.45rem] leading-tight shimmer-text">{title}</p>
        <p className="font-round text-xs font-bold opacity-70" style={{ color: theme.text }}>
          {subtitle}
        </p>
      </div>

      <div
        className="flex min-w-[48px] items-center justify-center rounded-full px-3 py-1.5"
        style={{ background: `${theme.primary}18`, color: theme.primary }}
      >
        <span className="font-bubble text-sm">{badge}</span>
      </div>
    </div>
  )
}

function StudyLockScreen({ theme, status, onBack, onNavigate }) {
  const nextModule = status.remainingModules[0]

  return (
    <div className="min-h-screen overflow-y-auto pb-safe"
      style={{ background: `linear-gradient(160deg, ${theme.bg}, white 45%, ${theme.card})` }}>
      <ArcadeHeader
        theme={theme}
        title="Game Arcade"
        subtitle="Study first, then the games open."
        onBack={onBack}
        badge={`${status.completedCount}/${status.target}`}
      />

      <div className="px-4 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[32px] shadow-xl"
          style={{ background: 'linear-gradient(145deg, #0F172A, #1E1B4B, #FB7185)' }}
        >
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bubble text-3xl text-white">🔒 Play Pass Locked</p>
                <p className="font-round mt-2 text-sm font-semibold text-white/80">
                  Finish today&apos;s study pass and the arcade opens automatically.
                </p>
              </div>
              <div className="rounded-[22px] bg-white/10 px-4 py-3 text-center backdrop-blur">
                <p className="font-bubble text-2xl text-yellow-200">{status.completedCount}/{status.target}</p>
                <p className="font-round text-[11px] font-bold text-white/65">Done today</p>
              </div>
            </div>

            <div className="mt-4 h-3 rounded-full overflow-hidden bg-white/15">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #FDE68A, #F472B6, #60A5FA)' }}
                initial={{ width: 0 }}
                animate={{ width: `${status.progressPercent}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {STUDY_MODULES.map(module => {
                const done = status.completedModules.some(item => item.id === module.id)
                return (
                  <div
                    key={module.id}
                    className="flex items-center gap-2 rounded-[20px] px-3 py-3"
                    style={{ background: done ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.10)' }}
                  >
                    <span style={{ fontSize: 18 }}>{done ? '✅' : module.emoji}</span>
                    <div>
                      <p className="font-bubble text-sm text-white">{module.label}</p>
                      <p className="font-round text-[11px] font-bold text-white/65">
                        {done ? 'Completed' : 'Still needed'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>

        <div className="mt-5 grid gap-3">
          {ARCADE_GAMES.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 + index * 0.07 }}
              className="relative overflow-hidden rounded-[28px] p-4 shadow-lg"
              style={{ background: getGameGradient(game.id) }}
            >
              <div className="absolute inset-0 bg-black/15" />
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div>
                  <p className="font-bubble text-xl text-white">{game.emoji} {game.title}</p>
                  <p className="font-round mt-1 text-sm font-semibold text-white/80">{game.desc}</p>
                </div>
                <div className="rounded-full bg-white/15 px-3 py-2 backdrop-blur">
                  <span className="font-bubble text-sm text-white">Locked</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate(status.nextModuleId)}
          className="bubble-btn mt-6 w-full px-6 py-4 text-lg"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}
        >
          {nextModule ? `Play ${nextModule.label} Next` : 'Back to Study'}
        </motion.button>

        <p className="font-round mt-3 text-center text-xs font-bold" style={{ color: theme.text, opacity: 0.58 }}>
          The arcade resets each day, so study time stays the first step.
        </p>
      </div>
    </div>
  )
}

function GameCard({ game, onSelect, special }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(game.id)}
      className="relative overflow-hidden rounded-[30px] p-5 text-left shadow-xl"
      style={{ background: getGameGradient(game.id) }}
    >
      <div className="absolute inset-0 bg-white/5" />
      <div className="relative z-10">
        {special && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="mb-3 inline-flex items-center gap-1 rounded-full px-3 py-1 font-bubble text-xs"
            style={{ background: 'linear-gradient(135deg, #FDE68A, #F59E0B)', color: '#78350F' }}
          >
            ⭐ Daily Special · 2× stars today!
          </motion.div>
        )}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-bubble text-2xl text-white">{game.emoji} {game.title}</p>
            <p className="font-round mt-1 text-sm font-semibold text-white/80">{game.desc}</p>
          </div>
          <div
            className="rounded-[18px] px-3 py-2 text-center backdrop-blur"
            style={{ background: 'rgba(255,255,255,0.16)', minWidth: 92 }}
          >
            <p className="font-bubble text-sm text-yellow-100">{game.reward}</p>
            <p className="font-round text-[11px] font-bold text-white/65">per run</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {getGamePreview(game.id).map(item => (
            <div
              key={item}
              className="flex h-16 items-center justify-center rounded-[20px] bg-white/14 backdrop-blur"
            >
              <span style={{ fontSize: 28 }}>{item}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className="font-round text-xs font-bold text-white/70">
            {getGameNote(game.id)}
          </span>
          <span className="font-bubble text-sm text-white">Play Now</span>
        </div>
      </div>
    </motion.button>
  )
}

function RestingGameCard({ game }) {
  return (
    <div className="relative overflow-hidden rounded-[26px] p-4"
      style={{ background: 'rgba(15,23,42,0.06)', border: '1.5px dashed rgba(15,23,42,0.2)' }}>
      <div className="flex items-center gap-3">
        <span style={{ fontSize: 30, filter: 'grayscale(0.6)', opacity: 0.7 }}>{game.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-bubble text-lg" style={{ color: '#475569' }}>{game.title}</p>
          <p className="font-round text-xs font-bold" style={{ color: '#64748B' }}>
            Resting today — back in the rotation tomorrow!
          </p>
        </div>
        <span className="shrink-0 rounded-full px-3 py-1 font-round text-xs font-bold"
          style={{ background: 'rgba(15,23,42,0.08)', color: '#475569' }}>
          🌙 Tomorrow
        </span>
      </div>
    </div>
  )
}

function ArcadeLobby({ theme, profileName, progress, onBack, onSelect }) {
  const daily = getDailyArcade()
  return (
    <div className="min-h-screen overflow-y-auto pb-safe"
      style={{ background: `linear-gradient(160deg, ${theme.bg}, white 42%, ${theme.card})` }}>
      <ArcadeHeader
        theme={theme}
        title="Game Arcade"
        subtitle="Study complete. Choose a reward game."
        onBack={onBack}
        badge="OPEN"
      />

      <div className="px-4 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] p-5 shadow-xl"
          style={{ background: 'linear-gradient(145deg, #0F172A, #1D4ED8, #14B8A6)' }}
        >
          <p className="font-round text-sm font-bold text-white/70">Reward unlocked</p>
          <p className="font-bubble mt-1 text-3xl text-white">
            {profileName || 'Superstar'}, play time is ready.
          </p>
          <p className="font-round mt-2 text-sm font-semibold text-white/80">
            Finish a game, collect more stars, and come back tomorrow to unlock the arcade again.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-[22px] bg-white/12 p-3 backdrop-blur">
              <p className="font-bubble text-xl text-yellow-100">{progress.arcade?.score || 0} ⭐</p>
              <p className="font-round text-xs font-bold text-white/65">Arcade stars earned</p>
            </div>
            <div className="rounded-[22px] bg-white/12 p-3 backdrop-blur">
              <p className="font-bubble text-xl text-white">{daily.featured.length}</p>
              <p className="font-round text-xs font-bold text-white/65">Today's games — fresh picks tomorrow</p>
            </div>
          </div>
        </motion.div>

        <p className="mt-6 mb-3 font-round text-xs font-black uppercase tracking-[0.18em]"
          style={{ color: theme.text, opacity: 0.55 }}>
          🎮 Today's Games
        </p>
        <div className="grid gap-4">
          {daily.featured.map(game => (
            <GameCard key={game.id} game={game} onSelect={onSelect}
              special={game.id === daily.specialId} />
          ))}
        </div>

        {daily.resting.length > 0 && (
          <>
            <p className="mt-6 mb-3 font-round text-xs font-black uppercase tracking-[0.18em]"
              style={{ color: theme.text, opacity: 0.55 }}>
              🌙 Back Tomorrow
            </p>
            <div className="grid gap-3">
              {daily.resting.map(game => (
                <RestingGameCard key={game.id} game={game} />
              ))}
            </div>
          </>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onBack}
          className="bubble-btn mt-6 w-full px-6 py-4 text-lg"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}
        >
          ← Back to Today
        </motion.button>
      </div>
    </div>
  )
}

function MemoryMission({ theme, profileName, speak, onBack, onComplete }) {
  const [roundIndex, setRoundIndex] = useState(0)
  const [deck, setDeck] = useState(() => buildMemoryDeck(MEMORY_ROUNDS[0]))
  const [flippedIds, setFlippedIds] = useState([])
  const [matchedIds, setMatchedIds] = useState([])
  const [turnLocked, setTurnLocked] = useState(false)
  const [moves, setMoves] = useState(0)
  const [totalMoves, setTotalMoves] = useState(0)
  const [mistakesByRound, setMistakesByRound] = useState({})
  const [roundComplete, setRoundComplete] = useState(false)
  const currentRound = MEMORY_ROUNDS[roundIndex]
  const totalPairs = MEMORY_ROUNDS.reduce((sum, round) => sum + round.pairs.length, 0)

  useEffect(() => {
    setDeck(buildMemoryDeck(currentRound))
    setFlippedIds([])
    setMatchedIds([])
    setTurnLocked(false)
    setMoves(0)
    setRoundComplete(false)

    const timer = setTimeout(() => {
      speak(`${currentRound.title}. ${currentRound.subtitle}`, { mood: 'instruct' })
    }, 350)

    return () => clearTimeout(timer)
  }, [currentRound, speak])

  useEffect(() => {
    if (!deck.length || matchedIds.length !== deck.length) return

    confetti({ particleCount: 80, spread: 80, origin: { y: 0.65 }, colors: ['#FDE68A', '#FB7185', '#60A5FA'] })

    if (roundIndex === MEMORY_ROUNDS.length - 1) {
      speak(`Amazing ${profileName || 'superstar'}! You cleared every memory world!`, { mood: 'celebrate' })
    } else {
      speak('Round clear! One more world is ready.', { mood: 'celebrate' })
      setRoundComplete(true)
    }
  }, [deck.length, matchedIds.length, profileName, roundIndex, speak])

  const handleFlip = useCallback((card) => {
    if (turnLocked || flippedIds.includes(card.id) || matchedIds.includes(card.id) || roundComplete) return

    const nextFlipped = [...flippedIds, card.id]
    setFlippedIds(nextFlipped)

    if (nextFlipped.length < 2) return

    setTurnLocked(true)
    setMoves(prev => prev + 1)
    setTotalMoves(prev => prev + 1)

    const [firstId, secondId] = nextFlipped
    const firstCard = deck.find(item => item.id === firstId)
    const secondCard = deck.find(item => item.id === secondId)

    if (firstCard?.pairId === secondCard?.pairId) {
      setTimeout(() => {
        setMatchedIds(prev => [...prev, firstId, secondId])
        setFlippedIds([])
        setTurnLocked(false)
        confetti({ particleCount: 26, spread: 50, origin: { y: 0.7 } })
      }, 420)
      return
    }

    setMistakesByRound(prev => ({
      ...prev,
      [currentRound.id]: (prev[currentRound.id] || 0) + 1,
    }))
    speak('Try again. Watch where the cards hide.', { mood: 'instruct' })

    setTimeout(() => {
      setFlippedIds([])
      setTurnLocked(false)
    }, 800)
  }, [currentRound.id, deck, flippedIds, matchedIds, roundComplete, speak, turnLocked])

  const totalMistakes = Object.values(mistakesByRound).reduce((sum, value) => sum + value, 0)
  const finishedAllRounds = roundIndex === MEMORY_ROUNDS.length - 1 && matchedIds.length === deck.length

  if (finishedAllRounds) {
    const stars = getMemoryReward(totalMistakes)
    const totalAttempts = totalPairs + totalMistakes
    const struggles = MEMORY_ROUNDS
      .filter(round => (mistakesByRound[round.id] || 0) >= 3)
      .map(round => round.title)

    return (
      <div className="min-h-screen flex flex-col justify-between pb-safe"
        style={{ background: `linear-gradient(160deg, ${theme.bg}, white 45%, ${theme.card})` }}>
        <ArcadeHeader
          theme={theme}
          title="Magic Memory"
          subtitle="All 3 worlds completed."
          onBack={onBack}
          badge={`${stars}⭐`}
        />

        <div className="px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[32px] p-6 text-center shadow-xl"
            style={{ background: 'linear-gradient(145deg, #FB7185, #7C3AED, #0EA5E9)' }}
          >
            <div className="text-6xl">🧠</div>
            <p className="font-bubble mt-2 text-4xl text-white">Memory Master</p>
            <p className="font-round mt-2 text-sm font-semibold text-white/80">
              You cleared every board and found all the pairs.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-[22px] bg-white/12 p-3">
                <p className="font-bubble text-2xl text-white">{totalPairs}</p>
                <p className="font-round text-xs font-bold text-white/65">Pairs found</p>
              </div>
              <div className="rounded-[22px] bg-white/12 p-3">
                <p className="font-bubble text-2xl text-white">{totalMoves}</p>
                <p className="font-round text-xs font-bold text-white/65">Turns used</p>
              </div>
              <div className="rounded-[22px] bg-white/12 p-3">
                <p className="font-bubble text-2xl text-white">{stars}</p>
                <p className="font-round text-xs font-bold text-white/65">Stars earned</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="px-4 pb-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onComplete({
              stars,
              total: totalAttempts,
              correct: totalPairs,
              struggles,
            })}
            className="bubble-btn w-full px-6 py-4 text-lg"
            style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}
          >
            Collect {stars} Stars
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-hidden pb-safe"
      style={{ background: `linear-gradient(160deg, ${theme.bg}, white 45%, ${theme.card})` }}>
      <ArcadeHeader
        theme={theme}
        title="Magic Memory"
        subtitle={currentRound.subtitle}
        onBack={onBack}
        badge={`${roundIndex + 1}/${MEMORY_ROUNDS.length}`}
      />

      <div className="px-4">
        <div
          className="rounded-[30px] p-5 shadow-xl"
          style={{ background: currentRound.bg }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-bubble text-2xl text-white">{currentRound.title}</p>
              <p className="font-round mt-1 text-sm font-semibold text-white/80">
                Match all {currentRound.pairs.length} pairs.
              </p>
            </div>
            <div className="rounded-[18px] bg-white/12 px-3 py-2 text-center backdrop-blur">
              <p className="font-bubble text-xl text-white">{moves}</p>
              <p className="font-round text-[11px] font-bold text-white/65">Turns</p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-3">
          {deck.map((card, index) => {
            const open = flippedIds.includes(card.id) || matchedIds.includes(card.id)
            const matched = matchedIds.includes(card.id)

            return (
              <motion.button
                key={card.id}
                whileTap={{ scale: matched ? 1 : 0.94 }}
                onClick={() => handleFlip(card)}
                className="relative aspect-[4/5] rounded-[24px] shadow-lg"
                style={{ perspective: 900 }}
              >
                <motion.div
                  className="relative h-full w-full rounded-[24px]"
                  animate={{ rotateY: open ? 180 : 0, scale: matched ? 0.96 : 1 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded-[24px]"
                    style={{
                      backfaceVisibility: 'hidden',
                      background: `linear-gradient(145deg, ${theme.primary}, ${theme.accent})`,
                      boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
                    }}
                  >
                    <motion.span
                      animate={{ rotate: [0, 8, -8, 0] }}
                      transition={{ duration: 2 + index * 0.15, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ fontSize: 30 }}
                    >
                      ✨
                    </motion.span>
                  </div>

                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center rounded-[24px]"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      background: matched ? 'linear-gradient(145deg, #22C55E, #14B8A6)' : 'white',
                      color: matched ? 'white' : theme.text,
                    }}
                  >
                    <span style={{ fontSize: 30 }}>{card.emoji}</span>
                    <span className="font-round mt-1 text-xs font-bold">{card.label}</span>
                  </div>
                </motion.div>
              </motion.button>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {roundComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-end bg-slate-950/45 p-4"
          >
            <motion.div
              initial={{ y: 80 }}
              animate={{ y: 0 }}
              exit={{ y: 80 }}
              className="w-full rounded-[30px] bg-white p-5 shadow-2xl"
            >
              <p className="font-bubble text-3xl" style={{ color: theme.primary }}>Round Complete</p>
              <p className="font-round mt-2 text-sm font-semibold" style={{ color: theme.text, opacity: 0.72 }}>
                Great memory. The next world is ready.
              </p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setRoundIndex(prev => prev + 1)}
                className="bubble-btn mt-4 w-full px-6 py-4 text-lg"
                style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}
              >
                Next World
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function BalloonBurst({ theme, profileName, speak, onBack, onComplete }) {
  const [waveIndex, setWaveIndex] = useState(0)
  const [poppedIds, setPoppedIds] = useState([])
  const [mistakes, setMistakes] = useState(0)
  const [mistakesByWave, setMistakesByWave] = useState({})
  const [waveComplete, setWaveComplete] = useState(false)
  const [wrongId, setWrongId] = useState(null)
  const wave = BALLOON_WAVES[waveIndex]
  const totalTargets = BALLOON_WAVES.reduce((sum, item) => sum + item.balloons.filter(balloon => balloon.correct).length, 0)

  useEffect(() => {
    setPoppedIds([])
    setWaveComplete(false)
    setWrongId(null)

    const timer = setTimeout(() => {
      speak(`${wave.title}. ${wave.prompt}`, { mood: 'instruct' })
    }, 350)

    return () => clearTimeout(timer)
  }, [speak, wave])

  const handlePop = useCallback((balloon) => {
    if (poppedIds.includes(balloon.id) || waveComplete) return

    if (balloon.correct) {
      const nextPopped = [...poppedIds, balloon.id]
      setPoppedIds(nextPopped)
      confetti({ particleCount: 18, spread: 40, origin: { y: 0.7 } })

      const targetCount = wave.balloons.filter(item => item.correct).length
      if (nextPopped.length === targetCount) {
        if (waveIndex === BALLOON_WAVES.length - 1) {
          speak(`Amazing ${profileName || 'superstar'}! You burst every right balloon!`, { mood: 'celebrate' })
        } else {
          speak('Wave clear! Another one is floating in.', { mood: 'celebrate' })
          setWaveComplete(true)
        }
      }
      return
    }

    setMistakes(prev => prev + 1)
    setWrongId(balloon.id)
    setMistakesByWave(prev => ({
      ...prev,
      [wave.id]: (prev[wave.id] || 0) + 1,
    }))
    speak('Not that one. Look for the target balloons.', { mood: 'instruct' })
    setTimeout(() => setWrongId(null), 360)
  }, [poppedIds, profileName, speak, wave, waveComplete, waveIndex])

  const totalCorrect = BALLOON_WAVES
    .slice(0, waveIndex)
    .reduce((sum, item) => sum + item.balloons.filter(balloon => balloon.correct).length, 0) + poppedIds.length

  const finishedAllWaves =
    waveIndex === BALLOON_WAVES.length - 1 &&
    poppedIds.length === wave.balloons.filter(balloon => balloon.correct).length

  if (finishedAllWaves) {
    const accuracy = (totalTargets + mistakes) > 0 ? Math.round((totalTargets / (totalTargets + mistakes)) * 100) : 0
    const stars = getBalloonReward(accuracy)
    const struggles = BALLOON_WAVES
      .filter(item => (mistakesByWave[item.id] || 0) >= 2)
      .map(item => item.title)

    return (
      <div className="min-h-screen flex flex-col justify-between pb-safe"
        style={{ background: `linear-gradient(160deg, ${theme.bg}, white 45%, ${theme.card})` }}>
        <ArcadeHeader
          theme={theme}
          title="Balloon Burst"
          subtitle="All 4 waves completed."
          onBack={onBack}
          badge={`${stars}⭐`}
        />

        <div className="px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[32px] p-6 text-center shadow-xl"
            style={{ background: 'linear-gradient(145deg, #0EA5E9, #14B8A6, #22C55E)' }}
          >
            <div className="text-6xl">🎈</div>
            <p className="font-bubble mt-2 text-4xl text-white">Balloon Champion</p>
            <p className="font-round mt-2 text-sm font-semibold text-white/80">
              You popped the right balloons and kept the wave under control.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-[22px] bg-white/12 p-3">
                <p className="font-bubble text-2xl text-white">{totalTargets}</p>
                <p className="font-round text-xs font-bold text-white/65">Right pops</p>
              </div>
              <div className="rounded-[22px] bg-white/12 p-3">
                <p className="font-bubble text-2xl text-white">{accuracy}%</p>
                <p className="font-round text-xs font-bold text-white/65">Accuracy</p>
              </div>
              <div className="rounded-[22px] bg-white/12 p-3">
                <p className="font-bubble text-2xl text-white">{stars}</p>
                <p className="font-round text-xs font-bold text-white/65">Stars earned</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="px-4 pb-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onComplete({
              stars,
              total: totalTargets + mistakes,
              correct: totalTargets,
              struggles,
            })}
            className="bubble-btn w-full px-6 py-4 text-lg"
            style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}
          >
            Collect {stars} Stars
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-hidden pb-safe"
      style={{ background: `linear-gradient(160deg, ${theme.bg}, white 45%, ${theme.card})` }}>
      <ArcadeHeader
        theme={theme}
        title="Balloon Burst"
        subtitle={wave.prompt}
        onBack={onBack}
        badge={`${waveIndex + 1}/${BALLOON_WAVES.length}`}
      />

      <div className="px-4">
        <div
          className="rounded-[30px] p-5 shadow-xl"
          style={{ background: 'linear-gradient(145deg, #0EA5E9, #14B8A6, #22C55E)' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bubble text-2xl text-white">{wave.title}</p>
              <p className="font-round mt-1 text-sm font-semibold text-white/80">{wave.targetLabel}</p>
            </div>
            <div className="rounded-[18px] bg-white/12 px-3 py-2 text-center backdrop-blur">
              <p className="font-bubble text-xl text-white">{Math.max(0, 3 - mistakes)}🛡️</p>
              <p className="font-round text-[11px] font-bold text-white/65">Shield left</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          {wave.balloons.map((balloon, index) => {
            const popped = poppedIds.includes(balloon.id)

            return (
              <motion.button
                key={balloon.id}
                whileTap={{ scale: popped ? 1 : 0.92 }}
                onClick={() => handlePop(balloon)}
                className="relative flex h-36 items-end justify-center"
                animate={{
                  opacity: popped ? 0 : 1,
                  scale: popped ? 0 : 1,
                  y: popped ? -16 : [0, -8, 0],
                  x: wrongId === balloon.id ? [0, -8, 8, -6, 0] : 0,
                }}
                transition={{
                  opacity: { duration: 0.2 },
                  scale: { duration: 0.25 },
                  y: popped ? { duration: 0.25 } : { duration: 2.4 + index * 0.16, repeat: Infinity, ease: 'easeInOut' },
                  x: { duration: 0.28 },
                }}
              >
                <div className="absolute bottom-0 h-10 w-[2px] bg-white/60" />
                <div
                  className="relative flex h-28 w-24 flex-col items-center justify-center rounded-[46%_46%_42%_42%] shadow-xl"
                  style={{
                    background: `linear-gradient(180deg, rgba(255,255,255,0.35), ${balloon.color})`,
                    border: '3px solid rgba(255,255,255,0.82)',
                    boxShadow: `0 16px 26px ${balloon.color}55`,
                  }}
                >
                  <div className="absolute inset-x-5 top-4 h-8 rounded-full bg-white/20 blur-md" />
                  <span className="font-bubble relative z-10 text-4xl text-white drop-shadow">
                    {balloon.text}
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>

        <div className="mt-5 rounded-[26px] p-4 shadow-md" style={{ background: 'rgba(255,255,255,0.78)' }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-bubble text-lg" style={{ color: theme.text }}>Pop Progress</p>
              <p className="font-round text-xs font-bold" style={{ color: theme.text, opacity: 0.58 }}>
                Right pops {totalCorrect}/{totalTargets}
              </p>
            </div>
            <span className="font-bubble text-lg" style={{ color: theme.primary }}>
              {mistakes} misses
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {waveComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-end bg-slate-950/45 p-4"
          >
            <motion.div
              initial={{ y: 80 }}
              animate={{ y: 0 }}
              exit={{ y: 80 }}
              className="w-full rounded-[30px] bg-white p-5 shadow-2xl"
            >
              <p className="font-bubble text-3xl" style={{ color: theme.primary }}>Wave Clear</p>
              <p className="font-round mt-2 text-sm font-semibold" style={{ color: theme.text, opacity: 0.72 }}>
                Nice focus. The next balloon wave is ready.
              </p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setWaveIndex(prev => prev + 1)}
                className="bubble-btn mt-4 w-full px-6 py-4 text-lg"
                style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}
              >
                Next Wave
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FruitSliceFrenzy({ theme, profileName, speak, onBack, onComplete }) {
  const arenaRef = useRef(null)
  const itemsRef = useRef([])
  const draggingRef = useRef(false)
  const spawnAtRef = useRef(0)
  const itemIdRef = useRef(0)
  const comboRef = useRef(0)
  const lastSliceAtRef = useRef(0)
  const sizeRef = useRef({ width: 0, height: 0 })
  const trailClearRef = useRef(null)
  const burstClearRef = useRef(null)
  const trailRef = useRef([])

  const [items, setItems] = useState([])
  const [trail, setTrail] = useState([])
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(SLICE_DURATION_SECONDS)
  const [shields, setShields] = useState(3)
  const [slicedFruit, setSlicedFruit] = useState(0)
  const [missedFruit, setMissedFruit] = useState(0)
  const [bombHits, setBombHits] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [burstLabel, setBurstLabel] = useState(null)

  const showBurst = useCallback((label) => {
    setBurstLabel(label)
    window.clearTimeout(burstClearRef.current)
    burstClearRef.current = window.setTimeout(() => setBurstLabel(null), 700)
  }, [])

  const syncArenaSize = useCallback(() => {
    const rect = arenaRef.current?.getBoundingClientRect()
    if (!rect) return
    sizeRef.current = { width: rect.width, height: rect.height }
  }, [])

  const slicePausedRef = useRef(false)

  useEffect(() => {
    syncArenaSize()
    window.addEventListener('resize', syncArenaSize)
    const timer = setTimeout(() => {
      speak('Fruit Slice Frenzy. Swipe through fruit and avoid the bombs.', { mood: 'instruct' })
    }, 350)

    const onVisibility = () => {
      slicePausedRef.current = document.hidden
      if (!document.hidden) {
        // Reset spawn clock so items don't burst-spawn after a long background
        spawnAtRef.current = Date.now() + 500
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('resize', syncArenaSize)
      document.removeEventListener('visibilitychange', onVisibility)
      clearTimeout(timer)
      window.clearTimeout(trailClearRef.current)
      window.clearTimeout(burstClearRef.current)
    }
  }, [speak, syncArenaSize])

  useEffect(() => {
    comboRef.current = combo
  }, [combo])

  useEffect(() => {
    if (gameOver) return

    const tick = window.setInterval(() => {
      if (slicePausedRef.current) return
      const now = Date.now()
      setItems(prev => {
        const next = []
        let missedThisTick = 0

        prev.forEach(item => {
          if (item.sliced) {
            const ttl = item.ttl - 1
            if (ttl > 0) {
              next.push({
                ...item,
                ttl,
                x: item.x + item.vx,
                y: item.y + item.vy,
                vy: item.vy + item.gravity * 0.45,
                rotation: item.rotation + item.spin,
              })
            }
            return
          }

          const updated = {
            ...item,
            x: item.x + item.vx,
            y: item.y + item.vy,
            vy: item.vy + item.gravity,
            rotation: item.rotation + item.spin,
          }

          if (updated.y > sizeRef.current.height + 90) {
            if (updated.type === 'fruit') missedThisTick += 1
            return
          }

          next.push(updated)
        })

        if (missedThisTick > 0) {
          setMissedFruit(value => value + missedThisTick)
        }

        if (now >= spawnAtRef.current) {
          const spawnCount = Math.random() < 0.25 ? 2 : 1
          for (let index = 0; index < spawnCount; index += 1) {
            itemIdRef.current += 1
            next.push(makeSliceItem(sizeRef.current, itemIdRef.current))
          }
          spawnAtRef.current = now + 450 + Math.random() * 350
        }

        itemsRef.current = next
        return next
      })
    }, 40)

    const countdown = window.setInterval(() => {
      if (slicePausedRef.current) return
      setTimeLeft(value => {
        if (value <= 1) {
          setGameOver(true)
          return 0
        }
        return value - 1
      })
    }, 1000)

    return () => {
      window.clearInterval(tick)
      window.clearInterval(countdown)
    }
  }, [gameOver])

  const clearTrailSoon = useCallback(() => {
    window.clearTimeout(trailClearRef.current)
    trailClearRef.current = window.setTimeout(() => {
      trailRef.current = []
      setTrail([])
    }, 80)
  }, [])

  const localPointFromEvent = useCallback((event) => {
    const rect = arenaRef.current?.getBoundingClientRect()
    if (!rect) return null
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }, [])

  const processHits = useCallback((hitItems) => {
    if (!hitItems.length) return

    const hitIds = new Set(hitItems.map(item => item.id))
    setItems(prev => {
      const next = prev.map(item => {
        if (!hitIds.has(item.id) || item.sliced) return item
        return {
          ...item,
          sliced: true,
          ttl: 8,
          vy: item.vy * 0.35,
          vx: item.vx * 1.1,
          spin: item.spin * 1.8,
        }
      })
      itemsRef.current = next
      return next
    })

    const fruits = hitItems.filter(item => item.type === 'fruit')
    const bombs = hitItems.filter(item => item.type === 'bomb')

    if (fruits.length) {
      const now = Date.now()
      const previousCombo = now - lastSliceAtRef.current < 850 ? comboRef.current : 0
      const nextCombo = previousCombo + fruits.length
      const comboBonus = Math.floor(nextCombo / 3) - Math.floor(previousCombo / 3)

      lastSliceAtRef.current = now
      comboRef.current = nextCombo
      setCombo(nextCombo)
      setSlicedFruit(value => value + fruits.length)
      setScore(value => value + fruits.length + comboBonus)
      confetti({
        particleCount: 18 + fruits.length * 8,
        spread: 55,
        origin: { y: 0.72 },
        colors: ['#FDE68A', '#FB7185', '#22C55E', '#60A5FA'],
      })

      if (comboBonus > 0) {
        showBurst(`Combo x${nextCombo}`)
      } else if (fruits.length >= 2) {
        showBurst(`Slice x${fruits.length}`)
      }
    }

    if (bombs.length) {
      comboRef.current = 0
      setCombo(0)
      setBombHits(value => value + bombs.length)
      setShields(value => {
        const next = Math.max(0, value - bombs.length)
        if (next === 0) setGameOver(true)
        return next
      })
      showBurst(bombs.length > 1 ? 'Big Boom!' : 'Boom!')
      speak('Bomb hit. Watch out for the dark ones.', { mood: 'instruct' })
    }
  }, [showBurst, speak])

  const handlePointerMove = useCallback((event) => {
    if (!draggingRef.current || gameOver) return
    const point = localPointFromEvent(event)
    if (!point) return

    const nextTrail = [...trailRef.current, point].slice(-8)
    const previous = nextTrail[nextTrail.length - 2]
    trailRef.current = nextTrail
    setTrail(nextTrail)

    if (!previous) return

    const hits = itemsRef.current.filter(item =>
      !item.sliced &&
      segmentIntersectsCircle(previous, point, { x: item.x, y: item.y }, item.radius)
    )
    processHits(hits)
  }, [gameOver, localPointFromEvent, processHits])

  const handlePointerDown = useCallback((event) => {
    if (gameOver) return
    const point = localPointFromEvent(event)
    if (!point) return
    draggingRef.current = true
    event.currentTarget.setPointerCapture?.(event.pointerId)
    trailRef.current = [point]
    setTrail([point])
  }, [gameOver, localPointFromEvent])

  const handlePointerUp = useCallback((event) => {
    draggingRef.current = false
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    clearTrailSoon()
  }, [clearTrailSoon])

  if (gameOver) {
    const accuracyBase = slicedFruit + missedFruit + bombHits
    const accuracy = Math.round((slicedFruit / Math.max(accuracyBase, 1)) * 100)
    const stars = getSliceReward(score, bombHits)
    const struggles = []
    if (bombHits >= 1) struggles.push('Bomb timing')
    if (missedFruit >= 8) struggles.push('Fast slices')

    return (
      <div className="min-h-screen flex flex-col justify-between pb-safe"
        style={{ background: `linear-gradient(160deg, ${theme.bg}, white 45%, ${theme.card})` }}>
        <ArcadeHeader
          theme={theme}
          title="Fruit Slice Frenzy"
          subtitle="Time is up."
          onBack={onBack}
          badge={`${stars}⭐`}
        />

        <div className="px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[32px] p-6 text-center shadow-xl"
            style={{ background: 'linear-gradient(145deg, #F97316, #FACC15, #FB7185)' }}
          >
            <div className="text-6xl">🍉</div>
            <p className="font-bubble mt-2 text-4xl text-white">Slice Superstar</p>
            <p className="font-round mt-2 text-sm font-semibold text-white/80">
              You sliced through the rush and dodged as many bombs as you could.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-[22px] bg-white/12 p-3">
                <p className="font-bubble text-2xl text-white">{score}</p>
                <p className="font-round text-xs font-bold text-white/65">Score</p>
              </div>
              <div className="rounded-[22px] bg-white/12 p-3">
                <p className="font-bubble text-2xl text-white">{accuracy}%</p>
                <p className="font-round text-xs font-bold text-white/65">Accuracy</p>
              </div>
              <div className="rounded-[22px] bg-white/12 p-3">
                <p className="font-bubble text-2xl text-white">{slicedFruit}</p>
                <p className="font-round text-xs font-bold text-white/65">Fruit sliced</p>
              </div>
              <div className="rounded-[22px] bg-white/12 p-3">
                <p className="font-bubble text-2xl text-white">{stars}</p>
                <p className="font-round text-xs font-bold text-white/65">Stars earned</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="px-4 pb-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onComplete({
              stars,
              total: slicedFruit + missedFruit + bombHits,
              correct: slicedFruit,
              struggles,
            })}
            className="bubble-btn w-full px-6 py-4 text-lg"
            style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}
          >
            Collect {stars} Stars
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-hidden pb-safe"
      style={{ background: `linear-gradient(160deg, ${theme.bg}, white 40%, ${theme.card})` }}>
      <ArcadeHeader
        theme={theme}
        title="Fruit Slice Frenzy"
        subtitle="Swipe across the fruit. Avoid the bombs."
        onBack={onBack}
        badge={`${timeLeft}s`}
      />

      <div className="px-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[22px] bg-white/75 p-3 text-center shadow-md">
            <p className="font-bubble text-xl" style={{ color: theme.primary }}>{score}</p>
            <p className="font-round text-xs font-bold" style={{ color: theme.text, opacity: 0.58 }}>Score</p>
          </div>
          <div className="rounded-[22px] bg-white/75 p-3 text-center shadow-md">
            <p className="font-bubble text-xl" style={{ color: '#EF4444' }}>{'🛡️'.repeat(shields)}</p>
            <p className="font-round text-xs font-bold" style={{ color: theme.text, opacity: 0.58 }}>Shields</p>
          </div>
          <div className="rounded-[22px] bg-white/75 p-3 text-center shadow-md">
            <p className="font-bubble text-xl" style={{ color: '#F59E0B' }}>x{Math.max(combo, 1)}</p>
            <p className="font-round text-xs font-bold" style={{ color: theme.text, opacity: 0.58 }}>Combo</p>
          </div>
        </div>

        <div
          ref={arenaRef}
          className="relative mt-4 h-[62vh] overflow-hidden rounded-[34px] shadow-xl"
          style={{
            background: 'linear-gradient(180deg, #DBEAFE 0%, #FCE7F3 48%, #FEF3C7 100%)',
            touchAction: 'none',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-emerald-300/45 to-transparent" />
          <div className="absolute left-6 top-6 h-20 w-20 rounded-full bg-white/45 blur-2xl" />
          <div className="absolute right-8 top-10 h-24 w-24 rounded-full bg-pink-200/55 blur-2xl" />

          {items.map(item => (
            <motion.div
              key={item.id}
              className="absolute flex items-center justify-center"
              style={{
                left: item.x - item.radius,
                top: item.y - item.radius,
                width: item.radius * 2,
                height: item.radius * 2,
                filter: item.type === 'bomb' ? 'drop-shadow(0 10px 18px rgba(17,24,39,0.25))' : 'drop-shadow(0 10px 18px rgba(249,115,22,0.18))',
                opacity: item.sliced ? 0.72 : 1,
              }}
              animate={{ rotate: item.rotation, scale: item.sliced ? 0.86 : 1 }}
            >
              <div
                className="flex h-full w-full items-center justify-center rounded-full border-4 border-white/80"
                style={{
                  background: item.type === 'bomb'
                    ? 'radial-gradient(circle at 35% 30%, #6B7280, #111827)'
                    : `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.82), ${item.color})`,
                }}
              >
                <span style={{ fontSize: item.type === 'bomb' ? 36 : 38, lineHeight: 1 }}>
                  {item.emoji}
                </span>
              </div>
            </motion.div>
          ))}

          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            {trail.length >= 2 && (
              <polyline
                points={trail.map(point => `${point.x},${point.y}`).join(' ')}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
              />
            )}
            {trail.length >= 2 && (
              <polyline
                points={trail.map(point => `${point.x},${point.y}`).join(' ')}
                fill="none"
                stroke="#FB7185"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
              />
            )}
          </svg>

          <AnimatePresence>
            {burstLabel && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.82 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.88 }}
                className="absolute left-1/2 top-6 -translate-x-1/2 rounded-full bg-white/85 px-4 py-2 shadow-lg"
              >
                <p className="font-bubble text-lg" style={{ color: theme.primary }}>{burstLabel}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-slate-950/15 px-4 py-2 backdrop-blur">
            <p className="font-round text-xs font-bold text-slate-700">
              Swipe anywhere in the arena to slice.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function RocketPreview({ selection, launching }) {
  const nose = selection.nose
  const body = selection.body
  const windowPart = selection.window
  const fins = selection.fins
  const booster = selection.booster
  const badge = selection.badge

  const slotStyle = {
    border: '2px dashed rgba(148,163,184,0.45)',
    background: 'rgba(255,255,255,0.4)',
  }

  return (
    <motion.div
      animate={launching ? { y: [-4, -320], scale: [1, 1.05, 0.96], opacity: [1, 1, 0] } : { y: 0, scale: 1, opacity: 1 }}
      transition={launching ? { duration: 1.6, ease: 'easeInOut' } : { duration: 0.3 }}
      className="relative mx-auto h-[370px] w-[230px]"
    >
      <div className="absolute inset-x-0 top-0 flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/75 text-2xl shadow">
          {badge ? badge.icon : '❔'}
        </div>
      </div>

      <div className="absolute left-1/2 top-10 -translate-x-1/2">
        {nose ? (
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '38px solid transparent',
              borderRight: '38px solid transparent',
              borderBottom: `74px solid ${nose.primary}`,
              filter: `drop-shadow(0 10px 18px ${nose.primary}45)`,
            }}
          />
        ) : (
          <div className="h-[74px] w-[76px] rounded-t-[46px]" style={slotStyle} />
        )}
      </div>

      <div className="absolute left-1/2 top-[98px] -translate-x-1/2">
        <div
          className="relative flex h-[178px] w-[112px] items-start justify-center rounded-[34px] border-4 border-white/80 shadow-xl"
          style={body ? {
            background: `linear-gradient(180deg, ${body.secondary}, ${body.primary})`,
            boxShadow: `0 18px 34px ${body.primary}35`,
          } : slotStyle}
        >
          {windowPart ? (
            <div className="mt-6 flex h-16 w-16 items-center justify-center rounded-full border-[5px] border-white/80 bg-sky-100 text-3xl shadow-inner">
              <span>{windowPart.icon}</span>
            </div>
          ) : (
            <div className="mt-6 flex h-16 w-16 items-center justify-center rounded-full" style={slotStyle}>
              <span className="text-xs font-bold text-slate-400">Window</span>
            </div>
          )}
        </div>
      </div>

      <div className="absolute left-1/2 top-[214px] -translate-x-[98px]">
        <div
          className="h-[82px] w-[58px]"
          style={fins ? {
            clipPath: 'polygon(100% 0%, 100% 100%, 0% 84%)',
            background: `linear-gradient(180deg, ${fins.secondary}, ${fins.primary})`,
          } : slotStyle}
        />
      </div>
      <div className="absolute left-1/2 top-[214px] translate-x-[40px]">
        <div
          className="h-[82px] w-[58px]"
          style={fins ? {
            clipPath: 'polygon(0% 0%, 100% 84%, 0% 100%)',
            background: `linear-gradient(180deg, ${fins.secondary}, ${fins.primary})`,
          } : slotStyle}
        />
      </div>

      <div className="absolute left-1/2 top-[272px] -translate-x-1/2">
        <div
          className="flex h-12 w-[88px] items-center justify-center rounded-b-[26px] rounded-t-[14px] border-4 border-white/80 shadow"
          style={booster ? {
            background: `linear-gradient(180deg, ${booster.secondary}, ${booster.primary})`,
          } : slotStyle}
        >
          <span className="text-2xl">{booster ? booster.icon : '⚙️'}</span>
        </div>
      </div>

      {booster && (
        <motion.div
          className="absolute left-1/2 top-[320px] flex -translate-x-1/2 gap-2 text-3xl"
          animate={launching ? { y: [0, 14, 0], scale: [1, 1.2, 1] } : { opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span>{booster.icon}</span>
          <span>{booster.icon}</span>
        </motion.div>
      )}
    </motion.div>
  )
}

function InventorBlocks({ theme, profileName, speak, onBack, onComplete }) {
  const launchTimerRef = useRef(null)
  const [selection, setSelection] = useState({})
  const [launching, setLaunching] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      speak('Inventor Blocks. Snap the rocket parts together and build something amazing.', { mood: 'instruct' })
    }, 350)

    return () => {
      clearTimeout(timer)
      clearTimeout(launchTimerRef.current)
    }
  }, [speak])

  const selectedParts = getBuilderSelectionMap(selection)
  const filledCount = BUILDER_SECTIONS.filter(section => selection[section.id]).length
  const allFilled = filledCount === BUILDER_SECTIONS.length
  const colorVariety = new Set(
    Object.values(selectedParts)
      .filter(Boolean)
      .map(part => part.primary)
  ).size

  const handleSelect = useCallback((sectionId, optionId) => {
    setSelection(prev => ({ ...prev, [sectionId]: optionId }))
  }, [])

  const handleRandomize = useCallback(() => {
    const next = Object.fromEntries(
      BUILDER_SECTIONS.map(section => [
        section.id,
        section.options[Math.floor(Math.random() * section.options.length)].id,
      ]),
    )
    setSelection(next)
    speak('Fresh rocket idea loaded. Now make it your own.', { mood: 'guide' })
  }, [speak])

  const handleLaunch = useCallback(() => {
    if (!allFilled || launching) return
    setLaunching(true)
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.72 }, colors: ['#F97316', '#FACC15', '#60A5FA', '#A855F7'] })
    speak(`Three, two, one... blast off ${profileName || 'inventor'}!`, { mood: 'celebrate' })
    launchTimerRef.current = setTimeout(() => setCompleted(true), 1500)
  }, [allFilled, launching, profileName, speak])

  if (completed) {
    const stars = getBuilderReward(colorVariety)

    return (
      <div className="min-h-screen flex flex-col justify-between pb-safe"
        style={{ background: `linear-gradient(160deg, ${theme.bg}, white 45%, ${theme.card})` }}>
        <ArcadeHeader
          theme={theme}
          title="Inventor Blocks"
          subtitle="Rocket complete."
          onBack={onBack}
          badge={`${stars}⭐`}
        />

        <div className="px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[32px] p-6 text-center shadow-xl"
            style={{ background: 'linear-gradient(145deg, #312E81, #8B5CF6, #22C55E)' }}
          >
            <div className="text-6xl">🚀</div>
            <p className="font-bubble mt-2 text-4xl text-white">Inventor Launch</p>
            <p className="font-round mt-2 text-sm font-semibold text-white/80">
              You snapped every part together and launched your own rocket.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-[22px] bg-white/12 p-3">
                <p className="font-bubble text-2xl text-white">{filledCount}</p>
                <p className="font-round text-xs font-bold text-white/65">Parts joined</p>
              </div>
              <div className="rounded-[22px] bg-white/12 p-3">
                <p className="font-bubble text-2xl text-white">{colorVariety}</p>
                <p className="font-round text-xs font-bold text-white/65">Colour mix</p>
              </div>
              <div className="rounded-[22px] bg-white/12 p-3">
                <p className="font-bubble text-2xl text-white">{stars}</p>
                <p className="font-round text-xs font-bold text-white/65">Stars earned</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="px-4 pb-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onComplete({
              stars,
              total: BUILDER_SECTIONS.length,
              correct: filledCount,
              struggles: [],
            })}
            className="bubble-btn w-full px-6 py-4 text-lg"
            style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}
          >
            Collect {stars} Stars
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-y-auto pb-safe"
      style={{ background: `linear-gradient(160deg, ${theme.bg}, white 42%, ${theme.card})` }}>
      <ArcadeHeader
        theme={theme}
        title="Inventor Blocks"
        subtitle="Snap rocket parts together."
        onBack={onBack}
        badge={`${filledCount}/${BUILDER_SECTIONS.length}`}
      />

      <div className="px-4 pb-6">
        <div className="rounded-[32px] p-5 shadow-xl"
          style={{ background: 'linear-gradient(145deg, #E0E7FF, #FDF2F8, #ECFCCB)' }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bubble text-2xl" style={{ color: theme.primary }}>Rocket Workshop</p>
              <p className="font-round mt-1 text-sm font-semibold" style={{ color: theme.text, opacity: 0.7 }}>
                Mix and match parts like digital lego, then launch your invention.
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleRandomize}
              className="rounded-full px-3 py-2 text-sm font-bold shadow"
              style={{ background: 'white', color: theme.primary }}
            >
              Random
            </motion.button>
          </div>

          <div className="mt-4 rounded-[28px] bg-white/70 px-3 py-5 shadow-inner">
            <RocketPreview selection={selectedParts} launching={launching} />
          </div>

          <div className="mt-4 h-2 rounded-full overflow-hidden bg-white/70">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${theme.primary}, ${theme.accent})` }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.round((filledCount / BUILDER_SECTIONS.length) * 100)}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {BUILDER_SECTIONS.map(section => (
            <div key={section.id} className="rounded-[28px] bg-white/80 p-4 shadow-md">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-bubble text-lg" style={{ color: theme.text }}>{section.label}</p>
                  <p className="font-round text-xs font-bold" style={{ color: theme.text, opacity: 0.55 }}>
                    Pick one style to snap into place.
                  </p>
                </div>
                <span className="font-round text-xs font-bold" style={{ color: selection[section.id] ? '#16A34A' : '#94A3B8' }}>
                  {selection[section.id] ? 'Ready' : 'Choose'}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                {section.options.map(option => {
                  const active = selection[section.id] === option.id

                  return (
                    <motion.button
                      key={option.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleSelect(section.id, option.id)}
                      className="rounded-[22px] border px-3 py-3 text-left shadow-sm"
                      style={{
                        background: active
                          ? `linear-gradient(135deg, ${option.secondary}, ${option.primary})`
                          : 'white',
                        borderColor: active ? option.primary : 'rgba(148,163,184,0.2)',
                        color: active ? 'white' : theme.text,
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bubble text-base">{option.name}</p>
                          <p className="font-round text-xs font-bold opacity-75">{section.label}</p>
                        </div>
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/60 text-xl shadow"
                          style={{ background: `linear-gradient(135deg, ${option.secondary}, ${option.primary})` }}
                        >
                          {option.icon}
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: allFilled ? 0.97 : 1 }}
          onClick={handleLaunch}
          disabled={!allFilled || launching}
          className="bubble-btn mt-6 w-full px-6 py-4 text-lg disabled:opacity-50"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}
        >
          {allFilled ? 'Launch My Rocket' : `Finish ${BUILDER_SECTIONS.length - filledCount} More Parts`}
        </motion.button>
      </div>
    </div>
  )
}

// ── Shadow Match ──────────────────────────────────────────────────────────────
const SHADOW_POOL = ['🦋', '🐘', '🦒', '🐙', '🦀', '🐢', '🦜', '🐳', '🦔', '🐊', '🦓', '🐝']
const SHADOW_ROUNDS = [3, 4, 4]

function buildShadowRound(pairCount) {
  const pool = [...SHADOW_POOL].sort(() => Math.random() - 0.5).slice(0, pairCount)
  const shuffle = (a) => [...a].sort(() => Math.random() - 0.5)
  return {
    animals: shuffle(pool.map(e => ({ id: e, emoji: e }))),
    shadows: shuffle(pool.map(e => ({ id: e, emoji: e }))),
  }
}

function ShadowMatch({ theme, profileName, speak, onBack, onComplete }) {
  const [roundIdx, setRoundIdx] = useState(0)
  const [board, setBoard] = useState(() => buildShadowRound(SHADOW_ROUNDS[0]))
  const [matched, setMatched] = useState(new Set())
  const [selAnimal, setSelAnimal] = useState(null)
  const [selShadow, setSelShadow] = useState(null)
  const [wrong, setWrong] = useState(null)
  const [misses, setMisses] = useState(0)
  const [finished, setFinished] = useState(false)
  const totalPairs = SHADOW_ROUNDS.reduce((a, b) => a + b, 0)

  useEffect(() => {
    const t = setTimeout(() => speak(`Round ${roundIdx + 1}. Tap an animal, then find its shadow!`, { mood: 'instruct' }), 350)
    return () => clearTimeout(t)
  }, [roundIdx, speak])

  const tryMatch = (aId, sId) => {
    if (aId === sId) {
      confetti({ particleCount: 25, spread: 55, origin: { y: 0.5 } })
      const next = new Set(matched).add(aId)
      setMatched(next)
      setSelAnimal(null); setSelShadow(null)
      if (next.size === SHADOW_ROUNDS[roundIdx]) {
        if (roundIdx + 1 >= SHADOW_ROUNDS.length) {
          speak(`Amazing shadow spotting, ${profileName || 'superstar'}!`, { mood: 'celebrate' })
          setTimeout(() => setFinished(true), 900)
        } else {
          speak('Round complete! Here comes a trickier one!', { mood: 'celebrate' })
          setTimeout(() => {
            setRoundIdx(r => r + 1)
            setBoard(buildShadowRound(SHADOW_ROUNDS[roundIdx + 1]))
            setMatched(new Set())
          }, 1200)
        }
      }
    } else {
      setMisses(m => m + 1)
      setWrong({ aId, sId })
      setTimeout(() => { setWrong(null); setSelAnimal(null); setSelShadow(null) }, 550)
    }
  }

  const pickAnimal = (id) => {
    if (matched.has(id) || wrong) return
    if (selShadow != null) tryMatch(id, selShadow)
    else setSelAnimal(id)
  }
  const pickShadow = (id) => {
    if (matched.has(id) || wrong) return
    if (selAnimal != null) tryMatch(selAnimal, id)
    else setSelShadow(id)
  }

  if (finished) {
    const stars = Math.max(1, 5 - misses)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
        style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 280 }}>
          <div className="text-8xl mb-3">🔦</div>
          <h2 className="font-bubble text-4xl shimmer-text mb-1">Shadow Master!</h2>
          <p className="font-round text-base opacity-70 mb-5" style={{ color: theme.text }}>
            {misses === 0 ? 'Perfect — not a single miss!' : `All matched with ${misses} ${misses === 1 ? 'slip' : 'slips'}.`}
          </p>
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => onComplete({ stars, total: totalPairs, correct: Math.max(0, totalPairs - misses), struggles: [] })}
            className="bubble-btn px-8 py-4 text-lg"
            style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
            Collect {stars} ⭐
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-y-auto pb-safe"
      style={{ background: 'linear-gradient(160deg, #1E1B4B, #312E81 55%, #1E1B4B)' }}>
      <ArcadeHeader theme={{ ...theme, card: 'rgba(255,255,255,0.12)', text: 'white' }}
        title="Shadow Match" subtitle={`Round ${roundIdx + 1} of ${SHADOW_ROUNDS.length}`} onBack={onBack}
        badge={`${matched.size}/${SHADOW_ROUNDS[roundIdx]}`} />

      <div className="px-5 pt-2 grid grid-cols-2 gap-5">
        <div className="flex flex-col gap-3">
          {board.animals.map(a => (
            <motion.button key={a.id} whileTap={{ scale: 0.92 }}
              animate={wrong?.aId === a.id ? { x: [0, -8, 8, 0] } : {}}
              onClick={() => pickAnimal(a.id)}
              className="rounded-3xl py-4 flex items-center justify-center"
              style={{
                background: matched.has(a.id) ? 'rgba(34,197,94,0.25)' : selAnimal === a.id ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)',
                border: `2.5px solid ${matched.has(a.id) ? '#22C55E' : selAnimal === a.id ? 'white' : 'rgba(255,255,255,0.25)'}`,
                opacity: matched.has(a.id) ? 0.5 : 1,
              }}>
              <span style={{ fontSize: 44 }}>{a.emoji}</span>
            </motion.button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {board.shadows.map(s => (
            <motion.button key={s.id} whileTap={{ scale: 0.92 }}
              animate={wrong?.sId === s.id ? { x: [0, 8, -8, 0] } : {}}
              onClick={() => pickShadow(s.id)}
              className="rounded-3xl py-4 flex items-center justify-center"
              style={{
                background: matched.has(s.id) ? 'rgba(34,197,94,0.25)' : selShadow === s.id ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
                border: `2.5px solid ${matched.has(s.id) ? '#22C55E' : selShadow === s.id ? 'white' : 'rgba(255,255,255,0.18)'}`,
                opacity: matched.has(s.id) ? 0.5 : 1,
              }}>
              <span style={{
                fontSize: 44,
                filter: matched.has(s.id) ? 'none' : 'brightness(0) opacity(0.85)',
                transition: 'filter 0.4s ease',
              }}>{s.emoji}</span>
            </motion.button>
          ))}
        </div>
      </div>
      <p className="font-round text-center text-white/55 text-xs font-bold mt-5 px-6">
        Tap an animal on the left, then its shadow on the right!
      </p>
    </div>
  )
}

// ── Rocket Count ──────────────────────────────────────────────────────────────
const ROCKET_ROUNDS = 5

function RocketCount({ theme, profileName, speak, onBack, onComplete }) {
  const [round, setRound] = useState(1)
  const [target, setTarget] = useState(() => Math.floor(Math.random() * 4) + 3) // 3-6 first
  const [loaded, setLoaded] = useState(new Set())
  const [phase, setPhase] = useState('count') // count | launching | done
  const [correctRounds, setCorrectRounds] = useState(0)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => speak(`Load exactly ${target} stars into the rocket, then press launch!`, { mood: 'instruct' }), 400)
    return () => clearTimeout(t)
  }, [target, speak])

  const toggleStar = (i) => {
    if (phase !== 'count') return
    setFeedback(null)
    setLoaded(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const launch = () => {
    if (phase !== 'count') return
    const ok = loaded.size === target
    if (ok) {
      setCorrectRounds(c => c + 1)
      setPhase('launching')
      confetti({ particleCount: 70, spread: 90, origin: { y: 0.55 } })
      speak(`${target} stars loaded. Blast off!`, { mood: 'celebrate' })
      setTimeout(() => {
        if (round >= ROCKET_ROUNDS) setPhase('done')
        else {
          setRound(r => r + 1)
          setTarget(Math.floor(Math.random() * (4 + round)) + 3)
          setLoaded(new Set())
          setPhase('count')
        }
      }, 1700)
    } else {
      setFeedback(loaded.size > target ? 'Too many stars! Count again.' : 'Not enough stars yet! Count again.')
      speak(loaded.size > target ? 'Oops, too many stars. Count again!' : 'Not enough stars yet. Count again!', { mood: 'instruct' })
    }
  }

  if (phase === 'done') {
    const stars = correctRounds
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
        style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 280 }}>
          <div className="text-8xl mb-3">🚀</div>
          <h2 className="font-bubble text-4xl shimmer-text mb-1">Mission Complete!</h2>
          <p className="font-round text-base opacity-70 mb-5" style={{ color: theme.text }}>
            {correctRounds}/{ROCKET_ROUNDS} perfect launches, {profileName || 'captain'}!
          </p>
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => onComplete({ stars, total: ROCKET_ROUNDS, correct: correctRounds, struggles: [] })}
            className="bubble-btn px-8 py-4 text-lg"
            style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}>
            Collect {stars} ⭐
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-y-auto pb-safe"
      style={{ background: 'linear-gradient(160deg, #0F172A, #1E293B 50%, #312E81)' }}>
      <ArcadeHeader theme={{ ...theme, card: 'rgba(255,255,255,0.12)', text: 'white' }}
        title="Rocket Count" subtitle={`Launch ${round} of ${ROCKET_ROUNDS}`} onBack={onBack}
        badge={`⭐ ${loaded.size}`} />

      <div className="text-center px-6 mt-1">
        <p className="font-bubble text-white text-2xl">Load exactly <span style={{ color: '#FACC15' }}>{target}</span> stars!</p>
        <p className="font-round text-white/55 text-xs font-bold mt-1">Tap stars to load them — tap again to unload.</p>
      </div>

      <motion.div
        className="mx-auto mt-4 text-center"
        animate={phase === 'launching' ? { y: -600, scale: 0.7 } : { y: [0, -6, 0] }}
        transition={phase === 'launching' ? { duration: 1.4, ease: 'easeIn' } : { duration: 2.4, repeat: Infinity }}
      >
        <span style={{ fontSize: 86, lineHeight: 1 }}>🚀</span>
        <div className="font-bubble text-white/80 text-sm mt-1">{loaded.size} / {target} loaded</div>
      </motion.div>

      <div className="grid grid-cols-4 gap-3 px-8 mt-5 max-w-xs mx-auto">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.button key={i} whileTap={{ scale: 0.8 }}
            onClick={() => toggleStar(i)}
            className="rounded-2xl py-3 flex items-center justify-center"
            style={{
              background: loaded.has(i) ? 'rgba(250,204,21,0.3)' : 'rgba(255,255,255,0.08)',
              border: `2px solid ${loaded.has(i) ? '#FACC15' : 'rgba(255,255,255,0.15)'}`,
            }}>
            <span style={{ fontSize: 26, filter: loaded.has(i) ? 'none' : 'grayscale(1) opacity(0.5)' }}>⭐</span>
          </motion.button>
        ))}
      </div>

      {feedback && (
        <p className="font-round text-center text-amber-300 text-sm font-bold mt-4">{feedback}</p>
      )}

      <div className="px-8 mt-5 max-w-xs mx-auto">
        <motion.button whileTap={{ scale: 0.96 }} onClick={launch}
          className="w-full py-4 rounded-3xl font-bubble text-white text-xl shadow-xl"
          style={{ background: 'linear-gradient(135deg, #F43F5E, #FB923C)' }}>
          🚀 LAUNCH!
        </motion.button>
      </div>
    </div>
  )
}

export default function GameArcade({ avatar, progress, profileName, onAddStars, onBack, onNavigate }) {
  const theme = THEMES[avatar] || THEMES.rumi
  const { speak } = useSpeech()
  const status = getArcadeUnlockStatus(progress)
  const [activeGame, setActiveGame] = useState(null)

  useEffect(() => {
    if (activeGame) return

    const timer = setTimeout(() => {
      if (status.unlocked) {
        speak('Study pass complete. Choose a reward game from the arcade.', { mood: 'celebrate' })
      } else {
        speak('Finish your study pass first. Then the arcade will open.', { mood: 'guide' })
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [activeGame, speak, status.unlocked])

  const handleGameComplete = useCallback((payload) => {
    const isSpecial = getDailyArcade().specialId === activeGame
    const stars = isSpecial ? payload.stars * 2 : payload.stars
    if (isSpecial && payload.stars > 0) {
      speak('Daily special bonus! Double stars!', { mood: 'celebrate' })
    }
    onAddStars('arcade', stars, {
      total: payload.total,
      correct: payload.correct,
      struggles: payload.struggles || [],
      stayOnModule: true,
    })
    setActiveGame(null)
  }, [onAddStars, activeGame, speak])

  if (!status.unlocked) {
    return (
      <StudyLockScreen
        theme={theme}
        status={status}
        onBack={onBack}
        onNavigate={onNavigate}
      />
    )
  }

  if (activeGame === 'memory') {
    return (
      <MemoryMission
        theme={theme}
        profileName={profileName}
        speak={speak}
        onBack={() => setActiveGame(null)}
        onComplete={handleGameComplete}
      />
    )
  }

  if (activeGame === 'balloon') {
    return (
      <BalloonBurst
        theme={theme}
        profileName={profileName}
        speak={speak}
        onBack={() => setActiveGame(null)}
        onComplete={handleGameComplete}
      />
    )
  }

  if (activeGame === 'slice') {
    return (
      <FruitSliceFrenzy
        theme={theme}
        profileName={profileName}
        speak={speak}
        onBack={() => setActiveGame(null)}
        onComplete={handleGameComplete}
      />
    )
  }

  if (activeGame === 'builder') {
    return (
      <InventorBlocks
        theme={theme}
        profileName={profileName}
        speak={speak}
        onBack={() => setActiveGame(null)}
        onComplete={handleGameComplete}
      />
    )
  }

  if (activeGame === 'shadow') {
    return (
      <ShadowMatch
        theme={theme}
        profileName={profileName}
        speak={speak}
        onBack={() => setActiveGame(null)}
        onComplete={handleGameComplete}
      />
    )
  }

  if (activeGame === 'rocket') {
    return (
      <RocketCount
        theme={theme}
        profileName={profileName}
        speak={speak}
        onBack={() => setActiveGame(null)}
        onComplete={handleGameComplete}
      />
    )
  }

  return (
    <ArcadeLobby
      theme={theme}
      profileName={profileName}
      progress={progress}
      onBack={onBack}
      onSelect={(id) => {
        if (getDailyArcade().featured.some(g => g.id === id)) setActiveGame(id)
      }}
    />
  )
}
