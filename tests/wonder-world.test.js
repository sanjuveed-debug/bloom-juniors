import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getAvailableSeedAwards,
  getWonderGrowthStage,
  grantWonderSeed,
  interactWithWonderDiscovery,
  isWonderPlotReady,
  mergeWonderWorld,
  plantWonderSeed,
  revealWonderPlot,
} from '../src/utils/wonderWorld.js'

test('a learning reward grants one idempotent Wonder Seed', () => {
  const once = grantWonderSeed({}, 'chapter:one', 'living-adventure')
  const twice = grantWonderSeed(once, 'chapter:one', 'living-adventure')
  assert.equal(Object.keys(twice.seedClaims).length, 1)
  assert.deepEqual(getAvailableSeedAwards(twice), ['chapter:one'])
})

test('a planted seed grows only after the local date changes', () => {
  const rewarded = grantWonderSeed({}, 'daily:2026-07-12')
  const planted = plantWonderSeed(rewarded, 0, 'rainbow', '2026-07-12')
  assert.equal(getAvailableSeedAwards(planted).length, 0)
  assert.equal(isWonderPlotReady(planted.plots[0], '2026-07-12'), false)
  assert.equal(isWonderPlotReady(planted.plots[0], '2026-07-13'), true)
})

test('a planted seed has three clear growth stages', () => {
  const rewarded = grantWonderSeed({}, 'daily:stages')
  const planted = plantWonderSeed(rewarded, 0, 'cloud', '2026-07-12')
  const plantedAt = planted.plots[0].plantedAt
  assert.equal(getWonderGrowthStage(planted.plots[0], '2026-07-12', plantedAt).id, 'seed')
  assert.equal(getWonderGrowthStage(planted.plots[0], '2026-07-12', plantedAt + (31 * 60 * 1000)).id, 'sprout')
  assert.equal(getWonderGrowthStage(planted.plots[0], '2026-07-13', plantedAt).id, 'ready')
})

test('revealing a grown plot permanently adds a discovery and frees the plot', () => {
  const rewarded = grantWonderSeed({}, 'chapter:two')
  const planted = plantWonderSeed(rewarded, 1, 'moonberry', '2026-07-12')
  const { world, discovery } = revealWonderPlot(planted, 1, '2026-07-13')
  assert.ok(discovery?.name)
  assert.equal(world.plots[1], null)
  assert.equal(world.discoveries.length, 1)
  assert.equal(world.discoveries[0].awardId, 'chapter:two')
  const playedWith = interactWithWonderDiscovery(world, discovery.id, 123)
  assert.equal(playedWith.discoveries[0].interactionCount, 1)
  assert.equal(playedWith.discoveries[0].lastInteractedAt, 123)
})

test('cloud merge does not duplicate awards and a revealed discovery beats an old planted plot', () => {
  const base = grantWonderSeed({}, 'chapter:three')
  const planted = plantWonderSeed(base, 0, 'giggle', '2026-07-12')
  const revealed = revealWonderPlot(planted, 0, '2026-07-13').world
  const merged = mergeWonderWorld(planted, revealed)
  assert.equal(Object.keys(merged.seedClaims).length, 1)
  assert.equal(merged.discoveries.length, 1)
  assert.equal(merged.plots.filter(Boolean).length, 0)
})
