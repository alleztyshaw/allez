import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useOrg } from '../context/OrgContext';
import MeetingModal from '../components/MeetingModal';
import NotePicker from '../components/NotePicker';
import {
  ASSET_LEVEL_OPTIONS,
  COMMUNICATION_FREQUENCY_OPTIONS,
  CONTACT_METHOD_OPTIONS,
  FONT_BODY,
  FONT_DISPLAY,
  INVESTMENT_OBJECTIVE_OPTIONS,
  LIQUIDITY_NEEDS_OPTIONS,
  OVERLAY_BG,
  RADIUS_LG,
  RADIUS_MD,
  RADIUS_PILL,
  REFERRAL_SOURCE_OPTIONS,
  RISK_TOLERANCE_OPTIONS,
  SHADOW_MD,
  SHADOW_LG,
  STATUS_COLORS,
  STATUS_OPTIONS,
  TAX_BRACKET_OPTIONS,
  TIME_HORIZON_OPTIONS,
  FULL_ACCESS_ROLES,
  WRITE_ROLES,
  BRIEF_ROLES,
  CUSTODIAN_OPTIONS,
  aumToAssetLevel,
  MEETING_TYPES,
  MEETING_RECURRENCES,
  COLOR_ERROR,
  MOBILE_BREAKPOINT,
  FW_LIGHT, FW_REGULAR, FW_MEDIUM, FW_SEMIBOLD,
} from '../utils/hqConstants';
import { useTokens } from '../context/ThemeContext';
import useWindowWidth from '../hooks/useWindowWidth';


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

// ── Formatting helpers ───────────────────────────────────────────────────────

function formatAUM(val) {
  if (!val) return '—';
  const n = Number(val);
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function formatFeeRate(val) {
  if (val === null || val === undefined || val === '') return '—';
  return `${(Number(val) * 100).toFixed(2)}%`;
}

function formatEstRevenue(aum, fee_rate) {
  if (!aum || !fee_rate) return '—';
  const rev = Number(aum) * Number(fee_rate);
  if (rev >= 1_000_000) return `$${(rev / 1_000_000).toFixed(2)}M`;
  if (rev >= 1_000)     return `$${(rev / 1_000).toFixed(0)}K`;
  return `$${rev.toLocaleString()}`;
}

function stripAUMFormat(str) {
  return str.replace(/[$,]/g, '');
}

// ── MeetingRow ────────────────────────────────────────────────────────────────
// Extracted so each row can measure its own text overflow via a ref.
// Lives in this file to share all imported constants without prop-passing them.
function MeetingRow({ meeting, index, total, meetingCols, isMobile, canWrite, expandedMeetings, toggleMeeting, openEditMeeting, handleMeetingDelete, setViewNoteId, setNotePickerMeeting, handleUnlinkNote, t, s }) {
  const [overflows, setOverflows] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) setOverflows(textRef.current.scrollWidth > textRef.current.clientWidth);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isCancelled     = meeting.status === 'cancelled';
  const meetingDate     = new Date(meeting.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const meetingTime     = new Date(meeting.scheduled_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const typeLabel       = MEETING_TYPES.find(mt => mt.value === meeting.meeting_type)?.label || meeting.meeting_type;
  const recurrenceLabel = meeting.recurrence !== 'none' ? MEETING_RECURRENCES.find(r => r.value === meeting.recurrence)?.label || '—' : '—';
  const isExpanded      = expandedMeetings.has(meeting.id);
  const canExpand       = overflows || isExpanded;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: meetingCols, padding: '12px 16px', borderBottom: index < total - 1 ? `1px solid ${t.BORDER}` : 'none', alignItems: 'flex-start', background: t.SURFACE }}>
      {/* Description col */}
      <div
        onClick={canExpand ? () => toggleMeeting(meeting.id) : undefined}
        style={{ cursor: canExpand ? 'pointer' : 'default', display: 'flex', alignItems: 'flex-start', gap: '8px', paddingRight: '24px', minWidth: 0 }}
      >
        <div style={{ overflow: 'hidden', maxHeight: isExpanded ? '200px' : '1.4em', transition: 'max-height 0.25s ease', flex: 1, minWidth: 0 }}>
          <p ref={textRef} style={{ fontSize: '13px', fontWeight: FW_MEDIUM, color: isCancelled ? t.TEXT_SUBTLE : t.TEXT, margin: 0, textDecoration: isCancelled ? 'line-through' : 'none', whiteSpace: isExpanded ? 'normal' : 'nowrap', overflow: 'hidden', textOverflow: isExpanded ? 'unset' : 'ellipsis', lineHeight: 1.5 }}>
            {meetingDate} · {meetingTime} · {meeting.category}{meeting.description ? ` · ${meeting.description}` : ''}
          </p>
        </div>
        {canExpand && (
          <span style={{ display: 'inline-block', width: 0, height: 0, flexShrink: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: `5px solid ${t.TEXT_SUBTLE}`, transform: isExpanded ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'transform 0.2s ease', marginTop: '5px' }} />
        )}
      </div>
      {!isMobile && <span style={{ fontSize: '12px', fontWeight: FW_LIGHT, color: isCancelled ? t.TEXT_SUBTLE : t.TEXT_MUTED }}>{typeLabel}</span>}
      {!isMobile && <span style={{ fontSize: '12px', fontWeight: FW_LIGHT, color: isCancelled ? t.TEXT_SUBTLE : t.TEXT_MUTED }}>{recurrenceLabel}</span>}
      {canWrite ? (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={s.noteAction} onClick={() => openEditMeeting(meeting)}>Edit</button>
          <button style={{ ...s.noteAction, color: COLOR_ERROR }} onClick={() => handleMeetingDelete(meeting.id)}>Delete</button>
          {meeting.note_id ? (
            <>
              <button style={{ ...s.noteAction, color: t.ACCENT }} onClick={() => setViewNoteId(meeting.note_id)}>View Note</button>
              <button style={{ ...s.noteAction, color: t.TEXT_SUBTLE }} onClick={() => handleUnlinkNote(meeting.id)}>Unlink</button>
            </>
          ) : (
            <button style={s.noteAction} onClick={() => setNotePickerMeeting(meeting)}>Link Note</button>
          )}
        </div>
      ) : <span />}
    </div>
  );
}

export default function ClientDetail() {
  const t = useTokens();
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < MOBILE_BREAKPOINT;

  const s = {
    pageWrapper: { background: t.BG, minHeight: '100vh', width: '100%' },
    page: { maxWidth: '1200px', margin: '0 auto', padding: '120px 40px 80px', fontFamily: FONT_BODY, color: t.TEXT },
    loading: { background: t.BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.TEXT_MUTED, fontFamily: FONT_BODY },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
    backLink: { color: t.TEXT_MUTED, textDecoration: 'none', fontSize: '14px', fontWeight: FW_LIGHT },
    actionButtons: { display: 'flex', gap: '10px' },
    editButton: { background: t.ACCENT_MUTED, color: t.ACCENT, border: `1px solid ${t.ACCENT_BORDER}`, borderRadius: RADIUS_MD, padding: '8px 18px', fontSize: '13px', fontWeight: FW_SEMIBOLD, cursor: 'pointer', fontFamily: FONT_BODY },
    deleteButton: { background: 'transparent', color: t.TEXT_MUTED, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '8px 18px', fontSize: '13px', fontWeight: FW_MEDIUM, cursor: 'pointer', fontFamily: FONT_BODY },
    header: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' },
    headerText: { flex: 1 },
    name: { fontFamily: FONT_DISPLAY, fontSize: '40px', fontWeight: FW_LIGHT, margin: '0 0 4px', color: t.TEXT, letterSpacing: '0.01em', lineHeight: 1.1 },
    email: { fontSize: '14px', color: t.TEXT_MUTED, margin: '0 0 2px', fontWeight: FW_LIGHT },
    badge: { display: 'inline-block', padding: '4px 14px', borderRadius: RADIUS_PILL, fontSize: '11px', fontWeight: FW_SEMIBOLD, letterSpacing: '0.06em', textTransform: 'uppercase', marginLeft: 'auto' },
    divider: { height: '1px', background: `linear-gradient(to right, ${t.BORDER}, transparent)`, marginBottom: '36px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' },
    tabRow: { display: 'flex', gap: '4px', marginBottom: '28px', borderBottom: `1px solid ${t.BORDER}` },
    tab: { padding: '8px 20px', fontSize: '13px', fontWeight: FW_MEDIUM, fontFamily: FONT_BODY, cursor: 'pointer', background: 'none', border: 'none', borderBottom: '2px solid transparent', color: t.TEXT_MUTED, marginBottom: '-1px' },
    tabActive: { color: t.TEXT, borderBottom: `2px solid ${t.ACCENT}` },
    section: { background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, padding: '24px', boxShadow: SHADOW_MD },
    sectionLabel: { fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.ACCENT, margin: '0 0 16px' },
    fieldGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
    field: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
    fieldLabel: { fontSize: '13px', color: t.TEXT_MUTED, fontWeight: FW_REGULAR },
    fieldValue: { fontSize: '13px', color: t.TEXT, textAlign: 'right', fontWeight: FW_REGULAR },
    notesCard: { background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, padding: '24px', marginTop: '4px', boxShadow: SHADOW_MD },
    notesText: { fontSize: '14px', color: t.TEXT, lineHeight: '1.7', margin: 0, fontWeight: FW_LIGHT },
    overlay: { position: isMobile ? 'absolute' : 'fixed', inset: 0, background: OVERLAY_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
    modal: { background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, width: '100%', maxWidth: '680px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: SHADOW_LG },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${t.BORDER}` },
    modalTitle: { margin: 0, fontFamily: FONT_DISPLAY, fontSize: '24px', fontWeight: FW_REGULAR, color: t.TEXT, letterSpacing: '0.01em' },
    closeButton: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: t.TEXT_MUTED, padding: '4px 8px' },
    modalBody: { overflowY: 'auto', padding: '24px', flex: 1, background: t.SURFACE },
    formSectionLabel: { fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.ACCENT, margin: '20px 0 12px' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
    formField: { display: 'flex', flexDirection: 'column', gap: '4px' },
    label: { display: 'block', fontSize: '12px', fontWeight: FW_MEDIUM, color: t.TEXT_MUTED, letterSpacing: '0.02em', marginBottom: '6px' },
    input: { width: '100%', boxSizing: 'border-box', border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '8px 12px', fontSize: '14px', outline: 'none', color: t.TEXT, background: t.SURFACE_ALT, fontFamily: FONT_BODY },
    textarea: { width: '100%', border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '10px 12px', fontSize: '14px', minHeight: '80px', resize: 'vertical', outline: 'none', color: t.TEXT, background: t.SURFACE_ALT, fontFamily: FONT_BODY, boxSizing: 'border-box' },
    errorText: { color: COLOR_ERROR, fontSize: '13px', marginTop: '12px' },
    modalFooter: { padding: '16px 24px', borderTop: `1px solid ${t.BORDER}`, display: 'flex', justifyContent: 'flex-end', gap: '10px', background: t.SURFACE },
    cancelButton: { padding: '9px 20px', borderRadius: RADIUS_MD, border: `1px solid ${t.BORDER}`, background: 'transparent', fontSize: '14px', cursor: 'pointer', color: t.TEXT_MUTED, fontFamily: FONT_BODY },
    noteAction: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: t.TEXT_MUTED, padding: 0, fontFamily: FONT_BODY, textDecoration: 'underline', textUnderlineOffset: '2px' },
    saveButton: { padding: '9px 20px', borderRadius: RADIUS_MD, border: `1px solid ${t.ACCENT_BORDER}`, background: t.ACCENT_MUTED, color: t.ACCENT, fontSize: '14px', fontWeight: FW_SEMIBOLD, cursor: 'pointer', fontFamily: FONT_BODY },
    confirmModal: { background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, width: '100%', maxWidth: '420px', padding: '32px', boxShadow: SHADOW_LG },
    confirmTitle: { fontFamily: FONT_DISPLAY, fontSize: '24px', fontWeight: FW_REGULAR, color: t.TEXT, margin: '0 0 10px', letterSpacing: '0.01em' },
    confirmText: { fontSize: '14px', color: t.TEXT_MUTED, margin: '0 0 24px', lineHeight: '1.6', fontWeight: FW_LIGHT },
    confirmButtons: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
    confirmDeleteButton: { padding: '9px 20px', borderRadius: RADIUS_MD, border: `1px solid ${COLOR_ERROR}44`, background: 'transparent', color: COLOR_ERROR, fontSize: '14px', fontWeight: FW_SEMIBOLD, cursor: 'pointer', fontFamily: FONT_BODY },
  };

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { orgId, userId, userRole } = useOrg();
  const canWrite          = WRITE_ROLES.includes(userRole);
  const canManageAdvisors = FULL_ACCESS_ROLES.includes(userRole);
  const canGenerateBrief  = BRIEF_ROLES.includes(userRole);
  const backPath  = location.state?.from || '/hq/clients';
  const backLabel = backPath === '/hq/notes' ? '← Back to Notes' : backPath === '/hq/crm' ? '← Back to CRM' : '← Back to Clients';

  const initialTab = new URLSearchParams(location.search).get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [brief, setBrief]                       = useState(null);
  const [briefGenerating, setBriefGenerating]   = useState(false);
  const [briefError, setBriefError]             = useState('');
  const [client, setClient]                     = useState(null);
  const [loading, setLoading]                   = useState(true);
  const [showEdit, setShowEdit]                 = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [formData, setFormData]                 = useState({});
  const [saving, setSaving]                     = useState(false);
  const [deleting, setDeleting]                 = useState(false);
  const [error, setError]                       = useState('');
  const [clientNotes, setClientNotes]           = useState([]);
  const [clientTasks, setClientTasks]           = useState([]);
  const [meetings, setMeetings]                 = useState([]);
  const [meetingModal, setMeetingModal]         = useState(false);
  const [editingMeeting, setEditingMeeting]     = useState(null);
  const [notePickerMeeting, setNotePickerMeeting] = useState(null); // meeting to link a note to
  const [viewNoteId, setViewNoteId]               = useState(null); // note id to preview in modal
  const [expandedMeetings, setExpandedMeetings]   = useState(new Set());
  const toggleMeeting = (id) => setExpandedMeetings(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const [editingNote, setEditingNote]           = useState(null);
  const [editNoteForm, setEditNoteForm]         = useState({});
  const [advisors, setAdvisors]                 = useState([]);
  const [orgMembers, setOrgMembers]             = useState([]);
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);

  useEffect(() => {
    async function fetchClient() {
      const { data, error: fetchErr } = await supabase
        .from('clients').select('*')
        .eq('id', id).eq('org_id', orgId).is('deleted_at', null).single();
      if (fetchErr) console.error(fetchErr);
      else setClient(data);
      setLoading(false);
    }
    async function loadNotes() {
      const { data } = await supabase.from('notes').select('*')
        .eq('client_id', id).eq('org_id', orgId).is('deleted_at', null)
        .order('created_at', { ascending: false });
      setClientNotes(data || []);
    }
    async function loadTasks() {
      const { data } = await supabase.from('client_tasks').select('*')
        .eq('client_id', id).eq('org_id', orgId).is('deleted_at', null)
        .order('due_date', { ascending: true });
      setClientTasks(data || []);
    }
    async function loadMeetings() {
      const { data } = await supabase.from('meetings').select('*')
        .eq('client_id', id).eq('org_id', orgId).is('deleted_at', null)
        .order('scheduled_at', { ascending: true });
      setMeetings(data || []);
    }
    async function loadAdvisors() {
      const { data } = await supabase.from('client_advisors').select('id, user_id, is_primary')
        .eq('client_id', id).eq('org_id', orgId);
      if (!data) { setAdvisors([]); return; }
      const { data: members } = await supabase.rpc('get_org_members', { target_org_id: orgId });
      const memberMap = Object.fromEntries((members || []).map(m => [m.user_id, m]));
      setAdvisors(data.map(a => ({ ...a, ...memberMap[a.user_id] })));
    }
    async function loadOrgMembers() {
      const { data } = await supabase.rpc('get_org_members', { target_org_id: orgId });
      setOrgMembers(data || []);
    }
    if (orgId) {
      fetchClient(); loadNotes(); loadTasks(); loadMeetings();
      loadAdvisors(); loadOrgMembers(); fetchBrief();
    }
  }, [id, orgId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchBrief() {
    const { data } = await supabase.from('client_briefs').select('*').eq('client_id', id).single();
    if (data) setBrief(data);
  }

  async function refreshMeetings() {
    const { data } = await supabase.from('meetings').select('*')
      .eq('client_id', id).eq('org_id', orgId).is('deleted_at', null)
      .order('scheduled_at', { ascending: true });
    setMeetings(data || []);
  }

  function openNewMeeting() {
    setEditingMeeting(null);
    setMeetingModal(true);
  }

  function openEditMeeting(meeting) {
    setEditingMeeting(meeting);
    setMeetingModal(true);
  }

  async function handleMeetingDelete(meetingId) {
    await supabase.from('meetings').update({ deleted_at: new Date().toISOString() }).eq('id', meetingId);
    setMeetings(prev => prev.filter(m => m.id !== meetingId));
  }

  async function handleLinkNote(meetingId, noteId) {
    await supabase.from('meetings').update({ note_id: noteId }).eq('id', meetingId);
    setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, note_id: noteId } : m));
    setNotePickerMeeting(null);
  }

  async function handleUnlinkNote(meetingId) {
    await supabase.from('meetings').update({ note_id: null }).eq('id', meetingId);
    setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, note_id: null } : m));
  }

  // Read highlight param from URL — used when navigating from "View Note" on a meeting
  const [highlightNoteId] = useState(
    () => new URLSearchParams(location.search).get('highlight')
  );

  async function handleGenerateBrief() {
    if (!client) return;
    setBriefGenerating(true);
    setBriefError('');
    try {
      const memberNames = orgMembers.map(m => ({ user_id: m.user_id, first_name: m.first_name, last_name: m.last_name }));
      const res = await fetch('/api/prep-brief', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client, notes: clientNotes, tasks: clientTasks, org_member_names: memberNames }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBriefError(data.error || 'Brief generation failed. Please try again.');
      } else {
        const now = new Date().toISOString();
        const { error: upsertError } = await supabase.from('client_briefs').upsert(
          { client_id: id, org_id: orgId, body: data, generated_at: now, generated_by: userId, previous_generated_at: brief?.generated_at || null },
          { onConflict: 'client_id' }
        );
        if (upsertError) setBriefError('Brief generated but could not be saved. Please try again.');
        else setBrief({ body: data, generated_at: now });
      }
    } catch {
      setBriefError('Could not reach the processing service. Please try again.');
    }
    setBriefGenerating(false);
  }

  async function fetchNotes() {
    const { data } = await supabase.from('notes').select('*')
      .eq('client_id', id).eq('org_id', orgId).is('deleted_at', null)
      .order('created_at', { ascending: false });
    setClientNotes(data || []);
  }

  async function fetchAdvisors() {
    const { data } = await supabase.from('client_advisors').select('id, user_id, is_primary')
      .eq('client_id', id).eq('org_id', orgId);
    if (!data) { setAdvisors([]); return; }
    const { data: members } = await supabase.rpc('get_org_members', { target_org_id: orgId });
    const memberMap = Object.fromEntries((members || []).map(m => [m.user_id, m]));
    setAdvisors(data.map(a => ({ ...a, ...memberMap[a.user_id] })));
  }

  async function handleAssignAdvisor(advisorUserId) {
    const already = advisors.find(a => a.user_id === advisorUserId);
    if (already) return;
    const isPrimary = advisors.length === 0;
    await supabase.from('client_advisors').insert([{ org_id: orgId, client_id: id, user_id: advisorUserId, is_primary: isPrimary }]);
    fetchAdvisors();
  }

  async function handleRemoveAdvisor(advisorId) {
    await supabase.from('client_advisors').delete().eq('id', advisorId);
    fetchAdvisors();
  }

  async function handleSetPrimary(advisorId) {
    setAdvisors(prev => prev.map(a => ({ ...a, is_primary: a.id === advisorId })));
    const current = advisors.find(a => a.id !== advisorId && a.is_primary);
    if (current) await supabase.from('client_advisors').update({ is_primary: false }).eq('id', current.id);
    await supabase.from('client_advisors').update({ is_primary: true }).eq('id', advisorId);
  }

  function groupNotesByDate(notes) {
    const groups = {};
    notes.forEach(note => {
      const date = note.created_at.slice(0, 10);
      if (!groups[date]) groups[date] = [];
      groups[date].push(note);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }

  function formatDateLabel(dateStr) {
    const today     = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (dateStr === today)     return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
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
      title: editNoteForm.title, body: editNoteForm.body,
      note_type: editNoteForm.note_type, updated_at: new Date().toISOString(),
    }).eq('id', editingNote.id);
    setEditingNote(null);
    fetchNotes();
  }

  const [aumInput, setAumInput]         = useState('');
  const [feeRateInput, setFeeRateInput] = useState('');

  function openEdit() {
    setFormData({ ...client });
    setAumInput(client.aum ? Number(client.aum).toLocaleString('en-US') : '');
    setFeeRateInput(client.fee_rate !== null && client.fee_rate !== undefined ? (Number(client.fee_rate) * 100).toFixed(2) : '');
    setError('');
    setShowEdit(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'aum') {
      setAumInput(value);
      const raw = Number(stripAUMFormat(value));
      const derived = aumToAssetLevel(raw);
      setFormData(f => ({ ...f, aum: raw || null, asset_level: derived || f.asset_level }));
    } else if (name === 'fee_rate') {
      setFeeRateInput(value);
    } else {
      setFormData(f => ({ ...f, [name]: value }));
    }
  }

  function handleAumBlur() {
    const raw = Number(stripAUMFormat(aumInput));
    if (raw) setAumInput(raw.toLocaleString('en-US'));
  }

  function handleFeeRateBlur() {
    const pct = parseFloat(feeRateInput);
    if (!isNaN(pct)) {
      setFeeRateInput(pct.toFixed(2));
      setFormData(f => ({ ...f, fee_rate: pct / 100 }));
    } else {
      setFeeRateInput('');
      setFormData(f => ({ ...f, fee_rate: null }));
    }
  }

  async function handleSave() {
    if (!formData.first_name || !formData.last_name) {
      setError('First and last name are required.');
      return;
    }
    setSaving(true);
    setError('');
    const { id: _id, created_at, updated_at, org_id, deleted_at, ...payload } = formData;
    const { error: saveErr } = await supabase.from('clients').update(payload).eq('id', id);
    if (saveErr) {
      setError('Something went wrong. Please try again.');
      console.error(saveErr);
    } else {
      setClient({ ...formData });
      setShowEdit(false);
    }
    setSaving(false);
  }

  async function handleDelete() {
    setDeleting(true);
    const { error: delErr } = await supabase.from('clients').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (delErr) { console.error(delErr); setDeleting(false); }
    else navigate('/hq/clients');
  }

  if (loading) return <div style={s.loading}>Loading client...</div>;
  if (!client)  return <div style={s.loading}>Client not found.</div>;

  const fullName = `${client.first_name} ${client.last_name}`;

  return (
    <div style={s.pageWrapper}>
      <div style={s.page}>

        <div style={s.topRow}>
          <Link to={backPath} style={s.backLink}>{backLabel}</Link>
          <div style={s.actionButtons}>
            {canWrite && <button style={s.editButton} onClick={openEdit}>Edit Details</button>}
          </div>
        </div>

        <div style={s.header}>
          <div style={s.headerText}>
            <h1 style={s.name}>{fullName}</h1>
            {client.email && <p style={s.email}>{client.email}</p>}
            {client.phone && <p style={s.email}>{client.phone}</p>}
          </div>
          {client.status && (
            <span style={{ ...s.badge, backgroundColor: STATUS_COLORS?.[client.status]?.bg || t.ACCENT_MUTED, color: STATUS_COLORS?.[client.status]?.color || t.ACCENT }}>
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
              <button onClick={() => setShowAdvisorModal(true)} style={{ background: 'none', border: `1px solid ${t.ACCENT_BORDER}`, borderRadius: RADIUS_MD, padding: '3px 10px', fontSize: '12px', color: t.ACCENT, cursor: 'pointer', fontFamily: FONT_BODY }}>+ Assign</button>
            )}
          </div>
          {advisors.length === 0 ? (
            <p style={{ color: t.TEXT_MUTED, fontSize: '13px', fontWeight: FW_LIGHT }}>No advisors assigned yet.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', transition: 'all 0.3s ease' }}>
              {[...advisors].sort((a, b) => b.is_primary - a.is_primary).map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: a.is_primary ? t.ACCENT_MUTED : t.SURFACE, border: `1px solid ${a.is_primary ? t.ACCENT_BORDER : t.BORDER}`, borderRadius: RADIUS_MD, padding: '6px 12px', transition: 'all 0.3s ease' }}>
                  <span style={{ fontSize: '13px', color: t.TEXT }}>{a.first_name && a.last_name ? `${a.first_name} ${a.last_name}` : a.user_id.slice(0, 8) + '…'}</span>
                  {a.is_primary && <span style={{ fontSize: '10px', color: t.ACCENT, letterSpacing: '0.06em', fontWeight: FW_SEMIBOLD }}>Primary</span>}
                  {canManageAdvisors && !a.is_primary && <button onClick={() => handleSetPrimary(a.id)} style={{ background: 'none', border: 'none', fontSize: '11px', color: t.TEXT_MUTED, cursor: 'pointer', padding: 0 }}>Set primary</button>}
                  {canManageAdvisors && <button onClick={() => handleRemoveAdvisor(a.id)} style={{ background: 'none', border: 'none', fontSize: '11px', color: COLOR_ERROR, cursor: 'pointer', padding: 0 }}>✕</button>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assign Advisor Modal */}
        {showAdvisorModal && (
          <div style={{ position: 'fixed', inset: 0, background: OVERLAY_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
            <div style={{ background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, padding: '32px', width: '340px', boxShadow: SHADOW_LG }}>
              <h3 style={{ fontFamily: FONT_DISPLAY, fontWeight: FW_REGULAR, color: t.TEXT, fontSize: '22px', marginBottom: '20px' }}>Assign Advisor</h3>
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
                        <button onClick={() => handleAssignAdvisor(m.user_id)} style={{ background: t.ACCENT_MUTED, border: `1px solid ${t.ACCENT_BORDER}`, borderRadius: RADIUS_MD, padding: '4px 12px', fontSize: '12px', color: t.ACCENT, cursor: 'pointer', fontWeight: FW_SEMIBOLD, fontFamily: FONT_BODY }}>Assign</button>
                      )}
                    </div>
                  );
                })}
              </div>
              <button onClick={() => setShowAdvisorModal(false)} style={{ width: '100%', background: 'none', border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '10px', color: t.TEXT_MUTED, cursor: 'pointer', fontFamily: FONT_BODY }}>Done</button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={s.tabRow}>
          {['overview', 'meetings', 'brief', 'notes'].map(tab => (
            <button key={tab} style={{ ...s.tab, ...(activeTab === tab ? s.tabActive : {}) }} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Overview ──────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <>
            <div style={s.grid}>
              <Section title="Core Identity" s={s}>
                <Field label="Date of Birth"           value={client.date_of_birth}           s={s} />
                <Field label="Preferred Contact"       value={client.preferred_contact_method} s={s} />
                <Field label="Communication Frequency" value={client.communication_frequency}  s={s} />
              </Section>
              <Section title="Account Details" s={s}>
                <Field label="AUM"               value={formatAUM(client.aum)}                          s={s} />
                <Field label="Fee Rate"          value={formatFeeRate(client.fee_rate)}                 s={s} />
                <Field label="Est. Annual Revenue" value={formatEstRevenue(client.aum, client.fee_rate)} s={s} />
                <Field label="Custodian"         value={client.custodian || '—'}                        s={s} />
                {client.aum_source === 'api' && client.aum_synced_at && (
                  <div style={{ fontSize: '11px', color: t.TEXT_SUBTLE, fontWeight: FW_LIGHT, marginTop: '2px' }}>
                    Synced {new Date(client.aum_synced_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
              </Section>
              <Section title="Financial Profile" s={s}>
                <Field label="Asset Level"          value={client.asset_level}          s={s} />
                <Field label="Risk Tolerance"       value={client.risk_tolerance}        s={s} />
                <Field label="Investment Objective" value={client.investment_objective}  s={s} />
                <Field label="Time Horizon"         value={client.time_horizon}          s={s} />
                <Field label="Tax Bracket"          value={client.tax_bracket}           s={s} />
                <Field label="Liquidity Needs"      value={client.liquidity_needs}       s={s} />
              </Section>
              <Section title="Relationship" s={s}>
                {client.status === 'Prospect' && client.pipeline_stage && (
                  <Field label="Pipeline Stage" value={client.is_reactivation ? `${client.pipeline_stage} *` : client.pipeline_stage} s={s} />
                )}
                <Field label="Client Since"     value={client.client_since}     s={s} />
                <Field label="Referral Source"  value={client.referral_source}  s={s} />
                <Field label="Next Review Date" value={client.next_review_date} s={s} />
              </Section>
            </div>
            {client.notes && (
              <div style={s.notesCard}>
                <p style={s.sectionLabel}>Profile Notes</p>
                <p style={s.notesText}>{client.notes}</p>
              </div>
            )}
          </>
        )}

        {/* ── Meetings ──────────────────────────────────────────────────── */}
        {activeTab === 'meetings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <p style={{ ...s.sectionLabel, margin: 0 }}>Meetings ({meetings.length})</p>
              {canWrite && (
                <button style={{ padding: '7px 16px', borderRadius: RADIUS_MD, border: `1px solid ${t.ACCENT_BORDER}`, background: t.ACCENT_MUTED, color: t.ACCENT, fontSize: '12px', fontWeight: FW_SEMIBOLD, cursor: 'pointer', fontFamily: FONT_BODY }} onClick={openNewMeeting}>
                  + Schedule Meeting
                </button>
              )}
            </div>

            {meetings.length === 0 ? (
              <div style={{ ...s.notesCard, textAlign: 'center', padding: '40px 32px' }}>
                <p style={{ fontSize: '14px', color: t.TEXT, fontWeight: FW_REGULAR, margin: '0 0 6px' }}>No meetings yet</p>
                <p style={{ fontSize: '13px', color: t.TEXT_MUTED, fontWeight: FW_LIGHT, margin: 0 }}>Schedule a meeting to start building this client's history.</p>
              </div>
            ) : (
              <div style={{ border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, overflow: 'hidden' }}>
                {(() => {
                  const meetingCols = isMobile ? '1fr 190px' : '1fr 100px 120px 190px';
                  return (<>
                <div style={{ display: 'grid', gridTemplateColumns: meetingCols, padding: '9px 16px', background: t.SURFACE_ALT, borderBottom: `1px solid ${t.BORDER}` }}>
                  {['Meeting', ...(isMobile ? [] : ['Type', 'Recurrence']), 'Actions'].map(col => (
                    <span key={col} style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.TEXT_MUTED }}>{col}</span>
                  ))}
                </div>
                {meetings.map((meeting, i) => (
                  <MeetingRow
                    key={meeting.id}
                    meeting={meeting}
                    index={i}
                    total={meetings.length}
                    meetingCols={meetingCols}
                    isMobile={isMobile}
                    canWrite={canWrite}
                    expandedMeetings={expandedMeetings}
                    toggleMeeting={toggleMeeting}
                    openEditMeeting={openEditMeeting}
                    handleMeetingDelete={handleMeetingDelete}
                    setViewNoteId={setViewNoteId}
                    setNotePickerMeeting={setNotePickerMeeting}
                    handleUnlinkNote={handleUnlinkNote}
                    t={t}
                    s={s}
                  />
                ))}
                  </>);
                })()}
              </div>
            )}
          </div>
        )}

        {/* ── Brief ─────────────────────────────────────────────────────── */}
        {activeTab === 'brief' && (
          <div>
            {!brief && !briefGenerating && (
              <div style={{ ...s.notesCard, textAlign: 'center', padding: '40px 32px' }}>
                <p style={{ fontSize: '14px', color: t.TEXT, fontWeight: FW_REGULAR, margin: '0 0 8px' }}>No brief yet</p>
                <p style={{ fontSize: '13px', color: t.TEXT_MUTED, fontWeight: FW_LIGHT, margin: '0 0 24px', lineHeight: '1.6', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                  Generate an AI-powered summary of this client's relationship — drawing from recent meeting notes, open tasks, and key account details.
                </p>
                {canGenerateBrief ? (
                  <button style={{ padding: '10px 24px', borderRadius: RADIUS_MD, border: `1px solid ${t.ACCENT_BORDER}`, background: t.ACCENT_MUTED, color: t.ACCENT, fontSize: '13px', fontWeight: FW_SEMIBOLD, cursor: 'pointer', fontFamily: FONT_BODY }} onClick={handleGenerateBrief}>
                    Generate Brief
                  </button>
                ) : (
                  <p style={{ fontSize: '12px', color: t.TEXT_MUTED, fontStyle: 'italic' }}>Contact your advisor to generate a brief.</p>
                )}
              </div>
            )}
            {briefGenerating && <div style={{ textAlign: 'center', padding: '48px 0' }}><p style={{ color: t.TEXT_MUTED, fontSize: '13px', fontWeight: FW_LIGHT }}>Generating brief…</p></div>}
            {briefError && <p style={{ color: COLOR_ERROR, fontSize: '13px', margin: '0 0 16px' }}>{briefError}</p>}
            {brief && !briefGenerating && (() => {
              const b = brief.body;
              const generatedDate = brief.generated_at ? new Date(brief.generated_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : null;
              return (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    {generatedDate && <span style={{ fontSize: '11px', color: t.TEXT_MUTED, fontWeight: FW_LIGHT }}>Last updated {generatedDate}</span>}
                    {canGenerateBrief && <button style={{ background: 'none', border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '6px 14px', fontSize: '12px', color: t.TEXT_MUTED, cursor: 'pointer', fontFamily: FONT_BODY }} onClick={handleGenerateBrief} disabled={briefGenerating}>Update Brief</button>}
                  </div>
                  <div style={s.notesCard}>
                    {b.snapshot && (
                      <div style={{ marginBottom: (b.recent_meetings?.length || b.open_commitments?.length || b.relationship_notes?.length) ? '20px' : 0 }}>
                        <p style={{ ...s.sectionLabel, marginBottom: '8px' }}>Snapshot</p>
                        <p style={{ fontSize: '13px', color: t.TEXT, fontWeight: FW_LIGHT, lineHeight: '1.7', margin: 0 }}>{b.snapshot}</p>
                      </div>
                    )}
                    {b.recent_meetings?.length > 0 && (
                      <div style={{ marginBottom: (b.open_commitments?.length || b.relationship_notes?.length) ? '20px' : 0 }}>
                        {b.snapshot && <div style={{ borderTop: `1px solid ${t.BORDER}`, marginBottom: '20px' }} />}
                        <p style={{ ...s.sectionLabel, marginBottom: '10px' }}>Recent Meetings</p>
                        {b.recent_meetings.map((m, i) => <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: i < b.recent_meetings.length - 1 ? '8px' : 0 }}><span style={{ color: t.TEXT, flexShrink: 0, fontSize: '13px' }}>·</span><span style={{ fontSize: '13px', color: t.TEXT, fontWeight: FW_LIGHT, lineHeight: '1.6' }}>{m}</span></div>)}
                      </div>
                    )}
                    {b.open_commitments?.length > 0 && (
                      <div style={{ marginBottom: b.relationship_notes?.length ? '20px' : 0 }}>
                        {(b.snapshot || b.recent_meetings?.length) && <div style={{ borderTop: `1px solid ${t.BORDER}`, marginBottom: '20px' }} />}
                        <p style={{ ...s.sectionLabel, marginBottom: '10px' }}>Open Commitments</p>
                        {b.open_commitments.map((c, i) => <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: i < b.open_commitments.length - 1 ? '8px' : 0 }}><span style={{ color: t.TEXT, flexShrink: 0, fontSize: '13px' }}>·</span><span style={{ fontSize: '13px', color: t.TEXT, fontWeight: FW_LIGHT, lineHeight: '1.6' }}>{c}</span></div>)}
                      </div>
                    )}
                    {b.relationship_notes?.length > 0 && (
                      <div>
                        {(b.snapshot || b.recent_meetings?.length || b.open_commitments?.length) && <div style={{ borderTop: `1px solid ${t.BORDER}`, marginBottom: '20px' }} />}
                        <p style={{ ...s.sectionLabel, marginBottom: '10px' }}>Relationship Notes</p>
                        {b.relationship_notes.map((r, i) => <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: i < b.relationship_notes.length - 1 ? '8px' : 0 }}><span style={{ color: t.TEXT, flexShrink: 0, fontSize: '13px' }}>·</span><span style={{ fontSize: '13px', color: t.TEXT, fontWeight: FW_LIGHT, lineHeight: '1.6' }}>{r}</span></div>)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── Notes ─────────────────────────────────────────────────────── */}
        {activeTab === 'notes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ ...s.sectionLabel, margin: 0 }}>Notes ({clientNotes.length})</p>
              {canWrite && <button style={s.editButton} onClick={() => navigate(`/hq/notes?client_id=${id}`, { state: { from: `/hq/clients/${id}` } })}>+ Record Note</button>}
            </div>
            {clientNotes.length === 0 ? (
              <div style={{ ...s.notesCard, textAlign: 'center', color: t.TEXT_MUTED, fontSize: '14px' }}>
                No notes yet.{' '}
                {canWrite && <span style={{ color: t.ACCENT, cursor: 'pointer' }} onClick={() => navigate(`/hq/notes?client_id=${id}`, { state: { from: `/hq/clients/${id}` } })}>Add the first note →</span>}
              </div>
            ) : (
              groupNotesByDate(clientNotes).map(([date, dateNotes]) => (
                <div key={date} style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '11px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.TEXT_MUTED, marginBottom: '8px' }}>{formatDateLabel(date)}</p>
                  {dateNotes.map(note => (
                    <div
                      key={note.id}
                      id={`note-${note.id}`}
                      className={highlightNoteId === note.id ? 'note-highlight' : ''}
                      ref={el => { if (highlightNoteId === note.id && el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }}
                      style={{ ...s.notesCard, marginBottom: '10px', '--highlight-start': t.ACCENT_MUTED }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: note.body ? '8px' : '0', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: FONT_DISPLAY, fontSize: '17px', fontWeight: FW_REGULAR, color: t.TEXT, flex: 1, letterSpacing: '0.01em' }}>{note.title}</span>
                        {note.note_type && <span style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, padding: '2px 10px', borderRadius: RADIUS_PILL, background: t.ACCENT_MUTED, color: t.ACCENT, border: `1px solid ${t.ACCENT_BORDER}`, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{note.note_type}</span>}
                      </div>
                      {note.body && <p style={{ ...s.notesText, marginBottom: '10px' }}>{note.body}</p>}
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: t.TEXT_MUTED, padding: 0, fontFamily: FONT_BODY }} onClick={() => openEditNote(note)}>Edit</button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: COLOR_ERROR, padding: 0, fontFamily: FONT_BODY }} onClick={() => handleDeleteNote(note.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        )}

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
                  <select value={editNoteForm.note_type} onChange={e => setEditNoteForm({ ...editNoteForm, note_type: e.target.value })} style={s.input}>
                    {['Meeting', 'Call', 'Email', 'General'].map(tp => <option key={tp} value={tp}>{tp}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                  <label style={s.label}>Title</label>
                  <input value={editNoteForm.title} onChange={e => setEditNoteForm({ ...editNoteForm, title: e.target.value })} style={s.input} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={s.label}>Body</label>
                  <textarea value={editNoteForm.body || ''} onChange={e => setEditNoteForm({ ...editNoteForm, body: e.target.value })} style={{ ...s.input, minHeight: '100px', resize: 'vertical', fontFamily: FONT_BODY }} />
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
          <button style={s.deleteButton} onClick={() => setShowConfirmDelete(true)}>Delete Client</button>
        </div>

        {/* Edit Client Modal */}
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
                <p style={s.formSectionLabel}>Account Details</p>
                <div style={s.formGrid}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.TEXT_MUTED }}>AUM</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: t.TEXT_MUTED, fontSize: '13px', pointerEvents: 'none' }}>$</span>
                      <input name="aum" value={aumInput} onChange={handleChange} onBlur={handleAumBlur} placeholder="0" inputMode="numeric" style={{ ...s.input, paddingLeft: '22px' }} />
                    </div>
                    {formData.aum && <span style={{ fontSize: '11px', color: t.TEXT_SUBTLE, fontWeight: FW_LIGHT }}>Asset level: {aumToAssetLevel(formData.aum)}</span>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.TEXT_MUTED }}>Fee Rate</label>
                    <div style={{ position: 'relative' }}>
                      <input name="fee_rate" value={feeRateInput} onChange={handleChange} onBlur={handleFeeRateBlur} placeholder="1.00" inputMode="decimal" style={{ ...s.input, paddingRight: '26px' }} />
                      <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: t.TEXT_MUTED, fontSize: '13px', pointerEvents: 'none' }}>%</span>
                    </div>
                  </div>
                  <SelectField label="Custodian" name="custodian" value={formData.custodian || ''} onChange={handleChange} options={CUSTODIAN_OPTIONS} s={s} />
                </div>
                <p style={s.formSectionLabel}>Financial Profile</p>
                <div style={s.formGrid}>
                  <SelectField label="Asset Level"          name="asset_level"         value={formData.asset_level          || ''} onChange={handleChange} options={ASSET_LEVEL_OPTIONS}          s={s} />
                  <SelectField label="Risk Tolerance"       name="risk_tolerance"       value={formData.risk_tolerance       || ''} onChange={handleChange} options={RISK_TOLERANCE_OPTIONS}       s={s} />
                  <SelectField label="Investment Objective" name="investment_objective" value={formData.investment_objective || ''} onChange={handleChange} options={INVESTMENT_OBJECTIVE_OPTIONS} s={s} />
                  <SelectField label="Time Horizon"         name="time_horizon"         value={formData.time_horizon         || ''} onChange={handleChange} options={TIME_HORIZON_OPTIONS}         s={s} />
                  <SelectField label="Tax Bracket"          name="tax_bracket"          value={formData.tax_bracket          || ''} onChange={handleChange} options={TAX_BRACKET_OPTIONS}          s={s} />
                  <SelectField label="Liquidity Needs"      name="liquidity_needs"      value={formData.liquidity_needs      || ''} onChange={handleChange} options={LIQUIDITY_NEEDS_OPTIONS}      s={s} />
                </div>
                <p style={s.formSectionLabel}>Relationship</p>
                <div style={s.formGrid}>
                  <SelectField label="Referral Source"         name="referral_source"          value={formData.referral_source          || ''} onChange={handleChange} options={REFERRAL_SOURCE_OPTIONS}          s={s} />
                  <FormField   label="Client Since"            name="client_since"             type="date" value={formData.client_since || ''} onChange={handleChange} s={s} />
                  <FormField   label="Next Review Date"        name="next_review_date"         type="date" value={formData.next_review_date || ''} onChange={handleChange} s={s} />
                  <SelectField label="Preferred Contact"       name="preferred_contact_method" value={formData.preferred_contact_method || ''} onChange={handleChange} options={CONTACT_METHOD_OPTIONS}           s={s} />
                  <SelectField label="Communication Frequency" name="communication_frequency"  value={formData.communication_frequency  || ''} onChange={handleChange} options={COMMUNICATION_FREQUENCY_OPTIONS}  s={s} />
                </div>
                <p style={s.formSectionLabel}>Notes</p>
                <textarea name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Any additional context about this client..." style={s.textarea} />
                {error && <p style={s.errorText}>{error}</p>}
              </div>
              <div style={s.modalFooter}>
                <button style={s.cancelButton} onClick={() => setShowEdit(false)}>Cancel</button>
                <button style={s.saveButton} onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showConfirmDelete && (
          <div style={s.overlay}>
            <div style={s.confirmModal}>
              <h2 style={s.confirmTitle}>Delete {fullName}?</h2>
              <p style={s.confirmText}>This will permanently remove this client and all their data. This cannot be undone.</p>
              <div style={s.confirmButtons}>
                <button style={s.cancelButton} onClick={() => setShowConfirmDelete(false)}>Cancel</button>
                <button style={s.confirmDeleteButton} onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Yes, Delete'}</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Meeting Modal ───────────────────────────────────────────── */}
        <MeetingModal
          isOpen={meetingModal}
          onClose={() => { setMeetingModal(false); setEditingMeeting(null); }}
          onSaved={refreshMeetings}
          editingMeeting={editingMeeting}
          orgId={orgId}
          userId={userId}
          clientId={id}
          isMobile={isMobile}
        />

        {/* ── Note Picker ─────────────────────────────────────────────── */}
        <NotePicker
          isOpen={!!notePickerMeeting}
          onClose={() => setNotePickerMeeting(null)}
          onSelect={(noteId) => handleLinkNote(notePickerMeeting.id, noteId)}
          notes={clientNotes}
          meetingDate={notePickerMeeting?.scheduled_at}
        />

        {/* ── View Note Modal ──────────────────────────────────────────── */}
        {(() => {
          const viewNote = viewNoteId ? clientNotes.find(n => n.id === viewNoteId) : null;
          if (!viewNote) return null;
          return (
            <div style={{ position: 'fixed', inset: 0, background: OVERLAY_BG, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1100, padding: '340px 20px 20px' }}>
              <div style={{ background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, width: 'min(600px, calc(100vw - 40px))', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: SHADOW_LG }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 24px', borderBottom: `1px solid ${t.BORDER}`, flexShrink: 0, gap: '12px' }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: '0 0 6px', fontFamily: FONT_DISPLAY, fontSize: '22px', fontWeight: FW_REGULAR, color: t.TEXT, letterSpacing: '0.01em', lineHeight: 1.2 }}>{viewNote.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '12px', color: t.TEXT_MUTED, fontFamily: FONT_BODY, fontWeight: FW_LIGHT }}>
                        {new Date(viewNote.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                      {viewNote.note_type && (
                        <span style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, padding: '2px 8px', borderRadius: RADIUS_PILL, background: t.ACCENT_MUTED, color: t.ACCENT, border: `1px solid ${t.ACCENT_BORDER}`, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: FONT_BODY }}>
                          {viewNote.note_type}
                        </span>
                      )}
                    </div>
                  </div>
                  <button style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: t.TEXT_MUTED, padding: '4px 8px', flexShrink: 0 }} onClick={() => setViewNoteId(null)}>✕</button>
                </div>
                {/* Body */}
                <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>
                  {viewNote.body ? (
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: FW_LIGHT, color: t.TEXT, fontFamily: FONT_BODY, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{viewNote.body}</p>
                  ) : (
                    <p style={{ margin: 0, fontSize: '14px', color: t.TEXT_MUTED, fontFamily: FONT_BODY, fontWeight: FW_LIGHT, fontStyle: 'italic' }}>No note content recorded.</p>
                  )}
                </div>
                {/* Footer */}
                <div style={{ padding: '14px 24px', borderTop: `1px solid ${t.BORDER}`, flexShrink: 0, display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button style={{ background: 'none', border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '8px 16px', fontSize: '13px', color: t.TEXT_MUTED, cursor: 'pointer', fontFamily: FONT_BODY }} onClick={() => setViewNoteId(null)}>Close</button>
                </div>
              </div>
            </div>
          );
        })()}

        <style>{`
          @keyframes noteHighlight {
            0%   { background: ${t.ACCENT_MUTED}; box-shadow: 0 0 0 2px ${t.ACCENT_BORDER}; }
            100% { background: transparent; box-shadow: none; }
          }
          .note-highlight { animation: noteHighlight 2s ease forwards; }
        `}</style>

      </div>
    </div>
  );
}