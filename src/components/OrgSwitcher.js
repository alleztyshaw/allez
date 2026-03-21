// src/components/OrgSwitcher.js
// Platform-admin-only modal to switch org context in-memory.
// Lets platform admins view demo org (or any org) as if they were a member.
// No DB writes — resets on refresh.

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useOrg } from '../context/OrgContext';
import {
  FONT_BODY, FONT_DISPLAY,
  FW_LIGHT, FW_REGULAR, FW_SEMIBOLD,
  RADIUS_MD, RADIUS_LG,
} from '../utils/hqConstants';
import { useTokens } from '../context/ThemeContext';

export default function OrgSwitcher({ onClose }) {
  const t = useTokens();
  const { switchOrg, realOrgId } = useOrg();
  const [orgs, setOrgs]       = useState([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('organizations')
      .select('org_id, name, is_demo')
      .order('name')
      .then(({ data }) => {
        setOrgs(data || []);
        setLoading(false);
      });
  }, []);

  function handleSwitch() {
    const org = orgs.find(o => o.org_id === selected);
    if (!org) return;
    switchOrg(org.org_id, org.name, org.is_demo);
    onClose();
  }

  const s = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    panel: { background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, padding: '28px 28px 24px', width: '100%', maxWidth: '340px', fontFamily: FONT_BODY, boxShadow: '0 8px 32px rgba(0,0,0,0.32)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    eyebrow: { fontSize: '10px', fontWeight: FW_SEMIBOLD, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.TEXT_MUTED, marginBottom: '4px' },
    title: { fontFamily: FONT_DISPLAY, fontSize: '18px', fontWeight: FW_LIGHT, color: t.TEXT, margin: 0 },
    closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: t.TEXT_MUTED, fontSize: '16px', padding: '4px', fontFamily: FONT_BODY },
    label: { display: 'block', fontSize: '11px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.TEXT_MUTED, marginBottom: '8px' },
    select: { width: '100%', padding: '9px 12px', background: t.SURFACE_ALT, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, color: t.TEXT, fontSize: '14px', fontWeight: FW_REGULAR, fontFamily: FONT_BODY, cursor: 'pointer', boxSizing: 'border-box' },
    footer: { display: 'flex', gap: '10px', marginTop: '24px' },
    cancelBtn: { flex: 1, padding: '10px 0', background: 'none', border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, color: t.TEXT_MUTED, fontSize: '13px', fontWeight: FW_REGULAR, fontFamily: FONT_BODY, cursor: 'pointer' },
    switchBtn: { flex: 2, padding: '10px 0', background: t.ACCENT_MUTED, border: `1px solid ${t.ACCENT_BORDER}`, borderRadius: RADIUS_MD, color: t.ACCENT, fontSize: '13px', fontWeight: FW_SEMIBOLD, fontFamily: FONT_BODY, cursor: 'pointer' },
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.panel} onClick={e => e.stopPropagation()}>
        <div style={s.header}>
          <div>
            <p style={s.eyebrow}>Platform Admin</p>
            <h2 style={s.title}>Switch Org</h2>
          </div>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <label style={s.label}>Organisation</label>
        {loading ? (
          <p style={{ fontSize: '13px', color: t.TEXT_MUTED, fontWeight: FW_LIGHT }}>Loading…</p>
        ) : (
          <select style={s.select} value={selected} onChange={e => setSelected(e.target.value)}>
            <option value="">— Select an org —</option>
            {orgs.map(o => (
              <option key={o.org_id} value={o.org_id}>
                {o.name}{o.is_demo ? ' (Demo)' : ''}{o.org_id === realOrgId ? ' ★' : ''}
              </option>
            ))}
          </select>
        )}

        <div style={s.footer}>
          <button style={s.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={s.switchBtn} onClick={handleSwitch} disabled={!selected}>
            Switch
          </button>
        </div>
      </div>
    </div>
  );
}