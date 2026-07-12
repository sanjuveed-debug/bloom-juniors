import React from 'react'
import { motion } from 'framer-motion'

export const TREASURE_ITEMS=[
  {id:'explorer-dolly',name:'Explorer Yaagvi Dolly',kind:'dolly',image:'/yaagvi-3d-wave.png',video:'/yaagvi-3d-wave.webm',message:'Your very own explorer dolly! She can join every new adventure.'},
  {id:'rainbow-backpack',name:'Rainbow Adventure Bag',emoji:'🎒',message:'A magical bag for carrying clues and discoveries.'},
  {id:'moon-fox',name:'Starlight Fox',emoji:'🦊',message:'A tiny glowing friend hatched from the moon egg.'},
  {id:'junior-telescope',name:'Explorer Telescope',emoji:'🔭',message:'Use it to search for the next hidden world.'},
  {id:'jungle-elephant',name:'Pocket Elephant',emoji:'🐘',message:'A gentle jungle friend who remembers every trail.'},
  {id:'story-crown',name:'Storymaker Crown',emoji:'👑',message:'For brave readers and brilliant storytellers.'},
]

export function nextTreasure(collection=[]){
  const ids=new Set(collection.map(x=>x.id))
  const namedTreasure=TREASURE_ITEMS.find(x=>!ids.has(x.id))
  if(namedTreasure)return namedTreasure
  const crystalNumber=collection.filter(item=>item.id?.startsWith('star-crystal-')).length+1
  return {id:`star-crystal-${crystalNumber}`,name:`Star Crystal ${crystalNumber}`,emoji:'💎',message:'A brand-new crystal for your growing explorer collection.'}
}

function TreasureArt({item,size='large'}){
  if(item?.video)return <video autoPlay muted loop playsInline preload="metadata" poster={item.image} aria-label={item.name} className={`${size==='large'?'h-64 w-52':'h-20 w-16'} object-contain drop-shadow-2xl`}><source src={item.video} type="video/webm"/></video>
  if(item?.image)return <img src={item.image} alt={item.name} className={`${size==='large'?'h-64 w-52':'h-20 w-16'} object-contain drop-shadow-2xl`}/>
  return <span className={size==='large'?'text-9xl':'text-5xl'}>{item?.emoji||'🎁'}</span>
}

export function TreasureChestReward({item,onClose}){
  return <motion.div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#1c0c2d]/85 p-4 backdrop-blur-md" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
    <motion.div className="relative w-full max-w-lg overflow-hidden rounded-[34px] border-4 border-[#ffe29a] bg-gradient-to-b from-[#fff5cf] to-[#ffc75b] p-6 text-center shadow-2xl" initial={{scale:.55,y:80}} animate={{scale:1,y:0}} transition={{type:'spring',stiffness:220,damping:16}}>
      <motion.div className="text-8xl" initial={{scale:1}} animate={{scale:[1,1.15,.9,1],rotate:[0,-4,4,0]}} transition={{duration:1.1}}>🧰</motion.div>
      <motion.div className="mx-auto -mt-5 flex min-h-64 items-center justify-center" initial={{opacity:0,scale:.3,y:40}} animate={{opacity:1,scale:1,y:0}} transition={{delay:.7,type:'spring'}}><TreasureArt item={item}/></motion.div>
      <p className="font-round text-xs font-black uppercase tracking-[.2em] text-[#9a3412]">You found a real treasure!</p><h2 className="mt-1 font-bubble text-3xl text-[#3b1607]">{item?.name}</h2><p className="mx-auto mt-2 max-w-sm font-round text-sm font-bold text-[#7a4525]">{item?.message}</p>
      <motion.button whileTap={{scale:.95}} onClick={onClose} className="mt-5 min-h-14 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 font-bubble text-xl text-white shadow-lg">PUT IT ON MY SHELF →</motion.button>
    </motion.div>
  </motion.div>
}

export function TreasureShelf({collection=[],onClose}){
  const namedIds=new Set(TREASURE_ITEMS.map(item=>item.id))
  const shelfItems=[...TREASURE_ITEMS,...collection.filter(item=>!namedIds.has(item.id))]
  return <motion.div className="fixed inset-0 z-[290] overflow-y-auto bg-[#fff0d6] p-5" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><div className="mx-auto max-w-4xl"><div className="flex items-center justify-between"><div><p className="font-round text-xs font-black uppercase tracking-[.2em] text-[#a34820]">Things I really earned</p><h2 className="font-bubble text-3xl text-[#3b1607]">My Treasure Shelf</h2></div><button onClick={onClose} className="h-12 rounded-full bg-white px-5 font-bubble shadow">Back</button></div><div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">{shelfItems.map(item=>{const owned=collection.some(x=>x.id===item.id);return <div key={item.id} className={`flex min-h-48 flex-col items-center justify-center rounded-3xl border-2 p-4 text-center ${owned?'border-[#f59e0b] bg-white shadow-lg':'border-[#8a5b3a]/10 bg-[#e9dcc8] grayscale'}`}><TreasureArt item={item} size="small"/><p className="mt-2 font-bubble text-sm text-[#3b1607]">{owned?item.name:'Mystery treasure'}</p><p className="font-round text-[10px] font-bold text-[#8a5b3a]">{owned?'OWNED':'KEEP EXPLORING'}</p></div>})}</div></div></motion.div>
}

export function TreasureShelfButton({count=0,onClick}){return <motion.button whileTap={{scale:.95}} onClick={onClick} className="mx-auto mt-4 flex w-[calc(100%-2rem)] max-w-6xl items-center gap-3 rounded-2xl border-2 border-[#d58a46]/35 bg-[#fff7e6] p-3 text-left shadow"><span className="text-4xl">🧸</span><span className="flex-1"><span className="block font-bubble text-lg text-[#3b1607]">My Treasure Shelf</span><span className="block font-round text-xs font-bold text-[#8a5b3a]">{count?`${count} real treasure${count===1?'':'s'} earned`:'Your first treasure is waiting'}</span></span><span className="font-bubble text-xl text-[#a34820]">→</span></motion.button>}
