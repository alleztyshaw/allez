// src/components/public/mockups/ClientProfileMockup.js
import MockWindow from './MockWindow';
import {
  PUB_APP_ACCENT as ACCENT,
  PUB_APP_ACCENT_MUTED as ACCENT_MUTED,
  PUB_APP_ACCENT_BORDER as ACCENT_BORDER,
  PUB_TEXT as L_TEXT,
  PUB_TEXT_MUTED as L_TEXT_MUTED,
  FONT_DISPLAY, FONT_BODY,
  FW_LIGHT, FW_MEDIUM, FW_SEMIBOLD,
} from '../../../utils/publicConstants';

export default function ClientProfileMockup() {
  return (
    <MockWindow label="Client — Margaret Chen">
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <p style={{ fontFamily: FONT_DISPLAY, fontSize: '28px', fontWeight: FW_LIGHT, color: L_TEXT, margin: '0 0 4px', lineHeight: 1.1 }}>Margaret Chen</p>
            <p style={{ fontSize: '12px', color: L_TEXT_MUTED, fontFamily: FONT_BODY, fontWeight: FW_LIGHT, margin: 0 }}>margaret.chen@email.com · (415) 882-3301</p>
          </div>
          <span style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, padding: '3px 10px', borderRadius: '999px', background: ACCENT_MUTED, color: ACCENT, fontFamily: FONT_BODY, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Active</span>
        </div>
        <p style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.1em', color: L_TEXT_MUTED, margin: '0 0 8px', fontFamily: FONT_BODY }}>Assigned Advisors</p>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <span style={{ padding: '4px 12px', background: ACCENT_MUTED, border: `1px solid ${ACCENT_BORDER}`, borderRadius: '8px', fontSize: '12px', color: L_TEXT, fontFamily: FONT_BODY }}>T. Shaw <span style={{ fontSize: '10px', color: ACCENT, marginLeft: '4px' }}>Primary</span></span>
        </div>
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