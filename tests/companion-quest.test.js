import test from 'node:test'
import assert from 'node:assert/strict'
import { findCompanionQuestMarker, getCompanionQuest } from '../src/utils/companionQuest.js'
import { getAvailableSeedAwards, mergeWonderWorld } from '../src/utils/wonderWorld.js'

test('daily companion quest scales from ages 3-4 through ages 7-9', () => {
  const date = '2026-07-15'
  assert.equal(getCompanionQuest({}, { date, ageGroup: 'toddler' }).required, 3)
  assert.equal(getCompanionQuest({}, { date, ageGroup: 'early' }).required, 4)
  assert.equal(getCompanionQuest({}, { date, ageGroup: 'junior' }).required, 5)
})

test('daily companion quest and buddy remain stable after the first find', () => {
  const options = { date: '2026-07-15', ageGroup: 'early', buddyId: 'moon-fox' }
  const first = findCompanionQuestMarker({}, 0, options, 100)
  const restored = getCompanionQuest(first.world, { ...options, buddyId: 'another-buddy' })
  assert.equal(restored.id, first.quest.id)
  assert.equal(restored.buddyId, 'moon-fox')
  assert.deepEqual(restored.found, [0])
})

test('a marker cannot be collected twice', () => {
  const options = { date: '2026-07-15', ageGroup: 'toddler' }
  const once = findCompanionQuestMarker({}, 0, options, 100)
  const twice = findCompanionQuestMarker(once.world, 0, options, 200)
  assert.equal(twice.newlyFound, false)
  assert.deepEqual(twice.quest.found, [0])
})

test('finishing a quest grants exactly one persistent Wonder Seed', () => {
  const options = { date: '2026-07-15', ageGroup: 'toddler' }
  let world = {}
  for (let marker = 0; marker < 3; marker += 1) world = findCompanionQuestMarker(world, marker, options, 100 + marker).world
  assert.equal(getCompanionQuest(world, options).completedAt, 102)
  assert.deepEqual(getAvailableSeedAwards(world), ['companion:2026-07-15'])
  const repeated = findCompanionQuestMarker(world, 2, options, 500)
  assert.equal(repeated.completed, false)
  assert.deepEqual(getAvailableSeedAwards(repeated.world), ['companion:2026-07-15'])
})

test('cloud merge keeps companion finds from both devices and completed state', () => {
  const options = { date: '2026-07-15', ageGroup: 'toddler' }
  const local = findCompanionQuestMarker({}, 0, options, 100).world
  let cloud = findCompanionQuestMarker({}, 1, options, 110).world
  cloud = findCompanionQuestMarker(cloud, 2, options, 120).world
  const merged = mergeWonderWorld(local, cloud)
  assert.deepEqual(getCompanionQuest(merged, options).found.sort(), [0, 1, 2])
  assert.ok(getCompanionQuest(merged, options).completedAt)
  assert.deepEqual(getAvailableSeedAwards(merged), ['companion:2026-07-15'])
})
