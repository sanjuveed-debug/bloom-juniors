# Bloom Juniors game and flow audit — July 2026

## Scope

Audited the child-facing route, implementation and state transitions for 44 playable experiences across ages 3–9: launch, instruction, answer interaction, audio ownership, correct/wrong feedback, completion, replay, persistence and return navigation.

## Inventory checked

- Ages 3–4: Colours, Shapes, Numbers, Animals, Fruits, My Body, Alphabet.
- Ages 4–6: Sound Pop, Number World, Star Catch, Story Room, World Explorer, Wonder Lab, Planet World, My Body, Shape World, Coin Shop, Puzzle Quest, Da Vinci Studio, Fun Exercise, Sacred Stories, Piggy Bank, Game Arcade.
- Little Stars arcade: Magic Memory, Balloon Burst, Fruit Slice Frenzy, Inventor Blocks, Shadow Match, Rocket Count.
- Ages 7–9: Times Tables, Fractions, Word Problems, Piggy Bank, Reading, Spelling, Grammar, Science Quest, World Map, World Faiths, Game Zone, Exercise.
- Super Kids Game Zone: Quest Dash, Tower Builder, Word Forge, Memory, Maze Munch.

## Fixed during this audit

1. Removed child-flow background speech saying “Show this to someone you love.”
2. Removed the random post-game share interruption. Sharing is now visual and parent initiated.
3. Living Adventure missions now enter the selected game directly instead of showing a second arrival confirmation.
4. Living Adventure is the single primary 4–6 journey while its five chapters are active; Skyship and the legacy daily path no longer compete above it.
5. Azure failure remains safely isolated behind browser fallback; an invalid Azure key is the outstanding infrastructure cause.
6. All games retain a user-triggered “hear this screen” control.

## Cross-product findings

### P0 — resolved

- Competing speech from a parent-sharing component.
- Random sharing modal in the child completion path.
- Double start action when launching a Living Adventure chapter.

### P1 — next implementation pass

- Fixed question banks remain in factual/language games; session rotation is improved but banks still need larger verified content sets.
- Maths generators exist in the adaptive engine but are not yet used by every maths activity.
- Several games expose both their own Back control and the persistent map control. Standardise to one navigation hierarchy.
- Completion experiences vary widely: some return automatically, some require a button, and some remain in results. Standardise “celebrate → show learning → next choice.”
- Recent-question signatures are stored centrally, but individual modules must submit signatures to fully avoid recently seen content.

### P2 — visual/interaction pass

- Emoji-only teaching art is still common in toddler and knowledge modules. Replace the highest-frequency screens with coherent 3D/illustrated scene assets.
- Some older-child quizzes still use three static answer cards for every question type. Add sorting, building, dragging and evidence-selection interactions.
- Ensure all animated arcade interactions expose reduced-motion alternatives and keyboard/touch equivalents.
- Test landscape tablets at 1024×600 and small phones at 320×568; several legacy game layouts were designed primarily for portrait mobile.

## Required acceptance test for every game

1. Launch from its map and from Living Adventure.
2. Instructions can be heard after one user gesture.
3. No hidden screen or parent component speaks.
4. Correct answer gives immediate visual and audio feedback.
5. Wrong answer teaches without blocking progress or shaming.
6. Completion writes one session only and updates mastery once.
7. Replay produces a different deck or generated values.
8. Map return does not lose progress.
9. No horizontal overflow at 320 px, 768 px or 1366 px widths.
10. Reduced-motion mode remains usable.

## Product metric

The primary success metric should be voluntary next-day return after a completed Living Adventure chapter. Secondary metrics: mission completion, independent accuracy, hint use, repeated-question rate and child-selected replay.
