import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import SoundPop from './modules/SoundPop.jsx'
import ShapeWorld from './modules/ShapeWorld.jsx'
import StoryRoom from './modules/StoryRoom.jsx'
import WorldGK from './modules/WorldGK.jsx'
import BodyParts from './modules/BodyParts.jsx'
import PlanetWorld from './modules/PlanetWorld.jsx'
import NumberWorld from './modules/NumberWorld.jsx'
import StarCatch from './modules/StarCatch.jsx'
import ShopGame from './modules/ShopGame.jsx'
import PiggyBankGame from './modules/PiggyBankGame.jsx'
import LittleDaVinci from './modules/LittleDaVinci.jsx'
import FunExercise from './modules/FunExercise.jsx'
import SacredStories from './modules/SacredStories.jsx'
import CuriousScience from './modules/CuriousScience.jsx'
import AdventureModuleFrame from './components/AdventureModuleFrame.jsx'
import './index.css'

const moduleName = new URLSearchParams(window.location.search).get('module') || 'sound'
const initialProgress = {
  avatar: 'yaagvi',
  phonics: { sessionsPlayed: 3 },
  shapes: { sessionsPlayed: 2 },
  math: { opPlayed: { count: 2, add: 2, onemore: 2 } },
}

function Harness() {
const [progress, setProgress] = useState(initialProgress)
const [awards, setAwards] = useState([])
const [backCount, setBackCount] = useState(0)
const [updateCount, setUpdateCount] = useState(0)
const update = patch => {
  setProgress(current => ({ ...current, ...(typeof patch === 'function' ? patch(current) : patch) }))
  setUpdateCount(n => n + 1)
}
const commonProps = {
  avatar: 'yaagvi',
  progress,
  profileName: 'Yaagvi',
  ageGroup: 'early',
  profileId: 'local-review-fixture',
  onAddStars: (module, stars, details = {}) => setAwards(current => [...current, { module, stars, correct: details.correct, total: details.total, duration: details.duration }]),
  onBack: () => setBackCount(n => n + 1),
  onUpdateProgress: update,
}

const moduleId = moduleName === 'shape' ? 'shapes'
  : moduleName === 'story' ? 'story'
    : moduleName === 'world' ? 'worldgk'
      : moduleName === 'body' ? 'anatomy'
        : moduleName === 'planet' ? 'planets'
          : ({ number: 'math', tricky: 'tricky', shop: 'shop', piggybank: 'piggybank', davinci: 'davinci', exercise: 'exercise', sacred: 'sacred', science: 'science' }[moduleName] || 'phonics')

const moduleContent = moduleName === 'shape' ? <ShapeWorld {...commonProps} />
    : moduleName === 'story' ? <StoryRoom {...commonProps} />
      : moduleName === 'world' ? <WorldGK {...commonProps} />
        : moduleName === 'body' ? <BodyParts {...commonProps} />
          : moduleName === 'planet' ? <PlanetWorld {...commonProps} />
            : ({
                number: <NumberWorld {...commonProps} />,
                tricky: <StarCatch {...commonProps} />,
                shop: <ShopGame {...commonProps} />,
                piggybank: <PiggyBankGame {...commonProps} onComplete={result => setAwards(current => [...current, { module: 'piggybank', ...result }])} />,
                davinci: <LittleDaVinci {...commonProps} />,
                exercise: <FunExercise {...commonProps} />,
                sacred: <SacredStories {...commonProps} />,
                science: <CuriousScience {...commonProps} />,
              }[moduleName] || <SoundPop {...commonProps} />)

return <>
  <AdventureModuleFrame moduleId={moduleId} ageGroup="early" progress={progress} onUpdateProgress={update} onMap={() => setBackCount(n => n + 1)}>
    {moduleContent}
  </AdventureModuleFrame>
  <aside aria-label="Local review result" style={{ background: '#fff', color: '#111', padding: 16 }}>
    <strong>Local component fixture — no production profile</strong>
    <p>Module: {moduleId}. Awards: {awards.length}. Progress updates: {updateCount}. Back requests: {backCount}.</p>
    {awards.length > 0 && <pre>{JSON.stringify(awards, null, 2)}</pre>}
    {moduleId === 'shop' && <pre>{JSON.stringify(progress.shop || {}, null, 2)}</pre>}
    {moduleId === 'davinci' && <div>
      <p>Saved artwork: {(progress.artGallery || []).length}</p>
      {(progress.artGallery || []).map((art, index) => <img key={art.id} src={art.dataUrl} alt={`Saved ${art.template} ${index + 1}`} style={{ width: 240, border: '1px solid #222' }} />)}
    </div>}
  </aside>
</>
}
createRoot(document.getElementById('root')).render(<Harness />)
