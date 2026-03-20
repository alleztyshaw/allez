import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useOrg } from '../context/OrgContext';
import {
  ASSET_LEVEL_OPTIONS,
  COMMUNICATION_FREQUENCY_OPTIONS,
  CONTACT_METHOD_OPTIONS,
  FONT_BODY,
  FONT_DISPLAY,
  FULL_ACCESS_ROLES,
  PIPELINE_STAGES,
  INVESTMENT_OBJECTIVE_OPTIONS,
  LIQUIDITY_NEEDS_OPTIONS,
  RADIUS_LG,
  RADIUS_MD,
  RADIUS_PILL,
  REFERRAL_SOURCE_OPTIONS,
  RISK_TOLERANCE_OPTIONS,
  STATUS_COLORS,
  STATUS_OPTIONS,
  TAX_BRACKET_OPTIONS,
  TIME_HORIZON_OPTIONS,
  pageStyles,
  MOBILE_BREAKPOINT,
  FW_LIGHT, FW_REGULAR, FW_MEDIUM, FW_SEMIBOLD} from '../utils/hqConstants';
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

export default function Clients() {
  const t = useTokens();
  const { orgId } = useOrg();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [orgMembers, setOrgMembers] = useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [primaryAdvisorMap, setPrimaryAdvisorMap] = useState({});
  const [advisorMapLoaded, setAdvisorMapLoaded] = useState(false);
  const windowWidth = useWindowWidth();
  const isCompact = windowWidth < 1050;
  const isMobile = windowWidth < MOBILE_BREAKPOINT;
  const canSeeAdvisorPill = FULL_ACCESS_ROLES.includes(userRole);

  useEffect(() => {
    if (orgId) { fetchClients(); fetchOrgMembers(); }
  }, [orgId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchOrgMembers() {
    const { data } = await supabase.rpc('get_org_members', { target_org_id: orgId });
    setOrgMembers(data || []);
    // Determine current user's role
    const { data: { user } } = await supabase.auth.getUser();
    const me = (data || []).find(m => m.user_id === user?.id);
    setUserRole(me?.role || null);
  }

  async function fetchPrimaryAdvisors(clientIds) {
    if (!clientIds.length) return;
    const { data } = await supabase
      .from('client_advisors')
      .select('client_id, user_id')
      .in('client_id', clientIds)
      .eq('is_primary', true);
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
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('last_name', { ascending: true });
    if (error) console.error('Error fetching clients:', error);
    else {
      setClients(data || []);
      await fetchPrimaryAdvisors((data || []).map(c => c.id));
    }
    setLoading(false);
  }

  async function handleAddClient() {
    if (!formData.first_name || !formData.last_name) {
      setError('First and last name are required.');
      return;
    }
    if (!formData.date_of_birth) {
      setError('Date of birth is required.');
      return;
    }
    setSaving(true);
    setError('');

    // Duplicate check — same name + DOB in this org
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('org_id', orgId)
      .eq('first_name', formData.first_name.trim())
      .eq('last_name', formData.last_name.trim())
      .eq('date_of_birth', formData.date_of_birth)
      .is('deleted_at', null)
      .limit(1);
    if (existing && existing.length > 0) {
      setError(`A client named ${formData.first_name} ${formData.last_name} with that date of birth already exists.`);
      setSaving(false);
      return;
    }

    // Determine advisor to assign.
    // Fetch role fresh here rather than relying on userRole state, which may
    // still be null if fetchOrgMembers hasn't resolved yet.
    const { data: { user } } = await supabase.auth.getUser();
    const { data: membersNow } = await supabase.rpc('get_org_members', { target_org_id: orgId });
    const meNow = (membersNow || []).find(m => m.user_id === user?.id);
    const roleNow = meNow?.role || null;
    const advisorToAssign = selectedAdvisor
      || (['advisor', 'associate'].includes(roleNow) ? user?.id : null);

    // Use atomic RPC to insert client + assign advisor in one operation.
    // This avoids the RLS race condition where .select() after insert fails
    // because the advisor isn't in client_advisors yet.
    const n = (v) => v === '' ? null : v;
    const { error } = await supabase.rpc('create_client_with_advisor', {
      p_org_id:                    orgId,
      p_first_name:                formData.first_name,
      p_last_name:                 formData.last_name,
      p_email:                     n(formData.email),
      p_phone:                     n(formData.phone),
      p_date_of_birth:             n(formData.date_of_birth),
      p_status:                    n(formData.status),
      p_asset_level:               n(formData.asset_level),
      p_risk_tolerance:            n(formData.risk_tolerance),
      p_investment_objective:      n(formData.investment_objective),
      p_time_horizon:              n(formData.time_horizon),
      p_tax_bracket:               n(formData.tax_bracket),
      p_liquidity_needs:           n(formData.liquidity_needs),
      p_referral_source:           n(formData.referral_source),
      p_client_since:              n(formData.client_since),
      p_next_review_date:          n(formData.next_review_date),
      p_preferred_contact_method:  n(formData.preferred_contact_method),
      p_communication_frequency:   n(formData.communication_frequency),
      p_notes:                     n(formData.notes),
      p_advisor_user_id:           advisorToAssign || null,
      p_pipeline_stage:            formData.pipeline_stage || 'Lead',
    });

    if (error) {
      setError('Something went wrong. Please try again.');
      console.error('create_client_with_advisor error:', error);
    } else {
      setShowModal(false);
      setFormData(emptyForm);
      setSelectedAdvisor('');
      fetchClients();
    }
    setSaving(false);
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const filteredClients = clients.filter((c) => {
    const matchesSearch = `${c.first_name} ${c.last_name} ${c.email}`
      .toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'all' || c.status?.toLowerCase() === activeTab;
    return matchesSearch && matchesTab;
  });

  const tabs = ['all', 'active', 'prospect', 'inactive'];

  const s = {
    ...pageStyles(t, isMobile),
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '16px' : '0',
      marginBottom: '28px',
    },
    addButton: {
      background: 'transparent',
      color: t.ACCENT,
      border: `1px solid ${t.ACCENT_BORDER}`,
      borderRadius: RADIUS_MD,
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: FW_SEMIBOLD,
      cursor: 'pointer',
      fontFamily: FONT_BODY,
      transition: 'background 0.15s',
    },
    filterRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      gap: '16px',
      flexWrap: 'wrap',
    },
    searchInput: {
      border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD,
      padding: '9px 14px',
      fontSize: '14px',
      width: '280px',
      outline: 'none',
      color: t.TEXT,
      background: t.SURFACE_ALT,
      fontFamily: FONT_BODY,
    },
    tabs: {
      display: 'flex',
      gap: '6px',
    },
    tab: {
      padding: '7px 16px',
      borderRadius: RADIUS_PILL,
      border: `1px solid ${t.BORDER}`,
      background: 'transparent',
      fontSize: '13px',
      cursor: 'pointer',
      color: t.TEXT_MUTED,
      fontWeight: FW_MEDIUM,
      fontFamily: FONT_BODY,
    },
    tabActive: {
      background: t.ACCENT_MUTED,
      color: t.ACCENT,
      border: `1px solid ${t.ACCENT_BORDER}`,
    },
    cardGrid: {
      display: 'flex',
      flexDirection: 'column',
      border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_LG,
      overflow: 'hidden',
      background: t.SURFACE,
    },
    card: {
      padding: '16px 24px',
      cursor: 'pointer',
      transition: 'background 0.15s ease',
      position: 'relative',
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '12px' : '24px',
      borderBottom: `1px solid ${t.BORDER}`,
    },
    cardTop: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      width: isMobile ? '100%' : '260px',
      flexShrink: 0,
      paddingRight: isMobile ? '80px' : 0,
    },
    avatarLink: { textDecoration: 'none', flexShrink: 0 },
    nameLink: { textDecoration: 'none' },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: t.ACCENT_MUTED,
      border: `1px solid ${t.ACCENT_BORDER}`,
      color: t.ACCENT,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '13px',
      fontWeight: FW_SEMIBOLD,
      letterSpacing: '0.03em',
      flexShrink: 0,
      fontFamily: FONT_DISPLAY,
    },
    cardName: {
      fontFamily: FONT_DISPLAY,
      fontSize: '18px',
      fontWeight: FW_REGULAR,
      color: t.TEXT,
      margin: '0 0 2px',
      letterSpacing: '0.01em',
    },
    cardEmail: {
      fontSize: '12px',
      color: t.TEXT_MUTED,
      margin: 0,
      fontWeight: FW_LIGHT,
    },
    cardDivider: { display: 'none' },
    cardStats: {
      display: 'flex',
      gap: isMobile ? '16px' : '32px',
      flex: 1,
      flexWrap: 'wrap',
    },
    stat: {
      display: 'flex',
      flexDirection: 'column',
      gap: '3px',
      width: isMobile ? 'calc(50% - 8px)' : '140px',
      flexShrink: 0,
    },
    statLabel: {
      fontSize: '10px',
      fontWeight: FW_SEMIBOLD,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: t.TEXT_MUTED,
    },
    statValue: {
      fontSize: '13px',
      color: t.TEXT,
      fontWeight: FW_REGULAR,
    },
    badge: {
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: RADIUS_PILL,
      fontSize: '11px',
      fontWeight: FW_SEMIBOLD,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
    },
    emptyState: {
      padding: '48px',
      textAlign: 'center',
      color: t.TEXT_MUTED,
      fontSize: '15px',
      fontWeight: FW_LIGHT,
    },
    emptyLink: {
      color: t.ACCENT,
      cursor: 'pointer',
      textDecoration: 'underline',
    },

    // Modal
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    },
    modal: {
      background: t.SURFACE,
      border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_LG,
      width: '100%',
      maxWidth: '680px',
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 24px',
      borderBottom: `1px solid ${t.BORDER}`,
    },
    modalTitle: {
      margin: 0,
      fontFamily: FONT_DISPLAY,
      fontSize: '24px',
      fontWeight: FW_REGULAR,
      color: t.TEXT,
      letterSpacing: '0.01em',
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '18px',
      cursor: 'pointer',
      color: t.TEXT_MUTED,
      padding: '4px 8px',
    },
    modalBody: {
      overflowY: 'auto',
      padding: '24px',
      flex: 1,
      background: t.SURFACE,
    },
    sectionLabel: {
      fontSize: '10px',
      fontWeight: FW_SEMIBOLD,
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      color: t.ACCENT,
      margin: '20px 0 12px',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
    },
    field: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    label: {
      fontSize: '12px',
      fontWeight: FW_MEDIUM,
      color: t.TEXT_MUTED,
      letterSpacing: '0.02em',
    },
    input: {
      border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD,
      padding: '8px 12px',
      fontSize: '14px',
      outline: 'none',
      color: t.TEXT,
      background: t.SURFACE_ALT,
      fontFamily: FONT_BODY,
    },
    textarea: {
      width: '100%',
      border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD,
      padding: '10px 12px',
      fontSize: '14px',
      minHeight: '80px',
      resize: 'vertical',
      outline: 'none',
      color: t.TEXT,
      background: t.SURFACE_ALT,
      fontFamily: FONT_BODY,
      boxSizing: 'border-box',
    },
    errorText: {
      color: '#f87171',
      fontSize: '13px',
      marginTop: '12px',
    },
    modalFooter: {
      padding: '16px 24px',
      borderTop: `1px solid ${t.BORDER}`,
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px',
      background: t.SURFACE,
    },
    cancelButton: {
      padding: '9px 20px',
      borderRadius: RADIUS_MD,
      border: `1px solid ${t.BORDER}`,
      background: 'transparent',
      fontSize: '14px',
      cursor: 'pointer',
      color: t.TEXT_MUTED,
      fontFamily: FONT_BODY,
    },
    saveButton: {
      padding: '9px 20px',
      borderRadius: RADIUS_MD,
      border: `1px solid ${t.ACCENT_BORDER}`,
      background: t.ACCENT_MUTED,
      color: t.ACCENT,
      fontSize: '14px',
      fontWeight: FW_SEMIBOLD,
      cursor: 'pointer',
      fontFamily: FONT_BODY,
    },
  };

  return (
    <div style={s.pageWrapper}>
      <div style={s.page}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Clients</h1>
            <p style={s.subtitle}>
              {clients.length} total · {clients.filter(c => c.status === 'Active').length} active
            </p>
          </div>
          <button style={s.addButton} onClick={() => setShowModal(true)}>
            + New Client
          </button>
        </div>

        {/* Filters */}
        <div style={s.filterRow}>
          <input
            style={s.searchInput}
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={s.tabs}>
            {tabs.map((tab) => (
              <button
                key={tab}
                style={{ ...s.tab, ...(activeTab === tab ? s.tabActive : {}) }}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div style={s.emptyState}>Loading clients...</div>
        ) : filteredClients.length === 0 ? (
          <div style={s.emptyState}>
            No clients found.{' '}
            <span style={s.emptyLink} onClick={() => setShowModal(true)}>
              Add your first client →
            </span>
          </div>
        ) : (
          <div style={s.cardGrid}>
            {filteredClients.map((client, i) => (
              <div
                key={client.id}
                className="client-card"
                style={{ ...s.card, animationDelay: `${i * 60}ms` }}
              >
                {/* Name */}
                <div style={s.cardTop}>
                  <div>
                    <Link
                      to={`/hq/clients/${client.id}`}
                      state={{ from: '/hq/clients' }}
                      style={s.nameLink}
                      className="client-name-link"
                    >
                      <h3 style={s.cardName}>
                        {client.first_name} {client.last_name}
                      </h3>
                    </Link>
                    {client.email && <p style={s.cardEmail}>{client.email}</p>}
                  </div>
                </div>

                {/* Stats — hidden on narrow windows */}
                {!isCompact && (
                  <>
                    <div style={s.cardDivider} />
                    <div style={s.cardStats}>
                      <div style={s.stat}>
                        <span style={s.statLabel}>Assets</span>
                        <span style={s.statValue}>{client.asset_level || '—'}</span>
                      </div>
                      <div style={s.stat}>
                        <span style={s.statLabel}>Risk</span>
                        <span style={s.statValue}>{client.risk_tolerance || '—'}</span>
                      </div>
                      <div style={s.stat}>
                        <span style={s.statLabel}>Next Review</span>
                        <span style={s.statValue}>
                          {client.next_review_date
                            ? new Date(client.next_review_date).toLocaleDateString()
                            : '—'}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* Status + advisor pill — absolutely positioned right-center so it
                    never gets pushed around by the column flow on mobile */}
                <div style={{
                  position: isMobile ? 'absolute' : 'relative',
                  right: isMobile ? '16px' : 'auto',
                  top: isMobile ? '50%' : 'auto',
                  transform: isMobile ? 'translateY(-50%)' : 'none',
                  marginLeft: isMobile ? 0 : 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '6px',
                  justifyContent: 'center',
                }}>
                  {canSeeAdvisorPill && advisorMapLoaded && (
                    primaryAdvisorMap[client.id] ? (
                      <span style={{ ...s.badge, backgroundColor: 'rgba(102,126,234,0.12)', color: '#667eea', border: '1px solid rgba(102,126,234,0.3)' }}>
                        {primaryAdvisorMap[client.id]}
                      </span>
                    ) : (
                      <span style={{ ...s.badge, backgroundColor: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
                        Unassigned
                      </span>
                    )
                  )}
                  {client.status && (
                    <span style={{ ...s.badge, backgroundColor: STATUS_COLORS[client.status]?.bg || t.ACCENT_MUTED, color: STATUS_COLORS[client.status]?.color || t.ACCENT }}>
                      {client.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(18px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .client-card { animation: fadeUp 0.45s ease both; }
          .client-card:hover { background: ${t.SURFACE_ALT} !important; }
          .client-card:last-child { border-bottom: none !important; }
          .client-avatar { transition: background 0.2s, box-shadow 0.2s, transform 0.2s; }
          .client-avatar-link:hover .client-avatar {
            background: ${t.ACCENT_MUTED} !important;
            box-shadow: 0 0 0 2px ${t.ACCENT_BORDER};
            transform: scale(1.06);
          }
          .client-name-link { text-decoration: none; }
          .client-name-link:hover h3 { color: ${t.ACCENT} !important; }
          .client-name-link h3 { transition: color 0.2s; }
        `}</style>

        {/* Add Client Modal */}
        {showModal && (
          <div style={s.overlay}>
            <div style={s.modal}>
              <div style={s.modalHeader}>
                <h2 style={s.modalTitle}>New Client</h2>
                <button
                  style={s.closeButton}
                  onClick={() => { setShowModal(false); setFormData(emptyForm); setError(''); }}
                >
                  ✕
                </button>
              </div>

              <div style={s.modalBody}>
                <p style={s.sectionLabel}>Core Identity</p>
                <div style={s.formGrid}>
                  <FormField label="First Name *" name="first_name" value={formData.first_name} onChange={handleChange} s={s} />
                  <FormField label="Last Name *"  name="last_name"  value={formData.last_name}  onChange={handleChange} s={s} />
                  <FormField label="Email"         name="email"      type="email" value={formData.email} onChange={handleChange} s={s} />
                  <FormField label="Phone"         name="phone"      value={formData.phone}      onChange={handleChange} s={s} />
                  <FormField label="Date of Birth *" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} s={s} />
                  <SelectField label="Status" name="status" value={formData.status} onChange={handleChange} options={STATUS_OPTIONS} s={s} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.TEXT_MUTED }}>Pipeline Stage</label>
                    <select name="pipeline_stage" value={formData.pipeline_stage} onChange={handleChange} style={s.input}>
                      {PIPELINE_STAGES.filter(st => st.key !== 'Active').map(st => (
                        <option key={st.key} value={st.key}>{st.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <p style={s.sectionLabel}>Financial Profile</p>
                <div style={s.formGrid}>
                  <SelectField label="Asset Level"           name="asset_level"           value={formData.asset_level}           onChange={handleChange} options={ASSET_LEVEL_OPTIONS} s={s} />
                  <SelectField label="Risk Tolerance"        name="risk_tolerance"         value={formData.risk_tolerance}         onChange={handleChange} options={RISK_TOLERANCE_OPTIONS} s={s} />
                  <SelectField label="Investment Objective"  name="investment_objective"   value={formData.investment_objective}   onChange={handleChange} options={INVESTMENT_OBJECTIVE_OPTIONS} s={s} />
                  <SelectField label="Time Horizon"          name="time_horizon"           value={formData.time_horizon}           onChange={handleChange} options={TIME_HORIZON_OPTIONS} s={s} />
                  <SelectField label="Tax Bracket"           name="tax_bracket"            value={formData.tax_bracket}            onChange={handleChange} options={TAX_BRACKET_OPTIONS} s={s} />
                  <SelectField label="Liquidity Needs"       name="liquidity_needs"        value={formData.liquidity_needs}        onChange={handleChange} options={LIQUIDITY_NEEDS_OPTIONS} s={s} />
                </div>

                <p style={s.sectionLabel}>Relationship Management</p>
                <div style={s.formGrid}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.TEXT_MUTED }}>Advisor</label>
                    <select
                      value={selectedAdvisor}
                      onChange={e => setSelectedAdvisor(e.target.value)}
                      style={s.input}
                    >
                      <option value=''>— Select advisor —</option>
                      {orgMembers.filter(m => m.first_name && m.last_name).map(m => (
                        <option key={m.user_id} value={m.user_id}>
                          {m.first_name} {m.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <SelectField label="Referral Source"       name="referral_source"        value={formData.referral_source}        onChange={handleChange} options={REFERRAL_SOURCE_OPTIONS} s={s} />
                  <FormField label="Client Since"            name="client_since"           type="date" value={formData.client_since} onChange={handleChange} s={s} />
                  <FormField label="Next Review Date"        name="next_review_date"       type="date" value={formData.next_review_date} onChange={handleChange} s={s} />
                  <SelectField label="Preferred Contact"     name="preferred_contact_method" value={formData.preferred_contact_method} onChange={handleChange} options={CONTACT_METHOD_OPTIONS} s={s} />
                  <SelectField label="Communication Frequency" name="communication_frequency" value={formData.communication_frequency} onChange={handleChange} options={COMMUNICATION_FREQUENCY_OPTIONS} s={s} />
                </div>

                <p style={s.sectionLabel}>Notes</p>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any additional context about this client..."
                  style={s.textarea}
                />

                {error && <p style={s.errorText}>{error}</p>}
              </div>

              <p style={{ fontSize: '11px', color: t.TEXT_MUTED, fontWeight: 300, margin: '8px 0 0 0', padding: '0 24px' }}>
                * Required field
              </p>
              <div style={s.modalFooter}>
                <button
                  style={s.cancelButton}
                  onClick={() => { setShowModal(false); setFormData(emptyForm); setError(''); }}
                >
                  Cancel
                </button>
                <button style={s.saveButton} onClick={handleAddClient} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Client'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

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
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}