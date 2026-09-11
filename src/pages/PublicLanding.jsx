import BloomLogo from '../components/BloomLogo.jsx'
import YaagviCharacter from '../components/YaagviCharacter.jsx'
import ActivityArtwork from '../components/ActivityArtwork.jsx'
import AppUpdateNotice from '../components/AppUpdateNotice.jsx'
import './public-landing.css'
import { trackEvent } from '../utils/analytics.js'

const adventures = [
  { id: 'picnic', href: '/play', subject: 'COUNT & SHARE', title: 'A place for everyone.', copy: 'Help Bumi share the picnic snacks. Can everyone get one?', action: 'Play the picnic' },
  { id: 'float-discovery', href: '/play/float', subject: 'PREDICT & DISCOVER', title: 'Will it float?', copy: 'Make a prediction, try the water lab and notice what happens.', action: 'Try the water lab' },
  { id: 'shadow-discovery', href: '/play/shadow', subject: 'LIGHT & SHADOW', title: 'Make a little shadow.', copy: 'Move the light. Watch the shadow. What could change next?', action: 'Explore shadows' },
]

export default function PublicLanding({ onGetStarted, onSignIn }) {
  return <div className="bloom-public" data-design="bloom-discoveries">
    <a className="public-skip" href="#main">Skip to content</a>
    <header className="public-nav">
      <a href="/" aria-label="Bloom Juniors home"><BloomLogo /></a>
      <nav aria-label="Main navigation"><a href="#adventures">Explore</a><a href="#families">For families</a><button onClick={onSignIn}>Sign in</button><button className="public-primary" onClick={() => onGetStarted('navigation')}>Get started</button></nav>
    </header>
    <AppUpdateNotice />
    <main id="main">
      <section className="public-hero">
        <div className="public-hero-copy">
          <p className="public-eyebrow">A LITTLE WONDER, EVERY DAY · AGES 3–9</p>
          <h1>Little discoveries.<br/><em>Growing minds.</em></h1>
          <p className="public-intro">A picnic to count. A shadow to change. A story to share. Help your child make sense of the world, one playful discovery at a time.</p>
          <div className="public-actions"><a className="public-primary" href="/play">Play a free adventure <span aria-hidden="true">↗</span></a><a className="public-text-link" href="#adventures">Find their spark <span aria-hidden="true">↓</span></a></div>
          <p className="public-note">Try an adventure without creating an account.</p>
        </div>
        <div className="public-hero-art" aria-label="Meet Bumi, your child's learning companion" role="img">
          <span className="public-sun"/><span className="public-orbit public-orbit-one"/><span className="public-orbit public-orbit-two"/>
          <div className="public-bumi"><YaagviCharacter size={310} state="idle" /></div>
          <div className="public-art-note">“I wonder what we’ll discover?”</div>
          <span className="public-bumi-label">MEET BUMI · YOUR CURIOUS COMPANION</span>
        </div>
      </section>
      <section className="public-adventures" id="adventures" aria-labelledby="adventure-title">
        <div className="public-section-heading"><div><p className="public-eyebrow">START WITH A QUESTION</p><h2 id="adventure-title">Curiosity looks good on them.</h2></div><p>Real activities to try right here.<br/>A small beginning to a bigger idea.</p></div>
        <div className="public-adventure-grid">{adventures.map(item => <a className="public-adventure" key={item.id} href={item.href} onClick={() => trackEvent('sample_cta_click', { sample: item.id === 'picnic' ? 'picnic' : item.id.replace('-discovery', ''), placement: 'homepage_card' })}>
          <div className="public-card-art"><ActivityArtwork id={item.id}/></div>
          <div className="public-card-copy"><p className="public-eyebrow">{item.subject}</p><h3>{item.title}</h3><p>{item.copy}</p><span className="public-card-action">{item.action} <span aria-hidden="true">↗</span></span></div>
        </a>)}</div>
      </section>
      <section className="public-ages" aria-labelledby="age-title">
        <p className="public-eyebrow">ROOM TO GROW</p><h2 id="age-title">Their pace. Their next discovery.</h2>
        <div className="public-age-grid">{[
          ['01', 'Tiny Stars', 'Ages 3–4', 'Big, simple choices. Match shapes, notice colours and play alongside a grown-up.'],
          ['02', 'Little Stars', 'Ages 4–6', 'Sounds, numbers, stories and first experiments. Make a guess, give it a try.'],
          ['03', 'Super Kids', 'Ages 7–9', 'Plan a mission, work through a problem and explain the thinking behind a choice.'],
        ].map(([number, title, age, copy]) => <article key={title}><span className="public-age-number" aria-hidden="true">{number}</span><p className="public-eyebrow">{age}</p><h3>{title}</h3><p>{copy}</p></article>)}</div>
        <button className="public-primary" onClick={() => onGetStarted('age-groups')}>Find your child’s starting point <span aria-hidden="true">↗</span></button>
      </section>
      <section className="public-families" id="families" aria-labelledby="family-title">
        <div><p className="public-eyebrow">FOR THE GROWN-UPS, TOO</p><h2 id="family-title">Stay close to<br/>their discoveries.</h2><p>See what your child tried in the parent area, then take the idea into everyday life. Learning carries on after the screen goes quiet.</p><button className="public-primary" onClick={() => onGetStarted('families')}>Start exploring together</button></div>
        <div className="public-family-notes"><article><span aria-hidden="true">01</span><h3>Thinking comes first.</h3><p>A prediction, a choice, a reason. Room to try again without rushing to the answer.</p></article><article><span aria-hidden="true">02</span><h3>Make it part of your day.</h3><p>Count spoons at dinner. Find a shadow outside. Share one thing you noticed.</p></article><article><span aria-hidden="true">03</span><h3>A window into their learning.</h3><p>Visit the PIN-protected parent area for saved activity progress and discovery recaps.</p></article></div>
      </section>
      <section className="public-founder"><img src="/founder.jpg" alt="Sanju, the parent behind Bloom Juniors" width="80" height="80" loading="lazy"/><div><p className="public-eyebrow">MADE WITH A PARENT’S CURIOSITY</p><p>For curious children. And the grown-ups beside them.</p><span>Sanju · Founder, Bloom Juniors</span></div></section>
    </main>
    <footer className="public-footer"><BloomLogo size="sm"/><p>Small discoveries. A world of possibilities.</p><nav aria-label="Footer"><a href="/blog/">Parent guides</a><a href="/privacy">Privacy</a><a href="mailto:hello@bloomjuniors.com">Contact</a></nav></footer>
  </div>
}
