import test from 'node:test'
import assert from 'node:assert/strict'

import {
  FOUNDATION_MODULE_CATALOG,
  getFoundationDailyPath,
  getFoundationProgress,
} from '../src/utils/foundationRecommendations.js'

const DATE = '2026-07-26'
const TODAY = new Date('2026-07-26T09:00:00').getTime()

test('assigns one essential activity and one wider-foundation activity for every age band', () => {
  for (const ageGroup of Object.keys(FOUNDATION_MODULE_CATALOG)) {
    const path = getFoundationDailyPath({}, ageGroup, { date: DATE })

    assert.equal(path.modules.length, 2)
    assert.equal(path.essential.role, 'essential')
    assert.equal(path.foundation.role, 'foundation')
    assert.notEqual(path.essential.id, path.foundation.id)
  }
})

test('today path stays fixed after the first assigned activity is completed', () => {
  const initial = getFoundationDailyPath({}, 'early', { date: DATE })
  const afterFirstCompletion = getFoundationDailyPath({
    sessions: [{ module: initial.essential.id, date: TODAY }],
  }, 'early', { date: DATE })

  assert.deepEqual(
    afterFirstCompletion.modules.map(module => module.id),
    initial.modules.map(module => module.id),
  )
})

test('sensitive faith content is not automatically assigned when paused or awaiting preview', () => {
  for (const foundationProfile of [
    { beliefMode: 'pause-faith', previewMode: 'standard' },
    { beliefMode: 'family-and-world', previewMode: 'preview-roots' },
    { beliefMode: 'family-and-world', previewMode: 'preview-all' },
  ]) {
    const early = getFoundationDailyPath({ foundationProfile }, 'early', { date: DATE })
    const junior = getFoundationDailyPath({ foundationProfile }, 'junior', { date: DATE })

    assert.equal(early.modules.some(module => module.id === 'sacred'), false)
    assert.equal(junior.modules.some(module => module.id === 'spirituality'), false)
  }
})

test('free paths contain only activities available without premium access', () => {
  for (const ageGroup of ['early', 'junior']) {
    const path = getFoundationDailyPath({}, ageGroup, { date: DATE, premium: false })
    assert.equal(path.modules.length, 2)
    assert.equal(path.modules.every(module => module.free), true)
  }
})

test('foundation progress counts experiences across the five strands without treating them as scores', () => {
  const progress = getFoundationProgress({
    foundationProfile: { priorities: ['world-systems'] },
    sessions: [
      { module: 'science', date: TODAY },
      { module: 'worldmap', date: TODAY },
      { module: 'exercise', date: TODAY },
      { module: 'wonderwhy', date: TODAY, foundationStrands: ['roots-culture-meaning'] },
    ],
  }, TODAY)

  assert.equal(progress.length, 5)
  assert.equal(progress.find(strand => strand.id === 'world-systems').recentExperiences, 1)
  assert.equal(progress.find(strand => strand.id === 'people-place-time').recentExperiences, 1)
  assert.equal(progress.find(strand => strand.id === 'self-relationships-agency').recentExperiences, 1)
  assert.equal(progress.find(strand => strand.id === 'roots-culture-meaning').recentExperiences, 1)
  assert.equal(progress.find(strand => strand.id === 'world-systems').priority, true)
})
