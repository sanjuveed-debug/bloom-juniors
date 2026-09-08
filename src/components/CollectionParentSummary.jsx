import { COLLECTION_ADVENTURES, normalizeCollection } from '../utils/collectionAdventure.js'
export default function CollectionParentSummary({ progress }) {
  return Object.entries(COLLECTION_ADVENTURES).map(([id, config]) => {
    const { state } = normalizeCollection(progress.collectionAdventures?.[id], id)
    if (!state.report) return null
    return <section key={id} aria-label={`${config.title} learning recap`} className="rounded-3xl bg-amber-50 text-green-950 p-6 mb-5">
      <p className="text-xs font-bold uppercase tracking-widest">First completed visit</p><h2 className="text-2xl font-bold my-3">{config.title}</h2><p>{config.idea}</p>
      <ul className="my-4 space-y-3">{state.report.results.map(r => <li key={r.round}><strong>{config.rounds[r.round].title}: </strong>{r.helped ? 'used the demonstration' : r.attempts === 1 ? 'correct on the first submitted answer without the demonstration' : 'tried again without the demonstration'}. {r.attempts} submitted {r.attempts === 1 ? 'answer' : 'answers'}.</li>)}</ul>
      <p className="text-sm">This describes the activity, not mastery. We cannot observe help away from the screen. Replays keep this first recap.</p><p className="mt-4 font-bold">Try it together: {config.prompt}</p>
    </section>
  })
}
