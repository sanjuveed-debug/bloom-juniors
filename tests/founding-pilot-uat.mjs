import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'

const baseUrl = process.env.UAT_BASE_URL || 'http://127.0.0.1:5173'
const browser = await chromium.launch({ headless: true })

async function assertNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  assert.ok(overflow <= 1, `${label} overflows horizontally by ${overflow}px`)
}

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  await desktop.goto(`${baseUrl}/pilot`, { waitUntil: 'networkidle' })
  const page = desktop.getByTestId('founding-pilot-page')
  await page.waitFor()
  assert.match(await page.textContent(), /Seven short days/)
  assert.match(await page.textContent(), /Three things from a grown-up/)
  assert.equal(await desktop.getByRole('button', { name: 'Join the 7-day pilot' }).count(), 1)
  await assertNoHorizontalOverflow(desktop, 'desktop pilot page')
  await desktop.screenshot({ path: 'tests/founding-pilot-desktop.png', fullPage: true })

  await desktop.getByRole('button', { name: 'Join the 7-day pilot' }).click()
  await desktop.waitForURL(url => url.pathname === '/' && url.searchParams.get('utm_campaign') === 'founding_families_pilot')
  const enrollment = await desktop.evaluate(() =>
    JSON.parse(localStorage.getItem('eduapp_founding_pilot_v1') || 'null')
  )
  assert.equal(enrollment.campaign, 'founding_families_pilot')

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
  await mobile.goto(`${baseUrl}/pilot`, { waitUntil: 'networkidle' })
  await mobile.getByTestId('founding-pilot-page').waitFor()
  await assertNoHorizontalOverflow(mobile, 'mobile pilot page')
  const primary = mobile.getByRole('button', { name: 'Join the 7-day pilot' })
  await primary.scrollIntoViewIfNeeded()
  assert.ok(await primary.isVisible())
  await mobile.screenshot({ path: 'tests/founding-pilot-mobile.png', fullPage: true })

  console.log('Founding Families pilot desktop, mobile, enrollment, and attribution UAT passed.')
} finally {
  await browser.close()
}
