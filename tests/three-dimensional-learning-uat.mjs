import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'

const baseUrl = process.env.UAT_BASE_URL || 'http://127.0.0.1:5173'
const requestedViewport = process.env.UAT_VIEWPORT || ''
const browser = await chromium.launch({ headless: true })
const closeWithin = promise => Promise.race([
  promise.then(() => true).catch(() => false),
  new Promise(resolve => setTimeout(() => resolve(false), 2500)),
])

try {
  const viewports = [
    { name: 'desktop', width: 1280, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
  ].filter(viewport => !requestedViewport || viewport.name === requestedViewport)
  for (const viewport of viewports) {
    console.log(`START ${viewport.name}`)
    const context = await browser.newContext({ viewport })

    const toddler = await context.newPage()
    console.log(`OPEN toddler ${viewport.name}`)
    await toddler.goto(`${baseUrl}/test-3d-learning.html?scene=toddler`, { waitUntil: 'domcontentloaded' })
    const countingScene = toddler.getByTestId('toddler-counting-scene')
    await countingScene.waitFor()
    const firstObject = countingScene.getByRole('button').first()
    await firstObject.click()
    assert.equal(await firstObject.getAttribute('aria-pressed'), 'true')
    assert.equal(await firstObject.locator('span').textContent(), '1')
    assert.ok(await toddler.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
    await toddler.screenshot({ path: `tests/uat_3d_toddler_${viewport.name}.png` })
    console.log(`PASS toddler ${viewport.name}`)

    const number = await context.newPage()
    console.log(`OPEN number ${viewport.name}`)
    await number.goto(`${baseUrl}/test-3d-learning.html?scene=number`, { waitUntil: 'domcontentloaded' })
    await number.getByRole('button', { name: /Addition/i }).click()
    const combine = number.getByTestId('number-combine-model')
    await combine.waitFor()
    assert.equal(await combine.getAttribute('data-state'), 'separate')
    await number.getByTestId('number-combine-toggle').click()
    assert.equal(await combine.getAttribute('data-state'), 'joined')
    assert.ok(await number.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
    await number.screenshot({ path: `tests/uat_3d_number_${viewport.name}.png` })
    console.log(`PASS number ${viewport.name}`)

    const subtract = await context.newPage()
    console.log(`OPEN subtraction ${viewport.name}`)
    await subtract.goto(`${baseUrl}/test-3d-learning.html?scene=number`, { waitUntil: 'domcontentloaded' })
    await subtract.getByRole('button', { name: /Subtraction/i }).click()
    const split = subtract.getByTestId('number-split-model')
    await split.waitFor()
    await subtract.getByTestId('number-split-toggle').click()
    assert.equal(await split.getAttribute('data-state'), 'moved')
    console.log(`PASS subtraction ${viewport.name}`)

    const grammar = await context.newPage()
    console.log(`OPEN grammar ${viewport.name}`)
    await grammar.goto(`${baseUrl}/test-3d-learning.html?scene=grammar`, { waitUntil: 'domcontentloaded' })
    const wordBlock = grammar.getByTestId('grammar-target-block')
    await wordBlock.waitFor()
    await wordBlock.click()
    await grammar.getByText('Now match the word to its job below.').waitFor()
    assert.ok((await wordBlock.evaluate(node => getComputedStyle(node).boxShadow)) !== 'none')
    assert.ok(await grammar.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
    await grammar.screenshot({ path: `tests/uat_3d_grammar_${viewport.name}.png` })
    console.log(`PASS grammar ${viewport.name}`)

    await closeWithin(context.close())
  }
  console.log('3D learning scenes passed desktop and mobile UAT.')
} finally {
  const closed = await closeWithin(browser.close())
  if (!closed) browser.process()?.kill()
}
