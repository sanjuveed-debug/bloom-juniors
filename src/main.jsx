import { offerAppUpdate } from './utils/appUpdate.js'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import VoiceStatusToast from './components/VoiceStatusToast.jsx'
import { initErrorMonitor } from './utils/errorMonitor.js'
import './index.css'
import { LearningCompanionContext } from './components/LearningCompanionContext.jsx'

const PlayFloat = React.lazy(() => import('./pages/PlayFloat.jsx'))
const guestFloat = window.location.pathname.replace(/\/$/, '') === '/play/float'
const PlayShadow = React.lazy(() => import('./pages/PlayShadow.jsx'))
const guestShadow = window.location.pathname.replace(/\/$/, '') === '/play/shadow'
const PlayPicnic = React.lazy(() => import('./pages/PlayPicnic.jsx'))
const guestPlay = window.location.pathname.replace(/\/$/, '') === '/play'

initErrorMonitor()

// Keep the current learning session intact. Waiting updates activate after all
// tabs using the old version close; do not reload a child's in-progress activity.
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() { offerAppUpdate(reload => updateSW(reload)) },
  onRegisterError(error) {
    console.error('Service worker registration failed', error)
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <LearningCompanionContext.Provider value="bumi">
      <ErrorBoundary>
        {guestShadow ? <React.Suspense fallback={<p className="p-8 text-center">Getting the light theatre ready...</p>}><PlayShadow /></React.Suspense> : guestFloat ? <React.Suspense fallback={<p className="p-8 text-center">Getting the water lab ready...</p>}><PlayFloat /></React.Suspense> : guestPlay ? <React.Suspense fallback={<p className="p-8 text-center">Getting your picnic ready...</p>}><PlayPicnic /></React.Suspense> : <App />}
      </ErrorBoundary>
      <VoiceStatusToast />
      </LearningCompanionContext.Provider>
    </MotionConfig>
  </React.StrictMode>,
)
