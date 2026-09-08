import { useId } from 'react'
import './yaagvi-rig.css'

// Each joint has its own pivot. Animation changes the drawing itself, not a PNG.
export default function YaagviRig({ pose = 'idle', speaking = false, paused = false, className = '', style }) {
  const uid = useId().replaceAll(':', '')
  const skin = `${uid}-skin`, hair = `${uid}-hair`, shirt = `${uid}-shirt`
  return <svg viewBox="0 0 240 300" role="img" aria-label="Yaagvi" className={`yaagvi-rig ${className}`} style={style} data-pose={pose} data-speaking={speaking} data-paused={paused}>
    <defs>
      <radialGradient id={skin} cx="38%" cy="30%" r="80%"><stop stopColor="#ffd39e"/><stop offset="1" stopColor="#eaa16e"/></radialGradient>
      <linearGradient id={hair} x2=".8" y2="1"><stop stopColor="#613c32"/><stop offset="1" stopColor="#261c27"/></linearGradient>
      <linearGradient id={shirt} x2=".7" y2="1"><stop stopColor="#fffdf4"/><stop offset="1" stopColor="#d5e7ed"/></linearGradient>
    </defs>
    <ellipse className="yr-shadow" cx="120" cy="282" rx="47" ry="8" fill="#302647" opacity=".16"/>
    <g className="yr-body">
      <g className="yr-leg yr-leg-left"><path d="M99 215L97 260" stroke="#e9a06c" strokeWidth="19" strokeLinecap="round"/><path d="M96 251L96 266" stroke="#fffaf2" strokeWidth="19"/><path d="M88 259Q106 256 107 276H77Q77 263 88 259" fill="#e65c87" stroke="#953853" strokeWidth="2"/><path d="M78 276H107" stroke="#fff8ed" strokeWidth="6"/><path d="M87 265H99" stroke="white" strokeWidth="3" strokeLinecap="round"/></g>
      <g className="yr-leg yr-leg-right"><path d="M141 215L143 260" stroke="#e9a06c" strokeWidth="19" strokeLinecap="round"/><path d="M143 251L143 266" stroke="#fffaf2" strokeWidth="19"/><path d="M134 260Q151 256 158 276H130Q128 265 134 260" fill="#e65c87" stroke="#953853" strokeWidth="2"/><path d="M130 276H158" stroke="#fff8ed" strokeWidth="6"/><path d="M137 265H149" stroke="white" strokeWidth="3" strokeLinecap="round"/></g>
      <path d="M88 199H152L155 230H125L120 214L115 230H85Z" fill="#3876a7" stroke="#28547b" strokeWidth="2"/>
      <path d="M95 144Q120 134 145 144L153 205Q120 216 87 205Z" fill={`url(#${shirt})`} stroke="#b9d1db" strokeWidth="2"/>
      <path d="M109 132V148Q120 158 131 148V132" fill={`url(#${skin})`}/>
      <path d="M104 146Q120 160 136 146" fill="none" stroke="white" strokeWidth="4"/>
      <circle cx="120" cy="181" r="16" fill="#7c56ad"/><path d="M120 168L124 177L134 178L126 185L128 195L120 190L111 195L113 185L106 178L116 177Z" fill="#ffe19a"/>
      <g className="yr-head">
        <g className="yr-tail yr-tail-left"><path d="M67 65Q19 58 31 117Q46 105 52 120Q74 104 69 83" fill={`url(#${hair})`}/><path d="M54 76Q37 83 40 106" fill="none" stroke="#895747" strokeWidth="3"/><ellipse cx="65" cy="80" rx="7" ry="13" fill="#eb7aa6"/></g>
        <g className="yr-tail yr-tail-right"><path d="M173 65Q221 58 209 117Q194 105 188 120Q166 104 171 83" fill={`url(#${hair})`}/><path d="M186 76Q203 83 200 106" fill="none" stroke="#895747" strokeWidth="3"/><ellipse cx="175" cy="80" rx="7" ry="13" fill="#eb7aa6"/></g>
        <ellipse cx="120" cy="72" rx="65" ry="62" fill={`url(#${hair})`}/>
        <ellipse cx="63" cy="94" rx="10" ry="15" fill={`url(#${skin})`}/><ellipse cx="177" cy="94" rx="10" ry="15" fill={`url(#${skin})`}/>
        <path d="M64 67Q67 27 120 28Q173 27 176 67L174 105Q169 144 120 148Q71 144 66 105Z" fill={`url(#${skin})`} stroke="#b87b55" strokeWidth="1.5"/>
        <path d="M60 78Q51 17 113 12Q177 3 181 79Q154 59 143 36L150 61Q129 46 119 29Q105 51 78 65L90 43Q73 55 60 78" fill={`url(#${hair})`}/>
        <path d="M77 36Q95 17 114 20M128 20Q153 24 167 47" fill="none" stroke="#90614d" strokeWidth="4" strokeLinecap="round" opacity=".65"/>
        <path className="yr-brow yr-brow-left" d="M77 76Q88 69 99 75" fill="none" stroke="#54332d" strokeWidth="4" strokeLinecap="round"/>
        <path className="yr-brow" d="M141 75Q152 69 163 76" fill="none" stroke="#54332d" strokeWidth="4" strokeLinecap="round"/>
        <g className="yr-eyes">
          <ellipse cx="89" cy="96" rx="16" ry="20" fill="#fffdf8"/><ellipse cx="151" cy="96" rx="16" ry="20" fill="#fffdf8"/>
          <g className="yr-gaze"><ellipse cx="91" cy="98" rx="11" ry="16" fill="#784628"/><ellipse cx="149" cy="98" rx="11" ry="16" fill="#784628"/><ellipse cx="92" cy="96" rx="7" ry="12" fill="#241f2c"/><ellipse cx="148" cy="96" rx="7" ry="12" fill="#241f2c"/><circle cx="95" cy="89" r="4" fill="white"/><circle cx="151" cy="89" r="4" fill="white"/><circle cx="88" cy="103" r="2" fill="#ffd99b"/><circle cx="144" cy="103" r="2" fill="#ffd99b"/></g>
          <path d="M74 85Q87 72 102 84M138 84Q152 72 166 85" fill="none" stroke="#332532" strokeWidth="3" strokeLinecap="round"/>
        </g>
        <ellipse cx="79" cy="119" rx="11" ry="5" fill="#e77a7b" opacity=".35"/><ellipse cx="161" cy="119" rx="11" ry="5" fill="#e77a7b" opacity=".35"/>
        <path d="M117 113Q120 118 124 113" fill="none" stroke="#d68e60" strokeWidth="2" strokeLinecap="round"/>
        <path className="yr-smile" d="M106 126Q120 138 134 126" fill="none" stroke="#90473b" strokeWidth="2.5" strokeLinecap="round"/>
        <g className="yr-mouth"><path d="M106 125Q120 130 134 125Q131 143 120 143Q109 143 106 125" fill="#663343"/><path d="M108 126Q120 130 132 126L130 131H110Z" fill="#fffaf0"/><ellipse cx="120" cy="140" rx="7" ry="3" fill="#ef8796"/></g>
      </g>
      <g className="yr-arm yr-arm-left"><path d="M87 158Q70 179 65 205" stroke={`url(#${skin})`} strokeWidth="17" strokeLinecap="round"/><path d="M61 201Q53 210 59 221Q63 225 69 219L74 210" fill={`url(#${skin})`} stroke="#c28059" strokeWidth="1.5"/><path d="M88 147Q74 146 69 168L86 176L100 157" fill={`url(#${shirt})`} stroke="#c4d8de" strokeWidth="2"/></g>
      <g className="yr-arm yr-arm-right"><path d="M153 158Q171 179 175 205" stroke={`url(#${skin})`} strokeWidth="17" strokeLinecap="round"/><path d="M171 202Q169 213 174 221Q183 225 185 214L181 203" fill={`url(#${skin})`} stroke="#c28059" strokeWidth="1.5"/><path d="M151 147Q166 147 171 168L154 176L140 157" fill={`url(#${shirt})`} stroke="#c4d8de" strokeWidth="2"/></g>
    </g>
  </svg>
}
