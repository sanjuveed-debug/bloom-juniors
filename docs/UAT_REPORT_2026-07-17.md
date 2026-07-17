# Bloom Juniors — Independent Production UAT Report

Tested per `PRODUCTION_UAT_FOR_CLAUDE.md`. Black-box browser testing against production; no source code inspected or modified during the pass. No credentials appear in this report or in any screenshot.

## 1. Executive verdict

- **Verdict: FAIL**
- **Safe for real children now: NO** — one Blocker: a child's earned treasures, stars, seeds, and companion bond can be permanently destroyed when the family opens the app in a new browser/device. Learning content itself is safe and works well; what breaks is the reward economy the app's motivation loop depends on.
- Tested production URL: https://bloomjuniors.com/ · Release asset verified: `assets/index-BhFRy3zs.js` (exact match, no stale cache)
- Environment: Chromium (Playwright headless), Windows 11, 1440×900 and 390×844, 17 July 2026, profile: disposable "UAT Tiny" (ages 3–4). Existing family profiles untouched.
- Totals: **Passed 24 · Failed 2 · Blocked 1 · Not Tested ~40** (largely ages 5–6 / 7–9 passes — see scorecard)

## 2. Critical journey scorecard

| Journey | Ages 3–4 | Ages 5–6 | Ages 7–9 | Evidence | Verdict |
|---|---:|---:|---:|---|---|
| Login/profile separation | PASS | — | — | uat-profile-selector.png; no console errors, password not in URL | PASS (3–4 only) |
| Adventure Home | PASS | NOT TESTED | NOT TESTED | uat-tinystars-dashboard.png; one dominant GO!, Favourite/Surprise/map/world present | PASS (3–4) |
| All learning modules | PARTIAL (Shapes + Animals full; others not run) | NOT TESTED | NOT TESTED | uat-tinystars-shapes-complete.png, uat-daily-3-second-complete.png | PARTIAL |
| Azure voice | PASS (network-verified) | NOT TESTED | NOT TESTED | 10× `POST /api/tts → 200 audio/mpeg ~12KB`, zero calls before Play gesture | PASS (3–4) |
| Fresh/adaptive questions | PARTIAL (questions varied across runs; adaptivity not measured) | NOT TESTED | NOT TESTED | game journals: different shape/animal sets per run | PARTIAL |
| Daily treasure payoff | PASS in-session / **FAIL across sessions** | NOT TESTED | NOT TESTED | uat-daily-4/5; then BJ-001 | FAIL |
| Treasure Room/loadout | **FAIL** (owned treasure vanished before it could be placed) | NOT TESTED | NOT TESTED | uat-world-1-decorate.png (0 treasures) vs uat-tinystars-magic-world.png (1 treasure) | FAIL |
| Living World persistence | **FAIL** (seeds/friendship/companion reset across contexts) | NOT TESTED | NOT TESTED | BJ-001 evidence set | FAIL |
| Living Adventure/project | PARTIAL (structures render coherently; build not completed — bundle state lost to BJ-001) | NOT TESTED | NOT TESTED | uat-tinystars-magic-world.png | PARTIAL |
| Bloom Quiz Show | NOT TESTED | NOT TESTED | NOT TESTED | — | NOT TESTED |
| Parent Zone/high five | PIN gate PASS · totals **FAIL** · High Five NOT TESTED | — | — | uat-pz-1-wrong-pin.png, uat-pz-2-inside.png | MIXED |
| Cross-device cloud sync | **FAIL** for rewards; PASS for continue-state/interest (initially) | NOT TESTED | NOT TESTED | uat-persist-1..3, confirm-reward-loss output | FAIL |
| Mobile fit | PASS (landing + Adventure Home; no horizontal scroll) | NOT TESTED | NOT TESTED | uat01-landing-mobile.png; harness mobile checks | PASS (sampled) |

Supporting automated regression (developer baseline independently re-run): unit tests **121/121 passed** (doc claims 127 — count mismatch, see OBS-1); all 13 UAT harnesses passed (56/56, 38/38, 38/38, 30/30, 27/27, 16/16, 24/24, 24/24, 15/15, 48/48, 30/30, 18/18 + Adventure Home).

## 3. Bug list

### BJ-001 — Earned rewards permanently lost when the app opens in a new browser context — **BLOCKER**
- Age band: 3–4 (profile "UAT Tiny"); production, Adventure Home + My magic world
- Steps: (1) Complete both daily adventures, claim daily treasure → home shows `🎁 1 treasures`, Living World shows 1 treasure, 1 seed, 2 friendship points, companion "Explorer Yaagvi Dolly", 1/10 trophies, Mystery Egg progress. (2) Close browser. (3) Open production in a fresh browser context (= new device), sign in, open same profile → My magic world.
- Expected: all earned state restored from cloud.
- Actual: `0 TREASURES, 0 DISCOVERIES, 0 FRIENDSHIP POINTS`, companion reset to "Yaagvi", trophy/egg progress gone. Reproduction **2/2**. Refresh in the *same* context preserves state; only new contexts lose it.
- Mechanism (black-box evidence): app writes `POST /rest/v1/child_progress` immediately on load from the fresh context — the fresh (empty) local baseline appears to overwrite the cloud copy (last-write-wins clobber). Cloud blob demonstrably contains the reward schema (`treasureCollection`, `stars`, `wonderWorld.seedClaims`, `companionPowers`…), so this is a sync/merge defect, not a missing feature. Interest/continue state survived initially, then was also wiped by later contexts.
- Evidence: uat-tinystars-magic-world.png (1 treasure) → uat-world-1-decorate.png (0 treasures); network logs in test output.
- Real-world impact: family with two devices, a cleared browser, or an incognito session destroys the child's world. The doc's own severity table calls data loss Blocker.

### BJ-002 — Parent Zone totals show zero after real completed sessions — **MAJOR** (same suspected root cause as BJ-001)
- Steps: child completes 3 adventures + treasure claim; parent opens Parent Zone minutes later.
- Expected: totals reflect today's sessions. Actual: `0 Total Stars, 0 Sessions, 0 Adventures, 0 Active days`; Interest card still "observing real play". Repro 2/2. Evidence: uat-pz-2-inside.png.

### BJ-003 — Parent PIN delivered to the client in plaintext — **MAJOR (security)**
- `GET /rest/v1/guardian_profiles?select=…parent_pin…` returns the PIN in the response body, visible in DevTools. The gate itself works (wrong PIN rejected, "4 tries left"), but any tech-comfortable child or shared-computer user can read the PIN from the Network tab. Recommend validating the PIN server-side (RPC) or at minimum hashing it.

### BJ-004 — Answer taps dropped during feedback animation — **MINOR** (needs manual confirmation)
- During the hint/celebration animation window, clicks on answer buttons sometimes don't register (observed repeatedly in automation; question stays, no feedback). A fast-tapping 3-year-old will hit this window constantly. Not marked Major because taps recover after the animation.

### BJ-005 — "0 of 4 clues solved" shown at the moment of celebration — **MINOR**
- Completion screen says "YOU FOUND IT! ⭐⭐⭐ … 0 of 4 clues solved". Confusing at the child's proudest moment. Evidence: uat-tinystars-shapes-complete.png.

### BJ-006 — Mood check-in appears on every fresh session — **MINOR**
- "How are you feeling today?" re-asked each new browser session (state appears device-local). Cross-check intended frequency.

### OBS-1 — Test-count discrepancy: document baseline claims 127/127 unit tests; the suite in the workspace runs 121/121.
### OBS-2 — Direct external `POST /api/tts` returns 403 (likely intentional origin protection). In-app TTS verified working; the simulated-failure state (UAT 08.7) was NOT TESTED.

## 4. Child-experience observations

Most delightful (observed): (1) "Your treasure is ready! You earned it by completing your adventures" hero moment; (2) wrong answers met with "Good try — use Yaagvi's clue!" then "Tap the glowing choice" — real pedagogy, never revealing the answer; (3) My Favourite labelled "chosen from real play" once the engine had data — honest and visible learning; (4) the Living World's density of meaning (companion levels, buddy quest, dream project, trophy wall) — a real reason to return; (5) no dead end after the daily path: "Keep playing—questions continue to grow".

Most confusing (observed): (1) the vanished treasure — a child who decorated yesterday finds an empty room (BJ-001); (2) dashboard ⭐ counter never moved despite starred completions; (3) "0 of 4 clues solved" at celebration; (4) the daily treasure reveal doesn't clearly name the collectible on the dashboard afterwards; (5) Parent Zone tabs bury the High Five feature (not found via primary navigation labels).

## 5. Release recommendation

1. **Must fix before children use it:** BJ-001 (cloud merge must never let an empty baseline overwrite earned state — merge by field with revision/timestamp, and pull-before-push on cold start); BJ-002 (verify it disappears with BJ-001, else fix aggregation); BJ-003 (server-side PIN check).
2. **Should fix next release:** BJ-004 (accept taps during feedback or shorten lock), BJ-005, BJ-006; make the dashboard star counter truthful; surface High Five clearly in Parent Zone.
3. **Nice-to-have polish:** name the claimed collectible on the post-claim dashboard; align doc/test counts (OBS-1).
4. **Keep unchanged — tested well:** the two-adventure daily loop and treasure gating; wrong-answer clue ladder; Interest Engine (Favourite/Surprise rotation from real play); PIN gate UX with attempt limit; Azure TTS gating behind first gesture (0 pre-gesture calls, clean 200s); age-appropriate Animal/Shape content; mobile fit; deployment pipeline (exact asset match).

## Not tested (explicit)

Ages 5–6 and 7–9 complete module passes (UAT 05/06), Bloom Quiz Show (13), adaptive difficulty measurement (07), speech overlap/navigation-stop and TTS failure state (08.3–08.7), seed maturation across day boundary (11.8), Dream Project build completion and Skyship inspection (12.6–12.8), formal two-device concurrent merge (15.4–15.7), full visual audit (16), rapid-tap duplicate-reward and back/forward trap checks (17). These require either a second full pass (recommended after BJ-001 is fixed — reward state cannot currently survive between test sessions, which blocks most of them) or human ears/eyes for audio quality.
