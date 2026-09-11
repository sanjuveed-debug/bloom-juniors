import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'

const base = process.argv[2] || 'http://127.0.0.1:5173'
const browser = await chromium.launch({ headless: true })
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  await page.goto(`${base}/schools`)
  await expect(page.getByRole('heading', { name: 'Bring a little wonder into your classroom.' })).toBeVisible()
  const kit = page.locator('#discovery-kit')
  for (const [title, path] of [['What changes a shadow?', '/play/shadow'], ['Will it float or sink?', '/play/float'], ['Can we share fairly?', '/play']]) {
    await kit.getByRole('button', { name: new RegExp(title.replace('?', '\\?')) }).click()
    await expect(kit.getByRole('heading', { name: title, exact: true })).toBeVisible()
    await expect(kit.getByRole('link', { name: 'Try this activity' })).toHaveAttribute('href', path)
    assert((await kit.getByLabel('Parent invitation', { exact: true }).inputValue()).includes(`https://bloomjuniors.com${path}?`))
    assert((await kit.getByLabel('Parent invitation', { exact: true }).inputValue()).includes('not sent to our classroom dashboard'))
  }
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.__copied = text } } }))
  await kit.getByRole('button', { name: 'Copy parent invitation', exact: true }).click()
  await expect(kit.getByRole('status')).toContainText('Invitation copied')
  assert.equal(await page.evaluate(() => window.__copied), await kit.getByLabel('Parent invitation', { exact: true }).inputValue())
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('denied') } } }))
  await kit.getByRole('button', { name: 'Copy parent invitation', exact: true }).click()
  await expect(kit.getByRole('status')).toContainText('Select and copy')
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}`)
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await kit.scrollIntoViewIfNeeded()
  await page.screenshot({ path: '.migration/school-kit-mobile.png' })
  assert.deepEqual(errors, [])
  console.log('School kit passed: three plans, matching sample links, invitation copy/fallback, mobile/desktop layout, no runtime errors. No enquiry submitted.')
} finally { await browser.close() }
