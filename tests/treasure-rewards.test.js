import test from 'node:test'
import assert from 'node:assert/strict'
import {
  claimTreasureReward,
  claimWonderTreasureReward,
  equipTreasureReward,
  getMysteryEggProgress,
  getTreasureStreakProgress,
  hatchMysteryEgg,
  normaliseTreasureCollection,
} from '../src/utils/treasureRewards.js'

test('a Secret World discovery awards one permanent room keepsake', () => {
  const discovery = { id: 'discovery:seed-one', seedId: 'rainbow', name: 'Prism Blossom' }
  const first = claimWonderTreasureReward({}, discovery, { treasure: 'Prism Petal Lamp', icon: '🌈' }, 10)
  const second = claimWonderTreasureReward(first.collection, discovery, { treasure: 'Prism Petal Lamp', icon: '🌈' }, 20)

  assert.equal(first.claimed, true)
  assert.equal(first.item.name, 'Prism Petal Lamp')
  assert.equal(first.collection.items.length, 1)
  assert.equal(second.claimed, false)
  assert.equal(second.collection.items.length, 1)
  assert.equal(getMysteryEggProgress(first.collection).feeds, 0)
})

test('first daily treasure is the Explorer Yaagvi Dolly', () => {
  const result = claimTreasureReward(undefined, {
    claimKey: 'early:2026-07-01',
    source: 'daily-path',
    earnedAt: 1,
  })

  assert.equal(result.claimed, true)
  assert.equal(result.item.id, 'explorer-dolly')
  assert.equal(result.collection.items.length, 1)
  assert.equal(result.collection.claimStreak, 1)
})

test('same daily chest cannot be claimed twice', () => {
  const first = claimTreasureReward(undefined, { claimKey: 'toddler:2026-07-01' })
  const second = claimTreasureReward(first.collection, { claimKey: 'toddler:2026-07-01' })

  assert.equal(second.claimed, false)
  assert.equal(second.collection.items.length, 1)
  assert.equal(Object.keys(second.collection.claims).length, 1)
})

test('seventh consecutive daily claim awards a rare treasure', () => {
  let collection = normaliseTreasureCollection()
  let seventh
  for (let day = 1; day <= 7; day += 1) {
    const date = `2026-07-${String(day).padStart(2, '0')}`
    seventh = claimTreasureReward(collection, { claimKey: `junior:${date}`, earnedAt: day })
    collection = seventh.collection
  }

  assert.equal(seventh.weekly, true)
  assert.equal(seventh.item.rarity, 'rare')
  assert.equal(collection.claimStreak, 7)
  assert.deepEqual(getTreasureStreakProgress(collection), {
    streak: 7,
    lastClaimDate: '2026-07-07',
    progress: 7,
    remaining: 0,
    rareUnlocked: true,
  })
})

test('missing a day resets the seven-day treasure streak', () => {
  const first = claimTreasureReward(undefined, { claimKey: 'early:2026-07-01' })
  const afterGap = claimTreasureReward(first.collection, { claimKey: 'early:2026-07-03' })

  assert.equal(afterGap.collection.claimStreak, 1)
  assert.equal(afterGap.weekly, false)
})

test('owned treasures can be placed in their room slot', () => {
  const reward = claimTreasureReward(undefined, { claimKey: 'early:2026-07-01' })
  const equipped = equipTreasureReward(reward.collection, reward.item)

  assert.equal(equipped.equipped.buddy, 'explorer-dolly')
})

test('unowned treasures cannot be equipped', () => {
  const collection = normaliseTreasureCollection()
  const equipped = equipTreasureReward(collection, { id: 'moon-fox', slot: 'buddy' })

  assert.deepEqual(equipped.equipped, {})
})

test('mystery egg grows from three different daily treasure claims', () => {
  let collection = normaliseTreasureCollection()
  for (let day = 1; day <= 3; day += 1) {
    collection = claimTreasureReward(collection, { claimKey: `early:2026-07-0${day}`, earnedAt: day }).collection
  }

  assert.deepEqual(getMysteryEggProgress(collection), {
    cycle: 1,
    feeds: 3,
    required: 3,
    ready: true,
    claimKeys: ['early:2026-07-01', 'early:2026-07-02', 'early:2026-07-03'],
  })
})

test('ready mystery egg hatches a permanent companion and starts a new egg', () => {
  let collection = normaliseTreasureCollection()
  for (let day = 1; day <= 3; day += 1) {
    collection = claimTreasureReward(collection, { claimKey: `junior:2026-07-0${day}`, earnedAt: day }).collection
  }
  const result = hatchMysteryEgg(collection, { earnedAt: 10 })

  assert.equal(result.hatched, true)
  assert.equal(result.item.id, 'egg-cloud-dragon')
  assert.equal(result.collection.items.some(item => item.id === 'egg-cloud-dragon'), true)
  assert.equal(result.collection.eggHatches.length, 1)
  assert.equal(getMysteryEggProgress(result.collection).feeds, 0)
  assert.equal(getMysteryEggProgress(result.collection).cycle, 2)
})
