import test from 'node:test'
import assert from 'node:assert/strict'
import { getCompanionPowerState, mergeCompanionPowers, normalizeCompanionPowers, spendCompanionPower } from '../src/utils/companionPowers.js'

test('every child starts with one companion power charge', () => {
  const state = getCompanionPowerState({ totalStars: 0 }, 'early')
  assert.equal(state.available, 1)
  assert.equal(state.power.name, 'Guide Glow')
})

test('learning earns charges with a bank capped at three', () => {
  assert.equal(getCompanionPowerState({ totalStars: 9 }).available, 1)
  assert.equal(getCompanionPowerState({ totalStars: 10 }).available, 2)
  assert.equal(getCompanionPowerState({ totalStars: 100 }).available, 3)
})

test('higher bond stages unlock stronger clue powers', () => {
  const toddler = getCompanionPowerState({ totalStars: 0 }, 'toddler')
  const buddy = getCompanionPowerState({ totalStars: 20 }, 'early')
  const guardian = getCompanionPowerState({ totalStars: 100 }, 'junior')
  assert.equal(toddler.removeCount, 1)
  assert.equal(buddy.power.name, 'Clue Compass')
  assert.equal(buddy.removeCount, 1)
  assert.equal(guardian.removeCount, 2)
  assert.equal(guardian.revealCorrect, false)
})

test('using a power consumes one charge and records its module', () => {
  const progress = { totalStars: 20 }
  const next = spendCompanionPower(progress, { id: 'one', at: 123, moduleId: 'math', ageGroup: 'early', effect: 'removed-1' })
  assert.equal(next.companionPowers.totalUsed, 1)
  assert.equal(next.companionPowers.charges, 2)
  assert.equal(next.companionPowers.activations[0].moduleId, 'math')
  assert.equal(getCompanionPowerState(next).available, 2)
})

test('empty charge cannot be spent twice', () => {
  const empty = { totalStars: 0, companionPowers: { totalUsed: 1, activations: [{ id: 'used', at: 1 }] } }
  assert.equal(getCompanionPowerState(empty).available, 0)
  assert.equal(spendCompanionPower(empty, { moduleId: 'math' }), empty)
})

test('cloud merge retains activations without duplicating them', () => {
  const merged = mergeCompanionPowers(
    { totalUsed: 2, activations: [{ id: 'a', at: 1 }, { id: 'b', at: 2 }] },
    { totalUsed: 1, activations: [{ id: 'a', at: 1 }] },
  )
  assert.equal(merged.totalUsed, 2)
  assert.deepEqual(merged.activations.map(item => item.id), ['a', 'b'])
  assert.equal(normalizeCompanionPowers(null).totalUsed, 0)
})
