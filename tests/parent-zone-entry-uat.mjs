import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'

const baseUrl = process.env.UAT_BASE_URL || 'http://127.0.0.1:5186'
const browser = await chromium.launch({ headless: true })
const cases = [
  ['early', '/test-dashboard.html'],
  ['toddler', '/test-age-journey.html?age=toddler'],
  ['junior', '/test-age-journey.html?age=junior'],
]

try {
  for (const [age, path] of cases) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' })
    const button = page.getByRole('button', { name: 'Open Parent Zone' })
    await button.waitFor({ timeout: 5000 })
    assert.equal(await button.count(), 1, `${age} should have one visible Parent Zone button`)
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
      true,
      `${age} header should fit a phone`,
    )
    await button.click()
    await page.waitForFunction(() => document.title === 'nav:parent')
    await page.close()
  }
  console.log('Parent Zone entry UAT passed: early, toddler, and junior mobile dashboards')
} finally {
  await browser.close()
}
