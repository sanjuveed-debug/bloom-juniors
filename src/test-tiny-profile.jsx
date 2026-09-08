import React from 'react'
import { createRoot } from 'react-dom/client'
import ToddlerApp from './toddler/ToddlerApp.jsx'
import { LearningCompanionContext } from './components/LearningCompanionContext.jsx'
import './index.css'
// Local-only synthetic profile. Excluded by the explicit production rollup inputs.
createRoot(document.getElementById('root')).render(<LearningCompanionContext.Provider value="bumi"><ToddlerApp profileId={null} profileName="Little explorer" profileAgeGroup="toddler" parentPin="1234" verifyParentPin={async pin=>pin==='1234'} onSwitchProfiles={()=>{}} onLogout={()=>{}} /></LearningCompanionContext.Provider>)
