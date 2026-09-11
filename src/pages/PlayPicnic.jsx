import {useEffect,useState} from 'react'
import CollectionAdventure from '../modules/CollectionAdventure.jsx'
import CollectionParentSummary from '../components/CollectionParentSummary.jsx'
import {normalizeCollection} from '../utils/collectionAdventure.js'
import './play-picnic.css'
import GuestParentNext from '../components/GuestParentNext.jsx'
import useSampleFunnel from '../hooks/useSampleFunnel.js'
const KEY='bloom_guest_snacks_v1'
function load(){try{const p=JSON.parse(localStorage.getItem(KEY));return {collectionAdventures:{snacks:normalizeCollection(p?.collectionAdventures?.snacks,'snacks')},sessions:[]}}catch{return {}}}
export default function PlayPicnic(){
 const [progress,setProgress]=useState(load),[recap,setRecap]=useState(false),[saved,setSaved]=useState(true)
 const complete=progress.collectionAdventures?.snacks?.state?.phase==='complete'
 useSampleFunnel('picnic',progress.collectionAdventures?.snacks?.updatedAt>0,complete)
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(progress));setSaved(true)}catch{setSaved(false)}},[progress])
 return <div className="guest-picnic"><div className="guest-bar"><span>FREE PLAY SAMPLE · AGES 4–6</span><a href="/?app=1">Parent account ↗</a></div>{!saved&&<p className="guest-save-warning" role="status">This browser could not save your sample. Keep this tab open to continue.</p>}
 {recap?<main className="guest-recap"><p className="guest-eyebrow">FOR THE GROWN-UP BESIDE THEM</p><h1>A little discovery, together.</h1><CollectionParentSummary progress={progress}/><div className="guest-next"><h2>What felt confusing?</h2><p>One observation helps us improve Bloom. No call or child recording needed.</p><a className="collection-primary" href="mailto:sanju@bloomjuniors.com?subject=Picnic%20sample%20feedback&body=One%20thing%20that%20felt%20confusing%3A%20">Tell Sanju by email ↗</a><p className="guest-small">Opens your email app. Please leave out your child's name and other personal details.</p><h2>Try a water wonder</h2><p>Predict, drop and listen with Bumi.</p><a className="collection-primary" href="/play/float">Will it float? →</a><button className="collection-secondary" onClick={()=>setRecap(false)}>Back to our picnic</button></div></main>:<CollectionAdventure id="snacks" progress={progress} update={setProgress} guest onBack={()=>{window.location.href='/'}} onNext={()=>{setRecap(true);window.scrollTo(0,0)}}/>}
 {complete&&<GuestParentNext sample="picnic"/>}</div>
}
