import test from 'node:test'
import assert from 'node:assert/strict'
import { mergeProgress } from '../src/services/cloudStore.js'

test('a fresh browser baseline cannot erase an earned cloud world', () => {
  const cloud = {
    revision: 14,
    updatedAt: 1_000,
    stars: 38,
    totalStars: 118,
    sessions: [{ date: 900, module: 'math', stars: 5, duration: 120 }],
    treasureCollection: {
      items: [{ id: 'explorer-yaagvi-dolly', earnedAt: 950 }],
      claims: { '2026-07-17': true },
      history: [{ id: 'explorer-yaagvi-dolly', claimKey: '2026-07-17', earnedAt: 950 }],
      sparkleDust: 2,
    },
    wonderWorld: {
      seedClaims: { 'reward-1': { at: 960, source: 'learning' } },
      plots: [],
      discoveries: [],
    },
    ks2Xp: 90,
    moodLog: [{ date: '2026-07-17', mood: 'happy', at: 970 }],
    livingAdventure: { storyId: 'moon-egg-v1', completed: [0, 1], lastReward: { at: 980 } },
  }
  const freshBrowser = {
    revision: 0,
    updatedAt: 0,
    stars: 0,
    totalStars: 0,
    sessions: [],
    treasureCollection: { items: [], claims: {}, history: [], sparkleDust: 0 },
  }

  const merged = mergeProgress(freshBrowser, cloud)

  assert.equal(merged.totalStars, 118)
  assert.equal(merged.sessions.length, 1)
  assert.equal(merged.treasureCollection.items[0].id, 'explorer-yaagvi-dolly')
  assert.equal(merged.treasureCollection.sparkleDust, 2)
  assert.equal(Object.keys(merged.wonderWorld.seedClaims).length, 1)
  assert.equal(merged.ks2Xp, 90)
  assert.equal(merged.moodLog[0].mood, 'happy')
  assert.deepEqual(merged.livingAdventure.completed, [0, 1])
})

test('offline progress from two devices merges without moving modules backwards', () => {
  const cloud = {
    revision: 8,
    updatedAt: 800,
    sessions: [{ date: 700, module: 'timestables', stars: 4 }],
    timestables: { score: 12, level: 3, played: 4, correct: 9 },
    bodyparts: { score: 6, level: 2, played: 2, correct: 5 },
  }
  const local = {
    revision: 9,
    updatedAt: 900,
    sessions: [{ date: 850, module: 'bodyparts', stars: 3 }],
    timestables: { score: 10, level: 2, played: 5, correct: 8 },
    bodyparts: { score: 8, level: 1, played: 3, correct: 7 },
  }

  const merged = mergeProgress(local, cloud)

  assert.equal(merged.sessions.length, 2)
  assert.deepEqual(merged.timestables, { score: 12, level: 3, played: 5, correct: 9 })
  assert.deepEqual(merged.bodyparts, { score: 8, level: 2, played: 3, correct: 7 })
})
