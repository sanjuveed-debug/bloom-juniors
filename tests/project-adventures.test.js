import test from 'node:test'
import assert from 'node:assert/strict'
import {
  PROJECT_ADVENTURES,
  chooseProjectAdventure,
  claimProjectAdventureSouvenir,
  completeProjectAdventure,
  findProjectAdventureClue,
  getProjectAdventureState,
  mergeProjectAdventures,
  startProjectAdventure,
} from '../src/utils/projectAdventures.js'

test('every age band has six recurring destinations and six different souvenirs', () => {
  for (const age of ['toddler', 'early', 'junior']) {
    assert.equal(PROJECT_ADVENTURES[age].length, 6)
    assert.equal(new Set(PROJECT_ADVENTURES[age].map(item => item.souvenir.id)).size, 6)
    assert.ok(PROJECT_ADVENTURES[age].every(item => item.clues.length === 3))
  }
})

test('a launched project adventure remains stable until it is finished', () => {
  const started = startProjectAdventure({}, 'early', '2026-07-16', 100)
  const resumed = startProjectAdventure(started, 'early', '2026-07-16', 200)
  assert.equal(resumed.active.runId, started.active.runId)
  assert.equal(resumed.active.destinationId, started.active.destinationId)
})

test('only real destination clues count and the same clue cannot count twice', () => {
  const started = startProjectAdventure({}, 'toddler', '2026-07-16', 100)
  const destination = getProjectAdventureState(started, 'toddler', '2026-07-16').destination
  const once = findProjectAdventureClue(started, destination.clues[0][0], 200)
  const twice = findProjectAdventureClue(once, destination.clues[0][0], 300)
  const invalid = findProjectAdventureClue(twice, 'not-a-real-clue', 400)
  assert.equal(invalid.active.found.length, 1)
})

test('finishing all three clues awards a souvenir and immediately allows another trip', () => {
  let state = startProjectAdventure({}, 'junior', '2026-07-16', 100)
  const first = getProjectAdventureState(state, 'junior', '2026-07-16').destination
  for (const [clueId] of first.clues) state = findProjectAdventureClue(state, clueId, 200)
  const result = completeProjectAdventure(state, 300)
  assert.equal(result.completed, true)
  assert.equal(result.reward.id, first.souvenir.id)
  assert.equal(result.state.active, null)

  const next = startProjectAdventure(result.state, 'junior', '2026-07-16', 400)
  assert.ok(next.active)
  assert.notEqual(next.active.destinationId, first.id)
})

test('souvenir collection is permanent and one run cannot reward twice', () => {
  const reward = PROJECT_ADVENTURES.early[0].souvenir
  const first = claimProjectAdventureSouvenir({}, reward, 'run-1', { earnedAt: 100 })
  const repeated = claimProjectAdventureSouvenir(first, reward, 'run-1', { earnedAt: 200 })
  assert.equal(first.items.length, 1)
  assert.deepEqual(repeated, first)

  const duplicateTrip = claimProjectAdventureSouvenir(first, reward, 'run-2', { duplicate: true, earnedAt: 300 })
  assert.equal(duplicateTrip.items.length, 1)
  assert.equal(duplicateTrip.sparkleDust, 5)
})

test('cloud merge keeps completed trips and combines clues from the same active trip', () => {
  const base = startProjectAdventure({}, 'early', '2026-07-16', 100)
  const destination = getProjectAdventureState(base, 'early', '2026-07-16').destination
  const local = findProjectAdventureClue(base, destination.clues[0][0], 200)
  const cloud = findProjectAdventureClue(base, destination.clues[1][0], 250)
  const mergedActive = mergeProjectAdventures(local, cloud)
  assert.deepEqual(new Set(mergedActive.active.found), new Set([destination.clues[0][0], destination.clues[1][0]]))

  const finished = completeProjectAdventure(findProjectAdventureClue(mergedActive, destination.clues[2][0], 300), 400).state
  const mergedFinished = mergeProjectAdventures(local, finished)
  assert.equal(mergedFinished.active, null)
  assert.equal(mergedFinished.history.length, 1)
})

test('the selector avoids the most recently visited destination', () => {
  const recent = PROJECT_ADVENTURES.early[0]
  const state = {
    history: [{ runId: 'old', ageGroup: 'early', destinationId: recent.id, souvenirId: recent.souvenir.id, completedAt: 1 }],
    souvenirIds: [recent.souvenir.id],
  }
  assert.notEqual(chooseProjectAdventure(state, 'early', '2026-07-16').id, recent.id)
})
