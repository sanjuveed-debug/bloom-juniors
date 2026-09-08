import React from 'react'
import { createRoot } from 'react-dom/client'
import { AppWithProfile } from './App.jsx'
import { LearningCompanionContext } from './components/LearningCompanionContext.jsx'
import './index.css'

// Local-only review: exercises the real router and progress hook without a
// guardian or cloud profile. Explicit production rollup inputs exclude this file.
createRoot(document.getElementById('root')).render(<LearningCompanionContext.Provider value="bumi">
  <AppWithProfile profileId={null} profileName="Review child" profileAgeGroup="early"
    parentPin="1234" verifyParentPin={async pin => pin === '1234'}
    onSwitchProfiles={() => {}} onQuickSwitch={() => {}} profiles={[]}
    onLogout={() => {}} />
</LearningCompanionContext.Provider>)
