import { getClassLessonSteps } from '../utils/classroomLesson'
import ActivityArtwork from './ActivityArtwork'
import './class-lesson.css'

export default function ClassLessonHome({ progress, moduleIds, onNavigate }) {
  const steps = getClassLessonSteps(progress, moduleIds)
  if (!steps.length) return null
  return <section className="class-lesson-home" aria-labelledby="class-lesson-title">
    <p className="class-lesson-eyebrow">CHOSEN BY YOUR TEACHER</p>
    <h2 id="class-lesson-title">Your class lesson</h2>
    <p>{steps.every(s => s.done) ? 'You explored your class activities. Tell your teacher what you noticed!' : 'Choose an activity. Take your time and tell us what you notice.'}</p>
    <div className="class-lesson-cards">{steps.map(step => <button key={step.id} onClick={() => onNavigate(step.id)}>
      <ActivityArtwork id={step.id} /><span><strong>{step.label}</strong><small>{step.question || 'Explore and practise together.'}</small><b>{step.done ? 'Explored today · Play again' : step.started ? 'Continue activity' : 'Start activity'} <span aria-hidden="true">→</span></b></span>
    </button>)}</div>
    <p className="class-lesson-count" role="status">{steps.filter(s => s.done).length} of {steps.length} explored today</p>
  </section>
}
