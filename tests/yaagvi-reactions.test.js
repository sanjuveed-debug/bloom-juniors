import test from 'node:test'
import assert from 'node:assert/strict'
import { getYaagviReaction } from '../src/utils/yaagviReactions.js'

test('a first mistake makes Yaagvi think without revealing an answer', () => {
  const reaction = getYaagviReaction('wrong', { attempt: 1 })
  assert.equal(reaction.state, 'think')
  assert.match(reaction.speech, /look once more/i)
})

test('a repeated mistake makes Yaagvi point to the learning hint', () => {
  const reaction = getYaagviReaction('wrong', { attempt: 2 })
  assert.equal(reaction.state, 'point')
  assert.match(reaction.speech, /clue/i)
})

test('three correct answers produce a larger celebration', () => {
  const reaction = getYaagviReaction('correct', { streak: 3 })
  assert.equal(reaction.state, 'celebrate')
})

test('completion turns the learning result into treasure time', () => {
  const reaction = getYaagviReaction('complete')
  assert.equal(reaction.state, 'dance')
  assert.match(reaction.speech, /treasure/i)
})
