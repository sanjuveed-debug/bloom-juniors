import test from 'node:test'
import assert from 'node:assert/strict'
import { PROJECT_ADVENTURES } from '../src/utils/projectAdventures.js'
import {
  getTreasurePersonality,
  getTreasureSet,
  getTreasureSetProgress,
  interactWithLivingTreasure,
  moveLivingTreasure,
  placeLivingTreasure,
  recordTreasureSecretGame,
  removeLivingTreasure,
} from '../src/utils/livingTreasures.js'

function collectionFor(ageGroup, count = 6) {
  return {
    items: PROJECT_ADVENTURES[ageGroup].slice(0, count).map((adventure, index) => ({
      ...adventure.souvenir,
      kind: 'souvenir',
      slot: 'room',
      earnedAt: index + 1,
    })),
  }
}

test('every age group has a six-piece souvenir set and a named secret game', () => {
  for (const age of ['toddler', 'early', 'junior']) {
    const set = getTreasureSet(age)
    assert.equal(set.items.length, 6)
    assert.ok(set.game)
    assert.equal(new Set(set.items.map(item => item.id)).size, 6)
  }
})
test('secret game remains locked until all six matching souvenirs are owned', () => {
  assert.equal(getTreasureSetProgress(collectionFor('early', 5), 'early').unlocked, false)
  assert.equal(getTreasureSetProgress(collectionFor('early', 6), 'early').unlocked, true)
})

test('owned treasures can be placed, moved, and removed without losing the item', () => {
  const original = collectionFor('toddler', 1)
  const item = original.items[0]
  const placed = placeLivingTreasure(original, item, { x: 2, y: 99 })
  assert.equal(placed.roomLayout[item.id].x, 6)
  assert.equal(placed.roomLayout[item.id].y, 78)
  const moved = moveLivingTreasure(placed, item.id, { x: 44, y: 35 })
  assert.equal(moved.roomLayout[item.id].x, 44)
  assert.equal(moved.roomLayout[item.id].y, 35)
  const removed = removeLivingTreasure(moved, item.id)
  assert.equal(removed.roomLayout[item.id], undefined)
  assert.equal(removed.items[0].id, item.id)
})

test('unowned objects cannot be inserted into the room', () => {
  const collection = collectionFor('early', 1)
  const result = placeLivingTreasure(collection, { id: 'not-owned', slot: 'room' })
  assert.equal(result.roomLayout['not-owned'], undefined)
})

test('treasure reactions are permanent and every spoken reaction names its treasure', () => {
  const collection = collectionFor('junior', 1)
  const item = collection.items[0]
  const once = interactWithLivingTreasure(collection, item.id, 10)
  const twice = interactWithLivingTreasure(once, item.id, 20)
  assert.deepEqual(twice.treasureInteractions[item.id], { count: 2, lastAt: 20 })
  const personality = getTreasurePersonality(item, 'junior')
  assert.match(personality.reaction, new RegExp(item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.ok(personality.duration >= 1.35)
})

test('a locked collection cannot record a secret-game result', () => {
  const result = recordTreasureSecretGame(collectionFor('junior', 5), 'junior', 5, 5, 100)
  assert.equal(result.recorded, false)
  assert.equal(result.collection.sparkleDust, 0)
})

test('first perfect secret-game win awards dust once and later wins remain playable', () => {
  const full = collectionFor('early', 6)
  const first = recordTreasureSecretGame(full, 'early', 4, 4, 100)
  assert.equal(first.recorded, true)
  assert.equal(first.firstPerfect, true)
  assert.equal(first.collection.sparkleDust, 25)
  assert.equal(first.collection.secretGames.early.plays, 1)
  const second = recordTreasureSecretGame(first.collection, 'early', 4, 4, 200)
  assert.equal(second.firstPerfect, false)
  assert.equal(second.collection.sparkleDust, 25)
  assert.equal(second.collection.secretGames.early.plays, 2)
})
