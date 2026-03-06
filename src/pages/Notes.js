import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useOrg } from '../context/OrgContext';
import {
  ACCENT,
  ACCENT_BORDER,
  ACCENT_MUTED,
  FONT_BODY,
  FONT_DISPLAY,
  RADIUS_LG,
  RADIUS_MD,
  RADIUS_PILL,
  SHADOW_MD,
  STATUS_COLORS,
} from '../utils/hqConstants';
import { useTokens } from '../context/ThemeContext';

const NOTE_TYPES = ['Meeting', 'Call', 'Email', 'General'];


function formatDateLabel(dateStr) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function groupByDate(notes) {
  const groups = {};
  notes.forEach((note) => {
    const date = note.created_at.slice(0, 10);
    if (!groups[date]) groups[date] = [];
    groups[date].push(note);
  });
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
}

const emptyForm = { client_id: '', title: '', body: '', note_type: 'General' };

export default function Notes() {
  const t = useTokens();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { orgId } = useOrg();
  const [notes, setNotes] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [expandedNotes, setExpandedNotes] = useState({});

  function toggleExpand(noteId) {
    setExpandedNotes((prev) => ({ ...prev, [noteId]: !prev[noteId] }));
  }

  useEffect(() => {
    const clientId = searchParams.get('client_id');
    if (clientId) {
      setFormData((f) => ({ ...f, client_id: clientId }));
      setShowCompose(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (orgId) fetchData();
  }, [orgId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchData() {
    const [{ data: notesData }, { data: clientsData }] = await Promise.all([
      supabase.from('notes').select('*').eq('org_id', orgId).is('deleted_at', null).order('created_at', { ascending: false }),
      supabase.from('clients').select('id, first_name, last_name, status').eq('org_id', orgId).is('deleted_at', null).order('last_name'),
    ]);
    setNotes(notesData || []);
    setClients(clientsData || []);
    setLoading(false);
  }

  function clientName(id) {
    const c = clients.find((c) => c.id === id);
    return c ? `${c.first_name} ${c.last_name}` : '—';
  }

  function clientStatus(id) {
    const c = clients.find((c) => c.id === id);
    return c?.status;
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSave() {
    if (!formData.client_id) { setError('Please select a client.'); return; }
    if (!formData.title.trim()) { setError('Please enter a title.'); return; }
    setSaving(true); setError('');
    const { error } = await supabase.from('notes').insert([{
      client_id: formData.client_id,
      title: formData.title,
      body: formData.body,
      note_type: formData.note_type,
      source: 'manual',
      org_id: orgId,
    }]);
    if (error) { setError('Something went wrong. Please try again.'); console.error(error); }
    else {
      setFormData(emptyForm);
      setShowCompose(false);
      fetchData();
      navigate('/hq/notes', { replace: true });
    }
    setSaving(false);
  }

  function openEdit(note) {
    setEditingNote(note);
    setEditForm({ title: note.title, body: note.body, note_type: note.note_type });
  }

  async function handleEditSave() {
    if (!editForm.title.trim()) return;
    const { error } = await supabase.from('notes').update({
      title: editForm.title,
      body: editForm.body,
      note_type: editForm.note_type,
      updated_at: new Date().toISOString(),
    }).eq('id', editingNote.id);
    if (!error) { setEditingNote(null); fetchData(); }
  }

  async function handleDelete(id) {
    await supabase.from('notes').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    fetchData();
  }

  const grouped = groupByDate(notes);


  const s = {
    pageWrapper: { background: t.BG, minHeight: '100vh', width: '100%' },
    page: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '120px 40px 80px',
      fontFamily: FONT_BODY,
      color: t.TEXT,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '32px',
    },
    title: {
      fontFamily: FONT_DISPLAY,
      fontSize: '44px',
      fontWeight: '300',
      margin: '0 0 6px',
      color: t.TEXT,
      letterSpacing: '0.01em',
      lineHeight: 1.1,
    },
    subtitle: { fontSize: '13px', color: t.TEXT_MUTED, margin: 0, fontWeight: '300', letterSpacing: '0.03em' },
    addButton: {
      background: 'transparent',
      color: ACCENT,
      border: `1px solid ${ACCENT_BORDER}`,
      borderRadius: RADIUS_MD,
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      fontFamily: FONT_BODY,
    },
    composeCard: {
      background: t.SURFACE,
      border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_LG,
      padding: '24px',
      marginBottom: '32px',
      boxShadow: SHADOW_MD,
    },
    composeTitle: {
      fontSize: '10px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      color: ACCENT,
      margin: '0 0 16px',
    },
    formRow: { display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' },
    formField: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '180px' },
    label: { fontSize: '12px', fontWeight: '500', color: t.TEXT_MUTED, letterSpacing: '0.02em' },
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
      minHeight: '100px',
      resize: 'vertical',
      outline: 'none',
      color: t.TEXT,
      background: t.SURFACE_ALT,
      fontFamily: FONT_BODY,
      boxSizing: 'border-box',
      marginBottom: '12px',
    },
    composeFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
    cancelButton: {
      padding: '8px 18px',
      borderRadius: RADIUS_MD,
      border: `1px solid ${t.BORDER}`,
      background: 'transparent',
      fontSize: '13px',
      cursor: 'pointer',
      color: t.TEXT_MUTED,
      fontFamily: FONT_BODY,
    },
    saveButton: {
      padding: '8px 18px',
      borderRadius: RADIUS_MD,
      border: `1px solid ${ACCENT_BORDER}`,
      background: ACCENT_MUTED,
      color: ACCENT,
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      fontFamily: FONT_BODY,
    },
    errorText: { color: '#f87171', fontSize: '13px', marginBottom: '10px' },
    dateGroup: { marginBottom: '28px' },
    dateLabel: {
      fontSize: '11px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: t.TEXT_MUTED,
      marginBottom: '10px',
    },
    noteCard: {
      background: t.SURFACE,
      border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_LG,
      padding: '18px 20px',
      marginBottom: '10px',
      boxShadow: SHADOW_MD,
    },
    noteHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '8px',
      flexWrap: 'wrap',
    },
    noteTitle: {
      fontFamily: FONT_DISPLAY,
      fontSize: '17px',
      fontWeight: '400',
      color: t.TEXT,
      flex: 1,
      letterSpacing: '0.01em',
    },
    noteTypeBadge: {
      fontSize: '10px',
      fontWeight: '600',
      padding: '2px 10px',
      borderRadius: RADIUS_PILL,
      background: ACCENT_MUTED,
      color: ACCENT,
      border: `1px solid ${ACCENT_BORDER}`,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
    },
    clientBadge: {
      fontSize: '11px',
      fontWeight: '600',
      padding: '2px 10px',
      borderRadius: RADIUS_PILL,
      background: `rgba(96,165,250,0.12)`,
      color: '#60a5fa',
      border: `1px solid rgba(96,165,250,0.2)`,
      textDecoration: 'none',
      transition: 'background 0.15s, box-shadow 0.15s',
    },
    noteBody: {
      fontSize: '14px',
      color: t.TEXT_MUTED,
      lineHeight: '1.65',
      margin: '0 0 10px',
      whiteSpace: 'pre-wrap',
      fontWeight: '300',
    },
    noteActions: { display: 'flex', gap: '12px' },
    noteAction: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '12px',
      color: t.TEXT_MUTED,
      padding: 0,
      fontFamily: FONT_BODY,
    },
    emptyState: {
      background: t.SURFACE,
      border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_LG,
      padding: '48px',
      textAlign: 'center',
      color: t.TEXT_MUTED,
      fontSize: '14px',
      fontWeight: '300',
    },
    overlay: {
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px',
    },
    modal: {
      background: t.SURFACE, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_LG, width: '100%', maxWidth: '580px',
      boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
    },
    modalHeader: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '18px 22px', borderBottom: `1px solid ${t.BORDER}`,
    },
    modalTitle: {
      margin: 0,
      fontFamily: FONT_DISPLAY,
      fontSize: '22px',
      fontWeight: '400',
      color: t.TEXT,
      letterSpacing: '0.01em',
    },
    closeButton: {
      background: 'none', border: 'none', fontSize: '16px',
      cursor: 'pointer', color: t.TEXT_MUTED, padding: '2px 6px',
    },
    modalBody: { padding: '20px 22px' },
    modalFooter: {
      padding: '14px 22px', borderTop: `1px solid ${t.BORDER}`,
      display: 'flex', justifyContent: 'flex-end', gap: '10px',
    },
  };

  return (
    <div style={s.pageWrapper}>
      <div style={s.page}>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(18px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .note-card { animation: fadeUp 0.4s ease both; }
          .note-card:hover {
            transform: translateY(-2px) !important;
            border-color: ${ACCENT_BORDER} !important;
            box-shadow: 0 8px 32px rgba(29,185,84,0.08) !important;
          }
          .client-name-badge:hover {
            background: rgba(96,165,250,0.25) !important;
            box-shadow: 0 0 0 2px rgba(96,165,250,0.3);
          }
          .expand-triangle {
            display: inline-block;
            transition: transform 0.2s ease;
            font-size: 9px;
            margin-left: 4px;
            vertical-align: middle;
          }
          .expand-triangle.open { transform: rotate(90deg); }
        `}</style>

        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Notes</h1>
            <p style={s.subtitle}>{notes.length} total across {clients.length} clients</p>
          </div>
          {!showCompose && (
            <button style={s.addButton} onClick={() => setShowCompose(true)}>+ New Note</button>
          )}
        </div>

        {/* Compose form */}
        {showCompose && (
          <div style={s.composeCard}>
            <p style={s.composeTitle}>New Note</p>
            <div style={s.formRow}>
              <div style={{ ...s.formField, minWidth: '220px' }}>
                <label style={s.label}>Client *</label>
                <select name="client_id" value={formData.client_id} onChange={handleChange} style={s.input}>
                  <option value="">— Select client —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                  ))}
                </select>
              </div>
              <div style={s.formField}>
                <label style={s.label}>Type</label>
                <select name="note_type" value={formData.note_type} onChange={handleChange} style={s.input}>
                  {NOTE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ ...s.formField, flex: 2 }}>
                <label style={s.label}>Title *</label>
                <input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Q1 Review Meeting" style={s.input} />
              </div>
            </div>
            <textarea
              name="body"
              value={formData.body}
              onChange={handleChange}
              placeholder="Note content, key discussion points, action items..."
              style={s.textarea}
            />
            {error && <p style={s.errorText}>{error}</p>}
            <div style={s.composeFooter}>
              <button style={s.cancelButton} onClick={() => { setShowCompose(false); setError(''); setFormData(emptyForm); navigate('/hq/notes', { replace: true }); }}>
                Cancel
              </button>
              <button style={s.saveButton} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        )}

        {/* Notes list */}
        {loading ? (
          <div style={s.emptyState}>Loading notes...</div>
        ) : notes.length === 0 ? (
          <div style={s.emptyState}>No notes yet. Create your first note above.</div>
        ) : (
          grouped.map(([date, dateNotes]) => (
            <div key={date} style={s.dateGroup}>
              <p style={s.dateLabel}>{formatDateLabel(date)}</p>
              {dateNotes.map((note, i) => {
                const status = clientStatus(note.client_id);
                const isExpanded = expandedNotes[note.id];
                const bodyLines = note.body ? note.body.split('\n') : [];
                const isLong = note.body && (note.body.length > 80 || bodyLines.length > 1);
                return (
                  <div
                    key={note.id}
                    className="note-card"
                    style={{ ...s.noteCard, animationDelay: `${i * 60}ms`, transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease' }}
                  >
                    <div style={s.noteHeader}>
                      <span style={s.noteTitle}>{note.title}</span>
                      {note.note_type && <span style={s.noteTypeBadge}>{note.note_type}</span>}
                      <Link
                        to={`/hq/clients/${note.client_id}`}
                        state={{ from: '/hq/notes' }}
                        className="client-name-badge"
                        style={{
                          ...s.clientBadge,
                          backgroundColor: STATUS_COLORS?.[status]?.bg || 'rgba(96,165,250,0.12)',
                          color: STATUS_COLORS?.[status]?.color || '#60a5fa',
                          border: `1px solid ${STATUS_COLORS?.[status]?.color || '#60a5fa'}33`,
                        }}
                      >
                        {clientName(note.client_id)}
                      </Link>
                    </div>

                    {note.body && (
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{
                          maxHeight: isExpanded ? '600px' : '1.4em',
                          overflow: 'hidden',
                          transition: isExpanded ? 'max-height 0.35s ease-in-out' : 'max-height 0.3s ease-in-out',
                        }}>
                          <p style={{ ...s.noteBody, marginBottom: 0 }}>{note.body}</p>
                        </div>
                        <div style={{ height: '24px', display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                          {isLong && (
                            <button style={s.noteAction} onClick={() => toggleExpand(note.id)}>
                              {isExpanded ? 'Show less' : 'Read more'}
                              <span className={`expand-triangle${isExpanded ? ' open' : ''}`}>▶</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {!note.body && <div style={{ height: '58px' }} />}

                    <div style={s.noteActions}>
                      <button style={s.noteAction} onClick={() => openEdit(note)}>Edit</button>
                      <button style={{ ...s.noteAction, color: '#f87171' }} onClick={() => handleDelete(note.id)}>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}

        {/* Edit modal */}
        {editingNote && (
          <div style={s.overlay}>
            <div style={s.modal}>
              <div style={s.modalHeader}>
                <h2 style={s.modalTitle}>Edit Note</h2>
                <button style={s.closeButton} onClick={() => setEditingNote(null)}>✕</button>
              </div>
              <div style={s.modalBody}>
                <div style={{ ...s.formField, marginBottom: '12px' }}>
                  <label style={s.label}>Type</label>
                  <select value={editForm.note_type} onChange={(e) => setEditForm({ ...editForm, note_type: e.target.value })} style={s.input}>
                    {NOTE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ ...s.formField, marginBottom: '12px' }}>
                  <label style={s.label}>Title</label>
                  <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} style={s.input} />
                </div>
                <div style={s.formField}>
                  <label style={s.label}>Body</label>
                  <textarea value={editForm.body} onChange={(e) => setEditForm({ ...editForm, body: e.target.value })} style={{ ...s.textarea, marginBottom: 0 }} />
                </div>
              </div>
              <div style={s.modalFooter}>
                <button style={s.cancelButton} onClick={() => setEditingNote(null)}>Cancel</button>
                <button style={s.saveButton} onClick={handleEditSave}>Save Changes</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}