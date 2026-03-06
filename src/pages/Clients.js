import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useOrg } from '../context/OrgContext';
import {
  ACCENT, ACCENT_MUTED, ACCENT_BORDER,
  D_BG, D_SURFACE, D_SURFACE_ALT, D_BORDER,
  D_TEXT, D_TEXT_MUTED,
  FONT_DISPLAY, FONT_BODY,
  RADIUS_MD, RADIUS_LG, RADIUS_PILL,
  SHADOW_MD,
  STATUS_COLORS, STATUS_OPTIONS,
  ASSET_LEVEL_OPTIONS, RISK_TOLERANCE_OPTIONS,
  INVESTMENT_OBJECTIVE_OPTIONS, TIME_HORIZON_OPTIONS,
  CONTACT_METHOD_OPTIONS, COMMUNICATION_FREQUENCY_OPTIONS,
  LIQUIDITY_NEEDS_OPTIONS, TAX_BRACKET_OPTIONS,
  REFERRAL_SOURCE_OPTIONS,
} from '../utils/hqConstants';

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handle = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);
  return width;
}

const emptyForm = {
  first_name: '', last_name: '', email: '', phone: '',
  date_of_birth: '', status: 'Prospect', asset_level: '',
  risk_tolerance: '', investment_objective: '', time_horizon: '',
  tax_bracket: '', liquidity_needs: '', relationship_manager: '',
  referral_source: '', client_since: '', next_review_date: '',
  preferred_contact_method: '', communication_frequency: '', notes: '',
};

export default function Clients() {
  const { orgId } = useOrg();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const windowWidth = useWindowWidth();
  const isCompact = windowWidth < 1050;

  useEffect(() => {
    if (orgId) fetchClients();
  }, [orgId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchClients() {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('last_name', { ascending: true });
    if (error) console.error('Error fetching clients:', error);
    else setClients(data || []);
    setLoading(false);
  }

  async function handleAddClient() {
    if (!formData.first_name || !formData.last_name) {
      setError('First and last name are required.');
      return;
    }
    setSaving(true);
    setError('');
    const { error } = await supabase.from('clients').insert([{ ...formData, org_id: orgId }]);
    if (error) {
      setError('Something went wrong. Please try again.');
      console.error(error);
    } else {
      setShowModal(false);
      setFormData(emptyForm);
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
                {/* Avatar + Name */}
                <div style={s.cardTop}>
                  <Link
                    to={`/hq/clients/${client.id}`}
                    state={{ from: '/hq/clients' }}
                    style={s.avatarLink}
                    className="client-avatar-link"
                  >
                    <div style={s.avatar} className="client-avatar">
                      {client.first_name?.[0]}{client.last_name?.[0]}
                    </div>
                  </Link>
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

                {/* Status badge */}
                {client.status && (
                  <span style={{
                    ...s.badge,
                    marginLeft: 'auto',
                    backgroundColor: STATUS_COLORS[client.status]?.bg || ACCENT_MUTED,
                    color: STATUS_COLORS[client.status]?.color || ACCENT,
                  }}>
                    {client.status}
                  </span>
                )}
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
          .client-card:hover {
            transform: translateY(-2px) !important;
            border-color: ${ACCENT_BORDER} !important;
            box-shadow: 0 8px 32px rgba(29,185,84,0.08) !important;
          }
          .client-avatar { transition: background 0.2s, box-shadow 0.2s, transform 0.2s; }
          .client-avatar-link:hover .client-avatar {
            background: ${ACCENT_MUTED} !important;
            box-shadow: 0 0 0 2px ${ACCENT_BORDER};
            transform: scale(1.06);
          }
          .client-name-link { text-decoration: none; }
          .client-name-link:hover h3 { color: ${ACCENT} !important; }
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
                  <FormField label="First Name *" name="first_name" value={formData.first_name} onChange={handleChange} />
                  <FormField label="Last Name *"  name="last_name"  value={formData.last_name}  onChange={handleChange} />
                  <FormField label="Email"         name="email"      type="email" value={formData.email} onChange={handleChange} />
                  <FormField label="Phone"         name="phone"      value={formData.phone}      onChange={handleChange} />
                  <FormField label="Date of Birth" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} />
                  <SelectField label="Status" name="status" value={formData.status} onChange={handleChange} options={STATUS_OPTIONS} />
                </div>

                <p style={s.sectionLabel}>Financial Profile</p>
                <div style={s.formGrid}>
                  <SelectField label="Asset Level"           name="asset_level"           value={formData.asset_level}           onChange={handleChange} options={ASSET_LEVEL_OPTIONS} />
                  <SelectField label="Risk Tolerance"        name="risk_tolerance"         value={formData.risk_tolerance}         onChange={handleChange} options={RISK_TOLERANCE_OPTIONS} />
                  <SelectField label="Investment Objective"  name="investment_objective"   value={formData.investment_objective}   onChange={handleChange} options={INVESTMENT_OBJECTIVE_OPTIONS} />
                  <SelectField label="Time Horizon"          name="time_horizon"           value={formData.time_horizon}           onChange={handleChange} options={TIME_HORIZON_OPTIONS} />
                  <SelectField label="Tax Bracket"           name="tax_bracket"            value={formData.tax_bracket}            onChange={handleChange} options={TAX_BRACKET_OPTIONS} />
                  <SelectField label="Liquidity Needs"       name="liquidity_needs"        value={formData.liquidity_needs}        onChange={handleChange} options={LIQUIDITY_NEEDS_OPTIONS} />
                </div>

                <p style={s.sectionLabel}>Relationship Management</p>
                <div style={s.formGrid}>
                  <FormField label="Relationship Manager"    name="relationship_manager"   value={formData.relationship_manager}   onChange={handleChange} />
                  <SelectField label="Referral Source"       name="referral_source"        value={formData.referral_source}        onChange={handleChange} options={REFERRAL_SOURCE_OPTIONS} />
                  <FormField label="Client Since"            name="client_since"           type="date" value={formData.client_since} onChange={handleChange} />
                  <FormField label="Next Review Date"        name="next_review_date"       type="date" value={formData.next_review_date} onChange={handleChange} />
                  <SelectField label="Preferred Contact"     name="preferred_contact_method" value={formData.preferred_contact_method} onChange={handleChange} options={CONTACT_METHOD_OPTIONS} />
                  <SelectField label="Communication Frequency" name="communication_frequency" value={formData.communication_frequency} onChange={handleChange} options={COMMUNICATION_FREQUENCY_OPTIONS} />
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

function FormField({ label, name, value, onChange, type = 'text' }) {
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} style={s.input} />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
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

const s = {
  pageWrapper: {
    background: D_BG,
    minHeight: '100vh',
    width: '100%',
  },
  page: {
    padding: '120px 40px 80px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: FONT_BODY,
    color: D_TEXT,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px',
  },
  title: {
    fontFamily: FONT_DISPLAY,
    fontSize: '44px',
    fontWeight: '300',
    margin: '0 0 6px',
    color: D_TEXT,
    letterSpacing: '0.01em',
    lineHeight: 1.1,
  },
  subtitle: {
    fontSize: '13px',
    color: D_TEXT_MUTED,
    margin: 0,
    fontWeight: '300',
    letterSpacing: '0.03em',
  },
  addButton: {
    background: 'transparent',
    color: ACCENT,
    border: `1px solid ${ACCENT_BORDER}`,
    borderRadius: RADIUS_MD,
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
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
    border: `1px solid ${D_BORDER}`,
    borderRadius: RADIUS_MD,
    padding: '9px 14px',
    fontSize: '14px',
    width: '280px',
    outline: 'none',
    color: D_TEXT,
    background: D_SURFACE_ALT,
    fontFamily: FONT_BODY,
  },
  tabs: {
    display: 'flex',
    gap: '6px',
  },
  tab: {
    padding: '7px 16px',
    borderRadius: RADIUS_PILL,
    border: `1px solid ${D_BORDER}`,
    background: 'transparent',
    fontSize: '13px',
    cursor: 'pointer',
    color: D_TEXT_MUTED,
    fontWeight: '500',
    fontFamily: FONT_BODY,
  },
  tabActive: {
    background: ACCENT_MUTED,
    color: ACCENT,
    border: `1px solid ${ACCENT_BORDER}`,
  },
  cardGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  card: {
    background: D_SURFACE,
    border: `1px solid ${D_BORDER}`,
    borderRadius: RADIUS_LG,
    padding: '18px 24px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    boxShadow: SHADOW_MD,
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    width: '260px',
    flexShrink: 0,
  },
  avatarLink: { textDecoration: 'none', flexShrink: 0 },
  nameLink: { textDecoration: 'none' },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: ACCENT_MUTED,
    border: `1px solid ${ACCENT_BORDER}`,
    color: ACCENT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '0.03em',
    flexShrink: 0,
    fontFamily: FONT_DISPLAY,
  },
  cardName: {
    fontFamily: FONT_DISPLAY,
    fontSize: '18px',
    fontWeight: '400',
    color: D_TEXT,
    margin: '0 0 2px',
    letterSpacing: '0.01em',
  },
  cardEmail: {
    fontSize: '12px',
    color: D_TEXT_MUTED,
    margin: 0,
    fontWeight: '300',
  },
  cardDivider: {
    width: '1px',
    alignSelf: 'stretch',
    background: D_BORDER,
    flexShrink: 0,
  },
  cardStats: {
    display: 'flex',
    gap: '32px',
    flex: 1,
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    width: '140px',
    flexShrink: 0,
  },
  statLabel: {
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: D_TEXT_MUTED,
  },
  statValue: {
    fontSize: '13px',
    color: D_TEXT,
    fontWeight: '400',
  },
  badge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: RADIUS_PILL,
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  emptyState: {
    padding: '48px',
    textAlign: 'center',
    color: D_TEXT_MUTED,
    fontSize: '15px',
    fontWeight: '300',
  },
  emptyLink: {
    color: ACCENT,
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
    background: D_SURFACE,
    border: `1px solid ${D_BORDER}`,
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
    borderBottom: `1px solid ${D_BORDER}`,
  },
  modalTitle: {
    margin: 0,
    fontFamily: FONT_DISPLAY,
    fontSize: '24px',
    fontWeight: '400',
    color: D_TEXT,
    letterSpacing: '0.01em',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: D_TEXT_MUTED,
    padding: '4px 8px',
  },
  modalBody: {
    overflowY: 'auto',
    padding: '24px',
    flex: 1,
    background: D_SURFACE,
  },
  sectionLabel: {
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: ACCENT,
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
    fontWeight: '500',
    color: D_TEXT_MUTED,
    letterSpacing: '0.02em',
  },
  input: {
    border: `1px solid ${D_BORDER}`,
    borderRadius: RADIUS_MD,
    padding: '8px 12px',
    fontSize: '14px',
    outline: 'none',
    color: D_TEXT,
    background: D_SURFACE_ALT,
    fontFamily: FONT_BODY,
  },
  textarea: {
    width: '100%',
    border: `1px solid ${D_BORDER}`,
    borderRadius: RADIUS_MD,
    padding: '10px 12px',
    fontSize: '14px',
    minHeight: '80px',
    resize: 'vertical',
    outline: 'none',
    color: D_TEXT,
    background: D_SURFACE_ALT,
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
    borderTop: `1px solid ${D_BORDER}`,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    background: D_SURFACE,
  },
  cancelButton: {
    padding: '9px 20px',
    borderRadius: RADIUS_MD,
    border: `1px solid ${D_BORDER}`,
    background: 'transparent',
    fontSize: '14px',
    cursor: 'pointer',
    color: D_TEXT_MUTED,
    fontFamily: FONT_BODY,
  },
  saveButton: {
    padding: '9px 20px',
    borderRadius: RADIUS_MD,
    border: `1px solid ${ACCENT_BORDER}`,
    background: ACCENT_MUTED,
    color: ACCENT,
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: FONT_BODY,
  },
};