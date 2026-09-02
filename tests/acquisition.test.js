import test from 'node:test'
import assert from 'node:assert/strict'
import { attributionLabel, buildFirstTouchAttribution, normalizeAttribution } from '../src/utils/acquisition.js'

test('first-touch attribution prefers landing UTM values and stores no query string', () => {
  const attribution = buildFirstTouchAttribution({
    pageUrl: 'https://bloomjuniors.com/families?utm_source=chatgpt.com&utm_medium=answer&utm_campaign=parents',
    referrer: 'https://chatgpt.com/c/example-private-conversation',
    timezone: 'Asia/Dubai',
    language: 'en-GB',
    capturedAt: '2026-08-10T08:00:00.000Z',
  })

  assert.equal(attribution.source, 'chatgpt.com')
  assert.equal(attribution.medium, 'answer')
  assert.equal(attribution.campaign, 'parents')
  assert.equal(attribution.landingPath, '/families')
  assert.equal(attribution.referrerHost, 'chatgpt.com')
  assert.equal(JSON.stringify(attribution).includes('example-private-conversation'), false)
})

test('direct and historical attribution remain explicit buckets', () => {
  assert.equal(buildFirstTouchAttribution({ pageUrl: 'https://bloomjuniors.com/' }).source, 'direct')
  assert.equal(normalizeAttribution().source, 'unknown')
  assert.equal(attributionLabel('direct'), 'Direct / untagged')
  assert.equal(attributionLabel('unknown'), 'Pre-tracking / unknown')
})

test('external referrer becomes a referral source when UTM is absent', () => {
  const attribution = buildFirstTouchAttribution({
    pageUrl: 'https://bloomjuniors.com/',
    referrer: 'https://www.google.com/search?q=learning+games',
  })
  assert.equal(attribution.source, 'www.google.com')
  assert.equal(attribution.medium, 'referral')
  assert.equal(attribution.referrerHost, 'www.google.com')
})
