import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'

const browser = await chromium.launch({ headless: true })
const NEXT_ID = { toddler: 'alphabet', early: 'phonics', junior: 'reading' }
const STARTER_STEP_FOUR = { toddler: 'colours', early: 'shapes', junior: 'reading' }
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })
  const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:5173'
  await page.goto(`${baseUrl}/test-adventure-home.html`, { waitUntil: 'networkidle' })

  for (const age of ['toddler', 'early', 'junior']) {
    await page.locator(`[data-age="${age}"]`).click()
    await page.locator('[data-scenario="fresh"]').click()
    const home = page.locator(`[data-testid="adventure-home-${age}"]`)
    await home.waitFor()
    assert.match(await home.textContent(), /Today's learning journey/)
    assert.match(await home.locator('[data-testid="daily-journey-primary"]').textContent(), /chapter/i)
    assert.equal(await home.locator('[data-state]').count(), 4)
  }

  for (const age of ['toddler', 'early', 'junior']) {
    await page.locator(`[data-age="${age}"]`).click()
    await page.locator('[data-scenario="starter"]').click()
    const home = page.locator(`[data-testid="adventure-home-${age}"]`)
    assert.match(await home.textContent(), /Your Bloom starter path/)
    assert.match(await home.textContent(), /Starter step 4 of 7/)
    assert.equal(await home.locator('[data-testid="daily-journey-primary"]').count(), 0)
    assert.equal(await home.locator('[data-testid="starter-path-progress"] > span').count(), 7)
    const starterButton = home.locator('[data-testid="starter-path-primary"]')
    assert.equal(await starterButton.count(), 1)
    await starterButton.click()
    assert.match(await page.locator('[data-testid="event"]').textContent(), new RegExp(`navigate:${STARTER_STEP_FOUR[age]}:starter-path`))
  }

  for (const age of ['toddler', 'early', 'junior']) {
    await page.locator(`[data-age="${age}"]`).click()
    await page.locator('[data-scenario="first"]').click()
    const home = page.locator(`[data-testid="adventure-home-${age}"]`)
    assert.match(await home.textContent(), /Your first Bloom adventure/)
    assert.equal(await home.locator('[data-testid="daily-journey-primary"]').count(), 0)
    const firstButton = home.locator('[data-testid="first-mission-primary"]')
    assert.equal(await firstButton.count(), 1)
    await firstButton.click()
    assert.match(await page.locator('[data-testid="event"]').textContent(), new RegExp(`navigate:${NEXT_ID[age]}:first-mission`))
  }

  await page.locator('[data-age="early"]').click()
  await page.locator('[data-scenario="learning"]').click()
  assert.match(await page.locator('[data-testid="daily-journey-primary"]').textContent(), /Continue Number Falls/)
  await page.locator('[data-testid="daily-journey-primary"]').click()
  assert.equal(await page.locator('[data-testid="event"]').textContent(), 'navigate:math:daily-journey')

  await page.locator('[data-scenario="treasure"]').click()
  assert.match(await page.locator('[data-testid="daily-journey-primary"]').textContent(), /treasure/i)
  await page.locator('[data-testid="daily-journey-primary"]').click()
  assert.equal(await page.locator('[data-testid="event"]').textContent(), 'claim')

  await page.locator('[data-scenario="wonder"]').click()
  assert.match(await page.locator('[data-testid="daily-journey-primary"]').textContent(), /Wonder/i)
  await page.locator('[data-testid="daily-journey-primary"]').click()
  assert.equal(await page.locator('[data-testid="event"]').textContent(), 'wonder')
  assert.match(await page.locator('[data-testid="parent-daily-journey"]').textContent(), /Today's journey/)

  await page.screenshot({ path: 'tests/daily-journey-desktop.png', fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.locator('[data-age="toddler"]').click()
  await page.locator('[data-scenario="fresh"]').click()
  const mobileHome = page.locator('[data-testid="adventure-home-toddler"]')
  await mobileHome.waitFor()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  assert.ok(overflow <= 1, `mobile journey overflows by ${overflow}px`)
  const button = await mobileHome.locator('[data-testid="daily-journey-primary"]').boundingBox()
  assert.ok(button && button.width > 150 && button.height >= 50, 'primary action must remain easy to tap')
  await page.screenshot({ path: 'tests/daily-journey-mobile.png', fullPage: true })

  await page.locator('[data-scenario="first"]').click()
  const firstMobileHome = page.locator('[data-testid="adventure-home-toddler"]')
  const firstMobileButton = await firstMobileHome.locator('[data-testid="first-mission-primary"]').boundingBox()
  assert.ok(firstMobileButton && firstMobileButton.width > 150 && firstMobileButton.height >= 50, 'first mission action must remain easy to tap')
  const firstOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  assert.ok(firstOverflow <= 1, `mobile first mission overflows by ${firstOverflow}px`)
  await page.screenshot({ path: 'tests/first-session-mobile.png', fullPage: true })

  await page.locator('[data-scenario="starter"]').click()
  const starterMobileHome = page.locator('[data-testid="adventure-home-toddler"]')
  const starterMobileButton = await starterMobileHome.locator('[data-testid="starter-path-primary"]').boundingBox()
  assert.ok(starterMobileButton && starterMobileButton.width > 150 && starterMobileButton.height >= 50, 'starter path action must remain easy to tap')
  const starterOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  assert.ok(starterOverflow <= 1, `mobile starter path overflows by ${starterOverflow}px`)
  await page.screenshot({ path: 'tests/starter-path-mobile.png', fullPage: true })

  console.log('Daily Learning Journey UAT passed across three age bands, all action phases, and mobile fit.')
} finally {
  await browser.close()
}
