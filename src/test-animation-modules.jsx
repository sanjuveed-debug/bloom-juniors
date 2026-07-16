import React from 'react'
import { createRoot } from 'react-dom/client'
import SoundPop from './modules/SoundPop.jsx'
import ShapeWorld from './modules/ShapeWorld.jsx'
import './index.css'

const moduleName = new URLSearchParams(window.location.search).get('module') || 'sound'
const progress = {
  avatar: 'yaagvi',
  phonics: { sessionsPlayed: 3 },
  shapes: { sessionsPlayed: 2 },
}

const commonProps = {
  avatar: 'yaagvi',
  progress,
  profileName: 'Yaagvi',
  onAddStars: () => {},
  onBack: () => {},
}

createRoot(document.getElementById('root')).render(
  moduleName === 'shape'
    ? <ShapeWorld {...commonProps} />
    : <SoundPop {...commonProps} />,
)
