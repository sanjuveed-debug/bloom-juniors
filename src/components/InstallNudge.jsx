import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { canPromptInstall, onInstallAvailable, promptInstall, isStandalone, isIOS } from '../utils/installPrompt.js'

const DISMISS_KEY = 'eduapp_install_nudge_dismissed_v1'
const FIRST_ACTIVITY_KEY = 'eduapp_first_activity_done_v1'

// Shows once, a few seconds after the child has completed their first
// activity — the moment a parent is most likely to want the app installed.
export default function InstallNudge({ profileName }) {
  const [show, setShow] = useState(false)
  const [ios] = useState(isIOS)

  useEffect(() => {
    let timer
    const evaluate = () => {
      try {
        if (isStandalone()) return
        if (localStorage.getItem(DISMISS_KEY)) return
        if (!localStorage.getItem(FIRST_ACTIVITY_KEY)) return
        if (!ios && !canPromptInstall()) return
        timer = setTimeout(() => setShow(true), 4000)
      } catch {}
    }
    evaluate()
    const off = onInstallAvailable(evaluate)
    return () => { off(); clearTimeout(timer) }
  }, [ios])

  const dismiss = () => {
    setShow(false)
    try { localStorage.setItem(DISMISS_KEY, '1') } catch {}
  }

  const install = async () => {
    if (ios) return // iOS shows instructions instead of a button action
    const accepted = await promptInstall()
    if (accepted) setShow(false)
    else dismiss()
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="fixed bottom-4 left-4 right-4 z-[150] mx-auto max-w-md rounded-3xl p-4 shadow-xl"
          style={{ background: '#FFFFFF', border: '1.5px solid rgba(66,32,6,0.12)' }}
        >
          <div className="flex items-start gap-3">
            <img src="/yaagvi-mascot-single.webp" alt="" width={48} height={48}
              className="w-12 h-12 rounded-2xl object-cover shrink-0"
              onError={(e) => { e.currentTarget.style.display = 'none' }} />
            <div className="flex-1 min-w-0">
              <p className="font-bubble text-base leading-tight" style={{ color: '#422006' }}>
                Add Bloom Juniors to your home screen
              </p>
              <p className="font-round text-xs mt-1 leading-relaxed" style={{ color: 'rgba(66,32,6,0.6)' }}>
                {ios
                  ? <>Tap the <span className="font-bold" style={{ color: '#422006' }}>Share</span> button <span aria-hidden>⎋</span> below, then <span className="font-bold" style={{ color: '#422006' }}>"Add to Home Screen"</span> — so {profileName || 'your child'} can start anytime with one tap.</>
                  : <>One tap and {profileName || 'your child'} can start learning anytime — no browser needed.</>}
              </p>
              <div className="flex gap-2 mt-3">
                {!ios && (
                  <motion.button whileTap={{ scale: 0.95 }} onClick={install}
                    className="rounded-xl px-4 py-2 font-bubble text-sm text-white"
                    style={{ background: '#C2410C' }}>
                    Install ⤓
                  </motion.button>
                )}
                <button onClick={dismiss}
                  className="rounded-xl px-3 py-2 font-round text-xs font-bold" style={{ color: 'rgba(66,32,6,0.45)' }}>
                  {ios ? 'Got it' : 'Not now'}
                </button>
              </div>
            </div>
            <button onClick={dismiss} aria-label="Dismiss"
              className="text-lg leading-none shrink-0" style={{ color: 'rgba(66,32,6,0.35)' }}>✕</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
