import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useOrg } from '../context/OrgContext';
import {
  FONT_BODY,
  FONT_DISPLAY,
  RADIUS_LG,
  RADIUS_MD,
  RADIUS_PILL,
  SHADOW_MD,
  pageStyles,
  MOBILE_BREAKPOINT,
  ACCENT,
  ACCENT_MUTED,
} from '../utils/hqConstants';
import { useTokens } from '../context/ThemeContext';

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

const ROLES = ['admin', 'manager', 'advisor', 'associate', 'compliance'];

const ROLE_DESCRIPTIONS = {
  admin:      'Full access — org settings, all clients, user management',
  manager:    'View all clients and advisors, cannot manage org settings',
  advisor:    'Full access to assigned clients and notes',
  associate:  'View and add notes on assigned clients',
  compliance: 'Read-only access to all clients and notes',
};

const ROLE_COLORS = {
  admin:      { bg: ACCENT_MUTED, color: ACCENT },
  manager:    { bg: 'rgba(96,165,250,0.15)',          color: '#60a5fa' },
  advisor:    { bg: 'rgba(167,139,250,0.15)',         color: '#a78bfa' },
  associate:  { bg: 'rgba(251,191,36,0.15)',          color: '#fbbf24' },
  compliance: { bg: 'rgba(248,113,113,0.15)',         color: '#f87171' },
};

export default function Team() {
  const t = useTokens();
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < MOBILE_BREAKPOINT;
  const { orgId, isPlatformAdmin, isAdmin, orgLoading } = useOrg();
  const navigate = useNavigate();

  useEffect(() => {
    if (!orgLoading && !isAdmin) navigate('/hq');
  }, [isAdmin, orgLoading, navigate]);

  const [orgs, setOrgs]               = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [members, setMembers]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [pendingRole, setPendingRole] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole]   = useState('advisor');
  const [showInvite, setShowInvite]   = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [toast, setToast]             = useState(null);

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  useEffect(() => {
    async function fetchOrgs() {
      if (!orgId) return;
      if (isPlatformAdmin) {
        const { data } = await supabase
          .from('organizations').select('org_id, name, is_platform_org').order('name');
        setOrgs(data || []);
        setSelectedOrg(orgId);
      } else {
        const { data } = await supabase
          .from('organizations').select('org_id, name, is_platform_org')
          .eq('org_id', orgId).single();
        setOrgs(data ? [data] : []);
        setSelectedOrg(orgId);
      }
    }
    fetchOrgs();
  }, [orgId, isPlatformAdmin]);

  useEffect(() => {
    if (selectedOrg) fetchMembers(selectedOrg);
  }, [selectedOrg]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchMembers(targetOrgId) {
    setLoading(true);
    // Platform admins viewing a foreign org must use the platform RPC,
    // since get_org_members only returns rows if the caller is a member
    // of that org. Platform admins are only members of their own org.
    const rpc = (isPlatformAdmin && targetOrgId !== orgId)
      ? 'get_org_members_platform'
      : 'get_org_members';
    const { data, error } = await supabase
      .rpc(rpc, { target_org_id: targetOrgId });
    if (error) console.error('fetchMembers error:', error);
    setMembers(data || []);
    setLoading(false);
  }

  async function handleRoleChange(userId) {
    setSaving(userId);
    await supabase.from('org_members')
      .update({ role: pendingRole })
      .eq('user_id', userId).eq('org_id', selectedOrg);
    setEditingRole(null);
    setPendingRole('');
    setSaving(null);
    fetchMembers(selectedOrg);
  }

  function memberName(m) {
    if (m.first_name && m.last_name) return `${m.first_name} ${m.last_name}`;
    if (m.display_name) return m.display_name;
    return null; // handled in JSX with a pending label
  }


  const s = {
    ...pageStyles(t, isMobile),
    orgTabs: {
      display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap',
    },
    orgTab: {
      padding: '6px 16px', borderRadius: RADIUS_PILL, fontSize: '13px',
      border: `1px solid ${t.BORDER}`,
      background: 'transparent',
      color: t.TEXT_MUTED,
      cursor: 'pointer', fontFamily: FONT_BODY,
    },
    orgTabActive: {
      border: `1px solid ${t.ACCENT_BORDER}`,
      background: t.ACCENT_MUTED,
      color: t.ACCENT,
    },
    card: {
      background: t.SURFACE,
      border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_LG,
      overflow: 'hidden',
      boxShadow: SHADOW_MD,
    },
    memberRow: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 20px', gap: '16px',
    },
    avatar: {
      width: '38px', height: '38px', borderRadius: '50%',
      background: t.ACCENT_MUTED,
      border: `1px solid ${t.ACCENT_BORDER}`,
      color: t.ACCENT,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FONT_DISPLAY,
      fontSize: '16px', fontWeight: '400', flexShrink: 0,
    },
    memberInfo: { flex: 1 },
    memberName: { fontSize: '14px', color: t.TEXT, margin: '0 0 2px', fontWeight: '400' },
    memberId: { fontSize: '11px', color: t.TEXT_MUTED, margin: 0, fontWeight: '300' },
    editButton: {
      background: 'none', border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD, padding: '4px 12px',
      fontSize: '12px', color: t.TEXT_MUTED,
      cursor: 'pointer', fontFamily: FONT_BODY,
    },
    select: {
      background: t.SURFACE_ALT, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD, padding: '6px 10px',
      fontSize: '13px', color: t.TEXT,
      fontFamily: FONT_BODY, cursor: 'pointer',
    },
    saveButton: {
      background: t.ACCENT_MUTED, border: `1px solid ${t.ACCENT_BORDER}`,
      borderRadius: RADIUS_MD, padding: '6px 14px',
      fontSize: '12px', color: t.ACCENT, fontWeight: '600',
      cursor: 'pointer', fontFamily: FONT_BODY,
    },
    cancelButton: {
      background: 'none', border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD, padding: '6px 14px',
      fontSize: '12px', color: t.TEXT_MUTED,
      cursor: 'pointer', fontFamily: FONT_BODY,
    },
    roleDesc: {
      fontSize: '11px', color: t.TEXT_MUTED,
      margin: '4px 0 0', fontStyle: 'italic', fontWeight: '300',
    },
    inviteSection: {
      background: t.SURFACE, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_LG, padding: '24px',
      marginBottom: '28px', boxShadow: SHADOW_MD,
    },
    inviteTitle: {
      fontSize: '10px', fontWeight: '600',
      textTransform: 'uppercase', letterSpacing: '0.12em',
      color: t.ACCENT, margin: '0 0 16px',
    },
    input: {
      background: t.SURFACE_ALT, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD, padding: '10px 14px',
      fontSize: '14px', color: t.TEXT,
      fontFamily: FONT_BODY, width: '100%',
      boxSizing: 'border-box', outline: 'none',
    },
    addButton: {
      background: 'transparent', border: `1px solid ${t.ACCENT_BORDER}`,
      borderRadius: RADIUS_MD, padding: '10px 20px',
      fontSize: '14px', color: t.ACCENT, fontWeight: '600',
      cursor: 'pointer', fontFamily: FONT_BODY,
    },
  };

  return (
    <div style={s.pageWrapper}>
      <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
          @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          .member-card { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
          .member-card:hover { border-color: ${t.ACCENT_BORDER} !important; box-shadow: 0 4px 20px ${t.ACCENT_MUTED} !important; }
        `}</style>
      <div style={s.page}>

        {/* Toast */}
        {toast && (
          <div style={{
            position: 'fixed', bottom: '32px', right: '32px',
            background: toast.type === 'success' ? t.ACCENT_MUTED : 'rgba(248,113,113,0.15)',
            border: `1px solid ${toast.type === 'success' ? t.ACCENT_BORDER : '#f87171'}`,
            color: toast.type === 'success' ? t.ACCENT : '#f87171',
            borderRadius: RADIUS_LG, padding: '14px 20px',
            fontSize: '14px', fontFamily: FONT_BODY,
            zIndex: 1000, backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.2s ease',
          }}>
            {toast.type === 'success' ? '✓ ' : '✕ '}{toast.message}
          </div>
        )}

        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Team</h1>
            <p style={s.subtitle}>Manage members and roles</p>
          </div>
          {isAdmin && (
            <button style={s.addButton} onClick={() => setShowInvite(!showInvite)}>
              + Invite Member
            </button>
          )}
        </div>

        {/* Org selector — platform admin only */}
        {isPlatformAdmin && orgs.length > 1 && (
          <div style={s.orgTabs}>
            {orgs.map(o => (
              <button
                key={o.org_id}
                style={{
                  ...s.orgTab,
                  ...(selectedOrg === o.org_id ? s.orgTabActive : {}),
                }}
                onClick={() => setSelectedOrg(o.org_id)}
              >
                {o.name} {o.is_platform_org && '★'}
              </button>
            ))}
          </div>
        )}

        {/* Invite form */}
        {showInvite && isAdmin && (
          <div style={s.inviteSection}>
            <p style={s.inviteTitle}>Invite New Member</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                style={s.input}
                placeholder="Email address"
                value={inviteEmail}
                onChange={e => { setInviteEmail(e.target.value); setInviteError(''); }}
              />
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <select
                  style={{ ...s.select, flex: 1 }}
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}
                >
                  {ROLES.map(r => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
                <button
                  style={s.saveButton}
                  onClick={async () => {
                    if (!inviteEmail.trim()) { setInviteError('Email is required'); return; }
                    try {
                      const res = await fetch('/api/invite', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole, org_id: selectedOrg }),
                      });
                      const data = await res.json();
                      if (!res.ok) {
                        setInviteError(data.error || 'Invite failed');
                      } else {
                        showToast(`Invite sent to ${inviteEmail}`);
                        setInviteEmail('');
                        setShowInvite(false);
                      }
                    } catch {
                      setInviteError('Network error — please try again');
                    }
                  }}
                >
                  Send Invite
                </button>
                <button style={s.cancelButton} onClick={() => { setShowInvite(false); setInviteError(''); }}>
                  Cancel
                </button>
              </div>
              {inviteError && <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{inviteError}</p>}
              <p style={s.roleDesc}>{ROLE_DESCRIPTIONS[inviteRole]}</p>
            </div>
          </div>
        )}

        {/* Member list */}
        {loading ? (
          <p style={{ color: t.TEXT_MUTED, fontWeight: '300' }}>Loading team...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {members.map((m) => (
              <div
                key={m.user_id}
                className="member-card"
                style={s.card}
              >
                <div style={s.memberRow}>

                  {/* Avatar */}
                  <div style={s.avatar}>
                    {m.first_name?.[0] || m.display_name?.[0] || '·'}
                  </div>

                  {/* Name */}
                  <div style={s.memberInfo}>
                    {memberName(m) ? (
                      <p style={s.memberName}>{memberName(m)}</p>
                    ) : (
                      <p style={{ ...s.memberName, color: t.TEXT_MUTED, fontStyle: 'italic', fontWeight: 300 }}>
                        Pending setup
                      </p>
                    )}
                  </div>

                  {/* Role display or edit */}
                  {editingRole === m.user_id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <div>
                        <select
                          style={s.select}
                          value={pendingRole}
                          onChange={e => setPendingRole(e.target.value)}
                        >
                          {ROLES.map(r => (
                            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                          ))}
                        </select>
                        <p style={s.roleDesc}>{ROLE_DESCRIPTIONS[pendingRole]}</p>
                      </div>
                      <button
                        style={s.saveButton}
                        disabled={saving === m.user_id}
                        onClick={() => handleRoleChange(m.user_id)}
                      >
                        {saving === m.user_id ? 'Saving…' : 'Save'}
                      </button>
                      <button style={s.cancelButton} onClick={() => { setEditingRole(null); setPendingRole(''); }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: '600', padding: '3px 10px',
                        borderRadius: RADIUS_PILL, letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        background: ROLE_COLORS[m.role]?.bg || 'rgba(255,255,255,0.05)',
                        color: ROLE_COLORS[m.role]?.color || t.TEXT_MUTED,
                      }}>
                        {m.role.charAt(0).toUpperCase() + m.role.slice(1)}
                      </span>
                      {isAdmin && (
                        <button
                          style={s.editButton}
                          onClick={() => { setEditingRole(m.user_id); setPendingRole(m.role); }}
                        >
                          Change role
                        </button>
                      )}
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}