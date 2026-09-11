import { trackEvent } from '../utils/analytics.js'
import './guest-parent-next.css'

export default function GuestParentNext({ sample }) {
  return <section className="guest-parent-next" aria-label="Continue with a parent account">
    <p className="guest-parent-kicker">FOR THE GROWN-UP</p>
    <h2>Turn one discovery into a little routine.</h2>
    <p>Create a parent account to choose activities for your child’s age, keep their account adventures in a discovery journal, and revisit what they tried.</p>
    <ul><li>Activities for ages 3–9</li><li>A separate profile for each child</li><li>A PIN-protected parent area</li></ul>
    <a href="/?app=1" onClick={() => trackEvent('sample_account_click', { sample, placement: 'completion' })}>Create a parent account →</a>
    <p className="guest-parent-note">This free sample stays in this browser. Its progress won’t transfer into the account.</p>
  </section>
}
