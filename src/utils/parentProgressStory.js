import { getCompanionBond } from './companionBond.js'
import { getDreamProjectState } from './dreamProject.js'
import { normaliseTreasureCollection } from './treasureRewards.js'
import { normalizeWonderWorld } from './wonderWorld.js'

const DAY_MS = 24 * 60 * 60 * 1000

export const PARENT_STORY_MODULES = {
  toddler: [
    ['colours', 'Colours', '🎨'], ['shapes', 'Shapes', '🔷'], ['numbers', 'Numbers', '🔢'],
    ['animals', 'Animals', '🐘'], ['fruits', 'Fruits', '🍎'], ['bodyparts', 'My Body', '🖐️'],
    ['alphabet', 'Letters', '🔤'],
  ],
  early: [
    ['phonics', 'Phonics', '🎤'], ['math', 'Number World', '🔢'], ['tricky', 'Tricky Words', '⭐'],
    ['story', 'Story Room', '📖'], ['logic', 'Logic', '🧩'], ['shop', 'Coin Shop', '🛍️'],
    ['piggybank', 'Money Bank', '🐷'], ['shapes', 'Shape World', '🔷'], ['davinci', 'Da Vinci Studio', '🎨'],
    ['anatomy', 'My Body', '🫀'], ['science', 'Science', '🔬'], ['worldgk', 'World Explorer', '🌍'],
    ['exercise', 'Movement', '🏃'], ['planets', 'Planet World', '🪐'], ['sacred', 'World Faiths', '🕊️'],
  ],
  junior: [
    ['timestables', 'Times Tables', '✖️'], ['fractions', 'Fractions', '½'], ['wordproblems', 'Word Problems', '🧩'],
    ['piggybank', 'Money Bank', '🐷'], ['reading', 'Reading', '📖'], ['spelling', 'Spelling', '✏️'],
    ['grammar', 'Grammar', '🔤'], ['science', 'Science Quest', '🔬'], ['worldmap', 'World Map', '🌍'],
    ['spirituality', 'World Faiths', '🕊️'], ['exercise', 'Movement', '🏃'], ['games', 'Game Arena', '🎮'],
  ],
}
const ACTIVITY_BANK = {
  toddler: {
    colours: ['Colour hunt', 'Pick one colour and find three things around the room that match it.'],
    shapes: ['Shape detective', 'Find a circle, square and triangle at home, then trace each one in the air.'],
    numbers: ['Tiny counting walk', 'Take ten steps together and say each number out loud.'],
    animals: ['Animal action', 'Choose three animals, copy their sounds and move like each one.'],
    fruits: ['Fruit shop', 'Sort real or pretend fruits by colour, then name each one.'],
    bodyparts: ['Simon says', 'Play a quick round using head, shoulders, knees, elbows and toes.'],
    alphabet: ['Letter spy', 'Choose one letter and spot it three times on packets, books or signs.'],
  },
  early: {
    phonics: ['Sound treasure hunt', 'Choose today’s sound and find three objects whose names begin with it.'],
    math: ['Snack maths', 'Use five small snacks or blocks to practise one more, one less and simple sharing.'],
    tricky: ['Magic word cards', 'Write three tricky words on paper, hide them, then read each discovery aloud.'],
    story: ['Change the ending', 'Retell today’s story and invent one funny new ending together.'],
    logic: ['Home obstacle route', 'Give a three-step route using forward, left and right, then swap roles.'],
    shop: ['Pretend shop', 'Price three toys from 1 to 5 and pay with buttons or paper coins.'],
    piggybank: ['Coin sorter', 'Sort a few safe coins by size or colour and count each group.'],
    shapes: ['Build a picture', 'Make a house or rocket using circles, squares, rectangles and triangles.'],
    davinci: ['Mini art studio', 'Draw one object using only three colours, then name the shapes you used.'],
    anatomy: ['Body clue game', 'Describe what one body part helps us do and let your child guess it.'],
    science: ['Sink or float guess', 'Choose three safe objects, predict sink or float, then test with an adult.'],
    worldgk: ['Map moment', 'Find your home country on a map and choose one place you would like to explore.'],
    exercise: ['Movement mission', 'Do five jumps, five stretches and a ten-second balance together.'],
    planets: ['Night-sky chat', 'Look at the sky or a picture and invent a name for a brand-new planet.'],
    sacred: ['Kindness story', 'Share one kind thing someone did today and how it made another person feel.'],
  },
  junior: {
    timestables: ['Beat the clock', 'Choose one times table and answer as many facts as possible in two minutes.'],
    fractions: ['Kitchen fractions', 'Use fruit, toast or a paper circle to show halves, quarters and equivalent pieces.'],
    wordproblems: ['Make the problem', 'Turn a real home task into a maths story, solve it, then change one number.'],
    piggybank: ['Budget challenge', 'Plan how to spend 20 pretend coins on three items and calculate the change.'],
    reading: ['Evidence detective', 'Read one page and find a sentence that proves what a character feels.'],
    spelling: ['Word builder', 'Choose one tricky word, cover it, write it, check it, then use it in a sentence.'],
    grammar: ['Sentence upgrade', 'Take one plain sentence and add a stronger verb, adjective and conjunction.'],
    science: ['Mini investigation', 'Make a prediction about a safe household object, test it and explain the result.'],
    worldmap: ['Explorer route', 'Pick two countries, locate them and plan an imaginary route between them.'],
    spirituality: ['Big question', 'Discuss one way different people show gratitude, care or courage.'],
    exercise: ['Personal best', 'Choose a safe movement, record one minute, rest, then try to improve with control.'],
    games: ['Strategy replay', 'Explain one game choice that worked and one you would change next time.'],
  },
}

const AGE_COPY = {
  toddler: { label: 'Tiny Stars · ages 3–4', practice: 'Keep it playful and stop while it is still fun.' },
  early: { label: 'Little Stars · ages 4–6', practice: 'Let your child explain, point and move—not only answer.' },
  junior: { label: 'Super Kids · ages 7–9', practice: 'Ask how they know; the explanation matters as much as the answer.' },
}

function ageKey(value) {
  return PARENT_STORY_MODULES[value] ? value : 'early'
}

function moduleCatalog(ageGroup) {
  return PARENT_STORY_MODULES[ageKey(ageGroup)].map(([id, label, emoji]) => ({ id, label, emoji }))
}

function sessionTime(session) {
  const value = Number(session?.date)
  return Number.isFinite(value) ? value : 0
}

function summariseSessions(sessions, from, to) {
  const chosen = sessions.filter(session => {
    const at = sessionTime(session)
    return at >= from && at < to
  })
  const scored = chosen.filter(session => Number.isFinite(Number(session.accuracy)))
  const activeDays = new Set(chosen.map(session => new Date(sessionTime(session)).toDateString())).size
  return {
    sessions: chosen.length,
    stars: chosen.reduce((sum, session) => sum + Math.max(0, Number(session.stars) || 0), 0),
    minutes: Math.round(chosen.reduce((sum, session) => sum + Math.max(0, Number(session.duration) || 0), 0) / 60),
    activeDays,
    accuracy: scored.length
      ? Math.round(scored.reduce((sum, session) => sum + Number(session.accuracy), 0) / scored.length)
      : null,
    items: chosen,
  }
}

function moduleEvidence(progress, sessions, module) {
  const skill = progress?.learningJourney?.skills?.[module.id] || {}
  const saved = progress?.[module.id] || {}
  const playedSessions = sessions.filter(session => session.module === module.id)
  const scored = playedSessions.filter(session => Number.isFinite(Number(session.accuracy)))
  const sessionAccuracy = scored.length
    ? Math.round(scored.reduce((sum, session) => sum + Number(session.accuracy), 0) / scored.length)
    : null
  const accuracy = Number.isFinite(Number(skill.mastery)) && Number(skill.attempts) > 0
    ? Number(skill.mastery)
    : sessionAccuracy ?? (Number.isFinite(Number(saved.lastAccuracy)) ? Number(saved.lastAccuracy) : null)
  const evidence = Math.max(Number(skill.attempts) || 0, playedSessions.length, Number(saved.played) || 0)
  return { ...module, accuracy, evidence, played: Math.max(playedSessions.length, Number(saved.played) || 0) }
}

function chooseSkills(progress, allSessions, weekSessions, catalog) {
  const evidence = catalog.map(module => moduleEvidence(progress, allSessions, module))
  const practised = evidence.filter(item => item.evidence > 0)
  const strongest = [...practised].sort((a, b) => (b.accuracy ?? 0) - (a.accuracy ?? 0) || b.evidence - a.evidence)[0] || null
  let developing = [...practised]
    .filter(item => item.id !== strongest?.id)
    .sort((a, b) => (a.accuracy ?? 100) - (b.accuracy ?? 100) || b.evidence - a.evidence)[0] || null
  if (!developing) developing = evidence.find(item => item.id !== strongest?.id && item.evidence === 0) || strongest

  const counts = new Map()
  for (const session of weekSessions.length ? weekSessions : allSessions) {
    counts.set(session.module, (counts.get(session.module) || 0) + 1)
  }
  for (const item of evidence) {
    if (!counts.has(item.id) && item.played) counts.set(item.id, item.played)
  }
  const favouriteId = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
  const favourite = evidence.find(item => item.id === favouriteId) || strongest || catalog[0]
  return { strongest, developing, favourite }
}

function buildActivities(ageGroup, skills) {
  const age = ageKey(ageGroup)
  const catalog = moduleCatalog(age)
  const ids = [skills.developing?.id, skills.favourite?.id, skills.strongest?.id, ...catalog.map(item => item.id)]
  const unique = [...new Set(ids.filter(Boolean))].slice(0, 3)
  return unique.map((id, index) => {
    const module = catalog.find(item => item.id === id) || catalog[index]
    const [title, instruction] = ACTIVITY_BANK[age][module.id] || ['Five-minute explorer challenge', 'Choose one thing learned today and teach it to someone at home.']
    return { id: module.id, title, instruction, emoji: module.emoji, module: module.label, minutes: 5 }
  })
}

function formatWeek(from, to) {
  const start = new Date(from)
  const end = new Date(to - 1)
  const options = { month: 'short', day: 'numeric' }
  return `${start.toLocaleDateString(undefined, options)} – ${end.toLocaleDateString(undefined, options)}`
}

function buildNarrative(name, current, previous, skills, companion) {
  if (!current.sessions) {
    return `${name} has a fresh week waiting. Start with one short adventure, then return here to see strengths, practice ideas and progress take shape.`
  }
  const dayWord = current.activeDays === 1 ? 'day' : 'days'
  const sessionWord = current.sessions === 1 ? 'adventure' : 'adventures'
  const strength = skills.strongest ? ` ${skills.strongest.label} is currently the clearest strength.` : ''
  const trend = previous.sessions > 0 && current.sessions > previous.sessions
    ? ' That is more activity than the previous week.'
    : previous.sessions > 0 && current.sessions < previous.sessions
      ? ' This was a gentler week, which is completely fine.'
      : ''
  return `${name} completed ${current.sessions} ${sessionWord} across ${current.activeDays} ${dayWord}.${strength}${trend} ${companion.companion.name} is growing into a ${companion.stage.name}.`
}

export function buildParentProgressStory(progress = {}, profileName = 'Your child', ageGroup = 'early', now = Date.now()) {
  const age = ageKey(ageGroup)
  const sessions = Array.isArray(progress.sessions) ? progress.sessions : []
  const currentFrom = now - (7 * DAY_MS)
  const previousFrom = currentFrom - (7 * DAY_MS)
  const current = summariseSessions(sessions, currentFrom, now + 1)
  const previous = summariseSessions(sessions, previousFrom, currentFrom)
  const catalog = moduleCatalog(age)
  const skills = chooseSkills(progress, sessions, current.items, catalog)
  const companion = getCompanionBond(progress)
  const dream = getDreamProjectState(progress, age)
  const treasures = normaliseTreasureCollection(progress.treasureCollection)
  const world = normalizeWonderWorld(progress.wonderWorld)
  const activities = buildActivities(age, skills)
  const name = String(profileName || 'Your child').trim() || 'Your child'
  const headline = current.sessions
    ? skills.strongest
      ? `${name} is growing in ${skills.strongest.label}`
      : `${name} kept the learning adventure moving`
    : `${name}'s next learning story starts here`
  const celebration = current.sessions
    ? `${current.sessions} ${current.sessions === 1 ? 'adventure' : 'adventures'} · ${current.stars} stars · ${current.activeDays} active ${current.activeDays === 1 ? 'day' : 'days'}`
    : 'One short adventure is enough to begin'

  return {
    ageGroup: age,
    ageLabel: AGE_COPY[age].label,
    parentTip: AGE_COPY[age].practice,
    period: formatWeek(currentFrom, now + 1),
    headline,
    celebration,
    narrative: buildNarrative(name, current, previous, skills, companion),
    current,
    previous,
    trend: current.sessions - previous.sessions,
    skills,
    activities,
    companion,
    dream,
    treasures: { owned: treasures.items.length, sparkleDust: treasures.sparkleDust },
    world: { discoveries: world.discoveries.length, planted: world.plots.filter(Boolean).length },
  }
}
