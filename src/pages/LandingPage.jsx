import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import BloomLogo from '../components/BloomLogo'
import SchoolEnquiryForm from '../components/SchoolEnquiryForm'
import LandingDemo from '../components/LandingDemo'

// ── Warm daylight palette ─────────────────────────────────────────────────────
const TEXT = '#422006'
const TEXT_MUTED = 'rgba(66,32,6,0.62)'
const TEXT_FAINT = 'rgba(66,32,6,0.42)'
const PRIMARY = '#C2410C'
const PRIMARY_LIGHT = '#EA580C'
const TEAL = '#0F766E'
const CARD_BORDER = 'rgba(66,32,6,0.10)'

const FEATURES = [
  { emoji: '🧒', title: 'A companion, not a worksheet', desc: 'Yaagvi reacts to effort, struggle and progress so your child feels seen and encouraged while they learn.' },
  { emoji: '🗺️', title: 'A visible mastery journey', desc: 'The Mastery Map lights up sounds and skills as children practise — progress they can see and feel proud of.' },
  { emoji: '🏅', title: 'A parent moment after every win', desc: 'After a good session, a full-screen badge appears: "Show this to someone you love!" — learning becomes a family moment.' },
  { emoji: '🎮', title: 'A healthy daily rhythm', desc: 'Children complete their learning path first, then the arcade opens. Study first, play after — built into the design.' },
  { emoji: '📚', title: 'Built for British progression', desc: 'Phonics, maths, reading and wider learning carefully sequenced for ages 3–9, aligned with EYFS, KS1 and early KS2.' },
  { emoji: '🔒', title: 'Safe by design', desc: 'No ads, no social feeds, no random purchases. PIN-protected parent area with full progress visibility.' },
]

const HOW_STEPS = [
  { emoji: '👤', step: '1', title: 'Create a free profile', desc: 'Pick your child\'s age group and a fun avatar. Takes under 2 minutes, no credit card.' },
  { emoji: '🗺️', step: '2', title: 'Follow the daily path', desc: 'Yaagvi guides your child through 2 learning activities — phonics, maths, stories and more.' },
  { emoji: '🎮', step: '3', title: 'Earn games as the reward', desc: 'Complete the path → the Game Arcade unlocks. Study first, play after — the habit builds itself.' },
]

function DeveloperVideo() {
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)
  const videoRef = useRef(null)

  const toggle = () => {
    if (!videoRef.current || failed) return
    if (videoRef.current.paused) {
      videoRef.current.play()
        .then(() => setPlaying(true))
        .catch(() => setFailed(true))
    } else {
      videoRef.current.pause()
      setPlaying(false)
    }
  }

  return (
    <div
      className="relative flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer w-full md:w-72"
      style={{ aspectRatio: '16/9', border: `1.5px solid ${PRIMARY}30`, background: '#FFEDD5' }}
      onClick={toggle}
    >
      {failed ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <span className="text-3xl">🎬</span>
          <p className="font-round text-xs text-center px-4" style={{ color: TEXT_MUTED }}>Video unavailable — try on a stronger connection</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            src="/developer-story.mp4"
            poster="/founder.jpg"
            className="w-full h-full object-cover"
            playsInline
            preload="metadata"
            aria-label="Video: Bloom Juniors founder explaining why he built a free, ad-free British curriculum learning app"
            onEnded={() => setPlaying(false)}
            onError={() => setFailed(true)}
          />
          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(66,32,6,0.18)' }}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
                style={{ background: PRIMARY }}
              >
                <span className="text-white text-xl" style={{ marginLeft: '3px' }}>▶</span>
              </motion.div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const VIDEO_DURATION = 12000  // ms to show video before switching to mascot
const MASCOT_DURATION = 8000  // ms to show mascot before switching back

function HeroVisual() {
  const [showVideo, setShowVideo] = useState(true)
  const [videoFailed, setVideoFailed] = useState(false)

  useEffect(() => {
    if (videoFailed) return
    const duration = showVideo ? VIDEO_DURATION : MASCOT_DURATION
    const timer = setTimeout(() => setShowVideo(v => !v), duration)
    return () => clearTimeout(timer)
  }, [showVideo, videoFailed])

  const sparkles = ['⭐','✨','🌟']

  return (
    <motion.div
      className="flex-shrink-0 relative flex justify-center w-full md:w-auto"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.3 }}
    >
      {/* Video */}
      <AnimatePresence mode="wait">
        {showVideo ? (
          <motion.div
            key="video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden shadow-xl"
            style={{ border: `2px solid ${PRIMARY}30`, maxWidth: '420px', width: '100%' }}
          >
            <video
              src="/landing-video.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="w-full h-auto block"
              poster="/yaagvi-mascot.webp"
              style={{ background: '#FFEDD5', display: 'block' }}
              onError={() => { setVideoFailed(true); setShowVideo(false) }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="mascot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center"
          >
            <motion.div
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              <img
                src="/yaagvi-mascot.webp"
                alt="Yaagvi, the friendly mascot who guides children through free British curriculum learning games on Bloom Juniors"
                width={288}
                height={288}
                className="w-52 md:w-72 h-auto drop-shadow-xl relative z-10"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.7, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 220 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:-right-4 rounded-2xl px-3 py-2 text-center z-20 whitespace-nowrap"
                style={{ background: '#FFFFFF', boxShadow: '0 4px 20px rgba(66,32,6,0.12)' }}
              >
                <p className="font-bubble text-sm" style={{ color: PRIMARY_LIGHT }}>Hi kids! 👋🌸</p>
                <p className="font-round text-xs" style={{ color: TEXT_MUTED }}>Let's learn together!</p>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 w-0 h-0"
                  style={{ borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '10px solid #FFFFFF' }} />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating sparkles */}
      {sparkles.map((s, i) => (
        <motion.span key={`spark-${i}`}
          className="absolute text-lg pointer-events-none z-10"
          style={{ top: `${10 + i * 28}%`, right: `${-12 + i * 4}%` }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 2 + i * 0.6, repeat: Infinity, delay: i * 0.8 }}
        >
          {s}
        </motion.span>
      ))}
    </motion.div>
  )
}

// One-time 3D welcome flourish — Yaagvi flips/flies in to greet a first-time visitor,
// then settles away so it never blocks or repeats on scroll/re-render.
function WelcomeIntro() {
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(true)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (reduceMotion) { setVisible(false); return }
    const leaveTimer = setTimeout(() => setLeaving(true), 2200)
    const goneTimer = setTimeout(() => setVisible(false), 2700)
    return () => { clearTimeout(leaveTimer); clearTimeout(goneTimer) }
  }, [reduceMotion])

  if (reduceMotion || !visible) return null

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: 'radial-gradient(circle at 50% 45%, rgba(255,247,237,0.97), rgba(255,237,213,0.99))', perspective: 900 }}
      initial={{ opacity: 1 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      onClick={() => setLeaving(true)}
      role="presentation"
    >
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.08, y: -280, filter: 'blur(10px)' }}
        animate={leaving
          ? { opacity: 0, scale: 1.5, y: -60, filter: 'blur(6px)' }
          : { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
        transition={leaving
          ? { duration: 0.4, ease: 'easeIn' }
          : { type: 'spring', stiffness: 90, damping: 11, mass: 0.9 }}
      >
        <motion.img
          src="/yaagvi-mascot.webp"
          alt="Yaagvi waving hello"
          width={220}
          height={220}
          className="w-40 sm:w-52 h-auto drop-shadow-2xl"
          animate={leaving ? {} : { rotate: [0, -6, 6, -4, 0] }}
          transition={{ duration: 1, delay: 0.9 }}
        />
        <motion.div
          className="rounded-full -mt-3"
          style={{ width: 90, height: 16, background: 'radial-gradient(ellipse, rgba(66,32,6,0.28), transparent 72%)' }}
          initial={{ scale: 0, opacity: 0 }}
          animate={leaving ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.4 }}
        />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: leaving ? 0 : 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="font-bubble text-xl sm:text-2xl mt-3 text-center px-6"
          style={{ color: PRIMARY }}
        >
          Hi! I'm Yaagvi 👋🌸
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: leaving ? 0 : 1 }}
          transition={{ delay: 0.55 }}
          className="font-round text-sm text-center px-6 mt-1"
          style={{ color: TEXT_MUTED }}
        >
          Welcome to Bloom Juniors — let's learn together!
        </motion.p>
      </motion.div>
    </motion.div>
  )
}

export default function LandingPage({ onGetStarted, onSignIn, onTeacherSetup }) {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'linear-gradient(160deg,#FFF7ED 0%,#FFEDD5 45%,#FFF7ED 100%)' }}>
      <WelcomeIntro />

      {/* ── TOP ANNOUNCEMENT BAR ─────────────────────────────────────────────── */}
      <div className="text-center px-4" style={{ background: TEXT, color: '#FFFFFF', padding: '8px 16px', fontSize: '.88rem', fontWeight: 750 }}>
        ✨ Safe, ad-free British curriculum learning for ages 3–9
      </div>

      {/* ── NAV ──────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 md:px-8"
        style={{ background: 'rgba(255,247,237,0.92)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${CARD_BORDER}`, paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
        <BloomLogo size="md" />
        <div className="hidden lg:flex items-center gap-8 font-round text-sm font-bold leading-none" style={{ color: TEXT }}>
          <a href="#how-it-works" className="inline-flex items-center hover:opacity-70 transition-opacity">How it works</a>
          <a href="#schools" className="inline-flex items-center hover:opacity-70 transition-opacity">For schools</a>
          <a href="#safety" className="inline-flex items-center hover:opacity-70 transition-opacity">Safety</a>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSignIn}
            className="font-round text-sm leading-none px-4 py-2 rounded-xl inline-flex items-center transition-colors"
            style={{ color: TEXT_MUTED }}
          >
            Sign in
          </button>
          {onTeacherSetup && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onTeacherSetup}
              className="font-round text-sm leading-none px-4 py-2 rounded-xl border hidden sm:inline-flex items-center transition-colors"
              style={{ color: TEAL, borderColor: `${TEAL}40` }}
            >
              🏫 For teachers
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="font-bubble text-sm leading-none text-white px-4 py-2 rounded-xl inline-flex items-center"
            style={{ background: PRIMARY }}
          >
            Start free
          </motion.button>
        </div>
      </nav>

      <main>
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pt-16 pb-20 md:px-8 md:pt-24">
        {/* Floating subject emoji bubbles */}
        {[
          { emoji: '🔤', x: '3%',  y: '18%', color: '#F97316' },
          { emoji: '➕', x: '88%', y: '12%', color: '#0F766E' },
          { emoji: '🌍', x: '5%',  y: '62%', color: '#3B82F6' },
          { emoji: '🎨', x: '91%', y: '58%', color: '#DB2777' },
          { emoji: '🔬', x: '12%', y: '82%', color: '#16A34A' },
          { emoji: '📖', x: '85%', y: '80%', color: '#F59E0B' },
        ].map((item, i) => (
          <motion.div key={`subject-${i}`}
            className="pointer-events-none absolute hidden md:flex items-center justify-center rounded-2xl text-xl"
            style={{
              left: item.x, top: item.y,
              width: '50px', height: '50px',
              background: `${item.color}18`,
              border: `2px solid ${item.color}40`,
            }}
            animate={{ y: [0, -14, 0], rotate: [0, 6, -6, 0] }}
            transition={{ duration: 2.8 + i * 0.6, repeat: Infinity, delay: i * 0.45, ease: 'easeInOut' }}
          >
            {item.emoji}
          </motion.div>
        ))}

        {/* Two-column hero layout */}
        <div className="relative z-10 mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-8 md:gap-12">

          {/* Left: text content */}
          <motion.div
            className="flex-1 text-center md:text-left"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
              style={{ background: `${PRIMARY}14`, border: `1px solid ${PRIMARY}35` }}>
              <span className="text-sm">🌱</span>
              <span className="font-round text-xs font-bold" style={{ color: PRIMARY }}>Free · Ages 3–9 · EYFS, KS1 &amp; Early KS2</span>
            </div>

            <h1 className="font-bubble text-5xl md:text-6xl leading-tight mb-4" style={{ color: TEXT }}>
              Your child will ask to do their{' '}
              <span style={{ color: PRIMARY_LIGHT }}>homework</span>
              <br />— before you've had your coffee.
            </h1>

            <p className="font-round text-lg md:text-xl max-w-xl leading-relaxed mb-6" style={{ color: TEXT_MUTED }}>
              From first phonics sounds to times tables and reading — Bloom Juniors gives children aged 3–9 a guided daily path with Yaagvi, a companion who talks to them, notices their effort, and unlocks games only after the learning is done.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-8">
              {['✓ Free to start', '✓ No ads', '✓ No child accounts', '✓ Parent-guided', '✓ British curriculum aligned', '✓ No download needed'].map(b => (
                <span key={b} className="font-round text-xs px-3 py-1 rounded-full"
                  style={{ color: '#15803D', background: 'rgba(22,163,74,0.10)', border: '1px solid rgba(22,163,74,0.25)' }}>
                  {b}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start mb-3">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="font-bubble text-lg text-white px-8 py-4 rounded-2xl shadow-lg"
                style={{ background: PRIMARY }}
              >
                Start free today →
              </motion.button>
              {onTeacherSetup && (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onTeacherSetup}
                  className="font-bubble text-lg px-8 py-4 rounded-2xl border-2"
                  style={{ color: TEAL, background: `${TEAL}10`, borderColor: `${TEAL}45` }}
                >
                  🏫 I'm a teacher →
                </motion.button>
              )}
            </div>
            <p className="font-round text-xs text-center md:text-left" style={{ color: TEXT_FAINT }}>
              Already have an account?{' '}
              <button onClick={onSignIn} className="underline underline-offset-2 transition-colors" style={{ color: PRIMARY }}>Sign in</button>
            </p>
          </motion.div>

          {/* Right: Video + Mascot alternating */}
          <HeroVisual />
        </div>

        {/* Scroll hint */}
        <motion.div
          className="relative z-10 flex flex-col items-center mt-12 md:mt-8"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <span className="font-round text-xs mb-1" style={{ color: TEXT_FAINT }}>scroll to explore</span>
          <span className="text-lg" style={{ color: TEXT_FAINT }}>↓</span>
        </motion.div>
      </section>

      {/* ── TRUST BAR ────────────────────────────────────────────────────────── */}
      <section id="safety" className="px-4 pb-12 md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-round text-xs font-bold uppercase tracking-widest mb-5" style={{ color: TEXT_FAINT }}>
            Built for families who want screen time that means something
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
            {[
              { icon: '🇬🇧', label: 'British curriculum aligned' },
              { icon: '🔒', label: 'GDPR-safe · no child accounts' },
              { icon: '🚫', label: 'Zero ads, zero purchases' },
              { icon: '👨‍👩‍👧', label: 'Parent-guided by design' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-2 font-round text-sm font-bold"
                style={{ color: TEXT_MUTED }}
              >
                <span className="text-lg">{item.icon}</span>{item.label}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO ARE YOU LEARNING WITH (early fork) ───────────────────────────── */}
      <section className="px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-bubble text-2xl md:text-3xl text-center mb-8" style={{ color: TEXT }}>Who are you learning with today?</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="rounded-[24px] p-6 md:p-8 flex flex-col"
              style={{ background: '#FFFFFF', border: `1.5px solid ${PRIMARY}30`, boxShadow: '0 4px 16px rgba(66,32,6,0.06)' }}
            >
              <div className="text-4xl mb-4">🏠</div>
              <p className="font-bubble text-xl mb-2" style={{ color: TEXT }}>For Home</p>
              <p className="font-round text-sm leading-relaxed mb-6 flex-grow" style={{ color: TEXT_MUTED }}>
                A free profile for your child, a daily guided path with Yaagvi, and a parent dashboard that shows exactly what they've practised.
              </p>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={onGetStarted}
                className="font-bubble text-white text-sm py-3 rounded-2xl"
                style={{ background: PRIMARY }}
              >
                Start free at home →
              </motion.button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              transition={{ delay: 0.08 }}
              className="rounded-[24px] p-6 md:p-8 flex flex-col"
              style={{ background: TEXT, boxShadow: '0 4px 16px rgba(66,32,6,0.1)' }}
            >
              <div className="text-4xl mb-4">🏫</div>
              <p className="font-bubble text-xl mb-2 text-white">For Schools &amp; Nurseries</p>
              <p className="font-round text-sm leading-relaxed mb-6 flex-grow text-white/75">
                Class-wide progress tracking with zero admin — no individual pupil logins needed. Used alongside your regular teaching.
              </p>
              {onTeacherSetup ? (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={onTeacherSetup}
                  className="font-bubble text-sm py-3 rounded-2xl"
                  style={{ background: '#FFFFFF', color: TEXT }}
                >
                  🏫 Get free school access →
                </motion.button>
              ) : (
                <a
                  href="/schools"
                  className="font-bubble text-sm py-3 rounded-2xl text-center"
                  style={{ background: '#FFFFFF', color: TEXT }}
                >
                  🏫 See schools page →
                </a>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-bubble text-3xl md:text-4xl text-center mb-2" style={{ color: TEXT }}>How it works</h2>
          <p className="font-round text-sm text-center mb-10" style={{ color: TEXT_FAINT }}>Up and learning in under 2 minutes.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line on desktop */}
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-0.5 pointer-events-none"
              style={{ background: `linear-gradient(90deg, ${PRIMARY}25, ${TEAL}25)` }} />
            {HOW_STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, type: 'spring', stiffness: 220 }}
                className="flex flex-col items-center text-center"
              >
                <div
                  className="relative flex h-20 w-20 items-center justify-center rounded-[24px] text-4xl mb-4 shadow-sm"
                  style={{ background: `${PRIMARY}14`, border: `2px solid ${PRIMARY}30` }}
                >
                  {s.emoji}
                  <div
                    className="absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full font-bubble text-sm text-white shadow"
                    style={{ background: PRIMARY }}
                  >
                    {s.step}
                  </div>
                </div>
                <p className="font-bubble text-lg mb-2" style={{ color: TEXT }}>{s.title}</p>
                <p className="font-round text-sm leading-relaxed max-w-xs" style={{ color: TEXT_MUTED }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              onClick={onGetStarted}
              className="font-bubble text-base text-white px-8 py-3.5 rounded-2xl shadow-lg"
              style={{ background: PRIMARY }}
            >
              Try it free — no card needed →
            </motion.button>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE DEMO ─────────────────────────────────────────────────── */}
      <LandingDemo onGetStarted={onGetStarted} />

      {/* ── REAL APP SCREENS ─────────────────────────────────────────────────── */}
      <section className="px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-bubble text-3xl md:text-4xl text-center mb-2" style={{ color: TEXT }}>
            Inside the app
          </h2>
          <p className="font-round text-sm text-center mb-10" style={{ color: TEXT_FAINT }}>
            Real screens, exactly as your child sees them.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { src: '/screens/app-toddler.png', alt: 'Free British curriculum learning dashboard for a 3-4 year old on Bloom Juniors, ad-free and no downloads needed', caption: 'Tiny Stars (3–4): two tiny games a day', color: '#F97316' },
              { src: '/screens/app-activity.png', alt: 'Free EYFS counting activity with picture-based questions and voice guidance from Yaagvi', caption: 'Tap-to-learn activities with voice guidance', color: '#F59E0B' },
              { src: '/screens/app-matchup.png', alt: 'Free KS1 logic puzzle game where a child plans moves to guide their character to the goal', caption: 'Puzzle Quest builds early problem-solving skills', color: '#DB2777' },
              { src: '/screens/app-arcade.png', alt: 'Game Arcade reward screen, unlocked after completing daily British curriculum learning activities', caption: 'Finish the path → the arcade opens', color: '#0F766E' },
            ].map((shot, i) => (
              <motion.figure
                key={shot.src}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 220 }}
                className="flex flex-col items-center"
              >
                <div className="rounded-[28px] overflow-hidden shadow-lg w-full"
                  style={{ border: `2.5px solid ${shot.color}50`, background: '#FFEDD5' }}>
                  <img
                    src={shot.src}
                    alt={shot.alt}
                    width={390}
                    height={844}
                    loading="lazy"
                    className="w-full h-auto block"
                  />
                </div>
                <figcaption className="font-round text-xs text-center mt-3 leading-snug px-1" style={{ color: TEXT_MUTED }}>
                  {shot.caption}
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section className="px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-bubble text-3xl md:text-4xl text-center mb-2" style={{ color: TEXT }}>Designed with parents in mind</h2>
          <p className="font-round text-sm text-center mb-10" style={{ color: TEXT_FAINT }}>Simple tools that keep you in control and your child inspired.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03, y: -3 }}
                transition={{ delay: 0.05 + i * 0.07 }}
                className="rounded-[20px] p-5 cursor-default"
                style={{ background: '#FFFFFF', border: `1px solid ${CARD_BORDER}`, boxShadow: '0 4px 14px rgba(66,32,6,0.05)' }}
              >
                <div className="text-3xl mb-3">{f.emoji}</div>
                <p className="font-bubble text-base mb-1" style={{ color: TEXT }}>{f.title}</p>
                <p className="font-round text-sm leading-relaxed" style={{ color: TEXT_MUTED }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FROM THE DEVELOPER ───────────────────────────────────────────────── */}
      <section id="founder" className="px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[24px] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6"
            style={{ background: '#FFFFFF', border: `1px solid ${CARD_BORDER}`, boxShadow: '0 4px 16px rgba(66,32,6,0.05)' }}
          >
            <DeveloperVideo />
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
                <img
                  src="/founder.jpg"
                  alt="Sanju, founder of Bloom Juniors"
                  width={64}
                  height={64}
                  loading="lazy"
                  className="w-16 h-16 rounded-full object-cover shadow-lg"
                  style={{ border: `2.5px solid ${PRIMARY}40` }}
                />
                <p className="font-round text-xs font-bold uppercase tracking-widest" style={{ color: PRIMARY }}>From the founder</p>
              </div>
              <p className="font-bubble text-xl md:text-2xl leading-snug mb-3" style={{ color: TEXT }}>
                "I built Bloom Juniors for my own child — to make learning something they genuinely enjoy, not just tasks to complete."
              </p>
              <p className="font-round text-sm leading-relaxed mb-3" style={{ color: TEXT_MUTED }}>
                No ads, no dark patterns, no app store required. Every activity is hand-built around the British curriculum — from RWI phonics Sets 1–3 to times tables 2–12 — and tested daily by the toughest critic I know: my own little one.
              </p>
              <p className="font-round text-sm font-bold" style={{ color: TEAL }}>
                — Sanju, founder &amp; dad of one
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOR SCHOOLS ──────────────────────────────────────────────────────── */}
      <section id="schools" className="pb-16" style={{ background: 'linear-gradient(180deg, #FFEDD5 0%, #FDE3C7 50%, #FFEDD5 100%)' }}>
        <div className="mx-auto max-w-4xl px-4 md:px-8 py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row gap-10 items-start"
          >
            {/* Left: pitch */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-5"
                style={{ background: `${TEAL}16`, border: `1px solid ${TEAL}40` }}>
                <span className="text-sm">🏫</span>
                <span className="font-round text-xs font-bold uppercase tracking-widest" style={{ color: TEAL }}>Schools &amp; Nurseries</span>
              </div>
              <h2 className="font-bubble text-3xl md:text-4xl leading-tight mb-4" style={{ color: TEXT }}>
                Bring Bloom Juniors<br />into your classroom
              </h2>
              <p className="font-round text-sm leading-relaxed mb-6 max-w-md" style={{ color: TEXT_MUTED }}>
                EYFS to KS2 aligned. Safe, no child accounts, no ads. Used alongside regular teaching to reinforce phonics, maths and literacy.
              </p>
              <div className="flex flex-col gap-2 mb-6">
                {[
                  { icon: '✅', text: 'EYFS · KS1 · KS2 curriculum aligned' },
                  { icon: '🔒', text: 'No child accounts or personal data needed' },
                  { icon: '📊', text: 'Teacher dashboard with class progress' },
                  { icon: '📱', text: 'Works on any school device — no install' },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-2">
                    <span className="text-base">{item.icon}</span>
                    <span className="font-round text-sm" style={{ color: TEXT_MUTED }}>{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                {onTeacherSetup && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onTeacherSetup}
                    className="font-bubble text-base text-white px-6 py-3 rounded-2xl"
                    style={{ background: TEAL, boxShadow: '0 6px 18px rgba(15,118,110,0.3)' }}
                  >
                    🏫 Set up your classroom free →
                  </motion.button>
                )}
                <a href="/schools" className="font-round text-sm underline underline-offset-4 transition-colors" style={{ color: TEAL }}>
                  See the full schools page →
                </a>
              </div>
            </div>
            {/* Right: form */}
            <div className="w-full lg:w-[420px] rounded-[24px] p-6"
              style={{ background: '#FFFFFF', border: `1.5px solid ${TEAL}30`, boxShadow: '0 4px 16px rgba(66,32,6,0.06)' }}>
              <p className="font-bubble text-lg mb-1" style={{ color: TEXT }}>Send an enquiry</p>
              <p className="font-round text-xs mb-5" style={{ color: TEXT_FAINT }}>We reply within 1–2 business days.</p>
              <SchoolEnquiryForm source="landing-page" />
            </div>
          </motion.div>
        </div>
      </section>

      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="border-t px-4 pt-12 pb-8 md:px-8" style={{ borderColor: CARD_BORDER }}>
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 mb-10">
            <div className="col-span-2 sm:col-span-1">
              <BloomLogo size="sm" />
              <p className="font-round text-sm mt-3 leading-relaxed max-w-[220px]" style={{ color: TEXT_MUTED }}>
                Free, ad-free British curriculum learning for ages 3–9. Built by a parent, for parents.
              </p>
            </div>
            <div>
              <p className="font-round text-xs font-bold uppercase tracking-widest mb-4" style={{ color: TEXT }}>Product</p>
              <div className="flex flex-col gap-2.5">
                <a href="#how-it-works" className="font-round text-sm transition-colors" style={{ color: TEXT_MUTED }}>How it works</a>
                <a href="#schools" className="font-round text-sm transition-colors" style={{ color: TEXT_MUTED }}>For schools</a>
              </div>
            </div>
            <div>
              <p className="font-round text-xs font-bold uppercase tracking-widest mb-4" style={{ color: TEXT }}>Company</p>
              <div className="flex flex-col gap-2.5">
                <a href="#founder" className="font-round text-sm transition-colors" style={{ color: TEXT_MUTED }}>Our story</a>
                <a href="/schools" className="font-round text-sm transition-colors" style={{ color: TEXT_MUTED }}>Schools &amp; nurseries</a>
              </div>
            </div>
            <div>
              <p className="font-round text-xs font-bold uppercase tracking-widest mb-4" style={{ color: TEXT }}>Get in touch</p>
              <div className="flex flex-col gap-2.5">
                <a href="mailto:hello@bloomjuniors.com" className="font-round text-sm transition-colors" style={{ color: TEXT_MUTED }}>Contact us</a>
                <a href="/privacy" className="font-round text-sm transition-colors" style={{ color: TEXT_MUTED }}>Privacy Policy</a>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t" style={{ borderColor: CARD_BORDER }}>
            <p className="font-round text-xs" style={{ color: TEXT_FAINT }}>
              © 2026 Bloom Juniors · Learning app for ages 3–9 · Worldwide
            </p>
            <p className="font-round text-xs" style={{ color: TEXT_FAINT }}>
              🌻 Built with love, for every curious child
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
