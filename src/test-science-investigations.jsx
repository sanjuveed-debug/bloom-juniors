import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import CuriousScience from './modules/CuriousScience.jsx'
import './index.css'

function ScienceHarness() {
  const [progress, setProgress] = useState({
    avatar: 'rumi',
    scienceInvestigations: {},
  })

  const update = patch => {
    const next = { ...progress, ...patch }
    setProgress(next)
    window.__scienceProgress = next
  }

  return (
    <CuriousScience
      avatar="rumi"
      profileName="UAT Bloom"
      progress={progress}
      onUpdateProgress={update}
      onAddStars={(module, stars, sessionData) => {
        window.__scienceReward = { module, stars, sessionData }
      }}
      onBack={() => {
        document.title = 'back'
      }}
    />
  )
}

createRoot(document.getElementById('root')).render(<ScienceHarness />)
