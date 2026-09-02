import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import BloomLogo from '../components/BloomLogo'
import { trackEvent, trackEventOnce } from '../utils/analytics.js'

const INK = '#193251'
const MUTED = '#66758A'
const PURPLE = '#6C4CF1'
const PURPLE_DARK = '#5032CF'
const PINK = '#FF6FA8'
const MINT = '#2F9F7F'
const LINE = 'rgba(25,50,81,0.12)'
const WELCOME_SEEN_KEY = 'bloom_welcome_seen_v1'

const STEPS = [
  {
    number: '01',
    title: 'Create their profile',
    text: 'Choose an age group and avatar. It takes less than two minutes.',
  },
  {
    number: '02',
    title: 'Follow today\'s path',
    text: 'Yaagvi guides two short activities across phonics, maths and reading.',
  },
  {
    number: '03',
    title: 'Unlock play',
    text: 'Learning comes first, then the Game Arcade opens as the reward.',
  },
]

function WelcomeIntro() {
  const reduceMotion = useReducedMotion()
  const [firstVisit] = useState(() => {
    try {
      return localStorage.getItem(WELCOME_SEEN_KEY) !== '1'
    } catch {
      return true
    }
  })
  const [visible, setVisible] = useState(firstVisit && !reduceMotion)
  const [leaving, setLeaving] = useState(false)

  const dismiss = (reason = 'automatic') => {
    if (leaving) return
    trackEventOnce(`welcome-dismiss:${reason}`, 'welcome_animation_dismiss', { reason })
    setLeaving(true)
    window.setTimeout(() => setVisible(false), 450)
  }

  useEffect(() => {
    trackEventOnce('landing-view', 'landing_page_view', {
      visitor_type: firstVisit ? 'first_visit' : 'returning',
    })

    try {
      localStorage.setItem(WELCOME_SEEN_KEY, '1')
    } catch {}

    if (reduceMotion || !visible) {
      setVisible(false)
      return undefined
    }

    trackEventOnce('welcome-view', 'welcome_animation_view')
    const timer = window.setTimeout(() => dismiss('automatic'), 4300)
    return () => window.clearTimeout(timer)
  }, [firstVisit, reduceMotion, visible])

  if (!visible) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] overflow-hidden bg-[#202733]"
        initial={{ opacity: 1 }}
        animate={{ opacity: leaving ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
        aria-label="Bloom Juniors welcome animation"
      >
        <video
          src="/yaagvi-welcome-hd.mp4"
          poster="/yaagvi-welcome-hd.jpg"
          autoPlay
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => dismiss('video_error')}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, transparent 52%, rgba(20,27,38,0.88) 100%)' }}
        />
        <motion.div
          className="absolute inset-x-0 bottom-10 flex flex-col items-center px-6 text-center sm:bottom-14"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.55 }}
        >
          <p className="font-bubble text-3xl text-white sm:text-4xl">Welcome to Bloom Juniors</p>
          <p className="mt-1 font-round text-sm font-bold text-white/75">Learning adventures made for curious minds.</p>
        </motion.div>
        <button
          type="button"
          onClick={() => dismiss('skip')}
          className="absolute right-4 top-4 rounded-full border border-white/30 bg-black/20 px-4 py-2 font-round text-xs font-bold text-white backdrop-blur-md sm:right-6 sm:top-6"
        >
          Skip
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

function Hero({ onGetStarted, onSignIn }) {
  const start = () => {
    trackEvent('landing_cta_click', { cta: 'start_free', location: 'hero' })
    onGetStarted?.()
  }
  const signIn = () => {
    trackEvent('landing_cta_click', { cta: 'sign_in', location: 'hero' })
    onSignIn?.()
  }

  return (
    <section className="relative isolate min-h-[calc(100svh-118px)] overflow-hidden bg-[#263448]">
      <video
        src="/landing-video-clean.mp4"
        poster="/yaagvi-mascot.webp"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        aria-label="Children enjoying a Bloom Juniors learning adventure"
      />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'linear-gradient(90deg, rgba(17,31,49,0.92) 0%, rgba(17,31,49,0.76) 43%, rgba(17,31,49,0.22) 78%, rgba(17,31,49,0.12) 100%)',
        }}
      />

      <div className="mx-auto flex min-h-[calc(100svh-118px)] w-full max-w-6xl items-end px-5 pb-16 pt-16 sm:px-8 md:items-center md:pb-20 md:pt-20">
        <motion.div
          className="max-w-2xl text-white"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-2 font-round text-xs font-extrabold backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-[#72E0B9]" />
            EYFS, KS1 and early KS2
          </div>
          <h1 className="font-bubble text-5xl leading-[0.98] sm:text-6xl md:text-7xl">
            Bloom Juniors
          </h1>
          <p className="mt-4 max-w-xl font-bubble text-2xl leading-tight text-white sm:text-3xl">
            Their greatest learning adventure starts here.
          </p>
          <p className="mt-4 max-w-xl font-round text-base font-semibold leading-relaxed text-white/80 sm:text-lg">
            A safe, personalised daily path through phonics, reading, maths and discovery for children ages 3-9.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={start}
              className="min-h-12 rounded-xl px-6 font-bubble text-base text-white shadow-xl"
              style={{ background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})` }}
            >
              Start learning free
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={signIn}
              className="min-h-12 rounded-xl border border-white/30 bg-white/10 px-6 font-round text-sm font-extrabold text-white backdrop-blur-md"
            >
              I already have an account
            </motion.button>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-round text-xs font-bold text-white/75">
            <span>No ads</span>
            <span>No child accounts</span>
            <span>No card needed</span>
          </div>
        </motion.div>
      </div>

      <a
        href="#how"
        aria-label="See how Bloom Juniors works"
        className="absolute bottom-5 right-5 hidden h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/15 text-xl text-white backdrop-blur-md sm:flex"
      >
        ↓
      </a>
    </section>
  )
}

function ProductPreview() {
  return (
    <div className="relative mx-auto h-[360px] w-full max-w-[440px] sm:h-[430px]">
      <motion.figure
        initial={{ opacity: 0, x: 22, rotate: 4 }}
        whileInView={{ opacity: 1, x: 0, rotate: 3 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.55 }}
        className="absolute right-2 top-0 w-[46%] overflow-hidden rounded-[24px] border-[5px] border-white bg-white shadow-2xl"
      >
        <img
          src="/screens/app-activity.png"
          alt="A Bloom Juniors learning activity with voice guidance"
          width={390}
          height={844}
          loading="lazy"
          className="block h-auto w-full"
        />
      </motion.figure>
      <motion.figure
        initial={{ opacity: 0, x: -22, rotate: -5 }}
        whileInView={{ opacity: 1, x: 0, rotate: -3 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.55, delay: 0.08 }}
        className="absolute bottom-0 left-3 w-[52%] overflow-hidden rounded-[26px] border-[5px] border-white bg-white shadow-2xl"
      >
        <img
          src="/screens/app-toddler.png"
          alt="The Bloom Juniors daily learning dashboard"
          width={390}
          height={844}
          loading="lazy"
          className="block h-auto w-full"
        />
      </motion.figure>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 230, damping: 18, delay: 0.3 }}
        className="absolute bottom-8 right-0 z-10 w-44 rounded-xl border border-[#BFE9DA] bg-white p-3 shadow-xl"
      >
        <p className="font-round text-[10px] font-extrabold uppercase text-[#2F9F7F]">Today</p>
        <p className="mt-1 font-bubble text-sm" style={{ color: INK }}>2 lessons complete</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E6EEF2]">
          <div className="h-full w-full rounded-full bg-[#59D6AE]" />
        </div>
      </motion.div>
    </div>
  )
}

function FounderStory() {
  const [videoOpen, setVideoOpen] = useState(false)

  useEffect(() => {
    if (!videoOpen) return undefined

    const handleKeyDown = event => {
      if (event.key === 'Escape') setVideoOpen(false)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [videoOpen])

  return (
    <>
      <section id="founder" className="bg-[#193251] px-5 py-5 text-white sm:px-8 sm:py-5">
        <div className="mx-auto grid max-w-[1216px] grid-cols-[52px_1fr] items-center gap-x-4 gap-y-3 sm:flex sm:gap-4 lg:pr-16">
          <img
            src="/founder.jpg"
            alt="Sanju, founder of Bloom Juniors"
            width={88}
            height={88}
            loading="lazy"
            className="h-[52px] w-[52px] flex-none rounded-full object-cover ring-2 ring-white/15 sm:h-12 sm:w-12"
          />
          <div className="min-w-0 flex-1">
            <p className="font-round text-xs font-extrabold uppercase tracking-widest text-[#72E0B9]">
              Built by a parent
            </p>
            <blockquote className="mt-1 max-w-3xl font-bubble text-sm leading-snug sm:text-lg">
              “I built Bloom Juniors for my own child, to make learning something children genuinely enjoy.”
            </blockquote>
            <p className="mt-1 font-round text-[10px] font-bold text-white/65 sm:text-xs">Sanju, founder and dad</p>
          </div>
          <button
            type="button"
            onClick={() => {
              trackEvent('founder_story_play', { location: 'founder_strip' })
              setVideoOpen(true)
            }}
            className="col-span-2 min-h-10 w-full flex-none rounded-lg border border-white/25 bg-white/10 px-4 font-bubble text-xs text-white backdrop-blur-md transition-colors hover:bg-white/15 sm:w-auto"
          >
            Watch Sanju's story
          </button>
        </div>
      </section>

      <AnimatePresence>
        {videoOpen && (
          <motion.div
            className="fixed inset-0 z-[210] flex items-center justify-center bg-[#0B1422]/90 px-4 py-8 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setVideoOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Founder story video"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: 0.22 }}
              className="relative w-full max-w-3xl overflow-hidden rounded-lg bg-black shadow-2xl"
              onMouseDown={event => event.stopPropagation()}
            >
              <video
                src="/developer-story.mp4"
                poster="/founder.jpg"
                autoPlay
                controls
                playsInline
                className="aspect-video w-full bg-black object-contain"
              />
              <button
                type="button"
                onClick={() => setVideoOpen(false)}
                aria-label="Close founder story"
                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/60 font-round text-xl font-bold text-white backdrop-blur-md"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default function LandingPage({ onGetStarted, onSignIn, onTeacherSetup }) {
  const start = location => {
    trackEvent('landing_cta_click', { cta: 'start_free', location })
    onGetStarted?.()
  }
  const signIn = location => {
    trackEvent('landing_cta_click', { cta: 'sign_in', location })
    onSignIn?.()
  }
  const startTeacher = location => {
    trackEvent('school_cta_click', { cta: 'start_free', location })
    onTeacherSetup?.()
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F8FBFD]" style={{ color: INK }}>
      <WelcomeIntro />

      <div className="bg-[#193251] px-4 py-2 text-center font-round text-xs font-extrabold text-white sm:text-sm">
        Safe, ad-free British curriculum learning for ages 3-9
      </div>

      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur-xl" style={{ borderColor: LINE }}>
        <nav className="mx-auto flex min-h-[78px] max-w-6xl items-center justify-between gap-3 px-4 sm:px-8" aria-label="Main navigation">
          <a href="/" aria-label="Bloom Juniors home">
            <BloomLogo size="md" />
          </a>
          <div className="hidden items-center gap-7 font-round text-sm font-extrabold md:flex" style={{ color: MUTED }}>
            <a href="#how" className="transition-colors hover:text-[#193251]">How it works</a>
            <a href="#founder" className="transition-colors hover:text-[#193251]">Our story</a>
            <a href="#families" className="transition-colors hover:text-[#193251]">Families</a>
            <a href="/schools" onClick={() => trackEvent('school_cta_click', { cta: 'visit_schools', location: 'family_navigation' })} className="transition-colors hover:text-[#193251]">Schools</a>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => signIn('navigation')}
              className="min-h-10 px-2 font-round text-xs font-extrabold sm:px-3 sm:text-sm"
              style={{ color: MUTED }}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => start('navigation')}
              className="min-h-10 rounded-xl px-3 font-bubble text-xs text-white shadow-md sm:px-4 sm:text-sm"
              style={{ background: PURPLE }}
            >
              Start free
            </button>
          </div>
        </nav>
      </header>

      <main>
        <Hero onGetStarted={onGetStarted} onSignIn={onSignIn} />

        <FounderStory />

        <section id="how" className="border-b bg-white px-5 py-16 sm:px-8 md:py-20" style={{ borderColor: LINE }}>
          <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.05fr_0.95fr] md:gap-16">
            <div>
              <p className="font-round text-xs font-extrabold uppercase tracking-widest" style={{ color: MINT }}>
                Simple for children. Meaningful for parents.
              </p>
              <h2 className="mt-3 max-w-xl font-bubble text-4xl leading-tight sm:text-5xl">
                One clear path from learning to play.
              </h2>
              <p className="mt-4 max-w-xl font-round text-base leading-relaxed" style={{ color: MUTED }}>
                Short daily sessions give children a routine they can understand and parents progress they can see.
              </p>

              <div className="mt-8 divide-y" style={{ borderColor: LINE }}>
                {STEPS.map((step, index) => (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ delay: index * 0.08 }}
                    className="grid grid-cols-[44px_1fr] gap-3 py-4"
                    style={{ borderColor: LINE }}
                  >
                    <span className="font-bubble text-sm" style={{ color: PURPLE }}>{step.number}</span>
                    <div>
                      <h3 className="font-bubble text-lg">{step.title}</h3>
                      <p className="mt-1 font-round text-sm leading-relaxed" style={{ color: MUTED }}>{step.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <ProductPreview />
          </div>
        </section>

        <section id="families" className="px-5 py-14 sm:px-8 md:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 border-b pb-12 md:grid-cols-[1fr_auto] md:items-end" style={{ borderColor: LINE }}>
              <div>
                <p className="font-round text-xs font-extrabold uppercase tracking-widest" style={{ color: PINK }}>
                  Built around childhood
                </p>
                <h2 className="mt-3 max-w-2xl font-bubble text-3xl leading-tight sm:text-4xl">
                  Screen time that builds skills, confidence and healthy habits.
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:gap-6">
                {[
                  ['Ages', '3-9'],
                  ['Ads', 'Zero'],
                  ['Setup', '< 2 min'],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-20 border-l pl-3 sm:min-w-24 sm:pl-5" style={{ borderColor: LINE }}>
                    <p className="font-round text-xs font-bold" style={{ color: MUTED }}>{label}</p>
                    <p className="mt-1 font-bubble text-xl sm:text-2xl">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5 py-10 md:grid-cols-2">
              <div className="border-l-4 border-[#6C4CF1] py-2 pl-5 sm:pl-7">
                <p className="font-round text-xs font-extrabold uppercase tracking-widest" style={{ color: PURPLE }}>For families</p>
                <h3 className="mt-2 font-bubble text-2xl">Start a free learning profile</h3>
                <p className="mt-2 max-w-md font-round text-sm leading-relaxed" style={{ color: MUTED }}>
                  Personalised activities, spoken guidance and a parent view of every win.
                </p>
                <button
                  type="button"
                  onClick={() => start('family_section')}
                  className="mt-5 min-h-11 rounded-xl px-5 font-bubble text-sm text-white"
                  style={{ background: PURPLE }}
                >
                  Start learning free
                </button>
              </div>

              <div className="border-l-4 border-[#2F9F7F] py-2 pl-5 sm:pl-7">
                <p className="font-round text-xs font-extrabold uppercase tracking-widest" style={{ color: MINT }}>For schools and nurseries</p>
                <h3 className="mt-2 font-bubble text-2xl">Bring Bloom into the classroom</h3>
                <p className="mt-2 max-w-md font-round text-sm leading-relaxed" style={{ color: MUTED }}>
                  Class progress without individual pupil logins, adverts or installation.
                </p>
                {onTeacherSetup ? (
                  <button
                    type="button"
                    onClick={() => startTeacher('family_section')}
                    className="mt-5 min-h-11 rounded-xl px-5 font-bubble text-sm text-white"
                    style={{ background: MINT }}
                  >
                    Set up a classroom
                  </button>
                ) : (
                  <a
                    href="/schools"
                    onClick={() => trackEvent('school_cta_click', { cta: 'visit_schools', location: 'family_section' })}
                    className="mt-5 inline-flex min-h-11 items-center rounded-xl px-5 font-bubble text-sm text-white"
                    style={{ background: MINT }}
                  >
                    Explore schools
                  </a>
                )}
              </div>
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
            <a href="/schools" onClick={() => trackEvent('school_cta_click', { cta: 'visit_schools', location: 'footer' })}>Schools</a>
            <a href="/privacy">Privacy</a>
            <a href="mailto:hello@bloomjuniors.com">Contact</a>
            <span>Copyright 2026 Bloom Juniors</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
