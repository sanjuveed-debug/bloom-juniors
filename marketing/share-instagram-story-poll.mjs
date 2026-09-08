import { chromium } from 'playwright'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const reelUrl = process.env.REEL_URL
const storyMedia = process.env.STORY_MEDIA ? resolve(process.env.STORY_MEDIA) : null
const sessionFile = './ig-session.json'
const question = 'Useful screen time?'
const firstChoice = 'Yes'
const secondChoice = 'Show me more'

if (!reelUrl) throw new Error('REEL_URL is required')
if (!existsSync(sessionFile)) throw new Error(`${sessionFile} was not found`)
if (storyMedia && !existsSync(storyMedia)) throw new Error(`${storyMedia} was not found`)

const browser = await chromium.launch({ headless: false, slowMo: 200 })
const context = await browser.newContext({
  viewport: { width: 430, height: 932 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
  storageState: sessionFile,
})
const page = await context.newPage()

async function clickVisible(locators, timeout = 3500) {
  for (const locator of locators) {
    try {
      await locator.first().waitFor({ state: 'visible', timeout })
      await locator.first().click()
      return true
    } catch {}
  }
  return false
}

try {
  await page.goto(reelUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(5000)
  await clickVisible([
    page.getByRole('button', { name: /not now/i }),
    page.getByText(/^not now$/i),
  ], 2000)
  await page.waitForTimeout(1200)

  const shared = await clickVisible([
    page.getByRole('button', { name: /^share$/i }),
    page.locator('svg[aria-label="Share"]').locator('..'),
    page.locator('[aria-label="Share"]').locator('..'),
  ])
  if (!shared) {
    await page.screenshot({ path: 'marketing/instagram-story-reel-view.png', fullPage: true })
    console.error(`Rendered URL: ${page.url()}`)
    console.error((await page.locator('body').innerText()).slice(0, 3000))
    throw new Error('The Reel Share control was not found')
  }

  await page.waitForTimeout(8000)
  let added = await clickVisible([
    page.getByText(/add (reel|post) to (your )?story/i),
    page.getByText(/add to story/i),
    page.getByRole('button', { name: /story/i }),
  ])
  if (!added && storyMedia) {
    await page.screenshot({ path: 'marketing/instagram-story-share-options.png', fullPage: true })
    await page.keyboard.press('Escape')
    await page.goto('https://www.instagram.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    })
    await page.waitForTimeout(5000)

    const createStoryOpened = await clickVisible([
      page.getByRole('button', { name: /your story|add.*story/i }),
      page.getByText(/^your story$/i),
      page.locator('[aria-label*="story" i]').first(),
    ])
    if (createStoryOpened) {
      await page.waitForTimeout(1800)
      const fileInput = page.locator('input[type="file"]').first()
      if (await fileInput.count()) {
        await fileInput.setInputFiles(storyMedia)
        await page.waitForTimeout(7000)
        added = true
      }
    }
  }
  if (!added) {
    await page.screenshot({ path: 'marketing/instagram-story-create-options.png', fullPage: true })
    console.error((await page.locator('body').innerText()).slice(0, 3000))
    throw new Error('Instagram web did not offer Add to Story')
  }

  await page.waitForTimeout(4000)
  const stickersOpened = await clickVisible([
    page.getByRole('button', { name: /sticker/i }),
    page.locator('[aria-label*="Sticker" i]'),
    page.getByText(/^stickers$/i),
  ])
  if (!stickersOpened) {
    await page.screenshot({ path: 'marketing/instagram-story-editor.png', fullPage: true })
    throw new Error('Instagram web opened the Story editor without sticker controls')
  }

  await page.waitForTimeout(1200)
  const pollOpened = await clickVisible([
    page.getByText(/^poll$/i),
    page.getByRole('button', { name: /poll/i }),
    page.locator('[aria-label*="Poll" i]'),
  ])
  if (!pollOpened) throw new Error('The poll sticker is not available in this Story editor')

  await page.waitForTimeout(1000)
  const textboxes = page.getByRole('textbox')
  if ((await textboxes.count()) < 3) {
    throw new Error('The poll editor did not expose the question and two choices')
  }
  await textboxes.nth(0).fill(question)
  await textboxes.nth(1).fill(firstChoice)
  await textboxes.nth(2).fill(secondChoice)

  const pollConfirmed = await clickVisible([
    page.getByRole('button', { name: /^done$/i }),
    page.getByText(/^done$/i),
  ])
  if (!pollConfirmed) throw new Error('Could not confirm the completed poll')

  await page.waitForTimeout(1000)
  const storyShared = await clickVisible([
    page.getByRole('button', { name: /your story|share/i }),
    page.getByText(/^your story$/i),
    page.getByText(/^share$/i),
  ])
  if (!storyShared) throw new Error('Could not find the final Story share control')

  await page.getByText(/shared|added to your story/i).first().waitFor({ timeout: 30000 }).catch(() => {})
  console.log('Instagram Story shared with the poll.')
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  await page.waitForTimeout(2000)
  await browser.close()
}
