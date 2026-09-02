import { formatLocalDate } from './date.js'
import { getFoundationDailyPath } from './foundationRecommendations.js'

export const STUDY_PATH_TARGET = 2

export const STUDY_MODULES = [
  { id: 'phonics', label: 'Sound Pop',    shortLabel: 'Phonics',  emoji: '🎤' },
  { id: 'math',    label: 'Number World', shortLabel: 'Maths',    emoji: '🔢' },
  { id: 'tricky',  label: 'Star Catch',   shortLabel: 'Words',    emoji: '⭐' },
  { id: 'story',   label: 'Story Room',   shortLabel: 'Stories',  emoji: '📖' },
  { id: 'shapes',  label: 'Shape World',  shortLabel: 'Shapes',   emoji: '🔷' },
  { id: 'logic',   label: 'Puzzle Quest', shortLabel: 'Puzzles',  emoji: '🧩' },
]

const STUDY_MODULE_IDS = new Set(STUDY_MODULES.map(module => module.id))

// Returns the two study-module IDs assigned for today.
// classroomLesson (string[]) overrides the date seed when set by a teacher.
// premium=false restricts the pool to the free-forever study modules.
export function getTodayAdventureModules(progress = {}, classroomLesson = null, premium = true) {
  const path = getFoundationDailyPath(progress, 'early', { classroomLesson, premium })
  const modules = path.modules.map(module => module.id)
  if (progress.dailyChallenge && modules.includes(progress.dailyChallenge)) {
    return [progress.dailyChallenge, ...modules.filter(id => id !== progress.dailyChallenge)].slice(0, 2)
  }
  return modules.slice(0, 2)
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

export function getTodayLearningSessions(progress = {}, now = Date.now(), premium = true) {
  const date = formatLocalDate(new Date(now))
  const assigned = getFoundationDailyPath(progress, 'early', { premium, date }).modules
  const assignedIds = new Set(assigned.map(module => module.id))
  const dayStart = startOfLocalDay(now)
  return (progress.sessions || []).filter(session =>
    assignedIds.has(session?.module) &&
    Number.isFinite(session?.date) &&
    session.date >= dayStart
  )
}

export function getArcadeUnlockStatus(progress = {}, now = Date.now(), premium = true) {
  const date = formatLocalDate(new Date(now))
  const assignedModules = getFoundationDailyPath(progress, 'early', { premium, date }).modules
  const todayLearningSessions = getTodayLearningSessions(progress, now, premium)
  const completedIds = [...new Set(todayLearningSessions.map(session => session.module))]
  const completedModules = assignedModules.filter(module => completedIds.includes(module.id))
  const remainingModules = assignedModules.filter(module => !completedIds.includes(module.id))
  const unlocked = completedIds.length >= STUDY_PATH_TARGET

  return {
    unlocked,
    target: STUDY_PATH_TARGET,
    completedCount: Math.min(completedIds.length, STUDY_PATH_TARGET),
    actualCompletedCount: completedIds.length,
    progressPercent: Math.round((Math.min(completedIds.length, STUDY_PATH_TARGET) / STUDY_PATH_TARGET) * 100),
    completedModules,
    remainingModules,
    assignedModules,
    nextModuleId: remainingModules[0]?.id || 'arcade',
  }
}
