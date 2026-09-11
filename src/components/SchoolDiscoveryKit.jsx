import { useState } from 'react'
import ActivityArtwork from './ActivityArtwork'
import './school-discovery-kit.css'

const ACTIVITIES = [
  { id: 'shadow', art: 'shadow-discovery', title: 'What changes a shadow?', subject: 'Light and observation', path: '/play/shadow', question: 'What might happen if the torch moves closer?', explore: 'Invite a prediction, move the torch, then compare the shadow. Ask children to describe what changed before explaining it.', explain: 'An object blocks light to make a shadow. With the object and screen fixed, moving the torch closer can make the shadow bigger.', offline: 'With an adult, use a torch, a toy and a wall. Keep the toy still and move the torch. Never shine the torch into eyes.', prompt: 'What did you move, and what happened to the shadow?' },
  { id: 'float', art: 'float-discovery', title: 'Will it float or sink?', subject: 'Materials and prediction', path: '/play/float', question: 'Do you think every heavy object sinks?', explore: 'Let children predict before testing each object in the activity. Compare the result with the prediction; changing your mind is part of investigating.', explain: 'Weight alone does not tell us whether something will float. Its material and shape matter too; a boat can float while carrying a load.', offline: 'An adult can supervise a shallow bowl of water and a few large, washable objects. Keep electrical devices away from the water and empty it afterwards.', prompt: 'Which result surprised you? What would you like to test next?' },
  { id: 'picnic', art: 'snacks', title: 'Can we share fairly?', subject: 'Counting and equal groups', path: '/play', question: 'How can we check that everyone has the same amount?', explore: 'Share the snacks in the activity. Encourage children to count each group and explain how they know the sharing is fair.', explain: 'Equal groups have the same number. Giving one item to each friend in turn is one way to share and then check.', offline: 'Use large paper circles as pretend snacks and two toy friends. Share, count and rearrange the circles. Does moving them change how many there are?', prompt: 'How did you check that both friends had the same number?' },
]

export default function SchoolDiscoveryKit() {
  const [selected, setSelected] = useState('shadow')
  const [copyStatus, setCopyStatus] = useState('')
  const activity = ACTIVITIES.find(item => item.id === selected)
  const link = `https://bloomjuniors.com${activity.path}?utm_source=school_resource&utm_medium=parent_share&utm_campaign=discovery_kit`
  const invitation = `Hello families, here is an optional Bloom Juniors activity to explore together: ${activity.title}\n\n${link}\n\nAsk your child: "${activity.prompt}"\n\nNo account is needed for this sample. Sample progress stays in this browser and is not sent to our classroom dashboard. Please explore together with an adult.`
  async function copyInvitation() {
    try {
      await navigator.clipboard.writeText(invitation)
      setCopyStatus('Invitation copied. You can paste it into your usual parent message.')
    } catch {
      setCopyStatus('Copy is unavailable here. Select and copy the invitation text below.')
    }
  }
  return <section id="discovery-kit" className="school-kit" aria-labelledby="school-kit-title">
    <div className="school-kit-inner">
      <p className="school-kit-eyebrow">Ready to explore · Suggested for ages 4–6 with an adult</p>
      <h2 id="school-kit-title">One small question. A whole conversation.</h2>
      <p>Try a real activity before setting up a classroom. Choose a discovery for a small group or an optional family activity, then use the notes below.</p>
      <div className="school-kit-options" aria-label="Choose a discovery">
        {ACTIVITIES.map(item => <button key={item.id} type="button" aria-pressed={selected === item.id} onClick={() => { setSelected(item.id); setCopyStatus('') }}>
          <ActivityArtwork id={item.art} /><span>{item.title}</span><small>{item.subject}</small>
        </button>)}
      </div>
      <article className="school-kit-plan" aria-labelledby="discovery-plan-title">
        <div>
          <p className="school-kit-eyebrow">Teacher notes · Adapt to your group</p>
          <h3 id="discovery-plan-title">{activity.title}</h3>
          <ol>
            <li><strong>Wonder and predict</strong><p>{activity.question}</p></li>
            <li><strong>Explore and notice</strong><p>{activity.explore}</p></li>
            <li><strong>Explain together</strong><p>{activity.explain}</p></li>
            <li><strong>Take it off screen</strong><p>{activity.offline}</p></li>
          </ol>
          <a className="school-kit-primary" href={activity.path}>Try this activity</a>
          <p className="school-kit-note">These open samples do not assign a lesson or report pupil completion. Use the classroom setup below for the existing teacher tools.</p>
        </div>
        <aside>
          <h3>A message for families</h3>
          <p>Edit this optional invitation before sharing through your usual school channel.</p>
          <label htmlFor="school-parent-invitation">Parent invitation</label>
          <textarea id="school-parent-invitation" readOnly value={invitation} rows={12} />
          <button className="school-kit-primary" type="button" onClick={copyInvitation}>Copy parent invitation</button>
          <p role="status" className="school-kit-note">{copyStatus}</p>
        </aside>
      </article>
    </div>
  </section>
}
