import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import FounderDashboard from './pages/FounderDashboard.jsx'
import RetentionFeedbackPrompt from './components/RetentionFeedbackPrompt.jsx'
import { buildFounderRetentionReport } from './utils/founderRetention.js'
import './index.css'

const NOW = new Date('2026-07-27T12:00:00Z')
const day = offset => new Date(NOW.getTime() + offset * 86400000).getTime()
const profiles = Array.from({ length: 9 }, (_, index) => ({
  id: `profile-${index}`,
  user_id: `user-${index}`,
  age_group: ['toddler', 'early', 'junior'][index % 3],
  created_at: new Date(day(index < 6 ? -10 : index - 8)).toISOString(),
}))
const patterns = [
  [-10, -9, -7, -3, 0],
  [-10, -9, -7],
  [-10],
  [-10, -7, 0],
  [-10, -9],
  [-10, -3],
  [-2, -1, 0],
  [-1],
  [0],
]
const progressRows = profiles.map((profile, index) => ({
  profile_id: profile.id,
  user_id: profile.user_id,
  progress: {
    sessions: patterns[index].flatMap((offset, sessionIndex) => [
      { module: sessionIndex % 2 ? 'math' : 'phonics', date: day(offset) + sessionIndex * 1000 },
      ...(offset === 0 && index % 2 === 0 ? [{ module: 'science', date: day(offset) + 5000 }] : []),
    ]),
    returnReminder: {
      enabled: index < 6,
      pushEnabled: index < 3,
      pushSubscription: index < 3 ? { endpoint: `https://push.test/${index}`, keys: { p256dh: 'a', auth: 'b' } } : null,
      lastSentDate: index < 2 ? '2026-07-27' : '',
      timezone: 'UTC',
    },
    retentionFeedback: index === 0
      ? { d3: { status: 'answered', answer: 'time', at: day(-7), date: '2026-07-20' } }
      : index === 1
        ? { d3: { status: 'answered', answer: 'child_interest', at: day(-7), date: '2026-07-20' }, d7: { status: 'answered', answer: 'story', at: day(-3), date: '2026-07-24' } }
        : {},
    avatarWorkshop: index < 4
      ? {
          awards: {
            '2026-07-27:phonics': {
              coins: 1,
              moduleId: 'phonics',
              date: '2026-07-27',
              awardedAt: day(0) - 20000,
            },
          },
          purchases: index < 2 ? { 'sunny-cap': { cost: 1, purchasedAt: day(0) - 5000 } } : {},
          equipped: index < 2 ? { head: 'sunny-cap' } : {},
        }
      : {},
    retentionTelemetry: {
      events: [
        ...(index < 2 ? [{ id: 'open:2026-07-17:founding_pilot', type: 'open', date: '2026-07-17', source: 'founding_pilot', at: day(-10) - 1000, timezone: 'UTC' }] : []),
        ...(index === 0 ? [{ id: 'open:2026-07-27:notification', type: 'open', date: '2026-07-27', source: 'notification', at: day(0) - 10000, timezone: 'UTC' }] : []),
        ...(index < 3 ? [{ id: 'avatar_workshop_opened:2026-07-27', type: 'avatar_workshop_opened', date: '2026-07-27', at: day(0) - 8000, timezone: 'UTC' }] : []),
        ...(index < 2 ? [
          { id: 'avatar_item_unlocked:sunny-cap', type: 'avatar_item_unlocked', date: '2026-07-27', action: 'sunny-cap', at: day(0) - 5000, timezone: 'UTC' },
          { id: 'avatar_item_equipped:2026-07-27:sunny-cap', type: 'avatar_item_equipped', date: '2026-07-27', action: 'sunny-cap', at: day(0) - 4000, timezone: 'UTC' },
        ] : []),
      ],
    },
    treasureCollection: index === 0 ? { claims: { 'toddler:2026-07-27': { itemId: 'test' } } } : {},
    wonderWhy: index === 0 ? { lastCompletedDate: '2026-07-27' } : {},
  },
}))
const guardians = Array.from({ length: 10 }, (_, index) => ({
  user_id: `user-${index}`,
  email: `family${index}@example.com`,
  school_id: null,
  registered_at: new Date(day(index === 9 ? 0 : -10)).toISOString(),
}))
guardians.push({
  user_id: 'uat-user',
  school_id: null,
  registered_at: new Date(day(0)).toISOString(),
})
const authUsers = Array.from({ length: 12 }, (_, index) => ({
  id: `user-${index}`,
  email: `family${index}@example.com`,
  created_at: new Date(day(index >= 10 ? -1 : -10)).toISOString(),
  user_metadata: index < 4 ? {
    acquisition: {
      source: index < 3 ? 'chatgpt.com' : 'direct',
      landingPath: index < 2 ? '/' : '/families',
      timezone: index < 2 ? 'Asia/Dubai' : 'Europe/London',
      capturedAt: new Date(day(-10)).toISOString(),
    },
  } : {},
}))
authUsers.push({
  id: 'uat-user',
  email: 'sanju.veed+dashboarduat@gmail.com',
  created_at: new Date(day(0)).toISOString(),
})
const REPORT = buildFounderRetentionReport(
  { profiles, progressRows, guardians, authUsers },
  { now: NOW, timezone: 'UTC', rangeDays: 30 },
)

function Harness() {
  const [feedbackProgress, setFeedbackProgress] = useState({
    sessions: [{ module: 'phonics', date: day(-4) }],
  })
  const [event, setEvent] = useState('')
  return (
    <>
      <FounderDashboard
        initialData={REPORT}
        onBack={() => setEvent('exit')}
        onLogout={() => setEvent('logout')}
        onReactivationSend={async () => {
          setEvent('reactivation-sent')
          return { sent: 2, failed: 0 }
        }}
      />
      <section className="mx-auto max-w-5xl bg-slate-100 py-8" data-testid="feedback-harness">
        <RetentionFeedbackPrompt
          progress={feedbackProgress}
          now={NOW}
          onUpdateProgress={patch => {
            setFeedbackProgress(current => ({ ...current, ...patch }))
            setEvent('feedback-saved')
          }}
        />
        <p data-testid="event" className="px-4 font-round text-sm font-black">{event || 'waiting'}</p>
      </section>
    </>
  )
}

createRoot(document.getElementById('root')).render(<Harness />)
