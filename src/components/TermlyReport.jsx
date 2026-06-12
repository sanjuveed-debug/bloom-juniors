import React from 'react'
import { PHONICS_PHASES, getTermLabel } from '../utils/cohortInsights'

// Print-ready, anonymised cohort report for nurseries (KHDA-friendly framing).
// Rendered full-screen in place of the dashboard so window.print() captures
// only the report. White background and dark text are deliberate — this is a
// document, not an app screen.

const ink = '#1E293B'
const faint = '#64748B'
const line = '#E2E8F0'

function StatBox({ value, label, sub }) {
  return (
    <div style={{ flex: 1, border: `1px solid ${line}`, borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
      <p style={{ fontSize: 26, fontWeight: 800, color: ink, margin: 0 }}>{value}</p>
      <p style={{ fontSize: 12, color: faint, margin: '2px 0 0' }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color: '#10B981', margin: '2px 0 0', fontWeight: 700 }}>{sub}</p>}
    </div>
  )
}

function Bar({ pct, color = '#6366F1' }) {
  return (
    <div style={{ background: '#F1F5F9', borderRadius: 6, height: 10, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: color, borderRadius: 6 }} />
    </div>
  )
}

export default function TermlyReport({ insights, schoolName, className, supportCount, onClose }) {
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const maxWeekSessions = Math.max(1, ...insights.weeks.map(w => w.sessions))
  const delta = insights.weekDelta

  return (
    <div style={{ minHeight: '100vh', background: 'white', color: ink, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 14mm; }
        }
      `}</style>

      {/* Action bar (screen only) */}
      <div className="no-print" style={{ position: 'sticky', top: 0, background: '#0F172A', padding: '12px 20px', display: 'flex', gap: 10, alignItems: 'center', zIndex: 10 }}>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>
          ← Back to dashboard
        </button>
        <button onClick={() => window.print()} style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: 'white', border: 'none', borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          🖨️ Print / Save as PDF
        </button>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Tip: choose "Save as PDF" in the print dialog to share by email</span>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 28px 48px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `3px solid #6366F1`, paddingBottom: 16 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: '#6366F1', letterSpacing: 1, textTransform: 'uppercase', margin: 0 }}>
              🌸 Bloom Juniors{schoolName ? ` × ${schoolName}` : ''}
            </p>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: '6px 0 2px' }}>Cohort Learning Report</h1>
            <p style={{ fontSize: 13, color: faint, margin: 0 }}>
              {className ? `${className} · ` : ''}{getTermLabel()} · generated {today}
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12, color: faint }}>
            <p style={{ margin: 0, fontWeight: 700, color: ink }}>{insights.pupils} pupils</p>
            <p style={{ margin: '2px 0 0' }}>UK EYFS aligned</p>
            <p style={{ margin: '2px 0 0' }}>RWI phonics progression</p>
          </div>
        </div>

        {/* At a glance */}
        <h2 style={{ fontSize: 15, fontWeight: 800, margin: '24px 0 10px' }}>Cohort at a glance <span style={{ color: faint, fontWeight: 400, fontSize: 12 }}>· last 4 weeks</span></h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <StatBox value={insights.weeks[3].activePupils} label="active this week"
            sub={delta.activePupils > 0 ? `▲ ${delta.activePupils} vs last week` : null} />
          <StatBox value={insights.sessions28} label="learning sessions"
            sub={delta.sessions > 0 ? `▲ ${delta.sessions} this week` : null} />
          <StatBox value={insights.accuracy28 !== null ? `${insights.accuracy28}%` : '—'} label="average accuracy" />
          <StatBox value={insights.totalStars} label="stars earned (all time)" />
        </div>

        {/* Phonics phases */}
        <h2 style={{ fontSize: 15, fontWeight: 800, margin: '26px 0 4px' }}>Phonics progression <span style={{ color: faint, fontWeight: 400, fontSize: 12 }}>· EYFS Literacy: Word Reading</span></h2>
        <p style={{ fontSize: 12, color: faint, margin: '0 0 12px' }}>
          Pupils progress through Read Write Inc. sound sets. {insights.phonicsStarted} of {insights.pupils} pupils have started structured phonics practice.
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${line}`, textAlign: 'left', color: faint, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              <th style={{ padding: '6px 4px' }}>Working at</th>
              <th style={{ padding: '6px 4px' }}>Development Matters link</th>
              <th style={{ padding: '6px 4px', width: 120 }}>Pupils</th>
            </tr>
          </thead>
          <tbody>
            {insights.phaseDistribution.map(p => (
              <tr key={p.phase} style={{ borderBottom: `1px solid ${line}` }}>
                <td style={{ padding: '9px 4px', fontWeight: 700, whiteSpace: 'nowrap' }}>{p.label}</td>
                <td style={{ padding: '9px 4px', color: faint, fontSize: 12 }}>{p.dm}</td>
                <td style={{ padding: '9px 4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1 }}><Bar pct={insights.pupils ? (p.count / insights.pupils) * 100 : 0} /></div>
                    <span style={{ fontWeight: 800, minWidth: 20, textAlign: 'right' }}>{p.count}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Area engagement */}
        <h2 style={{ fontSize: 15, fontWeight: 800, margin: '26px 0 10px' }}>Learning area coverage <span style={{ color: faint, fontWeight: 400, fontSize: 12 }}>· EYFS areas, last 4 weeks</span></h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${line}`, textAlign: 'left', color: faint, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              <th style={{ padding: '6px 4px' }}>Area of learning</th>
              <th style={{ padding: '6px 4px', textAlign: 'center' }}>Pupils engaged</th>
              <th style={{ padding: '6px 4px', textAlign: 'center' }}>Sessions</th>
              <th style={{ padding: '6px 4px', textAlign: 'center' }}>Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {insights.areas.map(a => (
              <tr key={a.id} style={{ borderBottom: `1px solid ${line}` }}>
                <td style={{ padding: '9px 4px', fontWeight: 700 }}>{a.emoji} {a.label}</td>
                <td style={{ padding: '9px 4px', textAlign: 'center' }}>{a.pupilsEngaged} / {insights.pupils}</td>
                <td style={{ padding: '9px 4px', textAlign: 'center' }}>{a.sessions}</td>
                <td style={{ padding: '9px 4px', textAlign: 'center' }}>{a.accuracy !== null ? `${a.accuracy}%` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Weekly trend */}
        <h2 style={{ fontSize: 15, fontWeight: 800, margin: '26px 0 10px' }}>Engagement trend <span style={{ color: faint, fontWeight: 400, fontSize: 12 }}>· sessions per week</span></h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {insights.weeks.map(w => (
            <div key={w.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: faint, width: 80, fontWeight: w.isCurrent ? 800 : 400 }}>
                {w.label}{w.isCurrent ? ' ·' : ''}
              </span>
              <div style={{ flex: 1 }}>
                <Bar pct={(w.sessions / maxWeekSessions) * 100} color={w.isCurrent ? '#10B981' : '#94A3B8'} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, width: 90 }}>{w.sessions} session{w.sessions === 1 ? '' : 's'}</span>
              <span style={{ fontSize: 12, color: faint, width: 80 }}>{w.activePupils} pupils</span>
            </div>
          ))}
        </div>

        {/* Support */}
        <h2 style={{ fontSize: 15, fontWeight: 800, margin: '26px 0 6px' }}>Additional support</h2>
        <p style={{ fontSize: 13, color: ink, margin: 0 }}>
          {supportCount > 0
            ? `${supportCount} pupil${supportCount === 1 ? '' : 's'} flagged this week for extra practice based on in-app accuracy. Individual details are available to the class teacher on the live dashboard.`
            : 'No pupils currently flagged for additional support based on in-app accuracy.'}
        </p>

        {/* Privacy + footer */}
        <div style={{ marginTop: 30, paddingTop: 14, borderTop: `1px solid ${line}` }}>
          <p style={{ fontSize: 11, color: faint, margin: 0 }}>
            🔒 This report is fully anonymised — no individual child can be identified. Cohort data is drawn from
            in-app learning activity recorded by Bloom Juniors{schoolName ? ` on behalf of ${schoolName}` : ''}.
            Phonics phases follow the Read Write Inc. progression; statements reference Development Matters (DfE, EYFS).
          </p>
          <p style={{ fontSize: 12, color: '#6366F1', fontWeight: 800, margin: '10px 0 0' }}>
            🌸 Bloom Juniors · UK-curriculum learning for ages 3–9 · bloomjuniors.com
          </p>
        </div>
      </div>
    </div>
  )
}
