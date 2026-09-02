import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildPersonalizedReminder,
  buildReminderDeepLink,
} from '../src/utils/personalizedReminder.js'
import {
  getReturnDeepLinkTarget,
  isValidReturnTarget,
} from '../src/utils/returnDeepLink.js'
import { completeWonderDiscovery } from '../src/utils/wonderWhy.js'

test('personalized reminder prefers the next valid weekly chapter', () => {
  const reminder = buildPersonalizedReminder({
    profile: { id: 'child-1', name: 'Ava', age_group: 'early' },
    progress: { weeklyBloomAdventure: { chapter: 2, ageGroup: 'early' } },
    now: new Date('2026-07-25T12:00:00Z'),
  })

  assert.equal(reminder.target, 'story')
  assert.equal(reminder.moduleLabel, 'Story Tree')
  assert.equal(reminder.chapter, 'The Story Leaf')
  assert.match(reminder.content, /^weekly_early_v[1-3]_story$/)
  assert.ok(reminder.title.length <= 80)
  assert.ok(reminder.body.length <= 140)
})

test('personalized reminder falls back when a weekly module is not a safe deep link', () => {
  const reminder = buildPersonalizedReminder({
    profile: { id: 'child-2', name: 'Sam', age_group: 'early' },
    progress: { weeklyBloomAdventure: { chapter: 4, ageGroup: 'early' } },
    now: new Date('2026-07-25T12:00:00Z'),
  })

  assert.equal(reminder.target, 'phonics')
  assert.equal(reminder.chapter, '')
  assert.match(reminder.content, /^recommended_early_v[1-3]_phonics$/)
})

test('a child in a Foundation Season receives the next question as the return reason', () => {
  const wonderWhy = completeWonderDiscovery({}, 'leaves-green-v1', {
    completedAt: new Date('2026-07-24T10:00:00Z').getTime(),
    completedDate: '2026-07-24',
  }).state
  const reminder = buildPersonalizedReminder({
    profile: { id: 'child-3', name: 'Mia', age_group: 'early' },
    progress: { wonderWhy },
    now: new Date('2026-07-25T12:00:00Z'),
  })

  assert.equal(reminder.target, 'wonderwhy')
  assert.equal(reminder.moduleLabel, 'Foundation Season')
  assert.equal(reminder.chapter, 'How Our World Works')
  assert.match(reminder.body, /Why does the Sun look orange at sunset/)
  assert.match(reminder.content, /^foundation_early_week1_day2$/)
})

test('return deep links accept only modules available to the selected age', () => {
  assert.equal(getReturnDeepLinkTarget('toddler', '?target=alphabet'), 'alphabet')
  assert.equal(getReturnDeepLinkTarget('toddler', '?target=reading'), '')
  assert.equal(getReturnDeepLinkTarget('early', '?target=phonics'), 'phonics')
  assert.equal(getReturnDeepLinkTarget('early', '?target=science'), '')
  assert.equal(getReturnDeepLinkTarget('junior', '?target=reading'), 'reading')
  assert.equal(getReturnDeepLinkTarget('toddler', '?target=wonderwhy'), 'wonderwhy')
  assert.equal(getReturnDeepLinkTarget('early', '?target=wonderwhy'), 'wonderwhy')
  assert.equal(getReturnDeepLinkTarget('junior', '?target=wonderwhy'), 'wonderwhy')
  assert.equal(isValidReturnTarget('junior', 'games'), false)
})

test('reminder links preserve the safe target and measurable copy variant', () => {
  const recommendation = {
    target: 'phonics',
    content: 'weekly_early_v2_phonics',
  }
  assert.equal(
    buildReminderDeepLink(recommendation, 'return_push'),
    '/?app=1&target=phonics&utm_source=return_push&utm_medium=push&utm_content=weekly_early_v2_phonics',
  )
  assert.equal(
    buildReminderDeepLink(recommendation, 'return_reminder'),
    'https://bloomjuniors.com/?app=1&target=phonics&utm_source=return_reminder&utm_medium=email&utm_content=weekly_early_v2_phonics',
  )
})
