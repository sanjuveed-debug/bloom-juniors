import React from 'react'
import { createRoot } from 'react-dom/client'
import SoundPop from './modules/SoundPop.jsx'
import ShapeWorld from './modules/ShapeWorld.jsx'
import StoryRoom from './modules/StoryRoom.jsx'
import WorldGK from './modules/WorldGK.jsx'
import BodyParts from './modules/BodyParts.jsx'
import PlanetWorld from './modules/PlanetWorld.jsx'
import AdventureModuleFrame from './components/AdventureModuleFrame.jsx'
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
  onUpdateProgress: () => {},
}

const moduleId = moduleName === 'shape' ? 'shapes'
  : moduleName === 'story' ? 'story'
    : moduleName === 'world' ? 'worldgk'
      : moduleName === 'body' ? 'anatomy'
        : moduleName === 'planet' ? 'planets'
          : 'phonics'

const moduleContent = moduleName === 'shape' ? <ShapeWorld {...commonProps} />
    : moduleName === 'story' ? <StoryRoom {...commonProps} />
      : moduleName === 'world' ? <WorldGK {...commonProps} />
        : moduleName === 'body' ? <BodyParts {...commonProps} />
          : moduleName === 'planet' ? <PlanetWorld {...commonProps} />
            : <SoundPop {...commonProps} />

createRoot(document.getElementById('root')).render(
  <AdventureModuleFrame moduleId={moduleId} ageGroup="early" progress={progress} onUpdateProgress={() => {}} onMap={() => {}}>
    {moduleContent}
  </AdventureModuleFrame>,
)
