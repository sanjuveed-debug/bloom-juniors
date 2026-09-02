import { chromium } from '@playwright/test'

const SILENT_WAV = Buffer.from('UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAAAAAP///w==', 'base64')
const browser = await chromium.launch({ headless: true })
const results = []
const check = (label, ok) => {
  results.push({ label, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'} - ${label}`)
}

try {
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } })
  const speech = []
  await page.route('**/api/tts*', async route => {
    const body = route.request().postDataJSON()
    speech.push(body)
    await route.fulfill({ status: 200, contentType: 'audio/wav', body: SILENT_WAV })
  })

  await page.goto('http://127.0.0.1:5173/test-animation-modules.html?module=sound', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /Sound Buttons/i }).click()
  await page.waitForTimeout(120)

  check('Sound Buttons intro speaks from the opening tap', speech.some(item => item.text?.includes('Tap each sound button')))
  check('the guided 3D pilot begins with map', await page.getByRole('button', { name: 'Sound m' }).count() === 1 && await page.getByRole('button', { name: 'Sound a' }).count() === 1 && await page.getByRole('button', { name: 'Sound p' }).count() === 1)
  check('the first tactile tile is marked as the next sound', await page.getByTestId('blend-sound-tile-0').getAttribute('data-sound-state') === 'next')

  for (const sound of ['m', 'a', 'p']) {
    await page.getByRole('button', { name: `Sound ${sound}`, exact: true }).click()
    await page.waitForTimeout(80)
  }
  check('each phoneme requests its pure sound', ['m', 'a', 'p'].every(sound => speech.some(item => item.text === sound && item.ssmlInner?.includes('<phoneme'))))
  check('all three tactile tiles retain their pressed state', await page.locator('[data-sound-state="pressed"]').count() === 3)

  const beforeReplay = speech.length
  await page.getByRole('button', { name: 'Replay instruction' }).click()
  await page.waitForTimeout(80)
  check('speaker fallback replays the current instruction', speech.length > beforeReplay && speech.at(-1)?.text?.includes('squash'))

  await page.getByTestId('blend-sounds-button').click()
  await page.waitForTimeout(150)
  check('blend action physically joins the three sound tiles', await page.getByTestId('blend-sound-track').getAttribute('data-blend-phase') === 'blend' && await page.locator('[data-sound-state="joined"]').count() === 3)
  check('3D object is not shown before the picture answer', await page.getByTestId('map-3d-reveal').count() === 0)

  await page.waitForTimeout(4200)
  check('Which picture prompt speaks automatically after blending', speech.some(item => item.text === 'Which picture is "map"?'))
  check('the picture choice remains the decision point before the reveal', await page.locator('[data-blend-option="map"]').count() === 1 && await page.getByTestId('map-3d-reveal').count() === 0)

  await page.locator('[data-blend-option="map"]').click()
  await page.getByTestId('map-3d-reveal').waitFor()
  check('correct map choice opens the 3D learning reveal', await page.getByTestId('map-3d-reveal').getAttribute('aria-label') === 'The word map comes alive')
  check('the reveal uses the optimized map artwork', await page.getByTestId('map-3d-reveal').locator('img[src="/sound-pop-map-3d-v1.webp"]').count() === 1)
  check('the iPhone 16 Plus width has no horizontal overflow', await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))

  await page.waitForTimeout(700)
  await page.screenshot({ path: 'tests/sound-pop-map-3d-iphone16plus.png', fullPage: true })
  await page.waitForTimeout(2300)
  check('Word 2 starts with the spoken tap instruction', await page.getByText('Word 2/6', { exact: true }).count() === 1 && speech.filter(item => item.text === 'Tap each sound button in order').length >= 1)

  await page.close()

  const reducedPage = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  await reducedPage.route('**/api/tts*', route => route.fulfill({ status: 200, contentType: 'audio/wav', body: SILENT_WAV }))
  await reducedPage.goto('http://127.0.0.1:5173/test-animation-modules.html?module=sound', { waitUntil: 'networkidle' })
  await reducedPage.getByRole('button', { name: /Sound Buttons/i }).click()
  check('Sound Pop honours the operating-system reduced-motion preference', await reducedPage.getByTestId('blend-sound-track').getAttribute('data-reduced-motion') === 'true')
  await reducedPage.close()
} finally {
  await browser.close()
}

const failed = results.filter(result => !result.ok)
console.log(`\n${results.length - failed.length}/${results.length} Sound Pop 3D checks passed.`)
if (failed.length) process.exit(1)
