import { chromium } from '@playwright/test'
import { getTreasureQuest } from '../src/utils/treasureLoadout.js'

const browser = await chromium.launch({ headless: true })
const baseUrl = process.env.UAT_BASE_URL || 'http://127.0.0.1:5173'
const results = []
const check = (label, ok) => { results.push({ label, ok }); console.log(`${ok ? 'PASS' : 'FAIL'} - ${label}`) }

for (const ageGroup of ['toddler', 'early', 'junior']) {
  const collection = {
    items: [{ id: 'junior-telescope', name: 'Explorer Telescope', slot: 'tool', emoji: '🔭' }],
    equipped: { tool: 'junior-telescope' },
    treasureLoadout: { itemProgress: { 'junior-telescope': { xp: 25 } } },
  }
  const quest = getTreasureQuest(collection, 'junior-telescope', ageGroup)
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.goto(`${baseUrl}/test-companion-bond.html?age=${ageGroup}&quest=ready&module=${quest.nextModule}`, { waitUntil: 'networkidle' })

  check(`${ageGroup}: evolved treasure shows an active ${quest.required}-step quest`, await page.getByTestId('treasure-quest-progress').innerText() === `0/${quest.required}`)
  await page.getByTestId('treasure-loadout-badge').click()
  check(`${ageGroup}: quest names the next learning destination`, await page.getByTestId('active-treasure-quest').getByText(`Next: ${quest.nextName}`, { exact: true }).count() === 1)
  check(`${ageGroup}: quest shows a meaningful permanent reward`, await page.getByTestId('active-treasure-quest').getByText(new RegExp(quest.reward.name)).count() === 1)
  await page.getByRole('button', { name: 'Close treasure chooser' }).click()
  await page.getByRole('button', { name: 'Finish a learning win' }).click()
  await page.waitForFunction(() => window.__treasureProgress?.treasureCollection?.treasureLoadout?.questHistory?.length === 1)
  check(`${ageGroup}: a real win advances exactly one quest step`, await page.getByTestId('treasure-quest-progress').innerText() === `1/${quest.required}`)
  check(`${ageGroup}: Azure-guided feedback identifies the found clue`, await page.getByText(/Quest clue found!/).count() === 1)
  check(`${ageGroup}: quest UI does not create horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
  await page.close()
}

await browser.close()
const failed = results.filter(result => !result.ok)
console.log(`\n${results.length - failed.length}/${results.length} treasure-quest checks passed.`)
if (failed.length) process.exit(1)
