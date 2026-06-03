import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { isValidEmail } from '../utils/guardian'
import { supabase } from '../lib/supabase'

// ── SchoolInviteModal ─────────────────────────────────────────────────────────
// Shown when a teacher admin taps "Invite a colleague" in ClassroomDashboard.
// Sends an email invite via /api/teacher-invite-send.

export default function SchoolInviteModal({ schoolId, schoolName, onClose }) {
  const [email,     setEmail]     = useState('')
  const [status,    setStatus]    = useState('idle')   // 'idle' | 'sending' | 'sent' | 'error'
  const [errorMsg,  setErrorMsg]  = useState('')
  const [sentList,  setSentList]  = useState([])       // successfully invited emails

  const handleSend = async () => {
    const clean = email.trim().toLowerCase()
    if (!isValidEmail(clean)) { setErrorMsg('Please enter a valid email address.'); return }
    if (sentList.includes(clean)) { setErrorMsg('Already invited this address.'); return }

    setStatus('sending')
    setErrorMsg('')

    try {
      const session = (await supabase.auth.getSession()).data?.session
      const jwt = session?.access_token

      if (!jwt) throw new Error('Not logged in')

      const resp = await fetch('/api/teacher-invite-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ email: clean, schoolId }),
      })

      const data = await resp.json().catch(() => ({}))

      if (!resp.ok) {
        throw new Error(data.error || `Server error ${resp.status}`)
      }

      setSentList(prev => [...prev, clean])
      setEmail('')
      setStatus('sent')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      setErrorMsg(err.message || 'Could not send invite. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/65">
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 12 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="w-full max-w-sm rounded-3xl p-6 shadow-2xl"
        style={{ background: 'linear-gradient(160deg, #0e0b24 0%, #1a1040 100%)', border: '1px solid rgba(99,102,241,0.35)' }}
      >
        <div className="text-center mb-5">
          <div className="text-4xl mb-2">✉️</div>
          <h2 className="font-bubble text-white text-xl">Invite a colleague</h2>
          <p className="font-round text-white/50 text-sm mt-1">
            They'll receive a link to join <strong className="text-white/75">{schoolName}</strong>
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="font-round text-xs font-bold text-white/60 block mb-1">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrorMsg('') }}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="colleague@school.co.uk"
              inputMode="email"
              disabled={status === 'sending'}
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 font-round text-white outline-none text-sm disabled:opacity-50"
              style={{ fontSize: '1rem' }}
              autoFocus
            />
            <AnimatePresence>
              {errorMsg && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-1 font-round text-xs text-red-300">
                  {errorMsg}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleSend}
            disabled={status === 'sending' || !email.trim()}
            className="w-full py-3 rounded-2xl font-bubble text-white text-base disabled:opacity-50 transition-all"
            style={{ background: status === 'sent' ? '#22C55E' : 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
          >
            {status === 'sending' ? 'Sending…' : status === 'sent' ? '✓ Invite sent!' : 'Send Invite'}
          </motion.button>

          {sentList.length > 0 && (
            <div className="rounded-2xl px-4 py-3"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <p className="font-round text-xs text-green-300 font-bold mb-1">Invites sent</p>
              {sentList.map(e => (
                <p key={e} className="font-round text-xs text-green-400">✓ {e}</p>
              ))}
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full font-round text-white/35 text-xs text-center hover:text-white/60 transition-colors mt-1">
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )
}
