import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'

const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })
  await page.goto('http://127.0.0.1:5173/test-adventure-home.html', { waitUntil: 'networkidle' })
  for (const age of ['toddler', 'early', 'junior']) {
    await page.locator(`[data-age="${age}"]`).click()
    const ageHome = page.locator(`[data-testid="adventure-home-${age}"]`)
    await ageHome.waitFor()
    assert.equal(await ageHome.count(), 1)
    assert.equal(await ageHome.locator('[data-testid="interest-favourite"]').count(), 1, `${age} needs a Favourite choice`)
    assert.equal(await ageHome.locator('[data-testid="interest-surprise"]').count(), 1, `${age} needs a Surprise choice`)
    assert.match(await ageHome.textContent(), /Continue /, `${age} needs to restore its unfinished activity`)
  }

  await page.locator('[data-testid="interest-favourite"]').click()
  assert.match(await page.locator('[data-testid="event"]').textContent(), /^navigate:.+:favourite$/)
  await page.locator('[data-testid="interest-surprise"]').click()
  assert.match(await page.locator('[data-testid="event"]').textContent(), /^navigate:.+:surprise$/)
  await page.locator('button', { hasText: 'Choose a mission' }).click()
  assert.equal(await page.locator('[data-testid="library"]').count(), 1)
  await page.screenshot({ path: 'tests/uat_adventure_home_desktop.png', fullPage: true })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.locator('[data-age="toddler"]').click()
  const home = page.locator('[data-testid="adventure-home-toddler"]')
  await home.waitFor()
  const box = await home.boundingBox()
  assert.ok(box && box.width <= 390, 'mobile Adventure Home must not overflow')
  const interestChoices = await home.locator('[data-testid="interest-choices"]').boundingBox()
  assert.ok(interestChoices && interestChoices.x >= 0 && interestChoices.x + interestChoices.width <= 390, 'mobile interest choices must fit the viewport')
  await home.locator('button', { hasText: 'Continue Counting Falls' }).click()
  assert.equal(await page.locator('[data-testid="event"]').textContent(), 'navigate:numbers:interest-continue')
  await page.screenshot({ path: 'tests/uat_adventure_home_mobile.png', fullPage: true })
  console.log('Adventure Home UAT passed: Continue, Favourite, Surprise, 3 age bands, library toggle, and mobile fit')
} finally {
  await browser.close()
}
