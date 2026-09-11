import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import BloomLogo from '../components/BloomLogo'
import SchoolEnquiryForm from '../components/SchoolEnquiryForm'
import SchoolDiscoveryKit from '../components/SchoolDiscoveryKit'
import ActivityArtwork from '../components/ActivityArtwork'
import { trackEvent, trackEventOnce } from '../utils/analytics.js'

const INK = '#193251'
const MUTED = '#66758A'
const PURPLE = '#376348'
const PURPLE_DARK = '#294d38'
const PINK = '#FF6FA8'
const MINT = '#2F9F7F'
const LINE = 'rgba(25,50,81,0.12)'

function trackSchoolCta(cta, location) {
  trackEvent('school_cta_click', { cta, location })
}

const CURRICULUM = [
  {
    stage: 'Nursery',
    ages: 'Ages 3-4',
    focus: 'Colours, shapes, counting, language and movement',
    color: PINK,
  },
  {
    stage: 'Reception & KS1',
    ages: 'Ages 4-6',
    focus: 'Phonics, tricky words, early maths and stories',
    color: MINT,
  },
  {
    stage: 'Early KS2',
    ages: 'Ages 7-9',
    focus: 'Times tables, fractions, spelling, grammar and science',
    color: PURPLE,
  },
]

const SAFETY = [
  'No child email addresses or passwords',
  'No advertising or child-to-child messaging',
  'Class codes only reveal the correct roster',
  'Read our privacy policy before adding pupil information',
  'Works in a browser on tablets, Chromebooks and PCs',
  'Teacher-controlled lesson and session length',
]

function ClassroomPreview() {
  return <a href="#discovery-kit" className="block overflow-hidden rounded-3xl bg-[#f5f4eb] text-[#243e35] shadow-xl">
    <ActivityArtwork id="shadow-discovery" />
    <div className="p-7">
      <p className="font-round text-sm font-bold">Try it now, without an account</p>
      <h2 className="mt-2 font-bubble text-3xl">What changes a shadow?</h2>
      <p className="mt-3 font-round leading-relaxed">A prediction, a torch, and a discovery to talk about together.</p>
      <span className="mt-5 inline-flex min-h-12 items-center font-round font-extrabold underline">Open the teacher activity kit</span>
    </div>
  </a>
}

function SectionHeading({ eyebrow, title, copy, align = 'left' }) {
  const centered = align === 'center'
  return (
    <div className={centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p className="font-round text-xs font-extrabold uppercase tracking-widest" style={{ color: MINT }}>{eyebrow}</p>
      <h2 className="mt-2 font-bubble text-3xl leading-tight sm:text-4xl" style={{ color: INK }}>{title}</h2>
      {copy && <p className="mt-3 font-round text-sm leading-relaxed sm:text-base" style={{ color: MUTED }}>{copy}</p>}
    </div>
  )
}

export default function SchoolsPage() {
  useEffect(() => {
    const previousTitle = document.title
    const description = 'Explore free school activities with teacher notes and parent invitations. Try shadows, floating and fair sharing, then set up a classroom.'
    document.title = 'Bloom Juniors for Schools | EYFS, KS1 and Early KS2'

    let meta = document.querySelector('meta[name="description"]')
    const previousDescription = meta?.getAttribute('content')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', description)
    trackEventOnce('schools-page-view', 'school_page_view')

    return () => {
      document.title = previousTitle
      if (previousDescription !== null && previousDescription !== undefined) {
        meta.setAttribute('content', previousDescription)
      }
    }
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F8FBFD]" style={{ color: INK }}>
      <div className="bg-[#193251] px-4 py-2 text-center font-round text-xs font-extrabold text-white sm:text-sm">
        Free for one classroom - up to 30 pupils - no card required
      </div>

      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur-xl" style={{ borderColor: LINE }}>
        <nav className="mx-auto flex min-h-[72px] max-w-[1216px] items-center justify-between gap-3 px-4 sm:px-8" aria-label="School navigation">
          <a href="/" aria-label="Bloom Juniors home"><BloomLogo size="md" /></a>
          <div className="hidden items-center gap-6 font-round text-sm font-extrabold md:flex" style={{ color: MUTED }}>
            <a href="#discovery-kit">Activity kit</a>
            <a href="#curriculum">Curriculum</a>
            <a href="#safety">Safeguarding</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className="flex items-center gap-2">
            <a href="/?app=1" onClick={() => trackSchoolCta('sign_in', 'navigation')} className="hidden min-h-10 items-center justify-center px-3 font-round text-sm font-extrabold sm:inline-flex" style={{ color: MUTED }}>Sign in</a>
            <a href="/?teacher=1" onClick={() => trackSchoolCta('start_free', 'navigation')} className="inline-flex min-h-10 items-center justify-center rounded-lg px-4 font-bubble text-sm text-white shadow-md" style={{ background: PURPLE }}>
              Start free
            </a>
          </div>
        </nav>
      </header>

      <main>
        <section className="overflow-hidden bg-[#193251] px-5 py-14 text-white sm:px-8 md:py-16">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <p className="font-round text-xs font-extrabold uppercase tracking-widest text-[#72E0B9]">Bloom Juniors for Schools</p>
              <h1 className="mt-3 max-w-xl font-bubble text-4xl leading-[1.05] sm:text-5xl md:text-6xl">
                Bring a little wonder into your classroom.
              </h1>
              <p className="mt-5 max-w-xl font-round text-base font-semibold leading-relaxed text-white/75 sm:text-lg">
                Start with one discovery children can explore and explain. Try the activity, use the teacher notes, and invite families to continue the conversation at home.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a href="/?teacher=1" onClick={() => trackSchoolCta('start_free', 'hero')} className="inline-flex min-h-12 items-center justify-center rounded-lg px-6 font-bubble text-base text-white shadow-xl" style={{ background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})` }}>
                  Set up a free classroom
                </a>
                <a href="#enquiry" onClick={() => trackSchoolCta('book_walkthrough', 'hero')} className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/25 bg-white/10 px-6 font-round text-sm font-extrabold text-white">
                  Book a walkthrough
                </a>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-round text-xs font-bold text-white/65">
                <span>No pupil passwords</span>
                <span>No advertising</span>
                <span>No download</span>
              </div>
            </motion.div>
            <ClassroomPreview />
          </div>
        </section>

        <section className="border-b bg-white px-5 py-7 sm:px-8" style={{ borderColor: LINE }}>
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-5 md:grid-cols-4">
            {[
              ['2 min', 'Classroom setup'],
              ['30', 'Pupils free'],
              ['3-9', 'Age range'],
              ['Live', 'Class progress'],
            ].map(([value, label]) => (
              <div key={label} className="border-l pl-4" style={{ borderColor: LINE }}>
                <p className="font-bubble text-2xl" style={{ color: INK }}>{value}</p>
                <p className="font-round text-xs font-bold" style={{ color: MUTED }}>{label}</p>
              </div>
            ))}
          </div>
        </section>

        <SchoolDiscoveryKit />

        <section id="how" className="px-5 py-14 sm:px-8 md:py-16">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="How it works"
              title="From lesson choice to live progress in three steps."
              copy="Bloom Juniors fits beside your current school systems. It gives children a focused practice space without adding a heavy LMS workflow."
            />
            <div className="mt-9 grid gap-6 md:grid-cols-3">
              {[
                ['01', 'Teacher sets the path', 'Choose today\'s phonics, maths or reading activities for the class.'],
                ['02', 'Pupils tap their name', 'A class code opens only that roster. Children need no email or password.'],
                ['03', 'Progress appears live', 'See who has started, completed or may need support from one quiet dashboard.'],
              ].map(([number, title, body], index) => (
                <article
                  key={number}
                  className="border-t-2 pt-5"
                  style={{ borderColor: index === 0 ? PURPLE : index === 1 ? MINT : PINK }}
                >
                  <p className="font-bubble text-sm" style={{ color: MUTED }}>{number}</p>
                  <h3 className="mt-2 font-bubble text-xl">{title}</h3>
                  <p className="mt-2 font-round text-sm leading-relaxed" style={{ color: MUTED }}>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="curriculum" className="border-y bg-white px-5 py-14 sm:px-8 md:py-16" style={{ borderColor: LINE }}>
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <SectionHeading
                eyebrow="British curriculum"
                title="Ages 3-9, without changing platforms."
                copy="Age-specific practice from early EYFS foundations through KS1 and early KS2."
              />
              <a href="/curriculum-map" target="_blank" rel="noreferrer" onClick={() => trackSchoolCta('view_curriculum', 'curriculum')} className="inline-flex min-h-11 items-center justify-center rounded-lg border px-5 font-round text-sm font-extrabold" style={{ borderColor: LINE, color: INK }}>
                View curriculum map
              </a>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {CURRICULUM.map(item => (
                <article key={item.stage} className="border-l-4 py-1 pl-5" style={{ borderColor: item.color }}>
                  <p className="font-round text-xs font-extrabold uppercase tracking-widest" style={{ color: item.color }}>{item.ages}</p>
                  <h3 className="mt-2 font-bubble text-xl">{item.stage}</h3>
                  <p className="mt-2 font-round text-sm leading-relaxed" style={{ color: MUTED }}>{item.focus}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="safety" className="bg-[#EAF8F3] px-5 py-14 sm:px-8 md:py-16">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <SectionHeading
              eyebrow="Safeguarding"
              title="Designed to be safe in schools."
              copy="Children stay inside a focused, ad-free learning environment. Teachers only see their own school and class data."
            />
            <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {SAFETY.map(item => (
                <div key={item} className="flex items-start gap-3 border-b pb-4" style={{ borderColor: 'rgba(47,159,127,0.18)' }}>
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#2F9F7F] font-round text-[10px] font-black text-white">OK</span>
                  <p className="font-round text-sm font-bold leading-relaxed" style={{ color: INK }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="px-5 py-14 sm:px-8 md:py-16">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="Simple pricing"
              title="Start with one classroom. Grow when the school is ready."
              align="center"
            />
            <div className="mx-auto mt-9 grid max-w-4xl gap-5 md:grid-cols-2">
              <article className="rounded-lg border-2 bg-white p-6 shadow-lg" style={{ borderColor: PURPLE }}>
                <p className="font-round text-xs font-extrabold uppercase tracking-widest" style={{ color: PURPLE }}>Classroom</p>
                <h3 className="mt-2 font-bubble text-3xl">Free</h3>
                <p className="mt-1 font-round text-sm" style={{ color: MUTED }}>Forever, with no credit card.</p>
                <ul className="mt-5 space-y-2 font-round text-sm font-bold" style={{ color: INK }}>
                  <li>One classroom and up to 30 pupils</li>
                  <li>All learning activities</li>
                  <li>Lesson setter and class dashboard</li>
                  <li>Weekly progress report</li>
                </ul>
                <a href="/?teacher=1" onClick={() => trackSchoolCta('start_free', 'pricing')} className="mt-6 flex min-h-12 items-center justify-center rounded-lg font-bubble text-white" style={{ background: PURPLE }}>
                  Start free
                </a>
              </article>

              <article className="rounded-lg border bg-white p-6" style={{ borderColor: LINE }}>
                <p className="font-round text-xs font-extrabold uppercase tracking-widest" style={{ color: MINT }}>Whole school</p>
                <h3 className="mt-2 font-bubble text-3xl">Annual licence</h3>
                <p className="mt-1 font-round text-sm" style={{ color: MUTED }}>A simple annual invoice.</p>
                <ul className="mt-5 space-y-2 font-round text-sm font-bold" style={{ color: INK }}>
                  <li>Multiple classrooms</li>
                  <li>Teacher invite flow</li>
                  <li>School administration account</li>
                  <li>Aggregate class reporting</li>
                  <li>Priority setup support</li>
                </ul>
                <a href="#enquiry" onClick={() => trackSchoolCta('request_pricing', 'pricing')} className="mt-6 flex min-h-12 items-center justify-center rounded-lg border font-bubble" style={{ borderColor: LINE, color: INK }}>
                  Request school pricing
                </a>
              </article>
            </div>
          </div>
        </section>

        <section id="enquiry" className="border-t bg-white px-5 py-14 sm:px-8 md:py-16" style={{ borderColor: LINE }}>
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.78fr_1.22fr]">
            <div>
              <SectionHeading
                eyebrow="Talk to us"
                title="Plan a classroom pilot."
                copy="Tell us about your school, age range or curriculum questions. We can discuss the activities and setup your school needs."
              />
              <p className="mt-5 font-round text-sm font-bold" style={{ color: INK }}>hello@bloomjuniors.com</p>
            </div>
            <div className="rounded-lg border bg-[#F8FBFD] p-5 sm:p-6" style={{ borderColor: LINE }}>
              <SchoolEnquiryForm source="schools-page-redesign" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white px-5 py-7 sm:px-8" style={{ borderColor: LINE }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <BloomLogo size="sm" />
            <p className="mt-2 font-round text-xs" style={{ color: MUTED }}>British curriculum learning for ages 3-9.</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 font-round text-xs font-bold" style={{ color: MUTED }}>
            <a href="/">Families</a>
            <a href="/curriculum-map">Curriculum</a>
            <a href="/privacy">Privacy</a>
            <a href="mailto:hello@bloomjuniors.com">Contact</a>
            <span>Copyright 2026 Bloom Juniors</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
