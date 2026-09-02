import React from 'react'
import { createRoot } from 'react-dom/client'
import AdventureModuleFrame from './components/AdventureModuleFrame.jsx'
import { ToddlerChoiceModule } from './toddler/ToddlerApp.jsx'
import NumberWorld from './modules/NumberWorld.jsx'
import GrammarModule from './ks2/modules/GrammarModule.jsx'
import './index.css'

const scene = new URLSearchParams(window.location.search).get('scene') || 'toddler'
const progress = { sessions: [], treasureCollection: { items: [], claims: {} } }
const grammarTheme = {
  bg: 'linear-gradient(160deg,#231234,#3a1d4f)',
  headerBg: '#20102f',
  card: '#341946',
  primary: '#9b4dcc',
  accent: '#f4ba45',
}

const content = scene === 'number'
  ? <NumberWorld avatar="rumi" progress={progress} profileName="Rohan" onAddStars={() => {}} onBack={() => {}} />
  : scene === 'grammar'
    ? <GrammarModule theme={grammarTheme} played={0} onDone={() => {}} onBack={() => {}} />
    : <ToddlerChoiceModule moduleId="numbers" played={0} onDone={() => {}} onBack={() => {}} />

const moduleId = scene === 'number' ? 'math' : scene === 'grammar' ? 'grammar' : 'numbers'
const ageGroup = scene === 'grammar' ? 'junior' : scene === 'number' ? 'early' : 'toddler'

createRoot(document.getElementById('root')).render(
  <AdventureModuleFrame moduleId={moduleId} ageGroup={ageGroup} progress={progress} onUpdateProgress={() => {}} onMap={() => {}}>
    {content}
  </AdventureModuleFrame>,
)
