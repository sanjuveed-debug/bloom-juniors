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
  const soundPage = await browser.newPage({ viewport })
  await soundPage.goto('http://127.0.0.1:5173/test-animation-modules.html?module=sound', { waitUntil: 'networkidle' })
  await soundPage.getByRole('button', { name: /Sound Pop Listen and find/i }).click()
  await soundPage.waitForTimeout(650)
  const soundYaagvi = soundPage.getByTestId('interactive-yaagvi')
  check(`${viewport.name} Sound Pop: one Yaagvi companion`, await soundPage.getByTestId('interactive-yaagvi').count() === 1)
  check(`${viewport.name} Sound Pop: listening flow has no overflow`, await soundPage.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
  await soundPage.locator('[data-sound-answer][data-correct-answer="false"]').first().click()
  await soundPage.waitForTimeout(650)
  check(`${viewport.name} Sound Pop: mistake triggers thinking pose`, await soundYaagvi.getAttribute('data-yaagvi-state') === 'think')
  await soundPage.screenshot({ path: `tests/uat_sound_pop_yaagvi_${viewport.name}.png`, fullPage: true })
  await soundPage.close()

  const shapePage = await browser.newPage({ viewport })
  await shapePage.goto('http://127.0.0.1:5173/test-animation-modules.html?module=shape', { waitUntil: 'networkidle' })
  await shapePage.getByRole('button', { name: /Build a Tower/i }).click()
  await shapePage.locator('[data-tower-shape="Cube"]').click()
  await shapePage.locator('[data-tower-shape="Cylinder"]').click()
  await shapePage.locator('[data-tower-shape="Cuboid"]').click()
  check(`${viewport.name} Shape World: selected shapes build a three-piece tower`, await shapePage.getByTestId('shape-tower-preview').locator('div').count() === 3)
  check(`${viewport.name} Shape World: tower flow has no overflow`, await shapePage.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
  await shapePage.getByRole('button', { name: /Check My Tower/i }).click()
  await shapePage.waitForTimeout(650)
  check(`${viewport.name} Shape World: completed tower triggers dance`, await shapePage.getByTestId('interactive-yaagvi').getAttribute('data-yaagvi-state') === 'dance')
  await shapePage.screenshot({ path: `tests/uat_shape_world_tower_${viewport.name}.png`, fullPage: true })
  await shapePage.close()
}

await browser.close()
const failed = results.filter(result => !result.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`)
if (failed.length) process.exit(1)
