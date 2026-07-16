import { chromium } from '@playwright/test'

const browser = await chromium.launch({ headless: true })
const results = []
const check = (label, ok) => {
  results.push({ label, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'} - ${label}`)
}

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  const page = await browser.newPage({ viewport })
  await page.goto('http://127.0.0.1:5173/test-number-world.html', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /Addition/i }).click()
  await page.waitForTimeout(600)

  const yaagvi = page.getByTestId('interactive-yaagvi')
  check(`${viewport.name}: interactive Yaagvi is visible`, await yaagvi.isVisible())
  check(`${viewport.name}: Yaagvi waves at game start`, await yaagvi.getAttribute('data-yaagvi-state') === 'wave')
  check(`${viewport.name}: no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))

  const wrong = page.locator('[data-answer-choice][data-correct-answer="false"]').first()
  await wrong.click()
  await page.waitForTimeout(700)
  check(`${viewport.name}: first mistake produces thinking pose`, await yaagvi.getAttribute('data-yaagvi-state') === 'think')
  check(`${viewport.name}: reaction message is visible`, await yaagvi.getByText(/look once more/i).isVisible())

  await page.screenshot({
    path: `tests/uat_number_world_yaagvi_${viewport.name}.png`,
    fullPage: true,
  })
  await page.close()
}

await browser.close()
const failed = results.filter(result => !result.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`)
if (failed.length) process.exit(1)
