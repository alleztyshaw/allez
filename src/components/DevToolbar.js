// src/components/DevToolbar.js
// Platform-admin-only panel for simulating roles and viewport.
// Triggered by the badge at the bottom of the sidebar.
// No DB writes — all overrides are in-memory only.

import { useState } from 'react';
import { useOrg } from '../context/OrgContext';
import {
  FONT_BODY, FONT_DISPLAY,
  FW_LIGHT, FW_REGULAR, FW_MEDIUM, FW_SEMIBOLD,
  RADIUS_MD, RADIUS_LG,
  ROLE_OPTIONS, SITE_ACCENT,
} from '../utils/hqConstants';
import { useTokens } from '../context/ThemeContext';

export default function DevToolbar({ onClose }) {
  const t = useTokens();
  const {
    devRoleOverride, devMobileOverride,
    setDevRoleOverride, setDevMobileOverride,
    userRole,
  } = useOrg();

  // Local selections — only committed when Activate is clicked
  const [selectedRole,   setSelectedRole]   = useState(devRoleOverride || userRole || 'advisor');
  const [selectedMobile, setSelectedMobile] = useState(devMobileOverride);

  const s = {
    overlay: {
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    panel: {
      background: t.SURFACE,
      border: `1px solid ${SITE_ACCENT}44`,
      borderRadius: RADIUS_LG,
      padding: '28px 28px 24px',
      width: '100%', maxWidth: '340px',
      fontFamily: FONT_BODY,
      boxShadow: '0 8px 32px rgba(0,0,0,0.32)',
    },
    header: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '22px',
    },
    title: {
      fontFamily: FONT_DISPLAY, fontSize: '18px',
      fontWeight: FW_LIGHT, color: t.TEXT, letterSpacing: '0.02em',
    },
    eyebrow: {
      fontSize: '10px', fontWeight: FW_SEMIBOLD, letterSpacing: '0.1em',
      textTransform: 'uppercase', color: SITE_ACCENT, marginBottom: '4px',
    },
    closeBtn: {
      background: 'none', border: 'none', cursor: 'pointer',
      color: t.TEXT_MUTED, fontSize: '16px', padding: '4px',
      fontFamily: FONT_BODY,
    },
    field: { marginBottom: '18px' },
    label: {
      display: 'block', fontSize: '11px', fontWeight: FW_SEMIBOLD,
      textTransform: 'uppercase', letterSpacing: '0.08em',
      color: t.TEXT_MUTED, marginBottom: '8px',
    },
    select: {
      width: '100%', padding: '9px 12px',
      background: t.SURFACE_ALT, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD, color: t.TEXT,
      fontSize: '14px', fontWeight: FW_REGULAR, fontFamily: FONT_BODY,
      cursor: 'pointer',
    },
    toggleRow: {
      display: 'flex', gap: '8px',
    },
    toggleBtn: (active) => ({
      flex: 1, padding: '9px 0',
      background: active ? `${SITE_ACCENT}22` : t.SURFACE_ALT,
      border: `1px solid ${active ? SITE_ACCENT : t.BORDER}`,
      borderRadius: RADIUS_MD,
      color: active ? SITE_ACCENT : t.TEXT_MUTED,
      fontSize: '13px', fontWeight: active ? FW_MEDIUM : FW_REGULAR,
      fontFamily: FONT_BODY, cursor: 'pointer',
      transition: 'all 0.15s',
    }),
    footer: {
      display: 'flex', gap: '10px', marginTop: '24px',
    },
    cancelBtn: {
      flex: 1, padding: '10px 0',
      background: 'none', border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD, color: t.TEXT_MUTED,
      fontSize: '13px', fontWeight: FW_REGULAR, fontFamily: FONT_BODY,
      cursor: 'pointer',
    },
    activateBtn: {
      flex: 2, padding: '10px 0',
      background: SITE_ACCENT, border: 'none',
      borderRadius: RADIUS_MD, color: '#fff',
      fontSize: '13px', fontWeight: FW_SEMIBOLD, fontFamily: FONT_BODY,
      cursor: 'pointer',
    },
  };

  function handleActivate() {
    setDevRoleOverride(selectedRole);
    setDevMobileOverride(selectedMobile);
    onClose();
  }

  function handleCancel() {
    onClose();
  }

  return (
    <div style={s.overlay} onClick={handleCancel}>
      <div style={s.panel} onClick={e => e.stopPropagation()}>
        <div style={s.header}>
          <div>
            <p style={s.eyebrow}>Dev Mode</p>
            <h2 style={s.title}>Simulate View</h2>
          </div>
          <button style={s.closeBtn} onClick={handleCancel}>✕</button>
        </div>

        <div style={s.field}>
          <label style={s.label}>Role</label>
          <select
            style={s.select}
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
          >
            {ROLE_OPTIONS.map(r => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div style={s.field}>
          <label style={s.label}>Viewport</label>
          <div style={s.toggleRow}>
            <button style={s.toggleBtn(!selectedMobile)} onClick={() => setSelectedMobile(false)}>
              Desktop
            </button>
            <button style={s.toggleBtn(selectedMobile)} onClick={() => setSelectedMobile(true)}>
              Mobile
            </button>
          </div>
        </div>

        <div style={s.footer}>
          <button style={s.cancelBtn} onClick={handleCancel}>Cancel</button>
          <button style={s.activateBtn} onClick={handleActivate}>Activate</button>
        </div>
      </div>
    </div>
  );
}