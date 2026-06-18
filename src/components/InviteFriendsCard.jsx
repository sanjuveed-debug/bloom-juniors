import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { trackEvent } from '../utils/analytics.js'

const INVITE_MESSAGES = [
  (name) => `Hey! My child ${name} is loving this free learning app — Bloom Juniors. It's ad-free and follows the British curriculum (phonics, maths, stories). No app store needed, just open it:\n\nhttps://bloomjuniors.com\n\nWorth trying for ages 3–9!`,
  (name) => `Found this brilliant free app for kids — ${name} uses it every day! It teaches phonics, maths, and stories. Completely free, zero ads:\n\nhttps://bloomjuniors.com`,
  (name) => `${name} has been practising phonics and maths on Bloom Juniors — it's free and ad-free. Have a look:\n\nhttps://bloomjuniors.com`,
]

function pickMessage(profileName) {
  const idx = Math.floor(Math.random() * INVITE_MESSAGES.length)
  return INVITE_MESSAGES[idx](profileName || 'my child')
}

export default function InviteFriendsCard({ theme, profileName }) {
  const [copied, setCopied] = useState(false)
  const [showThanks, setShowThanks] = useState(false)

  const handleWhatsApp = () => {
    trackEvent('invite_whatsapp', { source: 'dashboard' })
    const msg = encodeURIComponent(pickMessage(profileName))
    window.open(`https://wa.me/?text=${msg}`, '_blank')
    setShowThanks(true)
    setTimeout(() => setShowThanks(false), 4000)
  }

  const handleCopy = async () => {
    trackEvent('invite_copy_link', { source: 'dashboard' })
    try {
      await navigator.clipboard.writeText(`My child loves Bloom Juniors — free phonics & maths for ages 3–9! https://bloomjuniors.com`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const handleNativeShare = async () => {
    trackEvent('invite_native_share', { source: 'dashboard' })
    try {
      await navigator.share({
        title: 'Bloom Juniors',
        text: pickMessage(profileName),
        url: 'https://bloomjuniors.com',
      })
    } catch {}
  }

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share

  return (
    <section className="mx-auto mt-5 max-w-6xl px-4 md:px-6 xl:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 220, damping: 22 }}
        className="relative overflow-hidden rounded-[26px] p-5"
        style={{
          background: 'linear-gradient(135deg, rgba(37,211,102,0.10), rgba(18,140,126,0.08))',
          border: '1.5px solid rgba(37,211,102,0.25)',
        }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(37,211,102,0.15), transparent)' }}
        />

        <div className="relative z-10">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] text-2xl"
              style={{ background: 'rgba(37,211,102,0.18)', border: '1.5px solid rgba(37,211,102,0.3)' }}>
              💌
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-round text-xs font-black uppercase tracking-[0.16em]"
                style={{ color: `${theme.text}77` }}>
                Invite Friends
              </p>
              <p className="font-bubble mt-0.5 text-base leading-tight" style={{ color: theme.text }}>
                Know families with kids aged 3–9?
              </p>
              <p className="font-round mt-1 text-xs font-bold leading-4" style={{ color: `${theme.text}55` }}>
                Share Bloom Juniors with parents from your child's class or community
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleWhatsApp}
              className="flex flex-1 items-center justify-center gap-2 rounded-[16px] py-3 font-bubble text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', boxShadow: '0 6px 16px rgba(37,211,102,0.3)' }}
            >
              <span style={{ fontSize: 18 }}>💬</span>
              WhatsApp
            </motion.button>

            {hasNativeShare ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-1.5 rounded-[16px] px-4 py-3 font-bubble text-sm"
                style={{ background: `${theme.primary}18`, color: theme.text, border: `1.5px solid ${theme.primary}30` }}
              >
                <span style={{ fontSize: 16 }}>📤</span>
                Share
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                className="flex items-center justify-center gap-1.5 rounded-[16px] px-4 py-3 font-bubble text-sm"
                style={{ background: `${theme.primary}18`, color: theme.text, border: `1.5px solid ${theme.primary}30` }}
              >
                <span style={{ fontSize: 16 }}>{copied ? '✅' : '📋'}</span>
                {copied ? 'Copied!' : 'Copy link'}
              </motion.button>
            )}
          </div>

          <AnimatePresence>
            {showThanks && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="font-round mt-3 text-center text-xs font-bold"
                style={{ color: '#25D366' }}
              >
                Thanks for spreading the word!
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  )
}
