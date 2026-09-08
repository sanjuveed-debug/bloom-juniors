import { chromium } from 'playwright'
import { existsSync } from 'node:fs'

const sessionFile = './ig-session.json'
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 ' +
    '(KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  isMobile: true,
  hasTouch: true,
  ...(existsSync(sessionFile) ? { storageState: sessionFile } : {}),
})
const page = await context.newPage()

try {
  await page.goto('https://www.instagram.com/', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })
  await page.waitForTimeout(5000)

  const createSelectors = [
    'a[href="/create/select/"]',
    'svg[aria-label="New post"]',
    'svg[aria-label="Create"]',
    '[aria-label="Create"]',
  ]

  for (const selector of createSelectors) {
    const control = page.locator(selector).first()
    if (await control.isVisible().catch(() => false)) {
      await control.click()
      await page.waitForTimeout(2500)
      break
    }
  }

  const bodyText = await page.locator('body').innerText()
  const labels = await page
    .locator('[aria-label]')
    .evaluateAll(elements =>
      [...new Set(elements.map(element => element.getAttribute('aria-label')).filter(Boolean))],
    )

  console.log(
    JSON.stringify(
      {
        url: page.url(),
        bodyText: bodyText.slice(0, 5000),
        labels,
      },
      null,
      2,
    ),
  )
  await page.screenshot({
    path: 'marketing/instagram-story-controls.png',
    fullPage: true,
  })
} finally {
  await browser.close()
}
