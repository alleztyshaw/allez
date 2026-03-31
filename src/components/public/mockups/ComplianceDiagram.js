// src/components/public/mockups/ComplianceDiagram.js
import {
  PUB_APP_ACCENT as ACCENT,
  PUB_APP_ACCENT_MUTED as ACCENT_MUTED,
  PUB_APP_ACCENT_BORDER as ACCENT_BORDER,
  PUB_COLOR_ERROR as COLOR_ERROR,
  PUB_COLOR_WARNING as COLOR_WARNING,
  PUB_TEXT as L_TEXT,
  PUB_TEXT_MUTED as L_TEXT_MUTED,
  FONT_BODY,
  FW_MEDIUM, FW_SEMIBOLD,
} from '../../../utils/publicConstants';

const NoteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <rect x="2" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.3"/>
    <line x1="5" y1="5" x2="11" y2="5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    <line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    <line x1="5" y1="11" x2="8" y2="11" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
  </svg>
);

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <path d="M8 2v2.5M8 11.5V14M2 8h2.5M11.5 8H14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M4 4l1.5 1.5M10.5 10.5L12 12M4 12l1.5-1.5M10.5 5.5L12 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
  </svg>
);

export default function ComplianceDiagram() {
  return (
    <div style={{ padding: '28px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
      <p style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.1em', color: L_TEXT_MUTED, margin: '0 0 20px', fontFamily: FONT_BODY }}>Compliance scan flow</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

        {/* Step 1 */}
        <div style={{ padding: '12px 16px', background: '#fafaf8', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'rgba(26,26,26,0.4)' }}><NoteIcon /></span>
          <div>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: FW_MEDIUM, color: L_TEXT, fontFamily: FONT_BODY }}>AI note processed</p>
            <p style={{ margin: 0, fontSize: '11px', color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>Full text submitted for scan</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid rgba(0,0,0,0.15)' }} />
        </div>

        {/* Step 2 */}
        <div style={{ padding: '12px 16px', background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#a78bfa' }}><SparkleIcon /></span>
          <div>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: FW_MEDIUM, color: L_TEXT, fontFamily: FONT_BODY }}>Compliance engine</p>
            <p style={{ margin: 0, fontSize: '11px', color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>Securities mentions · promissory language · risk signals</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid rgba(0,0,0,0.15)' }} />
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