import { getHomeToWorldView } from '../utils/homeToWorld.js'

export default function HomeToWorldSummary({
  progress = {},
  profileName = 'Your child',
  ageGroup = 'early',
}) {
  const view = getHomeToWorldView(progress, ageGroup)
  if (view.completed === 0) return null

  return (
    <section
      className="mx-4 mb-4 overflow-hidden rounded-lg border border-[#c9d9dd] bg-white shadow"
      data-testid="home-to-world-summary"
    >
      <div className="bg-[#153f49] p-4 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-round text-[10px] font-black uppercase tracking-[.15em] text-[#7ee0d2]">
              From Home to the World
            </p>
            <h2 className="mt-1 font-bubble text-2xl">{profileName}'s place story</h2>
            <p className="mt-1 font-round text-xs font-bold text-white/70">
              {view.completed} of {view.total} connected discoveries saved
            </p>
          </div>
          <span className="text-4xl">{view.artifact?.emoji || '🧭'}</span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-[#62d5c5]" style={{ width: `${view.progressPercent}%` }} />
        </div>
      </div>

      <div className="p-4">
        {view.nextLesson && (
          <div className="border-b border-[#e2e8ea] pb-3">
            <p className="font-round text-[10px] font-black uppercase tracking-[.14em] text-[#26756c]">Next connection</p>
            <p className="mt-1 font-round text-sm font-black text-[#263239]">
              Day {view.nextLesson.day}: {view.nextLesson.title}
            </p>
          </div>
        )}

        <p className="mt-3 font-round text-[10px] font-black uppercase tracking-[.14em] text-[#26756c]">
          Continue away from the screen
        </p>
        <div className="mt-2 grid gap-3">
          {view.recent.map(record => (
            <div key={record.id} className="border-t border-[#e5e9e7] pt-3 first:border-0 first:pt-0">
              <p className="font-round text-xs font-black text-[#263239]">{record.title}</p>
              <p className="mt-1 font-round text-[11px] font-bold leading-relaxed text-[#69616c]">
                Try together: {record.offline}
              </p>
              <p className="mt-1 font-round text-[11px] font-bold leading-relaxed text-[#69616c]">
                Ask: {record.parentPrompt}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
