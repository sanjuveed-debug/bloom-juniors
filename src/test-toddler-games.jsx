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
    setProgress(current => ({ ...current, [moduleId]: { ...current[moduleId], played: 3, stars: correct } }))
  }
  return (
    <VoiceContext.Provider value="en-US-AnaNeural">
      <AdventureModuleFrame moduleId={moduleId} ageGroup="toddler" progress={progress} onUpdateProgress={setProgress} onMap={() => {}}>
        <ToddlerChoiceModule moduleId={moduleId} played={2} onBack={() => {}} onDone={finish} />
      </AdventureModuleFrame>
      {arrival && <ModuleArrival moduleId={moduleId} profileName="Yaagvi" ageGroup="toddler" onStart={() => setArrival(false)} onBack={() => {}} />}
    </VoiceContext.Provider>
  )
}

createRoot(document.getElementById('root')).render(<Harness />)
