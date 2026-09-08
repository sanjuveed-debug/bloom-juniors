import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
const browser = await chromium.launch({ headless: true })
try {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 844 } })
    const errors = []
    page.on('pageerror', e => errors.push(e.message))
    await page.route('**/*', route => {
      const url = new URL(route.request().url())
      return url.hostname === '127.0.0.1' && !url.pathname.startsWith('/api/') ? route.continue() : route.abort()
    })
    await page.goto('http://127.0.0.1:5173/test-account-review.html?mode=pin')
    await page.getByLabel('Callback outcome').selectOption('expired')
    for (const digit of ['1','2','3','4']) await page.getByRole('button', { name: digit, exact: true }).click()
    await page.getByRole('button', { name: 'Unlock', exact: true }).click()
    await page.getByRole('status').waitFor()
    assert.equal(await page.getByLabel('Email Address', { exact: true }).inputValue(), 'parent@example.test')
    assert.equal(await page.locator('#guardian-login-password').evaluate(el => el === document.activeElement), true)
    assert.equal(await page.getByRole('button', { name: /Use PIN for/ }).count(), 0)
    await page.waitForTimeout(500)
    const box = await page.getByRole('status').boundingBox()
    console.log({width, box})
    await page.screenshot({ path: `tmp/pin-recovery-${width}.png` })
    assert.ok(box.y >= -1 && box.y < 400, 'Recovery visible without scrolling')
    await page.screenshot({ path: `tmp/pin-recovery-${width}.png` })
    await page.getByLabel('Callback outcome').selectOption('success')
    await page.getByLabel('Account Password', { exact: true }).fill('synthetic-test-only')
    await page.getByRole('button', { name: 'Log In', exact: true }).click()
    const events = JSON.parse(await page.locator('pre').innerText())
    assert.equal(events.length, 2)
    assert.equal(events[1].pinLength, 4)
    assert.equal(events[1].passwordLength, 19)
    assert.deepEqual(errors, [])
    await page.close()
  }
  console.log('PASS: expired PIN session opens visible email/password recovery; preserves PIN and submits credentials, mobile and desktop. Synthetic callbacks only.')
} finally { await browser.close() }
