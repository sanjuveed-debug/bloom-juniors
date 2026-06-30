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
        style={{ background: 'rgba(34,197,94,0.12)', border: '1.5px solid rgba(34,197,94,0.3)' }}
      >
        <div className="text-5xl mb-3">🎉</div>
        <p className="font-bubble text-white text-2xl mb-2">Thanks for reaching out!</p>
        <p className="font-round text-white/65 text-sm leading-6">
          We&apos;ll get back to you at{' '}
          <strong className="text-white">{form.email}</strong> within 1–2 business days.
        </p>
      </motion.div>
    )
  }

  if (status === 'error') {
    return (
      <div className="rounded-[24px] p-8 text-center"
        style={{ background: 'rgba(239,68,68,0.12)', border: '1.5px solid rgba(239,68,68,0.3)' }}>
        <div className="text-5xl mb-3">😕</div>
        <p className="font-bubble text-white text-2xl mb-2">Something went wrong</p>
        <p className="font-round text-white/65 text-sm leading-6 mb-4">
          Your enquiry couldn't be sent. Please email us directly at{' '}
          <a href="mailto:hello@bloomjuniors.com" className="text-purple-300 underline">hello@bloomjuniors.com</a>{' '}
          and we'll get back to you within 1–2 business days.
        </p>
        <button onClick={() => setStatus('idle')}
          className="font-round text-white/60 text-sm underline hover:text-white">
          Try again
        </button>
      </div>
    )
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.08)',
    border: '1.5px solid rgba(255,255,255,0.15)',
    color: 'white',
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="font-round text-white/55 text-xs font-bold uppercase tracking-wide">
            Full name *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Your name"
            required
            className="rounded-2xl px-4 py-3 font-round text-sm outline-none focus:ring-2 focus:ring-purple-500/50"
            style={inputStyle}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-round text-white/55 text-xs font-bold uppercase tracking-wide">
            School / Organisation *
          </label>
          <input
            type="text"
            value={form.school}
            onChange={e => set('school', e.target.value)}
            placeholder="School name"
            required
            className="rounded-2xl px-4 py-3 font-round text-sm outline-none focus:ring-2 focus:ring-purple-500/50"
            style={inputStyle}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="font-round text-white/55 text-xs font-bold uppercase tracking-wide">
            Your role *
          </label>
          <select
            value={form.role}
            onChange={e => set('role', e.target.value)}
            required
            className="rounded-2xl px-4 py-3 font-round text-sm outline-none focus:ring-2 focus:ring-purple-500/50"
            style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none' }}
          >
            <option value="" disabled style={{ background: '#1a0533' }}>Select role…</option>
            {ROLES.map(r => (
              <option key={r} value={r} style={{ background: '#1a0533', color: 'white' }}>{r}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-round text-white/55 text-xs font-bold uppercase tracking-wide">
            Email address *
          </label>
          <input
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="you@school.ac.uk"
            required
            className="rounded-2xl px-4 py-3 font-round text-sm outline-none focus:ring-2 focus:ring-purple-500/50"
            style={inputStyle}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-round text-white/55 text-xs font-bold uppercase tracking-wide">
          Message{' '}
          <span className="normal-case font-normal opacity-50">(optional)</span>
        </label>
        <textarea
          value={form.message}
          onChange={e => set('message', e.target.value)}
          placeholder="Tell us about your school, the age range you're interested in, or any questions…"
          rows={3}
          className="rounded-2xl px-4 py-3 font-round text-sm resize-none outline-none focus:ring-2 focus:ring-purple-500/50"
          style={inputStyle}
        />
      </div>

      <motion.button
        type="submit"
        disabled={!valid || status === 'sending'}
        whileTap={{ scale: 0.97 }}
        className="rounded-2xl py-3.5 font-bubble text-white text-base shadow-lg mt-1 transition-opacity"
        style={{
          background: valid
            ? 'linear-gradient(135deg, #8B00FF, #D1147E)'
            : 'rgba(255,255,255,0.1)',
          opacity: status === 'sending' ? 0.7 : 1,
        }}
      >
        {status === 'sending' ? 'Sending…' : 'Send enquiry →'}
      </motion.button>
    </form>
  )
}
