import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'

const baseUrl = process.env.UAT_BASE_URL || 'http://127.0.0.1:5173'
const browser = await chromium.launch({ headless: true })

try {
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  })
  await mobile.goto(`${baseUrl}/test-home-to-world.html?age=early`, { waitUntil: 'domcontentloaded' })
  const map = mobile.getByTestId('home-to-world-map')
  await map.waitFor()
  assert.equal(await map.getByRole('button', { name: /Start day 1: My Home Has a Place/ }).isEnabled(), true)
  assert.equal(await map.getByRole('button', { name: /Day 2 is locked/ }).isEnabled(), false)
  await mobile.screenshot({ path: 'tests/home-to-world-map-mobile.png', fullPage: true })

  await map.getByRole('button', { name: /Start day 1: My Home Has a Place/ }).click()
  await mobile.getByRole('button', { name: 'It is a useful model' }).click()
  await mobile.getByRole('button', { name: /Inspect the clues/ }).click()
  await mobile.getByRole('button', { name: 'A doorway shows where a route begins' }).click()
  await mobile.getByRole('button', { name: 'Rooms become simple shapes' }).click()
  await mobile.getByRole('button', { name: 'Arrows can show a journey' }).click()
  await mobile.getByRole('button', { name: /Build the connection/ }).click()
  await mobile.getByRole('button', { name: 'The clues fit my prediction' }).click()
  await mobile.getByRole('button', { name: 'Save to My Place Story' }).click()
  await mobile.getByText('Discovery saved').waitFor()

  const state = await mobile.evaluate(() => ({
    progress: window.__homeToWorldProgress,
    reward: window.__homeToWorldReward,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }))
  assert.ok(state.progress.homeToWorld.completed['place-home-map'])
  assert.equal(state.reward.module, 'worldgk')
  assert.equal(state.reward.stars, 2)
  assert.deepEqual(state.reward.sessionData.foundationStrands, ['people-place-time'])
  assert.equal(state.overflow, false)
  await mobile.screenshot({ path: 'tests/home-to-world-discovery-mobile.png', fullPage: true })

  await mobile.getByRole('button', { name: 'See the next discovery' }).click()
  const updatedMap = mobile.getByTestId('home-to-world-map')
  assert.equal(await updatedMap.getByRole('button', { name: /Review day 1/ }).isEnabled(), true)
  assert.equal(await updatedMap.getByRole('button', { name: /Start day 2/ }).isEnabled(), true)
  await mobile.close()

  for (const ageGroup of ['toddler', 'junior']) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await page.goto(`${baseUrl}/test-home-to-world.html?age=${ageGroup}`, { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: /Start day 1/ }).click()
    const expected = ageGroup === 'toddler'
      ? 'Which picture can help us find a room?'
      : 'How can a picture help someone find their way around a home?'
    await page.getByRole('heading', { name: expected }).waitFor()
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false)
    await page.close()
  }

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await desktop.goto(`${baseUrl}/test-home-to-world.html?age=junior`, { waitUntil: 'domcontentloaded' })
  await desktop.getByTestId('home-to-world-map').waitFor()
  assert.equal(await desktop.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth), false)
  await desktop.screenshot({ path: 'tests/home-to-world-map-desktop.png', fullPage: true })
  await desktop.close()

  console.log('Home to World mobile, age-variant, and desktop UAT passed.')
} finally {
  await browser.close()
}
