import { chromium } from '@playwright/test'

const browser = await chromium.launch({ headless: true })
const results = []
const check = (label, ok) => { results.push({ label, ok }); console.log(`${ok ? 'PASS' : 'FAIL'} - ${label}`) }

for (const age of ['toddler', 'early', 'junior']) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.goto(`http://127.0.0.1:5173/test-never-finished.html?age=${age}`, { waitUntil: 'networkidle' })
  const card = page.getByTestId(`never-finished-${age}`)
  check(`${age}: unlimited adventure is visible`, await card.count() === 1)
  check(`${age}: no phone overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
  const firstText = await card.textContent()
  await page.getByTestId('never-finished-launch').click()
  await page.waitForFunction(() => document.querySelector('[data-testid="last-launch"]')?.textContent !== 'none')
  await page.waitForTimeout(150)
  const secondText = await card.textContent()
  check(`${age}: launch records a real destination`, (await page.getByTestId('last-launch').textContent()) !== 'none')
  check(`${age}: completed expedition advances to run two`, secondText.includes('Expedition #2'))
  check(`${age}: next expedition changes the card`, firstText !== secondText)
  await page.close()
}

await browser.close()
const failed = results.filter(result => !result.ok)
console.log(`\n${results.length - failed.length}/${results.length} never-finished checks passed.`)
if (failed.length) process.exit(1)
