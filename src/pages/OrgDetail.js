import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useOrg } from '../context/OrgContext';
import { useTokens } from '../context/ThemeContext';
import useWindowWidth from '../hooks/useWindowWidth';
import {
  FONT_DISPLAY, FONT_BODY,
  FW_LIGHT, FW_REGULAR, FW_SEMIBOLD,
  RADIUS_MD, RADIUS_LG, RADIUS_PILL,
  SHADOW_MD, SHADOW_LG,
  SPACE_LG,
  MOBILE_BREAKPOINT,
  COLOR_ERROR, COLOR_INFO, COLOR_WARNING, AI_COLOR,
  pageStyles,
} from '../utils/hqConstants';

function memberStatus(m) {
  if (!m.confirmed_at)      return 'Pending';
  if (m.is_active === false) return 'Inactive';
  return 'Active';
}

export default function OrgDetail() {
  const { orgId }                                    = useParams();
  const { isAdmin, isPlatformAdmin, orgLoading }     = useOrg();
  const navigate                                     = useNavigate();
  const t                                            = useTokens();
  const windowWidth                                  = useWindowWidth();
  const isMobile                                     = windowWidth < MOBILE_BREAKPOINT;

  const [org,         setOrg]         = useState(null);
  const [members,     setMembers]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameInput,   setNameInput]   = useState('');
  const [nameSaving,  setNameSaving]  = useState(false);
  const [nameError,   setNameError]   = useState('');
  const [toast,       setToast]       = useState(null);

  useEffect(() => {
    if (!orgLoading && !isAdmin && !isPlatformAdmin) navigate('/hq');
  }, [isAdmin, isPlatformAdmin, orgLoading, navigate]);

  useEffect(() => {
    if (!orgId || orgLoading) return;
    fetchAll();
  }, [orgId, orgLoading]);

  async function fetchAll() {
    setLoading(true);
    const [orgResult, membersResult] = await Promise.all([
      supabase
        .from('organizations')
        .select('org_id, name, status, plan, created_at')
        .eq('org_id', orgId)
        .single(),
      isPlatformAdmin
        ? supabase.rpc('get_org_members_platform', { target_org_id: orgId })
        : supabase.rpc('get_org_members'),
    ]);
    if (orgResult.data) {
      setOrg(orgResult.data);
      setNameInput(orgResult.data.name);
    }
    setMembers(membersResult.data || []);
    setLoading(false);
  }

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleSaveName() {
    if (!nameInput.trim()) { setNameError('Name is required.'); return; }
    setNameSaving(true);
    setNameError('');
    const { error } = await supabase
      .from('organizations')
      .update({ name: nameInput.trim() })
      .eq('org_id', orgId);
    if (error) { setNameError(error.message); setNameSaving(false); return; }
    setOrg(prev => ({ ...prev, name: nameInput.trim() }));
    setEditingName(false);
    setNameSaving(false);
    showToast('Firm name updated');
  }

  function handleCancelEdit() {
    setNameInput(org.name);
    setEditingName(false);
    setNameError('');
  }

  function formatJoined(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  function roleLabel(role) {
    if (!role) return '—';
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  const ROLE_COLORS = {
    admin:      { bg: t.ACCENT_MUTED,           color: t.ACCENT      },
    manager:    { bg: 'rgba(96,165,250,0.12)',   color: COLOR_INFO    },
    advisor:    { bg: 'rgba(139,92,246,0.12)',   color: AI_COLOR      },
    associate:  { bg: 'rgba(251,191,36,0.12)',   color: COLOR_WARNING },
    compliance: { bg: 'rgba(52,211,153,0.12)',   color: '#34d399'     },
  };

  const MEMBER_STATUS_COLORS = {
    Active:   { bg: t.ACCENT_MUTED,           color: t.ACCENT      },
    Pending:  { bg: 'rgba(251,191,36,0.15)',   color: COLOR_WARNING },
    Inactive: { bg: 'rgba(156,163,175,0.15)', color: '#9ca3af'     },
  };

  const s = {
    ...pageStyles(t, isMobile),
    backButton: {
      background: 'none', border: 'none', cursor: 'pointer',
      color: t.TEXT_MUTED, fontFamily: FONT_BODY, fontSize: '13px',
      fontWeight: FW_REGULAR, padding: '0 0 24px',
      display: 'inline-flex', alignItems: 'center', gap: '6px',
    },
    backArrow: {
      display:      'inline-block',
      width:        0,
      height:       0,
      borderTop:    '4px solid transparent',
      borderBottom: '4px solid transparent',
      borderRight:  '5px solid currentColor',
      flexShrink:   0,
    },
    identityCard: {
      background: t.SURFACE, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_LG, padding: isMobile ? '24px' : '32px',
      marginBottom: SPACE_LG, boxShadow: SHADOW_MD,
    },
    cardLabel: {
      fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase',
      letterSpacing: '0.12em', color: t.ACCENT, margin: '0 0 12px',
      fontFamily: FONT_BODY, display: 'block',
    },
    nameRow: {
      display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
    },
    orgNameDisplay: {
      fontFamily: FONT_DISPLAY, fontSize: isMobile ? '28px' : '36px',
      fontWeight: FW_LIGHT, color: t.TEXT, margin: 0, lineHeight: 1.1,
    },
    pencilButton: {
      background: 'none', border: 'none', cursor: 'pointer',
      color: t.TEXT_MUTED, padding: '4px',
      display: 'flex', alignItems: 'center', borderRadius: RADIUS_MD,
    },
    nameInput: {
      background: t.SURFACE_ALT, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD, padding: '10px 14px',
      fontSize: isMobile ? '18px' : '22px', color: t.TEXT,
      fontFamily: FONT_BODY, outline: 'none', boxSizing: 'border-box',
      width: isMobile ? '100%' : '380px',
    },
    editActions: {
      display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap',
    },
    saveButton: {
      background: t.ACCENT_MUTED, border: `1px solid ${t.ACCENT_BORDER}`,
      borderRadius: RADIUS_MD, padding: '8px 20px',
      fontSize: '13px', color: t.ACCENT, fontWeight: FW_SEMIBOLD,
      cursor: 'pointer', fontFamily: FONT_BODY,
    },
    cancelButton: {
      background: 'none', border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD, padding: '8px 20px',
      fontSize: '13px', color: t.TEXT_MUTED,
      cursor: 'pointer', fontFamily: FONT_BODY,
    },
    errorText: {
      fontSize: '12px', color: COLOR_ERROR,
      margin: '8px 0 0', fontFamily: FONT_BODY,
    },
    membersCard: {
      background: t.SURFACE, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_LG, overflow: 'hidden', boxShadow: SHADOW_MD,
    },
    membersHeader: {
      padding: isMobile ? '20px 20px 16px' : '24px 28px 20px',
      borderBottom: `1px solid ${t.BORDER}`,
    },
    membersTitle: {
      fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase',
      letterSpacing: '0.12em', color: t.ACCENT, margin: 0, fontFamily: FONT_BODY,
    },
    tableWrapper: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', minWidth: '520px' },
    th: {
      padding: '10px 20px', textAlign: 'left',
      fontSize: '10px', fontWeight: FW_SEMIBOLD,
      textTransform: 'uppercase', letterSpacing: '0.1em',
      color: t.TEXT_MUTED, borderBottom: `1px solid ${t.BORDER}`,
      whiteSpace: 'nowrap', fontFamily: FONT_BODY,
    },
    td: {
      padding: isMobile ? '14px 20px' : '16px 20px',
      fontSize: '13px', color: t.TEXT, fontWeight: FW_LIGHT,
      borderBottom: `1px solid ${t.BORDER}`, fontFamily: FONT_BODY,
    },
    rolePill: (role) => {
      const c = ROLE_COLORS[role] || { bg: t.SURFACE_ALT, color: t.TEXT_MUTED };
      return {
        fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase',
        letterSpacing: '0.08em', padding: '3px 10px', borderRadius: RADIUS_PILL,
        background: c.bg, color: c.color, display: 'inline-block',
      };
    },
    memberStatusPill: (status) => {
      const c = MEMBER_STATUS_COLORS[status] || MEMBER_STATUS_COLORS.Active;
      return {
        fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase',
        letterSpacing: '0.08em', padding: '3px 10px', borderRadius: RADIUS_PILL,
        background: c.bg, color: c.color, display: 'inline-block',
      };
    },
    emptyState: {
      padding: '40px', textAlign: 'center',
      color: t.TEXT_MUTED, fontSize: '13px',
      fontWeight: FW_LIGHT, fontFamily: FONT_BODY,
    },
    toastStyle: (type) => ({
      position: 'fixed', bottom: '32px', right: '32px',
      background: type === 'success' ? t.ACCENT_MUTED : 'rgba(248,113,113,0.15)',
      border: `1px solid ${type === 'success' ? t.ACCENT_BORDER : COLOR_ERROR}`,
      color: type === 'success' ? t.ACCENT : COLOR_ERROR,
      borderRadius: RADIUS_LG, padding: '14px 20px',
      fontSize: '14px', fontFamily: FONT_BODY, zIndex: 1000,
      backdropFilter: 'blur(8px)', boxShadow: SHADOW_LG,
      animation: 'fadeIn 0.2s ease',
    }),
  };

  if (loading || orgLoading) {
    return (
      <div style={s.pageWrapper}>
        <div style={s.page}>
          <p style={{ color: t.TEXT_MUTED, fontWeight: FW_LIGHT, fontFamily: FONT_BODY }}>
            Loading…
          </p>
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div style={s.pageWrapper}>
        <div style={s.page}>
          <p style={{ color: t.TEXT_MUTED, fontWeight: FW_LIGHT, fontFamily: FONT_BODY }}>
            Organisation not found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.pageWrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .org-detail-tr:hover { background: ${t.SURFACE_ALT}; }
      `}</style>

      {toast && (
        <div style={s.toastStyle(toast.type)}>
          {toast.type === 'success' ? '✓ ' : '✕ '}{toast.message}
        </div>
      )}

      <div style={s.page}>
        {isPlatformAdmin && (
          <button style={s.backButton} onClick={() => navigate('/hq/orgs')}>
            <span style={s.backArrow} />
            Back to Orgs
          </button>
        )}

        <div style={s.header}>
          <div>
            <h1 style={s.title}>Organization</h1>
            <p style={s.subtitle}>
              {isPlatformAdmin ? 'Platform admin · Org detail' : 'Firm settings'}
            </p>
          </div>
        </div>

        {/* ── Firm identity ─────────────────────────────────────────────── */}
        <div style={s.identityCard}>
          <span style={s.cardLabel}>Firm Name</span>
          {editingName ? (
            <div>
              <input
                style={s.nameInput}
                value={nameInput}
                onChange={e => { setNameInput(e.target.value); setNameError(''); }}
                autoFocus
              />
              {nameError && <p style={s.errorText}>{nameError}</p>}
              <div style={s.editActions}>
                <button style={s.saveButton} onClick={handleSaveName} disabled={nameSaving}>
                  {nameSaving ? 'Saving…' : 'Save'}
                </button>
                <button style={s.cancelButton} onClick={handleCancelEdit}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={s.nameRow}>
              <h2 style={s.orgNameDisplay}>{org.name}</h2>
              {isAdmin && (
                <button
                  style={s.pencilButton}
                  onClick={() => setEditingName(true)}
                  aria-label="Edit firm name"
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.5 1.5l2 2-9 9H2.5v-2l9-9z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Member table ──────────────────────────────────────────────── */}
        <div style={s.membersCard}>
          <div style={s.membersHeader}>
            <p style={s.membersTitle}>Team Members</p>
          </div>
          <div style={s.tableWrapper}>
            {members.length === 0 ? (
              <p style={s.emptyState}>No active members found.</p>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Name</th>
                    <th style={s.th}>Email</th>
                    <th style={s.th}>Role</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => {
                    const status = memberStatus(m);
                    return (
                      <tr key={m.user_id} className="org-detail-tr">
                        <td style={s.td}>
                          {m.display_name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || '—'}
                        </td>
                        <td style={{ ...s.td, color: t.TEXT_MUTED }}>{m.email || '—'}</td>
                        <td style={s.td}>
                          <span style={s.rolePill(m.role)}>{roleLabel(m.role)}</span>
                        </td>
                        <td style={s.td}>
                          <span style={s.memberStatusPill(status)}>{status}</span>
                        </td>
                        <td style={{ ...s.td, color: t.TEXT_MUTED }}>
                          {formatJoined(m.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}