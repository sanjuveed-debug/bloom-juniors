import { chromium } from '@playwright/test'

const browser = await chromium.launch({ headless: true })
const expectations = {
  toddler: ['Numbers', 'Animals', 'Rainbow Treehouse'],
  early: ['Number World', 'Story Room', 'Magical Skyship'],
  junior: ['Reading', 'Science Quest', 'Explorer Headquarters'],
}
let passed = 0
let total = 0

for (const [age, [strength, nextArea, dream]] of Object.entries(expectations)) {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1366, height: 900 }]) {
    const page = await browser.newPage({ viewport })
    await page.goto(`http://127.0.0.1:5173/test-parent-progress-story.html?age=${age}`, { waitUntil: 'networkidle' })
    const checks = [
      ['story rendered', await page.getByTestId('parent-progress-story').count() === 1],
      ['age-specific strength', await page.getByText(strength, { exact: true }).count() > 0],
      ['age-specific next step', await page.getByText(nextArea, { exact: true }).count() > 0],
      ['three home activities', await page.getByTestId('home-activities').locator('> div').count() === 3],
      ['age-specific dream project', await page.getByText(dream, { exact: true }).count() > 0],
      ['companion is visible', await page.getByAltText(/learning companion/).count() === 1],
      ['achievement action is visible', await page.getByTestId('share-parent-story').count() === 1],
      ['no horizontal overflow', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)],
    ]
    for (const [label, ok] of checks) {
      total += 1
      if (ok) passed += 1
      console.log(`${ok ? 'PASS' : 'FAIL'} - ${age} ${viewport.width}px: ${label}`)
    }
    await page.close()
  }
}

await browser.close()
console.log(`\n${passed}/${total} Parent Progress Story checks passed.`)
if (passed !== total) process.exit(1)
