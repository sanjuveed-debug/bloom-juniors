import React, { useEffect, useState } from 'react'
import { SYNC_ERROR_EVENT, SYNC_OK_EVENT } from '../utils/syncStatus.js'

export default function SyncStatusBanner() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    const onError = (e) => setMessage(e.detail?.message || 'Progress saved on this device. We\'ll back it up to the cloud when your connection returns.')
    const onOk = () => setMessage('')
    window.addEventListener(SYNC_ERROR_EVENT, onError)
    window.addEventListener(SYNC_OK_EVENT, onOk)
    return () => {
      window.removeEventListener(SYNC_ERROR_EVENT, onError)
      window.removeEventListener(SYNC_OK_EVENT, onOk)
    }
  }, [])

  if (!message) return null

  return (
    <div className="pointer-events-none fixed left-3 right-3 top-[calc(env(safe-area-inset-top,0px)+0.75rem)] z-[200] flex justify-center">
      <div className="pointer-events-auto max-w-md rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-xl">
        <div className="flex items-start gap-3">
          <span className="text-lg" aria-hidden="true">☁️</span>
          <p className="flex-1 font-round text-sm font-bold leading-5 text-amber-900">{message}</p>
          <button
            type="button"
            onClick={() => setMessage('')}
            className="shrink-0 rounded-full px-2 py-1 font-round text-xs font-black uppercase tracking-wide text-amber-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
