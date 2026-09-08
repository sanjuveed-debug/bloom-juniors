import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

const browser = await chromium.launch({ headless: true })
const baseUrl = process.env.UAT_BASE_URL || 'http://127.0.0.1:5173'
const results = []
const check = (label, ok) => {
  results.push({ label, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'} - ${label}`)
}

await mkdir('test-results/bloom-quiz', { recursive: true })

for (const age of ['toddler', 'early', 'junior']) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  let speechRequests = 0
  await page.route('**/api/tts**', async route => {
    speechRequests += 1
    await route.abort()
  })
  await page.goto(`${baseUrl}/test-bloom-quiz.html?age=${age}`, { waitUntil: 'networkidle' })

  check(`${age}: original Bloom show names the child as contestant`, await page.getByText(/Yaagvi, you are the contestant/i).count() === 1)
  check(`${age}: host does not speak before the child enters`, speechRequests === 0)
  check(`${age}: intro fits a phone`, await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
  await page.screenshot({ path: `test-results/bloom-quiz/${age}-intro.png`, fullPage: true })

  await page.getByRole('button', { name: /Take my seat|Take the contestant seat|Enter the championship/i }).click()
  await page.getByRole('heading', { level: 2 }).waitFor()
  await page.waitForTimeout(350)
  check(`${age}: Azure host speech starts only after a child gesture`, speechRequests >= 1)

  await page.getByRole('button', { name: /Half the choices/i }).click()
  const hiddenChoices = await page.locator('button[data-companion-answer][disabled]').count()
  check(`${age}: half-choice lifeline visibly removes choices`, hiddenChoices >= 1)
  await page.getByRole('button', { name: /Yaagvi clue/i }).click()
  check(`${age}: clue lifeline shows a learning hint`, await page.locator('p').filter({ hasText: /count|sound|number|groups|noun|surface|capital|force/i }).count() >= 1)

  const total = age === 'toddler' ? 5 : 7
  for (let question = 0; question < total; question += 1) {
    const answer = page.locator('button[data-companion-answer="correct"]:visible')
    await answer.click()
    if (question < total - 1) {
      await page.waitForFunction(previous => {
        const counter = [...document.querySelectorAll('span')].find(node => /^\d+\/\d+$/.test(node.textContent?.trim() || ''))
        return counter && Number(counter.textContent.split('/')[0]) > previous
      }, question + 1)
    }
  }

  await page.getByRole('heading', { name: 'Golden Spotlight Chest' }).waitFor()
  check(`${age}: perfect play opens a named tangible prize`, await page.getByText(`${total} of ${total} spotlight questions solved`).count() === 1)
  check(`${age}: completion still fits a phone`, await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
  await page.screenshot({ path: `test-results/bloom-quiz/${age}-prize.png`, fullPage: true })

  await page.getByRole('button', { name: /Open my prize/i }).click()
  await page.waitForFunction(() => Boolean(window.__bloomQuizResult))
  const result = await page.evaluate(() => window.__bloomQuizResult)
  check(`${age}: completion returns exact curriculum score`, result.correct === total && result.total === total)
  check(`${age}: completion saves stars using the existing reward system`, result.stars === 5)
  await page.close()
}

await browser.close()
const failed = results.filter(result => !result.ok)
console.log(`\n${results.length - failed.length}/${results.length} Bloom quiz checks passed.`)
if (failed.length) process.exit(1)
