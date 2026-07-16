// Instagram auto-poster — run with: node post-instagram.js
// Credentials go in .env — never commit that file
import { chromium } from 'playwright'
import { config } from 'dotenv'
import { resolve } from 'path'
import { existsSync } from 'fs'

config()

const IG_USERNAME = process.env.IG_USERNAME
const IG_PASSWORD = process.env.IG_PASSWORD
// Single image: IMAGE_PATH=a.png  ·  Carousel: IMAGE_PATH=a.png,b.png,c.png
const IMAGE_PATHS = (process.env.IMAGE_PATH || './public/yaagvi-mascot.png')
  .split(',').map(p => resolve(p.trim())).filter(Boolean)
const CAPTION     = process.env.CAPTION || `I'm a parent first. A builder second.

I made an app so my 5-year-old could learn phonics and maths — away from the passive scroll of YouTube Kids.

Then I gave it to her.

She still picks YouTube. 😅

That's not a failure story. That's my north star.

Every feature I build is trying to close that gap — to make learning feel as alive and irresistible as the next autoplay.

This is Bloom Juniors. Phonics. Maths. Stories. Ages 3–8. And a little mascot called Yaagvi 🌱 who celebrates every win.

I'm building this in public — the code, the data, the parenting guilt. All of it.

Follow if that sounds worth watching. ✨

—

#bloomjuniors #edtech #kidslearning #phonics #buildinpublic #indiemaker #parentlife #earlylearning #kidsapp #founderstory`

// ── Validation ────────────────────────────────────────────────────────────────
if (!IG_USERNAME || !IG_PASSWORD) {
  console.error('❌  Missing IG_USERNAME or IG_PASSWORD in .env')
  process.exit(1)
}
for (const p of IMAGE_PATHS) {
  if (!existsSync(p)) {
    console.error(`❌  Image not found: ${p}`)
    process.exit(1)
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
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

// ── Main ──────────────────────────────────────────────────────────────────────
;(async () => {
  console.log('🌱  Bloom Juniors Instagram poster starting...')

  const browser = await chromium.launch({
    headless: false,   // keep visible so you can handle 2FA if needed
    slowMo: 200,
  })

  const SESSION_FILE = './ig-session.json'
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    ...(existsSync(SESSION_FILE) ? { storageState: SESSION_FILE } : {}),
  })

  const page = await context.newPage()

  try {
    // ── 1. Login (skipped when a saved session is still valid) ────────────────
    console.log('→ Opening Instagram...')
    await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle' })
    await sleep(2000)

    // Accept cookies if prompted
    await clickIfVisible(page, 'button:has-text("Allow all cookies")')
    await clickIfVisible(page, 'button:has-text("Accept All")')
    await sleep(1000)

    const alreadyLoggedIn = await page.locator('svg[aria-label="Home"]').first().isVisible().catch(() => false)
    if (alreadyLoggedIn) {
      console.log('→ Already logged in from saved session.')
    } else {
    await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle' })
    await sleep(2000)

    console.log('→ Filling credentials...')
    // Meta's login inputs have no name/placeholder attrs — use roles instead
    const userInput = page.getByRole('textbox').first()
    await userInput.waitFor({ state: 'visible', timeout: 15000 })
    await userInput.click()
    await page.keyboard.type(IG_USERNAME, { delay: 60 })
    const passInput = page.locator('input[type="password"]').first()
    await passInput.click()
    await page.keyboard.type(IG_PASSWORD, { delay: 60 })
    await sleep(600)
    const loginBtn = page.getByRole('button', { name: /log in/i }).first()
    await loginBtn.click()
    }

    // ── 2. Post-login: verification challenge + popups ────────────────────────
    console.log('→ Waiting for home page...')
    console.log('  ⚠️  IF THE BROWSER SHOWS "Check your email": get the code from')
    console.log('      your Gmail, type it in the browser window and click Continue.')
    console.log('      The script will wait up to 5 minutes and then carry on itself.')
    await page.waitForSelector('svg[aria-label="Home"], a[href="/create/select/"], svg[aria-label="New post"]', { timeout: 300000 })
    await context.storageState({ path: SESSION_FILE })
    console.log('→ Logged in. Session saved — future runs skip login.')
    await sleep(3000)

    // "Save login info?" — dismiss
    await clickIfVisible(page, 'button:has-text("Not now")')
    await clickIfVisible(page, 'button:has-text("Not Now")')
    await sleep(1500)

    // "Turn on notifications?" — dismiss
    await clickIfVisible(page, 'button:has-text("Not Now")')
    await sleep(1500)

    // ── 3. Open new post dialog ───────────────────────────────────────────────
    console.log('→ Creating new post...')
    await sleep(2000)

    // Dismiss "Save your login info?" dialog if it appears
    const savedInfo = await clickIfVisible(page, 'button:has-text("Save info")', 4000)
    if (!savedInfo) {
      try { await page.getByText(/^not now$/i).first().click({ timeout: 2500 }) } catch {}
    }
    await sleep(2000)

    // Open the create-post dialog — label varies across UI versions
    let opened = await clickIfVisible(page, 'a[href="/create/select/"]', 3000)
    if (!opened) opened = await clickIfVisible(page, 'svg[aria-label="New post"]', 3000)
    if (!opened) opened = await clickIfVisible(page, 'svg[aria-label="Create"]', 3000)
    if (!opened) await page.getByRole('link', { name: /create|new post/i }).first().click()
    // Some UI versions open a submenu with a "Post" option
    await clickIfVisible(page, 'svg[aria-label="Post"]', 2500)
    await sleep(2000)

    // ── 4. Upload image(s) — multiple files in one select = carousel ──────────
    console.log(`→ Uploading ${IMAGE_PATHS.length} image(s):`)
    IMAGE_PATHS.forEach(p => console.log(`     ${p}`))
    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(IMAGE_PATHS)
    await sleep(3000 + IMAGE_PATHS.length * 1000)

    // ── 5. Step through crop → filter → caption ───────────────────────────────
    // "Next" is a div[role=button] in current IG — use role locators
    console.log('→ Advancing through crop step...')
    await page.getByRole('button', { name: /^next$/i }).first().click({ timeout: 10000 })
    await sleep(2000)

    console.log('→ Advancing through filter step...')
    await page.getByRole('button', { name: /^next$/i }).first().click({ timeout: 10000 })
    await sleep(2000)

    // ── 6. Add caption ────────────────────────────────────────────────────────
    console.log('→ Adding caption...')
    const captionBox = page.locator('div[aria-label="Write a caption..."], textarea[aria-label="Write a caption..."], div[contenteditable="true"]').first()
    await captionBox.waitFor({ state: 'visible', timeout: 10000 })
    await captionBox.click()
    // Type in chunks to avoid input lag
    const lines = CAPTION.split('\n')
    for (const line of lines) {
      await page.keyboard.type(line)
      await page.keyboard.press('Enter')
      await sleep(80)
    }
    await sleep(1500)

    // ── 7. Share ──────────────────────────────────────────────────────────────
    console.log('→ Sharing post...')
    await page.getByRole('button', { name: /^share$/i }).first().click({ timeout: 10000 })
    // Wait for the "Post shared" confirmation before declaring success
    await page.getByText(/post has been shared|shared/i).first().waitFor({ timeout: 30000 }).catch(() => {})
    await sleep(4000)

    console.log('✅  Post shared! Check your Instagram profile.')

  } catch (err) {
    console.error('❌  Something went wrong:', err.message)
    await page.screenshot({ path: 'ig-error.png' })
    console.log('   Screenshot saved to ig-error.png — check it to see where it failed.')
  } finally {
    await sleep(3000)
    await browser.close()
  }
})()
