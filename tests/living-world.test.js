import test from 'node:test'
import assert from 'node:assert/strict'
import { getLivingWorldScore, getLivingWorldSummary, LIVING_WORLD_AGE_COPY } from '../src/utils/livingWorld.js'

test('Living World totals module stars for toddler and junior profiles without totalStars', () => {
  assert.equal(getLivingWorldScore({ body: { stars: 4 }, colours: { stars: 5 }, wonderWorld: { plots: [] } }), 9)
})

test('Living World prefers the canonical totalStars used by early profiles', () => {
  assert.equal(getLivingWorldScore({ totalStars: 24, phonics: { stars: 7 } }), 24)
})

test('Living World summary preserves treasures, equipped items, plots, and discoveries', () => {
  const summary = getLivingWorldSummary({
    treasureCollection: { items: [{ id: 'dolly' }], equipped: { buddy: 'dolly' } },
    wonderWorld: { plots: [{ seedId: 'rainbow' }, null, null], discoveries: [{ id: 'friend' }] },
    numberworld: { stars: 3 },
  })
  assert.deepEqual(summary, { treasureCount: 1, equippedCount: 1, discoveryCount: 1, plantedCount: 1, score: 3 })
})

test('Living World has age-appropriate presentation for all supported ages 3 to 9', () => {
  assert.deepEqual(Object.keys(LIVING_WORLD_AGE_COPY), ['toddler', 'early', 'junior'])
})
