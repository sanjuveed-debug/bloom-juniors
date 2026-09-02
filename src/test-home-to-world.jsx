import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import HomeToWorld from './modules/HomeToWorld.jsx'
import './index.css'

function HomeToWorldHarness() {
  const ageGroup = new URLSearchParams(window.location.search).get('age') || 'early'
  const [progress, setProgress] = useState({
    foundationProfile: {
      roots: ['India', 'UAE'],
      languages: ['English', 'Kannada'],
    },
    homeToWorld: {},
  })

  const update = patch => {
    setProgress(current => {
      const value = typeof patch === 'function' ? patch(current) : patch
      const next = { ...current, ...value }
      window.__homeToWorldProgress = next
      return next
    })
  }

  return (
    <HomeToWorld
      ageGroup={ageGroup}
      profileName="UAT Bloom"
      progress={progress}
      moduleId={ageGroup === 'junior' ? 'worldmap' : 'worldgk'}
      onUpdateProgress={update}
      onAddStars={(module, stars, sessionData) => {
        window.__homeToWorldReward = { module, stars, sessionData }
      }}
      onBack={() => {
        document.title = 'back'
      }}
      onOpenExplorer={() => {
        document.title = 'country-library'
      }}
    />
  )
}

createRoot(document.getElementById('root')).render(<HomeToWorldHarness />)
