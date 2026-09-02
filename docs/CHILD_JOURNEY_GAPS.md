# Bloom Juniors — Child Journey Gaps

Investigation only. This document collects dead ends, confusing transitions, weak emotional
payoffs, missing acknowledgement, and inconsistent flows found while tracing the full child
journey (Adventure Home → module entry → arrival → activity → clue/Yaagvi support → completion
→ reward → save → friendship/companion impact → treasure/Dream Project impact → return →
recommended next activity) across all 36 modules and the shared systems layer.

Each item states what the child actually experiences, not just what the code does wrong.

---

## 1. The forced-navigation family of bugs (the single biggest journey gap)

**What the child experiences:** they finish a module, a celebratory "you did it!" screen
appears with buttons to tap (Continue / Replay / Home) — and then, roughly 1.5 seconds later,
regardless of whether they've touched anything, the screen changes to the Dashboard anyway.

**Why:** `handleAddStars` in `src/App.jsx:617` unconditionally schedules
`defer(() => setScreen('home'), 1500)` whenever a module's completion call doesn't explicitly
set `sessionData.stayOnModule = true`. Since `AdventureModuleFrame.jsx:56-63,184` renders an
*interactive* `GameCompleteReveal` modal on the same event, the child is shown buttons that get
yanked away from them before most children would have time to read and choose one.

**Where this shows up (Little Stars band):** Sound Pop, Number World, Star Catch, Shape World,
My Body, World Explorer confirmed affected. Two variants make it worse:
- **Wonder Lab (Science)** — this bug doesn't just cut short a completion screen, it **actively
  ejects the child from an open-ended, explore-style module mid-browse**, every 5th card they
  flip. A child innocently learning "why the sky is blue" gets yanked back to the Dashboard
  while still curious and reading — the opposite of what an explore module should reward.
  **This is the single most damaging journey gap found in the entire audit.**
  Files: `src/modules/CuriousScience.jsx:182,192`, `src/App.jsx:617`.
- **Planet World** — the bug is *scoring-dependent*: children who score below 50% are left on a
  calm, self-paced results screen; children who score 50%+ are the ones who get forcibly
  ejected mid-celebration. A child literally gets a worse experience for doing better.
  Files: `src/modules/PlanetWorld.jsx:451-459`.

**Where this shows up (Tiny Stars band, different shape):** the toddler engine doesn't have this
exact bug (its `GameCompleteReveal` is the only completion screen shown), but `quizshow`
independently has its own complete phase that stacks with the same `GameCompleteReveal` — see
item 2 below. **Super Kids** modules generally rely on the shared modal alone without a
competing local completion screen, so this specific double-screen pattern is less severe there,
though the underlying forced-navigation mechanism is present across all three bands.

**Child impact:** confusing (two screens, one vanishing before it can be used), and in the
Wonder Lab case, actively punishing for exactly the behaviour the module is designed to reward.

---

## 2. Double completion screens with contradictory numbers

**What the child experiences (Bloom Quiz Show, all 3 bands):** finishes the quiz, sees the
quiz's own prize screen with an honest score ("3 of 5 spotlight questions solved") and its own
star count (up to 5) — taps "Open my prize →" — and immediately sees a **second**, different
"you won" screen (the shared `GameCompleteReveal`) with a **different, capped star count** (max
3) and, for the toddler band specifically, the blanket statement **"All 5 clues found!"** —
directly contradicting the honest score they were just shown one tap earlier.

**Why:** `BloomQuizShow.jsx:91` is the only one of the 8 Tiny Stars modules (and the pattern
likely recurs wherever Quiz Show is embedded in the other two bands, e.g. Game Arcade, Game
Arena) with its own internal completion phase, in addition to being wrapped in
`AdventureModuleFrame`, which independently listens for the same `bloom:game-complete` event and
layers its own `GameCompleteReveal` on top.

**Child impact:** genuinely confusing — two different "final" numbers for the same session,
shown seconds apart. This is confirmed reproducible, not theoretical.

Files: `src/components/BloomQuizShow.jsx:91`, `src/components/AdventureModuleFrame.jsx:56-63,184`,
`src/components/GameCompleteReveal.jsx:12-17`.

---

## 3. A working button hidden underneath an unrelated "you're done" screen

**What the child experiences (Puzzle Quest):** solves level 1 of 12, expects to move to level 2
via a clearly-visible "Next Level →" button on the module's own success screen — but a second,
higher-priority "adventure complete" overlay appears on top of it first, whose only actions are
"go home" or "replay this level." The next-level button is still there, just invisible
underneath.

**Why:** each single-level solve independently fires the full completion pipeline
(`src/modules/DirectionalPuzzle.jsx:133-138`), triggering `GameCompleteReveal` (z-[255]) over
the module's own modal (z-50, `:277-289`) which holds the real "Next Level →" button.

**Child impact:** the one module in the entire app explicitly built around sequential level
progression (`progress.logic.maxLevel` persists per level specifically so children can advance)
has that exact progression blocked by a UI layering conflict. A child (or a parent watching)
may reasonably conclude the "Next Level" feature is broken, since nothing points them to
dismiss the overlay first.

---

## 4. Silent redirects with no explanation

**What the child experiences (Coin Shop, Piggy Bank — Little Stars):** taps a familiar-looking
map tile expecting to enter that activity, and instead finds themselves inside a *different*
activity with no message explaining why.

**Why:** `shop` and `piggybank` are excluded from `GATE_FREE_SCREENS` (`src/App.jsx:436`), so
`navigate()` (`:452-458`) can silently redirect to `gate.nextId` (today's required activity)
when tapped out of order — unlike the premium-gate case, which shows a clear, kid-safe
`PremiumLockModal` explaining the lock.

**Child impact:** this fails the "does the child understand where they are and why" test
directly — a 5-6 year old has no way to know their tap was intercepted or why a different game
opened instead.

---

## 5. Reward messages that don't match what actually happened

Several places tell the child something happened that isn't quite true, or don't tell them
something that did:

- **Fun Exercise** shows a full "Exercise Done!" celebration for completing a *single* exercise,
  but grants **zero** stars/progress for it — the reward only exists for a full 8-exercise
  workout (`src/utils/moduleScoring.js:30-31`). The celebration promises something the reward
  system doesn't deliver.
- **Number module (Tiny Stars)** — the instruction literally says "Touch each picture once, then
  choose" (`src/toddler/ToddlerApp.jsx:1218`), describing a tap-to-count interaction that isn't
  implemented; the pictures are decorative, not tappable.
- **Tiny Stars completion copy vs. stars shown** — "All N clues found!" (accurate, post-fix) can
  sit directly beside only 1-2 lit stars when a child needed hints along the way
  (`src/components/GameCompleteReveal.jsx:12-17`) — the words say total success, the stars
  suggest partial success, side by side.
- **Bloom Quiz Show** never says "welcome back" or references a child's prior play count, despite
  already receiving that count as a `played` prop — every visit is scripted as a first meeting.

---

## 6. Naming inconsistency that breaks "where am I"

Covered in full in `STORY_CONTINUITY_AUDIT.md` — 10 of 12 Super Kids locations are named one
thing on the adventure map and a *different* thing on the arrival screen and in-module header
(two are three-way mismatches: Science Lab/Discovery Springs/Wonder Springs and Training Zone/
Training Camp/Movement Meadow). A child who taps "Number Castle" never sees that name again once
inside the activity they just chose.

---

## 7. Unbounded/exploitable rewards (weak "what changed because of my effort")

- **Da Vinci Studio** — the Save-to-Gallery button grants +2 stars on every tap, with no
  cooldown or check that the canvas actually changed (`src/modules/LittleDaVinci.jsx:513-535`).
- **Sacred Stories** — replaying an already-completed story's quiz re-awards fresh stars every
  time, indefinitely, unlike the separate first-completion badge which is correctly gated once
  (`src/modules/SacredStories.jsx:1006-1023`).
- **Coin Shop** — the `earnCoins()` button grants free, uncapped pennies per tap
  (`src/modules/ShopGame.jsx:109-114`), letting a child bypass the actual money-counting lesson.

**Child impact:** these don't break the app, but they weaken the "what I earned reflects what I
did" honesty the rest of the reward system is otherwise careful about (see the robust
duplicate-guard findings in `STORY_CONTINUITY_AUDIT.md` for contrast — most of the economy *is*
well-guarded; these three are the exceptions).

---

## 8. Missing acknowledgement — the companion never marks its biggest moment

**What the child experiences:** friendship with their companion visibly grows (a progress bar
fills over time) but crossing into a new bond stage (e.g. "Trail Buddy" → "Magic Partner") — a
real, named, 5-stage milestone — produces no distinguishable celebration anywhere in the app.
The child would need to notice the bar crossing a threshold themselves; nothing tells them it
happened.

Files: `src/utils/companionBond.js` (`COMPANION_BOND_STAGES`), no corresponding celebration
component found anywhere in the codebase.

**Child impact:** the single biggest "what changed because of my effort" moment the friendship
system offers is currently silent.

---

## 9. The same character, three different faces

A child moving between Adventure Home, the Treasure Room, Wonder World, Bloom Quiz Show, and a
parent's High Five encounters Yaagvi rendered via three unrelated systems (a built pose-sprite
component used in only 3 files; a static image+video pair used in 6+ places; and an apparently
orphaned, entirely separate 5-character system that isn't wired in anywhere). None of this is
narratively explained. Full detail in `STORY_CONTINUITY_AUDIT.md` and
`FULL_ANIMATION_AUDIT.md` Part 4.

---

## 10. Tonal whiplash inside a single age band

**Tiny Stars' Big Quiz** renders a dark, high-drama "TV game show at night" stage — sharply
different from the bright, warm pastel world every other Tiny Stars module lives in — with no
story reason given for the shift. **Piggy Bank (Little Stars, early band)** defaults to a dark
cosmic gradient background with no theme passed from its parent, breaking visual continuity with
every sibling module inside the same warm adventure map. Both are the same category of issue:
a child's world changes "mood" for no in-story reason at exactly the moments (finale, money
lesson) that should feel most connected to everything else.

---

## Items explicitly needing live/device confirmation, not assumed from code alone

- Exact on-screen timing/overlap of the stacked completion screens described in items 1-3 (does
  the underlying screen flash visibly before the overlay paints, or is the transition seamless
  enough that only the forced navigation itself is noticeable?).
- Real-device frame-rate impact of Wonder World's concurrent infinite-loop animation count.
- Real-device jank severity of Da Vinci Studio's unchunked flood fill on a large canvas region.
- Whether children across the 3-9 age range actually perceive Bloom Quiz Show's correct-vs-wrong
  feedback asymmetry as a problem, or whether it reads as appropriately gentle.
