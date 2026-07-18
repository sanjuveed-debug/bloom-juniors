import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useSpeech } from '../hooks/useSpeech'
import { deliverParentHighFive, getPendingHighFive } from '../utils/parentHighFives.js'
import YaagviCharacter from './YaagviCharacter'

const AGE_LINES = {
  toddler: 'A grown-up sent something special for you!',
  early: 'Yaagvi found a high-five with your name on it!',
  junior: 'A message arrived at expedition headquarters!',
}
export default function HighFiveDelivery({ progress = {}, profileName = 'Explorer', ageGroup = 'early', onUpdateProgress }) {
  const pending = getPendingHighFive(progress)
  const [opened, setOpened] = useState(false)
  const [anticipating, setAnticipating] = useState(false)
  const [collecting, setCollecting] = useState(false)
  const [visibleId, setVisibleId] = useState(pending?.id || '')
  const { speak, stopSpeaking, primeSpeech, speaking } = useSpeech()
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (pending?.id && pending.id !== visibleId) {
      setVisibleId(pending.id)
      setOpened(false)
      setAnticipating(false)
      setCollecting(false)
    }
  }, [pending?.id, visibleId])

  if (!pending || pending.id !== visibleId) return null

  const reveal = () => {
    setAnticipating(false)
    setOpened(true)
    primeSpeech()
    speak(`${profileName}, this is a high-five from your grown-up. ${pending.message}`, { mood: 'celebrate', rate: ageGroup === 'toddler' ? 0.82 : 0.92 })
    confetti({ particleCount: 130, spread: 120, origin: { y: 0.42 }, colors: ['#FDE68A', '#F472B6', '#8B5CF6', '#34D399'] })
  }

  const open = () => {
    if (reducedMotion) { reveal(); return }
    setAnticipating(true)
    window.setTimeout(reveal, 280)
  }

  const keep = () => {
    if (reducedMotion) {
      stopSpeaking()
      const next = deliverParentHighFive(progress, pending.id)
      onUpdateProgress?.({ parentHighFives: next.parentHighFives, stickers: next.stickers })
      setVisibleId('')
      return
    }
    setCollecting(true)
    window.setTimeout(() => {
      stopSpeaking()
      const next = deliverParentHighFive(progress, pending.id)
      onUpdateProgress?.({ parentHighFives: next.parentHighFives, stickers: next.stickers })
      setVisibleId('')
    }, 380)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-violet-950/75 p-4 backdrop-blur-md"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        data-testid="high-five-delivery"
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20 }}
          className="relative w-full max-w-lg overflow-hidden rounded-[2.25rem] border-4 border-amber-200 bg-gradient-to-b from-violet-700 via-fuchsia-500 to-rose-400 p-5 text-center shadow-2xl sm:p-7"
        >
          <motion.div className="absolute left-6 top-8 text-3xl" animate={{ y: [0, -12, 0], rotate: [-8, 8, -8] }} transition={{ duration: 2.4, repeat: Infinity }}>🦋</motion.div>
          <motion.div className="absolute right-7 top-16 text-2xl" animate={{ y: [0, 10, 0], x: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}>✨</motion.div>
          <p className="font-round text-[10px] font-black uppercase tracking-[0.2em] text-amber-100">A parent high-five arrived</p>
          <h2 className="mt-2 font-bubble text-2xl leading-tight text-white sm:text-3xl">{AGE_LINES[ageGroup] || AGE_LINES.early}</h2>

          <div className="relative mx-auto mt-3 h-52 w-48">
            <div className="absolute inset-6 rounded-full bg-amber-200/35 blur-2xl" />
            {opened ? (
              <YaagviCharacter state="celebrate" size="100%" className="relative" imageClassName="drop-shadow-2xl" />
            ) : (
              <img src="/yaagvi-3d-wave.png" alt="Yaagvi delivering a high-five" className="relative h-full w-full object-contain drop-shadow-2xl" />
            )}
          </div>

          {!opened ? (
            <motion.button whileTap={{ scale: 0.94 }} onClick={open}
              animate={anticipating ? { scale: [1, 0.92, 1.05, 1] } : { scale: 1 }}
              transition={anticipating ? { duration: 0.28, ease: 'easeInOut' } : { duration: 0 }}
              className="mx-auto mt-1 flex min-h-24 w-full items-center justify-center gap-3 rounded-3xl border-4 border-dashed border-amber-300 bg-[#fff8df] px-4 font-bubble text-lg text-violet-950 shadow-xl"
              data-testid="open-high-five">
              <motion.span className="text-4xl"
                animate={anticipating ? { scale: [1, 1.35, 0.9, 1.1] } : { scale: [1, 1.16, 1] }}
                transition={anticipating ? { duration: 0.28, ease: 'easeInOut' } : { duration: 1.2, repeat: Infinity }}>💌</motion.span>
              Tap to open your high-five
            </motion.button>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl bg-[#fff8df] p-5 shadow-xl">
              <div className="relative mx-auto w-fit">
                <motion.div className="text-6xl" aria-label="High-five sticker"
                  animate={collecting ? { y: -66, x: 36, scale: 0.45, opacity: 0.7 } : { y: 0, x: 0, scale: 1, opacity: 1 }}
                  transition={{ duration: reducedMotion ? 0 : 0.38, ease: 'easeInOut' }}>
                  {pending.sticker}
                </motion.div>
                <AnimatePresence>
                  {collecting && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="absolute right-0 top-0 whitespace-nowrap rounded-full bg-emerald-500 px-3 py-1 font-round text-[10px] font-black text-white shadow-lg">
                      ✓ Added to your collection
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="mt-3 font-bubble text-xl leading-8 text-violet-950">“{pending.message}”</p>
              <button onClick={open} disabled={speaking} className="mt-3 rounded-full bg-violet-100 px-4 py-2 font-round text-xs font-black text-violet-700 disabled:opacity-50">
                {speaking ? '🔊 Reading your message…' : '🔊 Hear it again'}
              </button>
              <motion.button whileTap={{ scale: 0.96 }} onClick={keep} disabled={collecting}
                data-testid="keep-high-five"
                className="mt-4 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 py-3 font-bubble text-sm text-white shadow-lg disabled:opacity-70">
                Keep my high-five {pending.sticker}
              </motion.button>
            </motion.div>
          )}
          <p className="mt-4 font-round text-xs font-bold text-white/80">The sticker stays in your collection forever.</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
