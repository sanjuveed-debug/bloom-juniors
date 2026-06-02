export const SYNC_ERROR_EVENT = 'yaagvi-sync-error'
export const SYNC_OK_EVENT = 'yaagvi-sync-ok'

export function reportSyncError(message = 'Progress saved on this device. We\'ll back it up to the cloud when your connection returns.') {
  try {
    window.dispatchEvent(new CustomEvent(SYNC_ERROR_EVENT, { detail: { message, at: Date.now() } }))
  } catch {}
}

export function reportSyncSuccess() {
  try {
    window.dispatchEvent(new CustomEvent(SYNC_OK_EVENT))
  } catch {}
}
