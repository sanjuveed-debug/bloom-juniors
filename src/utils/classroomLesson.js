import { formatLocalDate } from './date.js'

const lessonKey = (guardianId) => `bj_class_lesson_${guardianId}_${formatLocalDate()}`

export const MODULES_BY_AGE = {
  early: [
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
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function clearClassroomLesson(guardianId) {
  if (!guardianId) return
  localStorage.removeItem(lessonKey(guardianId))
}
