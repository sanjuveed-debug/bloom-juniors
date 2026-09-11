import ActivityVoiceControls from './ActivityVoiceControls.jsx'
import './lesson-controls.css'

export default function LessonHeader({ onBack, voice, title = 'Discover with Bumi' }) {
  return <header className="lesson-header"><button className="lesson-back" onClick={onBack} aria-label="Back to adventures"><span aria-hidden="true">←</span> Adventures</button><span className="lesson-header-title">{title}</span><ActivityVoiceControls voice={voice}/></header>
}
