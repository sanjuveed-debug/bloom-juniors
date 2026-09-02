# Bloom Juniors — Codebase Analysis

Investigation only. No production code was changed to produce this document.
Prepared 18 July 2026 against branch `agent/consolidated-child-experience`.

## 1. Tech stack

| Concern | Finding |
|---|---|
| Framework | React 18.3.1, function components + hooks only. No class components in app code (one `ErrorBoundary.jsx` is the sole exception, by necessity — error boundaries require a class). |
| Build tool | Vite 5.3.5, `@vitejs/plugin-react` 4.3.1 |
| Language | Plain JS/JSX — no TypeScript (`@types/react` is present but unused for actual type-checking; nothing in the repo runs `tsc`) |
| Styling | Tailwind CSS 3.4.7 (utility classes) mixed extensively with inline `style={{...}}` objects for computed/dynamic values (gradients, per-theme colors). One global stylesheet, `src/index.css` (571 lines), carries hand-written keyframe animations Tailwind's utility classes don't cover. |
| Animation | **Framer Motion 11.3.19** is the dominant system — imported in 88 files, ~1,938 `motion.*` component usages, 66 files use `AnimatePresence`. Supplemented by `canvas-confetti` (39 files, celebration bursts) and a hand-written CSS keyframe library (17 `@keyframes` blocks) for effects framer-motion doesn't drive (button-level CSS-only feedback, ambient background motion). |
| Routing | **None.** No `react-router` or equivalent. Navigation is a `screen` string held in component state per age-band app, switched via a local `navigate(id)` function. There is no URL-based routing — the browser address bar never changes as a child moves between games. |
| State management | **No global store** (no Redux/Zustand/Jotai/Recoil). State is: (a) custom hooks — `useProgress`, `useGuardian`, `useProfiles`, `useSpeech`, `useSound`, `usePremium` — each independently backed by `localStorage` with a debounced Supabase cloud-sync; (b) one React Context, `VoiceContext`, narrowly scoped to the active TTS voice ID for the current age band; (c) plain component state for UI-local concerns (which screen, which modal is open). |
| Backend/data | Supabase (Postgres + Auth), accessed via `@supabase/supabase-js` in `src/services/cloudStore.js`. Cloudflare Pages Functions (`functions/api/*.js`) handle server-side concerns that must not run in the browser (PIN verification, class-progress save). |
| PWA | `vite-plugin-pwa` (service worker, offline caching for images/audio/fonts, installable manifest). |
| Fonts | `@fontsource/fredoka-one` (display/heading font, referenced as `font-bubble`), `@fontsource/nunito` (body font, `font-round`). |
| Build/test commands | `npm run dev` (Vite dev server, port 5173) · `npm run build` (runs `scripts/build-blog.mjs` as a `prebuild` step, then `vite build`) · `npm run preview` · `npm test` (Node's built-in `node --test tests`, currently 132 passing assertions across unit-style `.test.js`/`.test.mjs` files). A separate, larger set of `tests/*-uat.mjs` files are Playwright-driven browser harnesses invoked manually (`node tests/xxx-uat.mjs`), not part of `npm test`. No CI configuration exists (no `.github/workflows`), and no ESLint/Prettier config exists — nothing enforces style or catches unused-variable-class bugs before they reach production. |

## 2. Folder structure

```
src/
  components/     114 files — shared UI: Dashboard, ParentZone, BloomAdventureHome, treasure/
                   companion/world systems, onboarding screens, teacher/classroom UI
  modules/        16 files — the "early" (ages 5–6) band's standalone learning games
                   (SoundPop, NumberWorld, StarCatch, StoryRoom, ShapeWorld, GameArcade, …)
  toddler/         1 file  — ToddlerApp.jsx (ages 3–4), a self-contained ~1,500-line app shell
  ks2/             1 file + modules/ (10 files) — KS2App.jsx (ages 7–9) shell + its own games
                   (TimesTablesModule, FractionsModule, ReadingModule, SpellingModule, …)
  hooks/           useProgress, useGuardian, useProfiles, useSpeech, useSound, useHaptic,
                   usePremium, useVisibilityTimers
  utils/           ~45 files — pure logic: adaptive difficulty, treasure/reward rules,
                   companion bond/powers, dream project, wonder world, analytics, date/seed helpers
  services/        cloudStore.js — the entire Supabase read/write/merge surface
  lib/             supabase client, speechController (Azure TTS), ttsCache
  contexts/        VoiceContext.js (the app's one React Context)
  pages/           LandingPage.jsx, SchoolsPage.jsx, CurriculumMap.jsx (marketing/public site)
  config/          premiumContent.js (feature-gating config)
  App.jsx          the "early" (5–6) age-band app shell — also the top-level auth/session gate
                   that decides which of the three age-band shells to mount
  main.jsx         React root
  index.css        global stylesheet + keyframe library
```

Top-level: `functions/` (Cloudflare Pages Functions — server-side PIN check, class progress,
Stripe), `public/` (static assets, PWA icons, mascot video/image assets), `tests/` (unit +
Playwright UAT harnesses), `marketing/` (nursery outreach kit, built this week), `docs/`
(this file and its siblings), `scripts/` (blog build, icon generation, Instagram poster).

Root-level clutter: ~100 stray screenshots (`ss_*.png`, `smoke-*.png`, `human-smoke-*.png`,
`debug-*.png`), several `.log` files, a `New folder/`, and a duplicated Google Play package
zip sit directly in the project root rather than a `debug/`-style folder. Cosmetic, not
functional, but worth a cleanup pass — noted here since it makes visual/animation
before-after screenshots (relevant to this audit) harder to locate.

## 3. Application architecture

**One login gate, three separate child-facing apps.** `App.jsx` handles auth (email + password
+ parent PIN, server-verified via `functions/api/parent-pin.js`), profile selection, and age-group
routing. Once a child profile is chosen, control passes to exactly one of three independent,
largely non-code-sharing app shells based on the profile's age band:

| Age band | Shell component | Ages | Distinct module count |
|---|---|---|---|
| Tiny Stars | `src/toddler/ToddlerApp.jsx` | 3–4 | 8 |
| Little Stars | `src/App.jsx` itself (`AppWithProfile`) | 5–6 | 16 |
| Super Kids | `src/ks2/KS2App.jsx` | 7–9 | 12 |

Each shell independently: holds its own `screen` state, defines its own module map (an object
literal mapping a module id to a rendered game component), defines its own "adventure map" or
"treasure map" UI listing every module, and wraps game screens in a shared
`AdventureModuleFrame` component (arrival screen, map button, speech control, companion/treasure
overlays). All three call the same `useProgress(profileId)` hook for state and cloud sync, so the
*data* layer is shared even though the *UI* layer is triplicated.

**Cross-cutting systems**, shared across all three bands via components/utils rather than
duplicated logic:
- **Adventure Home** (`BloomAdventureHome.jsx`) — the "what should I do next" hero card, themed
  per band (toddler/early/junior palettes), showing Continue / My Favourite / Surprise Me / the
  daily treasure state.
- **Treasure system** (`TreasureCollection.jsx`, `utils/treasureRewards.js`, `utils/treasureLoadout.js`) —
  earned collectibles, room decoration, equipped effects.
- **Living World / Wonder World** (`WonderWorld.jsx`, `utils/wonderWorld.js`) — planted seeds,
  discoveries, the companion's growth.
- **Companion system** (`BuddyCompanion.jsx`, `CompanionBond.jsx`, `utils/companionPowers.js`,
  `utils/companionBond.js`) — Yaagvi's level, friendship points, in-game hint "powers."
- **Dream Project** (`DreamProject.jsx`, `DreamProjectAdventures.jsx`, `utils/dreamProject.js`) —
  the multi-stage build-a-thing reward arc (e.g., the Rainbow Treehouse / Magical Skyship).
  **Living Adventure** (`LivingAdventure.jsx`) — the weekly story/chapter progression.
- **Bloom Quiz Show** (`BloomQuizShow.jsx`) — one shared component reused by all three bands
  (re-skinned via `ageGroup` prop and a `COPY` lookup table), rather than three separate quizzes.
- **Parent Zone** (`ParentZone.jsx`, `ParentProgressStory.jsx`, `ParentHighFiveComposer.jsx`,
  `HighFiveDelivery.jsx`) — PIN-gated parent dashboard, weekly story, and the parent→child
  encouragement ("High Five") messaging loop.
- **Classroom/Teacher** (`ClassroomDashboard.jsx`, `TeacherSetup.jsx`, `ClassLogin.jsx`) — a
  parallel teacher-facing flow for school deployments, separate from the family PIN flow.

## 4. Full learning-module inventory

**Tiny Stars (3–4), 8 modules** — Colours, Shapes, 1·2·3 (Numbers), Animals, Fruits, My Body,
A·B·C (Alphabet), Big Quiz. All eight share one generic `ToddlerChoiceAdventure` engine
(configured per-module via a `TODDLER_CHOICE_GAMES` lookup table) rather than being eight
separate implementations.

**Little Stars (5–6), 16 modules** — Sound Pop (phonics), Number World (maths), Star Catch
(tricky words), Story Room, Shape World, Puzzle Quest (logic), Coin Shop, Piggy Bank, Da Vinci
Studio (drawing — the app's one real `<canvas>`-based game), My Body (anatomy), Wonder Lab
(science), World Explorer (geography/GK), Fun Exercise, Planet World, Game Arcade (a
mini-games hub in its own right, containing Bloom Quiz Show), Sacred Stories (world faiths).
Each is its own top-level component file in `src/modules/`.

**Super Kids (7–9), 12 modules** — Times Tables, Fractions, Reading, Spelling, Word Problems,
Piggy Bank, Grammar, Science Quest, World Map, World Faiths (Spirituality), Game Zone (Games),
Training Zone (Exercise). Each is its own component in `src/ks2/modules/`.

**36 distinct learning activities total** across the three bands (some concepts — Piggy Bank,
My Body/Anatomy, Science — recur per band with age-appropriate difficulty rather than being
identical).

## 5. Structural wiring check (performed as part of this pass)

Every band's menu/map was cross-referenced against its module-map object and the actual
rendered component for that id:

- **Tiny Stars:** 8 menu positions ↔ 8 module-map entries ↔ 8 real components. Clean.
- **Little Stars:** 16 `<Screen id>` render targets, each a distinct real component; the
  15-tile menu grid plus Piggy Bank (reachable via a separate card, not the main grid, by design)
  account for all 16.
- **Super Kids:** 12 adventure-map locations ↔ 12 module-map entries ↔ 12 real components,
  including "Training Zone" (Exercise), which is reachable via the map but intentionally
  omitted from the categorized folder-style menu.

No orphaned menu entries and no module built-but-unreachable were found in any band.

## 6. Notable pre-existing technical debt (context for the animation work)

- **No ESLint/CI.** Nothing currently catches an unused variable, a stray line, or a failing
  test before it reaches production — this is how the `saveCloudProgress` regression (fixed
  17–18 July) shipped silently.
- **Five "god files"** exceed 1,000 lines: `GameArcade.jsx` (2,266), `App.jsx` (1,454),
  `SoundPop.jsx` (1,451), `Dashboard.jsx` (1,453), `ToddlerApp.jsx` (~1,520 after this week's
  changes). Any animation work touching these benefits from narrow, surgical edits rather than
  broad refactors, purely to keep review/verification tractable.
- **Main JS bundle is ~724 KB (203 KB gzipped)** before any game module loads — relevant to
  animation work because heavier animation libraries or large Lottie/Rive assets would add to
  an already-heavy first load on the tablets this app targets.
- **~100 stray screenshot/log files** clutter the repo root.

None of the above block the animation work that follows; they're recorded here because they
shape *how* that work should be done (small, verifiable diffs; mindful of bundle size).
