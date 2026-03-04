import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  GOLD, DARK, CARD_BG, BORDER, TEXT_PRIMARY, TEXT_MUTED, STATUS_COLORS,
  STATUS_OPTIONS, ASSET_LEVEL_OPTIONS, RISK_TOLERANCE_OPTIONS,
  INVESTMENT_OBJECTIVE_OPTIONS, TIME_HORIZON_OPTIONS, CONTACT_METHOD_OPTIONS,
  COMMUNICATION_FREQUENCY_OPTIONS, LIQUIDITY_NEEDS_OPTIONS, TAX_BRACKET_OPTIONS,
  REFERRAL_SOURCE_OPTIONS, INPUT_BG,
} from '../utils/hqConstants';

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
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  backLink: {
    color: TEXT_MUTED,
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.15s',
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
  },
  editButton: {
    background: 'transparent',
    color: GOLD,
    border: `1px solid ${BORDER}`,
    borderRadius: '8px',
    padding: '8px 18px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  deleteButton: {
    background: 'transparent',
    color: TEXT_MUTED,
    border: `1px solid rgba(122,125,138,0.3)`,
    borderRadius: '8px',
    padding: '8px 18px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
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
  headerText: { flex: 1 },
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
  formSectionLabel: {
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
  formField: {
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
  // Delete confirmation modal
  confirmModal: {
    background: CARD_BG,
    border: `1px solid rgba(248,113,113,0.3)`,
    borderRadius: '16px',
    width: '100%',
    maxWidth: '420px',
    padding: '32px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },
  confirmTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: TEXT_PRIMARY,
    margin: '0 0 10px',
  },
  confirmText: {
    fontSize: '14px',
    color: TEXT_MUTED,
    margin: '0 0 24px',
    lineHeight: '1.6',
  },
  confirmButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  confirmDeleteButton: {
    padding: '9px 20px',
    borderRadius: '8px',
    border: '1px solid rgba(248,113,113,0.4)',
    background: 'transparent',
    color: '#f87171',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
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

function FormField({ label, name, value, onChange, type = 'text' }) {
  return (
    <div style={s.formField}>
      <label style={s.label}>{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} style={s.input} />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div style={s.formField}>
      <label style={s.label}>{label}</label>
      <select name={name} value={value} onChange={onChange} style={s.input}>
        <option value="">— Select —</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const backPath = location.state?.from || '/hq/clients';
  const backLabel = backPath === '/hq/notes' ? '← Back to Notes' : '← Back to Clients';
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [clientNotes, setClientNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
  const [editNoteForm, setEditNoteForm] = useState({});

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
    async function loadNotes() {
      const { data } = await supabase
        .from('notes')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false });
      setClientNotes(data || []);
    }
    fetchClient();
    loadNotes();
  }, [id]);

  async function fetchNotes() {
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('client_id', id)
      .order('created_at', { ascending: false });
    setClientNotes(data || []);
  }

  function groupNotesByDate(notes) {
    const groups = {};
    notes.forEach((note) => {
      const date = note.created_at.slice(0, 10);
      if (!groups[date]) groups[date] = [];
      groups[date].push(note);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }

  function formatDateLabel(dateStr) {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
  }

  async function handleDeleteNote(noteId) {
    await supabase.from('notes').delete().eq('id', noteId);
    fetchNotes();
  }

  function openEditNote(note) {
    setEditingNote(note);
    setEditNoteForm({ title: note.title, body: note.body, note_type: note.note_type });
  }

  async function handleEditNoteSave() {
    if (!editNoteForm.title.trim()) return;
    await supabase.from('notes').update({
      title: editNoteForm.title,
      body: editNoteForm.body,
      note_type: editNoteForm.note_type,
      updated_at: new Date().toISOString(),
    }).eq('id', editingNote.id);
    setEditingNote(null);
    fetchNotes();
  }

  function openEdit() {
    setFormData({ ...client });
    setError('');
    setShowEdit(true);
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSave() {
    if (!formData.first_name || !formData.last_name) {
      setError('First and last name are required.');
      return;
    }
    setSaving(true);
    setError('');
    const { error } = await supabase
      .from('clients')
      .update(formData)
      .eq('id', id);
    if (error) {
      setError('Something went wrong. Please try again.');
      console.error(error);
    } else {
      setClient(formData);
      setShowEdit(false);
    }
    setSaving(false);
  }

  async function handleDelete() {
    setDeleting(true);
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) {
      console.error(error);
      setDeleting(false);
    } else {
      navigate('/hq/clients');
    }
  }

  if (loading) return <div style={s.loading}>Loading client...</div>;
  if (!client) return <div style={s.loading}>Client not found.</div>;

  const fullName = `${client.first_name} ${client.last_name}`;

  return (
    <div style={s.pageWrapper}>
      <div style={s.page}>

        {/* Top row: back link + action buttons */}
        <div style={s.topRow}>
          <Link to={backPath} style={s.backLink}>{backLabel}</Link>
          <div style={s.actionButtons}>
            <button style={s.editButton} onClick={openEdit}>Edit Details</button>
          </div>
        </div>

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
              backgroundColor: STATUS_COLORS?.[client.status]?.bg || 'rgba(255,255,255,0.1)',
              color: STATUS_COLORS?.[client.status]?.color || '#f0ece0',
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

        {/* Client notes field from profile */}
        {client.notes && (
          <div style={s.notesCard}>
            <p style={s.sectionLabel}>Profile Notes</p>
            <p style={s.notesText}>{client.notes}</p>
          </div>
        )}

        {/* Notes section */}
        <div style={{ marginTop: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ ...s.sectionLabel, margin: 0 }}>Notes ({clientNotes.length})</p>
            <button
              style={s.editButton}
              onClick={() => navigate(`/hq/notes?client_id=${id}`)}
            >
              + Record Note
            </button>
          </div>

          {clientNotes.length === 0 ? (
            <div style={{ ...s.notesCard, textAlign: 'center', color: TEXT_MUTED, fontSize: '14px' }}>
              No notes yet.{' '}
              <span
                style={{ color: GOLD, cursor: 'pointer' }}
                onClick={() => navigate(`/hq/notes?client_id=${id}`)}
              >
                Add the first note →
              </span>
            </div>
          ) : (
            groupNotesByDate(clientNotes).map(([date, dateNotes]) => (
              <div key={date} style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: TEXT_MUTED, marginBottom: '8px' }}>
                  {formatDateLabel(date)}
                </p>
                {dateNotes.map((note) => (
                  <div key={note.id} style={{ ...s.notesCard, marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: note.body ? '8px' : '0', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '15px', fontWeight: '600', color: TEXT_PRIMARY, flex: 1 }}>{note.title}</span>
                      {note.note_type && (
                        <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 10px', borderRadius: '10px', background: 'rgba(201,168,76,0.12)', color: GOLD, border: '1px solid rgba(201,168,76,0.2)' }}>
                          {note.note_type}
                        </span>
                      )}
                    </div>
                    {note.body && <p style={{ ...s.notesText, marginBottom: '10px' }}>{note.body}</p>}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: TEXT_MUTED, padding: 0, fontFamily: 'inherit' }} onClick={() => openEditNote(note)}>Edit</button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#f87171', padding: 0, fontFamily: 'inherit' }} onClick={() => handleDeleteNote(note.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Edit Note Modal */}
        {editingNote && (
          <div style={s.overlay}>
            <div style={{ ...s.modal, maxWidth: '540px' }}>
              <div style={s.modalHeader}>
                <h2 style={s.modalTitle}>Edit Note</h2>
                <button style={s.closeButton} onClick={() => setEditingNote(null)}>✕</button>
              </div>
              <div style={s.modalBody}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: TEXT_MUTED }}>Type</label>
                  <select value={editNoteForm.note_type} onChange={(e) => setEditNoteForm({ ...editNoteForm, note_type: e.target.value })} style={s.input}>
                    {['Meeting', 'Call', 'Email', 'General'].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: TEXT_MUTED }}>Title</label>
                  <input value={editNoteForm.title} onChange={(e) => setEditNoteForm({ ...editNoteForm, title: e.target.value })} style={s.input} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: TEXT_MUTED }}>Body</label>
                  <textarea
                    value={editNoteForm.body || ''}
                    onChange={(e) => setEditNoteForm({ ...editNoteForm, body: e.target.value })}
                    style={{ ...s.input, minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>
              </div>
              <div style={s.modalFooter}>
                <button style={s.cancelButton} onClick={() => setEditingNote(null)}>Cancel</button>
                <button style={s.saveButton} onClick={handleEditNoteSave}>Save Changes</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Client — bottom of page */}
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <button style={s.deleteButton} onClick={() => setShowConfirmDelete(true)}>
            Delete Client
          </button>
        </div>

        {/* Edit Modal */}
        {showEdit && (
          <div style={s.overlay}>
            <div style={s.modal}>
              <div style={s.modalHeader}>
                <h2 style={s.modalTitle}>Edit Client</h2>
                <button style={s.closeButton} onClick={() => setShowEdit(false)}>✕</button>
              </div>
              <div style={s.modalBody}>
                <p style={s.formSectionLabel}>Core Identity</p>
                <div style={s.formGrid}>
                  <FormField label="First Name *" name="first_name" value={formData.first_name || ''} onChange={handleChange} />
                  <FormField label="Last Name *" name="last_name" value={formData.last_name || ''} onChange={handleChange} />
                  <FormField label="Email" name="email" type="email" value={formData.email || ''} onChange={handleChange} />
                  <FormField label="Phone" name="phone" value={formData.phone || ''} onChange={handleChange} />
                  <FormField label="Date of Birth" name="date_of_birth" type="date" value={formData.date_of_birth || ''} onChange={handleChange} />
                  <SelectField label="Status" name="status" value={formData.status || ''} onChange={handleChange} options={STATUS_OPTIONS} />
                </div>

                <p style={s.formSectionLabel}>Financial Profile</p>
                <div style={s.formGrid}>
                  <SelectField label="Asset Level" name="asset_level" value={formData.asset_level || ''} onChange={handleChange} options={ASSET_LEVEL_OPTIONS} />
                  <SelectField label="Risk Tolerance" name="risk_tolerance" value={formData.risk_tolerance || ''} onChange={handleChange} options={RISK_TOLERANCE_OPTIONS} />
                  <SelectField label="Investment Objective" name="investment_objective" value={formData.investment_objective || ''} onChange={handleChange} options={INVESTMENT_OBJECTIVE_OPTIONS} />
                  <SelectField label="Time Horizon" name="time_horizon" value={formData.time_horizon || ''} onChange={handleChange} options={TIME_HORIZON_OPTIONS} />
                  <SelectField label="Tax Bracket" name="tax_bracket" value={formData.tax_bracket || ''} onChange={handleChange} options={TAX_BRACKET_OPTIONS} />
                  <SelectField label="Liquidity Needs" name="liquidity_needs" value={formData.liquidity_needs || ''} onChange={handleChange} options={LIQUIDITY_NEEDS_OPTIONS} />
                </div>

                <p style={s.formSectionLabel}>Relationship</p>
                <div style={s.formGrid}>
                  <FormField label="Relationship Manager" name="relationship_manager" value={formData.relationship_manager || ''} onChange={handleChange} />
                  <SelectField label="Referral Source" name="referral_source" value={formData.referral_source || ''} onChange={handleChange} options={REFERRAL_SOURCE_OPTIONS} />
                  <FormField label="Client Since" name="client_since" type="date" value={formData.client_since || ''} onChange={handleChange} />
                  <FormField label="Next Review Date" name="next_review_date" type="date" value={formData.next_review_date || ''} onChange={handleChange} />
                  <SelectField label="Preferred Contact" name="preferred_contact_method" value={formData.preferred_contact_method || ''} onChange={handleChange} options={CONTACT_METHOD_OPTIONS} />
                  <SelectField label="Communication Frequency" name="communication_frequency" value={formData.communication_frequency || ''} onChange={handleChange} options={COMMUNICATION_FREQUENCY_OPTIONS} />
                </div>

                <p style={s.formSectionLabel}>Notes</p>
                <textarea
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  placeholder="Any additional context about this client..."
                  style={s.textarea}
                />
                {error && <p style={s.errorText}>{error}</p>}
              </div>
              <div style={s.modalFooter}>
                <button style={s.cancelButton} onClick={() => setShowEdit(false)}>Cancel</button>
                <button style={s.saveButton} onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showConfirmDelete && (
          <div style={s.overlay}>
            <div style={s.confirmModal}>
              <h2 style={s.confirmTitle}>Delete {fullName}?</h2>
              <p style={s.confirmText}>
                This will permanently remove this client and all their data. This cannot be undone.
              </p>
              <div style={s.confirmButtons}>
                <button style={s.cancelButton} onClick={() => setShowConfirmDelete(false)}>
                  Cancel
                </button>
                <button style={s.confirmDeleteButton} onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}