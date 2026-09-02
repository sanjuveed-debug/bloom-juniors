import test from 'node:test'
import assert from 'node:assert/strict'

import {
  SCIENCE_INVESTIGATION_LESSONS,
  SCIENCE_INVESTIGATION_ORDER,
  SCIENCE_INVESTIGATION_TRAILS,
} from '../src/data/scienceInvestigationCurriculum.js'
import {
  completeScienceInvestigation,
  getScienceInvestigationView,
  isScienceLessonUnlocked,
  mergeScienceInvestigations,
  normalizeScienceInvestigations,
} from '../src/utils/scienceInvestigations.js'
import { mergeProgress } from '../src/services/cloudStore.js'

test('science curriculum contains four connected trails of four unique investigations', () => {
  assert.equal(SCIENCE_INVESTIGATION_TRAILS.length, 4)
  assert.ok(SCIENCE_INVESTIGATION_TRAILS.every(trail => trail.lessonIds.length === 4))
  assert.equal(SCIENCE_INVESTIGATION_ORDER.length, 16)
  assert.equal(new Set(SCIENCE_INVESTIGATION_ORDER).size, 16)
  assert.deepEqual(
    new Set(SCIENCE_INVESTIGATION_LESSONS.map(lesson => lesson.id)),
    new Set(SCIENCE_INVESTIGATION_ORDER),
  )
  for (const lesson of SCIENCE_INVESTIGATION_LESSONS) {
    assert.equal(lesson.predictionOptions.length, 3)
    assert.equal(lesson.evidence.length, 3)
    assert.ok(lesson.activity.length > 40)
    assert.ok(lesson.parentPrompt.length > 20)
  }
})

test('each trail unlocks in sequence while all four trail starts remain available', () => {
  const empty = normalizeScienceInvestigations()
  for (const trail of SCIENCE_INVESTIGATION_TRAILS) {
    assert.equal(isScienceLessonUnlocked(empty, trail.lessonIds[0]), true)
    assert.equal(isScienceLessonUnlocked(empty, trail.lessonIds[1]), false)
  }

  const first = completeScienceInvestigation(empty, 'science-sky-blue', {
    prediction: 'model',
    evidence: ['evidence-1', 'evidence-2', 'evidence-3'],
    reflection: 'matched',
    completedAt: 100,
  })
  assert.equal(first.firstCompletion, true)
  assert.equal(isScienceLessonUnlocked(first.state, 'science-rainbow'), true)
  assert.equal(isScienceLessonUnlocked(first.state, 'science-snow-white'), false)
})

test('repeat completion does not duplicate the investigation or first reward signal', () => {
  const first = completeScienceInvestigation({}, 'science-sky-blue', {
    prediction: 'model',
    completedAt: 100,
  })
  const replay = completeScienceInvestigation(first.state, 'science-sky-blue', {
    evidence: ['evidence-1'],
    completedAt: 200,
  })

  assert.equal(replay.firstCompletion, false)
  assert.equal(replay.state.completed['science-sky-blue'].completedAt, 100)
  assert.equal(replay.state.completed['science-sky-blue'].lastVisitedAt, 200)
})

test('four investigations award a trail badge and all sixteen award the Field Journal', () => {
  let state = {}
  SCIENCE_INVESTIGATION_ORDER.forEach((id, index) => {
    state = completeScienceInvestigation(state, id, {
      prediction: 'model',
      evidence: ['evidence-1', 'evidence-2', 'evidence-3'],
      reflection: 'matched',
      completedAt: index + 1,
    }).state
  })

  const view = getScienceInvestigationView({ scienceInvestigations: state })
  assert.equal(Object.keys(state.trailBadges).length, 4)
  assert.equal(view.completed, 16)
  assert.equal(view.complete, true)
  assert.equal(view.artifact.id, 'science-field-journal-v1')
})

test('cloud merge keeps investigations, evidence, badges, and earliest artifact from both devices', () => {
  const local = {
    completed: {
      'science-sky-blue': {
        id: 'science-sky-blue',
        completedAt: 100,
        lastVisitedAt: 120,
        evidence: ['evidence-1'],
      },
    },
    trailBadges: { 'light-sky': { id: 'light-detective', earnedAt: 300 } },
    artifact: { id: 'science-field-journal-v1', earnedAt: 500 },
    updatedAt: 500,
  }
  const cloud = {
    completed: {
      'science-sky-blue': {
        id: 'science-sky-blue',
        completedAt: 90,
        lastVisitedAt: 140,
        evidence: ['evidence-2'],
      },
      'science-seed-tree': {
        id: 'science-seed-tree',
        completedAt: 130,
        evidence: [],
      },
    },
    trailBadges: { 'living-systems': { id: 'living-systems-keeper', earnedAt: 400 } },
    artifact: { id: 'science-field-journal-v1', earnedAt: 450 },
    updatedAt: 450,
  }
  const merged = mergeScienceInvestigations(local, cloud)

  assert.deepEqual(merged.completed['science-sky-blue'].evidence.sort(), ['evidence-1', 'evidence-2'])
  assert.equal(merged.completed['science-sky-blue'].completedAt, 90)
  assert.ok(merged.completed['science-seed-tree'])
  assert.equal(Object.keys(merged.trailBadges).length, 2)
  assert.equal(merged.artifact.earnedAt, 450)
})

test('the main cloud progress merge preserves science investigations from both devices', () => {
  const merged = mergeProgress(
    {
      scienceInvestigations: {
        completed: { 'science-sky-blue': { id: 'science-sky-blue', completedAt: 100 } },
        updatedAt: 100,
      },
    },
    {
      scienceInvestigations: {
        completed: { 'science-seed-tree': { id: 'science-seed-tree', completedAt: 200 } },
        updatedAt: 200,
      },
    },
  )

  assert.ok(merged.scienceInvestigations.completed['science-sky-blue'])
  assert.ok(merged.scienceInvestigations.completed['science-seed-tree'])
})
