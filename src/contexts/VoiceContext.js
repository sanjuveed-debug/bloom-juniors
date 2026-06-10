import { createContext } from 'react'

// Per-age-group default Azure voice for useSpeech(). Falls back to the
// FS2 (4-6) default voice when no provider is present.
export const VoiceContext = createContext(null)
