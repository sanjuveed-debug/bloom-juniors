import { buildNumberWorldCompletion } from './numberWorldSession.js'

export const COLLECTION_ADVENTURES = {
  tiny: {
    title: 'Bumi’s Picnic Shapes', ageGroup: 'toddler', module: 'shapes', choice: true,
    idea: 'Match objects, then sort by shape even when the colour changes.',
    prompt: 'Find a plate and a napkin together. Trace the round edge and the four corners with a finger.',
    rounds: [
      { title: 'Find another plate', instruction: 'Tap the plate that matches.', labels: ['plate', 'napkin'], targets: [1, 0], total: 1, object: 'plate', colour: '#e8ad45', mode: 'match' },
      { title: 'Find another napkin', instruction: 'Tap the napkin that matches.', labels: ['plate', 'napkin'], targets: [0, 1], total: 1, object: 'napkin', colour: '#df8469', mode: 'match' },
      { title: 'Where does this plate go?', instruction: 'Tap the round mat for this plate.', labels: ['napkin', 'plate'], targets: [0, 1], total: 1, object: 'plate', colour: '#7baac4', mode: 'sort' },
      { title: 'Where does this napkin go?', instruction: 'Tap the square mat for this napkin.', labels: ['napkin', 'plate'], targets: [1, 0], total: 1, object: 'napkin', colour: '#e8ad45', mode: 'sort' },
    ],
  },
  basket: {
    title: 'Pack the Basket', idea: 'Match a collection to a pictured list.',
    prompt: 'At snack time, ask for two pieces of fruit. How can you check the collection?',
    rounds: [
      { title: 'What shall we take?', instruction: 'Pack three apples and two pears for our picnic.', labels: ['apples', 'pears'], targets: [3, 2], total: 8 },
      { title: 'A different picnic list', instruction: 'This time, pack one apple and three pears.', labels: ['apples', 'pears'], targets: [1, 3], total: 8 },
    ],
  },
  snacks: {
    title: 'Share the Snacks', idea: 'Give one to each friend and notice what is left.',
    prompt: 'Give one spoon to each person at dinner. Are any spoons left over?',
    rounds: [
      { title: 'One for each friend', instruction: 'We have four apples. Give Pip, Wren and Momo one each. Leave the extra apple in the basket.', labels: ['Pip', 'Wren', 'Momo'], targets: [1, 1, 1], total: 4 },
      { title: 'Bo joins the picnic', instruction: 'Now there are four friends and five apples. Give everyone one apple. What is left?', labels: ['Bo', 'Momo', 'Pip', 'Wren'], targets: [1, 1, 1, 1], total: 5 },
    ],
  },
}
export const newCollection = id => ({ version: 1, id, round: 0, phase: 'play', counts: COLLECTION_ADVENTURES[id].rounds[0].targets.map(() => 0), attempts: 0, helped: false, lastKey: null, results: [], report: null, practice: false, feedback: null })
const report = results => ({ results, ...buildNumberWorldCompletion({ totalRounds: results.length, firstTryCorrect: results.filter(r => r.attempts === 1 && !r.helped).length, supportedCorrect: results.filter(r => r.attempts !== 1 || r.helped).length }).sessionData })
export function checkCollection(state) {
  const round = COLLECTION_ADVENTURES[state.id].rounds[state.round]
  return round.targets.map((target, index) => ({ label: round.labels[index], missing: Math.max(0, target - state.counts[index]), extra: Math.max(0, state.counts[index] - target) }))
}
export function collectionReducer(state, action) {
  const rounds = COLLECTION_ADVENTURES[state.id].rounds
  if (action.type === 'REPLAY' && state.phase === 'complete') return { ...newCollection(state.id), practice: true, report: state.report }
  if (action.type === 'NEXT' && state.phase === 'celebrate') {
    if (state.round === rounds.length - 1) return { ...state, phase: 'complete', report: state.report || report(state.results) }
    return { ...state, round: state.round + 1, counts: rounds[state.round + 1].targets.map(() => 0), attempts: 0, helped: false, lastKey: null, phase: 'play', feedback: null }
  }
  if (state.phase !== 'play') return state
  if (action.type === 'CHOOSE' && COLLECTION_ADVENTURES[state.id].choice) {
    if (![0, 1].includes(action.index)) return state
    return collectionReducer({ ...state, counts: state.counts.map((_, i) => i === action.index ? 1 : 0) }, { type: 'SUBMIT' })
  }
  if (action.type === 'HELP') return { ...state, helped: true }
  if (action.type === 'ADD' || action.type === 'REMOVE') {
    const i = action.index
    if (!Number.isInteger(i) || i < 0 || i >= state.counts.length) return state
    if (action.type === 'ADD' && state.counts.reduce((a, b) => a + b, 0) >= rounds[state.round].total) return state
    if (action.type === 'REMOVE' && state.counts[i] === 0) return state
    return { ...state, counts: state.counts.map((n, index) => index === i ? n + (action.type === 'ADD' ? 1 : -1) : n), feedback: null }
  }
  if (action.type === 'SUBMIT') {
    if (!state.counts.some(Boolean)) return { ...state, feedback: 'empty' }
    const key = state.counts.join(',')
    const attempts = state.attempts + (key !== state.lastKey ? 1 : 0)
    const correct = checkCollection(state).every(r => !r.missing && !r.extra)
    return { ...state, attempts, lastKey: key, feedback: correct ? 'correct' : 'retry', phase: correct ? 'celebrate' : 'play',
      results: correct ? [...state.results, { round: state.round, attempts, helped: state.helped }] : state.results }
  }
  return state
}
export function normalizeCollection(value, id) {
  const fresh = newCollection(id)
  const s = value?.state
  const validResults = results => Array.isArray(results) && results.every((r, i) => r.round === i && Number.isInteger(r.attempts) && r.attempts > 0 && typeof r.helped === 'boolean')
  const roundCount = COLLECTION_ADVENTURES[id].rounds.length
  const valid = s?.id === id && s.version === 1 && Number.isInteger(s.round) && s.round >= 0 && s.round < roundCount && ['play', 'celebrate', 'complete'].includes(s.phase)
    && Array.isArray(s.counts) && s.counts.length === COLLECTION_ADVENTURES[id].rounds[s.round].targets.length
    && s.counts.every(n => Number.isInteger(n) && n >= 0) && s.counts.reduce((a,b) => a+b, 0) <= COLLECTION_ADVENTURES[id].rounds[s.round].total
    && Number.isInteger(s.attempts) && s.attempts >= 0 && typeof s.helped === 'boolean' && typeof s.practice === 'boolean'
    && (s.attempts === 0 ? s.lastKey === null : typeof s.lastKey === 'string' && /^\d+(,\d+)+$/.test(s.lastKey))
    && validResults(s.results) && s.results.length === s.round + (s.phase === 'play' ? 0 : 1)
    && (s.phase !== 'complete' || s.round === roundCount - 1)
    && (s.phase === 'play' || checkCollection(s).every(r => !r.missing && !r.extra))
    && (!s.report || (validResults(s.report.results) && s.report.results.length === roundCount)) && (!s.practice || s.report)
  const state = valid ? { ...fresh, ...s, report: s.report ? report(s.report.results) : s.phase === 'complete' ? report(s.results) : null } : fresh
  return { state, updatedAt: valid ? Number(value.updatedAt) || 0 : 0, completedAt: valid ? Number(value.completedAt) || 0 : 0 }
}
export function applyCollectionAction(progress, id, action, at = Date.now()) {
  const previous = normalizeCollection(progress.collectionAdventures?.[id], id)
  const state = collectionReducer(previous.state, action)
  if (state === previous.state) return progress
  let sessions = progress.sessions || []
  const activityId = `${id}-first`
  if (!previous.state.report && state.report && !sessions.some(s => s.activityId === activityId)) sessions = [...sessions, { ...state.report, date: at, module: COLLECTION_ADVENTURES[id].module || 'math', activityId, title: COLLECTION_ADVENTURES[id].title, stars: 0, duration: 0 }]
  return { ...progress, sessions, collectionAdventures: { ...progress.collectionAdventures, [id]: { state, updatedAt: at, completedAt: previous.completedAt || (state.report ? at : 0) } } }
}
export function mergeCollections(a = {}, b = {}) {
  return Object.fromEntries(Object.keys(COLLECTION_ADVENTURES).map(id => {
    const left = normalizeCollection(a?.[id], id), right = normalizeCollection(b?.[id], id)
    let chosen = left.updatedAt >= right.updatedAt ? left : right
    if (!!left.state.report !== !!right.state.report) chosen = left.state.report ? left : right
    else if (left.state.report && right.state.report) {
      const first = (left.completedAt || left.updatedAt) <= (right.completedAt || right.updatedAt) ? left : right
      chosen = { ...chosen, completedAt: first.completedAt, state: { ...chosen.state, report: first.state.report } }
    }
    return [id, chosen]
  }))
}
export const ADVENTURE_PATH = ['picnic', 'basket', 'snacks']
export function getAdventurePath(progress = {}) {
  return ADVENTURE_PATH.map(id => {
    const data = id === 'picnic' ? progress.picnic : progress.collectionAdventures?.[id]
    return { id, completed: Boolean(data?.state?.report), inProgress: Boolean(data?.updatedAt && data?.state?.phase !== 'complete') }
  })
}
export function nextAdventure(progress) {
  const path = getAdventurePath(progress)
  return path.find(p => p.inProgress)?.id || path.find(p => !p.completed)?.id || 'phonics'
}
