import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useOrg } from '../context/OrgContext';
import { useTokens } from '../context/ThemeContext';
import useWindowWidth from '../hooks/useWindowWidth';
import {
  FONT_DISPLAY, FONT_BODY,
  FW_LIGHT, FW_REGULAR, FW_SEMIBOLD,
  RADIUS_MD, RADIUS_LG, RADIUS_PILL,
  SHADOW_MD,
  SPACE_SM, SPACE_LG,
  MOBILE_BREAKPOINT,
  COLOR_ERROR, COLOR_INFO,
  PLAN_OPTIONS, ORG_STATUS_OPTIONS,
  pageStyles,
} from '../utils/hqConstants';

function SortTriangle({ active, dir }) {
  if (!active) return null;
  return (
    <span style={{
      display:       'inline-block',
      width:         0,
      height:        0,
      marginLeft:    '5px',
      verticalAlign: 'middle',
      borderLeft:    '4px solid transparent',
      borderRight:   '4px solid transparent',
      ...(dir === 'asc'
        ? { borderBottom: '5px solid currentColor' }
        : { borderTop:    '5px solid currentColor' }),
    }} />
  );
}

export default function Orgs() {
  const { isAdmin, isPlatformAdmin, orgLoading } = useOrg();
  const navigate    = useNavigate();
  const t           = useTokens();
  const windowWidth = useWindowWidth();
  const isMobile    = windowWidth < MOBILE_BREAKPOINT;

  const [orgs,    setOrgs]    = useState([]);
  const [loading, setLoading] = useState(true);

  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter,   setPlanFilter]   = useState('');
  const [typeFilter,   setTypeFilter]   = useState('');

  const [showForm,     setShowForm]     = useState(false);
  const [orgName,      setOrgName]      = useState('');
  const [selectedPlan, setSelectedPlan] = useState('Starter');
  const [saving,       setSaving]       = useState(false);
  const [formError,    setFormError]    = useState('');
  const [toast,        setToast]        = useState(null);

  useEffect(() => {
    if (!orgLoading && !isPlatformAdmin && !isAdmin) navigate('/hq');
  }, [isPlatformAdmin, isAdmin, orgLoading, navigate]);

  useEffect(() => {
    if (orgLoading) return;
    fetchOrgs();
  }, [orgLoading, isPlatformAdmin]);

  async function fetchOrgs() {
    setLoading(true);
    const { data, error } = isPlatformAdmin
      ? await supabase.rpc('get_all_orgs_platform')
      : await supabase.rpc('get_my_admin_orgs');
    if (error) console.error('fetchOrgs error:', error);
    setOrgs(data || []);
    setLoading(false);
  }

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleCreateOrg() {
    if (!orgName.trim()) { setFormError('Organisation name is required.'); return; }
    setSaving(true);
    setFormError('');
    const isInternal = selectedPlan === 'Internal';
    const { error } = await supabase
      .from('organizations')
      .insert({
        name:            orgName.trim(),
        is_platform_org: isInternal,
        plan:            isInternal ? null : selectedPlan.toLowerCase(),
        status:          'onboarding',
      });
    if (error) { setFormError(error.message); setSaving(false); return; }
    showToast(`"${orgName.trim()}" created`);
    setOrgName('');
    setSelectedPlan('Starter');
    setShowForm(false);
    setSaving(false);
    fetchOrgs();
  }

  function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  const TYPE_OPTIONS = [
    { value: 'platform',  label: 'Platform'  },
    { value: 'demo',      label: 'Demo'      },
    { value: 'customer',  label: 'Customer'  },
  ];

  const COLUMNS = [
    { key: 'name',         label: 'Name',    sortable: true  },
    { key: 'status',       label: 'Status',  sortable: true  },
    { key: 'plan',         label: 'Plan',    sortable: true  },
    { key: 'member_count', label: 'Members', sortable: true  },
    { key: 'created_at',   label: 'Created', sortable: true  },
    { key: 'type',         label: 'Type',    sortable: false },
  ];

  const filtered = orgs
    .filter(o => {
      if (search       && !o.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter && o.status !== statusFilter)                            return false;
      if (planFilter   && o.plan   !== planFilter.toLowerCase())                return false;
      if (typeFilter === 'platform' && !o.is_platform_org)                     return false;
      if (typeFilter === 'demo'     && !o.is_demo)                             return false;
      if (typeFilter === 'customer' && (o.is_platform_org || o.is_demo))       return false;
      return true;
    })
    .sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];
      if (sortKey === 'created_at') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (sortKey === 'member_count') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });

  function statusBadgeStyle(status) {
    const map = {
      active:     { bg: t.ACCENT_MUTED,            color: t.ACCENT  },
      onboarding: { bg: 'rgba(251,191,36,0.15)',    color: '#fbbf24' },
      inactive:   { bg: 'rgba(156,163,175,0.15)',   color: '#9ca3af' },
    };
    const c = map[status] || map.active;
    return {
      fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase',
      letterSpacing: '0.08em', padding: '3px 10px', borderRadius: RADIUS_PILL,
      background: c.bg, color: c.color, display: 'inline-block',
    };
  }

  function typePillStyle(type) {
    const base = {
      fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase',
      letterSpacing: '0.08em', padding: '3px 10px', borderRadius: RADIUS_PILL,
      display: 'inline-block',
    };
    if (type === 'platform') return {
      ...base,
      background: t.ACCENT_MUTED, color: t.ACCENT,
      border: `1px solid ${t.ACCENT_BORDER}`,
    };
    if (type === 'demo') return {
      ...base,
      background: t.SURFACE_ALT, color: t.TEXT_MUTED,
    };
    // customer
    return {
      ...base,
      background: 'rgba(96,165,250,0.12)', color: COLOR_INFO,
    };
  }

  function planDisplay(plan) {
    if (!plan) return '—';
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  }

  const s = {
    ...pageStyles(t, isMobile),
    addButton: {
      background: 'transparent', border: `1px solid ${t.ACCENT_BORDER}`,
      borderRadius: RADIUS_MD, padding: '10px 20px',
      fontSize: '14px', color: t.ACCENT, fontWeight: FW_SEMIBOLD,
      cursor: 'pointer', fontFamily: FONT_BODY,
    },
    filterBar: {
      display: 'flex', gap: SPACE_SM, flexWrap: 'wrap',
      marginBottom: SPACE_LG, alignItems: 'center',
    },
    searchInput: {
      background: t.SURFACE, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD, padding: '8px 12px',
      fontSize: '13px', color: t.TEXT, fontFamily: FONT_BODY,
      outline: 'none', width: isMobile ? '100%' : '220px',
    },
    filterSelect: {
      background: `${t.SURFACE} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23A8C0E8' strokeWidth='1.5' fill='none' strokeLinecap='round'/%3E%3C/svg%3E") no-repeat right 10px center`,
      border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD, padding: '8px 32px 8px 12px',
      fontSize: '13px', color: t.TEXT_MUTED, fontFamily: FONT_BODY,
      outline: 'none', cursor: 'pointer',
      appearance: 'none', WebkitAppearance: 'none',
    },
    tableCard: {
      background: t.SURFACE, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_LG, overflow: 'hidden', boxShadow: SHADOW_MD,
    },
    tableWrapper: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', minWidth: '600px' },
    th: (key) => ({
      padding: '12px 20px', textAlign: 'left',
      fontSize: '10px', fontWeight: FW_SEMIBOLD,
      textTransform: 'uppercase', letterSpacing: '0.1em',
      color: sortKey === key ? t.ACCENT : t.TEXT_MUTED,
      borderBottom: `1px solid ${t.BORDER}`,
      whiteSpace: 'nowrap', cursor: 'pointer',
      fontFamily: FONT_BODY, userSelect: 'none',
      transition: 'color 0.15s',
    }),
    thStatic: {
      padding: '12px 20px', textAlign: 'left',
      fontSize: '10px', fontWeight: FW_SEMIBOLD,
      textTransform: 'uppercase', letterSpacing: '0.1em',
      color: t.TEXT_MUTED, borderBottom: `1px solid ${t.BORDER}`,
      whiteSpace: 'nowrap', fontFamily: FONT_BODY,
    },
    td: {
      padding: '16px 20px', fontSize: '13px',
      color: t.TEXT, fontWeight: FW_LIGHT,
      borderBottom: `1px solid ${t.BORDER}`, fontFamily: FONT_BODY,
    },
    emptyCell: {
      padding: '48px', textAlign: 'center',
      color: t.TEXT_MUTED, fontSize: '13px',
      fontWeight: FW_LIGHT, fontFamily: FONT_BODY,
    },
    mobileCard: {
      background: t.SURFACE, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_LG, padding: '18px 20px',
      marginBottom: '10px', boxShadow: SHADOW_MD, cursor: 'pointer',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    mobileCardName: {
      fontSize: '14px', color: t.TEXT, fontWeight: FW_REGULAR,
      margin: '0 0 6px', fontFamily: FONT_BODY,
    },
    mobileCardMeta: {
      fontSize: '12px', color: t.TEXT_MUTED,
      fontWeight: FW_LIGHT, fontFamily: FONT_BODY,
    },
    formCard: {
      background: t.SURFACE, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_LG, padding: '28px',
      marginBottom: '28px', boxShadow: SHADOW_MD,
    },
    formLabel: {
      fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase',
      letterSpacing: '0.12em', color: t.ACCENT, margin: '0 0 16px',
      fontFamily: FONT_BODY, display: 'block',
    },
    formInput: {
      background: t.SURFACE_ALT, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD, padding: '10px 14px',
      fontSize: '14px', color: t.TEXT, fontFamily: FONT_BODY,
      width: '100%', boxSizing: 'border-box', outline: 'none',
    },
    formSelect: {
      background: t.SURFACE_ALT, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD, padding: '10px 14px',
      fontSize: '14px', color: t.TEXT, fontFamily: FONT_BODY,
      width: '100%', boxSizing: 'border-box', outline: 'none',
      cursor: 'pointer', marginTop: '12px',
    },
    formActions: { display: 'flex', gap: '10px', marginTop: '20px' },
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
    toastStyle: (type) => ({
      position: 'fixed', bottom: '32px', right: '32px',
      background: type === 'success' ? t.ACCENT_MUTED : 'rgba(248,113,113,0.15)',
      border: `1px solid ${type === 'success' ? t.ACCENT_BORDER : COLOR_ERROR}`,
      color: type === 'success' ? t.ACCENT : COLOR_ERROR,
      borderRadius: RADIUS_LG, padding: '14px 20px',
      fontSize: '14px', fontFamily: FONT_BODY, zIndex: 1000,
      backdropFilter: 'blur(8px)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      animation: 'fadeIn 0.2s ease',
    }),
  };

  return (
    <div style={s.pageWrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .orgs-tr:hover { background: ${t.SURFACE_ALT}; }
      `}</style>

      {toast && (
        <div style={s.toastStyle(toast.type)}>
          {toast.type === 'success' ? '✓ ' : '✕ '}{toast.message}
        </div>
      )}

      <div style={s.page}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Orgs</h1>
            <p style={s.subtitle}>
              {isPlatformAdmin ? 'Platform admin · All organisations' : 'Your organisations'}
            </p>
          </div>
          {isPlatformAdmin && (
            <button style={s.addButton} onClick={() => setShowForm(v => !v)}>
              + New Org
            </button>
          )}
        </div>

        {showForm && isPlatformAdmin && (
          <div style={s.formCard}>
            <label style={s.formLabel}>New Organisation</label>
            <input
              style={s.formInput}
              placeholder="Organisation name"
              value={orgName}
              onChange={e => { setOrgName(e.target.value); setFormError(''); }}
            />
            <select
              style={s.formSelect}
              value={selectedPlan}
              onChange={e => setSelectedPlan(e.target.value)}
            >
              {['Starter', 'Pro', 'Pathfinder', 'Free', 'Internal'].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {formError && <p style={s.errorText}>{formError}</p>}
            <div style={s.formActions}>
              <button style={s.saveButton} onClick={handleCreateOrg} disabled={saving}>
                {saving ? 'Creating…' : 'Create Org'}
              </button>
              <button style={s.cancelButton} onClick={() => {
                setShowForm(false);
                setFormError('');
                setOrgName('');
                setSelectedPlan('Starter');
              }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {isPlatformAdmin && (
          <div style={s.filterBar}>
            <input
              style={s.searchInput}
              placeholder="Search organisations…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select style={s.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              {ORG_STATUS_OPTIONS.map(opt => (
                <option key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option>
              ))}
            </select>
            <select style={s.filterSelect} value={planFilter} onChange={e => setPlanFilter(e.target.value)}>
              <option value="">All plans</option>
              {PLAN_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <select style={s.filterSelect} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">All types</option>
              {TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <p style={{ color: t.TEXT_MUTED, fontWeight: FW_LIGHT, fontFamily: FONT_BODY }}>
            Loading…
          </p>
        ) : isMobile ? (
          <div>
            {filtered.length === 0 ? (
              <p style={{ color: t.TEXT_MUTED, fontWeight: FW_LIGHT, fontFamily: FONT_BODY, textAlign: 'center', padding: '40px 0' }}>
                No organisations found.
              </p>
            ) : filtered.map(org => (
              <div
                key={org.org_id}
                style={s.mobileCard}
                onClick={() => navigate(`/hq/orgs/${org.org_id}`)}
              >
                <div>
                  <p style={s.mobileCardName}>{org.name}</p>
                  <p style={s.mobileCardMeta}>
                    {org.member_count ?? 0} members · {formatDate(org.created_at)}
                  </p>
                </div>
                <span style={statusBadgeStyle(org.status)}>
                  {org.status ? org.status.charAt(0).toUpperCase() + org.status.slice(1) : 'Active'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={s.tableCard}>
            <div style={s.tableWrapper}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {COLUMNS.map(col => col.sortable ? (
                      <th key={col.key} style={s.th(col.key)} onClick={() => handleSort(col.key)}>
                        {col.label}
                        <SortTriangle active={sortKey === col.key} dir={sortDir} />
                      </th>
                    ) : (
                      <th key={col.key} style={s.thStatic}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={COLUMNS.length} style={s.emptyCell}>
                        No organisations found.
                      </td>
                    </tr>
                  ) : filtered.map(org => (
                    <tr
                      key={org.org_id}
                      className="orgs-tr"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/hq/orgs/${org.org_id}`)}
                    >
                      <td style={{ ...s.td, fontWeight: FW_REGULAR }}>{org.name}</td>
                      <td style={s.td}>
                        <span style={statusBadgeStyle(org.status)}>
                          {org.status ? org.status.charAt(0).toUpperCase() + org.status.slice(1) : '—'}
                        </span>
                      </td>
                      <td style={{ ...s.td, color: t.TEXT_MUTED }}>{planDisplay(org.plan)}</td>
                      <td style={{ ...s.td, color: t.TEXT_MUTED }}>{org.member_count ?? '—'}</td>
                      <td style={{ ...s.td, color: t.TEXT_MUTED }}>{formatDate(org.created_at)}</td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {org.is_platform_org && <span style={typePillStyle('platform')}>Platform</span>}
                          {org.is_demo         && <span style={typePillStyle('demo')}>Demo</span>}
                          {!org.is_platform_org && !org.is_demo && (
                            <span style={typePillStyle('customer')}>Customer</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}