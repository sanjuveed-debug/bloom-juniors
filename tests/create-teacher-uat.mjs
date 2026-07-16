import { chromium } from '@playwright/test'

const email = process.env.TEST_EMAIL
const password = process.env.TEST_PASSWORD
const pin = process.env.TEST_PIN

if (!email || !password || !pin) {
  console.error('Set TEST_EMAIL, TEST_PASSWORD, and TEST_PIN.')
  process.exit(1)
}

const schoolName = process.env.TEST_SCHOOL || 'Bloom UAT School'
const className = process.env.TEST_CLASS || 'UAT Class A'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } })
const consoleMessages = []

page.on('console', message => {
  if (['error', 'warning'].includes(message.type())) {
    consoleMessages.push(`${message.type()}: ${message.text().slice(0, 240)}`)
  }
})
page.on('pageerror', error => consoleMessages.push(`pageerror: ${error.message}`))

try {
  await page.goto('https://bloomjuniors.com/?teacher=1', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /create a school/i }).click()
  await page.locator('input[placeholder*="Greenfield"]').fill(schoolName)
  await page.getByRole('button', { name: /continue/i }).click()
  await page.waitForTimeout(1000)

  await page.locator('input[placeholder="Ms. Smith"]').fill('UAT Teacher')
  await page.locator('input[placeholder="teacher@school.co.uk"]').fill(email)
  await page.locator('input[placeholder="8+ characters"]').fill(password)
  await page.locator('input[placeholder="Repeat password"]').fill(password)
  await page.locator('input[placeholder="4 digits"]').fill(pin)
  await page.locator('input[placeholder="Confirm PIN"]').fill(pin)
  await page.locator('input[placeholder*="Year 1"]').fill(className)
  await page.getByRole('button', { name: /create classroom/i }).click()
  await page.waitForTimeout(15000)

  const body = ((await page.textContent('body')) || '').replace(/\s+/g, ' ')
  const guardian = await page.evaluate(() => {
    try { return JSON.parse(localStorage.getItem('eduapp_guardian_v1') || '{}') } catch { return {} }
  })

  console.log(JSON.stringify({
    url: page.url(),
    created: Boolean(guardian?.classroomMode && guardian?.schoolId && guardian?.classId),
    guardian: {
      email: guardian.email,
      classroomMode: guardian.classroomMode,
      schoolId: guardian.schoolId,
      classId: guardian.classId,
      schoolName: guardian.schoolName,
      className: guardian.className,
      classCode: guardian.classCode,
      teacherRole: guardian.teacherRole,
    },
    bodyStart: body.slice(0, 1000),
    consoleMessages: consoleMessages.slice(0, 20),
  }, null, 2))
} finally {
  await browser.close()
}
