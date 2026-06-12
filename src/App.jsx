import React, { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { useProgress } from './hooks/useProgress'
import { useProfiles } from './hooks/useProfiles'
import { useGuardian } from './hooks/useGuardian'
import { useSpeech } from './hooks/useSpeech'
import { useSound } from './hooks/useSound'
import { triggerHaptic } from './hooks/useHaptic'
import { THEMES, applyTheme } from './themes'
import { logSessionStart, trackActivityComplete } from './utils/analytics'
import { STUDY_MODULES, getArcadeUnlockStatus, getTodayStudySessions, getTodayAdventureModules } from './utils/arcadeUnlock'
import { PREMIUM_GATING_ENABLED, PREMIUM_FS2_MODULES } from './config/premiumContent.js'
import { usePremium } from './hooks/usePremium'
import PremiumLockModal from './components/PremiumLockModal'
import InstallNudge from './components/InstallNudge'
import { formatLocalDate, formatYesterdayLocalDate } from './utils/date.js'
import { shouldSendAutoDigest, markDigestSent, buildDigestPayload, sendDigestEmail, sendNudgeEmail } from './utils/weeklyDigest.js'
import { getClassroomLesson, setClassroomLesson } from './utils/classroomLesson.js'
import { CLASS_SESSION_KEY, loadCloudClassLesson } from './services/cloudStore.js'
import { getAssistant } from './assistants'

import LandingPage from './pages/LandingPage'
import AgeGroupLanding from './components/AgeGroupLanding'
import GuardianSetup   from './components/GuardianSetup'
import GuardianLogin   from './components/GuardianLogin'
import TeacherSetup    from './components/TeacherSetup'
import SplashScreen    from './components/SplashScreen'
import AvatarSelector  from './components/AvatarSelector'
import Dashboard       from './components/Dashboard'
import JarvisOrb       from './components/JarvisOrb'
import ParentZone      from './components/ParentZone'
import ProfileSelector from './components/ProfileSelector'
import SessionTimer    from './components/SessionTimer'
import MoodCheckIn     from './components/MoodCheckIn'
import SyncStatusBanner from './components/SyncStatusBanner'
import PrivacyPolicy from './components/PrivacyPolicy'
import PasswordReset from './components/PasswordReset'
import SchoolsPage from './pages/SchoolsPage'
import ClassroomDashboard from './components/ClassroomDashboard'
import CurriculumMap from './pages/CurriculumMap'
import ClassLogin from './components/ClassLogin'

import MonsterReward, { MONSTERS } from './components/MonsterReward'

const SoundPop          = React.lazy(() => import('./modules/SoundPop'))
const StarCatch         = React.lazy(() => import('./modules/StarCatch'))
const NumberWorld       = React.lazy(() => import('./modules/NumberWorld'))
const StoryRoom         = React.lazy(() => import('./modules/StoryRoom'))
const DirectionalPuzzle = React.lazy(() => import('./modules/DirectionalPuzzle'))
const ShopGame          = React.lazy(() => import('./modules/ShopGame'))
const PiggyBankGame     = React.lazy(() => import('./modules/PiggyBankGame'))
const ShapeWorld        = React.lazy(() => import('./modules/ShapeWorld'))
const LittleDaVinci     = React.lazy(() => import('./modules/LittleDaVinci'))
const BodyParts         = React.lazy(() => import('./modules/BodyParts'))
const CuriousScience    = React.lazy(() => import('./modules/CuriousScience'))
const WorldGK           = React.lazy(() => import('./modules/WorldGK'))
const FunExercise       = React.lazy(() => import('./modules/FunExercise'))
const PlanetWorld       = React.lazy(() => import('./modules/PlanetWorld'))
const GameArcade        = React.lazy(() => import('./modules/GameArcade'))
const SacredStories     = React.lazy(() => import('./modules/SacredStories'))

const GAME_SCREENS = [
  'phonics', 'math', 'tricky', 'story', 'logic', 'shop', 'shapes',
  'davinci', 'anatomy', 'science', 'worldgk', 'exercise', 'planets', 'arcade', 'sacred', 'piggybank',
]

function getDailyGate(progress = {}, classroomLesson = null, premium = true) {
  const arcadeStatus = getArcadeUnlockStatus(progress)
  const todayIds = new Set(getTodayStudySessions(progress.sessions || []).map(session => session.module))
  const [focusId, secondId] = getTodayAdventureModules(progress, classroomLesson, premium)
  const rewardId = arcadeStatus.unlocked ? 'arcade' : 'davinci'
  const steps = [focusId, secondId, rewardId]
  const studyIds = STUDY_MODULES.map(module => module.id)
  const isDone = id => {
    if (studyIds.includes(id)) return todayIds.has(id)
    if (id === 'arcade') return arcadeStatus.unlocked
    return false
  }
  const nextId = steps.find(id => !isDone(id)) || steps[steps.length - 1]
  const availableIds = new Set(steps.filter(id => isDone(id) || id === nextId))

  return { availableIds, nextId }
}

function FloatingParticles({ avatar }) {
  const theme = THEMES[avatar] || THEMES.rumi
  const particles = theme.particles || ['✨']
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="fixed select-none"
          style={{
            left: `${(i * 11 + 3) % 92}%`,
            bottom: '-8%',
            fontSize: `${1.4 + (i % 3) * 0.5}rem`,
            opacity: 0.22,
          }}
          animate={{ y: [0, -(window.innerHeight * 1.25)], rotate: [0, 360] }}
          transition={{ duration: 9 + i * 2.2, repeat: Infinity, delay: i * 1.8, ease: 'linear' }}
        >
          {p}
        </motion.span>
      ))}
    </div>
  )
}

function Screen({ id, current, children }) {
  return (
    <AnimatePresence mode="wait">
      {current === id && (
        <motion.div
          key={id}
          initial={{ opacity: 0, scale: 0.94, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.04, y: -18 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className="relative z-10 min-h-screen"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--theme-bg, #13052c)' }}>
      <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin" />
    </div>
  )
}

function DayCelebration({ profileName, avatar, onDone }) {
  const theme = THEMES[avatar] || THEMES.rumi
  useEffect(() => {
    const t = setTimeout(onDone, 4500)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8 text-center"
      style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}
      onClick={onDone}
    >
      <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 18 }}>
        <div className="text-8xl mb-4">🏆</div>
        <h2 className="font-bubble text-4xl shimmer-text mb-2">
          Amazing {profileName || 'Superstar'}!
        </h2>
        <p className="font-round text-lg mb-1" style={{ color: theme.text }}>
          You finished your adventure today!
        </p>
        <p className="font-round text-sm opacity-60" style={{ color: theme.text }}>
          Come back tomorrow for more! 🌟
        </p>
      </motion.div>
    </motion.div>
  )
}

function SharePrompt({ profileName, avatar, onDone }) {
  const theme = THEMES[avatar] || THEMES.rumi
  const [copied, setCopied] = useState(false)
  const url = 'https://bloomjuniors.com'
  const text = `${profileName} is learning with Bloom Juniors! 🌸 A fun app for kids ages 3–9.`

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Bloom Juniors', text, url }) } catch {}
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`).catch(() => {})
      setCopied(true)
      setTimeout(onDone, 1500)
      return
    }
    onDone()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8 text-center"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onDone}>
      <motion.div initial={{ scale: 0.8, y: 40 }} animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl p-7 text-center"
        style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})`, border: `1px solid ${theme.primary}50` }}>
        <div className="text-5xl mb-3">🌸</div>
        <h2 className="font-bubble text-gray-800 text-2xl mb-2">Know other parents?</h2>
        <p className="font-round text-gray-500 text-sm mb-6">
          Share Bloom Juniors with families who want fun learning for their kids
        </p>
        <motion.button whileTap={{ scale: 0.94 }} onClick={handleShare}
          className="w-full py-4 rounded-2xl font-bubble text-white text-lg mb-3"
          style={{ background: theme.primary }}>
          {copied ? '✓ Link copied!' : '📤 Share with friends'}
        </motion.button>
        <button onClick={onDone} className="font-round text-gray-400 text-xs">Maybe later</button>
      </motion.div>
    </motion.div>
  )
}

function AdventureStepBridge({ starsEarned, emoji, label, onContinue, avatar }) {
  const theme = THEMES[avatar] || THEMES.rumi
  useEffect(() => {
    const t = setTimeout(onContinue, 3500)
    return () => clearTimeout(t)
  }, [onContinue])
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8 text-center"
      style={{ background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})` }}
      onClick={onContinue}
    >
      <motion.div
        initial={{ scale: 0.7, y: 30 }} animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="flex flex-col items-center"
      >
        <motion.div
          animate={{ scale: [1, 1.25, 1], rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-7xl mb-3"
        >⭐</motion.div>
        <h2 className="font-bubble text-4xl text-white mb-1">Step done!</h2>
        {starsEarned > 0 && (
          <p className="font-round text-white/60 text-base mb-5">+{starsEarned} stars earned</p>
        )}
        <div
          className="rounded-[26px] px-6 py-4 mb-6 flex flex-col items-center gap-2"
          style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)' }}
        >
          <p className="font-round text-white/55 text-xs font-bold uppercase tracking-widest">Up next</p>
          <span className="text-5xl">{emoji}</span>
          <p className="font-bubble text-white text-2xl">{label}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={onContinue}
          className="px-10 py-4 rounded-[24px] font-bubble text-xl text-white shadow-xl"
          style={{ background: theme.primary }}
        >
          Let's go! →
        </motion.button>
        <p className="font-round text-white/30 text-xs mt-4">Tap anywhere to continue</p>
      </motion.div>
    </motion.div>
  )
}

// ── Inner app — remounts fresh when profileId changes ─────────────────────────
function AppWithProfile({ profileId, profileName, profileAgeGroup, parentPin, onSwitchProfiles, onQuickSwitch, profiles, onLogout, guardianEmail, onUpdateGuardian, onUpdateProfile, classroomMode, ageGroup, guardianId, schoolId, classId, className }) {
  const { progress, update, addStars, logSession, tickChallenge,
          ensureDailyChallenges, setAvatar, addSticker, setDailyChallenge, resetProgress } = useProgress(profileId)

  const [screen, setScreen] = useState('splash')
  const [newMonster, setNewMonster] = useState(null)
  const [celebrating, setCelebrating] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [adventureBridge, setAdventureBridge] = useState(null)
  const [sessionLocked, setSessionLocked] = useState(false)
  const [lockPinInput, setLockPinInput] = useState('')
  const [lockPinError, setLockPinError] = useState(false)
  const [sessionTimerKey, setSessionTimerKey] = useState(0)
  const [lockedModule, setLockedModule] = useState(null)
  const { speak } = useSpeech()
  const { resume } = useSound()
  const { premium } = usePremium()
  // During beta (PREMIUM_GATING_ENABLED=false) everyone has full access.
  // Classroom/school accounts always have full access (school licence).
  const hasAllAccess = !PREMIUM_GATING_ENABLED || classroomMode || premium
  const hasAllAccessRef = useRef(hasAllAccess)
  useEffect(() => { hasAllAccessRef.current = hasAllAccess }, [hasAllAccess])
  const theme = THEMES[progress.avatar] || THEMES.rumi
  const screenEntryRef      = useRef(null)
  const progressRef         = useRef(progress)
  const timersRef           = useRef(new Set())
  const screenRef           = useRef(screen)
  const classroomLessonRef  = useRef(classroomMode && guardianId ? getClassroomLesson(guardianId) : null)

  useEffect(() => { progressRef.current = progress }, [progress])
  useEffect(() => { screenRef.current = screen }, [screen])

  useEffect(() => {
    if (!classroomMode || !guardianId || !schoolId) return
    let active = true
    loadCloudClassLesson(schoolId, className || '', formatLocalDate(), classId || null)
      .then(moduleIds => {
        if (!active || !moduleIds) return
        setClassroomLesson(guardianId, moduleIds)
        classroomLessonRef.current = moduleIds
      })
      .catch(() => {})
    return () => { active = false }
  }, [classroomMode, guardianId, schoolId, classId, className])

  // Clean up all pending timers on unmount
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
    return id
  }, [])

  useEffect(() => {
    if (progress.avatar) applyTheme(progress.avatar)
  }, [progress.avatar])

  useEffect(() => {
    // Login streak — increment if first visit of this calendar day
    const todayStr = formatLocalDate()
    update(p => {
      if (p.lastLoginDate === todayStr) return { ...p, lastVisit: Date.now() }
      const yStr = formatYesterdayLocalDate()
      const streak = p.lastLoginDate === yStr ? (p.loginStreak || 0) + 1 : 1
      return { ...p, lastVisit: Date.now(), loginStreak: streak, lastLoginDate: todayStr }
    })
    ensureDailyChallenges()
    // Fire-and-forget owner usage ping.
    logSessionStart({ profileName, avatar: progress.avatar })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
  // run once per profile mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId, guardianEmail])

  useEffect(() => {
    const load = () => window.speechSynthesis?.getVoices()
    window.speechSynthesis?.addEventListener('voiceschanged', load)
    load()
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', load)
  }, [])

  // Intercept browser back button — push once on mount, reads current screen via ref to avoid
  // re-registering on every navigation (which stacks phantom history entries)
  useEffect(() => {
    history.pushState({ bloom: true }, '')
    const handlePop = () => {
      history.pushState({ bloom: true }, '')
      if (GAME_SCREENS.includes(screenRef.current)) setScreen('home')
    }
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // iOS Safari requires a user gesture before speechSynthesis works.
  // Prime it silently on the very first touch so auto-greet speech works.
  useEffect(() => {
    const prime = () => {
      if (!window.speechSynthesis) return
      const u = new SpeechSynthesisUtterance(' ')
      u.volume = 0
      window.speechSynthesis.speak(u)
      setTimeout(() => window.speechSynthesis.cancel(), 50)
    }
    document.addEventListener('touchstart', prime, { once: true, passive: true })
    document.addEventListener('click', prime, { once: true })
    return () => {
      document.removeEventListener('touchstart', prime)
      document.removeEventListener('click', prime)
    }
  }, [])

  const todayKey = formatLocalDate()

  const moodLog = progress.moodLog || []
  const moodLoggedToday = moodLog.some(entry => entry.date === todayKey)

  const handleSplashDone = useCallback(() => {
    const skipMood = classroomMode || moodLoggedToday
    if (!progress.avatar) {
      setAvatar('yaagvi')
      applyTheme('yaagvi')
      setScreen(skipMood ? 'home' : 'mood')
      return
    }
    setScreen(skipMood ? 'home' : 'mood')
  }, [progress.avatar, moodLoggedToday, setAvatar, classroomMode])

  const handleMoodComplete = useCallback((mood) => {
    update(p => {
      const existing = p.moodLog || []
      const next = [...existing.filter(e => e.date !== todayKey), { date: todayKey, mood: mood.key, emoji: mood.emoji, at: Date.now() }]
      return { ...p, moodLog: next.slice(-60) }
    })
    setScreen('home')
  }, [update, todayKey])

  const handleAvatarSelect = useCallback((key) => {
    resume()
    setAvatar(key)
    applyTheme(key)
    const assistant = getAssistant(key)
    speak(`${assistant.name} is ready. I will stay with you and help you through each activity.`, { mood: 'guide' })
    defer(() => setScreen(moodLoggedToday ? 'home' : 'mood'), 900)
  }, [setAvatar, speak, resume, moodLoggedToday, defer])

  // Core tabs are always accessible — only adventure shortcut modules go through the gate
  const GATE_FREE_SCREENS = new Set(['phonics', 'math', 'story', 'tricky', 'shapes', 'logic'])

  const navigate = useCallback((to) => {
    resume()
    triggerHaptic('tap')
    if (sessionLocked && GAME_SCREENS.includes(to)) return
    // Premium gate (no-op while PREMIUM_GATING_ENABLED is false / beta)
    if (!hasAllAccessRef.current && PREMIUM_FS2_MODULES.has(to)) {
      setLockedModule(to)
      return
    }
    if (GAME_SCREENS.includes(to) && !GATE_FREE_SCREENS.has(to)) {
      const gate = getDailyGate(progress, classroomLessonRef.current, hasAllAccessRef.current)
      if (!gate.availableIds.has(to)) {
        setScreen(gate.nextId || 'home')
        return
      }
    }
    if (GAME_SCREENS.includes(to)) screenEntryRef.current = Date.now()
    setScreen(to)
  }, [resume, progress, sessionLocked])

  const handleAddStars = useCallback((module, rawCount, sessionData = {}) => {
    const count = Math.max(0, Number(rawCount) || 0)
    addStars(module, count)
    if (count > 0) triggerHaptic('star')
    trackActivityComplete(module, 'early')
    const { total = 0, correct = 0, struggles = [], stayOnModule = false } = sessionData
    const duration = screenEntryRef.current
      ? Math.round((Date.now() - screenEntryRef.current) / 1000)
      : 0
    screenEntryRef.current = stayOnModule ? Date.now() : null
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
    logSession({ module, stars: count, total, correct, accuracy, duration, date: Date.now(), struggles })
    tickChallenge({ module, stars: count, accuracy, total, correct })

    // Use latest progress from ref to avoid stale-closure reads
    const latest = progressRef.current
    const prevTotal = latest.totalStars || 0
    const nextTotal = prevTotal + count
    const justUnlocked = MONSTERS.find(m => prevTotal < m.stars && nextTotal >= m.stars)
    if (justUnlocked) {
      triggerHaptic('levelUp')
      defer(() => setNewMonster(justUnlocked), 1800)
    }
    // Persist puzzle level progress
    if (module === 'logic' && sessionData.maxLevel !== undefined) {
      update(p => ({
        ...p,
        logic: { ...p.logic, maxLevel: Math.max(p.logic?.maxLevel || 0, sessionData.maxLevel) }
      }))
    }
    // Persist per-operation play count for math difficulty scaling
    if (module === 'math' && sessionData.op) {
      update(p => ({
        ...p,
        math: {
          ...p.math,
          opPlayed: {
            ...(p.math?.opPlayed || {}),
            [sessionData.op]: (p.math?.opPlayed?.[sessionData.op] || 0) + 1,
          },
        },
      }))
    }
    // Persist session count for tricky-words word-set progression
    if (module === 'tricky') {
      update(p => ({
        ...p,
        tricky: { ...p.tricky, sessionsPlayed: (p.tricky?.sessionsPlayed || 0) + 1 },
      }))
    }
    // Persist session count for phonics sound-set progression
    if (module === 'phonics') {
      update(p => ({
        ...p,
        phonics: { ...p.phonics, sessionsPlayed: (p.phonics?.sessionsPlayed || 0) + 1 },
      }))
    }
    if (module === 'story' && sessionData.storyId) {
      update(p => {
        const storyStats = p.story?.storyStats || {}
        const existing = storyStats[sessionData.storyId] || {}
        return {
          ...p,
          story: {
            ...p.story,
            booksRead: (p.story?.booksRead || 0) + 1,
            lastBook: sessionData.storyTitle || sessionData.storyId,
            lastStoryId: sessionData.storyId,
            storyStats: {
              ...storyStats,
              [sessionData.storyId]: {
                ...existing,
                title: sessionData.storyTitle,
                difficulty: sessionData.storyDifficulty || 1,
                readCount: (existing.readCount || 0) + 1,
                phonicsFound: Math.max(existing.phonicsFound || 0, sessionData.phonicsFound || 0),
                lastReadAt: Date.now(),
              },
            },
          },
        }
      })
    }
    if (latest.dailyChallenge === module && !latest.challengeCompleted) {
      update(p => ({ ...p, challengeCompleted: true }))
      addSticker({ type: 'challenge', emoji: '🏆' })
      speak(`You completed the daily challenge! AMAZING ${profileName}!`, { mood: 'celebrate' })
    }
    if (!stayOnModule) {
      // Adventure bridge — guide child from step 1 to step 2 without returning to the menu
      const [focusId, secondId] = getTodayAdventureModules(latest, classroomLessonRef.current, hasAllAccessRef.current)
      const doneIds = new Set(getTodayStudySessions(latest.sessions || []).map(s => s.module))
      if (module === focusId && !doneIds.has(secondId)) {
        const nextMod = STUDY_MODULES.find(m => m.id === secondId)
        if (nextMod) {
          defer(() => {
            setScreen('home')
            setAdventureBridge({ starsEarned: count, nextModuleId: secondId, emoji: nextMod.emoji, label: nextMod.label })
          }, 1500)
          return
        }
      }
    }
    if (!stayOnModule) {
      // Check if daily adventure is now complete (2+ core modules done today)
      const CORE_MODULES = ['math', 'phonics', 'tricky', 'story', 'logic', 'shapes']
      const todayKey = formatLocalDate()
      const doneToday = CORE_MODULES.filter(m =>
        m === module ? true : latest[m]?.lastPlayedDate === todayKey
      ).length
      const celebKey = `cel_${todayKey}_${profileId}`
      if (doneToday >= 2 && !sessionStorage.getItem(celebKey)) {
        sessionStorage.setItem(celebKey, '1')
        defer(() => { setScreen('home'); setCelebrating(true) }, 1500)
        return
      }
    }
    if (!stayOnModule) {
      const shareKey = `shared_${profileId}`
      if (!sessionStorage.getItem(shareKey) && Math.random() < 0.33) {
        sessionStorage.setItem(shareKey, '1')
        defer(() => { setScreen('home'); setSharing(true) }, 1500)
        return
      }
    }
    defer(() => setScreen(stayOnModule ? module : 'home'), 1500)
  }, [addStars, logSession, tickChallenge, update, addSticker, speak, profileName, profileId, defer])

  const handleUpdateProgress = useCallback((patch) => {
    update(p => ({ ...p, ...patch }))
  }, [update])

  // JarvisOrb only shown on home — prevents blocking game answer buttons on mobile
  const showJarvis = screen === 'home'
  const showTimer  = !['splash', 'avatar'].includes(screen) && progress.avatar

  return (
    <div className="relative overflow-hidden" style={{ minHeight: '100dvh', background: 'var(--theme-bg)' }}>
      <SyncStatusBanner />
      {screen === 'splash' && <SplashScreen onDone={handleSplashDone} />}

      {progress.avatar && screen !== 'splash' && <FloatingParticles avatar={progress.avatar} />}

      <AnimatePresence>
        {adventureBridge && (
          <AdventureStepBridge
            key="bridge"
            starsEarned={adventureBridge.starsEarned}
            emoji={adventureBridge.emoji}
            label={adventureBridge.label}
            avatar={progress.avatar}
            onContinue={() => {
              const nextId = adventureBridge.nextModuleId
              setAdventureBridge(null)
              navigate(nextId)
            }}
          />
        )}
        {celebrating && (
          <DayCelebration
            profileName={profileName}
            avatar={progress.avatar}
            onDone={() => setCelebrating(false)}
          />
        )}
        {sharing && (
          <SharePrompt
            profileName={profileName}
            avatar={progress.avatar}
            onDone={() => setSharing(false)}
          />
        )}
      </AnimatePresence>

      <Screen id="avatar" current={screen}>
        <AvatarSelector currentAvatar={progress.avatar} onSelect={handleAvatarSelect} profileName={profileName} />
      </Screen>

      {screen === 'mood' && (
        <MoodCheckIn avatar={progress.avatar} profileName={profileName} onComplete={handleMoodComplete} onSkip={() => setScreen('home')} />
      )}

      <Screen id="home" current={screen}>
        <Dashboard
          avatar={progress.avatar} progress={progress}
          profileName={profileName}
          onNavigate={navigate}
          onLongPress={() => navigate('parent')}
          onSwitchProfiles={onSwitchProfiles}
          onQuickSwitch={onQuickSwitch}
          profiles={profiles}
          activeProfileId={profileId}
        />
      </Screen>

      <React.Suspense fallback={<LoadingSpinner />}>
      <Screen id="phonics" current={screen}>
        <SoundPop avatar={progress.avatar} progress={progress}
          profileName={profileName}
          onAddStars={handleAddStars} onBack={() => navigate('home')} />
      </Screen>

      <Screen id="math" current={screen}>
        <NumberWorld avatar={progress.avatar} progress={progress}
          profileName={profileName}
          onAddStars={handleAddStars} onBack={() => navigate('home')} />
      </Screen>

      <Screen id="tricky" current={screen}>
        <StarCatch avatar={progress.avatar} progress={progress}
          profileName={profileName}
          onAddStars={handleAddStars} onBack={() => navigate('home')} />
      </Screen>

      <Screen id="story" current={screen}>
        <StoryRoom avatar={progress.avatar} progress={progress}
          profileName={profileName}
          onAddStars={handleAddStars} onBack={() => navigate('home')}
          onUpdateProgress={handleUpdateProgress} />
      </Screen>

      <Screen id="logic" current={screen}>
        <DirectionalPuzzle avatar={progress.avatar} progress={progress}
          profileName={profileName}
          onAddStars={handleAddStars} onBack={() => navigate('home')} />
      </Screen>

      <Screen id="shop" current={screen}>
        <ShopGame avatar={progress.avatar} progress={progress}
          profileName={profileName}
          onAddStars={handleAddStars} onBack={() => navigate('home')}
          onUpdateProgress={handleUpdateProgress} />
      </Screen>

      <Screen id="piggybank" current={screen}>
        <PiggyBankGame
          ageGroup="early"
          avatar={progress.avatar}
          profileName={profileName}
          onBack={() => navigate('home')}
          onComplete={({ correct, total, stars }) => handleAddStars('piggybank', stars, {
            total,
            correct,
            struggles: [],
          })}
        />
      </Screen>

      <Screen id="shapes" current={screen}>
        <ShapeWorld avatar={progress.avatar} progress={progress}
          profileName={profileName}
          onAddStars={handleAddStars} onBack={() => navigate('home')} />
      </Screen>

      <Screen id="davinci" current={screen}>
        <LittleDaVinci avatar={progress.avatar} progress={progress}
          profileName={profileName}
          onAddStars={handleAddStars}
          onUpdateProgress={handleUpdateProgress}
          onBack={() => navigate('home')} />
      </Screen>

      <Screen id="anatomy" current={screen}>
        <BodyParts avatar={progress.avatar}
          profileName={profileName}
          onAddStars={handleAddStars} onBack={() => navigate('home')} />
      </Screen>

      <Screen id="science" current={screen}>
        <CuriousScience avatar={progress.avatar}
          profileName={profileName}
          onAddStars={handleAddStars} onBack={() => navigate('home')} />
      </Screen>

      <Screen id="worldgk" current={screen}>
        <WorldGK avatar={progress.avatar}
          profileName={profileName}
          onAddStars={handleAddStars} onBack={() => navigate('home')} />
      </Screen>

      <Screen id="exercise" current={screen}>
        <FunExercise avatar={progress.avatar}
          profileName={profileName}
          onAddStars={handleAddStars} onBack={() => navigate('home')} />
      </Screen>

      <Screen id="planets" current={screen}>
        <PlanetWorld avatar={progress.avatar}
          profileName={profileName}
          onAddStars={handleAddStars} onBack={() => navigate('home')} />
      </Screen>

      <Screen id="arcade" current={screen}>
        <GameArcade avatar={progress.avatar} progress={progress}
          profileName={profileName}
          onAddStars={handleAddStars} onBack={() => navigate('home')}
          onNavigate={navigate}
          onUpdateProgress={handleUpdateProgress} />
      </Screen>

      <Screen id="sacred" current={screen}>
        <SacredStories avatar={progress.avatar}
          profileName={profileName}
          profileId={profileId}
          ageGroup={ageGroup}
          progress={progress}
          onUpdateProgress={handleUpdateProgress}
          onAddStars={handleAddStars} onBack={() => navigate('home')} />
      </Screen>
      </React.Suspense>

      <Screen id="parent" current={screen}>
        <ParentZone
          avatar={progress.avatar} progress={progress}
          profileId={profileId}
          profileName={profileName}
          profileAgeGroup={profileAgeGroup}
          parentPin={parentPin}
          onBack={() => navigate('home')}
          onSetChallenge={setDailyChallenge}
          onAddSticker={addSticker}
          onReset={resetProgress}
          onSwitchProfiles={onSwitchProfiles}
          onUpdateProgress={handleUpdateProgress}
          onUpdateProfile={onUpdateProfile}
          onLogout={onLogout}
          guardianEmail={guardianEmail}
          onUpdateGuardian={onUpdateGuardian}
          classroomMode={classroomMode}
        />
      </Screen>

      {showJarvis && progress.avatar && (
        <JarvisOrb
          avatar={progress.avatar}
          currentScreen={screen}
          profileName={profileName}
          progress={progress}
          profileId={profileId}
          tourId="early-v1"
          tourVideo="/tours/yaagvi-tour-4-6.mp4"
          tourSteps={[
            {
              title: 'Start with today',
              body: 'This learning world is for phonics, numbers, stories, shapes, puzzles, art, science, and movement.',
              tip: 'For ages 4 to 6, the daily adventure gives one clear starting point.',
            },
            {
              title: 'Follow the adventure',
              body: 'The daily path unlocks activities in a simple order, so there are not too many choices at once.',
              tip: 'Start at the first unlocked activity.',
            },
            {
              title: 'Listen and try',
              body: 'Yaagvi can read prompts, explain what to do, and cheer after correct answers.',
              tip: 'Tap Yaagvi once on iPhone or iPad to start voice.',
            },
            {
              title: 'Earn rewards',
              body: 'Stars, stickers, daily challenges, and arcade rewards help learning feel like a game.',
              tip: 'Small daily wins build the habit.',
            },
          ]}
        />
      )}


      <AnimatePresence>
        {newMonster && (
          <MonsterReward
            key={newMonster.id}
            monster={newMonster}
            onClose={() => setNewMonster(null)}
          />
        )}
      </AnimatePresence>

      <PremiumLockModal
        show={Boolean(lockedModule)}
        moduleLabel={STUDY_MODULES.find(m => m.id === lockedModule)?.label}
        theme={theme}
        onClose={() => setLockedModule(null)}
        onParentZone={() => { setLockedModule(null); navigate('parent') }}
      />

      {showTimer && (
        <SessionTimer
          key={sessionTimerKey}
          sessionMinutes={progress.sessionMinutes || 30}
          profileName={profileName}
          theme={theme}
          onTimeUp={() => { setScreen('home'); setSessionLocked(true) }}
        />
      )}

      <AnimatePresence>
        {sessionLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-6"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="bg-white rounded-3xl p-8 mx-2 text-center shadow-2xl max-w-xs w-full"
            >
              <div className="text-6xl mb-3">⏸️</div>
              <h2 className="font-bubble text-2xl mb-1" style={{ color: theme.primary }}>
                Break Time!
              </h2>
              <p className="font-round text-sm mb-5 opacity-70 text-gray-600">
                Session time is up for {profileName || 'this learner'}. Parents can unlock to continue.
              </p>
              <div className="flex gap-2 justify-center mb-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-3 h-3 rounded-full border-2"
                    style={{ background: lockPinInput.length >= i ? theme.primary : 'transparent', borderColor: theme.primary }} />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
                  <motion.button key={i} whileTap={{ scale: 0.88 }}
                    onClick={() => {
                      if (k === '') return
                      if (k === '⌫') { setLockPinInput(p => p.slice(0, -1)); setLockPinError(false); return }
                      setLockPinError(false)
                      setLockPinInput(prev => {
                        const next = (prev + k).slice(0, 4)
                        if (next.length === 4) {
                          if (next === String(parentPin || '')) {
                            defer(() => {
                              setSessionLocked(false)
                              setSessionTimerKey(n => n + 1)
                            }, 0)
                            return ''
                          }
                          setLockPinError(true)
                          defer(() => setLockPinInput(''), 600)
                        }
                        return next
                      })
                    }}
                    className="py-3 rounded-2xl font-bubble text-lg"
                    style={{ background: k === '' ? 'transparent' : theme.primary + '22', color: theme.primary, border: k === '' ? 'none' : `1.5px solid ${theme.primary}44` }}
                  >
                    {k}
                  </motion.button>
                ))}
              </div>
              {lockPinError && (
                <p className="font-round text-xs text-red-500">Wrong PIN. Try again.</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

// ── Classroom PIN gate — blocks student-switching without teacher PIN ─────────
function ClassroomPinModal({ show, pinInput, pinError, onDigit, onClose }) {
  if (!show) return null
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/75 p-6">
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 18 }}
        className="bg-white rounded-3xl p-8 text-center max-w-xs w-full shadow-2xl"
      >
        <div className="text-5xl mb-3">🔐</div>
        <h2 className="font-bubble text-xl text-gray-800 mb-1">Teacher PIN</h2>
        <p className="font-round text-sm text-gray-500 mb-5">Enter your PIN to switch students</p>
        <div className="flex gap-2 justify-center mb-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="w-3 h-3 rounded-full border-2 border-indigo-400"
              style={{ background: pinInput.length >= i ? '#6366F1' : 'transparent' }} />
          ))}
        </div>
        {pinError && <p className="font-round text-xs text-red-500 mb-2">Wrong PIN. Try again.</p>}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
            <motion.button key={i} whileTap={{ scale: 0.88 }}
              onClick={() => onDigit(k)}
              className="py-3 rounded-2xl font-bubble text-lg"
              style={{
                background: k === '' ? 'transparent' : '#6366F120',
                color: '#6366F1',
                border: k === '' ? 'none' : '1.5px solid #6366F140',
              }}>
              {k}
            </motion.button>
          ))}
        </div>
        <button onClick={onClose} className="font-round text-xs text-gray-400">Cancel</button>
      </motion.div>
    </div>
  )
}

// ── Root — profile gate ────────────────────────────────────────────────────────
function loadStoredClassSession() {
  try {
    const session = JSON.parse(localStorage.getItem(CLASS_SESSION_KEY) || 'null')
    if (!session?.profile?.id || !session?.sessionToken) return null
    return session
  } catch {
    return null
  }
}

function ClassPupilExperience({ session, onExit }) {
  const profile = session.profile || {}
  const profileAgeGroup = profile.ageGroup || 'early'
  const sharedProps = {
    profileId: profile.id,
    profileName: profile.name || 'Superstar',
    profileAgeGroup,
    parentPin: '',
    onSwitchProfiles: onExit,
    onUpdateProfile: () => {},
    onLogout: onExit,
    guardianEmail: '',
    onUpdateGuardian: undefined,
    classroomMode: true,
    guardianId: `class-${session.classId || session.classCode || 'session'}`,
    schoolId: session.schoolId || '',
    classId: session.classId || '',
    className: session.className || '',
  }

  if (profileAgeGroup === 'junior') {
    const KS2AppWithProfile = React.lazy(() => import('./ks2/KS2App'))
    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <KS2AppWithProfile key={profile.id} {...sharedProps} />
      </React.Suspense>
    )
  }

  if (profileAgeGroup === 'toddler') {
    const ToddlerAppWithProfile = React.lazy(() => import('./toddler/ToddlerApp'))
    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <ToddlerAppWithProfile key={profile.id} {...sharedProps} />
      </React.Suspense>
    )
  }

  return (
    <AppWithProfile
      key={profile.id}
      {...sharedProps}
      profiles={[profile]}
      onQuickSwitch={() => {}}
      ageGroup={profileAgeGroup}
    />
  )
}

export default function App() {
  const {
    guardian,
    isLoggedIn,
    initializing,
    authError,
    registerGuardian,
    registerTeacher,
    login,
    logout,
    startNewRegistration,
    sendPasswordReset,
    resetPin,
    updateAccountPassword,
    updateGuardian,
  } = useGuardian()
  const { profiles, activeId, activeProfile, createProfile, createProfilesBulk, switchProfile, deleteProfile, updateProfile, resetProfiles } = useProfiles()
  const [ageGroup, setAgeGroup] = useState(null)
  const [showProfiles, setShowProfiles] = useState(false)
  const [classroomAddMode, setClassroomAddMode] = useState(false)
  const [showLanding, setShowLanding] = useState(() => {
    const forceApp =
      window.location.search.includes('app=1') ||
      window.location.hash.includes('app') ||
      window.location.search.includes('teacher=1') ||
      window.location.pathname === '/teacher-invite' ||
      window.location.pathname === '/class'
    const hasAccount = Object.keys(localStorage).some(k =>
      k.startsWith('yaagvi_') ||
      k === 'eduapp_guardian_v1' ||
      k === 'eduapp_session_v1' ||
      k === 'eduapp_profiles_v1' ||
      k === 'eduapp_active_profile' ||
      k.startsWith('eduapp_progress_')
    )
    return !forceApp && !hasAccount
  })

  // ?teacher=1 URL param → go straight to teacher signup
  const [authEntryMode, setAuthEntryMode] = useState(() =>
    window.location.search.includes('teacher=1') ? 'teacher' : 'setup'
  )
  const routePath = window.location.pathname
  const [classPupilSession, setClassPupilSession] = useState(() =>
    window.location.pathname === '/class' ? loadStoredClassSession() : null
  )
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const searchParams = new URLSearchParams(window.location.search.replace(/^\?/, ''))
  const isPasswordResetRoute = routePath === '/reset-password'
  const isRecoveryLink =
    isPasswordResetRoute ||
    hashParams.get('type') === 'recovery' ||
    searchParams.get('type') === 'recovery'
  const resetLinkError =
    hashParams.get('error_description') ||
    searchParams.get('error_description') ||
    hashParams.get('error_code') ||
    searchParams.get('error_code') ||
    ''
  const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAIL || 'sanjuveed@gmail.com,sanju.veed@gmail.com').toLowerCase().split(',').map(e => e.trim())
  const isAdmin = ADMIN_EMAILS.includes(guardian?.email?.toLowerCase() || '')

  const [classroomPinGate, setClassroomPinGate]   = useState(false)
  const [classroomPinInput, setClassroomPinInput] = useState('')
  const [classroomPinError, setClassroomPinError] = useState(false)
  const classroomPinActionRef = useRef(null)
  const classroomClearRef     = useRef(null)
  const classroomSuccessRef   = useRef(null)

  useEffect(() => () => {
    clearTimeout(classroomClearRef.current)
    clearTimeout(classroomSuccessRef.current)
  }, [])

  const handleClassroomPinDigit = (k) => {
    if (!k) return
    if (k === '⌫') { setClassroomPinInput(p => p.slice(0, -1)); setClassroomPinError(false); return }
    setClassroomPinError(false)
    setClassroomPinInput(prev => {
      const next = (prev + k).slice(0, 4)
      if (next.length === 4) {
        if (next === String(guardian?.pin || '')) {
          clearTimeout(classroomSuccessRef.current)
          classroomSuccessRef.current = window.setTimeout(() => {
            setClassroomPinGate(false)
            classroomPinActionRef.current?.()
            classroomPinActionRef.current = null
          }, 0)
          return ''
        }
        setClassroomPinError(true)
        clearTimeout(classroomClearRef.current)
        classroomClearRef.current = window.setTimeout(() => setClassroomPinInput(''), 600)
      }
      return next
    })
  }

  const handleClassroomPinClose = () => {
    clearTimeout(classroomClearRef.current)
    clearTimeout(classroomSuccessRef.current)
    setClassroomPinGate(false)
    setClassroomPinInput('')
    setClassroomPinError(false)
    classroomPinActionRef.current = null
  }

  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    const on = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  useEffect(() => {
    if (activeId && !ageGroup && activeProfile?.ageGroup) {
      setAgeGroup(activeProfile.ageGroup)
      setShowProfiles(false)
    } else if (activeId && !ageGroup) {
      setShowProfiles(false)
    }
  }, [activeId, ageGroup, activeProfile])

  const handleLogout = useCallback(async () => {
    setAgeGroup(null)
    setShowProfiles(false)
    switchProfile(null)
    await logout()
  }, [logout, switchProfile])

  const handleStartRegistration = useCallback(async () => {
    setAgeGroup(null)
    setShowProfiles(false)
    setAuthEntryMode('setup')
    switchProfile(null)
    resetProfiles()
    await startNewRegistration()
  }, [resetProfiles, startNewRegistration, switchProfile])

  if (routePath === '/class') {
    const handleClassSessionStart = (session) => {
      setClassPupilSession(session)
    }
    const handleClassSessionExit = () => {
      try { localStorage.removeItem(CLASS_SESSION_KEY) } catch {}
      setClassPupilSession(null)
    }
    if (classPupilSession?.profile?.id) {
      return (
        <>
          <SyncStatusBanner />
          <ClassPupilExperience session={classPupilSession} onExit={handleClassSessionExit} />
        </>
      )
    }
    return (
      <>
        <SyncStatusBanner />
        <ClassLogin onStart={handleClassSessionStart} />
      </>
    )
  }

  if (window.location.pathname === '/privacy') {
    return <PrivacyPolicy />
  }
  if (window.location.pathname === '/schools') {
    return <SchoolsPage />
  }
  if (window.location.pathname === '/curriculum-map') {
    return <CurriculumMap />
  }

  // Teacher invite link — /teacher-invite?token=xxx
  const teacherInviteToken =
    window.location.pathname === '/teacher-invite'
      ? new URLSearchParams(window.location.search).get('token') || ''
      : ''
  if (teacherInviteToken && !guardian) {
    const handleTeacherInviteComplete = async (payload) => {
      await registerTeacher(payload)
      setShowLanding(false)
      if (false && payload.childAgeGroup === undefined) {
        const id = createProfile(payload.className || 'Class', 0, payload.classAgeGroup || 'early', '🏫', 30)
        if (id) updateProfile(id, { emoji: '🏫' })
      }
    }
    return (
      <>
        <SyncStatusBanner />
        <TeacherSetup
          inviteToken={teacherInviteToken}
          onComplete={handleTeacherInviteComplete}
          onBack={() => window.location.href = '/'}
        />
      </>
    )
  }

  if (isRecoveryLink) {
    return <PasswordReset onUpdatePassword={updateAccountPassword} resetLinkError={resetLinkError} />
  }

  const handleSelectAgeGroup = (group) => {
    setAgeGroup(group)
    setShowProfiles(true)
  }

  const handleSelectProfile = (id) => {
    switchProfile(id)
    setShowProfiles(false)
  }

  const handleBackToLanding = () => {
    setAgeGroup(null)
    setShowProfiles(false)
    setClassroomAddMode(false)
    switchProfile(null)
  }

  const handleCreateNew = (name, colorIdx, emoji, group = ageGroup || 'early') => {
    const maxPerGroup = guardian?.classroomMode ? 30 : 2
    const duplicate = profiles.some(profile =>
      (profile.ageGroup || 'early') === group &&
      profile.name.trim().toLowerCase() === String(name || '').trim().toLowerCase()
    )
    if (duplicate) return null
    const id = createProfile(name, colorIdx, group, emoji, maxPerGroup)
    if (!id) return null
    updateProfile(id, { emoji })
    return id
  }

  // Not registered yet → show registration
  const handleGuardianComplete = async (payload) => {
    const nextGuardian = await registerGuardian(payload)
    if (payload?.childName && payload?.childAgeGroup) {
      const starterEmoji = {
        toddler: '🧸',
        early: '🌟',
        junior: '🚀',
      }[payload.childAgeGroup] || '🌟'
      const id = createProfile(payload.childName, 0, payload.childAgeGroup, starterEmoji)
      if (id) {
        updateProfile(id, { emoji: starterEmoji })
        setAgeGroup(payload.childAgeGroup)
        switchProfile(id)
      }
    }
    return nextGuardian
  }

  if (showLanding) {
    return (
      <LandingPage
        onGetStarted={() => { setShowLanding(false); setAuthEntryMode('setup') }}
        onSignIn={() => { setShowLanding(false); setAuthEntryMode('login') }}
        onTeacherSetup={() => { setShowLanding(false); setAuthEntryMode('teacher') }}
      />
    )
  }

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(160deg, #13052c 0%, #2d0a5e 55%, #071b39 100%)' }}>
        <p className="font-bubble text-white text-2xl">Loading...</p>
      </div>
    )
  }

  if (!guardian) {
    if (authEntryMode === 'login') {
      return (
        <>
          <SyncStatusBanner />
          <GuardianLogin
            onLogin={login}
            authError={authError}
            onForgot={sendPasswordReset}
            onResetPin={resetPin}
            onRegister={handleStartRegistration}
          />
        </>
      )
    }

    if (authEntryMode === 'teacher') {
      const handleTeacherComplete = async (payload) => {
        const schoolName = payload.schoolName || payload.schoolName2 || ''
        await registerTeacher({ ...payload, schoolName })
      }
      return (
        <>
          <SyncStatusBanner />
          <TeacherSetup
            onComplete={handleTeacherComplete}
            onBack={() => setAuthEntryMode('setup')}
            onLogin={() => setAuthEntryMode('login')}
          />
        </>
      )
    }

    return (
      <>
        <SyncStatusBanner />
        <GuardianSetup
          onComplete={handleGuardianComplete}
          authError={authError}
          onLogin={() => setAuthEntryMode('login')}
          onTeacherSetup={() => setAuthEntryMode('teacher')}
        />
      </>
    )
  }

  // Registered but not logged in → show login
  if (!isLoggedIn) {
    return (
      <>
        <SyncStatusBanner />
        <GuardianLogin
          guardianName={guardian.guardianName}
          guardianEmail={guardian.email}
          onLogin={login}
          authError={authError}
          onForgot={sendPasswordReset}
          onResetPin={resetPin}
          onRegister={handleStartRegistration}
        />
      </>
    )
  }

  // Classroom mode: show full class roster instead of age-group picker
  if (guardian?.classroomMode && !activeId && !showProfiles) {
    const handleClassroomSelectStudent = (id) => {
      const profile = profiles.find(p => p.id === id)
      if (profile) {
        setAgeGroup(profile.ageGroup || 'early')
        switchProfile(id)
      }
    }
    const handleClassroomAddStudent = () => {
      const defaultGroup = profiles[0]?.ageGroup || 'early'
      setAgeGroup(defaultGroup)
      setClassroomAddMode(true)
      setShowProfiles(true)
    }
    const handleClassroomBulkAdd = (entries) => {
      const defaultGroup = profiles[0]?.ageGroup || 'early'
      return createProfilesBulk(entries, defaultGroup, 30)
    }
    return (
      <>
        <SyncStatusBanner />
        <ClassroomDashboard
          profiles={profiles}
          guardian={guardian}
          onSelectStudent={handleClassroomSelectStudent}
          onAddStudent={handleClassroomAddStudent}
          onBulkAddStudents={handleClassroomBulkAdd}
          onUpdateGuardian={updateGuardian}
          onBack={() => updateGuardian({ classroomMode: false })}
          onLogout={handleLogout}
        />
      </>
    )
  }

  // Step 1: pick age group
  if (!ageGroup) {
    return (
      <>
        <SyncStatusBanner />
        <AgeGroupLanding
          onSelect={handleSelectAgeGroup}
          onLogout={handleLogout}
          profiles={profiles}
          adminMode={isAdmin}
          classroomMode={guardian?.classroomMode || false}
          onUpdateGuardian={isAdmin ? updateGuardian : undefined}
        />
      </>
    )
  }

  // Step 2: pick/create profile filtered to this age group
  if (showProfiles || !activeId) {
    const groupProfiles = profiles.filter(p => (p.ageGroup || 'early') === ageGroup)
    return (
      <>
        <SyncStatusBanner />
        <ProfileSelector
          profiles={groupProfiles}
          allProfilesCount={profiles.length}
          ageGroup={ageGroup}
          onSelect={handleSelectProfile}
          onCreateNew={handleCreateNew}
          onDelete={deleteProfile}
          onBack={handleBackToLanding}
          onLogout={handleLogout}
          autoCreate={classroomAddMode}
          maxProfiles={guardian?.classroomMode ? 30 : 2}
          classroomMode={!!guardian?.classroomMode}
        />
      </>
    )
  }

  // Step 3: fork to the right experience based on the active profile's age group
  const profileAgeGroup = activeProfile?.ageGroup || 'early'
  const handleSwitchProfiles = () => {
    if (guardian?.classroomMode) {
      classroomPinActionRef.current = () => {
        setShowProfiles(true)
        setAgeGroup(profileAgeGroup)
      }
      setClassroomPinInput('')
      setClassroomPinError(false)
      setClassroomPinGate(true)
    } else {
      setShowProfiles(true)
      setAgeGroup(profileAgeGroup)
    }
  }

  const classroomPinModal = (
    <ClassroomPinModal
      show={classroomPinGate}
      pinInput={classroomPinInput}
      pinError={classroomPinError}
      onDigit={handleClassroomPinDigit}
      onClose={handleClassroomPinClose}
    />
  )

  if (profileAgeGroup === 'junior') {
    const KS2AppWithProfile = React.lazy(() => import('./ks2/KS2App'))
    return (
      <>
        <React.Suspense fallback={<LoadingSpinner />}>
          <KS2AppWithProfile
            key={activeId}
            profileId={activeId}
            profileName={activeProfile?.name || 'Superstar'}
            profileAgeGroup={profileAgeGroup}
            parentPin={guardian.pin}
            onSwitchProfiles={handleSwitchProfiles}
            onUpdateProfile={(patch) => updateProfile(activeId, patch)}
            onLogout={handleLogout}
            guardianEmail={guardian.email || ''}
            onUpdateGuardian={isAdmin ? updateGuardian : undefined}
            classroomMode={guardian?.classroomMode || false}
            guardianId={guardian?.id || guardian?.email || ''}
            schoolId={guardian?.schoolId || ''}
            classId={guardian?.classId || ''}
            className={guardian?.className || ''}
          />
        </React.Suspense>
        {classroomPinModal}
        <InstallNudge profileName={activeProfile?.name} />
      </>
    )
  }

  if (profileAgeGroup === 'toddler') {
    const ToddlerAppWithProfile = React.lazy(() => import('./toddler/ToddlerApp'))
    return (
      <>
        <React.Suspense fallback={<LoadingSpinner />}>
          <ToddlerAppWithProfile
            key={activeId}
            profileId={activeId}
            profileName={activeProfile?.name || 'Superstar'}
            profileAgeGroup={profileAgeGroup}
            parentPin={guardian.pin}
            onSwitchProfiles={handleSwitchProfiles}
            onUpdateProfile={(patch) => updateProfile(activeId, patch)}
            onLogout={handleLogout}
            guardianEmail={guardian.email || ''}
            onUpdateGuardian={isAdmin ? updateGuardian : undefined}
            classroomMode={guardian?.classroomMode || false}
            guardianId={guardian?.id || guardian?.email || ''}
            schoolId={guardian?.schoolId || ''}
            classId={guardian?.classId || ''}
            className={guardian?.className || ''}
          />
        </React.Suspense>
        {classroomPinModal}
        <InstallNudge profileName={activeProfile?.name} />
      </>
    )
  }

  // Default: existing FS2 (4–6) app — completely untouched
  return (
    <>
      <AppWithProfile
        key={activeId}
        profileId={activeId}
        profileName={activeProfile?.name || 'Superstar'}
        profileAgeGroup={profileAgeGroup}
        parentPin={guardian.pin}
        onSwitchProfiles={handleSwitchProfiles}
        onQuickSwitch={handleSelectProfile}
        onUpdateProfile={(patch) => updateProfile(activeId, patch)}
        profiles={profiles}
        onLogout={handleLogout}
        guardianEmail={guardian.email || ''}
        onUpdateGuardian={isAdmin ? updateGuardian : undefined}
        classroomMode={guardian?.classroomMode || false}
        ageGroup={profileAgeGroup}
        guardianId={guardian?.id || guardian?.email || ''}
        schoolId={guardian?.schoolId || ''}
        classId={guardian?.classId || ''}
        className={guardian?.className || ''}
      />
      {classroomPinModal}
      <InstallNudge profileName={activeProfile?.name} />
    </>
  )
}
