import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import RetentionSetup from './components/RetentionSetup.jsx'
import './index.css'

function Harness() {
  const params = new URLSearchParams(window.location.search)
  const classroomMode = params.get('classroom') === '1'
  const completed = params.get('completed') !== '0'
  const [progress, setProgress] = useState(completed ? {
    sessions: [{ module: 'phonics', stars: 3, date: Date.now() }],
  } : {})
  return (
    <>
      <main className="min-h-screen bg-orange-50 p-6">
        <h1 className="font-bubble text-2xl text-orange-950">Dashboard behind setup</h1>
      </main>
      <RetentionSetup
        profileId="retention-setup-uat"
        profileName="Ava"
        profileAgeGroup="early"
        guardianEmail="parent@example.com"
        parentPin="2468"
        verifyParentPin={value => Promise.resolve(value === '2468')}
        progress={progress}
        onUpdateProgress={patch => setProgress(current => ({ ...current, ...patch }))}
        classroomMode={classroomMode}
      />
      <output data-testid="reminder-state">{JSON.stringify(progress.returnReminder || {})}</output>
    </>
  )
}

createRoot(document.getElementById('root')).render(<Harness />)
