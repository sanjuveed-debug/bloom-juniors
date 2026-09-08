import test from 'node:test'
import assert from 'node:assert/strict'
import { createBloomQuiz, getBloomQuizPrize } from '../src/utils/bloomQuiz.js'

for (const ageGroup of ['toddler', 'early', 'junior']) {
  test(`Bloom quiz creates valid fresh questions for ${ageGroup}`, () => {
    const first = createBloomQuiz(ageGroup, { played: 0, seed: 'test-day' })
    const later = createBloomQuiz(ageGroup, { played: 6, seed: 'test-day' })
    assert.equal(first.length, ageGroup === 'toddler' ? 5 : 7)
    assert.ok(first.every(question => question.options.includes(question.answer)))
    assert.ok(first.every(question => new Set(question.options).size === question.options.length))
    assert.notDeepEqual(first.map(question => question.id), later.map(question => question.id))
  })
}

test('Bloom quiz prize rewards strong play without creating another currency', () => {
  assert.deepEqual(getBloomQuizPrize(7, 7, 'early'), {
    stars: 5,
    title: 'Golden Spotlight Chest',
    message: '7 clues powered this prize.',
  })
  assert.equal(getBloomQuizPrize(2, 7, 'junior').stars, 2)
})
