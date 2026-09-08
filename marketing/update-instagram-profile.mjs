import { existsSync } from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'

const sessionFile = './ig-session.json'
const NEW_NAME = 'Bloom Juniors'
const PHOTO_PATH = path.resolve('public/bloom-v3-512.png')
const PROFILE_URL = 'https://accountscenter.instagram.com/profiles/17841443305308781/'

if (!existsSync(sessionFile)) {
  throw new Error('Missing ig-session.json')
}
if (!existsSync(PHOTO_PATH)) {
  throw new Error(`Missing photo file: ${PHOTO_PATH}`)
}

const browser = await chromium.launch({ headless: true })

try {
  const context = await browser.newContext({
    storageState: sessionFile,
    viewport: { width: 1280, height: 1000 },
  })
  const page = await context.newPage()

  // --- Change name ---
  await page.goto(`${PROFILE_URL}name/`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(2500)

  const nameField = page.locator('input').first()
  await nameField.waitFor({ state: 'visible', timeout: 15000 })
  await nameField.click({ clickCount: 3 })
  await nameField.fill(NEW_NAME)
  await page.waitForTimeout(500)

  await page.getByRole('button', { name: 'Done', exact: true }).click()
  await page.waitForTimeout(3000)

  // --- Change profile picture ---
  await page.goto(`${PROFILE_URL}photo/`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(2500)

  const fileInput = page.locator('input[type="file"]').first()
  await fileInput.setInputFiles(PHOTO_PATH)
  await page.waitForTimeout(3500)

  const cropSaveButton = page.getByRole('button', { name: /^(save|apply|done|next)$/i }).first()
  if (await cropSaveButton.isVisible().catch(() => false)) {
    await cropSaveButton.click()
    await page.waitForTimeout(3000)
  }

  // --- Verify ---
  await page.goto(PROFILE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(2500)
  await page.screenshot({ path: 'marketing/instagram-profile-updated.png' })

  const bodyText = await page.locator('body').innerText()
  const nameOk = bodyText.includes(NEW_NAME)
  console.log('Name updated to "Bloom Juniors":', nameOk)
  if (!nameOk) throw new Error(`Name change did not persist. Page text: ${bodyText.slice(0, 300)}`)

  await context.storageState({ path: sessionFile })
  console.log('Instagram profile updated: name -> "Bloom Juniors", photo -> bloom-v3-512.png')
} finally {
  await browser.close()
}
