import { FOUNDATION_MODULE_CATALOG } from './foundationRecommendations.js'

export const STARTER_PATH_LENGTH = 7
export const STARTER_PATH_TRACKING_START = '2026-08-06'

const STARTER_PATH_MODULES = {
  toddler: ['alphabet', 'numbers', 'alphabet', 'colours', 'numbers', 'animals', 'shapes'],
  early: ['phonics', 'math', 'phonics', 'shapes', 'math', 'story', 'logic'],
  junior: ['reading', 'timestables', 'spelling', 'reading', 'timestables', 'reading', 'spelling'],
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
