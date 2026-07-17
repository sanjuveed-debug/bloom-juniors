import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { HIGH_FIVE_STICKERS, normalizeParentHighFives, queueParentHighFive } from '../utils/parentHighFives.js'

export default function ParentHighFiveComposer({ progress = {}, profileName = 'your child', onUpdateProgress, primary = '#7C3AED', accent = '#F9738A' }) {
  const highFives = useMemo(() => normalizeParentHighFives(progress.parentHighFives), [progress.parentHighFives])
  const pending = highFives.messages.find(item => !item.deliveredAt)
  const delivered = [...highFives.messages].reverse().find(item => item.deliveredAt)
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('I am so proud of how you kept trying!')
  const [stickerId, setStickerId] = useState('star')

  const send = () => {
    if (!onUpdateProgress || !message.trim() || pending) return
    const next = queueParentHighFive(progress.parentHighFives, { message, stickerId })
    onUpdateProgress({ parentHighFives: next })
    setOpen(false)
  }

  if (pending) {
    const waiting = pending
    return (
      <div className="rounded-[2rem] bg-gradient-to-br from-amber-50 to-pink-50 p-5 shadow-lg" data-testid="high-five-waiting">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-3xl shadow-sm">{waiting?.sticker || '⭐'}</div>
          <div>
            <p className="font-round text-[10px] font-black uppercase tracking-[0.18em] text-pink-600">Waiting for {profileName}</p>
            <h3 className="mt-1 font-bubble text-xl text-slate-900">High-five packed and ready!</h3>
          </div>
        </div>
        <p className="mt-3 rounded-2xl bg-white/80 px-4 py-3 font-round text-sm font-bold leading-6 text-slate-700">“{waiting?.message || message}”</p>
        <p className="mt-2 font-round text-xs leading-5 text-slate-500">Yaagvi will deliver it with Azure voice when the child opens their home screen.</p>
      </div>
    )
  }

  return (
    <div className="rounded-[2rem] bg-white/90 p-5 shadow-lg" data-testid="parent-high-five-composer">
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-pink-100 text-2xl">🖐️</div>
        <div className="min-w-0 flex-1">
          <p className="font-round text-[10px] font-black uppercase tracking-[0.18em] text-pink-600">Send love into the app</p>
          <h3 className="mt-1 font-bubble text-xl text-slate-900">A high-five from you</h3>
          <p className="mt-1 font-round text-xs leading-5 text-slate-500">Yaagvi delivers your sticker and reads your note on {profileName}’s next visit.</p>
        </div>
      </div>

      {!open ? (
        <>
          {delivered && <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 font-round text-xs font-bold text-emerald-700">Last high-five delivered ✓</p>}
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setOpen(true)} disabled={!onUpdateProgress}
            className="mt-4 w-full rounded-2xl py-3 font-bubble text-sm text-white shadow disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}>
            Send a High-Five
          </motion.button>
        </>
      ) : (
        <div className="mt-4">
          <p className="font-round text-xs font-black text-slate-700">Choose a sticker</p>
          <div className="mt-2 grid grid-cols-6 gap-1.5">
            {HIGH_FIVE_STICKERS.map(sticker => (
              <button key={sticker.id} onClick={() => setStickerId(sticker.id)} aria-label={sticker.label}
                className="aspect-square rounded-xl text-xl transition-transform active:scale-90"
                style={{ background: stickerId === sticker.id ? `${primary}22` : '#F8FAFC', border: `2px solid ${stickerId === sticker.id ? primary : '#E2E8F0'}` }}>
                {sticker.emoji}
              </button>
            ))}
          </div>
          <label className="mt-3 block font-round text-xs font-black text-slate-700" htmlFor="high-five-message">Your message</label>
          <textarea id="high-five-message" value={message} maxLength={120} rows={3} onChange={event => setMessage(event.target.value)}
            className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 font-round text-sm font-bold leading-5 text-slate-800 outline-none focus:border-violet-400" />
          <div className="mt-1 flex justify-between font-round text-[10px] text-slate-400"><span>Short messages sound best aloud.</span><span>{message.length}/120</span></div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => setOpen(false)} className="flex-1 rounded-2xl bg-slate-100 py-3 font-bubble text-xs text-slate-600">Cancel</button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={send} disabled={!message.trim()}
              data-testid="send-high-five"
              className="flex-[1.4] rounded-2xl py-3 font-bubble text-xs text-white shadow disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}>
              Pack my message ✨
            </motion.button>
          </div>
        </div>
      )}
    </div>
  )
}
