import { formatLocalDate } from './date.js'
import { normalizeFloatDiscovery } from './floatDiscovery.js'
import { normalizeShadowDiscovery } from './shadowDiscovery.js'
import { normalizeCollection } from './collectionAdventure.js'

export const CLASS_DISCOVERIES = [
  { id: 'shadow-discovery', label: 'Changing shadows', emoji: '🔦', question: 'What changes when we move the torch?', note: 'Ask for a prediction before each move. Compare the shadow with the object and screen kept still.', offline: 'Use a torch, a toy and a wall with an adult. Never shine the torch into eyes.' },
  { id: 'float-discovery', label: 'Float or sink?', emoji: '⛵', question: 'Can the same clay float in a different shape?', note: 'Predict, test, then explain what changed. Weight alone does not decide whether something floats; shape and material matter too.', offline: 'With an adult, test large washable objects in shallow water. Keep devices away and empty the bowl afterwards.' },
  { id: 'snacks', label: 'Fair sharing', emoji: '🍎', question: 'How can we give both friends the same amount?', note: 'Share one item at a time, count each group, then explain how you checked that they are equal.', offline: 'Share large paper circles between two toys. Rearrange them and count again.' },
]

const lessonKey = (guardianId) => `bj_class_lesson_${guardianId}_${formatLocalDate()}`

export const MODULES_BY_AGE = {
  early: [
    ...CLASS_DISCOVERIES,
    { id: 'phonics',  label: 'Phonics',      emoji: '🎤' },
    { id: 'math',     label: 'Maths',         emoji: '🔢' },
    { id: 'tricky',   label: 'Tricky Words',  emoji: '⭐' },
    { id: 'story',    label: 'Stories',       emoji: '📖' },
    { id: 'shapes',   label: 'Shapes',        emoji: '🔷' },
    { id: 'logic',    label: 'Puzzles',       emoji: '🧩' },
    { id: 'science',  label: 'Science',       emoji: '🔬' },
    { id: 'worldgk',  label: 'World GK',      emoji: '🌍' },
  ],
  junior: [
    { id: 'timestables',  label: 'Times Tables',  emoji: '✖️' },
    { id: 'fractions',    label: 'Fractions',      emoji: '½' },
    { id: 'reading',      label: 'Reading',        emoji: '📖' },
    { id: 'spelling',     label: 'Spelling',       emoji: '✏️' },
    { id: 'grammar',      label: 'Grammar',        emoji: '🔤' },
    { id: 'wordproblems', label: 'Word Problems',  emoji: '🧩' },
    { id: 'science',      label: 'Science',        emoji: '🔬' },
    { id: 'worldmap',     label: 'World Map',      emoji: '🌍' },
  ],
  toddler: [
    { id: 'animals',   label: 'Animals',    emoji: '🦁' },
    { id: 'colours',   label: 'Colours',    emoji: '🎨' },
    { id: 'fruits',    label: 'Fruits',     emoji: '🍎' },
    { id: 'bodyparts', label: 'Body Parts', emoji: '🖐️' },
  ],
}

export function setClassroomLesson(guardianId, moduleIds) {
  if (!guardianId) return
  localStorage.setItem(lessonKey(guardianId), JSON.stringify(moduleIds))
}

export function getClassroomLesson(guardianId) {
  if (!guardianId) return null
  try {
    const raw = localStorage.getItem(lessonKey(guardianId))
    const ids = raw ? JSON.parse(raw) : null
    return Array.isArray(ids) ? [...new Set(ids.filter(id => typeof id === 'string'))] : null
  } catch { return null }
}

export function clearClassroomLesson(guardianId) {
  if (!guardianId) return
  localStorage.removeItem(lessonKey(guardianId))
}

// Exact activity evidence: an unrelated maths session never completes Fair sharing.
// Replays use the current normalized completion state without awarding another session.
export function getClassLessonSteps(progress = {}, moduleIds = [], ageGroup = 'early', dateKey = formatLocalDate()) {
  const pool = MODULES_BY_AGE[ageGroup] || MODULES_BY_AGE.early
  const onDate = at => Number.isFinite(at) && at > 0 && formatLocalDate(new Date(at)) === dateKey
  const sessions = (progress.sessions || []).filter(s => onDate(s.date))
  return (Array.isArray(moduleIds) ? [...new Set(moduleIds)] : []).map(id => {
    const module = pool.find(item => item.id === id)
    if (!module) return null
    let done = sessions.some(s => id === 'snacks' ? s.activityId === 'snacks-first' : s.module === id)
    let started = done
    if (id === 'float-discovery' || id === 'shadow-discovery') {
      const state = id === 'float-discovery' ? normalizeFloatDiscovery(progress.floatDiscovery) : normalizeShadowDiscovery(progress.shadowDiscovery)
      done ||= state.phase === 'complete' && onDate(id === 'shadow-discovery' ? state.updatedAt : state.completedAt)
      started ||= onDate(state.updatedAt)
    } else if (id === 'snacks') {
      const entry = normalizeCollection(progress.collectionAdventures?.snacks, 'snacks')
      done ||= entry.state.phase === 'complete' && onDate(entry.updatedAt)
      started ||= onDate(entry.updatedAt)
    } else if (ageGroup === 'junior') {
      done ||= progress[id]?.lastPlayedDate === dateKey
      started ||= done
    }
    return { ...module, done, started }
  }).filter(Boolean)
}
