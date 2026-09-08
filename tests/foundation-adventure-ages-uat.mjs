import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'

const baseUrl = process.env.UAT_BASE_URL || 'http://127.0.0.1:5173'
const browser = await chromium.launch({ headless: true })

async function runAge(age, expectedMode, prediction, firstAction, storyAction, connectAction) {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  })
  try {
    await page.goto(`${baseUrl}/test-wonder-why.html?scenario=generic&age=${age}`, { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: 'Continue today' }).first().click()
    const adventure = page.getByTestId('foundation-adventure')
    await adventure.waitFor()
    assert.match(await adventure.textContent(), new RegExp(expectedMode, 'i'))
    await page.getByRole('button', { name: prediction }).click()
    await page.getByRole('button', { name: firstAction }).click()
    await page.getByRole('button', { name: storyAction }).click()
    await page.getByRole('button', { name: 'A photograph' }).click()
    await page.getByRole('button', { name: 'A recipe' }).click()
    await page.getByRole('button', { name: 'A recorded voice' }).click()
    await page.getByRole('button', { name: connectAction }).click()
    await page.getByRole('button', { name: 'Save my discovery' }).click()
    await page.getByText('Try it together away from the screen').waitFor()
    await page.waitForTimeout(700)
    const state = await page.evaluate(() => ({
      reward: window.__wonderWhyReward,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    }))
    assert.equal(state.reward.stars, 3)
    assert.equal(state.overflow, false)
    await page.screenshot({ path: `tests/foundation-adventure-${age}-mobile.png`, fullPage: true })
  } finally {
    await page.close()
  }
}

try {
  await runAge('toddler', 'Little wonder', 'People tell and record it', 'Let’s look', 'Tap and find', 'What did we find?')
  await runAge('junior', 'Evidence mission', 'People retell and record it', 'Investigate the claim', 'Inspect the evidence', 'Build the explanation')
  console.log('Toddler and junior Foundation Adventure mobile UAT passed.')
} finally {
  await browser.close()
}
