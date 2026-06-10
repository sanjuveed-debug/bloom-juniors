import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import BloomLogo from '../components/BloomLogo'
import SchoolEnquiryForm from '../components/SchoolEnquiryForm'

const BG = 'linear-gradient(160deg, #080516 0%, #130a2e 50%, #061633 100%)'

// ── UI Mockups ────────────────────────────────────────────────────────────────
function MockupFrame({ title, children }) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
      <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: 'rgba(0,0,0,0.5)' }}>
        <div className="w-3 h-3 rounded-full bg-red-500/70" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <div className="w-3 h-3 rounded-full bg-green-500/70" />
        <span className="font-round text-white/30 text-xs ml-2">{title}</span>
      </div>
      <div style={{ background: 'rgba(13,10,35,0.95)' }}>
        {children}
      </div>
    </div>
  )
}

function LessonSetterMockup() {
  const modules = [
    { id: 'phonics', emoji: '🎤', label: 'Phonics', selected: true },
    { id: 'maths',   emoji: '🔢', label: 'Maths',   selected: true },
    { id: 'stories', emoji: '📖', label: 'Stories',  selected: false },
    { id: 'shapes',  emoji: '🔷', label: 'Shapes',   selected: false },
  ]
  return (
    <div className="p-4">
      <p className="font-round text-white/40 text-xs mb-3 uppercase tracking-wider">Today's lesson for Reception — Blue</p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {modules.map(m => (
          <div key={m.id} className="flex items-center gap-2.5 p-2.5 rounded-xl"
            style={{ background: m.selected ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)', border: `1px solid ${m.selected ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}` }}>
            <span className="text-xl">{m.emoji}</span>
            <span className="font-round text-white text-sm font-bold">{m.label}</span>
            {m.selected && <span className="ml-auto text-indigo-300 font-black text-sm">✓</span>}
          </div>
        ))}
      </div>
      <div className="w-full py-2.5 rounded-xl text-center font-bubble text-white text-sm"
        style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
        Set for all 26 pupils →
      </div>
    </div>
  )
}

function PupilRosterMockup() {
  const pupils = [
    { name: 'Amara',   status: 'done',        modules: ['🎤','🔢'] },
    { name: 'Ben',     status: 'in-progress', modules: ['🎤'] },
    { name: 'Chloe',   status: 'done',        modules: ['🎤','🔢'] },
    { name: 'David',   status: 'not-started', modules: [] },
    { name: 'Emma',    status: 'in-progress', modules: ['🔢'] },
    { name: 'Freddie', status: 'not-started', modules: [] },
  ]
  const colors = { done: '#22C55E', 'in-progress': '#F59E0B', 'not-started': '#6B7280' }
  const labels = { done: 'Done ✓', 'in-progress': 'Active', 'not-started': 'Not started' }
  return (
    <div className="p-4">
      <div className="flex gap-3 mb-3">
        {[{l:'21 done',c:'#22C55E'},{l:'3 active',c:'#F59E0B'},{l:'2 waiting',c:'#6B7280'}].map(s => (
          <div key={s.l} className="flex-1 text-center py-2 rounded-xl" style={{ background: s.c + '15' }}>
            <p className="font-bubble text-base" style={{ color: s.c }}>{s.l.split(' ')[0]}</p>
            <p className="font-round text-white/40 text-xs">{s.l.split(' ')[1]}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {pupils.map(p => (
          <div key={p.name} className="flex items-center gap-2 p-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${colors[p.status]}25` }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
              style={{ background: colors[p.status] + '20' }}>
              {p.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-round text-white text-xs font-bold truncate">{p.name}</p>
              <p className="font-round text-xs" style={{ color: colors[p.status] }}>{labels[p.status]}</p>
            </div>
            <div className="flex gap-0.5">
              {p.modules.map(e => <span key={e} className="text-xs">{e}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function WeeklyReportMockup() {
  const pupils = [
    { name: 'Amara',  days: [1,1,1,1,0,0,0], sessions: 8, stars: 24 },
    { name: 'Ben',    days: [1,1,0,1,1,0,0], sessions: 6, stars: 18 },
    { name: 'Chloe',  days: [1,0,1,0,1,0,0], sessions: 4, stars: 12 },
    { name: 'David',  days: [0,0,0,0,0,0,0], sessions: 0, stars: 0 },
  ]
  return (
    <div className="p-4">
      <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
        <div className="flex gap-4">
          <div><p className="font-bubble text-xl text-white">22<span className="font-round text-white/40 text-sm">/26</span></p><p className="font-round text-white/40 text-xs">active</p></div>
          <div><p className="font-bubble text-xl text-indigo-300">84</p><p className="font-round text-white/40 text-xs">sessions</p></div>
          <div className="ml-auto"><p className="font-bubble text-xl text-orange-400">1</p><p className="font-round text-orange-400/70 text-xs">not seen</p></div>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {pupils.map(p => (
          <div key={p.name} className="flex items-center gap-3 py-1.5">
            <span className="font-round text-white text-xs w-12 truncate">{p.name}</span>
            <div className="flex gap-1 flex-1">
              {p.days.map((active, i) => (
                <div key={i} className="w-4 h-4 rounded-full"
                  style={{ background: active ? '#818CF8' : 'rgba(255,255,255,0.08)' }} />
              ))}
            </div>
            <span className="font-round text-yellow-300 text-xs">⭐{p.stars}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 px-3 py-2 rounded-xl flex items-center gap-2" style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.3)' }}>
        <span className="text-sm">⚠️</span>
        <p className="font-round text-orange-300 text-xs font-bold">David — no activity this week</p>
      </div>
    </div>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────
const CURRICULUM = [
  {
    emoji: '🧸', stage: 'Nursery', range: 'Ages 3–4 · EYFS', color: '#FB923C',
    topics: ['Colours & shapes', 'Counting to 10', 'Animal sounds', 'Fruits & body parts'],
  },
  {
    emoji: '🌟', stage: 'Reception & KS1', range: 'Ages 4–6 · EYFS / KS1', color: '#C084FC',
    topics: ['RWI phonics Set 1–3', 'Tricky / red words', 'Early maths', 'Story reading & comprehension'],
  },
  {
    emoji: '🚀', stage: 'KS2', range: 'Ages 7–9 · Year 3–5', color: '#F87171',
    topics: ['Times tables 2–12', 'Fractions & word problems', 'Y3–6 spelling list', 'Grammar, reading & science'],
  },
]

const TRUST = [
  { icon: '🔒', text: 'No child accounts — children never create a login' },
  { icon: '🚫', text: 'Zero advertising of any kind' },
  { icon: '💬', text: 'No messaging or social features' },
  { icon: '🔗', text: 'No external links or third-party content' },
  { icon: '🛡️', text: 'GDPR compliant — no personal data from children' },
  { icon: '💻', text: 'Works on school tablets, Chromebooks and PCs' },
  { icon: '📲', text: 'No app store download — runs in the browser' },
  { icon: '⏱️', text: 'Session timer — teacher controls screen time' },
]

const AUDIENCES = [
  {
    icon: '🧸',
    label: 'Nurseries',
    detail: 'Gentle EYFS practice for colours, shapes, counting and early language.',
  },
  {
    icon: '🌟',
    label: 'Reception & KS1',
    detail: 'Daily phonics, early maths and story practice with teacher-set focus.',
  },
  {
    icon: '📚',
    label: 'Tutors & small groups',
    detail: 'Fast setup for multi-child sessions without a heavy LMS workflow.',
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SchoolsPage() {
  useEffect(() => {
    const previousTitle = document.title
    const description = 'Bloom Juniors for schools: safe EYFS, KS1 and lower KS2 classroom practice with lesson setting, pupil roster, live engagement and weekly progress reports.'
    document.title = 'Bloom Juniors for Schools | EYFS, KS1 & Lower KS2 Classroom Practice'

    let meta = document.querySelector('meta[name="description"]')
    const previousDescription = meta?.getAttribute('content')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', description)

    return () => {
      document.title = previousTitle
      if (previousDescription !== null && previousDescription !== undefined) {
        meta.setAttribute('content', previousDescription)
      }
    }
  }, [])

  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: BG }}>

      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-white/10"
        style={{ background: 'rgba(8,5,22,0.9)' }}>
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <a href="/"><BloomLogo size="md" /></a>
          <div className="flex items-center gap-3">
            <a href="/?app=1" className="font-round text-white/75 text-sm border border-white/15 rounded-xl px-4 py-2 hover:bg-white/8 transition-colors hidden sm:block">
              Parent login
            </a>
            <a href="#enquiry" className="font-round text-indigo-300 text-sm border border-indigo-400/40 rounded-xl px-4 py-2 hover:bg-indigo-400/10 transition-colors hidden sm:block">
              Contact us
            </a>
            <a href="/?teacher=1" className="font-bubble text-sm text-white rounded-xl px-5 py-2.5 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
              Start free →
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200 }}>
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 font-round text-xs font-bold text-indigo-300 uppercase tracking-widest"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)' }}>
            🏫 For nurseries, primary schools and tutors
          </div>
          <h1 className="font-bubble text-5xl md:text-6xl text-white leading-tight mb-6"
            style={{ textShadow: '0 0 60px rgba(139,0,255,0.5)' }}>
            Safe classroom practice<br />for EYFS, KS1 and KS2
          </h1>
          <p className="font-round text-white/65 text-lg max-w-2xl mx-auto leading-relaxed mb-10 font-bold">
            Set today's phonics, maths or reading task in seconds.
            Pupils start from their own name card.
            You see live progress across the whole class.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <a href="/?teacher=1"
              className="font-bubble text-white text-xl px-10 py-4 rounded-2xl shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 12px 40px rgba(79,70,229,0.5)' }}>
              Set up a free classroom →
            </a>
            <a href="/curriculum-map" target="_blank"
              className="font-bubble text-white/80 text-xl px-10 py-4 rounded-2xl border-2 border-white/20 hover:bg-white/8 transition-colors">
              View curriculum map
            </a>
          </div>
          <p className="font-round text-white/35 text-sm">
            Free for 1 classroom · Up to 30 pupils · No child accounts · No ads
          </p>
        </motion.div>
      </section>

      {/* Trust strip */}
      <div className="max-w-5xl mx-auto px-6 -mt-8 pb-14">
        <div className="rounded-3xl px-5 py-4 flex flex-wrap justify-center gap-x-5 gap-y-3"
          style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {['✓ British Curriculum', '✓ EYFS · KS1 · KS2', '✓ No child accounts', '✓ No advertising', '✓ GDPR compliant', '✓ No download needed'].map(t => (
            <span key={t} className="font-round text-white/60 text-xs font-bold rounded-full px-3 py-1"
              style={{ background: 'rgba(255,255,255,0.045)' }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Who it is for */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="font-round text-white/35 text-xs font-black uppercase tracking-widest text-center mb-3">Who it is for</p>
        <h2 className="font-bubble text-4xl text-white text-center mb-4">A classroom companion, not another admin system</h2>
        <p className="font-round text-white/45 text-center text-sm mb-10 max-w-2xl mx-auto">
          Bloom Juniors sits alongside your existing school tools. It gives children a safe place to practise and gives adults a quick view of engagement.
        </p>
        <div className="grid md:grid-cols-3 gap-5">
          {AUDIENCES.map((audience) => (
            <div key={audience.label}
              className="rounded-3xl p-6"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5"
                style={{ background: 'rgba(99,102,241,0.18)' }}>
                {audience.icon}
              </div>
              <p className="font-bubble text-white text-xl mb-2">{audience.label}</p>
              <p className="font-round text-white/55 text-sm leading-relaxed">{audience.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* See it in the classroom */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <p className="font-round text-white/35 text-xs font-black uppercase tracking-widest text-center mb-3">See it in the classroom</p>
        <h2 className="font-bubble text-4xl text-white text-center mb-4">Built for how classrooms actually work</h2>
        <p className="font-round text-white/45 text-center text-sm mb-12 max-w-xl mx-auto">
          From the teacher's morning setup to the end-of-week report — everything in one place.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
            <p className="font-bubble text-white text-base mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: '#4F46E5' }}>1</span>
              Teacher sets the lesson
            </p>
            <MockupFrame title="Lesson Setter — ClassroomDashboard">
              <LessonSetterMockup />
            </MockupFrame>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <p className="font-bubble text-white text-base mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: '#059669' }}>2</span>
              See who's engaged — live
            </p>
            <MockupFrame title="Pupil Roster — ClassroomDashboard">
              <PupilRosterMockup />
            </MockupFrame>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <p className="font-bubble text-white text-base mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: '#D97706' }}>3</span>
              Weekly progress report
            </p>
            <MockupFrame title="This Week — ClassroomDashboard">
              <WeeklyReportMockup />
            </MockupFrame>
          </motion.div>
        </div>
      </section>

      {/* Teacher quote */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto text-center rounded-[32px] px-8 py-12"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-4xl mb-5">💬</div>
          <blockquote className="font-round text-white text-lg leading-relaxed mb-5 font-bold">
            "The emotion check-in is a lovely way to encourage children to reflect on how they are feeling before learning.
            The simplified experience is appealing, and I can see the thought that has gone into reducing friction for young learners."
          </blockquote>
          <p className="font-round text-indigo-300 text-sm font-black">Foundation Stage 2 Teacher — currently piloting</p>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <p className="font-round text-white/35 text-xs font-black uppercase tracking-widest text-center mb-3">Getting started</p>
        <h2 className="font-bubble text-4xl text-white text-center mb-12">Up and running in 5 minutes</h2>
        <div className="flex flex-col gap-4 mb-10">
          {[
            { n: '1', title: 'Create your classroom account', body: 'Enter your school name, class name and age group. No IT department needed. Takes 2 minutes.' },
            { n: '2', title: 'Add your pupils', body: 'Add each pupil by first name only. No emails, no child accounts, no data collected from children.' },
            { n: '3', title: "Set today's lesson", body: 'Pick which activities your class works on today. Takes 10 seconds.' },
            { n: '4', title: 'Hand out the devices', body: 'Pupils tap their name and start learning. You watch the dashboard fill up in real time.' },
          ].map((step, i) => (
            <motion.div key={step.n}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-5 items-start p-5 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bubble text-lg text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
                {step.n}
              </div>
              <div>
                <p className="font-bubble text-white text-lg mb-1">{step.title}</p>
                <p className="font-round text-white/55 text-sm leading-relaxed">{step.body}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mid-page pilot CTA */}
        <div className="rounded-3xl p-7 text-center"
          style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.35)' }}>
          <p className="font-bubble text-white text-xl mb-2">Want to pilot this with one class?</p>
          <p className="font-round text-white/50 text-sm mb-5">Set up a free classroom today or book a 15-minute walkthrough with us.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/?teacher=1"
              className="font-bubble text-white px-7 py-3 rounded-2xl text-base"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
              Start free classroom →
            </a>
            <a href="#enquiry"
              className="font-bubble text-white/70 px-7 py-3 rounded-2xl text-base border border-white/20 hover:bg-white/8 transition-colors">
              Book a 15-min demo
            </a>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="font-round text-white/35 text-xs font-black uppercase tracking-widest text-center mb-3">Curriculum</p>
          <h2 className="font-bubble text-4xl text-white text-center mb-4">Aligned to the National Curriculum</h2>
          <p className="font-round text-white/40 text-center text-sm mb-10">
            Full curriculum coverage map available to download.{' '}
            <a href="/curriculum-map" target="_blank" className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300 transition-colors">
              View curriculum map →
            </a>
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {CURRICULUM.map((c, i) => (
              <motion.div key={c.stage}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-3xl p-6"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${c.color}40` }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: c.color + '20' }}>
                    {c.emoji}
                  </div>
                  <div>
                    <p className="font-bubble text-white text-base leading-tight">{c.stage}</p>
                    <p className="font-round text-white/40 text-xs font-bold mt-0.5">{c.range}</p>
                  </div>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {c.topics.map(t => (
                    <li key={t} className="flex items-start gap-2.5">
                      <span className="text-sm mt-0.5 font-bold" style={{ color: c.color }}>✓</span>
                      <span className="font-round text-white/65 text-sm">{t}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Safe for schools */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <p className="font-round text-white/35 text-xs font-black uppercase tracking-widest text-center mb-3">Safeguarding</p>
        <h2 className="font-bubble text-4xl text-white text-center mb-3">Designed to be safe in schools</h2>
        <p className="font-round text-white/40 text-center text-sm mb-10 max-w-xl mx-auto">
          No setup needed from your IT team. No personal data collected from children. Built to reduce common safeguarding and classroom-management concerns.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {TRUST.map(point => (
            <div key={point.text} className="flex items-start gap-3 p-4 rounded-2xl"
              style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <span className="text-lg shrink-0">{point.icon}</span>
              <p className="font-round text-white/75 text-sm font-bold">{point.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="font-round text-white/35 text-xs font-black uppercase tracking-widest text-center mb-3">Pricing</p>
          <h2 className="font-bubble text-4xl text-white text-center mb-12">Simple and transparent</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="rounded-3xl p-7" style={{ background: 'rgba(99,102,241,0.12)', border: '2px solid rgba(99,102,241,0.4)' }}>
              <p className="font-bubble text-white text-4xl mb-1">Free</p>
              <p className="font-round text-white/45 text-sm mb-6">Forever. No credit card.</p>
              <ul className="flex flex-col gap-3 mb-8">
                {['1 classroom', 'Up to 30 pupils', 'All activities', 'Lesson setter', 'Daily class dashboard', 'Weekly progress report'].map(f => (
                  <li key={f} className="flex items-center gap-3">
                    <span className="text-indigo-400 font-black text-sm">✓</span>
                    <span className="font-round text-white/80 text-sm">{f}</span>
                  </li>
                ))}
              </ul>
              <a href="/?teacher=1"
                className="block w-full text-center py-4 rounded-2xl font-bubble text-white text-lg"
                style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 8px 24px rgba(79,70,229,0.4)' }}>
                Start free →
              </a>
            </div>

            <div className="rounded-3xl p-7" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <p className="font-bubble text-white text-4xl mb-1">School</p>
              <p className="font-round text-white/45 text-sm mb-1">Annual licence — whole school.</p>
              <p className="font-round text-indigo-300 text-sm font-bold mb-6">Simple annual invoice for schools.</p>
              <ul className="flex flex-col gap-3 mb-8">
                {['Multiple classrooms', 'School admin account', 'Aggregate class reports', 'Teacher invite flow', 'Annual invoice — no subscriptions', 'Priority support'].map(f => (
                  <li key={f} className="flex items-center gap-3">
                    <span className="text-white/40 font-black text-sm">✓</span>
                    <span className="font-round text-white/55 text-sm">{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#enquiry"
                className="block w-full text-center py-4 rounded-2xl font-bubble text-white/75 text-lg border border-white/20 hover:bg-white/8 transition-colors">
                Get a quote →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Enquiry */}
      <section id="enquiry" className="max-w-xl mx-auto px-6 py-20">
        <p className="font-round text-white/35 text-xs font-black uppercase tracking-widest text-center mb-3">Contact</p>
        <h2 className="font-bubble text-4xl text-white text-center mb-2">Talk to us</h2>
        <p className="font-round text-white/45 text-sm text-center mb-10">
          Questions about curriculum, classroom setup or pricing. We reply within 1 working day.
        </p>
        <div className="rounded-3xl p-7" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <SchoolEnquiryForm source="schools-page" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <BloomLogo size="sm" />
          <div className="flex gap-6">
            <a href="/curriculum-map" target="_blank" className="font-round text-white/30 text-xs hover:text-white/60 transition-colors">Curriculum Map</a>
            <a href="/privacy" className="font-round text-white/30 text-xs hover:text-white/60 transition-colors">Privacy Policy</a>
            <a href="/" className="font-round text-white/30 text-xs hover:text-white/60 transition-colors">Home</a>
          </div>
          <p className="font-round text-white/20 text-xs">© 2025 Bloom Juniors</p>
        </div>
      </footer>
    </div>
  )
}
