import { chromium } from '@playwright/test'

const browser = await chromium.launch({ headless: true })
let passed = 0
let total = 0

for (const age of ['toddler', 'early', 'junior']) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  let ttsCalls = 0
  await page.route('**/api/tts*', async route => {
    ttsCalls += 1
    await route.fulfill({ status: 200, contentType: 'audio/mpeg', body: Buffer.from([0x49, 0x44, 0x33]) })
  })
  await page.goto(`http://127.0.0.1:5173/test-parent-progress-story.html?age=${age}`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Send a High-Five', exact: true }).click()
  await page.getByRole('button', { name: 'Rainbow', exact: true }).click()
  await page.locator('#high-five-message').fill(`You were wonderfully brave in your ${age} adventure!`)
  await page.getByTestId('send-high-five').click()
  const waiting = await page.getByTestId('high-five-waiting').count() === 1
  console.log(`${waiting ? 'PASS' : 'FAIL'} - ${age}: parent message is queued`); total += 1; if (waiting) passed += 1

  await page.getByTestId('show-child').click()
  const arrived = await page.getByTestId('high-five-delivery').count() === 1
  console.log(`${arrived ? 'PASS' : 'FAIL'} - ${age}: high-five arrives on child home`); total += 1; if (arrived) passed += 1
  await page.getByTestId('open-high-five').click()
  await page.waitForTimeout(250)
  const opened = await page.getByText(`“You were wonderfully brave in your ${age} adventure!”`, { exact: true }).count() === 1
    && ttsCalls === 1
  console.log(`${opened ? 'PASS' : 'FAIL'} - ${age}: message opens and requests Azure voice`); total += 1; if (opened) passed += 1
  await page.getByTestId('keep-high-five').click()
  const kept = await page.getByTestId('high-five-delivery').count() === 0
    && await page.getByTestId('sticker-count').innerText() === '1'
  console.log(`${kept ? 'PASS' : 'FAIL'} - ${age}: sticker is kept once`); total += 1; if (kept) passed += 1
  const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)
  console.log(`${noOverflow ? 'PASS' : 'FAIL'} - ${age}: mobile layout has no overflow`); total += 1; if (noOverflow) passed += 1
  await page.close()
}

await browser.close()
console.log(`\n${passed}/${total} Parent High-Five checks passed.`)
if (passed !== total) process.exit(1)
