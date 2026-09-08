import { FOUNDATION_MODULE_CATALOG } from './foundationRecommendations.js'

export const STARTER_PATH_LENGTH = 7
export const STARTER_PATH_TRACKING_START = '2026-08-06'

const STARTER_PATH_MODULES = {
  toddler: ['alphabet', 'numbers', 'alphabet', 'colours', 'numbers', 'animals', 'shapes'],
  early: ['phonics', 'math', 'phonics', 'shapes', 'math', 'story', 'logic'],
  junior: ['reading', 'timestables', 'spelling', 'reading', 'timestables', 'reading', 'spelling'],
}

const STARTER_LEARNING = {
  alphabet: ['Notice letters and their sounds.', 'Can you spot a letter from your name around the house?'],
  numbers: ['Count objects one at a time.', 'Can you count the spoons as we set the table?'],
  colours: ['Notice and name colours.', 'Can you find two things with the same colour?'],
  animals: ['Recognise animals and their features.', 'Which animal would you like to meet, and why?'],
  shapes: ['Recognise shapes in everyday objects.', 'Which shapes can you find in this room?'],
  phonics: ['Listen for sounds in words.', 'What else starts with a sound you heard today?'],
  math: ['Count carefully and connect groups to numbers.', 'Can you show me that number using your fingers or toys?'],
  story: ['Listen to a story and explain what happened.', 'What happened first, and what happened next?'],
  logic: ['Look for patterns and explain a choice.', 'How did you work out what came next?'],
  reading: ['Read for meaning and use clues from a story.', 'Which clue helped you understand the character?'],
  timestables: ['Connect equal groups to multiplication.', 'Where can we find equal groups at home?'],
  spelling: ['Notice sound and spelling patterns.', 'Can you think of another word with the same sound?'],
}

// Only an explicit starter launch changes a module's normal free-choice flow.
export function getGuidedStarterMission(progress = {}, moduleId, source) {
  if (!['first-mission', 'starter-path'].includes(source)) return null
  const path = getStarterPathState(progress, 'early')
  if (!path.active || path.module?.id !== moduleId) return null
  if (moduleId === 'phonics') return { mode: 'pop', rounds: 5, step: path.step }
  if (moduleId === 'math') return { mode: path.step < 5 ? 'count' : 'onemore', rounds: 5, step: path.step }
  return null
}

function catalogFor(ageGroup) {
  return FOUNDATION_MODULE_CATALOG[ageGroup] || FOUNDATION_MODULE_CATALOG.early
}

export function countStarterPathCompletions(progress = {}, ageGroup = 'early') {
  const knownModules = new Set(catalogFor(ageGroup).map(module => module.id))
  return Math.min(STARTER_PATH_LENGTH, (progress.sessions || []).filter(session => (
    session && knownModules.has(String(session.module || ''))
  )).length)
}

export function getStarterPathState(progress = {}, ageGroup = 'early', fallbackModules = []) {
  const age = STARTER_PATH_MODULES[ageGroup] ? ageGroup : 'early'
  const catalog = catalogFor(age)
  const completed = countStarterPathCompletions(progress, age)
  const active = completed < STARTER_PATH_LENGTH
  const moduleId = active ? STARTER_PATH_MODULES[age][completed] : ''
  const module = active
    ? catalog.find(item => item.id === moduleId)
      || fallbackModules.find(item => item?.id)
      || catalog[0]
      || null
    : null

  return {
    active,
    completed,
    total: STARTER_PATH_LENGTH,
    step: active ? completed + 1 : STARTER_PATH_LENGTH,
    module,
    learning: STARTER_LEARNING[module?.id]?.[0] || 'Explore one short learning activity.',
    parentPrompt: STARTER_LEARNING[module?.id]?.[1] || 'What did you notice, and where could we try it together?',
    steps: Array.from({ length: STARTER_PATH_LENGTH }, (_, index) => ({
      number: index + 1,
      state: index < completed ? 'done' : index === completed && active ? 'active' : 'waiting',
    })),
  }
}

export function getStarterPathCompletion(progress = {}, ageGroup = 'early', completedModule = '') {
  const sessions = Array.isArray(progress.sessions) ? progress.sessions : []
  return getStarterPathState({
    ...progress,
    sessions: [...sessions, { module: completedModule, date: Date.now() }],
  }, ageGroup)
}
