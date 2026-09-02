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
  await page.goto(`${baseUrl}/test-wonder-why.html?scenario=second`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Continue today' }).first().click()
  await page.getByTestId('wonder-why-sunset').waitFor()
  await page.getByRole('button', { name: 'Sunlight travels through more air' }).click()
  await page.getByRole('button', { name: 'Watch the light' }).click()
  await page.getByRole('button', { name: 'Compare the paths' }).click()
  await page.getByRole('button', { name: 'High Sun' }).click()
  await page.getByRole('button', { name: 'Low Sun' }).click()
  await page.getByRole('button', { name: 'I compared both' }).click()
  await page.getByRole('button', { name: 'Save my discovery' }).click()
  await page.getByRole('heading', { name: 'Why sunsets look warm' }).waitFor()
  await page.waitForTimeout(500)

  const state = await page.evaluate(() => ({
    progress: window.__wonderWhyProgress,
    reward: window.__wonderWhyReward,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }))
  assert.ok(state.progress.wonderWhy.discoveries['leaves-green-v1'])
  assert.ok(state.progress.wonderWhy.discoveries['sunset-red-v1'])
  assert.equal(state.reward.stars, 3)
  assert.equal(state.overflow, false)
  await page.screenshot({ path: 'tests/wonder-sunset-mobile.png', fullPage: true })

  await page.goto(`${baseUrl}/test-wonder-why.html?scenario=book`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: /Open.*Wonder Book/ }).first().click()
  const book = page.getByTestId('wonder-book')
  await book.waitFor()
  assert.equal(await book.getByRole('button', { name: /Why do most leaves/ }).isEnabled(), true)
  assert.equal(await book.getByRole('button', { name: /Why does the Sun/ }).isEnabled(), true)
  console.log('Sunset lesson and two-discovery Wonder Book UAT passed.')
} finally {
  await browser.close()
}
