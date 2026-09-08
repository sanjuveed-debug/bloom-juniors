import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import WonderWorld from './components/WonderWorld.jsx'
import SessionTimer from './components/SessionTimer.jsx'
import JarvisOrb from './components/JarvisOrb.jsx'
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
  const params = new URLSearchParams(window.location.search)
  const ageGroup = params.get('age') || 'early'
  const richScenario = params.get('scenario') === 'build-ready'
  const storageKey = richScenario ? `wonder-world-review-build-${ageGroup}` : 'wonder-world-uat-progress'
  const [updates, setUpdates] = useState(0)
  const [progress, setProgress] = useState(() => {
    const fixture = richScenario ? { ...initialProgress, totalStars: 180 } : initialProgress
    try { return JSON.parse(localStorage.getItem(storageKey)) || fixture } catch { return fixture }
  })
  const updateProgress = patch => {
    setUpdates(count => count + 1)
    setProgress(current => {
    const resolved = typeof patch === 'function' ? patch(current) : patch
    const next = { ...current, ...resolved }
    localStorage.setItem(storageKey, JSON.stringify(next))
    return next
  })
  }
  return <>
    <WonderWorld ageGroup={ageGroup} progress={progress} profileName="Yaagvi" onBack={()=>{}} onUpdateProgress={updateProgress}/>
    <SessionTimer sessionMinutes={30} profileName="Yaagvi" theme={{ secondary: '#7a3bad' }} />
    <JarvisOrb avatar="rumi" profileName="Yaagvi" progress={progress} ageGroup={ageGroup} />
    <aside aria-label="Local world review result" style={{ background: 'white', color: '#111', padding: 16 }}>
      <p>Synthetic local fixture: {richScenario ? 'build-ready' : 'garden'}. Progress updates: {updates}.</p>
      <pre>{JSON.stringify({ dreamProject: progress.dreamProject, equipped: progress.treasureCollection?.equipped }, null, 2)}</pre>
    </aside>
  </>
}

createRoot(document.getElementById('root')).render(<WonderWorldHarness/>)
