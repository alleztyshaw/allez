import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useOrg } from '../context/OrgContext';
import MeetingModal from '../components/MeetingModal';
import {
  ASSET_LEVEL_OPTIONS,
  COMMUNICATION_FREQUENCY_OPTIONS,
  COMMUNICATION_FREQUENCY_DAYS,
  CADENCE_AMBER_DAYS,
  CONTACT_METHOD_OPTIONS,
  FONT_BODY,
  FONT_DISPLAY,
  FULL_ACCESS_ROLES,
  PIPELINE_STAGES,
  INVESTMENT_OBJECTIVE_OPTIONS,
  LIQUIDITY_NEEDS_OPTIONS,
  OVERLAY_BG,
  RADIUS_LG,
  RADIUS_MD,
  REFERRAL_SOURCE_OPTIONS,
  RISK_TOLERANCE_OPTIONS,
  SHADOW_MD,
  SHADOW_LG,
  STATUS_TEXT_COLORS,
  STATUS_OPTIONS,
  TAX_BRACKET_OPTIONS,
  TIME_HORIZON_OPTIONS,
  pageStyles,
  MOBILE_BREAKPOINT,
  COLOR_ERROR,
  COLOR_WARNING,
  FW_LIGHT, FW_REGULAR, FW_MEDIUM, FW_SEMIBOLD,
} from '../utils/hqConstants';
import { useTokens } from '../context/ThemeContext';
import useWindowWidth from '../hooks/useWindowWidth';

const emptyForm = {
  first_name: '', last_name: '', email: '', phone: '',
  date_of_birth: '', status: 'Prospect', pipeline_stage: 'Lead', asset_level: '',
  risk_tolerance: '', investment_objective: '', time_horizon: '',
  tax_bracket: '', liquidity_needs: '',
  referral_source: '', client_since: '', next_review_date: '',
  preferred_contact_method: '', communication_frequency: '', notes: '',
};

// ── Cadence helpers ───────────────────────────────────────────────────────────

function getCadenceColor(client, futureMeetingClientIds, t) {
  // Only signal for Active clients with a review date
  if (client.status !== 'Active' || !client.next_review_date) return t.ACCENT;
  // Has a future meeting already scheduled → healthy
  if (futureMeetingClientIds.has(client.id)) return t.ACCENT;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const review = new Date(client.next_review_date + 'T00:00:00');
  const daysUntil = Math.round((review - today) / 86400000);

  if (daysUntil < 0)               return COLOR_ERROR;   // red — past due
  if (daysUntil <= CADENCE_AMBER_DAYS) return COLOR_WARNING; // amber — due soon
  return t.ACCENT; // green — healthy
}

function getCadenceTooltip(client, futureMeetingClientIds) {
  if (client.status !== 'Active' || !client.next_review_date) return null;
  if (futureMeetingClientIds.has(client.id)) return 'Review meeting scheduled';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const review = new Date(client.next_review_date + 'T00:00:00');
  const days = Math.round((review - today) / 86400000);
  if (days < 0)  return `Review overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`;
  if (days === 0) return 'Review due today';
  return `Review due in ${days} day${days === 1 ? '' : 's'}`;
}

function getCadenceInitialForm(client) {
  const freq = client.communication_frequency;
  const days = COMMUNICATION_FREQUENCY_DAYS[freq] ?? 90;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  let suggested = new Date(today);

  if (client.next_review_date) {
    const review = new Date(client.next_review_date + 'T00:00:00');
    suggested = review > today ? review : new Date(today.getTime() + (days || 90) * 86400000);
  } else {
    suggested.setDate(suggested.getDate() + (days || 90));
  }

  const pad = n => String(n).padStart(2, '0');
  const dateStr = `${suggested.getFullYear()}-${pad(suggested.getMonth()+1)}-${pad(suggested.getDate())}`;

  let category = 'Quarterly Check-in';
  if (['Annual', 'Annually'].includes(freq)) category = 'Annual Review';
  else if (freq === 'Monthly') category = 'Quarterly Check-in';

  return { category, meeting_type: 'video', status: 'scheduled', scheduled_date: dateStr, scheduled_time: '12:00', duration_mins: 60, description: '', recurrence: 'none', meeting_link: '' };
}

// Converts any asset level string to a sortable number.
// Handles both en-dash (– ) and hyphen (-) formats, and any spacing variations.
function assetLevelToNum(level) {
  if (!level) return -1;
  const s = level.toLowerCase();
  if (s.startsWith('under')) return 0;
  if (s.includes('10m+') || s === '$10m+') return 10_000_000;
  // Extract the first dollar amount e.g. "$500K", "$1M", "$2M"
  const match = s.match(/\$([\d.]+)(k|m)/);
  if (!match) return -1;
  const num  = parseFloat(match[1]);
  const unit = match[2];
  return unit === 'k' ? num * 1_000 : num * 1_000_000;
}

// ── Sort helper ───────────────────────────────────────────────────────────────

function sortClients(list, sortConfig, advisorMap) {
  const { col, dir } = sortConfig;
  const f = dir === 'asc' ? 1 : -1;
  return [...list].sort((a, b) => {
    let av, bv;
    switch (col) {
      case 'name':
        av = `${a.last_name} ${a.first_name}`.toLowerCase();
        bv = `${b.last_name} ${b.first_name}`.toLowerCase();
        break;
      case 'assets':
        av = assetLevelToNum(a.asset_level);
        bv = assetLevelToNum(b.asset_level);
        return (av - bv) * f;
      case 'risk':
        av = a.risk_tolerance || '';
        bv = b.risk_tolerance || '';
        break;
      case 'status':
        av = a.status || '';
        bv = b.status || '';
        break;
      case 'advisor':
        av = advisorMap[a.id] || '';
        bv = advisorMap[b.id] || '';
        break;
      case 'review':
        if (!a.next_review_date && !b.next_review_date) return 0;
        if (!a.next_review_date) return 1;
        if (!b.next_review_date) return -1;
        av = a.next_review_date;
        bv = b.next_review_date;
        break;
      default: return 0;
    }
    if (av < bv) return -1 * f;
    if (av > bv) return 1 * f;
    return 0;
  });
}

export default function Clients() {
  const t = useTokens();
  const { orgId, userId } = useOrg();
  const windowWidth = useWindowWidth();
  const isCompact = windowWidth < 1050;
  const isMobile  = windowWidth < MOBILE_BREAKPOINT;

  // Data
  const [clients,                setClients]                = useState([]);
  const [futureMeetingClientIds, setFutureMeetingClientIds] = useState(new Set());
  const [loading,                setLoading]                = useState(true);
  const [orgMembers,             setOrgMembers]             = useState([]);
  const [primaryAdvisorMap,      setPrimaryAdvisorMap]      = useState({});
  const [advisorMapLoaded,       setAdvisorMapLoaded]       = useState(false);
  const [userRole,               setUserRole]               = useState(null);

  // Add client modal
  const [showModal,       setShowModal]       = useState(false);
  const [formData,        setFormData]        = useState(emptyForm);
  const [saving,          setSaving]          = useState(false);
  const [error,           setError]           = useState('');
  const [selectedAdvisor, setSelectedAdvisor] = useState('');

  // Cadence meeting modal
  const [cadenceClient, setCadenceClient] = useState(null); // full client object

  // Table controls
  const [search,        setSearch]        = useState('');
  const [sortConfig,    setSortConfig]    = useState({ col: 'name', dir: 'asc' });
  const [filterStatus,  setFilterStatus]  = useState([]);
  const [filterAdvisor, setFilterAdvisor] = useState([]);
  const [filterAssets,  setFilterAssets]  = useState([]);
  const [filterRisk,    setFilterRisk]    = useState([]);
  const [openDropdown,  setOpenDropdown]  = useState(null);
  const headerRef = useRef(null);

  const canSeeAdvisor = FULL_ACCESS_ROLES.includes(userRole);

  // Close column dropdowns on outside click
  useEffect(() => {
    function handler(e) {
      if (headerRef.current && !headerRef.current.contains(e.target)) setOpenDropdown(null);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (orgId) { fetchClients(); fetchOrgMembers(); }
  }, [orgId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchOrgMembers() {
    const { data } = await supabase.rpc('get_org_members', { target_org_id: orgId });
    setOrgMembers(data || []);
    const { data: { user } } = await supabase.auth.getUser();
    const me = (data || []).find(m => m.user_id === user?.id);
    setUserRole(me?.role || null);
  }

  async function fetchPrimaryAdvisors(clientIds) {
    if (!clientIds.length) return;
    const { data } = await supabase.from('client_advisors').select('client_id, user_id').in('client_id', clientIds).eq('is_primary', true);
    if (!data) return;
    const members = await supabase.rpc('get_org_members', { target_org_id: orgId });
    const memberMap = Object.fromEntries((members.data || []).map(m => [m.user_id, m]));
    const map = {};
    data.forEach(row => {
      const m = memberMap[row.user_id];
      map[row.client_id] = m ? `${m.first_name} ${m.last_name}` : null;
    });
    setPrimaryAdvisorMap(map);
    setAdvisorMapLoaded(true);
  }

  async function fetchClients() {
    setLoading(true);
    const [{ data, error: fetchErr }, { data: futureMtgs }] = await Promise.all([
      supabase.from('clients').select('*').eq('org_id', orgId).is('deleted_at', null).order('last_name', { ascending: true }),
      supabase.from('meetings').select('client_id').eq('org_id', orgId).is('deleted_at', null).gte('scheduled_at', new Date().toISOString()),
    ]);
    if (fetchErr) console.error('Error fetching clients:', fetchErr);
    else {
      setClients(data || []);
      setFutureMeetingClientIds(new Set((futureMtgs || []).map(m => m.client_id)));
      await fetchPrimaryAdvisors((data || []).map(c => c.id));
    }
    setLoading(false);
  }

  async function handleAddClient() {
    if (!formData.first_name || !formData.last_name) { setError('First and last name are required.'); return; }
    if (!formData.date_of_birth) { setError('Date of birth is required.'); return; }
    setSaving(true); setError('');

    const { data: existing } = await supabase.from('clients').select('id').eq('org_id', orgId).eq('first_name', formData.first_name.trim()).eq('last_name', formData.last_name.trim()).eq('date_of_birth', formData.date_of_birth).is('deleted_at', null).limit(1);
    if (existing && existing.length > 0) {
      setError(`A client named ${formData.first_name} ${formData.last_name} with that date of birth already exists.`);
      setSaving(false); return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { data: membersNow } = await supabase.rpc('get_org_members', { target_org_id: orgId });
    const meNow    = (membersNow || []).find(m => m.user_id === user?.id);
    const roleNow  = meNow?.role || null;
    const advisorToAssign = selectedAdvisor || (['advisor', 'associate'].includes(roleNow) ? user?.id : null);

    const n = v => v === '' ? null : v;
    const { error: rpcErr } = await supabase.rpc('create_client_with_advisor', {
      p_org_id: orgId, p_first_name: formData.first_name, p_last_name: formData.last_name,
      p_email: n(formData.email), p_phone: n(formData.phone), p_date_of_birth: n(formData.date_of_birth),
      p_status: n(formData.status), p_asset_level: n(formData.asset_level), p_risk_tolerance: n(formData.risk_tolerance),
      p_investment_objective: n(formData.investment_objective), p_time_horizon: n(formData.time_horizon),
      p_tax_bracket: n(formData.tax_bracket), p_liquidity_needs: n(formData.liquidity_needs),
      p_referral_source: n(formData.referral_source), p_client_since: n(formData.client_since),
      p_next_review_date: n(formData.next_review_date), p_preferred_contact_method: n(formData.preferred_contact_method),
      p_communication_frequency: n(formData.communication_frequency), p_notes: n(formData.notes),
      p_advisor_user_id: advisorToAssign || null, p_pipeline_stage: formData.pipeline_stage || 'Lead',
    });

    if (rpcErr) {
      setError('Something went wrong. Please try again.');
      console.error('create_client_with_advisor error:', rpcErr);
    } else {
      setShowModal(false); setFormData(emptyForm); setSelectedAdvisor(''); fetchClients();
    }
    setSaving(false);
  }

  function handleChange(e) { setFormData({ ...formData, [e.target.name]: e.target.value }); }

  function handleSortToggle(col) {
    setSortConfig(prev =>
      prev.col === col
        ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { col, dir: 'asc' }
    );
  }

  function toggleFilterStatus(val)  { setFilterStatus(prev  => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]); }
  function toggleFilterAdvisor(val) { setFilterAdvisor(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]); }
  function toggleFilterAssets(val)  { setFilterAssets(prev  => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]); }
  function toggleFilterRisk(val)    { setFilterRisk(prev    => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]); }

  // Build processed client list
  const todayStr = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();

  let displayClients = clients;
  if (search)              displayClients = displayClients.filter(c => `${c.first_name} ${c.last_name} ${c.email || ''}`.toLowerCase().includes(search.toLowerCase()));
  if (filterStatus.length  > 0) displayClients = displayClients.filter(c => filterStatus.includes(c.status));
  if (filterAdvisor.length > 0) displayClients = displayClients.filter(c => filterAdvisor.includes(primaryAdvisorMap[c.id] || 'Unassigned'));
  if (filterAssets.length  > 0) displayClients = displayClients.filter(c => filterAssets.includes(c.asset_level || '—'));
  if (filterRisk.length    > 0) displayClients = displayClients.filter(c => filterRisk.includes(c.risk_tolerance || '—'));
  displayClients = sortClients(displayClients, sortConfig, primaryAdvisorMap);

  // Derive filter options from actual data so values always match
  const assetOptions   = [...new Set(clients.map(c => c.asset_level).filter(Boolean))].sort((a, b) => assetLevelToNum(a) - assetLevelToNum(b));
  const riskOptions    = [...new Set(clients.map(c => c.risk_tolerance).filter(Boolean))].sort();
  const advisorOptions = advisorMapLoaded
    ? [...new Set(clients.map(c => primaryAdvisorMap[c.id] || 'Unassigned'))].sort()
    : [];

  // Grid template columns
  const cols = isMobile  ? '20px 1fr 80px'
             : isCompact ? '20px 1fr 90px 140px'
             : '20px 1fr 130px 160px 90px 150px 120px';

  const s = {
    ...pageStyles(t, isMobile),
    header: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '16px' : '0', marginBottom: '28px',
    },
    addButton: {
      background: 'transparent', color: t.ACCENT, border: `1px solid ${t.ACCENT_BORDER}`,
      borderRadius: RADIUS_MD, padding: '10px 20px', fontSize: '14px',
      fontWeight: FW_SEMIBOLD, cursor: 'pointer', fontFamily: FONT_BODY,
    },
    searchInput: {
      border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '9px 14px',
      fontSize: '14px', width: isMobile ? '100%' : '280px', outline: 'none',
      color: t.TEXT, background: t.SURFACE_ALT, fontFamily: FONT_BODY,
      boxSizing: 'border-box',
    },
    tableWrap: {
      border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG,
      overflow: 'hidden', boxShadow: SHADOW_MD,
    },
    tableHead: {
      display: 'grid', gridTemplateColumns: cols,
      padding: '10px 20px', background: t.SURFACE_ALT,
      borderBottom: `1px solid ${t.BORDER}`, gap: '8px', alignItems: 'center',
    },
    tableRow: {
      display: 'grid', gridTemplateColumns: cols,
      padding: '14px 20px', borderBottom: `1px solid ${t.BORDER}`,
      background: t.SURFACE, alignItems: 'center', gap: '8px',
    },
    emptyState: { padding: '48px', textAlign: 'center', color: t.TEXT_MUTED, fontSize: '15px', fontWeight: FW_LIGHT },
    emptyLink:  { color: t.ACCENT, cursor: 'pointer', textDecoration: 'underline' },
    // Add client modal
    overlay: { position: 'fixed', inset: 0, background: OVERLAY_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
    modal: { background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, width: '100%', maxWidth: '680px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: SHADOW_LG },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${t.BORDER}` },
    modalTitle: { margin: 0, fontFamily: FONT_DISPLAY, fontSize: '24px', fontWeight: FW_REGULAR, color: t.TEXT, letterSpacing: '0.01em' },
    closeButton: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: t.TEXT_MUTED, padding: '4px 8px' },
    modalBody: { overflowY: 'auto', padding: '24px', flex: 1, background: t.SURFACE },
    sectionLabel: { fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.ACCENT, margin: '20px 0 12px' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
    field: { display: 'flex', flexDirection: 'column', gap: '4px' },
    label: { fontSize: '12px', fontWeight: FW_MEDIUM, color: t.TEXT_MUTED, letterSpacing: '0.02em' },
    input: { border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '8px 12px', fontSize: '14px', outline: 'none', color: t.TEXT, background: t.SURFACE_ALT, fontFamily: FONT_BODY },
    textarea: { width: '100%', border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '10px 12px', fontSize: '14px', minHeight: '80px', resize: 'vertical', outline: 'none', color: t.TEXT, background: t.SURFACE_ALT, fontFamily: FONT_BODY, boxSizing: 'border-box' },
    errorText: { color: COLOR_ERROR, fontSize: '13px', marginTop: '12px' },
    modalFooter: { padding: '16px 24px', borderTop: `1px solid ${t.BORDER}`, display: 'flex', justifyContent: 'flex-end', gap: '10px', background: t.SURFACE },
    cancelButton: { padding: '9px 20px', borderRadius: RADIUS_MD, border: `1px solid ${t.BORDER}`, background: 'transparent', fontSize: '14px', cursor: 'pointer', color: t.TEXT_MUTED, fontFamily: FONT_BODY },
    saveButton:   { padding: '9px 20px', borderRadius: RADIUS_MD, border: `1px solid ${t.ACCENT_BORDER}`, background: t.ACCENT_MUTED, color: t.ACCENT, fontSize: '14px', fontWeight: FW_SEMIBOLD, cursor: 'pointer', fontFamily: FONT_BODY },
  };

  return (
    <div style={s.pageWrapper}>
      <div style={s.page}>

        <div style={s.header}>
          <div>
            <h1 style={s.title}>Clients</h1>
            <p style={s.subtitle}>{clients.length} total · {clients.filter(c => c.status === 'Active').length} active</p>
          </div>
          <button style={s.addButton} onClick={() => setShowModal(true)}>+ New Client</button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '16px' }}>
          <input
            style={s.searchInput}
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div style={s.emptyState}>Loading clients...</div>
        ) : clients.length === 0 ? (
          <div style={s.emptyState}>No clients found. <span style={s.emptyLink} onClick={() => setShowModal(true)}>Add your first client →</span></div>
        ) : (
          <div style={s.tableWrap}>
            {/* Column headers — always visible */}
            <div style={s.tableHead} ref={headerRef}>
              {/* Dot column — no header */}
              <div />

              {/* Name */}
              <ColumnHeader col="name" label="Name" sortConfig={sortConfig} onSortToggle={handleSortToggle}
                openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} t={t} />

              {!isMobile && !isCompact && (
                <ColumnHeader col="assets" label="Assets" sortConfig={sortConfig} onSortToggle={handleSortToggle}
                  filterType="checkbox" filterOptions={assetOptions} filterValues={filterAssets} onToggleFilter={toggleFilterAssets}
                  openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} t={t} />
              )}
              {!isMobile && !isCompact && (
                <ColumnHeader col="risk" label="Risk" sortConfig={sortConfig} onSortToggle={handleSortToggle}
                  filterType="checkbox" filterOptions={riskOptions} filterValues={filterRisk} onToggleFilter={toggleFilterRisk}
                  openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} t={t} />
              )}

              <ColumnHeader col="status" label="Status" sortConfig={sortConfig} onSortToggle={handleSortToggle}
                filterType="checkbox" filterOptions={['Active', 'Prospect', 'Inactive']} filterValues={filterStatus} onToggleFilter={toggleFilterStatus}
                openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} t={t} />

              {!isMobile && canSeeAdvisor && (
                <ColumnHeader col="advisor" label="Advisor" sortConfig={sortConfig} onSortToggle={handleSortToggle}
                  filterType="checkbox" filterOptions={advisorOptions} filterValues={filterAdvisor} onToggleFilter={toggleFilterAdvisor}
                  openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} t={t} />
              )}

              {!isMobile && !isCompact && (
                <ColumnHeader col="review" label="Next Review" sortConfig={sortConfig} onSortToggle={handleSortToggle}
                  openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} t={t} />
              )}
            </div>

            {/* Rows — or inline empty message */}
            {displayClients.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: t.TEXT_MUTED, fontSize: '14px', fontWeight: FW_LIGHT, fontFamily: FONT_BODY }}>
                No clients match your current filters.
              </div>
            ) : (
              displayClients.map((client, i) => {
              const cadenceColor   = getCadenceColor(client, futureMeetingClientIds, t);
              const cadenceTooltip = getCadenceTooltip(client, futureMeetingClientIds);
              const isLast         = i === displayClients.length - 1;
              const statusColor    = STATUS_TEXT_COLORS[client.status] || t.TEXT_MUTED;

              return (
                <div
                  key={client.id}
                  className="client-row"
                  style={{ ...s.tableRow, borderBottom: isLast ? 'none' : `1px solid ${t.BORDER}` }}
                >
                  {/* Cadence dot */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <button
                      title={cadenceTooltip || 'Schedule meeting'}
                      onClick={() => setCadenceClient(client)}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    >
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cadenceColor, display: 'block', flexShrink: 0 }} />
                    </button>
                  </div>

                  {/* Name */}
                  <div style={{ minWidth: 0 }}>
                    <Link
                      to={`/hq/clients/${client.id}`}
                      state={{ from: '/hq/clients' }}
                      className="client-name-link"
                      style={{ textDecoration: 'none' }}
                    >
                      <span style={{ fontFamily: FONT_DISPLAY, fontSize: '16px', fontWeight: FW_REGULAR, color: t.TEXT, letterSpacing: '0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                        {client.first_name} {client.last_name}
                      </span>
                    </Link>
                  </div>

                  {/* Assets */}
                  {!isMobile && !isCompact && (
                    <span style={{ fontSize: '13px', color: t.TEXT_MUTED, fontWeight: FW_LIGHT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {client.asset_level || '—'}
                    </span>
                  )}

                  {/* Risk */}
                  {!isMobile && !isCompact && (
                    <span style={{ fontSize: '13px', color: t.TEXT_MUTED, fontWeight: FW_LIGHT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {client.risk_tolerance || '—'}
                    </span>
                  )}

                  {/* Status — colored text */}
                  <span style={{ fontSize: '13px', fontWeight: FW_MEDIUM, color: statusColor, whiteSpace: 'nowrap' }}>
                    {client.status || '—'}
                  </span>

                  {/* Advisor — plain text */}
                  {!isMobile && canSeeAdvisor && (
                    <span style={{ fontSize: '13px', color: advisorMapLoaded ? (primaryAdvisorMap[client.id] ? t.TEXT : t.TEXT_SUBTLE) : t.TEXT_SUBTLE, fontWeight: FW_LIGHT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontStyle: advisorMapLoaded && !primaryAdvisorMap[client.id] ? 'italic' : 'normal' }}>
                      {advisorMapLoaded ? (primaryAdvisorMap[client.id] || 'Unassigned') : '—'}
                    </span>
                  )}

                  {/* Next Review — only show future dates */}
                  {!isMobile && !isCompact && (
                    <span style={{ fontSize: '13px', color: t.TEXT_MUTED, fontWeight: FW_LIGHT, whiteSpace: 'nowrap' }}>
                      {client.next_review_date && client.next_review_date >= todayStr
                        ? new Date(client.next_review_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </span>
                  )}
                </div>
              );
            })
            )}
          </div>
        )}

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
          .client-row:hover { background: ${t.SURFACE_ALT} !important; }
          .client-name-link:hover span { color: ${t.ACCENT} !important; }
          .client-name-link span { transition: color 0.15s; }
        `}</style>

        {/* ── Cadence Meeting Modal ──────────────────────────────────────── */}
        <MeetingModal
          isOpen={!!cadenceClient}
          onClose={() => setCadenceClient(null)}
          onSaved={() => { fetchClients(); setCadenceClient(null); }}
          editingMeeting={null}
          orgId={orgId}
          userId={userId}
          clientId={cadenceClient?.id}
          initialForm={cadenceClient ? getCadenceInitialForm(cadenceClient) : null}
          isMobile={isMobile}
        />

        {/* ── Add Client Modal ───────────────────────────────────────────── */}
        {showModal && (
          <div style={s.overlay}>
            <div style={s.modal}>
              <div style={s.modalHeader}>
                <h2 style={s.modalTitle}>New Client</h2>
                <button style={s.closeButton} onClick={() => { setShowModal(false); setFormData(emptyForm); setError(''); }}>✕</button>
              </div>
              <div style={s.modalBody}>
                <p style={s.sectionLabel}>Core Identity</p>
                <div style={s.formGrid}>
                  <FormField label="First Name *"    name="first_name"    value={formData.first_name}    onChange={handleChange} s={s} />
                  <FormField label="Last Name *"     name="last_name"     value={formData.last_name}     onChange={handleChange} s={s} />
                  <FormField label="Email"           name="email"         type="email" value={formData.email} onChange={handleChange} s={s} />
                  <FormField label="Phone"           name="phone"         value={formData.phone}         onChange={handleChange} s={s} />
                  <FormField label="Date of Birth *" name="date_of_birth" type="date"  value={formData.date_of_birth} onChange={handleChange} s={s} />
                  <SelectField label="Status" name="status" value={formData.status} onChange={handleChange} options={STATUS_OPTIONS} s={s} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.TEXT_MUTED }}>Pipeline Stage</label>
                    <select name="pipeline_stage" value={formData.pipeline_stage} onChange={handleChange} style={s.input}>
                      {PIPELINE_STAGES.filter(st => st.key !== 'Active').map(st => <option key={st.key} value={st.key}>{st.label}</option>)}
                    </select>
                  </div>
                </div>
                <p style={s.sectionLabel}>Financial Profile</p>
                <div style={s.formGrid}>
                  <SelectField label="Asset Level"          name="asset_level"          value={formData.asset_level}          onChange={handleChange} options={ASSET_LEVEL_OPTIONS}          s={s} />
                  <SelectField label="Risk Tolerance"       name="risk_tolerance"        value={formData.risk_tolerance}        onChange={handleChange} options={RISK_TOLERANCE_OPTIONS}       s={s} />
                  <SelectField label="Investment Objective" name="investment_objective"  value={formData.investment_objective}  onChange={handleChange} options={INVESTMENT_OBJECTIVE_OPTIONS} s={s} />
                  <SelectField label="Time Horizon"         name="time_horizon"          value={formData.time_horizon}          onChange={handleChange} options={TIME_HORIZON_OPTIONS}         s={s} />
                  <SelectField label="Tax Bracket"          name="tax_bracket"           value={formData.tax_bracket}           onChange={handleChange} options={TAX_BRACKET_OPTIONS}          s={s} />
                  <SelectField label="Liquidity Needs"      name="liquidity_needs"       value={formData.liquidity_needs}       onChange={handleChange} options={LIQUIDITY_NEEDS_OPTIONS}      s={s} />
                </div>
                <p style={s.sectionLabel}>Relationship Management</p>
                <div style={s.formGrid}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.TEXT_MUTED }}>Advisor</label>
                    <select value={selectedAdvisor} onChange={e => setSelectedAdvisor(e.target.value)} style={s.input}>
                      <option value=''>— Select advisor —</option>
                      {orgMembers.filter(m => m.first_name && m.last_name).map(m => <option key={m.user_id} value={m.user_id}>{m.first_name} {m.last_name}</option>)}
                    </select>
                  </div>
                  <SelectField label="Referral Source"         name="referral_source"          value={formData.referral_source}          onChange={handleChange} options={REFERRAL_SOURCE_OPTIONS}         s={s} />
                  <FormField   label="Client Since"            name="client_since"             type="date" value={formData.client_since}     onChange={handleChange} s={s} />
                  <FormField   label="Next Review Date"        name="next_review_date"         type="date" value={formData.next_review_date} onChange={handleChange} s={s} />
                  <SelectField label="Preferred Contact"       name="preferred_contact_method" value={formData.preferred_contact_method} onChange={handleChange} options={CONTACT_METHOD_OPTIONS}           s={s} />
                  <SelectField label="Communication Frequency" name="communication_frequency"  value={formData.communication_frequency}  onChange={handleChange} options={COMMUNICATION_FREQUENCY_OPTIONS}  s={s} />
                </div>
                <p style={s.sectionLabel}>Notes</p>
                <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Any additional context about this client..." style={s.textarea} />
                {error && <p style={s.errorText}>{error}</p>}
              </div>
              <p style={{ fontSize: '11px', color: t.TEXT_MUTED, fontWeight: FW_LIGHT, margin: '8px 0 0', padding: '0 24px' }}>* Required field</p>
              <div style={s.modalFooter}>
                <button style={s.cancelButton} onClick={() => { setShowModal(false); setFormData(emptyForm); setError(''); }}>Cancel</button>
                <button style={s.saveButton} onClick={handleAddClient} disabled={saving}>{saving ? 'Saving...' : 'Save Client'}</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Column header with toggle sort + triangle filter ──────────────────────────

function ColumnHeader({
  col, label, sortConfig, onSortToggle,
  filterType, filterValue, onFilterChange,
  filterOptions, filterValues, onToggleFilter,
  openDropdown, setOpenDropdown, t,
}) {
  const isActive   = sortConfig.col === col;
  const isOpen     = openDropdown === col;
  const hasFilter  = filterType === 'text' || (filterType === 'checkbox' && filterOptions?.length > 0);
  const isFiltered = filterType === 'text' ? !!filterValue : filterValues?.length > 0;
  const btnRef     = useRef(null);
  const [dropPos,  setDropPos] = useState({ top: 0, left: 0 });

  function handleFilterClick() {
    if (!isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropPos({ top: rect.bottom + 6, left: rect.left });
    }
    setOpenDropdown(isOpen ? null : col);
  }

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}>

      {/* Label */}
      <span style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.1em', color: isActive ? t.ACCENT : t.TEXT_MUTED, fontFamily: FONT_BODY }}>
        {label}
      </span>

      {/* Filter triangle */}
      {hasFilter && (
        <>
          <button
            ref={btnRef}
            onClick={handleFilterClick}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', lineHeight: 1 }}
            title={`Filter by ${label}`}
          >
            <span style={{
              display:      'inline-block',
              width:        0, height: 0,
              borderTop:    '4px solid transparent',
              borderBottom: '4px solid transparent',
              borderRight:  `6px solid ${isFiltered ? t.ACCENT : t.TEXT_SUBTLE}`,
              transform:    isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              transition:   'transform 0.15s ease',
              flexShrink:   0,
            }} />
          </button>

          {/* Fixed-position dropdown — escapes overflow:hidden on table wrapper */}
          {isOpen && (
            <div style={{
              position:     'fixed',
              top:          dropPos.top,
              left:         dropPos.left,
              background:   t.SURFACE,
              border:       `1px solid ${t.BORDER}`,
              borderRadius: RADIUS_MD,
              zIndex:       1000,
              boxShadow:    SHADOW_LG,
              minWidth:     '180px',
              padding:      '8px',
            }}>
              {filterType === 'text' && (
                <input
                  autoFocus
                  placeholder={`Filter ${label.toLowerCase()}…`}
                  value={filterValue}
                  onChange={e => onFilterChange(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '6px 10px', fontSize: '13px', color: t.TEXT, background: t.SURFACE_ALT, fontFamily: FONT_BODY, outline: 'none' }}
                />
              )}
              {filterType === 'checkbox' && filterOptions.map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 4px', cursor: 'pointer', fontSize: '13px', color: t.TEXT, fontFamily: FONT_BODY }}>
                  <input type="checkbox" checked={filterValues.includes(opt)} onChange={() => onToggleFilter(opt)} style={{ cursor: 'pointer', accentColor: t.ACCENT }} />
                  {opt}
                </label>
              ))}
            </div>
          )}
        </>
      )}

      {/* Sort arrow */}
      <button
        onClick={() => onSortToggle(col)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', lineHeight: 1 }}
      >
        <span style={{ fontSize: '12px', color: isActive ? t.ACCENT : t.TEXT_SUBTLE, fontWeight: FW_SEMIBOLD }}>
          {isActive ? (sortConfig.dir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      </button>

    </div>
  );
}

// ── Form helper components ────────────────────────────────────────────────────

function FormField({ label, name, value, onChange, type = 'text', s }) {
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} style={s.input} />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, s }) {
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      <select name={name} value={value} onChange={onChange} style={s.input}>
        <option value="">— Select —</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}