import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ToddlerDashboard } from './toddler/ToddlerApp.jsx'
import { KS2Dashboard } from './ks2/KS2App.jsx'
import { formatLocalDate } from './utils/date.js'
import './index.css'

const age = new URLSearchParams(window.location.search).get('age') || 'toddler'
const initialProgress = {
  totalStars: 18,
  loginStreak: 3,
  ks2Xp: 145,
  sessions: [],
  avatarWorkshop: {
    awards: Object.fromEntries(
      ['phonics', 'math', 'story', 'science'].map((moduleId, index) => [
        `2026-07-29:${moduleId}`,
        { coins: 1, moduleId, date: '2026-07-29', awardedAt: index + 1 },
      ])
    ),
  },
  livingAdventure: { storyId: 'moon-egg-v1', completed: [0, 1, 2, 3, 4] },
  treasureCollection: { items: [], claims: {} },
}

function Harness() {
  const completedModules = age === 'junior'
    ? ['reading', 'timestables', 'spelling', 'reading', 'timestables', 'reading', 'spelling']
    : ['alphabet', 'numbers', 'alphabet', 'colours', 'numbers', 'animals', 'shapes']
  const [progress, setProgress] = useState({
    ...initialProgress,
    sessions: completedModules.map((module, index) => ({
      module,
      completed: true,
      playedAt: Date.now() - ((index + 1) * 60_000),
    })),
  })
  const update = patch => setProgress(current => ({ ...current, ...(typeof patch === 'function' ? patch(current) : patch) }))
  const navigate = to => { document.title = `nav:${to}` }
  if (age === 'junior') return <KS2Dashboard profileName="Rohan" progress={progress} todayKey={formatLocalDate()} gamesUnlocked={false} studyDoneCount={0} onNavigate={navigate} onParent={() => navigate('parent')} onSwitchProfiles={() => navigate('profiles')} onUpdateProgress={update} />
  return <ToddlerDashboard profileName="Jasmine" progress={progress} onNavigate={navigate} onParent={() => navigate('parent')} onSwitchProfiles={() => navigate('profiles')} onUpdateProgress={update} onWonderWorld={() => navigate('wonderworld')} />
}

createRoot(document.getElementById('root')).render(<Harness />)
