import { COLLECTION_ADVENTURES, normalizeCollection, nextAdventure } from './collectionAdventure.js'
import { normalizePicnicProgress } from './picnicProgress.js'
import { normalizeMarket } from './marketMission.js'

const picnic = { title: 'The Picnic', idea: 'Match one plate to each friend in different arrangements.', prompt: 'At dinner, ask your child to put one spoon beside each plate. How could you check everyone has one?' }
export function parentLearningSnapshot(progress = {}, ageGroup = 'early') {
  const ids = ageGroup === 'toddler' ? ['tiny'] : ageGroup === 'junior' ? ['market'] : ['picnic', 'basket', 'snacks']
  const entries = ids.map(id => {
    const saved = id === 'picnic' ? normalizePicnicProgress(progress.picnic) : id === 'market' ? normalizeMarket(progress.marketMission) : normalizeCollection(progress.collectionAdventures?.[id], id)
    const config = id === 'picnic' ? picnic : id === 'market' ? { title: 'The picnic budget', idea: 'Plan four fruits and four drinks within 12 pretend coins, then check cost and change.', prompt: 'Make a pretend shop together. Plan for two people using six counters. What could you choose?' } : COLLECTION_ADVENTURES[id]
    return { id, ...config, ...saved }
  })
  const active = entries.filter(e => e.updatedAt > 0 || e.state.report).sort((a,b) => b.updatedAt - a.updatedAt)[0]
  const nextId = ageGroup === 'toddler' ? 'tiny' : ageGroup === 'junior' ? 'market' : nextAdventure(progress)
  const next = entries.find(e => e.id === nextId)
  const result = { active: Boolean(active), title: active?.title || entries[0].title, idea: active?.idea || entries[0].idea, prompt: active?.prompt || entries[0].prompt,
    nextTitle: next?.title || 'Sound Pop', nextReason: next?.state.report ? 'Revisit it with a new arrangement or choice.' : next?.updatedAt > 0 ? 'Pick up the saved activity at your child\'s pace.' : 'A short next step to explore together.',
    completed: 'No saved progress in this adventure yet.', help: 'Help use will appear after your child starts.', firstVisit: false }
  if (!active) return result
  const { state } = active
  result.firstVisit = Boolean(state.report)
  if (active.id === 'market') {
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
