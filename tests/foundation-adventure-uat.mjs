import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'

const baseUrl = process.env.UAT_BASE_URL || 'http://127.0.0.1:5173'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
})

try {
  await page.goto(`${baseUrl}/test-wonder-why.html?scenario=generic`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Continue today' }).first().click()
  await page.getByTestId('foundation-adventure').waitFor()
  await page.getByRole('button', { name: 'People retell and record it' }).click()
  await page.getByRole('button', { name: 'Follow the question' }).click()
  await page.getByRole('button', { name: 'Try the activity' }).click()
  await page.getByRole('button', { name: 'A photograph' }).click()
  await page.getByRole('button', { name: 'A recipe' }).click()
  await page.getByRole('button', { name: 'A recorded voice' }).click()
  await page.getByRole('button', { name: 'Connect the idea' }).click()
  await page.getByRole('button', { name: 'Save my discovery' }).click()

  await page.getByText('Try it together away from the screen').waitFor()
  const state = await page.evaluate(() => ({
    progress: window.__wonderWhyProgress,
    reward: window.__wonderWhyReward,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }))

  assert.ok(state.progress.wonderWhy.discoveries['family-story-time-v1'])
  assert.deepEqual(state.reward.sessionData.foundationStrands, [
    'roots-culture-meaning',
    'people-place-time',
  ])
  assert.equal(state.reward.stars, 3)
  assert.equal(state.overflow, false)
  await page.screenshot({ path: 'tests/foundation-adventure-mobile.png', fullPage: true })
  console.log('Foundation Adventure mobile UAT passed.')
} finally {
  await browser.close()
}
