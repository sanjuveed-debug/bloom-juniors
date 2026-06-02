import React, { useCallback, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { ASSISTANTS, getAssistant } from '../assistants'
import { THEMES } from '../themes'

const ASSISTANT_ORDER = ['yaagvi']

function AssistantArtwork({ assistant, theme, size = 112 }) {
  return (
    <div
      className="flex items-center justify-center overflow-hidden rounded-[30px]"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(150deg, ${theme.primary}, ${theme.secondary})`,
        boxShadow: `0 18px 36px ${theme.primary}2f`,
      }}
    >
      {assistant.image ? (
        <img
          src={assistant.image}
          alt={assistant.name}
          className="h-full w-full object-cover"
          style={{ objectPosition: assistant.imagePosition || 'center' }}
          draggable={false}
        />
      ) : (
        <span style={{ fontSize: size * 0.48, lineHeight: 1 }}>{assistant.emoji}</span>
      )}
    </div>
  )
}

export default function AvatarSelector({ currentAvatar, onSelect, profileName }) {
  const [selected, setSelected] = useState(currentAvatar || null)
  const [celebrating, setCelebrating] = useState(false)

  const assistants = useMemo(
    () => ASSISTANT_ORDER.map((key) => ({
      ...ASSISTANTS[key],
      theme: THEMES[key] || THEMES.rumi,
    })),
    []
  )

  const featured = assistants.find((assistant) => assistant.key === selected)
    || assistants.find((assistant) => assistant.key === currentAvatar)
    || getAssistant('yaagvi')

  const featuredTheme = THEMES[featured.key] || THEMES.rumi

  const handleSelect = useCallback((assistant) => {
    if (celebrating) return

    setSelected(assistant.key)
    setCelebrating(true)

    confetti({
      particleCount: 90,
      spread: 85,
      origin: { x: 0.5, y: 0.42 },
      colors: [assistant.theme.primary, assistant.theme.secondary, assistant.theme.accent, '#FFFFFF'],
      scalar: 0.95,
    })

    setTimeout(() => onSelect(assistant.key), 850)
  }, [celebrating, onSelect])

  return (
    <div
      className="min-h-screen overflow-y-auto scroll-ios"
      style={{
        background: 'linear-gradient(180deg, #F6FBFF 0%, #EEF5FF 42%, #EAF0FF 100%)',
      }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-12 top-10 h-44 w-44 rounded-full blur-3xl"
          style={{ background: `${featuredTheme.primary}2a` }}
          animate={{ x: [0, 16, 0], y: [0, 18, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-0 top-28 h-56 w-56 rounded-full blur-3xl"
          style={{ background: `${featuredTheme.accent}1f` }}
          animate={{ x: [0, -20, 0], y: [0, -12, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-12 pt-safe md:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] md:items-start">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[34px] border border-white/70 bg-white/82 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl md:sticky md:top-6 md:p-7"
          >
            <div
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em]"
              style={{
                background: `${featuredTheme.primary}14`,
                color: featuredTheme.primary,
              }}
            >
              Choose your guide
            </div>

            <h1 className="mt-4 font-bubble text-4xl leading-tight text-slate-800 md:text-5xl">
              Hello {profileName || 'Superstar'}
            </h1>

            <p className="mt-3 max-w-xl font-round text-base font-semibold leading-7 text-slate-600 md:text-lg">
              Yaagvi is your learning buddy. She stays nearby, gives gentle nudges, and helps every lesson feel personal.
            </p>

            <div
              className="mt-6 rounded-[30px] p-4 md:p-5"
              style={{
                background: `linear-gradient(145deg, ${featuredTheme.primary}10, ${featuredTheme.accent}10)`,
                border: `1px solid ${featuredTheme.primary}18`,
              }}
            >
              <div className="flex items-center gap-4">
                <AssistantArtwork assistant={featured} theme={featuredTheme} size={96} />

                <div className="min-w-0">
                  <p className="font-bubble text-2xl leading-none" style={{ color: featuredTheme.text }}>
                    {featured.name}
                  </p>
                  <p className="mt-2 font-round text-sm font-bold uppercase tracking-[0.12em]" style={{ color: featuredTheme.primary }}>
                    {featured.title}
                  </p>
                  <p className="mt-2 font-round text-sm font-semibold leading-6 text-slate-600">
                    {featured.tagline}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-[24px] bg-white/88 p-4 shadow-[0_16px_30px_rgba(15,23,42,0.06)]">
                <p className="font-round text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">
                  What this guide sounds like
                </p>
                <p className="mt-2 font-round text-lg font-bold leading-7 text-slate-700">
                  "{featured.sample}"
                </p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  'Personal mascot guide',
                  'Step-by-step support',
                  'Friendly daily nudges',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[20px] border border-white/70 bg-white/70 px-3 py-3 text-center font-round text-sm font-bold text-slate-600"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          <div className="grid gap-4 sm:grid-cols-2">
            {assistants.map((assistant, index) => {
              const isSelected = selected === assistant.key || currentAvatar === assistant.key

              return (
                <motion.button
                  key={assistant.key}
                  type="button"
                  initial={{ opacity: 0, y: 28, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.08, type: 'spring', stiffness: 260, damping: 20 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect(assistant)}
                  className="relative overflow-hidden rounded-[30px] border bg-white p-5 text-left shadow-[0_20px_48px_rgba(15,23,42,0.08)]"
                  style={{
                    borderColor: isSelected ? assistant.theme.primary : 'rgba(226, 232, 240, 0.9)',
                    boxShadow: isSelected
                      ? `0 24px 50px ${assistant.theme.primary}20`
                      : '0 20px 48px rgba(15, 23, 42, 0.08)',
                  }}
                >
                  <div
                    className="absolute inset-x-0 top-0 h-28"
                    style={{
                      background: `linear-gradient(160deg, ${assistant.theme.primary}18, ${assistant.theme.secondary}14, transparent)`,
                    }}
                  />

                  <div className="relative z-10 flex items-start justify-between gap-3">
                    <div
                      className="rounded-full px-3 py-1 font-round text-[11px] font-bold uppercase tracking-[0.14em]"
                      style={{
                        background: `${assistant.theme.primary}12`,
                        color: assistant.theme.primary,
                      }}
                    >
                      Guide
                    </div>

                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="rounded-full bg-slate-900 px-3 py-1 font-round text-[11px] font-bold uppercase tracking-[0.14em] text-white"
                        >
                          Selected
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative z-10 mt-5 flex items-center gap-4">
                    <AssistantArtwork assistant={assistant} theme={assistant.theme} size={96} />

                    <div className="min-w-0">
                      <p className="font-bubble text-2xl leading-none text-slate-800">
                        {assistant.name}
                      </p>
                      <p className="mt-2 font-round text-sm font-bold uppercase tracking-[0.12em]" style={{ color: assistant.theme.primary }}>
                        {assistant.title}
                      </p>
                    </div>
                  </div>

                  <p className="relative z-10 mt-5 font-round text-sm font-semibold leading-6 text-slate-600">
                    {assistant.tagline}
                  </p>

                  <div className="relative z-10 mt-4 rounded-[22px] bg-slate-50 p-4">
                    <p className="font-round text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Voice preview
                    </p>
                    <p className="mt-2 font-round text-base font-bold leading-6 text-slate-700">
                      "{assistant.sample}"
                    </p>
                  </div>

                  <p className="relative z-10 mt-4 font-round text-sm font-semibold leading-6 text-slate-500">
                    {assistant.focus}
                  </p>

                  <div className="relative z-10 mt-5 flex items-center justify-between">
                    <span className="font-round text-sm font-bold text-slate-500">
                      Tap to choose this guide
                    </span>
                    <span
                      className="rounded-full px-3 py-1 font-round text-xs font-bold uppercase tracking-[0.14em]"
                      style={{
                        background: `${assistant.theme.primary}12`,
                        color: assistant.theme.primary,
                      }}
                    >
                      Ready
                    </span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {celebrating && selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/18 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="mx-4 w-full max-w-sm rounded-[34px] bg-white p-6 text-center shadow-[0_24px_64px_rgba(15,23,42,0.16)]"
            >
              <div className="mx-auto flex w-fit items-center justify-center">
                <AssistantArtwork assistant={featured} theme={featuredTheme} size={112} />
              </div>

              <p className="mt-5 font-bubble text-3xl text-slate-800">
                {featured.name} is ready
              </p>
              <p className="mt-3 font-round text-base font-semibold leading-7 text-slate-600">
                Your guide will stay nearby and help make lessons feel more natural.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
