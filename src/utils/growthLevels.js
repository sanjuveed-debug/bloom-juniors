import { getToddlerLevel } from './seededRandom'

// Generic "played count" growth level shared by modules without a richer signal.
// Mirrors the toddler thresholds: <3 plays = level 1, <6 = level 2, 6+ = level 3.
const PLAYED_MAX = 3
export function getPlayedLevel(played = 0) {
  return getToddlerLevel(played)
}

// Maths (NumberWorld) — difficulty grows per operation as it's practised
// (mirrors NumberWorld's getOpDifficulty thresholds: 6+ plays = level 3, 3+ = level 2, else 1)
function getMathGrowth(progress) {
  const opPlayed = progress?.math?.opPlayed || {}
  const plays = Object.values(opPlayed)
  if (!plays.length) return { level: 1, maxLevel: 3 }
  const avg = plays.reduce((sum, p) => sum + (p >= 6 ? 3 : p >= 3 ? 2 : 1), 0) / plays.length
  return { level: Math.round(avg), maxLevel: 3 }
}

// Phonics (SoundPop) — RWI sound sets unlock with sessionsPlayed
// (mirrors SoundPop's getSoundSetLevel thresholds)
function getPhonicsGrowth(progress) {
  const sessionsPlayed = progress?.phonics?.sessionsPlayed || 0
  const level = sessionsPlayed >= 8 ? 4 : sessionsPlayed >= 5 ? 3 : sessionsPlayed >= 3 ? 2 : 1
  return { level, maxLevel: 4 }
}

// Tricky words (StarCatch) — RWI red word sets unlock with sessionsPlayed
// (mirrors StarCatch's getWordSetLevel thresholds)
function getTrickyGrowth(progress) {
  const sessionsPlayed = progress?.tricky?.sessionsPlayed || 0
  const level = sessionsPlayed >= 6 ? 4 : sessionsPlayed >= 4 ? 3 : sessionsPlayed >= 2 ? 2 : 1
  return { level, maxLevel: 4 }
}

// Logic (DirectionalPuzzle) — 12 explicit hand-built levels
function getLogicGrowth(progress) {
  const maxLevel = progress?.logic?.maxLevel || 0
  return { level: Math.min(maxLevel + 1, 12), maxLevel: 12 }
}

const GROWTH_BY_MODULE = {
  math: getMathGrowth,
  phonics: getPhonicsGrowth,
  tricky: getTrickyGrowth,
  logic: getLogicGrowth,
}

// Modules where a "growth level" isn't a meaningful concept
const NO_GROWTH_MODULES = new Set(['shop', 'story'])

// Returns { level, maxLevel } for a module, or null if growth isn't tracked for it
export function getModuleGrowth(moduleId, progress) {
  if (NO_GROWTH_MODULES.has(moduleId)) return null
  const fn = GROWTH_BY_MODULE[moduleId]
  if (fn) return fn(progress)
  const played = progress?.[moduleId]?.played || 0
  return { level: getPlayedLevel(played), maxLevel: PLAYED_MAX }
}

// Small emoji that grows with the level/maxLevel ratio — a quick visual for parents
export function growthEmoji(level, maxLevel) {
  const ratio = maxLevel > 0 ? level / maxLevel : 0
  if (ratio >= 1) return '🌳'
  if (ratio >= 0.5) return '🌿'
  return '🌱'
}
