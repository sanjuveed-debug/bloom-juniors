import { formatLocalDate } from './date'

const GIFT_KEY = 'bloom_daily_gift'

// Rotating daily gifts — seeds by day so the same day always gives the same gift
const DAILY_GIFTS = [
  { emoji: '⭐', stars: 10, message: '10 bonus stars for showing up!' },
  { emoji: '💫', stars: 15, message: '15 magic stars — keep it up!' },
  { emoji: '🌟', stars: 20, message: 'Wow! 20 shining stars!' },
  { emoji: '🎯', stars: 10, message: '10 focus stars — great work!' },
  { emoji: '🏆', stars: 25, message: 'Champion! 25 bonus stars!' },
  { emoji: '🎨', stars: 10, message: '10 creative stars unlocked!' },
  { emoji: '🚀', stars: 20, message: 'Blast off with 20 bonus stars!' },
]

export function getTodayGift() {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24))
  return DAILY_GIFTS[dayIndex % DAILY_GIFTS.length]
}

export function isDailyGiftClaimed() {
  return localStorage.getItem(GIFT_KEY) === formatLocalDate()
}

export function claimDailyGift() {
  localStorage.setItem(GIFT_KEY, formatLocalDate())
}

const MILESTONES = [
  { at: 3,   emoji: '🌟', label: '3-Day Explorer'   },
  { at: 7,   emoji: '🏅', label: 'Week Warrior'     },
  { at: 14,  emoji: '🔥', label: '2-Week Champion'  },
  { at: 30,  emoji: '👑', label: 'Monthly Legend'   },
  { at: 60,  emoji: '💎', label: 'Diamond Learner'  },
  { at: 100, emoji: '🚀', label: 'Centurion'        },
]

export function getStreakMilestone(streak) {
  return MILESTONES.filter(m => streak >= m.at).pop() || null
}

// Returns array of 7 { played, isToday, dayLabel } — oldest first, today last
export function getWeekDots(progress) {
  const sessions = progress?.sessions || []
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    const dayKey = formatLocalDate(d)
    const dayLabel = 'SMTWTFS'[d.getDay()]
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    const dayEnd = dayStart + 86_400_000
    const isToday = i === 6
    const played = isToday
      ? sessions.some(s => s.date >= dayStart && s.date < dayEnd) || progress?.lastLoginDate === dayKey
      : sessions.some(s => s.date >= dayStart && s.date < dayEnd)
    return { played, isToday, dayLabel }
  })
}
