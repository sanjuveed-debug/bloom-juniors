import test from 'node:test'
import assert from 'node:assert/strict'
import { getDailyJourneyState } from '../src/utils/dailyJourney.js'

const module = (id) => ({ id, label: id, emoji: '⭐' })

test('daily journey presents only the two required adventures', () => {
  const state = getDailyJourneyState({
    steps: [
      { module: module('one'), done: false },
      { module: module('two'), done: false },
      { module: module('extra'), done: false },
    ],
    required: 2,
  })
  assert.deepEqual(state.steps.map(step => step.module.id), ['one', 'two'])
  assert.equal(state.nextStep.module.id, 'one')
  assert.equal(state.phase, 'playing')
})

test('daily journey opens the treasure after two completed adventures', () => {
  const steps = [
    { module: module('one'), done: true },
    { module: module('two'), done: true },
  ]
  assert.equal(getDailyJourneyState({ steps, required: 2 }).phase, 'ready')
  assert.equal(getDailyJourneyState({ steps, required: 2, claimed: true }).phase, 'claimed')
})

test('saved completion count is clamped to the journey requirement', () => {
  const state = getDailyJourneyState({ steps: [{ module: module('one'), done: false }], doneCount: 99, required: 2 })
  assert.equal(state.completed, 2)
  assert.equal(state.ready, true)
})
