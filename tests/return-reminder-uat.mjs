import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'

const baseUrl = process.env.UAT_BASE_URL || 'http://127.0.0.1:5186'
const browser = await chromium.launch({ headless: true })

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.context().grantPermissions(['notifications'], { origin: baseUrl })
  await page.goto(`${baseUrl}/test-return-reminder.html`, { waitUntil: 'networkidle' })
  for (const digit of ['1', '2', '3', '4']) {
    await page.getByRole('button', { name: digit, exact: true }).click()
    await page.waitForTimeout(120)
  }
  await page.waitForTimeout(500)
  assert.equal(await page.getByTestId('parent-reminder-shortcut').count(), 1)
  assert.match(await page.getByTestId('parent-reminder-shortcut').textContent(), /Bring them back tomorrow/)
  await page.getByRole('button', { name: 'Stats', exact: true }).click()

  const heading = page.getByText('Daily adventure reminder', { exact: true })
  await heading.waitFor({ timeout: 5000 })
  await heading.scrollIntoViewIfNeeded()
  assert.equal(await heading.count(), 1)
  assert.equal(await page.getByText(/Add Bloom Juniors to Home Screen|Bloom Juniors is installed/).count(), 1)
  assert.equal(await page.getByText('App notifications', { exact: true }).count(), 1)
  assert.equal(await page.getByRole('switch', { name: 'App learning notifications' }).getAttribute('aria-checked'), 'false')
  assert.ok(await page.getByText('parent@example.com', { exact: true }).count() >= 1)

  const toggle = page.getByRole('switch', { name: 'Daily adventure email reminder' })
  await toggle.click()
  assert.equal(await toggle.getAttribute('aria-checked'), 'true')
  assert.match(await page.getByTestId('reminder-state').textContent(), /"enabled":true/)

  const time = page.getByLabel('Reminder time')
  await time.fill('17:30')
  assert.match(await page.getByTestId('reminder-state').textContent(), /"time":"17:30"/)

  const box = await heading.boundingBox()
  assert.ok(box && box.x >= 0 && box.x + box.width <= 390)
  await page.screenshot({ path: 'tests/uat_return_reminder_mobile.png', fullPage: true })

  const iosPage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',
  })
  await iosPage.goto(`${baseUrl}/test-return-reminder.html`, { waitUntil: 'networkidle' })
  for (const digit of ['1', '2', '3', '4']) {
    await iosPage.getByRole('button', { name: digit, exact: true }).click()
    await iosPage.waitForTimeout(120)
  }
  await iosPage.waitForTimeout(500)
  await iosPage.getByRole('button', { name: 'Stats', exact: true }).click()
  await iosPage.getByText('Daily adventure reminder', { exact: true }).waitFor({ timeout: 5000 })
  assert.match(await iosPage.locator('body').textContent(), /Tap Share in the browser, choose Add to Home Screen/)
  assert.equal(await iosPage.getByRole('switch', { name: 'App learning notifications' }).count(), 0)
  await iosPage.close()
  console.log('Return reminder UAT passed: parent opt-in, time selection, persistence callback, and mobile fit')
} finally {
  await browser.close()
}
