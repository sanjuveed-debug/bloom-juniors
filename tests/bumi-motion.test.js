import test from 'node:test'
import assert from 'node:assert/strict'
import { getBumiGaze, getBumiMotion } from '../src/utils/bumiMotion.js'
test('idle breath and leaves change continuously without pose swapping', () => {
  const a = getBumiMotion('idle', 1000), b = getBumiMotion('idle', 1016)
  assert.notEqual(a.scaleY, b.scaleY)
  assert.ok(Math.abs(a.scaleY - b.scaleY) < .001)
  assert.ok(Math.abs(a.leaf - b.leaf) < .2)
})
test('a wave raises and lowers an articulated arm with neutral endpoints', () => {
  assert.ok(Math.abs(getBumiMotion('wave', 0).leftArm) < 3)
  assert.ok(getBumiMotion('wave', 700).leftArm > 100)
  assert.ok(Math.abs(getBumiMotion('wave', 2200).leftArm) < 3)
})
test('blink closes and opens smoothly; reduced motion freezes all ambient movement', () => {
  assert.ok(getBumiMotion('idle', 3200).blink < .1)
  assert.equal(getBumiMotion('idle', 3400).blink, 1)
  assert.deepEqual(getBumiMotion('idle', 3200, { reduced: true }), getBumiMotion('idle', 9900, { reduced: true }))
  assert.equal(getBumiMotion('celebrate', 100, { reduced: true }).lift, 0)
})
test('gaze is bounded nearby and returns to centre outside the attention area', () => {
  const rect = { left: 100, top: 100, width: 200, height: 200 }
  assert.deepEqual(getBumiGaze(200, 210, rect), { x: 0, y: 0 })
  assert.deepEqual(getBumiGaze(490, 210, rect), { x: 1, y: 0 })
  assert.deepEqual(getBumiGaze(1000, 1000, rect), { x: 0, y: 0 })
})
test('reaction limits end celebration, and talking has no movement under reduced motion', () => {
  assert.equal(getBumiMotion('celebrate', 1000, { autoIdle: 500 }).mouth, 0)
  assert.equal(getBumiMotion('idle', 1000, { reduced: true, talking: true }).mouth, 0)
})
