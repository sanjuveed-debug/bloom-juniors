import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  answerRetentionFeedback,
  dismissRetentionFeedback,
  getRetentionFeedbackPrompt,
} from '../utils/retentionFeedback.js'
import { trackEvent } from '../utils/analytics.js'

export default function RetentionFeedbackPrompt({
  progress = {},
  onUpdateProgress,
  now,
}) {
  const prompt = useMemo(
    () => getRetentionFeedbackPrompt(progress, now || new Date()),
    [now, progress],
  )
  const [saved, setSaved] = useState(false)
  if (!prompt || saved) return null

  const answer = answerId => {
    const retentionFeedback = answerRetentionFeedback(progress.retentionFeedback, prompt.id, answerId)
    onUpdateProgress?.({ retentionFeedback })
    trackEvent('parent_retention_feedback', {
      prompt: prompt.id,
      answer: answerId,
      child_age_days: prompt.age,
    })
    setSaved(true)
  }

  const dismiss = () => {
    const retentionFeedback = dismissRetentionFeedback(progress.retentionFeedback, prompt.id)
    onUpdateProgress?.({ retentionFeedback })
    trackEvent('parent_retention_feedback_dismissed', {
      prompt: prompt.id,
      child_age_days: prompt.age,
    })
    setSaved(true)
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-4 overflow-hidden rounded-lg border border-amber-300 bg-amber-50 shadow-sm"
      data-testid={`retention-feedback-${prompt.id}`}
    >
      <div className="flex items-start gap-3 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-amber-300 text-xl" aria-hidden="true">💬</span>
        <div className="min-w-0 flex-1">
          <p className="font-round text-[10px] font-black uppercase tracking-[.16em] text-amber-800">{prompt.title}</p>
          <h2 className="mt-1 font-bubble text-lg leading-tight text-slate-900">{prompt.question}</h2>
          <p className="mt-1 font-round text-xs font-bold text-slate-500">One tap helps improve the next family&apos;s experience.</p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss feedback question"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-amber-300 bg-white font-round text-lg font-black text-slate-600"
        >
          ×
        </button>
      </div>
      <div className="grid border-t border-amber-200 sm:grid-cols-5">
        {prompt.options.map((option, index) => (
          <button
            type="button"
            key={option.id}
            onClick={() => answer(option.id)}
            className={`min-h-12 px-3 text-left font-round text-xs font-black text-slate-800 hover:bg-white ${index ? 'border-t border-amber-200 sm:border-l sm:border-t-0' : ''}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </motion.section>
  )
}
