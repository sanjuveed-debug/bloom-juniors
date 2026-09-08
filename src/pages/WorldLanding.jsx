import AppUpdateNotice from '../components/AppUpdateNotice.jsx'
import React, { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import BloomLogo from '../components/BloomLogo'
import YaagviCharacter from '../components/YaagviCharacter'
import WonderJournal from '../components/WonderJournal'
import '../world-preview.css'

const BUDDIES = [{id:'fox',name:'Pip',label:'Pip the fox',clue:'A careful little observer.'},{id:'bird',name:'Wren',label:'Wren the songbird',clue:'A friend for curious listeners.'}]

const PLACES = [
  { id: 'count', number: '01', name: 'Counting Cove', skill: 'Numbers & noticing', line: 'Small numbers. Big “I did it!” moments.', icon: '123', title: 'How many stars can you count?', instruction: 'Touch each star once. Then choose how many.', options: ['3', '4', '5'], answer: '4', feedback: 'Four stars! Touching each one helps you count it once.', together: 'Find four things nearby. What happens if you take one away?' },
  { id: 'listen', number: '02', name: 'Listening Grove', skill: 'Listening & language', line: 'Listen closely. There is a clue in every sound.', icon: 'Aa', title: 'Who says “meow”?', instruction: 'Say the sound together: meow. Which animal could it be?', options: ['A dog', 'A cat', 'A duck'], answer: 'A cat', feedback: 'A cat! You connected a sound with the animal that makes it.', together: 'Take turns making an animal sound. Can someone else guess it?' },
  { id: 'story', number: '03', name: 'Story Cottage', skill: 'Stories & understanding', line: 'A little story. A new way to see the world.', icon: 'Ab', title: 'What should Mira bring?', instruction: 'Mira planted a seed in a pot. She put it by the sunny window. The soil felt dry.', options: ['A watering can', 'A hat', 'A storybook'], answer: 'A watering can', feedback: 'Water helps the seed grow. The dry soil was the clue in our story.', together: 'Look at a plant together. What do you notice about its leaves and soil?' },
]

function DiscoveryDialog({ place, buddy, onClose, onComplete }) {
  const dialogRef = useRef(null)
  const [counted, setCounted] = useState([])
  const [answer, setAnswer] = useState(null)
  const [audioNote, setAudioNote] = useState('')
  const [hint, setHint] = useState(false)
  const solved = answer === place.answer
  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = oldOverflow
      window.speechSynthesis?.cancel()
      if (dialog.open) dialog.close()
    }
  }, [])
  const choose = value => {
    if (solved) return
    setAnswer(value)
    if (value === place.answer) onComplete(place.id)
  }
  const hear = () => {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      setAudioNote('Voice is unavailable here. Read the words together instead.')
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(`${place.title} ${place.instruction}`)
    utterance.lang = 'en-GB'
    utterance.rate = 0.85
    utterance.onerror = () => setAudioNote('Voice could not play. You can read the words together.')
    window.speechSynthesis.speak(utterance)
    setAudioNote('You can also read the words together.')
  }
  return <dialog ref={dialogRef} className="wonder-dialog" aria-labelledby="discovery-title" onClose={() => { if (!dialogRef.current?.open) onClose() }} onClick={event => { if (event.target === event.currentTarget) dialogRef.current.close() }}>
    <button className="wonder-close" aria-label="Close activity" onClick={() => dialogRef.current.close()}>×</button>
    <aside className="discovery-buddy"><span className="wonder-label">YOUR LITTLE LEARNING GUIDE</span><div className="discovery-character"><YaagviCharacter state={solved ? 'celebrate' : answer ? 'think' : 'wave'} size="100%"/></div><h2>Hello, explorer.</h2><p>{solved ? 'Look what you discovered!' : 'Let’s take our time and discover it together.'}</p><span className="discovery-place">{place.name}</span><button className="buddy-hint" onClick={() => setHint(value => !value)} aria-expanded={hint}><span className={`sidekick sidekick-${buddy.id}`} aria-hidden="true"/><span>{hint ? 'Hide our clue' : `Ask ${buddy.name} for a clue`}</span></button></aside>
    <section className="discovery-work"><p className="wonder-label">{place.skill}</p><h2 id="discovery-title">{place.title}</h2><p className={place.id === 'story' ? 'discovery-story' : ''}>{place.instruction}</p>
      {place.id === 'count' && <div className="wonder-stars" role="group" aria-label="Stars to count">{[0,1,2,3].map(index => <button key={index} aria-label={`Star ${index + 1}`} aria-pressed={counted.includes(index)} onClick={() => setCounted(previous => previous.includes(index) ? previous : [...previous,index])}><span aria-hidden="true">★</span>{counted.includes(index) && <small>{counted.indexOf(index) + 1}</small>}</button>)}</div>}
      {place.id === 'listen' && <button className="wonder-hear" onClick={hear}>Hear the question <span aria-hidden="true">♪</span></button>}
      {hint && <p className="buddy-clue" role="status">{place.id === 'count' ? 'Touch a star and say one number. Give every star its own number.' : place.id === 'listen' ? 'Picture an animal with whiskers that can purr.' : 'Read the last sentence again. What does dry soil need?'}</p>}
      <div className="wonder-options" role="group" aria-label="Choose an answer">{place.options.map(value => <button key={value} disabled={solved} className={solved && value === place.answer ? 'is-right' : ''} onClick={() => choose(value)}>{value}{solved && value === place.answer && <span aria-hidden="true"> ✓</span>}</button>)}</div>
      <div className="wonder-feedback" role="status">{solved ? place.feedback : answer ? 'Have another look at the clues. You can try again.' : 'No rush. A little thinking goes a long way.'}{audioNote && <small>{audioNote}</small>}</div>
      {solved && <div className="wonder-together"><strong>A discovery for your field journal</strong><p>{place.together}</p></div>}
      <button className={solved ? 'wonder-primary' : 'wonder-quiet'} onClick={() => dialogRef.current.close()}>{solved ? 'Back to our world →' : 'Back to the map'}</button>
    </section>
  </dialog>
}

export default function WorldLanding({ preview = false, onGetStarted, onSignIn }) {
  const [active, setActive] = useState(null)
  const [greeting, setGreeting] = useState(0)
  const [visited, setVisited] = useState([])
  const [buddy, setBuddy] = useState(BUDDIES[0])
  const [journalOpen, setJournalOpen] = useState(false)
  const [starlight, setStarlight] = useState(false)
  const [valley, setValley] = useState(false)
  const complete = visited.length === PLACES.length
  const house = complete && !valley
  const reducedMotion = useReducedMotion()
  const open = place => setActive(place)
  const moveWorld = event => {
    if (reducedMotion || event.pointerType !== 'mouse') return
    const bounds = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--world-x', `${((event.clientX - bounds.left) / bounds.width - .5) * 9}px`)
    event.currentTarget.style.setProperty('--world-y', `${((event.clientY - bounds.top) / bounds.height - .5) * 6}px`)
  }
  return <div className={`wonder-page ${preview ? 'is-preview' : 'is-production'}`}>
    <div className="wonder-preview-note">{preview ? <>A new Bloom experience · Design preview <a href="https://bloomjuniors.com/">Current website ↗</a></> : 'Made for curious children. And the grown-ups beside them.'}</div>
    <a className="wonder-skip" href="#wonder-main">Skip to content</a>
    <header className="wonder-header"><a href="#" aria-label="Bloom Juniors home"><BloomLogo/></a><nav aria-label="Main navigation"><a href="#explore">The world</a><a href="#parents">For parents</a><a href="#our-story">Our story</a></nav><div className="wonder-header-actions">{!preview && <><button className="wonder-sign-in" onClick={onSignIn}>Sign in</button><button className="wonder-start-free" onClick={() => onGetStarted?.('navigation')}>Start free</button></>}<button className="journal-open" aria-label={`Our journal, ${visited.length} discoveries`} onClick={() => setJournalOpen(true)}><span aria-hidden="true">▤</span><span className="journal-nav-label">Our journal</span><span className="journal-count">{visited.length}</span></button></div></header>
    <AppUpdateNotice /><main id="wonder-main">
      <section className={`wonder-world ${starlight ? 'is-starlight' : ''} ${house ? 'is-wonder-house' : ''}`} id="explore" onPointerMove={moveWorld} onPointerLeave={event => { event.currentTarget.style.setProperty('--world-x','0px'); event.currentTarget.style.setProperty('--world-y','0px') }} aria-label="Explore Bloom's learning world">
        <img className="wonder-landscape" src={house ? '/dream-projects/rainbow-treehouse-complete-v2.webp' : '/yaagvi-secret-world.webp'} width="1600" height="900" fetchPriority="high" alt={house ? 'Our Wonder House, a treehouse with a rainbow slide' : 'A storybook landscape with a river, woodland and a little cottage'}/>
        <div className="wonder-world-shade"/>
        <div className="world-atmosphere" aria-hidden="true">{Array.from({length:18},(_,index) => <span key={index} style={{left:`${18 + (index * 17) % 79}%`,top:`${6 + (index * 13) % 55}%`}}>✦</span>)}</div>
        <div className="world-toolbar"><button className="world-light-switch" aria-pressed={starlight} onClick={() => setStarlight(value => !value)}><span aria-hidden="true">{starlight ? '☾' : '☀'}</span> {starlight ? 'Starlight' : 'Daylight'}<span className="light-switch-track" aria-hidden="true"/></button>{complete && <button className="world-location-switch" onClick={() => setValley(value => !value)}>{house ? 'Visit the valley' : 'Our Wonder House'} ↗</button>}</div>
        <div className="wonder-hero-copy"><p className="wonder-label">BIG CURIOSITY STARTS SMALL · AGES 3–9</p><h1>{house ? <>Look what<br/>we discovered<br/>{' '}<em>together.</em></> : <>A little wonder.<br/>A world to<br/>{' '}<em>explore.</em></>}</h1><p>{house ? <>A number. A sound. A little story.<br/>A whole conversation to take home.</> : <>Help Bumi fill our field journal.<br/>A number, a sound, and a little story.</>}</p>{!preview ? <a className="wonder-primary" href="/play">Play the picnic free <span aria-hidden="true">&#8594;</span></a> : <button className="wonder-primary" onClick={() => house ? setJournalOpen(true) : open(PLACES.find(place => !visited.includes(place.id)) || PLACES[0])}>{house ? 'Open our discoveries' : visited.length ? 'Continue our adventure' : 'Begin a little adventure'} <span aria-hidden="true">→</span></button>}<span className="wonder-hero-note">No account. No timer. Just a little curiosity.</span><div className="choose-sidekick"><span>WHO’S COMING ALONG?</span><div role="group" aria-label="Choose a sidekick">{BUDDIES.map(item => <button key={item.id} aria-pressed={buddy.id === item.id} onClick={() => setBuddy(item)}><span className={`sidekick sidekick-${item.id}`} role="img" aria-label={item.label}/><span>{item.name}<small>{item.id === 'fox' ? 'The noticer' : 'The listener'}</small></span>{buddy.id === item.id && <span className="sidekick-check" aria-hidden="true">✓</span>}</button>)}</div></div></div>
        <div className="wonder-map-pins" aria-label="Choose a place to explore">{PLACES.map(place => <button className={`wonder-pin pin-${place.id}`} key={place.id} onClick={() => open(place)} aria-label={`Explore ${place.name}${visited.includes(place.id) ? ', discovered' : ''}`}><span className="wonder-pin-dot" aria-hidden="true">{visited.includes(place.id) ? '✓' : place.icon}</span><span className="wonder-pin-name">{place.name}<small>{visited.includes(place.id) ? 'Discovered together' : 'Tap to discover'}</small></span></button>)}</div>
        <div className="wonder-guide-card"><div><button type="button" className="wonder-bumi-hello" aria-label="Say hello to Bumi" onClick={() => setGreeting(value => value + 1)}><YaagviCharacter reactionKey={`${visited.length}-${greeting}`} state={complete ? 'celebrate' : 'wave'} size="100%"/></button></div><p><strong>{house ? 'Welcome to our Wonder House!' : greeting ? 'Hello, explorer! Good to see you.' : `Bumi and ${buddy.name} are ready. Are you?`}</strong><span>{house ? 'A special place to look back at what we noticed.' : buddy.clue + ' Pick a place to explore.'}</span></p></div>
        <span className="wonder-map-label">THE WORLD OF BLOOM / OUR FIRST ADVENTURE</span>
      </section>
      <div className="world-discovery-ribbon" role="status"><span>{complete ? 'Our Wonder House is ready.' : 'A world that grows with every discovery.'}</span><button onClick={() => setJournalOpen(true)}>{visited.length ? `${visited.length} ${visited.length === 1 ? 'discovery' : 'discoveries'} in our journal` : 'Open our field journal'} →</button></div>
      <section className="wonder-path" aria-label="Three sample adventures">{PLACES.map(place => <button key={place.id} onClick={() => open(place)}><span className="wonder-path-number">{place.number}</span><span><strong>{place.name}</strong><small>{place.skill}</small></span><span className="wonder-path-arrow" aria-hidden="true">↗</span></button>)}</section>
      <section className="wonder-parent-section wonder-shell" id="parents"><div className="wonder-parent-copy"><p className="wonder-label">THE WONDER HAS A PURPOSE</p><h2>They see an adventure.<br/><em>You see them learning.</em></h2><p>Behind every little moment is something to practise: listening carefully, counting one by one, or finding a clue in a story.</p><p>Bloom brings phonics, reading, maths and discovery into activities you can explore together. You choose their age group and see their activity from your parent account.</p><div className="wonder-parent-facts"><span><strong>3–9</strong>Years of curiosity</span><span><strong>No ads</strong>Room to focus</span><span><strong>Together</strong>A grown-up welcome</span></div><div className="wonder-parent-entry">{preview ? <a className="wonder-inline-link" href="https://bloomjuniors.com/">Explore the current Bloom app →</a> : <><button className="wonder-primary" onClick={() => onGetStarted?.('parents')}>Create a free parent account →</button><p>Start free without a payment card. Optional paid plans are available.</p><a href="/schools">Explore Bloom for schools ↗</a></>}</div></div><div className="wonder-product"><div className="wonder-product-background"/><figure><img src="/screens/app-activity.png" alt="Inside Bloom: a Counting Falls activity asking a child to count two penguins" width="390" height="844" loading="lazy"/><figcaption>A real activity inside Bloom</figcaption></figure><div className="wonder-product-note"><span>THE LITTLE MOMENT THAT MATTERS</span><strong>Small steps.<br/>Room to try again.</strong><p>A small discovery to build on.</p></div></div></section>
      <section className="wonder-keepsake"><div className="wonder-shell"><p className="wonder-label">BEYOND THE SCREEN</p><h2>The best part?<br/>What happens <em>afterwards.</em></h2><p>Find four pebbles. Listen for a bird. Ask why a leaf looks different.<br/>A little discovery is a beginning, with a whole world waiting outside.</p><div className="wonder-takeaway"><span aria-hidden="true">↗</span><div><strong>A question for today</strong><p>“What did you notice that you hadn’t noticed before?”</p></div></div></div></section>
      <section className="wonder-founder wonder-shell" id="our-story"><div><img src="/founder.jpg" alt="Sanju, founder of Bloom Juniors" width="96" height="96" loading="lazy"/><p className="wonder-label">BUILT BY A DAD</p><h2>It began with<br/>my daughter.</h2></div><div><p>I started Bloom Juniors for my daughter, Yaagvi. I wanted learning to be something she enjoyed exploring, and something we could talk about together.</p><p>Bumi is the friendly companion who guides children through Bloom. Yaagvi remains the explorer at the heart of our stories. Her curiosity is where it all began.</p><span className="wonder-signature">Sanju</span><small>Founder, Bloom Juniors</small></div></section>
      <section className="wonder-return"><p className="wonder-label">WHERE SHALL WE GO NEXT?</p><h2>A whole world.<br/><em>One little beginning.</em></h2><button className="wonder-primary" onClick={() => open(PLACES.find(place => !visited.includes(place.id)) || PLACES[0])}>{visited.length === 3 ? 'Rediscover a little wonder' : 'Choose your next discovery'} <span aria-hidden="true">→</span></button><p>{visited.length ? `${visited.length} of 3 sample moments explored. ` : ''}This free adventure does not save learning progress.</p><div className="wonder-final-entry">{!preview && <button onClick={() => onGetStarted?.('closing')}>Ready for more? Create a free parent account →</button>}</div></section>
    </main>
    <footer className="wonder-footer wonder-shell"><BloomLogo size="sm"/><p>For curious children. And the grown-ups beside them.</p><a href="https://bloomjuniors.com/privacy">Privacy</a><a href="mailto:hello@bloomjuniors.com">Say hello</a></footer>
    {journalOpen && <WonderJournal places={PLACES} visited={visited} buddy={buddy} onClose={() => setJournalOpen(false)}/>}
    {active && <DiscoveryDialog key={active.id} place={active} buddy={buddy} onClose={() => setActive(null)} onComplete={id => setVisited(previous => previous.includes(id) ? previous : [...previous,id])}/>}
  </div>
}
