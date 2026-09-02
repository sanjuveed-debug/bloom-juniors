import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { trackEvent, trackEventOnce } from '../utils/analytics.js'
import {
  enrollFoundingPilot,
  getFoundingPilotStartUrl,
} from '../utils/foundingPilot.js'

const DAYS = [
  ['1', 'First mission'],
  ['2', 'Continue'],
  ['3', 'Parent check-in'],
  ['4', 'New chapter'],
  ['5', 'Wonder'],
  ['6', 'Build'],
  ['7', 'Review'],
]

function PilotMark() {
  return (
    <a href="/" className="inline-flex min-h-11 items-center gap-3" aria-label="Bloom Juniors home">
      <img src="/favicon-bloom-v3.svg?v=20260730" alt="" className="h-10 w-10" />
      <span className="font-bubble text-xl text-[#102b3f]">Bloom Juniors</span>
    </a>
  )
}

export default function PilotPage({ hasAccount = false }) {
  const [shared, setShared] = useState(false)

  useEffect(() => {
    document.title = 'Founding Families Pilot | Bloom Juniors'
    trackEventOnce('founding-pilot-page', 'founding_pilot_page_view', {}, 'session')
  }, [])

  const start = () => {
    enrollFoundingPilot()
    trackEvent('founding_pilot_start', { has_account: hasAccount })
    window.location.href = getFoundingPilotStartUrl()
  }

  const share = async () => {
    const url = `${window.location.origin}/pilot`
    const data = {
      title: 'Bloom Juniors Founding Families Pilot',
      text: 'Try Bloom Juniors for seven short learning days and help improve it for families.',
      url,
    }
    try {
      if (navigator.share) {
        await navigator.share(data)
      } else {
        await navigator.clipboard.writeText(url)
        setShared(true)
        window.setTimeout(() => setShared(false), 1800)
      }
      trackEvent('founding_pilot_share')
    } catch {}
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7faf9] text-[#102b3f]" data-testid="founding-pilot-page">
      <header className="border-b border-[#dbe7e3] bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <PilotMark />
          <button
            type="button"
            onClick={share}
            className="min-h-11 border border-[#bed2cb] bg-white px-4 font-round text-sm font-black text-[#24564d]"
          >
            {shared ? 'Link copied' : 'Share invite'}
          </button>
        </div>
      </header>

      <section className="relative border-b border-[#dbe7e3] bg-[#102b3f] text-white">
        <div className="mx-auto grid min-h-[560px] max-w-6xl items-center gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1.15fr_.85fr] lg:py-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <p className="font-round text-xs font-black uppercase tracking-[.16em] text-[#63dfbd]">
              Founding Families Pilot
            </p>
            <h1 className="mt-3 font-bubble text-4xl leading-[1.08] sm:text-5xl">
              Seven short days. One honest question: will your child come back?
            </h1>
            <p className="mt-5 max-w-xl font-round text-base font-bold leading-7 text-white/75 sm:text-lg">
              Give Bloom Juniors about 10 minutes a day. Your child follows one clear learning path;
              you tell us what helped and what got in the way.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={start}
                className="min-h-14 bg-[#f05a28] px-7 font-bubble text-lg text-white shadow-[0_10px_24px_rgba(240,90,40,.28)]"
              >
                {hasAccount ? "Start today's mission" : 'Join the 7-day pilot'}
              </button>
              <a
                href="/?app=1"
                className="inline-grid min-h-14 place-items-center border border-white/35 px-7 font-round text-sm font-black text-white"
              >
                {hasAccount ? 'Open Bloom normally' : 'Already registered? Sign in'}
              </a>
            </div>
            <p className="mt-4 font-round text-xs font-bold text-white/55">
              Free, ad-free and parent-managed. Ages 3-9.
            </p>
          </motion.div>

          <div className="relative mx-auto w-full max-w-[430px] self-end lg:self-center">
            <div className="absolute inset-x-8 bottom-0 h-10 bg-black/25 blur-xl" aria-hidden="true" />
            <img
              src="/skyship-yaagvi.png"
              alt="Yaagvi guiding a Bloom Juniors learning adventure"
              className="relative mx-auto max-h-[390px] w-full object-contain"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-[#dbe7e3] bg-white px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="font-round text-xs font-black uppercase tracking-[.14em] text-[#0d7c68]">The week</p>
              <h2 className="mt-1 font-bubble text-2xl sm:text-3xl">A small routine, not another programme</h2>
            </div>
            <p className="font-round text-sm font-bold text-[#52706a]">One path each day. Stop when it says complete.</p>
          </div>

          <div className="mt-6 grid grid-cols-2 border border-[#dbe7e3] sm:grid-cols-4 lg:grid-cols-7">
            {DAYS.map(([day, label], index) => (
              <div
                key={day}
                className="min-h-[108px] border-b border-r border-[#dbe7e3] p-4 last:border-r-0 sm:[&:nth-child(4)]:border-r-0 lg:border-b-0 lg:[&:nth-child(4)]:border-r"
              >
                <span className={`grid h-8 w-8 place-items-center rounded-full font-bubble text-sm ${index === 0 ? 'bg-[#f05a28] text-white' : 'bg-[#e6f4ef] text-[#176c5d]'}`}>
                  {day}
                </span>
                <p className="mt-3 font-round text-xs font-black text-[#274d47]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#edf6f2] px-5 py-9 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          <div>
            <p className="font-round text-xs font-black uppercase tracking-[.14em] text-[#0d7c68]">What we ask</p>
            <h2 className="mt-2 font-bubble text-2xl">Three things from a grown-up</h2>
            <ol className="mt-5 space-y-4">
              {[
                'Let your child choose and tap without explaining the dashboard first.',
                'Return on the days that genuinely fit your family; do not force a perfect streak.',
                'Answer the short Day 3 and Day 7 check-ins honestly.',
              ].map((item, index) => (
                <li key={item} className="flex gap-3 font-round text-sm font-bold leading-6 text-[#365c55]">
                  <span className="grid h-7 w-7 shrink-0 place-items-center bg-[#102b3f] font-bubble text-xs text-white">{index + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="border-l-4 border-[#f05a28] bg-white p-5 sm:p-6">
            <p className="font-round text-xs font-black uppercase tracking-[.14em] text-[#c3461f]">Privacy promise</p>
            <h2 className="mt-2 font-bubble text-2xl">We measure the journey, not the child</h2>
            <p className="mt-3 font-round text-sm font-bold leading-6 text-[#52706a]">
              The founder view shows aggregate activation and return rates. It does not expose child
              names, guardian emails or profile identifiers.
            </p>
            <button
              type="button"
              onClick={start}
              className="mt-5 min-h-12 bg-[#0d7c68] px-6 font-bubble text-base text-white"
            >
              {hasAccount ? 'Continue the pilot' : 'Start with a parent account'}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
