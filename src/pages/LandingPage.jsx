import React, { useEffect } from 'react'
import WorldLanding from './WorldLanding'
import { trackEvent, trackEventOnce } from '../utils/analytics.js'

export default function LandingPage({ onGetStarted, onSignIn }) {
  useEffect(() => { trackEventOnce('landing-view', 'landing_page_view', { design: 'connected-world' }) }, [])
  const start = location => {
    trackEvent('landing_cta_click', { cta: 'start_free', location })
    onGetStarted?.()
  }
  const signIn = () => {
    trackEvent('landing_cta_click', { cta: 'sign_in', location: 'navigation' })
    onSignIn?.()
  }
  return <WorldLanding onGetStarted={start} onSignIn={signIn}/>
}
