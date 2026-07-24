import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getInterestRecommendations,
  getParentInterestInsight,
  mergeChildInterest,
  recordInterestComplete,
  recordInterestExit,
  recordInterestStart,
} from '../src/utils/childInterest.js'

test('unfinished play becomes the Continue choice', () => {
  const childInterest = recordInterestStart({}, 'numbers', { source: 'map', at: 1_000 })
  const choices = getInterestRecommendations({ childInterest }, 'toddler', 2_000)
  assert.equal(choices.continue.id, 'numbers')
})

test('completed play clears Continue and raises a favourite', () => {
  let childInterest = recordInterestStart({}, 'math', { at: 1_000 })
  childInterest = recordInterestComplete(childInterest, 'math', { at: 121_000, score: 5 })
  const choices = getInterestRecommendations({ childInterest }, 'early', 122_000)
  assert.equal(choices.continue, null)
  assert.equal(choices.favourite.id, 'math')
  assert.notEqual(choices.surprise.id, 'math')
})

test('quick exits reduce preference without being mistaken for completion', () => {
  let childInterest = recordInterestStart({}, 'phonics', { at: 1_000 })
  childInterest = recordInterestExit(childInterest, 'phonics', { at: 11_000 })
  childInterest = recordInterestStart(childInterest, 'story', { at: 20_000 })
  childInterest = recordInterestComplete(childInterest, 'story', { at: 140_000 })
  assert.equal(getInterestRecommendations({ childInterest }, 'early', 141_000).favourite.id, 'story')
})

test('leaving after completion does not create a false exit', () => {
  let childInterest = recordInterestStart({}, 'reading', { at: 1_000 })
  childInterest = recordInterestComplete(childInterest, 'reading', { at: 80_000 })
  childInterest = recordInterestExit(childInterest, 'reading', { at: 81_000 })
  assert.equal(childInterest.events.filter(event => event.type === 'exit').length, 0)
})

test('parent insight identifies repeated friction and a favourite', () => {
  let childInterest = {}
  childInterest = recordInterestStart(childInterest, 'fractions', { at: 1_000 })
  childInterest = recordInterestExit(childInterest, 'fractions', { at: 8_000 })
  childInterest = recordInterestStart(childInterest, 'fractions', { at: 20_000 })
  childInterest = recordInterestExit(childInterest, 'fractions', { at: 27_000 })
  childInterest = recordInterestStart(childInterest, 'reading', { at: 30_000 })
  childInterest = recordInterestComplete(childInterest, 'reading', { at: 150_000 })
  const insight = getParentInterestInsight({ childInterest }, 'junior')
  assert.equal(insight.favourite.id, 'reading')
  assert.equal(insight.friction.id, 'fractions')
})

test('cloud merge keeps unique choices from two devices', () => {
  const local = recordInterestComplete(recordInterestStart({}, 'shapes', { at: 1_000 }), 'shapes', { at: 40_000 })
  const cloud = recordInterestComplete(recordInterestStart({}, 'numbers', { at: 2_000 }), 'numbers', { at: 50_000 })
  const merged = mergeChildInterest(local, cloud)
  assert.equal(merged.events.filter(event => event.type === 'complete').length, 2)
  assert.deepEqual(new Set(merged.events.map(event => event.moduleId)), new Set(['shapes', 'numbers']))
})
