import { chromium } from '@playwright/test'

const browser = await chromium.launch({ headless: true })
const expectations = [
  ['toddler', 'My growing play world', 'My magic friends', 'Rainbow Treehouse'],
  ['early', 'A world that remembers', 'My discoveries', 'Magical Skyship'],
  ['junior', 'My living explorer base', 'Discovery collection', 'Explorer Headquarters'],
]
let passed = 0

for (const [age, eyebrow, collection, dreamProject] of expectations) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.addInitScript(() => localStorage.removeItem('wonder-world-uat-progress'))
  await page.goto(`http://127.0.0.1:5173/test-wonder-world.html?age=${age}`, { waitUntil: 'networkidle' })
  const checks = [
    ['age copy', await page.getByText(eyebrow, { exact: true }).count() > 0],
    ['shared heading', await page.getByText("Yaagvi's Living World", { exact: true }).count() > 0],
    ['shared treasures', await page.getByText('My treasures', { exact: true }).count() > 0],
    ['shared trophies', await page.getByText("Yaagvi's Wall", { exact: true }).count() > 0],
    ['shared collection', await page.getByText(collection, { exact: true }).count() > 0],
    ['companion bond and evolution card', await page.getByTestId('companion-bond-card').count() > 0],
    ['daily buddy quest', await page.getByTestId('companion-quest').count() > 0],
    ['age-specific dream project', await page.getByText(dreamProject, { exact: true }).count() > 0],
    ['age-scaled hidden clues', await page.getByRole('button', { name: /^Find .+ \d+$/ }).count() === (age === 'toddler' ? 3 : age === 'early' ? 4 : 5)],
    ['mobile width', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)],
  ]
  for (const [label, ok] of checks) {
    console.log(`${ok ? 'PASS' : 'FAIL'} - ${age}: ${label}`)
    if (ok) passed += 1
  }
  await page.close()
}

const dreamPage = await browser.newPage({ viewport: { width: 390, height: 844 } })
await dreamPage.addInitScript(() => {
  if (sessionStorage.getItem('dream-project-uat-started')) return
  localStorage.removeItem('wonder-world-uat-progress')
  sessionStorage.setItem('dream-project-uat-started', '1')
})
await dreamPage.goto('http://127.0.0.1:5173/test-wonder-world.html?age=early', { waitUntil: 'networkidle' })
await dreamPage.getByTestId('dream-project-build').click()
let dreamBuilt = await dreamPage.getByText('Building stage 2 of 6', { exact: true }).count() > 0
console.log(`${dreamBuilt ? 'PASS' : 'FAIL'} - dream project builds a permanent first stage`)
if (dreamBuilt) passed += 1
await dreamPage.reload({ waitUntil: 'networkidle' })
dreamBuilt = await dreamPage.getByText('Building stage 2 of 6', { exact: true }).count() > 0
console.log(`${dreamBuilt ? 'PASS' : 'FAIL'} - dream project stage remains after reload`)
if (dreamBuilt) passed += 1
await dreamPage.close()

const questPage = await browser.newPage({ viewport: { width: 390, height: 844 } })
await questPage.addInitScript(() => {
  if (sessionStorage.getItem('companion-quest-uat-started')) return
  localStorage.removeItem('wonder-world-uat-progress')
  sessionStorage.setItem('companion-quest-uat-started', '1')
})
await questPage.goto('http://127.0.0.1:5173/test-wonder-world.html?age=toddler', { waitUntil: 'networkidle' })
for (let index = 0; index < 3; index += 1) await questPage.getByRole('button', { name: /^Find .+ \d+$/ }).first().click({ force: true })
let questComplete = await questPage.getByText('You found them all!', { exact: true }).count() > 0
console.log(`${questComplete ? 'PASS' : 'FAIL'} - companion quest reveals its real reward`)
if (questComplete) passed += 1
await questPage.getByRole('button', { name: /keep my rewards/i }).click()
const savedReward = await questPage.evaluate(() => {
  const progress = JSON.parse(localStorage.getItem('wonder-world-uat-progress') || '{}')
  const claims = progress.wonderWorld?.seedClaims || {}
  return progress.treasureCollection?.sparkleDust === 5 && Object.keys(claims).some(key => key.startsWith('companion:'))
})
console.log(`${savedReward ? 'PASS' : 'FAIL'} - companion reward is persisted exactly once`)
if (savedReward) passed += 1
await questPage.reload({ waitUntil: 'networkidle' })
questComplete = await questPage.getByText('Quest complete!', { exact: true }).count() > 0
  && await questPage.getByRole('button', { name: /^Find .+ \d+$/ }).count() === 0
console.log(`${questComplete ? 'PASS' : 'FAIL'} - completed companion quest remains complete after reload`)
if (questComplete) passed += 1
await questPage.close()

const persistencePage = await browser.newPage({ viewport: { width: 390, height: 844 } })
await persistencePage.addInitScript(() => {
  if (sessionStorage.getItem('living-world-persistence-started')) return
  localStorage.removeItem('wonder-world-uat-progress')
  sessionStorage.setItem('living-world-persistence-started', '1')
})
await persistencePage.goto('http://127.0.0.1:5173/test-wonder-world.html?age=early', { waitUntil: 'networkidle' })
await persistencePage.getByRole('button', { name: /decorate my world/i }).click()
await persistencePage.getByRole('button', { name: /Explorer Yaagvi Dolly/i }).click()
await persistencePage.getByRole('button', { name: 'Back', exact: true }).click()
let equipped = await persistencePage.getByRole('button', { name: /Explorer Yaagvi Dolly on display/i }).count() > 0
console.log(`${equipped ? 'PASS' : 'FAIL'} - equipped treasure appears in the Living World`)
if (equipped) passed += 1
await persistencePage.reload({ waitUntil: 'networkidle' })
equipped = await persistencePage.getByRole('button', { name: /Explorer Yaagvi Dolly on display/i }).count() > 0
console.log(`${equipped ? 'PASS' : 'FAIL'} - equipped treasure remains after reload`)
if (equipped) passed += 1
await persistencePage.close()

await browser.close()
const total = expectations.length * 10 + 7
console.log(`\n${passed}/${total} age-band checks passed.`)
if (passed !== total) process.exit(1)
