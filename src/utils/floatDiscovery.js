export const FLOAT_OBJECTS = [
  { id: 'cork', name: 'a cork', label: 'Cork', floats: true, question: 'Will this cork float on top, or sink down?', explanation: 'The cork floats. Water pushes up on it and holds it at the surface.' },
  { id: 'pebble', name: 'a pebble', label: 'Pebble', floats: false, question: 'What about this pebble? Make a guess, then test it.', explanation: 'This pebble sinks. Water pushes up on it too, but not enough to hold it up.' },
  { id: 'clay', name: 'a clay ball', label: 'Clay ball', floats: false, question: 'Here is a ball of clay. Where do you think it will go?', explanation: 'Our clay ball sinks. Now let us change its shape. Can the same clay float?' },
  { id: 'boat', name: 'a clay boat', label: 'Same clay, new shape', floats: true, question: 'We shaped the same clay into a wide, hollow boat. Will it float this time?', explanation: 'Our clay boat floats! Its wide, hollow shape moves more water aside before water comes over the edge. The water can push up enough to hold it. Same clay, different shape!' },
]
export const newFloatDiscovery = () => ({ round: 0, phase: 'predict', prediction: null, observations: [], completedAt: 0, updatedAt: 0 })
export function normalizeFloatDiscovery(value) {
  if (!value || !Number.isInteger(value.round) || value.round < 0 || value.round > 3) return newFloatDiscovery()
  const observations = Array.isArray(value.observations) ? value.observations.filter((v, i) => v?.id === FLOAT_OBJECTS[i]?.id && typeof v.prediction === 'boolean').slice(0, 4) : []
  if (observations.length < value.round) return newFloatDiscovery()
  const phase = ['predict', 'drop', 'observe', 'complete'].includes(value.phase) ? value.phase : 'predict'
  if ((phase === 'complete' && observations.length !== 4) || (phase === 'observe' && observations.length !== value.round + 1)) return newFloatDiscovery()
  return { round: value.round, phase: phase === 'drop' && typeof value.prediction !== 'boolean' ? 'predict' : phase, prediction: typeof value.prediction === 'boolean' ? value.prediction : null, observations, completedAt: Number(value.completedAt) || 0, updatedAt: Number(value.updatedAt) || 0 }
}
export function floatDiscoveryReducer(state, action) {
  if (action.type === 'REPLAY') return { ...newFloatDiscovery(), updatedAt: action.at }
  if (action.type === 'PREDICT' && state.phase === 'predict' && typeof action.floats === 'boolean') return { ...state, prediction: action.floats, phase: 'drop', updatedAt: action.at }
  if (action.type === 'DROP' && state.phase === 'drop') return { ...state, phase: 'observe', observations: [...state.observations, { id: FLOAT_OBJECTS[state.round].id, prediction: state.prediction }], updatedAt: action.at }
  if (action.type === 'NEXT' && state.phase === 'observe') return state.round === 3
    ? { ...state, phase: 'complete', completedAt: action.at, updatedAt: action.at }
    : { ...state, round: state.round + 1, phase: 'predict', prediction: null, updatedAt: action.at }
  return state
}
export function mergeFloatDiscovery(a, b) {
  const left = normalizeFloatDiscovery(a), right = normalizeFloatDiscovery(b)
  return left.updatedAt >= right.updatedAt ? left : right
}
export function applyFloatDiscovery(progress, action, at = Date.now()) {
  const before = normalizeFloatDiscovery(progress.floatDiscovery)
  const state = floatDiscoveryReducer(before, { ...action, at })
  if (state === before) return progress
  const sessions = progress.sessions || []
  const first = state.phase === 'complete' && !sessions.some(s => s.activityId === 'float-discovery-first')
  return { ...progress, floatDiscovery: state, sessions: first ? [...sessions, { date: at, module: 'float-discovery', activityId: 'float-discovery-first', title: 'Will it float?', stars: 0, observations: state.observations, total: 4, duration: 0 }] : sessions }
}
