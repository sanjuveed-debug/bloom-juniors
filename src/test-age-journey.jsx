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
  livingAdventure: { storyId: 'moon-egg-v1', completed: [0, 1, 2, 3, 4] },
  treasureCollection: { items: [], claims: {} },
}

function Harness() {
  const [progress, setProgress] = useState(initialProgress)
  const update = patch => setProgress(current => ({ ...current, ...(typeof patch === 'function' ? patch(current) : patch) }))
  const navigate = to => { document.title = `nav:${to}` }
  if (age === 'junior') return <KS2Dashboard profileName="Rohan" progress={progress} todayKey={formatLocalDate()} gamesUnlocked={false} studyDoneCount={0} onNavigate={navigate} onUpdateProgress={update} />
  return <ToddlerDashboard profileName="Jasmine" progress={progress} onNavigate={navigate} onUpdateProgress={update} onWonderWorld={() => navigate('wonderworld')} />
}

createRoot(document.getElementById('root')).render(<Harness />)
