// Quick check: screenshot our own profile to confirm the post is live
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ storageState: './ig-session.json' })
const page = await context.newPage()
await page.goto('https://www.instagram.com/bloom_juniors/', { waitUntil: 'networkidle' })
await page.waitForTimeout(3000)
await page.screenshot({ path: 'marketing/profile-check.png', fullPage: false })
console.log('Screenshot saved to marketing/profile-check.png')
await browser.close()
