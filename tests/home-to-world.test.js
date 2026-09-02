import test from 'node:test'
import assert from 'node:assert/strict'

import {
  HOME_TO_WORLD_LESSONS,
  HOME_TO_WORLD_ORDER,
  getHomeToWorldLesson,
} from '../src/data/homeToWorldCurriculum.js'
import {
  completeHomeToWorldLesson,
  getHomeToWorldView,
  isHomeToWorldLessonUnlocked,
  mergeHomeToWorld,
  normalizeHomeToWorld,
} from '../src/utils/homeToWorld.js'
import { mergeProgress } from '../src/services/cloudStore.js'

test('home-to-world curriculum has seven sequenced discoveries with three age variants', () => {
  assert.equal(HOME_TO_WORLD_LESSONS.length, 7)
  assert.equal(HOME_TO_WORLD_ORDER.length, 7)
  assert.equal(new Set(HOME_TO_WORLD_ORDER).size, 7)

  for (const lesson of HOME_TO_WORLD_LESSONS) {
    assert.equal(lesson.choices.length, 3)
    assert.equal(lesson.clues.length, 3)
    for (const ageGroup of ['toddler', 'early', 'junior']) {
      const variant = getHomeToWorldLesson(lesson.id, ageGroup)
      assert.ok(variant.explanation.length > 35)
      assert.ok(variant.offline.length > 20)
      assert.ok(variant.parentPrompt.length > 20)
    }
  }
})

test('discoveries unlock sequentially without a calendar gate', () => {
  const empty = normalizeHomeToWorld()
  assert.equal(isHomeToWorldLessonUnlocked(empty, HOME_TO_WORLD_ORDER[0]), true)
  assert.equal(isHomeToWorldLessonUnlocked(empty, HOME_TO_WORLD_ORDER[1]), false)

  const first = completeHomeToWorldLesson(empty, HOME_TO_WORLD_ORDER[0], {
    choice: 'model',
    evidence: ['door', 'room', 'path'],
    reflection: 'matched',
    completedAt: 100,
  })
  assert.equal(first.firstCompletion, true)
  assert.equal(isHomeToWorldLessonUnlocked(first.state, HOME_TO_WORLD_ORDER[1]), true)
  assert.equal(isHomeToWorldLessonUnlocked(first.state, HOME_TO_WORLD_ORDER[2]), false)
})

test('replaying a discovery preserves its first completion and reward signal', () => {
  const first = completeHomeToWorldLesson({}, HOME_TO_WORLD_ORDER[0], {
    choice: 'model',
    evidence: ['door'],
    completedAt: 100,
  })
  const replay = completeHomeToWorldLesson(first.state, HOME_TO_WORLD_ORDER[0], {
    evidence: ['room'],
    reflection: 'connected',
    completedAt: 200,
  })

  assert.equal(replay.firstCompletion, false)
  assert.equal(replay.state.completed[HOME_TO_WORLD_ORDER[0]].completedAt, 100)
  assert.equal(replay.state.completed[HOME_TO_WORLD_ORDER[0]].lastVisitedAt, 200)
  assert.deepEqual(replay.state.completed[HOME_TO_WORLD_ORDER[0]].evidence.sort(), ['door', 'room'])
})

test('all seven discoveries create the permanent My Place Story artifact', () => {
  let state = {}
  HOME_TO_WORLD_ORDER.forEach((id, index) => {
    state = completeHomeToWorldLesson(state, id, {
      choice: 'model',
      evidence: ['one', 'two', 'three'],
      reflection: 'connected',
      ageGroup: 'early',
      completedAt: index + 1,
    }).state
  })

  const view = getHomeToWorldView({ homeToWorld: state }, 'early')
  assert.equal(view.completed, 7)
  assert.equal(view.complete, true)
  assert.equal(view.artifact.id, 'my-place-story-v1')
  assert.equal(view.artifact.entries.length, 7)
})

test('age variants deepen the same place concept and roots lesson records both strands', () => {
  const toddler = getHomeToWorldLesson('place-home-map', 'toddler')
  const early = getHomeToWorldLesson('place-home-map', 'early')
  const junior = getHomeToWorldLesson('place-home-map', 'junior')
  assert.notEqual(toddler.question, early.question)
  assert.notEqual(early.explanation, junior.explanation)

  const roots = getHomeToWorldLesson('place-family-roots', 'junior')
  assert.deepEqual(roots.strands, ['people-place-time', 'roots-culture-meaning'])
  assert.ok(roots.arcs.includes('family-roots-belonging'))
})

test('cloud merge keeps discoveries and combines evidence from both devices', () => {
  const local = {
    completed: {
      'place-home-map': {
        id: 'place-home-map',
        completedAt: 100,
        lastVisitedAt: 120,
        evidence: ['door'],
      },
    },
    artifact: { id: 'my-place-story-v1', earnedAt: 500 },
    updatedAt: 500,
  }
  const cloud = {
    completed: {
      'place-home-map': {
        id: 'place-home-map',
        completedAt: 90,
        lastVisitedAt: 140,
        evidence: ['room'],
      },
      'place-neighbourhood-system': {
        id: 'place-neighbourhood-system',
        completedAt: 130,
        evidence: [],
      },
    },
    artifact: { id: 'my-place-story-v1', earnedAt: 450 },
    updatedAt: 450,
  }

  const merged = mergeHomeToWorld(local, cloud)
  assert.deepEqual(merged.completed['place-home-map'].evidence.sort(), ['door', 'room'])
  assert.equal(merged.completed['place-home-map'].completedAt, 90)
  assert.ok(merged.completed['place-neighbourhood-system'])
  assert.equal(merged.artifact.earnedAt, 450)

  const mainMerge = mergeProgress(
    { homeToWorld: local },
    { homeToWorld: cloud },
  )
  assert.ok(mainMerge.homeToWorld.completed['place-home-map'])
  assert.ok(mainMerge.homeToWorld.completed['place-neighbourhood-system'])
})
