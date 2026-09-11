import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import ClassroomDashboard from './components/ClassroomDashboard'
import { AppWithProfile } from './App'
import { LearningCompanionContext } from './components/LearningCompanionContext'
import './index.css'

// Synthetic local review only; explicit production rollup inputs exclude this entry.
const profile = { id: 'qa-school-discovery', name: 'QA Learner', ageGroup: 'early' }
const guardian = { id: 'qa-school-teacher', guardianName: 'QA Teacher', schoolName: 'Local Review', className: 'Early Class', schoolId: new URLSearchParams(location.search).has('cloud') ? 'qa-school' : undefined }
function Review() {
  const [pupil, setPupil] = useState(false)
  return <LearningCompanionContext.Provider value="bumi"><button onClick={() => setPupil(!pupil)} style={{ padding: 16, background:'white', color:'black' }}>{pupil ? 'Review teacher' : 'Review pupil'}</button>
    {pupil ? <AppWithProfile profileId={profile.id} profileName={profile.name} profileAgeGroup="early" guardianId={guardian.id} classroomMode profiles={[profile]} onSwitchProfiles={() => setPupil(false)} onQuickSwitch={() => {}} onLogout={() => {}} />
      : <ClassroomDashboard profiles={[profile]} guardian={guardian} onSelectStudent={() => setPupil(true)} onAddStudent={() => {}} onUpdateGuardian={() => {}} onBack={() => {}} onLogout={() => {}} />}
  </LearningCompanionContext.Provider>
}
createRoot(document.getElementById('root')).render(<Review />)
