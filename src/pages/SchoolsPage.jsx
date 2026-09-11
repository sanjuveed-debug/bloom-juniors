import { useEffect } from 'react'
import BloomLogo from '../components/BloomLogo'
import SchoolEnquiryForm from '../components/SchoolEnquiryForm'
import SchoolDiscoveryKit from '../components/SchoolDiscoveryKit'
import ActivityArtwork from '../components/ActivityArtwork'
import YaagviCharacter from '../components/YaagviCharacter'
import { trackEvent, trackEventOnce } from '../utils/analytics.js'
import './schools-page.css'

function trackSchoolCta(cta, location) { trackEvent('school_cta_click', { cta, location }) }

export default function SchoolsPage() {
  useEffect(() => {
    const previousTitle = document.title
    const description = 'Explore free school activities with teacher notes and parent invitations. Try shadows, floating and fair sharing, then set up a classroom.'
    document.title = 'Bloom Juniors for Schools | EYFS, KS1 and Early KS2'

    let meta = document.querySelector('meta[name="description"]')
    const previousDescription = meta?.getAttribute('content')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', description)
    trackEventOnce('schools-page-view', 'school_page_view')

    return () => {
      document.title = previousTitle
      if (previousDescription !== null && previousDescription !== undefined) {
        meta.setAttribute('content', previousDescription)
      }
    }
  }, [])

  return <div className="bloom-schools">
    <a className="schools-skip" href="#schools-main">Skip to content</a>
    <header className="schools-header">
      <a href="/" aria-label="Bloom Juniors home"><BloomLogo /></a>
      <span className="schools-brand-label">For schools</span>
      <nav aria-label="School navigation">
        <a href="#discovery-kit">Activities</a><a href="#pricing">Pricing</a>
        <a href="/?app=1" onClick={() => trackSchoolCta('sign_in', 'navigation')}>Sign in</a>
        <a className="schools-button" href="/?teacher=1" onClick={() => trackSchoolCta('start_free', 'navigation')}>Start free</a>
      </nav>
    </header>
    <main id="schools-main">
      <section className="schools-hero schools-container">
        <div className="schools-hero-copy">
          <p className="schools-eyebrow">FOR THE LITTLE THINKERS IN YOUR CLASSROOM</p>
          <h1>A little wonder.<br/><em>A world to learn.</em></h1>
          <p className="schools-intro">Playful discoveries for curious children. Ready-to-use activities and thoughtful teaching notes, from your classroom to their home.</p>
          <div className="schools-actions"><a className="schools-button" href="#discovery-kit">Explore the activities <span aria-hidden="true">&#8595;</span></a><a className="schools-text-link" href="/?teacher=1" onClick={() => trackSchoolCta('start_free', 'hero')}>Set up a classroom <span aria-hidden="true">&#8599;</span></a></div>
          <p className="schools-small">One classroom free forever. Up to 30 pupils. No card needed.</p>
        </div>
        <div className="schools-hero-scene">
          <div className="schools-scene-top"><span className="schools-eyebrow">A DISCOVERY STARTS HERE</span><span aria-hidden="true">&#10035;</span></div>
          <div className="schools-scene-art"><ActivityArtwork id="shadow-discovery" /></div>
          <div className="schools-scene-caption"><div><span className="schools-small">LIGHT &amp; SHADOWS</span><h2>What if we move<br/>the torch?</h2></div><div className="schools-scene-bumi" aria-hidden="true"><YaagviCharacter size={112} state="idle" /></div></div>
          <a href="/play/shadow" className="schools-scene-link">Try the discovery <span aria-hidden="true">&#8599;</span></a>
        </div>
      </section>
      <div className="schools-benefits schools-container"><span>Designed for ages 3&#8211;9</span><span>No advertising</span><span>Works in your browser</span><a href="/curriculum-map">Explore the curriculum &#8599;</a></div>
      <SchoolDiscoveryKit />
      <section id="how" className="schools-flow schools-container">
        <div><p className="schools-eyebrow">WHEN YOU'RE READY FOR MORE</p><h2>From one discovery<br/>to your classroom.</h2><p>Keep exploring with the existing classroom tools. Choose activities, welcome your pupils and review their progress.</p><a className="schools-text-link" href="/?teacher=1">Create your free classroom &#8599;</a></div>
        <ol>{[['Make it yours', 'Set up your classroom and choose the learning activities for your group.'], ['Welcome your learners', 'Pupils enter through a class code and choose their name. No child email or password needed.'], ['See how they get on', 'Use the class dashboard and weekly report to guide your next session.']].map(([title, copy], i) => <li key={title}><span>0{i+1}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol>
      </section>
      <section id="pricing" className="schools-pricing schools-container">
        <div className="schools-section-title"><p className="schools-eyebrow">ROOM TO GROW</p><h2>Start small. Stay curious.</h2><p>Try Bloom with one classroom. Talk to us when your school needs more.</p></div>
        <div className="schools-price-grid">
          <article className="schools-price-card"><p className="schools-eyebrow">YOUR FIRST CLASSROOM</p><h3>Free <span>forever</span></h3><p>One classroom. Up to 30 pupils. No credit card.</p><ul><li>All learning activities</li><li>Lesson setter and class dashboard</li><li>Weekly progress report</li></ul><a className="schools-button" href="/?teacher=1" onClick={() => trackSchoolCta('start_free','pricing')}>Start a free classroom &#8599;</a></article>
          <article className="schools-price-card schools-price-school"><p className="schools-eyebrow">YOUR WHOLE SCHOOL</p><h3>Let's talk.</h3><p>An annual licence, with a simple annual invoice.</p><ul><li>Multiple classrooms and teacher invitations</li><li>School administration and aggregate reports</li><li>Priority setup support</li></ul><a className="schools-button schools-button-outline" href="#enquiry" onClick={() => trackSchoolCta('request_pricing','pricing')}>Ask about school pricing &#8599;</a></article>
        </div>
      </section>
      <section id="safety" className="schools-questions schools-container"><div><p className="schools-eyebrow">A FEW HELPFUL DETAILS</p><h2>Before you begin.</h2></div><div>
        <details><summary>Can we try it without an account?</summary><p>Yes. The three activities above open straight away. They save in that browser and do not send pupil completion to a classroom dashboard.</p></details>
        <details><summary>Which ages is Bloom for?</summary><p>Bloom covers ages 3&#8211;9. This activity kit is suggested for ages 4&#8211;6 with an adult. Adapt the questions and pace for your group.</p><a className="schools-text-link" href="/curriculum-map">View the curriculum map &#8599;</a></details>
        <details><summary>What about pupil information?</summary><p>The classroom flow uses class codes and pupil names, without child email addresses or passwords. Review our privacy policy before adding pupil information.</p><a className="schools-text-link" href="/privacy">Read the privacy policy &#8599;</a></details>
      </div></section>
      <section id="enquiry" className="schools-enquiry schools-container"><div><p className="schools-eyebrow">LET'S FIND YOUR STARTING POINT</p><h2>Tell us about<br/>your classroom.</h2><p>Your age group, your next topic, or just a question. We can help you explore where Bloom fits.</p><a className="schools-text-link" href="mailto:hello@bloomjuniors.com">hello@bloomjuniors.com &#8599;</a></div><div className="schools-form"><SchoolEnquiryForm source="schools-page-redesign" /></div></section>
    </main>
    <footer className="schools-footer schools-container"><BloomLogo size="sm"/><p>A little wonder, every day.</p><nav aria-label="Footer"><a href="/">For families</a><a href="/curriculum-map">Curriculum</a><a href="/privacy">Privacy</a><a href="mailto:hello@bloomjuniors.com">Contact</a></nav></footer>
  </div>
}
