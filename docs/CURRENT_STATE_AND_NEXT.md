# Bloom Juniors: Current State and Next

Last updated: 2026-08-11

This is the canonical handoff for the next Bloom Juniors work session. Read this
before planning or changing the product.

## Product Direction

Bloom Juniors is for children ages 3-9. Its purpose is not only to provide games,
but to build strong foundations that help children understand language, maths,
science, people, history, culture, values, systems, and the world around them.

The current product priority is retention. More content is not the immediate
answer. Children need one understandable reason to return, continuity from the
previous visit, meaningful rewards, and visible parent value.

Product principles:

- Give the child one clear next action.
- Continue from where the child stopped.
- Do not punish missed days or create anxiety around streaks.
- Connect learning into stories, investigations, projects, and conversations.
- Make learning feel physically alive: use depth, character reactions, and
  meaningful animation to show cause and effect, not as decoration or an answer
  giveaway.
- Show parents useful evidence near the top of the Parent Zone.
- Measure whether changes improve real Day 1, Day 3, and Day 7 return.

## Production

- Custom domain: https://bloomjuniors.com/
- Cloudflare Pages project: `bloom-juniors`
- Latest deployment: https://e23daa7f.bloom-juniors.pages.dev/
- Latest verified main bundle: `assets/index-CrXgzRH7.js`
- Latest verified toddler bundle: `assets/ToddlerApp-mX2cnPiu.js`
- Latest verified Number World bundle: `assets/NumberWorld-DMy_zx10.js`
- Latest verified junior bundle: `assets/KS2App-BIfuYxvw.js`
- Latest verified Sound Pop bundle: `assets/SoundPop-DdNpiH7U.js`
- Latest verified founder bundle: `assets/FounderDashboard-3VeS1NGn.js`
- Cloudflare deployment command:
  `npx wrangler pages deploy dist --project-name bloom-juniors --branch main --commit-dirty=true`
- Business email routing and sending verified on 2026-08-11:
  - Cloudflare Email Routing forwards `sanju@bloomjuniors.com` to
    `sanjuveed@gmail.com`
  - Gmail can send as `Sanju | Bloom Juniors <sanju@bloomjuniors.com>` through
    authenticated Gmail SMTP
  - `sanjuveed@gmail.com` remains the default sender for new personal messages
  - replies use the address that originally received the message, so replies to
    Bloom mail come from `sanju@bloomjuniors.com`
  - the dedicated app password remains only in Google/Gmail and is not stored in
    the repository or this handoff

Never store Cloudflare, Supabase, Azure, email, or push credentials in this file
or in source control. Authentication must come from the configured environment.

## Latest Retention Readout

Founder Dashboard review on 2026-08-11 at 10:55 Asia/Dubai:

- 38 real login accounts, 31 saved parent setups, and 31 profile families
- 12 real families completed a first mission: 39% of saved profile families,
  up from 11 of 30 in the previous review
- exact Day 1 return is 2 of 15 eligible profiles (13%); Day 3 and Day 7 remain
  0 of 13
- the tracked first-session cohort since 2026-08-06 has 3 profile creations,
  3 activity starts, and 2 activity completions
- the largest current loss remains 19 families between profile creation and
  first-mission completion
- 2026-08-10 recorded 5 active profiles and 12 completed activities; 2026-08-11
  currently has 1 active profile and no completion
- the first durable ChatGPT acquisition record completed a first mission and
  returned on Day 1, but one account is not enough to judge source quality
- reminders are not yet proving a return loop: 3 profiles enabled reminders,
  3 received one, and 0 opened from it
- the new content-specific depth release is too recent and the cohort too small
  to attribute a retention change. Hold major feature work and re-read the same
  metrics after at least 72 hours; investigate the incomplete first activity as
  the next product problem if the 67% tracked completion rate persists.

## What Is Live

### Public Website

- Compact redesigned landing page
- Current five-petal Bloom flower favicon and PWA icon set, published under
  versioned `bloom-v3-*` filenames to bypass stale browser and service-worker
  icon caches
- Improved first-load presentation and animation treatment
- Founder story strip and founder story entry point
- Updated Schools page using the new visual system
- Corrected hero and founder-section clipping/alignment issues

### Child Experience

- Mobile dashboard and profile navigation:
  - toddler, early-years, and junior dashboards keep a visible `Switch child`
    action in the header instead of hiding it at phone widths
  - the selected child can always return to profile selection without entering
    the Parent Zone
  - toddler and junior headers reserve the iOS PWA safe area and suppress
    duplicate reward counters on narrow phones
  - the junior full-map briefing is compact on phones, its four modes use a
    stable two-column selector, and inactive destinations become icon-only so
    fourteen labels no longer collide
- Shared interactive depth across wrapped learning modules:
  - every toddler, early-years, and junior game using `AdventureModuleFrame`
    receives a short perspective stage entrance
  - marked answer controls have physical elevation, downward press travel,
    correct-answer lift, and supportive retry recoil
  - the shared treatment preserves each module's existing logic and does not
    reveal answers
  - reduced-motion preferences disable the stage and feedback animations
  - Sound Pop retains its richer content-specific 3D blend and map scene
- Content-specific interactive depth for the next three age-band lessons:
  - toddler Number Play turns each countable picture into a tactile object;
    children tap objects one by one and receive visible count-order markers
    before choosing the number
  - early-years Number World lets children physically join addition groups and
    move subtraction objects away without revealing the answer
  - junior Grammar Grove presents sentence words as blocks; the highlighted
    word can be tapped or dragged before the child identifies its grammatical
    job
  - each model keeps the original question, scoring, and adaptive flow intact,
    and all answer decisions remain with the child
- Age-specific experiences for toddler, early years, and junior children
- Sound Pop phonics and blend flow with spoken instructions and replay controls
- Sound Pop 3D learning pilot:
  - `map` is the first guided Sound Buttons word, followed by the existing
    varied word pool
  - sound tiles have stable tactile depth, pressed states, and a physical joined
    blend state while preserving pure phoneme audio
  - the automatic `Which picture is "map"?` question remains the decision point;
    the 3D map cannot appear before the correct picture is selected
  - the correct answer opens an interactive-looking 3D map scene with the
    segmented and whole word visible
  - touch targets remain geometrically stable while separate glow rings animate
  - repeating motion respects the operating-system reduced-motion preference
- Universal completion celebration:
  - Yaagvi remains visible on phones and celebrates beside a polished treasure
    reveal
  - the real score, saved reward, world change, and next existing activity are
    staged in one short, skippable sequence
  - toddler, early, and junior copy remains age-specific
  - session timer and guide overlays are suppressed during the full-screen reveal
  - no background speech or music starts automatically
- Number World supportive retry flow:
  - a wrong choice receives a brief amber `Try again` state instead of a large
    red failure state
  - the same question unlocks again after 850 ms
  - a worked visual hint appears after two consecutive wrong attempts
  - first-try success remains the source of stars, accuracy, and adaptive
    difficulty
  - sessions separately retain `firstTryCorrect`, `supportedCorrect`, and
    `completedCorrect`, and Parent Zone identifies answers completed after
    support
- Personalized balanced daily learning recommendations
- Seven-day Bloom Adventure with persistent chapter continuity
- One Daily Learning Journey on the main dashboard:
  - seven-day chapter
  - two learning stops
  - optional Wonder
  - earned treasure
  - one primary next-action button
  - seven-day activity rhythm
  - no missed-day penalty
- Foundation Season with 28 connected discoveries
- Foundation Season Map and permanent completion artifact
- Science Investigation Path:
  - four connected trails
  - sixteen investigations
  - Predict, Model, Evidence, Explain, Connect flow
  - trail badges
  - Science Field Journal
- From Home to the World:
  - seven connected discoveries spanning maps, neighbourhood systems, UAE city
    water, perspectives on place, family roots, historical sources, and change
  - age-specific toddler, early-years, and junior depth
  - prediction or claim, evidence inspection, explanation, and offline field task
  - sequential unlocks without a calendar gate or missed-day penalty
  - permanent My Place Story artifact after all seven discoveries
  - existing flags, capitals, countries, and timeline quizzes retained as a
    secondary Country Library
- Existing science Question Library retained with corrected explanations
- Wonder World, daily treasures, companions, projects, and ongoing rewards
- Avatar Workshop retention loop:
  - the first successful completion of each different activity per local day
    awards one Bloom Coin
  - replaying the same activity that day does not award another coin
  - Bloom Coins are spendable and remain separate from learning stars, XP, and
    daily-journey treasures
  - seven cosmetic items can be unlocked and equipped in persistent head, face,
    back, badge, and effect slots
  - every age-band dashboard has a visible coin balance and workshop entry
  - the award and purchase ledgers merge across devices
  - there are no real-money purchases, random rewards, expiring items, or
    missed-day penalties
- Web push notifications and test notifications are working after permission is
  granted by the browser
- Registration now continues directly into the child's first learning
  adventure. The app establishes the authenticated local session during signup,
  waits for the child profile to persist to Supabase with bounded retries, and
  then selects that child without requiring a second login.
- First Mission Return Loop:
  - reminder setup no longer interrupts a child before learning
  - the first completed mission previews a specific reason to return tomorrow
  - after continuing home, a grown-up can unlock reminder setup with the family
    PIN
  - email reminders work without installing the PWA or granting browser
    notification permission
  - phone push remains an optional second channel
  - reminder preferences and dismissal state persist locally and in cloud
    progress, so the prompt is not repeatedly shown
  - reminder email and push actions deep-link into the personalized next safe
    learning module rather than the general dashboard
- Seven-completion starter path:
  - a child with no completed learning skips the optional mood check-in
  - the first seven completed learning activities use one focused,
    age-appropriate action instead of the full dashboard, with a single large
    start action and spoken replay control
  - every starter action opens an existing activity directly without the extra
    module-arrival confirmation screen
  - a visible seven-step path persists by completed sessions, not calendar days,
    so missing a day never removes progress
  - the age-specific sequence uses only existing free learning modules; it does
    not add curriculum, games, or currencies
  - each completion shows progress and previews the exact next existing activity
  - after the seventh completion, the normal Daily Learning Journey returns
    unchanged
- Treasure Room mobile presentation:
  - full-screen room content respects the iOS top and bottom safe areas
  - the global session timer and learning guide are hidden while the room is
    open, preventing them from covering Back, game, and collection controls
  - all five collection filters fit the phone width without clipping
  - living treasure cards use their stable poster image instead of layering a
    WebM over it, avoiding the black video rectangle seen in iPhone Safari

### Parent Experience

- Important progress information is surfaced near the top of the Parent Zone
- Today's Journey summary includes:
  - today's completion status
  - assigned learning stops
  - Wonder status
  - seven-day chapter progress
  - seven-day activity rhythm
  - a suggested parent conversation
- Weekly learning story
- Foundation Season summary
- Science Field Journal and recent investigation evidence
- My Place Story progress, next connection, offline task, and parent conversation
- Foundation coverage and parent preference controls
- Notification controls and test notification action

### Data and Analytics

- Progress persists locally and merges with cloud progress
- Science investigations, Home to the World, weekly story, Foundation Season,
  rewards, and other persistent systems have cloud merge support
- Durable retention telemetry records profile opens, journey actions, and one
  idempotent journey completion per local calendar day
- First-touch acquisition tracking is durable for new guardian and teacher
  accounts created from 2026-08-10 onward. It stores a normalized source,
  medium, campaign, landing path, referrer host, visitor timezone, and language
  in Supabase Auth metadata. Full referrer URLs, query strings, names, emails,
  and IP addresses are not returned by founder reporting.
- `/founder` includes an aggregate Acquisition Quality section connecting each
  source to login accounts, parent setup, families with profiles, first-mission
  activation, and exact Day 1/3/7 retention. It also aggregates landing paths
  and visitor timezones. Accounts created before durable tracking remain in an
  explicit `Pre-tracking / unknown` bucket and are not retroactively inferred.
- Daily Journey events:
  - `daily_journey_view`
  - `daily_journey_primary_tap`
  - `daily_journey_step_start`
  - `daily_journey_story_choice`
  - `daily_journey_complete`
- Durable first-session activation events:
  - `activation_dashboard_view`
  - `activation_primary_tap`
  - `activation_activity_started`
  - `activation_first_mission_completed`
- `/founder` includes a sequential first-session funnel for child profiles
  created from 2026-08-06 onward: profile created, first dashboard shown, first
  activity tapped, activity started, and activity completed. Each profile is
  counted once per step, and historical profiles are excluded from this detailed
  funnel so they cannot distort the new baseline.
- `/founder` includes a seven-step starter-path funnel for profiles created from
  2026-08-06 onward. It reports the number completing each successive starter
  activity and the conversion from the previous step, using aggregate saved
  session counts without identifiers.
- A private Founder Retention Dashboard is available at `/founder` for approved
  founder accounts. It reports aggregate data only and includes:
  - new and active children
  - onboarding and first-mission activation
  - exact Day 1, Day 3, and Day 7 eligible-cohort retention
  - journey stop points
  - notification delivery, open, and learning-return performance
  - a sequential First Mission Return Loop funnel from mission completion through
    reminder opt-in, delivery, open, and resumed learning
  - a founder-confirmed one-time reactivation campaign with a preview count
  - retention by age group and module engagement
  - aggregated Day 3 and Day 7 parent feedback
- The founder API authenticates the current Supabase user on the server, checks
  the approved founder email allowlist, excludes school/classroom profiles, and
  never returns names, email addresses, or raw profile identifiers.
- The one-time reactivation campaign targets only non-school families that
  explicitly enabled email reminders, completed learning, and have been inactive
  for at least three days. It sends at most one email per family, excludes test
  accounts, records successful delivery in cloud progress, and uses a stable
  email idempotency key so retries do not duplicate delivery. Sending requires a
  second confirmation in `/founder`; deployment does not send automatically.
- Compact Day 3 and Day 7 feedback prompts appear in the Parent Zone. Answers
  and dismissals persist and merge with cloud progress.
- Avatar Workshop pilot measurement starts with the 2026-07-30 release:
  - `bloom_coin_earned`
  - `avatar_workshop_opened`
  - `avatar_item_unlocked`
  - `avatar_item_equipped`
- Workshop actions are sent to the existing non-identifying GA event bridge and
  also stored as durable, cloud-mergeable profile telemetry. Stable event IDs
  deduplicate repeat opens and equips.
- First Mission Return Loop measurement events:
  - `first_mission_return_prompt_view`
  - `first_mission_return_parent_unlocked`
  - `first_mission_return_email_enabled`
  - `first_mission_return_push_enabled`
  - `first_mission_return_prompt_dismiss`
- `/founder` includes an aggregate range-aware workshop funnel showing unique
  profiles that earned a coin, opened the workshop, unlocked an item, and
  equipped an item. It never returns profile identifiers or child names.
- `/founder` now separates registered family accounts from child profiles. The
  summary shows registrations today, total saved family accounts, child-profile
  totals, and daily registration bars without returning guardian identifiers.
- Before the 2026-08-04 release, the owner registration email was triggered
  before Supabase signup and guardian-profile persistence. Those messages were
  registration attempts, not reliable evidence of saved accounts. Notifications
  and the single welcome email now run only after signup and the guardian save
  complete successfully.
- The 2026-08-04 Auth diagnostic found that the inbox reports did correspond to
  real Supabase login creation even though the guardian table did not increase:
  one Auth account was created on 2026-08-03 and three on 2026-08-04, while no
  matching recent guardian profiles or child profiles were stored. Treat this
  as a registration-completion defect. `/founder` now reports aggregate Auth
  creation and unlinked-account counts without returning emails or user IDs.
- The registration-completion defect was traced to a concrete database contract
  mismatch: `guardian_profiles.parent_pin` is required, but the client guardian
  upsert omitted `parent_pin` even when called with `includePin: true`. Supabase
  therefore created the Auth account and rejected the guardian row. The
  2026-08-04 production fix now includes and validates the four-digit PIN for
  initial guardian inserts, rejects setup when there is no active Auth session,
  and repairs affected unlinked accounts when the parent signs in with the
  original email/password and a four-digit PIN. Routine profile edits still do
  not overwrite the stored PIN.
- The founder activation funnel is now family-level instead of child-level. Its
  stages are login account created, parent setup saved, child profile created,
  and first mission completed. A family with multiple children is counted once.
- Founder aggregation excludes obvious internal accounts using the same rules as
  the verified Supabase query: `sanju.veed+*`, addresses containing `uat`, and
  addresses ending in `@test.com`. Email addresses are used only server-side for
  classification and are never returned by the founder API.
- The 2026-08-05 database baseline contained 61 Auth users, of which 24 matched
  the explicit test/UAT rules and 37 did not. A separate join across
  `child_profiles`, `child_progress`, and `auth.users` found 14 distinct non-test
  child profiles with at least one saved learning session. This proves 14 child
  profiles used learning; it does not prove 14 distinct families.

## Latest Daily Journey Implementation

Primary files:

- `src/components/BloomAdventureHome.jsx`
- `src/components/DailyJourneyParentSummary.jsx`
- `src/utils/dailyJourney.js`
- `src/components/Dashboard.jsx`
- `src/toddler/ToddlerApp.jsx`
- `src/ks2/KS2App.jsx`
- `src/components/ParentZone.jsx`

Behavioral priority:

1. Immediately offer an earned treasure when both learning stops are complete.
2. Otherwise start or resume today's seven-day story chapter.
3. Continue the next unfinished learning stop.
4. Offer the optional Wonder after required learning and reward.
5. Open additional activities when the core journey is complete.

The treasure priority is intentional: a child who completed both activities
outside the story must not have an earned reward delayed by an unstarted chapter.

## Verification Status

At the latest verified build:

- `242` automated tests pass.
- Production build passes.
- Existing warning: the main JavaScript chunk is over the configured 800 kB
  warning threshold. It does not block production but should be addressed through
  future code splitting.
- Daily Journey browser UAT passes for toddler, early, and junior.
- Daily Journey action phases pass: chapter, learning, treasure, and Wonder.
- Mobile width and primary tap target checks pass at 390 x 844.
- Number World supportive-retry browser UAT passes `24/24` checks on desktop
  and 390 x 844 mobile, covering the amber retry state, no answer reveal,
  850 ms unlock, same-question continuity, second-mistake worked hint, and
  enabled choices after support.
- Home to World browser UAT passes the full first discovery, reward evidence,
  next-lesson unlock, toddler/junior age variants, desktop layout, and mobile
  overflow checks.
- Integrated Wonder dashboard UAT passes.
- Parent Zone entry UAT passes for all three age bands on mobile.
- Avatar Workshop browser UAT passes for toddler, early, and junior dashboards
  at 390 x 844 and 1440 x 1000. It verifies the visible balance, modal opening,
  no horizontal overflow, purchasing, equipping, balance reduction, and the
  three direct workshop interaction events.
- Founder Retention Dashboard desktop and 390 x 844 mobile UAT passes, including
  the family-level activation funnel, test/UAT exclusion disclosure, Avatar
  Workshop funnel, First Mission Return Loop funnel, reactivation confirmation,
  aggregate privacy, and parent feedback persistence.
- First-session browser UAT passes for toddler, early, and junior. It verifies
  one primary activity action, direct `first-mission` navigation, no competing
  Daily Journey action on the first screen, 390 x 844 fit, and a tap target over
  50 px high. The normal post-completion Daily Journey still passes all phases.
- Seven-step starter-path browser UAT passes for toddler, early, and junior. It
  verifies deterministic existing-module selection, direct `starter-path`
  navigation, seven stable progress markers, no competing Daily Journey action,
  and mobile width/tap-target fit at 390 x 844. The founder desktop/mobile UAT
  verifies that the aggregate seven-step funnel renders without exposing raw
  profile data.
- Sound Pop 3D browser UAT passes `15/15` checks at the iPhone 16 Plus width. It
  covers opening instruction speech, pure `/m/ /a/ /p/` requests, replay,
  physical blending, automatic picture speech, no early answer reveal, the
  correct 3D map reveal, Word 2 auto-instruction, mobile overflow, and reduced
  motion.
- The toddler counting, Number World join/split, and Grammar Grove word-block
  scenes were interaction-checked and visually inspected at phone and desktop
  widths. The focused harness is `tests/three-dimensional-learning-uat.mjs`;
  its screenshots are `tests/uat_3d_*_mobile.png` and
  `tests/uat_3d_*_desktop.png`. The full automated suite passes `242/242` tests.
- Deployment `https://e23daa7f.bloom-juniors.pages.dev/` contains those three
  content-specific depth models. The preview and custom domain serve the same
  `assets/index-CrXgzRH7.js` bytes and SHA-256 hash; the toddler, Number World,
  junior, and founder chunks return HTTP 200, and unauthenticated founder API
  access remains HTTP 401.
- Universal game-feel UAT passes `27/27` checks across toddler, early, and junior
  at 390 x 844, covering honest scores, tangible rewards, no background speech,
  mobile fit, replay, and continuation.
- Cross-module animation regression UAT passes `38/38` checks on desktop and
  mobile across Sound Pop, Shape World, Story Room, World Explorer, My Body,
  and Planet World. The suite accounts for duplicate accessible body-part labels
  such as left and right hands without weakening the interaction check.
- Founder Retention Dashboard desktop/mobile UAT passes with the Acquisition
  Quality source funnel, landing-page and timezone summaries, aggregate-only
  privacy assertion, and no horizontal overflow at 390 x 844.
- The Sound Pop map and universal treasure chest are transparent optimized WebP
  assets of approximately 123 KB and 133 KB respectively.
- Deployment `https://fdb5a1e2.bloom-juniors.pages.dev/` contains the verified
  Sound Pop 3D `map` pilot and universal completion celebration. The custom
  domain serves byte-for-byte matches of `assets/index-BOlFqjVA.js`,
  `assets/SoundPop-CJOBQv82.js`, and
  `assets/FounderDashboard-Bx4Ab04w.js`; both new WebP assets return HTTP 200
  with the expected sizes, and the unauthenticated founder API returns `401`.
- Deployment `https://dc50a01e.bloom-juniors.pages.dev/` contains durable
  first-touch acquisition tracking and the private Acquisition Quality report.
  The custom domain serves byte-identical `assets/index-B-DM4O8m.js` and
  `assets/FounderDashboard-hcGF7MKb.js`; unauthenticated founder API access
  returns `401`.
- Living Treasure Room browser UAT passes `40/40` checks across toddler, early,
  and junior at 390 x 844. It covers overlay suppression, safe mobile width,
  all five filters fitting, Safari-safe dolly artwork, room placement and drag
  persistence, treasure reactions, and secret-game completion persistence.
- Deployment `https://967f983e.bloom-juniors.pages.dev/` contains the verified
  iPhone Treasure Room presentation fix. The preview and custom domain serve
  byte-for-byte matches of `assets/index-DBcLje6i.js` and
  `assets/FounderDashboard-CxX9hSQp.js`; the unauthenticated founder API returns
  `401`.
- Deployment `https://1984a348.bloom-juniors.pages.dev/` contains the verified
  seven-completion starter path and founder drop-off funnel. The preview and
  custom domain serve byte-for-byte matches of `assets/index-BUzLq5G1.js` and
  `assets/FounderDashboard-BPoOkPGI.js`; the unauthenticated founder API returns
  `401`.
- Deployment `https://f03e1cb1.bloom-juniors.pages.dev/` contains the focused
  first-session path and date-bounded founder activation funnel. The custom
  domain serves byte-for-byte matches of the verified local main and founder
  bundles: `assets/index-kb3a2wtd.js` and
  `assets/FounderDashboard-ClSN5j6m.js`.
- The production founder dashboard chunk matches the locally built artifact, and
  the unauthenticated production API boundary returns `401`.
- Real early-years completed-path check confirms the main CTA is
  `Open today's treasure`.
- The Cloudflare preview and custom domain serve the same production bundle.
- Registration persistence regression coverage verifies that initial guardian
  rows contain the required parent PIN, reject an invalid PIN, and leave the PIN
  untouched during routine guardian updates. Both the Cloudflare preview and
  custom domain were checked for the deployed registration-recovery code.
- First Mission Return browser UAT passes on 390 x 844 mobile and 1440 x 1000
  desktop. It covers no pre-mission interruption, the family PIN gate, wrong-PIN
  handling, localized reminder time, email opt-in persistence, classroom
  exclusion, age-specific completion previews, and horizontal overflow.
- The Cloudflare preview and custom domain both serve
  `assets/index-Cr9R1Jjm.js` and `assets/FounderDashboard-GcUgmb1t.js` with the
  First Mission Return Loop funnel and one-time reactivation control. The
  production reactivation API rejects unauthorized requests with `401`.

Relevant UAT files and screenshots:

- `tests/adventure-home-uat.mjs`
- `tests/wonder-dashboard-uat.mjs`
- `tests/parent-zone-entry-uat.mjs`
- `tests/founder-retention-uat.mjs`
- `tests/avatar-workshop-uat.mjs`
- `tests/number-world-animation-uat.mjs`
- `tests/uat_number_world_retry_mobile.png`
- `tests/uat_number_world_hint_mobile.png`
- `test-results/avatar-workshop/early-mobile.png`
- `test-results/avatar-workshop/toddler-mobile.png`
- `test-results/avatar-workshop/junior-mobile.png`
- `tests/daily-journey-desktop.png`
- `tests/daily-journey-mobile.png`
- `tests/founder-retention-desktop.png`
- `tests/founder-retention-mobile.png`
- `tests/first-mission-return-mobile.png`
- `tests/first-mission-return-desktop.png`
- `tests/first-mission-complete-mobile.png`
- `tests/science-investigation-map-mobile.png`
- `tests/science-investigation-journal-mobile.png`
- `tests/science-investigation-map-desktop.png`
- `tests/home-to-world-uat.mjs`
- `tests/home-to-world-map-mobile.png`
- `tests/home-to-world-discovery-mobile.png`
- `tests/home-to-world-map-desktop.png`

Common verification commands:

```powershell
npm test
npm run build
npm run dev -- --host 127.0.0.1 --port 5173
$env:BASE_URL='http://127.0.0.1:5173'; node tests\adventure-home-uat.mjs
$env:UAT_BASE_URL='http://127.0.0.1:5173'; node tests\wonder-dashboard-uat.mjs
$env:UAT_BASE_URL='http://127.0.0.1:5173'; node tests\parent-zone-entry-uat.mjs
$env:UAT_BASE_URL='http://127.0.0.1:5173'; node tests\founder-retention-uat.mjs
$env:UAT_BASE_URL='http://127.0.0.1:5173'; node tests\retention-setup-uat.mjs
$env:UAT_BASE_URL='http://127.0.0.1:5173'; node tests\home-to-world-uat.mjs
node tests\number-world-animation-uat.mjs
```

If port 5173 is already occupied, use the port printed by Vite and update the
environment variable.

## Next Build

Run the real seven-day retention pilot. Do not add another major child feature
until the dashboard has enough real family data to identify the highest-volume
exit point.

The First Mission Return Loop went live on 2026-08-05. Treat earlier reminder
and retention behavior as a separate baseline. Review prompt views, parent
unlocks, email/push opt-ins, reminder opens, reminder-attributed learning
returns, and Day 1 return for newly activated real families. The first useful
72-hour checkpoint is 2026-08-08; the first complete Day 7 checkpoint is
2026-08-12.

Use `/founder` with an approved founder account to review the pilot. Historic
learning sessions can populate cohort and module metrics. Fine-grained journey
telemetry and Day 3/Day 7 feedback are already accumulating. Avatar Workshop
funnel telemetry begins with the 2026-07-30 release, so do not interpret earlier
workshop opens as zero engagement.

## Seven-Day Pilot

Do not add another major child feature before reviewing pilot data.

Pilot checklist:

1. Recruit a small group of real families across the supported age bands.
2. Record the date each child first completes a mission.
3. Observe whether the main dashboard requires adult explanation.
4. Review Day 1, Day 3, and Day 7 return.
5. Collect the short parent feedback prompts.
6. Identify the highest-volume exit point.
7. Improve that specific point before expanding the curriculum again.

Key questions:

- Did the child know what to tap without help?
- Did they understand why they should return tomorrow?
- Did the continuing story or Wonder create curiosity?
- Did the reward feel earned and worth returning for?
- Did the parent understand what the child learned?
- What stopped the family from returning?

## Instagram Growth Experiment

Instagram publishing uses Playwright browser automation against Instagram's web
UI. It does not use the Instagram API. The image/carousel and Reel flows are
separate in `post-instagram.js` and `post-instagram-reel.js`; credentials and the
saved browser session remain in gitignored local files.

On 2026-07-28 the profile had 15 posts, 0 followers, and followed 0 accounts.
This means distribution and account signals are a larger immediate constraint
than post volume alone.

A founder-led 16.4-second Reel was created around the hook "Why does the Sun look
red?" It uses the real founder portrait, real Wonder experiences, narrated audio,
and a parent question:

- video: `marketing/viral-reel/bloom-founder-question-reel.mp4`
- 4:5 cover: `marketing/viral-reel/cover-4x5.png`
- caption and release plan: `marketing/viral-reel/POSTING-NOTES.md`
- repeatable generator: `marketing/create-founder-question-reel.mjs`

The Reel was published successfully on 2026-07-28 through the Playwright Reel
flow. A separate profile check confirmed the profile increased from 15 to 16
posts and the new Reel appeared as the first grid item.

At the 2026-07-29 check, roughly 14 hours after publication, the latest Reel's
public metadata showed 0 likes and 0 comments. The profile also showed 0
followers and 0 following. At that time the account was still personal, so
views, reach, watch time, shares, saves, profile activity, and follows were
unknown rather than zero. This result indicated a distribution problem first:
the account had no initial audience or community activity to seed discovery.

The next content phase will use one parent-facing vertical-video engine across
Instagram Reels, TikTok, and YouTube Shorts rather than three independent
calendars. Produce one clean 9:16 master without platform watermarks, then adapt
the opening text, caption, cover, audio, and call to action per platform. Start
with three strong videos per week and one Instagram carousel, not an unsupported
high-volume target. TikTok content must be addressed to parents because standard
TikTok accounts are for people aged 13 or older. Set each YouTube video's
audience accurately: content actually directed to children must be marked "made
for kids," which restricts comments and other engagement features; founder and
parent-advice content should remain clearly adult-directed.

Two additional cross-platform masters were created on 2026-07-29 using the free
local Sharp/FFmpeg pipeline and Bloom's TTS endpoint; no Google Flow credits were
used:

- `marketing/cross-platform-shorts/reading-starts-before-words.mp4`
- `marketing/cross-platform-shorts/the-screen-time-question.mp4`

Both are 1080x1920 H.264/AAC videos with platform-safe 4:5 covers. The first is
18.4 seconds and the second is 16.1 seconds. Representative hook, middle, and
outro frames were visually checked, the screen-time source was trimmed to remove
an installation modal, and audio peaks at -1.5 dB. Captions, YouTube titles, and
publishing rules are in `marketing/cross-platform-shorts/POSTING-NOTES.md`. The
repeatable generator is `marketing/create-parent-short-series.mjs`. Together
with the existing Sun question Reel, these form the initial three-video launch
set for Instagram, TikTok, and YouTube Shorts.

Windows Media Player classified the MP4 masters as audio-only on the local
machine even though their H.264 video streams decode correctly. Windows-native
`*-windows-preview.wmv` viewing copies were therefore added and verified with
WMV2 video and stereo WMA audio. These are preview-only; publish the MP4 masters.

The Instagram bio was updated and verified after a fresh reload:

- Free learning for ages 3-9
- Phonics, maths and wonder
- Built by a Dubai dad. No ads.
- Try it free

Meta Verified shows `Verification pending`; payment for the free month was
accepted and Meta says review can take up to 48 hours. Do not change the display
name while this identity review is pending. The reusable bio updater is
`marketing/update-instagram-profile.mjs`.

The account was converted to a professional account after the 2026-07-29
personal-account check. On 2026-07-31 all 20 posts and Reels exposed a
`View insights` action, confirming that professional Insights are active. Meta
documents views, total and average watch time, accounts reached, follows, likes,
comments, saves, and shares for Reels. Do not describe `viewed versus swiped
away` as a standard Instagram metric; that wording belongs to YouTube Shorts.
The browser collector now waits for Instagram's separate Insights route and
parses its current desktop layout. The 2026-07-31 baseline across 20 posts was:

- 310 views
- 263 accounts reached
- 2 interactions: 1 like and 1 save
- 0 comments, shares, follows, or profile activity

The leading Reel was the concrete adaptive-maths demonstration with 183 views
and 158 accounts reached. The Yaagvi mascot Reel was second with 69 views and
61 reached. The direct useful-screen-time comparison was third with 29 views
and 16 reached. The newer abstract founder/learning hooks received little or no
distribution. Instagram's desktop Insights route did not expose total or average
watch time in this collection; check those figures in the mobile app.

The next three-video test should therefore use:

1. Adaptive maths proof: a child struggles twice and the activity responds
   without displaying a harsh wrong state.
2. Yaagvi and Avatar Workshop: a child earns a coin, chooses an item, and sees
   the mascot remember it.
3. Ten useful minutes: a concrete Sound Pop sequence ending with the parent
   learning summary.

Publish no more than one test per day. Posting volume is not the primary
constraint: the account still has no follows or profile activity. Seed each Reel
with real parent testers and useful participation in relevant parent communities,
then compare reach, saves, shares, profile activity, and follows after 24 and
72 hours.

The first evidence-led follow-up was produced and published on 2026-07-31:

- public Reel: `https://www.instagram.com/bloom_juniors/reel/Dbcv5uEsfxe/`
- publishing master:
  `marketing/adaptive-maths-short/good-try-maths-reel.mp4`
- cover: `marketing/adaptive-maths-short/good-try-maths-cover-4x5.png`
- platform copy: `marketing/adaptive-maths-short/POSTING-NOTES.md`
- repeatable recorder: `marketing/record-adaptive-maths-proof.mjs`
- repeatable renderer: `marketing/create-adaptive-maths-short.mjs`

This Reel records the real Number World behavior: after a wrong answer, Yaagvi
says "Good try. Let's look once more," the same problem remains available, and
the child can solve it on the retry. A product follow-up shipped on 2026-07-31:
the incorrect choice now uses an amber `Try again` state, unlocks after 850 ms,
and opens a worked hint after two mistakes. The app does not automatically lower
difficulty after a single mistake. The 17.4-second master is
1080x1920 H.264/AAC; representative frames and audio levels were checked before
publication. The profile audit independently confirmed it as post 21.

Because there is no existing personal distribution network or Facebook account,
the current audience-building plan uses Reddit and public UAE nursery/school
Instagram communities. The researched threads, transparent replies, verified
community links, comment templates, and seven-day routine are in
`marketing/06-zero-network-outreach.md`. The rule is to contribute useful answers
before mentioning Bloom and to disclose the founder relationship whenever Bloom
is relevant.

The Reddit account `u/SanjuBuildsForKids` has been created. A reusable browser
commenter now exists at `marketing/post-reddit-comment.mjs`, with its local
`reddit-session.json` excluded from source control. Google rejected automated
sign-in, so the first reply was submitted manually on 2026-07-29 in the r/UAE
"App recommendations for kids" discussion. AutoModerator then removed it because
the account was less than three days old. Do not repost it before the age
restriction expires; use the waiting period to complete the profile, join
relevant communities, and read their rules. Future replies must remain useful
and non-promotional before Bloom is mentioned.

Before publishing, confirm recommendation eligibility in Instagram Account
Status. Test the Reel with non-followers, distribute it through Sanju's personal
parent network, and measure watch time, shares, saves, profile visits, and follows
after 24 and 72 hours. Do not judge the experiment by likes alone.

On 2026-07-30 a fourth, stronger cross-platform experiment was created around
the hook "One correct tap can hide zero understanding." It shows the real
sunset investigation and gives parents a specific Predict, Watch, Explain test:

- master: `marketing/tap-test-short/one-correct-tap.mp4`
- cover: `marketing/tap-test-short/tap-test-cover-4x5.png`
- captions and measurement sheet:
  `marketing/tap-test-short/POSTING-NOTES.md`
- repeatable generator: `marketing/create-tap-test-short.mjs`

The 17.5-second master is 1080x1920 H.264/AAC. Representative frames across the
hook, lesson steps, evidence screen, result, and final question were visually
checked. Audio averages -16.9 dB and peaks at -1.5 dB. A WMV review copy is
included for the local Windows installation that does not display the MP4 video
codec.

The Reel was published to Instagram and independently confirmed as profile post
17 at `https://www.instagram.com/bloom_juniors/reel/DbaH1vfw7_V/`. Capture its
professional Insights after 24 and 72 hours: views, total and average watch time,
accounts reached, follows, likes, comments, saves, and shares. Public likes and
comments alone are not enough to evaluate the creative.

No authenticated YouTube or TikTok browser session exists in the workspace, and
no `youtube.txt` file was found. The same watermark-free MP4 and platform copy
are ready, but do not claim those uploads are live until each account is signed
in and the public post URL is independently checked. Do not store social account
passwords in the repository.

On 2026-07-30 the stale purple browser/PWA icon was replaced by the current
five-petal Bloom mark. The page, blog generator, Vite PWA manifest, browser icon,
Apple touch icon, and maskable icons now reference the versioned `bloom-v3`
asset family. Production deployment `https://8277cc8d.bloom-juniors.pages.dev`
was verified through the custom domain: `/founder` returns the new icon links and
`/favicon-bloom-v3.svg?v=20260730` returns the flower asset with HTTP 200. Build
passed and all 215 tests passed. Browser favicon caches are persistent, so an
already-open tab may need to be closed and reopened once.

A founder-led cross-platform experiment was also created and published on
2026-07-30 around the hook "My own daughter stopped opening the learning app I
built." The 17.6-second clean master is 1080x1920 H.264/AAC with a Windows WMV
preview and 4:5 cover:

- master: `marketing/cross-platform-shorts/my-daughter-stopped-coming-back.mp4`
- preview: `marketing/cross-platform-shorts/my-daughter-stopped-coming-back-windows-preview.wmv`
- cover: `marketing/cross-platform-shorts/my-daughter-stopped-coming-back-cover-4x5.png`
- platform copy: `marketing/cross-platform-shorts/POSTING-NOTES.md`

The Reel was independently confirmed as profile post 18 at
`https://www.instagram.com/bloom_juniors/reel/DbaJB1mhPtA/`. The pre-publish
baseline was 17 posts with zero visible interactions on the newest public Reels.
Record the new Reel after 24 and 72 hours; do not publish another near-identical
founder Reel before those checkpoints. YouTube and TikTok remain unposted because
no authenticated session or upload setup exists in the workspace.

The first founder-retention Reel was rejected on visual quality immediately
after publication. Its static navy panels obscured the product, repeated shots
for too long, used small app footage, and delivered only about 1.2 Mbps video.
Do not reuse that template. A substantially rebuilt preview now exists at
`marketing/founder-retention-v2/my-daughter-stopped-coming-back-v2.mp4`, with a
Windows viewing copy beside it. V2 is 1080x1920, 16 seconds, approximately
4.4 Mbps, and uses seven full-bleed beats with dynamically sized captions.
Representative frames were visually checked for clipping and overlap.

V2 is **not published**. Its founder and child lifestyle scenes are AI-assisted
editorial recreations and its voice is synthetic. The preferred final replaces
the founder opening and narration with Sanju's real vertical phone recording.
See `marketing/founder-retention-v2/POSTING-NOTES.md`. The already-published V1
Reel remains live until Sanju explicitly authorizes deletion.

On 2026-07-30 the stronger Claude Design source
`Video/Bloom Juniors Reel (1).mp4` was prepared and published. The repeatable
finishing script is `marketing/prepare-claude-reel.mjs`; it upscales the clean
720x1280 silent source to 1080x1920 with Lanczos scaling, adds timed British
synthetic narration, normalizes speech, and exports:

- Instagram master: `Video/Bloom Juniors Reel (1)-Instagram.mp4`
- Windows preview: `Video/Bloom Juniors Reel (1)-Instagram-preview.wmv`

The 17-second master is 1080x1920, 30 fps H.264/AAC, yuv420p, with mean audio
at -17.2 dB and a -1.5 dB peak. Representative frames and the final CTA were
visually checked. Instagram confirmed the share, and a separate public-profile
check found 19 posts with the new Reel first in the grid:
`https://www.instagram.com/bloom_juniors/reel/DbafyIlhCw5/`.

The `bloom_juniors` Instagram account is now verified, as confirmed by Sanju on
2026-07-30. Treat verification as a trust and identity signal, not as evidence
that Instagram will automatically increase distribution.

Treat this as the new visual-quality floor for short-form marketing. Record its
24-hour and 72-hour results before drawing conclusions, and use the same concise
problem, contrast, product proof, parent proof, CTA structure in future Claude
Design prompts. YouTube Shorts and TikTok remain unposted until authenticated
upload sessions exist and each public URL can be independently verified.

An attempt to reshare this Reel as an Instagram Story with the poll "Useful
screen time?" was safely stopped before publication. Instagram's authenticated
mobile web interface exposed external sharing destinations but did not expose
Add to Story or interactive sticker controls. The guarded diagnostic is
`marketing/share-instagram-story-poll.mjs`. A second attempt through the
mobile-web Story creator returned only "Use the app"; this Windows machine has
no Instagram app, ADB device, or Android emulator available. The poll must be
added in the native Instagram mobile app; do not claim the Story is live until
it is visible from the profile. Sanju manually published the Story poll from
the Instagram app on 2026-07-30 with the question "Useful screen time?" and
options "Yes" and "Show me more."
## Nursery Outreach - 2026-08-11

The nursery campaign was corrected and narrowed to a three-contact validation test
before wider outreach. Start with Yellow Kite, Rainbow Valley and Alphabet Street,
send individually from `Sanju | Bloom Juniors <sanju@bloomjuniors.com>`, and record
reply, objection, meeting and outcome in `marketing/04-nursery-pipeline.md`.

The reviewed offer is a supported 30-day pilot, not temporary free access. Bloom
provides the parent invitation, setup support, an anonymised aggregate engagement
summary and a 15-minute results review. Families retain free access afterwards.

Do not claim Bloom stores no child data, uses no tracking of any kind, is KHDA
approved or provides official inspection evidence. Accurate wording: children do
not need email accounts; there are no advertisements, in-app purchases, data sales
or advertising trackers; child profiles and learning progress are stored securely.

Canonical assets:

- `marketing/nursery-emails-batch1.md`
- `marketing/05-nursery-outreach-kit.md`
- `marketing/nursery-pitch-video-script.md`
- `marketing/pilot-offer.html`
- `marketing/pilot-offer.pdf`

The PDF was regenerated from the HTML, visually checked and verified as one A4 page.

## Known Follow-Ups

- Measure whether the four content-specific depth models improve completion and
  return before expanding further. Do not apply identical cartoon treatment
  across all age bands; future models must explain a learning concept through
  child-controlled cause and effect.
- Reduce the main production bundle through additional route/component splitting.
- Review real analytics before changing streaks, rewards, or notification timing.
- Keep old standalone journey widgets only where they still support an explicit
  secondary view; do not allow them to compete with the main next action.
- Re-run iPhone Safari UAT for speech and notification behavior when those flows
  change because browser automation cannot fully validate physical-device audio
  or operating-system notifications.
