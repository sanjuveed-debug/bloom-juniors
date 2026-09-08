import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import NeverFinishedAdventure from './components/NeverFinishedAdventure.jsx'
import './index.css'

const ageGroup = new URLSearchParams(window.location.search).get('age') || 'early'

function Harness() {
  const [progress, setProgress] = useState({ totalStars: 40, learningJourney: { skills: {} }, sessions: [] })
  const [lastLaunch, setLastLaunch] = useState('none')
  const update = patch => setProgress(current => ({ ...current, ...(typeof patch === 'function' ? patch(current) : patch) }))
  const navigate = moduleId => {
    setLastLaunch(moduleId)
    setProgress(current => ({ ...current, [moduleId]: { ...(current[moduleId] || {}), played: (current[moduleId]?.played || 0) + 1 } }))
  }
  return <main className="min-h-screen bg-[#fff3df] py-8"><p data-testid="last-launch" className="text-center">{lastLaunch}</p><NeverFinishedAdventure ageGroup={ageGroup} progress={progress} active onNavigate={navigate} onUpdateProgress={update}/></main>
}

createRoot(document.getElementById('root')).render(<Harness/>)
