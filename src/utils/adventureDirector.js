import { formatLocalDate } from './date.js'
import { getSkillJourney } from './adaptiveLearning.js'

export const ADVENTURE_DIRECTOR_VERSION = 1

export const ENDLESS_MODULES = {
  toddler: [
    { id: 'colours', label: 'Rainbow Garden', emoji: '🌈', skill: 'colours' },
    { id: 'numbers', label: 'Counting Falls', emoji: '🔢', skill: 'numbers' },
    { id: 'shapes', label: 'Shape River', emoji: '🔷', skill: 'shapes' },
    { id: 'animals', label: 'Animal Jungle', emoji: '🐘', skill: 'animals' },
    { id: 'fruits', label: 'Fruit Orchard', emoji: '🍎', skill: 'fruits' },
    { id: 'bodyparts', label: 'Wiggle Meadow', emoji: '👋', skill: 'bodyparts' },
    { id: 'alphabet', label: 'Letter Tree', emoji: '🔤', skill: 'alphabet' },
  ],
  early: [
    { id: 'phonics', label: 'Echo Jungle', emoji: '🎤', skill: 'phonics' },
    { id: 'math', label: 'Number Falls', emoji: '🔢', skill: 'math' },
    { id: 'tricky', label: 'Starry Caves', emoji: '⭐', skill: 'tricky' },
    { id: 'story', label: 'Story Tree', emoji: '📖', skill: 'story' },
    { id: 'shapes', label: 'Shape River', emoji: '🔷', skill: 'shapes' },
    { id: 'logic', label: 'Puzzle Pass', emoji: '🧩', skill: 'logic' },
    { id: 'science', label: 'Wonder Springs', emoji: '🔬', skill: 'science' },
    { id: 'worldgk', label: 'World Lookout', emoji: '🌍', skill: 'worldgk' },
    { id: 'davinci', label: 'Rainbow Mountain', emoji: '🎨', skill: 'davinci' },
  ],
  junior: [
    { id: 'timestables', label: 'Multiplier Mine', emoji: '✖️', skill: 'timestables' },
    { id: 'fractions', label: 'Fraction Falls', emoji: '🍕', skill: 'fractions' },
    { id: 'wordproblems', label: 'Problem Pass', emoji: '🧭', skill: 'wordproblems' },
    { id: 'reading', label: 'Story Ruins', emoji: '📚', skill: 'reading' },
    { id: 'spelling', label: 'Word Woods', emoji: '✍️', skill: 'spelling' },
    { id: 'grammar', label: 'Grammar Grove', emoji: '📝', skill: 'grammar' },
    { id: 'science', label: 'Discovery Springs', emoji: '🧪', skill: 'science' },
    { id: 'worldmap', label: 'Atlas Lookout', emoji: '🌍', skill: 'worldmap' },
    { id: 'spirituality', label: 'Wisdom Temple', emoji: '🕊️', skill: 'spirituality' },
  ],
}

const MISSION_TYPES = {
  toddler: [
    { id: 'find', title: 'Find a tiny treasure', instruction: 'Play four quick clues with your companion.' },
    { id: 'sparkle', title: 'Make the map sparkle', instruction: 'Finish a little game and light a new trail.' },
    { id: 'rescue', title: 'Help a map friend', instruction: 'Use what you know to help a friend get home.' },
  ],
  early: [
    { id: 'clue', title: 'Follow the surprise clue', instruction: 'Complete a fresh challenge chosen for you.' },
    { id: 'portal', title: 'Open a mystery portal', instruction: 'Use six smart answers to open the next trail.' },
    { id: 'rescue', title: 'Rescue a lost map star', instruction: 'Practise a growing skill and bring the star home.' },
    { id: 'discovery', title: 'Discover a secret place', instruction: 'Explore a different world from your recent games.' },
  ],
  junior: [
    { id: 'expedition', title: 'Begin a bonus expedition', instruction: 'Complete a focused challenge selected from your learning trail.' },
    { id: 'decode', title: 'Decode the hidden coordinates', instruction: 'Strengthen a developing skill to reveal the route.' },
    { id: 'investigate', title: 'Investigate a new signal', instruction: 'Take on eight adaptive questions with no daily limit.' },
    { id: 'recover', title: 'Recover a missing atlas page', instruction: 'Revisit a skill without repeating your most recent destination.' },
  ],
}

const SESSION_SIZE = { toddler: 4, early: 6, junior: 8 }

function hash(value = '') {
  let out = 2166136261
  for (const char of String(value)) { out ^= char.charCodeAt(0); out = Math.imul(out, 16777619) }
  return out >>> 0
}

export function normalizeAdventureDirector(value = {}) {
  const source = value && typeof value === 'object' ? value : {}
  return {
    version: ADVENTURE_DIRECTOR_VERSION,
    launched: source.launched && typeof source.launched === 'object' ? source.launched : null,
    runs: Array.isArray(source.runs) ? source.runs.filter(Boolean).slice(-120) : [],
  }
}

function modulePlayed(progress, moduleId) {
  return Math.max(0, Number(progress?.[moduleId]?.played) || 0)
}

function moduleLastPlayed(progress, moduleId) {
  const skillTime = Number(getSkillJourney(progress, moduleId).lastPlayedAt) || 0
  const sessionTime = [...(progress.sessions || [])].reverse().find(session => session.module === moduleId)?.date || 0
  return Math.max(skillTime, Number(sessionTime) || 0)
}

export function getNeverFinishedAdventure(progress = {}, ageGroup = 'early', now = Date.now()) {
  const age = ENDLESS_MODULES[ageGroup] ? ageGroup : 'early'
  const state = normalizeAdventureDirector(progress.adventureDirector)
  const candidates = ENDLESS_MODULES[age]
  const recent = state.runs.slice(-3).map(run => run.moduleId)
  const runNumber = state.runs.length + 1
  const seed = hash(`${formatLocalDate(new Date(now))}:${age}:${runNumber}`)

  const ranked = candidates.map((module, index) => {
    const skill = getSkillJourney(progress, module.skill)
    const mastery = Math.max(0, Number(skill.mastery) || 0)
    const played = modulePlayed(progress, module.id)
    const recentIndex = recent.lastIndexOf(module.id)
    const recencyPenalty = recentIndex < 0 ? 0 : 1000 + (recentIndex + 1) * 100
    const variety = hash(`${seed}:${module.id}:${index}`) % 41
    return { module, score: recencyPenalty + mastery * 2 + played * 3 + variety, lastPlayedAt: moduleLastPlayed(progress, module.id), mastery }
  }).sort((a, b) => a.score - b.score || a.lastPlayedAt - b.lastPlayedAt)

  const picked = ranked[0] || { module: candidates[0], mastery: 0 }
  const types = MISSION_TYPES[age]
  const mission = types[(seed + runNumber) % types.length]
  const difficulty = getSkillJourney(progress, picked.module.skill).difficulty || 1
  const difficultyLabel = difficulty <= 2 ? 'Confidence builder' : difficulty <= 5 ? 'Growing challenge' : difficulty <= 8 ? 'Explorer challenge' : 'Master challenge'

  return {
    id: `${formatLocalDate(new Date(now))}:${age}:${runNumber}:${picked.module.id}`,
    ageGroup: age,
    module: picked.module,
    mission,
    runNumber,
    sessionSize: SESSION_SIZE[age],
    difficulty,
    difficultyLabel,
    mastery: picked.mastery,
    recentAvoided: recent,
    contentSeed: seed,
  }
}

export function launchNeverFinishedAdventure(progress = {}, adventure, now = Date.now()) {
  if (!adventure?.module?.id) return progress
  const state = normalizeAdventureDirector(progress.adventureDirector)
  return {
    ...progress,
    adventureDirector: {
      ...state,
      launched: {
        id: adventure.id,
        moduleId: adventure.module.id,
        at: now,
        date: formatLocalDate(new Date(now)),
        played: modulePlayed(progress, adventure.module.id),
        contentSeed: adventure.contentSeed,
        difficulty: adventure.difficulty,
        sessionSize: adventure.sessionSize,
      },
    },
  }
}

export function settleNeverFinishedAdventure(progress = {}, now = Date.now()) {
  const state = normalizeAdventureDirector(progress.adventureDirector)
  const launched = state.launched
  if (!launched?.moduleId) return progress
  const sessionDone = (progress.sessions || []).some(session => session.module === launched.moduleId && Number(session.date) >= Number(launched.at))
  const playDone = modulePlayed(progress, launched.moduleId) > (Number(launched.played) || 0)
  if (!sessionDone && !playDone) return progress
  const alreadyRecorded = state.runs.some(run => run.id === launched.id)
  const run = { ...launched, completedAt: now }
  return {
    ...progress,
    adventureDirector: {
      ...state,
      launched: null,
      runs: alreadyRecorded ? state.runs : [...state.runs, run].slice(-120),
    },
  }
}

export function mergeAdventureDirector(localValue = {}, cloudValue = {}) {
  const local = normalizeAdventureDirector(localValue)
  const cloud = normalizeAdventureDirector(cloudValue)
  const seen = new Set()
  const runs = []
  for (const run of [...cloud.runs, ...local.runs]) {
    const key = run?.id || `${run?.moduleId}:${run?.completedAt || run?.at || 0}`
    if (!key || seen.has(key)) continue
    seen.add(key); runs.push(run)
  }
  runs.sort((a, b) => (a.completedAt || a.at || 0) - (b.completedAt || b.at || 0))
  const launchedOptions = [local.launched, cloud.launched].filter(Boolean).filter(item => !seen.has(item.id))
  const launched = launchedOptions.sort((a, b) => (b.at || 0) - (a.at || 0))[0] || null
  return { version: ADVENTURE_DIRECTOR_VERSION, launched, runs: runs.slice(-120) }
}
