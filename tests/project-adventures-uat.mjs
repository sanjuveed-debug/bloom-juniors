import { chromium } from '@playwright/test'

const browser = await chromium.launch({ headless: true })
const cases = [
  ['toddler', 'rainbow-treehouse', 'rainbow-treehouse-complete-v2.webp', 'WELCOME TODAY’S VISITOR'],
  ['early', 'magic-skyship', 'magical-skyship-complete-v2.webp', 'FLY TO THIS WORLD'],
  ['junior', 'explorer-headquarters', 'explorer-headquarters-complete-v2.webp', 'LAUNCH THIS EXPEDITION'],
]
let passed = 0
let total = 0

for (const [age, projectId, artwork, launchLabel] of cases) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.addInitScript(({ projectId }) => {
    localStorage.setItem('wonder-world-uat-progress', JSON.stringify({
      totalStars: 180,
      treasureCollection: { items: [{ id: 'explorer-dolly', name: 'Explorer Yaagvi Dolly', kind: 'dolly', slot: 'buddy', rarity: 'special', image: '/yaagvi-3d-wave.png' }], equipped: {} },
      dreamProject: { version: 1, projectId, stage: 6, choices: {}, spentBundles: 12, history: [], updatedAt: 1 },
    }))
  }, { projectId })
  await page.goto(`http://127.0.0.1:5173/test-wonder-world.html?age=${age}`, { waitUntil: 'networkidle' })

  const finalArt = await page.locator(`img[src*="${artwork}"]`).count() === 1
  console.log(`${finalArt ? 'PASS' : 'FAIL'} - ${age}: premium completed-project artwork`); total += 1; if (finalArt) passed += 1

  const adventureCard = await page.getByTestId('dream-project-adventures').count() === 1
  console.log(`${adventureCard ? 'PASS' : 'FAIL'} - ${age}: completed project unlocks recurring adventures`); total += 1; if (adventureCard) passed += 1

  await page.getByRole('button', { name: new RegExp(launchLabel, 'i') }).click()
  const missionOpen = await page.getByTestId('project-adventure-mission').count() === 1
  console.log(`${missionOpen ? 'PASS' : 'FAIL'} - ${age}: project launches its age-specific mission`); total += 1; if (missionOpen) passed += 1
  if (age === 'early') await page.getByTestId('project-adventure-mission').screenshot({ path: 'tests/project-adventure-mission-mobile.png' })

  for (let index = 0; index < 3; index += 1) {
    await page.locator('button[aria-label^="Find "]:not([disabled])').first().click({ force: true })
    await page.waitForTimeout(120)
  }
  const ready = await page.getByTestId('collect-project-souvenir').count() === 1
  console.log(`${ready ? 'PASS' : 'FAIL'} - ${age}: three real discoveries reveal a souvenir`); total += 1; if (ready) passed += 1

  await page.getByTestId('collect-project-souvenir').click({ force: true })
  const rewardVisible = await page.getByText('Adventure complete', { exact: true }).count() === 1
  console.log(`${rewardVisible ? 'PASS' : 'FAIL'} - ${age}: child sees the earned reward`); total += 1; if (rewardVisible) passed += 1
  await page.getByRole('button', { name: /keep it and explore again/i }).click()

  const persisted = await page.evaluate(() => {
    const progress = JSON.parse(localStorage.getItem('wonder-world-uat-progress') || '{}')
    return progress.projectAdventures?.history?.length === 1
      && progress.treasureCollection?.items?.some(item => item.source === 'project-adventure')
  })
  console.log(`${persisted ? 'PASS' : 'FAIL'} - ${age}: trip and souvenir persist permanently`); total += 1; if (persisted) passed += 1

  const secondAvailable = await page.getByTestId('start-project-adventure').count() === 1
    && await page.getByText('1 trips complete', { exact: true }).count() === 1
  console.log(`${secondAvailable ? 'PASS' : 'FAIL'} - ${age}: another trip is immediately available`); total += 1; if (secondAvailable) passed += 1

  const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)
  console.log(`${noOverflow ? 'PASS' : 'FAIL'} - ${age}: mobile layout has no horizontal overflow`); total += 1; if (noOverflow) passed += 1
  await page.close()
}

await browser.close()
console.log(`\n${passed}/${total} Dream Project Adventure checks passed.`)
if (passed !== total) process.exit(1)
