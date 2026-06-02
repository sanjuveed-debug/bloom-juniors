import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BloomLogo from '../components/BloomLogo'
import SchoolEnquiryForm from '../components/SchoolEnquiryForm'

const AGE_GROUPS = [
  { emoji: '🧸', label: 'Tiny Stars', range: 'Ages 3–4', color: '#FF9A3C', desc: 'Colours, shapes, numbers & animals through gentle tap games.' },
  { emoji: '🌟', label: 'Little Stars', range: 'Ages 4–6', color: '#8B00FF', desc: 'Phonics, maths, stories, art & world exploration.' },
  { emoji: '🚀', label: 'Super Kids', range: 'Ages 7–9', color: '#E21C1C', desc: 'Times tables, fractions, reading, science & more.' },
]

const FEATURES = [
  { emoji: '🎓', title: 'Structured Curriculum', desc: 'Phonics, maths, science, world geography and more — carefully sequenced for ages 3–9.' },
  { emoji: '🔒', title: 'Safe Parent Controls', desc: 'PIN-protected Parent Zone. Set screen time, review progress, manage profiles.' },
  { emoji: '🎮', title: 'Earn Games as Reward', desc: 'Study first, games unlock as the reward. Healthy habit built in from day one.' },
  { emoji: '📊', title: 'Weekly Progress Reports', desc: 'Emailed summary every week — what your child practised and how they improved.' },
  { emoji: '🌍', title: 'Beyond the Classroom', desc: 'World faiths, world geography, science experiments, and financial literacy.' },
  { emoji: '📱', title: 'Installs as an App', desc: 'Add to your home screen on any device. No app store needed. Continues locally and syncs progress when back online.' },
]

const TESTIMONIALS = [
  { name: 'Parent, age 6', role: 'Example feedback', text: '"My daughter asks to do her learning activity every morning before school. It has genuinely helped her phonics."' },
  { name: 'Parent, age 5', role: 'Example feedback', text: '"The Parent Zone is brilliant — I can see exactly what he practised and how long. No screen guilt anymore."' },
  { name: 'Parent of two, 4 & 8', role: 'Example feedback', text: '"Works great for both kids with separate profiles. The older one loves the times tables games."' },
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

export default function LandingPage({ onGetStarted, onSignIn }) {
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
              <span className="text-sm">🌍</span>
              <span className="font-round text-xs font-bold text-purple-300">Free · No app store · Ages 3–9</span>
            </div>

            <h1 className="font-bubble text-5xl md:text-6xl text-white leading-tight mb-4"
              style={{ textShadow: '0 4px 30px rgba(139,0,255,0.4)' }}>
              Turn screen time<br />
              <span style={{ background: 'linear-gradient(135deg,#C77DFF,#FF1D8E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                into learning time
              </span>
            </h1>

            <p className="font-round text-white/70 text-lg md:text-xl max-w-xl leading-relaxed mb-6">
              The fun learning app kids choose over YouTube. Phonics, maths, science and world exploration — wrapped in games they earn by studying first.
            </p>

            {/* Quick trust badges */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-8">
              {['✓ Free forever', '✓ No download needed', '✓ Works on any device', '✓ No ads'].map(b => (
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

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────────── */}
      <section className="px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-bubble text-white text-3xl text-center mb-8">Parents love it</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                transition={{ delay: 0.05 + i * 0.1 }}
                className="rounded-[20px] p-5 cursor-default"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(s => <span key={s} className="text-yellow-400 text-sm">⭐</span>)}
                </div>
                <p className="font-round text-white/80 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="font-bubble text-white text-sm">{t.name}</p>
                  <p className="font-round text-white/40 text-xs">{t.role}</p>
                </div>
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

      {/* ── FOR SCHOOLS ──────────────────────────────────────────────────────── */}
      <section className="px-4 pb-16 md:px-8">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[28px] p-7 md:p-8"
            style={{ background: 'linear-gradient(135deg, rgba(139,0,255,0.14), rgba(0,80,255,0.08))', border: '1px solid rgba(139,0,255,0.3)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🏫</span>
              <div>
                <p className="font-round text-purple-300 text-xs font-bold uppercase tracking-widest">Schools &amp; Nurseries</p>
                <h2 className="font-bubble text-white text-2xl leading-tight">Interested in using Bloom Juniors in your school?</h2>
              </div>
            </div>
            <p className="font-round text-white/55 text-sm leading-6 mb-6">
              EYFS to KS2 aligned. Safe, no child accounts, no ads. Fill in the form and we&apos;ll reply within 1–2 business days.{' '}
              <a href="/schools" className="text-purple-400 underline underline-offset-2 hover:text-purple-300">See the full schools page →</a>
            </p>
            <SchoolEnquiryForm source="landing-page" />
          </motion.div>
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
          <p className="font-round text-white/30 text-xs mt-4">Already have an account? <button onClick={onSignIn} className="text-white/50 underline">Sign in here</button></p>
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
