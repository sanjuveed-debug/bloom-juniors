# Bloom Juniors — Prioritised Experience Plan

Investigation only. Nothing in this document has been implemented. This synthesizes
`FULL_ANIMATION_AUDIT.md`, `MODULE_WIRING_MATRIX.md`, `STORY_CONTINUITY_AUDIT.md`, and
`CHILD_JOURNEY_GAPS.md` into grouped, actionable recommendations, each scoped for a future
go/no-go decision rather than bundled into one large change.

---

## Group 1 — Critical wiring or progress bugs

### 1.1 Shared forced-navigation cuts short every completion screen it touches, and actively ejects children from explore-style modules

- **Affected:** Little Stars — Sound Pop, Number World, Star Catch, Shape World, My Body,
  World Explorer, Planet World (all cut short); **Wonder Lab is the severe case** (mid-browse
  ejection, not just a cut-short celebration).
- **Files:** `src/App.jsx:617` (the unconditional `defer(() => setScreen('home'), 1500)`),
  `src/components/AdventureModuleFrame.jsx:56-63,184`, `src/modules/CuriousScience.jsx:182,192`,
  `src/modules/PlanetWorld.jsx:451-459`.
- **Child impact:** confusing double-screens app-wide; for Wonder Lab, active punishment of the
  exact curious/exploratory behaviour the module is meant to reward; for Planet World, a
  scoring-inverted experience where doing better produces a worse outcome.
- **Proposed fix:** set `sessionData.stayOnModule: true` on Wonder Lab's incremental-reward
  calls (so mid-session milestones don't trigger a full exit) and on Planet World's
  score-gated call (so the forced-nav no longer only fires for the higher-scoring case);
  more broadly, consider whether the 1.5s forced-navigation default in `handleAddStars` should
  exist at all versus letting `GameCompleteReveal`'s own Continue/Home buttons drive navigation,
  which is what they're built for.
- **Implementation risk:** Low for the two flagged `stayOnModule` fixes (parameter-only
  change). Medium if removing the blanket forced-navigation default, since other modules may
  currently rely on it as their only path home — would need a pass confirming every affected
  module's own UI provides a way home before removing the safety net entirely.
- **Changes:** logic (event-flag values) primarily; presentation only incidentally (nothing
  visual needs to change, the existing modal already has the right buttons).
- **Reuse:** yes — the fix reuses the `stayOnModule` flag the codebase already defines and Da
  Vinci Studio/Game Arcade already use correctly as a working example.

### 1.2 Puzzle Quest's per-level completion overlay hides the actual "Next Level" button

- **Affected:** Little Stars — Puzzle Quest only.
- **Files:** `src/modules/DirectionalPuzzle.jsx:133-138,277-289`,
  `src/components/AdventureModuleFrame.jsx:56-63,184`.
- **Child impact:** the one module explicitly built around sequential level progression has
  that progression blocked by a z-index/layering conflict — a child cannot reach level 2
  without first dismissing an unrelated "adventure complete" screen whose buttons don't mention
  levels at all.
- **Proposed fix:** set `stayOnModule: true` on the per-level `onAddStars` call so the shared
  overlay doesn't fire on every level, reserving `GameCompleteReveal` for the actual end of a
  full puzzle session (or last level).
- **Implementation risk:** Low — same flag-based fix as 1.1, scoped to one module.
- **Changes:** logic only.
- **Reuse:** yes, same mechanism as 1.1.

### 1.3 Bloom Quiz Show's double completion screen with contradictory scores (Tiny Stars, and likely wherever else Quiz Show is embedded)

- **Affected:** Tiny Stars `quizshow`; verify whether Game Arcade's (Little Stars) and Game
  Arena's (Super Kids) embeddings of `BloomQuizShow` have the same double-screen exposure —
  not confirmed one way or the other by this pass since those two agents were told to treat
  Quiz Show integration as out-of-scope-for-deep-critique, only wiring-in was checked.
- **Files:** `src/components/BloomQuizShow.jsx:91`, `src/components/AdventureModuleFrame.jsx:56-63,184`,
  `src/components/GameCompleteReveal.jsx:12-17`.
- **Child impact:** two different "you won" screens, two different star counts, one directly
  contradicting the other, seconds apart — the most concrete, reproducible bug found in this
  audit.
- **Proposed fix:** either (a) have `BloomQuizShow`'s "Open my prize →" action navigate straight
  to the map/home instead of calling `onComplete` and leaving `AdventureModuleFrame`'s listener
  to independently render a second modal, or (b) suppress `GameCompleteReveal` specifically when
  the completing module is `quizshow` (it already has its own finisher).
- **Implementation risk:** Low-Medium — option (a) is a small change inside one component;
  confirm it doesn't also need to still dispatch `bloom:game-complete` for other listeners
  (companion/treasure XP) that may depend on that event firing regardless of whether the visual
  modal appears.
- **Changes:** logic (which handler fires) and presentation (one fewer modal shown).
- **Reuse:** none needed — this is a targeted fix to one specific double-firing pattern.

---

## Group 2 — Incorrect completion or reward flows

### 2.1 Unbounded/exploitable rewards

- **Affected:** Little Stars — Da Vinci Studio (unlimited +2-star save-spam), Sacred Stories
  (unlimited quiz-replay stars), Coin Shop (unlimited free coins).
- **Files:** `src/modules/LittleDaVinci.jsx:513-535`, `src/modules/SacredStories.jsx:1006-1023`,
  `src/modules/ShopGame.jsx:109-114`.
- **Child impact:** low direct harm to the child, but weakens "what I earned reflects what I
  did," and undermines Coin Shop's own money-counting lesson specifically.
- **Proposed fix:** add a cooldown/dedupe to Da Vinci's save button (e.g. only award if canvas
  changed since last save, or cap awards per session); gate Sacred Stories' replay reward behind
  the existing `isFirstTime` flag the badge logic already uses; cap or cost-gate `earnCoins()`.
- **Implementation risk:** Low for all three — each is a local guard addition, not a structural
  change.
- **Changes:** logic only.
- **Reuse:** Sacred Stories can reuse its own existing `isFirstTime` computation.

### 2.2 Fun Exercise under-rewards the likely-common case (single-exercise sessions)

- **Affected:** Little Stars — Fun Exercise.
- **Files:** `src/modules/FunExercise.jsx:286`, `src/utils/moduleScoring.js:25-43`.
- **Child impact:** a full "Exercise Done!" celebration is shown for single-exercise sessions
  with zero actual reward behind it — the celebration over-promises.
- **Proposed fix:** grant a small reward (e.g. 1 star) for single-exercise completions, and
  require the final exercise to actually be completed (not skipped) before granting the full-
  workout bonus.
- **Implementation risk:** Low — a product decision on reward sizing more than a code risk.
- **Changes:** logic (reward calculation) — no presentation change needed, the celebration
  screen already exists and is appropriate, it just needs a reward to match it.
- **Reuse:** n/a.

### 2.3 Game Arena's finish/lock/result screens show placeholder text instead of iconography

- **Affected:** Super Kids — Game Arena.
- **Files:** `src/ks2/modules/GamesModule.jsx:23,842,886`.
- **Child impact:** the most visually prominent element on the most frequently-visited
  completion/lock screens in the module reads as an unfinished placeholder ("WIN"/"LOCK"/"GAME"
  as plain text) against every other completion surface in the app, which uses emoji/trophy
  iconography at that scale.
- **Proposed fix:** replace the three literal-text elements with emoji/icon treatments
  consistent with `GameCompleteReveal` and the rest of the app's completion language.
- **Implementation risk:** Very low — presentation-only, three isolated lines.
- **Changes:** presentation only.
- **Reuse:** yes — copy the existing emoji-scale pattern already used elsewhere in the same file
  and in `GameCompleteReveal.jsx`.

### 2.4 Game Arena mini-game scoring doesn't affect reward tier (Design Q)

- **Affected:** Super Kids — Game Arena's five original mini-games (not the embedded quiz,
  which is correctly scored).
- **Files:** `src/ks2/modules/GamesModule.jsx:854-860`, `src/ks2/KS2App.jsx:678-679,783`.
- **Child impact:** a child who performs poorly (multiple maze deaths, tower misses) receives an
  identical reward to one who performs perfectly, since `correct` is clamped to a guaranteed
  `1/1`.
- **Proposed fix:** this is flagged as a **product decision**, not an assumed bug — if mini-games
  are intentionally meant as unconditional "downtime" reward for completing study time, current
  behavior may be correct as-is. If they're meant to reward skill, thread each mini-game's real
  score through instead of defaulting `total=1`.
- **Implementation risk:** Low if a real score is threaded through (the mini-games already
  compute one internally); the risk is purely in deciding whether this is desired.
- **Changes:** logic only, contingent on the product decision.
- **Reuse:** n/a.

### 2.5 Planet World's scoring-inverted forced navigation

Covered under 1.1 above — listed here as well since it is also, distinctly, a reward-flow
correctness issue (the reward-trigger condition itself, not just the shared navigation bug it
exposes).

---

## Group 3 — Major story-continuity gaps

### 3.1 Super Kids location naming — 10 of 12 locations disagree across map/arrival/header

- **Affected:** Super Kids — all locations except Grammar Grove (name matches, emoji doesn't;
  still imperfect but closest).
- **Files:** `src/ks2/KS2App.jsx:166-182` (`MAP_LOCATIONS`), `src/components/ModuleArrival.jsx`
  (`JUNIOR_DESTINATIONS`), `src/components/AdventureModuleFrame.jsx` (`META` table).
- **Child impact:** the child taps one name and plays inside a screen with a different name for
  the entire session — a direct break in "does the child understand where they are," independent
  of any animation-quality question. Full table in `STORY_CONTINUITY_AUDIT.md`.
- **Proposed fix:** make `ModuleArrival` and `AdventureModuleFrame`'s `META` table consume
  `MAP_LOCATIONS`' names directly for the junior band (or add one junior-specific name-override
  object used by all three surfaces), rather than maintaining three independently-authored name
  tables.
- **Implementation risk:** Low-Medium — mechanical once a single source of truth is chosen;
  the risk is in confirming no other code path (e.g. saved progress records, analytics) depends
  on the currently-mismatched arrival/header strings specifically.
- **Changes:** presentation (copy) only — no reward/logic path depends on these display names.
- **Reuse:** yes — `MAP_LOCATIONS` already has the emoji/color the other two tables lack in
  several rows; consolidating is a net simplification, not new work.

### 3.2 Mascot rendering fragmentation across three non-interoperating systems

- **Affected:** all three bands, via every shared screen (Adventure Home, Treasure Room, Wonder
  World, Dream Project, Quiz Show, Parent Story) plus the apparently-orphaned `BuddyCompanion.jsx`.
- **Files:** `src/components/YaagviCharacter.jsx` (the target system, already used correctly in
  `HighFiveDelivery.jsx`, `Dashboard.jsx`, `InteractiveYaagvi.jsx`); static-image usages in
  `src/components/BloomAdventureHome.jsx`, `src/components/TreasureCollection.jsx` (×2),
  `src/components/WonderWorld.jsx`, `src/components/DreamProject.jsx`,
  `src/components/BloomQuizShow.jsx`, `src/components/ParentProgressStory.jsx`;
  `src/components/BuddyCompanion.jsx` (confirmed via grep to be unimported anywhere else).
- **Child impact:** the single biggest concrete tell of "built screen-by-screen, not as one
  world" — the same character visually presents three different ways with no in-story reason.
- **Proposed fix:** standardize every listed shared screen on `YaagviCharacter`'s pose system
  (already built, tested, and reduced-motion-aware); separately confirm whether
  `BuddyCompanion.jsx` should be wired in deliberately (if the multi-character concept is still
  wanted) or removed as dead code.
- **Implementation risk:** Low per screen (the component already exists and has a stable prop
  API, confirmed by this week's successful `HighFiveDelivery.jsx` integration), but touches 6+
  files, so recommend rolling out one screen at a time with its own verification rather than one
  large change.
- **Changes:** presentation only for the swap itself; a small decision (keep/remove) for
  `BuddyCompanion.jsx`.
- **Reuse:** maximal — this recommendation *is* "reuse the existing system everywhere," the
  purest form of the audit's "avoid new libraries/components" constraint.

### 3.3 No companion level-up celebration despite a real 5-stage progression

- **Affected:** all three bands (companion bond is shared infrastructure).
- **Files:** `src/utils/companionBond.js` (`COMPANION_BOND_STAGES`); no existing celebration
  component for this event.
- **Child impact:** the biggest narrative milestone the friendship system offers is currently
  silent — a child has no way to know they've reached a new bond stage except by noticing a bar.
- **Proposed fix:** add a celebration moment when a stage-boundary crossing is detected,
  reusing the existing `TreasureChestReward`-style full-screen modal pattern (anticipation +
  reveal + `YaagviCharacter` celebrate pose) rather than building a new component from scratch.
- **Implementation risk:** Medium — requires detecting the stage-crossing moment reliably (once,
  not on every re-render) wherever `totalStars`/companion points update across three different
  band shells, which is more state-plumbing than the presentation-only fixes above.
- **Changes:** both logic (detecting the crossing event once) and presentation (the new modal).
- **Reuse:** high — the visual pattern already exists (`TreasureChestReward`), and the pose
  component (`YaagviCharacter`) already exists.

### 3.4 Companion identity split — Yaagvi is both fixed host and swappable companion

- **Affected:** all three bands, cross-cutting.
- **Files:** `src/utils/companionBond.js:12-24` (`getActiveCompanion`) vs. hard-coded Yaagvi
  references in `BloomQuizShow.jsx`, `HighFiveDelivery.jsx`, `BloomAdventureHome.jsx`.
- **Child impact:** a subtler gap than 3.2/3.3 — likely only noticed by attentive repeat players
  or a parent, but a real inconsistency in "who is my companion."
- **Proposed fix:** flagged as a **product decision** — either make Quiz Show host/High Five
  courier reflect the currently-equipped companion (larger content/asset implication, since
  those flows are currently written assuming Yaagvi specifically), or explicitly frame Yaagvi as
  a separate, unswappable "guide" character distinct from the swappable "buddy" slot, and adjust
  copy accordingly so the distinction is intentional rather than accidental.
- **Implementation risk:** Low if the fix is copy/framing (make the distinction explicit);
  High if the fix is making Quiz Show/High Five fully companion-aware (would need per-companion
  assets/copy that may not exist yet for non-Yaagvi buddies).
- **Changes:** presentation (if reframing) or both presentation+content (if making other buddies
  fully substitutable).
- **Reuse:** n/a — this is a definition question first.

### 3.5 Tonal breaks within a single age band's world (Tiny Stars Quiz Show, Little Stars Piggy Bank)

- **Affected:** Tiny Stars `quizshow`; Little Stars `Piggy Bank` (early band).
- **Files:** `src/components/BloomQuizShow.jsx:82,93`; `src/modules/PiggyBankGame.jsx:138,169`
  and its call site `src/App.jsx:732-744` (no theme prop passed).
- **Child impact:** the child's world visibly changes "mood" with no story reason at exactly the
  moments (the finale quiz, the money lesson) that should feel most connected to everything
  else.
- **Proposed fix:** add a toddler-specific lighter/warmer palette variant for `BloomQuizShow`
  when `ageGroup==='toddler'`; pass the active avatar theme into `PiggyBankGame` from the early-
  band call site instead of leaving it to default to the dark cosmic gradient.
- **Implementation risk:** Low — both are styling/prop-passing changes, no logic change.
- **Changes:** presentation only.
- **Reuse:** yes — Piggy Bank's fix reuses the same `THEMES[avatar]` mechanism every sibling
  module in the band already uses; Quiz Show's fix can reuse its own existing `ageGroup`-keyed
  `COPY` pattern for a palette variant.

---

## Group 4 — High-value animation improvements

### 4.1 Consolidate the two parallel answer-feedback systems (CSS classes vs. per-module framer-motion)

- **Affected:** the large majority of the 36 modules, to varying degrees.
- **Files:** `src/index.css` (`.game-answer-win`/`.game-answer-try`, already correct and
  accessible); numerous individual module files layering their own framer-motion feedback on
  top.
- **Child impact:** answer-feedback "feel" varies module to module depending on which system a
  given file happens to also use, rather than reading as one designed system.
- **Proposed fix:** as already scoped in `ANIMATION_PLAN.md` Phase 2 — standardize on the
  existing CSS-class system (already performant, already accessible) and remove the duplicate
  framer-motion feedback where found. This is a simplification, not new animation work.
- **Implementation risk:** Medium — mechanical once identified per file, but real surface area
  across many modules; recommend scoping to highest-traffic modules first, as already proposed.
- **Changes:** presentation only (net code reduction).
- **Reuse:** maximal — the target system already exists and is already correct.

### 4.2 Wire `useReducedMotion()` app-wide via a single `<MotionConfig>` wrapper

- **Affected:** all three bands, all shared screens — still the single most important
  accessibility-correctness gap in the app, carried forward from `ANIMATION_PLAN.md` Phase 1
  and confirmed still open (only a small handful of files opt in individually so far).
- **Files:** app root (wherever the top-level provider tree is composed).
- **Proposed fix:** unchanged from the existing, already-approved-for-review plan — wrap the app
  root in `<MotionConfig reducedMotion="user">`, then verify the ~4-6 continuous-loop
  animations flagged across this audit (Adventure Home hero float, Wonder World's 15-20
  concurrent loops, Bloom Quiz Show stage lights, per-question `renderVisual` loops in Tiny
  Stars) actually stop, since some array-keyframe `animate` patterns may need an explicit
  reduced-motion branch rather than relying on the wrapper alone.
- **Implementation risk:** Low for the wrapper itself; Low-Medium for the per-component
  verification pass.
- **Changes:** logic (one wrapper) plus verification, no visual redesign.
- **Reuse:** yes, `TreasureCollection.jsx` and `HighFiveDelivery.jsx` are already working
  examples of the pattern.

### 4.3 Cap or pause Wonder World's concurrent infinite-loop animation count

- **Affected:** shared systems — Wonder World.
- **Files:** `src/components/WonderWorld.jsx` (companion badge, quest markers, equipped items,
  plots, discovery grid, mystery egg — all independently `Infinity`-repeating).
- **Proposed fix:** cap simultaneously-rendered infinite loops (e.g. via an
  `IntersectionObserver`-gated pause for off-screen elements, or reducing how many discovery/
  quest-marker animations run at once) — needs live-device profiling first to confirm actual
  severity before committing to a specific technique.
- **Implementation risk:** Medium — touches a visually complex screen; recommend profiling on a
  real low-end tablet before deciding the exact fix.
- **Changes:** logic (animation gating), no visual redesign needed.
- **Reuse:** n/a — this is itself a simplification.

### 4.4 Bring `YaagviCharacter`'s pose reactions into gameplay moments, not just arrival/completion

- **Affected:** most modules across all three bands that currently show only a static bobbing
  mascot image during play (confirmed absent of any pose reaction in roughly half of Little
  Stars' modules and all of Tiny Stars' engine and Super Kids).
- **Files:** `src/components/ToddlerChoiceAdventure.jsx:113`, `src/components/ModuleArrival.jsx:30`,
  and the equivalent static-image usages noted per-band in `FULL_ANIMATION_AUDIT.md`.
- **Proposed fix:** swap static/ad-hoc mascot images for `YaagviCharacter` with `state` tied to
  the actual game moment (correct/wrong/idle/celebrate), reusing the existing component rather
  than building new animation.
- **Implementation risk:** Low per file (component already exists, stable API), Medium in
  aggregate given the number of files touched — recommend a phased rollout, one band or one
  high-traffic module at a time.
- **Changes:** presentation only.
- **Reuse:** maximal.

### 4.5 Give Bloom Quiz Show a staggered star reveal and a real "welcome back" beat

- **Affected:** shared — Bloom Quiz Show, all bands.
- **Files:** `src/components/BloomQuizShow.jsx:91` (completion), intro copy near the top of the
  component.
- **Proposed fix:** stagger the completion star row in, matching the quality bar already set by
  the treasure chest/mystery egg reveals; use the `played` prop the component already receives
  to vary the welcome line on repeat visits.
- **Implementation risk:** Low — both are small, local changes to an existing component.
- **Changes:** presentation only.
- **Reuse:** the staggered-reveal pattern already exists elsewhere (`TreasureCollection.jsx`'s
  sparkle stagger) and can be copied.

---

## Group 5 — Optional delight polish

- **Adventure Home:** add an entrance transition to the hero card; animate the star/treasure
  counters with the existing `CountUp` component instead of snapping to new values
  (`src/components/BloomAdventureHome.jsx`, `src/components/Dashboard.jsx` for the existing
  `CountUp` reference). Presentation only, low risk, high reuse.
- **Grammar Grove:** pause the target-word highlight pulse once the answer is locked in, instead
  of continuing indefinitely (`src/ks2/modules/GrammarModule.jsx:120-127`). Presentation only.
- **Bloom Quiz Show:** consider whether wrong-answer feedback should be brought slightly closer
  in richness to correct-answer feedback across the whole 3-9 age range the component serves, or
  confirm the current gentler asymmetry is an intentional pedagogical choice for younger players
  before changing anything.
- **Parent Zone:** surface a small summary of Companion Bond / Dream Project / Treasure Room
  progress on the Stats/Progress tabs, not only the default Story tab, so parents landing on
  those tabs see the same narrative the child experiences (`src/components/ParentZone.jsx`).
- **`BuddyCompanion.jsx`:** confirm it is truly unused (cross-check `AvatarSelector.jsx` and any
  other avatar-selection flow before treating this as settled) and either wire it in
  deliberately or remove it — currently ~480 lines of orphaned parallel mascot infrastructure.
- **Numbers module (Tiny Stars):** either implement a real tap-to-count interaction on the
  displayed objects, or soften the instruction copy that currently promises one
  (`src/toddler/ToddlerApp.jsx:1218`).
- **Animals module (Tiny Stars):** consider a real animal-sound SFX layer instead of TTS reading
  the onomatopoeia word aloud, for a stronger sensory payoff at this age.

---

## What this plan deliberately does not include

- No new animation library — every proposed fix reuses `framer-motion`, `canvas-confetti`, the
  existing CSS-keyframe layer, or the existing `YaagviCharacter`/`CountUp`/`TreasureChestReward`
  components.
- No learning-mechanic redesign — every fix targets presentation, event-flag wiring, or reward
  arithmetic; none change what a module teaches or how it's played.
- No implementation has occurred. Each numbered item above is scoped for an individual go/no-go
  decision, consistent with how the Treasure Chest and Parent High Five items were approved and
  shipped individually earlier this week.
