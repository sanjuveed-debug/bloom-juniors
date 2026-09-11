import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { applyFloatDiscovery } from '../src/utils/floatDiscovery.js'
import { applyCollectionAction, COLLECTION_ADVENTURES } from '../src/utils/collectionAdventure.js'

const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: process.argv.includes('--motion') ? 'no-preference' : 'reduce' })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/*', route => {
    const url = new URL(route.request().url())
    return url.hostname === '127.0.0.1' && !url.pathname.startsWith('/api/') ? route.continue() : route.abort()
  })
  await page.addInitScript(() => {
    window.dataLayer = []
    window.dataLayer.push = function (...entries) {
      for (const entry of entries) if (entry?.[0] === 'event') {
        const events = JSON.parse(sessionStorage.getItem('qa-funnel-events') || '[]')
        events.push(Array.from(entry))
        sessionStorage.setItem('qa-funnel-events', JSON.stringify(events))
      }
      return Array.prototype.push.apply(this, entries)
    }
  })
  const events = () => page.evaluate(() => JSON.parse(sessionStorage.getItem('qa-funnel-events') || '[]'))
  const button = name => page.getByRole('button', { name })
  await page.goto('http://127.0.0.1:5173/play/shadow?utm_source=qa_test&utm_medium=direct&utm_campaign=conversion_review')
  await expect(page.getByRole('heading', { name: 'How can we change a shadow?' })).toBeVisible()
  await button('Mute automatic voice').click()
  await expect(page.getByRole('region', { name: 'Continue with a parent account' })).toHaveCount(0)
  await button('Bigger').click()
  await button('Move closer').click()
  await button('Next experiment').click()
  await button('Smaller').click()
  await button('Move farther away').click()
  await button('Next experiment').click()
  await button('It disappears').click()
  await button('Switch off the torch').click()
  await button('See our discoveries').click()
  const panel = page.getByRole('region', { name: 'Continue with a parent account' })
  await expect(panel).toBeVisible()
  await expect(panel).toContainText('won’t transfer')
  for (const name of ['sample_view', 'sample_start', 'sample_complete']) {
    const matches = (await events()).filter(event => event[1] === name)
    assert.equal(matches.length, 1, name)
    assert.equal(matches[0][2].sample, 'shadow')
    assert.equal(matches[0][2].utm_source, 'qa_test')
  }
  await panel.scrollIntoViewIfNeeded()
  await page.screenshot({ path: 'tmp/sample-parent-next.png' })
  await page.reload()
  await expect(panel).toBeVisible()
  assert.equal((await events()).filter(event => event[1] === 'sample_complete').length, 1)
  await panel.getByRole('link', { name: /Create a parent account/ }).click()
  await expect(page.getByRole('heading', { name: 'Parent Setup' })).toBeVisible()
  assert.equal((await events()).filter(event => event[1] === 'sample_account_click').length, 1)
  assert.equal((await events()).filter(event => event[1] === 'sign_up').length, 0)
  // Existing completed samples expose the same next step without false completions.
  let water = {}, picnic = {}, at = 100
  for (let round = 0; round < 4; round++) for (const action of [{ type: 'PREDICT', floats: true }, { type: 'DROP' }, { type: 'NEXT' }]) water = applyFloatDiscovery(water, action, at++)
  for (const round of COLLECTION_ADVENTURES.snacks.rounds) {
    for (let index = 0; index < round.targets.length; index++) for (let n = 0; n < round.targets[index]; n++) picnic = applyCollectionAction(picnic, 'snacks', { type: 'ADD', index }, at++)
    picnic = applyCollectionAction(picnic, 'snacks', { type: 'SUBMIT' }, at++)
    picnic = applyCollectionAction(picnic, 'snacks', { type: 'NEXT' }, at++)
  }
  await page.evaluate(({ water, picnic }) => {
    localStorage.setItem('bloom_guest_float_v1', JSON.stringify(water))
    localStorage.setItem('bloom_guest_snacks_v1', JSON.stringify(picnic))
  }, { water, picnic })
  for (const path of ['/play/float', '/play']) {
    await page.goto('http://127.0.0.1:5173' + path)
    await expect(panel).toBeVisible()
    await expect(panel.getByRole('link')).toHaveAttribute('href', '/?app=1')
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
  }
  assert.equal((await events()).filter(event => event[1] === 'sample_complete').length, 1)
  assert.deepEqual(errors, [])
  console.log('PASS: three sample completion CTAs, real shadow funnel, campaign attribution, event deduplication, honest browser-only copy and registration entry. GA network blocked; receipt and actual registration not tested.')
} finally { await browser.close() }
