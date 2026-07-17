import { chromium } from '@playwright/test'

const browser = await chromium.launch({ headless: true })
const results = []
const check = (label, ok) => {
  results.push({ label, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'} - ${label}`)
}

const cases = [
  { module: 'fractions', question: 'p.font-bubble.text-white.text-xl', wait: 1250 },
  { module: 'grammar', question: 'div.max-w-sm p.font-round.text-white', wait: 1450 },
  { module: 'worldmap', question: 'p.font-bubble.text-white.text-2xl', wait: 1450 },
  { module: 'wordproblems', question: 'div.max-w-sm p.font-round.text-white', wait: 2350 },
]

for (const viewport of [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  for (const item of cases) {
    const page = await browser.newPage({ viewport })
    await page.goto(`http://127.0.0.1:5173/test-ks2-modules.html?module=${item.module}`, { waitUntil: 'networkidle' })
    const question = page.locator(item.question).first()
    const before = await question.textContent()
    await page.locator('[data-companion-answer="wrong"]').first().click()
    check(`${viewport.name} ${item.module}: answer is not revealed`, await page.getByText(/Answer:|It's /i).count() === 0)
    await page.waitForTimeout(item.wait)
    check(`${viewport.name} ${item.module}: wrong answer keeps same challenge`, (await question.textContent()) === before)
    check(`${viewport.name} ${item.module}: retry remains enabled`, await page.locator('[data-companion-answer="correct"]').first().isEnabled())
    check(`${viewport.name} ${item.module}: no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
    await page.close()
  }

  const times = await browser.newPage({ viewport })
  await times.goto('http://127.0.0.1:5173/test-ks2-modules.html?module=timestables', { waitUntil: 'networkidle' })
  await times.getByRole('button', { name: /^2×$/ }).click()
  const fact = times.locator('p.font-bubble.text-white.text-5xl')
  const beforeFact = await fact.textContent()
  await times.locator('[data-companion-answer="wrong"]').first().click()
  check(`${viewport.name} timestables: wrong answer is not revealed`, await times.getByText(/Answer:/i).count() === 0)
  await times.waitForTimeout(1250)
  check(`${viewport.name} timestables: wrong answer keeps same fact`, (await fact.textContent()) === beforeFact)
  check(`${viewport.name} timestables: retry remains enabled`, await times.locator('[data-companion-answer="correct"]').first().isEnabled())
  await times.close()
}

await browser.close()
const failed = results.filter(result => !result.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`)
if (failed.length) process.exit(1)
