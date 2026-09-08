import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parse } from '@babel/parser'
import vm from 'node:vm'
import { preservesGuidedDestination } from '../src/utils/guidedNavigation.js'
import { ADVENTURE_PATH } from '../src/utils/collectionAdventure.js'

function getHandler(file, name) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8')
  let result
  function visit(node) {
    if (!node || typeof node !== 'object') return
    if (node.type === 'VariableDeclarator' && node.id?.name === name) {
      const fn = node.init.type === 'CallExpression' ? node.init.arguments[0] : node.init
      result = source.slice(fn.start, fn.end)
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(visit)
      else if (value && typeof value === 'object') visit(value)
    }
  }
  visit(parse(source, { sourceType: 'module', plugins: ['jsx'] }))
  assert.ok(result, `missing ${name}`)
  return result
}
const home = getHandler('../src/components/Dashboard.jsx', 'handleGatedNavigate')
const app = getHandler('../src/App.jsx', 'navigate')
const chapter = getHandler('../src/components/BloomAdventureHome.jsx', 'startWeekly')
function launch(moduleId, source, { locked = false, premium = false } = {}) {
  const screens = [], blocked = []
  const noop = () => {}
  const context = vm.createContext({
    preservesGuidedDestination,
    ADVENTURE_PATH,
    MODULE_MAP: { math: {}, science: { premium: true }, tricky: {} },
    fullAccess: !premium, isDailyPathDone: false,
    dailyAccess: { availableIds: new Set(['tricky']), nextId: 'tricky' },
    setPremiumMod: () => blocked.push('premium'), setLockedModule: () => blocked.push('premium'),
    stopAllSpeech: noop, resume: noop, triggerHaptic: noop,
    screenRef: { current: 'home' }, screenEntryRef: { current: 0 },
    GAME_SCREENS: ['math', 'science', 'tricky'], GATE_FREE_SCREENS: new Set(['math', 'tricky']),
    sessionLocked: locked, hasAllAccessRef: { current: !premium }, PREMIUM_FS2_MODULES: new Set(['science']),
    progress: {}, classroomLessonRef: { current: null },
    getDailyGate: () => ({ availableIds: new Set(['tricky']), nextId: 'tricky' }),
    setScreen: value => screens.push(value), update: noop, setModuleArrival: noop,
    sessionStorage: { getItem: () => null, removeItem: noop },
  })
  context.onNavigate = vm.runInContext(`(${app})`, context)
  const homeNavigate = vm.runInContext(`(${home})`, context)
  if (source === 'weekly-chapter') {
    const producer = vm.createContext({
      weekly: { state: {}, needsChoice: false, waiting: false, complete: false },
      chapter: { module: { id: moduleId } }, progress: {}, age: 'early',
      launchWeeklyBloomChapter: () => ({ active: { moduleId } }),
      onUpdateProgress: noop, trackEvent: noop, onNavigate: homeNavigate,
    })
    vm.runInContext(`(${chapter})`, producer)()
  } else homeNavigate(moduleId, source)
  return { screens, blocked }
}

for (const source of ['first-mission', 'starter-path', 'weekly-chapter']) {
  for (const moduleId of ['math', 'science']) {
    test(`${source} preserves ${moduleId} through both daily gates`, () => {
      assert.deepEqual(launch(moduleId, source), { screens: [moduleId], blocked: [] })
    })
  }
  test(`${source} cannot bypass the parent session limit`, () => {
    assert.deepEqual(launch('math', source, { locked: true }).screens, [])
  })
  test(`${source} cannot bypass premium access`, () => {
    assert.deepEqual(launch('science', source, { premium: true }), { screens: [], blocked: ['premium'] })
  })
}
test('ordinary library choice retains the existing daily gate', () => {
  assert.deepEqual(launch('science', 'choice').screens, ['tricky'])
})
