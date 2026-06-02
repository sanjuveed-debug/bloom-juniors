import React from 'react'
import { motion } from 'framer-motion'
import SchoolEnquiryForm from '../components/SchoolEnquiryForm'

const AGE_WORLDS = [
  {
    emoji: '🧸',
    label: 'Tiny Stars',
    range: 'Ages 3–4 · EYFS',
    gradient: 'linear-gradient(135deg, #FF9A3C 0%, #FFD93D 60%, #FF6B9D 100%)',
    glow: '#FF9A3C',
    areas: ['Colours & Shapes', 'Counting 1–10', 'Animal Sounds', 'Phonics Foundations', 'Daily Mood Check-in'],
  },
  {
    emoji: '🌟',
    label: 'Little Stars',
    range: 'Ages 4–6 · EYFS / KS1',
    gradient: 'linear-gradient(135deg, #8B00FF 0%, #C77DFF 55%, #FF1D8E 100%)',
    glow: '#8B00FF',
    areas: ['Phonics & Tricky Words', 'Early Maths', 'Story Reading', 'Shapes & Patterns', 'Art & Science', 'Daily Adventure Path'],
  },
  {
    emoji: '🚀',
    label: 'Super Kids',
    range: 'Ages 7–9 · KS2',
    gradient: 'linear-gradient(135deg, #E21C1C 0%, #1C4BE2 55%, #7B2FBE 100%)',
    glow: '#E21C1C',
    areas: ['Times Tables 2–12', 'Fractions & Word Problems', 'Reading Comprehension', 'Spelling (Y3–6 list)', 'Grammar', 'Science & World Map', 'XP + Game Reward System'],
  },
]

const TRUST_POINTS = [
  { emoji: '🇬🇧', label: 'British Curriculum', desc: 'EYFS, KS1, KS2 aligned. No gaps, no guesswork.' },
  { emoji: '🔒', label: 'No Child Accounts', desc: 'Parents create the account. Children never have a login, profile, or public presence.' },
  { emoji: '🚫', label: 'No Ads or Chat', desc: 'Zero adverts. No messaging, no social features, no external links.' },
  { emoji: '📊', label: 'Parent Progress Tracking', desc: 'Session history, stars earned, module performance — all visible in the parent dashboard.' },
  { emoji: '⏱️', label: 'Session Timer', desc: 'Parents set a daily screen-time limit. The app reminds children when time is up.' },
  { emoji: '📱', label: 'Any Device', desc: 'Works on phone, tablet, or desktop. No app store download required — runs in the browser.' },
]

const PILOT_STEPS = [
  { n: '1', text: 'Create a free parent account at bloomjuniors.com' },
  { n: '2', text: 'Add one child profile and choose the age world' },
  { n: '3', text: 'Run a 20-minute session each school day for one week' },
  { n: '4', text: 'Review the parent dashboard to see progress and session data' },
]

export default function SchoolsPage() {
  return (
    <div
      className="min-h-screen overflow-y-auto"
      style={{ background: 'linear-gradient(160deg, #080516 0%, #1a0533 45%, #061633 100%)' }}
    >
      {/* Nav */}
      <div className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
        <a href="/" className="font-bubble text-white text-xl" style={{ textShadow: '0 0 20px rgba(139,0,255,0.6)' }}>
          Bloom Juniors
        </a>
        <a
          href="/?app=1"
          className="rounded-2xl px-5 py-2.5 font-bubble text-sm text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg, #8B00FF, #FF1D8E)' }}
        >
          Try Free →
        </a>
      </div>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-10 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 20 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 font-round text-xs font-black uppercase tracking-widest text-white/70"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
            UK British Curriculum · EYFS to KS2 · Ages 3–9
          </div>
          <h1 className="font-bubble text-4xl md:text-5xl text-white leading-tight mb-4"
            style={{ textShadow: '0 0 40px rgba(139,0,255,0.5)' }}>
            Bloom Juniors<br />for Schools &amp; Nurseries
          </h1>
          <p className="font-round text-white/65 text-base md:text-lg max-w-xl mx-auto leading-7">
            A safe, curriculum-aligned learning app for ages 3–9. No ads, no child accounts,
            no distractions — just focused daily learning with parent visibility.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <a href="/?app=1"
              className="rounded-2xl px-7 py-3.5 font-bubble text-white text-base shadow-xl"
              style={{ background: 'linear-gradient(135deg, #8B00FF, #FF1D8E)', boxShadow: '0 8px 28px rgba(139,0,255,0.4)' }}>
              Start Free Pilot →
            </a>
            <a href="#enquiry"
              className="rounded-2xl px-7 py-3.5 font-bubble text-white text-base"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
              Get in touch
            </a>
          </div>
        </motion.div>
      </section>

      {/* Age worlds */}
      <section className="max-w-4xl mx-auto px-6 pb-14">
        <p className="font-round text-white/50 text-xs font-black uppercase tracking-[0.2em] mb-5 text-center">
          Three age-appropriate worlds
        </p>
        <div className="grid md:grid-cols-3 gap-5">
          {AGE_WORLDS.map((w, idx) => (
            <motion.div
              key={w.label}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, type: 'spring', stiffness: 240, damping: 22 }}
              className="rounded-[28px] p-5 flex flex-col gap-3"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${w.glow}40`,
                boxShadow: `0 8px 32px ${w.glow}18`,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                  style={{ background: w.gradient }}>
                  {w.emoji}
                </div>
                <div>
                  <p className="font-bubble text-white text-lg leading-tight">{w.label}</p>
                  <p className="font-round text-white/50 text-xs font-bold mt-0.5">{w.range}</p>
                </div>
              </div>
              <ul className="flex flex-col gap-1.5 mt-1">
                {w.areas.map(area => (
                  <li key={area} className="flex items-start gap-2">
                    <span className="text-green-400 text-sm mt-0.5">✓</span>
                    <span className="font-round text-white/70 text-sm font-bold leading-5">{area}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust points */}
      <section className="max-w-4xl mx-auto px-6 pb-14">
        <p className="font-round text-white/50 text-xs font-black uppercase tracking-[0.2em] mb-5 text-center">
          Why schools choose Bloom Juniors
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {TRUST_POINTS.map((pt, idx) => (
            <motion.div
              key={pt.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.06, type: 'spring', stiffness: 240 }}
              className="rounded-[22px] p-4 flex gap-3"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span className="text-2xl shrink-0">{pt.emoji}</span>
              <div>
                <p className="font-bubble text-white text-sm leading-tight">{pt.label}</p>
                <p className="font-round text-white/55 text-xs font-bold mt-1 leading-5">{pt.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 1-week pilot */}
      <section className="max-w-2xl mx-auto px-6 pb-14">
        <div className="rounded-[28px] p-7"
          style={{ background: 'linear-gradient(135deg, rgba(139,0,255,0.18), rgba(0,80,255,0.12))', border: '1px solid rgba(139,0,255,0.35)' }}>
          <p className="font-round text-white/50 text-xs font-black uppercase tracking-[0.2em] mb-3 text-center">
            Suggested school pilot
          </p>
          <h2 className="font-bubble text-white text-2xl text-center mb-6">
            1-Week Classroom Pilot
          </h2>
          <div className="flex flex-col gap-3 mb-6">
            {PILOT_STEPS.map(step => (
              <div key={step.n} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bubble text-sm text-white"
                  style={{ background: 'rgba(139,0,255,0.5)', border: '1px solid rgba(139,0,255,0.6)' }}>
                  {step.n}
                </div>
                <p className="font-round text-white/75 text-sm font-bold leading-6 pt-0.5">{step.text}</p>
              </div>
            ))}
          </div>
          <p className="font-round text-center text-white/40 text-xs">
            No commitment. No credit card. Completely free to pilot.
          </p>
        </div>
      </section>

      {/* Contact / Enquiry form */}
      <section id="enquiry" className="max-w-2xl mx-auto px-6 pb-16">
        <div className="rounded-[28px] p-7"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="text-4xl mb-3 text-center">✉️</div>
          <h2 className="font-bubble text-white text-2xl mb-1 text-center">Get in touch</h2>
          <p className="font-round text-white/55 text-sm leading-6 mb-6 text-center max-w-sm mx-auto">
            For bulk setup guidance, classroom demo calls, or curriculum coverage questions — fill in the form and we&apos;ll reply within 1–2 business days.
          </p>
          <SchoolEnquiryForm source="schools-page" />
        </div>
      </section>

      {/* Footer */}
      <div className="text-center pb-10 px-6">
        <div className="flex justify-center gap-6">
          <a href="/privacy" className="font-round text-white/30 text-xs hover:text-white/60">Privacy Policy</a>
          <a href="/?app=1" className="font-round text-white/30 text-xs hover:text-white/60">Back to App</a>
        </div>
      </div>
    </div>
  )
}
