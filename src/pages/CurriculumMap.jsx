import React from 'react'

const MODULES = [
  // ── EYFS / Reception (ages 3–6) ──────────────────────────────────────────
  {
    name: 'Sound Pop',
    id: 'phonics',
    ages: '3–6',
    tier: 'EYFS / KS1',
    subject: 'English — Phonics',
    framework: 'EYFS: Communication & Language (Listening, Attention, Speaking); Literacy (Word Reading)',
    ncRef: 'KS1 English: Systematic Synthetic Phonics (SSP) — Letters and Sounds / Read Write Inc.',
    skills: 'Identify phoneme–grapheme correspondences; discriminate initial, medial and final sounds; blend CVC words.',
    emoji: '🎤',
  },
  {
    name: 'Star Catch',
    id: 'tricky',
    ages: '4–6',
    tier: 'EYFS / KS1',
    subject: 'English — Tricky Words',
    framework: 'EYFS: Literacy (Word Reading)',
    ncRef: 'KS1 English: Common exception words (Year 1 & 2 statutory word lists).',
    skills: 'Recognise and recall high-frequency words on sight; build reading fluency.',
    emoji: '⭐',
  },
  {
    name: 'Story Room',
    id: 'story',
    ages: '4–6',
    tier: 'EYFS / KS1',
    subject: 'English — Reading Comprehension',
    framework: 'EYFS: Communication & Language (all three strands); Literacy (Comprehension)',
    ncRef: 'KS1 English: Reading — word reading and comprehension; Spoken Language — listening and responding.',
    skills: 'Follow a narrative; make inferences; predict outcomes; build vocabulary in context.',
    emoji: '📖',
  },
  {
    name: 'Number World',
    id: 'math',
    ages: '4–6',
    tier: 'EYFS / KS1',
    subject: 'Mathematics — Number',
    framework: 'EYFS: Mathematics (Number; Numerical Patterns)',
    ncRef: 'KS1 Maths: Number — number and place value, addition and subtraction, multiplication and division.',
    skills: 'Count reliably to 20; compare quantities; add and subtract within 20; early multiplication concepts.',
    emoji: '🔢',
  },
  {
    name: 'Shape World',
    id: 'shapes',
    ages: '4–6',
    tier: 'EYFS / KS1',
    subject: 'Mathematics — Geometry',
    framework: 'EYFS: Mathematics (Numerical Patterns; Shape, Space and Measure)',
    ncRef: 'KS1 Maths: Geometry — properties of shapes; position and direction.',
    skills: 'Identify 2D and 3D shapes; describe properties; use positional language.',
    emoji: '🔷',
  },
  {
    name: 'Coin Shop',
    id: 'shop',
    ages: '4–6',
    tier: 'EYFS / KS1',
    subject: 'Mathematics — Measures (Money)',
    framework: 'EYFS: Mathematics (Number); Understanding the World (People, Culture and Communities)',
    ncRef: 'KS1 Maths: Measurement — recognise and use symbols for pounds (£) and pence (p).',
    skills: 'Recognise coins and notes; add money amounts; give change; real-world problem solving.',
    emoji: '🛍️',
  },
  {
    name: 'Piggy Bank',
    id: 'piggybank',
    ages: '4–6',
    tier: 'EYFS / KS1',
    subject: 'Mathematics — Measures (Money)',
    framework: 'EYFS: Mathematics (Number)',
    ncRef: 'KS1 Maths: Measurement — money; simple addition and subtraction of amounts.',
    skills: 'Count coins; save and spend decisions; early financial reasoning.',
    emoji: '🐷',
  },
  {
    name: 'Directional Puzzle',
    id: 'logic',
    ages: '4–6',
    tier: 'EYFS / KS1',
    subject: 'Mathematics — Position & Computing',
    framework: 'EYFS: Mathematics (Geometry); Understanding the World',
    ncRef: 'KS1 Maths: Geometry — position and direction. KS1 Computing: algorithms and logical reasoning.',
    skills: 'Follow and give directional instructions; decompose problems; sequential reasoning.',
    emoji: '🧩',
  },
  {
    name: 'Little DaVinci',
    id: 'davinci',
    ages: '4–6',
    tier: 'EYFS',
    subject: 'Expressive Arts & Design',
    framework: 'EYFS: Expressive Arts & Design (Creating with Materials; Being Imaginative and Expressive)',
    ncRef: 'KS1 Art & Design: use a range of materials; develop techniques; share ideas.',
    skills: 'Colour mixing; pattern; imaginative drawing; fine motor development.',
    emoji: '🎨',
  },
  {
    name: 'Body Parts',
    id: 'anatomy',
    ages: '4–6',
    tier: 'EYFS / KS1',
    subject: 'Science — Animals inc. Humans',
    framework: 'EYFS: Understanding the World (Natural World)',
    ncRef: 'KS1 Science: Animals including humans — identify and name basic body parts; senses.',
    skills: 'Name external body parts; identify senses and associated organs.',
    emoji: '🫀',
  },
  {
    name: 'Curious Science',
    id: 'science',
    ages: '4–6',
    tier: 'EYFS / KS1',
    subject: 'Science — Working Scientifically',
    framework: 'EYFS: Understanding the World (Natural World)',
    ncRef: 'KS1 Science: Working Scientifically; Materials; Animals; Plants.',
    skills: 'Observe properties; classify materials; ask and answer simple science questions.',
    emoji: '🔬',
  },
  {
    name: 'Planet World',
    id: 'planets',
    ages: '4–6',
    tier: 'EYFS / KS1',
    subject: 'Science — Earth & Space',
    framework: 'EYFS: Understanding the World (Natural World; The World)',
    ncRef: 'KS2 Science: Earth and Space (introduced early with age-appropriate scope).',
    skills: 'Name planets; sun as a star; day and night; relative size.',
    emoji: '🪐',
  },
  {
    name: 'World GK',
    id: 'worldgk',
    ages: '4–6',
    tier: 'EYFS / KS1',
    subject: 'Geography / PSHE',
    framework: 'EYFS: Understanding the World (People, Culture and Communities; The World)',
    ncRef: 'KS1 Geography: name and locate world\'s seven continents; human and physical geography.',
    skills: 'Identify continents and countries; cultural diversity; world landmarks.',
    emoji: '🌍',
  },
  {
    name: 'Fun Exercise',
    id: 'exercise',
    ages: '4–6',
    tier: 'EYFS / KS1',
    subject: 'Physical Education / Health',
    framework: 'EYFS: Physical Development (Gross Motor Skills)',
    ncRef: 'KS1 PE: master basic movements; develop agility and co-ordination; health and wellbeing.',
    skills: 'Gross motor skills; body awareness; healthy lifestyle habits.',
    emoji: '🏃',
  },
  {
    name: 'Sacred Stories',
    id: 'sacred',
    ages: '3–9',
    tier: 'EYFS / KS1 / KS2',
    subject: 'RE / PSHE / English',
    framework: 'EYFS: Understanding the World (People, Culture and Communities); Communication & Language',
    ncRef: 'KS1–KS2 RE: major world religions and beliefs. PSHE: diversity and mutual respect.',
    skills: 'Listen to and retell faith stories; respect beliefs; build empathy; vocabulary enrichment.',
    emoji: '📿',
  },

  // ── KS2 (ages 7–9) ───────────────────────────────────────────────────────
  {
    name: 'Spelling',
    id: 'spelling',
    ages: '7–9',
    tier: 'KS2',
    subject: 'English — Spelling',
    framework: '',
    ncRef: 'KS2 English: Spelling — Year 3–4 and Year 5–6 statutory word lists; prefixes and suffixes.',
    skills: 'Apply spelling rules; recognise patterns; build word memory through spaced retrieval.',
    emoji: '🔡',
  },
  {
    name: 'Grammar Quest',
    id: 'grammar',
    ages: '7–9',
    tier: 'KS2',
    subject: 'English — Grammar & Punctuation',
    framework: '',
    ncRef: 'KS2 English: Grammar, Punctuation and Spelling (GPS); Subordinate clauses; Parenthesis; Active/passive.',
    skills: 'Identify word classes; use punctuation accurately; analyse sentence structures.',
    emoji: '✏️',
  },
  {
    name: 'Times Tables',
    id: 'timestables',
    ages: '7–9',
    tier: 'KS2',
    subject: 'Mathematics — Multiplication & Division',
    framework: '',
    ncRef: 'KS2 Maths: Multiplication and division — recall and use multiplication facts up to 12 × 12.',
    skills: 'Rapid recall of multiplication facts; build fluency for division; mental arithmetic speed.',
    emoji: '✖️',
  },
  {
    name: 'Fractions',
    id: 'fractions',
    ages: '7–9',
    tier: 'KS2',
    subject: 'Mathematics — Fractions, Decimals, Percentages',
    framework: '',
    ncRef: 'KS2 Maths: Fractions (including decimals and percentages) — compare, simplify, convert.',
    skills: 'Identify and compare fractions; find fractions of amounts; convert between fractions and decimals.',
    emoji: '½',
  },
  {
    name: 'Word Problems',
    id: 'wordproblems',
    ages: '7–9',
    tier: 'KS2',
    subject: 'Mathematics — Reasoning & Problem Solving',
    framework: '',
    ncRef: 'KS2 Maths: Solve problems including multi-step; reason mathematically; explain methods.',
    skills: 'Multi-step problems; ratio, proportion, percentage; money and measurement contexts.',
    emoji: '🧮',
  },
  {
    name: 'Science Quest',
    id: 'scienceqs',
    ages: '7–9',
    tier: 'KS2',
    subject: 'Science — Working Scientifically',
    framework: '',
    ncRef: 'KS2 Science: Plants; Animals; Forces; Light; Rocks — content from Years 3–6.',
    skills: 'Apply science knowledge; identify variables; explain observations using subject vocabulary.',
    emoji: '⚗️',
  },
  {
    name: 'World Map',
    id: 'worldmap',
    ages: '7–9',
    tier: 'KS2',
    subject: 'Geography',
    framework: '',
    ncRef: 'KS2 Geography: name and locate world\'s countries; capitals; physical and human geography.',
    skills: 'Locate countries and capitals; identify geographical features; compare regions.',
    emoji: '🗺️',
  },
  {
    name: 'Games Arcade',
    id: 'games',
    ages: '7–9',
    tier: 'KS2',
    subject: 'English / Mathematics — Vocabulary & Reasoning',
    framework: '',
    ncRef: 'KS2 English: vocabulary development. KS2 Maths: mental arithmetic and reasoning.',
    skills: 'Spelling under pressure; arithmetic fluency; memory and pattern recognition.',
    emoji: '🎮',
  },
]

const TIER_COLOR = {
  'EYFS': { bg: '#F0FDF4', border: '#86EFAC', text: '#15803D' },
  'EYFS / KS1': { bg: '#EFF6FF', border: '#93C5FD', text: '#1D4ED8' },
  'EYFS / KS1 / KS2': { bg: '#FDF4FF', border: '#D8B4FE', text: '#7E22CE' },
  'KS1': { bg: '#EFF6FF', border: '#93C5FD', text: '#1D4ED8' },
  'KS2': { bg: '#FFF7ED', border: '#FCA5A5', text: '#B45309' },
}

export default function CurriculumMap() {
  const eyfsModules = MODULES.filter(m => m.tier.includes('EYFS'))
  const ks2Modules = MODULES.filter(m => m.tier === 'KS2')

  return (
    <div id="curriculum-map" className="min-h-screen bg-white" style={{ fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          #curriculum-map { padding: 0 !important; }
          .page-break { page-break-before: always; }
        }
        @page { margin: 12mm; size: A4; }
      `}</style>

      {/* Print / back buttons */}
      <div className="no-print sticky top-0 z-10 flex items-center gap-3 px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
        <button onClick={() => window.history.back()} className="text-gray-400 text-sm hover:text-gray-700">← Back</button>
        <div className="flex-1" />
        <button onClick={() => window.print()}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium"
          style={{ background: '#6366F1' }}>
          🖨️ Print / Save as PDF
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Title block */}
        <div className="text-center mb-8 pb-6 border-b-2 border-gray-100">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-4xl">🌸</span>
            <h1 className="text-3xl font-black text-gray-900" style={{ letterSpacing: '-0.5px' }}>Bloom Juniors</h1>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Curriculum Alignment Matrix</h2>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            Mapping Bloom Juniors learning modules to the <strong>EYFS Statutory Framework</strong>, <strong>KS1</strong> and <strong>KS2 National Curriculum</strong> for England.
            Aligned to <strong>KHDA requirements</strong> for Dubai private schools (EYFS / British curriculum track).
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {[
              { label: 'Ages 3–9', color: '#6366F1' },
              { label: 'EYFS', color: '#15803D' },
              { label: 'KS1', color: '#1D4ED8' },
              { label: 'KS2', color: '#B45309' },
              { label: 'SSP Phonics', color: '#BE185D' },
            ].map(badge => (
              <span key={badge.label} className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{ background: badge.color }}>
                {badge.label}
              </span>
            ))}
          </div>
        </div>

        {/* EYFS & KS1 Section */}
        <SectionHeader
          emoji="🧸"
          title="Early Years Foundation Stage & KS1"
          subtitle="Ages 3–6 · Bloom Juniors Early Learners App"
          color="#1D4ED8"
        />
        <Table modules={eyfsModules} />

        {/* KS2 Section */}
        <div className="page-break mt-10">
          <SectionHeader
            emoji="🚀"
            title="Key Stage 2"
            subtitle="Ages 7–9 · Bloom Juniors KS2 App"
            color="#B45309"
          />
          <Table modules={ks2Modules} />
        </div>

        {/* Ofsted / KHDA note */}
        <div className="mt-10 p-5 rounded-xl border border-gray-200 bg-gray-50">
          <h3 className="font-bold text-gray-800 text-sm mb-2">📋 Compliance Notes for School Leaders</h3>
          <ul className="text-xs text-gray-600 space-y-1.5 list-disc ml-4">
            <li><strong>Ofsted (England):</strong> Supports the EYFS Prime Area of Communication & Language and Specific Area of Literacy. Sound Pop implements Systematic Synthetic Phonics (SSP) with pure phoneme audio via Azure Neural TTS — consistent with DfE-validated phonics approaches.</li>
            <li><strong>KHDA (Dubai):</strong> Aligned to the KHDA British Curriculum Inspection Framework strands for EYFS and Years 1–5. World GK and Sacred Stories address the KHDA moral, social, cultural requirement.</li>
            <li><strong>SEND:</strong> Adjustable speech rate (0.8× for EYFS toddler mode), large-print tap targets, and audio-first design support learners with phonological difficulties or emerging English language needs.</li>
            <li><strong>Screen time:</strong> Built-in daily session timer (default 30 min) with parent PIN unlock — aligns with EYFS practitioner guidance on purposeful digital interaction.</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span>© {new Date().getFullYear()} Bloom Juniors · bloomjuniors.com</span>
          <span>Document generated {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ emoji, title, subtitle, color }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-2xl">{emoji}</span>
      <div>
        <h2 className="font-bold text-gray-900 text-lg" style={{ color }}>{title}</h2>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  )
}

function Table({ modules }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mb-4">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr style={{ background: '#F8FAFC' }}>
            {['Module', 'Ages', 'Subject', 'EYFS / NC Reference', 'Key Skills Developed'].map(h => (
              <th key={h} className="text-left px-3 py-2.5 font-semibold text-gray-600 border-b border-gray-200 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {modules.map((m, i) => {
            const tc = TIER_COLOR[m.tier] || TIER_COLOR['KS2']
            return (
              <tr key={m.id} style={{ background: i % 2 === 0 ? 'white' : '#FAFAFA' }}
                className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span>{m.emoji}</span>
                    <span className="font-semibold text-gray-800">{m.name}</span>
                  </div>
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-medium mt-0.5 inline-block"
                    style={{ background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>
                    {m.tier}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{m.ages}</td>
                <td className="px-3 py-2.5">
                  <span className="font-medium text-gray-700">{m.subject}</span>
                </td>
                <td className="px-3 py-2.5 text-gray-600 max-w-xs">
                  {m.framework && <p className="mb-0.5 text-gray-500 italic">{m.framework}</p>}
                  <p>{m.ncRef}</p>
                </td>
                <td className="px-3 py-2.5 text-gray-600">{m.skills}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
