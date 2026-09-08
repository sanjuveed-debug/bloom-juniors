import { useState, useSyncExternalStore } from 'react'
import { subscribeUpdate, hasAppUpdate, installAppUpdate } from '../utils/appUpdate.js'

export default function AppUpdateNotice() {
  const available = useSyncExternalStore(subscribeUpdate, hasAppUpdate, () => false)
  const [dismissed, setDismissed] = useState(false)
  const [error, setError] = useState(false)
  if (!available || dismissed) return null
  return <aside className="relative z-50 flex flex-wrap items-center gap-3 bg-amber-50 p-4 text-green-950" aria-label="App update">
    <p className="flex-1">A new Bloom version is ready. Update when your child has finished playing.</p>
    <button className="rounded-xl bg-green-900 text-white px-4 py-3 font-bold" onClick={async () => {
      try { await installAppUpdate() } catch { setError(true) }
    }}>Update now</button>
    <button className="px-4 py-3 font-bold" onClick={() => setDismissed(true)}>Later</button>
    {error && <p role="status">Please close all Bloom tabs and reopen to update.</p>}
  </aside>
}
