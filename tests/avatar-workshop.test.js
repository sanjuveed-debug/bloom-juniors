import test from 'node:test'
import assert from 'node:assert/strict'
import {
  awardBloomCoin,
  equipAvatarItem,
  mergeAvatarWorkshops,
  normalizeAvatarWorkshop,
  purchaseAvatarItem,
} from '../src/utils/avatarWorkshop.js'

test('new workshop starts with the free Bloom badge', () => {
  const workshop = normalizeAvatarWorkshop()

  assert.equal(workshop.coins, 0)
  assert.equal(workshop.lifetimeCoins, 0)
  assert.deepEqual(workshop.owned, ['starter-badge'])
  assert.equal(workshop.equipped.badge, 'starter-badge')
})

test('an activity awards one coin only once per day', () => {
  const first = awardBloomCoin({}, 'phonics', '2026-07-29', 100)
  const repeat = awardBloomCoin(first.progress, 'phonics', '2026-07-29', 200)

  assert.equal(first.awarded, true)
  assert.equal(first.workshop.coins, 1)
  assert.equal(repeat.awarded, false)
  assert.equal(repeat.workshop.coins, 1)
  assert.equal(first.progress.retentionTelemetry.events[0].type, 'bloom_coin_earned')
  assert.equal(first.progress.retentionTelemetry.events[0].module, 'phonics')
  assert.equal(repeat.progress.retentionTelemetry.events.length, 1)
})

test('different activities and a new day can each award a coin', () => {
  const first = awardBloomCoin({}, 'phonics', '2026-07-29', 100)
  const second = awardBloomCoin(first.progress, 'math', '2026-07-29', 200)
  const nextDay = awardBloomCoin(second.progress, 'phonics', '2026-07-30', 300)

  assert.equal(nextDay.workshop.coins, 3)
  assert.equal(nextDay.workshop.lifetimeCoins, 3)
})

test('buying an item spends coins and equips it', () => {
  let progress = {}
  progress = awardBloomCoin(progress, 'phonics', '2026-07-29', 100).progress
  progress = awardBloomCoin(progress, 'math', '2026-07-29', 200).progress

  const purchase = purchaseAvatarItem(progress.avatarWorkshop, 'wonder-glasses', 300)

  assert.equal(purchase.purchased, true)
  assert.equal(purchase.workshop.coins, 0)
  assert.ok(purchase.workshop.owned.includes('wonder-glasses'))
  assert.equal(purchase.workshop.equipped.face, 'wonder-glasses')
})

test('an item cannot be bought without enough coins', () => {
  const progress = awardBloomCoin({}, 'phonics', '2026-07-29', 100).progress
  const purchase = purchaseAvatarItem(progress.avatarWorkshop, 'story-crown', 200)

  assert.equal(purchase.purchased, false)
  assert.equal(purchase.reason, 'coins')
  assert.equal(purchase.workshop.coins, 1)
  assert.ok(!purchase.workshop.owned.includes('story-crown'))
})

test('an owned item can be equipped again', () => {
  let progress = {}
  progress = awardBloomCoin(progress, 'phonics', '2026-07-29', 100).progress
  const purchased = purchaseAvatarItem(progress.avatarWorkshop, 'sunny-cap', 200)
  const equipped = equipAvatarItem(purchased.workshop, 'sunny-cap', 300)

  assert.equal(equipped.equipped, true)
  assert.equal(equipped.workshop.equipped.head, 'sunny-cap')
})

test('offline workshop ledgers merge without losing coins or purchases', () => {
  let localProgress = {}
  localProgress = awardBloomCoin(localProgress, 'phonics', '2026-07-29', 100).progress
  localProgress = awardBloomCoin(localProgress, 'math', '2026-07-29', 200).progress
  const localPurchase = purchaseAvatarItem(localProgress.avatarWorkshop, 'sunny-cap', 300)

  let cloudProgress = {}
  cloudProgress = awardBloomCoin(cloudProgress, 'story', '2026-07-29', 150).progress
  cloudProgress = awardBloomCoin(cloudProgress, 'science', '2026-07-29', 250).progress

  const merged = mergeAvatarWorkshops(localPurchase.workshop, cloudProgress.avatarWorkshop)

  assert.equal(merged.lifetimeCoins, 4)
  assert.equal(merged.coins, 3)
  assert.ok(merged.owned.includes('sunny-cap'))
  assert.equal(Object.keys(merged.awards).length, 4)
})
