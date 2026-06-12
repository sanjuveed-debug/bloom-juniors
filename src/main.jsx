import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { initErrorMonitor } from './utils/errorMonitor.js'
import './index.css'

initErrorMonitor()

// Auto-reload when a new service worker takes over.
// hadController = false means first install (no old SW) — skip reload to avoid a flash.
// hadController = true means an update — reload silently so the user gets new code.
if ('serviceWorker' in navigator) {
  const hadController = Boolean(navigator.serviceWorker.controller)
  let reloading = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return
    reloading = true
    window.location.reload()
  })
}

registerSW({
  immediate: true,
  onRegisterError(error) {
    console.error('Service worker registration failed', error)
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
