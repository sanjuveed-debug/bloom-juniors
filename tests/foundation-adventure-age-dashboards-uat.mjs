import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'

const baseUrl = process.env.UAT_BASE_URL || 'http://127.0.0.1:5173'
const browser = await chromium.launch({ headless: true })

try {
  for (const age of ['toddler', 'junior']) {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    })
    await page.goto(`${baseUrl}/test-age-journey.html?age=${age}`, { waitUntil: 'domcontentloaded' })
    const switchButton = page.getByRole('button', { name: /Switch from .* to another child/i })
    await switchButton.waitFor()
    assert.ok(await switchButton.isVisible(), `${age} profile switch must be visible on mobile`)
    const switchBox = await switchButton.boundingBox()
    assert.ok(switchBox && switchBox.x >= 0 && switchBox.x + switchBox.width <= 390)
    await page.screenshot({ path: `tests/uat_${age}_dashboard_mobile.png`, fullPage: true })
    const wonderAction = page.getByRole('button', { name: /leaves.*green/i })
    await wonderAction.waitFor()
    await wonderAction.scrollIntoViewIfNeeded()
    const box = await wonderAction.boundingBox()
    assert.ok(box && box.x >= 0 && box.x + box.width <= 390)
    await wonderAction.click()
    assert.equal(await page.title(), 'nav:wonderwhy')
    await page.goto(`${baseUrl}/test-age-journey.html?age=${age}`, { waitUntil: 'domcontentloaded' })
    if (age === 'junior') {
      await page.getByRole('button', { name: /All activities/i }).click()
      await page.getByRole('button', { name: /Full map/i }).click()
      const briefing = page.getByTestId('junior-map-briefing')
      await briefing.waitFor()
      const briefingBox = await briefing.boundingBox()
      assert.ok(briefingBox && briefingBox.width <= 366 && briefingBox.height <= 180)
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
      await page.screenshot({ path: 'tests/uat_junior_map_mobile.png', fullPage: true })
    }
    await page.getByRole('button', { name: /Switch from .* to another child/i }).click()
    assert.equal(await page.title(), 'nav:profiles')
    await page.close()
  }
  console.log('Toddler and junior dashboard Foundation Adventure entry UAT passed.')
} finally {
  await browser.close()
}
