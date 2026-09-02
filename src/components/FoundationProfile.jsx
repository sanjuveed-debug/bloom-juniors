import { useEffect, useMemo, useState } from 'react'
import { FOUNDATION_ARCS, FOUNDATION_STRANDS } from '../data/foundationCurriculum.js'
import { normalizeFoundationProfile } from '../utils/foundationProfile.js'
import { trackEvent } from '../utils/analytics.js'

const LANGUAGE_OPTIONS = ['English', 'Arabic', 'Hindi', 'Urdu', 'Tamil', 'Malayalam', 'Bengali', 'French']
const TRADITION_OPTIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jewish', 'Humanist / non-religious', 'Other family tradition']

function ToggleChip({ selected, onClick, children, accent }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className="min-h-10 rounded-lg border px-3 py-2 font-round text-xs font-black"
      style={{
        background: selected ? accent : '#fff',
        borderColor: selected ? accent : `${accent}45`,
        color: selected ? '#fff' : '#392b45',
      }}
    >
      {children}
    </button>
  )
}

function ListInput({ id, label, value, placeholder, onChange, onAdd, accent }) {
  return (
    <div>
      <label htmlFor={id} className="font-round text-xs font-black text-[#4a3c54]">{label}</label>
      <div className="mt-1 flex gap-2">
        <input
          id={id}
          value={value}
          maxLength={60}
          placeholder={placeholder}
          onChange={event => onChange(event.target.value)}
          onKeyDown={event => {
            if (event.key !== 'Enter') return
            event.preventDefault()
            onAdd()
          }}
          className="min-h-11 min-w-0 flex-1 rounded-lg border bg-white px-3 font-round text-sm font-bold outline-none"
          style={{ borderColor: `${accent}55`, color: '#30243a' }}
        />
        <button type="button" onClick={onAdd} className="min-h-11 rounded-lg px-4 font-round text-sm font-black text-white" style={{ background: accent }}>
          Add
        </button>
      </div>
    </div>
  )
}

export default function FoundationProfile({ progress = {}, profileName = 'your child', theme = {}, onUpdateProgress }) {
  const initial = useMemo(() => normalizeFoundationProfile(progress.foundationProfile), [progress.foundationProfile])
  const [draft, setDraft] = useState(initial)
  const [rootInput, setRootInput] = useState('')
  const [languageInput, setLanguageInput] = useState('')
  const [saved, setSaved] = useState(false)
  const accent = theme.primary || '#6d3db0'

  useEffect(() => setDraft(initial), [initial])

  const toggle = (field, value, max) => {
    setSaved(false)
    setDraft(current => {
      const exists = current[field].includes(value)
      const next = exists
        ? current[field].filter(item => item !== value)
        : current[field].length < max
          ? [...current[field], value]
          : current[field]
      return { ...current, [field]: next }
    })
  }

  const addCustom = (field, value, clear, max = 6) => {
    const clean = value.trim().replace(/\s+/g, ' ')
    if (!clean) return
    setSaved(false)
    setDraft(current => ({
      ...current,
      [field]: current[field].some(item => item.toLowerCase() === clean.toLowerCase()) || current[field].length >= max
        ? current[field]
        : [...current[field], clean],
    }))
    clear('')
  }

  const save = () => {
    const next = normalizeFoundationProfile({ ...draft, updatedAt: Date.now() })
    onUpdateProgress?.({
      foundationProfile: next,
      hideSacred: next.beliefMode === 'pause-faith',
    })
    setDraft(next)
    setSaved(true)
    trackEvent('foundation_profile_saved', {
      roots_count: next.roots.length,
      languages_count: next.languages.length,
      traditions_count: next.traditions.length,
      priorities_count: next.priorities.length,
      interests_count: next.interests.length,
      belief_mode: next.beliefMode,
      preview_mode: next.previewMode,
    })
  }

  return (
    <div className="px-4 pb-8" data-testid="foundation-profile">
      <section className="rounded-lg border bg-white/90 p-4 shadow" style={{ borderColor: `${accent}35` }}>
        <p className="font-round text-[10px] font-black uppercase tracking-[.16em]" style={{ color: accent }}>Personal learning foundation</p>
        <h2 className="mt-1 font-bubble text-2xl text-[#30243a]">What should Bloom understand about {profileName}?</h2>
        <p className="mt-2 font-round text-sm font-bold leading-relaxed text-[#74647d]">
          These choices guide future recommendations and help Bloom represent your family accurately. They are never shown as a score.
        </p>
      </section>

      <section className="mt-3 rounded-lg bg-white/90 p-4 shadow">
        <h3 className="font-bubble text-lg text-[#30243a]">Family roots and languages</h3>
        <p className="mt-1 font-round text-xs font-bold text-[#74647d]">Add countries, regions, cities, or communities that matter to your family.</p>
        <div className="mt-3">
          <ListInput id="foundation-roots" label="Family places and roots" value={rootInput} placeholder="For example: Kerala, Dubai, Kenya" onChange={setRootInput} onAdd={() => addCustom('roots', rootInput, setRootInput)} accent={accent} />
        </div>
        {draft.roots.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{draft.roots.map(item => <ToggleChip key={item} selected onClick={() => toggle('roots', item, 6)} accent={accent}>{item} ×</ToggleChip>)}</div>}

        <p className="mt-4 font-round text-xs font-black text-[#4a3c54]">Languages heard or spoken at home</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {LANGUAGE_OPTIONS.map(language => <ToggleChip key={language} selected={draft.languages.includes(language)} onClick={() => toggle('languages', language, 6)} accent={accent}>{language}</ToggleChip>)}
        </div>
        <div className="mt-3">
          <ListInput id="foundation-language" label="Another language" value={languageInput} placeholder="Add a home language" onChange={setLanguageInput} onAdd={() => addCustom('languages', languageInput, setLanguageInput)} accent={accent} />
        </div>
      </section>

      <section className="mt-3 rounded-lg bg-white/90 p-4 shadow">
        <h3 className="font-bubble text-lg text-[#30243a]">Traditions and worldviews</h3>
        <p className="mt-1 font-round text-xs font-bold leading-relaxed text-[#74647d]">
          Choose what is part of family life. Bloom will still describe every tradition respectfully and by name.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TRADITION_OPTIONS.map(tradition => <ToggleChip key={tradition} selected={draft.traditions.includes(tradition)} onClick={() => toggle('traditions', tradition, 8)} accent={accent}>{tradition}</ToggleChip>)}
        </div>

        <label htmlFor="foundation-belief-mode" className="mt-4 block font-round text-xs font-black text-[#4a3c54]">How should Bloom handle faith and worldview content?</label>
        <select id="foundation-belief-mode" value={draft.beliefMode} onChange={event => { setSaved(false); setDraft(current => ({ ...current, beliefMode: event.target.value })) }} className="mt-1 min-h-11 w-full rounded-lg border bg-white px-3 font-round text-sm font-bold" style={{ borderColor: `${accent}55`, color: '#30243a' }}>
          <option value="family-and-world">Connect family roots and teach other traditions respectfully</option>
          <option value="world-overview">Teach a balanced overview of world traditions</option>
          <option value="pause-faith">Pause faith-based stories for this profile</option>
        </select>

        <label htmlFor="foundation-preview-mode" className="mt-3 block font-round text-xs font-black text-[#4a3c54]">Parent preview</label>
        <select id="foundation-preview-mode" value={draft.previewMode} onChange={event => { setSaved(false); setDraft(current => ({ ...current, previewMode: event.target.value })) }} className="mt-1 min-h-11 w-full rounded-lg border bg-white px-3 font-round text-sm font-bold" style={{ borderColor: `${accent}55`, color: '#30243a' }}>
          <option value="standard">Use Bloom's reviewed age-appropriate content</option>
          <option value="preview-roots">Let me preview roots, culture, and faith lessons</option>
          <option value="preview-all">Let me preview all new foundation topics</option>
        </select>
      </section>

      <section className="mt-3 rounded-lg bg-white/90 p-4 shadow">
        <h3 className="font-bubble text-lg text-[#30243a]">Foundation priorities</h3>
        <p className="mt-1 font-round text-xs font-bold text-[#74647d]">Choose up to three areas to strengthen. Bloom will still keep learning balanced.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {FOUNDATION_STRANDS.map(strand => <ToggleChip key={strand.id} selected={draft.priorities.includes(strand.id)} onClick={() => toggle('priorities', strand.id, 3)} accent={accent}>{strand.name}</ToggleChip>)}
        </div>
      </section>

      <section className="mt-3 rounded-lg bg-white/90 p-4 shadow">
        <h3 className="font-bubble text-lg text-[#30243a]">Topics that spark interest</h3>
        <p className="mt-1 font-round text-xs font-bold text-[#74647d]">Choose up to five. These shape examples and recommendations, not the child's entire curriculum.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {FOUNDATION_ARCS.map(arc => <ToggleChip key={arc.id} selected={draft.interests.includes(arc.id)} onClick={() => toggle('interests', arc.id, 5)} accent={accent}>{arc.name}</ToggleChip>)}
        </div>
        <label htmlFor="foundation-notes" className="mt-4 block font-round text-xs font-black text-[#4a3c54]">Anything else we should understand?</label>
        <textarea id="foundation-notes" value={draft.notes} maxLength={500} rows={3} onChange={event => { setSaved(false); setDraft(current => ({ ...current, notes: event.target.value })) }} placeholder="Questions they often ask, family stories to connect, or areas needing care" className="mt-1 w-full resize-y rounded-lg border bg-white p-3 font-round text-sm font-bold outline-none" style={{ borderColor: `${accent}55`, color: '#30243a' }} />
      </section>

      <button type="button" onClick={save} className="mt-4 min-h-12 w-full rounded-lg font-round text-base font-black text-white shadow-lg" style={{ background: accent }}>
        {saved ? 'Foundation profile saved' : 'Save foundation profile'}
      </button>
    </div>
  )
}
