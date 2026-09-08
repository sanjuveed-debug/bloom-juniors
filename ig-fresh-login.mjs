import { chromium } from 'playwright'
import { readFileSync } from 'fs'

const envText = readFileSync('.env', 'utf8')
const IG_USERNAME = envText.match(/IG_USERNAME=(.*)/)[1].trim()
const IG_PASSWORD = envText.match(/IG_PASSWORD=(.*)/)[1].trim()

const browser = await chromium.launch({
  channel: 'chrome', headless: false,
  ignoreDefaultArgs: ['--enable-automation'],
  args: ['--disable-blink-features=AutomationControlled'],
})
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await context.newPage()
await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(4000)

await page.locator('input[name="email"]').fill(IG_USERNAME)
await page.locator('input[name="pass"]').fill(IG_PASSWORD)
await page.waitForTimeout(500)
await page.locator('input[name="pass"]').press('Enter')
console.log('Submitted login, waiting for result...')

const deadline = Date.now() + 5 * 60 * 1000
let loggedIn = false
while (Date.now() < deadline) {
  await new Promise(r => setTimeout(r, 3000))
  try {
    const url = page.url()
    if (!/\/accounts\/login/.test(url)) { loggedIn = true; break }
  } catch {}
}
console.log('URL now:', page.url())
await page.screenshot({ path: 'marketing/ig-login-result.png' })

if (loggedIn) {
  await context.storageState({ path: './ig-session.json' })
  console.log('Session saved')
} else {
  console.log('Still stuck on login')
}
await browser.close()
