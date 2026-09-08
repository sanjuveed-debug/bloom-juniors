import React from 'react'
import {createRoot} from 'react-dom/client'
import KS2App from './ks2/KS2App.jsx'
import {LearningCompanionContext} from './components/LearningCompanionContext.jsx'
import './index.css'
// Synthetic local profile. Explicit production inputs exclude this fixture.
createRoot(document.getElementById('root')).render(<LearningCompanionContext.Provider value="bumi"><KS2App profileId={null} profileName="Explorer" profileAgeGroup="junior" parentPin="1234" verifyParentPin={async pin=>pin==='1234'} onSwitchProfiles={()=>{}} onLogout={()=>{}} /></LearningCompanionContext.Provider>)
