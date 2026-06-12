// Captures the browser's beforeinstallprompt event (Chrome/Edge/Android)
// so the InstallNudge component can trigger it later. Import early (main.jsx).

let deferredPrompt = null
const listeners = new Set()

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    listeners.forEach(fn => fn())
  })
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    try { localStorage.setItem('eduapp_pwa_installed', '1') } catch {}
    listeners.forEach(fn => fn())
  })
}

export function canPromptInstall() {
  return Boolean(deferredPrompt)
}

export function onInstallAvailable(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export async function promptInstall() {
  if (!deferredPrompt) return false
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  deferredPrompt = null
  return outcome === 'accepted'
}

export function isStandalone() {
  try {
    return window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true
      || localStorage.getItem('eduapp_pwa_installed') === '1'
  } catch {
    return false
  }
}

export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}
