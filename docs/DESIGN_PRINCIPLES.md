# Bloom interface principles

Adopted September 11, 2026 after reviewing Apple's design principles and the
community apple-design guides by Emil Kowalski and Dickwu. These are web design
choices for Bloom, not a claim of Apple certification or native HIG compliance.
The Bloom Learning Constitution remains the product authority.

- Keep Bumi, warm colours, spoken exploration and concrete learning scenes.
- Let an activity's picture show what the child will do. Avoid repeated generic
  scenery as the only way to distinguish different activities.
- Keep Adventures, Hear again and the automatic voice toggle in the same header
  order. Use LessonHeader in the connected picnic and discovery experiences.
- Give controls immediate pressed feedback, activate on release, and preserve
  keyboard focus. Shared header targets are at least 48 CSS pixels.
- Preserve the grab position and displayed size during dragging. data-drag-art
  identifies the visual object within a button containing other text. Keep
  cancellation and tap/keyboard alternatives; do not add momentum that makes
  precise learning tasks harder.
- Use a brief fade for screen changes. Reserve physical motion for the object
  being explored and purposeful Bumi reactions. Keep prediction gates and
  duplicate-submit protection.
- Prefer readable solid surfaces. Support reduced motion, increased contrast
  and reduced transparency without relying on effects for meaning.
- Use scalable instructional type and check compact screens and enlarged text.
  Activity-description text must meet WCAG's 4.5:1 contrast requirement.

Implemented first in Little Stars Explore and the plate, basket/sharing, water
and shadow lessons. This is not a complete accessibility audit of all modules.

References:
- https://developer.apple.com/design/human-interface-guidelines/design-principles
- https://developer.apple.com/videos/play/wwdc2018/803/
- https://github.com/emilkowalski/skills/tree/HEAD/skills/apple-design
- https://github.com/dickwu/apple-design-skill
- https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum
- https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation

Verification: scripts/verify-design-polish.mjs checks unique artwork, compact
and desktop layouts, 200% root text sizing, description contrast, keyboard focus,
header target sizes, and off-centre drag anchoring/cancellation. Existing lesson
and touch-drag scripts verify functional regressions.
