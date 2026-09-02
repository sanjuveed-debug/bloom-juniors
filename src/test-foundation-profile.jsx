import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import FoundationProfile from './components/FoundationProfile.jsx'
import FoundationProgress from './components/FoundationProgress.jsx'
import FoundationSeasonSummary from './components/FoundationSeasonSummary.jsx'
import './index.css'

function FoundationProfileHarness() {
  const [progress, setProgress] = useState({
    sessions: [
      { module: 'science', date: Date.now() - 86400000 },
      { module: 'story', date: Date.now() - 2 * 86400000 },
      { module: 'worldgk', date: Date.now() - 3 * 86400000 },
      { module: 'exercise', date: Date.now() - 4 * 86400000 },
    ],
    wonderWhy: {
      discoveries: {
        'leaves-green-v1': {
          id: 'leaves-green-v1',
          question: 'Why are leaves green?',
          completedAt: Date.now() - 86400000,
          lastVisitedAt: Date.now() - 86400000,
          familyPrompt: 'What other colours can you spot in leaves near home?',
        },
      },
    },
  })
  const update = patch => {
    const next = { ...progress, ...patch }
    setProgress(next)
    window.__foundationProgress = next
  }

  return (
    <main className="min-h-screen bg-[#f5efff] py-4">
      <FoundationSeasonSummary progress={progress} profileName="UAT Bloom" onUpdateProgress={update} />
      <FoundationProgress progress={progress} profileName="UAT Bloom" />
      <FoundationProfile
        progress={progress}
        profileName="UAT Bloom"
        theme={{ primary: '#6d3db0' }}
        onUpdateProgress={update}
      />
    </main>
  )
}

createRoot(document.getElementById('root')).render(<FoundationProfileHarness />)
