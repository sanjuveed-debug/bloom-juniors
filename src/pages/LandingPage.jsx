import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BloomLogo from '../components/BloomLogo'
import SchoolEnquiryForm from '../components/SchoolEnquiryForm'
import LandingDemo from '../components/LandingDemo'

const AGE_GROUPS = [
  { emoji: '🧸', label: 'Tiny Stars', range: 'Ages 3–4', color: '#FF9A3C', desc: 'Colours, shapes, numbers & animals through gentle tap games.' },
  { emoji: '🌟', label: 'Little Stars', range: 'Ages 4–6', color: '#8B00FF', desc: 'Phonics, maths, stories, art & world exploration.' },
  { emoji: '🚀', label: 'Super Kids', range: 'Ages 7–9', color: '#E21C1C', desc: 'Times tables, fractions, reading, science & more.' },
]

const FEATURES = [
  { emoji: '🧒', title: 'A companion, not a worksheet', desc: 'Yaagvi reacts to effort, struggle and progress so your child feels seen and encouraged while they learn.' },
  { emoji: '🗺️', title: 'A visible mastery journey', desc: 'The Mastery Map lights up sounds and skills as children practise — progress they can see and feel proud of.' },
  { emoji: '🏅', title: 'A parent moment after every win', desc: 'After a good session, a full-screen badge appears: "Show this to someone you love!" — learning becomes a family moment.' },
  { emoji: '🎮', title: 'A healthy daily rhythm', desc: 'Children complete their learning path first, then the arcade opens. Study first, play after — built into the design.' },
  { emoji: '📚', title: 'Built for British progression', desc: 'Phonics, maths, reading and wider learning carefully sequenced for ages 3–9, aligned with EYFS, KS1 and early KS2.' },
  { emoji: '🔒', title: 'Safe by design', desc: 'No ads, no social feeds, no random purchases. PIN-protected parent area with full progress visibility.' },
]

const THREE_HOOKS = [
  {
    emoji: '💛',
    title: 'Yaagvi notices how they learn',
    desc: 'When your child is confident, stuck, tired or improving, Yaagvi responds with the right encouragement — not a generic "well done."',
    color: '#F59E0B',
  },
  {
    emoji: '🗺️',
    title: 'The Mastery Map makes progress visible',
    desc: 'Every sound, skill and activity lights up as they practise. Children can see exactly what they are getting better at.',
    color: '#8B5CF6',
  },
  {
    emoji: '🏅',
    title: 'The Parent Handoff turns learning into a moment',
    desc: 'After a win, Bloom Juniors creates a full-screen badge card: "Show this to someone you love!" — learning becomes a family conversation.',
    color: '#10B981',
  },
]

const CURRICULUM = [
  {
    stage: 'EYFS',
    range: 'Ages 3–5',
    emoji: '🧸',
    color: '#FF9A3C',
    items: ['Listening and attention', 'Early number sense and counting', 'Colours, shapes and patterns', 'First phonics readiness', 'Stories and imagination'],
  },
  {
    stage: 'KS1',
    range: 'Ages 5–7',
    emoji: '🌟',
    color: '#8B00FF',
    items: ['Pure-sound phonics progression', 'CVC words and blending', 'Reading confidence', 'Number bonds and early maths', 'Topic and world learning'],
  },
  {
    stage: 'Early KS2',
    range: 'Ages 7–9',
    emoji: '🚀',
    color: '#E21C1C',
    items: ['Times tables and fractions', 'Grammar and comprehension', 'Science and geography', 'Problem solving', 'Wider world exploration'],
  },
]

const PARENT_NOTICES = [
  { emoji: '📖', text: 'My child started asking to do their reading before school — I didn\'t have to ask.', label: 'On building the habit' },
  { emoji: '🗺️', text: 'Seeing the Mastery Map light up made phonics feel like collecting progress, not doing homework.', label: 'On visible progress' },
  { emoji: '🏅', text: 'Instead of asking what they did, the handoff badge meant they explained it themselves.', label: 'On the parent moment' },
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
      style={{ aspectRatio: '16/9', border: '1.5px solid rgba(139,0,255,0.3)', background: '#0a0a2e' }}
      onClick={toggle}
    >
      {failed ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <span className="text-3xl">🎬</span>
          <p className="font-round text-white/60 text-xs text-center px-4">Video unavailable — try on a stronger connection</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            src="/developer-story.mp4"
            className="w-full h-full object-cover"
            playsInline
            preload="metadata"
            onEnded={() => setPlaying(false)}
            onError={() => setFailed(true)}
          />
          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.35)' }}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
                style={{ background: 'linear-gradient(135deg,#8B00FF,#FF1D8E)' }}
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

function WaitlistForm({ source = 'hero' }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || status !== 'idle') return
    setStatus('sending')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), module: source }),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-3 rounded-2xl p-4"
        style={{ background: 'rgba(34,197,94,0.15)', border: '1.5px solid rgba(34,197,94,0.3)' }}
      >
        <span className="text-2xl">🎉</span>
        <div>
          <p className="font-bubble text-white text-base">You're on the list!</p>
          <p className="font-round text-white/60 text-xs">Check your inbox — 50% off early bird offer inside.</p>
        </div>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 flex-col sm:flex-row">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="flex-1 rounded-2xl px-4 py-3.5 font-round text-sm text-white outline-none"
        style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)' }}
      />
      <motion.button
        type="submit"
        whileTap={{ scale: 0.95 }}
        disabled={status === 'sending'}
        className="rounded-2xl px-6 py-3.5 font-bubble text-sm text-white shadow-lg whitespace-nowrap"
        style={{ background: 'linear-gradient(135deg,#8B00FF,#FF1D8E)', opacity: status === 'sending' ? 0.7 : 1 }}
      >
        {status === 'sending' ? 'Joining…' : 'Join waitlist →'}
      </motion.button>
      {status === 'error' && (
        <p className="font-round text-red-400 text-xs mt-1 sm:col-span-2">Something went wrong — try again.</p>
      )}
    </form>
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
      {/* Glow */}
      <div className="absolute -inset-4 rounded-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 50%,rgba(139,0,255,0.35),transparent)', filter: 'blur(24px)' }} />

      {/* Video */}
      <AnimatePresence mode="wait">
        {showVideo ? (
          <motion.div
            key="video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden shadow-2xl"
            style={{ border: '2px solid rgba(139,0,255,0.4)', maxWidth: '420px', width: '100%' }}
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
              style={{ background: '#0a0a2e', display: 'block' }}
              onError={() => { setVideoFailed(true); setShowVideo(false) }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
              style={{ background: 'linear-gradient(to top,rgba(11,15,42,0.6),transparent)' }} />
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
                alt="Bloom mascot"
                width={288}
                height={288}
                className="w-52 md:w-72 h-auto drop-shadow-2xl relative z-10"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.7, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 220 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:-right-4 rounded-2xl px-3 py-2 text-center z-20 whitespace-nowrap"
                style={{ background: 'rgba(255,255,255,0.96)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
              >
                <p className="font-bubble text-purple-700 text-sm">Hi kids! 👋🌸</p>
                <p className="font-round text-gray-500 text-xs">Let's learn together!</p>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 w-0 h-0"
                  style={{ borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '10px solid rgba(255,255,255,0.96)' }} />
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

export default function LandingPage({ onGetStarted, onSignIn, onTeacherSetup }) {
  const [openFaq, setOpenFaq] = useState(null)

  const faqs = [
    { q: 'Is it really free?', a: 'Yes — Sound Pop (phonics), Number World (maths), Story Room, Da Vinci Studio and Fun Exercise are completely free, forever. Premium modules unlock the full library.' },
    { q: 'What age is it designed for?', a: 'Three age groups: Tiny Stars (3–4), Little Stars (4–6), and Super Kids (7–9). Each child gets their own profile and experience.' },
    { q: 'Do I need to install anything?', a: 'No app store needed. Visit the website and tap "Add to Home Screen" to install it like an app on any phone, tablet or computer.' },
    { q: 'How is screen time managed?', a: 'The Parent Zone lets you set session time limits, review what your child practised, and see full progress reports.' },
    { q: 'Is my child\'s data safe?', a: 'All data is encrypted and stored securely. We never share personal information with third parties.' },
  ]

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'linear-gradient(160deg,#0B0F2A 0%,#1A1550 40%,#0B0F2A 100%)' }}>

      {/* ── NAV ──────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 md:px-8"
        style={{ background: 'rgba(11,15,42,0.88)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
        <BloomLogo size="md" />
        <div className="flex items-center gap-2">
          <button
            onClick={onSignIn}
            className="font-round text-white/70 text-sm px-4 py-2 rounded-xl hover:text-white transition-colors"
          >
            Sign in
          </button>
          {onTeacherSetup && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onTeacherSetup}
              className="font-round text-sm text-indigo-300 px-4 py-2 rounded-xl border border-indigo-400/40 hover:bg-indigo-400/10 transition-colors hidden sm:block"
            >
              🏫 For teachers
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="font-bubble text-sm text-white px-4 py-2 rounded-xl"
            style={{ background: 'linear-gradient(135deg,#8B00FF,#FF1D8E)' }}
          >
            Start free
          </motion.button>
        </div>
      </nav>

      <main>
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pt-16 pb-20 md:px-8 md:pt-24">
        {/* Animated background glow */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 30%,rgba(139,0,255,0.35),transparent)' }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* Twinkling stars */}
        {[...Array(22)].map((_, i) => (
          <motion.div key={`star-${i}`}
            className="pointer-events-none absolute rounded-full bg-white"
            style={{
              width: `${1 + (i % 3)}px`,
              height: `${1 + (i % 3)}px`,
              left: `${(i * 43 + 3) % 96}%`,
              top: `${(i * 31 + 5) % 88}%`,
            }}
            animate={{ opacity: [0.1, 0.9, 0.1], scale: [0.8, 1.4, 0.8] }}
            transition={{ duration: 1.4 + (i * 0.27) % 2, repeat: Infinity, delay: (i * 0.19) % 3 }}
          />
        ))}

        {/* Floating subject emoji bubbles */}
        {[
          { emoji: '🔤', x: '3%',  y: '18%', color: '#8B00FF' },
          { emoji: '➕', x: '88%', y: '12%', color: '#FF1D8E' },
          { emoji: '🌍', x: '5%',  y: '62%', color: '#3B82F6' },
          { emoji: '🎨', x: '91%', y: '58%', color: '#FF9A3C' },
          { emoji: '🔬', x: '12%', y: '82%', color: '#22C55E' },
          { emoji: '📖', x: '85%', y: '80%', color: '#FFD700' },
        ].map((item, i) => (
          <motion.div key={`subject-${i}`}
            className="pointer-events-none absolute hidden md:flex items-center justify-center rounded-2xl text-xl"
            style={{
              left: item.x, top: item.y,
              width: '50px', height: '50px',
              background: `${item.color}22`,
              border: `2px solid ${item.color}55`,
              backdropFilter: 'blur(6px)',
            }}
            animate={{ y: [0, -14, 0], rotate: [0, 6, -6, 0] }}
            transition={{ duration: 2.8 + i * 0.6, repeat: Infinity, delay: i * 0.45, ease: 'easeInOut' }}
          >
            {item.emoji}
          </motion.div>
        ))}

        {/* Soft background blobs */}
        {[...Array(5)].map((_, i) => (
          <motion.div key={`blob-${i}`}
            className="pointer-events-none absolute rounded-full"
            style={{
              width: `${40 + i * 18}px`, height: `${40 + i * 18}px`,
              left: `${10 + i * 18}%`, top: `${15 + (i * 13) % 40}%`,
              background: ['#8B00FF','#FF1D8E','#FF9A3C','#FFD700','#3B82F6'][i],
              opacity: 0.14, filter: 'blur(14px)',
            }}
            animate={{ y: [0, -16, 0], x: [0, 8, 0] }}
            transition={{ duration: 3 + i * 0.8, repeat: Infinity, delay: i * 0.4 }}
          />
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
              style={{ background: 'rgba(139,0,255,0.2)', border: '1px solid rgba(139,0,255,0.4)' }}>
              <span className="text-sm">🌱</span>
              <span className="font-round text-xs font-bold text-purple-300">Free · Ages 3–9 · EYFS, KS1 &amp; Early KS2</span>
            </div>

            <h1 className="font-bubble text-5xl md:text-6xl text-white leading-tight mb-4"
              style={{ textShadow: '0 4px 30px rgba(139,0,255,0.4)' }}>
              Learning that feels<br />
              <span style={{ background: 'linear-gradient(135deg,#C77DFF,#FF1D8E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                personal to your child.
              </span>
            </h1>

            <p className="font-round text-white/70 text-lg md:text-xl max-w-xl leading-relaxed mb-6">
              Bloom Juniors helps children aged 3–9 build phonics, maths and reading confidence with Yaagvi — a companion who responds to effort, lights up progress on a Mastery Map, and helps children proudly share their wins with you.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-8">
              {['✓ Free to start', '✓ No ads', '✓ Parent-guided', '✓ No download needed'].map(b => (
                <span key={b} className="font-round text-xs text-green-300 px-3 py-1 rounded-full"
                  style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
                  {b}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start mb-3">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="font-bubble text-lg text-white px-8 py-4 rounded-2xl shadow-2xl"
                style={{ background: 'linear-gradient(135deg,#8B00FF,#FF1D8E)', boxShadow: '0 12px 32px rgba(139,0,255,0.4)' }}
              >
                Start free today →
              </motion.button>
              {onTeacherSetup && (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onTeacherSetup}
                  className="font-bubble text-lg text-white px-8 py-4 rounded-2xl"
                  style={{ background: 'rgba(99,102,241,0.2)', border: '2px solid rgba(99,102,241,0.5)' }}
                >
                  🏫 I'm a teacher →
                </motion.button>
              )}
            </div>
            <p className="font-round text-white/40 text-xs text-center md:text-left">
              Already have an account?{' '}
              <button onClick={onSignIn} className="text-purple-400 underline underline-offset-2 hover:text-purple-300 transition-colors">Sign in</button>
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
          <span className="font-round text-white/30 text-xs mb-1">scroll to explore</span>
          <span className="text-white/30 text-lg">↓</span>
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-bubble text-white text-3xl md:text-4xl text-center mb-2">How it works</h2>
          <p className="font-round text-white/50 text-sm text-center mb-10">Up and learning in under 2 minutes.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line on desktop */}
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-0.5 pointer-events-none"
              style={{ background: 'linear-gradient(90deg, rgba(139,0,255,0.3), rgba(255,29,142,0.3))' }} />
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
                  className="relative flex h-20 w-20 items-center justify-center rounded-[24px] text-4xl mb-4 shadow-lg"
                  style={{ background: 'linear-gradient(135deg,#8B00FF22,#FF1D8E22)', border: '2px solid rgba(139,0,255,0.35)' }}
                >
                  {s.emoji}
                  <div
                    className="absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full font-bubble text-sm text-white shadow"
                    style={{ background: 'linear-gradient(135deg,#8B00FF,#FF1D8E)' }}
                  >
                    {s.step}
                  </div>
                </div>
                <p className="font-bubble text-white text-lg mb-2">{s.title}</p>
                <p className="font-round text-white/55 text-sm leading-relaxed max-w-xs">{s.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              onClick={onGetStarted}
              className="font-bubble text-base text-white px-8 py-3.5 rounded-2xl shadow-lg"
              style={{ background: 'linear-gradient(135deg,#8B00FF,#FF1D8E)' }}
            >
              Try it free — no card needed →
            </motion.button>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE DEMO ─────────────────────────────────────────────────── */}
      <LandingDemo onGetStarted={onGetStarted} />

      {/* ── WHY CHILDREN COME BACK ───────────────────────────────────────────── */}
      <section className="px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-bubble text-white text-3xl md:text-4xl text-center mb-2">Why children come back tomorrow</h2>
          <p className="font-round text-white/50 text-sm text-center mb-10">Three features designed to make learning feel personal.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {THREE_HOOKS.map((h, i) => (
              <motion.div
                key={h.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 220 }}
                className="rounded-[24px] p-6"
                style={{ background: `linear-gradient(145deg, ${h.color}14, rgba(255,255,255,0.03))`, border: `1.5px solid ${h.color}35` }}
              >
                <div className="text-4xl mb-4">{h.emoji}</div>
                <p className="font-bubble text-white text-lg mb-2 leading-snug">{h.title}</p>
                <p className="font-round text-white/60 text-sm leading-relaxed">{h.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AGE GROUPS ───────────────────────────────────────────────────────── */}
      <section className="px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="font-round text-white/50 text-xs font-bold uppercase tracking-widest text-center mb-6">Three experiences, one account</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {AGE_GROUPS.map((g, i) => (
              <motion.div
                key={g.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.04, y: -4 }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 260 }}
                className="rounded-[24px] p-5 text-center cursor-default"
                style={{ background: `linear-gradient(145deg,${g.color}18,rgba(255,255,255,0.04))`, border: `1.5px solid ${g.color}35` }}
              >
                <div className="text-4xl mb-3">{g.emoji}</div>
                <p className="font-bubble text-white text-xl mb-1">{g.label}</p>
                <p className="font-round text-xs font-bold mb-3" style={{ color: g.color }}>{g.range}</p>
                <p className="font-round text-white/60 text-sm leading-relaxed">{g.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section className="px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-bubble text-white text-3xl md:text-4xl text-center mb-2">Designed with parents in mind</h2>
          <p className="font-round text-white/50 text-sm text-center mb-10">Simple tools that keep you in control and your child inspired.</p>
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
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="text-3xl mb-3">{f.emoji}</div>
                <p className="font-bubble text-white text-base mb-1">{f.title}</p>
                <p className="font-round text-white/55 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STUDY FIRST SECTION ──────────────────────────────────────────────── */}
      <section className="px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-2xl rounded-[28px] overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#8B00FF,#FF1D8E)', boxShadow: '0 20px 60px rgba(139,0,255,0.35)' }}>
          <div className="p-8 md:p-10 text-center">
            <div className="text-5xl mb-4">🎮</div>
            <h2 className="font-bubble text-white text-3xl mb-3">Games as the reward</h2>
            <p className="font-round text-white/80 text-base leading-relaxed max-w-lg mx-auto">
              Children complete 2 study modules first — then the Game Arcade unlocks as their reward.
              No guilt. No battles. The habit builds itself.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
              <div className="rounded-2xl px-4 py-3 text-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <p className="font-bubble text-white text-2xl">📚</p>
                <p className="font-round text-white/80 text-xs mt-1">Study first</p>
              </div>
              <motion.span
                className="font-bubble text-white text-2xl"
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >→</motion.span>
              <div className="rounded-2xl px-4 py-3 text-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <p className="font-bubble text-white text-2xl">🎮</p>
                <p className="font-round text-white/80 text-xs mt-1">Games unlock</p>
              </div>
              <motion.span
                className="font-bubble text-white text-2xl"
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
              >→</motion.span>
              <div className="rounded-2xl px-4 py-3 text-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <p className="font-bubble text-white text-2xl">🔥</p>
                <p className="font-round text-white/80 text-xs mt-1">Habit built</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT PARENTS NOTICE ──────────────────────────────────────────────── */}
      <section className="px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-bubble text-white text-3xl text-center mb-2">What parents will notice</h2>
          <p className="font-round text-white/40 text-xs text-center mb-8">Based on how the app is designed to work.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PARENT_NOTICES.map((t, i) => (
              <motion.div
                key={t.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                transition={{ delay: 0.05 + i * 0.1 }}
                className="rounded-[20px] p-5 cursor-default"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="text-3xl mb-3">{t.emoji}</div>
                <p className="font-round text-white/80 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <p className="font-round text-white/35 text-xs uppercase tracking-wider">{t.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FROM THE DEVELOPER ───────────────────────────────────────────────── */}
      <section className="px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[24px] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <DeveloperVideo />
            <div className="flex-1 text-center md:text-left">
              <p className="font-round text-purple-400 text-xs font-bold uppercase tracking-widest mb-3">About Bloom Juniors</p>
              <p className="font-bubble text-white text-xl md:text-2xl leading-snug mb-3">
                "Built to help children genuinely enjoy learning — not just complete tasks."
              </p>
              <p className="font-round text-white/55 text-sm leading-relaxed">
                No ads, no dark patterns, no app store required. Works on any device, syncs across screens, and is designed around the British curriculum.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CURRICULUM ───────────────────────────────────────────────────────── */}
      <section className="px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-bubble text-white text-3xl md:text-4xl text-center mb-2">Built for early learning progression</h2>
          <p className="font-round text-white/50 text-sm text-center mb-4">Phonics follows a systematic pure-sound progression — single letter sounds first, then digraphs and vowel patterns.</p>
          <p className="font-round text-white/35 text-xs text-center mb-10">Aligned with the approach commonly used in UK classrooms.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CURRICULUM.map((c, i) => (
              <motion.div
                key={c.stage}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-[24px] p-5"
                style={{ background: `linear-gradient(145deg, ${c.color}12, rgba(255,255,255,0.03))`, border: `1.5px solid ${c.color}30` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{c.emoji}</span>
                  <div>
                    <p className="font-bubble text-white text-xl leading-none">{c.stage}</p>
                    <p className="font-round text-xs font-bold mt-0.5" style={{ color: c.color }}>{c.range}</p>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {c.items.map(item => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-0.5 text-xs" style={{ color: c.color }}>✓</span>
                      <span className="font-round text-white/65 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR SCHOOLS ──────────────────────────────────────────────────────── */}
      <section className="pb-16" style={{ background: 'linear-gradient(180deg, #0B0F2A 0%, #1A1060 18%, #1A1060 82%, #0B0F2A 100%)' }}>
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
                style={{ background: 'rgba(139,0,255,0.22)', border: '1px solid rgba(139,0,255,0.45)' }}>
                <span className="text-sm">🏫</span>
                <span className="font-round text-xs font-bold text-purple-300 uppercase tracking-widest">Schools &amp; Nurseries</span>
              </div>
              <h2 className="font-bubble text-white text-3xl md:text-4xl leading-tight mb-4">
                Bring Bloom Juniors<br />into your classroom
              </h2>
              <p className="font-round text-white/65 text-sm leading-relaxed mb-6 max-w-md">
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
                    <span className="font-round text-sm text-white/75">{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                {onTeacherSetup && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onTeacherSetup}
                    className="font-bubble text-base text-white px-6 py-3 rounded-2xl"
                    style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 6px 20px rgba(79,70,229,0.4)' }}
                  >
                    🏫 Set up your classroom free →
                  </motion.button>
                )}
                <a href="/schools" className="font-round text-purple-400 text-sm underline underline-offset-4 hover:text-purple-300 transition-colors">
                  See the full schools page →
                </a>
              </div>
            </div>
            {/* Right: form */}
            <div className="w-full lg:w-[420px] rounded-[24px] p-6"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(139,0,255,0.3)' }}>
              <p className="font-bubble text-white text-lg mb-1">Send an enquiry</p>
              <p className="font-round text-white/50 text-xs mb-5">We reply within 1–2 business days.</p>
              <SchoolEnquiryForm source="landing-page" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PREMIUM WAITLIST ─────────────────────────────────────────────────── */}
      <section className="px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-xl rounded-[28px] p-8 text-center"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.12)' }}>
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4"
            style={{ background: 'linear-gradient(135deg,#FFD700,#FF9A3C)', color: '#7C2D12' }}>
            <span className="font-bubble text-xs">⭐ PREMIUM — COMING SOON</span>
          </div>
          <h2 className="font-bubble text-white text-3xl mb-2">Unlock everything</h2>
          <p className="font-round text-white/60 text-sm mb-2">
            World Explorer, Wonder Lab, Planet World, Puzzle Quest and more — 8 premium modules launching soon.
          </p>
          <p className="font-round text-yellow-300/80 text-sm font-bold mb-6">
            Join the waitlist for 50% off your first 3 months.
          </p>
          <WaitlistForm source="landing-premium" />
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section className="px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-bubble text-white text-3xl text-center mb-8">Common questions</h2>
          <div className="flex flex-col gap-2">
            {faqs.map((faq, i) => (
              <div key={i}
                className="rounded-[16px] overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="font-round text-white text-sm font-bold">{faq.q}</span>
                  <span className="font-bold text-white/40 text-lg ml-3">{openFaq === i ? '−' : '+'}</span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="font-round text-white/60 text-sm px-4 pb-4 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section className="px-4 pb-20 md:px-8 text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="font-bubble text-white text-4xl mb-3">Start today — it's free</h2>
          <p className="font-round text-white/60 text-base mb-8">
            No credit card. No setup. Your child can be learning in under 2 minutes.
          </p>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onGetStarted}
            className="font-bubble text-xl text-white px-10 py-5 rounded-2xl shadow-2xl"
            style={{ background: 'linear-gradient(135deg,#8B00FF,#FF1D8E)', boxShadow: '0 16px 40px rgba(139,0,255,0.4)' }}
          >
            Create a free account →
          </motion.button>
          <p className="font-round text-white/45 text-xs mt-5">
            Create account → add child profile → choose age path → start first activity.
          </p>
          <p className="font-round text-white/30 text-xs mt-1">Takes under 2 minutes. No card needed.</p>
          <p className="font-round text-white/25 text-xs mt-4">Already have an account? <button onClick={onSignIn} className="text-white/45 underline">Sign in here</button></p>
        </div>
      </section>

      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 px-4 py-10 text-center md:px-8">
        <p className="font-round text-white/60 text-sm mb-2">
          💜 Built with love, for every curious child
        </p>
        <p className="font-round text-white/40 text-xs mb-3">
          Questions or feedback?{' '}
          <a href="mailto:hello@bloomjuniors.com" className="text-purple-400 hover:text-purple-300 transition-colors underline">
            hello@bloomjuniors.com
          </a>
        </p>
        <p className="font-round text-white/25 text-xs">
          © 2026 Bloom Juniors · Learning app for ages 3–9 · Worldwide ·
          <a href="/privacy" className="ml-1 underline">Privacy Policy</a>
        </p>
      </footer>
    </div>
  )
}
