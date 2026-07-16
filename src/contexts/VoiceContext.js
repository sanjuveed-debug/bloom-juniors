import { createContext } from 'react'

// Per-age-group Azure voice for useSpeech(). The shared controller uses the
// FS2 (4-6) Azure voice when no provider is present; browser TTS is never used.
export const VoiceContext = createContext(null)
