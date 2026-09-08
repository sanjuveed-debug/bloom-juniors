import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { canEnablePush, subscribeToPush } from '../utils/webPush.js'
import {
  getBrowserTimezone,
  normalizeReturnReminder,
  shouldOfferFirstMissionReturnSetup,
} from '../utils/returnReminder.js'
import { buildPersonalizedReminder } from '../utils/personalizedReminder.js'
import { trackEvent } from '../utils/analytics.js'

const SETUP_KEY_PREFIX = 'eduapp_first_mission_return_v2'

function setupKey(profileId) {
  return `${SETUP_KEY_PREFIX}:${String(profileId || 'default')}`
}

function storedSetupState(profileId) {
  try { return localStorage.getItem(setupKey(profileId)) || '' } catch { return '' }
}

function saveSetupState(profileId, value) {
  try { localStorage.setItem(setupKey(profileId), value) } catch {}
}

function formatTimeLabel(value) {
  const [hourValue, minute = '00'] = String(value || '18:00').split(':')
  const hour = Number(hourValue)
  if (!Number.isFinite(hour)) return value
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minute} ${suffix}`
}

export default function RetentionSetup({
  active = true,
  profileId,
  profileName,
  profileAgeGroup = 'early',
  guardianEmail = '',
  parentPin = '',
  verifyParentPin,
  progress = {},
  onUpdateProgress,
  classroomMode = false,
}) {
  const reminder = normalizeReturnReminder(progress.returnReminder)
  const [visible, setVisible] = useState(false)
  const [unlocked, setUnlocked] = useState(!parentPin && !verifyParentPin)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [time, setTime] = useState(reminder.time)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const recommendation = useMemo(() => buildPersonalizedReminder({
    profile: { id: profileId, name: profileName, age_group: profileAgeGroup },
    progress,
  }), [profileAgeGroup, profileId, profileName, progress])

  const eligible = shouldOfferFirstMissionReturnSetup(progress, { classroomMode })

  useEffect(() => {
    if (!active || !profileId || !eligible || storedSetupState(profileId)) return undefined
    const timer = setTimeout(() => {
      setVisible(true)
      trackEvent('first_mission_return_prompt_view', {
        age_group: profileAgeGroup,
        next_module: recommendation.target,
      })
    }, 700)
    return () => clearTimeout(timer)
  }, [active, eligible, profileAgeGroup, profileId, recommendation.target])

  const persistSetup = useCallback((patch, status) => {
    const now = Date.now()
    const next = normalizeReturnReminder({
      ...reminder,
      ...patch,
      setupStatus: status,
      setupUpdatedAt: now,
      timezone: getBrowserTimezone(),
      updatedAt: now,
    })
    onUpdateProgress?.({ returnReminder: next })
    saveSetupState(profileId, status)
    return next
  }, [onUpdateProgress, profileId, reminder])

  const dismiss = useCallback(() => {
    persistSetup({}, 'dismissed')
    setVisible(false)
    trackEvent('first_mission_return_prompt_dismiss', { age_group: profileAgeGroup })
  }, [persistSetup, profileAgeGroup])

  const unlock = useCallback(async () => {
    if (pin.length !== 4 || busy) return
    setBusy(true)
    setPinError(false)
    const valid = verifyParentPin
      ? await verifyParentPin(pin)
      : pin === String(parentPin || '')
    setBusy(false)
    if (!valid) {
      setPin('')
      setPinError(true)
      return
    }
    setUnlocked(true)
    trackEvent('first_mission_return_parent_unlocked', { age_group: profileAgeGroup })
  }, [busy, parentPin, pin, profileAgeGroup, verifyParentPin])

  const enableEmail = useCallback(() => {
    if (!guardianEmail || busy) return
    persistSetup({ enabled: true, time }, 'email')
    setMessage(`Email reminder set for ${time}. It only sends if there has been no visit.`)
    trackEvent('first_mission_return_email_enabled', {
      age_group: profileAgeGroup,
      next_module: recommendation.target,
      reminder_time: time,
    })
    setTimeout(() => setVisible(false), 1800)
  }, [busy, guardianEmail, persistSetup, profileAgeGroup, recommendation.target, time])

  const enablePush = useCallback(async () => {
    if (busy) return
    setBusy(true)
    setMessage('Allow notifications when your phone asks.')
    try {
      const subscription = await subscribeToPush()
      if (!subscription.ok) {
        setMessage(subscription.reason === 'install_required'
          ? 'Add Bloom Juniors to the Home Screen first. Email reminders work without installing.'
          : subscription.reason === 'denied'
            ? 'Notifications are blocked in this device settings. Email reminders still work.'
            : 'Phone notifications are unavailable here. Email reminders still work.')
        return
      }
      persistSetup({
        enabled: Boolean(guardianEmail),
        pushEnabled: true,
        pushSubscription: subscription.subscription,
        time,
      }, 'push')
      setMessage(`Phone reminder set for ${time}.`)
      trackEvent('first_mission_return_push_enabled', {
        age_group: profileAgeGroup,
        next_module: recommendation.target,
        reminder_time: time,
      })
      setTimeout(() => setVisible(false), 1800)
    } catch {
      setMessage('Could not enable phone notifications. Choose email reminder instead.')
    } finally {
      setBusy(false)
    }
  }, [busy, guardianEmail, persistSetup, profileAgeGroup, recommendation.target, time])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[450] flex items-end justify-center bg-black/60 p-3 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="first-mission-return-title"
          data-testid="first-mission-return-prompt"
        >
          <motion.section
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 48, opacity: 0 }}
            className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-lg bg-white shadow-2xl"
          >
            <div className="flex items-start gap-3 border-b border-orange-100 p-5">
              <img
                src="/yaagvi-mascot-single.webp"
                alt=""
                className="h-14 w-14 shrink-0 rounded-lg object-cover"
                width="56"
                height="56"
              />
              <div className="min-w-0 flex-1">
                <p className="font-round text-[10px] font-black uppercase text-orange-700">For grown-ups</p>
                <h2 id="first-mission-return-title" className="font-bubble text-xl leading-tight text-[#422006]">
                  Save {profileName || 'your child'}&apos;s next adventure
                </h2>
                <p className="mt-1 font-round text-xs font-bold leading-relaxed text-[#422006]/65">
                  Today&apos;s first mission is complete. Tomorrow, {recommendation.moduleLabel} will have the next clue.
                </p>
              </div>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss return reminder"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xl text-[#422006]/45"
              >
                &times;
              </button>
            </div>

            {!unlocked ? (
              <div className="p-5">
                <p className="font-bubble text-base text-[#422006]">Grown-up check</p>
                <p className="mt-1 font-round text-xs font-bold text-[#422006]/60">
                  Enter the four-digit parent PIN to choose a reminder.
                </p>
                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={4}
                  aria-label="Parent PIN"
                  value={pin}
                  onChange={event => {
                    setPin(event.target.value.replace(/\D/g, '').slice(0, 4))
                    setPinError(false)
                  }}
                  onKeyDown={event => { if (event.key === 'Enter') unlock() }}
                  className="mt-4 min-h-12 w-full rounded-lg border-2 border-orange-200 bg-orange-50 px-4 text-center font-round text-xl font-black text-[#422006]"
                />
                {pinError && <p className="mt-2 font-round text-xs font-black text-red-600">That PIN did not match. Try again.</p>}
                <button
                  type="button"
                  disabled={busy || pin.length !== 4}
                  onClick={unlock}
                  className="mt-4 min-h-12 w-full rounded-lg bg-[#C2410C] px-4 font-bubble text-base text-white disabled:opacity-45"
                >
                  {busy ? 'Checking...' : 'Choose reminder'}
                </button>
              </div>
            ) : (
              <div className="p-5">
                <label className="block">
                  <span className="font-bubble text-base text-[#422006]">Gentle reminder time</span>
                  <span className="mt-1 block font-round text-xs font-bold text-[#422006]/60">
                    Nothing is sent on days {profileName || 'your child'} has already visited.
                  </span>
                  <input
                    type="time"
                    aria-label="Return reminder time"
                    value={time}
                    onChange={event => setTime(event.target.value)}
                    className="mt-3 min-h-12 w-full rounded-lg border border-orange-200 bg-orange-50 px-3 font-round text-base font-black text-[#422006]"
                  />
                </label>

                {message && (
                  <p className="mt-4 rounded-lg bg-orange-50 px-3 py-2.5 font-round text-xs font-bold text-[#7c2d12]">
                    {message}
                  </p>
                )}

                {guardianEmail && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={enableEmail}
                    className="mt-5 min-h-12 w-full rounded-lg bg-[#C2410C] px-4 font-bubble text-base text-white disabled:opacity-45"
                  >
                    Email me tomorrow at {formatTimeLabel(time)}
                  </button>
                )}

                <button
                  type="button"
                  disabled={busy || !canEnablePush()}
                  onClick={enablePush}
                  className="mt-2 min-h-11 w-full rounded-lg border-2 border-[#C2410C]/25 bg-white px-4 font-round text-sm font-black text-[#9A3412] disabled:opacity-40"
                >
                  {busy ? 'Setting up...' : 'Use a phone notification'}
                </button>

                {!guardianEmail && (
                  <p className="mt-3 font-round text-xs font-bold text-[#422006]/60">
                    Add a guardian email in Parent Zone to use the universal email reminder.
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={dismiss}
              className="min-h-11 w-full border-t border-orange-100 font-round text-xs font-black text-[#422006]/45"
            >
              Not now
            </button>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
