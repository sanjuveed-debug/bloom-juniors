# Bloom Juniors — Module Wiring Matrix

Investigation only. One row per module/location (36 total). "OK" means confirmed correct by
direct code inspection this pass. "BUG" means a confirmed defect (see linked detail doc).
"Design Q" means working-as-coded but a product decision is worth making explicitly. Live-
device items needing confirmation are marked accordingly rather than assumed.

Legend for columns: **Entry** = tile→component wiring · **Complete** = can it be finished/does
completion trigger correctly · **Save** = does progress persist · **Reward** = issued correctly
& not duplicable · **Return** = correct destination after completion · **Downstream** = does
Adventure Home / companion bond / treasure reflect the completed activity afterward.

---

## Tiny Stars (ages 3–4) — shell: `src/toddler/ToddlerApp.jsx`

| Module | Entry | Complete | Save | Reward | Return | Downstream |
|---|---|---|---|---|---|---|
| Colours | OK | OK (no-fail engine) | OK (`totalStars`, `toddlerTreasurePoints`) | OK, guarded (`firstToday`, `claimTreasureReward` idempotent) | OK → `goHome` | OK (bond derives from `totalStars`) |
| Shapes | OK | OK | OK | OK | OK | OK |
| Numbers | OK | OK | OK | OK | OK | OK |
| Animals | OK | OK | OK | OK | OK | OK |
| Fruits | OK | OK | OK | OK | OK | OK |
| Body Parts | OK | OK | OK | OK | OK | OK |
| A·B·C (Alphabet) | OK | OK | OK | OK | OK | OK |
| Big Quiz (`quizshow` → `BloomQuizShow`) | OK | **BUG** — module's own completion phase stacks with `AdventureModuleFrame`'s `GameCompleteReveal` on the same event; child sees two different "you won" screens with two different, contradictory star counts (see `CHILD_JOURNEY_GAPS.md`) | OK | OK (reward itself not duplicated, just double-displayed) | OK, but only after dismissing both modals | OK |

All 7 engine-driven modules: no dead menu tiles, no orphaned components. `moduleMap`
(`ToddlerApp.jsx:1420-1429`) confirmed to cover all 8 ids. Note: ~950 lines of a fully
superseded, unreferenced second implementation of these 7 modules (`ColoursModule`,
`ShapesModule`, etc., `ToddlerApp.jsx:217-1160`) sit dead in the same file — not a wiring bug
(nothing routes to them) but a real risk that a future edit lands in the wrong place.

---

## Little Stars (ages 5–6) — shell: `src/App.jsx` (`AppWithProfile`)

| Module | Entry | Complete | Save | Reward | Return | Downstream |
|---|---|---|---|---|---|---|
| Sound Pop (phonics) | OK | OK, but own celebration screen gets papered over by shared `GameCompleteReveal` seconds later | OK | OK | OK, but early (forced nav, see below) | OK |
| Number World (maths) | OK | OK, but **3 independent award paths** (quiz/Flash Count/Match) each trigger a full completion overlay in one visit | OK (per-op difficulty tracked) | OK, guarded per path (`awardedRef` etc.) | OK, but overlay-spam risk | OK |
| Star Catch (tricky words) | OK | OK | OK | OK | OK, but forced-nav cuts result screen short | OK |
| Story Room (reading) | OK | OK (`completedRef` guard prevents double-award) | OK (per-story stats) | OK | OK | OK |
| Shape World (shapes) | OK | OK, but Quiz + Tower Build are two independent award paths (overlay-spam risk) | OK | OK | OK, but overlay-spam risk | OK |
| Puzzle Quest (logic) | OK | **BUG (Critical)** — per-level completion overlay covers the module's own "Next Level →" button; breaks sequential-level progression (`progress.logic.maxLevel`) | OK | OK (reward not duplicated, just UX-blocking) | Broken until overlay dismissed | OK |
| Coin Shop (money) | **BUG** — excluded from `GATE_FREE_SCREENS`; can silently redirect the child to a different tile with zero explanation when tapped outside today's gate order | OK | OK | OK, but `earnCoins()` grants unlimited free coins per tap with no cap (Design Q / exploit) | OK, but forced-nav cuts result short; repeat purchases re-trigger overlay | OK |
| Piggy Bank (money, early) | Same silent-redirect risk as Coin Shop | OK (`completedRef` guard) | OK | OK | OK, but forced-nav applies | OK |
| Da Vinci Studio (drawing) | OK | OK — correctly uses `stayOnModule:true`, the one module that avoids the forced-nav bug by design | OK | **BUG** — `saveToGallery()` awards +2 stars per tap, no cooldown/dedupe (unbounded farming) | OK (stays in module, correct for a free-draw tool) | OK |
| My Body (anatomy) | OK | OK, but no `stayOnModule` → forced-nav cuts the local "Quiz Done!" screen short | OK | OK | Early (forced nav) | OK |
| Wonder Lab (science) | OK | **BUG (Critical)** — every 5th card flip / completed category fires the full completion pipeline with no `stayOnModule`, **ejecting the child from an open-ended explore module mid-browse** | OK (reward milestones tracked) | OK (not duplicated, just disruptively delivered) | Broken (unwanted forced exit, no "resume where I was") | OK |
| World Explorer (geography/GK) | OK | OK, but no `stayOnModule` → forced-nav cuts the "Quiz Complete!" screen (with its own "Back to Explorer" button) short | OK | OK | Early (forced nav) | OK |
| Fun Exercise | OK | OK for full 8-exercise workouts | OK | **Design Q/BUG** — single-exercise sessions show a full "Exercise Done!" screen but grant **zero** reward (no stars/session log); skipping 7 of 8 exercises still banks the full-workout bonus if the 8th completes | OK for full workouts (subject to forced-nav) | Only for full-workout completions |
| Planet World | OK | **BUG** — reward/forced-nav only fires when score ≥50%; sub-50% scorers get a calm self-paced screen, ≥50% scorers get yanked mid-celebration (scoring-inverted UX) | OK | OK | Inconsistent by design flaw above | OK |
| Game Arcade (mini-games hub + Quiz) | OK, incl. clearly-explained study-gate lock screen (best locked-state messaging in the app) | OK — level-up modal uses local state, immune to forced-nav bug; explicit intentional `stayOnModule:false` since Arcade is the "end of day" step | OK | OK, incl. daily-special 2x multiplier | OK | OK |
| Sacred Stories (world faiths) | OK | OK, user-paced (doesn't call `onAddStars` until child taps "Read Another Story") — celebration screen itself is never cut short, but forced-nav still fires after that tap | OK (`markCompleted` correctly gates the one-time completion badge) | **BUG** — replaying an already-completed story's quiz re-awards fresh 1-3 stars every time with no first-time gate (unlike the badge, which is correctly gated) | OK, minor collision between forced-nav and the module's own `setScreen('religion')` in the same handler | OK |

---

## Super Kids (ages 7–9) — shell: `src/ks2/KS2App.jsx`

`totalStars` fix confirmed present (`KS2App.jsx:698`). All 12 `MAP_LOCATIONS` confirmed mapped
to a live component with no dead entries.

| Location | Entry | Complete | Save | Reward | Return | Downstream |
|---|---|---|---|---|---|---|
| Number Castle (times tables) | OK (name mismatch vs. arrival/header — see `STORY_CONTINUITY_AUDIT.md`) | OK | OK | OK, differentiated treasure amount applied correctly | OK | OK |
| Crystal Cave (fractions) | OK (name mismatch) | OK, no bespoke result screen (relies solely on shared modal) | OK | OK | OK | OK |
| Puzzle Tower (word problems) | OK (name mismatch) | OK, no bespoke result screen | OK | OK | OK | OK |
| Money Bank (piggy bank, junior) | OK (name mismatch) | OK | OK, minor: bypasses the `(s,t,e)` evidence signature the other 9 modules use — adaptive tracking gets an empty `questions` array for this location | OK | OK | OK |
| Book Kingdom (reading) | OK (name mismatch) | OK | OK | OK | OK | OK |
| Spell Academy (spelling) | OK (name mismatch) | OK — deliberately gated behind a "Done ✓" button, an intentional two-step design | OK | OK | OK | OK |
| Grammar Grove (grammar) | OK (name **matches** here — one of the few) | OK, no bespoke result screen | OK | OK | OK | OK |
| Science Lab (science) | OK (**worst** name mismatch — 3 different names: Science Lab / Discovery Springs / Wonder Springs) | OK | OK | OK | OK | OK |
| World Globe (world map) | OK (name mismatch) | OK, no bespoke result screen | OK | OK | OK | OK |
| Temple Isle (world faiths) | OK (name mismatch) | OK | OK | OK | OK | OK |
| Game Arena (games + quiz) | OK, gate clearly explained (`gamesUnlocked`) | OK, but result/lock/finish screens show placeholder text ("WIN"/"LOCK"/"GAME") instead of iconography | OK | **Design Q** — the 5 original mini-games always clamp to a perfect `correct=total=1` score regardless of actual performance; the embedded Bloom Quiz Show branch correctly passes real scores | OK | OK |
| Training Zone (exercise) | OK (**worst** name mismatch — 3 different names: Training Zone / Training Camp / Movement Meadow) | OK, own idempotency key (`ks2ExerciseDate`) correctly prevents same-day double-treasure | OK — deliberately does not touch `totalStars`/XP fields (not a knowledge quiz) | OK, own treasure amount (5) correctly applied | OK | **Design Q** — since bond points derive from `totalStars`/module stars, completing Exercise contributes nothing to the companion friendship meter; confirm this is intentional |

---

## Summary counts

- **36 / 36 modules**: menu tile → correct live component, no dead routes, no orphaned
  components, across all three bands (confirmed by all four band-level audits independently).
- **Confirmed Critical wiring bugs:** 3 (Bloom Quiz Show double-completion on Tiny Stars;
  Puzzle Quest's next-level button blocked; Wonder Lab's mid-browse forced ejection).
- **Confirmed High-priority reward/completion bugs:** Coin Shop/Piggy Bank silent redirects,
  Da Vinci Studio's star-farming save button, Planet World's scoring-inverted forced-nav,
  Sacred Stories' unlimited replay-reward, Fun Exercise's single-session reward gap, Game
  Arena's placeholder finish/lock text.
- **Design questions requiring a product decision, not a code defect:** Game Arena mini-game
  scoring vs. reward tier; Training Zone's non-contribution to companion bond.
- **Not verifiable from static code alone** (flagged by every contributing agent, not assumed):
  exact on-device visual timing/overlap of stacked completion screens before forced navigation;
  real frame-rate impact of concurrent animation counts (Wonder World, stacked Tiny Stars
  loops); real-device flood-fill jank severity in Da Vinci Studio.
