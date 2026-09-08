import test from 'node:test'
import assert from 'node:assert/strict'
import { getBumiFrame } from '../src/utils/bumiAnimation.js'
test('idle blink has closed eyes briefly, then returns to open eyes', () => {
  assert.equal(getBumiFrame('idle', 4900), 0)
  assert.equal(getBumiFrame('idle', 5050), 1)
  assert.equal(getBumiFrame('idle', 5210), 0)
})
test('wave uses two different hand poses then settles', () => {
  assert.equal(getBumiFrame('wave', 200), 2)
  assert.equal(getBumiFrame('wave', 400), 3)
  assert.equal(getBumiFrame('wave', 1500), 0)
})
test('thinking and celebration stay distinct; reduced motion retains expression', () => {
  assert.equal(getBumiFrame('think', 300), 4)
  assert.equal(getBumiFrame('celebrate', 300), 5)
  assert.equal(getBumiFrame('think', 9900, true), 4)
  assert.equal(getBumiFrame('celebrate', 9900, true), 5)
  assert.equal(getBumiFrame('idle', 5050, true), 0)
})
test('unknown states are quiet and an explicit duration ends a reaction', () => {
  assert.equal(getBumiFrame('unknown', -1), 0)
  assert.equal(getBumiFrame('wave', 350, false, 300), 0)
})
