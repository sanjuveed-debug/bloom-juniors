import test from 'node:test'
import assert from 'node:assert/strict'

import { defaultProgress, hydrateProgressData } from '../src/hooks/useProgress.js'
import {
  buildSoundPopCompletion,
  getExerciseCompletionReward,
  getWorldExplorerStars,
} from '../src/utils/moduleScoring.js'
import {
  STUDY_PATH_TARGET,
  getArcadeUnlockStatus,
} from '../src/utils/arcadeUnlock.js'

test('hydrateProgressData migrates legacy world explorer progress', () => {
  const hydrated = hydrateProgressData({
    gk: { score: 5, played: 2 },
    shapes: { score: 3 },
    shop: { coins: 12 },
  })

  assert.equal(hydrated.worldgk.score, 5)
  assert.equal(hydrated.worldgk.played, 2)
  assert.equal(hydrated.shapes.score, 3)
  assert.equal(hydrated.shop.coins, 12)
  assert.equal(hydrated.exercise.level, defaultProgress.exercise.level)
  assert.equal(Object.hasOwn(hydrated, 'gk'), false)
})

test('hydrateProgressData preserves planted Secret World plots', () => {
  const hydrated = hydrateProgressData({
    wonderWorld: {
      seedClaims: { 'daily:one': { at: 1, source: 'test' } },
      plots: [{ awardId: 'daily:one', seedId: 'rainbow', plantedDate: '2026-07-13', plantedAt: 2 }, null, null],
      discoveries: [],
    },
  })

  assert.equal(hydrated.wonderWorld.plots[0].seedId, 'rainbow')
  assert.equal(hydrated.wonderWorld.plots[0].awardId, 'daily:one')
})

test('buildSoundPopCompletion keeps accuracy tied to correct answers, not bonus stars', () => {
  const result = buildSoundPopCompletion({
    totalRounds: 10,
    correctAnswers: 7,
    bonusStars: 9,
    wrongSounds: ['sh', 'th'],
  })

  assert.deepEqual(result, {
    stars: 9,
    sessionData: {
      total: 10,
      correct: 7,
      struggles: ['sh', 'th'],
    },
  })
  assert.ok(result.sessionData.correct <= result.sessionData.total)
})

test('getWorldExplorerStars matches the quiz thresholds', () => {
  assert.equal(getWorldExplorerStars(3), 1)
  assert.equal(getWorldExplorerStars(4), 2)
  assert.equal(getWorldExplorerStars(6), 3)
})

test('getExerciseCompletionReward only awards the full workout bonus at the real end, but still rewards a single completed exercise', () => {
  assert.deepEqual(
    getExerciseCompletionReward({
      sessionMode: 'single',
      exerciseIndex: 7,
      totalExercises: 8,
    }),
    {
      stars: 1,
      sessionData: { total: 1, correct: 1, struggles: [] },
    },
  )

  assert.equal(
    getExerciseCompletionReward({
      sessionMode: 'full',
      exerciseIndex: 4,
      totalExercises: 8,
    }),
    null,
  )

  assert.deepEqual(
    getExerciseCompletionReward({
      sessionMode: 'full',
      exerciseIndex: 7,
      totalExercises: 8,
    }),
    {
      stars: 5,
      sessionData: {
        total: 8,
        correct: 8,
        struggles: [],
      },
    },
  )
})

test('getArcadeUnlockStatus unlocks after enough different study modules today', () => {
  const now = new Date('2026-04-04T16:00:00Z').getTime()
  const today = new Date('2026-04-04T06:00:00Z').getTime()
  const laterToday = new Date('2026-04-04T08:30:00Z').getTime()
  const yesterday = new Date('2026-04-03T17:00:00Z').getTime()

  const locked = getArcadeUnlockStatus({
    sessions: [
      { module: 'phonics', date: today },
      { module: 'phonics', date: laterToday },
      { module: 'math', date: yesterday },
    ],
  }, now)

  assert.equal(locked.unlocked, false)
  assert.equal(locked.completedCount, 1)
  assert.equal(locked.progressPercent, 50)
  assert.equal(locked.remainingModules[0].id, 'math')

  const unlocked = getArcadeUnlockStatus({
    sessions: [
      { module: 'phonics', date: today },
      { module: 'story', date: laterToday },
      { module: 'arcade', date: laterToday },
    ],
  }, now)

  assert.equal(STUDY_PATH_TARGET, 2)
  assert.equal(unlocked.unlocked, true)
  assert.equal(unlocked.completedCount, 2)
  assert.deepEqual(
    unlocked.completedModules.map(module => module.id),
    ['phonics', 'story'],
  )
})
