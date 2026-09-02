import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'

const baseUrl = process.env.UAT_BASE_URL || 'http://127.0.0.1:5173'
const browser = await chromium.launch({ headless: true })

async function openMobile(path) {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  })
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded' })
  await page.getByTestId('foundation-season-map').waitFor()
  return page
}

try {
  const fresh = await openMobile('/test-wonder-why.html')
  assert.equal(await fresh.getByTestId('season-today-state').isVisible(), true)
  assert.equal(await fresh.getByTestId('season-week-1').isVisible(), true)
  assert.equal(await fresh.getByTestId('season-week-4').isVisible(), true)
  assert.equal(await fresh.getByRole('button', { name: /Start day 1/ }).isEnabled(), true)
  assert.equal(await fresh.getByTestId('season-week-1').getByRole('button', { name: /Day 2 is not open yet/ }).isEnabled(), false)
  assert.equal(await fresh.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false)
  await fresh.screenshot({ path: 'tests/foundation-season-map-mobile.png', fullPage: true })
  await fresh.close()

  const todayDone = await openMobile('/test-wonder-why.html?scenario=todaydone')
  assert.equal(await todayDone.getByTestId('season-tomorrow-state').isVisible(), true)
  await todayDone.getByText('Next clue: Why does the Sun look orange at sunset?').waitFor()
  assert.equal(await todayDone.getByRole('button', { name: 'Come back tomorrow' }).isDisabled(), true)
  await todayDone.screenshot({ path: 'tests/foundation-season-tomorrow-mobile.png', fullPage: true })
  await todayDone.close()

  const complete = await openMobile('/test-wonder-why.html?scenario=book')
  assert.equal(await complete.getByTestId('season-complete-state').isVisible(), true)
  await complete.getByText('Foundation Compass').waitFor()
  await complete.close()

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await desktop.goto(`${baseUrl}/test-wonder-why.html`, { waitUntil: 'domcontentloaded' })
  await desktop.getByTestId('foundation-season-map').waitFor()
  assert.equal(await desktop.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false)
  await desktop.screenshot({ path: 'tests/foundation-season-map-desktop.png', fullPage: true })
  await desktop.close()

  console.log('Foundation Season Map mobile and desktop UAT passed.')
} finally {
  await browser.close()
}
