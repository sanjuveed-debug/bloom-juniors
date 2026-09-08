import { copyFileSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { chromium } from '@playwright/test'

const root = resolve('.')
const outputDir = join(root, 'marketing', 'adaptive-maths-short')
const recordingDir = join(outputDir, 'recording')
const output = join(outputDir, 'adaptive-maths-proof.webm')

mkdirSync(recordingDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  recordVideo: {
    dir: recordingDir,
    size: { width: 390, height: 844 },
  },
})
const page = await context.newPage()
const video = page.video()

try {
  await page.goto('http://127.0.0.1:5173/test-number-world.html', {
    waitUntil: 'networkidle',
  })
  await page.getByRole('button', { name: /Addition/i }).click()
  await page.waitForTimeout(1300)

  const firstWrong = page.locator('[data-answer-choice][data-correct-answer="false"]').first()
  const correct = page.locator('[data-answer-choice][data-correct-answer="true"]')

  await firstWrong.click()
  await correct.waitFor({ state: 'visible' })
  await page.waitForFunction(() => {
    const button = document.querySelector('[data-answer-choice][data-correct-answer="true"]')
    return button && !button.disabled
  }, null, { timeout: 8000 })
  await page.waitForTimeout(500)

  await firstWrong.click()
  await page.waitForFunction(() => {
    const button = document.querySelector('[data-answer-choice][data-correct-answer="true"]')
    return button && !button.disabled
  }, null, { timeout: 8000 })
  await page.getByText(/number line|use the picture/i).last().waitFor({
    state: 'visible',
    timeout: 5000,
  }).catch(() => {})
  await page.waitForTimeout(700)

  await correct.click()
  await page.waitForTimeout(2800)
} finally {
  await context.close()
  await browser.close()
}

copyFileSync(await video.path(), output)
console.log(`Recorded ${output}`)
