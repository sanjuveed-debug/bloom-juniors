import { writeFileSync } from 'node:fs'
import { chromium } from 'playwright'

const ACCOUNT = 'bloom_juniors'
const OUTPUT = 'marketing/instagram-insights-latest.json'
const PROFILE_URL = `https://www.instagram.com/${ACCOUNT}/`

function cleanLines(value = '') {
  return String(value)
    .split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

function parseNumber(value) {
  const text = String(value || '').trim().toLowerCase().replaceAll(',', '')
  const match = text.match(/^([\d.]+)\s*([kmb])?$/)
  if (!match) return null
  const multipliers = { k: 1e3, m: 1e6, b: 1e9 }
  return Math.round(Number(match[1]) * (multipliers[match[2]] || 1))
}

function valueNearLabel(lines, label) {
  const normalized = label.toLowerCase()
  const indexes = lines
    .map((line, index) => line.toLowerCase() === normalized ? index : -1)
    .filter(index => index >= 0)

  for (const index of indexes) {
    for (const offset of [1, 2, 3]) {
      const candidate = lines[index + offset]
      if (/%$/.test(candidate || '')) continue
      const value = parseNumber(candidate)
      if (value !== null) return value
    }
  }
  return null
}

function parseInsights(lines) {
  const metrics = {
    views: valueNearLabel(lines, 'Views'),
    accountsReached: valueNearLabel(lines, 'Accounts reached'),
    interactions: valueNearLabel(lines, 'Interactions')
      ?? valueNearLabel(lines, 'Reels interactions')
      ?? valueNearLabel(lines, 'Post interactions'),
    likes: valueNearLabel(lines, 'Likes'),
    comments: valueNearLabel(lines, 'Comments'),
    saves: valueNearLabel(lines, 'Saves'),
    shares: valueNearLabel(lines, 'Shares'),
    follows: valueNearLabel(lines, 'Follows'),
    profileActivity: valueNearLabel(lines, 'Profile activity'),
  }

  const watchTimeIndex = lines.findIndex(line => line.toLowerCase() === 'watch time')
  const watchTime = watchTimeIndex >= 0
    ? [lines[watchTimeIndex + 1], lines[watchTimeIndex - 1]]
      .find(value => value && /\d+\s*[hms]/i.test(value)) || null
    : null

  return { ...metrics, watchTime }
}

async function collectPostLinks(page) {
  const links = new Map()
  let unchangedPasses = 0

  for (let pass = 0; pass < 10 && unchangedPasses < 2; pass += 1) {
    const before = links.size
    const hrefs = await page.locator('a').evaluateAll(anchors =>
      anchors
        .map(anchor => anchor.getAttribute('href'))
        .filter(href => /^\/(?:[^/]+\/)?(?:p|reel)\//.test(href || ''))
    )
    hrefs.forEach(href => {
      const match = href.match(/\/(p|reel)\/([^/]+)/)
      if (match) {
        const url = `https://www.instagram.com/${match[1]}/${match[2]}/`
        links.set(url, { href, url, type: match[1] === 'reel' ? 'reel' : 'post' })
      }
    })
    unchangedPasses = links.size === before ? unchangedPasses + 1 : 0
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1800)
  }

  return [...links.values()]
}

const browser = await chromium.launch({ headless: true })

try {
  const context = await browser.newContext({
    storageState: './ig-session.json',
    viewport: { width: 1280, height: 1000 },
  })
  const page = await context.newPage()

  await page.goto('https://www.instagram.com/accounts/account_type_and_tools/', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  })
  await page.waitForTimeout(3000)
  const accountTypeText = await page.locator('body').innerText()
  if (/Switch to professional account/i.test(accountTypeText)) {
    const report = {
      account: ACCOUNT,
      collectedAt: new Date().toISOString(),
      status: 'unavailable',
      reason: 'personal_account',
      detail: 'Instagram Insights are available only after switching to a Business or Creator account.',
    }
    writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`)
    console.log('Insights unavailable: this is currently a personal Instagram account.')
    console.log(`Saved ${OUTPUT}`)
    await browser.close()
    process.exit(0)
  }

  await page.goto(PROFILE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(4500)

  const links = await collectPostLinks(page)
  if (!links.length) throw new Error('No Instagram posts or Reels were found')

  console.log(`Found ${links.length} posts/Reels. Reading Insights...`)
  const posts = []

  for (let index = 0; index < links.length; index += 1) {
    const { href, url, type } = links[index]
    try {
      await page.goto(PROFILE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await page.waitForTimeout(2600)

      let target = page.locator(`a[href="${href}"]`).first()
      for (let scrollPass = 0; scrollPass < 8 && !(await target.isVisible().catch(() => false)); scrollPass += 1) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        await page.waitForTimeout(1200)
        target = page.locator(`a[href="${href}"]`).first()
      }
      await target.click({ timeout: 10000 })
      await page.waitForTimeout(2200)

      const postedAt = await page.locator('time').first().getAttribute('datetime').catch(() => null)
      const description = await page.locator('meta[property="og:description"]')
        .getAttribute('content')
        .catch(() => '')
      const caption = String(description || '')
        .replace(/^[\d,.]+ likes?, [\d,.]+ comments? - [^:]+:\s*/i, '')
        .slice(0, 220)

      let rawLines = []
      let error = null
      const insightsControl = page.getByText(/^View insights$/i).first()

      if (await insightsControl.isVisible().catch(() => false)) {
        await Promise.all([
          page.waitForURL(/\/insights\/media\//, { timeout: 15000 }),
          insightsControl.click(),
        ])
        await page.getByRole('heading', { name: /^Views$/i })
          .waitFor({ state: 'visible', timeout: 15000 })
        await page.waitForTimeout(1200)
        rawLines = cleanLines(await page.locator('body').innerText())
      } else {
        error = 'View insights control unavailable'
      }

      posts.push({
        position: index + 1,
        type,
        url,
        postedAt,
        caption,
        metrics: parseInsights(rawLines),
        rawLines,
        error,
      })
      console.log(`  ${index + 1}/${links.length} ${type}: ${error || 'read'}`)
    } catch (err) {
      posts.push({
        position: index + 1,
        type,
        url,
        postedAt: null,
        caption: '',
        metrics: parseInsights([]),
        rawLines: [],
        error: `script error: ${err.message}`,
      })
      console.log(`  ${index + 1}/${links.length} ${type}: ERROR - ${err.message}`)
    }
  }

  const totals = posts.reduce((sum, post) => {
    for (const key of ['views', 'accountsReached', 'interactions', 'likes', 'comments', 'saves', 'shares', 'follows', 'profileActivity']) {
      if (post.metrics[key] !== null) sum[key] += post.metrics[key]
    }
    return sum
  }, {
    views: 0,
    accountsReached: 0,
    interactions: 0,
    likes: 0,
    comments: 0,
    saves: 0,
    shares: 0,
    follows: 0,
    profileActivity: 0,
  })

  const report = {
    account: ACCOUNT,
    collectedAt: new Date().toISOString(),
    postCount: posts.length,
    availableInsights: posts.filter(post => !post.error).length,
    metricCoverage: Object.fromEntries(
      ['views', 'accountsReached', 'interactions', 'likes', 'comments', 'saves', 'shares', 'follows', 'profileActivity']
        .map(key => [key, posts.filter(post => post.metrics[key] !== null).length])
    ),
    totals,
    posts,
  }

  writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`)
  console.log(`\nSaved ${OUTPUT}`)
  console.log(JSON.stringify({ postCount: report.postCount, availableInsights: report.availableInsights, totals }, null, 2))
} finally {
  await browser.close()
}
