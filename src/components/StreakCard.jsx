import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getTodayGift, isDailyGiftClaimed, claimDailyGift, getStreakMilestone, getWeekDots } from '../utils/streakUtils'

const TEXT       = '#422006'
const TEXT_FAINT = 'rgba(66,32,6,0.45)'
const PRIMARY    = '#C2410C'

function streakMessage(streak) {
  if (streak === 0) return 'Start your streak today — play any activity! 🌱'
  if (streak === 1) return 'Great start! Come back tomorrow to keep it alive. 🔥'
  if (streak === 2) return 'Two days running! One more and you\'re on a streak. ⚡'
  if (streak < 7)  return `${7 - streak} more day${7 - streak > 1 ? 's' : ''} to reach Week Warrior! 💪`
  if (streak < 14) return `${streak}-day streak — you're a learning champion! 🏅`
  return `WOW! ${streak} days straight — you're unstoppable! 👑`
}

export default function StreakCard({ progress, theme, onAddStars }) {
  const [claimed, setClaimed]     = useState(() => isDailyGiftClaimed())
  const [showToast, setShowToast] = useState(false)
  const [chestOpen, setChestOpen] = useState(false)

  const streak    = progress?.loginStreak || 0
  const gift      = getTodayGift()
  const milestone = getStreakMilestone(streak)
  const weekDots  = getWeekDots(progress)

  const handleClaim = () => {
    if (claimed) return
    setChestOpen(true)
    setTimeout(() => {
      claimDailyGift()
      setClaimed(true)
      setShowToast(true)
      onAddStars?.('dailygift', gift.stars)
      setTimeout(() => setShowToast(false), 3500)
    }, 400)
  }

  const cardBg = streak >= 7
    ? 'linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)'
    : 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)'

  const cardBorder = streak >= 7
    ? '2px solid #F97316'
    : '1.5px solid rgba(66,32,6,0.10)'

  const cardShadow = streak >= 3
    ? '0 8px 28px rgba(249,115,22,0.15)'
    : '0 4px 16px rgba(66,32,6,0.06)'

  return (
    <section className="mx-auto mt-4 max-w-6xl px-4 md:px-6 xl:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="rounded-[24px] p-4"
        style={{ background: cardBg, border: cardBorder, boxShadow: cardShadow }}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          {/* Flame + count */}
          <div className="flex items-center gap-3">
            <motion.span
              className="leading-none"
              style={{ fontSize: 42 }}
              animate={streak >= 3 ? { scale: [1, 1.12, 1] } : {}}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              🔥
            </motion.span>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-bubble leading-none" style={{ fontSize: 40, color: streak >= 3 ? PRIMARY : '#9A3412' }}>
                  {streak}
                </span>
                <span className="font-bubble text-lg" style={{ color: TEXT_FAINT }}>
                  {streak === 1 ? 'day' : 'days'}
                </span>
              </div>
              {milestone ? (
                <div className="flex items-center gap-1 mt-0.5">
                  <span style={{ fontSize: 14 }}>{milestone.emoji}</span>
                  <span className="font-round text-xs font-bold" style={{ color: PRIMARY }}>
                    {milestone.label}
                  </span>
                </div>
              ) : (
                <span className="font-round text-xs" style={{ color: TEXT_FAINT }}>streak</span>
              )}
            </div>
          </div>

          {/* Daily gift */}
          <motion.button
            whileTap={{ scale: 0.90 }}
            onClick={handleClaim}
            className="flex flex-col items-center gap-1 pt-0.5"
          >
            <motion.span
              style={{ fontSize: 36, lineHeight: 1 }}
              animate={!claimed && !chestOpen ? { y: [0, -5, 0] } : chestOpen ? { rotate: [0, -15, 15, 0], scale: [1, 1.25, 1] } : {}}
              transition={!claimed && !chestOpen
                ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.4 }
              }
            >
              {claimed ? '✅' : chestOpen ? '🎁' : '📦'}
            </motion.span>
            <span
              className="font-round text-xs font-bold px-2.5 py-0.5 rounded-full"
              style={{
                background: claimed ? 'rgba(66,32,6,0.07)' : PRIMARY,
                color: claimed ? TEXT_FAINT : '#FFFFFF',
                whiteSpace: 'nowrap',
              }}
            >
              {claimed ? 'Claimed ✓' : 'Daily Gift!'}
            </span>
          </motion.button>
        </div>

        {/* 7-day history dots */}
        <div className="mt-4 flex items-end gap-1.5">
          {weekDots.map(({ played, isToday, dayLabel }, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <motion.div
                className="w-full rounded-full"
                style={{
                  height: isToday ? 10 : 7,
                  background: played
                    ? (isToday ? PRIMARY : '#FB923C')
                    : 'rgba(66,32,6,0.10)',
                  outline: isToday ? `2px solid ${PRIMARY}` : 'none',
                  outlineOffset: 1,
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 400 }}
              />
              <span className="font-round" style={{ fontSize: 9, color: isToday ? PRIMARY : TEXT_FAINT, fontWeight: isToday ? 700 : 400 }}>
                {isToday ? '•' : dayLabel}
              </span>
            </div>
          ))}
        </div>

        {/* Motivation text */}
        <p className="font-round text-xs mt-3 leading-relaxed" style={{ color: TEXT_FAINT }}>
          {streakMessage(streak)}
        </p>
      </motion.div>

      {/* Gift claim toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 340, damping: 22 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl"
            style={{ background: PRIMARY, minWidth: 240, maxWidth: 320 }}
          >
            <motion.span
              style={{ fontSize: 28 }}
              animate={{ rotate: [0, 20, -15, 10, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 0.6 }}
            >
              {gift.emoji}
            </motion.span>
            <div>
              <p className="font-bubble text-white text-sm leading-tight">{gift.message}</p>
              <p className="font-round text-white/70 text-xs mt-0.5">+{gift.stars} bonus stars added!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
