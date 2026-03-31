// src/components/public/mockups/SearchMockup.js
import MockWindow from './MockWindow';
import {
  PUB_APP_ACCENT as ACCENT,
  PUB_APP_ACCENT_MUTED as ACCENT_MUTED,
  PUB_TEXT as L_TEXT,
  PUB_TEXT_MUTED as L_TEXT_MUTED,
  PUB_TEXT_SUBTLE as L_TEXT_SUBTLE,
  FONT_BODY,
  FW_MEDIUM,
} from '../../../utils/publicConstants';

export default function SearchMockup({ query = 'chen' }) {
  return (
    <MockWindow label="Global Search">
      <div style={{ padding: '0' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke={L_TEXT_MUTED} strokeWidth="1.5"/>
            <path d="M13.5 13.5L17 17" stroke={L_TEXT_MUTED} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: '13px', color: L_TEXT, fontFamily: FONT_BODY }}>{query}</span>
          <span style={{ marginLeft: 'auto', fontSize: '10px', color: L_TEXT_SUBTLE, fontFamily: FONT_BODY, border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', padding: '1px 5px' }}>Esc</span>
        </div>
        {[
          { group: 'Clients', items: [{ label: 'Margaret Chen', sub: 'Active · $3.2M AUM' }, { label: 'David Chen', sub: 'Prospect · Lead stage' }] },
          { group: 'Notes', items: [{ label: 'Annual Review – Margaret Chen', sub: 'Mar 25, 2026 · Meeting' }] },
        ].map(group => (
          <div key={group.group}>
            <p style={{ fontSize: '9px', fontWeight: FW_MEDIUM, textTransform: 'uppercase', letterSpacing: '0.12em', color: L_TEXT_SUBTLE, margin: 0, padding: '10px 16px 4px', fontFamily: FONT_BODY }}>{group.group}</p>
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
          <p style={{ margin: 0, fontSize: '10px', color: L_TEXT_SUBTLE, fontFamily: FONT_BODY }}>Press arrow keys to navigate · Enter to open</p>
        </div>
      </div>
    </MockWindow>
  );
}