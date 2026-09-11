import { useEffect, useRef } from 'react'
import { captureAndGetUtm, trackEventOnce } from '../utils/analytics.js'

export default function useSampleFunnel(sample, started, complete) {
  const initial = useRef({ started: Boolean(started), complete: Boolean(complete) })
  useEffect(() => {
    captureAndGetUtm()
    trackEventOnce(`sample-view:${sample}`, 'sample_view', { sample, returning: initial.current.started, already_complete: initial.current.complete })
  }, [sample])
  useEffect(() => {
    if (started && !initial.current.started) trackEventOnce(`sample-start:${sample}`, 'sample_start', { sample })
    if (complete && !initial.current.complete) trackEventOnce(`sample-complete:${sample}`, 'sample_complete', { sample })
  }, [sample, started, complete])
}
