// src/components/public/mockups/AIPipelineDiagram.js
import {
  PUB_TEXT as L_TEXT,
  PUB_TEXT_MUTED as L_TEXT_MUTED,
  FONT_BODY,
  FW_SEMIBOLD,
} from '../../../utils/publicConstants';

// Simple 18px line-drawing icons — no emoji
const MicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="6" y="1" width="6" height="9" rx="3" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M3 9a6 6 0 0012 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="9" y1="15" x2="9" y2="17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="6" y1="17" x2="12" y2="17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M9 2L3 4.5v4.5c0 4 2.8 6.8 6 8 3.2-1.2 6-4 6-8V4.5L9 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M6.5 9l2 2L12 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SparkleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M9 2v3M9 13v3M2 9h3M13 9h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M4.5 4.5l2 2M11.5 11.5l2 2M4.5 13.5l2-2M11.5 6.5l2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.4"/>
  </svg>
);

const RefreshIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M15 9A6 6 0 1 1 9 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M9 1l3 2-3 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DocIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="3" y="1" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.4"/>
    <line x1="6" y1="6" x2="12" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="6" y1="9" x2="12" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="6" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const STEPS = [
  { Icon: MicIcon,     label: 'Transcript',     sub: 'Record, paste, or upload', ai: false },
  { Icon: ShieldIcon,  label: 'De-identify',    sub: 'PII replaced with tokens', ai: false },
  { Icon: SparkleIcon, label: 'AI Processing',  sub: 'Structured extraction',    ai: true  },
  { Icon: RefreshIcon, label: 'Re-identify',    sub: 'Tokens restored',          ai: false },
  { Icon: DocIcon,     label: 'Structured Note',sub: 'Summary + action items',   ai: false },
];

export default function AIPipelineDiagram() {
  return (
    <div style={{ padding: '32px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '4px' }}>
        {STEPS.map((step, i) => (
          <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '96px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: step.ai ? 'rgba(167,139,250,0.12)' : '#f5f5f3',
                border: `1px solid ${step.ai ? 'rgba(167,139,250,0.3)' : 'rgba(0,0,0,0.07)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '8px',
                color: step.ai ? '#a78bfa' : 'rgba(26,26,26,0.45)',
              }}>
                <step.Icon />
              </div>
              <p style={{ margin: '0 0 2px', fontSize: '11px', fontWeight: FW_SEMIBOLD, color: L_TEXT, fontFamily: FONT_BODY, textAlign: 'center' }}>{step.label}</p>
              <p style={{ margin: 0, fontSize: '10px', color: L_TEXT_MUTED, fontFamily: FONT_BODY, textAlign: 'center', lineHeight: 1.4 }}>{step.sub}</p>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ width: '24px', height: '1px', background: 'rgba(0,0,0,0.15)', position: 'relative', flexShrink: 0 }}>
                <div style={{ position: 'absolute', right: '-4px', top: '-3px', width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: '5px solid rgba(0,0,0,0.2)' }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}