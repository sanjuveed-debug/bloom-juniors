import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import AdventureModuleFrame from './components/AdventureModuleFrame.jsx'
import ModuleArrival from './components/ModuleArrival.jsx'
import { ToddlerChoiceModule } from './toddler/ToddlerApp.jsx'
import { VoiceContext } from './contexts/VoiceContext.js'
import './index.css'

const moduleId = new URLSearchParams(window.location.search).get('module') || 'colours'

function Harness() {
  const [arrival, setArrival] = useState(true)
  const [progress, setProgress] = useState({ totalStars: 18, [moduleId]: { played: 2, stars: 2 } })
  const finish = (correct, total) => {
    window.__toddlerGameResult = { moduleId, correct, total }
    setProgress(current => ({ ...current, [moduleId]: { ...current[moduleId], played: 3, stars: correct }, reviewResult: { correct, total } }))
  }
  return (
    <VoiceContext.Provider value="en-US-AnaNeural">
      <AdventureModuleFrame moduleId={moduleId} ageGroup="toddler" progress={progress} onUpdateProgress={setProgress} onMap={() => {}}>
        <ToddlerChoiceModule moduleId={moduleId} played={2} onBack={() => {}} onDone={finish} />
      </AdventureModuleFrame>
      {arrival && <ModuleArrival moduleId={moduleId} profileName="Yaagvi" ageGroup="toddler" onStart={() => setArrival(false)} onBack={() => {}} />}
      <aside aria-label="Local review result" style={{ background: '#fff', color: '#111', padding: 16 }}>
        <strong>Local component fixture — no production profile</strong>
        <p>Module: {moduleId}. Callback received: {progress[moduleId]?.played === 3 ? 'yes' : 'no'}.</p>
        {progress[moduleId]?.played === 3 && <p>Callback score: {progress[moduleId].stars}{progress.reviewResult ? ` / ${progress.reviewResult.total}` : ''}.</p>}
      </aside>
    </VoiceContext.Provider>
  )
}

createRoot(document.getElementById('root')).render(<Harness />)
