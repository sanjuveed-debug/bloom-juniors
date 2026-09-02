import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const AGE_LABELS = { toddler: 'Ages 3-4', early: 'Ages 4-6', junior: 'Ages 7-9' }
const MODULE_LABELS = {
  alphabet: 'Letter Tree', numbers: 'Number World', colours: 'Colours', shapes: 'Shapes',
  animals: 'Animals', fruits: 'Fruits', bodyparts: 'My Body', phonics: 'Sound Pop',
  math: 'Number World', tricky: 'Star Catch', story: 'Story Room', science: 'Science',
  worldgk: 'World Explorer', planets: 'Planet World', anatomy: 'My Body', sacred: 'Sacred Stories',
  logic: 'Puzzle Quest', davinci: 'Da Vinci Studio', exercise: 'Movement', shop: 'Coin Shop',
  timestables: 'Times Tables', fractions: 'Fractions', wordproblems: 'Word Problems',
  reading: 'Reading', spelling: 'Spelling', grammar: 'Grammar', worldmap: 'World Map',
  spirituality: 'World Faiths',
}

function rate(value) {
  return value == null ? '—' : `${value}%`
}

function Metric({ label, value, note, critical = false }) {
  return (
    <div className="min-w-0 border-b border-slate-200 px-4 py-4 sm:border-b-0 sm:border-r last:border-r-0">
      <p className="font-round text-[10px] font-black uppercase tracking-[.14em] text-slate-500">{label}</p>
      <p className={`mt-1 font-bubble text-3xl ${critical ? 'text-rose-700' : 'text-slate-950'}`}>{value}</p>
      <p className="mt-1 font-round text-xs font-bold text-slate-500">{note}</p>
    </div>
  )
}

function Section({ title, subtitle, children, action }) {
  return (
    <section className="min-w-0 border-t border-slate-200 bg-white px-4 py-5 sm:px-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-bubble text-xl text-slate-950">{title}</h2>
          {subtitle && <p className="mt-1 font-round text-xs font-bold text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function ActivityChart({ daily = [] }) {
  const max = Math.max(1, ...daily.map(day => Math.max(day.active, day.completions, day.registrations || 0)))
  const renderBars = (display, className) => (
    <div className={className}>
      <div className="flex items-end gap-1" style={{ height: 180 }}>
        {display.map((day, index) => (
          <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${day.date}: ${day.active} active, ${day.completions} completions`}>
            <div className="flex h-36 w-full items-end justify-center gap-px border-b border-slate-200">
              <span className="w-1/4 bg-sky-500" style={{ height: `${Math.max(day.registrations ? 4 : 0, ((day.registrations || 0) / max) * 100)}%` }} />
              <span className="w-1/4 bg-emerald-600" style={{ height: `${Math.max(day.active ? 4 : 0, (day.active / max) * 100)}%` }} />
              <span className="w-1/4 bg-indigo-500" style={{ height: `${Math.max(day.completions ? 4 : 0, (day.completions / max) * 100)}%` }} />
            </div>
            {(display.length <= 7 || index % Math.max(1, Math.ceil(display.length / 7)) === 0 || index === display.length - 1) && (
              <span className="font-round text-[9px] font-bold text-slate-400">{day.date.slice(5)}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
  return (
    <div className="pb-2">
      {renderBars(daily.slice(-30), 'hidden min-w-[620px] sm:block')}
      {renderBars(daily.slice(-7), 'block sm:hidden')}
      <div className="mt-2 flex flex-wrap gap-4 font-round text-xs font-bold text-slate-600">
        <span><span className="mr-1 inline-block h-2 w-2 bg-sky-500" />Registered families</span>
        <span><span className="mr-1 inline-block h-2 w-2 bg-emerald-600" />Active profiles</span>
        <span><span className="mr-1 inline-block h-2 w-2 bg-indigo-500" />Completed activities</span>
      </div>
    </div>
  )
}

function HorizontalBars({ rows, max, color = '#4f46e5' }) {
  const ceiling = max || Math.max(1, ...rows.map(row => row.count))
  return (
    <div className="divide-y divide-slate-100">
      {rows.map(row => (
        <div key={row.id || row.label} className="grid grid-cols-[minmax(120px,1fr)_3fr_48px] items-center gap-3 py-2.5">
          <span className="font-round text-xs font-black text-slate-700">{row.label}</span>
          <span className="h-2 overflow-hidden bg-slate-100">
            <span className="block h-full" style={{ width: `${(row.count / ceiling) * 100}%`, background: color }} />
          </span>
          <span className="text-right font-bubble text-sm text-slate-900">{row.count}</span>
        </div>
      ))}
    </div>
  )
}

export default function FounderDashboard({ onBack, onLogout, initialData = null, onReactivationSend = null }) {
  const [range, setRange] = useState(30)
  const [data, setData] = useState(initialData)
  const [status, setStatus] = useState(initialData ? 'ready' : 'loading')
  const [error, setError] = useState('')
  const [reactivationState, setReactivationState] = useState({ status: 'idle', message: '' })

  const load = useCallback(async ({ force = false } = {}) => {
    if (initialData && !force) return
    setStatus('loading')
    setError('')
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token
      if (!token) throw new Error('Your secure login has expired. Sign in again.')
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      const response = await fetch(`/api/founder-retention?days=${range}&timezone=${encodeURIComponent(timezone)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error || 'Could not load retention data')
      setData(body)
      setStatus('ready')
    } catch (loadError) {
      setError(loadError.message || 'Could not load retention data')
      setStatus('error')
    }
  }, [initialData, range])

  useEffect(() => { load() }, [load])

  const sendReactivation = useCallback(async () => {
    setReactivationState({ status: 'sending', message: '' })
    try {
      let body
      if (onReactivationSend) {
        body = await onReactivationSend(data?.reactivation)
      } else {
        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData?.session?.access_token
        if (!token) throw new Error('Your secure login has expired. Sign in again.')
        const response = await fetch('/api/founder-reactivation', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignId: data?.reactivation?.campaignId, confirm: 'send' }),
        })
        body = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(body.error || 'Could not send reactivation email')
      }
      setReactivationState({
        status: 'sent',
        message: `${body.sent || 0} sent${body.failed ? `, ${body.failed} failed` : ''}.`,
      })
      if (initialData) {
        setData(current => ({
          ...current,
          reactivation: {
            ...current.reactivation,
            eligible: Math.max(0, (current.reactivation?.eligible || 0) - (body.sent || 0)),
          },
        }))
      } else {
        await load({ force: true })
      }
    } catch (sendError) {
      setReactivationState({ status: 'error', message: sendError.message || 'Could not send reactivation email.' })
    }
  }, [data?.reactivation, initialData, load, onReactivationSend])

  const biggestDrop = useMemo(() => {
    if (!data?.funnel?.length) return null
    return data.funnel.slice(1).reduce((worst, step, index) => {
      const previous = data.funnel[index]
      const drop = Math.max(0, (previous?.count || 0) - (step.count || 0))
      return !worst || drop > worst.drop ? { label: step.label, drop } : worst
    }, null)
  }, [data])

  if (status === 'loading') {
    return <main className="grid min-h-screen place-items-center bg-slate-100"><p className="font-bubble text-xl text-slate-700">Loading retention data...</p></main>
  }

  if (status === 'error') {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 p-5">
        <section className="w-full max-w-lg border border-rose-200 bg-white p-6 text-center shadow-sm">
          <h1 className="font-bubble text-2xl text-slate-950">Founder dashboard unavailable</h1>
          <p className="mt-2 font-round text-sm font-bold text-slate-600">{error}</p>
          <div className="mt-5 flex justify-center gap-2">
            <button type="button" onClick={load} className="min-h-11 bg-slate-900 px-4 font-round text-sm font-black text-white">Retry</button>
            <button type="button" onClick={onBack} className="min-h-11 border border-slate-300 bg-white px-4 font-round text-sm font-black text-slate-800">Back</button>
          </div>
        </section>
      </main>
    )
  }

  const summary = data?.summary || {}
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950" data-testid="founder-retention-dashboard">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="font-round text-[10px] font-black uppercase tracking-[.18em] text-emerald-700">Bloom Juniors · private</p>
            <h1 className="font-bubble text-2xl">Founder Retention</h1>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="flex flex-1 items-center gap-1 border border-slate-300 bg-slate-50 p-1 sm:flex-none" aria-label="Reporting range">
              {[7, 30, 90].map(days => (
                <button key={days} type="button" onClick={() => setRange(days)} className={`min-h-9 flex-1 px-3 font-round text-xs font-black sm:flex-none ${range === days ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>{days}d</button>
              ))}
            </div>
            <button type="button" onClick={load} aria-label="Refresh retention data" title="Refresh" className="grid h-11 w-11 shrink-0 place-items-center border border-slate-300 bg-white text-xl">↻</button>
            <button type="button" onClick={onBack} className="min-h-11 shrink-0 border border-slate-300 bg-white px-3 font-round text-xs font-black">Exit</button>
            {onLogout && <button type="button" onClick={onLogout} className="min-h-11 shrink-0 bg-slate-900 px-3 font-round text-xs font-black text-white">Sign out</button>}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl py-4 sm:px-4">
        <div className="border-y border-slate-200 bg-white sm:grid sm:grid-cols-2 sm:border lg:grid-cols-7">
          <Metric label="Registered today" value={summary.registeredToday || 0} note={`${summary.totalFamilyAccounts || 0} saved families`} />
          <Metric label="Child profiles" value={summary.totalProfiles || 0} note={`${summary.newToday || 0} created today`} />
          <Metric label="Active today" value={summary.activeToday || 0} note="Opened or completed learning" />
          <Metric label="First mission" value={rate(summary.firstMissionRate)} note={`${summary.firstMission || 0} profiles activated`} />
          <Metric label="Day 1 return" value={rate(summary.d1?.rate)} note={`${summary.d1?.retained || 0}/${summary.d1?.eligible || 0} eligible`} />
          <Metric label="Day 3 return" value={rate(summary.d3?.rate)} note={`${summary.d3?.retained || 0}/${summary.d3?.eligible || 0} eligible`} />
          <Metric label="Day 7 return" value={rate(summary.d7?.rate)} note={`${summary.d7?.retained || 0}/${summary.d7?.eligible || 0} eligible`} critical={summary.d7?.rate != null && summary.d7.rate < 20} />
        </div>

        {Number(summary.incompleteAuthAccounts) > 0 && (
          <div className="mt-3 border border-amber-300 bg-amber-50 px-4 py-3 font-round text-xs font-bold text-amber-950">
            Auth diagnostic: {summary.authCreatedYesterday || 0} login account(s) created yesterday;
            {' '}{summary.incompleteCreatedYesterday || 0} did not produce a saved guardian profile.
            {' '}{summary.incompleteAuthAccounts || 0} auth account(s) are currently unlinked in total.
          </div>
        )}

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_1.95fr]">
          <Section title="Activation funnel" subtitle={`Real family conversion · ${summary.excludedTestAccounts || 0} test/UAT accounts excluded`}>
            <div className="divide-y divide-slate-100">
              {(data.funnel || []).map(step => (
                <div key={step.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-round text-sm font-black text-slate-800">{step.label}</p>
                    {step.eligible != null && <p className="font-round text-[10px] font-bold text-slate-400">{step.eligible} eligible</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bubble text-xl">{step.count}</p>
                    <p className="font-round text-xs font-black text-slate-500">{rate(step.rate)}</p>
                  </div>
                </div>
              ))}
            </div>
            {biggestDrop?.drop > 0 && <p className="mt-3 border-l-4 border-rose-500 bg-rose-50 p-3 font-round text-xs font-black text-rose-900">Largest current loss: {biggestDrop.drop} families before “{biggestDrop.label}”.</p>}
          </Section>

          <Section title="Daily activity" subtitle={`${data.rangeDays || range} local calendar days · ${data.timezone || 'UTC'}`}>
            <ActivityChart daily={data.daily || []} />
          </Section>
        </div>

        <div className="mt-4">
          <Section
            title="First-session activation"
            subtitle={`Profiles created since ${data.firstSession?.trackingStartedAt || '2026-08-06'}; each rate is from the previous step`}
          >
            <div className="grid border border-slate-200 sm:grid-cols-5">
              {(data.firstSession?.funnel || []).map((step, index) => (
                <div key={step.id} className="border-b border-slate-200 p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                  <p className="font-round text-[10px] font-black uppercase text-slate-500">Step {index + 1}</p>
                  <p className="mt-1 font-bubble text-3xl text-slate-950">{step.count}</p>
                  <p className="font-round text-xs font-black text-slate-700">{step.label}</p>
                  <p className="mt-1 font-round text-[10px] font-bold text-slate-500">
                    {index === 0 ? 'New tracked profiles' : `${rate(step.rate)} from previous step`}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="mt-4">
          <Section
            title="Seven-step starter path"
            subtitle={`Profiles created since ${data.starterPath?.trackingStartedAt || '2026-08-06'}; each rate is from the previous completed step`}
          >
            <div className="grid border border-slate-200 sm:grid-cols-7">
              {(data.starterPath?.funnel || []).map((step, index) => (
                <div key={step.id} className="border-b border-slate-200 p-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                  <p className="font-round text-[10px] font-black uppercase text-slate-500">Step {index + 1}</p>
                  <p className="mt-1 font-bubble text-3xl text-slate-950">{step.count}</p>
                  <p className="font-round text-[11px] font-black text-slate-700">Completed</p>
                  <p className="mt-1 font-round text-[10px] font-bold text-slate-500">{rate(step.rate)} continued</p>
                </div>
              ))}
            </div>
            <p className="mt-3 font-round text-xs font-bold text-slate-500">This shows exactly which starter step families stop after. It uses aggregate session counts and returns no child identifiers.</p>
          </Section>
        </div>

        <div className="mt-4">
          <Section
            title="Acquisition quality"
            subtitle={`First-touch tracking from ${data.acquisition?.trackingStartedAt || '2026-08-10'} · aggregate family data only`}
          >
            <div className="mb-4 border-l-4 border-sky-500 bg-sky-50 p-3 font-round text-xs font-bold text-sky-950">
              {data.acquisition?.trackedAccounts || 0} of {data.acquisition?.totalAccounts || 0} login accounts have durable source data. Older accounts remain in Pre-tracking / unknown.
            </div>
            <div className="divide-y divide-slate-200 border border-slate-200" data-testid="acquisition-source-table">
              {(data.acquisition?.sources || []).map(source => (
                <div key={source.id} className="p-4">
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <p className="font-bubble text-lg text-slate-950">{source.label}</p>
                      <p className="font-round text-[10px] font-bold text-slate-500">{source.accounts} login accounts</p>
                    </div>
                    <p className="font-round text-xs font-black text-slate-700">{rate(source.activationRate)} family activation</p>
                  </div>
                  <div className="mt-3 grid grid-cols-3 divide-x border border-slate-200 sm:grid-cols-6">
                    {[
                      ['Parent setup', source.parentSetups],
                      ['Profile families', source.profileFamilies],
                      ['First mission', source.activatedFamilies],
                      ['Day 1', rate(source.d1?.rate)],
                      ['Day 3', rate(source.d3?.rate)],
                      ['Day 7', rate(source.d7?.rate)],
                    ].map(([label, value], index) => (
                      <div key={label} className={`min-w-0 p-2.5 ${index >= 3 ? 'border-t sm:border-t-0' : ''}`}>
                        <p className="font-bubble text-xl text-slate-950">{value}</p>
                        <p className="break-words font-round text-[9px] font-black uppercase text-slate-500">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <h3 className="font-round text-xs font-black uppercase tracking-wider text-slate-600">Landing pages</h3>
                <HorizontalBars rows={(data.acquisition?.landingPages || []).map(row => ({ ...row, count: row.accounts }))} color="#0284c7" />
              </div>
              <div>
                <h3 className="font-round text-xs font-black uppercase tracking-wider text-slate-600">Visitor timezones</h3>
                <HorizontalBars rows={(data.acquisition?.timezones || []).map(row => ({ ...row, count: row.accounts }))} color="#0f766e" />
              </div>
            </div>
          </Section>
        </div>

        <div className="mt-4">
          <Section
            title="Founding Families pilot"
            subtitle="Privacy-safe cohort from the /pilot invitation route"
          >
            <div className="grid border border-slate-200 sm:grid-cols-5">
              {[
                ['Enrolled profiles', data.foundingPilot?.profiles || 0, 'Campaign marker recorded'],
                ['First mission', rate(data.foundingPilot?.activationRate), `${data.foundingPilot?.activated || 0} activated`],
                ['Day 1', rate(data.foundingPilot?.d1?.rate), `${data.foundingPilot?.d1?.retained || 0}/${data.foundingPilot?.d1?.eligible || 0} eligible`],
                ['Day 3', rate(data.foundingPilot?.d3?.rate), `${data.foundingPilot?.d3?.retained || 0}/${data.foundingPilot?.d3?.eligible || 0} eligible`],
                ['Day 7', rate(data.foundingPilot?.d7?.rate), `${data.foundingPilot?.d7?.retained || 0}/${data.foundingPilot?.d7?.eligible || 0} eligible`],
              ].map(([label, value, note]) => (
                <div key={label} className="border-b border-slate-200 p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                  <p className="font-round text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</p>
                  <p className="mt-1 font-bubble text-3xl text-slate-950">{value}</p>
                  <p className="mt-1 font-round text-[10px] font-bold text-slate-500">{note}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Section title="Today's journey position" subtitle="Where family profiles currently stop">
            <HorizontalBars rows={data.journeyStages || []} color="#0f766e" />
          </Section>
          <Section title="Return reminders" subtitle="Delivery settings, opens, and learning after return">
            <div className="grid grid-cols-2 divide-x divide-y border border-slate-200 sm:grid-cols-5 sm:divide-y-0">
              {[
                ['Push enabled', data.notifications?.pushEnabled || 0],
                ['Email enabled', data.notifications?.emailEnabled || 0],
                ['Sent today', data.notifications?.sentToday || 0],
                ['Reminder opens', data.notifications?.opens || 0],
                ['Learning returns', data.notifications?.learningReturns || 0],
              ].map(([label, value]) => (
                <div key={label} className="p-3">
                  <p className="font-bubble text-2xl">{value}</p>
                  <p className="font-round text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="mt-4">
          <Section
            title="First Mission Return Loop"
            subtitle={`Unique profiles in the selected ${data.rangeDays || range}-day range; each rate is from the previous step`}
          >
            <div className="grid border border-slate-200 sm:grid-cols-5">
              {(data.returnLoop?.funnel || []).map((step, index) => (
                <div key={step.id} className="border-b border-slate-200 p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                  <p className="font-round text-[10px] font-black uppercase text-slate-500">Step {index + 1}</p>
                  <p className="mt-1 font-bubble text-3xl text-slate-950">{step.count}</p>
                  <p className="font-round text-xs font-black text-slate-700">{step.label}</p>
                  <p className="mt-1 font-round text-[10px] font-bold text-slate-500">
                    {index === 0 ? 'Activated profiles' : `${rate(step.rate)} from previous step`}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="mt-4">
          <Section title="One-time reactivation" subtitle={`Inactive for ${data.reactivation?.inactiveDays || 3}+ days and explicitly opted into email reminders`}>
            <div className="flex flex-col gap-4 border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bubble text-3xl text-slate-950">{data.reactivation?.eligible || 0}</p>
                <p className="font-round text-sm font-black text-slate-800">eligible families</p>
                <p className="mt-1 max-w-2xl font-round text-xs font-bold text-slate-500">One email per family, using the child profile whose opted-in learning was most recently active. Test, school, and already-contacted accounts are excluded.</p>
              </div>
              <div className="shrink-0 sm:text-right">
                {reactivationState.status === 'idle' && (
                  <button
                    type="button"
                    disabled={!data.reactivation?.eligible}
                    onClick={() => setReactivationState({ status: 'confirm', message: '' })}
                    className="min-h-11 bg-slate-900 px-4 font-round text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Review one-time send
                  </button>
                )}
                {reactivationState.status === 'confirm' && (
                  <div data-testid="reactivation-confirmation" className="border border-amber-300 bg-amber-50 p-3 text-left">
                    <p className="font-round text-xs font-black text-amber-950">Send once to {data.reactivation?.eligible || 0} opted-in families?</p>
                    <div className="mt-2 flex gap-2">
                      <button type="button" onClick={sendReactivation} className="min-h-10 bg-rose-700 px-3 font-round text-xs font-black text-white">Send now</button>
                      <button type="button" onClick={() => setReactivationState({ status: 'idle', message: '' })} className="min-h-10 border border-slate-300 bg-white px-3 font-round text-xs font-black">Cancel</button>
                    </div>
                  </div>
                )}
                {reactivationState.status === 'sending' && <p className="font-round text-sm font-black text-slate-600">Sending and recording each delivery...</p>}
                {reactivationState.status === 'sent' && <p data-testid="reactivation-result" className="font-round text-sm font-black text-emerald-800">{reactivationState.message}</p>}
                {reactivationState.status === 'error' && <p className="max-w-sm font-round text-sm font-black text-rose-800">{reactivationState.message}</p>}
              </div>
            </div>
          </Section>
        </div>

        <div className="mt-4">
          <Section
            title="Avatar Workshop funnel"
            subtitle={`Unique profiles in the selected ${data.rangeDays || range}-day range · repeated taps are deduplicated`}
          >
            <div className="grid border border-slate-200 sm:grid-cols-4">
              {(data.avatarWorkshop?.funnel || []).map((step, index) => (
                <div key={step.id} className="border-b border-slate-200 p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                  <p className="font-round text-[10px] font-black uppercase text-slate-500">Step {index + 1}</p>
                  <p className="mt-1 font-bubble text-3xl text-slate-950">{step.count}</p>
                  <p className="font-round text-xs font-black text-slate-700">{step.label}</p>
                  <p className="mt-1 font-round text-[10px] font-bold text-slate-500">
                    {index === 0 ? `${data.avatarWorkshop?.coinAwards || 0} coins awarded` : `${rate(step.rate)} from previous step`}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <Section title="Retention by age" subtitle="Use eligible counts before interpreting percentages">
          <div className="space-y-3 sm:hidden">
            {(data.ages || []).map(row => (
              <div key={row.ageGroup} className="border border-slate-200">
                <div className="flex items-center justify-between bg-slate-50 px-3 py-2">
                  <p className="font-round text-sm font-black">{AGE_LABELS[row.ageGroup] || row.ageGroup}</p>
                  <p className="font-round text-xs font-bold text-slate-500">{row.profiles} profiles · {rate(row.activationRate)} activated</p>
                </div>
                <div className="grid grid-cols-3 divide-x divide-slate-200">
                  {[['D1', row.d1], ['D3', row.d3], ['D7', row.d7]].map(([label, metric]) => (
                    <div key={label} className="p-3">
                      <p className="font-round text-[10px] font-black uppercase text-slate-500">{label}</p>
                      <p className="font-bubble text-xl">{rate(metric.rate)}</p>
                      <p className="font-round text-[9px] font-bold text-slate-400">{metric.retained}/{metric.eligible} eligible</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead><tr className="border-y border-slate-200 bg-slate-50">
                {['Age band', 'Profiles', 'First mission', 'Day 1', 'Day 3', 'Day 7'].map(label => <th key={label} className="px-3 py-2 font-round text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</th>)}
              </tr></thead>
              <tbody>{(data.ages || []).map(row => <tr key={row.ageGroup} className="border-b border-slate-100">
                <td className="px-3 py-3 font-round text-sm font-black">{AGE_LABELS[row.ageGroup] || row.ageGroup}</td>
                <td className="px-3 py-3 font-bubble">{row.profiles}</td>
                <td className="px-3 py-3 font-round text-sm font-black">{rate(row.activationRate)} <span className="text-slate-400">({row.activated})</span></td>
                <td className="px-3 py-3 font-round text-sm font-black">{rate(row.d1.rate)} <span className="text-slate-400">({row.d1.eligible})</span></td>
                <td className="px-3 py-3 font-round text-sm font-black">{rate(row.d3.rate)} <span className="text-slate-400">({row.d3.eligible})</span></td>
                <td className="px-3 py-3 font-round text-sm font-black">{rate(row.d7.rate)} <span className="text-slate-400">({row.d7.eligible})</span></td>
              </tr>)}</tbody>
            </table>
          </div>
        </Section>

        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Learning modules" subtitle="Completed sessions, not button taps">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[460px]">
                <thead><tr className="border-y border-slate-200 bg-slate-50">
                  {['Module', 'Last 7d', 'All completions', 'Profiles'].map(label => <th key={label} className="px-3 py-2 text-left font-round text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</th>)}
                </tr></thead>
                <tbody>{(data.modules || []).map(row => <tr key={row.module} className="border-b border-slate-100">
                  <td className="px-3 py-2.5 font-round text-sm font-black">{MODULE_LABELS[row.module] || row.module}</td>
                  <td className="px-3 py-2.5 font-bubble">{row.last7}</td>
                  <td className="px-3 py-2.5 font-round text-sm font-bold">{row.completions}</td>
                  <td className="px-3 py-2.5 font-round text-sm font-bold">{row.uniqueProfiles}</td>
                </tr>)}</tbody>
              </table>
            </div>
          </Section>

          <Section title="Parent check-ins" subtitle="Aggregated Day 3 and Day 7 answers">
            <div className="space-y-5">
              {(data.feedback || []).map(prompt => (
                <div key={prompt.id}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-round text-sm font-black text-slate-800">{prompt.question}</p>
                    <span className="shrink-0 font-round text-[10px] font-bold text-slate-400">{prompt.answered} answers · {prompt.dismissed} dismissed</span>
                  </div>
                  <HorizontalBars rows={prompt.options} color={prompt.id === 'd3' ? '#be123c' : '#4f46e5'} />
                </div>
              ))}
            </div>
          </Section>
        </div>

        <footer className="border-t border-slate-200 px-4 py-5 font-round text-xs font-bold text-slate-500 sm:px-6">
          <p>{data.definitions?.cohortStart}</p>
          <p className="mt-1">{data.definitions?.retention}</p>
          <p className="mt-1">{data.definitions?.foundingPilot}</p>
          <p className="mt-1 font-black text-emerald-800">{data.definitions?.privacy}</p>
          <p className="mt-3 text-slate-400">Generated {new Date(data.generatedAt).toLocaleString()} · Refresh before making a product decision.</p>
        </footer>
      </div>
    </main>
  )
}
