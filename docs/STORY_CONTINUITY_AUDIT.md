# Bloom Juniors — Story Continuity Audit

Investigation only. This document answers a question deliberately kept separate from technical
wiring correctness: does Bloom Juniors *feel* like one connected adventure with Yaagvi,
treasures, friendship, worlds, and Dream Projects causally linked to what a child does — or does
it feel like a collection of separate learning games behind a shared menu with reward icons
bolted on? Both are assessed independently; sound wiring is confirmed first, then judged
separately for narrative coherence.

---

## Verdict, up front

**Mostly one connected adventure, with specific, code-verified seams that break the illusion.**
The reward-mechanism engineering is unusually disciplined for a project this size — nearly
every reward system derives from the same underlying `getCompanionLearningPoints`/`totalStars`
well, and Dream Project explicitly states its causal chain in on-screen copy rather than leaving
it for a child to infer. That is real narrative engineering, not just shared data plumbing. The
seams that exist are specific and fixable, not systemic.

---

## System-by-system rating

| System | Rating | Evidence |
|---|---|---|
| **Treasure** | **Strong** | `TreasureCollection.jsx`'s chest reveal has genuine anticipation (latch glow before opening) and per-item personality-driven motion (`TREASURE_MOTIONS`, not one generic animation for every reward). The Living Treasure Room (`RoomStage`) makes every treasure a persistent, draggable, tappable, reactive object with its own interaction memory (`interactWithLivingTreasure`). Treasures actively alter gameplay via `treasureLoadout.js` powers (clearing wrong answers, glowing right ones) — not just decoration. |
| **Companion / Friendship** | **Partial** | The points/leveling mechanism (`getCompanionLearningPoints`, `companionBond.js:26-40`) is genuinely sound and shared identically across all three age bands via each band's single `handleModuleDone`/`handleAddStars` chokepoint — confirmed, not assumed. But the *identity* of "the companion" is split: Yaagvi is hard-coded as host/deliverer on some screens (Quiz Show, Adventure Home, High Five) while `getActiveCompanion()` treats "the companion" as whichever buddy-slot treasure is equipped elsewhere. And there is no level-up celebration anywhere in the codebase for the 5-stage bond progression (`COMPANION_BOND_STAGES`) — the single biggest narrative milestone in the game is currently a silent bar-fill. |
| **Dream Project** | **Strong** | The clearest, most explicit "my play built this" causal link in the app. `getDreamProjectState` (`dreamProject.js:69-95`) computes available build bundles directly from the same friendship-points well as Companion Bond, and the UI states this in copy: "Earn X more friendship points toward another bundle" (`DreamProject.jsx:144`) — the chain is *told*, not just *coded*. Each age band's build scene is bespoke (Treehouse/Skyship/Headquarters), not a shared shell reused with a different skin. |
| **Bloom Quiz Show** | **Partial** | Mechanically fully integrated into the same reward economy as every learning module (confirmed via each band's `handleModuleDone`), but its presentation regresses to a static-image "host" instead of the pose-based `YaagviCharacter` used on the app's best-received recent feature (Parent High Five), and it never acknowledges a child's `played` count despite already receiving it as a prop — every visit is scripted as a first encounter. |
| **Parent Zone / High Five** | **Strong**, with one gap | This week's High-Five enhancement (anticipation beat, `celebrate`-pose mascot swap, collection flourish) and the Treasure Chest wobble are genuinely well-built and reuse the app's best animation language. The gap: `ParentZone.jsx`'s Stats/Progress tabs are silent about Companion Bond, Dream Project, and Treasure Room — only the default Weekly Story tab tells a parent that part of the story at all. |

---

## Where the story connection is Strong

- **Dream Project's stated causal chain** — the app tells the child, in copy, exactly why their
  play matters ("Earn X more friendship points"), not just codes it invisibly.
- **The shared friendship-points well** — `totalStars` (or the per-band equivalent) feeds
  Companion Bond level, Dream Project bundle unlocks, and (indirectly) treasure-quest XP through
  one small set of well-audited functions, confirmed identical in mechanism across all three
  age bands. This is the backbone that makes "everything is connected" true at the data layer.
- **Treasure's persistent presence** — earned items don't disappear into an inventory list; they
  live in the Living Treasure Room with memory of past interactions and can materially change
  gameplay via equipped powers.
- **Yaagvi as a consistent proper name** — used consistently everywhere in the shared layer
  (Adventure Home, Treasure Room, Wonder World, Dream Project, Quiz Show, High Five, Parent
  Story) — a child never encounters a differently-named mascot.
- **"A friend who remembers you"** — Wonder World's discovery-tap reactions are explicitly
  labeled this way and track a persistent `interactionCount` per discovery, surfaced back to the
  child ("Played 3×") — a genuine cross-session memory mechanic, not just a claim.

## Where the story connection is Partial

- **Companion identity split** (see table above) — Yaagvi is simultaneously "the fixed host/
  courier character" and "just one possible companion option," depending on which screen a
  child is on, with no in-story explanation reconciling the two.
- **Bloom Quiz Show's presentation** — mechanically part of the same world, but visually and
  narratively (no memory of past visits, static-image host) it feels bolted-on relative to the
  polish of Treasure/Dream Project.
- **Parent-facing narrative reach** — a parent who lands on Stats/Progress rather than the
  default Story tab sees none of the shared-world systems (Companion, Dream Project, Treasure)
  that make up the child's actual in-app narrative.

## Where the story connection is Weak or Missing

- **Mascot rendering fragmentation is the single biggest tell that this was built screen-by-
  screen rather than as one system from the start.** Three non-interoperating systems coexist:
  `YaagviCharacter.jsx`'s built pose sprites (used in only 3 files), a static image+webm pair
  (used in 6+ shared screens), and an apparently-orphaned separate 5-character system
  (`BuddyCompanion.jsx`, not imported anywhere else in the codebase). A child moving Adventure
  Home → Treasure Room → Wonder World → Quiz Show → a parent's High Five sees the *same
  character* rendered three different ways with zero in-story explanation for the change. This
  is the clearest concrete instance of "separate games behind a shared menu," even though the
  underlying reward math is genuinely unified.
- **No companion level-up celebration** — a real progression system exists (5 named stages)
  but crossing a stage boundary produces no distinguishable moment for the child to notice,
  let alone celebrate. This is a missing payoff for what should be one of the highest-stakes
  narrative beats in the game.
- **Super Kids location naming** — 10 of 12 adventure-map locations are called one thing on the
  map and a *different* thing on arrival and in the module header (two locations are three-way
  mismatches). A child who taps "Number Castle" is welcomed to "Multiplier Mine" and plays
  inside a screen headed "Multiplier Mine" — "Number Castle" never reappears. This is a direct,
  code-confirmed break in "does the child understand where they are," independent of any
  animation quality question. Full table:

| Location id | Map tile name (`MAP_LOCATIONS`) | Arrival/header name |
|---|---|---|
| timestables | Number Castle 🏰 | Multiplier Mine ✖️ |
| fractions | Crystal Cave 💎 | Fraction Falls 🍕 |
| wordproblems | Puzzle Tower 🧩 | Problem Pass 🧭 |
| piggybank | Money Bank 🐷 | Coin Cove 🐷 |
| reading | Book Kingdom 📖 | Story Ruins 📚 |
| spelling | Spell Academy ✨ | Word Woods ✍️ |
| grammar | Grammar Grove 🌳 | Grammar Grove 📝 (name matches; emoji doesn't) |
| science | Science Lab 🔬 | Discovery Springs (arrival) / Wonder Springs (header) — 3-way |
| worldmap | World Globe 🌍 | Atlas Lookout 🌍 (emoji matches; name doesn't) |
| spirituality | Temple Isle 🕉️ | Wisdom Temple 🕊️ |
| games | Game Arena 🎮 | Treasure Arcade 🎮 (emoji matches; name doesn't) |
| exercise | Training Zone 🏃 | Training Camp (arrival) / Movement Meadow (header) — 3-way |

- **Tiny Stars' quizshow tonal break** — the "big quiz"/finale module renders a dark neon
  game-show stage sharply distinct from the bright, warm world every other Tiny Stars module
  lives in, with no narrative bridge explaining why this one place looks and feels different.

---

## Cross-checks performed (wiring confirmed sound, so these are genuinely narrative findings, not code bugs)

To keep this document honest about the "don't assume wiring implies story" instruction, these
specific mechanisms were traced end-to-end and confirmed **not** to be the source of the
Partial/Weak findings above — the narrative gaps exist despite correct underlying code:

- **Duplicate-reward guards** are robust across the whole reward economy (daily treasure chest,
  Wonder World discoveries, companion power charges, treasure XP/quest advancement, and cloud-
  merge logic all use idempotent keys/`Set`/`Map` merges, not naive concatenation).
- **Companion/friendship-point consistency** across bands is confirmed sound — all three shells
  write to the same canonical `totalStars` field from one centralized per-band handler, so the
  companion-bond pathway does not suffer the kind of band-inconsistency previously found (and
  fixed) for raw star counts.
- **Continue / My Favourite / Surprise Me** are provably constrained by construction to a real,
  reachable, age-appropriate module catalogue (`ENDLESS_MODULES[ageGroup]`) — no branch can
  recommend an unroutable or wrong-band module.
- **Treasure visible purpose** and **Dream Project visible progress** are both confirmed
  correctly wired (see Strong ratings above) — these are not narrative gaps, they're genuine
  strengths worth protecting in any future redesign.

This means the fixes recommended in `PRIORITISED_EXPERIENCE_PLAN.md` for the Weak/Missing items
above are almost entirely **presentation-layer** work (naming consistency, mascot rendering
standardization, adding one missing celebration moment) rather than logic rework — the
underlying systems these gaps sit on top of do not need to change.
