import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSpeech } from '../hooks/useSpeech'
import { getAssistant, MODULE_TITLES } from '../assistants'
import { THEMES } from '../themes'

function AssistantPortrait({ assistant, theme, speaking }) {
  const frameStyle = {
    background: `linear-gradient(145deg, ${theme.primary}, ${theme.secondary})`,
    boxShadow: speaking
      ? `0 0 0 4px ${theme.primary}22, 0 12px 28px ${theme.primary}45`
      : `0 10px 24px ${theme.primary}35`,
  }

  return (
    <motion.div
      className="relative flex h-[60px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-[22px]"
      style={frameStyle}
      animate={speaking ? { y: [0, -2, 0], scale: [1, 1.04, 1] } : { y: [0, -1, 0] }}
      transition={{ duration: speaking ? 0.8 : 2.4, repeat: Infinity, ease: 'easeInOut' }}
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
        <span style={{ fontSize: 34, lineHeight: 1 }}>{assistant.emoji}</span>
      )}

      <motion.span
        className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5 rounded-full border border-white/80"
        style={{ background: speaking ? '#22C55E' : '#FFFFFF' }}
        animate={speaking ? { scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] } : { scale: 1, opacity: 0.9 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  )
}

function buildGuidePrompts(assistant, profileName, progress, customPrompts) {
  if (customPrompts?.length) return customPrompts

  const childName = profileName || 'there'
  const prompts = [
    `Hi ${childName}. I'm ${assistant.name}, and I'll stay with you while you learn today.`,
    `${assistant.name} is ready. We can start with reading, maths, or a short confidence booster whenever you want.`,
  ]

  if (progress?.dailyChallenge && !progress?.challengeCompleted) {
    const challengeTitle = MODULE_TITLES[progress.dailyChallenge] || 'today\'s activity'
    prompts.push(`Your next goal is ${challengeTitle}. We can do that first and unlock today's sticker.`)
  }

  if (progress?.challengeCompleted) {
    prompts.push('You already finished today\'s challenge. This is a good time for one more lesson or a story.')
  }

  if ((progress?.totalStars || 0) > 0) {
    prompts.push(`You already have ${progress.totalStars} stars. Let us keep that momentum going with one focused activity.`)
  } else {
    prompts.push('A quick win is the best way to begin. Sound Pop and Number World are both good first choices.')
  }

  if ((progress?.loginStreak || 0) >= 2) {
    prompts.push(`You are on a ${progress.loginStreak}-day streak. A short lesson keeps the streak strong.`)
  }

  prompts.push(assistant.sample)

  return prompts
}

export default function JarvisOrb({ avatar, profileName, progress, assistantOverride, themeOverride, prompts: customPrompts, tourId, tourSteps = [], tourVideo, profileId, ageGroup }) {
  const assistant = assistantOverride || getAssistant(avatar)
  const theme = themeOverride || THEMES[avatar] || THEMES.rumi
  const { speak, stopSpeaking, speaking, primeSpeech } = useSpeech()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [showHint, setShowHint] = useState(true)
  const [tourOpen, setTourOpen] = useState(false)
  const [tourStarted, setTourStarted] = useState(false)
  const [videoStarted, setVideoStarted] = useState(false)
  const [tourStepIndex, setTourStepIndex] = useState(0)
  const promptIndexRef = useRef(0)
  const closeTimerRef = useRef(null)
  const greetedRef = useRef(false)
  const hasTour = Boolean(tourId && tourSteps.length)

  const prompts = useMemo(
    () => buildGuidePrompts(assistant, profileName, progress, customPrompts),
    [
      assistant,
      customPrompts,
      profileName,
      progress?.challengeCompleted,
      progress?.dailyChallenge,
      progress?.loginStreak,
      progress?.totalStars,
    ]
  )

  const closeBubble = useCallback(() => {
    clearTimeout(closeTimerRef.current)
    closeTimerRef.current = null
    setOpen(false)
  }, [])

  const showPrompt = useCallback((line) => {
    if (!line) return

    setMessage(line)
    setOpen(true)
    speak(line, { mood: 'guide', ...(ageGroup === 'toddler' ? { rate: 0.8 } : {}) })

    clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => {
      setOpen(false)
    }, Math.max(3400, line.length * 42))
  }, [speak, ageGroup])

  const speakNextPrompt = useCallback(() => {
    const nextLine = prompts[promptIndexRef.current % prompts.length]
    promptIndexRef.current += 1
    showPrompt(nextLine)
  }, [prompts, showPrompt])

  const currentTourStep = hasTour ? tourSteps[tourStepIndex] : null

  const tourSeenKey = tourId && profileId ? `bj_tour_${tourId}_${profileId}` : null

  const markTourSeen = useCallback(() => {
    if (tourSeenKey) localStorage.setItem(tourSeenKey, '1')
  }, [tourSeenKey])

  const closeTour = useCallback(() => {
    markTourSeen()
    stopSpeaking()
    setTourOpen(false)
    setTourStarted(false)
    setVideoStarted(false)
    setTourStepIndex(0)
  }, [markTourSeen, stopSpeaking])

  const speakTourStep = useCallback((step) => {
    if (!step) return
    if (tourVideo) return
    const line = `${step.title}. ${step.body}`
    speak(line, { mood: 'guide', ...(ageGroup === 'toddler' ? { rate: 0.8 } : {}) })
  }, [speak, tourVideo, ageGroup])

  const startTour = useCallback(() => {
    primeSpeech()
    if (tourVideo && !videoStarted) {
      stopSpeaking()
      setVideoStarted(true)
      setTourStarted(true)
      return
    }
    setShowHint(false)
    setTourStarted(true)
    setTourStepIndex(0)
    speakTourStep(tourSteps[0])
  }, [primeSpeech, speakTourStep, tourSteps, tourVideo, videoStarted])

  const nextTourStep = useCallback(() => {
    primeSpeech()
    if (tourStepIndex + 1 >= tourSteps.length) {
      closeTour()
      return
    }
    const nextIndex = tourStepIndex + 1
    setTourStepIndex(nextIndex)
    speakTourStep(tourSteps[nextIndex])
  }, [closeTour, primeSpeech, speakTourStep, tourStepIndex, tourSteps])

  const replayTour = useCallback(() => {
    if (!hasTour) return
    setOpen(false)
    setTourOpen(true)
    setTourStarted(Boolean(tourVideo))
    setVideoStarted(Boolean(tourVideo))
    setTourStepIndex(0)
    setShowHint(false)
  }, [hasTour, tourVideo])

  const handleTap = useCallback(() => {
    primeSpeech()
    setShowHint(false)

    if (speaking) {
      stopSpeaking()
      closeBubble()
      return
    }

    speakNextPrompt()
  }, [closeBubble, primeSpeech, speakNextPrompt, speaking, stopSpeaking])

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 6500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!hasTour || !tourId) return undefined
    if (tourSeenKey && localStorage.getItem(tourSeenKey)) return undefined

    const timer = setTimeout(() => {
      markTourSeen()
      setTourOpen(true)
      setTourStarted(Boolean(tourVideo))
      setVideoStarted(Boolean(tourVideo))
      setShowHint(false)
    }, 900)

    return () => clearTimeout(timer)
  }, [hasTour, tourId, tourSeenKey, tourVideo, markTourSeen])

  useEffect(() => {
    if (tourOpen) closeBubble()
  }, [closeBubble, tourOpen])

  useEffect(() => {
    if (tourOpen && tourVideo) {
      closeBubble()
      stopSpeaking()
    }
  }, [stopSpeaking, tourOpen, tourVideo, videoStarted])

  useEffect(() => {
    if (greetedRef.current) return undefined
    if (tourOpen || hasTour) return undefined

    const timer = setTimeout(() => {
      greetedRef.current = true
      speakNextPrompt()
    }, 1800)

    return () => clearTimeout(timer)
  }, [hasTour, speakNextPrompt, tourOpen])

  useEffect(() => () => {
    clearTimeout(closeTimerRef.current)
  }, [])

  return (
    <>
      <AnimatePresence>
        {tourOpen && hasTour && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-end justify-center px-4 pb-[calc(env(safe-area-inset-bottom,0px)+18px)] pt-6 sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: 'rgba(15, 23, 42, 0.62)', backdropFilter: 'blur(10px)' }}
            onClick={closeTour}
          >
            <motion.div
              initial={{ y: 40, scale: 0.94, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 24, scale: 0.96, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className="relative w-full max-w-[430px] overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div
                className="absolute inset-x-0 top-0 h-32"
                style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary || theme.accent})` }}
              />

              <button
                type="button"
                onClick={closeTour}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/20 px-3 py-1.5 font-round text-xs font-bold text-white"
              >
                Skip
              </button>

              <div className="relative px-5 pb-5 pt-7">
                <div className="flex items-end gap-4">
                  <motion.div
                    className="h-28 w-28 shrink-0 overflow-hidden rounded-[32px] border-4 border-white bg-white shadow-xl"
                    animate={{ y: [0, -5, 0], rotate: [0, -1.5, 1.5, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
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
                      <div className="flex h-full w-full items-center justify-center text-5xl">{assistant.emoji}</div>
                    )}
                  </motion.div>

                  <div className="min-w-0 pb-2 text-white">
                  <p className="font-bubble text-2xl leading-none">Tour with {assistant.name}</p>
                  <p className="font-round mt-2 text-sm font-semibold text-white/80">
                      {videoStarted ? 'Watch the animated tour' : tourStarted ? `Step ${tourStepIndex + 1} of ${tourSteps.length}` : 'A quick look around'}
                  </p>
                </div>
              </div>

              <motion.div
                  key={videoStarted ? 'video' : tourStarted ? tourStepIndex : 'intro'}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                  className="mt-5 overflow-hidden rounded-[28px] border border-slate-100 bg-slate-50"
                >
                  {videoStarted && tourVideo ? (
                    <div>
                      <video
                        src={tourVideo}
                        controls
                        autoPlay
                        playsInline
                        className="aspect-[9/16] max-h-[52vh] w-full bg-black object-contain"
                        onPlay={stopSpeaking}
                        onEnded={() => {
                          stopSpeaking()
                          setVideoStarted(false)
                          setTourStarted(true)
                          setTourStepIndex(0)
                        }}
                      />
                      <div className="p-4">
                        <p className="font-bubble text-xl" style={{ color: theme.text || '#1F2937' }}>
                          Watch Yaagvi show the app
                        </p>
                        <p className="font-round mt-2 text-sm font-bold leading-6 text-slate-600">
                          When the video finishes, you can review the quick steps.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5">
                      <div className="mb-4 flex items-center gap-2">
                        {(tourStarted ? tourSteps : [0, 1, 2]).map((_, index) => (
                          <span
                            key={index}
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: tourStarted && index === tourStepIndex ? 28 : 8,
                              background: tourStarted && index <= tourStepIndex ? theme.primary : '#CBD5E1',
                            }}
                          />
                        ))}
                      </div>

                      <p className="font-bubble text-2xl leading-tight" style={{ color: theme.text || '#1F2937' }}>
                        {tourStarted ? currentTourStep?.title : `Hi ${profileName || 'there'}!`}
                      </p>
                      <p className="font-round mt-3 text-base font-bold leading-7 text-slate-600">
                        {tourStarted
                          ? currentTourStep?.body
                          : `I am ${assistant.name}. I can show you where to start, where to play, and how rewards work.`}
                      </p>

                      {tourStarted && currentTourStep?.tip && (
                        <div
                          className="mt-4 rounded-2xl px-4 py-3 font-round text-sm font-bold"
                          style={{ background: `${theme.primary}14`, color: theme.primary }}
                        >
                          {currentTourStep.tip}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>

                <div className="mt-5 flex gap-3">
                  {videoStarted ? (
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        setVideoStarted(false)
                        setTourStarted(true)
                        setTourStepIndex(0)
                        speakTourStep(tourSteps[0])
                      }}
                      className="flex-1 rounded-2xl px-5 py-4 font-bubble text-white"
                      style={{ background: theme.primary }}
                    >
                      Continue
                    </motion.button>
                  ) : !tourStarted ? (
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={startTour}
                      className="flex-1 rounded-2xl px-5 py-4 font-bubble text-white"
                      style={{ background: theme.primary }}
                    >
                      Start tour
                    </motion.button>
                  ) : (
                    <>
                      <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => speakTourStep(currentTourStep)}
                      disabled={Boolean(tourVideo)}
                      className="rounded-2xl px-5 py-4 font-bubble"
                      style={{
                        background: tourVideo ? '#E2E8F0' : `${theme.primary}14`,
                        color: tourVideo ? '#94A3B8' : theme.primary,
                      }}
                    >
                      Repeat
                    </motion.button>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        onClick={nextTourStep}
                        className="flex-1 rounded-2xl px-5 py-4 font-bubble text-white"
                        style={{ background: theme.primary }}
                      >
                        {tourStepIndex + 1 >= tourSteps.length ? 'Done' : 'Next'}
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && message && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 360, damping: 24 }}
            className="fixed z-[101]"
            style={{
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 176px)',
              right: 12,
              width: 'min(340px, calc(100vw - 24px))',
              pointerEvents: 'none',
            }}
          >
            <div
              className="relative rounded-[28px] border border-white/80 bg-white/95 p-4 shadow-2xl backdrop-blur-xl"
              style={{ boxShadow: `0 18px 48px rgba(15, 23, 42, 0.18), 0 0 0 1px ${theme.primary}12` }}
            >
              <div className="mb-3 flex items-center gap-3">
                <AssistantPortrait assistant={assistant} theme={theme} speaking={speaking} />

                <div className="min-w-0">
                  <p className="font-bubble text-sm leading-none" style={{ color: theme.text }}>
                    {assistant.name}
                  </p>
                  <p className="font-round mt-1 text-xs font-semibold leading-none text-slate-500">
                    Your learning buddy
                  </p>
                </div>

                {speaking && (
                  <div className="ml-auto flex items-end gap-1 self-center" style={{ height: 16 }}>
                    {[0, 1, 2, 3].map((bar) => (
                      <motion.span
                        key={bar}
                        className="block w-[3px] rounded-full"
                        style={{ background: theme.primary }}
                        animate={{ height: ['4px', `${10 + (bar % 2) * 3}px`, '4px'] }}
                        transition={{ duration: 0.45, delay: bar * 0.08, repeat: Infinity }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <p className="font-round text-[15px] font-bold leading-6 text-slate-700">
                {message}
              </p>

              <p className="font-round mt-3 text-xs font-semibold text-slate-400">
                Tap your guide again for another quick suggestion.
              </p>

              <div
                className="absolute -bottom-3 right-9 h-6 w-6 rotate-45 border-b border-r border-white/80 bg-white/95"
                style={{ boxShadow: '6px 6px 20px rgba(15, 23, 42, 0.05)' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHint && !open && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.96 }}
            className="fixed z-[100] pointer-events-none"
            style={{
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 176px)',
              right: 16,
            }}
          >
            <div
              className="rounded-full px-3 py-1.5 font-round text-xs font-bold text-white shadow-lg"
              style={{ background: theme.primary }}
            >
              Tap for a quick plan
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="fixed z-[100] flex flex-col items-end gap-2 lg:hidden"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)',
          right: 14,
          pointerEvents: 'none',
        }}
      >
        {hasTour && (
          <button
            type="button"
            onPointerDown={(e) => { e.stopPropagation(); replayTour() }}
            onClick={(e) => { e.stopPropagation(); replayTour() }}
            className="rounded-full px-3 py-1 font-round text-[11px] font-bold uppercase tracking-[0.12em] shadow"
            style={{
              background: `${theme.primary}18`,
              color: theme.primary,
              border: `1px solid ${theme.primary}44`,
              pointerEvents: 'auto',
            }}
          >
            Tour
          </button>
        )}

        <motion.button
          type="button"
          onClick={handleTap}
          className="rounded-full border border-white/60 bg-white/88 p-1.5 shadow-xl backdrop-blur-xl"
          style={{
            boxShadow: speaking
              ? `0 12px 28px ${theme.primary}40`
              : '0 8px 20px rgba(15,23,42,0.18)',
            pointerEvents: 'auto',
          }}
          animate={speaking ? { y: [0, -3, 0] } : { y: [0, -1, 0] }}
          transition={{ duration: speaking ? 0.8 : 2.8, repeat: Infinity, ease: 'easeInOut' }}
          whileTap={{ scale: 0.93 }}
          aria-label={`${assistant.name} learning guide`}
        >
          <AssistantPortrait assistant={assistant} theme={theme} speaking={speaking} />
        </motion.button>
      </div>
    </>
  )
}
