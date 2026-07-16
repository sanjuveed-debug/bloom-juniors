import test from 'node:test'
import assert from 'node:assert/strict'
import { buildNumberLineWindow } from '../src/utils/numberLine.js'

test('small one-more questions retain the familiar zero-to-nine number line', () => {
  assert.deepEqual(buildNumberLineWindow(7, 8), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
})

test('large one-more questions always include both the starting and next positions', () => {
  const numbers = buildNumberLineWindow(18, 19)
  assert.equal(numbers.length, 10)
  assert.equal(numbers.includes(18), true)
  assert.equal(numbers.includes(19), true)
  assert.deepEqual(numbers, [14, 15, 16, 17, 18, 19, 20, 21, 22, 23])
})

test('one-less questions near zero never create negative number positions', () => {
  const numbers = buildNumberLineWindow(2, 1)
  assert.equal(numbers[0], 0)
  assert.equal(numbers.includes(1), true)
  assert.equal(numbers.includes(2), true)
})
