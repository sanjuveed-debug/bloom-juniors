# Change a shadow with Bumi

Three narrated, unscored experiments for ages 4–6: predict, move a torch closer,
move it farther away, and switch it off. The card and wall stay fixed. A range
input supports touch and keyboard, with a large one-tap alternative for each
experiment. Completion opens an optional free exploration of the same model.
Finishing and replay are explicit. Automatic narration does not restart on every
slider movement. The existing speech owner stops narration on exit.

The SVG is a side view, using similar triangles for a point source at x=100–360,
an opaque card at x=480 with half-height 28, and a wall at x=800. Shadow half-height
is 28 × (800 − lightX) / (480 − lightX). It deliberately does not model penumbra,
multiple lights, or torch beam optics. The off scene removes both the beam and
the shadow; it does not leave an isolated dark silhouette on a lit wall.

Science background: [Science Buddies: Change the Size of a Shadow](https://www.sciencebuddies.org/stem-activities/change-the-size-of-a-shadow)
and [Making Shadow Puppets](https://www.sciencebuddies.org/stem-activities/shadow-puppets).
These support the relative-distance experiment and the family torch activity.
The lesson's model is an illustration, not a measurement tool.

Entry: Little Stars → Explore → Change a shadow. The water discovery finish also
offers it. Guest URL: /play/shadow. Guest records use bloom_guest_shadow_v1 and
stay separate from profiles. Profile drafts normalize shadowDiscovery; cloud
merge keeps the most recently updated draft and deduplicates the first completed
session by shadow-discovery-first. Parents see original predictions and observed
model outcomes in Learning at a glance. No mastery or independent-work claims.
