import test from 'node:test'
import assert from 'node:assert/strict'
import {
  WEEKLY_BLOOM_ADVENTURES,
  chooseWeeklyBloomPath,
  getWeeklyBloomAdventureView,
  launchWeeklyBloomChapter,
  mergeWeeklyBloomAdventure,
  normalizeWeeklyBloomAdventure,
  settleWeeklyBloomAdventure,
} from '../src/utils/weeklyBloomAdventure.js'

const ages = ['toddler', 'early', 'junior']

function localNoon(dayOffset = 0) {
  const date = new Date(2026, 6, 1 + dayOffset, 12, 0, 0, 0)
  return date.getTime()
}

function completeChapter(progress, age, dayOffset) {
  const now = localNoon(dayOffset)
  let state = normalizeWeeklyBloomAdventure(progress.weeklyBloomAdventure, age)
  const chapter = WEEKLY_BLOOM_ADVENTURES[age].chapters[state.chapter]
  if (chapter.choice && !state.choices[state.chapter]) {
    state = chooseWeeklyBloomPath(
      { ...progress, weeklyBloomAdventure: state },
      age,
      chapter.choice.options[0].id,
      now,
    )
  }
  const launched = launchWeeklyBloomChapter(
    { ...progress, weeklyBloomAdventure: state },
    age,
    now,
  )
  const withSession = {
    ...progress,
    weeklyBloomAdventure: launched,
    sessions: [
      ...(progress.sessions || []),
      { module: chapter.module.id, date: now + 1_000, stars: 1 },
    ],
  }
  const settled = settleWeeklyBloomAdventure(withSession, age, now + 2_000)
  return { ...withSession, weeklyBloomAdventure: settled }
}

for (const age of ages) {
  test(`${age} adventure has seven playable chapters`, () => {
    const adventure = WEEKLY_BLOOM_ADVENTURES[age]
    assert.equal(adventure.chapters.length, 7)
    assert.ok(adventure.chapters.every(chapter => chapter.module.id && chapter.module.label))
  })

  test(`${age} completes as a seven-day story with a permanent artifact`, () => {
    let progress = { sessions: [] }
    for (let day = 0; day < 7; day += 1) {
      progress = completeChapter(progress, age, day)
      assert.equal(progress.weeklyBloomAdventure.chapter, day + 1)
      assert.equal(progress.weeklyBloomAdventure.history.length, day + 1)
    }

    const view = getWeeklyBloomAdventureView(progress, age, localNoon(7))
    assert.equal(view.complete, true)
    assert.equal(view.status, 'complete')
    assert.equal(view.completed, 7)
    assert.ok(view.adventure.artifact.name)
  })
}

test('launching does not advance until the launched module records a session', () => {
  const now = localNoon()
  const launched = launchWeeklyBloomChapter({}, 'early', now)
  assert.equal(launched.chapter, 0)
  assert.equal(launched.active.moduleId, 'phonics')

  const unchanged = settleWeeklyBloomAdventure(
    { weeklyBloomAdventure: launched, sessions: [{ module: 'math', date: now + 1_000 }] },
    'early',
    now + 2_000,
  )
  assert.equal(unchanged.chapter, 0)
  assert.ok(unchanged.active)
})

test('a completed chapter blocks the next launch until the next local day', () => {
  const progress = completeChapter({ sessions: [] }, 'early', 0)
  const sameDay = launchWeeklyBloomChapter(progress, 'early', localNoon(0) + 5_000)
  assert.equal(sameDay.chapter, 1)
  assert.equal(sameDay.active, null)
  assert.equal(getWeeklyBloomAdventureView(progress, 'early', localNoon(0) + 5_000).status, 'waiting')

  const nextDayChoice = chooseWeeklyBloomPath(progress, 'early', 'sun', localNoon(1))
  const nextDay = launchWeeklyBloomChapter(
    { ...progress, weeklyBloomAdventure: nextDayChoice },
    'early',
    localNoon(1),
  )
  assert.equal(nextDay.active.moduleId, 'math')
})

test('story choices are required and persist into chapter history', () => {
  const afterFirst = completeChapter({ sessions: [] }, 'early', 0)
  const blocked = launchWeeklyBloomChapter(afterFirst, 'early', localNoon(1))
  assert.equal(blocked.active, null)

  const chosen = chooseWeeklyBloomPath(afterFirst, 'early', 'moon', localNoon(1))
  assert.equal(chosen.choices[1], 'moon')
  const afterSecond = completeChapter(
    { ...afterFirst, weeklyBloomAdventure: chosen },
    'early',
    1,
  )
  assert.equal(afterSecond.weeklyBloomAdventure.history[1].choiceId, 'moon')
})

test('cloud merge keeps the furthest chapter and combines story memories', () => {
  const local = {
    ...normalizeWeeklyBloomAdventure({}, 'early'),
    chapter: 2,
    choices: { 1: 'sun' },
    history: [
      { chapter: 0, moduleId: 'phonics', date: '2026-07-01' },
      { chapter: 1, moduleId: 'math', date: '2026-07-02' },
    ],
    updatedAt: 200,
  }
  const cloud = {
    ...normalizeWeeklyBloomAdventure({}, 'early'),
    chapter: 3,
    choices: { 1: 'moon' },
    history: [{ chapter: 2, moduleId: 'story', date: '2026-07-03' }],
    updatedAt: 100,
  }

  const merged = mergeWeeklyBloomAdventure(local, cloud)
  assert.equal(merged.chapter, 3)
  assert.deepEqual(merged.history.map(entry => entry.chapter), [0, 1, 2])
  assert.equal(merged.choices[1], 'sun')
})
