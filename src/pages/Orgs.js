import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useOrg } from '../context/OrgContext';
import {
  ACCENT, ACCENT_MUTED, ACCENT_BORDER,
  FONT_DISPLAY, FONT_BODY,
  RADIUS_MD, RADIUS_LG, RADIUS_PILL,
  SHADOW_MD,
} from '../utils/hqConstants';
import { useTokens } from '../context/ThemeContext';

export default function Orgs() {
  const { isPlatformAdmin, orgLoading } = useOrg();
  const navigate = useNavigate();
  const t = useTokens();

  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [isPlatformOrg, setIsPlatformOrg] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);

  // Platform admins only
  useEffect(() => {
    if (!orgLoading && !isPlatformAdmin) navigate('/hq');
  }, [isPlatformAdmin, orgLoading, navigate]);

  useEffect(() => {
    fetchOrgs();
  }, []);

  async function fetchOrgs() {
    setLoading(true);
    const { data, error } = await supabase
      .from('organizations')
      .select('org_id, name, is_platform_org, created_at')
      .order('name');
    if (error) console.error('fetchOrgs error:', error);
    setOrgs(data || []);
    setLoading(false);
  }

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleCreateOrg() {
    if (!orgName.trim()) { setFormError('Organisation name is required.'); return; }
    setSaving(true);
    setFormError('');

    const { error } = await supabase
      .from('organizations')
      .insert({ name: orgName.trim(), is_platform_org: isPlatformOrg });

    if (error) {
      setFormError(error.message);
      setSaving(false);
      return;
    }

    showToast(`"${orgName.trim()}" created`);
    setOrgName('');
    setIsPlatformOrg(false);
    setShowForm(false);
    setSaving(false);
    fetchOrgs();
  }

  const s = {
    pageWrapper: { background: t.BG, minHeight: '100vh', width: '100%' },
    page: {
      maxWidth: '1200px', margin: '0 auto',
      padding: '120px 40px 80px',
      fontFamily: FONT_BODY, color: t.TEXT,
    },
    header: {
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'flex-start', marginBottom: '32px',
    },
    title: {
      fontFamily: FONT_DISPLAY, fontSize: '44px', fontWeight: '300',
      color: t.TEXT, margin: '0 0 6px', letterSpacing: '0.01em', lineHeight: 1.1,
    },
    subtitle: { fontSize: '13px', color: t.TEXT_MUTED, margin: 0, fontWeight: '300' },
    addButton: {
      background: 'transparent', border: `1px solid ${ACCENT_BORDER}`,
      borderRadius: RADIUS_MD, padding: '10px 20px',
      fontSize: '14px', color: ACCENT, fontWeight: '600',
      cursor: 'pointer', fontFamily: FONT_BODY,
    },

    // Form card
    formCard: {
      background: t.SURFACE, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_LG, padding: '28px',
      marginBottom: '28px', boxShadow: SHADOW_MD,
    },
    formLabel: {
      fontSize: '10px', fontWeight: '600', textTransform: 'uppercase',
      letterSpacing: '0.12em', color: ACCENT, margin: '0 0 16px',
    },
    input: {
      background: t.SURFACE_ALT, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD, padding: '10px 14px',
      fontSize: '14px', color: t.TEXT, fontFamily: FONT_BODY,
      width: '100%', boxSizing: 'border-box', outline: 'none',
    },
    checkRow: {
      display: 'flex', alignItems: 'center', gap: '10px',
      margin: '16px 0',
    },
    checkLabel: { fontSize: '13px', color: t.TEXT_MUTED, fontWeight: '300' },
    formActions: { display: 'flex', gap: '10px', marginTop: '20px' },
    saveButton: {
      background: ACCENT_MUTED, border: `1px solid ${ACCENT_BORDER}`,
      borderRadius: RADIUS_MD, padding: '8px 20px',
      fontSize: '13px', color: ACCENT, fontWeight: '600',
      cursor: 'pointer', fontFamily: FONT_BODY,
    },
    cancelButton: {
      background: 'none', border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD, padding: '8px 20px',
      fontSize: '13px', color: t.TEXT_MUTED,
      cursor: 'pointer', fontFamily: FONT_BODY,
    },
    errorText: { fontSize: '12px', color: '#f87171', margin: '8px 0 0' },

    // Org list
    orgCard: {
      background: t.SURFACE, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_LG, boxShadow: SHADOW_MD,
      marginBottom: '10px',
    },
    orgRow: {
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 24px', gap: '16px',
    },
    avatar: {
      width: '38px', height: '38px', borderRadius: '50%',
      background: ACCENT_MUTED, border: `1px solid ${ACCENT_BORDER}`,
      color: ACCENT, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontFamily: FONT_DISPLAY,
      fontSize: '16px', fontWeight: '400', flexShrink: 0,
    },
    orgInfo: { flex: 1 },
    orgName: { fontSize: '14px', color: t.TEXT, margin: '0 0 2px', fontWeight: '400' },
    orgId: { fontSize: '11px', color: t.TEXT_MUTED, margin: 0, fontWeight: '300' },
    platformBadge: {
      fontSize: '10px', fontWeight: '600', textTransform: 'uppercase',
      letterSpacing: '0.08em', padding: '3px 10px',
      borderRadius: RADIUS_PILL,
      background: ACCENT_MUTED, color: ACCENT,
      border: `1px solid ${ACCENT_BORDER}`,
    },
    regularBadge: {
      fontSize: '10px', fontWeight: '500', textTransform: 'uppercase',
      letterSpacing: '0.08em', padding: '3px 10px',
      borderRadius: RADIUS_PILL,
      background: t.SURFACE_ALT, color: t.TEXT_MUTED,
    },
  };

  return (
    <div style={s.pageWrapper}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        .org-card { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .org-card:hover { border-color: ${ACCENT_BORDER} !important; box-shadow: 0 4px 20px rgba(29,185,84,0.07) !important; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '32px', right: '32px',
          background: toast.type === 'success' ? ACCENT_MUTED : 'rgba(248,113,113,0.15)',
          border: `1px solid ${toast.type === 'success' ? ACCENT_BORDER : '#f87171'}`,
          color: toast.type === 'success' ? ACCENT : '#f87171',
          borderRadius: RADIUS_LG, padding: '14px 20px',
          fontSize: '14px', fontFamily: FONT_BODY,
          zIndex: 1000, backdropFilter: 'blur(8px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          animation: 'fadeIn 0.2s ease',
        }}>
          {toast.type === 'success' ? '✓ ' : '✕ '}{toast.message}
        </div>
      )}

      <div style={s.page}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Organisations</h1>
            <p style={s.subtitle}>Platform admin · Manage all orgs</p>
          </div>
          <button style={s.addButton} onClick={() => setShowForm(!showForm)}>
            + New Org
          </button>
        </div>

        {/* Create org form */}
        {showForm && (
          <div style={s.formCard}>
            <p style={s.formLabel}>New Organisation</p>
            <input
              style={s.input}
              placeholder="Organisation name"
              value={orgName}
              onChange={e => { setOrgName(e.target.value); setFormError(''); }}
            />
            <div style={s.checkRow}>
              <input
                type="checkbox"
                id="isPlatformOrg"
                checked={isPlatformOrg}
                onChange={e => setIsPlatformOrg(e.target.checked)}
              />
              <label htmlFor="isPlatformOrg" style={s.checkLabel}>
                Platform org — marks this as an internal Allez organisation
              </label>
            </div>
            {formError && <p style={s.errorText}>{formError}</p>}
            <div style={s.formActions}>
              <button style={s.saveButton} onClick={handleCreateOrg} disabled={saving}>
                {saving ? 'Creating…' : 'Create Org'}
              </button>
              <button style={s.cancelButton} onClick={() => { setShowForm(false); setFormError(''); setOrgName(''); }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Org list */}
        {loading ? (
          <p style={{ color: t.TEXT_MUTED, fontWeight: '300' }}>Loading organisations…</p>
        ) : (
          <div>
            {orgs.map(org => (
              <div key={org.org_id} className="org-card" style={s.orgCard}>
                <div style={s.orgRow}>
                  <div style={s.avatar}>
                    {org.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={s.orgInfo}>
                    <p style={s.orgName}>{org.name}</p>
                    <p style={s.orgId}>{org.org_id}</p>
                  </div>
                  <span style={org.is_platform_org ? s.platformBadge : s.regularBadge}>
                    {org.is_platform_org ? '★ Platform' : 'Client'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}