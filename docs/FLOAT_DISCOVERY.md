# Discover with Bumi: Will it float?

Entry: Little Stars > Explore > Will it float? Guest: /play/float.
Four illustrated experiments: cork, pebble, clay ball, same clay as a hollow boat.
Each follows prediction, drag/tap test, animated observation, spoken explanation.
No prediction scoring, timers for the child, streaks or compulsory continuation.
A first exploration record preserves predictions; replay does not duplicate it.
Guest progress is separate local storage. Profile drafts use existing profile
storage and timestamp-based cloud merge; stale drafts can resume on the next visit.
This is a scripted model, not a general physics simulator or a mastery assessment.

Scientific basis: TeachEngineering, Buoyant Boats, accessed 2026-09-08:
https://www.teachengineering.org/activities/duk_boat_mary_act
The background resource describes the same clay shaped as a ball versus hollow
boat, and displaced water. Original child-facing wording is simplified; no claim
that this source validates Bloom for ages 4-6. Clay shape must keep water out;
weight alone does not decide floating. No clinical/health lesson is included.

Verification: tests/float-discovery.test.js and scripts/verify-float-discovery.mjs.
Browser test blocks external APIs and observes speech calls; real Azure audio is
verified separately by scripts/verify-picnic-audio.mjs. No child recording needed.
