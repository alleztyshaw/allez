import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// HQ design tokens — shared across all HQ sub-pages
const GOLD = '#c9a84c';
const DARK = '#0f1117';
const CARD_BG = '#1e2330';
const BORDER = 'rgba(201,168,76,0.18)';
const TEXT_PRIMARY = '#f0ece0';
const TEXT_MUTED = '#7a7d8a';
const INPUT_BG = '#2a3347';

const ASSET_LEVEL_OPTIONS = [
  'Under $100K',
  '$100K – $250K',
  '$250K – $500K',
  '$500K – $1M',
  '$1M – $5M',
  '$5M – $10M',
  '$10M+',
];

const RISK_TOLERANCE_OPTIONS = [
  'Conservative',
  'Moderately Conservative',
  'Moderate',
  'Moderately Aggressive',
  'Aggressive',
];

const INVESTMENT_OBJECTIVE_OPTIONS = [
  'Growth',
  'Income',
  'Preservation',
  'Balanced',
];

const TIME_HORIZON_OPTIONS = [
  'Short (0–3yr)',
  'Medium (3–10yr)',
  'Long (10yr+)',
];

const STATUS_OPTIONS = ['Prospect', 'Active', 'Inactive', 'Former'];

const CONTACT_METHOD_OPTIONS = ['Email', 'Phone', 'In-person'];

const COMMUNICATION_FREQUENCY_OPTIONS = ['Monthly', 'Quarterly', 'Annually'];

const LIQUIDITY_NEEDS_OPTIONS = ['Low', 'Medium', 'High'];

const TAX_BRACKET_OPTIONS = ['10%', '12%', '22%', '24%', '32%', '35%', '37%'];

const REFERRAL_SOURCE_OPTIONS = [
  'Existing Client',
  'LinkedIn',
  'Event',
  'Cold Outreach',
  'Website',
  'Other',
];

const emptyForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  status: 'Prospect',
  asset_level: '',
  risk_tolerance: '',
  investment_objective: '',
  time_horizon: '',
  tax_bracket: '',
  liquidity_needs: '',
  relationship_manager: '',
  referral_source: '',
  client_since: '',
  next_review_date: '',
  preferred_contact_method: '',
  communication_frequency: '',
  notes: '',
};

const statusColors = {
  Active: { bg: '#d1fae5', color: '#065f46' },
  Prospect: { bg: '#dbeafe', color: '#1e40af' },
  Inactive: { bg: '#fef3c7', color: '#92400e' },
  Former: { bg: '#fee2e2', color: '#991b1b' },
};

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    setLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('last_name', { ascending: true });

    if (error) {
      console.error('Error fetching clients:', error);
    } else {
      setClients(data || []);
    }
    setLoading(false);
  }

  async function handleAddClient() {
    if (!formData.first_name || !formData.last_name) {
      setError('First and last name are required.');
      return;
    }
    setSaving(true);
    setError('');
    const { error } = await supabase.from('clients').insert([formData]);
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
    const matchesSearch =
      `${c.first_name} ${c.last_name} ${c.email}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesTab =
      activeTab === 'all' || c.status?.toLowerCase() === activeTab;
    return matchesSearch && matchesTab;
  });

  const tabs = ['all', 'active', 'prospect', 'inactive'];

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Clients</h1>
          <p style={styles.subtitle}>
            {clients.length} total · {clients.filter(c => c.status === 'Active').length} active
          </p>
        </div>
        <button style={styles.addButton} onClick={() => setShowModal(true)}>
          + New Client
        </button>
      </div>

      {/* Filters */}
      <div style={styles.filterRow}>
        <input
          style={styles.searchInput}
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div style={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab}
              style={{
                ...styles.tab,
                ...(activeTab === tab ? styles.tabActive : {}),
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div style={styles.emptyState}>Loading clients...</div>
      ) : filteredClients.length === 0 ? (
        <div style={styles.emptyState}>
          No clients found.{' '}
          <span style={styles.emptyLink} onClick={() => setShowModal(true)}>
            Add your first client →
          </span>
        </div>
      ) : (
        <div style={styles.cardGrid}>
          {filteredClients.map((client, i) => (
            <div
              key={client.id}
              className="client-card"
              style={{ ...styles.card, animationDelay: `${i * 60}ms` }}
            >
              {/* Avatar + Name */}
              <div style={styles.cardTop}>
                <div style={styles.avatar}>
                  {client.first_name?.[0]}{client.last_name?.[0]}
                </div>
                <div>
                  <h3 style={styles.cardName}>
                    {client.first_name} {client.last_name}
                  </h3>
                  {client.email && <p style={styles.cardEmail}>{client.email}</p>}
                </div>
              </div>

              {/* Vertical divider */}
              <div style={styles.cardDivider} />

              {/* Stats */}
              <div style={styles.cardStats}>
                <div style={styles.stat}>
                  <span style={styles.statLabel}>Assets</span>
                  <span style={styles.statValue}>{client.asset_level || '—'}</span>
                </div>
                <div style={styles.stat}>
                  <span style={styles.statLabel}>Risk</span>
                  <span style={styles.statValue}>{client.risk_tolerance || '—'}</span>
                </div>
                <div style={styles.stat}>
                  <span style={styles.statLabel}>Next Review</span>
                  <span style={styles.statValue}>
                    {client.next_review_date
                      ? new Date(client.next_review_date).toLocaleDateString()
                      : '—'}
                  </span>
                </div>
              </div>

              {/* Badge + Manager pushed to the right */}
              {client.status && (
                <span style={{
                  ...styles.badge,
                  backgroundColor: statusColors[client.status]?.bg || '#f3f4f6',
                  color: statusColors[client.status]?.color || '#374151',
                }}>
                  {client.status}
                </span>
              )}
              {client.relationship_manager && (
                <p style={styles.cardManager}>
                  RM: {client.relationship_manager}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .client-card {
          animation: fadeUp 0.45s ease both;
        }
        .client-card:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.25) !important;
        }
      `}</style>

      {/* Modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>New Client</h2>
              <button
                style={styles.closeButton}
                onClick={() => {
                  setShowModal(false);
                  setFormData(emptyForm);
                  setError('');
                }}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>

              {/* Core Identity */}
              <p style={styles.sectionLabel}>Core Identity</p>
              <div style={styles.formGrid}>
                <FormField label="First Name *" name="first_name" value={formData.first_name} onChange={handleChange} />
                <FormField label="Last Name *" name="last_name" value={formData.last_name} onChange={handleChange} />
                <FormField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                <FormField label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
                <FormField label="Date of Birth" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} />
                <SelectField label="Status" name="status" value={formData.status} onChange={handleChange} options={STATUS_OPTIONS} />
              </div>

              {/* Financial Profile */}
              <p style={styles.sectionLabel}>Financial Profile</p>
              <div style={styles.formGrid}>
                <SelectField label="Asset Level" name="asset_level" value={formData.asset_level} onChange={handleChange} options={ASSET_LEVEL_OPTIONS} />
                <SelectField label="Risk Tolerance" name="risk_tolerance" value={formData.risk_tolerance} onChange={handleChange} options={RISK_TOLERANCE_OPTIONS} />
                <SelectField label="Investment Objective" name="investment_objective" value={formData.investment_objective} onChange={handleChange} options={INVESTMENT_OBJECTIVE_OPTIONS} />
                <SelectField label="Time Horizon" name="time_horizon" value={formData.time_horizon} onChange={handleChange} options={TIME_HORIZON_OPTIONS} />
                <SelectField label="Tax Bracket" name="tax_bracket" value={formData.tax_bracket} onChange={handleChange} options={TAX_BRACKET_OPTIONS} />
                <SelectField label="Liquidity Needs" name="liquidity_needs" value={formData.liquidity_needs} onChange={handleChange} options={LIQUIDITY_NEEDS_OPTIONS} />
              </div>

              {/* Relationship Management */}
              <p style={styles.sectionLabel}>Relationship Management</p>
              <div style={styles.formGrid}>
                <FormField label="Relationship Manager" name="relationship_manager" value={formData.relationship_manager} onChange={handleChange} />
                <SelectField label="Referral Source" name="referral_source" value={formData.referral_source} onChange={handleChange} options={REFERRAL_SOURCE_OPTIONS} />
                <FormField label="Client Since" name="client_since" type="date" value={formData.client_since} onChange={handleChange} />
                <FormField label="Next Review Date" name="next_review_date" type="date" value={formData.next_review_date} onChange={handleChange} />
                <SelectField label="Preferred Contact" name="preferred_contact_method" value={formData.preferred_contact_method} onChange={handleChange} options={CONTACT_METHOD_OPTIONS} />
                <SelectField label="Communication Frequency" name="communication_frequency" value={formData.communication_frequency} onChange={handleChange} options={COMMUNICATION_FREQUENCY_OPTIONS} />
              </div>

              {/* Notes */}
              <p style={styles.sectionLabel}>Notes</p>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional context about this client..."
                style={styles.textarea}
              />

              {error && <p style={styles.errorText}>{error}</p>}
            </div>

            <div style={styles.modalFooter}>
              <button
                style={styles.cancelButton}
                onClick={() => {
                  setShowModal(false);
                  setFormData(emptyForm);
                  setError('');
                }}
              >
                Cancel
              </button>
              <button
                style={styles.saveButton}
                onClick={handleAddClient}
                disabled={saving}
              >
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
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        style={styles.input}
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <select name={name} value={value} onChange={onChange} style={styles.input}>
        <option value="">— Select —</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

const styles = {
  pageWrapper: {
    background: DARK,
    minHeight: '100vh',
    width: '100%',
  },
  page: {
    padding: '48px 40px 80px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    color: TEXT_PRIMARY,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    margin: 0,
    color: TEXT_PRIMARY,
  },
  subtitle: {
    fontSize: '14px',
    color: TEXT_MUTED,
    margin: '4px 0 0',
  },
  addButton: {
    background: 'transparent',
    color: GOLD,
    border: `1px solid ${BORDER}`,
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  filterRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  searchInput: {
    border: `1px solid ${BORDER}`,
    borderRadius: '8px',
    padding: '9px 14px',
    fontSize: '14px',
    width: '280px',
    outline: 'none',
    color: TEXT_PRIMARY,
    background: INPUT_BG,
  },
  tabs: {
    display: 'flex',
    gap: '6px',
  },
  tab: {
    padding: '7px 16px',
    borderRadius: '20px',
    border: `1px solid ${BORDER}`,
    background: 'transparent',
    fontSize: '13px',
    cursor: 'pointer',
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  tabActive: {
    background: `rgba(201,168,76,0.15)`,
    color: GOLD,
    border: `1px solid ${BORDER}`,
  },
  cardGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  card: {
    background: CARD_BG,
    border: `1px solid ${BORDER}`,
    borderRadius: '14px',
    padding: '20px 24px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    minWidth: '220px',
  },
  avatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    background: `rgba(201,168,76,0.15)`,
    border: `1px solid ${BORDER}`,
    color: GOLD,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    letterSpacing: '0.03em',
    flexShrink: 0,
  },
  cardName: {
    fontSize: '15px',
    fontWeight: '700',
    color: TEXT_PRIMARY,
    margin: '0 0 2px',
  },
  cardEmail: {
    fontSize: '12px',
    color: TEXT_MUTED,
    margin: 0,
  },
  cardDivider: {
    width: '1px',
    alignSelf: 'stretch',
    background: BORDER,
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
  },
  statLabel: {
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: TEXT_MUTED,
  },
  statValue: {
    fontSize: '13px',
    color: TEXT_PRIMARY,
    fontWeight: '500',
  },
  cardManager: {
    fontSize: '12px',
    color: TEXT_MUTED,
    margin: 0,
    marginLeft: 'auto',
    whiteSpace: 'nowrap',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  emptyState: {
    padding: '48px',
    textAlign: 'center',
    color: TEXT_MUTED,
    fontSize: '15px',
  },
  emptyLink: {
    color: GOLD,
    cursor: 'pointer',
    textDecoration: 'underline',
  },

  // Modal
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    background: CARD_BG,
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    width: '100%',
    maxWidth: '680px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: `1px solid ${BORDER}`,
  },
  modalTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: TEXT_MUTED,
    padding: '4px 8px',
  },
  modalBody: {
    overflowY: 'auto',
    padding: '24px',
    flex: 1,
    background: CARD_BG,
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: GOLD,
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
    fontSize: '13px',
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  input: {
    border: `1px solid ${BORDER}`,
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    outline: 'none',
    color: TEXT_PRIMARY,
    background: INPUT_BG,
  },
  textarea: {
    width: '100%',
    border: `1px solid ${BORDER}`,
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '14px',
    minHeight: '80px',
    resize: 'vertical',
    outline: 'none',
    color: TEXT_PRIMARY,
    background: INPUT_BG,
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  errorText: {
    color: '#f87171',
    fontSize: '13px',
    marginTop: '12px',
  },
  modalFooter: {
    padding: '16px 24px',
    borderTop: `1px solid ${BORDER}`,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    background: CARD_BG,
  },
  cancelButton: {
    padding: '9px 20px',
    borderRadius: '8px',
    border: `1px solid ${BORDER}`,
    background: 'transparent',
    fontSize: '14px',
    cursor: 'pointer',
    color: TEXT_MUTED,
  },
  saveButton: {
    padding: '9px 20px',
    borderRadius: '8px',
    border: `1px solid ${BORDER}`,
    background: 'transparent',
    color: GOLD,
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};