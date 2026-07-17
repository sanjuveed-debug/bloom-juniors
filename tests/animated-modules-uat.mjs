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

  const storyPage = await browser.newPage({ viewport })
  await storyPage.goto('http://127.0.0.1:5173/test-animation-modules.html?module=story', { waitUntil: 'networkidle' })
  check(`${viewport.name} Story Room: no tomorrow lockout copy`, await storyPage.getByText(/unlocks tomorrow|new story unlocks every day/i).count() === 0)
  check(`${viewport.name} Story Room: full library is available`, await storyPage.getByRole('button', { name: /Explore all 8 stories/i }).count() === 1)
  await storyPage.getByRole('button', { name: /Explore all 8 stories/i }).click()
  check(`${viewport.name} Story Room: eight originals plus a personalised story can be selected`, await storyPage.getByRole('heading', { level: 3 }).count() === 9)
  check(`${viewport.name} Story Room: library has no horizontal overflow`, await storyPage.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
  await storyPage.close()

  const worldPage = await browser.newPage({ viewport })
  await worldPage.goto('http://127.0.0.1:5173/test-animation-modules.html?module=world', { waitUntil: 'networkidle' })
  await worldPage.getByRole('button', { name: /Capitals/i }).click()
  const worldQuestion = await worldPage.locator('p').filter({ hasText: /capital of/i }).first().textContent()
  await worldPage.locator('[data-companion-answer="wrong"]').first().click()
  await worldPage.waitForTimeout(1700)
  check(`${viewport.name} World Explorer: wrong answer keeps the question`, (await worldPage.locator('p').filter({ hasText: /capital of/i }).first().textContent()) === worldQuestion)
  check(`${viewport.name} World Explorer: correct answer remains unexposed`, await worldPage.locator('[data-companion-answer="correct"] span.text-green-500').count() === 0)
  check(`${viewport.name} World Explorer: retry is enabled`, await worldPage.locator('[data-companion-answer="correct"]').isEnabled())
  await worldPage.close()

  const bodyPage = await browser.newPage({ viewport })
  await bodyPage.goto('http://127.0.0.1:5173/test-animation-modules.html?module=body', { waitUntil: 'networkidle' })
  await bodyPage.getByRole('button', { name: /Quiz/i }).click()
  const bodyQuestion = await bodyPage.locator('p').filter({ hasText: /Tap the/i }).first().textContent()
  const answerName = bodyQuestion.match(/Tap the (.+)!/i)?.[1]
  const wrongBodyPart = bodyPage.locator('[data-body-part]').filter({ hasNot: bodyPage.locator(`[aria-label="${answerName}"]`) }).first()
  const bodyParts = bodyPage.locator('[data-body-part]')
  let wrongIndex = 0
  for (let i = 0; i < await bodyParts.count(); i += 1) {
    if ((await bodyParts.nth(i).getAttribute('aria-label')) !== answerName) { wrongIndex = i; break }
  }
  await bodyParts.nth(wrongIndex).click({ force: true })
  await bodyPage.waitForTimeout(1500)
  check(`${viewport.name} My Body: wrong tap keeps the same clue`, (await bodyPage.locator('p').filter({ hasText: /Tap the/i }).first().textContent()) === bodyQuestion)
  check(`${viewport.name} My Body: second attempt remains available`, await bodyPage.locator(`[data-body-part][aria-label="${answerName}"]`).isEnabled())
  check(`${viewport.name} My Body: diagram has keyboard labels`, await bodyPage.locator('[data-body-part][tabindex="0"]').count() > 10)
  await bodyPage.close()

  const planetPage = await browser.newPage({ viewport })
  await planetPage.goto('http://127.0.0.1:5173/test-animation-modules.html?module=planet', { waitUntil: 'networkidle' })
  await planetPage.locator('button').filter({ hasText: /Mercury/i }).click()
  await planetPage.getByRole('button', { name: /Quiz Me/i }).click()
  const planetQuestionNode = planetPage.locator('p.font-bubble.text-white.text-xl')
  const planetQuestion = await planetQuestionNode.textContent()
  await planetPage.locator('[data-companion-answer="wrong"]').first().click()
  await planetPage.waitForTimeout(1800)
  check(`${viewport.name} Planet World: wrong answer keeps the question`, (await planetQuestionNode.textContent()) === planetQuestion)
  check(`${viewport.name} Planet World: correct answer remains visually neutral`, await planetPage.locator('[data-companion-answer="correct"]').evaluate(node => !node.textContent.includes('✅')))
  check(`${viewport.name} Planet World: retry is enabled`, await planetPage.locator('[data-companion-answer="correct"]').isEnabled())
  await planetPage.close()
}

await browser.close()
const failed = results.filter(result => !result.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`)
if (failed.length) process.exit(1)
