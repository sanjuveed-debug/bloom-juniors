import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

const browser = await chromium.launch({ headless: true })
const baseUrl = process.env.UAT_BASE_URL || 'http://127.0.0.1:5173'
const modules = ['colours', 'shapes', 'numbers', 'animals', 'fruits', 'bodyparts', 'alphabet']
const results = []
const check = (label, ok) => {
  results.push({ label, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'} - ${label}`)
}
await mkdir('test-results/toddler-games', { recursive: true })

for (const moduleId of modules) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  let speechRequests = 0
  await page.route('**/api/tts**', async route => { speechRequests += 1; await route.abort() })
  await page.goto(`${baseUrl}/test-toddler-games.html?module=${moduleId}`, { waitUntil: 'networkidle' })

  check(`${moduleId}: arrival does not narrate behind its overlay`, speechRequests === 0)
  await page.getByRole('button', { name: 'Play! →' }).click()
  await page.getByRole('heading', { level: 2 }).waitFor()
  await page.waitForTimeout(350)
  check(`${moduleId}: Play gesture starts the Azure question`, speechRequests >= 1)
  check(`${moduleId}: game stage fits a phone`, await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
  await page.screenshot({ path: `test-results/toddler-games/${moduleId}.png`, fullPage: true })

  const total = await page.evaluate(() => {
    const counter = [...document.querySelectorAll('span')].find(node => /^1\/\d+$/.test(node.textContent?.trim() || ''))
    return Number(counter?.textContent.split('/')[1] || 0)
  })
  check(`${moduleId}: session has multiple fresh steps`, total >= 3)

  const wrong = page.locator('button[data-companion-answer="wrong"]').first()
  await wrong.click()
  check(`${moduleId}: first mistake gives a clue`, await page.getByText(/Good try — use Yaagvi’s clue!/i).count() === 1)
  check(`${moduleId}: first mistake does not reveal the correct choice`, !(await page.locator('button[data-companion-answer="correct"]').getAttribute('class')).includes('ring-4'))
  await page.waitForTimeout(1100)

  await wrong.click()
  await page.getByText(/Tap the glowing choice/i).waitFor({ timeout: 5000 })
  check(`${moduleId}: repeated mistake visibly guides instead of skipping`, (await page.locator('button[data-companion-answer="correct"]').getAttribute('class')).includes('ring-4'))
  await page.locator('button[data-companion-answer="correct"]').click()

  for (let index = 1; index < total; index += 1) {
    await page.waitForFunction(expected => {
      const counter = [...document.querySelectorAll('span')].find(node => /^\d+\/\d+$/.test(node.textContent?.trim() || ''))
      return Number(counter?.textContent.split('/')[0] || 0) === expected
    }, index + 1)
    await page.locator('button[data-companion-answer="correct"]').click()
  }

  await page.waitForFunction(() => Boolean(window.__toddlerGameResult), null, { timeout: 8000 })
  const saved = await page.evaluate(() => window.__toddlerGameResult)
  check(`${moduleId}: completion saves exact total and first-try accuracy`, saved.total === total && saved.correct === total - 1)
  await page.close()
}

await browser.close()
const failed = results.filter(result => !result.ok)
console.log(`\n${results.length - failed.length}/${results.length} ages 3–4 game checks passed.`)
if (failed.length) process.exit(1)
