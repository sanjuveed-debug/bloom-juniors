import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import Dashboard from './components/Dashboard'
import { getTodayAdventureModules } from './utils/arcadeUnlock'
import './index.css'

const params = new URLSearchParams(window.location.search)
const scenario = params.get('scenario') || 'path0'

const [mod1, mod2] = getTodayAdventureModules({}, null, true)
window.__uatTodayModules = [mod1, mod2]

let sessions = []
if (scenario === 'path1') sessions = [{ module: mod1, date: Date.now() }]
if (scenario === 'done' || scenario === 'celebration') {
  sessions = [{ module: mod1, date: Date.now() }, { module: mod2, date: Date.now() }]
}

if (scenario === 'celebration') {
  sessionStorage.removeItem('bloomCelebration')
} else {
  sessionStorage.setItem('bloomCelebration', 'true')
}

const initialProgress = {
  avatar: 'rumi',
  totalStars: 12,
  loginStreak: 2,
  sessions,
  livingAdventure: { storyId: 'moon-egg-v1', completed: [0, 1, 2, 3, 4] },
  adventure: { skyship: { engineColour: 'orange' } },
}

function DashboardHarness() {
  const [progress, setProgress] = useState(initialProgress)
  return <Dashboard
    avatar="rumi"
    progress={progress}
    profileName="UAT Bloom"
    profiles={[{ id: 'uat', name: 'UAT Bloom' }]}
    activeProfileId="uat"
    onNavigate={(to) => { document.title = `nav:${to}` }}
    onLongPress={() => {}}
    onUpdateProgress={(patch) => setProgress(current => ({ ...current, ...patch }))}
  />
}

createRoot(document.getElementById('root')).render(<DashboardHarness />)
