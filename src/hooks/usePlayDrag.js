import {useEffect,useRef,useState} from 'react'

// Pointer capture keeps mouse/touch/pen on one path. Only the drag source blocks
// touch scrolling; the rest of the page scrolls normally.
export function usePlayDrag({enabled=true,onDrop,scope}) {
 const [ghost,setGhost]=useState(null),[over,setOver]=useState(null)
 const drag=useRef(null),frame=useRef(0),suppress=useRef(false),latest=useRef({enabled,onDrop,scope})
 latest.current={enabled,onDrop,scope}
 const targetAt=(x,y)=>{
  const target=document.elementFromPoint(x,y)?.closest('[data-play-drop]')
  return target&&(!latest.current.scope?.current||latest.current.scope.current.contains(target))?target:null
 }
 const cancel=()=>{if(drag.current?.moved)suppress.current=true;drag.current=null;cancelAnimationFrame(frame.current);setGhost(null);setOver(null)}
 useEffect(()=>{window.addEventListener('blur',cancel);return()=>{window.removeEventListener('blur',cancel);cancelAnimationFrame(frame.current);drag.current=null}},[])
 useEffect(()=>{if(!enabled)cancel()},[enabled])
 const tick=()=>{
  const d=drag.current;if(!d?.moved)return
  const edge=65,step=d.y<edge?-9:d.y>innerHeight-edge?9:0
  if(step)window.scrollBy(0,step)
  setOver(targetAt(d.x,d.y)?.dataset.playDrop??null)
  frame.current=requestAnimationFrame(tick)
 }
 const bind=payload=>({
  onPointerDown:e=>{
   if(!latest.current.enabled||e.button!==0||!e.isPrimary||drag.current)return
   suppress.current=false
   drag.current={payload,startX:e.clientX,startY:e.clientY,x:e.clientX,y:e.clientY,pointerId:e.pointerId,moved:false}
   e.currentTarget.setPointerCapture(e.pointerId)
  },
  onPointerMove:e=>{
   const d=drag.current;if(!d||d.pointerId!==e.pointerId)return
   d.x=e.clientX;d.y=e.clientY
   if(!d.moved&&Math.hypot(d.x-d.startX,d.y-d.startY)>8){d.moved=true;frame.current=requestAnimationFrame(tick)}
   if(d.moved){e.preventDefault();setGhost({x:d.x,y:d.y,payload:d.payload})}
  },
  onPointerUp:e=>{
   const d=drag.current;if(!d||d.pointerId!==e.pointerId)return
   if(d.moved&&latest.current.enabled){const target=targetAt(e.clientX,e.clientY);if(target)latest.current.onDrop(d.payload,target.dataset.playDrop)}
   cancel()
  },
  onPointerCancel:cancel,
  onLostPointerCapture:()=>{if(drag.current)cancel()},
  onClickCapture:e=>{if(suppress.current){suppress.current=false;e.preventDefault();e.stopPropagation()}},
 })
 return {bind,ghost,over,cancel}
}
