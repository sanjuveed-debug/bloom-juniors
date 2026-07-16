# Bloom Juniors Consolidation Roadmap

Last updated: 14 July 2026

## Product goal

Make Bloom Juniors feel like one memorable daily adventure rather than a collection of separate games, maps, rewards, gardens, stories, and dashboards.

The child-facing promise is:

> Complete two short learning adventures, open a real treasure, and use it in Yaagvi's world.

## Completed foundation

- Infinite/adaptive question generation and per-child learning history.
- Treasure rewards, Treasure Room, Mystery Egg, and Secret World growth loop.
- Treasure-map dashboards for the three age bands.
- One Azure-only speech controller shared across every module.
- Speech cancellation on navigation so an old page cannot continue talking.
- Robotic browser voice fallback removed.
- Friendly non-blocking message when Azure is unavailable.
- Production deployment completed on 14 July 2026.

External configuration still required: Cloudflare's encrypted `AZURE_TTS_KEY` is currently rejected by Azure with HTTP 401. Replace the key and confirm its exact Azure region, then redeploy and test live MP3 audio.

## How the Claude consolidation input is used

The file `Bloom Juniors — Consolidation Plan.html` is treated as product research and a decision brief, not as code or a design to copy literally.

Its central diagnosis is accepted: Bloom currently exposes too many competing loops. The implementation translates that diagnosis into these rules:

1. Every child dashboard has one obvious primary action.
2. Today's two adventures, treasure progress, and living story are one connected journey.
3. Existing games remain available, but secondary choices move behind an `Explore more` control.
4. Treasure Room, Mystery Egg, Secret World, trophies, stars, and streaks must support one reward economy.
5. The three age bands share the same mental model while keeping age-appropriate presentation and difficulty.
6. Existing child progress and rewards are preserved during consolidation.
7. Features are removed only after usage and flow testing proves they are redundant.

## Completed: One Daily Journey dashboard

Released to production on 14 July 2026 for ages 3–4, 5–6, and 7–9.

Build one clear dashboard structure for ages 3–4, 5–6, and 7–9:

1. Compact child header: name, current streak, and treasure count.
2. `Continue today's adventure` hero with one large play button.
3. Two-step daily journey showing completed, current, and next activity.
4. Treasure chest progress attached directly to those two activities.
5. Living Adventure chapter shown as the reason for completing today's journey.
6. Treasure Room and Secret World shown as the reward destination after completion.
7. All other modules placed behind `Explore more games` instead of competing above the fold.
8. Parent controls kept outside the child's primary journey.

### Acceptance criteria

- A child can identify what to tap next without reading multiple cards.
- Only one primary call-to-action appears above the fold.
- Completing an activity immediately updates the same journey and treasure progress.
- After two activities, the treasure opens and clearly enters the child's collection/world.
- A child who finishes today's journey can still play adaptive practice and arcade games.
- The layout works for all three age bands and on common tablet widths.
- Existing saved progress, gardens, treasures, streaks, and adaptive history remain intact.

## Later consolidation phases

1. **Next:** Merge Treasure Room, Secret World, and Trophy Wall into one evolving personal world.
2. Replace competing streak counters with one meaningful return streak.
3. Add a visible curriculum spine so parents understand learning progression.
4. Generate stories from mastered sounds and current learning needs.
5. Add parent insight summaries without adding child-dashboard clutter.

## Completed pilot: Interactive Yaagvi in Number World

Released on 14 July 2026 as the reusable animation pattern for learning games.

- Yaagvi waves when a game begins, thinks after a first mistake, points to a clue after repeated difficulty, claps or celebrates correct answers, and dances at completion.
- An inactivity nudge appears visually after a child pauses; it does not trigger unsolicited background audio.
- The companion lives in the learning flow instead of floating over answer controls.
- Duplicate fixed feedback was removed on mobile so every answer remains tappable.
- The old Number World Buddy auto-speech path was removed.
- Motion respects the device's reduced-motion accessibility setting.
- The same reaction API can now be introduced module-by-module after play testing.

## Completed rollout: Sound Pop and Shape World

Released on 15 July 2026.

- Sound Pop now uses one Yaagvi companion instead of the old Buddy plus a second overlapping mascot.
- Yaagvi listens, points, thinks, claps, celebrates streaks, and dances across both phonics modes.
- Fixed feedback overlays were removed so phonics answer choices remain unobstructed on phones.
- Shape World now includes the same reactions in Learn, Quiz, and Tower modes.
- Tower selections physically build an animated, stacked structure before the child checks the answer.
- Successful module endings explicitly show that the win powered today’s treasure trail and return to the treasure map.

## Delivery method

For each phase:

1. Audit existing components and data paths.
2. Implement the smallest complete child journey across all age bands.
3. Add unit tests for progression and reward persistence.
4. Run logged-in browser tests using representative profiles for ages 3–4, 5–6, and 7–9.
5. Build and deploy to Cloudflare Pages.
6. Verify the custom domain, saved progress, sound, and mobile/tablet layout.
