import React from 'react'
import { motion } from 'framer-motion'
import { formatLocalDate } from '../utils/date.js'

const COLOURS = {
  blue: { label: 'Jungle teal', main: '#0F766E', glow: '#2DD4BF' },
  pink: { label: 'Sunset orange', main: '#C2410C', glow: '#FB923C' },
}

function LegacySkyship({ powered, colour = 'blue' }) {
  const engine = COLOURS[colour] || COLOURS.blue
  return (
    <div className="relative mx-auto mt-4 h-64 w-full overflow-hidden rounded-[28px] border border-white/15"
      style={{ background: 'linear-gradient(180deg,#1E1B4B 0%,#4C1D95 55%,#9A3412 100%)' }}>
      {[0,1,2,3,4,5].map(i => <motion.span key={`star-${i}`} className="absolute text-yellow-200"
        style={{ left: `${8 + i * 17}%`, top: `${10 + (i % 3) * 20}%`, fontSize: 8 + (i % 2) * 5 }}
        animate={{ opacity: [.25,1,.25], scale: [.7,1.3,.7] }} transition={{ duration: 1.4 + i*.2, repeat: Infinity }}>✦</motion.span>)}
      {[0, 1, 2, 3].map(i => (
        <motion.div key={i} className="absolute rounded-full bg-white/70"
          style={{ width: 65 + i * 18, height: 16 + i * 3, left: `${-8 + i * 29}%`, top: `${45 + (i % 2) * 28}%`, opacity: .3 }}
          animate={{ x: [-80, 120] }} transition={{ duration: 9 + i, repeat: Infinity, repeatType: 'loop', ease: 'linear' }} />
      ))}
      <motion.div className="absolute left-1/2 top-12 -translate-x-1/2"
        animate={powered ? { y: [0,-7,0], rotate: [-.6,.6,-.6] } : { y: [0,3,0] }}
        transition={{ duration: powered ? 2.6 : 3.8, repeat: Infinity, ease: 'easeInOut' }}>
        <div className="relative h-36 w-64">
          <div className="absolute left-16 top-8 h-20 w-32 rounded-[48%_48%_38%_38%] border-4 border-orange-100" style={{ background: 'linear-gradient(160deg,#FB923C,#C2410C)' }} />
          <div className="absolute left-[102px] top-1 h-14 w-16 overflow-hidden rounded-t-[32px] border-4 border-orange-100"
            style={{ background: 'linear-gradient(180deg,#67E8F9,#0F766E)' }}>
            <div className="absolute inset-x-2 bottom-0 h-7 rounded-t-full bg-slate-900/45" />
            <motion.img src="/yaagvi-poses/wave.png" alt="Yaagvi piloting the skyship"
              className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition:'50% 12%' }}
              animate={{ y:[1,-1,1], rotate:[-.5,.5,-.5] }} transition={{duration:2,repeat:Infinity}} />
          </div>
          <div className="absolute left-1 top-[70px] h-10 w-20 rounded-full border-4 border-white/60" style={{ background: engine.main }} />
          <div className="absolute right-1 top-[70px] h-10 w-20 rounded-full border-4 border-white/60" style={{ background: engine.main }} />
          <div className="absolute left-[112px] top-[82px] h-14 w-10 rounded-b-2xl border-4 border-white/60" style={{ background: engine.main }} />
          {powered && <motion.div className="absolute left-[119px] top-[128px] h-12 w-6 rounded-b-full"
            style={{ background: `linear-gradient(${engine.glow},#FDE047,transparent)` }}
            animate={{ scaleY: [.65, 1.15, .65], opacity: [.7, 1, .7] }} transition={{ duration: .35, repeat: Infinity }} />}
          <motion.div className="absolute left-[36px] top-[-18px] h-9 w-48 origin-center"
            animate={{ rotate: powered ? 360 : [0,3,-3,0] }}
            transition={{ duration: powered ? .7 : 3.5, repeat: Infinity, ease: powered ? 'linear' : 'easeInOut' }}>
            <div className="absolute left-1/2 top-2 h-7 w-2 -translate-x-1/2 rounded-full bg-orange-100" />
            <div className="absolute left-0 top-0 h-2 w-full rounded-full bg-orange-100 shadow" />
          </motion.div>
          {powered && [0,1,2].map(i => <motion.span key={i} className="absolute top-[128px] text-yellow-300"
            style={{ left: 108 + i*12 }} animate={{ y: [0,35], opacity: [1,0], scale: [1,.3] }}
            transition={{ duration: 1, delay: i*.22, repeat: Infinity }}>✦</motion.span>)}
        </div>
      </motion.div>
      <motion.div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-3xl"
        animate={{ x: [-110,110], y: [0,-12,0], rotate: [0,180,360] }} transition={{ duration: powered ? 5 : 7, repeat: Infinity, ease: 'easeInOut' }}>⭐</motion.div>
    </div>
  )
}

function Skyship({ powered }) {
  return (
    <div className="relative mx-auto mt-4 aspect-[16/9] w-full overflow-hidden rounded-[28px] border border-orange-200 bg-[#1E1B4B]">
      <motion.img
        src="/skyship-yaagvi.png"
        alt="Yaagvi flying her magical Skyship"
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1.04 }}
        animate={{ scale: powered ? [1.04, 1.075, 1.04] : [1.04, 1.055, 1.04], y: powered ? [0, -4, 0] : [0, -2, 0] }}
        transition={{ duration: powered ? 4.5 : 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1E1B4B]/25 via-transparent to-transparent" />
      {powered && [0,1,2,3].map(i => (
        <motion.span key={i} className="absolute text-yellow-200"
          style={{ left:`${12+i*23}%`, top:`${18+(i%2)*52}%`, fontSize:18+i*2 }}
          animate={{ opacity:[0,1,0], scale:[.5,1.3,.5], rotate:[0,180] }}
          transition={{ duration:2.2, delay:i*.45, repeat:Infinity }}>✦</motion.span>
      ))}
    </div>
  )
}

export default function SkyshipAdventure({ progress, profileName, onNavigate, onUpdateProgress }) {
  const today = formatLocalDate()
  const skyship = progress.adventure?.skyship || {}
  const started = skyship.engineMissionStarted === today
  const mathsDone = (progress.sessions || []).some(session =>
    session.module === 'math' && session.date > (skyship.engineMissionStartedAt || 0)
  )
  const complete = Boolean(skyship.engineColour)
  const rewardReady = started && mathsDone && !complete
  const cells = complete || rewardReady ? 5 : started ? 2 : 0

  const save = patch => onUpdateProgress?.({ adventure: { ...(progress.adventure || {}), skyship: { ...skyship, ...patch } } })
  const start = () => {
    save({ engineMissionStarted: today, engineMissionStartedAt: Date.now() })
    onNavigate('math')
  }
  const choose = engineColour => save({ engineColour, engineCompletedAt: Date.now(), chapter: 2 })

  return (
    <section className="mx-auto mt-5 max-w-6xl px-4 md:px-6 xl:px-8">
      <div className="overflow-hidden rounded-[34px] border-2 p-5 shadow-xl" style={{ background: 'linear-gradient(160deg,#FFF7ED,#FFEDD5)', borderColor: 'rgba(194,65,12,.22)', boxShadow: '0 18px 50px rgba(66,32,6,.12)' }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-round text-xs font-black uppercase tracking-[0.18em]" style={{ color:'#C2410C' }}>Yaagvi's Skyship · Chapter 1</p>
            <h2 className="font-bubble mt-1 text-3xl leading-tight" style={{ color:'#422006' }}>{complete ? 'The engine is alive!' : rewardReady ? 'You powered the engine!' : 'Repair the magic engine'}</h2>
            <p className="font-round mt-2 text-sm font-bold leading-6" style={{ color:'rgba(66,32,6,.68)' }}>
              {complete ? `Amazing, ${profileName || 'pilot'}! Your ship remembers its new engine.` : rewardReady ? 'All five power cells are glowing. Choose your engine colour.' : 'Complete one Number World mission to charge five glowing cells.'}
            </p>
          </div>
          <motion.span className="text-4xl" animate={{ y:[0,-5,0], rotate: [-8,8,-8] }} transition={{ duration: 1.5, repeat: Infinity }}>🛩️</motion.span>
        </div>
        <Skyship powered={complete || rewardReady} colour={skyship.engineColour || 'blue'} />
        <div className="mb-4 flex justify-center gap-2" aria-label={`${cells} of 5 engine cells charged`}>
          {[0,1,2,3,4].map(i => <motion.div key={i} className="flex h-9 w-9 items-center justify-center rounded-xl border-2"
            style={{ background: i < cells ? '#FDE047' : 'rgba(255,255,255,.45)', borderColor: i < cells ? '#F59E0B' : 'rgba(255,255,255,.7)' }}
            animate={i < cells ? { scale: [1,1.12,1], boxShadow: ['0 0 0 #FDE047','0 0 18px #FDE047','0 0 0 #FDE047'] } : {}}
            transition={{ delay: i * .12, duration: 1.5, repeat: Infinity }}>⚡</motion.div>)}
        </div>
        {rewardReady ? <div className="grid grid-cols-2 gap-3">{Object.entries(COLOURS).map(([id, option]) =>
          <motion.button key={id} whileTap={{ scale: .94 }} onClick={() => choose(id)} className="rounded-2xl border-2 border-white/70 px-3 py-4 font-bubble text-white shadow-lg" style={{ background: `linear-gradient(135deg,${option.main},${option.glow})` }}>{option.label}</motion.button>)}</div>
          : complete ? <><button type="button" onClick={() => onNavigate('math')} className="w-full rounded-2xl bg-white px-5 py-3 font-bubble" style={{ color:'#9A3412', border:'1px solid rgba(194,65,12,.18)' }}>Replay Number World</button>
            <div className="mt-3 rounded-2xl bg-slate-900/75 px-4 py-3 text-center"><p className="font-round text-xs font-black uppercase tracking-wider text-sky-200">Next chapter</p><p className="font-bubble mt-1 text-white">Build the wings and prepare for take-off</p></div></>
          : <motion.button whileTap={{ scale: .96 }} onClick={start} className="w-full rounded-2xl px-5 py-4 font-bubble text-xl text-white shadow-xl" style={{ background: 'linear-gradient(135deg,#C2410C,#F97316)' }}>{started ? 'Continue Number Mission →' : 'Start Engine Mission →'}</motion.button>}
      </div>
    </section>
  )
}
