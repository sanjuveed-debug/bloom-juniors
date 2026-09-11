import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'

const origin = process.argv[2] || 'http://127.0.0.1:5173'
const local = new URL(origin).hostname === '127.0.0.1'
await mkdir('tmp', { recursive: true })
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  if (local) await page.route('**/*', route => {
    const url = new URL(route.request().url())
    return url.origin === origin && !url.pathname.startsWith('/api/') ? route.continue() : route.abort()
  })
  const button = name => page.getByRole('button', { name, exact: true })
  const fit = async label => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${label}: horizontal overflow`)
  const shot = async name => {
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: `tmp/site-verified-${name}.png`, fullPage: true, animations: 'disabled' })
  }
  await page.goto(origin)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Little discoveries.Growing minds.')
  await expect(page.locator('[data-design="bloom-discoveries"]')).toBeVisible()
  await page.locator('.public-founder img').scrollIntoViewIfNeeded()
  await expect.poll(() => page.locator('.public-founder img').evaluate(image => image.naturalWidth)).toBeGreaterThan(0)
  await page.evaluate(() => window.scrollTo(0, 0))
  assert.deepEqual(await page.locator('.public-adventure').evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))), ['/play', '/play/float', '/play/shadow'])
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  await fit('Public mobile'); await shot('public-mobile')
  await page.setViewportSize({ width: 1440, height: 1000 }); await shot('public-desktop'); await fit('Public desktop')
  await page.setViewportSize({ width: 320, height: 844 })
  await page.evaluate(() => document.documentElement.style.fontSize = '200%')
  await fit('Public enlarged text'); await shot('public-large-text')
  await page.evaluate(() => document.documentElement.style.fontSize = '')
  await page.setViewportSize({ width: 390, height: 844 })
  await button('Sign in').click()
  await expect(page.getByRole('heading', { name: 'Welcome back!' })).toBeVisible()
  await expect(page.getByLabel('Email Address', { exact: true })).toBeVisible()
  await expect(page.locator('.bloom-account')).toBeVisible()
  await fit('Sign in'); await shot('sign-in')
  // Returning to the public URL exposes the signup entry independently.
  await page.goto(origin); await button('Get started').click()
  await expect(page.getByRole('heading', { name: 'Parent Setup' })).toBeVisible()
  await fit('Parent setup'); await shot('setup')
  if (local) for (const [age, fixture, home, explore] of [
    ['tiny', 'test-tiny-profile.html', '.tiny-home', 'Explore'],
    ['early', 'test-picnic-profile.html', '.child-home', 'Explore'],
    ['junior', 'test-market-profile.html', '.market-home', /Explore all subjects/],
  ]) {
    await page.goto(`${origin}/${fixture}`)
    await expect(page.locator(home)).toBeVisible({ timeout: 30000 })
    await fit(`${age} home`); await shot(`${age}-home`)
    await page.setViewportSize({ width: 320, height: 844 })
    await page.evaluate(() => document.documentElement.style.fontSize = '200%')
    await fit(`${age} enlarged home`)
    await page.evaluate(() => document.documentElement.style.fontSize = '')
    await page.setViewportSize({ width: 390, height: 844 })
    await button(explore).click()
    await fit(`${age} library`); await shot(`${age}-library`)
    await page.goto(`${origin}/${fixture}`)
    await button('Parents').click()
    await expect(page.getByText('Enter your parent PIN to continue')).toBeVisible()
    for (const digit of ['1', '2', '3', '4']) await button(digit).click()
    await expect(page.getByRole('region', { name: 'Learning at a glance' })).toBeVisible()
    await fit(`${age} parent`); await shot(`${age}-parent`)
    await button('Back to adventures').click()
    await expect(page.locator(home)).toBeVisible()
  }
  assert.deepEqual(errors, [])
  console.log(`PASS: ${local ? 'public, signup/sign-in, three age homes/libraries and parent PIN navigation' : 'live public homepage and account entry'}, mobile/desktop/enlarged homepage layout, keyboard entry and no runtime errors.`)
} finally { await browser.close() }
