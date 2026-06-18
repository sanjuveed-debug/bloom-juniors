import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { THEMES } from '../themes'
import { getAssistant } from '../assistants'
import { MONSTERS, MonsterCollection } from './MonsterReward'
import { STUDY_MODULES, getArcadeUnlockStatus, getTodayStudySessions, getTodayAdventureModules } from '../utils/arcadeUnlock'
import { PREMIUM_GATING_ENABLED } from '../config/premiumContent.js'
import { usePremium } from '../hooks/usePremium'
import { getTodayWorldEvent, isEventBonusCollected, WORLD_EVENT_BONUS } from '../utils/worldEvent.js'
import RetentionPanel, { YaagviRoom } from './RetentionWidgets'
import { useSpeech } from '../hooks/useSpeech'
import PhonicsMap from './PhonicsMap'
import BloomGarden from './BloomGarden'
import ParentHandoff from './ParentHandoff'
import DailyBloomPath from './DailyBloomPath'
import CelebrationScreen from './CelebrationScreen'
import InviteFriendsCard from './InviteFriendsCard'
import FeedbackPrompt, { shouldShowFeedback } from './FeedbackPrompt'

// ── Module registry ───────────────────────────────────────────────────────────
const PREMIUM_IDS = new Set(['worldgk','science','planets','anatomy','sacred','shapes','shop','logic'])

const MODULES = [
  // Learning
  { id:'phonics',  label:'Sound Pop!',      emoji:'🎤', desc:'Phonics & Letters',      bg:'linear-gradient(145deg,#D81B60,#E91E8C,#FF6BA8)', section:'learn'   },
  { id:'math',     label:'Number World',    emoji:'🔢', desc:'Counting & Maths',        bg:'linear-gradient(145deg,#E65100,#F97316,#FBBF24)', section:'learn'   },
  { id:'tricky',   label:'Star Catch!',     emoji:'⭐', desc:'Tricky Words & Spelling',  bg:'linear-gradient(145deg,#6D28D9,#7C3AED,#A78BFA)', section:'learn'   },
  { id:'story',    label:'Story Room',      emoji:'📖', desc:'Read & Listen',            bg:'linear-gradient(145deg,#047857,#059669,#34D399)', section:'learn'   },
  // Explore
  { id:'worldgk',  label:'World Explorer',  emoji:'🌍', desc:'Flags, Capitals & History', bg:'linear-gradient(145deg,#0369A1,#0EA5E9,#7DD3FC)', section:'explore', premium:true },
  { id:'science',  label:'Wonder Lab',      emoji:'🔬', desc:'Science Experiments',      bg:'linear-gradient(145deg,#5B21B6,#7C3AED,#C4B5FD)', section:'explore', premium:true },
  { id:'planets',  label:'Planet World',    emoji:'🪐', desc:'Solar System Adventure',   bg:'linear-gradient(145deg,#0F172A,#1E3A5F,#3B82F6)', section:'explore', premium:true },
  { id:'anatomy',  label:'My Body',         emoji:'🫀', desc:'Human Anatomy',            bg:'linear-gradient(145deg,#9F1239,#E11D48,#FB7185)', section:'explore', premium:true },
  // Create & Play
  { id:'shapes',   label:'Shape World',     emoji:'🔷', desc:'3D Shapes & Patterns',     bg:'linear-gradient(145deg,#0F766E,#0D9488,#5EEAD4)', section:'play',    premium:true },
  { id:'shop',     label:'Coin Shop',       emoji:'🛍️', desc:'Money & Shopping',          bg:'linear-gradient(145deg,#6B21A8,#9333EA,#D8B4FE)', section:'play',    premium:true },
  { id:'logic',    label:'Puzzle Quest',    emoji:'🧩', desc:'Logic & Critical Thinking', bg:'linear-gradient(145deg,#1E40AF,#2563EB,#93C5FD)', section:'play',    premium:true },
  { id:'arcade',   label:'Game Arcade',     emoji:'🎮', desc:'Unlock after study time',   bg:'linear-gradient(145deg,#0F172A,#111827,#FB7185)', section:'play'    },
  { id:'davinci',  label:'Da Vinci Studio', emoji:'🎨', desc:'Draw & Create!',            bg:'linear-gradient(145deg,#92400E,#D97706,#FCD34D)', section:'play'    },
  { id:'exercise', label:'Fun Exercise',    emoji:'🏃', desc:'Move & Stretch!',           bg:'linear-gradient(145deg,#B91C1C,#EF4444,#FCA5A5)', section:'play'    },
  { id:'sacred',   label:'Sacred Stories', emoji:'🕉️', desc:'World Faiths & Stories',      bg:'linear-gradient(145deg,#C2410C,#F97316,#FED7AA)', section:'explore', premium:true },
]

const SECTIONS = [
  { key:'learn',   emoji:'🎓', label:'Learning',      sub:'British Curriculum' },
  { key:'explore', emoji:'🔭', label:'Explore',       sub:'Science & World'    },
  { key:'play',    emoji:'🎨', label:'Create & Play', sub:'Skills & Exercise'  },
]

const MODULE_MAP = Object.fromEntries(MODULES.map(m => [m.id, m]))

// ── Level system ──────────────────────────────────────────────────────────────
function calcLevel(stars) {
  const T = [0,10,25,50,75,100,150,200,300,500,750]
  let lvl = 1
  for (let i = 0; i < T.length; i++) { if (stars >= T[i]) lvl = i + 1 }
  const cur  = T[Math.min(lvl-1, T.length-1)]
  const next = T[Math.min(lvl,   T.length-1)]
  const pct  = next === cur ? 100 : Math.round(((stars - cur) / (next - cur)) * 100)
  return { lvl, pct, next }
}

// ── Time greeting ─────────────────────────────────────────────────────────────
function timeGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning,'
  if (h < 17) return 'Good afternoon,'
  if (h < 21) return 'Good evening,'
  return 'Goodnight,'
}

// ── CountUp ───────────────────────────────────────────────────────────────────
function CountUp({ target, duration = 1000 }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!target) return
    let n = 0
    const step = Math.max(1, Math.ceil(target / (duration / 25)))
    const t = setInterval(() => {
      n = Math.min(n + step, target)
      setV(n)
      if (n >= target) clearInterval(t)
    }, 25)
    return () => clearInterval(t)
  }, [target, duration])
  return <>{v}</>
}

// ── XP Arc ────────────────────────────────────────────────────────────────────
function XPArc({ pct, lvl, emoji, size = 84, primary }) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={6} />
        <motion.circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
        />
      </svg>
      <div className="relative flex flex-col items-center justify-center">
        <span style={{ fontSize: 30, lineHeight: 1 }}>{emoji}</span>
        <span className="font-bubble text-white text-xs mt-0.5" style={{ textShadow:'0 1px 4px rgba(0,0,0,0.5)' }}>
          Lv.{lvl}
        </span>
      </div>
    </div>
  )
}

// ── Stat Pill ─────────────────────────────────────────────────────────────────
function StatPill({ icon, value, label, delay = 0, onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300 }}
      whileTap={{ scale: 0.90 }}
      onClick={onClick}
      className="stat-pill flex-1"
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span className="font-bubble text-white text-sm leading-none">{value}</span>
      <span className="font-round text-white/60 leading-none" style={{ fontSize: 10 }}>{label}</span>
    </motion.button>
  )
}

// ── Module Card ───────────────────────────────────────────────────────────────
function ModuleCard({ mod, onNavigate, stars, isChallenge, hasProgress, idx, locked, progressCount = 0, progressTarget = 0, isPremium = false }) {
  const filledStars = Math.min(3, Math.floor(stars / 5))
  const progressWidth = progressTarget > 0 ? `${Math.round((progressCount / progressTarget) * 100)}%` : '0%'
  return (
    <motion.button
      className="module-card"
      onClick={() => onNavigate(mod.id)}
      initial={{ opacity: 0, y: 30, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: idx * 0.055, type: 'spring', stiffness: 260, damping: 18 }}
      whileTap={{ scale: 0.90 }}
      style={{ background: mod.bg }}
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 55%)' }} />

      {(locked || isPremium) && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.02) 0%, rgba(15,23,42,0.45) 100%)' }} />
      )}

      {/* Challenge badge */}
      {isChallenge && (
        <motion.div
          className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full font-bubble text-white z-10"
          style={{ background: 'rgba(255,215,0,0.9)', color: '#78350F', fontSize: 10 }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          🎯 TODAY
        </motion.div>
      )}

      {locked && !isPremium && (
        <div
          className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full font-bubble text-white z-10"
          style={{ background: 'rgba(15,23,42,0.78)', fontSize: 10 }}
        >
          🔒 LOCKED
        </div>
      )}
      {isPremium && (
        <div
          className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full font-bubble z-10"
          style={{ background: 'linear-gradient(135deg,#FFD700,#FF9A3C)', color: '#7C2D12', fontSize: 10 }}
        >
          ⭐ PREMIUM
        </div>
      )}

      {/* Progress badge */}
      {hasProgress && !isChallenge && !locked && (
        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center z-10">
          <span style={{ fontSize: 11 }}>✓</span>
        </div>
      )}

      {/* Floating emoji */}
      <motion.div
        className="absolute top-0 inset-x-0 flex justify-center pt-4"
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 2.8 + (idx % 4) * 0.3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span style={{ fontSize: 48, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>
          {mod.emoji}
        </span>
      </motion.div>

      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 h-[60%] pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)' }} />

      {/* Bottom text */}
      <div className="relative z-10 p-3">
        <p className="font-bubble text-white text-[15px] leading-tight drop-shadow"
          style={{ textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>
          {mod.label}
        </p>
        <p className="font-round text-white/70 leading-tight mt-0.5" style={{ fontSize: 11 }}>
          {mod.desc}
        </p>
        {locked ? (
          <div className="mt-2">
            <p className="font-round text-white/85" style={{ fontSize: 10 }}>
              Finish study pass {progressCount}/{progressTarget}
            </p>
            <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.22)' }}>
              <div className="h-full rounded-full" style={{ width: progressWidth, background: '#FDE68A' }} />
            </div>
          </div>
        ) : (
          <div className="flex gap-0.5 mt-1.5">
            {[1,2,3].map(s => (
              <span key={s} style={{ fontSize: 11, opacity: filledStars >= s ? 1 : 0.3 }}>⭐</span>
            ))}
          </div>
        )}
      </div>
    </motion.button>
  )
}

// ── Daily Challenge Card ──────────────────────────────────────────────────────
function ChallengeCard({ challenge, onNavigate, index }) {
  const pct = challenge.target > 0
    ? Math.min(100, Math.round(((challenge.progress || 0) / challenge.target) * 100))
    : 0
  const mod = MODULE_MAP[challenge.module]
  return (
    <motion.button
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 280 }}
      whileTap={{ scale: 0.93 }}
      onClick={() => challenge.module && !challenge.completed && onNavigate(challenge.module)}
      className="relative flex-shrink-0 rounded-[22px] p-3.5 text-left overflow-hidden"
      style={{
        width: 158,
        background: challenge.completed
          ? 'linear-gradient(135deg, #D1FAE5, #A7F3D0)'
          : mod?.bg || 'linear-gradient(135deg, #1e1b4b, #312e81)',
        border: challenge.completed ? '2px solid #22c55e' : '2px solid rgba(255,255,255,0.18)',
        boxShadow: challenge.completed
          ? '0 4px 20px rgba(34,197,94,0.35)'
          : '0 6px 24px rgba(0,0,0,0.3)',
      }}
    >
      {challenge.completed && (
        <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
          transition={{ type:'spring', stiffness:400 }}
          className="absolute top-2 right-2 text-lg">✅</motion.div>
      )}
      <motion.div
        className="text-3xl mb-1.5"
        animate={challenge.completed
          ? { rotate: [0,20,-20,0], scale: [1,1.3,1] }
          : { y: [0,-4,0] }}
        transition={{ duration: challenge.completed ? 0.6 : 2, repeat: Infinity, repeatDelay: 2 }}
      >
        {challenge.completed ? challenge.reward : challenge.emoji}
      </motion.div>
      <p className="font-round text-xs font-bold leading-tight mb-2"
        style={{ color: challenge.completed ? '#065F46' : 'white' }}>
        {challenge.label}
      </p>
      <div className="h-1.5 rounded-full overflow-hidden"
        style={{ background: challenge.completed ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)' }}>
        <motion.div className="h-full rounded-full"
          style={{ background: challenge.completed ? '#22c55e' : '#FFD700' }}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease:'easeOut' }} />
      </div>
      <p className="font-round mt-1" style={{ fontSize:10, color: challenge.completed ? '#065F46' : 'rgba(255,255,255,0.75)' }}>
        {challenge.completed ? `🎁 ${challenge.reward}` : `${challenge.progress ?? 0}/${challenge.target}`}
      </p>
    </motion.button>
  )
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ emoji, label, sub, theme }) {
  return (
    <div className="mx-auto mt-5 flex max-w-6xl items-center gap-2.5 px-4 md:px-6 xl:px-8">
      <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: `${theme.primary}22`, border: `1.5px solid ${theme.primary}44` }}>
        <span style={{ fontSize: 18 }}>{emoji}</span>
      </div>
      <div>
        <p className="font-bubble text-base leading-none" style={{ color: theme.text }}>{label}</p>
        <p className="font-round leading-none mt-0.5" style={{ fontSize: 11, color: theme.text, opacity: 0.5 }}>{sub}</p>
      </div>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${theme.primary}44, transparent)` }} />
    </div>
  )
}

// ── Premium Modal ─────────────────────────────────────────────────────────────
function PremiumModal({ mod, theme, onClose }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | done | error

  const handleJoin = async () => {
    if (!email.trim() || status !== 'idle') return
    setStatus('sending')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), module: mod?.label }),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 md:items-center"
      style={{ background: 'rgba(0,0,0,0.72)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-md overflow-hidden rounded-[32px] p-6 text-center"
        style={{ background: 'linear-gradient(160deg,#1a0a35,#0a1528)', border: '1.5px solid rgba(255,255,255,0.12)' }}
        initial={{ y: 80, scale: 0.92 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 80, scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-32 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 0%,rgba(139,0,255,0.35),transparent)' }} />

        <motion.div
          className="text-5xl mb-3"
          animate={{ y: [0,-8,0], rotate:[0,-5,5,0] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        >
          {mod?.emoji || '⭐'}
        </motion.div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3"
          style={{ background: 'linear-gradient(135deg,#FFD700,#FF9A3C)', color:'#7C2D12' }}>
          <span className="font-bubble text-xs">⭐ PREMIUM</span>
        </div>

        <h3 className="font-bubble text-white text-2xl leading-tight mb-2">
          {mod?.label || 'Premium Module'}
        </h3>
        <p className="font-round text-white/65 text-sm mb-5">
          This module is part of Bloom Juniors Premium — launching soon. Join the waitlist for early bird pricing and be first to unlock everything.
        </p>

        {status === 'done' ? (
          <div className="rounded-2xl p-4" style={{ background: 'rgba(34,197,94,0.15)', border: '1.5px solid rgba(34,197,94,0.3)' }}>
            <p className="text-2xl mb-1">🎉</p>
            <p className="font-bubble text-white text-base">You're on the list!</p>
            <p className="font-round text-white/60 text-xs mt-1">We'll email you when Premium launches.</p>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              placeholder="your@email.com"
              className="flex-1 rounded-2xl px-4 py-3 font-round text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.15)' }}
            />
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={handleJoin}
              disabled={status === 'sending'}
              className="rounded-2xl px-4 py-3 font-bubble text-sm text-white shrink-0"
              style={{ background: 'linear-gradient(135deg,#8B00FF,#FF1D8E)', opacity: status === 'sending' ? 0.7 : 1 }}
            >
              {status === 'sending' ? '...' : 'Join'}
            </motion.button>
          </div>
        )}
        {status === 'error' && (
          <p className="font-round text-red-400 text-xs mt-2">Something went wrong — try again.</p>
        )}

        <button onClick={onClose} className="mt-4 font-round text-white/40 text-xs">
          Close
        </button>
      </motion.div>
    </motion.div>
  )
}

function getYaagviState(arcadeStatus, dailyAdventure, profileName) {
  const name = profileName || 'superstar'
  if (arcadeStatus.unlocked) {
    return {
      mood: 'celebrate',
      headline: 'Study pass complete!',
      message: `You did it, ${name}! The arcade is open. Go and play — you earned it.`,
      emoji: '🎉',
      border: 'rgba(34,197,94,0.55)',
      glow: 'rgba(34,197,94,0.18)',
    }
  }
  if (dailyAdventure.completedCount > 0) {
    const left = dailyAdventure.steps.length - dailyAdventure.completedCount
    const next = dailyAdventure.steps.find(s => !s.done)
    return {
      mood: 'encourage',
      headline: `Almost there, ${name}!`,
      message: `${left} more step${left > 1 ? 's' : ''} and the arcade opens. ${next ? `Try ${next.module.label} next.` : ''}`,
      emoji: '💪',
      border: 'rgba(251,191,36,0.45)',
      glow: 'rgba(251,191,36,0.12)',
    }
  }
  const hour = new Date().getHours()
  if (hour < 12) {
    return {
      mood: 'curious',
      headline: `Morning, ${name}!`,
      message: "I've got today's adventures ready. Finish 2 to unlock the arcade.",
      emoji: '🌟',
      border: 'rgba(255,255,255,0.18)',
      glow: 'rgba(255,255,255,0.06)',
    }
  }
  return {
    mood: 'guide',
    headline: `Ready when you are, ${name}`,
    message: "Pick the first adventure and I'll cheer you on every step.",
    emoji: '🐾',
    border: 'rgba(255,255,255,0.18)',
    glow: 'rgba(255,255,255,0.06)',
  }
}

function YaagviStateCard({ theme, arcadeStatus, dailyAdventure, profileName, onSpeak }) {
  const state = getYaagviState(arcadeStatus, dailyAdventure, profileName)
  const { speak } = useSpeech()

  const handleTap = () => {
    speak(state.message, { mood: state.mood })
    onSpeak?.()
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.42 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleTap}
      className="mt-4 flex max-w-xl w-full items-center gap-3 rounded-[24px] p-3.5 text-left"
      style={{
        background: `rgba(255,255,255,0.07)`,
        border: `1.5px solid ${state.border}`,
        boxShadow: `0 8px 24px ${state.glow}`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[20px] bg-white/10">
        <img src="/yaagvi-mascot-single.webp" alt="Yaagvi" className="h-full w-full object-cover" draggable={false} />
        <motion.div
          className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-sm"
          style={{ background: 'rgba(0,0,0,0.55)', border: '1.5px solid rgba(255,255,255,0.2)' }}
          animate={state.mood === 'celebrate' ? { rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] } : { y: [0, -2, 0] }}
          transition={{ duration: state.mood === 'celebrate' ? 0.6 : 2.5, repeat: Infinity, repeatDelay: 1.5 }}
        >
          {state.emoji}
        </motion.div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-bubble text-sm leading-tight text-white">
          {state.headline}
        </p>
        <p className="font-round mt-1 text-xs font-semibold leading-4 text-white/70">
          {state.message}
        </p>
      </div>

      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/60"
        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
      >
        <span style={{ fontSize: 14 }}>🔊</span>
      </div>
    </motion.button>
  )
}

function PlayPassBanner({ theme, status, onNavigate }) {
  const nextModule = status.remainingModules[0]

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.48 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onNavigate(status.unlocked ? 'arcade' : status.nextModuleId)}
      className="mx-auto mt-4 flex w-[calc(100%-2rem)] max-w-6xl flex-col rounded-[26px] p-4 text-left"
      style={{
        background: status.unlocked
          ? 'linear-gradient(135deg, rgba(16,185,129,0.16), rgba(59,130,246,0.18))'
          : 'linear-gradient(135deg, rgba(15,23,42,0.08), rgba(236,72,153,0.16))',
        border: `1.5px solid ${status.unlocked ? '#34D39955' : theme.primary + '44'}`,
        boxShadow: status.unlocked ? '0 14px 34px rgba(16,185,129,0.14)' : '0 14px 34px rgba(15,23,42,0.08)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bubble text-lg leading-none" style={{ color: theme.text }}>
            {status.unlocked ? 'Arcade Is Open' : 'Study Pass'}
          </p>
          <p className="font-round mt-1 text-sm font-semibold" style={{ color: theme.text, opacity: 0.72 }}>
            {status.unlocked
              ? 'Daily study complete. The arcade is ready for play time.'
              : `Finish ${status.target} study adventures today to unlock the arcade.`}
          </p>
        </div>
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px]"
          style={{
            background: status.unlocked ? 'rgba(16,185,129,0.18)' : `${theme.primary}18`,
            border: `1.5px solid ${status.unlocked ? '#34D39966' : theme.primary + '33'}`,
          }}
        >
          <span style={{ fontSize: 28 }}>{status.unlocked ? '🔓' : '🔒'}</span>
        </div>
      </div>

      <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.55)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: status.unlocked ? 'linear-gradient(90deg, #10B981, #60A5FA)' : 'linear-gradient(90deg, #FB7185, #F59E0B)' }}
          initial={{ width: 0 }}
          animate={{ width: `${status.progressPercent}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {STUDY_MODULES.map(module => {
          const done = status.completedModules.some(item => item.id === module.id)
          return (
            <div
              key={module.id}
              className="flex items-center gap-2 rounded-2xl px-3 py-2"
              style={{
                background: done ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.42)',
                border: `1px solid ${done ? '#10B98144' : 'rgba(255,255,255,0.45)'}`,
              }}
            >
              <span style={{ fontSize: 18 }}>{done ? '✅' : module.emoji}</span>
              <span className="font-round text-sm font-bold" style={{ color: theme.text }}>
                {module.label}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="font-round text-xs font-bold" style={{ color: theme.text, opacity: 0.62 }}>
          {status.unlocked
            ? 'Tap to play the arcade.'
            : `${status.target - status.completedCount} more to unlock.`}
        </span>
        <span className="font-bubble text-sm" style={{ color: status.unlocked ? '#059669' : theme.primary }}>
          {status.unlocked ? 'Open Arcade' : `Play ${nextModule?.shortLabel || 'Next Study'}`}
        </span>
      </div>
    </motion.button>
  )
}

// ── FS2 Adventure Map ─────────────────────────────────────────────────────────
function PiggyBankFeature({ onNavigate }) {
  return (
    <section className="mx-auto mt-4 max-w-6xl px-4 md:px-6 xl:px-8">
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={() => onNavigate('piggybank')}
        className="flex w-full items-center gap-4 rounded-[28px] p-4 text-left shadow-xl"
        style={{
          background: 'linear-gradient(135deg, #FDE68A 0%, #FB923C 45%, #EC4899 100%)',
          border: '2px solid rgba(255,255,255,0.45)',
        }}
      >
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] bg-white/35 text-4xl shadow-inner">
          🐷
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-round text-xs font-black uppercase tracking-[0.18em] text-[#7C2D12]">Money Game</p>
          <p className="font-bubble text-2xl leading-tight text-white drop-shadow">Piggy Bank</p>
          <p className="font-round mt-1 text-sm font-bold text-white/85">
            Save coins, choose needs vs wants, and collect treasure.
          </p>
        </div>
        <span className="font-bubble text-3xl text-white">→</span>
      </motion.button>
    </section>
  )
}

const FS2_MAP_LOCATIONS = [
  { id: 'phonics',  name: 'Sound Castle',   emoji: '🎤', color: '#D81B60' },
  { id: 'math',     name: 'Number Kingdom', emoji: '🔢', color: '#F97316' },
  { id: 'tricky',   name: 'Word Forest',    emoji: '⭐', color: '#7C3AED' },
  { id: 'story',    name: 'Story Cave',     emoji: '📖', color: '#059669' },
  { id: 'science',  name: 'Wonder Lab',     emoji: '🔬', color: '#5B21B6' },
  { id: 'planets',  name: 'Space Station',  emoji: '🚀', color: '#1E40AF' },
  { id: 'worldgk',  name: 'World Map',      emoji: '🌍', color: '#0EA5E9' },
  { id: 'anatomy',  name: 'Body Museum',    emoji: '🫀', color: '#E11D48' },
  { id: 'sacred',   name: 'Temple Isle',    emoji: '🕉️', color: '#C2410C' },
  { id: 'shapes',   name: 'Shape Land',     emoji: '🔷', color: '#0D9488' },
  { id: 'shop',     name: 'Coin Castle',    emoji: '🛍️', color: '#9333EA' },
  { id: 'logic',    name: 'Puzzle Tower',   emoji: '🧩', color: '#2563EB' },
  { id: 'davinci',  name: 'Art Studio',     emoji: '🎨', color: '#D97706' },
  { id: 'exercise', name: 'Training Park',  emoji: '🏃', color: '#EF4444' },
  { id: 'arcade',   name: 'Game Arcade',    emoji: '🎮', color: '#EC4899' },
].map(loc => ({
  ...loc,
  treasure: loc.id === 'arcade' ? 10 : 5,
}))

function getAdventureAccess(adventure) {
  const nextId = adventure.nextStep?.module?.id
  const completedIds = new Set(adventure.steps.filter(step => step.done).map(step => step.module.id))
  const availableIds = new Set([
    ...completedIds,
    ...(nextId ? [nextId] : []),
  ])
  const pathById = new Map(adventure.steps.map((step, index) => [step.module.id, { ...step, index }]))

  return { availableIds, completedIds, pathById, nextId }
}

function FS2AdventureMap({ progress, dailyAdventure, onNavigate }) {
  const { availableIds, completedIds, pathById, nextId } = getAdventureAccess(dailyAdventure)

  const enriched = FS2_MAP_LOCATIONS.map(loc => {
    const inPath = pathById.has(loc.id)
    const locked = !availableIds.has(loc.id)
    const playedToday = completedIds.has(loc.id)
    const stars = progress[loc.id]?.score || 0
    return { ...loc, locked, playedToday, stars, inPath, pathStep: pathById.get(loc.id) }
  })

  const activeIdx = enriched.findIndex(loc => loc.id === nextId)

  return (
    <div className="relative px-4 py-2 flex flex-col">
      <div
        className="pointer-events-none absolute left-1/2 top-8 bottom-8 w-1 -translate-x-1/2 rounded-full opacity-70"
        style={{ background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.42) 0 8px, transparent 8px 18px)' }}
      />
      {enriched.map((loc, idx) => {
        const isLeft = idx % 2 === 0
        const isActive = idx === activeIdx
        const sz = isActive ? 76 : 68

        return (
          <div key={loc.id} className="relative">
            <div
              className="pointer-events-none absolute top-9 h-1 rounded-full opacity-75"
              style={{
                left: isLeft ? 68 : '50%',
                right: isLeft ? '50%' : 68,
                background: `repeating-linear-gradient(to right, ${loc.color}cc 0 8px, transparent 8px 16px)`,
              }}
            />
            <div className="flex" style={{ justifyContent: isLeft ? 'flex-start' : 'flex-end' }}>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => !loc.locked && onNavigate(loc.id)}
                animate={isActive ? { y: [0, -5, 0] } : {}}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10 flex flex-col items-center"
                style={{ minWidth: 100, opacity: loc.locked ? 0.45 : 1 }}>

                <div style={{
                  width: sz, height: sz, borderRadius: isActive ? 24 : 20,
                  background: loc.locked ? 'rgba(255,255,255,0.06)' : loc.playedToday ? 'rgba(34,197,94,0.18)' : `${loc.color}22`,
                  border: `3px solid ${loc.locked ? 'rgba(255,255,255,0.12)' : loc.playedToday ? '#22C55E' : isActive ? loc.color : `${loc.color}50`}`,
                  boxShadow: isActive ? `0 0 22px ${loc.color}90, 0 4px 16px rgba(0,0,0,0.5)` : loc.playedToday ? '0 0 10px rgba(34,197,94,0.4)' : '0 2px 8px rgba(0,0,0,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isActive ? 30 : 26, position: 'relative', transition: 'all 0.2s',
                }}>
                  {loc.locked ? '🔒' : loc.emoji}

                  {loc.playedToday && (
                    <div style={{ position: 'absolute', top: -10, right: -18, borderRadius: 12, background: '#FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, border: '2px solid rgba(0,0,0,0.5)', color: '#78350F', fontFamily: 'Fredoka One, cursive', padding: '3px 7px', boxShadow: '0 3px 10px rgba(0,0,0,0.25)' }}>+{loc.treasure}</div>
                  )}
                  {!loc.locked && loc.inPath && !loc.playedToday && (
                    <div style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: loc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'white', fontFamily: 'Fredoka One, cursive', border: '2px solid rgba(0,0,0,0.5)' }}>{loc.pathStep.index + 1}</div>
                  )}
                  {!loc.playedToday && !loc.locked && (
                    <div style={{ position: 'absolute', bottom: -9, right: -18, background: '#F59E0B', borderRadius: 12, padding: '3px 7px', fontSize: 11, color: '#1F1147', fontWeight: 900, border: '2px solid rgba(255,255,255,0.45)', fontFamily: 'Fredoka One, cursive', boxShadow: '0 3px 10px rgba(0,0,0,0.25)' }}>+{loc.treasure}</div>
                  )}
                  {isActive && (
                    <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}
                      style={{ position: 'absolute', bottom: -11, background: loc.color, borderRadius: 8, padding: '2px 8px', fontSize: 10, color: 'white', fontFamily: 'Fredoka One, cursive', fontWeight: 700, boxShadow: `0 2px 8px ${loc.color}80`, whiteSpace: 'nowrap' }}>
                      ▶ GO!
                    </motion.div>
                  )}
                </div>

                <p style={{ fontFamily: 'Fredoka One, cursive', color: isActive ? 'white' : 'rgba(255,255,255,0.55)', fontSize: 11, textAlign: 'center', maxWidth: 90, marginTop: isActive ? 18 : 10, lineHeight: 1.2 }}>
                  {loc.locked ? 'Locked Today' : loc.name}
                </p>
              </motion.button>
            </div>

            {idx < enriched.length - 1 && <div style={{ height: 30 }} />}
          </div>
        )
      })}
    </div>
  )
}

// ── Daily World Event ─────────────────────────────────────────────────────────
function WorldEventCard({ progress, profileId, fullAccess, theme, onNavigate }) {
  const event = getTodayWorldEvent(fullAccess)
  const todayIds = new Set(getTodayStudySessions(progress.sessions || []).map(s => s.module))
  const done = todayIds.has(event.moduleId) || isEventBonusCollected(profileId)

  return (
    <section className="mx-auto mt-4 max-w-6xl px-4 md:px-6 xl:px-8">
      <motion.button
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={!done ? { scale: 0.98 } : {}}
        onClick={() => !done && onNavigate(event.moduleId)}
        className="relative w-full overflow-hidden rounded-[26px] p-4 text-left"
        style={{
          background: done
            ? 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.05))'
            : 'linear-gradient(135deg, rgba(251,146,60,0.18), rgba(236,72,153,0.12))',
          border: `1.5px solid ${done ? 'rgba(34,197,94,0.4)' : 'rgba(251,146,60,0.45)'}`,
        }}
      >
        <div className="flex items-center gap-3">
          <motion.span
            animate={done ? {} : { rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1 }}
            style={{ fontSize: 40 }}
          >{done ? '✅' : event.emoji}</motion.span>
          <div className="min-w-0 flex-1">
            <p className="font-round text-xs font-black uppercase tracking-[0.16em]"
              style={{ color: `${theme.text}77` }}>
              ⚡ Today's World Event
            </p>
            <p className="font-bubble mt-0.5 text-lg leading-tight" style={{ color: theme.text }}>
              {done ? `${event.title.replace('!', '')} — done!` : event.title}
            </p>
            <p className="font-round mt-0.5 text-xs font-bold leading-4" style={{ color: `${theme.text}66` }}>
              {done ? `Bonus stars collected. New event tomorrow!` : event.desc}
            </p>
          </div>
          {!done && (
            <span className="shrink-0 rounded-full px-3 py-1.5 font-bubble text-sm"
              style={{ background: 'rgba(250,204,21,0.25)', color: '#B45309', border: '1px solid rgba(250,204,21,0.6)' }}>
              +{WORLD_EVENT_BONUS} ⭐
            </span>
          )}
        </div>
      </motion.button>
    </section>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
function getTodayIndex(count) {
  if (!count) return 0
  const now = new Date()
  const seed = now.getFullYear() * 372 + (now.getMonth() + 1) * 31 + now.getDate()
  return seed % count
}

function buildDailyAdventure(progress, challenges, arcadeStatus, fullAccess = true) {
  const todayIds = new Set(getTodayStudySessions(progress.sessions || []).map(s => s.module))
  const [focusId, secondId] = getTodayAdventureModules(progress, null, fullAccess)
  const focusModule = MODULE_MAP[focusId]
  const secondModule = MODULE_MAP[secondId]
  const rewardModule = arcadeStatus.unlocked ? MODULE_MAP.arcade : MODULE_MAP.davinci
  const steps = [
    { label: 'Start', module: focusModule, done: Boolean(focusModule && todayIds.has(focusModule.id)) },
    { label: 'Practice', module: secondModule, done: Boolean(secondModule && todayIds.has(secondModule.id)) },
    { label: arcadeStatus.unlocked ? 'Reward' : 'Create', module: rewardModule, done: arcadeStatus.unlocked },
  ].filter(step => step.module)

  const nextStep = steps.find(step => !step.done) || steps[steps.length - 1]
  const completedCount = steps.filter(step => step.done).length
  const challengeDone = challenges.filter(c => c.completed).length

  return {
    steps,
    nextStep,
    completedCount,
    challengeDone,
    progressPercent: Math.round((completedCount / Math.max(steps.length, 1)) * 100),
  }
}

function DailyAdventureCard({ theme, profileName, progress, challenges, arcadeStatus, adventure, onNavigate }) {
  adventure = adventure || buildDailyAdventure(progress, challenges, arcadeStatus)
  const next = adventure.nextStep
  const { availableIds } = getAdventureAccess(adventure)

  return (
    <section className="mx-auto -mt-2 max-w-6xl px-4 md:px-6 xl:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.12, type: 'spring', stiffness: 240, damping: 22 }}
        className="relative overflow-hidden rounded-[30px] p-4 md:p-5"
        style={{
          background: `linear-gradient(140deg, ${theme.primary} 0%, ${theme.accent} 48%, #111827 100%)`,
          boxShadow: `0 18px 42px ${theme.primary}30`,
        }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(115deg, rgba(255,255,255,0.24), transparent 42%)' }} />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="font-round text-xs font-black uppercase tracking-[0.18em] text-white/70">
              Today's Adventure
            </p>
            <h2 className="font-bubble mt-1 text-3xl leading-tight text-white md:text-4xl">
              {profileName || 'Superstar'}, start here
            </h2>
            <p className="font-round mt-1 max-w-xl text-sm font-bold leading-5 text-white/78">
              One clear path: learn, practice, then unlock a quick reward.
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => next?.module && onNavigate(next.module.id)}
            className="flex min-h-[76px] items-center justify-center gap-3 rounded-[24px] bg-white px-5 text-left shadow-xl md:min-w-[230px]"
          >
            <span className="text-4xl">{next?.module?.emoji || '▶'}</span>
            <span>
              <span className="font-round block text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                Next step
              </span>
              <span className="font-bubble block text-xl leading-tight" style={{ color: theme.text }}>
                {next?.module?.label || 'Begin'}
              </span>
            </span>
          </motion.button>
        </div>

        <div className="relative z-10 mt-4 grid grid-cols-3 gap-2">
          <div
            className="pointer-events-none absolute left-[16%] right-[16%] top-12 h-1 rounded-full opacity-70"
            style={{ background: 'repeating-linear-gradient(to right, rgba(255,255,255,0.72) 0 10px, transparent 10px 20px)' }}
          />
          {adventure.steps.map((step, index) => (
            <motion.button
              key={`${step.label}-${step.module.id}`}
              whileTap={{ scale: 0.94 }}
              onClick={() => availableIds.has(step.module.id) && onNavigate(step.module.id)}
              className="relative min-h-[102px] rounded-[22px] p-3 text-left"
              style={{
                background: step.done ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.18)',
                border: `1.5px solid ${step.done ? '#22C55E66' : 'rgba(255,255,255,0.28)'}`,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-3xl">{step.done ? '✓' : step.module.emoji}</span>
                <span className="font-bubble rounded-full px-2 py-0.5 text-[11px]" style={{ background: step.done ? '#DCFCE7' : 'rgba(255,255,255,0.18)', color: step.done ? '#15803D' : 'white' }}>
                  {index + 1}
                </span>
              </div>
              <span
                className="font-bubble absolute right-3 top-10 rounded-full px-2 py-0.5 text-[11px]"
                style={{ background: '#FDE68A', color: '#78350F' }}
              >
                +5
              </span>
              <p className="font-round mt-2 text-[11px] font-black uppercase leading-none" style={{ color: step.done ? '#64748B' : 'rgba(255,255,255,0.62)' }}>
                {step.label}
              </p>
              <p className="font-bubble mt-1 text-sm leading-tight" style={{ color: step.done ? theme.text : 'white' }}>
                {step.module.shortLabel || step.module.label}
              </p>
            </motion.button>
          ))}
        </div>

        <div className="relative z-10 mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-white/18 px-3 py-2">
            <p className="font-bubble text-lg leading-none text-white">{adventure.completedCount}/3</p>
            <p className="font-round mt-1 text-[11px] font-bold text-white/65">path steps</p>
          </div>
          <div className="rounded-2xl bg-white/18 px-3 py-2">
            <p className="font-bubble text-lg leading-none text-white">{arcadeStatus.completedCount}/{arcadeStatus.target}</p>
            <p className="font-round mt-1 text-[11px] font-bold text-white/65">arcade pass</p>
          </div>
          <div className="rounded-2xl bg-white/18 px-3 py-2">
            <p className="font-bubble text-lg leading-none text-white">{adventure.challengeDone}/3</p>
            <p className="font-round mt-1 text-[11px] font-bold text-white/65">missions</p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

function ForYouCard({ item, index, onNavigate, featured = false }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.18 + index * 0.06, type: 'spring', stiffness: 260, damping: 20 }}
      whileTap={{ scale: 0.94 }}
      onClick={() => onNavigate(item.id)}
      className={`for-you-card ${featured ? 'for-you-card-featured' : ''}`}
      style={{ background: item.bg }}
    >
      <div className="for-you-sheen" />
      <div className="for-you-progress">
        {[0, 1, 2].map(part => (
          <span key={part} className={part <= index % 3 ? 'is-filled' : ''} />
        ))}
      </div>
      <motion.div
        className="for-you-emoji"
        animate={{ y: [0, -8, 0], rotate: [0, -3, 3, 0] }}
        transition={{ duration: 2.4 + index * 0.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {item.emoji}
      </motion.div>
      <div className="for-you-copy">
        <p className="font-round text-[11px] font-black uppercase text-white/70">
          {item.kicker}
        </p>
        <p className="font-bubble text-white leading-tight" style={{ fontSize: featured ? 24 : 17 }}>
          {item.title}
        </p>
        <p className="font-round mt-1 text-xs font-bold leading-4 text-white/75">
          {item.subtitle}
        </p>
      </div>
      <span className="for-you-cta font-bubble">Tap</span>
    </motion.button>
  )
}

function ForYouFeed({ theme, progress, challenges, arcadeStatus, dailyAdventure, onNavigate }) {
  if (dailyAdventure.completedCount < dailyAdventure.steps.length) {
    return (
      <section className="mx-auto mt-4 max-w-6xl px-4 md:px-6 xl:px-8">
        <div
          className="rounded-[24px] p-4"
          style={{ background: `${theme.primary}12`, border: `1.5px solid ${theme.primary}24` }}
        >
          <p className="font-bubble text-lg leading-tight" style={{ color: theme.text }}>
            More choices unlock after today's path
          </p>
          <p className="font-round mt-1 text-sm font-bold" style={{ color: theme.text, opacity: 0.58 }}>
            Finish the next step first, then extra games and creative play appear.
          </p>
        </div>
      </section>
    )
  }

  const unlockedModules = MODULES.filter(m =>
    !(m.id === 'arcade' && !arcadeStatus.unlocked) &&
    !(m.id === 'sacred' && progress.hideSacred)
  )
  const todayModule = MODULE_MAP[progress.dailyChallenge] || unlockedModules[getTodayIndex(unlockedModules.length)]
  const lowScoreModule = unlockedModules
    .filter(m => ['learn', 'explore'].includes(m.section))
    .sort((a, b) => (progress[a.id]?.score || 0) - (progress[b.id]?.score || 0))[0]
  const creativeModule = MODULE_MAP.davinci
  const playModule = arcadeStatus.unlocked ? MODULE_MAP.arcade : MODULE_MAP[arcadeStatus.nextModuleId] || lowScoreModule

  const items = [
    {
      ...todayModule,
      kicker: progress.dailyChallenge ? 'Today' : 'Fresh pick',
      title: progress.dailyChallenge ? 'Daily Mission' : todayModule.label,
      subtitle: progress.dailyChallenge ? todayModule.label : 'A quick win to start.',
    },
    {
      ...lowScoreModule,
      kicker: 'Boost',
      title: 'Level Up',
      subtitle: `${lowScoreModule.label} needs a tiny practice run.`,
    },
    {
      ...creativeModule,
      kicker: 'Create',
      title: 'Make Art',
      subtitle: 'Draw, color, and save a new piece.',
    },
    {
      ...playModule,
      kicker: arcadeStatus.unlocked ? 'Reward' : 'Unlock',
      title: arcadeStatus.unlocked ? 'Arcade Time' : 'Earn Arcade',
      subtitle: arcadeStatus.unlocked ? 'Play is open now.' : `${arcadeStatus.target - arcadeStatus.completedCount} study rounds left.`,
    },
  ].filter(Boolean)

  const challengeDone = challenges.filter(c => c.completed).length

  return (
    <section className="mx-auto mt-4 max-w-6xl px-4 md:px-6 xl:px-8">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="font-bubble text-xl leading-none" style={{ color: theme.text }}>
            More Choices
          </p>
          <p className="font-round mt-1 text-sm font-bold" style={{ color: theme.text, opacity: 0.58 }}>
            Extra activities after the daily path
          </p>
        </div>
        <button
          onClick={() => onNavigate(items[getTodayIndex(items.length)]?.id || 'phonics')}
          className="rounded-full px-4 py-2 font-bubble text-sm text-white shadow-lg"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}
        >
          Surprise
        </button>
      </div>

      <div className="for-you-grid">
        <ForYouCard item={items[0]} index={0} onNavigate={onNavigate} featured />
        <div className="for-you-stack">
          {items.slice(1).map((item, idx) => (
            <ForYouCard key={`${item.id}-${idx}`} item={item} index={idx + 1} onNavigate={onNavigate} />
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="quick-metric">
          <span>{progress.totalStars || 0}</span>
          <p>stars</p>
        </div>
        <div className="quick-metric">
          <span>{challengeDone}/3</span>
          <p>missions</p>
        </div>
        <div className="quick-metric">
          <span>{progress.loginStreak || 0}d</span>
          <p>streak</p>
        </div>
      </div>
    </section>
  )
}

export default function Dashboard({ avatar, progress, onNavigate, onLongPress, onSwitchProfiles, onQuickSwitch, profiles, activeProfileId, profileName }) {
  const { premium } = usePremium()
  const fullAccess = !PREMIUM_GATING_ENABLED || premium
  const theme    = THEMES[avatar] || THEMES.rumi
  const assistant = getAssistant(avatar)
  const longRef  = useRef(null)
  const [showMonsters, setShowMonsters] = useState(false)
  const [premiumMod, setPremiumMod] = useState(null)
  const [tab, setTab] = useState('today')
  const [celebrationSeen, setCelebrationSeen] = useState(
    () => sessionStorage.getItem('bloomCelebration') === 'true'
  )
  const [showFeedback, setShowFeedback] = useState(() => shouldShowFeedback(progress))
  const arcadeStatus = getArcadeUnlockStatus(progress)

  const startLong = () => { longRef.current = setTimeout(() => onLongPress?.(), 1200) }
  const endLong   = () => clearTimeout(longRef.current)
  const getScore  = (id) => progress[id]?.score || 0
  const isToday   = (id) => progress.dailyChallenge === id && !progress.challengeCompleted

  const totalStars      = progress.totalStars  || 0
  const loginStreak     = progress.loginStreak || 0
  const { lvl, pct: xpPct, next: xpNext } = calcLevel(totalStars)
  const unlockedMonsters = MONSTERS.filter(m => totalStars >= m.stars)
  const nextMonster      = MONSTERS.find(m => totalStars < m.stars)
  const autoChallenge    = progress.autoChallenge || { challenges: [] }
  const challenges       = autoChallenge.challenges || []
  const doneCount        = challenges.filter(c => c.completed).length
  const challengeStreak  = progress.challengeStreak || 0
  const dailyAdventure   = buildDailyAdventure(progress, challenges, arcadeStatus, fullAccess)
  const dailyAccess      = getAdventureAccess(dailyAdventure)
  const isDailyPathDone = arcadeStatus?.unlocked === true ||
    (dailyAdventure?.steps?.length > 0 && dailyAdventure.steps.every(s => s.done))
  const handleGatedNavigate = (to) => {
    const mod = MODULE_MAP[to]
    if (mod?.premium && !fullAccess) {
      setPremiumMod(mod)
      return
    }
    if (!mod || isDailyPathDone || dailyAccess.availableIds.has(to)) {
      onNavigate(to)
      return
    }
    onNavigate(dailyAccess.nextId || 'phonics')
  }

  const showCelebration = isDailyPathDone && !celebrationSeen
  const handleCelebrationDismiss = (goTo) => {
    sessionStorage.setItem('bloomCelebration', 'true')
    setCelebrationSeen(true)
    if (goTo) handleGatedNavigate(goTo)
  }

  const HERO_BG = `linear-gradient(160deg, #0B0F2A 0%, #1A1550 40%, ${theme.primary}55 100%)`

  return (
    <div
      className="min-h-screen pb-36 overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${theme.bg} 0%, ${theme.card} 60%, ${theme.bg} 100%)` }}
    >

      {/* ── HERO SECTION ───────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: HERO_BG }}>
        {/* Animated radial glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 80% 60% at 70% 40%, ${theme.primary}40 0%, transparent 70%)` }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Small floating orbs */}
        {[...Array(6)].map((_, i) => (
          <motion.div key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: `${20 + (i*9)%30}px`, height: `${20 + (i*9)%30}px`,
              left: `${(i*19+5)%90}%`, top: `${(i*13+8)%70}%`,
              background: [theme.primary, theme.accent, theme.secondary][i%3],
              opacity: 0.12,
              filter: 'blur(8px)',
            }}
            animate={{ y: [0, -12, 0], x: [0, 6, 0] }}
            transition={{ duration: 3 + i*0.7, repeat: Infinity, delay: i*0.5, ease:'easeInOut' }}
          />
        ))}

        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-safe pb-5 md:px-6 xl:px-8">
          {/* Top row */}
          <div className="flex items-end justify-between">
            <div className="flex-1 mr-3">
              <p className="font-round text-white/50 text-sm font-semibold">
                {timeGreeting()}
              </p>
              <motion.h1
                className="dashboard-name font-bubble text-[2.6rem] md:text-5xl text-white leading-tight"
                style={{ textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}
                animate={{ scale: [1,1.02,1] }}
                transition={{ duration: 3.5, repeat: Infinity, ease:'easeInOut' }}
              >
                {profileName || 'Superstar'}! ✨
              </motion.h1>
              {loginStreak >= 2 && (
                <motion.div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mt-1"
                  style={{ background: 'rgba(255,154,60,0.25)', border: '1px solid rgba(255,154,60,0.4)' }}
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span>🔥</span>
                  <span className="font-bubble text-sm" style={{ color: '#FBBF24' }}>
                    {loginStreak} day streak!
                  </span>
                </motion.div>
              )}

              {profiles && profiles.length > 1 && onQuickSwitch ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {profiles.filter(p => p.id !== activeProfileId).map(p => (
                    <motion.button key={p.id} whileTap={{ scale: 0.88 }}
                      onClick={() => onQuickSwitch(p.id)}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-round text-xs text-white/80"
                      style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
                      <span>{p.emoji || '👤'}</span>
                      <span>{p.name}</span>
                    </motion.button>
                  ))}
                </div>
              ) : onSwitchProfiles && (
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={onSwitchProfiles}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-round text-xs text-white/70"
                  style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.22)' }}
                >
                  ↩ Switch
                </motion.button>
              )}
            </div>

            {/* Avatar circle — clean, no level display */}
            <div className="relative shrink-0">
              <motion.div
                className="flex items-center justify-center rounded-full text-4xl"
                style={{
                  width: 64, height: 64,
                  background: `${theme.primary}30`,
                  border: `3px solid ${theme.primary}80`,
                  boxShadow: `0 0 20px ${theme.primary}40`,
                }}
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                {theme.emoji}
              </motion.div>
            </div>
          </div>

          {/* ── Stars + Streak (simplified) ── */}
          <div className="flex items-center gap-2 mt-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 rounded-2xl px-4 py-2"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <span className="text-xl">⭐</span>
              <span className="font-bubble text-lg text-white leading-none"><CountUp target={totalStars} /></span>
              <span className="font-round text-white/50 text-xs">stars</span>
            </motion.div>
            {loginStreak >= 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="flex items-center gap-2 rounded-2xl px-4 py-2"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <span className="text-xl">🔥</span>
                <span className="font-bubble text-lg text-white leading-none">{loginStreak}</span>
                <span className="font-round text-white/50 text-xs">day streak</span>
              </motion.div>
            )}
          </div>

          <YaagviStateCard
            theme={theme}
            arcadeStatus={arcadeStatus}
            dailyAdventure={dailyAdventure}
            profileName={profileName}
          />
        </div>
      </div>

      {/* ── PHASE 1: DAILY BLOOM PATH (path not done) ────────────────────────── */}
      {!isDailyPathDone && (
        <DailyBloomPath
          adventure={dailyAdventure}
          theme={theme}
          onNavigate={handleGatedNavigate}
          profileName={profileName}
        />
      )}

      {/* ── PHASE 2: CELEBRATION SCREEN ───────────────────────────────────────── */}
      <AnimatePresence>
        {showCelebration && (
          <CelebrationScreen
            profileName={profileName}
            onPlayArcade={() => handleCelebrationDismiss('arcade')}
            onShowGrownUp={() => handleCelebrationDismiss(null)}
          />
        )}
      </AnimatePresence>

      {/* ── PHASE 3: TABS (path done, celebration seen) ───────────────────────── */}
      {isDailyPathDone && !showCelebration && (
        <>
          {/* Tab bar */}
          <div className="mx-auto mt-4 max-w-6xl px-4 md:px-6 xl:px-8">
            <div
              className="flex rounded-[20px] p-1 gap-1"
              style={{ background: `${theme.primary}14`, border: `1.5px solid ${theme.primary}22` }}
            >
              {[
                { id: 'today',    emoji: '⭐', label: 'Today' },
                { id: 'progress', emoji: '🌱', label: 'My Garden' },
                { id: 'explore',  emoji: '🎮', label: 'Play More' },
              ].map(t => (
                <motion.button
                  key={t.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTab(t.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-[16px] py-2.5 font-bubble text-sm transition-all"
                  style={{
                    background: tab === t.id ? theme.primary : 'transparent',
                    color: tab === t.id ? '#fff' : `${theme.text}88`,
                    boxShadow: tab === t.id ? `0 4px 14px ${theme.primary}40` : 'none',
                  }}
                >
                  <span style={{ fontSize: 14 }}>{t.emoji}</span>
                  {t.label}
                </motion.button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {tab === 'today' && (
              <motion.div key="today"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                <DailyAdventureCard
                  theme={theme}
                  profileName={profileName}
                  progress={progress}
                  challenges={challenges}
                  arcadeStatus={arcadeStatus}
                  adventure={dailyAdventure}
                  onNavigate={handleGatedNavigate}
                />
                <PlayPassBanner theme={theme} status={arcadeStatus} onNavigate={handleGatedNavigate} />
                {challenges.length > 0 && (
                  <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="mt-4">
                    <div className="mx-auto mb-3 flex max-w-6xl items-center justify-between px-4 md:px-6 xl:px-8">
                      <div className="flex items-center gap-2">
                        <motion.span className="text-2xl" animate={{ rotate:[0,20,-20,0] }} transition={{ duration:1.8, repeat:Infinity, repeatDelay:2 }}>⭐</motion.span>
                        <div>
                          <p className="font-bubble text-base leading-none" style={{ color:theme.text }}>Bonus Quests</p>
                          <p className="font-round leading-none mt-0.5" style={{ fontSize:11, color:theme.text, opacity:0.5 }}>
                            Extra tasks for bonus points · {doneCount}/3{doneCount===3?' · All done! 🎉':''}
                          </p>
                        </div>
                      </div>
                      {challengeStreak > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full"
                          style={{ background:'rgba(255,154,60,0.15)', border:'1px solid rgba(255,154,60,0.3)' }}>
                          <span>🔥</span>
                          <span className="font-bubble text-sm" style={{ color:'#F97316' }}>{challengeStreak}d</span>
                        </div>
                      )}
                    </div>
                    <div className="mx-auto flex max-w-6xl gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide md:px-6 xl:px-8">
                      {challenges.map((c, i) => (
                        <ChallengeCard key={c.id} challenge={c} onNavigate={handleGatedNavigate} index={i} />
                      ))}
                    </div>
                  </motion.div>
                )}
                <PiggyBankFeature onNavigate={onNavigate} />
                <InviteFriendsCard theme={theme} profileName={profileName} />
              </motion.div>
            )}

            {tab === 'progress' && (
              <motion.div key="progress"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                <BloomGarden progress={progress} theme={theme} onNavigate={handleGatedNavigate} />
                <PhonicsMap phonicsProgress={progress.phonics} theme={theme} onNavigate={handleGatedNavigate} onPlay={onNavigate} />
                <section className="mx-auto mt-4 max-w-6xl px-4 md:px-6 xl:px-8">
                  <YaagviRoom
                    theme={theme}
                    roomScore={progress.totalStars || 0}
                    stickersCount={(progress.stickers || []).length}
                    dark={false}
                    profileName={profileName}
                  />
                </section>
              </motion.div>
            )}

            {tab === 'explore' && (
              <motion.div key="explore"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                <ForYouFeed theme={theme} progress={progress} challenges={challenges} arcadeStatus={arcadeStatus} dailyAdventure={dailyAdventure} onNavigate={handleGatedNavigate} />
                {(progress?.artGallery || []).length > 0 && (
                  <div className="mx-auto max-w-6xl px-4 md:px-6 xl:px-8">
                    <SectionHeader emoji="🖼️" label="My Art Gallery" sub="Your saved masterpieces" theme={theme} />
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {(progress.artGallery || []).map(art => (
                        <button key={art.id} onClick={() => handleGatedNavigate('davinci')}
                          className="shrink-0 rounded-2xl overflow-hidden shadow-md"
                          style={{ width: 96, height: 96, background: theme.card, border: `2px solid ${theme.primary}40` }}>
                          <img src={art.dataUrl} alt={art.template} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-4 mx-4 rounded-[28px] overflow-hidden"
                  style={{ background: 'linear-gradient(160deg, #0a0518 0%, #1a0a35 50%, #0a1528 100%)', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
                  <div className="px-4 pt-4 pb-1 flex items-center gap-2">
                    <span className="text-lg">🗺️</span>
                    <p className="font-bubble text-white/70 text-xs uppercase tracking-widest">Your Adventure</p>
                    <div className="flex-1 h-px ml-2" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  </div>
                  <FS2AdventureMap progress={progress} dailyAdventure={dailyAdventure} onNavigate={handleGatedNavigate} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      <WorldEventCard
        progress={progress}
        profileId={activeProfileId}
        fullAccess={fullAccess}
        theme={theme}
        onNavigate={handleGatedNavigate}
      />

      <ParentHandoff
        progress={progress}
        profileName={profileName}
        arcadeStatus={arcadeStatus}
        theme={theme}
      />

      {/* ── PARENT ZONE CTA ───────────────────────────────────────────────────── */}
      <motion.button
        initial={{ opacity:0, y:20 }}
        animate={{ opacity:1, y:0 }}
        transition={{ delay:0.6 }}
        whileTap={{ scale:0.95 }}
        onTouchStart={startLong} onTouchEnd={endLong}
        onMouseDown={startLong}  onMouseUp={endLong}
        onClick={() => onNavigate('parent')}
        className="mx-auto mt-6 flex w-[calc(100%-2rem)] max-w-6xl items-center gap-4 rounded-[24px] p-4"
        style={{
          background: `linear-gradient(135deg, ${theme.primary}18, ${theme.accent}18)`,
          border: `1.5px solid ${theme.primary}30`,
        }}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: `${theme.primary}20` }}>
          👨‍👩‍👧
        </div>
        <div className="flex-1 text-left">
          <p className="font-bubble text-base leading-none" style={{ color:theme.text }}>Parent Zone</p>
          <p className="font-round text-xs mt-0.5 opacity-60" style={{ color:theme.text }}>
            Progress reports · Daily goals · Settings
          </p>
        </div>
        <span className="font-bold text-xl opacity-40" style={{ color:theme.text }}>›</span>
      </motion.button>

      {/* Monster collection overlay */}
      <AnimatePresence>
        {showMonsters && (
          <MonsterCollection totalStars={totalStars} onClose={() => setShowMonsters(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {premiumMod && (
          <PremiumModal mod={premiumMod} theme={theme} onClose={() => setPremiumMod(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFeedback && (
          <FeedbackPrompt
            profileName={profileName}
            theme={theme}
            onClose={() => setShowFeedback(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
