import { existsSync } from 'node:fs'
import { chromium } from 'playwright'

const threadUrl = process.env.REDDIT_THREAD_URL
const comment = String(process.env.REDDIT_COMMENT || '').trim()
const username = String(process.env.REDDIT_USERNAME || '').trim()
const sessionFile = './reddit-session.json'

if (!threadUrl || !/^https:\/\/www\.reddit\.com\//.test(threadUrl)) {
  throw new Error('REDDIT_THREAD_URL must be a full reddit.com URL')
}
if (!comment) throw new Error('REDDIT_COMMENT is required')
if (!username) throw new Error('REDDIT_USERNAME is required')

const browser = await chromium.launch({
  channel: 'chrome',
  headless: false,
  slowMo: 100,
})

try {
  const context = await browser.newContext({
    viewport: { width: 1400, height: 950 },
    ...(existsSync(sessionFile) ? { storageState: sessionFile } : {}),
  })
  const page = await context.newPage()

  await page.goto(threadUrl, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(3500)

  const isLoggedIn = async () =>
    page.locator(`a[href*="/user/${username}"], a[href*="/u/${username}"]`)
      .first()
      .isVisible()
      .catch(() => false)
      || (await page.locator('body').innerText()).includes(username)

  if (!(await isLoggedIn())) {
    console.log('Reddit login required. Complete login in the opened browser window.')
    await page.goto('https://www.reddit.com/login/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })
    await page.waitForFunction(
      expectedUsername =>
        !location.pathname.startsWith('/login')
        || document.body?.innerText?.includes(expectedUsername)
        || [...document.querySelectorAll('a')].some(anchor =>
          anchor.href.includes(`/user/${expectedUsername}`)
          || anchor.href.includes(`/u/${expectedUsername}`)
        ),
      username,
      { timeout: 900000 }
    )
    await context.storageState({ path: sessionFile })
    await page.goto(threadUrl, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(3500)
  }

  const joinControl = page.getByText('Join the conversation', { exact: true }).first()
  await joinControl.waitFor({ state: 'visible', timeout: 15000 })
  await joinControl.click()
  await page.waitForTimeout(900)

  const editor = page.locator('[contenteditable="true"]:visible').last()
  await editor.waitFor({ state: 'visible', timeout: 10000 })
  await editor.fill(comment)

  const submit = page.getByRole('button', { name: /^(Comment|Submit)$/i }).last()
  await submit.waitFor({ state: 'visible', timeout: 10000 })
  await submit.click()

  await page.getByText(comment.slice(0, 80), { exact: false }).last()
    .waitFor({ state: 'visible', timeout: 30000 })
  await context.storageState({ path: sessionFile })

  console.log('Reddit comment posted and verified on the thread.')
} finally {
  await pageWaitBeforeClose()
  await browser.close()
}

async function pageWaitBeforeClose() {
  await new Promise(resolve => setTimeout(resolve, 2500))
}
