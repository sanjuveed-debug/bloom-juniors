import React from 'react'
import { createRoot } from 'react-dom/client'
import FractionsModule from './ks2/modules/FractionsModule.jsx'
import GrammarModule from './ks2/modules/GrammarModule.jsx'
import WorldMapModule from './ks2/modules/WorldMapModule.jsx'
import WordProblemsModule from './ks2/modules/WordProblemsModule.jsx'
import TimesTablesModule from './ks2/modules/TimesTablesModule.jsx'
import './index.css'

const theme = {
  bg: '#101634',
  headerBg: '#17224a',
  card: '#26345f',
  primary: '#7457df',
  accent: '#f4ba45',
  glow: '#7457df',
}
const common = { theme, played: 5, onDone: () => {}, onBack: () => {} }
const moduleName = new URLSearchParams(window.location.search).get('module') || 'fractions'

const modules = {
  fractions: <FractionsModule {...common} />,
  grammar: <GrammarModule {...common} />,
  worldmap: <WorldMapModule {...common} />,
  wordproblems: <WordProblemsModule {...common} />,
  timestables: <TimesTablesModule {...common} />,
}

createRoot(document.getElementById('root')).render(modules[moduleName] || modules.fractions)
