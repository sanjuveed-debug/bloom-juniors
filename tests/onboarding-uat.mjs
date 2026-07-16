import { chromium } from '@playwright/test'

const BASE_URL = process.env.UAT_BASE_URL || 'http://localhost:5173'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 414, height: 896 } })

const results = []
function check(label, ok, extra = '') {
  results.push({ label, ok, extra })
  console.log(`${ok ? 'PASS' : 'FAIL'} - ${label}${extra ? ` (${extra})` : ''}`)
}

// ── Phase 0: 0/2 study sessions today → Daily Bloom Path visible, locked tabs ──
await page.goto(`${BASE_URL}/test-dashboard.html?scenario=path0`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
await page.screenshot({ path: 'tests/uat_phase0_path.png' })
check('Phase 0: "Today\'s treasure map" visible', await page.getByText("Today's treasure map", { exact: false }).count() > 0)
check('Phase 0: Living World action is visible inside the main adventure', await page.getByRole('button', { name: /open my living world/i }).count() > 0)
check('Phase 0: "Play More" tab NOT visible', await page.getByText('Play More').count() === 0)
check('Phase 0: celebration screen NOT visible', await page.getByText('Your learning path is complete!').count() === 0)

// ── Phase 1: 1/2 study sessions today → one step marked done, still on path ──
await page.goto(`${BASE_URL}/test-dashboard.html?scenario=path1`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
await page.screenshot({ path: 'tests/uat_phase1_path.png' })
check('Phase 1: "Today\'s treasure map" still visible', await page.getByText("Today's treasure map", { exact: false }).count() > 0)
check('Phase 1: completed-step state shown', await page.getByText('Follow the trail!', { exact: true }).count() > 0)
check('Phase 1: "Play More" tab NOT visible', await page.getByText('Play More').count() === 0)

// Living story is finished for today, but the second daily game must remain playable.
await page.goto(`${BASE_URL}/test-dashboard.html?scenario=living1`, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await page.screenshot({ path: 'tests/uat_phase1b_next_activity.png', fullPage: true })
check('Phase 1b: tomorrow story lock still offers a playable next activity', await page.getByTestId('daily-treasure-next').count() > 0)

// ── Phase 2: 2/2 study sessions, celebration not yet seen → CelebrationScreen ──
await page.goto(`${BASE_URL}/test-dashboard.html?scenario=celebration`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
await page.screenshot({ path: 'tests/uat_phase2_celebration.png' })
check('Phase 2: celebration screen visible ("Your learning path is complete!")', await page.getByText('Your learning path is complete!').count() > 0)
check('Phase 2: "Show grown-up" button visible', await page.getByRole('button', { name: /show grown-up/i }).count() > 0)
check('Phase 2: "Play Arcade" button visible', await page.getByRole('button', { name: /play arcade/i }).count() > 0)

// Dismiss celebration via "Show grown-up" → treasure stays reachable until claimed
await page.getByRole('button', { name: /show grown-up/i }).click()
await page.waitForTimeout(800)
await page.screenshot({ path: 'tests/uat_phase3_after_dismiss.png' })
check('Phase 3: celebration screen dismissed', await page.getByText('Your learning path is complete!').count() === 0)
check('Phase 3: treasure map remains until the treasure is claimed', await page.getByText("Today's treasure map", { exact: false }).count() > 0)
check('Phase 3: "Play More" tab now visible', await page.getByText('Play More').count() > 0)
check('Phase 3: "Today" tab visible', await page.getByText('Today').count() > 0)
check('Phase 3: "My Garden" tab visible', await page.getByText('My Garden').count() > 0)
await page.getByRole('button', { name: /open my treasure/i }).click()
await page.waitForTimeout(900)
await page.screenshot({ path: 'tests/uat_phase3_treasure_reveal.png' })
check('Phase 3: real treasure reveal opens', await page.getByText('Explorer Yaagvi Dolly', { exact: true }).count() > 0)
check('Phase 3: reward can be put in the Treasure Room', await page.getByRole('button', { name: /put it in my treasure room/i }).count() > 0)
await page.getByRole('button', { name: /put it in my treasure room/i }).click()
await page.waitForTimeout(450)
check('Phase 3: claimed treasure map is removed', await page.getByText("Today's treasure map", { exact: false }).count() === 0)
await page.getByRole('button', { name: /my living world/i }).click()
await page.waitForTimeout(500)
await page.screenshot({ path: 'tests/uat_phase3_living_world.png', fullPage: true })
check('Phase 3: personal Living World opens', await page.getByRole('heading', { name: /living world/i }).count() > 0)
check('Phase 3: first daily treasure feeds the Mystery Egg inside the Living World', await page.getByText('Mystery Egg #1', { exact: true }).count() > 0)
await page.getByRole('button', { name: /decorate my world/i }).click()
check('Phase 3: Explorer Yaagvi Dolly is owned', await page.getByText('Explorer Yaagvi Dolly', { exact: true }).count() > 0)
check('Phase 3: locked future treasures remain visible', await page.getByText('Mystery treasure', { exact: true }).count() > 0)
await page.getByRole('button', { name: 'Back', exact: true }).click()

// ── Phase 4: scenario=done (celebration already seen via sessionStorage) ──
await page.goto(`${BASE_URL}/test-dashboard.html?scenario=done`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
await page.screenshot({ path: 'tests/uat_phase4_done.png' })
check('Phase 4: celebration screen NOT shown (already seen)', await page.getByText('Your learning path is complete!').count() === 0)
check('Phase 4: "Play More" tab visible directly', await page.getByText('Play More').count() > 0)

// ── Click into "Play More" tab and check extra activities / arcade are reachable ──
await page.getByText('Play More').click()
await page.waitForTimeout(800)
await page.screenshot({ path: 'tests/uat_phase5_playmore.png' })
check('Phase 5: "More Choices" section visible', await page.getByText('More Choices').count() > 0)
check('Phase 5: "Game Arcade" visible under Play More', await page.getByText('Game Arcade').count() > 0)

await browser.close()

const failed = results.filter(r => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`)
if (failed.length) {
  console.log('\nFailures:')
  failed.forEach(f => console.log(`  - ${f.label}`))
  process.exit(1)
}
