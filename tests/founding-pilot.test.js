import test from 'node:test'
import assert from 'node:assert/strict'
import {
  enrollFoundingPilot,
  FOUNDING_PILOT_CAMPAIGN,
  getFoundingPilotStartUrl,
  getFoundingPilotState,
} from '../src/utils/foundingPilot.js'

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
}

test('pilot enrollment is durable and preserves the first enrollment date', () => {
  const storage = new MemoryStorage()
  const first = enrollFoundingPilot(storage, new Date('2026-07-30T10:00:00Z'))
  const second = enrollFoundingPilot(storage, new Date('2026-07-31T10:00:00Z'))

  assert.equal(first.enrolledAt, '2026-07-30T10:00:00.000Z')
  assert.deepEqual(second, first)
  assert.deepEqual(getFoundingPilotState(storage), first)
})

test('pilot start URL carries app entry and campaign attribution', () => {
  const url = new URL(getFoundingPilotStartUrl('https://bloomjuniors.com/'))
  assert.equal(url.origin, 'https://bloomjuniors.com')
  assert.equal(url.searchParams.get('app'), '1')
  assert.equal(url.searchParams.get('utm_source'), 'founding_pilot')
  assert.equal(url.searchParams.get('utm_medium'), 'family_invite')
  assert.equal(url.searchParams.get('utm_campaign'), FOUNDING_PILOT_CAMPAIGN)
})

