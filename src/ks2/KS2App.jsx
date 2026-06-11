import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useProgress } from '../hooks/useProgress'
import JarvisOrb from '../components/JarvisOrb'
import MoodCheckIn from '../components/MoodCheckIn'
import ParentZone from '../components/ParentZone'
import HeroAvatar from './HeroAvatar'
import { formatLocalDate } from '../utils/date.js'
import { shouldSendAutoDigest, markDigestSent, buildDigestPayload, sendDigestEmail, sendNudgeEmail } from '../utils/weeklyDigest.js'
import { getClassroomLesson } from '../utils/classroomLesson.js'
import { trackActivityComplete } from '../utils/analytics.js'

import TimesTablesModule from './modules/TimesTablesModule'
import FractionsModule   from './modules/FractionsModule'
import ReadingModule     from './modules/ReadingModule'
import SpellingModule    from './modules/SpellingModule'
import WordProblemsModule from './modules/WordProblemsModule'
import GrammarModule     from './modules/GrammarModule'
import ScienceModule     from './modules/ScienceModule'
import WorldMapModule    from './modules/WorldMapModule'
import SpiritualityModule from './modules/SpiritualityModule'
import GamesModule       from './modules/GamesModule'
import PiggyBankGame     from '../modules/PiggyBankGame'
import { VoiceContext }  from '../contexts/VoiceContext'
import { PREMIUM_GATING_ENABLED, PREMIUM_KS2_MODULES } from '../config/premiumContent.js'
import { usePremium } from '../hooks/usePremium'
import PremiumLockModal from '../components/PremiumLockModal'

// ── Themes ────────────────────────────────────────────────────────────────────
const KS2_THEMES = {
  axel: {
    name: 'Axel', key: 'axel',
    bg: 'linear-gradient(160deg, #050e2a 0%, #1a3fa8 50%, #0a1860 100%)',
    card: 'rgba(255,255,255,0.07)', primary: '#4488ff', accent: '#ffe566',
    glow: '#4488ff', headerBg: 'rgba(10,30,120,0.7)',
    particles: ['⚡','⭐','💡','🔵','✨'],
    tagline: 'Every lesson is your superpower!',
  },
  blaze: {
    name: 'Blaze', key: 'blaze',
    bg: 'linear-gradient(160deg, #1a0500 0%, #7a1a00 50%, #3D1800 100%)',
    card: 'rgba(255,255,255,0.07)', primary: '#FF6600', accent: '#FFE566',
    glow: '#FF6600', headerBg: 'rgba(100,20,0,0.7)',
    particles: ['🔥','⚡','💡','🌟','⭐'],
    tagline: 'Build your brain, build your future!',
  },
  nova: {
    name: 'Nova', key: 'nova',
    bg: 'linear-gradient(160deg, #080018 0%, #2e0050 50%, #1a0040 100%)',
    card: 'rgba(255,255,255,0.07)', primary: '#a855f7', accent: '#e8b4ff',
    glow: '#a855f7', headerBg: 'rgba(40,0,80,0.7)',
    particles: ['⭐','🌟','💫','✨','🔮'],
    tagline: 'Stars are made from hard work and heart!',
  },
  zoom: {
    name: 'Zoom', key: 'zoom',
    bg: 'linear-gradient(160deg, #001a00 0%, #004d00 50%, #002200 100%)',
    card: 'rgba(255,255,255,0.07)', primary: '#22c55e', accent: '#fde68a',
    glow: '#22c55e', headerBg: 'rgba(0,60,0,0.7)',
    particles: ['💨','⭐','🌿','🟢','⚡'],
    tagline: 'Fast fingers, faster brain — let\'s go!',
  },
}

// ── Module registry ───────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'maths', label: 'Maths', emoji: '🔢',
    modules: [
      { id: 'timestables',  label: 'Times Tables',   emoji: '✖️',  desc: 'Master 2–12 times tables',    bg: '#E21C1C' },
      { id: 'fractions',    label: 'Fractions',      emoji: '½',   desc: 'Halves, thirds, quarters',    bg: '#8B00FF' },
      { id: 'wordproblems', label: 'Word Problems',  emoji: '🧩',  desc: 'Multi-step challenges',       bg: '#FF6B35' },
      { id: 'piggybank',    label: 'Piggy Bank',     emoji: '🐷', desc: 'Saving, budgets, smart spending', bg: '#EC4899' },
    ],
  },
  {
    id: 'english', label: 'English', emoji: '📖',
    modules: [
      { id: 'reading',   label: 'Reading',     emoji: '📖', desc: '3 graded passages + questions', bg: '#00B4FF' },
      { id: 'spelling',  label: 'Spelling',    emoji: '✏️', desc: 'Y3–6 statutory word list',     bg: '#22C55E' },
      { id: 'grammar',   label: 'Grammar',     emoji: '🔤', desc: 'Nouns, verbs & adjectives',    bg: '#FF1D8E' },
    ],
  },
  {
    id: 'explore', label: 'Explore', emoji: '🌍',
    modules: [
      { id: 'science',      label: 'Science Quest', emoji: '🔬', desc: 'Plants, forces, light & more', bg: '#00C9A7' },
      { id: 'worldmap',     label: 'World Map',     emoji: '🌍', desc: 'Countries & capitals quiz',    bg: '#1B5FE2' },
      { id: 'spirituality', label: 'World Faiths',  emoji: '🕉️', desc: '5 religions explored',        bg: '#F59E0B' },
    ],
  },
  {
    id: 'games', label: 'Games', emoji: '🎮',
    modules: [
      { id: 'games', label: 'Game Zone', emoji: '🎮', desc: 'Complete 2 modules to unlock!', bg: '#7C3AED' },
    ],
  },
]

// ── XP helpers ────────────────────────────────────────────────────────────────
const XP_PER_LEVEL = 100
const getLevel = (xp = 0) => Math.floor(xp / XP_PER_LEVEL) + 1
const getLevelPct = (xp = 0) => xp % XP_PER_LEVEL

// Study modules that count toward the daily games unlock (must complete 2+)
const DAILY_STUDY_MODULES = [
  'timestables','fractions','wordproblems','piggybank',
  'reading','spelling','grammar',
  'science','worldmap','spirituality',
]
const DAILY_UNLOCK_TARGET = 2

function getKS2DailyMission(progress = {}, todayKey, classroomLesson = null, fullAccess = true) {
  const allModules = SECTIONS.flatMap(section => section.modules).filter(module => module.id !== 'games')
  const allowed = (modules) => fullAccess ? modules : modules.filter(m => !PREMIUM_KS2_MODULES.has(m.id))

  let picks
  if (classroomLesson && classroomLesson.length >= 2) {
    picks = classroomLesson
      .map(id => allModules.find(m => m.id === id))
      .filter(Boolean)
      .slice(0, 3)
  }

  if (!picks || picks.length < 2) {
    const seed = new Date().getDate()
    const maths   = allowed(SECTIONS.find(s => s.id === 'maths')?.modules   || [])
    const english = allowed(SECTIONS.find(s => s.id === 'english')?.modules || [])
    const explore = allowed(SECTIONS.find(s => s.id === 'explore')?.modules || [])
    picks = [
      maths[seed % maths.length],
      english[(seed + 1) % english.length],
      explore[(seed + 2) % explore.length],
    ].filter(Boolean)
  }

  const steps = picks.map(module => ({
    module,
    done: progress[module.id]?.lastPlayedDate === todayKey,
  }))

  return {
    steps,
    next: steps.find(step => !step.done) || steps[steps.length - 1] || allModules[0],
    doneCount: steps.filter(step => step.done).length,
  }
}

// ── Adventure map location definitions ───────────────────────────────────────
const MAP_LOCATIONS = [
  { id: 'timestables',  name: 'Number Castle',  emoji: '🏰', color: '#E21C1C' },
  { id: 'fractions',    name: 'Crystal Cave',   emoji: '💎', color: '#8B00FF' },
  { id: 'wordproblems', name: 'Puzzle Tower',   emoji: '🧩', color: '#FF6B35' },
  { id: 'piggybank',    name: 'Money Bank',     emoji: '🐷', color: '#EC4899' },
  { id: 'reading',      name: 'Book Kingdom',   emoji: '📖', color: '#00B4FF' },
  { id: 'spelling',     name: 'Spell Academy',  emoji: '✨', color: '#22C55E' },
  { id: 'grammar',      name: 'Grammar Grove',  emoji: '🌳', color: '#FF1D8E' },
  { id: 'science',      name: 'Science Lab',    emoji: '🔬', color: '#00C9A7' },
  { id: 'worldmap',     name: 'World Globe',    emoji: '🌍', color: '#1B5FE2' },
  { id: 'spirituality', name: 'Temple Isle',    emoji: '🕉️', color: '#F59E0B' },
  { id: 'games',        name: 'Game Arena',     emoji: '🎮', color: '#7C3AED' },
  { id: 'exercise',     name: 'Training Zone',  emoji: '🏃', color: '#22C55E' },
].map(loc => ({
  ...loc,
  treasure: loc.id === 'games' ? 20 : loc.id === 'exercise' ? 5 : 10,
}))

const getKS2Treasure = (moduleId) =>
  MAP_LOCATIONS.find(loc => loc.id === moduleId)?.treasure || 10

// ── Adventure Map component ───────────────────────────────────────────────────
function AdventureMap({ progress, todayKey, gamesUnlocked, onNavigate }) {
  const enriched = MAP_LOCATIONS.map(loc => {
    const mp = progress[loc.id] || {}
    const locked = loc.id === 'games' && !gamesUnlocked
    const playedToday =
      DAILY_STUDY_MODULES.includes(loc.id) ? mp.lastPlayedDate === todayKey
      : loc.id === 'exercise' ? progress.ks2ExerciseDate === todayKey
      : false
    return { ...loc, locked, playedToday, stars: mp.stars || 0 }
  })

  const activeIdx = enriched.findIndex(loc => !loc.locked && !loc.playedToday)

  return (
    <div className="relative px-4 py-4 flex flex-col">
      <div
        className="pointer-events-none absolute left-1/2 top-10 bottom-10 w-1 -translate-x-1/2 rounded-full opacity-70"
        style={{ background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.46) 0 8px, transparent 8px 18px)' }}
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
            {/* Node row */}
            <div className="flex" style={{ justifyContent: isLeft ? 'flex-start' : 'flex-end' }}>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => !loc.locked && onNavigate(loc.id)}
                animate={isActive ? { y: [0, -5, 0] } : {}}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10 flex flex-col items-center"
                style={{ minWidth: 100, opacity: loc.locked ? 0.45 : 1 }}>

                {/* Circle node */}
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
                  {!loc.playedToday && !loc.locked && (
                    <div style={{ position: 'absolute', top: -10, right: -18, background: '#F59E0B', borderRadius: 12, padding: '3px 7px', fontSize: 11, color: '#1F1147', fontWeight: 900, border: '2px solid rgba(255,255,255,0.45)', fontFamily: 'Fredoka One, cursive', boxShadow: '0 3px 10px rgba(0,0,0,0.25)' }}>+{loc.treasure}</div>
                  )}
                  {isActive && (
                    <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}
                      style={{ position: 'absolute', bottom: -11, background: loc.color, borderRadius: 8, padding: '2px 8px', fontSize: 10, color: 'white', fontFamily: 'Fredoka One, cursive', fontWeight: 700, boxShadow: `0 2px 8px ${loc.color}80`, whiteSpace: 'nowrap' }}>
                      ▶ GO!
                    </motion.div>
                  )}
                </div>

                {/* Name label */}
                <p style={{ fontFamily: 'Fredoka One, cursive', color: isActive ? 'white' : 'rgba(255,255,255,0.55)', fontSize: 11, textAlign: 'center', maxWidth: 90, marginTop: isActive ? 18 : 10, lineHeight: 1.2 }}>
                  {loc.name}
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

// ── Exercise module (fitness activity — separate from games gate) ─────────────
function ExerciseModule({ theme, onDone, onBack }) {
  const exercises = [
    { name: '20 Star Jumps', emoji: '⭐' },
    { name: '10 Push-ups',   emoji: '💪' },
    { name: '15 Squats',     emoji: '🦵' },
    { name: 'Run on spot 30s', emoji: '🏃' },
  ]
  const [checked, setChecked] = useState(Array(exercises.length).fill(false))

  const toggle = (i) => setChecked(c => { const n = [...c]; n[i] = !n[i]; return n })
  const doneCount = checked.filter(Boolean).length
  const allDone = checked.every(Boolean)

  const finish = () => {
    confetti({ particleCount: 120, spread: 140 })
    onDone()
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: theme.bg }}>
      <div className="flex items-center gap-3 px-5 pt-safe pt-4 pb-4" style={{ background: theme.headerBg }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} className="font-round text-white/60 text-sm">← Back</motion.button>
        <p className="font-bubble text-white text-lg">🏃 Daily Exercise</p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
        <div className="text-center">
          <p className="font-bubble text-white text-xl mb-1">Stay Active, Stay Strong! 💪</p>
          <p className="font-round text-white/50 text-sm">Tick each one as you go</p>
        </div>
        <div className="w-full max-w-sm flex flex-col gap-3">
          {exercises.map((ex, i) => (
            <motion.button key={i} whileTap={{ scale: 0.96 }} onClick={() => toggle(i)}
              className="flex items-center gap-4 p-4 rounded-2xl"
              style={{
                background: checked[i] ? '#22C55E30' : theme.card,
                border: checked[i] ? '2px solid #22C55E' : `2px solid ${theme.primary}30`,
              }}>
              <span className="text-3xl">{ex.emoji}</span>
              <span className="font-round text-white text-base flex-1 text-left">{ex.name}</span>
              <span className="text-2xl">{checked[i] ? '✅' : '⬜'}</span>
            </motion.button>
          ))}
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={finish}
          disabled={doneCount === 0}
          className="w-full max-w-sm py-4 rounded-2xl font-bubble text-white text-xl"
          style={{
            background: allDone ? '#22C55E' : doneCount > 0 ? theme.primary : 'rgba(255,255,255,0.1)',
            opacity: doneCount === 0 ? 0.4 : 1,
            boxShadow: allDone ? '0 6px 20px #22C55E60' : 'none',
          }}>
          {allDone ? '🏆 All done — amazing!' : doneCount > 0 ? `✓ Done for today (${doneCount}/${exercises.length})` : 'Tick exercises above'}
        </motion.button>
      </div>
    </div>
  )
}

// ── Hero avatar selector ──────────────────────────────────────────────────────
function KS2AvatarSelector({ onSelect }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(160deg, #0a0a1a 0%, #1a0533 50%, #0a1a3d 100%)' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="text-5xl mb-3">🚀</div>
        <h1 className="font-bubble text-white text-3xl" style={{ textShadow: '0 0 30px rgba(255,215,0,0.8)' }}>
          Choose your hero!
        </h1>
        <p className="font-round text-white/50 text-sm mt-2">Your learning companion awaits</p>
      </motion.div>
      <div className="grid grid-cols-2 gap-5 w-full max-w-sm">
        {Object.entries(KS2_THEMES).map(([key, theme], idx) => (
          <motion.button key={key}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, type: 'spring', stiffness: 260 }}
            whileTap={{ scale: 0.93 }} onClick={() => onSelect(key)}
            className="relative overflow-hidden flex flex-col items-center gap-3 p-4 rounded-3xl"
            style={{ background: theme.bg, boxShadow: `0 8px 28px ${theme.glow}40`, border: `2px solid ${theme.primary}50` }}>
            <HeroAvatar hero={key} size={90} />
            <span className="font-bubble text-white text-base">{theme.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function KS2Dashboard({ theme, profileName, progress, todayKey, gamesUnlocked, studyDoneCount, onNavigate, onSwitchProfiles, profileId, onParent, classroomLesson, fullAccess = true }) {
  const xp = progress.ks2Xp || 0
  const level = getLevel(xp)
  const levelPct = getLevelPct(xp)
  const dailyMission = getKS2DailyMission(progress, todayKey, classroomLesson, fullAccess)

  return (
    <div className="min-h-screen pb-32 overflow-y-auto" style={{ background: theme.bg }}>
      {/* Floating particles */}
      {theme.particles.map((p, i) => (
        <motion.span key={i} className="fixed pointer-events-none select-none text-lg"
          style={{ left: `${(i * 19 + 7) % 88}%`, bottom: '-5%', opacity: 0.18 }}
          animate={{ y: [0, -(window.innerHeight + 50)], opacity: [0.18, 0.4, 0] }}
          transition={{ duration: 7 + i * 1.2, repeat: Infinity, delay: i * 1.1 }}>
          {p}
        </motion.span>
      ))}

      {/* HUD header */}
      <div className="pt-safe px-4 pt-4 pb-4 flex items-center gap-3"
        style={{ background: theme.headerBg, backdropFilter: 'blur(12px)' }}>
        <div className="flex-shrink-0">
          <HeroAvatar hero={theme.key} size={48} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bubble text-white text-base truncate">{profileName}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-round text-white/50 text-xs">Lv.{level}</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                animate={{ width: `${levelPct}%` }} style={{ background: theme.accent }} />
            </div>
            <span className="font-round text-white/30 text-xs">{levelPct}/100 XP</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onSwitchProfiles}
            className="rounded-full px-4 py-2.5 font-bubble text-xs text-[#2b1458] shadow-lg ring-2 ring-white/70"
            style={{ background: 'linear-gradient(135deg, #FFE45E, #FFB347, #FF5E7E)' }}>
            ↩ Switch
          </motion.button>
          {onParent && (
            <motion.button whileTap={{ scale: 0.9 }} onClick={onParent}
              className="rounded-full px-3 py-2.5 font-round text-xs text-white/50 border border-white/20 bg-white/10">
              🔒
            </motion.button>
          )}
        </div>
      </div>

      {/* Daily mission */}
      <div className="mx-4 mt-4 rounded-[28px] p-4"
        style={{ background: `linear-gradient(135deg, ${theme.primary}55, ${theme.accent}30)`, border: `1px solid ${theme.accent}55`, boxShadow: `0 14px 34px ${theme.primary}24` }}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-round text-white/55 text-xs font-black uppercase tracking-[0.18em]">Power Mission</p>
            <p className="font-bubble text-white text-2xl leading-tight mt-1">{profileName}, start here</p>
            <p className="font-round text-white/65 text-sm font-bold mt-1">Finish 2 study stops to open today&apos;s Game Zone.</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => dailyMission.next?.module && onNavigate(dailyMission.next.module.id)}
            className="shrink-0 rounded-[24px] bg-white px-4 py-3 text-left shadow-xl"
          >
            <span className="block text-4xl">{dailyMission.next?.module?.emoji || '▶'}</span>
            <span className="font-bubble block text-sm leading-tight" style={{ color: theme.primary }}>
              {dailyMission.next?.module?.label || 'Begin'}
            </span>
          </motion.button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {dailyMission.steps.map((step, idx) => (
            <motion.button
              key={step.module.id}
              whileTap={{ scale: 0.94 }}
              onClick={() => onNavigate(step.module.id)}
              className="min-h-[96px] rounded-[22px] p-3 text-left"
              style={{ background: step.done ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.12)', border: step.done ? '2px solid #22C55E' : '1px solid rgba(255,255,255,0.18)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{step.done ? '✅' : step.module.emoji}</span>
                <span className="font-round text-white/50 text-xs">{idx + 1}</span>
              </div>
              <p className="font-bubble mt-2 text-sm leading-tight" style={{ color: step.done ? theme.primary : 'white' }}>{step.module.label}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Daily progress banner */}
      <div className="mx-4 mt-4">
        {!gamesUnlocked ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: '#7C3AED20', border: '1px dashed #7C3AED60' }}>
            <span className="text-xl">🎮</span>
            <div className="flex-1">
              <p className="font-round text-white/80 text-sm font-bold">
                Complete {DAILY_UNLOCK_TARGET} modules to unlock Games
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div className="h-full rounded-full"
                    animate={{ width: `${(studyDoneCount / DAILY_UNLOCK_TARGET) * 100}%` }}
                    style={{ background: '#7C3AED' }} />
                </div>
                <span className="font-round text-white/50 text-xs">{studyDoneCount}/{DAILY_UNLOCK_TARGET}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl"
            style={{ background: '#22C55E20', border: '1px solid #22C55E40' }}>
            <span>🎮</span>
            <p className="font-round text-green-400 text-sm font-bold">Game Zone unlocked — great work! 🏆</p>
          </div>
        )}
      </div>


      {/* Adventure Map */}
      <div className="mt-4 mx-4 rounded-[28px] overflow-hidden"
        style={{ background: `linear-gradient(160deg, rgba(0,0,0,0.45) 0%, ${theme.primary}18 50%, rgba(0,0,0,0.45) 100%)`, border: `1px solid ${theme.primary}30`, boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 ${theme.primary}20` }}>
        <div className="px-4 pt-4 pb-1 flex items-center gap-2">
          <span className="text-lg">🗺️</span>
          <p className="font-bubble text-white/70 text-xs uppercase tracking-widest">Your Adventure</p>
          <div className="flex-1 h-px ml-2" style={{ background: `linear-gradient(to right, ${theme.primary}50, transparent)` }} />
        </div>
        <AdventureMap
          progress={progress}
          todayKey={todayKey}
          gamesUnlocked={gamesUnlocked}
          onNavigate={onNavigate}
        />
      </div>

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
            background: `linear-gradient(135deg, ${theme.primary}18, ${theme.accent}18)`,
            border: `1.5px solid ${theme.primary}30`,
          }}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: `${theme.primary}20` }}>
            👨‍👩‍👧
          </div>
          <div className="flex-1 text-left">
            <p className="font-bubble text-base leading-none" style={{ color: theme.text }}>Parent Zone</p>
            <p className="font-round text-xs mt-0.5 opacity-60" style={{ color: theme.text }}>
              Progress reports · Daily goals · Settings
            </p>
          </div>
          <span className="font-bold text-xl opacity-40" style={{ color: theme.text }}>›</span>
        </motion.button>
      )}

      <JarvisOrb
        assistantOverride={{
          name: 'Yaagvi',
          title: 'Power coach',
          sample: 'Pick the next mission and I will keep you moving.',
          image: '/yaagvi-mascot-single.webp',
          imagePosition: 'center',
          emoji: '⭐',
        }}
        themeOverride={{
          ...theme,
          text: '#FFFFFF',
          secondary: theme.accent,
        }}
        profileName={profileName}
        progress={progress}
        prompts={[
          `Hi ${profileName || 'there'}. Yaagvi is ready. Your next mission is ${dailyMission.next?.module?.label || 'ready'}.`,
          `Complete ${DAILY_UNLOCK_TARGET} study missions to open the Game Zone. You have ${studyDoneCount} done today.`,
          gamesUnlocked
            ? 'Game Zone is unlocked. Choose a reward game or keep building XP.'
            : 'Stay focused on the power mission first. Games unlock after your study stops.',
          theme.tagline,
        ]}
        profileId={profileId}
        tourId="junior-v1"
        tourVideo="/tours/yaagvi-tour-7-9.mp4"
        tourSteps={[
          {
            title: 'This is your mission map',
            body: 'You can practise times tables, fractions, reading, spelling, grammar, science, world knowledge, and values.',
            tip: 'For ages 7 to 9, the map keeps learning organised.',
          },
          {
            title: 'Study unlocks games',
            body: `Finish ${DAILY_UNLOCK_TARGET} study missions today and the Game Arena opens as your reward.`,
            tip: 'Games feel better after real progress.',
          },
          {
            title: 'Pick stronger skills',
            body: 'Each mission is made to build confidence, speed, and thinking, not just memorising answers.',
            tip: 'A short focused mission beats random clicking.',
          },
          {
            title: 'Ask Yaagvi anytime',
            body: 'Tap me when you need a plan. I will suggest the next mission or remind you how to unlock games.',
            tip: 'On Apple devices, tap me once to start sound.',
          },
        ]}
      />
    </div>
  )
}

// ── Main app ──────────────────────────────────────────────────────────────────
export default function KS2App({ profileId, profileName, profileAgeGroup, onSwitchProfiles, parentPin, onUpdateProfile, onLogout, guardianEmail, onUpdateGuardian, classroomMode, guardianId }) {
  const { progress, update, logSession, resetProgress, addSticker } = useProgress(profileId)
  const todayKey = useMemo(() => formatLocalDate(), [])
  const classroomLesson = useMemo(() =>
    classroomMode && guardianId ? getClassroomLesson(guardianId) : null
  , [classroomMode, guardianId])
  const moodLog = progress.moodLog || []
  const moodLoggedToday = moodLog.some(entry => entry.date === todayKey)
  const [screen, setScreen] = useState(classroomMode || moodLoggedToday ? 'home' : 'mood')
  const [rewardInfo, setRewardInfo] = useState(null)
  const [lockedModule, setLockedModule] = useState(null)
  const { premium } = usePremium()
  // Beta: PREMIUM_GATING_ENABLED=false means everyone has full access
  const hasAllAccess = !PREMIUM_GATING_ENABLED || classroomMode || premium
  const gatedNavigate = useCallback((to) => {
    if (!hasAllAccess && PREMIUM_KS2_MODULES.has(to)) { setLockedModule(to); return }
    setScreen(to)
  }, [hasAllAccess])
  // Per-session idempotency guard: moduleId:date → only one completion per module per day
  const completedModulesRef = useRef(new Set())

  // Auto-assign default hero on first visit so child skips the hero picker
  useEffect(() => {
    if (!progress.ks2Avatar) {
      update(p => ({ ...p, ks2Avatar: 'axel' }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Weekly digest
  useEffect(() => {
    if (!guardianEmail || !profileId) return
    if (!shouldSendAutoDigest(profileId)) return
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const hasActivity = (progress.sessions || []).some(s => s.date >= sevenDaysAgo)
    markDigestSent(profileId)
    if (hasActivity) {
      sendDigestEmail(buildDigestPayload({ progress, profileName, parentEmail: guardianEmail }))
    } else {
      sendNudgeEmail({ parentEmail: guardianEmail, childName: profileName })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId, guardianEmail])

  const theme = KS2_THEMES[progress.ks2Avatar] || KS2_THEMES.axel

  // Count how many distinct study modules the child has completed today
  const studyDoneCount = useMemo(() =>
    DAILY_STUDY_MODULES.filter(id => progress[id]?.lastPlayedDate === todayKey).length
  , [progress, todayKey])

  const gamesUnlocked = studyDoneCount >= DAILY_UNLOCK_TARGET

  const handleAvatarSelect = useCallback((key) => {
    update(p => ({ ...p, ks2Avatar: key }))
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

  const handleModuleDone = useCallback((moduleId, rawCorrect, rawTotal) => {
    const completionKey = `${moduleId}:${todayKey}`
    if (completedModulesRef.current.has(completionKey)) return
    completedModulesRef.current.add(completionKey)
    trackActivityComplete(moduleId, 'junior')

    const total = Math.max(1, Number.isFinite(Number(rawTotal)) ? Number(rawTotal) : 1)
    const correct = Math.min(total, Math.max(0, Number.isFinite(Number(rawCorrect)) ? Number(rawCorrect) : 0))
    const xpEarned = Math.round((correct / total) * 30)
    const accuracy = Math.round((correct / total) * 100)
    const loc = MAP_LOCATIONS.find(l => l.id === moduleId)
    const treasure = getKS2Treasure(moduleId)
    const pct = correct / total
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : 1

    update(p => {
      const firstToday = p[moduleId]?.lastPlayedDate !== todayKey
      return {
        ...p,
        ks2Xp: (p.ks2Xp || 0) + xpEarned,
        ks2TreasurePoints: (p.ks2TreasurePoints || 0) + (firstToday ? treasure : 0),
        [moduleId]: {
          ...p[moduleId],
          stars: Math.max(p[moduleId]?.stars || 0, stars),
          played: (p[moduleId]?.played || 0) + 1,
          lastAccuracy: accuracy,
          lastPlayedDate: todayKey,
        },
      }
    })
    logSession({ module: moduleId, stars: correct, accuracy, date: Date.now() })
    confetti({ particleCount: 120, spread: 130, origin: { x: 0.5, y: 0.3 } })
    setScreen('home')
    if (loc) {
      setRewardInfo({ loc, treasure, xp: xpEarned, stars })
      setTimeout(() => setRewardInfo(null), 3500)
    }
  }, [update, logSession, todayKey])

  const handleExerciseDone = useCallback(() => {
    update(p => ({
      ...p,
      ks2ExerciseDate: todayKey,
      ks2TreasurePoints: (p.ks2TreasurePoints || 0) + (p.ks2ExerciseDate === todayKey ? 0 : getKS2Treasure('exercise')),
    }))
    setTimeout(() => setScreen('home'), 1200)
  }, [update, todayKey])

  if (screen === 'avatar') return <KS2AvatarSelector onSelect={handleAvatarSelect} />
  if (screen === 'mood') return <MoodCheckIn avatar={progress.ks2Avatar} profileName={profileName} themeOverride={theme} onComplete={handleMoodComplete} onSkip={() => setScreen('home')} />

  if (screen === 'parent') {
    return (
      <ParentZone
        avatar={progress.ks2Avatar || 'rumi'}
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

  const goHome = () => setScreen('home')
  const props = { theme, onBack: goHome }

  const p = (id) => progress[id]?.played || 0

  const moduleMap = {
    timestables:  <TimesTablesModule  {...props} played={p('timestables')} onDone={(s, t) => handleModuleDone('timestables', s, t)} />,
    fractions:    <FractionsModule    {...props} played={p('fractions')}   onDone={(s, t) => handleModuleDone('fractions', s, t)} />,
    reading:      <ReadingModule      {...props} played={p('reading')}     onDone={(s, t) => handleModuleDone('reading', s, t)} />,
    spelling:     <SpellingModule     {...props} played={p('spelling')}    onDone={(s, t) => handleModuleDone('spelling', s, t)} />,
    wordproblems: <WordProblemsModule {...props} played={p('wordproblems')} onDone={(s, t) => handleModuleDone('wordproblems', s, t)} />,
    piggybank:    <PiggyBankGame ageGroup="junior" theme={theme} profileName={profileName} onBack={goHome}
                    onComplete={({ correct, total }) => handleModuleDone('piggybank', correct, total)} />,
    grammar:      <GrammarModule      {...props} played={p('grammar')}     onDone={(s, t) => handleModuleDone('grammar', s, t)} />,
    science:      <ScienceModule      {...props} played={p('science')}     onDone={(s, t) => handleModuleDone('science', s, t)} />,
    worldmap:     <WorldMapModule     {...props} played={p('worldmap')}    onDone={(s, t) => handleModuleDone('worldmap', s, t)} />,
    spirituality: <SpiritualityModule {...props} played={p('spirituality')} onDone={(s, t) => handleModuleDone('spirituality', s, t)} />,
    games:        <GamesModule        {...props} gamesUnlocked={gamesUnlocked} />,
    exercise:     <ExerciseModule     {...props} onDone={handleExerciseDone} />,
  }

  if (moduleMap[screen]) {
    return (
      <VoiceContext.Provider value="en-GB-SoniaNeural">
        {moduleMap[screen]}
      </VoiceContext.Provider>
    )
  }

  return (
    <VoiceContext.Provider value="en-GB-SoniaNeural">
      <KS2Dashboard
        theme={theme}
        profileName={profileName}
        progress={progress}
        todayKey={todayKey}
        gamesUnlocked={gamesUnlocked}
        studyDoneCount={studyDoneCount}
        onNavigate={gatedNavigate}
        onSwitchProfiles={onSwitchProfiles}
        profileId={profileId}
        onParent={parentPin ? () => setScreen('parent') : undefined}
        classroomLesson={classroomLesson}
        fullAccess={hasAllAccess}
      />
      <PremiumLockModal
        show={Boolean(lockedModule)}
        moduleLabel={SECTIONS.flatMap(s => s.modules).find(m => m.id === lockedModule)?.label}
        theme={theme}
        onClose={() => setLockedModule(null)}
        onParentZone={parentPin ? () => { setLockedModule(null); setScreen('parent') } : undefined}
      />
      <AnimatePresence>
        {rewardInfo && (
          <motion.div
            key="reward"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(0,0,0,0.72)' }}
            onClick={() => setRewardInfo(null)}
          >
            <motion.div
              initial={{ scale: 0.6, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 1.05, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className="w-full max-w-xs rounded-[32px] p-8 flex flex-col items-center gap-4 text-center"
              style={{
                background: 'linear-gradient(160deg, #1a0533 0%, #0d2040 100%)',
                border: '2px solid rgba(255,215,0,0.35)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <motion.div
                animate={{ rotate: [0, -15, 15, -8, 0], scale: [1, 1.25, 1] }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-7xl"
              >
                🏆
              </motion.div>

              <div>
                <p className="font-bubble text-white text-2xl">Mission Complete!</p>
                <p className="font-round text-white/50 text-sm mt-1">{rewardInfo.loc.name}</p>
              </div>

              <div className="flex gap-1">
                {[1, 2, 3].map(n => (
                  <motion.span key={n}
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + n * 0.12, type: 'spring' }}
                    className="text-3xl" style={{ opacity: n <= rewardInfo.stars ? 1 : 0.2 }}>
                    ⭐
                  </motion.span>
                ))}
              </div>

              {rewardInfo.treasure > 0 && (
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl"
                  style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.3)' }}
                >
                  <span className="text-2xl">💎</span>
                  <span className="font-bubble text-yellow-300 text-2xl">+{rewardInfo.treasure}</span>
                  <span className="font-round text-yellow-300/60 text-sm">treasure</span>
                </motion.div>
              )}

              <p className="font-round text-white/25 text-xs">Tap anywhere to continue</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </VoiceContext.Provider>
  )
}
