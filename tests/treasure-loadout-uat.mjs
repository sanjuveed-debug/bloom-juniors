import { chromium } from '@playwright/test'

const browser = await chromium.launch({ headless: true })
const baseUrl = process.env.UAT_BASE_URL || 'http://127.0.0.1:5173'
const results = []
const check = (label, ok) => { results.push({ label, ok }); console.log(`${ok ? 'PASS' : 'FAIL'} - ${label}`) }

for (const age of ['toddler', 'early', 'junior']) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.goto(`${baseUrl}/test-companion-bond.html?age=${age}`, { waitUntil: 'networkidle' })

  const badge = page.getByTestId('treasure-loadout-badge')
  check(`${age}: equipped treasure enters the learning module`, /Explorer Telescope/.test(await badge.getAttribute('aria-label') || ''))
  check(`${age}: animated treasure stays clear of the activity`, await page.getByTestId('active-game-treasure').count() === 1)

  await badge.click({ force: true })
  check(`${age}: owned-treasure chooser opens`, await page.getByTestId('treasure-loadout-picker').count() === 1)
  await page.getByTestId('treasure-option-rainbow-backpack').click()
  check(`${age}: a different treasure can be assigned to this module`, /Rainbow Adventure Bag/.test(await badge.getAttribute('aria-label') || ''))

  await page.getByTestId('treasure-power').click()
  check(`${age}: level-one power does not remove any answer`, await page.locator('[data-treasure-hidden="true"]').count() === 0)
  check(`${age}: level-one power never marks the correct answer`, await page.locator('.companion-correct-glow').count() === 0)
  const focusVisible = await page.locator('main.treasure-focus-active').count() === 1
  check(`${age}: power creates a visible safe focus effect`, focusVisible)

  for (let index = 0; index < 4; index += 1) {
    await page.getByRole('button', { name: 'Finish a learning win' }).click()
    await page.waitForTimeout(35)
  }
  await page.waitForFunction(() => window.__treasureProgress?.treasureCollection?.treasureLoadout?.itemProgress?.['rainbow-backpack']?.xp >= 26)
  check(`${age}: four real learning wins evolve the treasure`, /level 2/i.test(await badge.getAttribute('aria-label') || ''))
  await badge.click({ force: true })
  check(`${age}: chooser explains that powers never reveal the answer`, await page.getByText(/It never reveals the answer/).count() === 1)
  check(`${age}: mobile module has no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
  await page.close()
}

await browser.close()
const failed = results.filter(result => !result.ok)
console.log(`\n${results.length - failed.length}/${results.length} treasure-in-game checks passed.`)
if (failed.length) process.exit(1)
