import test from 'node:test'
import assert from 'node:assert/strict'
import { buildEarlyPersonalisedStory, buildJuniorPersonalisedPassage } from '../src/utils/personalisedStories.js'

test('early personalised story uses the child name and weakest practised frontier', () => {
  const story = buildEarlyPersonalisedStory({ learningJourney: { skills: { phonics: { attempts: 8, mastery: 30 }, math: { attempts: 8, mastery: 80 } } } }, 'Yaagvi Veed')
  assert.equal(story.frontierSkill, 'phonics')
  assert.match(story.title, /Yaagvi/)
  assert.equal(story.pages.length, 5)
})

test('junior personalised passage turns a maths frontier into comprehension', () => {
  const passage = buildJuniorPersonalisedPassage({ learningJourney: { skills: { fractions: { attempts: 10, mastery: 25 }, reading: { attempts: 10, mastery: 75 } } } }, 'Rohan')
  assert.equal(passage.frontierSkill, 'fractions')
  assert.match(passage.title, /Rohan/)
  assert.equal(passage.questions.length, 3)
})
