import { COLLECTION_ADVENTURES, getAdventurePath } from '../utils/collectionAdventure.js'
import '../modules/collection-adventure.css'
import React, { useState } from 'react'
import BloomLogo from './BloomLogo.jsx'
import YaagviCharacter from './YaagviCharacter.jsx'
import { useSpeech } from '../hooks/useSpeech.js'
import './simple-child-home.css'

export const CHILD_ACTIVITIES = [
  { id: 'float-discovery', category: 'Discovery', name: 'Will it float?', symbol: '\u2248', color: 'blue', image: '/yaagvi-secret-world.webp', note: 'Guess. Drop. Discover with Bumi.', prompt: 'Can the same clay sink and float?' },
  { id: 'shadow-discovery', category: 'Discovery', name: 'Change a shadow', symbol: '◐', color: 'blue', image: '/yaagvi-secret-world.webp', note: 'Move the torch. Watch the wall.', prompt: 'Can you make a tiny card cast a big shadow?' },
  ...Object.entries(COLLECTION_ADVENTURES).filter(([, config]) => !config.ageGroup).map(([id, config]) => ({ id, category: 'Numbers', name: config.title, symbol: id === 'basket' ? '2' : '3', color: 'green', image: '/yaagvi-secret-world.webp', note: config.idea, prompt: config.prompt })),
  { id: 'picnic', category: 'Numbers', name: 'The Picnic', symbol: '123', color: 'ochre', image: '/yaagvi-secret-world.webp', note: 'One friend. One plate. A place for everyone.', prompt: 'Can you put out one spoon for each person at dinner?' },
  { id: 'phonics', category: 'Sounds', name: 'Sound Pop', symbol: 'Aa', color: 'rose', image: '/sound-pop-map-3d-v1.webp', note: 'Listen. Find the sound.', prompt: 'What else starts with a sound you heard?' },
  { id: 'math', category: 'Numbers', name: 'Number World', symbol: '123', color: 'ochre', image: '/yaagvi-secret-world.webp', note: 'Count a little collection.', prompt: 'Can you count the spoons as we set the table?' },
  { id: 'story', category: 'Stories', name: 'Story Room', symbol: 'Ab', color: 'green', image: '/stories/yaagvi-explorer/page-1.png', note: 'Find a story to share.', prompt: 'What happened first, and what happened next?' },
  { id: 'shapes', category: 'Discovery', name: 'Shape World', symbol: '◇', color: 'blue', image: '/dream-projects/rainbow-treehouse-complete-v2.webp', note: 'Look at shapes all around us.', prompt: 'Which shapes can you find in this room?' },
  { id: 'logic', category: 'Discovery', name: 'Puzzle Quest', symbol: '↗', color: 'purple', image: '/yaagvi-secret-world.webp', note: 'Plan a path. Try it out.', prompt: 'How did you choose which way to go?' },
]

function NavIcon({ name }) {
  const paths = { home: 'M3 10 12 3l9 7v11h-6v-7H9v7H3Z', explore: 'm21 3-6 12-12 6L9 9Z M9 9l6 6', discoveries: 'M3 4h7l2 2 2-2h7v16h-7l-2 2-2-2H3Z M12 6v16' }
  return <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]}/></svg>
}

export default function SimpleChildHome({ profileName = 'Explorer', nextId = 'phonics', sessions = [], onLaunch, onParents, onSwitchProfiles, onMoreActivities, connected = false, hasPicnic = false, progress = {} }) {
  const [tab, setTab] = useState('home')
  const [greeting, setGreeting] = useState(0)
  const [category, setCategory] = useState('All')
  const { speak, stopSpeaking, speaking } = useSpeech()
  const activities = CHILD_ACTIVITIES.filter(item => connected || !COLLECTION_ADVENTURES[item.id])
  const path = getAdventurePath(progress)
  const next = activities.find(item => item.id === nextId) || activities[0]
  const resuming = path.find(step => step.id === next.id)?.inProgress || (next.id === 'picnic' && progress.picnic?.updatedAt > 0 && !hasPicnic)
  const discoveries = activities.filter(item => COLLECTION_ADVENTURES[item.id] ? Boolean(progress.collectionAdventures?.[item.id]?.state?.report) : item.id === 'picnic' ? hasPicnic : sessions.some(session => session.module === item.id && !['picnic-first', 'basket-first', 'snacks-first'].includes(session.activityId)))
  const changeTab = value => { stopSpeaking(); setTab(value); window.scrollTo({ top: 0, behavior: 'instant' }) }
  const launch = (id, guided) => { stopSpeaking(); onLaunch(id, guided) }
  return <div className="child-home">
    <header className="child-header">
      <button className="child-logo" aria-label="Bloom home" onClick={() => changeTab('home')}><BloomLogo/></button>
      <nav className="child-nav" aria-label="Child navigation">{[['home', 'Home'], ['explore', 'Explore'], ['discoveries', 'My discoveries']].map(([id, label]) => <button key={id} onClick={() => changeTab(id)} aria-current={tab === id ? 'page' : undefined}><NavIcon name={id}/><span>{label}</span></button>)}</nav>
      {onSwitchProfiles && <button className="child-parent" onClick={onSwitchProfiles}>Switch child</button>}
      <button className="child-parent" onClick={onParents}><svg width="17" height="20" viewBox="0 0 20 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="10" width="14" height="11" rx="3"/><path d="M6 10V7a4 4 0 0 1 8 0v3M10 14v3"/></svg> Parents</button>
    </header>
    <main className="child-main" id="child-main">
      {tab === 'home' && <>
        <div className="child-greeting"><div><p className="child-eyebrow">YOUR LITTLE CORNER OF BLOOM</p><h1>Hello, {profileName}.</h1></div><span className="child-age">Little Stars <span>4–6 years</span></span></div>
        <section className="child-adventure" aria-label="Your next activity">
          <img className="child-landscape" src="/yaagvi-secret-world.webp" alt=""/>
          <div className="child-mission">
            <span className="child-kicker">{sessions.length ? 'LET’S KEEP EXPLORING' : 'A GOOD PLACE TO BEGIN'}</span>
            <span className={`child-subject ${next.color}`} aria-hidden="true">{next.symbol}</span>
            <h2>{next.name}</h2><p>{next.note}</p>
            <button className="child-start" onClick={() => launch(next.id, true)}>{resuming ? 'Continue adventure' : next.id === 'picnic' ? 'Play with Bumi' : sessions.length ? 'Continue adventure' : 'Let’s play'} <span aria-hidden="true">→</span></button>
            <button className="child-listen" onClick={() => speaking ? stopSpeaking() : speak(`Hello ${profileName}. Let's try ${next.name}. ${next.note} Tap the big green button to begin.`)}>{speaking ? '■ Stop listening' : '♫ Hear Bumi'}</button>
          </div>
          <div className="child-guide"><span className="child-speech">{greeting ? 'Hello, explorer!' : 'Ready when you are.'}<br/>{greeting ? 'Good to see you.' : next.name}</span><button className="child-bumi-hello" aria-label="Say hello to Bumi" onClick={() => setGreeting(value => value + 1)}><YaagviCharacter reactionKey={greeting} state={greeting ? "wave" : "idle"} talking={speaking} size="100%"/></button></div>
        </section>
        {connected && <nav className="adventure-path" aria-label="Your picnic adventure path">{path.map((step, i) => <button key={step.id} aria-current={next.id === step.id ? 'step' : undefined} onClick={() => launch(step.id, true)}><b>{step.completed ? '✓' : i + 1}</b><span>{activities.find(a => a.id === step.id)?.name}<small>{step.inProgress ? 'Continue exploring' : step.completed ? 'Discover again' : 'Ready to explore'}</small></span></button>)}</nav>}
        <div className="child-below"><p><span aria-hidden="true">✦</span> One activity is a lovely start. Take your time.</p><button onClick={() => changeTab('explore')}>Choose something else <span aria-hidden="true">↗</span></button></div>
      </>}
      {tab === 'explore' && <>
        <div className="child-greeting"><div><p className="child-eyebrow">FOLLOW YOUR CURIOSITY</p><h1>What shall we try?</h1><p className="child-subtitle">Pick a picture. Let’s see what happens.</p></div></div>
        {onMoreActivities && <button className="child-parent" onClick={onMoreActivities}>All Bloom activities ↗</button>}
        <div className="child-filters" aria-label="Activity categories">{['All', 'Sounds', 'Numbers', 'Stories', 'Discovery'].map(value => <button key={value} aria-pressed={category === value} onClick={() => setCategory(value)}>{value}</button>)}</div>
        <div className="child-library">{activities.filter(item => category === 'All' || item.category === category).map(item => <button key={item.id} className={`child-activity ${item.color}`} onClick={() => launch(item.id, false)}><div className="child-tile-art"><img src={item.image} alt="" loading="lazy"/><span>{item.symbol}</span></div><div className="child-tile-label"><p>{item.category}</p><h2>{item.name}</h2><span>{item.note}</span><b aria-hidden="true">↗</b></div></button>)}</div>
      </>}
      {tab === 'discoveries' && <>
        <div className="child-greeting"><div><p className="child-eyebrow">THINGS WE’VE EXPLORED</p><h1>My discoveries</h1><p className="child-subtitle">Little moments worth remembering.</p></div></div>
        {discoveries.length === 0 ? <section className="child-empty"><div className="child-empty-guide"><YaagviCharacter state="point" size="100%"/></div><div><p className="child-kicker">YOUR STORY STARTS HERE</p><h2>What will you discover first?</h2><p>Finish an activity and it will appear here.</p><button className="child-start" onClick={() => launch(next.id, true)}>Try {next.name} <span aria-hidden="true">→</span></button></div></section> : <div className="child-journal">{discoveries.map(item => <article key={item.id}><span className={`child-subject ${item.color}`}>{item.symbol}</span><p className="child-kicker">EXPLORED TOGETHER</p><h2>{item.name}</h2><p>{item.prompt}</p><button onClick={() => launch(item.id, false)}>Explore again →</button></article>)}</div>}
        <p className="child-footnote">{connected ? 'Activities completed by this child. Find the details in Parents.' : 'Discoveries from this preview visit. They reset when you reload.'}</p>
      </>}
    </main>
  </div>
}
