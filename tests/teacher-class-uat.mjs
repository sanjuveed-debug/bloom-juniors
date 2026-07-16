import { chromium } from '@playwright/test'

const email = process.env.TEST_EMAIL
const password = process.env.TEST_PASSWORD
const pin = process.env.TEST_PIN
const pupilName = process.env.TEST_PUPIL || 'UAT Pupil A1'

if (!email || !password || !pin) {
  console.error('Set TEST_EMAIL, TEST_PASSWORD, and TEST_PIN.')
  process.exit(1)
}

async function loginTeacher(page) {
  await page.goto('https://bloomjuniors.com/?teacher=1', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /sign in to teacher account/i }).click()
  await page.waitForSelector('input[type=email]', { timeout: 15000 })
  await page.locator('input[type=email]').fill(email)
  await page.locator('input[type=password]').fill(password)
  for (const digit of pin) {
    await page.getByRole('button', { name: new RegExp(`^${digit}$`) }).click()
  }
  await page.getByRole('button', { name: /log in/i }).click()
  await page.waitForTimeout(8000)
}

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
  await loginTeacher(page)

  let body = ((await page.textContent('body')) || '').replace(/\s+/g, ' ')
  let classCode = (body.match(/[A-Z0-9]{4}-[A-Z0-9]{3}/) || [])[0] || ''

  if (!body.includes(pupilName)) {
    await page.getByRole('button', { name: /add first pupil|add pupil/i }).click()
    await page.waitForSelector('input[placeholder="Enter name..."]', { timeout: 15000 })
    await page.locator('input[placeholder="Enter name..."]').fill(pupilName)
    await page.getByRole('button', { name: /let.s go/i }).click()
    await page.waitForTimeout(8000)
  }

  const localState = await page.evaluate(() => ({
    guardian: JSON.parse(localStorage.getItem('eduapp_guardian_v1') || '{}'),
    profiles: JSON.parse(localStorage.getItem('eduapp_profiles_v1') || '[]'),
  }))
  classCode = classCode || localState.guardian.classCode || ''

  const classPage = await browser.newPage({ viewport: { width: 1366, height: 768 } })
  await classPage.goto('https://bloomjuniors.com/class', { waitUntil: 'networkidle' })
  await classPage.locator('input').first().fill(classCode)
  await classPage.getByRole('button', { name: /show my class/i }).click()
  await classPage.waitForTimeout(5000)
  const classBody = ((await classPage.textContent('body')) || '').replace(/\s+/g, ' ')

  console.log(JSON.stringify({
    teacher: {
      email,
      classroomMode: localState.guardian.classroomMode,
      schoolId: localState.guardian.schoolId,
      classId: localState.guardian.classId,
      schoolName: localState.guardian.schoolName,
      className: localState.guardian.className,
      classCode: localState.guardian.classCode || classCode,
      teacherRole: localState.guardian.teacherRole,
    },
    pupilCreated: localState.profiles.some(profile => profile.name === pupilName),
    pupil: localState.profiles.find(profile => profile.name === pupilName) || null,
    classTablet: {
      codeUsed: classCode,
      rosterShowsPupil: classBody.includes(pupilName),
      bodyStart: classBody.slice(0, 1000),
    },
    consoleMessages: consoleMessages.slice(0, 20),
  }, null, 2))
} finally {
  await browser.close()
}
