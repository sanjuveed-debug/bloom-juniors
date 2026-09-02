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

  const summary = page.getByTestId('foundation-season-summary')
  await assert.doesNotReject(() => summary.getByText('Foundations of Everything').waitFor())
  await assert.doesNotReject(() => summary.getByTestId('foundation-weekly-conversations').waitFor())
  await page.getByLabel('Parent preview').selectOption('preview-roots')
  await page.getByRole('button', { name: 'Save foundation profile' }).click()

  const queue = summary.getByTestId('foundation-review-queue')
  await assert.doesNotReject(() => queue.waitFor())
  await assert.doesNotReject(() => queue.getByText('How does a family story travel through time?').waitFor())
  await queue.getByRole('button', { name: 'Approve' }).first().click()

  const state = await page.evaluate(() => ({
    progress: window.__foundationProgress,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }))
  assert.equal(state.progress.wonderWhy.reviewApprovals['family-story-time-v1'], true)
  assert.equal(state.overflow, false)

  await page.screenshot({ path: 'tests/foundation-season-parent-mobile.png', fullPage: true })
  console.log('Foundation Season parent summary and preview UAT passed.')
} finally {
  await browser.close()
}
