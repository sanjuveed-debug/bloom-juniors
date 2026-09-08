import AdventureFinishChoices from '../components/AdventureFinishChoices.jsx'
import { useEffect, useState } from 'react'
import YaagviCharacter from '../components/YaagviCharacter.jsx'
import { useSpeech } from '../hooks/useSpeech.js'
import { applyCollectionAction, normalizeCollection, COLLECTION_ADVENTURES } from '../utils/collectionAdventure.js'
import './tiny-picnic.css'

const config = COLLECTION_ADVENTURES.tiny
export function PicnicObject({ kind, colour = '#e8ad45', mat = false }) {
  return <svg className="tiny-object" viewBox="0 0 160 160" aria-hidden="true">
    {kind === 'plate' ? <><ellipse cx="80" cy="135" rx="54" ry="9" fill="#203e3220"/><circle cx="80" cy="76" r="60" fill={mat ? '#fffcf3' : colour} stroke={mat ? '#527565' : '#fff7df'} strokeWidth="5" strokeDasharray={mat ? '8 6' : undefined}/><circle cx="80" cy="76" r="43" fill="none" stroke={mat ? '#527565' : '#ffffff80'} strokeWidth="4"/></> : <><ellipse cx="80" cy="139" rx="55" ry="8" fill="#203e3220"/><rect x="23" y="19" width="114" height="114" rx="5" fill={mat ? '#fffcf3' : colour} stroke={mat ? '#527565' : '#fff7df'} strokeWidth="5" strokeDasharray={mat ? '8 6' : undefined}/><path d="M34 30H126V122H34Z" fill="none" stroke={mat ? '#527565' : '#ffffff80'} strokeWidth="3"/>{!mat && <path d="M105 133L137 101V133Z" fill="#ffffff70"/>}</>}
  </svg>
}

export function TinyHome({ profileName, progress, onPlay, onExplore, onParents, onSwitchProfiles }) {
  const [journal, setJournal] = useState(false)
  const { speak, speaking, stopSpeaking, primeSpeech } = useSpeech()
  const { state, updatedAt } = normalizeCollection(progress.collectionAdventures?.tiny, 'tiny')
  const resume = updatedAt > 0 && state.phase !== 'complete'
  return <main className="tiny-page"><div className="tiny-shell">
    <header className="tiny-nav"><span className="tiny-brand">bloom<span> Tiny Stars</span></span><div><button onClick={onSwitchProfiles} aria-label="Switch profiles">Profiles</button>{onParents && <button onClick={onParents}>Parents</button>}</div></header>
    <section className="tiny-home">
      <p className="tiny-eyebrow">A LITTLE DISCOVERY WITH BUMI</p><h1>{journal ? 'Look what you found!' : `Hello, ${profileName || 'little explorer'}!`}</h1>
      {journal ? <div className="tiny-journal"><div className="tiny-still-life"><PicnicObject kind="plate"/><PicnicObject kind="napkin" colour="#df8469"/></div><h2>{state.report ? 'Round edges. Four corners.' : 'Your picnic is waiting.'}</h2><p>{state.report ? 'You matched and sorted our picnic shapes. Can you spot them at home?' : 'Play with Bumi to make your first discovery here.'}</p><button className="tiny-primary" onClick={() => setJournal(false)}>Back to play</button></div> : <>
        <div className="tiny-home-scene"><span className="tiny-sun" aria-hidden="true"/><div className="tiny-companion"><YaagviCharacter size={210} state={speaking ? 'talk' : 'idle'} talking={speaking}/></div><div className="tiny-still-life"><PicnicObject kind="plate"/><PicnicObject kind="napkin" colour="#df8469"/></div></div>
        <h2>Bumi's picnic shapes</h2><p>Can you find one like mine?</p>
        <button className="tiny-primary" onClick={() => { primeSpeech(); onPlay() }}><span aria-hidden="true">▶ </span>{resume ? 'Keep playing' : state.report ? 'Play again' : 'Let’s play'}</button>
        <button className="tiny-voice" onClick={() => speaking ? stopSpeaking() : speak('Hello! Can you find one like mine? Tap the big play button to join my picnic.')} aria-label={speaking ? 'Stop voice' : 'Hear Bumi'}>{speaking ? '■ Stop voice' : '♫ Hear Bumi'}</button>
      </>}
    </section>
    <nav className="tiny-bottom" aria-label="Tiny Stars activities"><button onClick={onExplore}><span aria-hidden="true">◒</span>Explore</button><button onClick={() => setJournal(j => !j)}><span aria-hidden="true">▤</span>{journal ? 'Home' : 'My discoveries'}</button></nav>
  </div></main>
}

export default function TinyPicnic({ progress, update, onBack, onExplore }) {
  const { state } = normalizeCollection(progress.collectionAdventures?.tiny, 'tiny')
  const round = config.rounds[state.round]
  const [demonstrating, setDemonstrating] = useState(false)
  const [voiceOn, setVoiceOn] = useState(true)
  const { speak, speaking, stopSpeaking } = useSpeech()
  const success = state.phase === 'celebrate', complete = state.phase === 'complete'
  let message = round.instruction
  if (state.feedback === 'retry') message = round.object === 'plate' ? 'That has corners. Look for the round edge.' : 'That is round. Look for four corners.'
  if (success) message = round.object === 'plate' ? 'Yes! A round edge, just like our plate.' : 'Yes! Four corners, just like our napkin.'
  if (demonstrating) message = round.object === 'plate' ? 'Follow the round edge. This one matches.' : 'Look at these four corners. This one matches.'
  if (complete) message = 'You found our picnic shapes! Find a plate and a napkin with your grown-up.'
  const dispatch = action => { const at = Date.now(); update(p => applyCollectionAction(p, 'tiny', action, at)) }
  useEffect(() => { if (voiceOn) speak(message) }, [message, voiceOn, speak])
  const next = () => { setDemonstrating(false); dispatch({ type: 'NEXT' }) }
  return <main className="tiny-page"><div className="tiny-shell">
    <header className="tiny-nav"><button onClick={onBack} aria-label="Back to Tiny Stars home">← Home</button><span className="tiny-brand">Picnic shapes</span><button aria-label={voiceOn ? 'Mute narration' : 'Enable narration'} aria-pressed={!voiceOn} onClick={() => { if (voiceOn) stopSpeaking(); setVoiceOn(v => !v) }}>{voiceOn ? '♫ On' : '♫ Off'}</button></header>
    <section className="tiny-game">
      <div className="tiny-progress" aria-label={`${complete ? 4 : state.round} of 4 turns discovered`}>{config.rounds.map((_, i) => <span key={i} className={complete || i < state.round || (i === state.round && success) ? 'found' : ''}/>)}</div>
      <div className="tiny-guide"><YaagviCharacter size={105} state={success || complete ? 'celebrate' : demonstrating ? 'point' : state.feedback === 'retry' ? 'think' : 'idle'} reactionKey={`${state.round}-${state.attempts}-${demonstrating}`} talking={speaking}/><div><h1>{complete ? 'Our picnic is ready!' : round.title}</h1><p role="status" aria-live="polite">{message}</p></div></div>
      {complete ? <div className="tiny-finish"><div className="tiny-still-life"><PicnicObject kind="plate"/><PicnicObject kind="napkin" colour="#df8469"/></div><h2>Try it together</h2><p>{config.prompt}</p><AdventureFinishChoices nextLabel="Choose another activity" onContinue={() => { stopSpeaking(); onExplore?.() }} onFinish={() => { stopSpeaking(); onBack() }} onReplay={() => { setDemonstrating(false); dispatch({type:'REPLAY'}) }}/></div> : <>
        <div className="tiny-target"><PicnicObject kind={round.object} colour={round.colour}/><span>{round.mode === 'match' ? 'Find one like mine' : 'Where does it belong?'}</span></div>
        <div className="tiny-choices" aria-label={round.mode === 'match' ? 'Choose a matching object' : 'Choose a shape mat'}>{round.labels.map((kind, i) => <button key={kind} aria-label={round.mode === 'sort' ? `${kind === 'plate' ? 'Round' : 'Square'} mat` : `Choose ${kind}`} className={`${demonstrating && round.targets[i] ? 'tiny-hint' : ''} ${success && round.targets[i] ? 'tiny-matched' : ''}`} disabled={success || demonstrating} onClick={() => dispatch({type:'CHOOSE',index:i})}><PicnicObject kind={kind} colour={round.colour} mat={round.mode === 'sort'}/>{round.mode === 'sort' && success && round.targets[i] === 1 && <span className="tiny-sorted"><PicnicObject kind={round.object} colour={round.colour}/></span>}<span className="tiny-choice-label">{success && round.targets[i] ? '✓ ' : ''}{round.mode === 'sort' ? kind === 'plate' ? 'Round' : 'Square' : kind === 'plate' ? 'Plate' : 'Napkin'}</span></button>)}</div>
        <div className="tiny-game-actions">{success ? <button className="tiny-primary" onClick={next}>{state.round === 3 ? 'Our picnic is ready ★' : 'Next picture →'}</button> : demonstrating ? <button className="tiny-primary" onClick={() => setDemonstrating(false)}>My turn →</button> : <button className="tiny-help" onClick={() => { dispatch({type:'HELP'}); setDemonstrating(true) }}>☝ Show me</button>}
        <button className="tiny-voice" aria-label="Hear this instruction" onClick={() => speak(message)}>♫ Hear again</button></div>
      </>}
    </section>
  </div></main>
}
