import ActivityVoiceControls from '../components/ActivityVoiceControls.jsx'
import { useActivityNarration } from '../hooks/useActivityNarration.js'
import AdventureFinishChoices from '../components/AdventureFinishChoices.jsx'
import { usePlayDrag } from '../hooks/usePlayDrag.js'
import { useEffect, useReducer, useRef, useState } from 'react'
import YaagviCharacter from '../components/YaagviCharacter'
import { useSpeech } from '../preview/usePreviewSpeech'
import { useVisibilityTimers } from '../hooks/useVisibilityTimers'
import { newPicnic, picnicReducer, restorePicnic, PICNIC_ROUNDS, PICNIC_STORAGE_KEY } from '../utils/picnicAdventure'
import './picnic-adventure.css'
import MeetBumi from '../components/MeetBumi'

const artCells = { Pip: 0, Wren: 1, Momo: 2, Bo: 3, plate: 4, basket: 5 }
function Art({ name, className = '' }) {
  const cell = artCells[name]
  return <span aria-hidden="true" className={`picnic-art ${className}`} style={{ backgroundPosition: `${cell % 3 * 50}% ${Math.floor(cell / 3) * 100}%` }} />
}
function load() {
  try { return restorePicnic(localStorage.getItem(PICNIC_STORAGE_KEY)) } catch { return newPicnic() }
}
function Recap({ report, close, connected = false }) {
  const dialog = useRef(null)
  useEffect(() => {
    const element = dialog.current
    const previous = document.activeElement
    if (!element.open) element.showModal()
    return () => { element.close(); if (previous instanceof HTMLElement && previous.isConnected) previous.focus() }
  }, [])
  return <dialog ref={dialog} className="picnic-recap" onCancel={close} aria-labelledby="recap-title">
    <button className="picnic-close" onClick={close} aria-label="Close grown-up recap">×</button>
    <p className="picnic-eyebrow">A NOTE FOR YOUR GROWN-UP</p>
    <h2 id="recap-title">Small plates. A useful idea.</h2><MeetBumi/>
    {report ? <><p>Your child matched one plate to each friend in two arrangements.</p>
      <ul>{report.results.map(r => <li key={r.round}><strong>{r.round === 0 ? 'Four friends' : 'Three friends · new arrangement'}</strong><span>{r.helped ? 'Completed after opening the demonstration' : r.attempts === 1 ? 'Correct on the first submitted answer, without the demonstration' : 'Completed after trying again, without the demonstration'}</span><small>{r.attempts} submitted {r.attempts === 1 ? 'arrangement' : 'arrangements'}</small></li>)}</ul>
      <p>This records this visit only. It does not establish mastery or tell us whether someone helped away from the screen. Replays leave this first recap unchanged.</p></> : <p>Finish both picnic arrangements to see what happened on each attempt.</p>}
    <div className="picnic-home-prompt"><strong>Try it at dinner</strong><p>“Can you put out one spoon for each person? How could we check that everyone has one?”</p></div>
    <p className="picnic-fine">{connected ? "This recap belongs to the selected child profile. Check the sync notice for connection problems." : <>Anonymous preview. Saved only in this browser, not synced to a Bloom account. Hear uses your device’s voice.</>}</p>
    <button className="picnic-primary" onClick={close}>Back to the picnic</button>
  </dialog>
}

export default function PicnicAdventure({ currentState, onAction, onBack, onNext, speech }) {
  const connected = Boolean(onAction)
  const [localState, localDispatch] = useReducer(picnicReducer, undefined, () => connected ? newPicnic() : load())
  const state = currentState || localState
  const dispatch = onAction || localDispatch
  const [selected, setSelected] = useState(false)
  const [recap, setRecap] = useState(false)
  const [saved, setSaved] = useState(true)
  const [hint, setHint] = useState(null)
  const board = useRef(null)
  const heading = useRef(null)
  const timers = useVisibilityTimers()
  const previewSpeech = useSpeech()
  const { speak, stopSpeaking, speaking, primeSpeech } = speech || previewSpeech
  const round = PICNIC_ROUNDS[state.round]
  const celebrating = state.phase === 'celebrate'
  const complete = state.phase === 'complete'
  const active = state.phase === 'play' && hint === null
  const count = state.placements.filter(Boolean).length

  useEffect(() => {
    if (connected) return
    try { localStorage.setItem(PICNIC_STORAGE_KEY, JSON.stringify(state)); setSaved(true) } catch { setSaved(false) }
  }, [state, connected])
  useEffect(() => {
    setSelected(false); setHint(null); dragPlay.cancel()
    timers.clearAll(); stopSpeaking()
    heading.current?.focus({ preventScroll: true })
  }, [state.round, state.phase, timers, stopSpeaking])

  const feedback = state.feedback
  let message = selected ? 'Now tap a place. Tap a plate to put it back.' : 'Tap a plate, then a place. You can drag it, too.'
  if (feedback?.empty) message = 'Take a plate from the basket to get started.'
  else if (feedback && !feedback.correct) {
    const missingNames = feedback.missing.map(i => round.guests[i]).join(', ')
    message = [missingNames && `${missingNames} ${feedback.missing.length === 1 ? 'still needs a plate' : 'still need plates'}.`, feedback.extra.length > 0 && 'Some plates have no friend. Tap them to put them back.'].filter(Boolean).join(' ')
  }
  if (hint !== null) message = `One plate for ${round.guests[hint]}. Each friend needs just one.`
  if (celebrating) message = 'Everyone has one plate. Our picnic can begin!'
  const narration = complete ? 'Find a spoon for each person at dinner. Check together: does everyone have one?' : celebrating ? message : `${round.prompt} ${hint !== null ? 'Watch: each friend gets one plate. Then try it yourself.' : message} When you are ready, tap Ready for our picnic.`

  const voice = useActivityNarration({ cue: `${state.round}-${state.phase}-${state.attempts}-${Boolean(feedback?.empty)}-${hint !== null}`, text: narration, speak, stopSpeaking, primeSpeech })

  function help() {
    dispatch({ type: 'HELP' })
    const seats = round.guests.flatMap((name, i) => name ? [i] : [])
    setHint(seats[0]); setSelected(false)
    seats.slice(1).forEach((seat, i) => timers.track(() => setHint(seat), (i + 1) * 1300))
    timers.track(() => setHint(null), seats.length * 1300)
  }
  const dragPlay = usePlayDrag({enabled:active,scope:board,onDrop:(source,target)=>dispatch({type:source===null?'PLACE':'MOVE',from:source,to:Number(target)})})
  const ghost = dragPlay.ghost
  if (ghost && active) message = dragPlay.over !== null ? `Let go to put the plate here. Is there a friend at this place?` : 'Move the plate to a place at the picnic.'
  const pointers = source => source === null || state.placements[source] ? dragPlay.bind(source) : {}
  const clicked = action => action()


  return <main className="picnic-app">
    <header className="picnic-header">{onBack ? <button className="picnic-brand" onClick={onBack} aria-label="Back to home">bloom<span>juniors</span></button> : <a href="https://child-home-preview.bloom-juniors.pages.dev" className="picnic-brand">bloom<span>juniors</span></a>}<span className="picnic-chapter">YAAGVI'S ADVENTURES <span>/ THE PICNIC</span></span><button onClick={() => setRecap(true)} className="picnic-quiet">For grown-ups ↗</button></header>
    <section className="picnic-world">
      <div className="picnic-topline"><span>THE WILLOW CLEARING</span><span>{state.practice ? 'Play again' : complete ? 'Adventure complete' : `${state.round + 1} of 2 little moments`}</span></div>
      <div className="picnic-title"><div><p className="picnic-eyebrow">{complete ? 'TAKE THE IDEA WITH YOU' : celebrating ? 'LOOK WHAT YOU MADE HAPPEN' : 'THE PICNIC'}</p><h1 ref={heading} tabIndex={-1}>{complete ? 'A place for everyone.' : celebrating ? 'You brought us together!' : round.title}</h1><p>{complete ? 'One friend. One plate. You can do this at home, too.' : celebrating ? 'A little care makes room for every friend.' : round.prompt}</p></div><ActivityVoiceControls voice={voice} /></div>
      {complete ? <div className="picnic-finish"><div className="picnic-finish-friends">{['Pip', 'Wren', 'Momo', 'Bo'].map(name => <Art name={name} key={name} />)}</div><p className="picnic-eyebrow">YOUR NEXT ADVENTURE IS AT HOME</p><h2>Who’s coming to dinner?</h2><p>Find a spoon for each person.<br />Check together: does everyone have one?</p><YaagviCharacter size={130} state="celebrate" autoIdle={1600}/><AdventureFinishChoices nextLabel="Next: Pack the Basket →" onContinue={onNext} onFinish={onBack} onReplay={() => dispatch({type:'REPLAY'})}/><div className="picnic-finish-actions"><button className="picnic-secondary" onClick={() => setRecap(true)}>See our picnic recap ↗</button></div></div> : <div className="picnic-play-layout">
        <div className={`picnic-blanket ${celebrating ? 'is-celebrating' : ''}`} ref={board} role="group" aria-label="Picnic places">
          {round.guests.map((name, i) => <div key={`${state.round}-${i}`} data-play-drop={i} data-drop-active={dragPlay.over === String(i) ? 'true' : undefined} className={`picnic-seat ${!name ? 'is-spare' : ''} ${hint === i ? 'is-hint' : ''} ${feedback?.missing?.includes(i) || feedback?.extra?.includes(i) ? 'needs-look' : ''}`}>
            {name ? <div className="picnic-guest"><Art name={name} /><span>{name}</span></div> : <div className="picnic-spare-label">Spare place</div>}
            <button data-picnic-seat={i} className={`picnic-place ${state.placements[i] ? 'has-plate' : ''}`} disabled={!active} {...pointers(i)} aria-label={`${state.placements[i] ? 'Remove plate from' : 'Place plate at'} ${name ? `${name}'s place` : `spare place ${i + 1}`}`} onClick={() => clicked(() => { if (state.placements[i] || selected) dispatch({ type: 'TOGGLE', to: i }) })}>
              {state.placements[i] || hint === i ? <Art name="plate" className={hint === i && !state.placements[i] ? 'picnic-demo-plate' : ''} /> : <span>{selected ? '+' : 'Place here'}</span>}
            </button>
          </div>)}
        </div>
        <aside className="picnic-tools">
          <div className="picnic-guide"><YaagviCharacter attentionTarget={ghost ? { x: ghost.x, y: ghost.y } : null} talking={speaking} size={112} reactionKey={`${state.round}-${state.attempts}-${hint}`} state={celebrating ? 'celebrate' : hint !== null || ghost ? 'point' : feedback && !feedback.correct ? 'think' : 'idle'} atlasSrc="/yaagvi/reactions-atlas-transparent-v2.webp" /><p role="status" aria-live="polite">{message}</p></div>
          {!celebrating && <><button className={`picnic-bank ${selected ? 'is-selected' : ''}`} disabled={!active} aria-pressed={selected} {...pointers(null)} onClick={() => clicked(() => setSelected(!selected))}><Art name="plate" /><span>{selected ? 'Plate selected' : 'Take a plate'}<small>{count} {count === 1 ? 'plate' : 'plates'} on the blanket</small></span></button><button className="picnic-primary" disabled={!active} onClick={() => dispatch({ type: 'SUBMIT' })}>Ready for our picnic ✓</button><button className="picnic-help" disabled={!active} onClick={help}>{hint !== null ? 'One for each friend…' : 'Show me how'}</button></>}
          {celebrating && <><Art name="basket" className="picnic-success-basket" /><button className="picnic-primary" onClick={() => dispatch({ type: 'NEXT' })}>{state.round === 0 ? 'A new picnic →' : 'Take the idea home →'}</button></>}
        </aside>
      </div>}
      <footer className="picnic-footer"><span>No hurry. There’s time to work it out.</span><span>{connected ? 'Progress follows this child profile' : saved ? 'Saved in this browser' : 'Saving unavailable — keep this tab open'}</span></footer>
    </section>
    <p className="picnic-preview-note">The Picnic · {connected ? 'A learning adventure' : 'playable preview'} · ages 4–6</p>
    {ghost && <div className="picnic-drag-ghost" style={{ left: ghost.x, top: ghost.y }}><Art name="plate" /></div>}
    {recap && <Recap connected={connected} report={state.report} close={() => setRecap(false)} />}
  </main>
}
