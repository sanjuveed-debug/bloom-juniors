import test from 'node:test'
import assert from 'node:assert/strict'
import { getActiveCompanion, getCompanionBond, getCompanionLearningPoints } from '../src/utils/companionBond.js'

test('Yaagvi guides a child who has not earned a buddy yet', () => {
  assert.equal(getActiveCompanion({}).name, 'Yaagvi')
})

test('equipped buddy follows the child instead of another owned buddy', () => {
  const progress = { treasureCollection: {
    items: [
      { id: 'dolly', name: 'Dolly', slot: 'buddy' },
      { id: 'fox', name: 'Glow Fox', slot: 'buddy' },
    ],
    equipped: { buddy: 'fox' },
  } }
  assert.equal(getActiveCompanion(progress).name, 'Glow Fox')
})

test('friendship points come from learning, discoveries, quests, and return streaks', () => {
  const points = getCompanionLearningPoints({
    totalStars: 20,
    loginStreak: 3,
    wonderWorld: {
      discoveries: [{ id: 'one' }],
      companionQuests: { '2026-07-15': { completedAt: 1 } },
    },
  })
  assert.equal(points, 34)
})

test('companion evolves through friendship milestones', () => {
  assert.equal(getCompanionBond({ totalStars: 0 }).stage.name, 'New Friend')
  assert.equal(getCompanionBond({ totalStars: 20 }).stage.name, 'Trail Buddy')
  assert.equal(getCompanionBond({ totalStars: 50 }).stage.name, 'Magic Partner')
  assert.equal(getCompanionBond({ totalStars: 100 }).stage.name, 'World Guardian')
  assert.equal(getCompanionBond({ totalStars: 180 }).stage.name, 'Legendary Friend')
})
