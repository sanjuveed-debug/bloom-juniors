import React, { useId, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { trackEvent } from '../utils/analytics.js'

const ROLES = [
  'Class Teacher',
  'Head Teacher / Principal',
  'SENCO / Learning Support',
  'Teaching Assistant',
  'School Administrator',
  'Parent / Carer',
  'Other',
]

export default function SchoolEnquiryForm({ source = 'schools-page' }) {
  const formId = useId()
  const [form, setForm] = useState({ name: '', school: '', role: '', email: '', message: '' })
  const [status, setStatus] = useState('idle')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const valid = form.name.trim() && form.school.trim() && form.role && form.email.trim()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!valid || status !== 'idle') return
    setStatus('sending')
    trackEvent('school_enquiry_submit', {
      source,
      role: form.role,
      has_message: Boolean(form.message.trim()),
    })

    try {
      let saved = false
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('school_enquiries').insert({
          name: form.name.trim(),
          school: form.school.trim(),
          role: form.role,
          email: form.email.trim(),
          message: form.message.trim() || null,
          source,
        })
        if (!error) saved = true
      }

      setStatus(saved ? 'done' : 'error')
      trackEvent(saved ? 'school_enquiry_success' : 'school_enquiry_error', { source })
    } catch {
      setStatus('error')
      trackEvent('school_enquiry_error', { source })
    }
  }

  if (status === 'done') {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-lg p-8 text-center"
        style={{ background: 'rgba(22,163,74,0.08)', border: '1.5px solid rgba(22,163,74,0.3)' }}
      >
        <div className="text-5xl mb-3">🎉</div>
        <p className="font-bubble text-2xl mb-2" style={{ color: '#193251' }}>Thanks for reaching out!</p>
        <p className="font-round text-sm leading-6" style={{ color: 'rgba(25,50,81,0.65)' }}>
          We&apos;ll get back to you at{' '}
          <strong style={{ color: '#193251' }}>{form.email}</strong> within 1–2 business days.
        </p>
      </motion.div>
    )
  }

  if (status === 'error') {
    return (
      <div className="rounded-lg p-8 text-center"
        style={{ background: 'rgba(220,38,38,0.08)', border: '1.5px solid rgba(220,38,38,0.25)' }}>
        <div className="text-5xl mb-3">😕</div>
        <p className="font-bubble text-2xl mb-2" style={{ color: '#193251' }}>Something went wrong</p>
        <p className="font-round text-sm leading-6 mb-4" style={{ color: 'rgba(25,50,81,0.65)' }}>
          Your enquiry couldn't be sent. Please email us directly at{' '}
          <a href="mailto:hello@bloomjuniors.com" className="underline" style={{ color: '#9A3412' }}>hello@bloomjuniors.com</a>{' '}
          and we'll get back to you within 1–2 business days.
        </p>
        <button onClick={() => setStatus('idle')}
          className="font-round text-sm underline" style={{ color: 'rgba(66,32,6,0.6)' }}>
          Try again
        </button>
      </div>
    )
  }

  const inputStyle = {
    background: '#FFFFFF',
    border: '1.5px solid rgba(25,50,81,0.16)',
    color: '#193251',
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${formId}-name`} className="font-round text-xs font-bold uppercase tracking-wide" style={{ color: 'rgba(66,32,6,0.55)' }}>
            Full name *
          </label>
          <input
            type="text"
            id={`${formId}-name`}
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Your name"
            required
            className="rounded-lg px-4 py-3 font-round text-sm outline-none focus:ring-2 focus:ring-violet-400/40"
            style={inputStyle}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${formId}-school`} className="font-round text-xs font-bold uppercase tracking-wide" style={{ color: 'rgba(66,32,6,0.55)' }}>
            School / Organisation *
          </label>
          <input
            type="text"
            id={`${formId}-school`}
            value={form.school}
            onChange={e => set('school', e.target.value)}
            placeholder="School name"
            required
            className="rounded-lg px-4 py-3 font-round text-sm outline-none focus:ring-2 focus:ring-violet-400/40"
            style={inputStyle}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${formId}-role`} className="font-round text-xs font-bold uppercase tracking-wide" style={{ color: 'rgba(66,32,6,0.55)' }}>
            Your role *
          </label>
          <select
            id={`${formId}-role`}
            value={form.role}
            onChange={e => set('role', e.target.value)}
            required
            className="rounded-lg px-4 py-3 font-round text-sm outline-none focus:ring-2 focus:ring-violet-400/40"
            style={inputStyle}
          >
            <option value="" disabled>Select role…</option>
            {ROLES.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${formId}-email`} className="font-round text-xs font-bold uppercase tracking-wide" style={{ color: 'rgba(66,32,6,0.55)' }}>
            Email address *
          </label>
          <input
            type="email"
            id={`${formId}-email`}
            value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="you@school.ac.uk"
            required
            className="rounded-lg px-4 py-3 font-round text-sm outline-none focus:ring-2 focus:ring-violet-400/40"
            style={inputStyle}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${formId}-message`} className="font-round text-xs font-bold uppercase tracking-wide" style={{ color: 'rgba(66,32,6,0.55)' }}>
          Message{' '}
          <span className="normal-case font-normal opacity-60">(optional)</span>
        </label>
        <textarea
          id={`${formId}-message`}
            value={form.message}
          onChange={e => set('message', e.target.value)}
          placeholder="Tell us about your school, the age range you're interested in, or any questions…"
          rows={3}
          className="rounded-lg px-4 py-3 font-round text-sm resize-none outline-none focus:ring-2 focus:ring-violet-400/40"
          style={inputStyle}
        />
      </div>

      <motion.button
        type="submit"
        disabled={!valid || status === 'sending'}
        whileTap={{ scale: 0.97 }}
        className="rounded-lg py-3.5 font-bubble text-white text-base shadow-lg mt-1 transition-opacity"
        style={{
          background: valid ? '#6C4CF1' : 'rgba(25,50,81,0.18)',
          opacity: status === 'sending' ? 0.7 : 1,
        }}
      >
        {status === 'sending' ? 'Sending…' : 'Send enquiry →'}
      </motion.button>
    </form>
  )
}
