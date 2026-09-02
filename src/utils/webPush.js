import { isIOS, isStandalone } from './installPrompt.js'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'
import { normalizePushSubscription } from './pushSubscription.js'

export { normalizePushSubscription } from './pushSubscription.js'

export const VAPID_PUBLIC_KEY = 'BHb7w1oZmXcsyK-7bYb8EBfDC1ES51ibKoXTCFCukHxfPqgK1cFKUcnZSZJhQuW2k1Bjsxm5urYHilI3O4SwgcE'

function base64UrlBytes(value) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const binary = atob((value + padding).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(binary, char => char.charCodeAt(0))
}

export function isPushSupported() {
  return typeof window !== 'undefined'
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window
}

export function canEnablePush() {
  if (!isPushSupported()) return false
  return !isIOS() || isStandalone()
}

export async function getPushSubscription() {
  if (!isPushSupported()) return null
  const registration = await navigator.serviceWorker.ready
  return normalizePushSubscription((await registration.pushManager.getSubscription())?.toJSON())
}

export async function subscribeToPush() {
  if (!canEnablePush()) {
    return { ok: false, reason: isIOS() && !isStandalone() ? 'install_required' : 'unsupported' }
  }
  const permission = Notification.permission === 'default'
    ? await Notification.requestPermission()
    : Notification.permission
  if (permission !== 'granted') return { ok: false, reason: permission }

  const registration = await navigator.serviceWorker.ready
  const existing = await registration.pushManager.getSubscription()
  const subscription = existing || await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64UrlBytes(VAPID_PUBLIC_KEY),
  })
  return { ok: true, subscription: normalizePushSubscription(subscription.toJSON()) }
}

export async function unsubscribeFromPush() {
  if (!isPushSupported()) return true
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  if (subscription) await subscription.unsubscribe()
  return true
}

export async function sendTestPush(profileId) {
  if (!isPushSupported()) return { ok: false, reason: 'Notifications are not supported on this device.' }
  if (Notification.permission !== 'granted') {
    return { ok: false, reason: `Notification permission is ${Notification.permission}.` }
  }

  const registration = await navigator.serviceWorker.ready
  const localTag = `bloom-device-test-${Date.now()}`
  try {
    await registration.showNotification('Bloom Juniors device test', {
      body: 'Your phone can display Bloom Juniors notifications.',
      icon: '/bj-192.png',
      badge: '/bj-192.png',
      tag: localTag,
      data: { url: '/?app=1' },
    })
  } catch {
    return { ok: false, reason: 'The phone refused to display a test notification.' }
  }

  if (!isSupabaseConfigured) return { ok: false, reason: 'signin_required' }
  const session = (await supabase.auth.getSession()).data?.session
  if (!session?.access_token) return { ok: false, reason: 'signin_required' }
  const response = await fetch('/api/test-push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ profileId }),
  })
  const data = await response.json().catch(() => ({}))
  return response.ok
    ? { ok: true, deviceDisplayed: true, providerStatus: data.providerStatus }
    : { ok: false, deviceDisplayed: true, reason: data.error || 'send_failed' }
}
