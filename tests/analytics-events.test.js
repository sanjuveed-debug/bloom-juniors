import test from 'node:test'
import assert from 'node:assert/strict'
import {
  trackActivityComplete,
  trackEvent,
  trackEventOnce,
  trackRetentionOpen,
} from '../src/utils/analytics.js'

class MemoryStorage {
  constructor() {
    this.values = new Map()
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null
  }

  setItem(key, value) {
    this.values.set(key, String(value))
  }

  removeItem(key) {
    this.values.delete(key)
  }
}

test('trackEvent sends non-identifying event parameters through the existing gtag bridge', () => {
  const calls = []
  globalThis.localStorage = new MemoryStorage()
  globalThis.sessionStorage = new MemoryStorage()
  globalThis.window = { gtag: (...args) => calls.push(args) }

  trackEvent('landing_cta_click', { cta: 'start_free', location: 'hero' })

  assert.deepEqual(calls, [[
    'event',
    'landing_cta_click',
    { cta: 'start_free', location: 'hero' },
  ]])
})

test('trackEventOnce suppresses refresh duplicates in the selected storage scope', () => {
  const calls = []
  globalThis.localStorage = new MemoryStorage()
  globalThis.sessionStorage = new MemoryStorage()
  globalThis.window = { gtag: (...args) => calls.push(args) }

  assert.equal(trackEventOnce('chapter-2-today', 'weekly_adventure_return', { chapter: 2 }), true)
  assert.equal(trackEventOnce('chapter-2-today', 'weekly_adventure_return', { chapter: 2 }), false)
  assert.equal(calls.length, 1)

  assert.equal(trackEventOnce('chapter-2-today', 'weekly_adventure_return', { chapter: 2 }, 'local'), true)
  assert.equal(trackEventOnce('chapter-2-today', 'weekly_adventure_return', { chapter: 2 }, 'local'), false)
  assert.equal(calls.length, 2)
})

test('retention tracking does not label a day-eight return as exact D7', () => {
  const calls = []
  globalThis.localStorage = new MemoryStorage()
  globalThis.sessionStorage = new MemoryStorage()
  globalThis.window = { gtag: (...args) => calls.push(args) }
  globalThis.location = { search: '' }

  trackRetentionOpen({ profileId: 'profile-a', ageGroup: 'early' }, new Date('2026-07-01T12:00:00'))
  trackRetentionOpen({ profileId: 'profile-a', ageGroup: 'early' }, new Date('2026-07-01T18:00:00'))
  trackRetentionOpen({ profileId: 'profile-a', ageGroup: 'early' }, new Date('2026-07-02T12:00:00'))
  trackRetentionOpen({ profileId: 'profile-a', ageGroup: 'early' }, new Date('2026-07-09T12:00:00'))
  trackRetentionOpen({ profileId: 'profile-a', ageGroup: 'early' }, new Date('2026-07-10T12:00:00'))

  const names = calls.map(call => call[1])
  assert.equal(names.filter(name => name === 'daily_active_profile').length, 4)
  assert.equal(names.filter(name => name === 'retention_day_1').length, 1)
  assert.equal(names.filter(name => name === 'retention_day_7').length, 0)
})

test('push return records the notification open and first activity after return', () => {
  const calls = []
  globalThis.localStorage = new MemoryStorage()
  globalThis.sessionStorage = new MemoryStorage()
  globalThis.window = { gtag: (...args) => calls.push(args) }
  globalThis.location = { search: '' }

  trackRetentionOpen({ profileId: 'profile-push', ageGroup: 'junior' }, new Date('2026-07-01T12:00:00'))
  globalThis.location.search = '?app=1&utm_source=return_push&utm_medium=push'
  trackRetentionOpen({ profileId: 'profile-push', ageGroup: 'junior' }, new Date('2026-07-02T12:00:00'))
  trackActivityComplete('reading', 'junior', 'profile-push')
  trackActivityComplete('science', 'junior', 'profile-push')

  const notification = calls.find(call => call[1] === 'notification_open')
  assert.equal(notification[2].notification_type, 'daily_reminder')
  const returnActivities = calls.filter(call => call[1] === 'return_activity')
  assert.equal(returnActivities.length, 1)
  assert.deepEqual(returnActivities[0][2], {
    module: 'reading',
    age_group: 'junior',
    return_source: 'notification',
    notification_type: 'daily_reminder',
    reminder_content: 'none',
    days_since_last: 1,
  })
})

test('pilot entry is recorded as the first-open return source', () => {
  const calls = []
  globalThis.localStorage = new MemoryStorage()
  globalThis.sessionStorage = new MemoryStorage()
  globalThis.window = { gtag: (...args) => calls.push(args) }
  globalThis.location = {
    search: '?app=1&utm_source=founding_pilot&utm_medium=family_invite&utm_campaign=founding_families_pilot',
  }

  const result = trackRetentionOpen(
    { profileId: 'pilot-profile', ageGroup: 'toddler' },
    new Date('2026-07-30T12:00:00'),
  )

  assert.equal(result.returnSource, 'founding_pilot')
  const daily = calls.find(call => call[1] === 'daily_active_profile')
  assert.equal(daily[2].return_source, 'founding_pilot')
})


test('exact D1 D3 D7 D14 D30 milestones deduplicate and omit identifiers', () => {
  const calls = []
  globalThis.localStorage = new MemoryStorage()
  globalThis.sessionStorage = new MemoryStorage()
  globalThis.window = { gtag: (...args) => calls.push(args) }
  globalThis.location = { search: '' }
  for (const day of [0, 1, 3, 7, 14, 30]) {
    const date = new Date(2026, 6, 1 + day, 12)
    trackRetentionOpen({ profileId: 'private-child-id', ageGroup: 'early' }, date)
    trackRetentionOpen({ profileId: 'private-child-id', ageGroup: 'early' }, date)
  }
  for (const day of [1, 3, 7, 14, 30]) {
    assert.equal(calls.filter(call => call[1] === `retention_day_${day}`).length, 1)
  }
  assert.ok(!JSON.stringify(calls).includes('private-child-id'))
})
