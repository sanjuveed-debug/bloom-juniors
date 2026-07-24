import test from 'node:test'
import assert from 'node:assert/strict'
import { buildParentProgressStory, PARENT_STORY_MODULES } from '../src/utils/parentProgressStory.js'

const DAY = 24 * 60 * 60 * 1000
const NOW = Date.UTC(2026, 6, 16, 12)

function session(module, daysAgo, { stars = 3, accuracy = 80, duration = 180 } = {}) {
  return { module, date: NOW - daysAgo * DAY, stars, accuracy, duration, total: 5 }
}

test('the weekly story uses the real curriculum for every age band', () => {
  const expected = {
    toddler: ['Colours', 'Numbers', 'Letters'],
    early: ['Phonics', 'Number World', 'Story Room'],
    junior: ['Times Tables', 'Reading', 'Science Quest'],
  }
  for (const ageGroup of Object.keys(expected)) {
    const labels = PARENT_STORY_MODULES[ageGroup].map(([, label]) => label)
    expected[ageGroup].forEach(label => assert.ok(labels.includes(label), `${ageGroup} should include ${label}`))
    const story = buildParentProgressStory({}, 'Ari', ageGroup, NOW)
    assert.equal(story.ageGroup, ageGroup)
    assert.equal(story.activities.length, 3)
  }
})
test('current and previous weeks are separated and produce a useful trend', () => {
  const progress = {
    sessions: [
      session('math', 1, { stars: 5, accuracy: 100, duration: 300 }),
      session('phonics', 2, { stars: 3, accuracy: 80, duration: 120 }),
      session('story', 4, { stars: 2, accuracy: 70, duration: 180 }),
      session('math', 9, { stars: 2, accuracy: 60, duration: 60 }),
    ],
  }
  const story = buildParentProgressStory(progress, 'Yaagvi', 'early', NOW)
  assert.equal(story.current.sessions, 3)
  assert.equal(story.current.stars, 10)
  assert.equal(story.current.minutes, 10)
  assert.equal(story.current.activeDays, 3)
  assert.equal(story.current.accuracy, 83)
  assert.equal(story.previous.sessions, 1)
  assert.equal(story.trend, 2)
  assert.match(story.narrative, /3 adventures across 3 days/)
})

test('strength, next step and favourite combine mastery with actual play', () => {
  const progress = {
    sessions: [session('reading', 1), session('reading', 2), session('grammar', 3)],
    learningJourney: {
      skills: {
        reading: { attempts: 20, mastery: 92 },
        grammar: { attempts: 15, mastery: 48 },
        spelling: { attempts: 10, mastery: 70 },
      },
    },
  }
  const story = buildParentProgressStory(progress, 'Rohan', 'junior', NOW)
  assert.equal(story.skills.strongest.id, 'reading')
  assert.equal(story.skills.developing.id, 'grammar')
  assert.equal(story.skills.favourite.id, 'reading')
  assert.match(story.headline, /Reading/)
  assert.equal(new Set(story.activities.map(item => item.id)).size, 3)
  assert.equal(story.activities[0].id, 'grammar')
})

test('a new child receives a warm starting story rather than empty analytics', () => {
  const story = buildParentProgressStory({}, 'Mira', 'toddler', NOW)
  assert.equal(story.current.sessions, 0)
  assert.equal(story.current.accuracy, null)
  assert.match(story.headline, /next learning story starts here/)
  assert.match(story.narrative, /one short adventure/i)
  assert.equal(story.activities.length, 3)
  assert.ok(story.activities.every(item => item.minutes === 5))
})

test('the report connects learning to companions, treasure, world and dream project', () => {
  const progress = {
    totalStars: 30,
    sessions: [session('numbers', 1)],
    treasureCollection: { items: [{ id: 'a' }, { id: 'b' }], sparkleDust: 12 },
    wonderWorld: { discoveries: [{ name: 'Prism Blossom' }], plots: [{ seedId: 'rainbow' }, null, null] },
    dreamProject: { projectId: 'rainbow-treehouse', stage: 2, spentBundles: 2 },
  }
  const story = buildParentProgressStory(progress, 'Jasmine', 'toddler', NOW)
  assert.equal(story.companion.stage.name, 'Trail Buddy')
  assert.equal(story.treasures.owned, 2)
  assert.equal(story.world.discoveries, 1)
  assert.equal(story.world.planted, 1)
  assert.equal(story.dream.project.id, 'rainbow-treehouse')
  assert.equal(story.dream.progressPercent, 33)
})
