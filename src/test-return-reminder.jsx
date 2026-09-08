import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import ParentZone from './components/ParentZone.jsx'
import './index.css'

function ReturnReminderUAT() {
  const [progress, setProgress] = useState({
    avatar: 'yaagvi',
    loginStreak: 3,
    totalStars: 42,
    sessions: [],
    returnReminder: {
      enabled: false,
      pushEnabled: true,
      pushSubscription: {
        endpoint: 'https://push.example.test/subscription',
        keys: { p256dh: 'test-public-key', auth: 'test-auth-secret' },
      },
      time: '18:00',
      timezone: 'Asia/Dubai',
    },
  })
  const update = patch => setProgress(previous => ({
    ...previous,
    ...(typeof patch === 'function' ? patch(previous) : patch),
  }))

  return (
    <>
      <output data-testid="reminder-state" className="sr-only">
        {JSON.stringify(progress.returnReminder || {})}
      </output>
      <ParentZone
        avatar="yaagvi"
        progress={progress}
        profileId="return-reminder-uat"
        profileName="Ava"
        profileAgeGroup="early"
        parentPin="1234"
        guardianEmail="parent@example.com"
        onUpdateProgress={update}
        onBack={() => {}}
        onSetChallenge={() => {}}
        onAddSticker={() => {}}
        onReset={() => {}}
      />
    </>
  )
}

createRoot(document.getElementById('root')).render(<ReturnReminderUAT />)
