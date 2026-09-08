import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  AVATAR_WORKSHOP_ITEMS,
  equipAvatarItem,
  getEquippedAvatarItems,
  normalizeAvatarWorkshop,
  purchaseAvatarItem,
} from '../utils/avatarWorkshop.js'
import { trackEvent } from '../utils/analytics.js'
import { formatLocalDate } from '../utils/date.js'
import { recordAvatarWorkshopTelemetry } from '../utils/retentionTelemetry.js'

function AvatarPreview({ workshop, size = 190 }) {
  const equipped = useMemo(() => getEquippedAvatarItems(workshop), [workshop])
  const bySlot = Object.fromEntries(equipped.map(item => [item.slot, item]))

  return (
    <div
      className="relative shrink-0 overflow-visible rounded-full border-4 border-white bg-[#dff4ff] shadow-lg"
      style={{ width: size, height: size }}
      aria-label="Your customised Bloom avatar"
    >
      {bySlot.back && (
        <span className="absolute right-0 top-[42%] z-0 -translate-y-1/2 text-[42px]" aria-hidden="true">
          {bySlot.back.emoji}
        </span>
      )}
      <img
        src="/yaagvi-3d-wave.png"
        alt="Bloom avatar"
        className="relative z-10 h-full w-full rounded-full object-contain"
        draggable={false}
      />
      {bySlot.head && (
        <span className="absolute left-1/2 top-[-17%] z-20 -translate-x-1/2 text-[52px]" aria-hidden="true">
          {bySlot.head.emoji}
        </span>
      )}
      {bySlot.face && (
        <span className="absolute left-1/2 top-[37%] z-20 -translate-x-1/2 text-[45px]" aria-hidden="true">
          {bySlot.face.emoji}
        </span>
      )}
      {bySlot.badge && (
        <span className="absolute bottom-[-4%] left-[6%] z-20 text-[38px]" aria-hidden="true">
          {bySlot.badge.emoji}
        </span>
      )}
      {bySlot.effect && (
        <motion.span
          className="absolute -right-[8%] top-[4%] z-20 text-[45px]"
          animate={{ rotate: [0, 12, -8, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          aria-hidden="true"
        >
          {bySlot.effect.emoji}
        </motion.span>
      )}
    </div>
  )
}

export function AvatarWorkshopButton({ progress, onClick, compact = false, light = false }) {
  const workshop = normalizeAvatarWorkshop(progress?.avatarWorkshop)

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      aria-label={`Open Avatar Workshop. ${workshop.coins} Bloom Coins available`}
      className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl font-round font-black ${
        compact ? 'px-2 text-xs' : 'px-3 text-sm'
      }`}
      style={light
        ? { background: '#fff7d6', color: '#713b13', border: '1px solid #d99c3045' }
        : { background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.28)' }}
    >
      <span aria-hidden="true">🪙</span>
      <span>{workshop.coins}</span>
      {!compact && <span className="opacity-75">Avatar</span>}
    </motion.button>
  )
}

export default function AvatarWorkshop({ progress, profileName, ageGroup = 'unknown', onUpdateProgress, onClose }) {
  const [workshop, setWorkshop] = useState(() => normalizeAvatarWorkshop(progress?.avatarWorkshop))
  const [message, setMessage] = useState('')

  useEffect(() => {
    const date = formatLocalDate()
    trackEvent('avatar_workshop_opened', { age_group: ageGroup })
    onUpdateProgress?.({
      retentionTelemetry: recordAvatarWorkshopTelemetry(progress?.retentionTelemetry, {
        type: 'avatar_workshop_opened',
        date,
      }),
    })
  // Opening is one deliberate event for this mounted workshop.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setWorkshop(normalizeAvatarWorkshop(progress?.avatarWorkshop))
  }, [progress?.avatarWorkshop])

  const save = (nextWorkshop, events = []) => {
    setWorkshop(nextWorkshop)
    let retentionTelemetry = progress?.retentionTelemetry
    events.forEach(event => {
      retentionTelemetry = recordAvatarWorkshopTelemetry(retentionTelemetry, event)
      trackEvent(event.type, {
        age_group: ageGroup,
        ...(event.itemId ? { item_id: event.itemId } : {}),
      })
    })
    onUpdateProgress?.({ avatarWorkshop: nextWorkshop, retentionTelemetry })
  }

  const chooseItem = item => {
    if (workshop.owned.includes(item.id)) {
      const result = equipAvatarItem(workshop, item.id)
      if (result.equipped) {
        save(result.workshop, [{
          type: 'avatar_item_equipped',
          date: formatLocalDate(),
          itemId: item.id,
        }])
        setMessage(`${item.name} equipped.`)
      }
      return
    }

    const result = purchaseAvatarItem(workshop, item.id)
    if (!result.purchased) {
      setMessage(`Earn ${Math.max(1, item.cost - workshop.coins)} more coin${item.cost - workshop.coins === 1 ? '' : 's'} to unlock ${item.name}.`)
      return
    }

    const date = formatLocalDate()
    save(result.workshop, [
      { type: 'avatar_item_unlocked', date, itemId: item.id },
      { type: 'avatar_item_equipped', date, itemId: item.id },
    ])
    setMessage(`${item.name} unlocked and equipped!`)
    confetti({ particleCount: 70, spread: 80, origin: { x: 0.5, y: 0.45 } })
  }

  return (
    <motion.div
      className="fixed inset-0 z-[280] flex items-end justify-center bg-[#14213d]/75 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="avatar-workshop-title"
        className="max-h-[94dvh] w-full max-w-4xl overflow-y-auto rounded-t-lg bg-[#fff8e8] p-4 shadow-2xl sm:rounded-lg sm:p-6"
        initial={{ y: 70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        onClick={event => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="font-round text-xs font-black uppercase text-[#b44b20]">Learn. Earn. Create.</p>
            <h2 id="avatar-workshop-title" className="mt-1 font-bubble text-3xl text-[#351407] sm:text-4xl">
              Avatar Workshop
            </h2>
            <p className="mt-1 font-round text-sm font-bold text-[#805033]">
              {profileName || 'Explorer'} earns one coin for the first completion of each activity every day.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Avatar Workshop"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#7a351b]/15 bg-white text-2xl font-black text-[#5c2a16]"
          >
            ×
          </button>
        </header>

        <div className="mt-5 grid gap-5 md:grid-cols-[240px_minmax(0,1fr)]">
          <div className="flex flex-col items-center rounded-lg bg-[#132e49] p-5 text-center text-white">
            <AvatarPreview workshop={workshop} />
            <p className="mt-4 font-bubble text-2xl">{profileName || 'My Avatar'}</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2">
              <span aria-hidden="true">🪙</span>
              <span className="font-bubble text-xl">{workshop.coins}</span>
              <span className="font-round text-xs font-black uppercase text-white/65">Bloom Coins</span>
            </div>
            <p className="mt-3 font-round text-xs font-bold leading-5 text-white/65">
              Stars show learning progress. Coins unlock avatar items and can be spent.
            </p>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {AVATAR_WORKSHOP_ITEMS.map(item => {
                const owned = workshop.owned.includes(item.id)
                const equipped = workshop.equipped[item.slot] === item.id
                const affordable = workshop.coins >= item.cost

                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => chooseItem(item)}
                    className="min-h-[178px] rounded-lg border-2 bg-white p-3 text-left shadow-sm"
                    style={{
                      borderColor: equipped ? '#2f9d67' : owned ? '#e1aa45' : '#eadac0',
                      opacity: !owned && !affordable ? 0.72 : 1,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-4xl" aria-hidden="true">{item.emoji}</span>
                      <span className="rounded-full bg-[#fff1c6] px-2 py-1 font-bubble text-xs text-[#7a351b]">
                        {item.cost === 0 ? 'FREE' : `🪙 ${item.cost}`}
                      </span>
                    </div>
                    <p className="mt-3 font-bubble text-lg leading-tight text-[#351407]">{item.name}</p>
                    <p className="mt-1 font-round text-xs font-bold leading-4 text-[#805033]">{item.description}</p>
                    <p className="mt-3 font-round text-[11px] font-black uppercase text-[#b44b20]">
                      {equipped ? 'Equipped' : owned ? 'Tap to equip' : affordable ? 'Unlock' : 'Keep learning'}
                    </p>
                  </motion.button>
                )
              })}
            </div>
            <div className="mt-4 min-h-12 rounded-lg border border-[#d99c30]/25 bg-[#fff1c6] px-4 py-3 font-round text-sm font-black text-[#713b13]">
              {message || (workshop.coins > 0 ? 'Choose an item to unlock or equip.' : 'Finish a new activity today to earn your next coin.')}
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  )
}
