import { parentLearningSnapshot } from '../utils/parentLearningSnapshot.js'

export default function ParentLearningSnapshot({ progress, ageGroup, profileName, onBack }) {
  const recap = parentLearningSnapshot(progress, ageGroup)
  return <section aria-label="Learning at a glance" className="mx-4 mb-5 rounded-3xl border border-green-200 bg-white p-5 sm:p-7 text-green-950 shadow-sm">
    <p className="text-xs font-bold uppercase tracking-widest text-green-700">Learning at a glance</p>
    <h2 className="font-bubble text-2xl mt-2">{profileName || 'Your child'}'s next little discovery</h2>
    <p className="mt-2 text-sm text-green-800">{recap.active ? recap.firstVisit ? 'First completed visit to this adventure. Replays keep that original recap.' : 'A saved adventure in progress. It is fine to finish another time.' : 'Start with a short adventure. The recorded learning will appear here.'}</p>
    <dl className="my-5 grid gap-4 sm:grid-cols-3">
      <div><dt className="font-bold">{recap.active ? 'What they tried' : 'A place to begin'}</dt><dd className="text-sm mt-1"><strong>{recap.title}</strong><br/>{recap.idea}</dd></div>
      <div><dt className="font-bold">What is completed</dt><dd className="text-sm mt-1">{recap.completed}</dd></div>
      <div><dt className="font-bold">{recap.evidenceTitle || 'Help in the activity'}</dt><dd className="text-sm mt-1">{recap.help}{recap.observations?.length > 0 && <ul className="mt-2 space-y-2">{recap.observations.map(observation => <li key={observation}>{observation}</li>)}</ul>}</dd></div>
    </dl>
    <div className="rounded-2xl bg-amber-50 p-4"><h3 className="font-bold">Try together away from the screen</h3><p className="text-sm mt-1">{recap.prompt}</p></div>
    <div className="mt-4"><h3 className="font-bold">Suggested next: {recap.nextTitle}</h3><p className="text-sm mt-1">{recap.nextReason}</p><button onClick={onBack} className="mt-3 min-h-12 rounded-2xl bg-green-800 text-white px-5 py-3 font-bold">Back to your child's adventures</button></div>
    <p className="text-xs mt-4 text-green-800">This overview covers the picnic adventures{ageGroup === 'early' ? ', floating and sinking, and shadow discoveries' : ''} for this age group. Activity records describe what happened here; they do not establish mastery or show help given away from the screen.</p>
  </section>
}
