import { useEffect, useState } from 'react'
import FloatDiscovery from '../modules/FloatDiscovery.jsx'
import { normalizeFloatDiscovery } from '../utils/floatDiscovery.js'
const KEY = 'bloom_guest_float_v1'
export default function PlayFloat() {
  const [progress, update] = useState(() => { try { const value = JSON.parse(localStorage.getItem(KEY)); return { floatDiscovery: normalizeFloatDiscovery(value?.floatDiscovery), sessions: [] } } catch { return {} } })
  const [saved, setSaved] = useState(true)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(progress)); setSaved(true) } catch { setSaved(false) } }, [progress])
  return <><div style={{padding:'8px 20px',textAlign:'center',background:'#245747',color:'white',fontSize:13}}>FREE DISCOVERY · NO ACCOUNT NEEDED</div>{!saved && <p role="status">Your browser could not save. Keep this page open to continue.</p>}<FloatDiscovery progress={progress} update={update} guest onBack={()=>{window.location.href='/play'}}/></>
}
