import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'

const baseUrl = process.env.UAT_BASE_URL || 'http://127.0.0.1:4173'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
})

try {
  await page.goto(`${baseUrl}/test-wonder-why.html`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Continue today' }).first().click()
  await page.getByRole('button', { name: 'Green light bounces from it' }).click()
  await page.getByRole('button', { name: 'Look closer' }).click()
  await page.getByRole('button', { name: 'Test the light' }).click()
  await page.getByRole('button', { name: 'Red' }).click()
  await page.getByRole('button', { name: 'Blue' }).click()
  await page.getByRole('button', { name: 'Green' }).click()
  await page.getByRole('button', { name: 'I tested them all' }).click()
  await page.getByRole('button', { name: 'Save my discovery' }).click()

  await page.getByRole('heading', { name: 'Why leaves look green' }).waitFor()
  await page.waitForTimeout(500)
  const state = await page.evaluate(() => ({
    progress: window.__wonderWhyProgress,
    reward: window.__wonderWhyReward,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    overflowElements: [...document.querySelectorAll('*')]
      .filter(element => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
      .slice(0, 8)
      .map(element => ({
        tag: element.tagName,
        text: element.textContent?.trim().slice(0, 60),
        right: Math.round(element.getBoundingClientRect().right),
        width: Math.round(element.getBoundingClientRect().width),
        className: String(element.className || '').slice(0, 120),
      })),
  }))

  await page.screenshot({ path: 'tests/wonder-why-mobile.png', fullPage: true })
  if (state.overflow) console.log(JSON.stringify(state.overflowElements, null, 2))
  assert.equal(state.reward.module, 'wonderwhy')
  assert.equal(state.reward.stars, 3)
  assert.ok(state.progress.wonderWhy.discoveries['leaves-green-v1'])
  assert.equal(state.overflow, false)
  console.log('Wonder Why mobile UAT passed.')
} finally {
  await browser.close()
}
