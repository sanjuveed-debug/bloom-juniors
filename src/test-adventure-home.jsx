import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import BloomAdventureHome from './components/BloomAdventureHome.jsx'
import DailyJourneyParentSummary from './components/DailyJourneyParentSummary.jsx'
import { normalizeWeeklyBloomAdventure } from './utils/weeklyBloomAdventure.js'
import { formatLocalDate } from './utils/date.js'

const NEXT = {
  toddler: { id: 'colours', label: 'Rainbow Garden', emoji: '🌈' },
  early: { id: 'math', label: 'Number Falls', emoji: '🔢' },
  junior: { id: 'reading', label: 'Book Kingdom', emoji: '📚' },
}

const NOW = Date.now()
const PROGRESS = {
  toddler: { sessions: ['alphabet', 'numbers', 'alphabet', 'colours', 'numbers', 'animals', 'shapes'].map((module, index) => ({ module, date: NOW - 7000 + index })), childInterest: { active: { moduleId: 'numbers', startedAt: NOW, source: 'choice' }, events: [{ type: 'start', moduleId: 'numbers', at: NOW, source: 'choice' }] } },
  early: { sessions: ['phonics', 'math', 'phonics', 'shapes', 'math', 'story', 'logic'].map((module, index) => ({ module, date: NOW - 7000 + index })), childInterest: { active: { moduleId: 'math', startedAt: NOW, source: 'choice' }, events: [{ type: 'start', moduleId: 'math', at: NOW, source: 'choice' }] } },
  junior: { sessions: ['reading', 'timestables', 'spelling', 'reading', 'timestables', 'reading', 'spelling'].map((module, index) => ({ module, date: NOW - 7000 + index })), childInterest: { active: { moduleId: 'reading', startedAt: NOW, source: 'choice' }, events: [{ type: 'start', moduleId: 'reading', at: NOW, source: 'choice' }] } },
}

const STARTER_PROGRESS = {
  toddler: { sessions: ['alphabet', 'numbers', 'alphabet'].map((module, index) => ({ module, date: NOW - 3000 + index })) },
  early: { sessions: ['phonics', 'math', 'phonics'].map((module, index) => ({ module, date: NOW - 3000 + index })) },
  junior: { sessions: ['reading', 'timestables', 'spelling'].map((module, index) => ({ module, date: NOW - 3000 + index })) },
}

function TestAdventureHome() {
  const [age, setAge] = useState('early')
  const [scenario, setScenario] = useState('fresh')
  const [library, setLibrary] = useState(false)
  const [event, setEvent] = useState('Nothing tapped yet')
  const waitingWeekly = {
    ...normalizeWeeklyBloomAdventure({}, age),
    chapter: 1,
    lastCompletedDate: formatLocalDate(),
    history: [{ chapter: 0, moduleId: NEXT[age].id, title: 'First clue', restored: 'The first clue appeared.', completedAt: NOW, date: formatLocalDate() }],
  }
  const scenarioProgress = scenario === 'first'
    ? {}
    : scenario === 'starter'
      ? STARTER_PROGRESS[age]
    : scenario === 'fresh' || scenario === 'treasure'
    ? PROGRESS[age]
    : { ...PROGRESS[age], weeklyBloomAdventure: waitingWeekly }
  const done = scenario === 'first' || scenario === 'learning' ? 0 : scenario === 'treasure' || scenario === 'wonder' ? 2 : 1
  const claimed = scenario === 'wonder'
  const steps = [
    { module: NEXT[age], done: done > 0 },
    { module: { id: age === 'junior' ? 'science' : age === 'toddler' ? 'shapes' : 'phonics', label: 'Wonder Lab', emoji: '🔬' }, done: done > 1 },
  ]
  return <main className="min-h-screen bg-[#fff4dd] pb-16">
    <nav className="mx-auto flex max-w-7xl flex-wrap gap-2 p-3">
      {['toddler','early','junior'].map(value => <button key={value} data-age={value} onClick={() => { setAge(value); setLibrary(false) }} className="rounded-full bg-[#3a214c] px-4 py-2 font-bubble text-white">{value}</button>)}
      {['first','starter','fresh','learning','treasure','wonder'].map(value => <button key={value} data-scenario={value} onClick={() => setScenario(value)} className="rounded-full bg-[#8f321e] px-4 py-2 font-bubble text-white">{value}</button>)}
    </nav>
    <BloomAdventureHome ageGroup={age} profileName="Yaagvi" progress={scenarioProgress} dailyNext={NEXT[age]} dailySteps={steps} dailyDone={done} dailyRequired={2} dailyClaimed={claimed} treasureCount={3} libraryOpen={library} onNavigate={(id, source) => setEvent(`navigate:${id}:${source}`)} onUpdateProgress={() => {}} onClaimTreasure={() => setEvent('claim')} onToggleLibrary={() => setLibrary(value => !value)} onOpenWorld={() => setEvent('world')} onOpenWonder={() => setEvent('wonder')} onOpenTreasureRoom={() => setEvent('treasures')} />
    {library && <section data-testid="library" className="mx-auto mt-4 max-w-7xl rounded-3xl bg-white p-6 font-bubble text-2xl">The complete game map opens here.</section>}
    <p data-testid="event" className="mx-auto mt-4 max-w-7xl px-5 font-round">{event}</p>
    <div className="mx-auto mt-8 max-w-5xl">
      <DailyJourneyParentSummary progress={scenarioProgress} profileName="Yaagvi" ageGroup={age} />
    </div>
  </main>
}

createRoot(document.getElementById('root')).render(<TestAdventureHome />)
