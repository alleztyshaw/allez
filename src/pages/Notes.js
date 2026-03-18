import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useOrg } from '../context/OrgContext';
import {
  FONT_BODY,
  FONT_DISPLAY,
  RADIUS_LG,
  RADIUS_MD,
  RADIUS_PILL,
  SHADOW_MD,
  SHADOW_LG,
  STATUS_COLORS,
  WRITE_ROLES,
  pageStyles,
  MOBILE_BREAKPOINT,
} from '../utils/hqConstants';
import { useTokens } from '../context/ThemeContext';

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

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

function parseAiSummary(note) {
  if (!note.ai_summary) return null;
  try { return JSON.parse(note.ai_summary); } catch { return null; }
}

const emptyForm = { client_id: '', title: '', body: '', note_type: 'General' };

export default function Notes() {
  const t = useTokens();
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < MOBILE_BREAKPOINT;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromBrief = location.state?.from === '/hq/brief';
  const fromClient = location.state?.from?.startsWith('/hq/clients/');
  const backTo = fromBrief ? '/hq/brief' : fromClient ? location.state.from : null;
  const backLabel = fromBrief ? '← Back to Daily Brief' : fromClient ? '← Back to Client' : null;
  const { orgId } = useOrg();

  // Core data
  const [notes, setNotes] = useState([]);
  const [clients, setClients] = useState([]);
  const [orgMembers, setOrgMembers] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Compose
  const [showCompose, setShowCompose] = useState(false);
  const [composeMode, setComposeMode] = useState('ai'); // 'ai' | 'manual'
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // AI note-taker
  const [aiTranscript, setAiTranscript] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState('');
  const [aiTitleOverride, setAiTitleOverride] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [pushedTasks, setPushedTasks] = useState(new Set()); // indices of action items pushed to tasks

  // Email draft modal
  const [emailNote, setEmailNote]           = useState(null);   // note being drafted for
  const [emailSalutation, setEmailSalutation] = useState('');
  const [emailSignOff, setEmailSignOff]     = useState('Best,');
  const [emailTone, setEmailTone]           = useState('professional');
  const [emailInclude, setEmailInclude]     = useState(['summary', 'decisions', 'action_items', 'follow_ups']);
  const [emailGenerating, setEmailGenerating] = useState(false);
  const [emailSubject, setEmailSubject]     = useState('');
  const [emailBody, setEmailBody]           = useState('');
  const [emailError, setEmailError]         = useState('');
  const [emailCopied, setEmailCopied]       = useState(false);

  // Note list
  const [editingNote, setEditingNote] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [expandedNotes, setExpandedNotes] = useState({});
  const [clientFilter, setClientFilter] = useState('');

  const canWrite = WRITE_ROLES.includes(userRole);

  function toggleExpand(noteId) {
    setExpandedNotes((prev) => ({ ...prev, [noteId]: !prev[noteId] }));
  }

  useEffect(() => {
    const clientId = searchParams.get('client_id');
    if (clientId) {
      setFormData((f) => ({ ...f, client_id: clientId }));
      setShowCompose(true);
      setClientFilter(clientId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (orgId) fetchData();
  }, [orgId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchData() {
    const [{ data: notesData }, { data: clientsData }, { data: membersData }] = await Promise.all([
      supabase.from('notes').select('*').eq('org_id', orgId).is('deleted_at', null).order('created_at', { ascending: false }),
      supabase.from('clients').select('id, first_name, last_name, status, email').eq('org_id', orgId).is('deleted_at', null).order('last_name'),
      supabase.rpc('get_org_members', { target_org_id: orgId }),
    ]);
    setNotes(notesData || []);
    setClients(clientsData || []);
    setOrgMembers(membersData || []);
    const { data: { user } } = await supabase.auth.getUser();
    const me = (membersData || []).find(m => m.user_id === user?.id);
    setUserRole(me?.role || null);
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

  function resetCompose() {
    setShowCompose(false);
    setComposeMode('manual');
    setFormData(emptyForm);
    setAiTranscript('');
    setAiResult(null);
    setAiError('');
    setAiTitleOverride('');
    setShowTranscript(false);
    setError('');
    setPushedTasks(new Set());
    navigate('/hq/notes', { replace: true });
  }

  // ── Manual save ─────────────────────────────────────────────────────────────

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
    else { resetCompose(); fetchData(); }
    setSaving(false);
  }

  // ── AI processing ───────────────────────────────────────────────────────────

  async function handleAiProcess() {
    if (!formData.client_id) { setAiError('Please select a client.'); return; }
    if (!aiTranscript.trim()) { setAiError('Please paste a transcript to process.'); return; }
    setAiProcessing(true);
    setAiError('');
    setAiResult(null);

    const selectedClient = clients.find(c => c.id === formData.client_id);
    const clientFullName = selectedClient
      ? `${selectedClient.first_name} ${selectedClient.last_name}`
      : '';
    const memberNames = orgMembers
      .map(m => m.first_name && m.last_name ? `${m.first_name} ${m.last_name}` : null)
      .filter(Boolean);

    try {
      const response = await fetch('/api/process-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: aiTranscript,
          client_name: clientFullName,
          org_member_names: memberNames,
          note_type: formData.note_type,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setAiError(data.error || 'Processing failed. Please try again.');
      } else {
        setAiResult(data);
        setAiTitleOverride(data.title || '');
      }
    } catch (err) {
      console.error('AI process error:', err);
      setAiError('Could not reach the processing service. Please try again.');
    }
    setAiProcessing(false);
  }

  async function handleAiSave() {
    if (!aiResult) return;
    setSaving(true);
    setAiError('');
    const finalTitle = aiTitleOverride.trim() || aiResult.title || 'AI Note';
    const { error } = await supabase.from('notes').insert([{
      client_id: formData.client_id,
      title: finalTitle,
      body: aiTranscript,
      transcript: aiTranscript,
      ai_summary: JSON.stringify({
        summary: aiResult.summary,
        decisions: aiResult.decisions,
        action_items: aiResult.action_items,
        follow_ups: aiResult.follow_ups,
      }),
      note_type: formData.note_type,
      source: 'ai',
      org_id: orgId,
    }]);
    if (error) {
      setAiError('Something went wrong saving the note. Please try again.');
      console.error(error);
    } else {
      resetCompose();
      fetchData();
    }
    setSaving(false);
  }

  // Pushes a single action item from the AI result card into client_tasks
  // index can be a number (live result card) or string like "noteId-j" (saved notes)
  async function pushToTask(item, index, clientIdOverride) {
    const clientId = clientIdOverride || formData.client_id;
    if (!clientId || pushedTasks.has(index)) return;

    // Best-effort due date parsing — only use if the string looks like a real date
    let dueDate = null;
    if (item.due) {
      const parsed = new Date(item.due);
      if (!isNaN(parsed.getTime())) {
        dueDate = parsed.toISOString().split('T')[0];
      }
    }

    const { error } = await supabase.from('client_tasks').insert([{
      org_id: orgId,
      client_id: clientId,
      title: item.task,
      due_date: dueDate,
      completed: false,
    }]);

    if (!error) {
      setPushedTasks(prev => new Set([...prev, index]));
    }
  }

  // ── Email draft ─────────────────────────────────────────────────────────────

  function openEmailDraft(note) {
    const client = clients.find(c => c.id === note.client_id);
    setEmailNote(note);
    setEmailSalutation(client?.first_name ? `Hi ${client.first_name},` : '');
    setEmailSubject('');
    setEmailBody('');
    setEmailError('');
    setEmailCopied(false);
    setEmailInclude(['summary', 'decisions', 'action_items', 'follow_ups']);
    setEmailTone('professional');
    setEmailSignOff('Best,');
  }

  async function handleDraftEmail() {
    if (!emailNote) return;
    setEmailGenerating(true);
    setEmailError('');
    setEmailSubject('');
    setEmailBody('');

    const aiSummary = parseAiSummary(emailNote);
    const client = clients.find(c => c.id === emailNote.client_id);
    const clientFullName = client ? `${client.first_name} ${client.last_name}` : '';
    const advisor = orgMembers.find(m => m.user_id === emailNote.created_by);
    const advisorFullName = advisor ? `${advisor.first_name} ${advisor.last_name}` : '';

    try {
      const res = await fetch('/api/draft-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ai_summary: aiSummary,
          client_name: clientFullName,
          advisor_name: advisorFullName,
          salutation: emailSalutation,
          sign_off: emailSignOff,
          tone: emailTone,
          include: emailInclude,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailError(data.error || 'Draft generation failed. Please try again.');
      } else {
        setEmailSubject(data.subject);
        setEmailBody(data.body);
      }
    } catch {
      setEmailError('Could not reach the processing service. Please try again.');
    }
    setEmailGenerating(false);
  }

  function handleCopyEmail() {
    const full = `Subject: ${emailSubject}\n\n${emailBody}`;
    navigator.clipboard.writeText(full).then(() => {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2500);
    });
  }

  function handleMailto() {
    const client = clients.find(c => c.id === emailNote?.client_id);
    const email = client?.email || '';
    const params = new URLSearchParams();
    params.set('subject', emailSubject);
    params.set('body', emailBody);
    window.open(`mailto:${email}?${params.toString()}`);
  }

  function openEdit(note) {
    setEditingNote(note);
    const aiSummary = parseAiSummary(note);
    setEditForm({
      title: note.title,
      body: note.body,
      note_type: note.note_type,
      // AI fields — editable as plain text, re-serialised on save
      ai_summary_text: aiSummary?.summary || '',
      ai_decisions: aiSummary?.decisions?.join('\n') || '',
      ai_action_items: aiSummary?.action_items?.map(a =>
        [a.task, a.owner, a.due].filter(Boolean).join(' · ')
      ).join('\n') || '',
      ai_follow_ups: aiSummary?.follow_ups?.join('\n') || '',
    });
  }

  async function handleEditSave() {
    if (!editForm.title.trim()) return;
    const isAi = editingNote.source === 'ai';
    const update = {
      title: editForm.title,
      note_type: editForm.note_type,
      updated_at: new Date().toISOString(),
    };
    if (!isAi) {
      update.body = editForm.body;
    } else {
      // Re-serialise edited AI fields back into ai_summary JSON
      const decisions = editForm.ai_decisions.split('\n').map(s => s.trim()).filter(Boolean);
      const action_items = editForm.ai_action_items.split('\n').map(s => s.trim()).filter(Boolean).map(line => {
        const [task, owner, due] = line.split(' · ');
        return { task: task || '', owner: owner || null, due: due || null };
      });
      const follow_ups = editForm.ai_follow_ups.split('\n').map(s => s.trim()).filter(Boolean);
      update.ai_summary = JSON.stringify({
        summary: editForm.ai_summary_text,
        decisions,
        action_items,
        follow_ups,
      });
    }
    const { error } = await supabase.from('notes').update(update).eq('id', editingNote.id);
    if (!error) { setEditingNote(null); fetchData(); }
  }

  async function handleDelete(id) {
    await supabase.from('notes').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    fetchData();
  }

  const filteredNotes = clientFilter ? notes.filter(n => n.client_id === clientFilter) : notes;
  const noteCounts = notes.reduce((acc, n) => { acc[n.client_id] = (acc[n.client_id] || 0) + 1; return acc; }, {});
  const grouped = groupByDate(filteredNotes);

  // ── Styles ──────────────────────────────────────────────────────────────────

  const s = {
    ...pageStyles(t, isMobile),
    addButton: { background: 'transparent', color: t.ACCENT, border: `1px solid ${t.ACCENT_BORDER}`, borderRadius: RADIUS_MD, padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: FONT_BODY },
    composeCard: { background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, padding: '24px', marginBottom: '32px', boxShadow: SHADOW_MD },
    composeHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
    modeToggle: { display: 'flex', gap: '2px', background: t.SURFACE_ALT, borderRadius: RADIUS_MD, padding: '3px', border: `1px solid ${t.BORDER}` },
    modeTabActive: { padding: '5px 14px', fontSize: '12px', fontWeight: '600', letterSpacing: '0.04em', borderRadius: '4px', border: 'none', cursor: 'pointer', fontFamily: FONT_BODY, background: t.ACCENT_MUTED, color: t.ACCENT },
    modeTabInactive: { padding: '5px 14px', fontSize: '12px', fontWeight: '600', letterSpacing: '0.04em', borderRadius: '4px', border: 'none', cursor: 'pointer', fontFamily: FONT_BODY, background: 'transparent', color: t.TEXT_MUTED },
    aiBadge: { fontSize: '10px', fontWeight: '600', letterSpacing: '0.08em', padding: '2px 8px', borderRadius: RADIUS_PILL, background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)', textTransform: 'uppercase' },
    manualBadge: { fontSize: '10px', fontWeight: '600', letterSpacing: '0.08em', padding: '2px 8px', borderRadius: RADIUS_PILL, background: t.SURFACE_ALT, color: t.TEXT_MUTED, border: `1px solid ${t.BORDER}`, textTransform: 'uppercase' },
    formRow: { display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' },
    formField: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '180px' },
    label: { fontSize: '12px', fontWeight: '500', color: t.TEXT_MUTED, letterSpacing: '0.02em' },
    input: { border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '8px 12px', fontSize: '14px', outline: 'none', color: t.TEXT, background: t.SURFACE_ALT, fontFamily: FONT_BODY },
    textarea: { width: '100%', border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '10px 12px', fontSize: '14px', minHeight: '100px', resize: 'vertical', outline: 'none', color: t.TEXT, background: t.SURFACE_ALT, fontFamily: FONT_BODY, boxSizing: 'border-box', marginBottom: '12px' },
    transcriptArea: { width: '100%', border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '12px', fontSize: '13px', minHeight: '180px', resize: 'vertical', outline: 'none', color: t.TEXT, background: t.SURFACE_ALT, fontFamily: FONT_BODY, boxSizing: 'border-box', marginBottom: '12px', lineHeight: '1.6' },
    composeFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center' },
    cancelButton: { padding: '8px 18px', borderRadius: RADIUS_MD, border: `1px solid ${t.BORDER}`, background: 'transparent', fontSize: '13px', cursor: 'pointer', color: t.TEXT_MUTED, fontFamily: FONT_BODY },
    saveButton: { padding: '8px 18px', borderRadius: RADIUS_MD, border: `1px solid ${t.ACCENT_BORDER}`, background: t.ACCENT_MUTED, color: t.ACCENT, fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: FONT_BODY },
    processButton: { padding: '8px 20px', borderRadius: RADIUS_MD, border: '1px solid rgba(139,92,246,0.4)', background: 'rgba(139,92,246,0.12)', color: '#a78bfa', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: FONT_BODY },
    errorText: { color: '#f87171', fontSize: '13px', marginBottom: '10px' },
    resultCard: { background: t.SURFACE_ALT, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '20px', marginBottom: '16px' },
    resultSection: { marginBottom: '16px' },
    resultLabel: { fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a78bfa', marginBottom: '8px' },
    resultText: { fontSize: '14px', color: t.TEXT, lineHeight: '1.65', fontWeight: '300', margin: 0 },
    resultListItem: { fontSize: '13px', color: t.TEXT, lineHeight: '1.6', fontWeight: '300', padding: '5px 0', borderBottom: `1px solid ${t.BORDER}`, display: 'flex', gap: '8px' },
    resultBullet: { color: '#a78bfa', flexShrink: 0, fontSize: '12px', marginTop: '2px' },
    dateGroup: { marginBottom: '28px' },
    dateLabel: { fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: t.TEXT_MUTED, marginBottom: '10px' },
    noteCard: { background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, padding: '18px 20px', marginBottom: '10px', boxShadow: SHADOW_MD },
    noteHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' },
    noteTitle: { fontFamily: FONT_DISPLAY, fontSize: '17px', fontWeight: '400', color: t.TEXT, flex: 1, letterSpacing: '0.01em' },
    noteTypeBadge: { fontSize: '11px', fontWeight: '400', color: t.TEXT_MUTED, letterSpacing: '0.03em' },
    noteAiBadge: { fontSize: '10px', fontWeight: '600', padding: '2px 10px', borderRadius: RADIUS_PILL, background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)', letterSpacing: '0.06em', textTransform: 'uppercase' },
    clientBadge: { fontSize: '11px', fontWeight: '600', padding: '2px 10px', borderRadius: RADIUS_PILL, background: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: 'rgba(96,165,250,0.2)', textDecoration: 'none', transition: 'background 0.15s, box-shadow 0.15s' },
    noteBody: { fontSize: '14px', color: t.TEXT_MUTED, lineHeight: '1.65', margin: '0 0 10px', whiteSpace: 'pre-wrap', fontWeight: '300' },
    noteActions: { display: 'flex', gap: '12px' },
    noteAction: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: t.TEXT_MUTED, padding: 0, fontFamily: FONT_BODY },
    aiSection: { marginBottom: '12px' },
    aiSectionLabel: { fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a78bfa', marginBottom: '6px' },
    aiSectionText: { fontSize: '13px', color: t.TEXT_MUTED, lineHeight: '1.6', fontWeight: '300', margin: 0 },
    aiListItem: { display: 'flex', gap: '8px', fontSize: '13px', color: t.TEXT_MUTED, lineHeight: '1.6', fontWeight: '300', marginBottom: '4px' },
    emptyState: { background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, padding: '48px', textAlign: 'center', color: t.TEXT_MUTED, fontSize: '14px', fontWeight: '300' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
    modal: { background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, width: '100%', maxWidth: '580px', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: `1px solid ${t.BORDER}` },
    modalTitle: { margin: 0, fontFamily: FONT_DISPLAY, fontSize: '22px', fontWeight: '400', color: t.TEXT, letterSpacing: '0.01em' },
    closeButton: { background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: t.TEXT_MUTED, padding: '2px 6px' },
    modalBody: { padding: '20px 22px' },
    modalFooter: { padding: '14px 22px', borderTop: `1px solid ${t.BORDER}`, display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  };

  // ── JSX ─────────────────────────────────────────────────────────────────────

  return (
    <div style={s.pageWrapper}>
      <div style={s.page}>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
          @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes aiPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
          .note-card { animation: fadeUp 0.4s ease both; }
          .note-card:hover { transform: translateY(-2px) !important; box-shadow: ${SHADOW_LG} !important; }
          .client-name-badge:hover { background: rgba(96,165,250,0.25) !important; box-shadow: 0 0 0 2px rgba(96,165,250,0.3); }
          .push-task-btn:hover { border-color: ${t.ACCENT_BORDER} !important; color: ${t.ACCENT} !important; }
          .expand-triangle { display: inline-block; width: 0; height: 0; border-top: 4px solid transparent; border-bottom: 4px solid transparent; border-left: 5px solid currentColor; transition: transform 0.2s ease; margin-left: 4px; vertical-align: middle; }
          .expand-triangle.open { transform: rotate(90deg); }
          .ai-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #a78bfa; animation: aiPulse 1.2s ease-in-out infinite; margin: 0 2px; }
          .ai-dot:nth-child(2) { animation-delay: 0.2s; }
          .ai-dot:nth-child(3) { animation-delay: 0.4s; }
        `}</style>

        {backTo && (
          <Link to={backTo} style={{ color: t.TEXT_MUTED, textDecoration: 'none', fontSize: '14px', fontWeight: '300', display: 'inline-block', marginBottom: '20px' }}>
            {backLabel}
          </Link>
        )}

        {/* Page header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Notes</h1>
            <p style={s.subtitle}>
              {clientFilter
                ? `${filteredNotes.length} note${filteredNotes.length !== 1 ? 's' : ''} for ${clientName(clientFilter)}`
                : `${notes.length} total across ${clients.length} clients`}
            </p>
          </div>
          {!showCompose && canWrite && (
            <button style={s.addButton} onClick={() => setShowCompose(true)}>+ New Note</button>
          )}
        </div>

        {/* Client filter */}
        {!showCompose && clients.length > 0 && (
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select value={clientFilter} onChange={e => setClientFilter(e.target.value)} style={{ ...s.input, maxWidth: '280px', padding: '8px 12px' }}>
              <option value="">All clients</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.first_name} {c.last_name} ({noteCounts[c.id] || 0})</option>
              ))}
            </select>
            {clientFilter && (
              <button onClick={() => { setClientFilter(''); navigate('/hq/notes', { replace: true }); }} style={{ ...s.cancelButton, padding: '6px 14px', fontSize: '12px' }}>
                Clear
              </button>
            )}
          </div>
        )}

        {/* ── Compose card ─────────────────────────────────────────────────── */}
        {showCompose && canWrite && (
          <div style={s.composeCard}>

            {/* Mode toggle */}
            <div style={s.composeHeader}>
              <div style={s.modeToggle}>
                <button
                  style={composeMode === 'ai' ? s.modeTabActive : s.modeTabInactive}
                  onClick={() => { setComposeMode('ai'); setError(''); }}
                >
                  AI Note-Taker
                </button>
                <button
                  style={composeMode === 'manual' ? s.modeTabActive : s.modeTabInactive}
                  onClick={() => { setComposeMode('manual'); setAiResult(null); setAiError(''); }}
                >
                  Manual
                </button>
              </div>
              {composeMode === 'ai' && <span style={s.aiBadge}>Beta</span>}
            </div>

            {/* Shared fields */}
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
                  {NOTE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              {composeMode === 'manual' && (
                <div style={{ ...s.formField, flex: 2 }}>
                  <label style={s.label}>Title *</label>
                  <input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Q1 Review Meeting" style={s.input} />
                </div>
              )}
            </div>

            {/* ── Manual mode ────────────────────────────────────────────── */}
            {composeMode === 'manual' && (
              <>
                <textarea name="body" value={formData.body} onChange={handleChange} placeholder="Note content, key discussion points, action items..." style={s.textarea} />
                {error && <p style={s.errorText}>{error}</p>}
                <div style={s.composeFooter}>
                  <button style={s.cancelButton} onClick={resetCompose}>Cancel</button>
                  <button style={s.saveButton} onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Note'}</button>
                </div>
              </>
            )}

            {/* ── AI mode ────────────────────────────────────────────────── */}
            {composeMode === 'ai' && (
              <>
                {/* Transcript input — hidden once result is ready */}
                {!aiResult && !aiProcessing && (
                  <>
                    <div style={{ marginBottom: '6px' }}>
                      <label style={s.label}>Transcript *</label>
                      <p style={{ fontSize: '11px', color: t.TEXT_MUTED, margin: '4px 0 8px', fontWeight: '300', lineHeight: '1.5' }}>
                        Paste your meeting transcript below. Client and advisor names are de-identified before processing — they never leave your infrastructure in identifiable form.
                      </p>
                    </div>
                    <textarea value={aiTranscript} onChange={e => setAiTranscript(e.target.value)} placeholder="Paste transcript here..." style={s.transcriptArea} />
                  </>
                )}

                {/* Processing state */}
                {aiProcessing && (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ marginBottom: '14px' }}>
                      <span className="ai-dot" />
                      <span className="ai-dot" />
                      <span className="ai-dot" />
                    </div>
                    <p style={{ color: '#a78bfa', fontSize: '13px', fontWeight: '500', margin: '0 0 4px' }}>Analysing transcript</p>
                    <p style={{ color: t.TEXT_MUTED, fontSize: '11px', fontWeight: '300', margin: 0 }}>De-identifying · Processing · Re-identifying</p>
                  </div>
                )}

                {/* AI result */}
                {aiResult && !aiProcessing && (
                  <div style={{ animation: 'fadeUp 0.3s ease both' }}>
                    <div style={s.resultCard}>

                      {/* Editable title */}
                      <div style={s.resultSection}>
                        <p style={s.resultLabel}>Title</p>
                        <input value={aiTitleOverride} onChange={e => setAiTitleOverride(e.target.value)} style={{ ...s.input, width: '100%', boxSizing: 'border-box' }} />
                      </div>

                      {/* Summary */}
                      {aiResult.summary && (
                        <div style={s.resultSection}>
                          <p style={s.resultLabel}>Summary</p>
                          <p style={s.resultText}>{aiResult.summary}</p>
                        </div>
                      )}

                      {/* Decisions */}
                      {aiResult.decisions?.length > 0 && (
                        <div style={s.resultSection}>
                          <p style={s.resultLabel}>Decisions</p>
                          {aiResult.decisions.map((d, i) => (
                            <div key={i} style={{ ...s.resultListItem, borderBottom: i < aiResult.decisions.length - 1 ? `1px solid ${t.BORDER}` : 'none' }}>
                              <span style={s.resultBullet}>·</span>
                              <span>{d}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action items */}
                      {aiResult.action_items?.length > 0 && (
                        <div style={s.resultSection}>
                          <p style={s.resultLabel}>Action Items</p>
                          {aiResult.action_items.map((item, i) => (
                            <div key={i} style={{ ...s.resultListItem, borderBottom: i < aiResult.action_items.length - 1 ? `1px solid ${t.BORDER}` : 'none' }}>
                              <span style={s.resultBullet}>·</span>
                              <span>
                                {item.task}
                                {item.owner && <span style={{ color: t.TEXT_MUTED }}> · {item.owner}</span>}
                                {item.due && <span style={{ color: t.TEXT_MUTED }}> · {item.due}</span>}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Follow-ups */}
                      {aiResult.follow_ups?.length > 0 && (
                        <div style={{ ...s.resultSection, marginBottom: 0 }}>
                          <p style={s.resultLabel}>Follow-ups</p>
                          {aiResult.follow_ups.map((f, i) => (
                            <div key={i} style={{ ...s.resultListItem, borderBottom: i < aiResult.follow_ups.length - 1 ? `1px solid ${t.BORDER}` : 'none' }}>
                              <span style={s.resultBullet}>·</span>
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Show original transcript toggle */}
                    <button style={{ ...s.noteAction, fontSize: '12px', marginBottom: '12px' }} onClick={() => setShowTranscript(v => !v)}>
                      {showTranscript ? 'Hide' : 'Show'} original transcript
                      <span className={`expand-triangle${showTranscript ? ' open' : ''}`} />
                    </button>
                    {showTranscript && (
                      <div style={{ background: t.SURFACE_ALT, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '12px', marginBottom: '12px', fontSize: '12px', color: t.TEXT_MUTED, lineHeight: '1.65', whiteSpace: 'pre-wrap', fontWeight: '300', maxHeight: '200px', overflowY: 'auto' }}>
                        {aiTranscript}
                      </div>
                    )}
                  </div>
                )}

                {aiError && <p style={s.errorText}>{aiError}</p>}

                <div style={s.composeFooter}>
                  <button style={s.cancelButton} onClick={resetCompose}>Cancel</button>
                  {!aiResult && (
                    <button style={s.processButton} onClick={handleAiProcess} disabled={aiProcessing}>
                      {aiProcessing ? 'Processing...' : 'Process with AI'}
                    </button>
                  )}
                  {aiResult && (
                    <>
                      <button style={s.cancelButton} onClick={() => { setAiResult(null); setAiError(''); setShowTranscript(false); }}>Re-process</button>
                      <button style={s.saveButton} onClick={handleAiSave} disabled={saving}>{saving ? 'Saving...' : 'Save Note'}</button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Notes list ───────────────────────────────────────────────────── */}
        {loading ? (
          <div style={s.emptyState}>Loading notes...</div>
        ) : notes.length === 0 ? (
          <div style={s.emptyState}>
            {clientFilter ? `No notes found for ${clientName(clientFilter)}.` : 'No notes yet. Create your first note above.'}
          </div>
        ) : (
          grouped.map(([date, dateNotes]) => (
            <div key={date} style={s.dateGroup}>
              <p style={s.dateLabel}>{formatDateLabel(date)}</p>
              {dateNotes.map((note, i) => {
                const status = clientStatus(note.client_id);
                const isExpanded = expandedNotes[note.id];
                const aiSummary = parseAiSummary(note);
                const isAi = note.source === 'ai' && aiSummary;
                const previewText = isAi ? aiSummary.summary : note.body;
                const isLong = previewText && previewText.length > 80;

                return (
                  <div
                    key={note.id}
                    className="note-card"
                    style={{ ...s.noteCard, animationDelay: `${i * 60}ms`, transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease' }}
                  >
                    {/* Header */}
                    <div style={s.noteHeader}>
                      <span style={s.noteTitle}>{note.title}</span>
                      {!isAi && <span style={s.manualBadge}>Manual</span>}
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

                    {/* Preview / expanded content */}
                    {previewText && (
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{
                          maxHeight: isExpanded ? '2000px' : '1.4em',
                          overflow: 'hidden',
                          transition: isExpanded ? 'max-height 0.4s ease-in-out' : 'max-height 0.3s ease-in-out',
                        }}>
                          <p style={{ ...s.noteBody, marginBottom: 0 }}>{previewText}</p>

                          {/* AI structured sections shown on expand */}
                          {isAi && isExpanded && (
                            <div style={{ marginTop: '16px' }}>
                              {aiSummary.decisions?.length > 0 && (
                                <div style={s.aiSection}>
                                  <p style={s.aiSectionLabel}>Decisions</p>
                                  {aiSummary.decisions.map((d, j) => (
                                    <div key={j} style={s.aiListItem}>
                                      <span style={{ color: '#a78bfa', flexShrink: 0 }}>·</span>
                                      <span style={s.aiSectionText}>{d}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {aiSummary.action_items?.length > 0 && (
                                <div style={s.aiSection}>
                                  <p style={s.aiSectionLabel}>Action Items</p>
                                  {aiSummary.action_items.map((item, j) => {
                                    const key = `${note.id}-${j}`;
                                    const pushed = pushedTasks.has(key);
                                    return (
                                      <div key={j} style={{ ...s.aiListItem, justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                                          <span style={{ color: '#a78bfa', flexShrink: 0 }}>·</span>
                                          <span style={s.aiSectionText}>
                                            {item.task}
                                            {item.owner && <span style={{ opacity: 0.7 }}> · {item.owner}</span>}
                                            {item.due && <span style={{ opacity: 0.7 }}> · {item.due}</span>}
                                          </span>
                                        </div>
                                        <button
                                          className={pushed ? '' : 'push-task-btn'}
                                          onClick={() => pushToTask(item, key, note.client_id)}
                                          disabled={pushed}
                                          style={{
                                            flexShrink: 0,
                                            marginLeft: '12px',
                                            background: 'none',
                                            border: `1px solid ${pushed ? t.ACCENT_BORDER : t.BORDER}`,
                                            borderRadius: '6px',
                                            padding: '3px 10px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            color: pushed ? t.ACCENT : t.TEXT_MUTED,
                                            cursor: pushed ? 'default' : 'pointer',
                                            fontFamily: FONT_BODY,
                                            letterSpacing: '0.03em',
                                          }}
                                        >
                                          {pushed ? '✓ Added' : '+ Task'}
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                              {aiSummary.follow_ups?.length > 0 && (
                                <div style={{ ...s.aiSection, marginBottom: 0 }}>
                                  <p style={s.aiSectionLabel}>Follow-ups</p>
                                  {aiSummary.follow_ups.map((f, j) => (
                                    <div key={j} style={s.aiListItem}>
                                      <span style={{ color: '#a78bfa', flexShrink: 0 }}>·</span>
                                      <span style={s.aiSectionText}>{f}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div style={{ height: '24px', display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                          {(isAi || isLong) && (
                            <button style={s.noteAction} onClick={() => toggleExpand(note.id)}>
                              {isExpanded ? 'Show less' : isAi ? 'View full analysis' : 'Read more'}
                              <span className={`expand-triangle${isExpanded ? ' open' : ''}`} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {!previewText && <div style={{ height: '58px' }} />}

                    {canWrite && (
                      <div style={s.noteActions}>
                        {isAi && (
                          <button style={{ ...s.noteAction, color: t.ACCENT }} onClick={() => openEmailDraft(note)}>Draft Email</button>
                        )}
                        <button style={s.noteAction} onClick={() => openEdit(note)}>Edit</button>
                        <button style={{ ...s.noteAction, color: '#f87171' }} onClick={() => handleDelete(note.id)}>Delete</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}

        {/* ── Edit modal ───────────────────────────────────────────────────── */}
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
                    {NOTE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div style={{ ...s.formField, marginBottom: '12px' }}>
                  <label style={s.label}>Title</label>
                  <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} style={s.input} />
                </div>
                {editingNote.source !== 'ai' ? (
                  <div style={s.formField}>
                    <label style={s.label}>Body</label>
                    <textarea value={editForm.body} onChange={(e) => setEditForm({ ...editForm, body: e.target.value })} style={{ ...s.textarea, marginBottom: 0 }} />
                  </div>
                ) : (
                  <>
                    <div style={{ ...s.formField, marginBottom: '12px' }}>
                      <label style={s.label}>Summary</label>
                      <textarea value={editForm.ai_summary_text} onChange={e => setEditForm({ ...editForm, ai_summary_text: e.target.value })} style={{ ...s.textarea, minHeight: '70px', marginBottom: 0 }} />
                    </div>
                    <div style={{ ...s.formField, marginBottom: '12px' }}>
                      <label style={s.label}>Decisions <span style={{ fontWeight: '300', opacity: 0.7 }}>— one per line</span></label>
                      <textarea value={editForm.ai_decisions} onChange={e => setEditForm({ ...editForm, ai_decisions: e.target.value })} style={{ ...s.textarea, minHeight: '70px', marginBottom: 0 }} />
                    </div>
                    <div style={{ ...s.formField, marginBottom: '12px' }}>
                      <label style={s.label}>Action Items <span style={{ fontWeight: '300', opacity: 0.7 }}>— one per line, format: task · owner · due</span></label>
                      <textarea value={editForm.ai_action_items} onChange={e => setEditForm({ ...editForm, ai_action_items: e.target.value })} style={{ ...s.textarea, minHeight: '70px', marginBottom: 0 }} />
                    </div>
                    <div style={{ ...s.formField, marginBottom: '16px' }}>
                      <label style={s.label}>Follow-ups <span style={{ fontWeight: '300', opacity: 0.7 }}>— one per line</span></label>
                      <textarea value={editForm.ai_follow_ups} onChange={e => setEditForm({ ...editForm, ai_follow_ups: e.target.value })} style={{ ...s.textarea, minHeight: '60px', marginBottom: 0 }} />
                    </div>
                    <div style={{ background: t.SURFACE_ALT, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '10px 12px' }}>
                      <p style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: t.TEXT_MUTED, margin: '0 0 6px' }}>Original Transcript — read only</p>
                      <p style={{ fontSize: '12px', color: t.TEXT_MUTED, fontWeight: '300', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap', maxHeight: '120px', overflowY: 'auto' }}>
                        {editingNote.body || editingNote.transcript || '—'}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div style={s.modalFooter}>
                <button style={s.cancelButton} onClick={() => setEditingNote(null)}>Cancel</button>
                <button style={s.saveButton} onClick={handleEditSave}>Save Changes</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Email draft modal ────────────────────────────────────────────── */}
        {emailNote && (
          <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setEmailNote(null); }}>
            <div style={{ ...s.modal, maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={s.modalHeader}>
                <h2 style={s.modalTitle}>Draft Follow-up Email</h2>
                <button style={s.closeButton} onClick={() => setEmailNote(null)}>✕</button>
              </div>

              <div style={s.modalBody}>

                {/* For advisor review notice */}
                <p style={{ fontSize: '11px', color: t.TEXT_MUTED, fontStyle: 'italic', margin: '0 0 28px', fontWeight: '300', paddingLeft: '2px' }}>
                  For advisor review — please check before sending to client.
                </p>

                {/* Salutation + sign-off row */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', paddingLeft: '2px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ ...s.label, display: 'block', marginBottom: '6px' }}>Salutation</label>
                    <input
                      style={s.input}
                      value={emailSalutation}
                      onChange={e => setEmailSalutation(e.target.value)}
                      placeholder="Hi [Name],"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ ...s.label, display: 'block', marginBottom: '6px' }}>Sign-off</label>
                    <input
                      style={s.input}
                      value={emailSignOff}
                      onChange={e => setEmailSignOff(e.target.value)}
                      placeholder="Best,"
                    />
                  </div>
                </div>

                {/* Tone selector */}
                <div style={{ marginBottom: '24px', paddingLeft: '2px' }}>
                  <label style={{ ...s.label, display: 'block', marginBottom: '8px' }}>Tone</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                      { value: 'formal', label: 'Formal' },
                      { value: 'professional', label: 'Professional' },
                      { value: 'conversational', label: 'Conversational' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setEmailTone(opt.value)}
                        style={{
                          padding: '7px 16px', borderRadius: '6px', fontSize: '12px',
                          fontFamily: FONT_BODY, cursor: 'pointer', fontWeight: '500',
                          border: `1px solid ${emailTone === opt.value ? t.ACCENT_BORDER : t.BORDER}`,
                          background: emailTone === opt.value ? t.ACCENT_MUTED : 'transparent',
                          color: emailTone === opt.value ? t.ACCENT : t.TEXT_MUTED,
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content checkboxes */}
                <div style={{ marginBottom: '28px', paddingLeft: '2px' }}>
                  <label style={{ ...s.label, display: 'block', marginBottom: '10px' }}>Include</label>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    {[
                      { value: 'summary', label: 'Summary' },
                      { value: 'decisions', label: 'Decisions' },
                      { value: 'action_items', label: 'Action Items' },
                      { value: 'follow_ups', label: 'Follow-ups' },
                    ].map(opt => (
                      <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: t.TEXT, fontWeight: '300' }}>
                        <input
                          type="checkbox"
                          checked={emailInclude.includes(opt.value)}
                          onChange={e => setEmailInclude(prev =>
                            e.target.checked ? [...prev, opt.value] : prev.filter(v => v !== opt.value)
                          )}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Generate button */}
                {!emailBody && (
                  <button
                    style={{ ...s.saveButton, width: '100%', padding: '13px', fontSize: '14px', marginBottom: emailError ? '12px' : 0 }}
                    onClick={handleDraftEmail}
                    disabled={emailGenerating || emailInclude.length === 0}
                  >
                    {emailGenerating ? 'Generating…' : 'Generate Draft'}
                  </button>
                )}

                {emailError && (
                  <p style={{ color: '#f87171', fontSize: '13px', margin: '10px 0 0' }}>{emailError}</p>
                )}

                {/* Draft output */}
                {emailBody && (
                  <div style={{ marginTop: '4px' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ ...s.label, display: 'block', marginBottom: '6px' }}>Subject</label>
                      <input
                        style={s.input}
                        value={emailSubject}
                        onChange={e => setEmailSubject(e.target.value)}
                      />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ ...s.label, display: 'block', marginBottom: '6px' }}>Body</label>
                      <textarea
                        style={{ ...s.textarea, minHeight: '220px' }}
                        value={emailBody}
                        onChange={e => setEmailBody(e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button style={s.saveButton} onClick={handleCopyEmail}>
                        {emailCopied ? '✓ Copied' : 'Copy to clipboard'}
                      </button>
                      <button style={s.saveButton} onClick={handleMailto}>
                        Open in mail client
                      </button>
                      <button style={s.cancelButton} onClick={handleDraftEmail} disabled={emailGenerating}>
                        {emailGenerating ? 'Regenerating…' : 'Regenerate'}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}