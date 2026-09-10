import { COLLECTION_ADVENTURES, normalizeCollection, nextAdventure } from './collectionAdventure.js'
import { normalizePicnicProgress } from './picnicProgress.js'
import { normalizeMarket } from './marketMission.js'
import { FLOAT_OBJECTS, normalizeFloatDiscovery } from './floatDiscovery.js'
import { SHADOW_ROUNDS, SHADOW_HOME_PROMPT, normalizeShadowDiscovery, validShadowObservations } from './shadowDiscovery.js'

const picnic = { title: 'The Picnic', idea: 'Match one plate to each friend in different arrangements.', prompt: 'At dinner, ask your child to put one spoon beside each plate. How could you check everyone has one?' }
export function parentLearningSnapshot(progress = {}, ageGroup = 'early') {
  const ids = ageGroup === 'toddler' ? ['tiny'] : ageGroup === 'junior' ? ['market'] : ['picnic', 'basket', 'snacks']
  const entries = ids.map(id => {
    const saved = id === 'picnic' ? normalizePicnicProgress(progress.picnic) : id === 'market' ? normalizeMarket(progress.marketMission) : normalizeCollection(progress.collectionAdventures?.[id], id)
    const config = id === 'picnic' ? picnic : id === 'market' ? { title: 'The picnic budget', idea: 'Plan four fruits and four drinks within 12 pretend coins, then check cost and change.', prompt: 'Make a pretend shop together. Plan for two people using six counters. What could you choose?' } : COLLECTION_ADVENTURES[id]
    return { id, ...config, ...saved }
  })
  if (ageGroup === 'early') {
    const saved = normalizeFloatDiscovery(progress.floatDiscovery)
    const first = (Array.isArray(progress.sessions) ? progress.sessions : []).find(s => s.module === 'float-discovery' && s.activityId === 'float-discovery-first')
    const report = first && normalizeFloatDiscovery({ round: 3, phase: 'complete', observations: first.observations }).phase === 'complete' ? first : null
    entries.push({ id: 'float', title: 'Will it float?', idea: 'Predict and observe floating and sinking, then compare the same clay as a ball and a hollow boat.', prompt: 'Ask: What changed when Bumi made the clay into a boat? With a grown-up, try shaping modelling clay over a shallow bowl of water. Can you keep water out of your boat?', updatedAt: Math.max(saved.updatedAt, Number(report?.date) || 0), state: { ...saved, report } })
  }
  if (ageGroup === 'early') {
    const saved = normalizeShadowDiscovery(progress.shadowDiscovery)
    const first = (Array.isArray(progress.sessions) ? progress.sessions : []).find(s => s?.module === 'shadow-discovery' && s.activityId === 'shadow-discovery-first' && s.observations?.length === 3 && validShadowObservations(s.observations))
    entries.push({ id: 'shadow', title: 'How can we change a shadow?', idea: 'Keep a card still and change its shadow by moving a torch, then switching the light off.', prompt: SHADOW_HOME_PROMPT, updatedAt: Math.max(saved.updatedAt, Number(first?.date) || 0), state: { ...saved, report: first || null } })
  }
  const active = entries.filter(e => e.updatedAt > 0 || e.state.report).sort((a,b) => b.updatedAt - a.updatedAt)[0]
  const nextId = ageGroup === 'toddler' ? 'tiny' : ageGroup === 'junior' ? 'market' : nextAdventure(progress)
  const next = entries.find(e => e.id === nextId)
  const result = { active: Boolean(active), title: active?.title || entries[0].title, idea: active?.idea || entries[0].idea, prompt: active?.prompt || entries[0].prompt,
    nextTitle: next?.title || 'Sound Pop', nextReason: next?.state.report ? 'Revisit it with a new arrangement or choice.' : next?.updatedAt > 0 ? 'Pick up the saved activity at your child\'s pace.' : 'A short next step to explore together.',
    completed: 'No saved progress in this adventure yet.', help: 'Help use will appear after your child starts.', firstVisit: false }
  if (!active) return result
  const { state } = active
  result.firstVisit = Boolean(state.report)
  if (active.id === 'shadow') {
    const observations = state.report?.observations || state.observations
    result.completed = state.report || state.phase === 'complete' ? 'Completed all 3 shadow experiments.' : `In progress: ${observations.length} of 3 shadow experiments observed.`
    result.evidenceTitle = 'Predictions and observations'
    result.help = 'Predictions are not scored. These records show exploration in the illustrated light model.'
    result.observations = observations.map((o,i) => `${SHADOW_ROUNDS[i].action}: predicted ${o.prediction.toLowerCase()}; observed ${SHADOW_ROUNDS[i].result.toLowerCase()}.`)
    if (!state.report && state.phase !== 'complete') {
      result.nextTitle = active.title
      result.nextReason = 'Continue in Little Stars → Explore → Change a shadow.'
    }
  } else if (active.id === 'float') {
    const observations = state.report?.observations || state.observations
    result.completed = state.report || state.phase === 'complete' ? 'Completed all 4 experiments.' : `In progress: ${observations.length} of 4 experiments observed.`
    result.evidenceTitle = 'Predictions and observations'
    result.help = observations.length ? 'Each prediction was made before testing. Predictions are not scored.' : 'Your child has started making a prediction. Observations appear after testing an object.'
    result.observations = observations.map(o => {
      const object = FLOAT_OBJECTS.find(item => item.id === o.id)
      return `${object.label}: predicted ${o.prediction ? 'float' : 'sink'}; observed ${object.floats ? 'floating' : 'sinking'}.`
    })
    if (!state.report && state.phase !== 'complete') {
      result.nextTitle = active.title
      result.nextReason = 'Continue the saved discovery in Little Stars → Explore → Will it float?'
    }
  } else if (active.id === 'market') {
    const evidence = state.report || state
    result.completed = state.report ? `Completed the budget mission: ${state.report.cost} coins spent, ${state.report.left} left.` : `In progress: ${ {plan:'choosing a basket',total:'checking the total',change:'checking coins left',reason:'choosing a reason'}[state.phase] || 'exploring the market' }.`
    const labels = {plan:'basket planning',total:'total cost',change:'coins left'}
    const helped = Object.keys(labels).filter(k => evidence.helped[k]).map(k => labels[k])
    result.help = helped.length ? `Opened working hints for ${helped.join(', ')}.` : 'No working hints opened in this saved record.'
  } else {
    const results = state.report?.results || state.results || []
    const total = active.id === 'picnic' ? 2 : active.rounds.length
    result.completed = state.report ? `Completed ${total} of ${total} rounds.` : `In progress: ${results.length} of ${total} rounds completed.`
    const helped = results.filter(r => r.helped).length
    const currentHelp = !state.report && state.helped && !results.some(r => r.round === state.round)
    result.help = helped || currentHelp ? `Opened the demonstration in ${helped + Number(Boolean(currentHelp))} ${helped + Number(Boolean(currentHelp)) === 1 ? 'round' : 'rounds'}.` : 'No demonstration opened in this saved record.'
  }
  return result
}
