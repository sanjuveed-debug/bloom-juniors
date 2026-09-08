import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getDailyJourneyState,
  getDailyJourneyWeek,
  getUnifiedDailyJourneyState,
} from '../src/utils/dailyJourney.js'

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

test('unified journey gives the child one next action in a stable order', () => {
  const steps = [
    { module: module('phonics'), done: false },
    { module: module('science'), done: false },
  ]
  assert.equal(getUnifiedDailyJourneyState({ steps, weeklyStatus: 'available' }).primary.type, 'weekly')
  assert.equal(getUnifiedDailyJourneyState({ steps, weeklyStatus: 'waiting' }).primary.type, 'learning')
  assert.equal(getUnifiedDailyJourneyState({ steps, doneCount: 2, weeklyStatus: 'available' }).primary.type, 'treasure')
  assert.equal(getUnifiedDailyJourneyState({ steps, doneCount: 2, weeklyStatus: 'waiting' }).primary.type, 'treasure')
  assert.equal(getUnifiedDailyJourneyState({ steps, doneCount: 2, claimed: true, weeklyStatus: 'waiting' }).primary.type, 'wonder')
  assert.equal(getUnifiedDailyJourneyState({ steps, doneCount: 2, claimed: true, weeklyStatus: 'waiting', wonderCompleted: true }).primary.type, 'explore')
})

test('seven-day rhythm counts distinct active days without punishing gaps', () => {
  const now = new Date(2026, 6, 27, 12).getTime()
  const progress = {
    sessions: [
      { module: 'phonics', date: new Date(2026, 6, 21, 9).getTime() },
      { module: 'math', date: new Date(2026, 6, 24, 9).getTime() },
      { module: 'story', date: new Date(2026, 6, 24, 10).getTime() },
      { module: 'science', date: new Date(2026, 6, 27, 9).getTime() },
    ],
  }
  const week = getDailyJourneyWeek(progress, now)
  assert.equal(week.days.length, 7)
  assert.equal(week.activeDays, 3)
  assert.equal(week.days.at(-1).today, true)
  assert.equal(week.days.at(-1).played, true)
})
