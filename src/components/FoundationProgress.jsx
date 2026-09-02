import { getFoundationProgress } from '../utils/foundationRecommendations.js'

const STRAND_COLOURS = {
  'thinking-communication': '#6d3db0',
  'world-systems': '#138760',
  'people-place-time': '#176ea6',
  'roots-culture-meaning': '#b84d31',
  'self-relationships-agency': '#b07a13',
}

export default function FoundationProgress({ progress = {}, profileName = 'Your child' }) {
  const strands = getFoundationProgress(progress)

  return (
    <section className="mx-4 mb-4 rounded-lg bg-white/90 p-4 shadow" data-testid="foundation-progress">
      <p className="font-round text-[10px] font-black uppercase tracking-[.16em] text-[#695477]">Foundation balance</p>
      <h2 className="mt-1 font-bubble text-xl text-[#30243a]">{profileName}'s wider learning</h2>
      <p className="mt-1 font-round text-xs font-bold leading-relaxed text-[#74647d]">
        This shows meaningful experiences from the last four weeks, not test scores.
      </p>
      <div className="mt-4 grid gap-3">
        {strands.map(strand => {
          const colour = STRAND_COLOURS[strand.id]
          return (
            <div key={strand.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-round text-sm font-black text-[#30243a]">
                    {strand.name}{strand.priority ? ' · priority' : ''}
                  </p>
                  <p className="font-round text-[11px] font-bold text-[#7b6b84]">
                    {strand.status} · {strand.recentExperiences} experience{strand.recentExperiences === 1 ? '' : 's'}
                  </p>
                </div>
                <span className="shrink-0 font-round text-xs font-black" style={{ color: colour }}>{strand.coverage}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#ece7ef]">
                <div className="h-full rounded-full transition-[width]" style={{ width: `${strand.coverage}%`, background: colour }} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
