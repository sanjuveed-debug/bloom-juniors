import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import AdventureModuleFrame from './components/AdventureModuleFrame.jsx'
import BloomQuizShow from './components/BloomQuizShow.jsx'
import './index.css'

const params = new URLSearchParams(window.location.search)
const ageGroup = params.get('age') || 'early'

function Harness() {
  const [progress, setProgress] = useState({
    totalStars: 24,
    quizshow: { played: 4, stars: 4 },
    games: { played: 4, stars: 4 },
  })

  useEffect(() => { window.__bloomQuizProgress = progress }, [progress])

  const complete = result => {
    window.__bloomQuizResult = result
    setProgress(current => ({ ...current, totalStars: current.totalStars + result.stars }))
  }

  return (
    <AdventureModuleFrame
      moduleId="quizshow"
      ageGroup={ageGroup}
      progress={progress}
      onUpdateProgress={setProgress}
      onMap={() => { window.__bloomQuizExited = true }}
    >
      <BloomQuizShow
        ageGroup={ageGroup}
        profileName="Yaagvi"
        played={4}
        onBack={() => { window.__bloomQuizExited = true }}
        onComplete={complete}
      />
    </AdventureModuleFrame>
  )
}

createRoot(document.getElementById('root')).render(<Harness />)
