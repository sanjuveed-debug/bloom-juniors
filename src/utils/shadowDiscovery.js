export const SHADOW_ROUNDS = [
  { id: 'closer', question: 'Move the torch closer to the card. Will its shadow get bigger or smaller?', choices: ['Bigger', 'Smaller'], start: 0, target: 100, action: 'Move closer', result: 'Bigger', explanation: 'The shadow grew! The card blocks light. With the torch closer, the blocked area spreads wider on the wall.' },
  { id: 'farther', question: 'Now move the torch farther from the card. What will happen to the shadow?', choices: ['Bigger', 'Smaller'], start: 100, target: 0, action: 'Move farther away', result: 'Smaller', explanation: 'The shadow became smaller. The card and wall stayed still. Moving the torch changed how wide the shadow spread.' },
  { id: 'off', question: 'What happens to this shadow when we switch off the torch?', choices: ['It stays', 'It disappears'], start: 0, target: 0, action: 'Switch off the torch', result: 'It disappears', explanation: 'The torch shadow disappeared. A shadow needs light and something blocking it. Without the torch light, this wall is dark all over.' },
]
export const SHADOW_HOME_PROMPT = 'With a grown-up, shine a torch at a wall and hold a card between them. Keep the card still. Can you change its shadow by moving only the torch? Keep the light away from eyes.'
export const newShadowDiscovery = () => ({ round: 0, phase: 'predict', prediction: null, position: 0, observations: [], updatedAt: 0 })
export function validShadowObservations(value) {
  return Array.isArray(value) && value.length <= 3 && value.every((o,i) => o?.id === SHADOW_ROUNDS[i].id && SHADOW_ROUNDS[i].choices.includes(o.prediction))
}
export function normalizeShadowDiscovery(value) {
  if (!value || !Number.isInteger(value.round) || value.round < 0 || value.round > 2 || !validShadowObservations(value.observations)) return newShadowDiscovery()
  const { round, phase, prediction, observations } = value
  if (!['predict','test','observe','complete'].includes(phase)) return newShadowDiscovery()
  const count = phase === 'complete' ? 3 : round + (phase === 'observe' ? 1 : 0)
  if (observations.length !== count || (phase === 'complete' && round !== 2) || (phase !== 'predict' && !SHADOW_ROUNDS[round].choices.includes(prediction))) return newShadowDiscovery()
  const position = Math.max(0, Math.min(100, Number(value.position) || 0))
  return { round, phase, prediction: phase === 'predict' ? null : prediction, position, observations, updatedAt: Number(value.updatedAt) || 0 }
}
export function applyShadowDiscovery(progress, action, at = Date.now()) {
  let state = normalizeShadowDiscovery(progress.shadowDiscovery)
  const item = SHADOW_ROUNDS[state.round]
  if (action.type === 'REPLAY' && state.phase === 'complete') state = newShadowDiscovery()
  else if (action.type === 'PREDICT' && state.phase === 'predict' && item.choices.includes(action.prediction)) state = { ...state, prediction: action.prediction, phase: 'test' }
  else if (state.phase === 'test' && ((action.type === 'MOVE' && item.id !== 'off' && Number.isFinite(action.position)) || (action.type === 'OFF' && item.id === 'off'))) {
    const position = Math.max(0, Math.min(100, action.position ?? state.position))
    const tested = item.id === 'off' || position === item.target
    state = { ...state, position, phase: tested ? 'observe' : 'test', observations: tested ? [...state.observations, { id: item.id, prediction: state.prediction }] : state.observations }
  } else if (action.type === 'NEXT' && state.phase === 'observe') state = state.round === 2 ? { ...state, phase: 'complete' } : { ...state, round: state.round + 1, phase: 'predict', prediction: null, position: SHADOW_ROUNDS[state.round + 1].start }
  else return progress
  state = { ...state, updatedAt: at }
  const sessions = Array.isArray(progress.sessions) ? progress.sessions : []
  const first = state.phase === 'complete' && !sessions.some(s => s.activityId === 'shadow-discovery-first')
  return { ...progress, shadowDiscovery: state, sessions: first ? [...sessions, { date: at, module: 'shadow-discovery', activityId: 'shadow-discovery-first', title: 'How can we change a shadow?', observations: state.observations, total: 3, stars: 0, duration: 0 }] : sessions }
}
export function mergeShadowDiscovery(a,b) {
  const left=normalizeShadowDiscovery(a), right=normalizeShadowDiscovery(b)
  return left.updatedAt >= right.updatedAt ? left : right
}
// Side view of a point light, a fixed card and a fixed wall (similar triangles).
export function shadowGeometry(position) {
  const lightX=100 + Math.max(0,Math.min(100,Number(position)||0))*2.6
  return { lightX, radius: 28 * (800-lightX)/(480-lightX) }
}
