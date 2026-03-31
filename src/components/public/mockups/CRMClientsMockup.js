// src/components/public/mockups/CRMClientsMockup.js
// Static CRM relationship list mockup for the product page.
// Shows client rows with cadence health signals — no horizontal overflow.

import MockWindow from './MockWindow';
import {
  PUB_APP_ACCENT as ACCENT,
  PUB_APP_ACCENT_MUTED as ACCENT_MUTED,
  PUB_TEXT as L_TEXT,
  PUB_TEXT_MUTED as L_TEXT_MUTED,
  FONT_BODY,
  FW_LIGHT, FW_MEDIUM, FW_SEMIBOLD,
} from '../../../utils/publicConstants';

const CLIENTS = [
  { name: 'Margaret Chen',    aum: '$3.2M', last: 'Mar 25',  status: 'On Track',  statusColor: '#29C47A' },
  { name: 'Robert Sullivan',  aum: '$1.8M', last: 'Feb 12',  status: 'Due Soon',  statusColor: '#fbbf24' },
  { name: 'Priya Patel',      aum: '$4.1M', last: 'Jan 30',  status: 'Overdue',   statusColor: '#f87171' },
  { name: 'James Kowalski',   aum: '$2.6M', last: 'Mar 18',  status: 'On Track',  statusColor: '#29C47A' },
];

export default function CRMClientsMockup() {
  return (
    <MockWindow label="Clients — Active Book">
      <div style={{ padding: '0' }}>
        {/* Header row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 72px 72px 90px', gap: '8px', padding: '10px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          {['Client', 'AUM', 'Last Met', 'Cadence'].map(h => (
            <span key={h} style={{ fontSize: '9px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.1em', color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>{h}</span>
          ))}
        </div>
        {/* Client rows */}
        {CLIENTS.map((c, i) => (
          <div key={c.name} style={{
            display: 'grid', gridTemplateColumns: '1fr 72px 72px 90px', gap: '8px',
            padding: '11px 16px', alignItems: 'center',
            borderBottom: i < CLIENTS.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
            background: i % 2 === 0 ? 'transparent' : '#fafaf8',
          }}>
            <span style={{ fontSize: '13px', fontWeight: FW_MEDIUM, color: L_TEXT, fontFamily: FONT_BODY }}>{c.name}</span>
            <span style={{ fontSize: '12px', fontWeight: FW_LIGHT, color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>{c.aum}</span>
            <span style={{ fontSize: '12px', fontWeight: FW_LIGHT, color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>{c.last}</span>
            <span style={{
              fontSize: '10px', fontWeight: FW_SEMIBOLD, fontFamily: FONT_BODY,
              padding: '2px 8px', borderRadius: '999px',
              background: `${c.statusColor}14`,
              color: c.statusColor,
              border: `1px solid ${c.statusColor}30`,
              whiteSpace: 'nowrap', display: 'inline-block',
            }}>{c.status}</span>
          </div>
        ))}
        {/* Footer */}
        <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: L_TEXT_MUTED, fontFamily: FONT_BODY, fontWeight: FW_LIGHT }}>24 active clients</span>
          <span style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, padding: '2px 10px', borderRadius: '999px', background: ACCENT_MUTED, color: ACCENT, fontFamily: FONT_BODY }}>View all</span>
        </div>
      </div>
    </MockWindow>
  );
}