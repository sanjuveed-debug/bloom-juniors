import { useEffect, useState } from 'react'
import ShadowDiscovery from '../modules/ShadowDiscovery.jsx'
import { normalizeShadowDiscovery } from '../utils/shadowDiscovery.js'
import GuestParentNext from '../components/GuestParentNext.jsx'
import useSampleFunnel from '../hooks/useSampleFunnel.js'
const KEY='bloom_guest_shadow_v1'
export default function PlayShadow(){
 const [progress,update]=useState(()=>{try{const value=JSON.parse(localStorage.getItem(KEY));return {shadowDiscovery:normalizeShadowDiscovery(value?.shadowDiscovery),sessions:Array.isArray(value?.sessions)?value.sessions:[]}}catch{return {}}})
 const [saved,setSaved]=useState(true)
 const complete=progress.shadowDiscovery?.phase==='complete'
 useSampleFunnel('shadow',progress.shadowDiscovery?.updatedAt>0,complete)
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(progress));setSaved(true)}catch{setSaved(false)}},[progress])
 return <><div style={{padding:'8px 20px',textAlign:'center',background:'#30334b',color:'white',fontSize:13}}>FREE DISCOVERY · NO ACCOUNT NEEDED</div>{!saved&&<p role="status">Your browser could not save. Keep this page open to continue.</p>}<ShadowDiscovery progress={progress} update={update} guest onBack={()=>{window.location.href='/play/float'}}/>{complete&&<GuestParentNext sample="shadow"/>}</>
}
