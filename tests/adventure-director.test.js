import test from 'node:test'
import assert from 'node:assert/strict'
import { ENDLESS_MODULES, getNeverFinishedAdventure, launchNeverFinishedAdventure, mergeAdventureDirector, normalizeAdventureDirector, settleNeverFinishedAdventure } from '../src/utils/adventureDirector.js'

const NOW = new Date(2026, 6, 15, 10, 0, 0).getTime()

test('all age bands always receive a playable unlimited adventure', () => {
  for (const age of ['toddler', 'early', 'junior']) {
    const adventure = getNeverFinishedAdventure({}, age, NOW)
    assert.ok(ENDLESS_MODULES[age].some(module => module.id === adventure.module.id))
    assert.equal(adventure.sessionSize, age === 'toddler' ? 4 : age === 'early' ? 6 : 8)
  }
})

test('the director avoids the three most recent destinations', () => {
  const recent = ENDLESS_MODULES.early.slice(0, 3).map((module, index) => ({ id: `run-${index}`, moduleId: module.id, completedAt: NOW - index }))
  const adventure = getNeverFinishedAdventure({ adventureDirector: { runs: recent } }, 'early', NOW)
  assert.equal(recent.some(run => run.moduleId === adventure.module.id), false)
})

test('developing skills are preferred over mastered skills', () => {
  const skills = Object.fromEntries(ENDLESS_MODULES.junior.map(module => [module.skill, { mastery: module.id === 'reading' ? 0 : 100, difficulty: 1 }]))
  const adventure = getNeverFinishedAdventure({ learningJourney: { skills } }, 'junior', NOW)
  assert.equal(adventure.module.id, 'reading')
  assert.equal(adventure.difficultyLabel, 'Confidence builder')
})

test('a launched expedition settles after its module play count increases', () => {
  const adventure = getNeverFinishedAdventure({}, 'toddler', NOW)
  const launched = launchNeverFinishedAdventure({}, adventure, NOW)
  assert.equal(launched.adventureDirector.launched.moduleId, adventure.module.id)
  const finished = settleNeverFinishedAdventure({ ...launched, [adventure.module.id]: { played: 1 } }, NOW + 1000)
  assert.equal(finished.adventureDirector.launched, null)
  assert.equal(finished.adventureDirector.runs.length, 1)
})

test('an unfinished expedition is not falsely completed', () => {
  const adventure = getNeverFinishedAdventure({}, 'early', NOW)
  const launched = launchNeverFinishedAdventure({}, adventure, NOW)
  assert.equal(settleNeverFinishedAdventure(launched, NOW + 1000), launched)
})

test('cloud merge preserves unique completed expeditions and newest launch', () => {
  const merged = mergeAdventureDirector(
    { runs: [{ id: 'a', moduleId: 'math', completedAt: 1 }], launched: { id: 'new', moduleId: 'story', at: 5 } },
    { runs: [{ id: 'b', moduleId: 'phonics', completedAt: 2 }], launched: { id: 'old', moduleId: 'shapes', at: 3 } },
  )
  assert.deepEqual(merged.runs.map(run => run.id), ['a', 'b'])
  assert.equal(merged.launched.id, 'new')
  assert.equal(normalizeAdventureDirector(null).runs.length, 0)
})
