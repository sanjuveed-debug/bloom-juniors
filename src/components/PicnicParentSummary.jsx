import { normalizePicnicProgress } from '../utils/picnicProgress.js'

export default function PicnicParentSummary({ progress }) {
  const { state } = normalizePicnicProgress(progress.picnic)
  if (!state.report) return null
  return <section className="rounded-3xl bg-amber-50 text-green-950 p-6 mb-5" aria-label="Picnic learning recap">
    <p className="text-xs font-bold tracking-widest uppercase">The Picnic · First completed visit</p>
    <h2 className="text-2xl font-bold my-3">A place for everyone</h2>
    <p>Your child matched one plate to each friend in two arrangements.</p>
    <ul className="my-4 space-y-3">{state.report.results.map(result => <li key={result.round}>
      <strong>{result.round === 0 ? 'Four friends' : 'Three friends in new places'}: </strong>
      {result.helped ? 'used the demonstration' : result.attempts === 1 ? 'correct on the first submitted arrangement without the demonstration' : 'tried again without the demonstration'}.
      {' '}{result.attempts} submitted {result.attempts === 1 ? 'arrangement' : 'arrangements'}.
    </li>)}</ul>
    <p className="text-sm">This describes the activity, not mastery. We cannot observe help given away from the screen. Replays keep this first recap.</p>
    <p className="mt-4 font-bold">Try it at dinner: “Can you put out one spoon for each person? How could we check everyone has one?”</p>
  </section>
}
