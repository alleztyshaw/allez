import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// HQ design tokens — shared across all HQ sub-pages
const GOLD = '#c9a84c';
const DARK = '#0f1117';
const CARD_BG = '#1e2330';
const BORDER = 'rgba(201,168,76,0.18)';
const TEXT_PRIMARY = '#f0ece0';
const TEXT_MUTED = '#7a7d8a';

const statusColors = {
  Active:   { bg: '#d1fae5', color: '#065f46' },
  Prospect: { bg: '#dbeafe', color: '#1e40af' },
  Inactive: { bg: '#fef3c7', color: '#92400e' },
  Former:   { bg: '#fee2e2', color: '#991b1b' },
};

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div style={s.field}>
      <span style={s.fieldLabel}>{label}</span>
      <span style={s.fieldValue}>{value}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={s.section}>
      <p style={s.sectionLabel}>{title}</p>
      <div style={s.fieldGrid}>{children}</div>
    </div>
  );
}

export default function ClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClient() {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) console.error(error);
      else setClient(data);
      setLoading(false);
    }
    fetchClient();
  }, [id]);

  if (loading) return <div style={s.loading}>Loading client...</div>;
  if (!client) return <div style={s.loading}>Client not found.</div>;

  const fullName = `${client.first_name} ${client.last_name}`;

  return (
    <div style={s.pageWrapper}>
      <div style={s.page}>

        {/* Back link */}
        <Link to="/hq/clients" style={s.backLink}>← Back to Clients</Link>

        {/* Header */}
        <div style={s.header}>
          <div style={s.avatarLarge}>
            {client.first_name?.[0]}{client.last_name?.[0]}
          </div>
          <div style={s.headerText}>
            <h1 style={s.name}>{fullName}</h1>
            {client.email && <p style={s.email}>{client.email}</p>}
            {client.phone && <p style={s.email}>{client.phone}</p>}
          </div>
          {client.status && (
            <span style={{
              ...s.badge,
              backgroundColor: statusColors[client.status]?.bg,
              color: statusColors[client.status]?.color,
            }}>
              {client.status}
            </span>
          )}
        </div>

        <div style={s.divider} />

        {/* Detail sections */}
        <div style={s.grid}>

          <Section title="Core Identity">
            <Field label="Date of Birth" value={client.date_of_birth} />
            <Field label="Client Since" value={client.client_since} />
            <Field label="Preferred Contact" value={client.preferred_contact_method} />
            <Field label="Communication Frequency" value={client.communication_frequency} />
          </Section>

          <Section title="Financial Profile">
            <Field label="Asset Level" value={client.asset_level} />
            <Field label="Risk Tolerance" value={client.risk_tolerance} />
            <Field label="Investment Objective" value={client.investment_objective} />
            <Field label="Time Horizon" value={client.time_horizon} />
            <Field label="Tax Bracket" value={client.tax_bracket} />
            <Field label="Liquidity Needs" value={client.liquidity_needs} />
          </Section>

          <Section title="Relationship">
            <Field label="Relationship Manager" value={client.relationship_manager} />
            <Field label="Referral Source" value={client.referral_source} />
            <Field label="Next Review Date" value={client.next_review_date} />
          </Section>

        </div>

        {/* Notes */}
        {client.notes && (
          <div style={s.notesCard}>
            <p style={s.sectionLabel}>Notes</p>
            <p style={s.notesText}>{client.notes}</p>
          </div>
        )}

      </div>
    </div>
  );
}

const s = {
  pageWrapper: {
    background: DARK,
    minHeight: '100vh',
    width: '100%',
  },
  page: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '48px 40px 80px',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    color: TEXT_PRIMARY,
  },
  loading: {
    background: DARK,
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: TEXT_MUTED,
    fontFamily: "'DM Sans', sans-serif",
  },
  backLink: {
    color: TEXT_MUTED,
    textDecoration: 'none',
    fontSize: '14px',
    display: 'inline-block',
    marginBottom: '32px',
    transition: 'color 0.15s',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '28px',
  },
  avatarLarge: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'rgba(201,168,76,0.15)',
    border: `1px solid ${BORDER}`,
    color: GOLD,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: '700',
    flexShrink: 0,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 4px',
    color: TEXT_PRIMARY,
  },
  email: {
    fontSize: '14px',
    color: TEXT_MUTED,
    margin: '0 0 2px',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 14px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600',
    marginLeft: 'auto',
  },
  divider: {
    height: '1px',
    background: `linear-gradient(to right, ${BORDER}, transparent)`,
    marginBottom: '36px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  },
  section: {
    background: CARD_BG,
    border: `1px solid ${BORDER}`,
    borderRadius: '14px',
    padding: '24px',
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: GOLD,
    margin: '0 0 16px',
  },
  fieldGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  field: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  fieldLabel: {
    fontSize: '13px',
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: '13px',
    color: TEXT_PRIMARY,
    textAlign: 'right',
  },
  notesCard: {
    background: CARD_BG,
    border: `1px solid ${BORDER}`,
    borderRadius: '14px',
    padding: '24px',
    marginTop: '4px',
  },
  notesText: {
    fontSize: '14px',
    color: TEXT_PRIMARY,
    lineHeight: '1.7',
    margin: 0,
  },
};