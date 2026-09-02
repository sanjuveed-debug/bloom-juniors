import test from 'node:test'
import assert from 'node:assert/strict'

import {
  countStarterPathCompletions,
  getStarterPathCompletion,
  getStarterPathState,
  STARTER_PATH_LENGTH,
} from '../src/utils/starterPath.js'

function progressWith(modules) {
  return { sessions: modules.map((module, index) => ({ module, date: 1000 + index })) }
}

test('starter path gives each age band one deterministic existing activity', () => {
  assert.equal(getStarterPathState({}, 'toddler').module.id, 'alphabet')
  assert.equal(getStarterPathState({}, 'early').module.id, 'phonics')
  assert.equal(getStarterPathState({}, 'junior').module.id, 'reading')
})

test('starter path advances by completed learning sessions without a calendar reset', () => {
  const progress = progressWith(['phonics', 'math', 'phonics'])
  const state = getStarterPathState(progress, 'early')
  assert.equal(state.active, true)
  assert.equal(state.completed, 3)
  assert.equal(state.step, 4)
  assert.equal(state.module.id, 'shapes')
  assert.deepEqual(state.steps.map(step => step.state), [
    'done', 'done', 'done', 'active', 'waiting', 'waiting', 'waiting',
  ])
})

test('unknown and bonus sessions do not advance the starter path', () => {
  const progress = progressWith(['arcade', 'wonderwhy', 'phonics'])
  assert.equal(countStarterPathCompletions(progress, 'early'), 1)
  assert.equal(getStarterPathState(progress, 'early').module.id, 'math')
})

test('the seventh completion hands off to the normal journey', () => {
  const before = progressWith(['reading', 'timestables', 'spelling', 'reading', 'timestables', 'reading'])
  const after = getStarterPathCompletion(before, 'junior', 'spelling')
  assert.equal(after.completed, STARTER_PATH_LENGTH)
  assert.equal(after.active, false)
  assert.equal(after.module, null)
})
