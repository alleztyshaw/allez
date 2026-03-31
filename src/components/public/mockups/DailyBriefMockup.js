// src/components/public/mockups/DailyBriefMockup.js
import MockWindow from './MockWindow';
import {
  PUB_APP_ACCENT as ACCENT,
  PUB_APP_ACCENT_MUTED as ACCENT_MUTED,
  PUB_COLOR_ERROR as COLOR_ERROR,
  PUB_TEXT as L_TEXT,
  PUB_TEXT_MUTED as L_TEXT_MUTED,
  FONT_DISPLAY, FONT_BODY,
  FW_LIGHT, FW_MEDIUM, FW_SEMIBOLD,
} from '../../../utils/publicConstants';

export default function DailyBriefMockup() {
  const meetings = [
    { time: '9:00 AM', name: 'Margaret Chen', type: 'Annual Review', duration: '60 min' },
    { time: '11:30 AM', name: 'Robert Sullivan', type: 'Portfolio Review', duration: '45 min' },
    { time: '2:00 PM', name: 'Priya Patel', type: 'Quarterly Check-in', duration: '30 min' },
  ];
  return (
    <MockWindow label="Daily Brief — Tuesday, March 25">
      <div style={{ padding: '20px 24px' }}>
        <p style={{ fontFamily: FONT_DISPLAY, fontSize: '22px', fontWeight: FW_LIGHT, color: L_TEXT, margin: '0 0 4px' }}>Good morning.</p>
        <p style={{ fontFamily: FONT_BODY, fontSize: '12px', fontWeight: FW_LIGHT, color: L_TEXT_MUTED, margin: '0 0 20px' }}>3 meetings today · 2 tasks overdue · 4 clients due for review</p>
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