import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import ParentProgressStory from './components/ParentProgressStory.jsx'
import HighFiveDelivery from './components/HighFiveDelivery.jsx'
import './index.css'

const ageGroup = new URLSearchParams(location.search).get('age') || 'early'
const now = Date.now()
const ids = { toddler: ['numbers', 'colours', 'animals'], early: ['math', 'phonics', 'story'], junior: ['reading', 'grammar', 'science'] }[ageGroup]
const initialProgress = {
  totalStars: 72,
  sessions: ids.map((module, index) => ({ module, date: now - (index + 1) * 86400000, stars: 4 - index, accuracy: 92 - index * 17, duration: 180 + index * 60, total: 5 })),
  learningJourney: { skills: Object.fromEntries(ids.map((id, index) => [id, { attempts: 15, mastery: 90 - index * 20 }])) },
  treasureCollection: { items: [{ id: 'explorer-dolly', slot: 'buddy', name: 'Explorer Yaagvi Dolly', image: '/yaagvi-3d-wave.png' }] },
  wonderWorld: { discoveries: [{ name: 'Prism Blossom' }], plots: [null, null, null] },
}

function HighFiveUAT() {
  const [progress, setProgress] = useState(initialProgress)
  const [view, setView] = useState('parent')
  const update = patch => setProgress(previous => ({ ...previous, ...(typeof patch === 'function' ? patch(previous) : patch) }))
  return (
    <main className="min-h-screen bg-[#fff4df] py-5">
      <div className="fixed right-3 top-3 z-[150] flex gap-2 rounded-full bg-white p-1 shadow">
        <button data-testid="show-parent" onClick={() => setView('parent')} className="rounded-full px-3 py-2 font-round text-xs font-black">Parent</button>
        <button data-testid="show-child" onClick={() => setView('child')} className="rounded-full bg-violet-700 px-3 py-2 font-round text-xs font-black text-white">Child</button>
        <span data-testid="sticker-count" className="px-2 py-2 font-round text-xs font-black">{progress.stickers?.length || 0}</span>
      </div>
      {view === 'parent'
        ? <ParentProgressStory progress={progress} profileName="Yaagvi" ageGroup={ageGroup} theme={{ primary: '#7C3AED', accent: '#F9738A' }} now={now} onUpdateProgress={update} />
        : <HighFiveDelivery progress={progress} profileName="Yaagvi" ageGroup={ageGroup} onUpdateProgress={update} />}
    </main>
  )
}

createRoot(document.getElementById('root')).render(<HighFiveUAT />)
