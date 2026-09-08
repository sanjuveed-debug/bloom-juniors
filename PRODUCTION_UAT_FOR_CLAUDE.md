# Bloom Juniors — Production UAT for Claude

Release under test: Child Interest Engine and the consolidated ages 3–9 experience

Production: https://bloomjuniors.com/

Release preview: https://f5678960.bloom-juniors.pages.dev/

Expected production JavaScript asset at release: `assets/index-BhFRy3zs.js`
Prepared: 17 July 2026

## Copy this instruction to Claude

You are the independent UAT tester for Bloom Juniors, a child-learning application for ages 3–9. Test the deployed production application as a real child and then as a parent. Do not review the source code first and do not modify production. Your first pass must be a black-box browser test based only on what a user can see, hear, tap, and understand.

Use this document as the complete acceptance contract. Record evidence for every test. Do not mark a feature as passed merely because a button exists: complete the interaction and verify the result is saved.

Important rules:

- Never place passwords, PINs, API keys, tokens, or cookies in screenshots or the report.
- Obtain the production login and parent PIN privately from the owner. They are intentionally not stored in this document.
- Do not delete, rename, or reset existing family profiles.
- Prefer three disposable UAT profiles, one for each age band. If creating profiles is not authorised, use the profiles the owner identifies.
- Start with a fresh browser context. Disable translation extensions and other tools that could add speech.
- Test once at desktop width around 1440 × 900 and once at mobile width 390 × 844.
- A hard refresh must not lose earned progress.
- If browser autoplay blocks speech before the first user gesture, that is normal. After the first explicit Play or speaker tap, Azure voice must work.
- Do not silently work around a bug. Capture it.

## Required test accounts and setup

Ask the owner privately for:

- Production email: `<provided privately>`
- Production password: `<provided privately>`
- Parent PIN: `<provided privately>`
- Ages 3–4 profile: `<profile name>`
- Ages 5–6 profile: `<profile name>`
- Ages 7–9 profile: `<profile name>`

Before testing:

1. Open https://bloomjuniors.com/ in a fresh browser context.
2. Hard refresh and, if an older UI remains, unregister the Bloom Juniors service worker and reload.
3. In DevTools Network, confirm the main application asset is `index-BhFRy3zs.js`. If not, report a deployment/cache mismatch before continuing.
4. Keep the Console and Network panels available. Save unexpected errors and failed requests.
5. Start screen recording for the high-risk voice, reward, and persistence tests.

## Severity and release rules

| Severity | Meaning | Examples |
|---|---|---|
| Blocker | A child cannot enter, play, save, or safely leave | Login broken, all games crash, data loss, exposed secret |
| Critical | A core promise is broken for an age band | No voice after a gesture, no playable activity, earned treasure absent, planting lost |
| Major | A feature works incorrectly or creates strong confusion | Correct answer rejected, overlapping speech, retry reveals answer, layout blocks controls |
| Minor | Polish issue with a usable workaround | Small alignment issue, awkward copy, brief animation glitch |

The release is accepted only if there are no Blocker or Critical bugs, every age band has a complete playable journey, Azure voice passes, persistence passes, and the child can always find something meaningful to play.

## UAT 01 — Production, login, and profile safety

| ID | Action | Expected result |
|---|---|---|
| 01.1 | Open production from a signed-out browser | Page loads over HTTPS with no blank screen or fatal console error |
| 01.2 | Sign in using the private credential | Family/profile selection opens; password is not exposed in the URL or console |
| 01.3 | Select each authorised child profile | Correct name, age-appropriate design, stars, streak, and saved state appear |
| 01.4 | Switch between the three profiles | One child's stars, treasures, world, and recommendations never leak into another profile |
| 01.5 | Enter Parent Zone with a wrong PIN, then the correct PIN | Wrong PIN is rejected; correct PIN opens the parent experience |
| 01.6 | Sign out and sign back in | The same profiles and saved progress return |

Evidence: login screen without credentials, profile selector, and one home screenshot per age band.

## UAT 02 — Adventure Home and Child Interest Engine

Run this for all three age groups.

| ID | Action | Expected result |
|---|---|---|
| 02.1 | Open Adventure Home | One visually dominant next action is clear; `My Favourite`, `Surprise Me`, full game map, and Living World are visible |
| 02.2 | Start the main activity, answer at least one item, then go Back before completing | Home now offers `Continue ...`; tapping it returns to the same module |
| 02.3 | Complete that activity and return Home | The completed activity is not falsely shown as unfinished |
| 02.4 | Play the same activity again | `My Favourite` increasingly reflects real repeated play rather than a random label |
| 02.5 | Tap `Surprise Me` | A less familiar valid activity opens for the current age band |
| 02.6 | Quickly exit one activity at least twice, then complete a different one | The repeatedly abandoned activity should not become the favourite |
| 02.7 | Refresh after an unfinished activity | `Continue` survives refresh and points to the unfinished module |
| 02.8 | Check mobile | No card or button is clipped; no horizontal scrolling; minimum tap targets remain usable |

Record the exact Favourite, Surprise, and Continue destinations before and after play.

## UAT 03 — Universal game experience

Apply these checks to every game listed in UAT 04–06.

| ID | Action | Expected result |
|---|---|---|
| 03.1 | Enter a module | A clear arrival/mission screen appears; no narration speaks behind the overlay |
| 03.2 | Tap Play | Azure narration begins only after the gesture and matches the visible instruction |
| 03.3 | Deliberately answer incorrectly once | Same question remains; a gentle clue appears; the correct answer is not exposed |
| 03.4 | Answer incorrectly again | The child receives stronger guidance but can still answer; no forced skip |
| 03.5 | Answer correctly | Visible celebration and appropriate voice feedback occur once, without overlap |
| 03.6 | Complete the session | Score/stars are saved and a tangible reward or progress moment appears |
| 03.7 | Tap Replay | A fresh playable run starts; the previous answer state is cleared |
| 03.8 | Tap Continue/Home | Child returns to Adventure Home and still has another playable choice |
| 03.9 | Use browser Back or the map button mid-game | Returns safely and preserves unfinished/recommendation state |
| 03.10 | Repeat on mobile | Question, choices, guide, feedback, and navigation fit without clipping |

For each module record: load, instruction, wrong-answer behaviour, completion, saved result, audio, mobile fit, and overall child delight from 1–5.

## UAT 04 — Ages 3–4 complete module pass

Use the ages 3–4 profile. Fully play each module:

- Colours
- Shapes
- Numbers
- Animals
- Fruits
- My Body / Body Parts
- Alphabet
- Bloom Quiz Show

Additional acceptance checks:

- Sessions contain several quick, visually distinct steps—not a single tap followed by completion.
- Instructions use very short language and can be understood through voice and imagery.
- Choices are large enough for a young child.
- Yaagvi is the visible companion; no mismatched generic child face appears.
- Colour and object prompts visually agree with the correct answer.
- The experience never requires reading long paragraphs.

## UAT 05 — Ages 5–6 complete module pass

Use the ages 5–6 profile. Open the full game map and play every visible learning destination, including:

- Sound Pop / Phonics
- Number World
- Tricky Words
- Story Room
- Shape World
- Logic / directional puzzles
- Curious Science
- World Explorer / World GK
- Da Vinci Studio
- My Body
- Planet World
- Sacred Stories when available
- Game Arcade and Bloom Quiz Show

Additional acceptance checks:

- Sound Pop visibly reacts to listening, thinking, success, and completion.
- Number World uses a number line that includes the question's range. For example, a question based on 18 cannot stop at 15.
- Number-line hints must not reveal the answer immediately; they may guide after a genuine attempt.
- Shape World builds a multi-piece object/tower rather than showing static shapes only.
- Story Room has a full library and no artificial “new story tomorrow” lockout.
- The personalised Yaagvi story names the child correctly and has coherent page art/text.
- Stories can be read aloud page by page without two voices speaking simultaneously.
- Wrong answers in World Explorer, My Body, and Planet World keep the same challenge available for retry.

## UAT 06 — Ages 7–9 complete module pass

Use the ages 7–9 profile. Open the expedition atlas and play every visible learning destination, including:

- Times Tables
- Fractions
- Reading
- Spelling
- Word Problems
- Piggy Bank / money
- Grammar
- Science
- World Map
- Spirituality / World Faiths
- Games
- Exercise
- Bloom Quiz Show

Additional acceptance checks:

- Questions feel age-appropriate and not like the ages 3–4 version with a different colour palette.
- Times Tables, Fractions, Grammar, World Map, and Word Problems never reveal the answer on the first mistake.
- Reading passages and questions vary across replays.
- Spelling narration clearly pronounces the target word.
- World Faiths content is respectful and instructionally clear.
- The expedition/map labels do not overlap the mascot, route, or each other.
- The full mission map remains understandable on both desktop and mobile.

## UAT 07 — Fresh questions and adaptive difficulty

Run with Numbers/Math and at least two language modules in every applicable age band.

1. Complete two consecutive sessions and capture every question.
2. Confirm the second run is not the same ordered question set.
3. Complete two strong sessions with mostly first-try correct answers.
4. Start another session and check for a sensible increase in range or reasoning—not a sudden inappropriate jump.
5. Deliberately struggle in a later session.
6. Confirm clues become more supportive and the next run does not continue escalating blindly.
7. Sign out/in and confirm the child's journey and level are retained.

Pass condition: questions are generated continuously, recent exact questions are avoided, difficulty responds gradually, and per-child history is persistent.

## UAT 08 — Azure voice and audio isolation

This is a release-critical test. Run it on at least one module from every age band, then spot-check the speaker control in every remaining module.

| ID | Action | Expected result |
|---|---|---|
| 08.1 | Tap Play/speaker after page load | Natural Azure voice plays; not the browser's robotic speech voice |
| 08.2 | Inspect the request | `POST /api/tts` returns HTTP 200, `audio/mpeg`, and non-zero audio bytes |
| 08.3 | Navigate away while speech is playing | Old speech stops immediately |
| 08.4 | Complete a game | No hidden message such as “show it to someone you love” loops in the background |
| 08.5 | Rapidly move to the next question | Only the current instruction is audible; voices do not stack |
| 08.6 | Tap the same speaker repeatedly | App does not create several overlapping narrations |
| 08.7 | Simulate a failed TTS request | A visible friendly voice-unavailable state appears; silent failure is not accepted |

Capture one successful `/api/tts` Network entry and a short video showing clean navigation while narration is active. Do not expose request secrets.

## UAT 09 — Daily path, unlimited play, and no dead end

1. Complete the two suggested daily adventures.
2. Confirm the daily treasure becomes claimable.
3. Claim it and record the exact named collectible received.
4. Confirm the collectible appears in My Treasure Room.
5. Return Home after the daily path is complete.
6. Confirm the child can still use Favourite, Surprise, full game map, Living World, and endless expedition.
7. Launch at least three endless expeditions.
8. Confirm recent destinations are skipped and play is not blocked until tomorrow.

Fail as Critical if the child sees “come back tomorrow” and has no obvious playable alternative.

## UAT 10 — Treasure payoff and Treasure Room

| ID | Action | Expected result |
|---|---|---|
| 10.1 | Earn a daily treasure | The reward opens visibly; the child knows what came out of the chest |
| 10.2 | Open My Treasure Room | Earned item is owned and visually available; locked items remain clearly different |
| 10.3 | Place/decorate with an owned item | Item appears in the room and can be repositioned |
| 10.4 | Refresh and sign in again | Placement and ownership persist |
| 10.5 | Equip a treasure for a game | Equipped item/power appears in the game without hiding answers or controls |
| 10.6 | Complete its treasure quest | Quest progresses once per valid module; reward effect unlocks once |
| 10.7 | Complete a treasure set | The secret game unlocks and is actually playable |

Confirm every treasure has a name, visible payoff, purpose, and persistent location.

## UAT 11 — Living World, seeds, and persistence

1. Earn at least two Wonder Seeds through learning.
2. Open My Living World / Yaagvi's Secret World.
3. Plant two different seed types in separate plots.
4. Confirm each selected seed has distinct seed art, name, colour, preview, and eventual discovery—not the same generic sprout card.
5. Refresh immediately; both growing plots must remain.
6. Sign out and sign back in; both growing plots must remain.
7. Open in a second browser/device; the plots must sync.
8. Return after the configured growth period/day boundary; each plot must mature into its correct distinct discovery.
9. Confirm the discovery is added once to My Discoveries and is not duplicated by refresh.

Fail as Critical if planting disappears after refresh or every seed produces the same visual/result.

## UAT 12 — Living Adventure, mystery egg, companion, and projects

| ID | Action | Expected result |
|---|---|---|
| 12.1 | Open the weekly Living Adventure | Current chapter, progress, map art, and next action are coherent |
| 12.2 | Complete its learning requirement | Chapter advances once and its saved state survives refresh |
| 12.3 | Observe Mystery Egg | Progress reflects real daily treasure actions and does not reset unexpectedly |
| 12.4 | Use companion/buddy | Correct companion follows the child and reactions match play state |
| 12.5 | Use companion power | A charge is consumed once and gives a clue, never the answer |
| 12.6 | Earn/build a Dream Project piece | Required materials reduce correctly and the scene visibly changes |
| 12.7 | Complete or inspect the age-specific project | Ages 3–4, 5–6, and 7–9 receive age-appropriate projects and art |
| 12.8 | Complete project adventure clues | A named souvenir opens and remains in the world |

Check the completed Magical Skyship carefully: no empty placeholder wings, misaligned shapes, tiny pasted mascot, or confusing blank controls are acceptable.

## UAT 13 — Bloom Quiz Show

Run the show once in every age band.

- The child is named as the contestant.
- Host does not speak before the child enters.
- Azure host speech starts after the child's gesture.
- Questions and answer choices suit the age band.
- 50/50 removes choices visibly.
- Clue lifeline gives learning support rather than the answer.
- Correct play opens a named, tangible prize.
- Completion sends the exact score/stars to the existing progress system.
- Replay produces fresh questions.
- The show fits at 390 × 844 without horizontal overflow.

## UAT 14 — Parent Zone

1. Enter Parent Zone with the private PIN.
2. Confirm the selected child is obvious.
3. Verify totals match the child's just-completed sessions.
4. Open `What keeps <child> engaged`.
5. Confirm Favourite reflects repeated completed play, `Discovering next` is reasonable, and repeated quick exits appear as possible friction only after sufficient evidence.
6. Confirm a parent can understand the insight without technical language.
7. Open the parent progress story; confirm it names real skills, recent wins, and useful home activities.
8. Send a Parent High Five with a sticker.
9. Return to the child view; confirm the message arrives once and can be kept.
10. Refresh; confirm delivered/kept status persists and the message does not replay forever.

Parent insights must never compare siblings publicly or shame a child for mistakes.

## UAT 15 — Cross-device/cloud persistence

Use two separate browser contexts signed into the same authorised family account.

1. In browser A, complete a module, earn stars, plant a seed, and place a treasure.
2. Wait for sync, then open the same profile in browser B.
3. Confirm all four changes appear.
4. In browser B, play a different module and send/receive one allowed parent action.
5. Refresh browser A.
6. Confirm both devices' unique progress has merged; neither overwrites the other.
7. Confirm recommendations learn from both sessions without duplicate completion events.

Fail as Blocker for lost or cross-profile data.

## UAT 16 — Visual, motion, and child-understanding audit

On every major page ask:

- Can a child identify the next tap within three seconds?
- Is Yaagvi consistently the same mascot?
- Does motion explain success, thinking, growth, travel, or reward rather than merely bounce?
- Are headings dark enough against the background?
- Are labels readable over illustrated maps?
- Are cards aligned and similar actions grouped together?
- Are there too many stars, currencies, or unrelated sections competing for attention?
- Is the reward represented by a real object/place/change rather than only a number?
- Does the screen still make sense with sound muted?
- Does the spoken instruction match the visible task?

Report any page where the child would plausibly ask “What do I do?”, “Where is my treasure?”, or “Why should I come back?”

## UAT 17 — Reliability and privacy smoke test

- No uncaught console errors during the primary journey.
- No repeated 4xx/5xx requests except an intentionally simulated failure.
- No email, password, PIN, Azure key, Cloudflare token, or Supabase secret appears in client logs, page source, URLs, screenshots, or reports.
- Reloading mid-game does not corrupt the family profile.
- Rapid tapping does not grant duplicate treasure, stars, seeds, materials, or companion charges.
- Back/forward navigation does not create a blank overlay or trap the child.
- Session timer/lock, where enabled, remains accessible and does not conceal game controls.

## Supporting automated regression for Claude Code

Black-box production testing is mandatory. If Claude also has access to this workspace, run the automated suite as supporting evidence:

```powershell
npm test
npm run build
node tests/adventure-home-uat.mjs
node tests/toddler-games-uat.mjs
node tests/animated-modules-uat.mjs
node tests/ks2-retry-uat.mjs
node tests/bloom-quiz-uat.mjs
node tests/game-feel-uat.mjs
node tests/wonder-world-uat.mjs
node tests/living-treasures-uat.mjs
node tests/project-adventures-uat.mjs
node tests/parent-high-five-uat.mjs
node tests/parent-progress-story-uat.mjs
node tests/treasure-loadout-uat.mjs
node tests/treasure-quest-uat.mjs
```

These local harnesses do not replace testing the deployed production account and cloud persistence.

Current developer baseline before independent UAT:

- 127/127 unit tests passed.
- 56/56 ages 3–4 game checks passed.
- 38/38 ages 5–6 animation/retry checks passed.
- 38/38 ages 7–9 retry checks passed.
- 30/30 Bloom Quiz checks passed.
- 27/27 universal game-feel checks passed.
- Production returned the same release asset as the local build.
- Production Azure TTS returned HTTP 200, `audio/mpeg`, with non-zero audio.

Claude must independently validate these claims.

## Required final report format

### 1. Executive verdict

- Verdict: `PASS`, `PASS WITH MINOR ISSUES`, or `FAIL`
- Safe for real children now: `YES` or `NO`
- Tested production URL and release asset
- Browser, operating system, viewport, date/time, and profile age bands
- Total Passed / Failed / Blocked / Not Tested

### 2. Critical journey scorecard

| Journey | Ages 3–4 | Ages 5–6 | Ages 7–9 | Evidence | Verdict |
|---|---:|---:|---:|---|---|
| Login/profile separation | | | | | |
| Adventure Home | | | | | |
| All learning modules | | | | | |
| Azure voice | | | | | |
| Fresh/adaptive questions | | | | | |
| Daily treasure payoff | | | | | |
| Treasure Room/loadout | | | | | |
| Living World persistence | | | | | |
| Living Adventure/project | | | | | |
| Bloom Quiz Show | | | | | |
| Parent Zone/high five | | | | | |
| Cross-device cloud sync | | | | | |
| Mobile fit | | | | | |

### 3. Bug list

For every bug include:

- Bug ID and concise title
- Severity
- Age band and profile used
- Production URL/page/module
- Exact numbered reproduction steps
- Expected result
- Actual result
- Reproduction rate, for example 3/3
- Screenshot or short video
- Console error and failed Network request, if relevant
- Whether refresh, sign-out, or another device changes the result

### 4. Child-experience observations

Provide the five most delightful moments and the five most confusing or boring moments. Distinguish observed product behaviour from personal design opinion.

### 5. Release recommendation

List only:

1. Must fix before children use it.
2. Should fix in the next release.
3. Nice-to-have polish.
4. Features that should remain unchanged because they tested well.

Do not give a vague summary. Every failure must have reproducible evidence, and every untested area must be explicitly marked `NOT TESTED` rather than assumed to pass.
