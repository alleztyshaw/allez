import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useOrg } from '../context/OrgContext';
import { useTokens } from '../context/ThemeContext';
import useWindowWidth from '../hooks/useWindowWidth';
import RoleDropdown, { ROLES } from '../components/RoleDropdown';
import {
  FONT_DISPLAY, FONT_BODY,
  FW_LIGHT, FW_REGULAR, FW_SEMIBOLD,
  RADIUS_MD, RADIUS_LG, RADIUS_PILL,
  SHADOW_MD, SHADOW_LG,
  SPACE_SM, SPACE_LG,
  TOPBAR_HEIGHT, MOBILE_BREAKPOINT,
  COLOR_ERROR, COLOR_INFO, COLOR_WARNING, AI_COLOR,
  pageStyles,
} from '../utils/hqConstants';

// ── Lifecycle status ─────────────────────────────────────────────────────────
function memberStatus(m) {
  if (m.is_active === false)  return 'Inactive';
  if (!m.confirmed_at)        return 'Invited';
  if (!m.onboarding_complete) return 'Setting Up';
  return 'Active';
}

const STATUS_WEIGHT  = { Active: 0, 'Setting Up': 1, Invited: 2, Inactive: 3 };
const ROLE_ORDER     = { admin: 0, manager: 1, advisor: 2, associate: 3, compliance: 4 };
const STATUS_OPTIONS = ['Active', 'Setting Up', 'Invited', 'Inactive'];

// ── Helpers ──────────────────────────────────────────────────────────────────
function memberName(m) {
  if (m.display_name) return m.display_name;
  const full = `${m.first_name || ''} ${m.last_name || ''}`.trim();
  return full || null;
}

function formatJoined(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function planDisplay(plan) {
  if (!plan) return 'Internal';
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

function roleLabel(role) {
  if (!role) return '—';
  return role.charAt(0).toUpperCase() + role.slice(1);
}

// ── Filter select ────────────────────────────────────────────────────────────
function FilterSelect({ value, onChange, options, placeholder, t }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        background: `${t.SURFACE} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23A8C0E8' strokeWidth='1.5' fill='none' strokeLinecap='round'/%3E%3C/svg%3E") no-repeat right 10px center`,
        border: `1px solid ${t.BORDER}`,
        borderRadius: RADIUS_MD, padding: '8px 32px 8px 12px',
        fontSize: '13px', color: t.TEXT_MUTED, fontFamily: FONT_BODY,
        outline: 'none', cursor: 'pointer',
        appearance: 'none', WebkitAppearance: 'none',
      }}
    >
      <option value="">{placeholder}</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
      ))}
    </select>
  );
}

// ── Component ────────────────────────────────────────────────────────────────
export default function OrgDetail() {
  const { orgId: urlOrgId }                      = useParams();
  const { isAdmin, isPlatformAdmin, orgLoading } = useOrg();
  const navigate                                 = useNavigate();
  const t                                        = useTokens();
  const windowWidth                              = useWindowWidth();
  const isMobile                                 = windowWidth < MOBILE_BREAKPOINT;
  const drawerRef                                = useRef(null);

  // Core data
  const [org,     setOrg]     = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Identity editing
  const [editingName, setEditingName] = useState(false);
  const [nameInput,   setNameInput]   = useState('');
  const [nameSaving,  setNameSaving]  = useState(false);
  const [nameError,   setNameError]   = useState('');

  // Filters
  const [search,       setSearch]       = useState('');
  const [roleFilter,   setRoleFilter]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Drawer
  const [drawerMember,      setDrawerMember]      = useState(null);
  const [drawerEditingRole, setDrawerEditingRole] = useState(false);
  const [drawerRole,        setDrawerRole]        = useState('');
  const [drawerSaving,      setDrawerSaving]      = useState(false);
  const [resending,         setResending]         = useState(false);
  const [deactivating,      setDeactivating]      = useState(false);

  // Invite
  const [showInvite,      setShowInvite]      = useState(false);
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName,  setInviteLastName]  = useState('');
  const [inviteEmail,     setInviteEmail]     = useState('');
  const [inviteRole,      setInviteRole]      = useState('advisor');
  const [inviteError,     setInviteError]     = useState('');
  const [inviteSaving,    setInviteSaving]    = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  // Auth guard
  useEffect(() => {
    if (!orgLoading && !isAdmin && !isPlatformAdmin) navigate('/hq');
  }, [isAdmin, isPlatformAdmin, orgLoading, navigate]);

  // Data fetch
  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [orgResult, membersResult] = await Promise.all([
      supabase
        .from('organizations')
        .select('org_id, name, status, plan, created_at')
        .eq('org_id', urlOrgId)
        .single(),
      isPlatformAdmin
        ? supabase.rpc('get_org_members_platform', { target_org_id: urlOrgId })
        : supabase.rpc('get_org_members'),
    ]);
    if (orgResult.data) {
      setOrg(orgResult.data);
      setNameInput(orgResult.data.name);
    }
    setMembers(membersResult.data || []);
    setLoading(false);
  }, [urlOrgId, isPlatformAdmin]);

  useEffect(() => {
    if (!urlOrgId || orgLoading) return;
    fetchAll();
  }, [urlOrgId, orgLoading, fetchAll]);

  // Close drawer on outside click
  useEffect(() => {
    function handleClick(e) {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) closeDrawer();
    }
    if (drawerMember) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [drawerMember]);

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  // Identity
  async function handleSaveName() {
    if (!nameInput.trim()) { setNameError('Name is required.'); return; }
    setNameSaving(true);
    setNameError('');
    const { error } = await supabase
      .from('organizations')
      .update({ name: nameInput.trim() })
      .eq('org_id', urlOrgId);
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

  // Drawer
  function openDrawer(m) {
    setDrawerMember(m);
    setDrawerRole(m.role);
    setDrawerEditingRole(false);
  }

  function closeDrawer() {
    setDrawerMember(null);
    setDrawerEditingRole(false);
    setDrawerRole('');
  }

  // Member actions
  async function handleRoleChange() {
    setDrawerSaving(true);
    const { error } = await supabase
      .from('org_members')
      .update({ role: drawerRole })
      .eq('user_id', drawerMember.user_id)
      .eq('org_id', urlOrgId);
    if (error) {
      showToast('Failed to update role', 'error');
    } else {
      showToast('Role updated');
      setDrawerEditingRole(false);
      setDrawerMember(prev => ({ ...prev, role: drawerRole }));
      fetchAll();
    }
    setDrawerSaving(false);
  }

  async function handleDeactivate() {
    setDeactivating(true);
    const newActive = !drawerMember.is_active;
    const { error } = await supabase
      .from('org_members')
      .update({ is_active: newActive })
      .eq('user_id', drawerMember.user_id)
      .eq('org_id', urlOrgId);
    if (error) {
      showToast('Failed to update status', 'error');
    } else {
      showToast(newActive ? `${drawerMember.email} reactivated` : `${drawerMember.email} deactivated`);
      setDrawerMember(prev => ({ ...prev, is_active: newActive }));
      fetchAll();
    }
    setDeactivating(false);
  }

  async function handleResendInvite() {
    setResending(true);
    try {
      const res = await fetch('/api/resend-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: drawerMember.email, org_id: urlOrgId, role: drawerMember.role }),
      });
      const data = await res.json();
      showToast(res.ok ? `Invite resent to ${drawerMember.email}` : (data.error || 'Resend failed'), res.ok ? 'success' : 'error');
    } catch {
      showToast('Network error — please try again', 'error');
    }
    setResending(false);
  }

  async function handleInvite() {
    if (!inviteEmail.trim()) { setInviteError('Email is required'); return; }
    setInviteSaving(true);
    setInviteError('');
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:      inviteEmail.trim(),
          role:       inviteRole,
          org_id:     urlOrgId,
          org_name:   org?.name || '',
          first_name: inviteFirstName.trim(),
          last_name:  inviteLastName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInviteError(data.error || 'Invite failed');
      } else {
        showToast(`Invite sent to ${inviteEmail.trim()}`);
        setInviteEmail(''); setInviteFirstName(''); setInviteLastName('');
        setInviteRole('advisor'); setShowInvite(false);
        fetchAll();
      }
    } catch {
      setInviteError('Network error — please try again');
    }
    setInviteSaving(false);
  }

  // Computed list
  const sorted = [...members].sort((a, b) => {
    const sa = STATUS_WEIGHT[memberStatus(a)] ?? 9;
    const sb = STATUS_WEIGHT[memberStatus(b)] ?? 9;
    if (sa !== sb) return sa - sb;
    return (ROLE_ORDER[a.role] ?? 9) - (ROLE_ORDER[b.role] ?? 9);
  });

  const filtered = sorted.filter(m => {
    if (search) {
      const name  = `${m.first_name || ''} ${m.last_name || ''} ${m.display_name || ''}`.toLowerCase();
      const email = (m.email || '').toLowerCase();
      if (!name.includes(search.toLowerCase()) && !email.includes(search.toLowerCase())) return false;
    }
    if (roleFilter   && m.role !== roleFilter)            return false;
    if (statusFilter && memberStatus(m) !== statusFilter) return false;
    return true;
  });

  // Color maps
  const ROLE_COLORS = {
    admin:      { bg: t.ACCENT_MUTED,          color: t.ACCENT      },
    manager:    { bg: 'rgba(96,165,250,0.12)',  color: COLOR_INFO    },
    advisor:    { bg: 'rgba(139,92,246,0.12)', color: AI_COLOR      },
    associate:  { bg: 'rgba(251,191,36,0.12)', color: COLOR_WARNING },
    compliance: { bg: 'rgba(52,211,153,0.12)', color: '#34d399'     },
  };

  const MEMBER_STATUS_COLORS = {
    Active:       { bg: t.ACCENT_MUTED,          color: t.ACCENT      },
    'Setting Up': { bg: 'rgba(96,165,250,0.12)', color: COLOR_INFO    },
    Invited:      { bg: 'rgba(251,191,36,0.15)', color: COLOR_WARNING },
    Inactive:     { bg: 'rgba(156,163,175,0.15)',color: '#9ca3af'     },
  };

  // Styles
  const s = {
    ...pageStyles(t, isMobile),
    backButton: {
      background: 'none', border: 'none', cursor: 'pointer',
      color: t.TEXT_MUTED, fontFamily: FONT_BODY, fontSize: '13px',
      fontWeight: FW_REGULAR, padding: '0 0 24px',
      display: 'inline-flex', alignItems: 'center', gap: '6px',
    },
    backArrow: {
      display: 'inline-block', width: 0, height: 0, flexShrink: 0,
      borderTop: '4px solid transparent', borderBottom: '4px solid transparent',
      borderRight: '5px solid currentColor',
    },
    orgName: {
      fontFamily: FONT_DISPLAY, fontSize: isMobile ? '28px' : '40px',
      fontWeight: FW_LIGHT, color: t.TEXT, margin: 0, lineHeight: 1.1,
    },
    orgMeta: {
      fontSize: '13px', color: t.TEXT_MUTED,
      fontWeight: FW_LIGHT, margin: '8px 0 0', fontFamily: FONT_BODY,
    },
    pencilButton: {
      background: 'none', border: 'none', cursor: 'pointer',
      color: t.TEXT_MUTED, padding: '4px', flexShrink: 0,
      display: 'flex', alignItems: 'center', borderRadius: RADIUS_MD,
    },
    nameInput: {
      background: t.SURFACE_ALT, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD, padding: '10px 14px',
      fontSize: isMobile ? '18px' : '24px', color: t.TEXT,
      fontFamily: FONT_BODY, outline: 'none', boxSizing: 'border-box',
      width: isMobile ? '100%' : '380px',
    },
    editActions: { display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' },
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
    errorText: { fontSize: '12px', color: COLOR_ERROR, margin: '8px 0 0', fontFamily: FONT_BODY },
    sectionHeader: {
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: SPACE_LG,
    },
    sectionLabel: {
      fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase',
      letterSpacing: '0.12em', color: t.ACCENT, margin: 0, fontFamily: FONT_BODY,
    },
    inviteButton: {
      background: 'transparent', border: `1px solid ${t.ACCENT_BORDER}`,
      borderRadius: RADIUS_MD, padding: '8px 16px',
      fontSize: '13px', color: t.ACCENT, fontWeight: FW_SEMIBOLD,
      cursor: 'pointer', fontFamily: FONT_BODY,
    },
    inviteCard: {
      background: t.SURFACE, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_LG, padding: isMobile ? '20px' : '24px',
      marginBottom: SPACE_LG, boxShadow: SHADOW_MD,
    },
    input: {
      background: t.SURFACE_ALT, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD, padding: '10px 14px',
      fontSize: '14px', color: t.TEXT, fontFamily: FONT_BODY,
      width: '100%', boxSizing: 'border-box', outline: 'none',
    },
    filterBar: {
      display: 'flex', gap: SPACE_SM, flexWrap: 'wrap',
      marginBottom: SPACE_LG, alignItems: 'center',
    },
    searchInput: {
      background: t.SURFACE, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD, padding: '8px 12px',
      fontSize: '13px', color: t.TEXT, fontFamily: FONT_BODY,
      outline: 'none', width: isMobile ? '100%' : '200px',
    },
    membersCard: {
      background: t.SURFACE, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_LG, overflow: 'hidden', boxShadow: SHADOW_MD,
    },
    tableWrapper: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? 'unset' : '480px' },
    th: {
      padding: '10px 20px', textAlign: 'left',
      fontSize: '10px', fontWeight: FW_SEMIBOLD,
      textTransform: 'uppercase', letterSpacing: '0.1em',
      color: t.TEXT_MUTED, borderBottom: `1px solid ${t.BORDER}`,
      whiteSpace: 'nowrap', fontFamily: FONT_BODY,
    },
    td: {
      padding: isMobile ? '14px 16px' : '15px 20px',
      fontSize: '13px', color: t.TEXT, fontWeight: FW_LIGHT,
      borderBottom: `1px solid ${t.BORDER}`, fontFamily: FONT_BODY,
    },
    pill: (colors) => ({
      fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase',
      letterSpacing: '0.08em', padding: '3px 10px', borderRadius: RADIUS_PILL,
      background: colors.bg, color: colors.color,
      display: 'inline-block', alignSelf: 'flex-start',
    }),
    emptyState: {
      padding: '40px', textAlign: 'center',
      color: t.TEXT_MUTED, fontSize: '13px',
      fontWeight: FW_LIGHT, fontFamily: FONT_BODY,
    },
    drawerBackdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 400 },
    drawer: {
      position: 'fixed',
      top:    isMobile ? TOPBAR_HEIGHT : TOPBAR_HEIGHT + 16,
      right:  isMobile ? 0 : 16,
      bottom: isMobile ? 0 : 16,
      width:  isMobile ? '100%' : '340px',
      background:   t.SURFACE,
      border:       `1px solid ${t.BORDER}`,
      borderRadius: isMobile ? `${RADIUS_LG} ${RADIUS_LG} 0 0` : RADIUS_LG,
      boxShadow: SHADOW_LG, zIndex: 401,
      display: 'flex', flexDirection: 'column', overflowY: 'auto',
    },
    drawerHeader: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '20px 24px', borderBottom: `1px solid ${t.BORDER}`, flexShrink: 0,
    },
    drawerTitle: {
      fontFamily: FONT_DISPLAY, fontSize: '20px',
      fontWeight: FW_LIGHT, color: t.TEXT, margin: 0,
    },
    drawerClose: {
      background: 'none', border: 'none', cursor: 'pointer',
      color: t.TEXT_MUTED, fontSize: '20px', lineHeight: 1,
      fontFamily: FONT_BODY, padding: '4px',
    },
    drawerBody: { padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 },
    drawerField: { display: 'flex', flexDirection: 'column', gap: '6px' },
    drawerFieldLabel: {
      fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase',
      letterSpacing: '0.1em', color: t.TEXT_MUTED, fontFamily: FONT_BODY,
    },
    drawerFieldValue: { fontSize: '13px', color: t.TEXT, fontWeight: FW_LIGHT, fontFamily: FONT_BODY },
    drawerDivider: { borderTop: `1px solid ${t.BORDER}`, margin: '4px 0' },
    drawerAction: (color) => ({
      background: 'none', border: 'none', cursor: 'pointer',
      fontFamily: FONT_BODY, fontSize: '13px', textAlign: 'left',
      padding: '6px 0', color,
      textDecoration: 'underline', textUnderlineOffset: '2px',
    }),
    toastStyle: (type) => ({
      position: 'fixed', bottom: '32px', right: '32px',
      background: type === 'success' ? t.ACCENT_MUTED : 'rgba(248,113,113,0.15)',
      border: `1px solid ${type === 'success' ? t.ACCENT_BORDER : COLOR_ERROR}`,
      color: type === 'success' ? t.ACCENT : COLOR_ERROR,
      borderRadius: RADIUS_LG, padding: '14px 20px',
      fontSize: '14px', fontFamily: FONT_BODY, zIndex: 500,
      backdropFilter: 'blur(8px)', boxShadow: SHADOW_LG,
      animation: 'fadeIn 0.2s ease',
    }),
  };

  // Loading / not found
  if (loading || orgLoading) {
    return (
      <div style={s.pageWrapper}>
        <div style={s.page}>
          <p style={{ color: t.TEXT_MUTED, fontWeight: FW_LIGHT, fontFamily: FONT_BODY }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div style={s.pageWrapper}>
        <div style={s.page}>
          <p style={{ color: t.TEXT_MUTED, fontWeight: FW_LIGHT, fontFamily: FONT_BODY }}>Organisation not found.</p>
        </div>
      </div>
    );
  }

  const drawerStatus       = drawerMember ? memberStatus(drawerMember) : null;
  const drawerStatusColors = drawerStatus ? (MEMBER_STATUS_COLORS[drawerStatus] || MEMBER_STATUS_COLORS.Active) : null;
  const drawerDisplayName  = drawerMember ? (memberName(drawerMember) || drawerMember.email) : '';

  return (
    <div style={s.pageWrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .org-detail-tr { cursor: pointer; }
        .org-detail-tr:hover td { background: ${t.SURFACE_ALT}; }
      `}</style>

      {toast && (
        <div style={s.toastStyle(toast.type)}>
          {toast.type === 'success' ? '✓ ' : '✕ '}{toast.message}
        </div>
      )}

      <div style={s.page}>

        {/* Back — platform admin only */}
        {isPlatformAdmin && (
          <button style={s.backButton} onClick={() => navigate('/hq/orgs')}>
            <span style={s.backArrow} />
            Back to Orgs
          </button>
        )}

        {/* ── Identity ──────────────────────────────────────────────────── */}
        <div style={{ marginBottom: '48px' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={s.orgName}>{org.name}</h1>
              {isAdmin && (
                <button style={s.pencilButton} onClick={() => setEditingName(true)} aria-label="Edit firm name">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M11.5 1.5l2 2-9 9H2.5v-2l9-9z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
          )}
          <p style={s.orgMeta}>
            {planDisplay(org.plan)}{org.status ? ` · ${org.status.charAt(0).toUpperCase() + org.status.slice(1)}` : ''}
          </p>
        </div>

        {/* ── Team members ──────────────────────────────────────────────── */}
        <div style={s.sectionHeader}>
          <p style={s.sectionLabel}>Team Members</p>
          {isAdmin && (
            <button style={s.inviteButton} onClick={() => setShowInvite(v => !v)}>
              + Invite Member
            </button>
          )}
        </div>

        {/* Invite form */}
        {showInvite && isAdmin && (
          <div style={s.inviteCard}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
                <input style={s.input} placeholder="First name (optional)" value={inviteFirstName} onChange={e => setInviteFirstName(e.target.value)} />
                <input style={s.input} placeholder="Last name (optional)"  value={inviteLastName}  onChange={e => setInviteLastName(e.target.value)}  />
              </div>
              <input style={s.input} placeholder="Email address" value={inviteEmail} onChange={e => { setInviteEmail(e.target.value); setInviteError(''); }} />
              <RoleDropdown value={inviteRole} onChange={setInviteRole} />
              {inviteError && <p style={s.errorText}>{inviteError}</p>}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={s.saveButton} onClick={handleInvite} disabled={inviteSaving}>
                  {inviteSaving ? 'Sending…' : 'Send Invite'}
                </button>
                <button style={s.cancelButton} onClick={() => {
                  setShowInvite(false); setInviteError('');
                  setInviteEmail(''); setInviteFirstName(''); setInviteLastName(''); setInviteRole('advisor');
                }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div style={s.filterBar}>
          <input
            style={s.searchInput}
            placeholder="Search members…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <FilterSelect value={roleFilter}   onChange={setRoleFilter}   options={ROLES}          placeholder="All roles"    t={t} />
          <FilterSelect value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS}  placeholder="All statuses" t={t} />
        </div>

        {/* Member table */}
        <div style={s.membersCard}>
          <div style={s.tableWrapper}>
            {filtered.length === 0 ? (
              <p style={s.emptyState}>No members found.</p>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Name</th>
                    {!isMobile && <th style={s.th}>Email</th>}
                    <th style={s.th}>Role</th>
                    <th style={s.th}>Status</th>
                    {!isMobile && <th style={s.th}>Joined</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m, idx) => {
                    const status       = memberStatus(m);
                    const statusColors = MEMBER_STATUS_COLORS[status] || MEMBER_STATUS_COLORS.Active;
                    const roleColors   = ROLE_COLORS[m.role] || { bg: t.SURFACE_ALT, color: t.TEXT_MUTED };
                    const name         = memberName(m);
                    const isLast       = idx === filtered.length - 1;
                    return (
                      <tr
                        key={m.user_id}
                        className="org-detail-tr"
                        onClick={() => openDrawer(m)}
                        style={{ borderBottom: isLast ? 'none' : undefined }}
                      >
                        <td style={s.td}>
                          <span style={{ color: name ? t.TEXT : t.TEXT_MUTED, fontStyle: name ? 'normal' : 'italic' }}>
                            {name || 'No name set'}
                          </span>
                        </td>
                        {!isMobile && <td style={{ ...s.td, color: t.TEXT_MUTED }}>{m.email || '—'}</td>}
                        <td style={s.td}><span style={s.pill(roleColors)}>{roleLabel(m.role)}</span></td>
                        <td style={s.td}><span style={s.pill(statusColors)}>{status}</span></td>
                        {!isMobile && <td style={{ ...s.td, color: t.TEXT_MUTED }}>{formatJoined(m.created_at)}</td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      {/* ── Member drawer ─────────────────────────────────────────────────── */}
      {drawerMember && (
        <>
          <div style={s.drawerBackdrop} />
          <div ref={drawerRef} style={{ ...s.drawer, animation: 'slideIn 0.22s cubic-bezier(0.4,0,0.2,1)' }}>
            <div style={s.drawerHeader}>
              <h2 style={s.drawerTitle}>{drawerDisplayName}</h2>
              <button style={s.drawerClose} onClick={closeDrawer} aria-label="Close">×</button>
            </div>
            <div style={s.drawerBody}>
              <div style={s.drawerField}>
                <span style={s.drawerFieldLabel}>Email</span>
                <span style={s.drawerFieldValue}>{drawerMember.email || '—'}</span>
              </div>
              <div style={s.drawerField}>
                <span style={s.drawerFieldLabel}>Status</span>
                <span style={s.pill(drawerStatusColors)}>{drawerStatus}</span>
              </div>
              <div style={s.drawerField}>
                <span style={s.drawerFieldLabel}>Joined</span>
                <span style={s.drawerFieldValue}>{formatJoined(drawerMember.created_at)}</span>
              </div>
              <div style={s.drawerField}>
                <span style={s.drawerFieldLabel}>Role</span>
                {drawerEditingRole ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <RoleDropdown value={drawerRole} onChange={setDrawerRole} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={s.saveButton} onClick={handleRoleChange} disabled={drawerSaving}>
                        {drawerSaving ? 'Saving…' : 'Save'}
                      </button>
                      <button style={s.cancelButton} onClick={() => { setDrawerEditingRole(false); setDrawerRole(drawerMember.role); }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span style={s.pill(ROLE_COLORS[drawerMember.role] || { bg: t.SURFACE_ALT, color: t.TEXT_MUTED })}>
                      {roleLabel(drawerMember.role)}
                    </span>
                    {!isMobile && isAdmin && drawerMember.is_active && (
                      <button
                        style={s.pencilButton}
                        onClick={() => { setDrawerEditingRole(true); setDrawerRole(drawerMember.role); }}
                        aria-label="Edit role"
                      >
                        <svg width="13" height="13" viewBox="0 0 15 15" fill="none">
                          <path d="M11.5 1.5l2 2-9 9H2.5v-2l9-9z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Actions — desktop only */}
              {!isMobile && isAdmin && !drawerEditingRole && (
                <>
                  <div style={s.drawerDivider} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {(drawerStatus === 'Invited' || drawerStatus === 'Setting Up') && (
                      <button style={s.drawerAction(t.TEXT_MUTED)} disabled={resending} onClick={handleResendInvite}>
                        {resending ? 'Sending…' : 'Resend invite'}
                      </button>
                    )}
                    <button
                      style={s.drawerAction(drawerMember.is_active ? COLOR_ERROR : t.ACCENT)}
                      disabled={deactivating}
                      onClick={handleDeactivate}
                    >
                      {deactivating ? '…' : drawerMember.is_active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}