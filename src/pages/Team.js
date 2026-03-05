import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useOrg } from '../context/OrgContext';
import {
  GOLD, DARK, CARD_BG, BORDER, TEXT_PRIMARY, TEXT_MUTED,
  INPUT_BG, PAGE_PADDING, PAGE_FONT
} from '../utils/hqConstants';

const ROLES = ['admin', 'manager', 'advisor', 'associate', 'compliance'];

const ROLE_DESCRIPTIONS = {
  admin:      'Full access — org settings, all clients, user management',
  manager:    'View all clients and advisors, cannot manage org settings',
  advisor:    'Full access to assigned clients and notes',
  associate:  'View and add notes on assigned clients',
  compliance: 'Read-only access to all clients and notes',
};

const ROLE_COLORS = {
  admin:      { bg: 'rgba(201,168,76,0.15)',   color: GOLD },
  manager:    { bg: 'rgba(96,165,250,0.15)',   color: '#60a5fa' },
  advisor:    { bg: 'rgba(81,218,131,0.15)',   color: '#51da83' },
  associate:  { bg: 'rgba(167,139,250,0.15)',  color: '#a78bfa' },
  compliance: { bg: 'rgba(251,191,36,0.15)',   color: '#fbbf24' },
};

export default function Team() {
  const { orgId, isPlatformAdmin, canManageUsers } = useOrg();
  const [orgs, setOrgs]           = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [members, setMembers]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(null); // user_id of member being saved
  const [editingRole, setEditingRole] = useState(null); // user_id of member being edited
  const [pendingRole, setPendingRole] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole]   = useState('advisor');
  const [showInvite, setShowInvite]   = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  // Platform admins can see all orgs; regular admins see only their own
  useEffect(() => {
    async function fetchOrgs() {
      if (!orgId) return;
      if (isPlatformAdmin) {
        const { data } = await supabase
          .from('organizations')
          .select('org_id, name, is_platform_org')
          .order('name');
        setOrgs(data || []);
        setSelectedOrg(orgId);
      } else {
        const { data } = await supabase
          .from('organizations')
          .select('org_id, name, is_platform_org')
          .eq('org_id', orgId)
          .single();
        setOrgs(data ? [data] : []);
        setSelectedOrg(orgId);
      }
    }
    fetchOrgs();
  }, [orgId, isPlatformAdmin]);

  useEffect(() => {
    if (selectedOrg) fetchMembers(selectedOrg);
  }, [selectedOrg]);

  async function fetchMembers(targetOrgId) {
    setLoading(true);
    const { data } = await supabase
      .from('org_members')
      .select('user_id, role, display_name, first_name, last_name')
      .eq('org_id', targetOrgId)
      .order('role');
    setMembers(data || []);
    setLoading(false);
  }

  async function handleRoleChange(userId) {
    setSaving(userId);
    await supabase
      .from('org_members')
      .update({ role: pendingRole })
      .eq('user_id', userId)
      .eq('org_id', selectedOrg);
    setEditingRole(null);
    setPendingRole('');
    setSaving(null);
    fetchMembers(selectedOrg);
  }

  function memberName(m) {
    if (m.first_name && m.last_name) return `${m.first_name} ${m.last_name}`;
    if (m.display_name) return m.display_name;
    return m.user_id.slice(0, 8) + '…';
  }

  const s = {
    page: {
      padding: PAGE_PADDING,
      fontFamily: PAGE_FONT,
      background: DARK,
      minHeight: '100vh',
      color: TEXT_PRIMARY,
    },
    header: {
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'flex-start', marginBottom: '32px',
    },
    title: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: '32px', fontWeight: '600',
      color: TEXT_PRIMARY, margin: '0 0 6px',
    },
    subtitle: { fontSize: '14px', color: TEXT_MUTED, margin: 0 },
    orgTabs: {
      display: 'flex', gap: '8px', marginBottom: '32px',
      flexWrap: 'wrap',
    },
    orgTab: (active) => ({
      padding: '6px 16px', borderRadius: '20px', fontSize: '13px',
      border: `1px solid ${active ? GOLD : BORDER}`,
      background: active ? 'rgba(201,168,76,0.1)' : 'transparent',
      color: active ? GOLD : TEXT_MUTED,
      cursor: 'pointer', fontFamily: PAGE_FONT,
    }),
    card: {
      background: CARD_BG, border: `1px solid ${BORDER}`,
      borderRadius: '16px', overflow: 'hidden', marginBottom: '12px',
    },
    memberRow: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 20px', gap: '16px',
    },
    avatar: {
      width: '36px', height: '36px', borderRadius: '50%',
      background: 'rgba(201,168,76,0.15)', color: GOLD,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '14px', fontWeight: '600', flexShrink: 0,
    },
    memberInfo: { flex: 1 },
    memberName: { fontSize: '14px', color: TEXT_PRIMARY, margin: '0 0 2px' },
    memberId: { fontSize: '11px', color: TEXT_MUTED, margin: 0 },
    roleBadge: (role) => ({
      fontSize: '11px', fontWeight: '500', padding: '3px 10px',
      borderRadius: '20px', letterSpacing: '0.04em',
      background: ROLE_COLORS[role]?.bg || 'rgba(255,255,255,0.05)',
      color: ROLE_COLORS[role]?.color || TEXT_MUTED,
    }),
    editButton: {
      background: 'none', border: `1px solid ${BORDER}`,
      borderRadius: '6px', padding: '4px 12px',
      fontSize: '12px', color: TEXT_MUTED,
      cursor: 'pointer', fontFamily: PAGE_FONT,
    },
    select: {
      background: INPUT_BG, border: `1px solid ${BORDER}`,
      borderRadius: '8px', padding: '6px 10px',
      fontSize: '13px', color: TEXT_PRIMARY,
      fontFamily: PAGE_FONT, cursor: 'pointer',
    },
    saveButton: {
      background: GOLD, border: 'none', borderRadius: '6px',
      padding: '6px 14px', fontSize: '12px',
      color: DARK, fontWeight: '600',
      cursor: 'pointer', fontFamily: PAGE_FONT,
    },
    cancelButton: {
      background: 'none', border: `1px solid ${BORDER}`,
      borderRadius: '6px', padding: '6px 14px',
      fontSize: '12px', color: TEXT_MUTED,
      cursor: 'pointer', fontFamily: PAGE_FONT,
    },
    roleDesc: {
      fontSize: '11px', color: TEXT_MUTED,
      margin: '4px 0 0', fontStyle: 'italic',
    },
    divider: { height: '1px', background: BORDER, margin: '0' },
    inviteSection: {
      background: CARD_BG, border: `1px solid ${BORDER}`,
      borderRadius: '16px', padding: '24px',
      marginTop: '24px',
    },
    inviteTitle: {
      fontSize: '15px', fontWeight: '600',
      color: TEXT_PRIMARY, margin: '0 0 16px',
    },
    input: {
      background: INPUT_BG, border: `1px solid ${BORDER}`,
      borderRadius: '8px', padding: '10px 14px',
      fontSize: '14px', color: TEXT_PRIMARY,
      fontFamily: PAGE_FONT, width: '100%',
      boxSizing: 'border-box',
    },
    addButton: {
      background: GOLD, border: 'none', borderRadius: '10px',
      padding: '10px 24px', fontSize: '14px',
      color: DARK, fontWeight: '600',
      cursor: 'pointer', fontFamily: PAGE_FONT,
    },
  };

  return (
    <div style={s.page}>

      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Team</h1>
          <p style={s.subtitle}>Manage members and roles</p>
        </div>
        {canManageUsers && (
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
              style={s.orgTab(selectedOrg === o.org_id)}
              onClick={() => setSelectedOrg(o.org_id)}
            >
              {o.name} {o.is_platform_org && '★'}
            </button>
          ))}
        </div>
      )}

      {/* Invite form */}
      {showInvite && canManageUsers && (
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
                      body: JSON.stringify({
                        email: inviteEmail.trim(),
                        role: inviteRole,
                        org_id: selectedOrg,
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      setInviteError(data.error || 'Invite failed');
                    } else {
                      setInviteSuccess(`Invite sent to ${inviteEmail}`);
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
            {inviteError   && <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{inviteError}</p>}
            {inviteSuccess && <p style={{ color: '#51da83', fontSize: '13px', margin: 0 }}>{inviteSuccess}</p>}
            <p style={s.roleDesc}>{ROLE_DESCRIPTIONS[inviteRole]}</p>
          </div>
        </div>
      )}

      {/* Member list */}
      {loading ? (
        <p style={{ color: TEXT_MUTED }}>Loading team...</p>
      ) : (
        <div>
          {members.map((m, i) => (
            <div key={m.user_id}>
              <div style={s.card}>
                <div style={s.memberRow}>

                  {/* Avatar */}
                  <div style={s.avatar}>
                    {m.first_name?.[0] || m.display_name?.[0] || '?'}
                  </div>

                  {/* Name + ID */}
                  <div style={s.memberInfo}>
                    <p style={s.memberName}>{memberName(m)}</p>
                    <p style={s.memberId}>{m.user_id.slice(0, 16)}…</p>
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
                      <span style={s.roleBadge(m.role)}>
                        {m.role.charAt(0).toUpperCase() + m.role.slice(1)}
                      </span>
                      {canManageUsers && (
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}