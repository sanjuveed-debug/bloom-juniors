import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import BloomAdventureHome from './components/BloomAdventureHome.jsx'

const NEXT = {
  toddler: { id: 'colours', label: 'Rainbow Garden', emoji: '🌈' },
  early: { id: 'math', label: 'Number Falls', emoji: '🔢' },
  junior: { id: 'reading', label: 'Book Kingdom', emoji: '📚' },
}

const NOW = Date.now()
const PROGRESS = {
  toddler: { childInterest: { active: { moduleId: 'numbers', startedAt: NOW, source: 'choice' }, events: [{ type: 'start', moduleId: 'numbers', at: NOW, source: 'choice' }] } },
  early: { childInterest: { active: { moduleId: 'math', startedAt: NOW, source: 'choice' }, events: [{ type: 'start', moduleId: 'math', at: NOW, source: 'choice' }] } },
  junior: { childInterest: { active: { moduleId: 'reading', startedAt: NOW, source: 'choice' }, events: [{ type: 'start', moduleId: 'reading', at: NOW, source: 'choice' }] } },
}

function TestAdventureHome() {
  const [age, setAge] = useState('early')
  const [library, setLibrary] = useState(false)
  const [event, setEvent] = useState('Nothing tapped yet')
  return <main className="min-h-screen bg-[#fff4dd] pb-16">
    <nav className="mx-auto flex max-w-7xl gap-2 p-3">
      {['toddler','early','junior'].map(value => <button key={value} data-age={value} onClick={() => { setAge(value); setLibrary(false) }} className="rounded-full bg-[#3a214c] px-4 py-2 font-bubble text-white">{value}</button>)}
    </nav>
    <BloomAdventureHome ageGroup={age} profileName="Yaagvi" progress={PROGRESS[age]} dailyNext={NEXT[age]} dailyDone={1} dailyRequired={2} treasureCount={3} libraryOpen={library} onNavigate={(id, source) => setEvent(`navigate:${id}:${source}`)} onClaimTreasure={() => setEvent('claim')} onToggleLibrary={() => setLibrary(value => !value)} onOpenWorld={() => setEvent('world')} onOpenTreasureRoom={() => setEvent('treasures')} />
    {library && <section data-testid="library" className="mx-auto mt-4 max-w-7xl rounded-3xl bg-white p-6 font-bubble text-2xl">The complete game map opens here.</section>}
    <p data-testid="event" className="mx-auto mt-4 max-w-7xl px-5 font-round">{event}</p>
  </main>
}

createRoot(document.getElementById('root')).render(<TestAdventureHome />)
