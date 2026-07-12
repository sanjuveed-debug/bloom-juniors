import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import WonderWorld from './components/WonderWorld.jsx'
import './index.css'

const initialProgress = {
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
  const [progress, setProgress] = useState(initialProgress)
  return <WonderWorld progress={progress} profileName="Yaagvi" onBack={()=>{}} onUpdateProgress={patch=>setProgress(current=>({...current,...patch}))}/>
}

createRoot(document.getElementById('root')).render(<WonderWorldHarness/>)
