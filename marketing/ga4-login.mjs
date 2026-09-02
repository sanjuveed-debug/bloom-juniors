import { chromium } from 'playwright'

const browser = await chromium.launch({
  channel: 'chrome',
  headless: false,
  ignoreDefaultArgs: ['--enable-automation'],
  args: ['--disable-blink-features=AutomationControlled'],
})
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } })
const page = await context.newPage()
await page.goto('https://analytics.google.com/analytics/web/', { waitUntil: 'domcontentloaded' })

console.log('A Chrome window has opened. Please log in to Google / select the Bloom Juniors GA4 property.')
console.log('Waiting up to 5 minutes for the reports home to load...')

const deadline = Date.now() + 5 * 60 * 1000
let loggedIn = false
while (Date.now() < deadline) {
  await new Promise(r => setTimeout(r, 3000))
  try {
    const url = page.url()
    if (/analytics\.google\.com\/analytics\/web\/#\/p\d+/.test(url) || /analytics\.google\.com\/analytics\/web\/#\/report/.test(url)) {
      loggedIn = true
      break
    }
  } catch {}
}

console.log('URL now:', page.url())
await page.screenshot({ path: 'marketing/ga4-login-result.png' })

if (loggedIn) {
  await context.storageState({ path: './ga4-session.json' })
  console.log('Session saved to ga4-session.json')
} else {
  console.log('Timed out — if you are logged in but the URL pattern did not match, tell me the URL and I will save the session manually.')
}
await browser.close()
