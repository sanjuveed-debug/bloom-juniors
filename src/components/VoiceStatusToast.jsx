import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function VoiceStatusToast() {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    const unavailable = () => {
      clearTimeout(timerRef.current)
      setVisible(true)
      timerRef.current = window.setTimeout(() => setVisible(false), 6500)
    }
    window.addEventListener('bloom:tts-unavailable', unavailable)
    return () => {
      clearTimeout(timerRef.current)
      window.removeEventListener('bloom:tts-unavailable', unavailable)
    }
  }, [])

  return <AnimatePresence>{visible&&<motion.div role="status" data-testid="voice-unavailable" initial={{opacity:0,y:30,scale:.92}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:20}} className="fixed bottom-4 left-1/2 z-[500] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl border-2 border-amber-300 bg-[#fff8dc] p-3 shadow-2xl">
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-100 text-2xl">🔇</span>
    <span className="min-w-0 flex-1"><span className="block font-bubble text-sm text-[#4b260e]">Yaagvi&apos;s voice needs a moment</span><span className="block font-round text-xs font-bold text-[#825b3c]">Tap the speaker to try again. Your game can continue.</span></span>
    <button onClick={()=>setVisible(false)} aria-label="Close voice message" className="h-9 w-9 shrink-0 rounded-full bg-white font-bubble text-[#825b3c]">×</button>
  </motion.div>}</AnimatePresence>
}
