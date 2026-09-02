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
  await page.goto(`${baseUrl}/test-science-investigations.html`, { waitUntil: 'domcontentloaded' })
  const map = page.getByTestId('science-investigation-map')
  await map.waitFor()
  assert.equal(await map.getByTestId('science-trail-light-sky').isVisible(), true)
  assert.equal(await map.getByTestId('science-trail-body-adaptation').isVisible(), true)
  assert.equal(await map.getByRole('button', { name: /Start investigation 1: Why does the daytime sky/ }).isEnabled(), true)
  assert.equal(await map.getByRole('button', { name: /Investigation 2 is locked/ }).first().isEnabled(), false)
  await map.getByRole('button', { name: /Start investigation 1: Why does the daytime sky/ }).click()

  await page.getByRole('button', { name: 'Air scatters blue light in many directions' }).click()
  await page.getByRole('button', { name: 'Test my prediction' }).click()
  await page.getByRole('button', { name: 'Inspect the evidence' }).click()
  await page.getByRole('button', { name: 'White sunlight arrives' }).click()
  await page.getByRole('button', { name: 'Light meets air molecules' }).click()
  await page.getByRole('button', { name: 'Blue scatters widely' }).click()
  await page.getByRole('button', { name: 'Build the explanation' }).click()
  await page.getByRole('button', { name: 'My prediction matched' }).click()
  await page.getByRole('button', { name: 'Save to my Field Journal' }).click()

  await page.getByText('Investigation saved').waitFor()
  await page.waitForTimeout(500)
  const state = await page.evaluate(() => ({
    progress: window.__scienceProgress,
    reward: window.__scienceReward,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    overflowElements: [...document.querySelectorAll('*')]
      .filter(element => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1 || element.scrollWidth > element.clientWidth + 1)
      .slice(0, 8)
      .map(element => ({
        tag: element.tagName,
        text: element.textContent?.trim().slice(0, 80),
        right: Math.round(element.getBoundingClientRect().right),
        width: Math.round(element.getBoundingClientRect().width),
        className: String(element.className || '').slice(0, 140),
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
      })),
  }))
  assert.ok(state.progress.scienceInvestigations.completed['science-sky-blue'])
  assert.equal(state.reward.module, 'science')
  assert.equal(state.reward.stars, 2)
  assert.deepEqual(state.reward.sessionData.foundationStrands, ['world-systems', 'thinking-communication'])
  if (state.overflow) console.log(JSON.stringify(state.overflowElements, null, 2))
  assert.equal(state.overflow, false)
  await page.screenshot({ path: 'tests/science-investigation-journal-mobile.png', fullPage: true })

  await page.getByRole('button', { name: 'Back to science trails' }).click()
  const updatedMap = page.getByTestId('science-investigation-map')
  await updatedMap.waitFor()
  assert.equal(await updatedMap.getByRole('button', { name: /Review investigation 1: Why does the daytime sky/ }).isEnabled(), true)
  assert.equal(await updatedMap.getByRole('button', { name: /Start investigation 2: How can one beam/ }).isEnabled(), true)
  await page.screenshot({ path: 'tests/science-investigation-map-mobile.png', fullPage: true })

  await updatedMap.getByRole('button', { name: 'Open Question Library' }).click()
  await page.getByTestId('science-question-library').waitFor()
  await page.getByText('Why do we yawn?').click()
  await page.getByText(/old idea that yawning simply gives us more oxygen is not supported/).waitFor()

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await desktop.goto(`${baseUrl}/test-science-investigations.html`, { waitUntil: 'domcontentloaded' })
  await desktop.getByTestId('science-investigation-map').waitFor()
  assert.equal(await desktop.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false)
  await desktop.screenshot({ path: 'tests/science-investigation-map-desktop.png', fullPage: true })
  await desktop.close()

  console.log('Science Investigation Path mobile and desktop UAT passed.')
} finally {
  await browser.close()
}
