import test from 'node:test'
import assert from 'node:assert/strict'
import {
  LEAVES_GREEN_ID,
  completeWonderWhyDiscovery,
  completeWonderDiscovery,
  approveFoundationSeasonLesson,
  getDailyFoundationAdventure,
  getFoundationSeasonView,
  getFoundationSeasonMapState,
  getNextWonderLesson,
  mergeWonderWhy,
  normalizeWonderWhy,
  SUNSET_RED_ID,
  WONDER_LESSONS,
} from '../src/utils/wonderWhy.js'
import {
  FOUNDATION_SEASON_ORDER,
  FOUNDATION_SEASON_WEEKS,
} from '../src/data/foundationSeasonCurriculum.js'

test('normalizes an empty Wonder Book', () => {
  assert.deepEqual(normalizeWonderWhy(), {
    version: 1,
    discoveries: {},
    lastCompletedDate: '',
    dailyAssignments: {},
    reviewApprovals: {},
    seasonArtifact: null,
  })
})

test('completes the leaves discovery only once', () => {
  const first = completeWonderWhyDiscovery({}, {
    prediction: 'reflects',
    testedColours: ['red', 'blue', 'green'],
    completedAt: 100,
    completedDate: '2026-07-26',
  })
  const again = completeWonderWhyDiscovery(first.state, {
    testedColours: ['green'],
    completedAt: 200,
    completedDate: '2026-07-27',
  })

  assert.equal(first.firstCompletion, true)
  assert.equal(again.firstCompletion, false)
  assert.equal(again.state.discoveries[LEAVES_GREEN_ID].completedAt, 100)
  assert.equal(again.state.discoveries[LEAVES_GREEN_ID].lastVisitedAt, 200)
})

test('merges discoveries and tested colours across devices', () => {
  const local = completeWonderWhyDiscovery({}, {
    prediction: 'reflects',
    testedColours: ['red'],
    completedAt: 100,
    completedDate: '2026-07-25',
  }).state
  const cloud = completeWonderWhyDiscovery({}, {
    prediction: 'reflects',
    testedColours: ['blue', 'green'],
    completedAt: 120,
    completedDate: '2026-07-26',
  }).state
  const merged = mergeWonderWhy(local, cloud)

  assert.deepEqual(merged.discoveries[LEAVES_GREEN_ID].testedColours.sort(), ['blue', 'green', 'red'])
  assert.equal(merged.discoveries[LEAVES_GREEN_ID].completedAt, 100)
  assert.equal(merged.lastCompletedDate, '2026-07-26')
})

test('offers sunset after leaves and continues into the wider foundation adventures', () => {
  const leaves = completeWonderWhyDiscovery({}, {
    testedColours: ['red', 'blue', 'green'],
  }).state
  assert.equal(getNextWonderLesson({ wonderWhy: leaves }).id, SUNSET_RED_ID)

  const both = completeWonderDiscovery(leaves, SUNSET_RED_ID, {
    testedColours: ['noon', 'sunset'],
  }).state
  assert.equal(getNextWonderLesson({ wonderWhy: both }).id, 'bridge-strong-v1')
  assert.equal(WONDER_LESSONS.length, 28)
})

test('the season contains four weeks of seven unique playable discoveries', () => {
  assert.equal(FOUNDATION_SEASON_WEEKS.length, 4)
  assert.ok(FOUNDATION_SEASON_WEEKS.every(week => week.lessonIds.length === 7))
  assert.equal(new Set(FOUNDATION_SEASON_ORDER).size, 28)
  assert.deepEqual(
    new Set(WONDER_LESSONS.map(lesson => lesson.id)),
    new Set(FOUNDATION_SEASON_ORDER),
  )
})

test('daily foundation adventures follow the connected four-week order', () => {
  const first = getDailyFoundationAdventure({}, '2026-07-26')
  const completed = completeWonderDiscovery({}, first.id, {
    completedAt: 100,
    completedDate: '2026-07-26',
  }).state

  assert.equal(first.id, LEAVES_GREEN_ID)
  assert.equal(getDailyFoundationAdventure({ wonderWhy: completed }, '2026-07-27').id, SUNSET_RED_ID)
})

test('completing a foundation adventure keeps the same assignment for that day', () => {
  const date = '2026-07-26'
  const before = getDailyFoundationAdventure({}, date)
  const completed = completeWonderDiscovery({}, before.id, {
    completedDate: date,
  }).state

  assert.equal(getDailyFoundationAdventure({ wonderWhy: completed }, date).id, before.id)
})

test('season map locks the next discovery until tomorrow and teases its question', () => {
  const date = '2026-07-26'
  const fresh = getFoundationSeasonMapState({}, date)
  assert.equal(fresh.canContinue, true)
  assert.equal(fresh.currentLesson.id, LEAVES_GREEN_ID)

  const completed = completeWonderDiscovery({}, LEAVES_GREEN_ID, {
    completedAt: 100,
    completedDate: date,
  }).state
  const today = getFoundationSeasonMapState({ wonderWhy: completed }, date)
  assert.equal(today.completedToday, true)
  assert.equal(today.canContinue, false)
  assert.equal(today.nextLesson.id, SUNSET_RED_ID)

  const tomorrow = getFoundationSeasonMapState({ wonderWhy: completed }, '2026-07-27')
  assert.equal(tomorrow.completedToday, false)
  assert.equal(tomorrow.canContinue, true)
  assert.equal(tomorrow.currentLesson.id, SUNSET_RED_ID)
})

test('parent preview holds sensitive lessons until that lesson is approved', () => {
  let wonderWhy = {}
  for (const [index, lessonId] of FOUNDATION_SEASON_ORDER.slice(0, 6).entries()) {
    wonderWhy = completeWonderDiscovery(wonderWhy, lessonId, {
      completedAt: 100,
      completedDate: `2026-07-${String(20 + index).padStart(2, '0')}`,
    }).state
  }
  const progress = {
    wonderWhy,
    foundationProfile: {
      previewMode: 'preview-roots',
      updatedAt: 100,
    },
  }

  assert.equal(getDailyFoundationAdventure(progress, '2026-08-01').id, 'world-detective-mission-v1')
  wonderWhy = completeWonderDiscovery(wonderWhy, 'world-detective-mission-v1', {
    completedAt: 200,
    completedDate: '2026-08-01',
  }).state
  assert.equal(getDailyFoundationAdventure({ ...progress, wonderWhy }, '2026-08-02').id, 'maps-choices-v1')

  const approved = approveFoundationSeasonLesson(wonderWhy, 'family-story-time-v1')
  assert.equal(getDailyFoundationAdventure({ ...progress, wonderWhy: approved }, '2026-08-02').id, 'family-story-time-v1')
})

test('completing all 28 discoveries awards the permanent season artifact', () => {
  let wonderWhy = {}
  WONDER_LESSONS.forEach((lesson, index) => {
    wonderWhy = completeWonderDiscovery(wonderWhy, lesson.id, {
      completedAt: index + 1,
      completedDate: `2026-08-${String((index % 28) + 1).padStart(2, '0')}`,
    }).state
  })

  const season = getFoundationSeasonView({ wonderWhy })
  assert.equal(season.complete, true)
  assert.equal(season.completed, 28)
  assert.equal(season.familyMissionsCompleted, 4)
  assert.equal(season.artifact.id, 'foundation-compass-v1')
})

test('cloud merge preserves preview approvals and the earliest artifact', () => {
  const local = {
    reviewApprovals: { 'family-story-time-v1': true },
    seasonArtifact: { id: 'foundation-compass-v1', earnedAt: 200 },
  }
  const cloud = {
    reviewApprovals: { 'traditions-meaning-v1': true },
    seasonArtifact: { id: 'foundation-compass-v1', earnedAt: 100 },
  }
  const merged = mergeWonderWhy(local, cloud)

  assert.deepEqual(merged.reviewApprovals, {
    'family-story-time-v1': true,
    'traditions-meaning-v1': true,
  })
  assert.equal(merged.seasonArtifact.earnedAt, 100)
})
