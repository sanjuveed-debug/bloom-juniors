import React from 'react'
import { createRoot } from 'react-dom/client'
import NumberWorld from './modules/NumberWorld.jsx'
import './index.css'

const progress = {
  avatar: 'yaagvi',
  math: { opPlayed: { count: 2, add: 2, onemore: 2 } },
}

createRoot(document.getElementById('root')).render(
  <NumberWorld
    avatar="yaagvi"
    progress={progress}
    profileName="Yaagvi"
    onAddStars={() => {}}
    onBack={() => {}}
  />,
)
