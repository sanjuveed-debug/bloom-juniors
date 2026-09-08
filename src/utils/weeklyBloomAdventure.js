import { formatLocalDate } from './date.js'

export const WEEKLY_BLOOM_ADVENTURE_VERSION = 1

const sharedChoices = {
  trail: {
    prompt: 'Which trail should Yaagvi follow?',
    options: [
      { id: 'sun', label: 'Sun trail', emoji: '☀️' },
      { id: 'moon', label: 'Moon trail', emoji: '🌙' },
    ],
  },
  power: {
    prompt: 'What should power the Bloom Beacon?',
    options: [
      { id: 'crystal', label: 'Moon crystal', emoji: '💎' },
      { id: 'garden', label: 'Sky garden', emoji: '🌱' },
    ],
  },
}

export const WEEKLY_BLOOM_ADVENTURES = {
  toddler: {
    id: 'little-bloom-beacon',
    title: 'Yaagvi and the Sleepy Bloom',
    intro: 'A sleepy flower has lost seven sparkles. One tiny adventure wakes a new sparkle each day.',
    artifact: { name: 'Rainbow Bloom', emoji: '🌈', message: 'You woke the Rainbow Bloom and gave every little friend a bright place to play.' },
    chapters: [
      { title: 'The Letter Spark', module: { id: 'alphabet', label: 'Letter Tree', emoji: '🔤' }, story: 'Find the first sound hiding in the leaves.', restored: 'The first petal began to glow.' },
      { title: 'The Stepping Stones', module: { id: 'numbers', label: 'Counting Falls', emoji: '🔢' }, story: 'Count a safe path across the sleepy stream.', restored: 'A trail of golden stones appeared.', choice: sharedChoices.trail },
      { title: 'The Lost Little Friend', module: { id: 'animals', label: 'Animal Jungle', emoji: '🐘' }, story: 'Help Yaagvi find the friend who knows the next clue.', restored: 'The animals sang the Bloom song.' },
      { title: 'The Shape Bridge', module: { id: 'shapes', label: 'Shape River', emoji: '🔷' }, story: 'Build a bridge from circles, squares and triangles.', restored: 'A bright bridge reached the next petal.' },
      { title: 'The Rainbow Drop', module: { id: 'colours', label: 'Rainbow Garden', emoji: '🌈' }, story: 'Collect the colours that the flower remembers.', restored: 'Colour rushed back into the garden.', choice: sharedChoices.power },
      { title: 'The Wiggle Wake-Up', module: { id: 'bodyparts', label: 'Wiggle Meadow', emoji: '👋' }, story: 'Move, point and wake the last sleepy leaves.', restored: 'Every leaf danced in the breeze.' },
      { title: 'The Bloom Picnic', module: { id: 'fruits', label: 'Fruit Orchard', emoji: '🍎' }, story: 'Prepare a colourful picnic for every friend.', restored: 'The Rainbow Bloom opened at last.' },
    ],
  },
  early: {
    id: 'bloom-beacon',
    title: 'The Secret of the Bloom Beacon',
    intro: 'The Bloom Beacon has gone dark. Restore one piece of its light each day and reveal the world it protects.',
    artifact: { name: 'Bloom Beacon', emoji: '🌟', message: 'You restored the Bloom Beacon. Its light now remembers every brave choice you made.' },
    chapters: [
      { title: 'The Lost Sound', module: { id: 'phonics', label: 'Echo Jungle', emoji: '🎤' }, story: 'Follow a missing sound through Echo Jungle.', restored: 'The beacon remembered its voice.' },
      { title: 'The Number Gate', module: { id: 'math', label: 'Number Falls', emoji: '🔢' }, story: 'Open the gate by finding its number pattern.', restored: 'The first tower light flickered on.', choice: sharedChoices.trail },
      { title: 'The Story Leaf', module: { id: 'story', label: 'Story Tree', emoji: '📖' }, story: 'Read the leaf that remembers why the beacon was built.', restored: 'The map revealed a hidden garden.' },
      { title: 'The Shape Bridge', module: { id: 'shapes', label: 'Shape River', emoji: '🔷' }, story: 'Repair the bridge leading to the beacon tower.', restored: 'Yaagvi reached the other side.' },
      { title: 'The Wonder Spring', module: { id: 'science', label: 'Wonder Springs', emoji: '🔬' }, story: 'Discover what makes the beacon crystal glow.', restored: 'The crystal began to hum.', choice: sharedChoices.power },
      { title: 'The Puzzle Path', module: { id: 'logic', label: 'Puzzle Pass', emoji: '🧩' }, story: 'Plan the final route through the moving maze.', restored: 'The tower doors opened.' },
      { title: 'The Rainbow Workshop', module: { id: 'davinci', label: 'Rainbow Mountain', emoji: '🎨' }, story: 'Create the final colour that brings the beacon home.', restored: 'The Bloom Beacon lit the whole sky.' },
    ],
  },
  junior: {
    id: 'beacon-expedition',
    title: 'Operation Bloom Beacon',
    intro: 'A signal from the lost Bloom Beacon has reached headquarters. Recover one coordinate each day.',
    artifact: { name: 'World Beacon', emoji: '🛰️', message: 'Mission complete. Your World Beacon now guides every future Bloom expedition.' },
    chapters: [
      { title: 'Decode the Signal', module: { id: 'reading', label: 'Story Ruins', emoji: '📚' }, story: 'Read the intercepted message and identify its hidden clue.', restored: 'The first coordinate appeared.' },
      { title: 'Break the Number Lock', module: { id: 'timestables', label: 'Multiplier Mine', emoji: '✖️' }, story: 'Use multiplication patterns to open the expedition case.', restored: 'The navigation device powered up.', choice: sharedChoices.trail },
      { title: 'Test the Crystal', module: { id: 'science', label: 'Discovery Springs', emoji: '🧪' }, story: 'Investigate the energy inside the recovered crystal.', restored: 'The signal became strong enough to follow.' },
      { title: 'Repair the Message', module: { id: 'spelling', label: 'Word Woods', emoji: '✍️' }, story: 'Restore the damaged words before the clue disappears.', restored: 'The full warning became readable.' },
      { title: 'Cross Fraction Falls', module: { id: 'fractions', label: 'Fraction Falls', emoji: '🍕' }, story: 'Balance the bridge using equivalent fractions.', restored: 'The expedition crossed into the hidden valley.', choice: sharedChoices.power },
      { title: 'Map the Final Route', module: { id: 'worldmap', label: 'Atlas Lookout', emoji: '🌍' }, story: 'Use the atlas coordinates to locate the lost tower.', restored: 'The Bloom Beacon appeared on the horizon.' },
      { title: 'Activate the Beacon', module: { id: 'grammar', label: 'Grammar Grove', emoji: '📝' }, story: 'Complete the activation message and transmit it clearly.', restored: 'The World Beacon answered headquarters.' },
    ],
  },
}

function clampChapter(value, total) {
  return Math.max(0, Math.min(total, Math.round(Number(value) || 0)))
}

function normalizeHistory(value, total) {
  if (!Array.isArray(value)) return []
  const seen = new Set()
  return value.filter(entry => {
    const chapter = Number(entry?.chapter)
    if (!Number.isInteger(chapter) || chapter < 0 || chapter >= total || seen.has(chapter)) return false
    seen.add(chapter)
    return true
  }).sort((a, b) => a.chapter - b.chapter)
}

export function normalizeWeeklyBloomAdventure(value = {}, ageGroup = 'early') {
  const age = WEEKLY_BLOOM_ADVENTURES[ageGroup] ? ageGroup : 'early'
  const adventure = WEEKLY_BLOOM_ADVENTURES[age]
  const source = value && typeof value === 'object' ? value : {}
  const compatible = !source.adventureId || source.adventureId === adventure.id
  const saved = compatible ? source : {}
  const chapter = clampChapter(saved.chapter, adventure.chapters.length)
  const active = saved.active && Number(saved.active.chapter) === chapter
    ? {
        chapter,
        moduleId: String(saved.active.moduleId || ''),
        startedAt: Math.max(0, Number(saved.active.startedAt) || 0),
        date: String(saved.active.date || ''),
      }
    : null

  return {
    version: WEEKLY_BLOOM_ADVENTURE_VERSION,
    adventureId: adventure.id,
    ageGroup: age,
    chapter,
    active: active?.moduleId && active.startedAt ? active : null,
    choices: saved.choices && typeof saved.choices === 'object' ? saved.choices : {},
    history: normalizeHistory(saved.history, adventure.chapters.length),
    startedAt: Math.max(0, Number(saved.startedAt) || 0),
    updatedAt: Math.max(0, Number(saved.updatedAt) || 0),
    completedAt: chapter >= adventure.chapters.length ? Math.max(0, Number(saved.completedAt) || 0) : 0,
    lastCompletedDate: String(saved.lastCompletedDate || ''),
  }
}

function completedSession(progress, active) {
  return (progress.sessions || []).some(session =>
    session?.module === active.moduleId &&
    Number(session.date) >= active.startedAt
  )
}

export function settleWeeklyBloomAdventure(progress = {}, ageGroup = 'early', now = Date.now()) {
  const state = normalizeWeeklyBloomAdventure(progress.weeklyBloomAdventure, ageGroup)
  if (!state.active || !completedSession(progress, state.active)) return state

  const adventure = WEEKLY_BLOOM_ADVENTURES[state.ageGroup]
  const chapter = adventure.chapters[state.active.chapter]
  const completedChapter = state.active.chapter
  const nextChapter = Math.min(adventure.chapters.length, completedChapter + 1)
  const completedAt = nextChapter >= adventure.chapters.length ? now : 0
  const historyEntry = {
    chapter: completedChapter,
    moduleId: state.active.moduleId,
    title: chapter.title,
    restored: chapter.restored,
    choiceId: state.choices[completedChapter] || '',
    completedAt: now,
    date: formatLocalDate(new Date(now)),
  }

  return {
    ...state,
    chapter: nextChapter,
    active: null,
    history: normalizeHistory([...state.history, historyEntry], adventure.chapters.length),
    updatedAt: now,
    completedAt,
    lastCompletedDate: historyEntry.date,
  }
}

export function chooseWeeklyBloomPath(progress = {}, ageGroup = 'early', choiceId = '', now = Date.now()) {
  const state = settleWeeklyBloomAdventure(progress, ageGroup, now)
  const adventure = WEEKLY_BLOOM_ADVENTURES[state.ageGroup]
  const chapter = adventure.chapters[state.chapter]
  const validChoice = chapter?.choice?.options?.find(option => option.id === choiceId)
  if (!validChoice || state.active) return state

  return {
    ...state,
    choices: { ...state.choices, [state.chapter]: validChoice.id },
    updatedAt: now,
  }
}

export function launchWeeklyBloomChapter(progress = {}, ageGroup = 'early', now = Date.now()) {
  const state = settleWeeklyBloomAdventure(progress, ageGroup, now)
  const adventure = WEEKLY_BLOOM_ADVENTURES[state.ageGroup]
  const chapter = adventure.chapters[state.chapter]
  if (!chapter || state.lastCompletedDate === formatLocalDate(new Date(now))) return state
  if (chapter.choice && !state.choices[state.chapter]) return state
  if (state.active) return state

  return {
    ...state,
    active: {
      chapter: state.chapter,
      moduleId: chapter.module.id,
      startedAt: now,
      date: formatLocalDate(new Date(now)),
    },
    startedAt: state.startedAt || now,
    updatedAt: now,
  }
}

export function getWeeklyBloomAdventureView(progress = {}, ageGroup = 'early', now = Date.now()) {
  const state = settleWeeklyBloomAdventure(progress, ageGroup, now)
  const adventure = WEEKLY_BLOOM_ADVENTURES[state.ageGroup]
  const total = adventure.chapters.length
  const today = formatLocalDate(new Date(now))
  const complete = state.chapter >= total
  const chapter = complete ? null : adventure.chapters[state.chapter]
  const previous = state.history[state.history.length - 1] || null
  const waiting = !complete && !state.active && state.lastCompletedDate === today
  const needsChoice = Boolean(!complete && !waiting && !state.active && chapter?.choice && !state.choices[state.chapter])
  const status = complete ? 'complete' : waiting ? 'waiting' : state.active ? 'active' : needsChoice ? 'choice' : 'available'
  const memory = previous
    ? state.lastCompletedDate === today
      ? `Today: ${previous.restored}`
      : `Last time: ${previous.restored}`
    : adventure.intro

  return {
    state,
    adventure,
    chapter,
    previous,
    status,
    complete,
    waiting,
    needsChoice,
    completed: state.chapter,
    total,
    progressPercent: Math.round((state.chapter / total) * 100),
    memory,
    tomorrow: waiting ? chapter : null,
  }
}

export function mergeWeeklyBloomAdventure(localValue = {}, cloudValue = {}) {
  const age = WEEKLY_BLOOM_ADVENTURES[localValue?.ageGroup]
    ? localValue.ageGroup
    : WEEKLY_BLOOM_ADVENTURES[cloudValue?.ageGroup] ? cloudValue.ageGroup : 'early'
  const local = normalizeWeeklyBloomAdventure(localValue, age)
  const cloud = normalizeWeeklyBloomAdventure(cloudValue, age)
  const leader = local.chapter > cloud.chapter
    ? local
    : cloud.chapter > local.chapter
      ? cloud
      : (local.updatedAt >= cloud.updatedAt ? local : cloud)
  const history = normalizeHistory([...cloud.history, ...local.history], WEEKLY_BLOOM_ADVENTURES[age].chapters.length)
  const activeCandidates = [local.active, cloud.active]
    .filter(active => active && Number(active.chapter) >= leader.chapter)
    .sort((a, b) => b.startedAt - a.startedAt)

  return {
    ...leader,
    history,
    choices: { ...cloud.choices, ...local.choices },
    active: leader.chapter >= WEEKLY_BLOOM_ADVENTURES[age].chapters.length ? null : activeCandidates[0] || leader.active,
    startedAt: Math.min(...[local.startedAt, cloud.startedAt].filter(Boolean)) || 0,
    updatedAt: Math.max(local.updatedAt, cloud.updatedAt),
    completedAt: Math.max(local.completedAt, cloud.completedAt),
    lastCompletedDate: history[history.length - 1]?.date || leader.lastCompletedDate,
  }
}
