import { chromium } from '@playwright/test'

const browser = await chromium.launch({ headless: true })
const baseUrl = process.env.UAT_BASE_URL || 'http://127.0.0.1:5173'
const results = []
const check = (label, ok) => { results.push({ label, ok }); console.log(`${ok ? 'PASS' : 'FAIL'} - ${label}`) }
const titles = {
  toddler: 'Happy treasure dance!',
  early: 'You moved the adventure!',
  junior: 'Expedition progress saved!',
}

for (const age of ['toddler', 'early', 'junior']) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  let speechRequests = 0
  page.on('request', request => { if (request.url().includes('/api/tts')) speechRequests += 1 })
  await page.goto(`${baseUrl}/test-companion-bond.html?age=${age}`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: '6' }).click()
  check(`${age}: a wrong answer receives gentle try-again feedback`, await page.getByText(age === 'toddler' ? 'Try one more!' : age === 'junior' ? 'Recheck the clue' : 'Good try — look again').count() === 1)
  await page.getByRole('button', { name: '8' }).click()
  check(`${age}: a correct answer receives a visible success moment`, await page.getByText(age === 'toddler' ? 'You found it!' : age === 'junior' ? 'Clue solved!' : 'Great thinking!').count() === 1)
  await page.getByRole('button', { name: 'Finish and show reward' }).click()
  const reveal = page.getByTestId('game-complete-reveal')
  await reveal.waitFor()
  check(`${age}: completion has age-appropriate celebration`, await reveal.getByText(titles[age]).count() === 1)
  check(`${age}: completion shows the saved score`, await reveal.getByText('4 of 4 clues solved').count() === 1)
  check(`${age}: completion shows a tangible reward`, await reveal.getByText(/treasure-map clue|treasure XP/i).count() >= 1)
  check(`${age}: completion does not start background Azure speech`, speechRequests === 0)
  check(`${age}: completion fits a phone without horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))

  await reveal.getByRole('button', { name: /play again|replay|retry/i }).click()
  await page.getByTestId('game-complete-reveal').waitFor({ state: 'detached' })
  await page.getByText('What is 4 + 4?').waitFor()
  check(`${age}: replay returns to a fresh playable game`, await page.getByTestId('game-complete-reveal').count() === 0)

  await page.getByRole('button', { name: 'Finish and show reward' }).click()
  await page.getByTestId('game-complete-reveal').getByRole('button', { name: /next adventure|continue/i }).click()
  await page.waitForFunction(() => window.__gameFeelHomeCount === 1)
  check(`${age}: continue returns to the adventure home flow`, await page.evaluate(() => window.__gameFeelHomeCount === 1))
  await page.close()
}

await browser.close()
const failed = results.filter(result => !result.ok)
console.log(`\n${results.length - failed.length}/${results.length} universal game-feel checks passed.`)
if (failed.length) process.exit(1)
