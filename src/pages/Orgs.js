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

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

export default function Orgs() {
  const { isPlatformAdmin, orgLoading } = useOrg();
  const navigate = useNavigate();
  const t = useTokens();
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 600;

  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrg, setExpandedOrg] = useState(null);
  const [orgStats, setOrgStats] = useState({}); // { [org_id]: { members, clients, activeClients, notes } }
  const [statsLoading, setStatsLoading] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [isPlatformOrg, setIsPlatformOrg] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pulsingOrgId, setPulsingOrgId] = useState(null);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!orgLoading && !isPlatformAdmin) navigate('/hq');
  }, [isPlatformAdmin, orgLoading, navigate]);

  useEffect(() => { fetchOrgs(); }, []);

  async function fetchOrgs() {
    setLoading(true);
    const { data, error } = await supabase
      .from('organizations')
      .select('org_id, name, is_platform_org, created_at, status')
      .order('name');
    if (error) console.error('fetchOrgs error:', error);
    setOrgs(data || []);
    setLoading(false);
  }

  async function fetchStats(orgId) {
    if (orgStats[orgId]) return; // already loaded
    setStatsLoading(prev => ({ ...prev, [orgId]: true }));

    const [
      { data: membersData },
      { count: clients },
      { count: activeClients },
      { count: notes },
      { count: openTasks },
    ] = await Promise.all([
      supabase.rpc('get_org_members_platform', { target_org_id: orgId }),
      supabase.from('clients').select('*', { count: 'exact', head: true }).eq('org_id', orgId).is('deleted_at', null),
      supabase.from('clients').select('*', { count: 'exact', head: true }).eq('org_id', orgId).eq('status', 'Active').is('deleted_at', null),
      supabase.from('notes').select('*', { count: 'exact', head: true }).eq('org_id', orgId),
      supabase.from('client_tasks').select('*', { count: 'exact', head: true }).eq('org_id', orgId).eq('completed', false).is('deleted_at', null),
    ]);

    const allMembers = membersData || [];
    const activeMembers = allMembers.filter(m => m.first_name && m.last_name).length;
    const totalMembers = allMembers.length;
    setOrgStats(prev => ({ ...prev, [orgId]: { activeMembers, totalMembers, clients, activeClients, notes, openTasks } }));
    setStatsLoading(prev => ({ ...prev, [orgId]: false }));
  }

  function handleToggle(orgId) {
    if (expandedOrg === orgId) {
      setExpandedOrg(null);
    } else {
      setExpandedOrg(orgId);
      fetchStats(orgId);
    }
    // Trigger border pulse on every click, clear after animation completes
    setPulsingOrgId(orgId);
    setTimeout(() => setPulsingOrgId(null), 600);
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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
    if (error) { setFormError(error.message); setSaving(false); return; }
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
      padding: isMobile ? '100px 16px 60px' : '120px 40px 80px',
      fontFamily: FONT_BODY, color: t.TEXT,
    },
    header: {
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'flex-start', marginBottom: '32px',
      flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '16px' : '0',
    },
    title: {
      fontFamily: FONT_DISPLAY, fontSize: isMobile ? '32px' : '44px', fontWeight: '300',
      color: t.TEXT, margin: '0 0 6px', letterSpacing: '0.01em', lineHeight: 1.1,
    },
    subtitle: { fontSize: '13px', color: t.TEXT_MUTED, margin: 0, fontWeight: '300' },
    addButton: {
      background: 'transparent', border: `1px solid ${ACCENT_BORDER}`,
      borderRadius: RADIUS_MD, padding: '10px 20px',
      fontSize: '14px', color: ACCENT, fontWeight: '600',
      cursor: 'pointer', fontFamily: FONT_BODY,
    },
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
    checkRow: { display: 'flex', alignItems: 'center', gap: '10px', margin: '16px 0' },
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
    orgCard: {
      background: t.SURFACE, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_LG, boxShadow: SHADOW_MD,
      marginBottom: '10px', overflow: 'hidden',
      '--pulse-color': ACCENT_BORDER,
      '--pulse-glow': `${ACCENT}22`,
      '--border-color': t.BORDER,
    },
    orgRow: {
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 24px', gap: '16px',
      cursor: 'pointer',
    },
    avatar: {
      width: '38px', height: '38px', borderRadius: '50%',
      background: ACCENT_MUTED, border: `1px solid ${ACCENT_BORDER}`,
      color: ACCENT, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontFamily: FONT_DISPLAY,
      fontSize: '16px', fontWeight: '400', flexShrink: 0,
    },
    orgInfo: { flex: 1 },
    orgName: { fontSize: '14px', color: t.TEXT, margin: 0, fontWeight: '400' },
    rowRight: { display: 'flex', alignItems: 'center', gap: '12px' },
    platformBadge: {
      fontSize: '10px', fontWeight: '600', textTransform: 'uppercase',
      letterSpacing: '0.08em', padding: '3px 10px', borderRadius: RADIUS_PILL,
      background: ACCENT_MUTED, color: ACCENT, border: `1px solid ${ACCENT_BORDER}`,
    },
    regularBadge: {
      fontSize: '10px', fontWeight: '500', textTransform: 'uppercase',
      letterSpacing: '0.08em', padding: '3px 10px', borderRadius: RADIUS_PILL,
      background: t.SURFACE_ALT, color: t.TEXT_MUTED,
    },
    statusBadge: (status) => {
      const map = {
        active:     { bg: 'rgba(29,185,84,0.12)',   color: '#1DB954' },
        onboarding: { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
        former:     { bg: 'rgba(156,163,175,0.15)', color: '#9ca3af' },
      };
      const c = map[status] || map.active;
      return {
        fontSize: '10px', fontWeight: '600', textTransform: 'uppercase',
        letterSpacing: '0.08em', padding: '3px 10px', borderRadius: RADIUS_PILL,
        background: c.bg, color: c.color,
      };
    },
    chevron: {
      fontSize: '11px', color: t.TEXT_MUTED,
      transition: 'transform 0.2s ease',
    },
    expandedPanel: {
      borderTop: `1px solid ${t.BORDER}`,
      padding: '24px',
      background: t.SURFACE_ALT,
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
      gap: '16px',
      marginBottom: '16px',
    },
    statBlock: { display: 'flex', flexDirection: 'column', gap: '4px' },
    statNumber: {
      fontFamily: FONT_BODY, fontSize: '24px',
      fontWeight: '300', color: ACCENT, lineHeight: 1,
    },
    statLabel: {
      fontSize: '10px', color: t.TEXT_MUTED, fontWeight: '500',
      textTransform: 'uppercase', letterSpacing: '0.08em',
    },
    createdDate: {
      fontSize: '11px', color: t.TEXT_MUTED, fontWeight: '300',
      marginTop: '4px',
    },
  };

  return (
    <div style={s.pageWrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes borderPulse {
          0%   { border-color: var(--pulse-color); box-shadow: 0 0 0 0 var(--pulse-glow); }
          40%  { border-color: var(--pulse-color); box-shadow: 0 0 0 3px var(--pulse-glow); }
          100% { border-color: var(--border-color); box-shadow: none; }
        }
        .org-card-pulse { animation: borderPulse 0.6s ease forwards; }
      `}</style>

      {toast && (
        <div style={{
          position: 'fixed', bottom: '32px', right: '32px',
          background: toast.type === 'success' ? ACCENT_MUTED : 'rgba(248,113,113,0.15)',
          border: `1px solid ${toast.type === 'success' ? ACCENT_BORDER : '#f87171'}`,
          color: toast.type === 'success' ? ACCENT : '#f87171',
          borderRadius: RADIUS_LG, padding: '14px 20px',
          fontSize: '14px', fontFamily: FONT_BODY, zIndex: 1000,
          backdropFilter: 'blur(8px)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          animation: 'fadeIn 0.2s ease',
        }}>
          {toast.type === 'success' ? '✓ ' : '✕ '}{toast.message}
        </div>
      )}

      <div style={s.page}>

        <div style={s.header}>
          <div>
            <h1 style={s.title}>Organisations</h1>
            <p style={s.subtitle}>Platform admin · Manage all orgs</p>
          </div>
          <button style={s.addButton} onClick={() => setShowForm(!showForm)}>
            + New Org
          </button>
        </div>

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
              <input type="checkbox" id="isPlatformOrg" checked={isPlatformOrg}
                onChange={e => setIsPlatformOrg(e.target.checked)} />
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

        {loading ? (
          <p style={{ color: t.TEXT_MUTED, fontWeight: '300' }}>Loading organisations…</p>
        ) : (
          <div>
            {orgs.map(org => {
              const isExpanded = expandedOrg === org.org_id;
              const stats = orgStats[org.org_id];
              const isStatsLoading = statsLoading[org.org_id];

              return (
                <div
                  key={org.org_id}
                  style={s.orgCard}
                  className={pulsingOrgId === org.org_id ? 'org-card-pulse' : ''}
                >
                  {/* Clickable header row */}
                  <div style={s.orgRow} onClick={() => handleToggle(org.org_id)}>
                    <div style={s.avatar}>
                      {org.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div style={s.orgInfo}>
                      <p style={s.orgName}>{org.name}</p>
                    </div>
                    <div style={s.rowRight}>
                      <span style={s.statusBadge(org.status)}>
                        {org.status ? org.status.charAt(0).toUpperCase() + org.status.slice(1) : 'Active'}
                      </span>
                      <span style={org.is_platform_org ? s.platformBadge : s.regularBadge}>
                        {org.is_platform_org ? '★ Platform' : 'Client'}
                      </span>
                      <span style={{ ...s.chevron, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        ▾
                      </span>
                    </div>
                  </div>

                  {/* Expanded stats panel */}
                  {isExpanded && (
                    <div style={{ ...s.expandedPanel, animation: 'fadeIn 0.18s ease' }}>
                      {isStatsLoading ? (
                        <p style={{ color: t.TEXT_MUTED, fontSize: '13px', fontWeight: '300', margin: 0 }}>
                          Loading stats…
                        </p>
                      ) : stats ? (
                        <>
                          <div style={s.statsGrid}>
                            <div style={s.statBlock}>
                              <span style={s.statNumber}>{stats.activeMembers ?? '—'}</span>
                              <span style={s.statLabel}>Active Members</span>
                              {(stats.totalMembers - stats.activeMembers) > 0 && (
                                <span style={{ fontSize: '11px', color: t.TEXT_MUTED, fontWeight: 300, marginTop: '2px' }}>
                                  +{stats.totalMembers - stats.activeMembers} pending
                                </span>
                              )}
                            </div>
                            <div style={s.statBlock}>
                              <span style={s.statNumber}>{stats.clients ?? '—'}</span>
                              <span style={s.statLabel}>Clients</span>
                            </div>
                            <div style={s.statBlock}>
                              <span style={s.statNumber}>{stats.activeClients ?? '—'}</span>
                              <span style={s.statLabel}>Active Clients</span>
                            </div>
                            <div style={s.statBlock}>
                              <span style={s.statNumber}>{stats.notes ?? '—'}</span>
                              <span style={s.statLabel}>Notes</span>
                            </div>
                            <div style={s.statBlock}>
                              <span style={s.statNumber}>{stats.openTasks ?? '—'}</span>
                              <span style={s.statLabel}>Open Tasks</span>
                            </div>
                          </div>
                          <p style={s.createdDate}>Created {formatDate(org.created_at)}</p>
                        </>
                      ) : null}
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