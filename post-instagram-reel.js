// Instagram Reel auto-poster — run with: node post-instagram-reel.js
// Credentials/session reused from post-instagram.js's saved ig-session.json
import { chromium } from 'playwright'
import { config } from 'dotenv'
import { resolve } from 'path'
import { existsSync } from 'fs'

config()

const IG_USERNAME = process.env.IG_USERNAME
const IG_PASSWORD = process.env.IG_PASSWORD
const VIDEO_PATH = process.env.VIDEO_PATH ? resolve(process.env.VIDEO_PATH.trim()) : null
const CAPTION = process.env.CAPTION || ''

if (!IG_USERNAME || !IG_PASSWORD) {
  console.error('❌  Missing IG_USERNAME or IG_PASSWORD in .env')
  process.exit(1)
}
if (!VIDEO_PATH || !existsSync(VIDEO_PATH)) {
  console.error(`❌  VIDEO_PATH missing or not found: ${VIDEO_PATH}`)
  process.exit(1)
}

async function clickIfVisible(page, selector, timeoutMs = 4000) {
  try {
    const el = page.locator(selector).first()
    await el.waitFor({ state: 'visible', timeout: timeoutMs })
    await el.click()
    return true
  } catch {
    return false
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

;(async () => {
  console.log('🌱  Bloom Juniors Instagram Reel poster starting...')

  const browser = await chromium.launch({ headless: false, slowMo: 200 })
  const SESSION_FILE = './ig-session.json'
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    ...(existsSync(SESSION_FILE) ? { storageState: SESSION_FILE } : {}),
  })
  const page = await context.newPage()

  try {
    console.log('→ Opening Instagram...')
    await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle' })
    await sleep(2000)
    await clickIfVisible(page, 'button:has-text("Allow all cookies")')
    await clickIfVisible(page, 'button:has-text("Accept All")')
    await sleep(1000)

    const alreadyLoggedIn = await page.locator('svg[aria-label="Home"]').first().isVisible().catch(() => false)
    if (alreadyLoggedIn) {
      console.log('→ Already logged in from saved session.')
    } else {
      await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle' })
      await sleep(2000)
      const userInput = page.getByRole('textbox').first()
      await userInput.waitFor({ state: 'visible', timeout: 15000 })
      await userInput.click()
      await page.keyboard.type(IG_USERNAME, { delay: 60 })
      const passInput = page.locator('input[type="password"]').first()
      await passInput.click()
      await page.keyboard.type(IG_PASSWORD, { delay: 60 })
      await sleep(600)
      await page.getByRole('button', { name: /log in/i }).first().click()
      console.log('→ Waiting for home page (handle any email code prompt manually)...')
      await page.waitForSelector('svg[aria-label="Home"], a[href="/create/select/"], svg[aria-label="New post"]', { timeout: 300000 })
      await context.storageState({ path: SESSION_FILE })
    }
    await sleep(2000)

    console.log('→ Creating new post...')
    let opened = await clickIfVisible(page, 'a[href="/create/select/"]', 3000)
    if (!opened) opened = await clickIfVisible(page, 'svg[aria-label="New post"]', 3000)
    if (!opened) opened = await clickIfVisible(page, 'svg[aria-label="Create"]', 3000)
    if (!opened) await page.getByRole('link', { name: /create|new post/i }).first().click()
    await clickIfVisible(page, 'svg[aria-label="Post"]', 2500)
    await sleep(1500)

    console.log(`→ Uploading video: ${VIDEO_PATH}`)
    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(VIDEO_PATH)
    await sleep(6000)

    // "Video posts are now shared as reels" interstitial
    await clickIfVisible(page, 'button:has-text("OK")', 4000)
    await sleep(2000)

    // Crop step → Next (video processing can take a while to stabilize)
    console.log('→ Advancing through crop step...')
    await page.getByRole('button', { name: /^next$/i }).first().click({ timeout: 25000 })
    await sleep(2500)

    // Edit step (cover photo / trim) → Next
    console.log('→ Advancing through edit step...')
    await page.getByRole('button', { name: /^next$/i }).first().click({ timeout: 25000 })
    await sleep(2500)

    // Caption step
    console.log('→ Adding caption...')
    const captionBox = page.locator('div[aria-label="Write a caption..."], textarea[aria-label="Write a caption..."], div[contenteditable="true"]').first()
    await captionBox.waitFor({ state: 'visible', timeout: 10000 })
    await captionBox.click()
    const lines = CAPTION.split('\n')
    for (const line of lines) {
      await page.keyboard.type(line)
      await page.keyboard.press('Enter')
      await sleep(80)
    }
    await sleep(1500)

    console.log('→ Sharing reel...')
    const shareCandidates = [
      () => page.getByRole('button', { name: /^share$/i }).first(),
      () => page.getByRole('link', { name: /^share$/i }).first(),
      () => page.locator('div[role="button"]:has-text("Share")').first(),
      () => page.locator('text="Share"').last(),
    ]
    let shared = false
    for (const get of shareCandidates) {
      try {
        const el = get()
        await el.waitFor({ state: 'visible', timeout: 3000 })
        await el.click({ timeout: 5000 })
        shared = true
        break
      } catch {}
    }
    if (!shared) throw new Error('Could not find a clickable Share control')
    await page.getByText(/reel has been shared|post has been shared|shared/i).first().waitFor({ timeout: 45000 }).catch(() => {})
    await sleep(4000)

    console.log('✅  Reel shared! Check your Instagram profile.')
  } catch (err) {
    console.error('❌  Something went wrong:', err.message)
    await page.screenshot({ path: 'ig-error.png' })
    console.log('   Screenshot saved to ig-error.png')
  } finally {
    await sleep(3000)
    await browser.close()
  }
})()
