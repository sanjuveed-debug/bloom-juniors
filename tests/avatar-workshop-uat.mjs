import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

const baseUrl = process.env.UAT_BASE_URL || 'http://127.0.0.1:5186'
const browser = await chromium.launch({ headless: true })
const cases = [
  ['early', '/test-dashboard.html'],
  ['toddler', '/test-age-journey.html?age=toddler'],
  ['junior', '/test-age-journey.html?age=junior'],
]

await fs.mkdir('test-results/avatar-workshop', { recursive: true })

try {
  for (const [age, path] of cases) {
    for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 1000 }]) {
      const page = await browser.newPage({ viewport })
      await page.addInitScript(() => {
        window.__workshopAnalytics = []
        window.gtag = (...args) => window.__workshopAnalytics.push(args)
      })
      await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' })

      const openButton = page.getByRole('button', { name: /Open Avatar Workshop/ })
      await openButton.waitFor({ timeout: 8000 })
      assert.equal(await openButton.isVisible(), true, `${age} workshop control should be visible`)
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
        true,
        `${age} dashboard should not overflow at ${viewport.width}px`,
      )

      await openButton.click()
      const dialog = page.getByRole('dialog', { name: 'Avatar Workshop' })
      await dialog.waitFor({ timeout: 5000 })
      assert.equal(await dialog.isVisible(), true)
      assert.equal(await dialog.getByText('4', { exact: true }).first().isVisible(), true)
      await page.waitForTimeout(700)

      if (viewport.width === 390) {
        await page.screenshot({
          path: `test-results/avatar-workshop/${age}-mobile.png`,
          fullPage: false,
        })
      }

      await page.getByRole('button', { name: /Sunny Cap/ }).click()
      await dialog.getByText('Sunny Cap unlocked and equipped!').waitFor()
      assert.match(await openButton.getAttribute('aria-label'), /3 Bloom Coins/)
      const analyticsNames = await page.evaluate(() => window.__workshopAnalytics.map(call => call[1]))
      assert.ok(analyticsNames.includes('avatar_workshop_opened'))
      assert.ok(analyticsNames.includes('avatar_item_unlocked'))
      assert.ok(analyticsNames.includes('avatar_item_equipped'))

      await page.close()
    }
  }

  console.log('Avatar Workshop UAT passed: three age bands at mobile and desktop widths')
} finally {
  await browser.close()
}
