import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import BloomLogo from '../components/BloomLogo'
import SchoolEnquiryForm from '../components/SchoolEnquiryForm'

const BG      = 'linear-gradient(160deg, #FFF7ED 0%, #FFEDD5 50%, #FFF7ED 100%)'
const TEXT    = '#422006'
const FAINT   = 'rgba(66,32,6,0.45)'
const FAINT2  = 'rgba(66,32,6,0.35)'
const PRIMARY = '#C2410C'
const TEAL    = '#0F766E'
const CARD    = { background: '#FFFFFF', border: '1px solid rgba(66,32,6,0.10)', boxShadow: '0 4px 20px rgba(66,32,6,0.06)' }

// ── UI Mockups (kept dark — they show the teacher dashboard interface) ─────────
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
    emoji: '🌟', stage: 'Reception & KS1', range: 'Ages 4–6 · EYFS / KS1', color: TEAL,
    topics: ['RWI phonics Set 1–3', 'Tricky / red words', 'Early maths', 'Story reading & comprehension'],
  },
  {
    emoji: '🚀', stage: 'KS2', range: 'Ages 7–9 · Year 3–5', color: '#DC2626',
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

const CLASS_CODE_STEPS = [
  { icon: '🏫', title: 'Teacher creates a class', body: 'Each class gets its own unique class code, generated automatically when you set up your classroom.' },
  { icon: '📱', title: 'Pupils use the class code', body: 'On the class tablet, pupils enter the code and tap their name card — no accounts, no passwords, no emails.' },
  { icon: '👀', title: 'Only that class roster appears', body: 'The code unlocks one roster only — the right pupils for that class, and nothing else.' },
  { icon: '📊', title: 'Progress stays scoped', body: 'Stars, sessions and weekly reports are saved against that class and school — never mixed with another.' },
]

const AUDIENCES = [
  { icon: '🧸', label: 'Nurseries',          detail: 'Gentle EYFS practice for colours, shapes, counting and early language.' },
  { icon: '🌟', label: 'Reception & KS1',    detail: 'Daily phonics, early maths and story practice with teacher-set focus.' },
  { icon: '📚', label: 'Tutors & small groups', detail: 'Fast setup for multi-child sessions without a heavy LMS workflow.' },
]

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SchoolsPage() {
  useEffect(() => {
    const previousTitle = document.title
    const description = 'Free EYFS/KS1 interactive classroom resources for schools and nurseries. GDPR-compliant, no pupil login required, SEN-friendly voice-guided activities, with a teacher dashboard for live class progress.'
    document.title = 'Free EYFS/KS1 Interactive Classroom Resources | Bloom Juniors for Schools'

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
      <nav className="sticky top-0 z-50 backdrop-blur-md"
        style={{ background: 'rgba(255,247,237,0.92)', borderBottom: '1px solid rgba(66,32,6,0.08)' }}>
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <a href="/"><BloomLogo size="md" /></a>
          <div className="flex items-center gap-3">
            <a href="/?app=1"
              className="font-round text-sm rounded-xl px-4 py-2 transition-colors hidden sm:block"
              style={{ color: FAINT, border: '1px solid rgba(66,32,6,0.14)' }}>
              Parent login
            </a>
            <a href="#enquiry"
              className="font-round text-sm rounded-xl px-4 py-2 transition-colors hidden sm:block"
              style={{ color: TEAL, border: `1px solid ${TEAL}44` }}>
              Contact us
            </a>
            <a href="/?teacher=1"
              className="font-bubble text-sm text-white rounded-xl px-5 py-2.5 shadow-lg"
              style={{ background: PRIMARY }}>
              Start free →
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200 }}>
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 font-round text-xs font-bold uppercase tracking-widest"
            style={{ background: `${TEAL}14`, border: `1px solid ${TEAL}40`, color: TEAL }}>
            🏫 For nurseries, primary schools and tutors
          </div>
          <h1 className="font-bubble text-5xl md:text-6xl leading-tight mb-6" style={{ color: TEXT }}>
            Safe classroom practice<br />for EYFS, KS1 and KS2
          </h1>
          <p className="font-round text-lg max-w-2xl mx-auto leading-relaxed mb-10 font-bold" style={{ color: FAINT }}>
            Set today's phonics, maths or reading task in seconds.
            Pupils start from their own name card.
            You see live progress across the whole class.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <a href="/?teacher=1"
              className="font-bubble text-white text-xl px-10 py-4 rounded-2xl shadow-xl"
              style={{ background: PRIMARY, boxShadow: '0 12px 32px rgba(194,65,12,0.35)' }}>
              Set up a free classroom →
            </a>
            <a href="/curriculum-map" target="_blank"
              className="font-bubble text-xl px-10 py-4 rounded-2xl border-2 transition-colors"
              style={{ color: TEXT, borderColor: 'rgba(66,32,6,0.20)' }}>
              View curriculum map
            </a>
          </div>
          <p className="font-round text-sm" style={{ color: FAINT2 }}>
            Free for 1 classroom · Up to 30 pupils · No child accounts · No ads
          </p>
        </motion.div>
      </section>

      {/* Trust strip */}
      <div className="max-w-5xl mx-auto px-6 -mt-8 pb-14">
        <div className="rounded-3xl px-5 py-4 flex flex-wrap justify-center gap-x-5 gap-y-3"
          style={{ background: '#FFFFFF', border: '1px solid rgba(66,32,6,0.08)', boxShadow: '0 2px 12px rgba(66,32,6,0.04)' }}>
          {['✓ British Curriculum', '✓ EYFS · KS1 · KS2', '✓ No child accounts', '✓ No advertising', '✓ GDPR compliant', '✓ No download needed'].map(t => (
            <span key={t} className="font-round text-xs font-bold rounded-full px-3 py-1"
              style={{ background: 'rgba(66,32,6,0.05)', color: FAINT }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Who it is for */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="font-round text-xs font-black uppercase tracking-widest text-center mb-3" style={{ color: FAINT2 }}>Who it is for</p>
        <h2 className="font-bubble text-4xl text-center mb-4" style={{ color: TEXT }}>A classroom companion, not another admin system</h2>
        <p className="font-round text-center text-sm mb-10 max-w-2xl mx-auto" style={{ color: FAINT }}>
          Bloom Juniors sits alongside your existing school tools. It gives children a safe place to practise and gives adults a quick view of engagement.
        </p>
        <div className="grid md:grid-cols-3 gap-5">
          {AUDIENCES.map((audience) => (
            <div key={audience.label}
              className="rounded-3xl p-6"
              style={CARD}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5"
                style={{ background: `${TEAL}14` }}>
                {audience.icon}
              </div>
              <p className="font-bubble text-xl mb-2" style={{ color: TEXT }}>{audience.label}</p>
              <p className="font-round text-sm leading-relaxed" style={{ color: FAINT }}>{audience.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* See it in the classroom */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <p className="font-round text-xs font-black uppercase tracking-widest text-center mb-3" style={{ color: FAINT2 }}>See it in the classroom</p>
        <h2 className="font-bubble text-4xl text-center mb-4" style={{ color: TEXT }}>Built for how classrooms actually work</h2>
        <p className="font-round text-center text-sm mb-12 max-w-xl mx-auto" style={{ color: FAINT }}>
          From the teacher's morning setup to the end-of-week report — everything in one place.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: '1', color: PRIMARY,  label: 'Teacher sets the lesson',  mockup: <LessonSetterMockup />,  title: 'Lesson Setter — ClassroomDashboard' },
            { n: '2', color: '#059669', label: 'See who\'s engaged — live', mockup: <PupilRosterMockup />, title: 'Pupil Roster — ClassroomDashboard' },
            { n: '3', color: '#D97706', label: 'Weekly progress report',   mockup: <WeeklyReportMockup />, title: 'This Week — ClassroomDashboard' },
          ].map((item, i) => (
            <motion.div key={item.n} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <p className="font-bubble text-base mb-3 flex items-center gap-2" style={{ color: TEXT }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: item.color }}>{item.n}</span>
                {item.label}
              </p>
              <MockupFrame title={item.title}>{item.mockup}</MockupFrame>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Teacher quote */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto text-center rounded-[32px] px-8 py-12"
          style={{ background: '#FFFFFF', border: '1px solid rgba(66,32,6,0.10)', boxShadow: '0 8px 32px rgba(66,32,6,0.07)' }}>
          <div className="text-4xl mb-5">💬</div>
          <blockquote className="font-round text-lg leading-relaxed mb-5 font-bold" style={{ color: TEXT }}>
            "The emotion check-in is a lovely way to encourage children to reflect on how they are feeling before learning.
            The simplified experience is appealing, and I can see the thought that has gone into reducing friction for young learners."
          </blockquote>
          <p className="font-round text-sm font-black" style={{ color: TEAL }}>Foundation Stage 2 Teacher — currently piloting</p>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <p className="font-round text-xs font-black uppercase tracking-widest text-center mb-3" style={{ color: FAINT2 }}>Getting started</p>
        <h2 className="font-bubble text-4xl text-center mb-12" style={{ color: TEXT }}>Up and running in 5 minutes</h2>
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
              style={CARD}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bubble text-lg text-white shrink-0"
                style={{ background: PRIMARY }}>
                {step.n}
              </div>
              <div>
                <p className="font-bubble text-lg mb-1" style={{ color: TEXT }}>{step.title}</p>
                <p className="font-round text-sm leading-relaxed" style={{ color: FAINT }}>{step.body}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mid-page pilot CTA */}
        <div className="rounded-3xl p-7 text-center"
          style={{ background: `${PRIMARY}0D`, border: `1px solid ${PRIMARY}35` }}>
          <p className="font-bubble text-xl mb-2" style={{ color: TEXT }}>Want to pilot this with one class?</p>
          <p className="font-round text-sm mb-5" style={{ color: FAINT }}>Set up a free classroom today or book a 15-minute walkthrough with us.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/?teacher=1"
              className="font-bubble text-white px-7 py-3 rounded-2xl text-base"
              style={{ background: PRIMARY }}>
              Start free classroom →
            </a>
            <a href="#enquiry"
              className="font-bubble px-7 py-3 rounded-2xl text-base border transition-colors"
              style={{ color: TEXT, borderColor: 'rgba(66,32,6,0.20)' }}>
              Book a 15-min demo
            </a>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="font-round text-xs font-black uppercase tracking-widest text-center mb-3" style={{ color: FAINT2 }}>Curriculum</p>
          <h2 className="font-bubble text-4xl text-center mb-4" style={{ color: TEXT }}>Aligned to the National Curriculum</h2>
          <p className="font-round text-center text-sm mb-10" style={{ color: FAINT }}>
            Full curriculum coverage map available to download.{' '}
            <a href="/curriculum-map" target="_blank" className="underline underline-offset-2 transition-colors" style={{ color: TEAL }}>
              View curriculum map →
            </a>
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {CURRICULUM.map((c, i) => (
              <motion.div key={c.stage}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-3xl p-6"
                style={{ background: '#FFFFFF', border: `1.5px solid ${c.color}40`, boxShadow: '0 4px 16px rgba(66,32,6,0.06)' }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: c.color + '18' }}>
                    {c.emoji}
                  </div>
                  <div>
                    <p className="font-bubble text-base leading-tight" style={{ color: TEXT }}>{c.stage}</p>
                    <p className="font-round text-xs font-bold mt-0.5" style={{ color: FAINT }}>{c.range}</p>
                  </div>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {c.topics.map(t => (
                    <li key={t} className="flex items-start gap-2.5">
                      <span className="text-sm mt-0.5 font-bold" style={{ color: c.color }}>✓</span>
                      <span className="font-round text-sm" style={{ color: FAINT }}>{t}</span>
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
        <p className="font-round text-xs font-black uppercase tracking-widest text-center mb-3" style={{ color: FAINT2 }}>Safeguarding</p>
        <h2 className="font-bubble text-4xl text-center mb-3" style={{ color: TEXT }}>Designed to be safe in schools</h2>
        <p className="font-round text-center text-sm mb-10 max-w-xl mx-auto" style={{ color: FAINT }}>
          No setup needed from your IT team. No personal data collected from children. Built to reduce common safeguarding and classroom-management concerns.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {TRUST.map(point => (
            <div key={point.text} className="flex items-start gap-3 p-4 rounded-2xl"
              style={{ background: 'rgba(15,118,110,0.07)', border: '1px solid rgba(15,118,110,0.20)' }}>
              <span className="text-lg shrink-0">{point.icon}</span>
              <p className="font-round text-sm font-bold" style={{ color: TEXT }}>{point.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Safe by class code */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <p className="font-round text-xs font-black uppercase tracking-widest text-center mb-3" style={{ color: FAINT2 }}>Data &amp; class isolation</p>
        <h2 className="font-bubble text-4xl text-center mb-3" style={{ color: TEXT }}>Safe by class code</h2>
        <p className="font-round text-center text-sm mb-10 max-w-2xl mx-auto" style={{ color: FAINT }}>
          Every class gets its own unique code. That code is the only way in — and it only ever opens that one class.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {CLASS_CODE_STEPS.map((step, i) => (
            <motion.div key={step.title}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-4 items-start p-5 rounded-2xl"
              style={CARD}>
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0"
                style={{ background: `${TEAL}14` }}>
                {step.icon}
              </div>
              <div>
                <p className="font-bubble text-base mb-1" style={{ color: TEXT }}>{step.title}</p>
                <p className="font-round text-sm leading-relaxed" style={{ color: FAINT }}>{step.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex items-center gap-3 p-4 rounded-2xl"
          style={{ background: 'rgba(15,118,110,0.07)', border: '1px solid rgba(15,118,110,0.20)' }}>
          <span className="text-lg shrink-0">🛡️</span>
          <p className="font-round text-sm font-bold" style={{ color: TEXT }}>
            Teachers only ever see their own school's and class's data — never another class or school.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="font-round text-xs font-black uppercase tracking-widest text-center mb-3" style={{ color: FAINT2 }}>Pricing</p>
          <h2 className="font-bubble text-4xl text-center mb-12" style={{ color: TEXT }}>Simple and transparent</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {/* Free tier */}
            <div className="rounded-3xl p-7"
              style={{ background: '#FFFFFF', border: `2px solid ${PRIMARY}50`, boxShadow: `0 8px 32px ${PRIMARY}18` }}>
              <p className="font-bubble text-4xl mb-1" style={{ color: TEXT }}>Free</p>
              <p className="font-round text-sm mb-6" style={{ color: FAINT }}>Forever. No credit card.</p>
              <ul className="flex flex-col gap-3 mb-8">
                {['1 classroom', 'Up to 30 pupils', 'All activities', 'Lesson setter', 'Daily class dashboard', 'Weekly progress report'].map(f => (
                  <li key={f} className="flex items-center gap-3">
                    <span className="font-black text-sm" style={{ color: PRIMARY }}>✓</span>
                    <span className="font-round text-sm" style={{ color: TEXT }}>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="/?teacher=1"
                className="block w-full text-center py-4 rounded-2xl font-bubble text-white text-lg"
                style={{ background: PRIMARY, boxShadow: '0 8px 24px rgba(194,65,12,0.30)' }}>
                Start free →
              </a>
            </div>

            {/* School tier */}
            <div className="rounded-3xl p-7" style={CARD}>
              <p className="font-bubble text-4xl mb-1" style={{ color: TEXT }}>School</p>
              <p className="font-round text-sm mb-1" style={{ color: FAINT }}>Annual licence — whole school.</p>
              <p className="font-round text-sm font-bold mb-6" style={{ color: TEAL }}>Simple annual invoice for schools.</p>
              <ul className="flex flex-col gap-3 mb-8">
                {['Multiple classrooms', 'School admin account', 'Aggregate class reports', 'Teacher invite flow', 'Annual invoice — no subscriptions', 'Priority support'].map(f => (
                  <li key={f} className="flex items-center gap-3">
                    <span className="font-black text-sm" style={{ color: FAINT }}>✓</span>
                    <span className="font-round text-sm" style={{ color: FAINT }}>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#enquiry"
                className="block w-full text-center py-4 rounded-2xl font-bubble text-lg border transition-colors"
                style={{ color: TEXT, borderColor: 'rgba(66,32,6,0.20)' }}>
                Get a quote →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Enquiry */}
      <section id="enquiry" className="max-w-xl mx-auto px-6 py-20">
        <p className="font-round text-xs font-black uppercase tracking-widest text-center mb-3" style={{ color: FAINT2 }}>Contact</p>
        <h2 className="font-bubble text-4xl text-center mb-2" style={{ color: TEXT }}>Talk to us</h2>
        <p className="font-round text-sm text-center mb-10" style={{ color: FAINT }}>
          Questions about curriculum, classroom setup or pricing. We reply within 1 working day.
        </p>
        <div className="rounded-3xl p-7" style={CARD}>
          <SchoolEnquiryForm source="schools-page" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6" style={{ borderTop: '1px solid rgba(66,32,6,0.08)' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <BloomLogo size="sm" />
          <div className="flex gap-6">
            <a href="/curriculum-map" target="_blank" className="font-round text-xs transition-colors" style={{ color: FAINT2 }}>Curriculum Map</a>
            <a href="/privacy" className="font-round text-xs transition-colors" style={{ color: FAINT2 }}>Privacy Policy</a>
            <a href="/" className="font-round text-xs transition-colors" style={{ color: FAINT2 }}>Home</a>
          </div>
          <p className="font-round text-xs" style={{ color: 'rgba(66,32,6,0.20)' }}>© 2026 Bloom Juniors</p>
        </div>
      </footer>
    </div>
  )
}
