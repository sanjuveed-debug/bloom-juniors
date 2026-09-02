import test from 'node:test'
import assert from 'node:assert/strict'

import { getAgeFoundationLesson } from '../src/data/foundationAdventureAges.js'
import { WONDER_LESSONS } from '../src/utils/wonderWhy.js'

test('every foundation adventure has a concrete toddler adaptation', () => {
  for (const base of WONDER_LESSONS) {
    const lesson = getAgeFoundationLesson(base, 'toddler')
    assert.equal(lesson.modeLabel, 'Little wonder')
    assert.equal(lesson.predictions.length, 2)
    assert.ok(lesson.question.length > 10)
    assert.ok(lesson.story.length > 30)
    assert.ok(lesson.explanation.length > 30)
    assert.ok(lesson.offline.length > 20)
    assert.equal(lesson.clues.length, 3)
  }
})

test('junior adventures explicitly frame the activity as evidence work', () => {
  for (const base of WONDER_LESSONS) {
    const lesson = getAgeFoundationLesson(base, 'junior')
    assert.equal(lesson.modeLabel, 'Evidence mission')
    assert.match(lesson.activityPrompt, /^Evidence check:/)
    assert.equal(lesson.predictions.length, 3)
  }
})
