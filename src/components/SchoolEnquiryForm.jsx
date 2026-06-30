import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

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
  const [form, setForm] = useState({ name: '', school: '', role: '', email: '', message: '' })
  const [status, setStatus] = useState('idle')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const valid = form.name.trim() && form.school.trim() && form.role && form.email.trim()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!valid || status !== 'idle') return
    setStatus('sending')

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
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-[24px] p-8 text-center"
        style={{ background: 'rgba(22,163,74,0.08)', border: '1.5px solid rgba(22,163,74,0.3)' }}
      >
        <div className="text-5xl mb-3">🎉</div>
        <p className="font-bubble text-2xl mb-2" style={{ color: '#422006' }}>Thanks for reaching out!</p>
        <p className="font-round text-sm leading-6" style={{ color: 'rgba(66,32,6,0.65)' }}>
          We&apos;ll get back to you at{' '}
          <strong style={{ color: '#422006' }}>{form.email}</strong> within 1–2 business days.
        </p>
      </motion.div>
    )
  }

  if (status === 'error') {
    return (
      <div className="rounded-[24px] p-8 text-center"
        style={{ background: 'rgba(220,38,38,0.08)', border: '1.5px solid rgba(220,38,38,0.25)' }}>
        <div className="text-5xl mb-3">😕</div>
        <p className="font-bubble text-2xl mb-2" style={{ color: '#422006' }}>Something went wrong</p>
        <p className="font-round text-sm leading-6 mb-4" style={{ color: 'rgba(66,32,6,0.65)' }}>
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
    border: '1.5px solid rgba(66,32,6,0.16)',
    color: '#422006',
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="font-round text-xs font-bold uppercase tracking-wide" style={{ color: 'rgba(66,32,6,0.55)' }}>
            Full name *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Your name"
            required
            className="rounded-2xl px-4 py-3 font-round text-sm outline-none focus:ring-2 focus:ring-orange-400/40"
            style={inputStyle}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-round text-xs font-bold uppercase tracking-wide" style={{ color: 'rgba(66,32,6,0.55)' }}>
            School / Organisation *
          </label>
          <input
            type="text"
            value={form.school}
            onChange={e => set('school', e.target.value)}
            placeholder="School name"
            required
            className="rounded-2xl px-4 py-3 font-round text-sm outline-none focus:ring-2 focus:ring-orange-400/40"
            style={inputStyle}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="font-round text-xs font-bold uppercase tracking-wide" style={{ color: 'rgba(66,32,6,0.55)' }}>
            Your role *
          </label>
          <select
            value={form.role}
            onChange={e => set('role', e.target.value)}
            required
            className="rounded-2xl px-4 py-3 font-round text-sm outline-none focus:ring-2 focus:ring-orange-400/40"
            style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none' }}
          >
            <option value="" disabled>Select role…</option>
            {ROLES.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-round text-xs font-bold uppercase tracking-wide" style={{ color: 'rgba(66,32,6,0.55)' }}>
            Email address *
          </label>
          <input
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="you@school.ac.uk"
            required
            className="rounded-2xl px-4 py-3 font-round text-sm outline-none focus:ring-2 focus:ring-orange-400/40"
            style={inputStyle}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-round text-xs font-bold uppercase tracking-wide" style={{ color: 'rgba(66,32,6,0.55)' }}>
          Message{' '}
          <span className="normal-case font-normal opacity-60">(optional)</span>
        </label>
        <textarea
          value={form.message}
          onChange={e => set('message', e.target.value)}
          placeholder="Tell us about your school, the age range you're interested in, or any questions…"
          rows={3}
          className="rounded-2xl px-4 py-3 font-round text-sm resize-none outline-none focus:ring-2 focus:ring-orange-400/40"
          style={inputStyle}
        />
      </div>

      <motion.button
        type="submit"
        disabled={!valid || status === 'sending'}
        whileTap={{ scale: 0.97 }}
        className="rounded-2xl py-3.5 font-bubble text-white text-base shadow-lg mt-1 transition-opacity"
        style={{
          background: valid ? '#C2410C' : 'rgba(66,32,6,0.18)',
          opacity: status === 'sending' ? 0.7 : 1,
        }}
      >
        {status === 'sending' ? 'Sending…' : 'Send enquiry →'}
      </motion.button>
    </form>
  )
}
