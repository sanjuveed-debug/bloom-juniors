# Bloom Juniors — Animation Audit

Investigation only. Findings below are grounded in direct code inspection and, where noted,
live testing performed this week. No production code was changed to produce this document.

Screens are grouped where they share one animation system (e.g., all 36 learning modules
share `AdventureModuleFrame` + the same CSS answer-feedback layer) rather than repeating
identical findings 36 times.

---

## 1. Landing / marketing pages (`LandingPage.jsx`, `SchoolsPage.jsx`, `CurriculumMap.jsx`)

**Current animations:** Framer-motion scroll-reveal patterns, hero video (`landing-video.mp4`,
`developer-story.mp4`), some `whileHover`/`whileTap` on CTAs.

**Missing interactions:** No animated transition between marketing sections beyond basic fade/
slide-in; the "watch a demo" video controls are plain HTML5, not styled to match brand.

**Inconsistent/distracting:** None found — this is the least animation-dense part of the app,
appropriately, since it's a parent-facing conversion page, not a child play surface.

**Mobile performance:** Two autoplay-adjacent videos on one page is worth checking on a slow
connection; not verified this pass.

**Accessibility:** Not checked for `prefers-reduced-motion` on scroll-reveal.

**Recommended improvement:** Low urgency — this page's job is trust and conversion, not delight.

**Priority: Optional.**

---

## 2. Onboarding & auth (login, profile select, avatar picker, mood check-in)

**Current animations:** PIN keypad has basic press feedback; profile cards use scale-in on
mount; `MoodCheckIn.jsx` has emoji selection with a tap-scale. `AvatarSelector`/age-band chooser
uses framer-motion for card entrance.

**Missing interactions:** Login has no meaningful failure/success animation beyond a static red
error line ("Wrong PIN. 4 tries left.") — a shake or color-flash on wrong PIN would give
immediate, legible feedback to a young child watching a parent type it, or to an older child
entering their own.

**Inconsistent/distracting:** None significant.

**Mobile performance:** Fine — low animation density here.

**Accessibility:** The PIN error message is text-based, which is good (not animation-only
feedback) — but there's no `aria-live` region confirmed for it, so a screen reader may not
announce the retry count change.

**Recommended improvement:** Add a brief shake/color-pulse on the PIN field for wrong-PIN
feedback; confirm `aria-live="polite"` on the error text.

**Priority: Optional.**

---

## 3. Adventure Home (all three bands' primary dashboard)

**Current animations:** `BloomAdventureHome.jsx` — the CTA hero button has a continuous idle
float/rotate (`animate={{ y: [0,-6,0], rotate: [0,-2,2,0] }}`, infinite repeat); Favourite/
Surprise cards use `whileTap` scale; the mascot has a looping float + a pre-rendered idle-wave
video (`yaagvi-3d-wave.webm`) layered under a static PNG poster. This week, a "Tonight on the
Bloom Stage" showcase card was added with its own entrance animation and idle icon rotation.

**Missing interactions:** The treasure-count pill (`🎁 N treasures`) and the star counter update
with no transition — they just re-render the new number. A `CountUp` component already exists
elsewhere in the codebase (`Dashboard.jsx`) for exactly this purpose but isn't used on the
Adventure Home counters.

**Inconsistent/distracting:** The hero button's idle animation (float + rotate, infinite,
2.4s loop) runs continuously even while a child is reading the card text — for a child with
attention difficulties this constant background motion competes with reading. This is a real,
specific instance of "too much idle motion," not a hypothetical one.

**Mobile performance:** Two infinite-loop animations (hero icon float, mascot idle) run
simultaneously on every dashboard view. Framer-motion's `animate` prop with array keyframes
re-renders on every frame tick by default unless using layout/transform-only optimized paths —
worth profiling on a low-end Android tablet specifically, not just a desktop browser.

**Accessibility:** No `prefers-reduced-motion` handling at all in this component (confirmed —
`useReducedMotion` is not imported here). A child/parent with vestibular sensitivity gets the
full continuous-motion experience regardless of OS-level settings.

**Recommended improvement:** Wire `useReducedMotion()` to pause the two idle loops (keep
entrance/tap feedback, which are brief and purposeful); animate the star/treasure counters with
the existing `CountUp` pattern.

**Priority: High** (reduced-motion gap is an accessibility correctness issue, not polish).

---

## 4. Universal game experience — all 36 learning modules (`AdventureModuleFrame.jsx` + CSS)

This is the single highest-leverage surface in the app: every module, across all three bands,
passes through this shared wrapper and shares the `.game-experience` CSS layer in `index.css`.

**Current animations:** A genuinely well-designed, purpose-built system:
- `.game-answer-win` (700ms cubic-bezier lift+glow+brightness) and `.game-answer-try` (420ms
  shake) — distinct, legible right/wrong feedback applied via CSS class toggle, not framer-motion.
- Companion glow (`companion-choice-glow`, `companion-correct-glow`) and treasure-focus glow
  (`treasure-choice-focus`) — layered feedback when a companion power or treasure effect is active.
- `.game-ambient` — a slow (16s), subtle diagonal-drift background texture.
- Button-level tactile CSS (`touch-action: manipulation`, 160ms hover/focus/active transitions,
  `:active { scale(.96) }`) applied uniformly via `.game-experience main button`.
- A `prefers-reduced-motion` block **already exists** for this specific layer and correctly
  disables `.game-ambient`, the button transition, mascot video, and the win/try/treasure
  animations. **This is the one part of the app that gets reduced-motion right.**

**Missing interactions:** Confirmed live this week — `BloomQuizShow.jsx` narrated only the
first question; advancing to question 2+ never re-triggered speech (fixed 18 July). This class
of bug (an animation/feedback trigger present on entry but not on subsequent state changes) is
worth specifically checking for in other modules, since it's exactly the kind of thing that
"looks right" in a first pass and silently regresses.

**Inconsistent/distracting:** Two competing animation systems for the same job — the CSS
answer-feedback classes above, and per-module framer-motion `motion.button`/`whileTap` scale
effects layered on the *same* buttons in many individual module files. Neither is wrong, but
having both means answer feedback "feel" varies module to module depending on which system a
given file happens to use, rather than being one designed system.

**Mobile performance:** The CSS-class approach used for win/try/glow feedback is the *right*
choice for performance — GPU-accelerated `transform`/`box-shadow`/`filter`, no JS re-render
cost. This is genuinely better practice than doing the same feedback via framer-motion
`animate` props, which several individual modules also do redundantly.

**Accessibility:** Reduced-motion handling exists and is correct for this layer specifically
(see above) — the gap is that it doesn't extend to the framer-motion layer used on top of it
in individual module files.

**Recommended improvement:** (1) Audit every module for the "only fires once" narration/
animation bug class found in Bloom Quiz Show. (2) Consolidate answer feedback onto the existing
CSS-class system rather than duplicating it in framer-motion per module — this is a
*simplification*, not new work, and it would improve both consistency and performance.

**Priority: High** (bug-class risk + consistency; the underlying system is already good).

---

## 5. Screen transitions (navigation between screens, all three bands)

**Current animations (as of 18 July, after this week's fix):** All three age bands now animate
every screen switch via a shared spring-physics entrance (`ScreenEnter.jsx` for Toddler/KS2;
an upgraded `Screen()` component with `AnimatePresence` for the 5–6 band). Before this week's
fix, Toddler and KS2 had **zero** transition — screens hard-cut. This gap is now closed.

**Missing interactions:** The 5–6 band gets a true crossfade (old screen exits while new one
enters, via `AnimatePresence mode="wait"`); Toddler/KS2 get entrance-only animation (the old
screen simply disappears, no exit animation) because their screens are selected via early
`return` statements rather than one shared conditional render tree — giving them a true
crossfade would require restructuring control flow in two large (1,400+/800+ line) files, which
was deliberately deferred as higher-risk than the value justified this week.

**Inconsistent/distracting:** The three bands now have visually *similar* but not *identical*
transition timing (5–6 uses `AnimatePresence` exit+enter; Toddler/KS2 use entrance-only) — a
child moving between siblings' profiles in different bands would perceive a subtly different
"weight" to navigation. Minor, but worth naming.

**Mobile performance:** Spring physics (vs. fixed-duration tweens) are not meaningfully more
expensive; no concern.

**Accessibility:** Neither `ScreenEnter.jsx` nor the upgraded `Screen()` component checks
`useReducedMotion()`. Every navigation still does an 18px slide + scale + spring settle
regardless of OS setting.

**Recommended improvement:** Add `useReducedMotion()` to `ScreenEnter.jsx` and `Screen()` (one
shared change, two files) to drop to a plain opacity fade when reduced motion is requested.

**Priority: Medium** (already improved this week; this closes the remaining accessibility gap).

---

## 6. Loading states

**Current animations (as of 18 July):** Previously a generic white spinning-ring `<div>` with a
CSS `animate-spin` class — no brand personality. Replaced this week with three bouncing star
emoji + a pulsing "Getting your adventure ready…" message.

**Missing interactions:** Only `App.jsx`'s `LoadingSpinner` was updated; Toddler and KS2 lazy-
load their own module bundles via `React.lazy`/`Suspense` — worth confirming they reuse the same
component rather than falling back to a browser-default blank screen during the JS chunk fetch.

**Inconsistent/distracting:** None found in the updated version.

**Mobile performance:** Loading states are, by definition, shown exactly when the network/CPU
is already under load (fetching a new JS chunk) — keep this animation cheap. The current
version (three emoji + opacity pulse) is appropriately lightweight.

**Accessibility:** No `aria-live` announcement that content is loading; a screen reader user
gets silence during the load window.

**Recommended improvement:** Confirm all three bands share one loading component; add an
`aria-live="polite"` "Loading" announcement (visually hidden) alongside the visual spinner.

**Priority: Optional.**

---

## 7. Living World, Treasure Room, Companion system

**Current animations:** This is where the app's richest, most bespoke animation work lives —
a dedicated CSS keyframe set (`treasure-choice-focus`, `treasure-palette`,
`treasure-brave-bounce`, `companion-choice-glow`, `companion-correct-glow`) drives distinct
visual states for treasure-loadout effects and companion-power activation, layered with
framer-motion for the room/world layout itself (planting animations, discovery reveals).

**Missing interactions:** Not independently verified this pass which specific
plant/discovery/decorate interactions have entrance animation vs. instant appearance — this
would need a dedicated live click-through of Wonder World specifically (the existing
`wonder-world-uat.mjs` harness exercises the *logic*, not the *visual feel*, of this system).

**Inconsistent/distracting:** None found; this system reads as deliberately, distinctly designed
rather than templated — which is appropriate, since it's the app's core "reward" motivation loop
and deserves the extra craft.

**Mobile performance:** The treasure-palette background animation (`conic-gradient` +
`background-size: 160% 160%`, animated) is more GPU-intensive than a transform-only animation —
worth a real-device check on a mid-range Android tablet given it can run for extended periods
(the `.treasure-palette-active` state persists while a palette effect is equipped, not just
during a brief celebration).

**Accessibility:** Covered by the same `prefers-reduced-motion` block as the universal game
layer (section 4) — correctly disabled.

**Recommended improvement:** A live design pass specifically on Wonder World's plant/discover/
decorate moments, once product priority allows; verify the palette-effect animation cost on a
real low-end device given its potentially long active duration.

**Priority: Medium.**

---

## 8. Bloom Quiz Show

**Current animations:** Stage-light beams (two rotating gradient blurs, continuous), spotlight
progress bar per question, confetti on correct answer (small burst) and on the final prize
reveal (large burst), a spring-scale prize-reveal card.

**Missing interactions (fixed 18 July):** The host only narrated question 1; every subsequent
question was silent unless the child manually tapped the small speaker icon — a real,
previously-shipped bug, now fixed so every question is announced on arrival.

**Inconsistent/distracting:** None found post-fix.

**Mobile performance:** Two continuous rotating gradient-blur "stage light" elements
(`StageLights()`) run for the entire duration of the quiz (not just entrance) — `blur-xl` on a
large absolutely-positioned element is one of the more GPU-expensive effects in the app if
overused; a single quiz session keeps it running continuously for its full length (~5 questions,
1–2 minutes), longer than most other transient effects in the app.

**Accessibility:** No `prefers-reduced-motion` handling on the stage lights or the confetti
bursts.

**Recommended improvement:** Confirm real-device frame rate during a full quiz session
specifically (not just on entry); add reduced-motion handling to pause the stage lights (keep
them as a static gradient rather than removing the visual entirely).

**Priority: Medium** (narration bug fixed; remaining items are performance/accessibility polish).

---

## 9. Parent Zone

**Current animations:** Standard framer-motion entrance/tap patterns consistent with the rest
of the app; no bespoke system, appropriately, since this is a low-frequency, information-dense
adult-facing surface rather than a play surface.

**Missing interactions:** The "High Five" delivery (`HighFiveDelivery.jsx`) — a parent-to-child
encouragement message — would benefit from a more deliberate, celebratory delivery animation
on the child's side than a standard card entrance, given it's an emotionally significant, rare
event (a message from a parent), not a routine UI state change.

**Inconsistent/distracting:** None found.

**Mobile performance:** Low animation density; no concern.

**Accessibility:** Not specifically audited; likely inherits the general framer-motion gap
(no reduced-motion wiring) but at low animation density here, the practical impact is small.

**Recommended improvement:** Give the High Five delivery moment its own small, distinct
celebration (confetti + a companion reaction), matching the emotional weight of the feature —
currently it's visually equivalent to any other card appearing on screen.

**Priority: Optional** (a nice-to-have that would meaningfully increase the feature's impact,
but not a bug or accessibility issue).

---

## 10. Classroom / Teacher screens

**Current animations:** Same baseline framer-motion patterns as Parent Zone; no bespoke system.
Appropriate — this is professional/utility software for teachers, not a child play surface, and
shouldn't compete for attention with data.

**Missing interactions / inconsistent / mobile / accessibility:** No specific issues found;
this surface intentionally (and correctly) has the lowest animation investment in the app.

**Recommended improvement:** None.

**Priority: Optional.**

---

## Cross-cutting findings (apply across multiple screens above)

1. **`useReducedMotion()` is wired in exactly 1 of 88 files that import framer-motion**
   (`TreasureCollection.jsx`). The CSS-keyframe layer in `index.css` has correct, working
   `prefers-reduced-motion` handling for the specific classes it defines (universal game
   feedback, treasure/companion glows, mascot video). The framer-motion layer — the large
   majority of the app's animation, ~1,938 usages — has none. **This is the single most
   important finding in this audit**: a real accessibility gap, precisely scoped, not a
   hypothetical concern.
2. **Two parallel answer-feedback systems** (CSS classes vs. per-module framer-motion) exist
   side by side rather than one module using one clearly. Consolidating onto the CSS system
   (already correct, already performant, already accessible) is a simplification opportunity,
   not just a consistency one.
3. **No Lottie, Rive, GSAP, or Three.js is used anywhere**, despite a `download-lottie.js`
   script existing in the repo root (built, per its own comments, to fetch generic stock
   animations — never wired into any component; effectively dead infrastructure).
   Framer-motion + CSS keyframes + `canvas-confetti` + two pre-rendered mascot video clips
   are the entire animation toolkit in active use.
4. **Continuous infinite-loop animations are used in a handful of high-visibility, high-
   duration places** (Adventure Home hero button, mascot idle float, Bloom Quiz stage
   lights) — these are the animations most worth profiling on real low-end devices and most
   worth gating behind `prefers-reduced-motion`, since their cost is paid for the entire time
   a screen is open, not just once.
