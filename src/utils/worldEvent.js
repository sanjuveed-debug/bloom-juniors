import { formatLocalDate } from './date.js'

// One playful "world event" per day (date-seeded): a themed bonus mission
// pointing at one study module, worth bonus stars on first completion.
const EVENTS = [
  { id: 'dragon',  emoji: '🐉', title: 'Feed the Dragon!',       desc: 'Drago only eats sounds today — play Sound Pop to feed him!',        moduleId: 'phonics', moduleLabel: 'Sound Pop' },
  { id: 'pirate',  emoji: '🏴‍☠️', title: 'Pirate Treasure Day!',   desc: 'Captain Yaagvi lost her gold — count it back in Number World!',    moduleId: 'math',    moduleLabel: 'Number World' },
  { id: 'unicorn', emoji: '🦄', title: 'Unicorn Story Day!',     desc: 'Luna the unicorn is sleepy — read her a story in Story Room!',     moduleId: 'story',   moduleLabel: 'Story Room' },
  { id: 'robot',   emoji: '🤖', title: 'Robot Repair Day!',      desc: 'Beep-Boop lost his shapes — fix him in Shape World!',              moduleId: 'shapes',  moduleLabel: 'Shape World' },
  { id: 'wizard',  emoji: '🧙', title: 'Wizard Word Day!',       desc: 'The wizard forgot his magic words — catch them in Star Catch!',    moduleId: 'tricky',  moduleLabel: 'Star Catch' },
  { id: 'space',   emoji: '👾', title: 'Alien Puzzle Day!',      desc: 'Zorp is stuck on a puzzle — help him out in Puzzle Quest!',        moduleId: 'logic',   moduleLabel: 'Puzzle Quest' },
]

export const WORLD_EVENT_BONUS = 5

// fullAccess=false restricts events to the free-forever study modules
export function getTodayWorldEvent(fullAccess = true) {
  const pool = fullAccess ? EVENTS : EVENTS.filter(e => ['phonics', 'math', 'story'].includes(e.moduleId))
  const dateStr = formatLocalDate()
  let seed = dateStr.split('').reduce((a, c) => (a * 33 + c.charCodeAt(0)) >>> 0, 5)
  return pool[seed % pool.length]
}

function bonusKey(profileId) {
  return `eduapp_event_bonus_${profileId || 'anon'}_${formatLocalDate()}`
}

export function isEventBonusCollected(profileId) {
  try { return Boolean(localStorage.getItem(bonusKey(profileId))) } catch { return false }
}

export function markEventBonusCollected(profileId) {
  try { localStorage.setItem(bonusKey(profileId), '1') } catch {}
}
