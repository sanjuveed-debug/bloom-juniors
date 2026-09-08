import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import FractionsModule from './ks2/modules/FractionsModule.jsx'
import GrammarModule from './ks2/modules/GrammarModule.jsx'
import WorldMapModule from './ks2/modules/WorldMapModule.jsx'
import WordProblemsModule from './ks2/modules/WordProblemsModule.jsx'
import TimesTablesModule from './ks2/modules/TimesTablesModule.jsx'
import ReadingModule from './ks2/modules/ReadingModule.jsx'
import SpellingModule from './ks2/modules/SpellingModule.jsx'
import ScienceModule from './ks2/modules/ScienceModule.jsx'
import SpiritualityModule from './ks2/modules/SpiritualityModule.jsx'
import GamesModule from './ks2/modules/GamesModule.jsx'
import PiggyBankGame from './modules/PiggyBankGame.jsx'
import './index.css'

const theme = {
  bg: '#101634',
  headerBg: '#17224a',
  card: '#26345f',
  primary: '#7457df',
  accent: '#f4ba45',
  glow: '#7457df',
}
const moduleName = new URLSearchParams(window.location.search).get('module') || 'fractions'

function Harness() {
const [result, setResult] = useState(null)
const [backCount, setBackCount] = useState(0)
const common = { theme, played: 5, onDone: (correct, total) => setResult({ correct, total }), onBack: () => setBackCount(n => n + 1) }
const modules = {
  fractions: <FractionsModule {...common} />,
  grammar: <GrammarModule {...common} />,
  worldmap: <WorldMapModule {...common} />,
  wordproblems: <WordProblemsModule {...common} />,
  timestables: <TimesTablesModule {...common} />,
  reading: <ReadingModule {...common} />,
  spelling: <SpellingModule {...common} />,
  science: <ScienceModule {...common} />,
  spirituality: <SpiritualityModule {...common} />,
  games: <GamesModule {...common} gamesUnlocked onComplete={setResult} />,
  piggybank: <PiggyBankGame ageGroup="junior" {...common} onComplete={setResult} />,
}
return <>{modules[moduleName] || modules.fractions}
  <aside aria-label="Local review result" style={{ background: '#fff', color: '#111', padding: 16 }}>
    <strong>Local component fixture — no production profile</strong>
    <p>Module: {moduleName}. Callback received: {result ? 'yes' : 'no'}. Back requests: {backCount}.</p>
    {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
  </aside>
</>
}

createRoot(document.getElementById('root')).render(<Harness />)
