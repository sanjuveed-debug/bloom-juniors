import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { trackEvent } from '../utils/analytics.js'

const FEEDBACK_KEY = 'bloom_feedback_v1'
const FEEDBACK_DISMISS_KEY = 'bloom_feedback_dismissed_v1'

export function shouldShowFeedback(progress) {
  if (typeof window === 'undefined') return false
  try {
    if (localStorage.getItem(FEEDBACK_KEY)) return false
    if (localStorage.getItem(FEEDBACK_DISMISS_KEY)) return false
    const sessions = progress?.sessions || []
    return sessions.length >= 5
  } catch {
    return false
  }
}

export default function FeedbackPrompt({ profileName, theme, onClose }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    const data = { rating, comment: comment.trim(), profileName, timestamp: new Date().toISOString() }
    trackEvent('parent_feedback', { rating, has_comment: comment.trim().length > 0 })
    try {
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(data))
      fetch('/api/usage-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'parent_feedback', ...data }),
        keepalive: true,
      }).catch(() => {})
    } catch {}
    setSubmitted(true)
    setTimeout(onClose, 2500)
  }

  const handleDismiss = () => {
    try { localStorage.setItem(FEEDBACK_DISMISS_KEY, Date.now().toString()) } catch {}
    trackEvent('feedback_dismissed')
    onClose()
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleDismiss}
    >
      <motion.div
        className="relative w-full max-w-sm overflow-hidden rounded-[28px] p-6 text-center"
        style={{
          background: `linear-gradient(160deg, ${theme.bg}, ${theme.card})`,
          border: `1.5px solid ${theme.primary}40`,
          boxShadow: `0 20px 50px rgba(0,0,0,0.4)`,
        }}
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        onClick={e => e.stopPropagation()}
      >
        {submitted ? (
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <div className="text-5xl mb-3">💜</div>
            <h2 className="font-bubble text-xl" style={{ color: theme.text }}>Thank you!</h2>
            <p className="font-round text-sm mt-2" style={{ color: `${theme.text}88` }}>
              Your feedback means the world to us
            </p>
          </motion.div>
        ) : (
          <>
            <div className="text-5xl mb-2">🌸</div>
            <h2 className="font-bubble text-xl mb-1" style={{ color: theme.text }}>
              How's {profileName || 'your child'} enjoying Bloom Juniors?
            </h2>
            <p className="font-round text-xs mb-4" style={{ color: `${theme.text}66` }}>
              Quick feedback from parents helps us improve
            </p>

            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(star => (
                <motion.button
                  key={star}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setRating(star)}
                  className="text-3xl transition-all"
                  style={{ opacity: star <= rating ? 1 : 0.3, filter: star <= rating ? 'none' : 'grayscale(1)' }}
                >
                  ⭐
                </motion.button>
              ))}
            </div>

            {rating > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder={rating >= 4
                    ? "What does your child enjoy most? (optional)"
                    : "How can we make it better? (optional)"
                  }
                  rows={2}
                  className="w-full resize-none rounded-2xl border-none p-3 font-round text-sm outline-none"
                  style={{
                    background: `${theme.primary}10`,
                    color: theme.text,
                    border: `1px solid ${theme.primary}25`,
                  }}
                />

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                  className="mt-3 w-full rounded-2xl py-3.5 font-bubble text-base text-white"
                  style={{ background: theme.primary, boxShadow: `0 6px 16px ${theme.primary}40` }}
                >
                  Send feedback
                </motion.button>
              </motion.div>
            )}

            <button onClick={handleDismiss}
              className="mt-3 font-round text-xs font-bold"
              style={{ color: `${theme.text}44` }}>
              Maybe later
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
