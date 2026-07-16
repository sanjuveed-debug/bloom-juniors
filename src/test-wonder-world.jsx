import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import WonderWorld from './components/WonderWorld.jsx'
import './index.css'

const initialProgress = {
  body: { stars: 4 },
  colours: { stars: 5 },
  treasureCollection: {
    items: [{ id: 'explorer-dolly', name: 'Explorer Yaagvi Dolly', kind: 'dolly', slot: 'buddy', rarity: 'special', image: '/yaagvi-3d-wave.png' }],
    equipped: {},
  },
  wonderWorld: {
    version: 1,
    seedClaims: {
      'uat:ready': { at: 1, source: 'uat' },
      'uat:new': { at: 2, source: 'uat' },
    },
    plots: [
      { awardId: 'uat:ready', seedId: 'rainbow', plantedDate: '2026-07-11', plantedAt: 1 },
      null,
      null,
    ],
    discoveries: [],
  },
}

function WonderWorldHarness() {
  const ageGroup = new URLSearchParams(window.location.search).get('age') || 'early'
  const [progress, setProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wonder-world-uat-progress')) || initialProgress } catch { return initialProgress }
  })
  const updateProgress = patch => setProgress(current => {
    const resolved = typeof patch === 'function' ? patch(current) : patch
    const next = { ...current, ...resolved }
    localStorage.setItem('wonder-world-uat-progress', JSON.stringify(next))
    return next
  })
  return <WonderWorld ageGroup={ageGroup} progress={progress} profileName="Yaagvi" onBack={()=>{}} onUpdateProgress={updateProgress}/>
}

createRoot(document.getElementById('root')).render(<WonderWorldHarness/>)
