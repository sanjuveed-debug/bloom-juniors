import { chromium } from '@playwright/test'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
const results = []
const check = (label, ok) => { results.push({ label, ok }); console.log(`${ok ? 'PASS' : 'FAIL'} - ${label}`) }

await page.goto('http://localhost:5173/test-wonder-world.html', { waitUntil: 'networkidle' })
check('Secret World heading is visible', await page.getByText("Yaagvi's Secret World", { exact: true }).count() > 0)
check('World has no horizontal phone overflow', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
check('One earned seed is available', await page.getByText('1', { exact: true }).count() > 0)
check('Overnight surprise is ready', await page.getByText(/tap to discover/i).count() > 0)

await page.getByText(/tap to discover/i).click()
await page.waitForTimeout(700)
check('Discovery reveal opens', await page.getByText('Your world made something new!').count() > 0)
check('Discovery receives a permanent name', await page.getByText(/Prism Blossom|Rainbow Bell|Colour-Comet Flower/).count() > 0)
await page.getByRole('button', { name: /put it in my world/i }).click()

await page.getByText('Plant here', { exact: true }).first().click()
check('Child can choose what kind of magic to plant', await page.getByText('What should this become?').count() > 0)
await page.getByRole('button', { name: /Moonberry Seed/i }).click()
await page.waitForTimeout(500)
check('New plant is saved as growing', await page.getByText(/growing… come back tomorrow/i).count() > 0)
check('Used seed is no longer available', await page.locator('header').getByText('0', { exact: true }).count() > 0)

await browser.close()
const failed = results.filter(result => !result.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`)
if (failed.length) process.exit(1)
