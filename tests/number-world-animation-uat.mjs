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
  const promptBefore = await page.locator('[data-answer-choice]').first().getAttribute('data-answer-choice')
  await wrong.click()
  await page.waitForTimeout(700)
  check(`${viewport.name}: first mistake produces thinking pose`, await yaagvi.getAttribute('data-yaagvi-state') === 'think')
  check(`${viewport.name}: reaction message is visible`, await yaagvi.getByText(/look once more/i).isVisible())
  const correctButton = page.locator('[data-answer-choice][data-correct-answer="true"]')
  check(`${viewport.name}: a mistake does not reveal the correct answer`, !((await correctButton.getAttribute('style')) || '').includes('rgb(34, 197, 94)'))
  await page.waitForTimeout(2200)
  check(`${viewport.name}: child retries the same question`, await page.locator('[data-answer-choice]').first().getAttribute('data-answer-choice') === promptBefore)
  check(`${viewport.name}: answer choices unlock for retry`, await correctButton.isEnabled())

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
