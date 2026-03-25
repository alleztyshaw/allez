// src/pages/ProductPage.js
// Public-facing product page at /product.
// Visualizations are CSS/SVG mockups — no image dependencies.

import {
  ACCENT, ACCENT_MUTED, ACCENT_BORDER,
  SITE_ACCENT,
  L_BG, L_TEXT, L_TEXT_MUTED, L_TEXT_SUBTLE,
  COLOR_ERROR, COLOR_WARNING, COLOR_INFO,
  FONT_DISPLAY, FONT_BODY,
  FW_LIGHT, FW_REGULAR, FW_MEDIUM, FW_SEMIBOLD,
} from '../utils/hqConstants';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';

// ── Mini UI mockups ──────────────────────────────────────────────────────────

function MockWindow({ children, label }) {
  return (
    <div style={{
      background: '#ffffff', border: '1px solid rgba(0,0,0,0.10)',
      borderRadius: '12px', boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
      overflow: 'hidden', width: '100%',
    }}>
      {/* Fake title bar */}
      <div style={{ background: '#f5f5f3', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} />
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
        {label && <span style={{ marginLeft: '10px', fontSize: '11px', color: 'rgba(0,0,0,0.35)', fontFamily: FONT_BODY }}>{label}</span>}
      </div>
      {children}
    </div>
  );
}

// Daily Brief mockup
function DailyBriefMockup() {
  const meetings = [
    { time: '9:00 AM', name: 'Margaret Chen', type: 'Annual Review', duration: '60 min' },
    { time: '11:30 AM', name: 'Robert Sullivan', type: 'Portfolio Review', duration: '45 min' },
    { time: '2:00 PM', name: 'Priya Patel', type: 'Quarterly Check-in', duration: '30 min' },
  ];
  return (
    <MockWindow label="Daily Brief — Tuesday, March 25">
      <div style={{ padding: '20px 24px' }}>
        {/* Greeting */}
        <p style={{ fontFamily: FONT_DISPLAY, fontSize: '22px', fontWeight: FW_LIGHT, color: L_TEXT, margin: '0 0 4px' }}>
          Good morning.
        </p>
        <p style={{ fontFamily: FONT_BODY, fontSize: '12px', fontWeight: FW_LIGHT, color: L_TEXT_MUTED, margin: '0 0 20px' }}>
          3 meetings today · 2 tasks overdue · 4 clients due for review
        </p>
        {/* Today's meetings */}
        <p style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.1em', color: L_TEXT_MUTED, margin: '0 0 10px', fontFamily: FONT_BODY }}>Today's Schedule</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {meetings.map(m => (
            <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: '#fafaf8', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: FW_MEDIUM, color: L_TEXT_MUTED, fontFamily: FONT_BODY, minWidth: '62px' }}>{m.time}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: FW_MEDIUM, color: L_TEXT, fontFamily: FONT_BODY }}>{m.name}</p>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: FW_LIGHT, color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>{m.type} · {m.duration}</p>
              </div>
              <span style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, padding: '2px 8px', borderRadius: '999px', background: ACCENT_MUTED, color: ACCENT, fontFamily: FONT_BODY }}>Prep brief</span>
            </div>
          ))}
        </div>
        {/* Overdue tasks */}
        <p style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.1em', color: L_TEXT_MUTED, margin: '16px 0 10px', fontFamily: FONT_BODY }}>Overdue Tasks</p>
        {[
          { client: 'James Kowalski', task: 'Send estate planning summary' },
          { client: 'Catherine Liu', task: 'Follow up on rebalance proposal' },
        ].map(t => (
          <div key={t.task} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', marginBottom: '6px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: '8px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: COLOR_ERROR, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: FW_MEDIUM, color: L_TEXT, fontFamily: FONT_BODY }}>{t.task}</p>
              <p style={{ margin: 0, fontSize: '11px', color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>{t.client}</p>
            </div>
          </div>
        ))}
      </div>
    </MockWindow>
  );
}

// Client profile mockup
function ClientProfileMockup() {
  return (
    <MockWindow label="Client — Margaret Chen">
      <div style={{ padding: '20px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <p style={{ fontFamily: FONT_DISPLAY, fontSize: '28px', fontWeight: FW_LIGHT, color: L_TEXT, margin: '0 0 4px', lineHeight: 1.1 }}>Margaret Chen</p>
            <p style={{ fontSize: '12px', color: L_TEXT_MUTED, fontFamily: FONT_BODY, fontWeight: FW_LIGHT, margin: 0 }}>margaret.chen@email.com · (415) 882-3301</p>
          </div>
          <span style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, padding: '3px 10px', borderRadius: '999px', background: ACCENT_MUTED, color: ACCENT, fontFamily: FONT_BODY, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Active</span>
        </div>
        {/* Assigned advisors */}
        <p style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.1em', color: L_TEXT_MUTED, margin: '0 0 8px', fontFamily: FONT_BODY }}>Assigned Advisors</p>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <span style={{ padding: '4px 12px', background: ACCENT_MUTED, border: `1px solid ${ACCENT_BORDER}`, borderRadius: '8px', fontSize: '12px', color: L_TEXT, fontFamily: FONT_BODY }}>T. Shaw <span style={{ fontSize: '10px', color: ACCENT, marginLeft: '4px' }}>Primary</span></span>
        </div>
        {/* Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            ['AUM', '$3.2M'], ['Asset Level', '$2M – $5M'],
            ['Risk Tolerance', 'Moderate'], ['Tax Bracket', '32%'],
            ['Communication', 'Quarterly'], ['Next Review', '05/10/2026'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#fafaf8', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '11px', color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>{label}</span>
              <span style={{ fontSize: '11px', color: L_TEXT, fontWeight: FW_MEDIUM, fontFamily: FONT_BODY }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </MockWindow>
  );
}

// AI Notes output mockup
function AINoteMockup() {
  return (
    <MockWindow label="AI Note — Margaret Chen · Annual Review">
      <div style={{ padding: '20px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: FW_MEDIUM, color: L_TEXT, fontFamily: FONT_BODY }}>Annual Review – March 2026</p>
            <p style={{ margin: 0, fontSize: '11px', color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>03/25/2026 · AI Note</p>
          </div>
          <span style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, padding: '2px 9px', borderRadius: '999px', background: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)', fontFamily: FONT_BODY, letterSpacing: '0.06em' }}>AI</span>
        </div>
        {/* Summary */}
        <p style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.1em', color: ACCENT, margin: '0 0 8px', fontFamily: FONT_BODY }}>Summary</p>
        <p style={{ fontSize: '12px', fontWeight: FW_LIGHT, lineHeight: 1.65, color: L_TEXT, margin: '0 0 16px', fontFamily: FONT_BODY }}>
          Reviewed full portfolio allocation. Client pleased with bond ladder performance. Discussed rebalancing equities from 58% to 55% given approaching retirement horizon.
        </p>
        {/* Action items */}
        <p style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.1em', color: ACCENT, margin: '0 0 8px', fontFamily: FONT_BODY }}>Action Items</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
          {['Prepare rebalancing proposal by April 1', 'Send updated RMD projection for 2026'].map(item => (
            <div key={item} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: ACCENT, flexShrink: 0, marginTop: '5px' }} />
              <span style={{ fontSize: '12px', fontWeight: FW_LIGHT, color: L_TEXT, fontFamily: FONT_BODY }}>{item}</span>
            </div>
          ))}
        </div>
        {/* Compliance */}
        <div style={{ display: 'flex', gap: '8px', padding: '10px 12px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '8px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '14px', flexShrink: 0 }}>⚠️</span>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: '11px', fontWeight: FW_SEMIBOLD, color: COLOR_WARNING, fontFamily: FONT_BODY }}>Compliance flag · Medium</p>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: FW_LIGHT, color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>Performance comparison referenced without full benchmark disclosure.</p>
          </div>
        </div>
      </div>
    </MockWindow>
  );
}

// Search overlay mockup
function SearchMockup() {
  return (
    <MockWindow label="Global Search">
      <div style={{ padding: '0' }}>
        {/* Search input */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke={L_TEXT_MUTED} strokeWidth="1.5"/>
            <path d="M13.5 13.5L17 17" stroke={L_TEXT_MUTED} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: '13px', color: L_TEXT, fontFamily: FONT_BODY }}>chen</span>
          <span style={{ marginLeft: 'auto', fontSize: '10px', color: L_TEXT_SUBTLE, fontFamily: FONT_BODY, border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', padding: '1px 5px' }}>Esc</span>
        </div>
        {/* Results */}
        {[
          { group: 'Clients', items: [{ label: 'Margaret Chen', sub: 'Active · $3.2M AUM' }, { label: 'David Chen', sub: 'Prospect · Lead stage' }] },
          { group: 'Notes', items: [{ label: 'Annual Review – Margaret Chen', sub: 'Mar 25, 2026 · Meeting' }] },
        ].map(group => (
          <div key={group.group}>
            <p style={{ fontSize: '9px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.12em', color: L_TEXT_SUBTLE, margin: 0, padding: '10px 16px 4px', fontFamily: FONT_BODY }}>{group.group}</p>
            {group.items.map((item, i) => (
              <div key={item.label} style={{ padding: '8px 16px', background: i === 0 && group.group === 'Clients' ? ACCENT_MUTED : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: FW_MEDIUM, color: L_TEXT, fontFamily: FONT_BODY }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: '10px', color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>{item.sub}</p>
                </div>
                <span style={{ fontSize: '10px', color: ACCENT, fontFamily: FONT_BODY }}>→</span>
              </div>
            ))}
          </div>
        ))}
        <div style={{ padding: '8px 16px 12px' }}>
          <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', marginBottom: '8px' }} />
          <p style={{ margin: 0, fontSize: '10px', color: L_TEXT_SUBTLE, fontFamily: FONT_BODY }}>Press ↑↓ to navigate · Enter to open</p>
        </div>
      </div>
    </MockWindow>
  );
}

// ── Workflow diagrams ────────────────────────────────────────────────────────

function AIPipelineDiagram() {
  const steps = [
    { icon: '🎙️', label: 'Transcript', sub: 'Record, paste, or upload' },
    { icon: '🪪', label: 'De-identify', sub: 'PII replaced with tokens' },
    { icon: '✦', label: 'AI Processing', sub: 'Claude Haiku' },
    { icon: '🔄', label: 'Re-identify', sub: 'Tokens restored' },
    { icon: '📄', label: 'Structured Note', sub: 'Summary + action items' },
  ];
  return (
    <div style={{ padding: '32px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '4px' }}>
        {steps.map((step, i) => (
          <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '96px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: i === 2 ? 'rgba(167,139,250,0.12)' : '#f5f5f3', border: `1px solid ${i === 2 ? 'rgba(167,139,250,0.3)' : 'rgba(0,0,0,0.07)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '8px' }}>
                {step.icon}
              </div>
              <p style={{ margin: '0 0 2px', fontSize: '11px', fontWeight: FW_SEMIBOLD, color: L_TEXT, fontFamily: FONT_BODY, textAlign: 'center' }}>{step.label}</p>
              <p style={{ margin: 0, fontSize: '10px', color: L_TEXT_MUTED, fontFamily: FONT_BODY, textAlign: 'center', lineHeight: 1.4 }}>{step.sub}</p>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: '24px', height: '1px', background: 'rgba(0,0,0,0.15)', position: 'relative', flexShrink: 0 }}>
                <div style={{ position: 'absolute', right: '-4px', top: '-3px', width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: `5px solid rgba(0,0,0,0.2)` }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ComplianceDiagram() {
  return (
    <div style={{ padding: '28px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
      <p style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.1em', color: L_TEXT_MUTED, margin: '0 0 20px', fontFamily: FONT_BODY }}>Compliance scan flow</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Input */}
        <div style={{ padding: '12px 16px', background: '#fafaf8', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '16px' }}>📝</span>
          <div>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: FW_MEDIUM, color: L_TEXT, fontFamily: FONT_BODY }}>AI note processed</p>
            <p style={{ margin: 0, fontSize: '11px', color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>Full text submitted for scan</p>
          </div>
        </div>
        {/* Arrow */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: `8px solid rgba(0,0,0,0.15)` }} />
        </div>
        {/* Scan */}
        <div style={{ padding: '12px 16px', background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '16px' }}>✦</span>
          <div>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: FW_MEDIUM, color: L_TEXT, fontFamily: FONT_BODY }}>Compliance engine</p>
            <p style={{ margin: 0, fontSize: '11px', color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>Securities mentions · promissory language · risk signals</p>
          </div>
        </div>
        {/* Arrow */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: `8px solid rgba(0,0,0,0.15)` }} />
        </div>
        {/* Results */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1, padding: '10px 12px', background: ACCENT_MUTED, border: `1px solid ${ACCENT_BORDER}`, borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: FW_SEMIBOLD, color: ACCENT, fontFamily: FONT_BODY }}>✓ Clear</p>
            <p style={{ margin: 0, fontSize: '10px', color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>No flags</p>
          </div>
          <div style={{ flex: 1, padding: '10px 12px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: FW_SEMIBOLD, color: COLOR_WARNING, fontFamily: FONT_BODY }}>⚠ Medium</p>
            <p style={{ margin: 0, fontSize: '10px', color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>Review needed</p>
          </div>
          <div style={{ flex: 1, padding: '10px 12px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: FW_SEMIBOLD, color: COLOR_ERROR, fontFamily: FONT_BODY }}>✕ High</p>
            <p style={{ margin: 0, fontSize: '10px', color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>Flagged</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PipelineDiagram() {
  const stages = ['Lead', 'Proposal', 'Agreement', 'Onboarding', 'Active'];
  const active = 2;
  return (
    <div style={{ padding: '28px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
      <p style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.1em', color: L_TEXT_MUTED, margin: '0 0 20px', fontFamily: FONT_BODY }}>Prospect pipeline</p>
      {/* Pipeline stages */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '24px', overflowX: 'auto' }}>
        {stages.map((stage, i) => (
          <div key={stage} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                padding: '7px 4px', borderRadius: '6px', fontSize: '11px', fontWeight: i <= active ? FW_SEMIBOLD : FW_REGULAR,
                fontFamily: FONT_BODY, whiteSpace: 'nowrap',
                background: i < active ? ACCENT_MUTED : i === active ? ACCENT : '#f5f5f3',
                color: i < active ? ACCENT : i === active ? '#fff' : L_TEXT_MUTED,
                border: `1px solid ${i <= active ? ACCENT_BORDER : 'rgba(0,0,0,0.07)'}`,
              }}>
                {stage}
              </div>
            </div>
            {i < stages.length - 1 && (
              <div style={{ width: '12px', flexShrink: 0, height: '1px', background: i < active ? ACCENT : 'rgba(0,0,0,0.1)' }} />
            )}
          </div>
        ))}
      </div>
      {/* Prospect cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[
          { name: 'Daniel Kim', stage: 'Agreement', time: '3 weeks', value: '$2M–$5M' },
          { name: 'Amanda Walsh', stage: 'Proposal', time: '1 week', value: '$2M–$5M' },
          { name: 'Rebecca Sterling', stage: 'Onboarding', time: '5 weeks', value: '$5M–$10M' },
        ].map(p => (
          <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#fafaf8', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '8px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: FW_MEDIUM, color: L_TEXT, fontFamily: FONT_BODY }}>{p.name}</p>
              <p style={{ margin: 0, fontSize: '10px', color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>{p.value} · In pipeline {p.time}</p>
            </div>
            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', background: ACCENT_MUTED, color: ACCENT, fontWeight: FW_SEMIBOLD, fontFamily: FONT_BODY }}>{p.stage}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Feature sections ─────────────────────────────────────────────────────────

const FEATURES = [
  {
    name: 'Daily Brief',
    tagline: 'Start every morning already prepared.',
    description: 'Most advisors begin their day piecing together what\'s happening across their book. The Daily Brief eliminates that — surfacing today\'s meetings, overdue tasks, and clients due for a touchpoint the moment you log in.',
    details: [
      'Today\'s schedule with client context at a glance',
      'Overdue and due-today tasks across your entire book',
      'Clients approaching their next review date',
      'Quick-add task flow without leaving the page',
    ],
    visual: <DailyBriefMockup />,
    visualType: 'mockup',
  },
  {
    name: 'Client Profiles',
    tagline: 'Every detail about every client, always in reach.',
    description: 'A client profile in Allez HQ holds the full picture of the relationship — financial profile, risk tolerance, communication preferences, notes history, tasks, and meetings — all in one place.',
    details: [
      'AUM, fee rate, custodian, tax bracket, investment objective',
      'Communication preferences and cadence settings',
      'Full notes and meeting history linked to the profile',
      'Pipeline tracking for prospects moving toward onboarding',
    ],
    visual: <ClientProfileMockup />,
    visualType: 'mockup',
  },
  {
    name: 'AI Notes',
    tagline: 'From transcript to structured record in seconds.',
    description: 'Accept a transcript, a recording, or a pasted summary and turn it into a structured record — meeting summary, decisions made, action items, and follow-up topics extracted automatically. Compliance signals flagged in real time.',
    details: [
      'Three input modes: paste text, upload a file, or record directly',
      'Structured output: summary, decisions, action items, follow-ups',
      'Auto-generated tasks linked to the client record',
      'Compliance scan with severity levels and specific reasons',
      'Draft follow-up email generation with tone controls',
    ],
    visual: <AINoteMockup />,
    visualType: 'mockup',
    diagram: <AIPipelineDiagram />,
    diagramLabel: 'How the AI pipeline works',
  },
  {
    name: 'CRM & Pipeline',
    tagline: 'See the full arc of every relationship.',
    description: 'Prospects move through a configurable pipeline. Active clients have communication cadence tracking. Every interaction is logged. Nothing falls through the cracks because the system is always watching the relationship health you might miss.',
    details: [
      'Pipeline stages from Lead through Onboarding to Active',
      'Cadence signals: amber when approaching touchpoint, red when overdue',
      'Smart meeting scheduling pre-filled from last meeting + frequency',
      'Client CSV import — migrate from any CRM in minutes',
    ],
    visual: <PipelineDiagram />,
    visualType: 'diagram',
  },
  {
    name: 'Compliance Layer',
    tagline: 'Documentation that protects you as you work.',
    description: 'Compliance in most practices is retroactive. Allez HQ builds it into the workflow — every AI note scanned automatically, flags surfaced in a dedicated compliance view, and a full audit log recording every write across your organization.',
    details: [
      'Automatic compliance scan on every AI note',
      'Severity levels: low, medium, high — with specific reasons per flag',
      'Dedicated Flagged Notes view for compliance review',
      'Full audit log with field-level change tracking',
      'Compliance role: full read access across the org',
    ],
    visual: <ComplianceDiagram />,
    visualType: 'diagram',
  },
  {
    name: 'Global Search',
    tagline: 'Find anything, instantly.',
    description: 'Cmd+K from anywhere searches clients by name, notes by content, and tasks by title simultaneously. Results grouped and navigable. Role-scoped so advisors only see their assigned clients and records.',
    details: [
      'Cmd+K shortcut available from any page in the app',
      'Searches clients, notes, and tasks in a single query',
      'Results grouped by type with direct navigation links',
      'Role-scoped — advisors see only their book',
    ],
    visual: <SearchMockup />,
    visualType: 'mockup',
  },
  {
    name: 'Team & Access Control',
    tagline: 'The right people see the right things.',
    description: 'Supports the full range of roles in a real advisory practice — Admin, Manager, Advisor, Associate, Compliance. Role-based access enforced at the database level. Advisors see their clients. Compliance has full read access. Admins manage the team.',
    details: [
      'Five-role hierarchy enforced at the database level',
      'Invite flow with role assignment and name pre-population',
      'Resend invite for pending members',
      'Advisor assignment per client — primary and secondary',
    ],
    visual: (
      <div style={{ padding: '28px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <p style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.1em', color: L_TEXT_MUTED, margin: '0 0 16px', fontFamily: FONT_BODY }}>Role hierarchy</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { role: 'Admin', access: 'Full access · Team management · Billing', color: ACCENT },
            { role: 'Manager', access: 'Full access · No billing', color: ACCENT },
            { role: 'Advisor', access: 'Assigned clients · Write access', color: COLOR_INFO },
            { role: 'Associate', access: 'Assigned clients · Read only', color: COLOR_INFO },
            { role: 'Compliance', access: 'All clients · Read only · Audit log', color: COLOR_WARNING },
          ].map(r => (
            <div key={r.role} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 12px', background: '#fafaf8', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, padding: '2px 10px', borderRadius: '999px', background: `${r.color}18`, color: r.color, border: `1px solid ${r.color}30`, fontFamily: FONT_BODY, minWidth: '74px', textAlign: 'center' }}>{r.role}</span>
              <span style={{ fontSize: '12px', color: L_TEXT_MUTED, fontFamily: FONT_BODY, fontWeight: FW_LIGHT }}>{r.access}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    visualType: 'diagram',
  },
];

const WHY = [
  { point: 'Natively unified.', detail: 'CRM, AI notes, task management, and compliance in one place — not tools you\'re trying to keep in sync.' },
  { point: 'Compliance-aware from day one.', detail: 'Every note scanned. Every change logged. Built for the regulatory reality advisors actually live in.' },
  { point: 'Built for the relationship, not the sale.', detail: 'Most CRMs are adapted from sales tools. Allez HQ was designed from scratch around the wealth management relationship.' },
  { point: 'Built in partnership with working advisors.', detail: 'Every feature was developed alongside advisors who use it. No assumptions. No enterprise-first tradeoffs.' },
];

// ── Page component ───────────────────────────────────────────────────────────

export default function ProductPage() {
  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes mesh1 {
          0%,100% { transform:translate(0,0) scale(1); }
          25%      { transform:translate(60px,-80px) scale(1.08); }
          50%      { transform:translate(-40px,60px) scale(0.95); }
          75%      { transform:translate(80px,40px) scale(1.05); }
        }
        @keyframes mesh2 {
          0%,100% { transform:translate(0,0) scale(1); }
          25%      { transform:translate(-70px,50px) scale(1.06); }
          50%      { transform:translate(50px,-70px) scale(0.97); }
          75%      { transform:translate(-30px,-30px) scale(1.04); }
        }
        .feature-row:not(:last-child) { border-bottom:1px solid rgba(0,0,0,0.07); }
      `}</style>

      <div style={s.meshWrap}>
        <div style={s.mesh1} />
        <div style={s.mesh2} />
      </div>

      <PublicHeader />

      {/* Hero */}
      <div style={s.hero}>
        <p style={s.heroEyebrow}>The platform</p>
        <h1 style={s.heroTitle}>Practice management built<br />for the relationship era.</h1>
        <p style={s.heroSub}>
          Independent advisors, RIAs, and wealth management firms use Allez HQ
          to manage their client relationships, meeting workflows, compliance obligations,
          and team operations — in one place, purpose-built for this industry.
        </p>
      </div>

      <div style={s.scrollSection}>

        {/* How it fits together */}
        <div style={s.unifiedBlock}>
          <p style={s.eyebrow}>Everything you need, in one platform</p>
          <h2 style={s.sectionTitle}>Everything connects.</h2>
          <p style={s.bodyText}>
            Most advisory practices run on a patchwork of tools — a CRM here, a notes app there, a spreadsheet for tasks, and a compliance folder somewhere on a shared drive. Each tool knows part of the story. None of them know all of it.
          </p>
          <p style={s.bodyText}>
            Allez HQ is a single platform where your client data, meeting history, AI-generated notes, open tasks, and compliance record all live together and reference each other. When you open a client profile, you see everything. When you take a note, it links to the client. When a task is generated from a meeting, it appears in your Daily Brief the next morning.
          </p>
          <p style={s.bodyText}>Not feature richness — coherence.</p>
        </div>

        <div style={s.divider} />

        {/* Features */}
        <div style={s.featuresBlock}>
          <p style={s.eyebrow}>Features</p>
          <h2 style={s.sectionTitle}>What's inside.</h2>

          {FEATURES.map(f => (
            <div key={f.name} className="feature-row" style={s.featureRow}>
              {/* Left: text */}
              <div style={s.featureLeft}>
                <p style={s.featureName}>{f.name}</p>
                <p style={s.featureTagline}>{f.tagline}</p>
                <p style={s.featureDesc}>{f.description}</p>
                <ul style={s.featureList}>
                  {f.details.map(d => (
                    <li key={d} style={s.featureListItem}>
                      <span style={s.bullet} />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Right: visual */}
              <div style={s.featureRight}>
                {f.visual}
                {f.diagram && (
                  <div style={{ marginTop: '16px' }}>
                    <p style={{ fontSize: '10px', fontWeight: FW_MEDIUM, textTransform: 'uppercase', letterSpacing: '0.1em', color: L_TEXT_SUBTLE, margin: '0 0 10px', fontFamily: FONT_BODY }}>{f.diagramLabel}</p>
                    {f.diagram}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={s.divider} />

        {/* Why */}
        <div style={s.whyBlock}>
          <p style={s.eyebrow}>Why Allez HQ</p>
          <h2 style={s.sectionTitle}>The thinking behind it.</h2>
          <div style={s.whyGrid}>
            {WHY.map(item => (
              <div key={item.point} style={s.whyItem}>
                <p style={s.whyPoint}>{item.point}</p>
                <p style={s.whyDetail}>{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <PublicFooter />
      </div>
    </div>
  );
}

const s = {
  root: { fontFamily: FONT_BODY, position: 'relative', background: L_BG, overflowX: 'hidden' },

  meshWrap: { position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' },
  mesh1: {
    position: 'absolute', width: '700px', height: '700px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.30) 0%, rgba(99,102,241,0.10) 50%, transparent 70%)',
    top: '-200px', left: '-200px', filter: 'blur(50px)', animation: 'mesh1 24s ease-in-out infinite',
  },
  mesh2: {
    position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(20,184,166,0.25) 0%, rgba(20,184,166,0.08) 50%, transparent 70%)',
    top: '200px', right: '-150px', filter: 'blur(50px)', animation: 'mesh2 28s ease-in-out infinite',
  },

  hero: { maxWidth: '1100px', margin: '0 auto', padding: '80px 40px 100px', position: 'relative', zIndex: 1 },
  heroEyebrow: { fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase', letterSpacing: '0.18em', color: SITE_ACCENT, margin: '0 0 20px' },
  heroTitle: { fontFamily: FONT_DISPLAY, fontSize: 'clamp(36px, 5vw, 68px)', fontWeight: FW_LIGHT, color: L_TEXT, margin: '0 0 28px', lineHeight: 1.1, letterSpacing: '0.01em' },
  heroSub: { fontSize: '16px', fontWeight: FW_LIGHT, lineHeight: 1.8, color: 'rgba(26,26,26,0.55)', maxWidth: '640px', margin: 0 },

  scrollSection: {
    position: 'relative', zIndex: 1,
    background: 'rgba(248,248,245,0.35)', backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)', borderTop: '1px solid rgba(0,0,0,0.04)',
  },

  unifiedBlock: { maxWidth: '1100px', margin: '0 auto', padding: '80px 40px' },
  eyebrow: { fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase', letterSpacing: '0.18em', color: SITE_ACCENT, margin: '0 0 16px' },
  sectionTitle: { fontFamily: FONT_DISPLAY, fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: FW_LIGHT, color: L_TEXT, margin: '0 0 28px', lineHeight: 1.2, letterSpacing: '0.01em' },
  bodyText: { fontSize: '15px', fontWeight: FW_LIGHT, lineHeight: 1.85, color: 'rgba(26,26,26,0.6)', margin: '0 0 16px', maxWidth: '720px' },

  divider: { height: '1px', background: 'rgba(0,0,0,0.07)', margin: '0 40px' },

  featuresBlock: { maxWidth: '1100px', margin: '0 auto', padding: '80px 40px' },
  featureRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '56px', padding: '56px 0', alignItems: 'start' },
  featureLeft: {},
  featureName: { fontFamily: FONT_DISPLAY, fontSize: '30px', fontWeight: FW_REGULAR, color: L_TEXT, margin: '0 0 6px', letterSpacing: '0.01em' },
  featureTagline: { fontSize: '13px', fontWeight: FW_LIGHT, color: SITE_ACCENT, margin: '0 0 16px' },
  featureDesc: { fontSize: '14px', fontWeight: FW_LIGHT, lineHeight: 1.85, color: 'rgba(26,26,26,0.6)', margin: '0 0 20px' },
  featureList: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' },
  featureListItem: { display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', fontWeight: FW_LIGHT, lineHeight: 1.65, color: 'rgba(26,26,26,0.65)' },
  bullet: { display: 'inline-block', width: '4px', height: '4px', borderRadius: '50%', background: ACCENT, flexShrink: 0, marginTop: '7px' },
  featureRight: {},

  whyBlock: { maxWidth: '1100px', margin: '0 auto', padding: '80px 40px 100px' },
  whyGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '40px 48px', marginTop: '8px' },
  whyItem: { display: 'flex', flexDirection: 'column', gap: '8px' },
  whyPoint: { fontFamily: FONT_DISPLAY, fontSize: '20px', fontWeight: FW_REGULAR, color: L_TEXT, margin: 0, letterSpacing: '0.01em' },
  whyDetail: { fontSize: '13px', fontWeight: FW_LIGHT, lineHeight: 1.7, color: 'rgba(26,26,26,0.55)', margin: 0 },
};