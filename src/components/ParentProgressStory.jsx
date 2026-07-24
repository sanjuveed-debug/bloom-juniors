import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { buildParentProgressStory } from '../utils/parentProgressStory.js'
import { shareParentStoryCard } from '../utils/parentStoryCardImage.js'
import ParentHighFiveComposer from './ParentHighFiveComposer.jsx'

function Stat({ value, label, note, color }) {
  return (
    <div className="rounded-2xl p-3 min-w-0" style={{ background: `${color}12`, border: `1.5px solid ${color}35` }}>
      <p className="font-bubble text-2xl leading-none" style={{ color }}>{value}</p>
      <p className="mt-1 font-round text-xs font-black text-slate-800">{label}</p>
      {note && <p className="mt-0.5 font-round text-[10px] text-slate-500">{note}</p>}
    </div>
  )
}

function SkillCard({ title, skill, empty, color }) {
  return (
    <div className="rounded-3xl p-4" style={{ background: `${color}0D`, border: `1.5px solid ${color}30` }}>
      <p className="font-round text-[10px] font-black uppercase tracking-[0.16em]" style={{ color }}>{title}</p>
      <div className="mt-2 flex items-center gap-3">
        <span className="text-3xl" aria-hidden="true">{skill?.emoji || '🌱'}</span>
        <div className="min-w-0 flex-1">
          <p className="font-bubble text-base text-slate-900">{skill?.label || empty}</p>
          {skill?.accuracy != null && (
            <p className="font-round text-xs text-slate-500">{skill.accuracy}% learning confidence</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ParentProgressStory({ progress = {}, profileName = 'Your child', ageGroup = 'early', theme = {}, now, onUpdateProgress }) {
  const story = useMemo(
    () => buildParentProgressStory(progress, profileName, ageGroup, now),
    [progress, profileName, ageGroup, now],
  )
  const [shareStatus, setShareStatus] = useState('idle')
  const primary = theme.primary || '#7C3AED'
  const accent = theme.accent || '#F9738A'

  const share = async () => {
    if (shareStatus === 'working') return
    setShareStatus('working')
    try {
      const result = await shareParentStoryCard(story, profileName)
      setShareStatus(result)
    } catch (error) {
      if (error?.name === 'AbortError') setShareStatus('idle')
      else setShareStatus('error')
    }
  }

  return (
    <div className="px-4 pb-8" data-testid="parent-progress-story">
      <motion.section
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] shadow-xl"
        style={{ background: `linear-gradient(135deg, #2E1065 0%, ${primary} 58%, ${accent} 130%)` }}
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-amber-200/10" />
        <div className="relative grid gap-5 p-5 sm:p-7 md:grid-cols-[1fr_220px] md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-amber-200 px-3 py-1 font-round text-[10px] font-black uppercase tracking-widest text-violet-950">
                This week's learning story
              </span>
              <span className="font-round text-xs font-bold text-white/70">{story.period}</span>
            </div>
            <h2 className="mt-4 max-w-2xl font-bubble text-3xl leading-tight text-white sm:text-4xl" data-testid="story-headline">
              {story.headline}
            </h2>
            <p className="mt-3 max-w-2xl font-round text-sm leading-6 text-white/85">{story.narrative}</p>
            <div className="mt-4 inline-flex rounded-2xl bg-white/12 px-4 py-2 font-round text-xs font-black text-amber-100">
              {story.celebration}
            </div>
          </div>
          <div className="relative mx-auto h-52 w-48 shrink-0 md:mx-0">
            <div className="absolute inset-5 rounded-full bg-amber-200/25 blur-xl" />
            <img
              src={story.companion.companion.image || '/yaagvi-3d-wave.png'}
              alt={`${story.companion.companion.name}, learning companion`}
              className="relative h-full w-full object-contain drop-shadow-2xl"
            />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-center font-round text-[10px] font-black text-violet-900 shadow">
              {story.companion.stage.accessory} {story.companion.stage.name}
            </div>
          </div>
        </div>
      </motion.section>

      <div className="mx-auto mt-4 grid max-w-5xl grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat value={story.current.sessions} label="Adventures" note={story.trend > 0 ? `+${story.trend} vs last week` : story.trend < 0 ? 'A gentler week' : 'This week'} color="#7C3AED" />
        <Stat value={story.current.activeDays} label="Active days" note="in the last 7 days" color="#0F9F78" />
        <Stat value={story.current.stars} label="Stars earned" note={`${story.treasures.owned} treasures owned`} color="#EA580C" />
        <Stat value={story.current.accuracy == null ? '—' : `${story.current.accuracy}%`} label="Accuracy" note={story.current.accuracy == null ? 'Appears after scored play' : 'across scored adventures'} color="#2563EB" />
      </div>

      <section className="mx-auto mt-4 max-w-5xl rounded-[2rem] bg-white/90 p-5 shadow-lg sm:p-6" style={{ border: `1px solid ${primary}20` }}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-round text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: primary }}>What the play is telling us</p>
            <h3 className="mt-1 font-bubble text-2xl text-slate-900">A clear picture, not a scorecard</h3>
          </div>
          <p className="font-round text-xs font-bold text-slate-500">{story.ageLabel}</p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <SkillCard title="Growing strength" skill={story.skills.strongest} empty="Complete one adventure to reveal it" color="#16A34A" />
          <SkillCard title="Best next step" skill={story.skills.developing} empty="A gentle starting point" color="#EA580C" />
          <SkillCard title="Favourite place" skill={story.skills.favourite} empty="Waiting to be discovered" color="#7C3AED" />
        </div>
      </section>

      <section className="mx-auto mt-4 grid max-w-5xl gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] bg-white/90 p-5 shadow-lg sm:p-6">
          <p className="font-round text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Three things to try together</p>
          <h3 className="mt-1 font-bubble text-2xl text-slate-900">Five-minute home adventures</h3>
          <p className="mt-1 font-round text-xs text-slate-500">No worksheets and no extra purchase needed.</p>
          <div className="mt-4 space-y-3" data-testid="home-activities">
            {story.activities.map((activity, index) => (
              <div key={activity.id} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">{activity.emoji}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <p className="font-bubble text-sm text-slate-900">{index + 1}. {activity.title}</p>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-round text-[9px] font-black text-emerald-700">5 MIN</span>
                  </div>
                  <p className="mt-1 font-round text-xs leading-5 text-slate-600">{activity.instruction}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 font-round text-xs font-bold leading-5 text-amber-900">Parent tip: {story.parentTip}</p>
        </div>

        <div className="flex flex-col gap-4">
          <ParentHighFiveComposer
            progress={progress}
            profileName={profileName}
            onUpdateProgress={onUpdateProgress}
            primary={primary}
            accent={accent}
          />

          <div className="rounded-[2rem] bg-violet-950 p-5 text-white shadow-lg">
            <p className="font-round text-[10px] font-black uppercase tracking-[0.18em] text-violet-200">The world they are building</p>
            <h3 className="mt-2 font-bubble text-xl">{story.dream.project.name}</h3>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/15">
              <motion.div initial={{ width: 0 }} animate={{ width: `${story.dream.progressPercent}%` }} className="h-full rounded-full bg-gradient-to-r from-amber-300 to-pink-400" />
            </div>
            <div className="mt-2 flex justify-between font-round text-xs text-white/70">
              <span>{story.dream.state.stage} of {story.dream.project.stages.length} parts built</span>
              <span>{story.dream.progressPercent}%</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-white/10 p-3"><p className="font-bubble text-xl">{story.world.discoveries}</p><p className="font-round text-[10px] text-white/65">Secret World discoveries</p></div>
              <div className="rounded-2xl bg-white/10 p-3"><p className="font-bubble text-xl">{story.treasures.owned}</p><p className="font-round text-[10px] text-white/65">Real treasures collected</p></div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white/90 p-5 shadow-lg">
            <p className="font-round text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: primary }}>Keep the memory</p>
            <h3 className="mt-1 font-bubble text-xl text-slate-900">Share this week's win</h3>
            <p className="mt-1 font-round text-xs leading-5 text-slate-500">Creates a private image on this device. It does not include login details or answers.</p>
            <motion.button
              whileTap={{ scale: 0.97 }} onClick={share} disabled={shareStatus === 'working'}
              data-testid="share-parent-story"
              className="mt-4 w-full rounded-2xl py-3 font-bubble text-sm text-white shadow disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
            >
              {shareStatus === 'working' ? 'Creating card…' : shareStatus === 'shared' ? 'Shared ✓' : shareStatus === 'downloaded' ? 'Card saved ✓' : shareStatus === 'error' ? 'Try again' : 'Create achievement card'}
            </motion.button>
          </div>
        </div>
      </section>
    </div>
  )
}
