import { buildNumberWorldCompletion } from './numberWorldSession.js'

export const PICNIC_STORAGE_KEY = 'bloom:picnic-preview:v1'
export const PICNIC_ROUNDS = [
  { guests: ['Pip', 'Wren', null, 'Momo', 'Bo', null], title: 'A place for every friend', prompt: 'Can you give each friend one plate?' },
  { guests: [null, 'Bo', null, 'Pip', null, 'Momo'], title: 'A new little picnic', prompt: 'Wren has flown home. Can you set these places?' },
]
const emptyPlaces = () => Array(6).fill(false)
export const newPicnic = () => ({ version: 1, round: 0, phase: 'play', placements: emptyPlaces(), attempts: 0, helped: false, firstCorrect: null, lastKey: null, feedback: null, results: [], report: null, practice: false })
export function checkPlaces(placements, round) {
  const guests = PICNIC_ROUNDS[round].guests
  const missing = guests.flatMap((name, i) => name && !placements[i] ? [i] : [])
  const extra = guests.flatMap((name, i) => !name && placements[i] ? [i] : [])
  return { correct: missing.length === 0 && extra.length === 0, missing, extra }
}
export function picnicReport(results) {
  const independent = results.filter(r => r.attempts === 1 && !r.helped).length
  return { results, ...buildNumberWorldCompletion({ firstTryCorrect: independent, supportedCorrect: results.length - independent, totalRounds: 2, operation: 'one-to-one matching', questionSignatures: ['picnic-four', 'picnic-three'] }).sessionData }
}
export function picnicReducer(state, action) {
  if (action.type === 'REPLAY' && state.phase === 'complete') return { ...newPicnic(), practice: true, report: state.report }
  if (action.type === 'NEXT' && state.phase === 'celebrate') {
    if (state.round === 1) return { ...state, phase: 'complete', report: state.report || picnicReport(state.results) }
    return { ...state, round: 1, phase: 'play', placements: emptyPlaces(), attempts: 0, helped: false, firstCorrect: null, lastKey: null, feedback: null }
  }
  if (state.phase !== 'play') return state
  if (action.type === 'HELP') return { ...state, helped: true }
  if (action.type === 'TOGGLE' || action.type === 'PLACE' || action.type === 'MOVE') {
    const to = action.to
    if (!Number.isInteger(to) || to < 0 || to > 5) return state
    const placements = [...state.placements]
    if (action.type === 'MOVE') {
      if (!Number.isInteger(action.from) || action.from < 0 || action.from > 5 || !placements[action.from] || placements[to]) return state
      placements[action.from] = false
    }
    placements[to] = action.type === 'TOGGLE' ? !placements[to] : true
    return { ...state, placements, feedback: null }
  }
  if (action.type === 'SUBMIT') {
    if (!state.placements.some(Boolean)) return { ...state, feedback: { empty: true, missing: [], extra: [] } }
    const key = state.placements.map(Number).join('')
    const feedback = checkPlaces(state.placements, state.round)
    const attempts = state.attempts + (state.lastKey === key ? 0 : 1)
    const next = { ...state, feedback, attempts, lastKey: key, firstCorrect: state.firstCorrect ?? feedback.correct }
    if (!feedback.correct) return next
    return { ...next, phase: 'celebrate', results: [...state.results, { round: state.round, attempts, helped: state.helped, firstCorrect: next.firstCorrect }] }
  }
  return state
}

// Only restore internally consistent, anonymous preview data; never trust a stored score.
export function restorePicnic(raw) {
  try {
    const s = JSON.parse(raw)
    const validResult = (r, i) => r?.round === i && Number.isInteger(r.attempts) && r.attempts > 0 && typeof r.helped === 'boolean' && r.firstCorrect === (r.attempts === 1)
    if (!s || s.version !== 1 || ![0, 1].includes(s.round) || !['play', 'celebrate', 'complete'].includes(s.phase) || typeof s.practice !== 'boolean' || typeof s.helped !== 'boolean' || !Array.isArray(s.placements) || s.placements.length !== 6 || !s.placements.every(p => typeof p === 'boolean') || !Number.isInteger(s.attempts) || s.attempts < 0 || ![null, true, false].includes(s.firstCorrect) || !Array.isArray(s.results) || !s.results.every(validResult)) return newPicnic()
    const expected = s.round + (s.phase === 'play' ? 0 : 1)
    if (s.results.length !== expected || (s.phase === 'complete' && s.round !== 1) || (s.phase !== 'play' && !checkPlaces(s.placements, s.round).correct)) return newPicnic()
    if ((s.attempts === 0) !== (s.firstCorrect === null) || (s.lastKey !== null && !/^[01]{6}$/.test(s.lastKey)) || (s.attempts > 0 && s.lastKey === null)) return newPicnic()
    if (s.phase === 'play' && s.firstCorrect === true) return newPicnic()
    let report = null
    if (s.report) {
      if (!Array.isArray(s.report.results) || s.report.results.length !== 2 || !s.report.results.every(validResult)) return newPicnic()
      report = picnicReport(s.report.results)
    }
    if (s.practice && !report) return newPicnic()
    return { ...newPicnic(), ...s, feedback: null, report: s.phase === 'complete' && !s.practice ? picnicReport(s.results) : report }
  } catch { return newPicnic() }
}
