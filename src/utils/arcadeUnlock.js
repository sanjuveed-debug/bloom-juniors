import { formatLocalDate } from './date.js'

export const STUDY_PATH_TARGET = 2

export const STUDY_MODULES = [
  { id: 'phonics', label: 'Sound Pop', shortLabel: 'Phonics', emoji: '🎤' },
  { id: 'math', label: 'Number World', shortLabel: 'Maths', emoji: '🔢' },
  { id: 'tricky', label: 'Star Catch', shortLabel: 'Words', emoji: '⭐' },
  { id: 'story', label: 'Story Room', shortLabel: 'Stories', emoji: '📖' },
]

const STUDY_MODULE_IDS = new Set(STUDY_MODULES.map(module => module.id))

// Returns the two study-module IDs assigned for today (fixed by date seed).
export function getTodayAdventureModules(progress = {}) {
  const dateStr = formatLocalDate()
  let seed = dateStr.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 1)
  const pool = [...STUDY_MODULES]
  for (let i = pool.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0
    const j = seed % (i + 1)
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  const preferred = progress.dailyChallenge
  if (preferred) {
    const idx = pool.findIndex(m => m.id === preferred)
    if (idx > 0) { ;[pool[0], pool[idx]] = [pool[idx], pool[0]] }
  }
  return [pool[0].id, pool[1].id]
}

function startOfLocalDay(now = Date.now()) {
  const date = new Date(now)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

export function getTodayStudySessions(sessions = [], now = Date.now()) {
  const dayStart = startOfLocalDay(now)

  return sessions.filter(session =>
    STUDY_MODULE_IDS.has(session?.module) &&
    Number.isFinite(session?.date) &&
    session.date >= dayStart
  )
}

export function getArcadeUnlockStatus(progress = {}, now = Date.now()) {
  const todayStudySessions = getTodayStudySessions(progress.sessions || [], now)
  const completedIds = [...new Set(todayStudySessions.map(session => session.module))]
  const completedModules = STUDY_MODULES.filter(module => completedIds.includes(module.id))
  const remainingModules = STUDY_MODULES.filter(module => !completedIds.includes(module.id))
  const unlocked = completedIds.length >= STUDY_PATH_TARGET

  return {
    unlocked,
    target: STUDY_PATH_TARGET,
    completedCount: Math.min(completedIds.length, STUDY_PATH_TARGET),
    actualCompletedCount: completedIds.length,
    progressPercent: Math.round((Math.min(completedIds.length, STUDY_PATH_TARGET) / STUDY_PATH_TARGET) * 100),
    completedModules,
    remainingModules,
    nextModuleId: remainingModules[0]?.id || 'arcade',
  }
}
