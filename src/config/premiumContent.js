// Master switch: while false (beta), ALL content is free for everyone and no
// gating happens anywhere. Flip to true to enable Premium gating app-wide.
export const PREMIUM_GATING_ENABLED = false

// Which modules require Bloom Premium (AED 19/month).
// Free-forever set matches the landing-page FAQ promise:
//   Sound Pop (phonics), Number World (math), Story Room (story),
//   Da Vinci Studio (davinci), Fun Exercise (exercise) — plus the whole
//   toddler app and the Game Arcade reward loop.
// Classroom/school accounts bypass premium entirely (school licence).

export const PREMIUM_FS2_MODULES = new Set([
  'tricky',    // Star Catch
  'shapes',    // Shape World
  'logic',     // Puzzle Quest
  'shop',      // Coin Shop
  'piggybank', // Piggy Bank
  'anatomy',   // Body Parts
  'science',   // Curious Science
  'worldgk',   // World Explorer
  'planets',   // Planet World
  'sacred',    // Sacred Stories
])

export const PREMIUM_KS2_MODULES = new Set([
  'fractions',
  'wordproblems',
  'piggybank',
  'grammar',
  'science',
  'worldmap',
  'spirituality',
])

// Study modules a free (non-premium) account can be assigned on the daily path
export const FREE_STUDY_MODULE_IDS = new Set(['phonics', 'math', 'story'])

export function isPremiumFS2Module(id) {
  return PREMIUM_FS2_MODULES.has(id)
}

export function isPremiumKS2Module(id) {
  return PREMIUM_KS2_MODULES.has(id)
}
