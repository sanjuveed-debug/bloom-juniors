# Bloom Juniors — Full Animation & Creative Experience Audit

Investigation only. No production code was changed to produce this document. Findings are
grounded in direct code inspection performed by five parallel investigation passes (one per
age band, one for shared/cross-cutting systems) plus the prior `ANIMATION_AUDIT.md` pass
(18 July) for landing/onboarding/loading/classroom screens, which is folded in and updated
here rather than repeated. Where a finding needs a live device/browser to fully confirm, that
is stated explicitly rather than assumed.

All 36 learning modules across all 3 age bands were reviewed — 8 Tiny Stars, 16 Little Stars,
12 Super Kids adventure-map locations (10 own files + 2 shared components).

---

## Part 0 — Screens carried over from the 18 July pass (updated, not re-audited)

These were already covered in `ANIMATION_AUDIT.md` and are summarized here for completeness;
see that file for full detail. Status notes reflect what's changed since.

| Screen | Priority (18 Jul) | Status now |
|---|---|---|
| Landing/marketing pages | Optional | Unchanged. |
| Onboarding & auth (login, avatar, mood check-in) | Optional | Unchanged — PIN-field shake still not implemented. |
| Loading states | Optional | Unchanged since the branded spinner shipped 17 July. |
| Classroom/Teacher screens | Optional | Unchanged, appropriately low investment. |
| Universal game-experience CSS layer (`.game-answer-win`/`.game-answer-try`, `index.css`) | High | Still the strongest, most consistently accessible system in the app — see Part 4 below, now confirmed to coexist with per-module framer-motion duplicates in **most** of the 36 modules, not just "some." |
| Screen transitions (`ScreenEnter.jsx`, `App.jsx` `Screen()`) | Medium | Still no `useReducedMotion()` wiring; otherwise unchanged. |
| Treasure Chest reveal | Medium → **now Low** | The anticipation-wobble/latch-glow enhancement (approved and shipped this week) closed the gap flagged 18 July. Confirmed live in `TreasureCollection.jsx`. |
| Parent High Five delivery | Optional → **now addressed** | The anticipation beat, `YaagviCharacter` celebrate-pose swap, and collection flourish (approved and shipped this week) closed the "visually equivalent to any other card" gap. Confirmed live in `HighFiveDelivery.jsx`. |

---

## Part 1 — Tiny Stars (ages 3–4), 8 modules

All 8 module ids (`colours`, `shapes`, `numbers`, `animals`, `fruits`, `bodyparts`, `alphabet`,
`quizshow`) are confirmed wired to a live component via `moduleMap` (`src/toddler/ToddlerApp.jsx:1420-1429`).
Seven share one engine, `ToddlerChoiceAdventure`, configured per-module by `TODDLER_CHOICE_GAMES`
(`ToddlerApp.jsx:1192-1274`); `quizshow` renders the shared `BloomQuizShow` directly.

### Shared engine (colours, shapes, numbers, animals, fruits, bodyparts, alphabet)

**What works well:**
- No-fail design: a wrong tap never ends the question — it shows a hint, then (on a second miss)
  an amber glow-ring on the correct answer (`ToddlerChoiceAdventure.jsx:65-78,137,147`). This is
  one of the strongest pieces of age-appropriate design in the whole app: no score-shaming,
  guaranteed forward progress, gentle escalating scaffolding.
- Correct-answer moment: `confetti({particleCount:55,...})` + green highlight + module-flavoured
  VO ("The rainbow garden is glowing!") + `aria-live` toast (`ToddlerChoiceAdventure.jsx:84,130`)
  — a well-layered, genuinely joyful "yes!" beat.
- Defensive speech-timing (`speakThenAdvance`, `src/utils/speechAdvance.js`) with a hard-ceiling
  fallback (600–2400ms) prevents stalls if TTS `onEnd` never fires — solid engineering for real
  tablets with unreliable TTS engines.
- Screen transitions via `ScreenEnter` are wired at every switch point — no hard cuts.

**Where a 3–4 year old may smile:** the confetti+VO+colour combo on every correct answer; the
richly-scaffolded phonics content in `alphabet` (real RWI-style "a says a as in apple" sessions).

**Where they may get bored:** the header mascot (`ToddlerChoiceAdventure.jsx:113`, a static
bobbing `/yaagvi-mascot-single.webp`) never reacts to right/wrong across an entire 5–10 question
session — same idle bob throughout; the progress-dot bar (`:121-123`) is a static colour-fill
with no motion as it fills.

**Where the emotional payoff is weak:** `GameCompleteReveal`'s star count (capped at 3, based
on first-try-only correctness, `GameCompleteReveal.jsx:12`) can visually contradict the "All N
clues found!" headline when a child needed hints on several questions — the copy says "all
found," the stars say otherwise, sitting side by side.

**Best improvement:** wire `YaagviCharacter.jsx`'s existing 8-pose system (idle/wave/celebrate/
dance/point/think/read/clap, already built with per-pose CSS animation and reduced-motion
handling) into (a) the header mascot in `ToddlerChoiceAdventure.jsx:113` to react to correct/
wrong, and (b) `ModuleArrival.jsx:30`, which currently renders `&lt;img src="/yaagvi-poses/${d.pose}.png"&gt;`
as a raw, unanimated image — completely bypassing the pose-specific animations `YaagviCharacter`
already has for exactly these pose names.
**Priority: High.** Files: `src/components/ToddlerChoiceAdventure.jsx:113`, `src/components/ModuleArrival.jsx:30`, `src/components/YaagviCharacter.jsx`.

**Real-device performance risk:** every `renderVisual` (7 modules) runs an `Infinity`-repeat
transform animation restarted per-question (`ToddlerApp.jsx:1201,1213,1225,1237,1248,1259,1270`);
combined with the header bob, companion/treasure badges, and tap ripple, this is plausible
frame-drop territory on a low-end tablet, though all are GPU-friendly transform-only animations
— needs live-device confirmation, not assumed broken.

### quizshow (`BloomQuizShow.jsx` with `ageGroup="toddler"`)

**Visual/tonal mismatch:** renders a dark neon "game show stage" (`bg-[radial-gradient(...#8d4bd8...#120728...)]`,
rotating stage-light beams, `BloomQuizShow.jsx:82,103-105`) — starkly different from the bright
pastel gradients every other Tiny Stars module uses (`ToddlerApp.jsx:1203-1273`). For 3–4 year
olds this is a noticeably different, more intense emotional register from the rest of their
world. **Priority: Medium-High.**

**Content depth:** `toddlerQuestion()` (`src/utils/bloomQuiz.js:47-60`) only generates one
question category ("picture counting") repeated 5 times — narrower than the other 7 modules,
each of which teaches a distinct concept. The "big quiz"/finale module is effectively a
reskinned Numbers module.

**Double-completion-screen bug** (see also `CHILD_JOURNEY_GAPS.md` and the Critical items in
`PRIORITISED_EXPERIENCE_PLAN.md`): `quizshow` is the only one of the 8 modules with its own
internal completion phase (`BloomQuizShow.jsx:91`) in addition to being wrapped in
`AdventureModuleFrame`, which independently renders `GameCompleteReveal` on the same
`bloom:game-complete` event. The child sees two different "you won" screens back to back with
two different star counts (quiz's own up-to-5-star prize vs. the generic modal's capped 3) and
two contradictory statements — the quiz's honest "3 of 5 solved" immediately followed by the
generic modal's blanket "All 5 clues found!" for `ageGroup==='toddler'`. **This is the single
most concrete, reproducible animation/completion bug found in this audit.**

---

## Part 2 — Little Stars (ages 5–6), 16 modules

Shell: `src/App.jsx` (`AppWithProfile`). All 16 modules route through `Screen()` →
`AdventureModuleFrame` (`ageGroup="early"`) and the shared reward pipeline `handleAddStars`
(`App.jsx:471-618`).

### Cross-cutting mechanism affecting most of these 16 (read once)

`handleAddStars` dispatches `bloom:game-complete` **and** unconditionally schedules
`defer(() => setScreen('home'), 1500)` (`App.jsx:617`) whenever a module's `onAddStars` call
doesn't set `sessionData.stayOnModule = true`. `AdventureModuleFrame.jsx:56-63,184` shows the
interactive `GameCompleteReveal` (Continue/Replay/Home buttons) on that same event — which is
then **force-unmounted by the navigation ~1.5 seconds later regardless of whether the child has
tapped anything.** Confirmed via grep: only `LittleDaVinci`, `GameArcade`, and `SacredStories`
(via its own delayed-award pattern) avoid this; the other modules in scope do not set
`stayOnModule`, so the pattern applies to them by default. This is the single biggest
cross-cutting animation/completion issue in the 5–6 band. **Priority: Critical** (see
`PRIORITISED_EXPERIENCE_PLAN.md`).

`YaagviCharacter`'s pose system is unused by `AdventureModuleFrame`/`GameCompleteReveal`
(static image only) and by roughly half of the 16 modules individually (see below).

### 1. Sound Pop — phonics (`src/modules/SoundPop.jsx`)

Best-built module in the band. Uses `InteractiveYaagvi`/`useYaagviReactions` throughout
(question/correct/wrong/complete/listen/blend reactions, 9 call sites). Confetti on every
correct answer, a 🔥 streak badge, real SSML/IPA phoneme playback. Own completion screen
(`:1165-1194`) is well-written but will be interrupted/duplicated by the shared
`GameCompleteReveal` per the cross-cutting note above. **Priority: Medium.**

### 2. Number World — maths (`src/modules/NumberWorld.jsx`)

Rich `InteractiveYaagvi` use (5 sites) and genuine breadth: operation quiz, Flash Count, and
Match mini-games. **Three independent award paths** (`completeMath`, `handleFlashComplete`,
`handleMatchComplete`, `:605-682`) each fire the full completion pipeline — playing all three
sub-games in one sitting shows **three separate `GameCompleteReveal` overlays** back to back.
`awardedRef`/`flashAwardedRef`/`matchAwardedRef` guards correctly prevent double-award from a
single completion event (good), but do not prevent the multi-path overlay spam.
**Priority: Medium-High.**

### 3. Star Catch — tricky words (`src/modules/StarCatch.jsx`)

Confetti on correct catches, a nice star-shake on wrong answers, but **zero `InteractiveYaagvi`
usage** (confirmed via grep) despite the header `CompanionBadge` implying a present companion.
Good two-stage difficulty ramp (`SentenceMatchPhase` before final award). **Priority: Medium**
— add mascot reactions consistent with Sound Pop/Number World.

### 4. Story Room — reading (`src/modules/StoryRoom.jsx`)

Distinctive hand-authored ambient `PAGE_SCENES` (waves, snow, sparkles keyed to story/page,
`:11-211`) — unique among the 16. But **no `confetti` and no `InteractiveYaagvi`** anywhere in
the file; the only mascot presence is a static `&lt;img&gt;`. Tapping an underlined phonics word
gets only spoken feedback, no visual celebration — a missed positive-reinforcement beat exactly
where Sound Pop uses confetti. Story-end (`:701-719`) is a 2-second TTS delay with no
celebration at all. **Priority: High** — this is the thinnest celebration infrastructure of any
Little Stars module relative to its content quality.

### 5. Shape World — shapes (`src/modules/ShapeWorld.jsx`)

Good `InteractiveYaagvi` integration (5 sites) and genuine mechanic variety — Learn/Quiz/Tower
Build, the last being a physical-reasoning "which shapes make a stable tower base" mechanic
unlike anything else in the 16 modules. Same multi-award-path overlay-spam issue as Number
World (Quiz completion and Tower completion each independently fire the shared reveal).
**Priority: Optional** beyond the shared overlay issue — this is one of the stronger builds.

### 6. Puzzle Quest — logic (`src/modules/DirectionalPuzzle.jsx`)

**Critical wiring bug.** Each single-level solve (not a full session) independently calls
`onAddStars('logic', 2, ...)` (`:133-138`), which fires the shared `GameCompleteReveal` overlay
(z-[255]) directly on top of the module's own local success modal (z-50, `:277-289`), which
contains the actual **"Next Level →"** button. `GameCompleteReveal`'s own buttons all route home
or replay — a child solving level 1 of 12 is shown a full "adventure complete" screen whose
actions are home/replay, and the real next-level button underneath is unreachable without first
dismissing the overlay. This breaks the sequential-level progression the module (and
`progress.logic.maxLevel`) is explicitly built around. Also: **no `InteractiveYaagvi` at all**,
and wrong-path failures get only a small text toast, the thinnest emotional support of any
module for what is arguably the hardest-to-reason-about content in the band.
**Priority: Critical.**

### 7. Coin Shop — money (`src/modules/ShopGame.jsx`)

Confetti on purchase; solid pay-with-coins simulation. No mascot reactions. Two design/wiring
concerns: (a) an `earnCoins()` header button grants 5-15 free pennies per tap with **no cap or
cost** (`:109-114`), letting a child bypass the counting task the module is meant to teach; (b)
`shop` is excluded from `GATE_FREE_SCREENS` (`App.jsx:436`), so tapping its tile when it isn't
today's gated activity **silently redirects** the child elsewhere with zero explanation
(contrast with the well-explained `PremiumLockModal`). **Priority: High** (silent redirect) /
**Medium** (coin exploit).

### 8. Piggy Bank — money (`src/modules/PiggyBankGame.jsx`, `ageGroup="early"`)

No mascot reactions; single confetti burst at completion. **Visual tone break:** defaults to a
dark cosmic gradient background (`'linear-gradient(160deg,#13052c,#071b39)'`, `:138,169`)
whenever no theme is passed — and the early-band wiring (`App.jsx:732-744`) never passes one, so
it always renders dark inside the otherwise warm/bright Little Stars world. Also excluded from
`GATE_FREE_SCREENS` — same silent-redirect risk as Coin Shop. **Priority: High.**

### 9. Da Vinci Studio — drawing (`src/modules/LittleDaVinci.jsx`)

Genuinely delightful, tactile free-draw tool (palette, brush sizes, stamps, flood fill,
confetti on save/download). Correctly uses `stayOnModule: true` so it never triggers the shared
forced-navigation bug — the one module that gets this right by design. Two real issues: (1)
`saveToGallery()` awards +2 stars **every tap with no cooldown/dedupe** — unbounded star
farming on an unchanged canvas; (2) `floodFill()` (`:402-445`) does a manual, unchunked
scanline-free fill over the full device-pixel-ratio canvas — a real main-thread freeze risk on
a large fill on mid/low-end tablets, with no yielding or loading indicator. No undo on
`clearCanvas()` either. **Priority: Critical** (performance) / **High** (reward exploit).

### 10. My Body — anatomy (`src/modules/BodyParts.jsx`)

Nice pulsing highlight-ring on tap, X-ray toggle, per-part fact cards. Quiz completion does
**not** set `stayOnModule` → subject to the shared forced-navigation bug: the module's own
"Quiz Done!" screen and the generic `GameCompleteReveal` both appear in rapid succession before
the ~1.5s auto-navigation cuts both short. **Priority: High.**

### 11. Wonder Lab — science (`src/modules/CuriousScience.jsx`)

**Critical wiring bug — the most damaging one found in Little Stars.** This is a non-linear,
explore-style card-flip module with no explicit "quiz end." Every 5th newly-revealed card and
every fully-revealed category independently calls `onAddStars` **without `stayOnModule`**
(`:182,192`) — meaning the shared forced-navigation pipeline **ejects the child from the module
back to the Dashboard mid-browse**, every 5th card they flip, actively punishing the exact
open-ended curiosity the module exists to encourage. Nice flip-card reveal animation and a
"Hear it again" replay button are otherwise the only creative touches; no mascot reaction
anywhere. **Priority: Critical.**

### 12. World Explorer — geography/GK (`src/modules/WorldGK.jsx`)

Confetti + voice feedback consistent with other quiz modules; smooth expand/collapse browse
cards; graceful CDN-flag-image fallback. Subject to the same shared forced-navigation bug — the
module's own "Quiz Complete!" screen with a "Back to Explorer" button is effectively decorative
since the parent screen switches away regardless. **Priority: High.**

### 13. Fun Exercise (`src/modules/FunExercise.jsx`)

**Best-in-class animation** of the 16 modules: a genuinely well-crafted full-body SVG character
rig (`Character`, `:99-235`) with per-exercise-tuned motion (star jumps, toe touches, marching,
spinning, clapping, frog hops) precisely synced to a 900ms rep counter — likely to genuinely
delight this age band via mirroring/mimicking. Wiring gap, not an animation gap: reward only
fires on completing a **full 8-exercise workout**, not on single-exercise sessions, despite
those showing a full "Exercise Done!" celebration screen with no actual reward behind it,
and skipping 7 of 8 exercises still counts toward the workout bonus if the 8th is completed
properly. **Priority: Medium** (design/reward-integrity gap, not an animation defect).

### 14. Planet World (`src/modules/PlanetWorld.jsx`)

Strong, polished space visuals (animated starfield, glowing per-planet gradients, gentle
detail-view rotation, auto-advancing fun-fact carousel) and good haptic-backed answer feedback.
**Scoring-dependent behavioural inconsistency:** the reward `useEffect` only fires (and thus
only triggers the forced-navigation bug) when the child scores ≥50% — children who score worse
are left on a calm, self-paced results screen; children who score better are abruptly ejected
mid-celebration by the same shared bug described above. This is a real, user-visible quality
bug where doing *better* produces a *worse* experience. **Priority: High.**

### 15. Game Arcade — mini-games hub + Bloom Quiz Show wrapper (`src/modules/GameArcade.jsx`)

The most robustly-wired module in the band. Daily-rotation freshness mechanic
(`getDailyArcade()`), a clearly-explained study-gate lock screen (`StudyLockScreen`, the best
locked-state messaging found across all 36 modules), a daily-special 2x-star mechanic, and a
genuine standout: a **level-up celebration modal** (`:2442-2469`) driven by local component
state rather than the shared/buggy completion pipeline — bouncing emoji, shimmer text, clear
level badge — one of the best reward-reveal moments in the entire audited app, and notably
immune to the forced-navigation bug precisely because it doesn't rely on the shared mechanism.
**This is the pattern the rest of the app's completion screens should copy.** Six original
mini-games beyond the quiz were not individually deep-audited (out of scope depth-wise) but
their wiring into the shared level/reward system is sound. **Priority: Optional** — nothing
urgent; recommend as a template for other modules.

### 16. Sacred Stories — world faiths (`src/modules/SacredStories.jsx`)

User-paced completion (unlike most of the 16): `onAddStars` isn't called until the child
explicitly taps "Read Another Story," so the celebration screen itself is never cut short.
However the forced-navigation bug still fires 1.5s after that tap, colliding with the module's
own `setScreen('religion')` call in the same handler. Genuine content strength: pronunciation
maps and toddler-specific rewritten panels. Real reward-integrity gap: replaying an
already-completed story's quiz awards fresh 1-3 stars **every time, indefinitely**, with no
first-time gate (unlike the separate first-completion badge, which is correctly gated).
**Priority: High** (reward-integrity, the most easily/likely-to-be-exploited of the group since
it's the designed replay loop, not a misuse).

---

## Part 3 — Super Kids (ages 7–9), 12 locations

Shell: `src/ks2/KS2App.jsx`. The `totalStars` fix (`KS2App.jsx:698`) is confirmed present and
correct. `ScreenEnter` is confirmed applied at every screen-switch branch — no unwrapped
transitions found.

### Cross-cutting finding — three-name problem (read first, affects 10 of 12 locations)

Every location has up to **three independently-authored names** depending on which screen: the
adventure-map tile (`MAP_LOCATIONS`, `KS2App.jsx:166-182`), the arrival screen
(`ModuleArrival.jsx`'s `JUNIOR_DESTINATIONS`), and the in-module header (`AdventureModuleFrame.jsx`'s
`META` table). Example: tapping "Number Castle 🏰" on the map welcomes the child to "Multiplier
Mine ✖️," then plays inside a screen headed "Multiplier Mine" — "Number Castle" never appears
again that session. Science and Exercise are three-way mismatches (Science Lab / Discovery
Springs / Wonder Springs; Training Zone / Training Camp / Movement Meadow). Full table in
`STORY_CONTINUITY_AUDIT.md`. **This is treated as a story-continuity issue first and an
animation-consistency issue second — see that document for the full breakdown.**

`YaagviCharacter`'s pose system is confirmed unused anywhere in Super Kids — `ModuleArrival.jsx`
and `GameCompleteReveal.jsx` use static images with ad-hoc `motion.img` bounce instead.

### Times Tables — "Number Castle" (`TimesTablesModule.jsx`)

Timed-quiz countdown color-shift (amber→red) creates age-appropriate tension; confetti scaled
to answer speed; a calmer no-timer "Match Up" alternative mode; tiered result screen with
progression badges ("Lv.2"/"Lv.3⚡"). Gap: correct taps get a green highlight, wrong taps get no
visual reaction beyond the banner text. **Priority: Medium.**

### Fractions — "Crystal Cave" (`FractionsModule.jsx`)

Instructive (not decorative) SVG fraction-bar/pie visuals. No entrance stagger, no anticipation
beat before the visual renders. No bespoke result screen — relies entirely on the shared
`GameCompleteReveal`, unlike Times Tables/Reading/Spelling/Game Zone. **Priority: Optional**
(visual polish) / **Medium** (completion-depth inconsistency, shared with several other
locations below).

### Puzzle Tower — word problems (`WordProblemsModule.jsx`)

Best learning-support design of the twelve: shows worked "Working out" steps after a correct
answer and a "💡 Show Hint" affordance before answering, with generous 2200ms reveal pacing to
let a 7-9 year old actually read the working. No bespoke result screen. **Priority: Low.**

### Money Bank — "Piggy Bank" junior branch (`src/modules/PiggyBankGame.jsx`, `ageGroup="junior"`)

Age-appropriate harder rounds (budgeting, simple interest) confirmed genuinely 7-9-suited, not
reused toddler content. Minor: bypasses the `(s,t,e)` evidence signature the other 9 KS2 modules
use, so adaptive-difficulty tracking silently gets an empty `questions` array for this location
specifically. **Priority: Low.**

### Book Kingdom — reading (`ReadingModule.jsx`)

Standout personalization: `buildJuniorPersonalisedPassage` injects a "Made for {profileName}"
badge ahead of fixed graded passages — a genuine "this app knows me" moment well-suited to this
age. Clear manual "Answer Questions →" transition rather than auto-advance, respecting reading
time. **The single best emotional-payoff moment found across all 12 Super Kids locations.**
No issues found.

### Spell Academy — spelling (`SpellingModule.jsx`)

Strong design: auto-recommended difficulty tier with a "★ Recommended" badge, a gentler "Word
Match" alternative for kids who find typed spelling stressful, live spring-pop star counter
during play, warm tiered result-screen copy. **Most thoughtfully differentiated module in the
band.** Completion is deliberately gated behind a "Done ✓" button on the result screen (unlike
most others, which call `onDone` at the moment of the last correct answer) — a worthwhile
pattern to note if standardizing completion timing later.

### Grammar Grove — grammar (`GrammarModule.jsx`)

Good pulsing-highlight-on-target-word + expanding meaning-chip legend. The highlight pulse
continues indefinitely even after the answer is locked in, which can read as slightly nervous
rather than helpful. No bespoke result screen. **Priority: Optional** (pause the pulse once
answered).

### Science Lab (`ScienceModule.jsx`)

Standout: every correct answer surfaces a "🔬 Did you know?" fact card before the child can
advance, manually gated (not timer-driven) to respect reading pace — genuinely magical,
curiosity-satisfying, and a good template for other content modules. Suffers the worst version
of the three-name problem (see above). No other issues found.

### World Globe — geography (`WorldMapModule.jsx`)

A small but effective per-question anticipation beat: the flag emoji spring-pops in fresh on
every new question (`initial:{scale:0}`), refreshing the "new place discovered" feeling each
round — the best micro-anticipation moment found in Super Kids content modules. No functional
issues beyond the shared naming mismatch.

### Temple Isle — world faiths (`SpiritualityModule.jsx`)

The richest content module of the twelve: five faiths, with Hinduism alone offering four
illustrated, Previous/Next-navigable micro-stories using a genuine page-turn slide transition
(`mode="wait"`) — the most "book-like" transition in the whole module set, and arguably a
template Reading/Spelling's story content could borrow from. Age-appropriate depth (interfaith
comparison, festival names, holy books), not oversimplified. No functional issues.

### Game Arena — Games/Quiz hub (`GamesModule.jsx`, embeds `BloomQuizShow`)

Widest interaction variety of the band: lane-runner, tower-stacker, letter-tap word builder,
memory-flip, and a full grid maze-chase game, plus the embedded shared quiz. **Concrete visual
defect:** several finish/lock/result screens render literal placeholder-style text —
`&lt;div className="text-6xl"&gt;WIN&lt;/div&gt;`, `"LOCK"`, `"GAME"` — where every other completion
moment app-wide uses an emoji/trophy visual at that scale; reads as unfinished rather than
designed, and it's visible on every single game completion and every locked-state visit.
**Priority: High** (trivial fix, very high visibility). Also: mini-game scoring doesn't affect
reward tier — the five original mini-games always resolve to a clamped perfect score
(`correct=total=1`) regardless of actual in-game performance (maze deaths, tower misses, etc.
never reduce the reward), unlike the embedded quiz branch, which correctly passes real
correct/total. **Priority: Medium** (may be an intentional "games are downtime, not graded"
design choice — flagged for a product decision, not assumed a bug).

### Training Zone — exercise (`ExerciseModule`, local in `KS2App.jsx:273-329`)

Simple tick-to-complete checklist with a large confetti burst on finish — the flattest
interaction of the twelve (no mascot reaction, no per-item feedback beyond a checkbox flip), but
arguably appropriate for a brief "recharge" utility screen rather than a core learning moment.
Suffers the worst three-way naming mismatch in the band. Does not update `totalStars`/XP fields
(by design, since it isn't a knowledge quiz) — worth confirming as intentional, since this also
means it doesn't feed the companion/friendship bond the way every other completed location does.

---

## Part 4 — Shared/cross-cutting systems

### Universal game-experience layer (`AdventureModuleFrame.jsx` + `index.css`)

Confirmed as the single highest-leverage, best-designed system in the app: distinct CSS-class-
driven win/try feedback (`.game-answer-win`/`.game-answer-try`), companion/treasure glow layers,
a subtle ambient background drift, uniform button tactile feedback, and — uniquely in this
codebase — **correct, working `prefers-reduced-motion` handling** for this specific layer. The
problem, confirmed and now quantified across all 36 modules: the large majority of individual
module files duplicate this feedback in framer-motion on top of the CSS layer, meaning answer
feedback "feel" varies module to module depending on which system a given file happens to also
use — a consolidation opportunity (simplification, not new work), not just a consistency one.
**Priority: High** (bug-class risk + consistency).

### Adventure Home (`BloomAdventureHome.jsx`)

No page-level entrance transition on the hero card (only the quiz-showcase card added this week
animates in) — feels like it appears rather than arrives, inconsistent with the rest of the
app's spring-in modal language. Star/treasure counters still snap to new values with no
transition (the `CountUp` component used elsewhere in `Dashboard.jsx` remains unused here, per
the 18 July finding — unchanged). Mascot here is the static `/yaagvi-3d-wave.png` + webm pair,
a third mascot rendering approach distinct from both `YaagviCharacter` and the (likely orphaned)
`BuddyCompanion.jsx` — see the mascot-consistency finding below. **Priority: Medium.**

### Treasure Chest reveal + Living Treasure Room (`TreasureCollection.jsx`)

One of the strongest animation sets in the app, and now stronger after this week's approved
enhancement. `ChestAnimation` has a genuinely well-choreographed anticipation beat (latch glow
before opening, then a spring-open + staggered sparkle burst); each treasure plays a
personality-driven motion (`TREASURE_MOTIONS`: bounce/spin/glow/wiggle) rather than one generic
animation for every reward — real per-item differentiation. `RoomStage` makes every treasure a
persistent, draggable, tappable, reactive object. **Priority: Low** — nothing broken; this is a
model for other reward surfaces to follow.

### Wonder World / Living World (`WonderWorld.jsx`, `wonderWorld.js`)

Genuine investment: three real growth stages with bespoke hand-built plant art, not a progress
bar; tap-to-replay discovery reactions with restrained repeat-tap confetti scaling. Real-device
performance risk: this screen can render **15-20+ concurrent `Infinity`-repeat framer-motion
loops** at once (companion badge, up to 5 quest markers, N equipped items, 3 plots, up to 12
discovery cards, mystery egg, chest sparkles), with no visibility-based pausing found in the
code. **Priority: Medium** — cap or pause simultaneous infinite animations (e.g. via
IntersectionObserver or a rendered-count limit); needs live-device profiling to confirm actual
severity on low-end Android.

### Companion / Friendship UI (`CompanionBond.jsx`, `companionBond.js`, `companionPowers.js`)

The friendship progress bar fills smoothly on mount, but the stage-icon row beside it hard-cuts
via opacity/grayscale toggling with no transition — a rough seam next to the smooth bar.
**The most significant gap in this system: there is no level-up celebration anywhere in the
codebase** for the 5-stage companion-bond progression (`COMPANION_BOND_STAGES`,
`companionBond.js:4-10`) — evolving from e.g. Trail Buddy to Magic Partner is currently a silent
state change, inferable only from the bar crossing a threshold, despite being one of the
biggest narrative milestones the game offers. **Priority: High** — the app already has a
reusable full-screen-celebration modal pattern (`TreasureChestReward`) that could be adapted for
this with low new-build risk.

### Dream Project (`DreamProject.jsx`)

Genuinely strong and bespoke per age band (three distinct hand-animated build scenes:
Treehouse/Skyship/Headquarters), with a distinct completion sequence (ken-burns pan/zoom + a
tap-to-activate interaction) rather than reusing the build-loop celebration. Minor: the
companion figure falls back to a plain text emoji if a non-Yaagvi buddy is equipped and has no
image, while every other shared screen renders an actual image for the equipped companion — a
small per-buddy fidelity gap. **Priority: Low.**

### Bloom Quiz Show (`BloomQuizShow.jsx`) — deep critique, shared across all 3 bands

Stage-light intro atmosphere is cheap to render and effective (2 rotating blur elements). The
"host" is a static image with a float+rotate loop, not the `YaagviCharacter` pose set — a
missed opportunity precisely where `celebrate`/`point` poses would land well, especially since
this is the one component explicitly asked to be a deep-critique subject. Correct-answer
feedback (border color + confetti) is notably richer than wrong-answer feedback (border color
change only, no shake, no distinct sound) — likely intentional for younger players but worth a
product check for consistency across the wide 3-9 age span this one component serves. The
completion star row renders all at once rather than the staggered reveal used elsewhere (chest,
egg) — a missed quality-bar match. Also never acknowledges the `played` prop it already receives
— every visit is scripted as if it's the child's first time on the stage. **Priority: Medium.**

### Parent Zone + High Five flow

This week's High-Five enhancement (anticipation beat + `celebrate`-pose swap + collection
flourish) and the Treasure Chest wobble are confirmed shipped and already address what the
prior creative critique flagged — noted as resolved, not re-flagged. One remaining
inconsistency: `HighFiveDelivery.jsx` is now the **only** shared screen using `YaagviCharacter`'s
pose system instead of the static image pair — meaning the same character currently renders via
two visually different rigs depending which screen the child is on. `ParentZone.jsx`'s
Stats/Progress tabs surface none of Companion Bond, Dream Project, or Treasure Room — only the
default Weekly Story tab does. **Priority: Medium** (standardizing the mascot approach is the
single highest-leverage fix in the shared layer, since it touches 6+ screens at once).

### Mascot rendering — the single biggest cross-cutting animation finding

Three separate, non-interoperating mascot systems coexist:
1. **`YaagviCharacter.jsx`** — the built, tested, 8-pose sprite system with CSS keyframe
   animation, crossfade, and reduced-motion handling. Used in only 3 files:
   `HighFiveDelivery.jsx`, `Dashboard.jsx`, `InteractiveYaagvi.jsx`.
2. **Static `/yaagvi-3d-wave.png` + `.webm` pair**, wrapped ad hoc in `motion.div` float loops —
   used in `BloomAdventureHome.jsx`, `TreasureCollection.jsx` (×2), `WonderWorld.jsx`,
   `DreamProject.jsx` (fallback), `BloomQuizShow.jsx`, `ParentProgressStory.jsx`.
3. **`BuddyCompanion.jsx`** — a complete separate 5-character system (Yaagvi/Bloom/Marina/Snow/
   Rumi) with its own mood engine and particle physics (~480 lines). Grep confirms it is **not
   imported anywhere** except itself — very likely orphaned/dead code from an earlier concept.

A child moving Adventure Home → Treasure Room → Wonder World → Quiz Show → a parent's High Five
sees the *same character* rendered three different ways with no in-story explanation.
**Priority: High.** See `STORY_CONTINUITY_AUDIT.md` for why this is treated as a narrative issue
as much as a technical one.

---

## Cross-cutting accessibility note (carried forward, now with more precise scope)

`useReducedMotion()` is now wired in a small handful of files (`TreasureCollection.jsx`,
`HighFiveDelivery.jsx`, confirmed this week) out of the ~88+ files using framer-motion across
the app — still a small minority. The CSS-keyframe layer (`index.css`) continues to have
correct, working `prefers-reduced-motion` handling for the classes it defines. This gap and its
recommended fix (a single `&lt;MotionConfig reducedMotion="user"&gt;` wrapper at the app root) were
already detailed in `ANIMATION_PLAN.md` Phase 1 and are not re-litigated here — still open,
still the single most important accessibility-correctness item in the app.
