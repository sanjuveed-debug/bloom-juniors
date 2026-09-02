import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'

const baseUrl = process.env.UAT_BASE_URL || 'http://127.0.0.1:5186'
const browser = await chromium.launch({ headless: true })

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.addInitScript(() => {
    if (sessionStorage.getItem('retention-setup-uat-started')) return
    localStorage.removeItem('eduapp_first_mission_return_v2:retention-setup-uat')
    sessionStorage.setItem('retention-setup-uat-started', '1')
  })

  await page.goto(`${baseUrl}/test-retention-setup.html?completed=0`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  assert.equal(await page.getByRole('dialog').count(), 0, 'setup must not interrupt before a first mission')

  await page.goto(`${baseUrl}/test-retention-setup.html`, { waitUntil: 'networkidle' })

  const dialog = page.getByRole('dialog')
  await dialog.waitFor({ timeout: 5000 })
  assert.equal(await page.getByText("Save Ava's next adventure", { exact: true }).count(), 1)
  assert.match(await dialog.textContent(), /Tomorrow, .+ will have the next clue/)
  await page.getByLabel('Parent PIN').fill('1111')
  await page.getByRole('button', { name: 'Choose reminder' }).click()
  assert.equal(await page.getByText('That PIN did not match. Try again.', { exact: true }).count(), 1)
  await page.getByLabel('Parent PIN').fill('2468')
  await page.getByRole('button', { name: 'Choose reminder' }).click()
  assert.equal(await page.getByLabel('Return reminder time').inputValue(), '18:00')
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    true,
  )
  await page.screenshot({ path: 'tests/first-mission-return-mobile.png', fullPage: true })
  await page.getByRole('button', { name: 'Email me tomorrow at 6:00 PM' }).click()
  await page.waitForFunction(() => {
    const value = document.querySelector('[data-testid="reminder-state"]')?.textContent || ''
    return value.includes('"enabled":true') && value.includes('"setupStatus":"email"')
  })
  await dialog.waitFor({ state: 'hidden' })
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  assert.equal(await page.getByRole('dialog').count(), 0)
  await page.close()

  const classroom = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await classroom.addInitScript(() => localStorage.removeItem('eduapp_first_mission_return_v2:retention-setup-uat'))
  await classroom.goto(`${baseUrl}/test-retention-setup.html?classroom=1`, { waitUntil: 'networkidle' })
  await classroom.waitForTimeout(1200)
  assert.equal(await classroom.getByRole('dialog').count(), 0)
  await classroom.close()

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  await desktop.addInitScript(() => localStorage.removeItem('eduapp_first_mission_return_v2:retention-setup-uat'))
  await desktop.goto(`${baseUrl}/test-retention-setup.html`, { waitUntil: 'networkidle' })
  await desktop.getByRole('dialog').waitFor()
  assert.equal(await desktop.getByLabel('Parent PIN').count(), 1)
  assert.equal(
    await desktop.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    true,
  )
  await desktop.screenshot({ path: 'tests/first-mission-return-desktop.png', fullPage: true })
  await desktop.close()

  const returnCopy = {
    toddler: /new little surprise/,
    early: /new clue and one short adventure/,
    junior: /next expedition clue/,
  }
  for (const [age, expected] of Object.entries(returnCopy)) {
    const completion = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await completion.goto(`${baseUrl}/test-companion-bond.html?age=${age}`, { waitUntil: 'networkidle' })
    await completion.getByRole('button', { name: 'Finish and show reward' }).click()
    const preview = completion.getByTestId('first-mission-return-preview')
    await preview.waitFor()
    assert.match(await preview.textContent(), expected)
    assert.equal(
      await completion.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
      true,
    )
    if (age === 'early') {
      await completion.screenshot({ path: 'tests/first-mission-complete-mobile.png', fullPage: true })
    }
    await completion.close()
  }

  console.log('First-mission return UAT passed: completion preview, timing, PIN gate, email setup, persistence, mobile fit, and classroom exclusion')
} finally {
  await browser.close()
}
