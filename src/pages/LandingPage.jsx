import React, { useEffect } from 'react'
import PublicLanding from './PublicLanding'
import { trackEvent, trackEventOnce } from '../utils/analytics.js'

export default function LandingPage({ onGetStarted, onSignIn }) {
  useEffect(() => { trackEventOnce('landing-view', 'landing_page_view', { design: 'bloom-discoveries' }) }, [])
  const start = location => {
    trackEvent('landing_cta_click', { cta: 'start_free', location })
    onGetStarted?.()
  }
  const signIn = () => {
    trackEvent('landing_cta_click', { cta: 'sign_in', location: 'navigation' })
    onSignIn?.()
  }
  return <PublicLanding onGetStarted={start} onSignIn={signIn}/>
}
