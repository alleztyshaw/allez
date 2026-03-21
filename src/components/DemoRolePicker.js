// src/components/DemoRolePicker.js
// Role switcher for demo org members — role-only, no dev tools.
// Lets salespeople cycle through roles during a demo without logging out.

import { useState } from 'react';
import { useOrg } from '../context/OrgContext';
import {
  FONT_BODY, FONT_DISPLAY,
  FW_LIGHT, FW_REGULAR, FW_SEMIBOLD,
  RADIUS_MD, RADIUS_LG,
  ROLE_OPTIONS,
} from '../utils/hqConstants';
import { useTokens } from '../context/ThemeContext';

export default function DemoRolePicker({ onClose }) {
  const t = useTokens();
  const { demoRoleOverride, setDemoRoleOverride, userRole } = useOrg();
  const [selected, setSelected] = useState(demoRoleOverride || userRole || 'advisor');

  function handleApply() {
    setDemoRoleOverride(selected);
    onClose();
  }

  function handleReset() {
    setDemoRoleOverride(null);
    onClose();
  }

  const s = {
    overlay: {
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    panel: {
      background: t.SURFACE,
      border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_LG,
      padding: '28px 28px 24px',
      width: '100%', maxWidth: '320px',
      fontFamily: FONT_BODY,
      boxShadow: '0 8px 32px rgba(0,0,0,0.32)',
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    eyebrow: { fontSize: '10px', fontWeight: FW_SEMIBOLD, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.ACCENT, marginBottom: '4px' },
    title: { fontFamily: FONT_DISPLAY, fontSize: '18px', fontWeight: FW_LIGHT, color: t.TEXT, margin: 0 },
    closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: t.TEXT_MUTED, fontSize: '16px', padding: '4px', fontFamily: FONT_BODY },
    label: { display: 'block', fontSize: '11px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.TEXT_MUTED, marginBottom: '8px' },
    select: { width: '100%', padding: '9px 12px', background: t.SURFACE_ALT, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, color: t.TEXT, fontSize: '14px', fontWeight: FW_REGULAR, fontFamily: FONT_BODY, cursor: 'pointer', boxSizing: 'border-box' },
    footer: { display: 'flex', gap: '10px', marginTop: '24px' },
    resetBtn: { flex: 1, padding: '10px 0', background: 'none', border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, color: t.TEXT_MUTED, fontSize: '13px', fontWeight: FW_REGULAR, fontFamily: FONT_BODY, cursor: 'pointer' },
    applyBtn: { flex: 2, padding: '10px 0', background: t.ACCENT_MUTED, border: `1px solid ${t.ACCENT_BORDER}`, borderRadius: RADIUS_MD, color: t.ACCENT, fontSize: '13px', fontWeight: FW_SEMIBOLD, fontFamily: FONT_BODY, cursor: 'pointer' },
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.panel} onClick={e => e.stopPropagation()}>
        <div style={s.header}>
          <div>
            <p style={s.eyebrow}>Demo Mode</p>
            <h2 style={s.title}>Switch Role</h2>
          </div>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <label style={s.label}>View as</label>
        <select style={s.select} value={selected} onChange={e => setSelected(e.target.value)}>
          {ROLE_OPTIONS.map(r => (
            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
          ))}
        </select>

        <div style={s.footer}>
          <button style={s.resetBtn} onClick={handleReset}>Reset</button>
          <button style={s.applyBtn} onClick={handleApply}>Apply</button>
        </div>
      </div>
    </div>
  );
}