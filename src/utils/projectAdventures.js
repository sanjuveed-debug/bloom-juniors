import { normaliseTreasureCollection } from './treasureRewards.js'

export const PROJECT_ADVENTURE_VERSION = 1
export const PROJECT_ADVENTURE_CLUES = 3

export const PROJECT_ADVENTURES = {
  toddler: [
    { id: 'bubble-picnic', title: 'Bubble Picnic Meadow', summary: 'Find three picnic surprises before the bubbles float away.', icon: '🫧', colors: ['#38bdf8', '#f9a8d4'], clues: [['blanket', 'Picnic blanket', '🧺'], ['berry', 'Rainbow berry', '🍓'], ['cup', 'Tiny tea cup', '🫖']], souvenir: { id: 'bubble-picnic-badge', name: 'Bubble Picnic Badge', emoji: '🫧', message: 'A bubbly keepsake from your Treehouse adventure.' } },
    { id: 'cloud-sheep', title: 'Cloud Sheep Meadow', summary: 'Help three fluffy cloud sheep find their way home.', icon: '🐑', colors: ['#7dd3fc', '#c4b5fd'], clues: [['bell', 'Cloud bell', '🔔'], ['wool', 'Soft cloud curl', '☁️'], ['gate', 'Rainbow gate', '🌈']], souvenir: { id: 'cloud-bell', name: 'Little Cloud Bell', emoji: '🔔', message: 'It rings whenever a cloud friend visits.' } },
    { id: 'moonlight-pond', title: 'Moonlight Puddle', summary: 'Wake the sleepy pond by finding three glowing friends.', icon: '🌙', colors: ['#6366f1', '#a78bfa'], clues: [['frog', 'Moon frog', '🐸'], ['pebble', 'Glowing pebble', '🪨'], ['lily', 'Star lily', '🪷']], souvenir: { id: 'moon-pebble', name: 'Moonlight Pebble', emoji: '🌙', message: 'A soft moon glow for your Treasure Room.' } },
    { id: 'rainbow-nest', title: 'Rainbow Bird Nest', summary: 'Collect three colourful things for a baby bird’s nest.', icon: '🐣', colors: ['#fb7185', '#facc15'], clues: [['feather', 'Rainbow feather', '🪶'], ['twig', 'Curly twig', '🌿'], ['star', 'Warm little star', '⭐']], souvenir: { id: 'rainbow-feather', name: 'Rainbow Nest Feather', emoji: '🪶', message: 'A colourful feather from a very happy nest.' } },
    { id: 'giggle-grove', title: 'Giggle Grove', summary: 'Find the three things making the trees laugh.', icon: '😄', colors: ['#4ade80', '#facc15'], clues: [['leaf', 'Tickly leaf', '🍃'], ['acorn', 'Bouncy acorn', '🌰'], ['bug', 'Jolly ladybird', '🐞']], souvenir: { id: 'laughing-leaf', name: 'Laughing Leaf', emoji: '🍃', message: 'This leaf remembers your happiest giggle.' } },
    { id: 'teddy-tea', title: 'Teddy Tea Garden', summary: 'Set the table by finding three missing tea-party pieces.', icon: '🧸', colors: ['#fb923c', '#f9a8d4'], clues: [['spoon', 'Tiny spoon', '🥄'], ['cake', 'Berry cake', '🧁'], ['teapot', 'Magic teapot', '🫖']], souvenir: { id: 'teddy-teacup', name: 'Teddy’s Tiny Teacup', emoji: '🫖', message: 'A cosy cup from the Treehouse tea party.' } },
  ],
  early: [
    { id: 'moonberry-island', title: 'Moonberry Island', summary: 'Land the Skyship and find three lights for the moonberry lantern.', icon: '🌙', colors: ['#6d28d9', '#ec4899'], clues: [['berry', 'Moonberry', '🫐'], ['firefly', 'Silver firefly', '✨'], ['wick', 'Rainbow wick', '🧵']], souvenir: { id: 'moonberry-lantern', name: 'Moonberry Lantern', emoji: '🏮', message: 'A glowing lantern found beyond the moon clouds.' } },
    { id: 'rainbow-cloud-port', title: 'Rainbow Cloud Port', summary: 'Collect three travel stamps before the Skyship takes off.', icon: '🌈', colors: ['#0ea5e9', '#f472b6'], clues: [['stamp', 'Cloud stamp', '💮'], ['ticket', 'Sky ticket', '🎫'], ['flag', 'Rainbow flag', '🚩']], souvenir: { id: 'cloud-passport', name: 'Cloud Explorer Passport', emoji: '🎫', message: 'Proof that your Skyship reached Rainbow Cloud Port.' } },
    { id: 'star-reef', title: 'Whispering Star Reef', summary: 'Listen closely and find three treasures hiding in the sky reef.', icon: '🐚', colors: ['#0891b2', '#8b5cf6'], clues: [['shell', 'Singing shell', '🐚'], ['pearl', 'Sky pearl', '🔵'], ['starfish', 'Flying starfish', '⭐']], souvenir: { id: 'singing-shell', name: 'Whispering Sky Shell', emoji: '🐚', message: 'Hold it close and imagine the stars singing.' } },
    { id: 'clockwork-jungle', title: 'Clockwork Jungle', summary: 'Repair a friendly jungle machine by finding three lost parts.', icon: '⚙️', colors: ['#059669', '#f59e0b'], clues: [['gear', 'Golden gear', '⚙️'], ['spring', 'Bouncy spring', '➰'], ['key', 'Wind-up key', '🗝️']], souvenir: { id: 'golden-gear', name: 'Friendly Golden Gear', emoji: '⚙️', message: 'A tiny working part from the Clockwork Jungle.' } },
    { id: 'candy-comet', title: 'Candy Comet Crossing', summary: 'Catch three sparkling comet crumbs without leaving the flight path.', icon: '☄️', colors: ['#db2777', '#facc15'], clues: [['crystal', 'Comet crystal', '💎'], ['spark', 'Sugar spark', '✨'], ['tail', 'Rainbow tail', '🎗️']], souvenir: { id: 'comet-crystal', name: 'Candy Comet Crystal', emoji: '☄️', message: 'A sweet-looking crystal that never melts.' } },
    { id: 'dragon-kite-valley', title: 'Dragon Kite Valley', summary: 'Help a friendly kite dragon find three pieces of its sky ribbon.', icon: '🐉', colors: ['#7c3aed', '#22c55e'], clues: [['ribbon', 'Sky ribbon', '🎗️'], ['bell', 'Tail bell', '🔔'], ['knot', 'Magic knot', '🪢']], souvenir: { id: 'dragon-sky-ribbon', name: 'Dragon Sky Ribbon', emoji: '🎗️', message: 'A bright ribbon from the friendliest dragon kite.' } },
  ],
  junior: [
    { id: 'cipher-canyon', title: 'Cipher Canyon', summary: 'Recover three symbols and unlock the canyon’s hidden route.', icon: '🧭', colors: ['#1d4ed8', '#7c3aed'], clues: [['rune', 'Ancient rune', '🔣'], ['dial', 'Decoder dial', '🎛️'], ['compass', 'Cipher compass', '🧭']], souvenir: { id: 'code-compass', name: 'Cipher Canyon Compass', emoji: '🧭', message: 'A compass calibrated to routes hidden in code.' } },
    { id: 'aurora-observatory', title: 'Aurora Observatory', summary: 'Align three instruments to capture a new colour in the aurora.', icon: '🔭', colors: ['#0f766e', '#8b5cf6'], clues: [['lens', 'Aurora lens', '🔭'], ['prism', 'Light prism', '🔷'], ['chart', 'Sky chart', '🗺️']], souvenir: { id: 'aurora-lens', name: 'Aurora Explorer Lens', emoji: '🔭', message: 'A lens that reveals colours ordinary telescopes miss.' } },
    { id: 'echo-library', title: 'Ancient Echo Library', summary: 'Find three lost records and restore the library’s memory.', icon: '📚', colors: ['#92400e', '#7c3aed'], clues: [['scroll', 'Echo scroll', '📜'], ['seal', 'Archive seal', '🔏'], ['bookmark', 'Memory marker', '🔖']], souvenir: { id: 'echo-scroll', name: 'Ancient Echo Scroll', emoji: '📜', message: 'A restored story from the world’s oldest explorer archive.' } },
    { id: 'storm-station', title: 'Storm Engine Station', summary: 'Stabilise the station by reconnecting three energy cells.', icon: '⚡', colors: ['#1e40af', '#06b6d4'], clues: [['cell', 'Storm cell', '🔋'], ['coil', 'Lightning coil', '➿'], ['switch', 'Safety switch', '🎚️']], souvenir: { id: 'storm-cell', name: 'Calm Storm Cell', emoji: '🔋', message: 'Stored lightning from a successfully stabilised station.' } },
    { id: 'coral-archive', title: 'Coral City Archive', summary: 'Trace three clues through the flooded archive to find its key.', icon: '🪸', colors: ['#0891b2', '#f97316'], clues: [['key', 'Coral key', '🗝️'], ['tablet', 'Tide tablet', '📋'], ['shell', 'Archive shell', '🐚']], souvenir: { id: 'coral-key', name: 'Coral Archive Key', emoji: '🗝️', message: 'A key recovered from the underwater explorer archive.' } },
    { id: 'gravity-labyrinth', title: 'Gravity Labyrinth', summary: 'Reorient three gravity markers and map a path to the centre.', icon: '🌀', colors: ['#312e81', '#db2777'], clues: [['prism', 'Gravity prism', '🔷'], ['marker', 'Orbit marker', '🪐'], ['map', 'Inverted map', '🗺️']], souvenir: { id: 'gravity-prism', name: 'Gravity Labyrinth Prism', emoji: '🔷', message: 'A prism that always remembers which way is up.' } },
  ],
}

function hashText(value = '') {
  let hash = 2166136261
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash >>> 0)
}

export function normalizeProjectAdventures(value = {}) {
  const source = value && typeof value === 'object' ? value : {}
  const history = Array.isArray(source.history)
    ? source.history.filter(entry => entry?.runId && entry?.destinationId).slice(-90)
    : []
  const activeSource = source.active && typeof source.active === 'object' ? source.active : null
  const active = activeSource?.runId && activeSource?.destinationId
    ? {
        runId: String(activeSource.runId),
        ageGroup: PROJECT_ADVENTURES[activeSource.ageGroup] ? activeSource.ageGroup : 'early',
        destinationId: String(activeSource.destinationId),
        date: String(activeSource.date || ''),
        startedAt: Math.max(0, Number(activeSource.startedAt) || 0),
        updatedAt: Math.max(0, Number(activeSource.updatedAt) || Number(activeSource.startedAt) || 0),
        found: [...new Set(Array.isArray(activeSource.found) ? activeSource.found.filter(Boolean).map(String) : [])].slice(0, PROJECT_ADVENTURE_CLUES),
      }
    : null
  return {
    version: PROJECT_ADVENTURE_VERSION,
    active,
    history,
    souvenirIds: [...new Set(Array.isArray(source.souvenirIds) ? source.souvenirIds.filter(Boolean).map(String) : history.map(entry => entry.souvenirId).filter(Boolean))].slice(-60),
    updatedAt: Math.max(0, Number(source.updatedAt) || 0),
  }
}

export function getProjectAdventureDestination(ageGroup, destinationId) {
  const age = PROJECT_ADVENTURES[ageGroup] ? ageGroup : 'early'
  return PROJECT_ADVENTURES[age].find(item => item.id === destinationId) || null
}

export function chooseProjectAdventure(value, ageGroup = 'early', date = '') {
  const state = normalizeProjectAdventures(value)
  const age = PROJECT_ADVENTURES[ageGroup] ? ageGroup : 'early'
  const pool = PROJECT_ADVENTURES[age]
  const recent = new Set(state.history.filter(entry => entry.ageGroup === age).slice(-3).map(entry => entry.destinationId))
  const unseen = pool.filter(item => !state.souvenirIds.includes(item.souvenir.id) && !recent.has(item.id))
  const fresh = pool.filter(item => !recent.has(item.id))
  const candidates = unseen.length ? unseen : fresh.length ? fresh : pool
  return candidates[hashText(`${age}:${date}:${state.history.length}`) % candidates.length]
}

export function getProjectAdventureState(value, ageGroup = 'early', date = '') {
  const state = normalizeProjectAdventures(value)
  const age = PROJECT_ADVENTURES[ageGroup] ? ageGroup : 'early'
  const active = state.active?.ageGroup === age ? state.active : null
  const activeDestination = active ? getProjectAdventureDestination(age, active.destinationId) : null
  const nextDestination = activeDestination || chooseProjectAdventure(state, age, date)
  return {
    state,
    ageGroup: age,
    active,
    destination: nextDestination,
    foundCount: active?.found.length || 0,
    ready: Boolean(activeDestination) && active.found.length >= PROJECT_ADVENTURE_CLUES,
    completedRuns: state.history.filter(entry => entry.ageGroup === age).length,
    uniqueSouvenirs: new Set(state.history.filter(entry => entry.ageGroup === age).map(entry => entry.souvenirId).filter(Boolean)).size,
  }
}

export function startProjectAdventure(value, ageGroup = 'early', date = '', now = Date.now()) {
  const current = getProjectAdventureState(value, ageGroup, date)
  if (current.active && current.destination) return current.state
  const destination = current.destination
  if (!destination) return current.state
  return {
    ...current.state,
    active: {
      runId: `${current.ageGroup}:${date || 'any'}:${now}`,
      ageGroup: current.ageGroup,
      destinationId: destination.id,
      date: String(date || ''),
      startedAt: now,
      updatedAt: now,
      found: [],
    },
    updatedAt: now,
  }
}

export function findProjectAdventureClue(value, clueId, now = Date.now()) {
  const state = normalizeProjectAdventures(value)
  if (!state.active || !clueId) return state
  const destination = getProjectAdventureDestination(state.active.ageGroup, state.active.destinationId)
  if (!destination?.clues.some(([id]) => id === clueId)) return state
  const found = [...new Set([...state.active.found, clueId])].slice(0, PROJECT_ADVENTURE_CLUES)
  if (found.length === state.active.found.length) return state
  return { ...state, active: { ...state.active, found, updatedAt: now }, updatedAt: now }
}

export function completeProjectAdventure(value, now = Date.now()) {
  const state = normalizeProjectAdventures(value)
  if (!state.active || state.active.found.length < PROJECT_ADVENTURE_CLUES) return { state, reward: null, completed: false, duplicate: false }
  const destination = getProjectAdventureDestination(state.active.ageGroup, state.active.destinationId)
  if (!destination) return { state, reward: null, completed: false, duplicate: false }
  const duplicate = state.souvenirIds.includes(destination.souvenir.id)
  const entry = {
    runId: state.active.runId,
    ageGroup: state.active.ageGroup,
    destinationId: destination.id,
    date: state.active.date,
    completedAt: now,
    souvenirId: destination.souvenir.id,
    duplicate,
  }
  return {
    reward: destination.souvenir,
    completed: true,
    duplicate,
    state: {
      ...state,
      active: null,
      history: [...state.history.filter(item => item.runId !== entry.runId), entry].slice(-90),
      souvenirIds: [...new Set([...state.souvenirIds, destination.souvenir.id])].slice(-60),
      updatedAt: now,
    },
  }
}

export function claimProjectAdventureSouvenir(collection, reward, runId, { duplicate = false, earnedAt = Date.now() } = {}) {
  const current = normaliseTreasureCollection(collection)
  if (!reward?.id || !runId) return current
  const claimKey = `project-adventure:${runId}`
  if (current.history.some(entry => entry.claimKey === claimKey)) return current
  const alreadyOwned = current.items.some(item => item.id === reward.id)
  const isDuplicate = duplicate || alreadyOwned
  const item = { ...reward, kind: 'souvenir', slot: 'room', rarity: 'special', earnedAt, source: 'project-adventure' }
  return {
    ...current,
    items: isDuplicate ? current.items : [...current.items, item],
    history: [...current.history, { id: reward.id, claimKey, source: 'project-adventure', earnedAt, duplicate: isDuplicate }].slice(-90),
    sparkleDust: current.sparkleDust + (isDuplicate ? 5 : 0),
  }
}

export function mergeProjectAdventures(localValue = {}, cloudValue = {}) {
  const local = normalizeProjectAdventures(localValue)
  const cloud = normalizeProjectAdventures(cloudValue)
  const history = []
  const seen = new Set()
  for (const entry of [...cloud.history, ...local.history]) {
    if (!entry?.runId || seen.has(entry.runId)) continue
    seen.add(entry.runId)
    history.push(entry)
  }
  history.sort((a, b) => (a.completedAt || 0) - (b.completedAt || 0))
  const completedRuns = new Set(history.map(entry => entry.runId))
  let active = null
  if (local.active?.runId && local.active.runId === cloud.active?.runId) {
    active = {
      ...(local.active.updatedAt >= cloud.active.updatedAt ? cloud.active : local.active),
      ...(local.active.updatedAt >= cloud.active.updatedAt ? local.active : cloud.active),
      found: [...new Set([...(cloud.active.found || []), ...(local.active.found || [])])].slice(0, PROJECT_ADVENTURE_CLUES),
      updatedAt: Math.max(local.active.updatedAt || 0, cloud.active.updatedAt || 0),
    }
  } else {
    const candidates = [local.active, cloud.active].filter(item => item && !completedRuns.has(item.runId))
    active = candidates.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0] || null
  }
  return {
    version: PROJECT_ADVENTURE_VERSION,
    active,
    history: history.slice(-90),
    souvenirIds: [...new Set([...cloud.souvenirIds, ...local.souvenirIds, ...history.map(entry => entry.souvenirId).filter(Boolean)])].slice(-60),
    updatedAt: Math.max(local.updatedAt, cloud.updatedAt),
  }
}
