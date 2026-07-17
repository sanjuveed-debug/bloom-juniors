import { chromium } from '@playwright/test'
import { PROJECT_ADVENTURES } from '../src/utils/projectAdventures.js'

const browser = await chromium.launch({ headless: true })
const cases = [
  ['toddler', 'Rainbow Treasure Parade', 3],
  ['early', 'Star Route Memory', 4],
  ['junior', 'Headquarters Signal Sequence', 5],
]
const pattern = [0, 2, 4, 1, 5, 3]
let passed = 0
let total = 0
const check = (label, ok) => { total += 1; if (ok) passed += 1; console.log(`${ok ? 'PASS' : 'FAIL'} - ${label}`) }

for (const [age, gameName, sequenceLength] of cases) {
  const items = PROJECT_ADVENTURES[age].map((adventure, index) => ({
    ...adventure.souvenir,
    kind: 'souvenir',
    slot: 'room',
    source: 'project-adventure',
    earnedAt: index + 1,
  }))
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.addInitScript(({ items }) => {
    localStorage.setItem('wonder-world-uat-progress', JSON.stringify({
      totalStars: 180,
      treasureCollection: { items, equipped: {}, roomLayout: {}, treasureInteractions: {}, secretGames: {}, sparkleDust: 0 },
      wonderWorld: { version: 1, seedClaims: {}, plots: [null, null, null], discoveries: [] },
    }))
  }, { items })
  await page.goto(`http://127.0.0.1:5173/test-wonder-world.html?age=${age}`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /decorate my world/i }).click()

  check(`${age}: living Treasure Room opens`, await page.getByTestId('living-treasure-room').count() === 1)
  check(`${age}: six-piece collection unlocks ${gameName}`, await page.getByText(gameName, { exact: true }).count() === 1 && await page.getByText('SECRET GAME UNLOCKED', { exact: true }).count() === 1)

  const first = items[0]
  await page.getByRole('button', { name: new RegExp(first.name, 'i') }).last().click()
  check(`${age}: souvenir can be placed in the room`, await page.getByTestId(`placed-treasure-${first.id}`).count() === 1)
  await page.getByTestId(`placed-treasure-${first.id}`).click({ force: true })
  await page.waitForTimeout(150)
  const reacted = await page.evaluate(id => {
    const progress = JSON.parse(localStorage.getItem('wonder-world-uat-progress') || '{}')
    return progress.treasureCollection?.treasureInteractions?.[id]?.count === 1
  }, first.id)
  check(`${age}: tapping a souvenir triggers and saves its unique reaction`, reacted)

  const placed = page.getByTestId(`placed-treasure-${first.id}`)
  const stage = page.getByTestId('living-treasure-room')
  const before = await page.evaluate(id => JSON.parse(localStorage.getItem('wonder-world-uat-progress')).treasureCollection.roomLayout[id], first.id)
  const placedBox = await placed.boundingBox()
  const stageBox = await stage.boundingBox()
  if (placedBox && stageBox) {
    await page.mouse.move(placedBox.x + placedBox.width / 2, placedBox.y + placedBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(stageBox.x + stageBox.width * .72, stageBox.y + stageBox.height * .6, { steps: 8 })
    await page.mouse.up()
    await page.waitForTimeout(180)
  }
  const after = await page.evaluate(id => JSON.parse(localStorage.getItem('wonder-world-uat-progress')).treasureCollection.roomLayout[id], first.id)
  check(`${age}: dragged room position persists`, Boolean(before && after && (Math.abs(after.x - before.x) > 2 || Math.abs(after.y - before.y) > 2)))

  await page.getByTestId('start-treasure-secret-game').click()
  await page.waitForTimeout(sequenceLength * 750 + 450)
  for (const index of pattern.slice(0, sequenceLength)) {
    await page.getByRole('button', { name: `Signal ${items[index].name}`, exact: true }).click()
    await page.waitForTimeout(80)
  }
  check(`${age}: correct treasure sequence wins the secret game`, await page.getByText('PERFECT SIGNAL!', { exact: true }).count() === 1)
  const savedGame = await page.evaluate(ageGroup => {
    const collection = JSON.parse(localStorage.getItem('wonder-world-uat-progress') || '{}').treasureCollection
    return collection?.secretGames?.[ageGroup]?.plays === 1 && collection?.sparkleDust === 25
  }, age)
  check(`${age}: secret-game win and first reward persist`, savedGame)
  check(`${age}: mobile Treasure Room has no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
  if (age === 'early') await page.screenshot({ path: 'tests/living-treasure-room-mobile.png', fullPage: true })
  await page.close()
}

await browser.close()
console.log(`\n${passed}/${total} Living Treasure checks passed.`)
if (passed !== total) process.exit(1)
