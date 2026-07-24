import test from 'node:test'
import assert from 'node:assert/strict'
import {
  deliverParentHighFive,
  getPendingHighFive,
  mergeParentHighFives,
  normalizeParentHighFives,
  queueParentHighFive,
} from '../src/utils/parentHighFives.js'

test('a parent can queue one short safe message and selected sticker', () => {
  const result = queueParentHighFive({}, { message: '  <b>So proud   of you!</b>  ', stickerId: 'rainbow', now: 100, id: 'one' })
  assert.equal(result.messages.length, 1)
  assert.equal(result.messages[0].message, 'So proud of you!')
  assert.equal(result.messages[0].sticker, '🌈')
  assert.equal(getPendingHighFive({ parentHighFives: result }).id, 'one')
})

test('another message cannot be queued while one is waiting for the child', () => {
  const first = queueParentHighFive({}, { message: 'First', now: 100, id: 'one' })
  const second = queueParentHighFive(first, { message: 'Second', now: 200, id: 'two' })
  assert.deepEqual(second.messages.map(item => item.id), ['one'])
})

test('opening a high-five permanently adds exactly one sticker', () => {
  const queued = queueParentHighFive({}, { message: 'Wonderful effort!', stickerId: 'trophy', now: 100, id: 'one' })
  const progress = { parentHighFives: queued, stickers: [] }
  const delivered = deliverParentHighFive(progress, 'one', 200)
  assert.equal(delivered.parentHighFives.messages[0].deliveredAt, 200)
  assert.equal(delivered.stickers.length, 1)
  assert.equal(delivered.stickers[0].emoji, '🏆')
  assert.equal(delivered.stickers[0].highFiveId, 'one')
  assert.equal(getPendingHighFive(delivered), null)
  assert.deepEqual(deliverParentHighFive(delivered, 'one', 300), delivered)
})

test('cloud merge preserves delivery status over an older pending copy', () => {
  const pending = queueParentHighFive({}, { message: 'Keep going!', now: 100, id: 'one' })
  const delivered = deliverParentHighFive({ parentHighFives: pending }, 'one', 250).parentHighFives
  const merged = mergeParentHighFives(pending, delivered)
  assert.equal(merged.messages.length, 1)
  assert.equal(merged.messages[0].deliveredAt, 250)
})

test('normalization limits history and message length', () => {
  const messages = Array.from({ length: 35 }, (_, index) => ({ id: String(index), message: 'x'.repeat(200), createdAt: index + 1 }))
  const normalized = normalizeParentHighFives({ messages })
  assert.equal(normalized.messages.length, 30)
  assert.equal(normalized.messages[0].id, '5')
  assert.equal(normalized.messages[0].message.length, 120)
})
