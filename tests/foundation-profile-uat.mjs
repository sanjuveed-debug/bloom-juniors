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
  await page.goto(`${baseUrl}/test-foundation-profile.html`, { waitUntil: 'domcontentloaded' })
  await page.getByLabel('Family places and roots').fill('Kerala')
  await page.getByLabel('Family places and roots').press('Enter')
  await page.getByRole('button', { name: 'English' }).click()
  await page.getByRole('button', { name: 'Malayalam' }).click()
  await page.getByRole('button', { name: 'Hindu' }).click()
  await page.getByLabel('How should Bloom handle faith and worldview content?').selectOption('pause-faith')
  await page.getByLabel('Parent preview').selectOption('preview-roots')
  await page.getByRole('button', { name: 'The Living and Physical World' }).click()
  await page.getByRole('button', { name: 'Roots, Culture, and Meaning' }).click()
  await page.getByRole('button', { name: 'Family, Roots, and Belonging' }).click()
  await page.getByRole('button', { name: 'Save foundation profile' }).click()

  const state = await page.evaluate(() => ({
    progress: window.__foundationProgress,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }))
  assert.deepEqual(state.progress.foundationProfile.roots, ['Kerala'])
  assert.deepEqual(state.progress.foundationProfile.languages, ['English', 'Malayalam'])
  assert.deepEqual(state.progress.foundationProfile.traditions, ['Hindu'])
  assert.equal(state.progress.foundationProfile.previewMode, 'preview-roots')
  assert.equal(state.progress.hideSacred, true)
  assert.equal(state.overflow, false)
  await page.screenshot({ path: 'tests/foundation-profile-mobile.png', fullPage: true })
  console.log('Foundation Profile mobile UAT passed.')
} finally {
  await browser.close()
}
