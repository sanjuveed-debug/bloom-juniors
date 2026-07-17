import { useState, useCallback, useEffect, useRef } from 'react'
import { isSupabaseConfigured } from '../lib/supabase.js'
import { loadCloudProgress, mergeProgress, saveCloudProgress } from '../services/cloudStore.js'
import { formatLocalDate, formatYesterdayLocalDate } from '../utils/date.js'
import { reportSyncError, reportSyncSuccess } from '../utils/syncStatus.js'
import { normalizeWonderWorld } from '../utils/wonderWorld.js'
import { normalizeCompanionPowers } from '../utils/companionPowers.js'
import { normalizeAdventureDirector } from '../utils/adventureDirector.js'
import { normalizeDreamProject } from '../utils/dreamProject.js'
import { normalizeChildInterest } from '../utils/childInterest.js'

function getStorageKey(profileId) {
  if (profileId) return `eduapp_progress_${profileId}`
  return 'yaagvi_progress_v1'
}

function getOutboxKey(profileId) { return `eduapp_sync_outbox_${profileId}` }
function loadOutbox(profileId) {
  try { return JSON.parse(localStorage.getItem(getOutboxKey(profileId)) || 'null') } catch { return null }
}
function saveOutbox(profileId, data) {
  try { localStorage.setItem(getOutboxKey(profileId), JSON.stringify(data)) } catch {}
}
function clearOutbox(profileId) {
  try { localStorage.removeItem(getOutboxKey(profileId)) } catch {}
}

// ── Daily challenge pool ─────────────────────────────────────────────────────
const CHALLENGE_POOL = [
  { type: 'stars',    module: 'phonics', target: 5,  label: 'Earn 5 stars in Sound Pop', emoji: '🎤', reward: '⭐' },
  { type: 'stars',    module: 'math',    target: 5,  label: 'Earn 5 stars in Maths',     emoji: '🔢', reward: '🌟' },
  { type: 'stars',    module: 'tricky',  target: 4,  label: 'Catch 4 tricky words',      emoji: '⭐', reward: '🦄' },
  { type: 'stars',    module: 'story',   target: 3,  label: 'Read a full story',          emoji: '📖', reward: '🌈' },
  { type: 'stars',    module: 'logic',   target: 2,  label: 'Solve a puzzle',             emoji: '🧩', reward: '🏆' },
  { type: 'stars',    module: 'shop',    target: 3,  label: 'Go on a shopping trip',      emoji: '🛍️', reward: '👑' },
  { type: 'play',     module: null,      target: 2,  label: 'Play 2 different games',     emoji: '🎮', reward: '🎉' },
  { type: 'play',     module: null,      target: 3,  label: 'Play 3 different games',     emoji: '🎯', reward: '🌸' },
  { type: 'accuracy', module: 'phonics', target: 70, label: 'Score 70%+ in Sound Pop',   emoji: '🎤', reward: '💎' },
  { type: 'accuracy', module: 'math',    target: 80, label: 'Score 80%+ in Maths',       emoji: '🔢', reward: '💎' },
  { type: 'accuracy', module: 'tricky',  target: 75, label: 'Score 75%+ in Star Catch',  emoji: '⭐', reward: '🌟' },
]

function todayStr() {
  return formatLocalDate()
}

function pickChallenges(dateStr) {
  let seed = dateStr.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 1)
  const pool = [...CHALLENGE_POOL]
  for (let i = pool.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0
    const j = seed % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, 3).map((c, idx) => ({
    ...c,
    id: `${dateStr}-${idx}`,
    progress: 0,
    completed: false,
  }))
}

// ── Default progress ─────────────────────────────────────────────────────────
export const defaultProgress = {
  avatar: null,
  stars: 0,
  stickers: [],
  phonics: { score: 0, level: 1, played: 0, correct: 0 },
  math: { score: 0, level: 1, played: 0, correct: 0 },
  tricky: { score: 0, level: 1, played: 0, correct: 0 },
  story: { booksRead: 0, lastBook: null, lastStoryId: null, storyStats: {} },
  arcade: { score: 0, level: 1, played: 0, correct: 0 },
  logic: { score: 0, level: 1, played: 0, maxLevel: 0 },
  shop: { coins: 20, purchases: [] },
  shapes: { score: 0, level: 1, played: 0, correct: 0 },
  davinci: { score: 0, level: 1, played: 0 },
  anatomy: { score: 0, level: 1, played: 0 },
  science: { score: 0, level: 1, played: 0 },
  worldgk: { score: 0, level: 1, played: 0 },
  exercise:{ score: 0, level: 1, played: 0 },
  planets: { score: 0, level: 1, played: 0 },
  dailyChallenge: null,
  challengeCompleted: false,
  lastVisit: null,
  totalStars: 0,
  sessions: [],
  struggles: {},
  autoChallenge: { date: '', challenges: [] },
  challengeStreak: 0,
  lastChallengeDate: '',
  sessionMinutes: 30,
  loginStreak: 0,
  lastLoginDate: '',
  wonderWorld: normalizeWonderWorld(),
  companionPowers: normalizeCompanionPowers(),
  adventureDirector: normalizeAdventureDirector(),
  dreamProject: normalizeDreamProject(),
  childInterest: normalizeChildInterest(),
  treasureCollection: { items: [], claims: {}, equipped: {}, history: [], eggHatches: [], sparkleDust: 0, claimStreak: 0, lastClaimDate: '', roomLayout: {}, roomLayoutUpdatedAt: 0, treasureInteractions: {}, secretGames: {} },
}

export function hydrateProgressData(parsed = {}) {
  const source = parsed && typeof parsed === 'object' ? parsed : {}
  const { gk: legacyWorldGk, ...rest } = source

  return {
    ...defaultProgress,
    ...rest,
    stickers: Array.isArray(source.stickers) ? source.stickers : [],
    phonics: { ...defaultProgress.phonics, ...(source.phonics || {}) },
    math: { ...defaultProgress.math, ...(source.math || {}) },
    tricky: { ...defaultProgress.tricky, ...(source.tricky || {}) },
    story: { ...defaultProgress.story, ...(source.story || {}) },
    arcade: { ...defaultProgress.arcade, ...(source.arcade || {}) },
    logic: { ...defaultProgress.logic, ...(source.logic || {}) },
    shop: { ...defaultProgress.shop, ...(source.shop || {}) },
    shapes: { ...defaultProgress.shapes, ...(source.shapes || {}) },
    davinci: { ...defaultProgress.davinci, ...(source.davinci || {}) },
    anatomy: { ...defaultProgress.anatomy, ...(source.anatomy || {}) },
    science: { ...defaultProgress.science, ...(source.science || {}) },
    worldgk: {
      ...defaultProgress.worldgk,
      ...(source.worldgk || legacyWorldGk || {}),
    },
    exercise: { ...defaultProgress.exercise, ...(source.exercise || {}) },
    planets: { ...defaultProgress.planets, ...(source.planets || {}) },
    sessions: Array.isArray(source.sessions) ? source.sessions : [],
    struggles: source.struggles && typeof source.struggles === 'object' ? source.struggles : {},
    autoChallenge: source.autoChallenge || { date: '', challenges: [] },
    wonderWorld: normalizeWonderWorld(source.wonderWorld),
    companionPowers: normalizeCompanionPowers(source.companionPowers),
    adventureDirector: normalizeAdventureDirector(source.adventureDirector),
    dreamProject: normalizeDreamProject(source.dreamProject),
    childInterest: normalizeChildInterest(source.childInterest),
    treasureCollection: {
      ...defaultProgress.treasureCollection,
      ...(source.treasureCollection || {}),
      items: Array.isArray(source.treasureCollection?.items) ? source.treasureCollection.items : [],
      claims: source.treasureCollection?.claims || {},
      equipped: source.treasureCollection?.equipped || {},
      history: Array.isArray(source.treasureCollection?.history) ? source.treasureCollection.history : [],
      eggHatches: Array.isArray(source.treasureCollection?.eggHatches) ? source.treasureCollection.eggHatches : [],
      roomLayout: source.treasureCollection?.roomLayout || {},
      treasureInteractions: source.treasureCollection?.treasureInteractions || {},
      secretGames: source.treasureCollection?.secretGames || {},
    },
  }
}

function loadForProfile(profileId) {
  try {
    const key = getStorageKey(profileId)
    const raw = localStorage.getItem(key)
    if (!raw) return hydrateProgressData()
    return hydrateProgressData(JSON.parse(raw))
  } catch { return hydrateProgressData() }
}

function loadStoredForProfile(profileId) {
  try {
    const raw = localStorage.getItem(getStorageKey(profileId))
    return raw ? hydrateProgressData(JSON.parse(raw)) : null
  } catch { return null }
}

function saveForProfile(profileId, data) {
  try { localStorage.setItem(getStorageKey(profileId), JSON.stringify(data)) } catch {}
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useProgress(profileId) {
  const initialLocalRef = useRef(undefined)
  if (initialLocalRef.current === undefined) initialLocalRef.current = loadStoredForProfile(profileId)
  const [progress, setProgress] = useState(() => initialLocalRef.current || hydrateProgressData())
  const syncTimerRef      = useRef(null)
  const pendingSyncRef    = useRef(null)   // latest data waiting to be flushed
  const hydratedRef       = useRef(!isSupabaseConfigured || !profileId)
  const queuedUpdatesRef  = useRef([])

  // Cancel any pending cloud sync on unmount so it doesn't fire into the void
  useEffect(() => () => clearTimeout(syncTimerRef.current), [])

  // Flush pending sync immediately on pagehide / beforeunload so progress
  // isn't lost when the user closes the tab before the 2s debounce fires.
  // Local storage is always current; this closes the cloud-lag window.
  useEffect(() => {
    if (!isSupabaseConfigured || !profileId) return
    const flush = () => {
      if (!hydratedRef.current || !pendingSyncRef.current) return
      clearTimeout(syncTimerRef.current)
      syncTimerRef.current = null
      const data = pendingSyncRef.current
      pendingSyncRef.current = null
      saveCloudProgress(profileId, data).catch(() => {})
    }
    window.addEventListener('pagehide', flush)
    window.addEventListener('beforeunload', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      window.removeEventListener('beforeunload', flush)
    }
  }, [profileId])

  // Debounced cloud sync: waits 2s after last update, retries 3× before persisting to outbox
  const scheduleSync = useCallback((data) => {
    if (!isSupabaseConfigured || !profileId || !hydratedRef.current) return
    pendingSyncRef.current = data
    clearTimeout(syncTimerRef.current)
    syncTimerRef.current = setTimeout(async () => {
      pendingSyncRef.current = null
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await saveCloudProgress(profileId, data)
          reportSyncSuccess()
          clearOutbox(profileId)
          return
        } catch {
          if (attempt < 2) await new Promise(r => setTimeout(r, 1500))
        }
      }
      // All retries exhausted — persist to local outbox so it is not lost permanently
      saveOutbox(profileId, data)
      reportSyncError()
    }, 2000)
  }, [profileId])

  useEffect(() => {
    if (!isSupabaseConfigured || !profileId) return
    let active = true

    // Drain any payload that failed all retries in a previous session
    const outbox = loadOutbox(profileId)

    async function hydrateFromCloudFirst() {
      let cloudProgress = null
      let cloudReadSucceeded = false
      try {
        cloudProgress = await loadCloudProgress(profileId)
        cloudReadSucceeded = true
      } catch {
        reportSyncError()
      }
      if (!active) return

      const storedLocal = initialLocalRef.current
      let reconciled = cloudProgress
        ? (storedLocal ? mergeProgress(storedLocal, cloudProgress) : cloudProgress)
        : (storedLocal || hydrateProgressData())
      if (outbox) reconciled = mergeProgress(outbox, reconciled)
      reconciled = hydrateProgressData(reconciled)

      const queued = queuedUpdatesRef.current.splice(0)
      for (const updater of queued) {
        const patch = typeof updater === 'function'
          ? updater(reconciled)
          : { ...reconciled, ...updater }
        reconciled = {
          ...patch,
          updatedAt: Date.now(),
          revision: (reconciled.revision || 0) + 1,
        }
      }

      saveForProfile(profileId, reconciled)
      hydratedRef.current = true
      setProgress(reconciled)

      if (cloudReadSucceeded && (storedLocal || outbox || queued.length || !cloudProgress)) {
        scheduleSync(reconciled)
      }
    }

    hydrateFromCloudFirst()
    return () => { active = false }
  }, [profileId, scheduleSync])

  const update = useCallback((updater) => {
    if (!hydratedRef.current && isSupabaseConfigured && profileId) {
      queuedUpdatesRef.current.push(updater)
      return
    }
    setProgress(prev => {
      const patch = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      const next = {
        ...patch,
        updatedAt: Date.now(),
        revision: (prev.revision || 0) + 1,
      }
      saveForProfile(profileId, next)
      scheduleSync(next)
      return next
    })
  }, [profileId, scheduleSync])

  const ensureDailyChallenges = useCallback(() => {
    update(prev => {
      const today = todayStr()
      if (prev.autoChallenge?.date === today) return prev
      return { ...prev, autoChallenge: { date: today, challenges: pickChallenges(today) } }
    })
  }, [update])

  const tickChallenge = useCallback((sessionData) => {
    update(prev => {
      const today = todayStr()
      const ac = prev.autoChallenge
      if (!ac?.challenges?.length || ac.date !== today) return prev

      const midnight = new Date(); midnight.setHours(0, 0, 0, 0)
      const todaySessions = (prev.sessions || []).filter(s => s.date >= midnight.getTime())
      const uniqueModules = new Set([...todaySessions.map(s => s.module), sessionData.module])

      let anyNewlyCompleted = false
      const updated = ac.challenges.map(c => {
        if (c.completed) return c
        let newProgress = c.progress

        if (c.type === 'stars' && c.module === sessionData.module) {
          newProgress = c.progress + (sessionData.stars || 0)
        } else if (c.type === 'accuracy' && c.module === sessionData.module) {
          if ((sessionData.accuracy || 0) >= c.target) newProgress = c.target
        } else if (c.type === 'play') {
          newProgress = uniqueModules.size
        }

        const completed = newProgress >= c.target
        if (completed && !c.completed) anyNewlyCompleted = true
        return { ...c, progress: Math.min(c.target, newProgress), completed }
      })

      let stickers = prev.stickers || []
      if (anyNewlyCompleted) {
        updated.forEach(c => {
          if (c.completed && !ac.challenges.find(old => old.id === c.id)?.completed) {
            stickers = [...stickers, { type: 'challenge', emoji: c.reward, date: Date.now() }]
          }
        })
      }

      const allDone = updated.every(c => c.completed)
      let streak = prev.challengeStreak || 0
      let lastChallengeDate = prev.lastChallengeDate || ''
      if (allDone && lastChallengeDate !== today) {
        const yStr = formatYesterdayLocalDate()
        streak = lastChallengeDate === yStr ? streak + 1 : 1
        lastChallengeDate = today
      }

      return {
        ...prev,
        autoChallenge: { date: today, challenges: updated },
        stickers,
        challengeStreak: streak,
        lastChallengeDate,
      }
    })
  }, [update])

  const addStars = useCallback((module, count) => {
    update(prev => ({
      ...prev,
      stars: prev.stars + count,
      totalStars: (prev.totalStars || 0) + count,
      [module]: { ...prev[module], score: (prev[module]?.score || 0) + count, lastPlayedDate: todayStr() }
    }))
  }, [update])

  const logSession = useCallback((data) => {
    update(prev => {
      const session = { ...data, date: data.date || Date.now() }
      const sessions = [...(prev.sessions || []), session].slice(-50)

      const struggles = { ...prev.struggles }
      if (data.struggles?.length) {
        const existing = struggles[data.module] || []
        const merged = [...existing]
        data.struggles.forEach(item => {
          const idx = merged.findIndex(e => e.item === item)
          if (idx >= 0) merged[idx] = { ...merged[idx], count: merged[idx].count + 1 }
          else merged.push({ item, count: 1 })
        })
        struggles[data.module] = merged.sort((a, b) => b.count - a.count).slice(0, 20)
      }

      return { ...prev, sessions, struggles }
    })
  }, [update])

  const setAvatar = useCallback((avatar) => {
    update(prev => ({ ...prev, avatar }))
  }, [update])

  const addSticker = useCallback((sticker) => {
    update(prev => ({
      ...prev,
      stickers: [...(prev.stickers || []), { ...sticker, date: Date.now() }]
    }))
  }, [update])

  const setDailyChallenge = useCallback((challenge) => {
    update(prev => ({ ...prev, dailyChallenge: challenge, challengeCompleted: false }))
  }, [update])

  const completeChallenge = useCallback(() => {
    update(prev => ({
      ...prev,
      challengeCompleted: true,
      stickers: [...(prev.stickers || []), { type: 'challenge', emoji: '🏆', date: Date.now() }]
    }))
  }, [update])

  const resetProgress = useCallback(() => {
    const fresh = hydrateProgressData()
    saveForProfile(profileId, fresh)
    setProgress(fresh)
  }, [profileId])

  return {
    progress, update,
    addStars, logSession, tickChallenge, ensureDailyChallenges,
    setAvatar, addSticker, setDailyChallenge, completeChallenge, resetProgress,
  }
}
