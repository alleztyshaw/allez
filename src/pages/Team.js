import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useOrg } from '../context/OrgContext';
import {
  FONT_BODY,
  RADIUS_LG,
  RADIUS_MD,
  SHADOW_MD,
  pageStyles,
  MOBILE_BREAKPOINT,
  FW_LIGHT, FW_REGULAR, FW_SEMIBOLD,
  COLOR_ERROR, COLOR_WARNING,
} from '../utils/hqConstants';
import { useTokens } from '../context/ThemeContext';
import useWindowWidth from '../hooks/useWindowWidth';

const ROLES = ['admin', 'manager', 'advisor', 'associate', 'compliance'];

const ROLE_DESCRIPTIONS = {
  admin:      'Full access — org settings, all clients, user management',
  manager:    'View all clients and advisors, cannot manage org settings',
  advisor:    'Full access to assigned clients and notes',
  associate:  'View and add notes on assigned clients',
  compliance: 'Read-only access to all clients and notes'
};

export default function Team() {
  const t = useTokens();
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < MOBILE_BREAKPOINT;
  const { orgId, isPlatformAdmin, isAdmin, orgLoading } = useOrg();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!orgLoading && !isAdmin) navigate('/hq');
  }, [isAdmin, orgLoading, navigate]);

  const [orgs, setOrgs]                       = useState([]);
  const [selectedOrg, setSelectedOrg]         = useState(null);
  const [selectedOrgName, setSelectedOrgName] = useState('');
  const [orgSearch, setOrgSearch]             = useState('');
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [members, setMembers]                 = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [saving, setSaving]                   = useState(null);
  const [editingRole, setEditingRole]         = useState(null);
  const [pendingRole, setPendingRole]         = useState('');
  const [inviteEmail, setInviteEmail]         = useState('');
  const [inviteRole, setInviteRole]           = useState('advisor');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName]   = useState('');
  const [showInvite, setShowInvite]           = useState(false);
  const [inviteError, setInviteError]         = useState('');
  const [resending, setResending]             = useState(null);
  const [toast, setToast]                     = useState(null);

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  // Close org dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOrgDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    async function fetchOrgs() {
      if (!orgId) return;
      if (isPlatformAdmin) {
        const { data } = await supabase
          .from('organizations').select('org_id, name, is_platform_org').order('name');
        setOrgs(data || []);
        setSelectedOrg(orgId);
        const current = data?.find(o => o.org_id === orgId);
        if (current) setSelectedOrgName(current.name);
      } else {
        const { data } = await supabase
          .from('organizations').select('org_id, name, is_platform_org')
          .eq('org_id', orgId).single();
        setOrgs(data ? [data] : []);
        setSelectedOrg(orgId);
        if (data) setSelectedOrgName(data.name);
      }
    }
    fetchOrgs();
  }, [orgId, isPlatformAdmin]);

  useEffect(() => {
    if (selectedOrg) fetchMembers(selectedOrg);
  }, [selectedOrg]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchMembers(targetOrgId) {
    setLoading(true);
    const rpc = (isPlatformAdmin && targetOrgId !== orgId)
      ? 'get_org_members_platform'
      : 'get_org_members';
    const { data, error } = await supabase.rpc(rpc, { target_org_id: targetOrgId });
    if (error) console.error('fetchMembers error:', error);
    setMembers(data || []);
    setLoading(false);
  }

  async function handleRoleChange(userId) {
    setSaving(userId);
    const { error } = await supabase
      .from('org_members')
      .update({ role: pendingRole })
      .eq('user_id', userId)
      .eq('org_id', selectedOrg);

    if (error) {
      console.error('Role update error:', error);
      showToast('Failed to update role — check permissions', 'error');
    } else {
      showToast('Role updated successfully');
      setEditingRole(null);
      setPendingRole('');
      fetchMembers(selectedOrg);
    }
    setSaving(null);
  }

  async function handleResendInvite(m) {
    setResending(m.user_id);
    try {
      const res = await fetch('/api/resend-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: m.email, org_id: selectedOrg, role: m.role })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Resend failed', 'error');
      } else {
        showToast(`Invite resent to ${m.email}`);
      }
    } catch {
      showToast('Network error — please try again', 'error');
    }
    setResending(null);
  }

  function memberName(m) {
    if (m.first_name && m.last_name) return `${m.first_name} ${m.last_name}`;
    if (m.display_name) return m.display_name;
    return null;
  }

  const filteredOrgs = orgs.filter(o =>
    o.name.toLowerCase().includes(orgSearch.toLowerCase())
  );

  const cols = isMobile ? '1fr 100px 32px' : '1fr 1fr 120px 130px 180px';

  const s = {
    ...pageStyles(t, isMobile),
    dropdownWrap: { position: 'relative', marginBottom: '28px', maxWidth: '320px' },
    dropdownTrigger: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 14px', background: t.SURFACE,
      border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD,
      cursor: 'pointer', fontSize: '14px', color: t.TEXT,
      fontFamily: FONT_BODY, gap: '8px'
    },
    dropdownMenu: {
      position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
      background: t.SURFACE, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD, boxShadow: SHADOW_MD,
      zIndex: 100, overflow: 'hidden'
    },
    dropdownSearch: {
      width: '100%', padding: '10px 14px',
      background: t.SURFACE_ALT, border: 'none',
      borderBottom: `1px solid ${t.BORDER}`,
      fontSize: '13px', color: t.TEXT, fontFamily: FONT_BODY,
      outline: 'none', boxSizing: 'border-box'
    },
    dropdownOption: {
      padding: '10px 14px', fontSize: '13px',
      color: t.TEXT, cursor: 'pointer', fontFamily: FONT_BODY
    },
    tableWrap: {
      border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG,
      overflow: 'hidden', boxShadow: SHADOW_MD, overflowX: 'auto'
    },
    tableHead: {
      display: 'grid', gridTemplateColumns: cols,
      padding: '10px 20px', background: t.SURFACE_ALT,
      borderBottom: `1px solid ${t.BORDER}`, gap: '8px'
    },
    tableHeadCell: {
      fontSize: '10px', fontWeight: FW_SEMIBOLD,
      textTransform: 'uppercase', letterSpacing: '0.1em', color: t.TEXT_MUTED,
      textAlign: 'left'
    },
    tableRow: {
      display: 'grid', gridTemplateColumns: cols,
      padding: '14px 20px', borderBottom: `1px solid ${t.BORDER}`,
      background: t.SURFACE, alignItems: 'center', gap: '8px'
    },
    tableCell: { fontSize: '13px', color: t.TEXT, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' },
    tableCellMuted: { fontSize: '12px', color: t.TEXT_MUTED, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', fontWeight: FW_LIGHT },
    inviteSection: {
      background: t.SURFACE, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_LG, padding: '24px',
      marginBottom: '28px', boxShadow: SHADOW_MD
    },
    inviteTitle: {
      fontSize: '10px', fontWeight: FW_SEMIBOLD,
      textTransform: 'uppercase', letterSpacing: '0.12em',
      color: t.ACCENT, margin: '0 0 16px'
    },
    input: {
      background: t.SURFACE_ALT, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD, padding: '10px 14px',
      fontSize: '14px', color: t.TEXT,
      fontFamily: FONT_BODY, width: '100%',
      boxSizing: 'border-box', outline: 'none'
    },
    select: {
      background: t.SURFACE_ALT, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD, padding: '8px 12px',
      fontSize: '13px', color: t.TEXT,
      fontFamily: FONT_BODY, cursor: 'pointer'
    },
    saveButton: {
      background: t.ACCENT_MUTED, border: `1px solid ${t.ACCENT_BORDER}`,
      borderRadius: RADIUS_MD, padding: '8px 16px',
      fontSize: '13px', color: t.ACCENT, fontWeight: FW_SEMIBOLD,
      cursor: 'pointer', fontFamily: FONT_BODY
    },
    cancelButton: {
      background: 'none', border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD, padding: '8px 16px',
      fontSize: '13px', color: t.TEXT_MUTED,
      cursor: 'pointer', fontFamily: FONT_BODY
    },
    linkButton: {
      background: 'none', border: 'none', padding: 0,
      fontSize: '12px', color: t.ACCENT, cursor: 'pointer',
      fontFamily: FONT_BODY, textDecoration: 'underline',
      textUnderlineOffset: '2px'
    },
    linkButtonMuted: {
      background: 'none', border: 'none', padding: 0,
      fontSize: '12px', color: t.TEXT_MUTED, cursor: 'pointer',
      fontFamily: FONT_BODY, textDecoration: 'underline',
      textUnderlineOffset: '2px'
    },
    roleDesc: {
      fontSize: '11px', color: t.TEXT_MUTED,
      margin: '4px 0 0', fontStyle: 'italic', fontWeight: FW_LIGHT
    },
    addButton: {
      background: 'transparent', border: `1px solid ${t.ACCENT_BORDER}`,
      borderRadius: RADIUS_MD, padding: '10px 20px',
      fontSize: '14px', color: t.ACCENT, fontWeight: FW_SEMIBOLD,
      cursor: 'pointer', fontFamily: FONT_BODY
    }
  };

  return (
    <div style={s.pageWrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .team-row:hover { background: ${t.SURFACE_ALT} !important; }
        .dropdown-option:hover { background: ${t.SURFACE_ALT} !important; }
      `}</style>
      <div style={s.page}>

        {/* Toast */}
        {toast && (
          <div style={{
            position: 'fixed', bottom: '32px', right: '32px',
            background: toast.type === 'success' ? t.ACCENT_MUTED : `rgba(248,113,113,0.15)`,
            border: `1px solid ${toast.type === 'success' ? t.ACCENT_BORDER : COLOR_ERROR}`,
            color: toast.type === 'success' ? t.ACCENT : COLOR_ERROR,
            borderRadius: RADIUS_LG, padding: '14px 20px',
            fontSize: '14px', fontFamily: FONT_BODY,
            zIndex: 1000, animation: 'fadeIn 0.2s ease'
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
          <div style={s.dropdownWrap} ref={dropdownRef}>
            <div
              style={s.dropdownTrigger}
              onClick={() => { setOrgDropdownOpen(v => !v); setOrgSearch(''); }}
            >
              <span>{selectedOrgName || 'Select org'}</span>
              <span style={{ fontSize: '10px', color: t.TEXT_MUTED }}>
                {orgDropdownOpen ? '▲' : '▼'}
              </span>
            </div>
            {orgDropdownOpen && (
              <div style={s.dropdownMenu}>
                <input
                  autoFocus
                  style={s.dropdownSearch}
                  placeholder="Search orgs..."
                  value={orgSearch}
                  onChange={e => setOrgSearch(e.target.value)}
                />
                {filteredOrgs.map(o => (
                  <div
                    key={o.org_id}
                    className="dropdown-option"
                    style={{
                      ...s.dropdownOption,
                      color: o.org_id === selectedOrg ? t.ACCENT : t.TEXT,
                      fontWeight: o.org_id === selectedOrg ? '500' : '300'
                    }}
                    onClick={() => {
                      setSelectedOrg(o.org_id);
                      setSelectedOrgName(o.name);
                      setOrgDropdownOpen(false);
                    }}
                  >
                    {o.name}{o.is_platform_org ? ' ★' : ''}
                  </div>
                ))}
                {filteredOrgs.length === 0 && (
                  <div style={{ ...s.dropdownOption, color: t.TEXT_MUTED, fontStyle: 'italic' }}>
                    No orgs found
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Invite form */}
        {showInvite && isAdmin && (
          <div style={s.inviteSection}>
            <p style={s.inviteTitle}>Invite New Member</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  style={s.input}
                  placeholder="First name (optional)"
                  value={inviteFirstName}
                  onChange={e => setInviteFirstName(e.target.value)}
                />
                <input
                  style={s.input}
                  placeholder="Last name (optional)"
                  value={inviteLastName}
                  onChange={e => setInviteLastName(e.target.value)}
                />
              </div>
              <input
                style={s.input}
                placeholder="Email address"
                value={inviteEmail}
                onChange={e => { setInviteEmail(e.target.value); setInviteError(''); }}
              />
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '160px' }}>
                  <select
                    style={{ ...s.select, width: '100%' }}
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value)}
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                    ))}
                  </select>
                  <p style={s.roleDesc}>{ROLE_DESCRIPTIONS[inviteRole]}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
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
                            org_name: selectedOrgName,
                            first_name: inviteFirstName.trim(),
                            last_name: inviteLastName.trim()
                          })
                        });
                        const data = await res.json();
                        if (!res.ok) {
                          setInviteError(data.error || 'Invite failed');
                        } else {
                          showToast(`Invite sent to ${inviteEmail}`);
                          setInviteEmail('');
                          setInviteFirstName('');
                          setInviteLastName('');
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
              </div>
              {inviteError && <p style={{ color: COLOR_ERROR, fontSize: '13px', margin: 0 }}>{inviteError}</p>}
            </div>
          </div>
        )}

        {/* Member table */}
        {loading ? (
          <p style={{ color: t.TEXT_MUTED, fontWeight: FW_LIGHT }}>Loading team...</p>
        ) : members.length === 0 ? (
          <div style={{ color: t.TEXT_MUTED, fontSize: '14px', fontWeight: FW_LIGHT, padding: '32px 0' }}>
            No members found.
          </div>
        ) : (
          <div style={s.tableWrap}>
            <div style={s.tableHead}>
              <div style={s.tableHeadCell}>Member</div>
              {!isMobile && <div style={s.tableHeadCell}>Email</div>}
              {!isMobile && <div style={s.tableHeadCell}>Role</div>}
              {!isMobile && <div style={s.tableHeadCell}>Status</div>}
              {!isMobile && <div style={s.tableHeadCell}>Actions</div>}
            </div>

            {members.map((m, idx) => {
              const isPending = !m.onboarding_complete;
              const isLast = idx === members.length - 1;
              const name = memberName(m);

              return (
                <div
                  key={m.user_id}
                  className="team-row"
                  style={{ ...s.tableRow, borderBottom: isLast ? 'none' : `1px solid ${t.BORDER}` }}
                >
                  {/* Name */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: name ? t.TEXT : t.TEXT_MUTED, fontStyle: name ? 'normal' : 'italic', fontWeight: FW_REGULAR }}>
                      {name || 'No name set'}
                    </span>
                  </div>

                  {/* Role — mobile only */}
                  {isMobile && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: t.TEXT_MUTED, fontWeight: FW_LIGHT }}>
                        {m.role.charAt(0).toUpperCase() + m.role.slice(1)}
                      </span>
                    </div>
                  )}

                  {/* Status dot — mobile only */}
                  {isMobile && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{
                        width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
                        background: isPending ? COLOR_WARNING : t.ACCENT
                      }} />
                    </div>
                  )}

                  {/* Email */}
                  {!isMobile && (
                    <div style={s.tableCellMuted}>
                      {m.email}
                    </div>
                  )}

                  {/* Role */}
                  {!isMobile && (
                    <div style={s.tableCell}>
                      {editingRole === m.user_id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <select
                            style={s.select}
                            value={pendingRole}
                            onChange={e => setPendingRole(e.target.value)}
                          >
                            {ROLES.map(r => (
                              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                            ))}
                          </select>
                          <span style={s.roleDesc}>{ROLE_DESCRIPTIONS[pendingRole]}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '13px', color: t.TEXT, fontWeight: FW_LIGHT }}>
                          {m.role.charAt(0).toUpperCase() + m.role.slice(1)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Status */}
                  {!isMobile && (
                    <div style={s.tableCellMuted}>
                      {isPending ? (
                        <span style={{ color: COLOR_WARNING, fontSize: '12px', fontWeight: FW_LIGHT }}>Pending setup</span>
                      ) : (
                        <span style={{ color: t.ACCENT, fontSize: '12px', fontWeight: FW_LIGHT }}>Active</span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  {!isMobile && (
                    <div style={{ ...s.tableCell, gap: '16px' }}>
                      {editingRole === m.user_id ? (
                        <>
                          <button
                            style={s.saveButton}
                            disabled={saving === m.user_id}
                            onClick={() => handleRoleChange(m.user_id)}
                          >
                            {saving === m.user_id ? 'Saving…' : 'Save'}
                          </button>
                          <button
                            style={s.cancelButton}
                            onClick={() => { setEditingRole(null); setPendingRole(''); }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          {isAdmin && (
                            <button
                              style={s.linkButton}
                              onClick={() => { setEditingRole(m.user_id); setPendingRole(m.role); }}
                            >
                              Change role
                            </button>
                          )}
                          {isAdmin && isPending && (
                            <button
                              style={s.linkButtonMuted}
                              disabled={resending === m.user_id}
                              onClick={() => handleResendInvite(m)}
                            >
                              {resending === m.user_id ? 'Sending…' : 'Resend invite'}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}