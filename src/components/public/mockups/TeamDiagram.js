// src/components/public/mockups/TeamDiagram.js
import {
  PUB_APP_ACCENT as ACCENT,
  PUB_COLOR_WARNING as COLOR_WARNING,
  PUB_COLOR_INFO as COLOR_INFO,
  PUB_TEXT_MUTED as L_TEXT_MUTED,
  FONT_BODY,
  FW_LIGHT, FW_SEMIBOLD,
} from '../../../utils/publicConstants';

export default function TeamDiagram() {
  return (
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
  );
}