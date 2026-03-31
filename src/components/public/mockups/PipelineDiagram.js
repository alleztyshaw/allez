// src/components/public/mockups/PipelineDiagram.js
import {
  PUB_APP_ACCENT as ACCENT,
  PUB_APP_ACCENT_MUTED as ACCENT_MUTED,
  PUB_APP_ACCENT_BORDER as ACCENT_BORDER,
  PUB_TEXT as L_TEXT,
  PUB_TEXT_MUTED as L_TEXT_MUTED,
  FONT_BODY,
  FW_REGULAR, FW_MEDIUM, FW_SEMIBOLD,
} from '../../../utils/publicConstants';

export default function PipelineDiagram() {
  const stages = ['Lead', 'Proposal', 'Agreement', 'Onboarding', 'Active'];
  const active = 2;
  return (
    <div style={{ padding: '28px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
      <p style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.1em', color: L_TEXT_MUTED, margin: '0 0 20px', fontFamily: FONT_BODY }}>Prospect pipeline</p>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', overflowX: 'auto' }}>
        {stages.map((stage, i) => (
          <div key={stage} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                padding: '7px 4px', borderRadius: '6px', fontSize: '11px',
                fontWeight: i <= active ? FW_SEMIBOLD : FW_REGULAR,
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