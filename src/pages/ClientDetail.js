import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useOrg } from '../context/OrgContext';
import {
  ACCENT,
  ACCENT_BORDER,
  ACCENT_MUTED,
  ASSET_LEVEL_OPTIONS,
  COMMUNICATION_FREQUENCY_OPTIONS,
  CONTACT_METHOD_OPTIONS,
  FONT_BODY,
  FONT_DISPLAY,
  INVESTMENT_OBJECTIVE_OPTIONS,
  LIQUIDITY_NEEDS_OPTIONS,
  RADIUS_LG,
  RADIUS_MD,
  RADIUS_PILL,
  REFERRAL_SOURCE_OPTIONS,
  RISK_TOLERANCE_OPTIONS,
  SHADOW_MD,
  STATUS_COLORS,
  STATUS_OPTIONS,
  TAX_BRACKET_OPTIONS,
  TIME_HORIZON_OPTIONS,
  FULL_ACCESS_ROLES,
  ORG_ADMIN_ROLES,
  WRITE_ROLES,
} from '../utils/hqConstants';
import { useTokens } from '../context/ThemeContext';


function Field({ label, value, s }) {
  return (
    <div style={s.field}>
      <span style={s.fieldLabel}>{label}</span>
      <span style={value ? s.fieldValue : { ...s.fieldValue, opacity: 0.35 }}>{value || '—'}</span>
    </div>
  );
}

function Section({ title, children, s }) {
  return (
    <div style={s.section}>
      <p style={s.sectionLabel}>{title}</p>
      <div style={s.fieldGrid}>{children}</div>
    </div>
  );
}

function FormField({ label, name, value, onChange, type = 'text', s }) {
  return (
    <div style={s.formField}>
      <label style={s.label}>{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} style={s.input} />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, s }) {
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
  const t = useTokens();

  const s = {
    pageWrapper: {
      background: t.BG,
      minHeight: '100vh',
      width: '100%',
    },
    page: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '120px 40px 80px',
      fontFamily: FONT_BODY,
      color: t.TEXT,
    },
    loading: {
      background: t.BG,
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: t.TEXT_MUTED,
      fontFamily: FONT_BODY,
    },
    topRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px',
    },
    backLink: {
      color: t.TEXT_MUTED,
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: '300',
      transition: 'color 0.15s',
    },
    actionButtons: {
      display: 'flex',
      gap: '10px',
    },
    editButton: {
      background: ACCENT_MUTED,
      color: ACCENT,
      border: `1px solid ${ACCENT_BORDER}`,
      borderRadius: RADIUS_MD,
      padding: '8px 18px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      fontFamily: FONT_BODY,
    },
    deleteButton: {
      background: 'transparent',
      color: t.TEXT_MUTED,
      border: `1px solid rgba(122,125,138,0.25)`,
      borderRadius: RADIUS_MD,
      padding: '8px 18px',
      fontSize: '13px',
      fontWeight: '500',
      cursor: 'pointer',
      fontFamily: FONT_BODY,
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
      background: ACCENT_MUTED,
      border: `1px solid ${ACCENT_BORDER}`,
      color: ACCENT,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '22px',
      fontWeight: '400',
      fontFamily: FONT_DISPLAY,
      letterSpacing: '0.02em',
      flexShrink: 0,
    },
    headerText: { flex: 1 },
    name: {
      fontFamily: FONT_DISPLAY,
      fontSize: '40px',
      fontWeight: '300',
      margin: '0 0 4px',
      color: t.TEXT,
      letterSpacing: '0.01em',
      lineHeight: 1.1,
    },
    email: {
      fontSize: '14px',
      color: t.TEXT_MUTED,
      margin: '0 0 2px',
      fontWeight: '300',
    },
    badge: {
      display: 'inline-block',
      padding: '4px 14px',
      borderRadius: RADIUS_PILL,
      fontSize: '11px',
      fontWeight: '600',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      marginLeft: 'auto',
    },
    divider: {
      height: '1px',
      background: `linear-gradient(to right, ${t.BORDER}, transparent)`,
      marginBottom: '36px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '16px',
      marginBottom: '20px',
    },
    section: {
      background: t.SURFACE,
      border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_LG,
      padding: '24px',
      boxShadow: SHADOW_MD,
    },
    sectionLabel: {
      fontSize: '10px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      color: ACCENT,
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
      color: t.TEXT_MUTED,
      fontWeight: '400',
    },
    fieldValue: {
      fontSize: '13px',
      color: t.TEXT,
      textAlign: 'right',
      fontWeight: '400',
    },
    notesCard: {
      background: t.SURFACE,
      border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_LG,
      padding: '24px',
      marginTop: '4px',
      boxShadow: SHADOW_MD,
    },
    notesText: {
      fontSize: '14px',
      color: t.TEXT,
      lineHeight: '1.7',
      margin: 0,
      fontWeight: '300',
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
      fontWeight: '400',
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
    formSectionLabel: {
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
    formField: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    label: {
      fontSize: '12px',
      fontWeight: '500',
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
      border: `1px solid ${ACCENT_BORDER}`,
      background: ACCENT_MUTED,
      color: ACCENT,
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      fontFamily: FONT_BODY,
    },
    confirmModal: {
      background: t.SURFACE,
      border: `1px solid rgba(248,113,113,0.3)`,
      borderRadius: RADIUS_LG,
      width: '100%',
      maxWidth: '420px',
      padding: '32px',
      boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
    },
    confirmTitle: {
      fontFamily: FONT_DISPLAY,
      fontSize: '24px',
      fontWeight: '400',
      color: t.TEXT,
      margin: '0 0 10px',
      letterSpacing: '0.01em',
    },
    confirmText: {
      fontSize: '14px',
      color: t.TEXT_MUTED,
      margin: '0 0 24px',
      lineHeight: '1.6',
      fontWeight: '300',
    },
    confirmButtons: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px',
    },
    confirmDeleteButton: {
      padding: '9px 20px',
      borderRadius: RADIUS_MD,
      border: '1px solid rgba(248,113,113,0.4)',
      background: 'transparent',
      color: '#f87171',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      fontFamily: FONT_BODY,
    },
  };

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { orgId } = useOrg();
  const [userRole, setUserRole] = useState(null);
  const canManageOrg = ORG_ADMIN_ROLES.includes(userRole);
  const canWrite = WRITE_ROLES.includes(userRole);
  const canManageAdvisors = FULL_ACCESS_ROLES.includes(userRole);
  const backPath = location.state?.from || '/hq/clients';
  const backLabel = backPath === '/hq/notes' ? '← Back to Notes' : backPath === '/hq/crm' ? '← Back to CRM' : '← Back to Clients';
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
  const [showNoteCompose, setShowNoteCompose] = useState(false);
  const [inlineNoteForm, setInlineNoteForm] = useState({ title: '', body: '', note_type: 'General' });
  const [inlineNoteSaving, setInlineNoteSaving] = useState(false);
  const [inlineNoteError, setInlineNoteError] = useState('');
  const [editNoteForm, setEditNoteForm] = useState({});
  const [advisors, setAdvisors] = useState([]);
  const [orgMembers, setOrgMembers] = useState([]);
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);

  useEffect(() => {
    async function fetchClient() {
      const { data, error } = await supabase
        .from('clients').select('*')
        .eq('id', id).eq('org_id', orgId).is('deleted_at', null).single();
      if (error) console.error(error);
      else setClient(data);
      setLoading(false);
    }
    async function loadNotes() {
      const { data } = await supabase
        .from('notes').select('*')
        .eq('client_id', id).eq('org_id', orgId).is('deleted_at', null)
        .order('created_at', { ascending: false });
      setClientNotes(data || []);
    }
    async function loadAdvisors() {
      const { data } = await supabase
        .from('client_advisors').select('id, user_id, is_primary')
        .eq('client_id', id).eq('org_id', orgId);
      if (!data) { setAdvisors([]); return; }
      const { data: members } = await supabase.rpc('get_org_members', { target_org_id: orgId });
      const memberMap = Object.fromEntries((members || []).map(m => [m.user_id, m]));
      setAdvisors(data.map(a => ({ ...a, ...memberMap[a.user_id] })));
    }
    async function loadOrgMembers() {
      const { data } = await supabase.rpc('get_org_members', { target_org_id: orgId });
      setOrgMembers(data || []);
      const { data: { user } } = await supabase.auth.getUser();
      const me = (data || []).find(m => m.user_id === user?.id);
      setUserRole(me?.role || null);
    }
    if (orgId) { fetchClient(); loadNotes(); loadAdvisors(); loadOrgMembers(); }
  }, [id, orgId]);

  async function handleInlineNoteSave() {
    if (!inlineNoteForm.title.trim()) { setInlineNoteError('Please enter a title.'); return; }
    setInlineNoteSaving(true); setInlineNoteError('');
    const { error } = await supabase.from('notes').insert([{
      client_id: id,
      title: inlineNoteForm.title,
      body: inlineNoteForm.body,
      note_type: inlineNoteForm.note_type,
      source: 'manual',
      org_id: orgId,
    }]);
    if (error) { setInlineNoteError('Something went wrong.'); }
    else {
      setInlineNoteForm({ title: '', body: '', note_type: 'General' });
      setShowNoteCompose(false);
      fetchNotes();
    }
    setInlineNoteSaving(false);
  }

  async function fetchNotes() {
    const { data } = await supabase
      .from('notes').select('*')
      .eq('client_id', id).eq('org_id', orgId).is('deleted_at', null)
      .order('created_at', { ascending: false });
    setClientNotes(data || []);
  }

  async function fetchAdvisors() {
    const { data } = await supabase
      .from('client_advisors').select('id, user_id, is_primary')
      .eq('client_id', id).eq('org_id', orgId);
    if (!data) { setAdvisors([]); return; }
    const { data: members } = await supabase.rpc('get_org_members', { target_org_id: orgId });
    const memberMap = Object.fromEntries((members || []).map(m => [m.user_id, m]));
    setAdvisors(data.map(a => ({ ...a, ...memberMap[a.user_id] })));
  }

  async function handleAssignAdvisor(userId) {
    const already = advisors.find(a => a.user_id === userId);
    if (already) return;
    const isPrimary = advisors.length === 0;
    await supabase.from('client_advisors').insert([{ org_id: orgId, client_id: id, user_id: userId, is_primary: isPrimary }]);
    fetchAdvisors();
  }

  async function handleRemoveAdvisor(advisorId) {
    await supabase.from('client_advisors').delete().eq('id', advisorId);
    fetchAdvisors();
  }

  async function handleSetPrimary(advisorId) {
    // Optimistically update state immediately so animation fires
    setAdvisors(prev => prev.map(a => ({ ...a, is_primary: a.id === advisorId })));
    // Persist to DB
    const current = advisors.find(a => a.id !== advisorId && a.is_primary);
    if (current) {
      await supabase.from('client_advisors').update({ is_primary: false }).eq('id', current.id);
    }
    await supabase.from('client_advisors').update({ is_primary: true }).eq('id', advisorId);
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
    await supabase.from('notes').update({ deleted_at: new Date().toISOString() }).eq('id', noteId);
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
    const { error } = await supabase.from('clients').update(formData).eq('id', id);
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
    const { error } = await supabase
      .from('clients').update({ deleted_at: new Date().toISOString() }).eq('id', id);
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

        {/* Top row */}
        <div style={s.topRow}>
          <Link to={backPath} style={s.backLink}>{backLabel}</Link>
          <div style={s.actionButtons}>
            {canWrite && <button style={s.editButton} onClick={openEdit}>Edit Details</button>}
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
              backgroundColor: STATUS_COLORS?.[client.status]?.bg || ACCENT_MUTED,
              color: STATUS_COLORS?.[client.status]?.color || ACCENT,
            }}>
              {client.status}
            </span>
          )}
        </div>

        <div style={s.divider} />

        {/* Assigned Advisors */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <p style={{ ...s.sectionLabel, margin: 0 }}>Assigned Advisors</p>
            {canManageAdvisors && (
              <button
                onClick={() => setShowAdvisorModal(true)}
                style={{ background: 'none', border: `1px solid ${ACCENT_BORDER}`, borderRadius: RADIUS_MD, padding: '3px 10px', fontSize: '12px', color: ACCENT, cursor: 'pointer', fontFamily: FONT_BODY }}
              >
                + Assign
              </button>
            )}
          </div>
          {advisors.length === 0 ? (
            <p style={{ color: t.TEXT_MUTED, fontSize: '13px', fontWeight: '300' }}>No advisors assigned yet.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', transition: 'all 0.3s ease' }}>
              {[...advisors].sort((a, b) => b.is_primary - a.is_primary).map(a => (
                <div
                  key={a.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: a.is_primary ? ACCENT_MUTED : t.SURFACE,
                    border: `1px solid ${a.is_primary ? ACCENT_BORDER : t.BORDER}`,
                    borderRadius: RADIUS_MD, padding: '6px 12px',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <span style={{ fontSize: '13px', color: t.TEXT }}>
                    {a.first_name && a.last_name ? `${a.first_name} ${a.last_name}` : a.user_id.slice(0, 8) + '…'}
                  </span>
                  {a.is_primary && (
                    <span style={{ fontSize: '10px', color: ACCENT, letterSpacing: '0.06em', fontWeight: '600' }}>Primary</span>
                  )}
                  {canManageAdvisors && !a.is_primary && (
                    <button onClick={() => handleSetPrimary(a.id)} style={{ background: 'none', border: 'none', fontSize: '11px', color: t.TEXT_MUTED, cursor: 'pointer', padding: 0 }}>Set primary</button>
                  )}
                  {canManageAdvisors && (
                    <button onClick={() => handleRemoveAdvisor(a.id)} style={{ background: 'none', border: 'none', fontSize: '11px', color: '#f87171', cursor: 'pointer', padding: 0 }}>✕</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assign Advisor Modal */}
        {showAdvisorModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
            <div style={{ background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, padding: '32px', width: '340px' }}>
              <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: '400', color: t.TEXT, fontSize: '22px', marginBottom: '20px' }}>Assign Advisor</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                {orgMembers.map(m => {
                  const assigned = advisors.find(a => a.user_id === m.user_id);
                  return (
                    <div key={m.user_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: t.SURFACE_ALT, borderRadius: RADIUS_MD }}>
                      <span style={{ fontSize: '13px', color: t.TEXT }}>
                        {m.first_name && m.last_name ? `${m.first_name} ${m.last_name}` : m.user_id.slice(0, 8) + '…'}
                        <span style={{ color: t.TEXT_MUTED, fontSize: '11px', marginLeft: '6px' }}>({m.role})</span>
                      </span>
                      {assigned ? (
                        <span style={{ fontSize: '11px', color: t.TEXT_MUTED }}>Assigned</span>
                      ) : (
                        <button onClick={() => handleAssignAdvisor(m.user_id)} style={{ background: ACCENT_MUTED, border: `1px solid ${ACCENT_BORDER}`, borderRadius: RADIUS_MD, padding: '4px 12px', fontSize: '12px', color: ACCENT, cursor: 'pointer', fontWeight: '600', fontFamily: FONT_BODY }}>Assign</button>
                      )}
                    </div>
                  );
                })}
              </div>
              <button onClick={() => setShowAdvisorModal(false)} style={{ width: '100%', background: 'none', border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '10px', color: t.TEXT_MUTED, cursor: 'pointer', fontFamily: FONT_BODY }}>Done</button>
            </div>
          </div>
        )}

        {/* Detail sections */}
        <div style={s.grid}>
          <Section title="Core Identity" s={s}>
            <Field label="Date of Birth" value={client.date_of_birth} s={s} />
            <Field label="Preferred Contact" value={client.preferred_contact_method} s={s} />
            <Field label="Communication Frequency" value={client.communication_frequency} s={s} />
          </Section>
          <Section title="Financial Profile" s={s}>
            <Field label="Asset Level" value={client.asset_level} s={s} />
            <Field label="Risk Tolerance" value={client.risk_tolerance} s={s} />
            <Field label="Investment Objective" value={client.investment_objective} s={s} />
            <Field label="Time Horizon" value={client.time_horizon} s={s} />
            <Field label="Tax Bracket" value={client.tax_bracket} s={s} />
            <Field label="Liquidity Needs" value={client.liquidity_needs} s={s} />
          </Section>
          <Section title="Relationship" s={s}>
            <Field label="Client Since" value={client.client_since} s={s} />
            <Field label="Referral Source" value={client.referral_source} s={s} />
            <Field label="Next Review Date" value={client.next_review_date} s={s} />
          </Section>
        </div>

        {/* Profile Notes */}
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
            {canWrite && (
              <button style={s.editButton} onClick={() => setShowNoteCompose(v => !v)}>
                {showNoteCompose ? 'Cancel' : '+ Record Note'}
              </button>
            )}
          </div>

          {canWrite && showNoteCompose && (
            <div style={{ ...s.notesCard, marginBottom: '16px' }}>
              <p style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.12em', color: ACCENT, margin: '0 0 14px' }}>New Note</p>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '140px' }}>
                  <label style={s.label}>Type</label>
                  <select value={inlineNoteForm.note_type} onChange={e => setInlineNoteForm({ ...inlineNoteForm, note_type: e.target.value })} style={s.input}>
                    {['Meeting', 'Call', 'Email', 'General'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 3, minWidth: '200px' }}>
                  <label style={s.label}>Title *</label>
                  <input value={inlineNoteForm.title} onChange={e => setInlineNoteForm({ ...inlineNoteForm, title: e.target.value })} placeholder="e.g. Q1 Review Meeting" style={s.input} />
                </div>
              </div>
              <textarea
                value={inlineNoteForm.body}
                onChange={e => setInlineNoteForm({ ...inlineNoteForm, body: e.target.value })}
                placeholder="Key discussion points, action items..."
                style={{ ...s.input, width: '100%', minHeight: '90px', resize: 'vertical', fontFamily: FONT_BODY, boxSizing: 'border-box', marginBottom: '10px' }}
              />
              {inlineNoteError && <p style={{ color: '#f87171', fontSize: '12px', marginBottom: '8px' }}>{inlineNoteError}</p>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button style={s.cancelButton} onClick={() => { setShowNoteCompose(false); setInlineNoteError(''); setInlineNoteForm({ title: '', body: '', note_type: 'General' }); }}>Cancel</button>
                <button style={s.saveButton} onClick={handleInlineNoteSave} disabled={inlineNoteSaving}>{inlineNoteSaving ? 'Saving…' : 'Save Note'}</button>
              </div>
            </div>
          )}

          {clientNotes.length === 0 ? (
            <div style={{ ...s.notesCard, textAlign: 'center', color: t.TEXT_MUTED, fontSize: '14px' }}>
              No notes yet.{' '}
              {canWrite && (
                <span style={{ color: ACCENT, cursor: 'pointer' }} onClick={() => setShowNoteCompose(true)}>
                  Add the first note →
                </span>
              )}
            </div>
          ) : (
            groupNotesByDate(clientNotes).map(([date, dateNotes]) => (
              <div key={date} style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: t.TEXT_MUTED, marginBottom: '8px' }}>
                  {formatDateLabel(date)}
                </p>
                {dateNotes.map((note) => (
                  <div key={note.id} style={{ ...s.notesCard, marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: note.body ? '8px' : '0', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: FONT_DISPLAY, fontSize: '17px', fontWeight: '400', color: t.TEXT, flex: 1, letterSpacing: '0.01em' }}>{note.title}</span>
                      {note.note_type && (
                        <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 10px', borderRadius: RADIUS_PILL, background: ACCENT_MUTED, color: ACCENT, border: `1px solid ${ACCENT_BORDER}`, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          {note.note_type}
                        </span>
                      )}
                    </div>
                    {note.body && <p style={{ ...s.notesText, marginBottom: '10px' }}>{note.body}</p>}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: t.TEXT_MUTED, padding: 0, fontFamily: FONT_BODY }} onClick={() => openEditNote(note)}>Edit</button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#f87171', padding: 0, fontFamily: FONT_BODY }} onClick={() => handleDeleteNote(note.id)}>Delete</button>
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
                  <label style={s.label}>Type</label>
                  <select value={editNoteForm.note_type} onChange={(e) => setEditNoteForm({ ...editNoteForm, note_type: e.target.value })} style={s.input}>
                    {['Meeting', 'Call', 'Email', 'General'].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                  <label style={s.label}>Title</label>
                  <input value={editNoteForm.title} onChange={(e) => setEditNoteForm({ ...editNoteForm, title: e.target.value })} style={s.input} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={s.label}>Body</label>
                  <textarea
                    value={editNoteForm.body || ''}
                    onChange={(e) => setEditNoteForm({ ...editNoteForm, body: e.target.value })}
                    style={{ ...s.input, minHeight: '100px', resize: 'vertical', fontFamily: FONT_BODY }}
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

        {/* Delete Client */}
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
                  <FormField label="First Name *" name="first_name" value={formData.first_name || ''} onChange={handleChange} s={s} />
                  <FormField label="Last Name *"  name="last_name"  value={formData.last_name  || ''} onChange={handleChange} s={s} />
                  <FormField label="Email" name="email" type="email" value={formData.email || ''} onChange={handleChange} s={s} />
                  <FormField label="Phone" name="phone" value={formData.phone || ''} onChange={handleChange} s={s} />
                  <FormField label="Date of Birth" name="date_of_birth" type="date" value={formData.date_of_birth || ''} onChange={handleChange} s={s} />
                  <SelectField label="Status" name="status" value={formData.status || ''} onChange={handleChange} options={STATUS_OPTIONS} s={s} />
                </div>
                <p style={s.formSectionLabel}>Financial Profile</p>
                <div style={s.formGrid}>
                  <SelectField label="Asset Level"          name="asset_level"          value={formData.asset_level          || ''} onChange={handleChange} options={ASSET_LEVEL_OPTIONS} s={s} />
                  <SelectField label="Risk Tolerance"       name="risk_tolerance"        value={formData.risk_tolerance        || ''} onChange={handleChange} options={RISK_TOLERANCE_OPTIONS} s={s} />
                  <SelectField label="Investment Objective" name="investment_objective"  value={formData.investment_objective  || ''} onChange={handleChange} options={INVESTMENT_OBJECTIVE_OPTIONS} s={s} />
                  <SelectField label="Time Horizon"         name="time_horizon"          value={formData.time_horizon          || ''} onChange={handleChange} options={TIME_HORIZON_OPTIONS} s={s} />
                  <SelectField label="Tax Bracket"          name="tax_bracket"           value={formData.tax_bracket           || ''} onChange={handleChange} options={TAX_BRACKET_OPTIONS} s={s} />
                  <SelectField label="Liquidity Needs"      name="liquidity_needs"       value={formData.liquidity_needs       || ''} onChange={handleChange} options={LIQUIDITY_NEEDS_OPTIONS} s={s} />
                </div>
                <p style={s.formSectionLabel}>Relationship</p>
                <div style={s.formGrid}>
                  <SelectField label="Referral Source"    name="referral_source"      value={formData.referral_source      || ''} onChange={handleChange} options={REFERRAL_SOURCE_OPTIONS} s={s} />
                  <FormField label="Client Since"         name="client_since"         type="date" value={formData.client_since || ''} onChange={handleChange} s={s} />
                  <FormField label="Next Review Date"     name="next_review_date"     type="date" value={formData.next_review_date || ''} onChange={handleChange} s={s} />
                  <SelectField label="Preferred Contact"         name="preferred_contact_method"  value={formData.preferred_contact_method  || ''} onChange={handleChange} options={CONTACT_METHOD_OPTIONS} s={s} />
                  <SelectField label="Communication Frequency"   name="communication_frequency"   value={formData.communication_frequency   || ''} onChange={handleChange} options={COMMUNICATION_FREQUENCY_OPTIONS} s={s} />
                </div>
                <p style={s.formSectionLabel}>Notes</p>
                <textarea name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Any additional context about this client..." style={s.textarea} />
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
                <button style={s.cancelButton} onClick={() => setShowConfirmDelete(false)}>Cancel</button>
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