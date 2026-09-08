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
  await page.goto(`${baseUrl}/test-dashboard.html`, { waitUntil: 'networkidle' })
  const journey = page.getByTestId('adventure-home-early')
  await journey.waitFor()
  await journey.scrollIntoViewIfNeeded()
  const box = await journey.boundingBox()
  assert.ok(box && box.x >= 0 && box.x + box.width <= 390)
  assert.match(await journey.textContent(), /Why do most leaves look green/)
  await journey.getByRole('button', { name: /Why do most leaves look green/ }).click()
  assert.equal(await page.title(), 'nav:wonderwhy')
  await page.screenshot({ path: 'tests/wonder-dashboard-mobile.png', fullPage: false })
  console.log('Integrated Wonder dashboard UAT passed.')
} finally {
  await browser.close()
}
