import { useEffect, useRef } from 'react'
import './adventure-finish-choices.css'

export default function AdventureFinishChoices({ nextLabel, onContinue, onFinish, onReplay, replayLabel = 'Play again' }) {
  const heading = useRef(null)
  useEffect(() => { heading.current?.focus({ preventScroll: true }); heading.current?.scrollIntoView({ block: 'nearest' }) }, [])
  return <section className="adventure-finish-choices" aria-label="Choose what happens next">
    <h3 ref={heading} tabIndex={-1}>A little discovery is a good place to pause.</h3>
    <p>Keep exploring if you like, or take your idea into the real world.</p>
    <div className="adventure-finish-buttons">
      {onContinue && <button className="adventure-finish-next" onClick={onContinue}>{nextLabel}</button>}
      {onFinish && <button className="adventure-finish-stop" onClick={onFinish}>Finish for now</button>}
    </div>
    {onReplay && <button className="adventure-finish-replay" onClick={onReplay}>{replayLabel}</button>}
  </section>
}
