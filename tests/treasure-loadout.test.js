import test from 'node:test'
import assert from 'node:assert/strict'
import {
  activateTreasurePower,
  advanceTreasureQuest,
  awardTreasureLearningXp,
  getActiveTreasure,
  getTreasureEvolution,
  getTreasurePower,
  getTreasureQuest,
  getTreasureQuestRewards,
  mergeTreasureLoadouts,
  processTreasureLearningWin,
  setActiveTreasure,
} from '../src/utils/treasureLoadout.js'

const collection = {
  items: [
    { id: 'moon-fox', name: 'Starlight Fox', slot: 'buddy', emoji: '🦊' },
    { id: 'junior-telescope', name: 'Explorer Telescope', slot: 'tool', emoji: '🔭' },
    { id: 'rainbow-backpack', name: 'Rainbow Adventure Bag', slot: 'outfit', emoji: '🎒' },
  ],
  equipped: { buddy: 'moon-fox', tool: 'junior-telescope' },
}

test('prefers an equipped tool and remembers a different treasure per module', () => {
  assert.equal(getActiveTreasure(collection, 'math').item.id, 'junior-telescope')
  const changed = setActiveTreasure(collection, 'math', 'moon-fox', 10)
  assert.equal(getActiveTreasure(changed, 'math').item.id, 'moon-fox')
  assert.equal(getActiveTreasure(changed, 'phonics').item.id, 'junior-telescope')
})

test('cannot equip an unowned treasure', () => {
  const changed = setActiveTreasure(collection, 'math', 'not-owned', 10)
  assert.equal(changed.treasureLoadout.activeByModule, undefined)
  assert.equal(getActiveTreasure(changed, 'math').item.id, 'junior-telescope')
})

test('powers are helpful but do not contain a correct-answer reveal capability', () => {
  for (const item of collection.items) {
    const power = getTreasurePower(item)
    assert.ok(power.id)
    assert.equal('revealCorrect' in power, false)
    assert.match(power.description, /clue|focus|glow|cheer|look|challenge|colour|answer|choice/i)
  }
})

test('a real learning win awards XP once and evolves at 25 and 60 XP', () => {
  let current = setActiveTreasure(collection, 'math', 'moon-fox', 1)
  let result = awardTreasureLearningXp(current, { moduleId: 'math', eventId: 'win-1', amount: 25, at: 2 })
  assert.equal(result.awarded, true)
  assert.equal(result.evolved, true)
  assert.equal(result.evolution.level, 2)
  current = result.collection
  result = awardTreasureLearningXp(current, { moduleId: 'math', eventId: 'win-1', amount: 25, at: 3 })
  assert.equal(result.awarded, false)
  assert.equal(result.collection.treasureLoadout.itemProgress['moon-fox'].xp, 25)
  result = awardTreasureLearningXp(current, { moduleId: 'math', eventId: 'win-2', amount: 35, at: 4 })
  assert.equal(result.evolution.level, 3)
  assert.equal(getTreasureEvolution({ xp: 60 }).name, 'Legendary Helper')
})

test('using a treasure power records module experience without counting a learning win', () => {
  const active = setActiveTreasure(collection, 'math', 'rainbow-backpack', 1)
  const result = activateTreasurePower(active, { moduleId: 'math', itemId: 'rainbow-backpack', eventId: 'power-1', at: 2 })
  const progress = result.collection.treasureLoadout.itemProgress['rainbow-backpack']
  assert.equal(progress.xp, 2)
  assert.equal(progress.powerUses, 1)
  assert.equal(progress.plays, 0)
  assert.deepEqual(progress.modules, ['math'])
})

test('cloud merge keeps module choices, highest XP, and unique events', () => {
  const merged = mergeTreasureLoadouts({
    activeByModule: { math: 'moon-fox' }, updatedAt: 20,
    itemProgress: { 'moon-fox': { xp: 31, plays: 2, modules: ['math'], lastUsedAt: 20 } },
    history: [{ eventId: 'a', at: 20 }],
  }, {
    activeByModule: { phonics: 'junior-telescope' }, updatedAt: 10,
    itemProgress: { 'moon-fox': { xp: 25, plays: 3, powerUses: 2, modules: ['phonics'], lastUsedAt: 10 } },
    history: [{ eventId: 'a', at: 20 }, { eventId: 'b', at: 10 }],
  })
  assert.deepEqual(merged.activeByModule, { phonics: 'junior-telescope', math: 'moon-fox' })
  assert.equal(merged.itemProgress['moon-fox'].xp, 31)
  assert.equal(merged.itemProgress['moon-fox'].plays, 3)
  assert.deepEqual(new Set(merged.itemProgress['moon-fox'].modules), new Set(['math', 'phonics']))
  assert.equal(merged.history.length, 2)
})

test('quest routes scale from three to five different learning modules by age', () => {
  for (const [ageGroup, required] of [['toddler', 3], ['early', 4], ['junior', 5]]) {
    const ready = {
      ...collection,
      treasureLoadout: { itemProgress: { 'junior-telescope': { xp: 25 } } },
    }
    const quest = getTreasureQuest(ready, 'junior-telescope', ageGroup)
    assert.equal(quest.locked, false)
    assert.equal(quest.required, required)
    assert.equal(new Set(quest.steps).size, required)
    assert.ok(quest.nextName)
  }
})

test('an unevolved treasure quest stays locked while normal treasure XP still grows', () => {
  const active = setActiveTreasure(collection, 'math', 'moon-fox', 1)
  const result = processTreasureLearningWin(active, { moduleId: 'math', ageGroup: 'early', eventId: 'locked-win', at: 2 })
  assert.equal(result.awarded, true)
  assert.equal(result.questAdvanced, false)
  assert.equal(result.quest.locked, true)
  assert.equal(result.collection.treasureLoadout.itemProgress['moon-fox'].xp, 6)
})

test('finishing the ordered route unlocks a permanent effect, dust, and another route', () => {
  let current = setActiveTreasure({
    ...collection,
    sparkleDust: 3,
    treasureLoadout: { itemProgress: { 'junior-telescope': { xp: 25 } } },
  }, 'math', 'junior-telescope', 1)
  const firstQuest = getTreasureQuest(current, 'junior-telescope', 'early')
  let finalResult = null
  firstQuest.steps.forEach((moduleId, index) => {
    finalResult = advanceTreasureQuest(current, { moduleId, itemId: 'junior-telescope', ageGroup: 'early', eventId: `quest-${index}`, at: index + 2 })
    assert.equal(finalResult.advanced, true)
    current = finalResult.collection
  })
  assert.equal(finalResult.completed, true)
  assert.equal(current.sparkleDust, 15)
  assert.ok(current.treasureLoadout.questRewards['junior-telescope'].includes(firstQuest.reward.id))
  assert.deepEqual(getTreasureQuestRewards(current, 'junior-telescope', 'early').map(reward => reward.id), [firstQuest.reward.id])
  assert.equal(current.treasureLoadout.itemProgress['junior-telescope'].questWins, 1)
  const nextQuest = getTreasureQuest(current, 'junior-telescope', 'early')
  assert.equal(nextQuest.cycle, 2)
  assert.notEqual(nextQuest.id, firstQuest.id)
})

test('a quest step and XP award are idempotent for the same learning event', () => {
  let current = setActiveTreasure({
    ...collection,
    treasureLoadout: { itemProgress: { 'junior-telescope': { xp: 25 } } },
  }, 'math', 'junior-telescope', 1)
  const quest = getTreasureQuest(current, 'junior-telescope', 'early')
  current = setActiveTreasure(current, quest.nextModule, 'junior-telescope', 2)
  const first = processTreasureLearningWin(current, { moduleId: quest.nextModule, ageGroup: 'early', eventId: 'same-event', at: 3 })
  const duplicate = processTreasureLearningWin(first.collection, { moduleId: quest.nextModule, ageGroup: 'early', eventId: 'same-event', at: 4 })
  assert.equal(first.questAdvanced, true)
  assert.equal(duplicate.awarded, false)
  assert.equal(duplicate.collection.treasureLoadout.itemProgress['junior-telescope'].xp, 31)
  assert.equal(duplicate.collection.treasureLoadout.questHistory.length, 1)
})
