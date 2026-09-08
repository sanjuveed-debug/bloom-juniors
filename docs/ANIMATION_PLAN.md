# Bloom Juniors — Animation Plan

A proposal, synthesized from `ANIMATION_AUDIT.md`. **Nothing in this document has been
implemented.** It is written for review and prioritization before any further code changes.

## Guiding principle

Bloom Juniors is a real-time, interactive PWA played on tablets, sometimes on weak Wi-Fi, by
children aged 3–9. The right quality bar is **Duolingo / Khan Academy Kids** — expressive,
well-timed 2D motion — not film-rendered ("Pixar") animation, which requires offline rendering
and is architecturally incompatible with an app that must react to a tap in milliseconds. This
was already discussed and agreed; it's restated here because it should govern every decision
below: prefer many small, well-timed, purposeful moments over a few expensive, showy ones.

## What's already shipped (baseline, for context — not part of this proposal)

This week, before this audit was commissioned: universal screen transitions were added to all
three age bands (previously Toddler/KS2 hard-cut between screens); the loading spinner was
replaced with a branded animation; a real bug was fixed where Bloom Quiz Show's host went
silent after question 1; the Adventure Home dashboard's module-checklist chips gained stagger
and a checkmark pop. These are the floor this plan builds on, not part of what's being proposed
now.

---

## Phase 1 — Accessibility correctness (recommend: do first, regardless of what else is chosen)

This is framed separately from "polish" because it's a correctness gap, not a taste question.

1. **Wire `useReducedMotion()` globally.** Currently 1 of 88 framer-motion files handle it. The
   cleanest fix is not editing 88 files individually — wrap the app root in framer-motion's
   `<MotionConfig reducedMotion="user">`, which automatically downgrades *all* framer-motion
   animations to their reduced form app-wide from one place. The CSS-keyframe layer already
   has correct `prefers-reduced-motion` handling and needs no change.
2. Specifically confirm the continuous infinite-loop animations named in the audit (Adventure
   Home hero button float, mascot idle loop, Bloom Quiz stage lights) actually stop under
   `MotionConfig` — some `animate` prop patterns using array keyframes may need an explicit
   reduced-motion branch rather than relying on the global config alone; this needs verification
   per-component, not just the wrapper.
3. Add `aria-live="polite"` to the loading-state message and confirm PIN-error text is announced.

**Estimate:** small — one wrapper change plus targeted verification of ~4 continuous-loop
components. **Risk:** low; `MotionConfig` is additive and framer-motion-native.

## Phase 2 — Consolidate the two answer-feedback systems

The audit found CSS classes (`game-answer-win`/`game-answer-try`, already performant, already
accessible) running alongside redundant per-module framer-motion feedback on the same buttons
in some game files. Proposal: standardize every module on the existing CSS-class system and
remove the duplicate framer-motion feedback where found.

This is a **simplification**, not new animation work — fewer moving parts, more consistent feel
across all 36 modules, and better mobile performance (CSS transform/filter animations are
cheaper than re-rendering framer-motion `animate` props on every answer tap).

**Estimate:** medium — requires opening each of the 36 module files to check which pattern they
use; mechanical once identified, but 36 files is real surface area. Could be scoped to the
highest-traffic modules first (the two-per-day "study path" modules in the 5–6 band, all 8
toddler modules) rather than all 36 at once.

**Risk:** low-medium — touches gameplay-facing files; each change should be followed by a
live click-through of that specific module, similar to the verification pattern already used
this week.

## Phase 3 — Close the remaining screen-transition gaps

1. Add `useReducedMotion()` to `ScreenEnter.jsx` and `App.jsx`'s `Screen()` (two files) — falls
   out of Phase 1's `MotionConfig` wrapper largely for free, worth explicit verification.
2. **Optional, larger:** give Toddler and KS2 a true crossfade (old screen exit + new screen
   enter, matching the 5–6 band) instead of entrance-only. This requires restructuring the
   early-`return`-per-screen control flow in both files into one shared conditional render tree
   under a single `AnimatePresence` — a real refactor of two 1,400+/800+ line files, meaningfully
   higher risk than anything shipped this week. Recommend treating this as its own reviewed
   change, not bundled with smaller fixes, and only if the visual difference (entrance-only vs.
   true crossfade) is judged worth the risk after seeing Phase 1–2 shipped.

**Estimate:** small for item 1; large and separately-scoped for item 2.

## Phase 4 — Signature delight moments (product/priority call, not purely technical)

Small, high-emotional-value additions the audit flagged as "optional" but worth naming as a
deliberate choice rather than an oversight:
- Adventure Home star/treasure counters animate via the existing `CountUp` component instead of
  snapping to the new number.
- The Parent "High Five" delivery gets its own celebration (confetti + companion reaction)
  distinct from a routine card appearing, matching its emotional weight as a rare parent→child
  message.
- A wrong-PIN shake/color-pulse on the login screen.

**Estimate:** small, independent, can be done in any order or skipped without affecting anything
else.

## Phase 5 — Performance verification on real hardware

Two specific animations were flagged as worth checking on an actual mid-range Android tablet
(not just desktop browser devtools): the treasure-palette background effect (`conic-gradient`
+ animated `background-size`, can run for extended periods while equipped) and Bloom Quiz Show's
continuous stage-light blur effect (runs for the full quiz duration, not just entrance). This is
a measurement task, not a code change — its output is either "no action needed" or a scoped
follow-up to simplify a specific effect.

**Estimate:** small — a device test session, not development work.

## Explicitly out of scope for this plan

- **Any GSAP/Lottie/Rive/Three.js adoption.** None are currently used; introducing one is a
  tooling decision with real cost (bundle size, new asset pipeline, learning curve) that
  deserves its own separate proposal and decision, not a line item inside an animation-polish
  pass. (Rive was discussed previously as the right next step *if and when* investment in
  character-animation quality becomes a priority — that remains a future, separate decision.)
- **Film-rendered ("Pixar-quality") character animation.** Architecturally incompatible with a
  real-time interactive PWA, as established in the guiding principle above.
- **The Toddler/KS2 control-flow refactor for true crossfade** (Phase 3, item 2) is named but
  deliberately not bundled into a default "yes, do all of this" — it should be its own explicit
  go/no-go decision given its size relative to everything else here.

## Suggested sequencing

Phase 1 (accessibility) → Phase 2 (consolidation/simplification) → Phase 5 (device
verification, can run in parallel with 1–2) → Phase 4 (delight, any time) → Phase 3 item 2
(crossfade refactor) only as a separate, explicitly-approved follow-up.

This ordering fixes the one real correctness gap first, gets a simplification (net negative
code, more consistent feel) shipped second, and defers the highest-risk single change
(control-flow refactor) to last and only with explicit sign-off.

---

**Awaiting your review before any of this is implemented**, per the investigation-only
instruction this analysis was commissioned under.
