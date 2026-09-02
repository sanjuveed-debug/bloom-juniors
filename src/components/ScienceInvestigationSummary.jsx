import { getScienceInvestigationView } from '../utils/scienceInvestigations.js'

export default function ScienceInvestigationSummary({ progress = {}, profileName = 'Your child' }) {
  const view = getScienceInvestigationView(progress)
  if (view.completed === 0) return null

  return (
    <section className="mx-4 mb-4 overflow-hidden rounded-lg border border-[#cfdad5] bg-white shadow" data-testid="science-investigation-summary">
      <div className="bg-[#263239] p-4 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-round text-[10px] font-black uppercase tracking-[.15em] text-[#7ee0ba]">Science Field Journal</p>
            <h2 className="mt-1 font-bubble text-2xl">{profileName}'s investigations</h2>
            <p className="mt-1 font-round text-xs font-bold text-white/70">{view.completed} of {view.total} evidence-based investigations saved</p>
          </div>
          <span className="text-4xl">{view.complete ? view.artifact?.emoji : '🔬'}</span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-[#62d5ad]" style={{ width: `${view.progressPercent}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-4 border-b border-[#e0e6e3]">
        {view.trails.map(trail => (
          <div key={trail.id} className="px-1 py-3 text-center">
            <p className="text-xl">{trail.badge?.emoji || trail.emoji}</p>
            <p className="mt-1 font-bubble text-sm" style={{ color: trail.colour }}>{trail.completed}/4</p>
          </div>
        ))}
      </div>

      {view.recent.length > 0 && (
        <div className="p-4">
          <p className="font-round text-[10px] font-black uppercase tracking-[.14em] text-[#26755b]">Recent evidence and conversation</p>
          <div className="mt-2 grid gap-3">
            {view.recent.map(record => (
              <div key={record.id} className="border-t border-[#e5e9e7] pt-3 first:border-0 first:pt-0">
                <p className="font-round text-xs font-black text-[#263239]">{record.question}</p>
                <p className="mt-1 font-round text-[11px] font-bold leading-relaxed text-[#69616c]">Try together: {record.activity}</p>
                <p className="mt-1 font-round text-[11px] font-bold leading-relaxed text-[#69616c]">Ask: {record.parentPrompt}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
