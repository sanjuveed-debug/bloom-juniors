import { useCallback } from 'react'
import PicnicAdventure from '../modules/PicnicAdventure.jsx'
import { useSpeech } from '../hooks/useSpeech.js'
import { applyPicnicAction, normalizePicnicProgress } from '../utils/picnicProgress.js'

export default function ProfilePicnic({ progress, update, onBack, onNext }) {
  const speech = useSpeech()
  const onAction = useCallback(action => {
    const at = Date.now()
    update(previous => applyPicnicAction(previous, action, at))
  }, [update])
  return <PicnicAdventure currentState={progress.picnic?.state || normalizePicnicProgress().state}
    onAction={onAction} speech={speech} onBack={onBack} onNext={onNext} />
}
