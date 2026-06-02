const { chromium } = require('playwright')

let ssCount = 0
async function shot(page, name) {
  const path = `ss_${String(ssCount++).padStart(2,'0')}_${name}.png`
  await page.screenshot({ path, fullPage: false })
  console.log(`📸 ${path}`)
  return path
}

async function jsClick(page, textIncludes) {
  const found = await page.evaluate((txt) => {
    const all = [...document.querySelectorAll('button, a, [role="button"]')]
    const el = all.find(e => e.innerText.trim().includes(txt))
    if (el) { el.click(); return el.innerText.trim().substring(0, 60) }
    return null
  }, textIncludes)
  await page.waitForTimeout(700)
  return found
}

async function enterPin(page, pin) {
  for (const digit of pin.split('')) {
    await page.evaluate((d) => {
      const btns = [...document.querySelectorAll('button')]
      const b = btns.find(b => b.innerText.trim() === d)
      if (b) b.click()
    }, digit)
    await page.waitForTimeout(250)
  }
}

async function getBodyText(page) {
  return page.evaluate(() => document.body.innerText.substring(0, 1200))
}

// Fill child profile and click Let's Go
async function createProfile(page, childName) {
  const onCreateProfile = await page.evaluate(() => document.body.innerText.includes('Create Profile') || document.body.innerText.includes('What is your name'))
  if (!onCreateProfile) return false

  console.log(`  Creating profile for "${childName}"...`)

  // Fill name input
  const nameInput = await page.$('input[placeholder*="name"], input[placeholder*="Name"], input[type="text"]')
  if (nameInput) {
    await nameInput.fill(childName)
    await page.waitForTimeout(300)
  }

  // Pick first emoji
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')]
    // find emoji buttons (short text, likely emoji characters)
    const emojiBtn = btns.find(b => {
      const t = b.innerText.trim()
      return t.length <= 2 && /\p{Emoji}/u.test(t)
    })
    if (emojiBtn) emojiBtn.click()
  })
  await page.waitForTimeout(400)

  // Pick first colour (circular divs or buttons)
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')]
    // colour buttons tend to have no text and have a background-color style
    const colourBtn = btns.find(b => b.innerText.trim() === '' && b.style.backgroundColor)
    if (colourBtn) { colourBtn.click(); return }
    // fallback: any button with rounded-full class
    const round = [...document.querySelectorAll('button.rounded-full')]
    if (round[0]) round[0].click()
  })
  await page.waitForTimeout(400)

  // Click "Let's Go" — match by text content containing "Go"
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')]
    const b = btns.find(b => b.innerText.includes('Go'))
    if (b) b.click()
  })
  await page.waitForTimeout(2500)
  return true
}

// Play through a module for up to maxRounds question rounds
async function playModule(page, FINDINGS, label) {
  let roundsPlayed = 0
  const maxRounds = 10

  while (roundsPlayed < maxRounds) {
    await page.waitForTimeout(1000)

    const state = await page.evaluate(() => {
      const text = document.body.innerText
      const btns = [...document.querySelectorAll('button')]
      const opts = btns
        .filter(b => {
          const t = b.innerText.trim()
          return t.length > 0 && t.length < 60 &&
            !['Back', '← Back', 'Home', 'Skip', 'Parent Zone', 'Log out', '🔊', 'Done', 'Arcade'].includes(t) &&
            !/^[0-9⌫]$/.test(t)
        })
        .map(b => b.innerText.trim())
      return {
        opts,
        hasResult: /Well done|Great job|Round complete|Play Again|Next Round|Try Again|Finished|stars earned|You scored/i.test(text),
        hasMoodCheck: /How are you|mood|feeling/i.test(text),
      }
    })

    if (state.hasResult) {
      console.log(`  🏁 Result screen after ${roundsPlayed} rounds`)
      await shot(page, `${label}_result`)
      const endText = await page.evaluate(() => document.body.innerText)
      if (endText.includes('NaN')) FINDINGS.push(`NaN on result: ${label}`)
      if (endText.includes('Infinity')) FINDINGS.push(`Infinity on result: ${label}`)
      // Click Play Again / Next
      await page.evaluate(() => {
        const b = [...document.querySelectorAll('button')].find(b => /Play Again|Next Round|Continue|Try Again/i.test(b.innerText))
        if (b) b.click()
      })
      await page.waitForTimeout(800)
      break
    }

    if (state.hasMoodCheck) {
      console.log('  Mood check detected — picking first mood')
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')]
        const mood = btns.find(b => /😊|😄|😐|😢|🤩|😁|🙂|😀/.test(b.innerText))
        if (mood) mood.click()
        else if (btns[0]) btns[0].click()
      })
      await page.waitForTimeout(1000)
      continue
    }

    if (state.opts.length === 0) { console.log('  No buttons found, breaking'); break }

    const answers = state.opts.filter(t => !/^(Back|← Back|Home|Next|Skip|Play Again|Next Round|Try Again|Continue)$/.test(t))

    if (answers.length === 0) {
      await page.evaluate((txt) => {
        const b = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === txt)
        if (b) b.click()
      }, state.opts[0])
      await page.waitForTimeout(800)
      roundsPlayed++
      continue
    }

    console.log(`  Q${roundsPlayed + 1}: [${answers.slice(0,4).join(' | ')}] → "${answers[0]}"`)
    await page.evaluate((txt) => {
      const b = [...document.querySelectorAll('button')].find(b => b.innerText.trim() === txt)
      if (b) b.click()
    }, answers[0])
    await page.waitForTimeout(1300)
    roundsPlayed++
  }

  const finalText = await page.evaluate(() => document.body.innerText)
  if (finalText.includes('NaN')) FINDINGS.push(`NaN after playing: ${label}`)
  if (finalText.includes('Infinity')) FINDINGS.push(`Infinity after playing: ${label}`)
  return roundsPlayed
}

;(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 })
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await ctx.newPage()
  page.on('console', m => { if (m.type() === 'error') console.log('  🔴 JS:', m.text().substring(0, 100)) })

  const FINDINGS = []
  const MODULES_PLAYED = []

  // ─────────────────────────────────────
  console.log('\n══ STEP 1: LANDING ══')
  await page.goto('https://yaagvi-learn.vercel.app/')
  await page.waitForTimeout(3000)
  console.log('Title:', await page.title())
  await shot(page, 'landing')

  // ─────────────────────────────────────
  console.log('\n══ STEP 2: LOGIN ══')
  await jsClick(page, 'Already registered')
  await page.waitForTimeout(1500)
  await shot(page, 'login_screen')

  const emailEl = await page.$('input[type="email"]')
  if (emailEl) { await emailEl.fill('claudetest99@mailinator.com'); console.log('Email ✓') }
  const pwEls = await page.$$('input[type="password"]')
  if (pwEls.length > 0) { await pwEls[0].fill('TestPass123!'); console.log('Password ✓') }
  await enterPin(page, '5678')
  await shot(page, 'login_ready')
  await jsClick(page, 'Log In')
  await page.waitForTimeout(3500)
  await shot(page, 'post_login')

  let body = await getBodyText(page)
  if (body.includes('incorrect') || body.includes('Invalid') || body.includes('failed')) {
    FINDINGS.push('Login error: ' + body.match(/.{0,60}(incorrect|Invalid|failed).{0,60}/)?.[0])
    console.log('⚠️  Login may have failed')
  }
  console.log('Post-login:', body.substring(0, 150))

  // ─────────────────────────────────────
  console.log('\n══ STEP 3: WORLDS ══')
  await shot(page, 'world_select')

  const worlds = [
    { name: 'Tiny Stars',   childName: 'Tina' },
    { name: 'Little Stars', childName: 'Leo' },
    { name: 'Super Kids',   childName: 'Sam' },
  ]

  for (const world of worlds) {
    console.log(`\n╔══════════════════════════╗`)
    console.log(`║  ${world.name.padEnd(24)}║`)
    console.log(`╚══════════════════════════╝`)

    // Ensure on world select
    const onWS = await page.evaluate(() => document.body.innerText.includes('Choose your world'))
    if (!onWS) {
      await page.goBack(); await page.waitForTimeout(1500)
    }

    await jsClick(page, world.name)
    await page.waitForTimeout(2500)
    await shot(page, `world_${world.name.replace(/ /g,'_')}_entered`)

    body = await getBodyText(page)
    console.log('World screen:', body.substring(0, 200))

    // Create profile if needed
    if (body.includes('Create Profile') || body.includes('What is your name')) {
      await createProfile(page, world.childName)
      await page.waitForTimeout(2000)
      await shot(page, `world_${world.name.replace(/ /g,'_')}_after_profile`)
      body = await getBodyText(page)
      console.log('After profile creation:', body.substring(0, 300))
    }

    // Handle mood check
    if (body.includes('mood') || body.includes('How are') || body.includes('feeling')) {
      console.log('Mood check — picking first option')
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')]
        const mood = btns.find(b => /😊|😄|😐|😢|🤩|😁|🙂|😀/.test(b.innerText))
        if (mood) mood.click()
        else if (btns[0]) btns[0].click()
      })
      await page.waitForTimeout(1500)
      await shot(page, `world_${world.name.replace(/ /g,'_')}_after_mood`)
      body = await getBodyText(page)
    }

    // Now on the world's dashboard — get all module cards
    await shot(page, `world_${world.name.replace(/ /g,'_')}_dashboard`)
    console.log('World dashboard:', body.substring(0, 400))

    if (body.includes('NaN')) FINDINGS.push(`NaN on ${world.name} dashboard`)
    if (body.includes('Infinity')) FINDINGS.push(`Infinity on ${world.name} dashboard`)

    // Get module buttons
    const moduleCards = await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button, [role="button"]')]
      const skip = ['Log out', '← Back', 'Back', 'Home', 'Parent Zone', 'Meet Yaagvi', 'Register', 'Log In', 'Unlock', 'Privacy Policy', 'Arcade', 'Today\'s Challenge', 'Daily Challenge']
      return btns
        .map(b => b.innerText.trim())
        .filter(t => t.length > 3 && t.length < 80)
        .filter(t => !skip.includes(t))
        .map(t => t.split('\n')[0].trim())
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 10)
    })
    console.log('Module cards:', moduleCards)

    if (moduleCards.length === 0) {
      FINDINGS.push(`No module cards found in ${world.name}`)
      // Scroll to see if modules are below
      await page.evaluate(() => window.scrollTo(0, 400))
      await page.waitForTimeout(800)
      await shot(page, `world_${world.name.replace(/ /g,'_')}_scrolled`)
    }

    // Play up to 3 modules
    for (const cardName of moduleCards.slice(0, 3)) {
      if (['Log out', '← Back', 'Back', 'Home', 'Parent Zone'].some(s => cardName.includes(s))) continue

      console.log(`\n  ── Module: "${cardName}" ──`)
      const modLabel = `${world.name.replace(/ /g,'_')}_${cardName.replace(/[^a-z0-9]/gi,'_').substring(0,15)}`

      const clicked = await page.evaluate((name) => {
        const btns = [...document.querySelectorAll('button, [role="button"]')]
        const b = btns.find(b => b.innerText.trim() === name || b.innerText.trim().startsWith(name) || b.innerText.trim().split('\n')[0].trim() === name)
        if (b) { b.click(); return b.innerText.trim().substring(0, 60) }
        return null
      }, cardName)

      if (!clicked) { console.log('  Could not click'); continue }
      await page.waitForTimeout(2500)
      await shot(page, `mod_${modLabel}`)

      body = await getBodyText(page)
      console.log('  Module loaded:', body.substring(0, 200))

      if (body.includes('NaN')) FINDINGS.push(`NaN in "${cardName}" (${world.name})`)
      if (body.includes('Infinity')) FINDINGS.push(`Infinity in "${cardName}" (${world.name})`)

      // Check still on same screen
      const stillOnDash = await page.evaluate((w) => document.body.innerText.includes('Choose your world'), world.name)
      if (stillOnDash) { console.log('  Did not navigate — skipping'); continue }

      // Play it
      const rounds = await playModule(page, FINDINGS, modLabel)
      MODULES_PLAYED.push({ world: world.name, name: cardName, rounds })
      console.log(`  Played ${rounds} rounds`)

      // Go back to world dashboard
      for (const lbl of ['← Back', 'Back', 'Home']) {
        const went = await jsClick(page, lbl)
        if (went) { console.log(`  Navigated back via "${lbl}"`); break }
      }
      await page.waitForTimeout(1500)

      // If jumped to world select, re-enter
      const onWS2 = await page.evaluate(() => document.body.innerText.includes('Choose your world'))
      if (onWS2) {
        await jsClick(page, world.name)
        await page.waitForTimeout(2000)
        // May need mood check again
        const moodAgain = await page.evaluate(() => /How are|mood|feeling/i.test(document.body.innerText))
        if (moodAgain) {
          await page.evaluate(() => {
            const b = [...document.querySelectorAll('button')].find(b => /😊|😄|😐|😢|🤩/.test(b.innerText))
            if (b) b.click()
          })
          await page.waitForTimeout(1200)
        }
      }
    }

    // Back to world select for next world
    for (const lbl of ['← Back', 'Back', 'Home']) {
      const went = await jsClick(page, lbl)
      if (went) break
    }
    await page.waitForTimeout(1200)
    const onWS3 = await page.evaluate(() => document.body.innerText.includes('Choose your world'))
    if (!onWS3) {
      await page.goBack(); await page.waitForTimeout(1500)
    }
    await shot(page, `after_world_${world.name.replace(/ /g,'_')}`)
  }

  // ─────────────────────────────────────
  console.log('\n══ STEP 6: PARENT ZONE ══')
  // Parent Zone is on the world/child dashboard — enter a world first
  await jsClick(page, 'Little Stars')
  await page.waitForTimeout(2000)
  // skip mood if shown
  const moodNow = await page.evaluate(() => /How are|mood|feeling/i.test(document.body.innerText))
  if (moodNow) {
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find(b => /😊|😄|😐|😢|🤩/.test(b.innerText))
      if (b) b.click()
    })
    await page.waitForTimeout(1200)
  }
  await shot(page, 'world_for_pzone')

  const pzFound = await jsClick(page, 'Parent Zone')
  console.log('Parent Zone button found:', pzFound)
  await page.waitForTimeout(1500)
  await shot(page, 'pzone_pin_dialog')

  await enterPin(page, '5678')
  await page.waitForTimeout(300)
  await jsClick(page, 'Unlock')
  await page.waitForTimeout(2500)
  await shot(page, 'pzone_inside')

  body = await getBodyText(page)
  console.log('Parent Zone:', body)
  if (body.includes('NaN')) FINDINGS.push('NaN in Parent Zone')
  if (body.includes('Infinity')) FINDINGS.push('Infinity in Parent Zone')
  if (body.includes('Parent Zone') || body.includes('Progress') || body.includes('Stats')) {
    console.log('✅ Parent Zone opened successfully')
  } else {
    FINDINGS.push('Parent Zone may not have opened correctly')
  }

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(1000)
  await shot(page, 'pzone_scrolled')

  // ─────────────────────────────────────
  console.log('\n══════════════════════════════')
  console.log('FINAL REPORT')
  console.log('══════════════════════════════')
  console.log('\nModules played:')
  if (MODULES_PLAYED.length === 0) console.log('  (none)')
  else MODULES_PLAYED.forEach(m => console.log(`  ✅ [${m.world}] ${m.name} — ${m.rounds} rounds`))
  console.log(`\nTotal: ${MODULES_PLAYED.length} modules across ${[...new Set(MODULES_PLAYED.map(m => m.world))].length} worlds`)
  console.log('\nFindings:')
  if (FINDINGS.length === 0) console.log('  ✅ No issues found')
  else FINDINGS.forEach(f => console.log(`  ⚠️  ${f}`))
  console.log('\nScreenshots:', ssCount)

  await browser.close()
  console.log('\nDone.')
})().catch(e => {
  console.error('\n💥 FATAL:', e.message)
  process.exit(1)
})
