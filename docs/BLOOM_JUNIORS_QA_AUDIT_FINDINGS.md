# Bloom Juniors QA Audit Findings

Date: June 2, 2026

Scope: simulated behavioral and technical audit across Bloom Juniors age tracks:

- Toddler, ages 3-4
- Early Learner, ages 4-6
- Primary, ages 7-9

Testing personas:

- The Chaos Tapper: low motor control, random taps, hand resting on screen, audio-dependent, abandons activities mid-flow.
- The Impatient Explorer: skips voice instructions, presses Next early, struggles with text/drop inputs, changes modules mid-lesson.
- The Speed-Runner: answers rapidly, double-clicks final answers, attempts reward exploits and fast state transitions.

## Executive Summary

Recent patches fixed the highest-risk app shell timer, persistence, and most age-track completion issues:

- `SoundPop` internal timers now use a cleared `defer` helper.
- `NumberWorld` completion is guarded against double awards and timers are cleaned up.
- `App.jsx` stale closures were reduced with `progressRef`.
- Cloud progress overwrite was reduced with `revision` and `updatedAt`.
- History guard now runs once on mount.
- Session-lock PIN digit entry uses functional state updates.
- Several CSS overflow and modal reachability issues were hardened.
- Toddler quiz modules now use synchronous locks and tracked timeout cleanup.
- KS2 quiz modules now use synchronous locks and completion guards.
- `StarCatch` and `PiggyBankGame` now guard duplicate completion and clean delayed callbacks.
- `KS2App.handleModuleDone` now sanitizes completion inputs and is idempotent per module/day.

Remaining risk is now narrower:

- `StoryRoom` still has raw, untracked story/highlight/page timers.
- `GamesModule` is partially fixed, but shared finish and some subgame paths are still not universally guarded.
- Most timed modules still do not pause on browser visibility changes.
- Toddler speech still cancels previous audio rather than queueing essential prompts.
- Some user progress is intentionally session-only and is lost on exit or refresh.

## Fixed Items Already Confirmed

| Area | Component | Status | Notes |
| --- | --- | --- | --- |
| Timer cleanup | `src/modules/SoundPop.jsx` | Fixed | All five timeout paths were moved to a cleared `defer` pattern. |
| Completion idempotency | `src/modules/NumberWorld.jsx` | Fixed | `awardedRef` prevents repeated completion awards. Timers are cleaned on unmount. |
| Stale app progress | `src/App.jsx` | Fixed | `progressRef.current` is used for delayed reward, monster unlock, daily challenge, and bridge decisions. |
| Cloud overwrite | `src/hooks/useProgress.js` | Fixed | Local/cloud data now carries `revision` and `updatedAt`; cloud data is only applied when its revision is strictly newer. |
| History guard | `src/App.jsx` | Fixed | Guard runs once on mount through `screenRef`; module navigation no longer stacks phantom history entries. |
| Session-lock PIN | `src/App.jsx` | Fixed | Digit handler uses functional state updates to avoid dropped rapid taps. |
| Delayed app shell calls | `src/App.jsx` | Fixed | `handleAddStars` delayed navigation and celebrations use the central defer helper. |
| Small-screen name overflow | `src/index.css` | Fixed | `.dashboard-name` clamps and breaks long words. |
| Module label overflow | `src/index.css` | Fixed | Module cards and badges have overflow protection. |
| Skill hint modal reachability | `src/index.css` | Fixed | Modal is scrollable with safe-area bottom padding. |
| Toddler interaction locks | `src/toddler/ToddlerApp.jsx` | Fixed | `ColoursModule`, `ShapesModule`, `NumbersModule`, and `AnimalsModule` now use `lockedRef`, `completedRef`, tracked timeouts, and unmount cleanup. |
| KS2 quiz guards | `src/ks2/modules/FractionsModule.jsx`, `GrammarModule.jsx`, `WorldMapModule.jsx`, `ReadingModule.jsx`, `WordProblemsModule.jsx` | Fixed | Answer handlers now use synchronous locks, completion refs, tracked timeouts, and cleanup. |
| KS2 button-driven quiz guards | `src/ks2/modules/ScienceModule.jsx`, `SpiritualityModule.jsx` | Fixed | Button advance paths are guarded with `lockedRef` and `completedRef`. |
| Timer vs answer race | `src/ks2/modules/TimesTablesModule.jsx` | Fixed | Timeout expiry and answer handler both check `lockedRef`; completion flows through guarded `advance`. |
| Empty/repeated spelling submit | `src/ks2/modules/SpellingModule.jsx` | Fixed | Empty trimmed input is ignored; delayed transitions are locked and cleaned up. |
| Tower/word game duplicate completion | `src/ks2/modules/GamesModule.jsx` | Partially fixed | `TowerBuilderGame` and `WordForgeGame` now guard completion and fix stale score closure. Other subgames still need universal finish guards. |
| Star catch double award | `src/modules/StarCatch.jsx` | Fixed | `completedRef` protects `onAddStars`; timeout paths are tracked and cleaned on unmount. |
| Piggy bank transition race | `src/modules/PiggyBankGame.jsx` | Fixed | `transitioningRef` prevents racing answer/skip paths; `completedRef` prevents duplicate `onComplete`; timers are tracked and reset. |
| KS2 reward exploit | `src/ks2/KS2App.jsx` | Fixed | `completedModulesRef` enforces module/day idempotency; `correct` and `total` are sanitized; `firstToday` is read inside the `update()` callback. |
| Profile create collision | `src/hooks/useProfiles.js` | Fixed | Profile creation now uses `crypto.randomUUID()` and a `creatingRef` in-flight guard. |
| Cloud unload sync | `src/hooks/useProgress.js` | Fixed | Pending sync is flushed on `pagehide` and `beforeunload`. |

## Pending Cross-System Audit Items

| Component | Simulated User Action | Technical Risk / Root Cause | Criticality | Recommended Fix |
| --- | --- | --- | --- | --- |
| `src/App.jsx` landing gate | Logged-in guardian reloads production at `/`. | Live production test showed reload returns to public landing even with `eduapp_guardian_v1` and `eduapp_session_v1` present. Root cause: `showLanding` only checks `localStorage` keys starting with `yaagvi_`, not current `eduapp_` account/session keys. | High | Treat `eduapp_guardian_v1`, `eduapp_session_v1`, `eduapp_profiles_v1`, and Supabase session as existing-account signals. |
| `src/App.jsx` active profile restore | Logged-in guardian selects a child profile, then reloads. | Live production test showed `eduapp_active_profile` remained set, but reload returned to age/world selection because `ageGroup` initializes as `null` and is not derived from `activeProfile`. | High | On mount/profile hydrate, set `ageGroup` from `activeProfile.ageGroup` when `activeId` exists. |
| `src/components/ProfileSelector.jsx` | Child taps a profile and the app transitions after delay. | Live test confirmed profile selection uses delayed navigation. Static audit shows delayed `onSelect` timeout has no cleanup/click-once guard. | Medium | Clear selection timeout on unmount and disable profile cards during pending selection. |
| Timed games globally | Child minimizes browser or switches apps mid-countdown. | Timers continue while hidden unless each module checks `document.hidden` or pauses on `visibilitychange`. | Medium | Centralize pause/resume behavior for timed rounds. |
| `src/modules/StoryRoom.jsx` | Child rapidly taps Next/Previous while audio and word highlighting are active. | Raw timers can update highlight/read/page state after a page change or unmount. | High | Centralize story timers and clear them before page/story changes and on unmount. |
| `src/ks2/modules/GamesModule.jsx` | Child repeatedly clicks Finish or completes non-patched subgames. | Shared `FinishScreen`, `MemoryGame`, `MazeMunchGame`, and `QuestDashGame` still have unguarded or untracked delayed paths. | High | Add a shared `completeOnce` guard and tracked timers to all finish exits. |
| `src/hooks/useProgress.js` / Supabase sync | Child profile load/reload happens while progress sync is in flight. | Live production test observed an aborted `child_progress` Supabase `POST` during navigation/reload. Local progress remained, but failed cloud save can be dropped after retry exhaustion. | High | Add durable per-profile sync outbox and retry on `online`, foreground, and next launch. |
| Build output | Production build | Build passes, but Vite warns that `@import` statements in CSS must precede other statements. | Low | Move font `@import` statements before other CSS rules in `src/index.css`. |

## Live Production Auth Test

Performed: June 2, 2026, against `https://bloomjuniors.com/` using a real guardian login supplied for this audit. Credentials were not written to the repository; the temporary Playwright test file was removed after the runner route was unavailable.

Observed flow:

- Public landing loaded successfully on mobile viewport.
- Sign-in flow accepted email, password, and PIN and reached the admin world-selection screen.
- Selecting Little Stars reached the profile selection screen and showed the child profile.
- Selecting the child profile wrote `eduapp_active_profile` and `eduapp_progress_<profileId>` to localStorage.
- Hard reload after authenticated state returned to admin world selection instead of restoring the active child app.
- Hard reload at `/` returned to public landing because the first-visit landing gate does not recognize current `eduapp_` session keys.
- No React console errors were captured in these passes.
- Failed network requests included expected aborted analytics/video requests and one aborted Supabase `child_progress` save during navigation/reload.

## Tier 1: Toddler, Ages 3-4

### Risk Profile

Toddlers are audio-first and motor-imprecise. The largest risk is not conventional form validation; it is overlapping intent: multi-touch, repeated taps before React state commits, and leaving a module while delayed callbacks are still scheduled.

### Vulnerability Report

| Component & Target Age Group | Simulated Kid Behavior | Technical Risk / Code Exception | Criticality | Current Status |
| --- | --- | --- | --- | --- |
| `src/toddler/ToddlerApp.jsx` - `ColoursModule`, ages 3-4 | Taps two color choices in the same frame or rests hand across multiple choices. | Previously used async `feedback` as the lock, allowing same-frame duplicate transitions. | High | Fixed. Verified `lockedRef`, `completedRef`, tracked timeout, and unmount cleanup. |
| `src/toddler/ToddlerApp.jsx` - `ShapesModule`, ages 3-4 | Taps correct answer and Back before the celebration timeout fires. | Previously had raw timeout risk after unmount/navigation. | High | Fixed. Verified tracked timeout and unmount cleanup. |
| `src/toddler/ToddlerApp.jsx` - `NumbersModule`, ages 3-4 | Repeatedly taps answers while audio is still playing. | Interaction race is fixed; audio can still be interrupted by new speech calls. | Medium | Partially fixed. Tap/state lock is fixed; toddler-specific audio queue remains open. |
| `src/toddler/ToddlerApp.jsx` - `AnimalsModule`, ages 3-4 | Chooses final answer, then leaves the module immediately. | Previously final `onDone` could fire from a delayed callback after navigation. | High | Fixed. Verified completion ref and unmount cleanup. |
| `src/hooks/useSpeech.js`, toddler usage | Child taps multiple speaking elements rapidly. | `speak()` cancels the previous audio before playing the next. This prevents overlap, but toddlers can lose critical instructions mid-sentence. | Medium | Add toddler-specific queued speech or suppress non-essential speech while an instruction is active. |
| `src/toddler/ToddlerApp.jsx` - `handleModuleDone`, ages 3-4 | Finishes the same module twice through duplicate delayed callbacks. | Functional progress update mostly protects first treasure, but reward overlay timers can duplicate visually and raw overlay timeout is not consistently guarded. | Medium | Add module completion guard and cleanup reward overlay timer. |

### Toddler Guard Pattern

```jsx
function useSafeDelay() {
  const timersRef = useRef([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  return useCallback((fn, delay) => {
    const id = setTimeout(() => {
      timersRef.current = timersRef.current.filter((timerId) => timerId !== id);
      fn();
    }, delay);

    timersRef.current.push(id);
    return id;
  }, []);
}
```

```jsx
const lockedRef = useRef(false);
const completedRef = useRef(false);
const defer = useSafeDelay();

const handleAnswer = (answer) => {
  if (lockedRef.current || completedRef.current) return;

  lockedRef.current = true;
  const correct = answer === current.answer;
  const nextScore = score + (correct ? 1 : 0);

  setFeedback(correct ? 'correct' : 'wrong');
  speak(correct ? 'Great job!' : 'Try again');

  defer(() => {
    if (q >= questions.length - 1) {
      completedRef.current = true;
      onDone(nextScore);
      return;
    }

    setScore(nextScore);
    setQ((value) => value + 1);
    setFeedback(null);
    lockedRef.current = false;
  }, 1200);
};
```

## Tier 2: Early Learner, Ages 4-6

### Risk Profile

Early learners understand the task but are impatient. They skip instructions, tap Next before feedback finishes, and can leave mid-lesson. The main risk is stale timers and partial activity state being discarded.

### Vulnerability Report

| Component & Target Age Group | Simulated Kid Behavior | Technical Risk / Code Exception | Criticality | Current Status |
| --- | --- | --- | --- | --- |
| `src/modules/StarCatch.jsx`, ages 4-6 | Catches the final star and taps again during celebration. | Previously raw timeouts and async state locks could schedule duplicate final `onAddStars`. | High | Fixed. Verified `completedRef` and tracked timeout cleanup. |
| `src/modules/StoryRoom.jsx`, ages 4-6 | Rapidly taps Next/Previous while story audio and highlighting are active. | Multiple untracked timers update highlighted words, selected story, auto-page, and read state out of order. The highlighted word or audio can belong to an old page. | High | Centralize story timers and cancel them before changing story/page. |
| `src/modules/PiggyBankGame.jsx`, ages 4-6 | Taps correct answer twice or taps Skip immediately after a wrong answer. | Previously `checkSave`, `answer`, and `skipAfterTry` could all schedule `nextRound`. | High | Fixed. Verified `transitioningRef`, `completedRef`, tracked timers, and ref reset on reset. |
| `src/modules/NumberWorld.jsx`, ages 4-6 | Exits mid-question or refreshes during a partially entered answer. | Award flow is guarded, but in-progress answer state is session-only and not persisted. | Low | Persist draft round state only if product wants resumable lessons. |
| `src/modules/SoundPop.jsx`, ages 4-6 | Switches tabs mid-round. | Core timeout crash risk is fixed. Remaining issue is UX-level: abandoning a round loses transient round state. | Low | Optional: save round draft state to progress. |

### PiggyBank Transition Guard

```jsx
const transitioningRef = useRef(false);
const completedRef = useRef(false);
const defer = useSafeDelay();

const finishRound = (passed) => {
  if (transitioningRef.current || completedRef.current) return;

  transitioningRef.current = true;
  setFeedback(passed ? 'correct' : 'next');

  defer(() => {
    if (roundIndex >= rounds.length - 1) {
      completedRef.current = true;
      onComplete?.(score);
      return;
    }

    setRoundIndex((value) => value + 1);
    setFeedback(null);
    transitioningRef.current = false;
  }, 900);
};
```

### StoryRoom Timer Cleanup Pattern

```jsx
const timersRef = useRef([]);

const clearStoryTimers = useCallback(() => {
  timersRef.current.forEach(clearTimeout);
  timersRef.current = [];
}, []);

const deferStory = useCallback((fn, delay) => {
  const id = setTimeout(() => {
    timersRef.current = timersRef.current.filter((timerId) => timerId !== id);
    fn();
  }, delay);

  timersRef.current.push(id);
  return id;
}, []);

useEffect(() => clearStoryTimers, [clearStoryTimers]);

const goToPage = (nextPage) => {
  clearStoryTimers();
  stopSpeaking?.();
  setHighlightedWord(null);
  setPage(nextPage);
};
```

## Tier 3: Primary, Ages 7-9

### Risk Profile

Primary users can intentionally or accidentally exploit timing. They answer quickly, double-click final actions, press Enter repeatedly, and try to maximize rewards. The primary risk is duplicate completion and unsanitized reward calculation.

### Vulnerability Report

| Component & Target Age Group | Simulated Kid Behavior | Technical Risk / Code Exception | Criticality | Current Status |
| --- | --- | --- | --- | --- |
| `src/ks2/KS2App.jsx`, ages 7-9 | Double-clicks the final answer or Finish button. | Previously `handleModuleDone` could run more than once, used stale `firstToday`, and trusted raw scores. | High | Fixed. Verified module/day idempotency, sanitized `correct`/`total`, and fresh `firstToday` inside `update()`. |
| `src/ks2/modules/TimesTablesModule.jsx`, ages 7-9 | Answers at the exact moment the countdown expires. | Previously timer expiry and answer handler could both call `advance`. | High | Fixed. Verified both paths check `lockedRef` and completion is guarded. |
| `src/ks2/modules/FractionsModule.jsx`, ages 7-9 | Double-clicks answer buttons on the final question. | Previously async feedback lock could allow duplicate delayed final `onDone`. | High | Fixed. Verified synchronous lock, completion ref, tracked timeout cleanup. |
| `src/ks2/modules/ReadingModule.jsx`, ages 7-9 | Clicks the final answer twice. | Previously local result and parent `onDone` could race. | Medium | Fixed for duplicate completion. Verified lock/completion refs. Product still should decide whether parent or child owns result display. |
| `src/ks2/modules/GrammarModule.jsx`, ages 7-9 | Rapidly selects answers during feedback. | Previously same async feedback lock issue as other KS2 quiz modules. | High | Fixed. Verified lock/completion refs and tracked timeout cleanup. |
| `src/ks2/modules/WordProblemsModule.jsx`, ages 7-9 | Submits unexpected values or repeated answer taps. | Previously needed consistent synchronous locking. | Medium | Fixed for repeated taps. Reward-side score sanitization is fixed in `KS2App`. |
| `src/ks2/modules/WorldMapModule.jsx`, ages 7-9 | Rapidly clicks map/options. | Previously duplicate answer path. | Medium | Fixed. Verified lock/completion refs and tracked timeout cleanup. |
| `src/ks2/modules/ScienceModule.jsx`, ages 7-9 | Double-clicks correct final answer. | Previously duplicate completion could call parent reward flow more than once. | High | Fixed. Verified button-driven advance guard. |
| `src/ks2/modules/SpiritualityModule.jsx`, ages 7-9 | Double-clicks final answer. | Previously duplicate completion risk. | Medium | Fixed. Verified button-driven advance guard. |
| `src/ks2/modules/SpellingModule.jsx`, ages 7-9 | Presses Enter repeatedly or submits blank input. | Previously blank input was treated as a wrong attempt and repeated Enter could schedule multiple transitions. | Medium | Fixed. Verified empty trimmed input guard, lock, and timeout cleanup. |
| `src/ks2/modules/GamesModule.jsx`, ages 7-9 | Repeatedly clicks Finish or completes a subgame twice. | `TowerBuilderGame` and `WordForgeGame` are fixed, but shared `FinishScreen`, `MemoryGame`, `MazeMunchGame`, and `QuestDashGame` still have unguarded or untracked paths. | High | Partially fixed. Add universal `completeOnce` and tracked timers for remaining subgames. |

### Hardened KS2 Completion Flow

```jsx
const completedModulesRef = useRef(new Set());

const handleModuleDone = (moduleId, rawCorrect = 0, rawTotal = 1) => {
  const today = new Date().toISOString().slice(0, 10);
  const completionKey = `${moduleId}:${today}`;

  if (completedModulesRef.current.has(completionKey)) return;
  completedModulesRef.current.add(completionKey);

  const total = Math.max(1, Number.isFinite(Number(rawTotal)) ? Number(rawTotal) : 1);
  const correct = Math.min(
    total,
    Math.max(0, Number.isFinite(Number(rawCorrect)) ? Number(rawCorrect) : 0)
  );
  const accuracy = Math.round((correct / total) * 100);
  const xpEarned = Math.round((correct / total) * 30);

  update((progress) => {
    const alreadyPlayedToday = progress[moduleId]?.lastPlayedDate === today;
    const treasure = alreadyPlayedToday ? 0 : getKS2Treasure(moduleId);

    return {
      ...progress,
      ks2Xp: (progress.ks2Xp || 0) + xpEarned,
      ks2TreasurePoints: (progress.ks2TreasurePoints || 0) + treasure,
      [moduleId]: {
        ...(progress[moduleId] || {}),
        bestCorrect: Math.max(progress[moduleId]?.bestCorrect || 0, correct),
        bestAccuracy: Math.max(progress[moduleId]?.bestAccuracy || 0, accuracy),
        lastPlayedDate: today,
      },
    };
  });
};
```

### Shared KS2 Answer Guard

```jsx
const lockedRef = useRef(false);
const completedRef = useRef(false);
const defer = useSafeDelay();

const handleAnswer = (answer) => {
  if (lockedRef.current || completedRef.current) return;
  lockedRef.current = true;

  const correct = answer === current.answer;
  const nextScore = score + (correct ? 1 : 0);

  setFeedback(correct ? 'correct' : 'wrong');

  defer(() => {
    if (q >= questions.length - 1) {
      completedRef.current = true;
      onDone(nextScore, questions.length);
      return;
    }

    setScore(nextScore);
    setQ((value) => value + 1);
    setFeedback(null);
    lockedRef.current = false;
  }, 700);
};
```

### Spelling Submit Guard

```jsx
const handleSubmit = () => {
  if (lockedRef.current || completedRef.current) return;

  const value = input.trim().toLowerCase();
  if (!value) {
    setInputError('Type your answer first.');
    return;
  }

  lockedRef.current = true;
  setInputError(null);

  const correct = value === words[q].word.toLowerCase();
  const nextScore = score + (correct ? 1 : 0);

  setFeedback(correct ? 'correct' : 'wrong');

  defer(() => {
    if (q >= words.length - 1) {
      completedRef.current = true;
      setResult({ correct: nextScore, total: words.length });
      return;
    }

    setScore(nextScore);
    setQ((value) => value + 1);
    setInput('');
    setFeedback(null);
    lockedRef.current = false;
  }, 900);
};
```

## Data Loss and Disconnection Risks

| User Action | Current Behavior | Risk | Criticality | Recommendation |
| --- | --- | --- | --- | --- |
| Refresh during a module | App-level progress persists, but active round state usually does not. | Child loses in-progress question/round. | Low to Medium | Persist draft state only for longer modules such as stories, spelling, and multi-question quizzes. |
| Close app immediately after earning progress | LocalStorage update should survive; pending cloud sync now flushes on `pagehide`/`beforeunload`. | Lower residual risk remains on unsupported browser events or failed network. | Low | Keep retry behavior and monitor failed sync telemetry if added. |
| Swipe back or browser back during delayed feedback | Most patched modules clear delayed callbacks; `StoryRoom` and parts of `GamesModule` still have raw delayed paths. | Stale highlight/page state or duplicate finish in remaining unguarded paths. | Medium to High | Finish clearable timers and completion guards in remaining modules. |
| Switch age tracks rapidly | Shell-level navigation is improved. | Module-local timers can still fire after navigation. | Medium | Module-level unmount cleanup everywhere. |
| Submit malformed math/game values | `KS2App.handleModuleDone` now sanitizes `correct` and `total`. | Individual game-local scores can still carry stale or unexpected values before parent sanitization. | Low to Medium | Keep parent sanitization and add local guards for remaining arcade finish paths. |

## Responsive and Child UX Risks

| Area | Current Status | Remaining Risk | Recommendation |
| --- | --- | --- | --- |
| Dashboard child names | Hardened | Low | Keep `.dashboard-name` clamp and word-break rules. |
| Module cards/badges | Hardened | Low | Keep overflow protection. |
| SkillHint modal | Hardened | Low | Keep safe-area padding and scrollable panel. |
| Toddler answer grids | Needs review after interaction lock changes | Buttons may still be too close for low motor control on 320 px screens. | Add minimum touch target sizing and disable pointer events during feedback. |
| KS2 result/finish buttons | Partially hardened | Main quiz modules are guarded; shared `GamesModule` `FinishScreen` still needs click-once protection. | Disable finish buttons after first click and use `completedRef`. |

## Priority Fix Order

1. Clear untracked timers in `src/modules/StoryRoom.jsx`.
2. Finish universal completion guards in `src/ks2/modules/GamesModule.jsx`, especially `FinishScreen`, `MemoryGame`, `MazeMunchGame`, and `QuestDashGame`.
3. Add a toddler audio policy: queue critical prompts or lock answers while essential audio plays.
4. Add visibility pause/resume behavior for timed games outside the already-handled arcade slice.
5. Decide whether longer lessons should persist draft state across refresh/module exit.
6. Resolve current production CSS warning by moving `@import` statements before other CSS rules in `src/index.css`.

## Verification Status

Latest verification after the second fix pass:

- `npm test`: passed, 7 of 7 tests.
- `npm run build`: passed.
- Remaining build warning:
  - Vite warns that `@import` statements in CSS must precede other statements in `src/index.css`.
- Previously noted main chunk and Fredoka unresolved asset warnings did not appear in this build.

## Recommended Acceptance Criteria

- No module can call `onDone`, `onComplete`, or `onAddStars` more than once per round/session completion. Still open for remaining `GamesModule` finish paths.
- Every delayed callback in an interactive module is cleared on unmount. Still open for `StoryRoom` and parts of `GamesModule`.
- Answer handlers use a synchronous ref lock before setting React state.
- Finish buttons are disabled after first activation.
- Reward inputs are clamped and sanitized.
- Timed games pause or safely reconcile when the document becomes hidden.
- Toddler modules do not allow choices during essential instruction or feedback audio.
- Refreshing immediately after progress cannot regress local progress or overwrite newer cloud progress.
