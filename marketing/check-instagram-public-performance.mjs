import { chromium } from 'playwright'

const profileUrl = 'https://www.instagram.com/bloom_juniors/'
const browser = await chromium.launch({ headless: true })

try {
  const context = await browser.newContext({
    storageState: './ig-session.json',
    viewport: { width: 1440, height: 1400 },
  })
  const page = await context.newPage()
  await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(5000)

  const cards = page.locator(
    'a[href*="/bloom_juniors/p/"], a[href*="/bloom_juniors/reel/"]'
  )
  const count = await cards.count()
  const results = []

  for (let index = 0; index < count; index += 1) {
    const card = cards.nth(index)
    await card.scrollIntoViewIfNeeded()
    await card.hover()
    await page.waitForTimeout(250)

    const details = await card.evaluate((element) => ({
      href: element.getAttribute('href'),
      text: element.innerText.trim(),
      ariaLabel: element.getAttribute('aria-label'),
      imageAlt: element.querySelector('img')?.getAttribute('alt') || '',
      labels: [...element.querySelectorAll('[aria-label]')]
        .map(node => node.getAttribute('aria-label'))
        .filter(Boolean),
    }))

    results.push({
      position: index + 1,
      type: details.href.includes('/reel/') ? 'reel' : 'post',
      ...details,
    })
  }

  console.log(JSON.stringify({
    checkedAt: new Date().toISOString(),
    profileUrl,
    postCount: results.length,
    results,
  }, null, 2))
} finally {
  await browser.close()
}
