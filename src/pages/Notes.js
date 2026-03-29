import { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
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
  AI_COLOR,
  AI_COLOR_MUTED,
  AI_COLOR_BORDER,
  FW_LIGHT, FW_REGULAR, FW_MEDIUM, FW_SEMIBOLD} from '../utils/hqConstants';
import { useTokens } from '../context/ThemeContext';
import useWindowWidth from '../hooks/useWindowWidth';

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
  const location = useLocation();
  const fromBrief = location.state?.from === '/hq/brief';
  const fromClient = location.state?.from?.startsWith('/hq/clients/');
  const backTo = fromBrief ? '/hq/brief' : fromClient ? location.state.from : null;
  const backLabel = fromBrief ? '← Back to Daily Brief' : fromClient ? '← Back to Client' : null;
  const { orgId } = useOrg();

  // Tab state — always default to Record
  const [activeTab, setActiveTab] = useState('record');

  // Core data
  const [notes, setNotes] = useState([]);
  const [clients, setClients] = useState([]);
  const [orgMembers, setOrgMembers] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Compose
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

  // Audio input
  const [inputMode, setInputMode]           = useState('paste'); // 'paste' | 'upload' | 'record'
  const [wasRecorded, setWasRecorded]       = useState(false);
  const [audioFile, setAudioFile]           = useState(null);
  const [audioTranscribing, setAudioTranscribing] = useState(false);
  const [audioError, setAudioError]         = useState('');
  const [recording, setRecording]           = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef   = useRef([]);
  const recordingTimerRef = useRef(null);
  const [pushedTasks, setPushedTasks] = useState(new Set());

  // Email draft modal
  const [emailNote, setEmailNote]           = useState(null);
  const [emailSalutation, setEmailSalutation] = useState('');
  const [emailSignOff, setEmailSignOff]     = useState('Best,');
  const [emailTone, setEmailTone]           = useState('professional');
  const [emailInclude, setEmailInclude]     = useState(['summary', 'decisions', 'action_items', 'follow_ups']);
  const [emailGenerating, setEmailGenerating] = useState(false);
  const [emailSubject, setEmailSubject]     = useState('');
  const [emailBody, setEmailBody]           = useState('');
  const [emailError, setEmailError]         = useState('');
  const [emailCopied, setEmailCopied]       = useState(false);
  const [emailDrafts, setEmailDrafts]       = useState({});

  // Note list
  const [editingNote, setEditingNote] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [expandedNotes, setExpandedNotes] = useState({});
  const [clientFilter, setClientFilter] = useState('');

  const canWrite = WRITE_ROLES.includes(userRole);

  function toggleExpand(noteId) {
    setExpandedNotes((prev) => ({ ...prev, [noteId]: !prev[noteId] }));
  }

  // Read pre-fill state from ClientDetail navigation
  useEffect(() => {
    const clientId = location.state?.clientId;
    const tab = location.state?.tab;
    if (clientId) {
      setFormData((f) => ({ ...f, client_id: clientId }));
      setClientFilter(clientId);
    }
    if (tab) setActiveTab(tab);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Resets compose form state — does not change tab
  function resetCompose() {
    setComposeMode('ai');
    setFormData(emptyForm);
    setAiTranscript('');
    setAiResult(null);
    setAiError('');
    setAiTitleOverride('');
    setShowTranscript(false);
    setError('');
    setPushedTasks(new Set());
    setInputMode('paste');
    setWasRecorded(false);
    setAudioFile(null);
    setAudioError('');
    stopRecording();
  }

  // ── Audio transcription ──────────────────────────────────────────────────────

  async function transcribeAudio(file, autoProcess = false) {
    setAudioTranscribing(true);
    setAudioError('');
    setAiTranscript('');
    try {
      const formData = new FormData();
      formData.append('audio', file);
      const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        setAudioError(data.error || 'Transcription failed. Please try again.');
      } else {
        setAiTranscript(data.transcript);
        if (autoProcess) {
          setAiProcessing(true);
          setAudioTranscribing(false);
          await handleAiProcessWithTranscript(data.transcript);
        } else {
          setInputMode('paste');
        }
      }
    } catch {
      setAudioError('Could not reach the transcription service. Please try again.');
    }
    setAudioTranscribing(false);
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioFile(file);
    setAudioError('');
  }

  async function handleFileTranscribe() {
    if (!audioFile) return;
    await transcribeAudio(audioFile);
  }

  async function startRecording() {
    setAudioError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const file = new File([blob], 'recording.webm', { type: mimeType });
        await transcribeAudio(file, true);
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setWasRecorded(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch {
      setAudioError('Microphone access denied. Please allow microphone access and try again.');
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setRecording(false);
    setRecordingSeconds(0);
  }

  async function handleSave() {
    if (!formData.title.trim()) { setError('Please enter a title.'); return; }
    setSaving(true); setError('');
    const { error } = await supabase.from('notes').insert([{
      client_id: formData.client_id || null,
      title: formData.title,
      body: formData.body,
      note_type: formData.note_type,
      source: 'manual',
      org_id: orgId,
    }]);
    if (error) { setError('Something went wrong. Please try again.'); console.error(error); }
    else { resetCompose(); fetchData(); setActiveTab('history'); }
    setSaving(false);
  }

  // ── AI processing ───────────────────────────────────────────────────────────

  async function handleAiProcess() {
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

  async function handleAiProcessWithTranscript(transcript) {
    setAiError('');
    setAiResult(null);

    const selectedClient = clients.find(c => c.id === formData.client_id);
    const clientFullName = selectedClient ? `${selectedClient.first_name} ${selectedClient.last_name}` : '';
    const memberNames = orgMembers
      .map(m => m.first_name && m.last_name ? `${m.first_name} ${m.last_name}` : null)
      .filter(Boolean);

    try {
      const response = await fetch('/api/process-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
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
    } catch {
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
      client_id: formData.client_id || null,
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
      compliance_flagged:    !!aiResult.compliance_flagged,
      compliance_severity:   aiResult.compliance_severity || null,
      compliance_reasons:    aiResult.compliance_reasons?.length ? aiResult.compliance_reasons : null,
      compliance_flagged_at: aiResult.compliance_flagged ? new Date().toISOString() : null,
    }]);
    if (error) {
      setAiError('Something went wrong saving the note. Please try again.');
      console.error(error);
    } else {
      resetCompose();
      fetchData();
      setActiveTab('history');
    }
    setSaving(false);
  }

  async function pushToTask(item, index, clientIdOverride) {
    const clientId = clientIdOverride || formData.client_id;
    if (!clientId || pushedTasks.has(index)) return;

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
    const saved = emailDrafts[note.id];
    setEmailNote(note);
    setEmailSalutation(saved?.salutation ?? (client?.first_name ? `Hi ${client.first_name},` : ''));
    setEmailSignOff(saved?.signOff ?? 'Best,');
    setEmailTone(saved?.tone ?? 'professional');
    setEmailInclude(saved?.include ?? ['summary', 'decisions', 'action_items', 'follow_ups']);
    setEmailSubject(saved?.subject ?? '');
    setEmailBody(saved?.body ?? '');
    setEmailError('');
    setEmailCopied(false);
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
        setEmailDrafts(prev => ({
          ...prev,
          [emailNote.id]: {
            subject: data.subject,
            body: data.body,
            salutation: emailSalutation,
            signOff: emailSignOff,
            tone: emailTone,
            include: emailInclude,
          },
        }));
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
    window.open(`mailto:${email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);
  }

  function openEdit(note) {
    setEditingNote(note);
    const aiSummary = parseAiSummary(note);
    setEditForm({
      title: note.title,
      body: note.body,
      note_type: note.note_type,
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
    composeCard: { background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, padding: '24px', marginBottom: '32px', boxShadow: SHADOW_MD },
    composeHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
    modeToggle: { display: 'flex', gap: '2px', background: t.SURFACE_ALT, borderRadius: RADIUS_MD, padding: '3px', border: `1px solid ${t.BORDER}` },
    modeTabActive: { padding: '5px 14px', fontSize: '12px', fontWeight: FW_SEMIBOLD, letterSpacing: '0.04em', borderRadius: '4px', border: 'none', cursor: 'pointer', fontFamily: FONT_BODY, background: t.ACCENT_MUTED, color: t.ACCENT },
    modeTabInactive: { padding: '5px 14px', fontSize: '12px', fontWeight: FW_SEMIBOLD, letterSpacing: '0.04em', borderRadius: '4px', border: 'none', cursor: 'pointer', fontFamily: FONT_BODY, background: 'transparent', color: t.TEXT_MUTED },
    aiBadge: { fontSize: '10px', fontWeight: FW_SEMIBOLD, letterSpacing: '0.08em', padding: '2px 8px', borderRadius: RADIUS_PILL, background: AI_COLOR_MUTED, color: AI_COLOR, border: `1px solid ${AI_COLOR_BORDER}`, textTransform: 'uppercase' },
    manualBadge: { fontSize: '10px', fontWeight: FW_SEMIBOLD, letterSpacing: '0.08em', padding: '2px 8px', borderRadius: RADIUS_PILL, background: t.SURFACE_ALT, color: t.TEXT_MUTED, border: `1px solid ${t.BORDER}`, textTransform: 'uppercase' },
    formRow: { display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' },
    formField: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '180px' },
    label: { fontSize: '12px', fontWeight: FW_MEDIUM, color: t.TEXT_MUTED, letterSpacing: '0.02em' },
    input: { border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '8px 12px', fontSize: '14px', outline: 'none', color: t.TEXT, background: t.SURFACE_ALT, fontFamily: FONT_BODY },
    textarea: { width: '100%', border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '10px 12px', fontSize: '14px', minHeight: '100px', resize: 'vertical', outline: 'none', color: t.TEXT, background: t.SURFACE_ALT, fontFamily: FONT_BODY, boxSizing: 'border-box', marginBottom: '12px' },
    transcriptArea: { width: '100%', border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '12px', fontSize: '13px', minHeight: '180px', resize: 'vertical', outline: 'none', color: t.TEXT, background: t.SURFACE_ALT, fontFamily: FONT_BODY, boxSizing: 'border-box', marginBottom: '12px', lineHeight: '1.6' },
    composeFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center', marginTop: '20px' },
    cancelButton: { padding: '10px 22px', borderRadius: RADIUS_MD, border: `1px solid ${t.BORDER}`, background: 'transparent', fontSize: '13px', cursor: 'pointer', color: t.TEXT_MUTED, fontFamily: FONT_BODY },
    saveButton: { padding: '10px 22px', borderRadius: RADIUS_MD, border: `1px solid ${t.ACCENT_BORDER}`, background: t.ACCENT_MUTED, color: t.ACCENT, fontSize: '13px', fontWeight: FW_SEMIBOLD, cursor: 'pointer', fontFamily: FONT_BODY },
    processButton: { padding: '10px 22px', borderRadius: RADIUS_MD, border: `1px solid ${AI_COLOR_BORDER}`, background: AI_COLOR_MUTED, color: AI_COLOR, fontSize: '13px', fontWeight: FW_SEMIBOLD, cursor: 'pointer', fontFamily: FONT_BODY },
    errorText: { color: '#f87171', fontSize: '13px', marginBottom: '10px' },
    resultCard: { background: t.SURFACE_ALT, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '20px', marginBottom: '16px' },
    resultSection: { marginBottom: '16px' },
    resultLabel: { fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.1em', color: AI_COLOR, marginBottom: '8px' },
    resultText: { fontSize: '14px', color: t.TEXT, lineHeight: '1.65', fontWeight: FW_LIGHT, margin: 0 },
    resultListItem: { fontSize: '13px', color: t.TEXT, lineHeight: '1.6', fontWeight: FW_LIGHT, padding: '5px 0', borderBottom: `1px solid ${t.BORDER}`, display: 'flex', gap: '8px' },
    resultBullet: { color: AI_COLOR, flexShrink: 0, fontSize: '12px', marginTop: '2px' },
    dateGroup: { marginBottom: '28px' },
    dateLabel: { fontSize: '11px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.TEXT_MUTED, marginBottom: '10px' },
    noteCard: { background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, padding: '18px 20px', marginBottom: '10px', boxShadow: SHADOW_MD },
    noteHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' },
    noteTitle: { fontFamily: FONT_DISPLAY, fontSize: '17px', fontWeight: FW_REGULAR, color: t.TEXT, flex: 1, letterSpacing: '0.01em' },
    noteTypeBadge: { fontSize: '11px', fontWeight: FW_REGULAR, color: t.TEXT_MUTED, letterSpacing: '0.03em' },
    noteAiBadge: { fontSize: '10px', fontWeight: FW_SEMIBOLD, padding: '2px 10px', borderRadius: RADIUS_PILL, background: AI_COLOR_MUTED, color: AI_COLOR, border: `1px solid ${AI_COLOR_BORDER}`, letterSpacing: '0.06em', textTransform: 'uppercase' },
    clientBadge: { fontSize: '11px', fontWeight: FW_SEMIBOLD, padding: '2px 10px', borderRadius: RADIUS_PILL, background: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: 'rgba(96,165,250,0.2)', textDecoration: 'none', transition: 'background 0.15s, box-shadow 0.15s' },
    noteBody: { fontSize: '14px', color: t.TEXT_MUTED, lineHeight: '1.65', margin: '0 0 10px', whiteSpace: 'pre-wrap', fontWeight: FW_LIGHT },
    noteActions: { display: 'flex', gap: '12px' },
    noteAction: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: t.TEXT_MUTED, padding: 0, fontFamily: FONT_BODY },
    aiSection: { marginBottom: '12px' },
    aiSectionLabel: { fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.08em', color: AI_COLOR, marginBottom: '6px' },
    aiSectionText: { fontSize: '13px', color: t.TEXT_MUTED, lineHeight: '1.6', fontWeight: FW_LIGHT, margin: 0 },
    aiListItem: { display: 'flex', gap: '8px', fontSize: '13px', color: t.TEXT_MUTED, lineHeight: '1.6', fontWeight: FW_LIGHT, marginBottom: '4px' },
    emptyState: { background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, padding: '48px', textAlign: 'center', color: t.TEXT_MUTED, fontSize: '14px', fontWeight: FW_LIGHT },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
    modal: { background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, width: '100%', maxWidth: '580px', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: `1px solid ${t.BORDER}` },
    modalTitle: { margin: 0, fontFamily: FONT_DISPLAY, fontSize: '22px', fontWeight: FW_REGULAR, color: t.TEXT, letterSpacing: '0.01em' },
    closeButton: { background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: t.TEXT_MUTED, padding: '2px 6px' },
    modalBody: { padding: '20px 22px' },
    modalFooter: { padding: '14px 22px', borderTop: `1px solid ${t.BORDER}`, display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  };

  // Tab button style helper
  function tabStyle(tab) {
    const isActive = activeTab === tab;
    return {
      padding: '8px 20px', fontSize: '13px', fontWeight: FW_MEDIUM,
      fontFamily: FONT_BODY, cursor: 'pointer', background: 'none', border: 'none',
      borderBottom: isActive ? `2px solid ${t.ACCENT}` : '2px solid transparent',
      color: isActive ? t.TEXT : t.TEXT_MUTED, marginBottom: '-1px',
    };
  }

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
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
          .expand-triangle { display: inline-block; width: 0; height: 0; border-top: 4px solid transparent; border-bottom: 4px solid transparent; border-left: 5px solid currentColor; transition: transform 0.2s ease; margin-left: 4px; vertical-align: middle; }
          .expand-triangle.open { transform: rotate(90deg); }
          .ai-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${AI_COLOR}; animation: aiPulse 1.2s ease-in-out infinite; margin: 0 2px; }
          .ai-dot:nth-child(2) { animation-delay: 0.2s; }
          .ai-dot:nth-child(3) { animation-delay: 0.4s; }
        `}</style>

        {backTo && (
          <Link to={backTo} style={{ color: t.TEXT_MUTED, textDecoration: 'none', fontSize: '14px', fontWeight: FW_LIGHT, display: 'inline-block', marginBottom: '20px' }}>
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
        </div>

        {/* Tab row */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', borderBottom: `1px solid ${t.BORDER}` }}>
          <button style={tabStyle('record')} onClick={() => setActiveTab('record')}>
            Record
          </button>
          <button style={tabStyle('history')} onClick={() => setActiveTab('history')}>
            History
          </button>
        </div>

        {/* ── Record tab ───────────────────────────────────────────────────── */}
        {activeTab === 'record' && (
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
                <label style={s.label}>Client <span style={{ fontWeight: FW_LIGHT, opacity: 0.7 }}>— optional, can link later</span></label>
                <select name="client_id" value={formData.client_id} onChange={handleChange} style={s.input}>
                  <option value="">— No client selected —</option>
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
                  <button style={s.cancelButton} onClick={resetCompose}>Reset</button>
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
                    {/* Input mode tabs */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                      {[
                        { key: 'paste', label: 'Paste text' },
                        { key: 'upload', label: 'Upload audio' },
                        { key: 'record', label: 'Record' },
                      ].map(tab => (
                        <button
                          key={tab.key}
                          onClick={() => { setInputMode(tab.key); setAudioError(''); }}
                          style={{
                            padding: '5px 14px', borderRadius: '6px', fontSize: '12px',
                            fontFamily: FONT_BODY, cursor: 'pointer', fontWeight: FW_MEDIUM,
                            border: `1px solid ${inputMode === tab.key ? t.ACCENT_BORDER : t.BORDER}`,
                            background: inputMode === tab.key ? t.ACCENT_MUTED : 'transparent',
                            color: inputMode === tab.key ? t.ACCENT : t.TEXT_MUTED,
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Paste mode */}
                    {inputMode === 'paste' && (
                      <>
                        <div style={{ marginBottom: '6px' }}>
                          <label style={s.label}>Transcript *</label>
                          <p style={{ fontSize: '11px', color: t.TEXT_MUTED, margin: '4px 0 8px', fontWeight: FW_LIGHT, lineHeight: '1.5' }}>
                            Paste your meeting transcript below. Client and advisor names are de-identified before processing — they never leave your infrastructure in identifiable form.
                          </p>
                        </div>
                        <textarea value={aiTranscript} onChange={e => setAiTranscript(e.target.value)} placeholder="Paste transcript here..." style={s.transcriptArea} />
                      </>
                    )}

                    {/* Upload mode */}
                    {inputMode === 'upload' && (
                      <div style={{ padding: '28px 24px', minHeight: '140px', border: `1px dashed ${t.BORDER}`, borderRadius: RADIUS_MD, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{ fontSize: '13px', color: t.TEXT_MUTED, margin: '0 0 16px', fontWeight: FW_LIGHT }}>
                          Supported formats: MP3, MP4, M4A, WAV, WEBM, OGG
                        </p>
                        <input
                          type="file"
                          accept="audio/*"
                          id="audio-upload"
                          style={{ display: 'none' }}
                          onChange={handleFileSelect}
                        />
                        <label
                          htmlFor="audio-upload"
                          style={{
                            display: 'inline-block', padding: '9px 20px',
                            border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD,
                            fontSize: '13px', color: t.TEXT_MUTED, cursor: 'pointer',
                            fontFamily: FONT_BODY, fontWeight: FW_MEDIUM,
                            marginBottom: audioFile ? '12px' : 0,
                          }}
                        >
                          Choose file
                        </label>
                        {audioFile && (
                          <div style={{ marginTop: '12px' }}>
                            <p style={{ fontSize: '13px', color: t.TEXT, margin: '0 0 12px', fontWeight: FW_LIGHT }}>
                              {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(1)} MB)
                            </p>
                            <button
                              style={{ ...s.saveButton, opacity: audioTranscribing ? 0.6 : 1 }}
                              onClick={handleFileTranscribe}
                              disabled={audioTranscribing}
                            >
                              {audioTranscribing ? 'Transcribing…' : 'Transcribe'}
                            </button>
                          </div>
                        )}
                        {audioTranscribing && (
                          <p style={{ fontSize: '12px', color: t.TEXT_MUTED, margin: '12px 0 0', fontWeight: FW_LIGHT }}>
                            This may take 30–90 seconds depending on file length…
                          </p>
                        )}
                        {audioError && <p style={{ color: '#f87171', fontSize: '12px', margin: '10px 0 0' }}>{audioError}</p>}
                      </div>
                    )}

                    {/* Record mode */}
                    {inputMode === 'record' && (
                      <div style={{ padding: '28px 24px', minHeight: '140px', border: `1px dashed ${t.BORDER}`, borderRadius: RADIUS_MD, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        {!recording && !audioTranscribing && (
                          <>
                            <p style={{ fontSize: '13px', color: t.TEXT_MUTED, margin: '0 0 18px', fontWeight: FW_LIGHT, lineHeight: '1.5' }}>
                              Hit stop when you're done — we'll process automatically.
                            </p>
                            <button
                              style={{
                                padding: '9px 20px', borderRadius: RADIUS_MD,
                                border: `1px solid ${AI_COLOR_BORDER}`,
                                background: AI_COLOR_MUTED, color: AI_COLOR,
                                fontSize: '13px', fontWeight: FW_SEMIBOLD,
                                cursor: 'pointer', fontFamily: FONT_BODY,
                              }}
                              onClick={startRecording}
                            >
                              Start recording
                            </button>
                          </>
                        )}
                        {recording && (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '18px' }}>
                              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f87171', animation: 'pulse 1.2s infinite' }} />
                              <span style={{ fontSize: '13px', color: t.TEXT, fontWeight: FW_REGULAR }}>
                                Recording — {Math.floor(recordingSeconds / 60)}:{String(recordingSeconds % 60).padStart(2, '0')}
                              </span>
                            </div>
                            <button
                              style={{
                                padding: '9px 20px', borderRadius: RADIUS_MD,
                                border: `1px solid rgba(248,113,113,0.4)`,
                                background: 'rgba(248,113,113,0.12)', color: '#f87171',
                                fontSize: '13px', fontWeight: FW_SEMIBOLD,
                                cursor: 'pointer', fontFamily: FONT_BODY,
                              }}
                              onClick={stopRecording}
                            >
                              Stop recording
                            </button>
                          </>
                        )}
                        {audioTranscribing && (
                          <div>
                            <div style={{ marginBottom: '12px' }}>
                              <span className="ai-dot" />
                              <span className="ai-dot" />
                              <span className="ai-dot" />
                            </div>
                            <p style={{ color: AI_COLOR, fontSize: '13px', fontWeight: FW_MEDIUM, margin: '0 0 4px' }}>Transcribing & processing</p>
                            <p style={{ color: t.TEXT_MUTED, fontSize: '11px', fontWeight: FW_LIGHT, margin: 0 }}>This may take 30–90 seconds…</p>
                          </div>
                        )}
                        {audioError && <p style={{ color: '#f87171', fontSize: '12px', margin: '10px 0 0' }}>{audioError}</p>}
                      </div>
                    )}
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
                    <p style={{ color: AI_COLOR, fontSize: '13px', fontWeight: FW_MEDIUM, margin: '0 0 4px' }}>Analysing transcript</p>
                    <p style={{ color: t.TEXT_MUTED, fontSize: '11px', fontWeight: FW_LIGHT, margin: 0 }}>De-identifying · Processing · Re-identifying</p>
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
                      <div style={{ background: t.SURFACE_ALT, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '12px', marginBottom: '12px', fontSize: '12px', color: t.TEXT_MUTED, lineHeight: '1.65', whiteSpace: 'pre-wrap', fontWeight: FW_LIGHT, maxHeight: '200px', overflowY: 'auto' }}>
                        {aiTranscript}
                      </div>
                    )}
                  </div>
                )}

                {aiError && <p style={s.errorText}>{aiError}</p>}

                <div style={s.composeFooter}>
                  <button style={s.cancelButton} onClick={resetCompose}>Reset</button>
                  {!aiResult && inputMode !== 'record' && !wasRecorded && (
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

        {/* ── History tab ──────────────────────────────────────────────────── */}
        {activeTab === 'history' && (
          <>
            {/* Client filter */}
            {clients.length > 0 && (
              <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <select value={clientFilter} onChange={e => setClientFilter(e.target.value)} style={{ ...s.input, maxWidth: '280px', padding: '8px 12px' }}>
                  <option value="">All clients</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.first_name} {c.last_name} ({noteCounts[c.id] || 0})</option>
                  ))}
                </select>
                {clientFilter && (
                  <button onClick={() => setClientFilter('')} style={{ ...s.cancelButton, padding: '6px 14px', fontSize: '12px' }}>
                    Clear
                  </button>
                )}
              </div>
            )}

            {/* Notes list */}
            {loading ? (
              <div style={s.emptyState}>Loading notes...</div>
            ) : notes.length === 0 ? (
              <div style={s.emptyState}>
                {clientFilter
                  ? `No notes found for ${clientName(clientFilter)}.`
                  : canWrite
                    ? 'No notes yet — head to the Record tab to capture your first meeting.'
                    : 'No notes yet.'}
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
                          {note.client_id ? (
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
                          ) : (
                            <span style={{ ...s.clientBadge, background: t.SURFACE_ALT, color: t.TEXT_MUTED, border: `1px solid ${t.BORDER}` }}>
                              Unlinked
                            </span>
                          )}
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
                                          <span style={{ color: AI_COLOR, flexShrink: 0 }}>·</span>
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
                                              <span style={{ color: AI_COLOR, flexShrink: 0 }}>·</span>
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
                                                fontWeight: FW_SEMIBOLD,
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
                                          <span style={{ color: AI_COLOR, flexShrink: 0 }}>·</span>
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
                              <button style={{ ...s.noteAction, color: t.ACCENT }} onClick={() => openEmailDraft(note)}>
                                {emailDrafts[note.id] ? 'Draft Email ·' : 'Draft Email'}
                              </button>
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
          </>
        )}

        {/* ── Edit modal — always accessible regardless of active tab ──────── */}
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
                      <label style={s.label}>Decisions <span style={{ fontWeight: FW_LIGHT, opacity: 0.7 }}>— one per line</span></label>
                      <textarea value={editForm.ai_decisions} onChange={e => setEditForm({ ...editForm, ai_decisions: e.target.value })} style={{ ...s.textarea, minHeight: '70px', marginBottom: 0 }} />
                    </div>
                    <div style={{ ...s.formField, marginBottom: '12px' }}>
                      <label style={s.label}>Action Items <span style={{ fontWeight: FW_LIGHT, opacity: 0.7 }}>— one per line, format: task · owner · due</span></label>
                      <textarea value={editForm.ai_action_items} onChange={e => setEditForm({ ...editForm, ai_action_items: e.target.value })} style={{ ...s.textarea, minHeight: '70px', marginBottom: 0 }} />
                    </div>
                    <div style={{ ...s.formField, marginBottom: '16px' }}>
                      <label style={s.label}>Follow-ups <span style={{ fontWeight: FW_LIGHT, opacity: 0.7 }}>— one per line</span></label>
                      <textarea value={editForm.ai_follow_ups} onChange={e => setEditForm({ ...editForm, ai_follow_ups: e.target.value })} style={{ ...s.textarea, minHeight: '60px', marginBottom: 0 }} />
                    </div>
                    <div style={{ background: t.SURFACE_ALT, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '10px 12px' }}>
                      <p style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.TEXT_MUTED, margin: '0 0 6px' }}>Original Transcript — read only</p>
                      <p style={{ fontSize: '12px', color: t.TEXT_MUTED, fontWeight: FW_LIGHT, lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap', maxHeight: '120px', overflowY: 'auto' }}>
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

                <p style={{ fontSize: '11px', color: t.TEXT_MUTED, fontStyle: 'italic', margin: '0 0 28px', fontWeight: FW_LIGHT, paddingLeft: '2px' }}>
                  For advisor review — please check before sending to client.
                </p>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', paddingLeft: '2px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ ...s.label, display: 'block', marginBottom: '6px' }}>Salutation</label>
                    <input style={s.input} value={emailSalutation} onChange={e => setEmailSalutation(e.target.value)} placeholder="Hi [Name]," />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ ...s.label, display: 'block', marginBottom: '6px' }}>Sign-off</label>
                    <input style={s.input} value={emailSignOff} onChange={e => setEmailSignOff(e.target.value)} placeholder="Best," />
                  </div>
                </div>

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
                          fontFamily: FONT_BODY, cursor: 'pointer', fontWeight: FW_MEDIUM,
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

                <div style={{ marginBottom: '28px', paddingLeft: '2px' }}>
                  <label style={{ ...s.label, display: 'block', marginBottom: '10px' }}>Include</label>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    {[
                      { value: 'summary', label: 'Summary' },
                      { value: 'decisions', label: 'Decisions' },
                      { value: 'action_items', label: 'Action Items' },
                      { value: 'follow_ups', label: 'Follow-ups' },
                    ].map(opt => (
                      <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: t.TEXT, fontWeight: FW_LIGHT }}>
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

                {emailBody && (
                  <div style={{ marginTop: '4px' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ ...s.label, display: 'block', marginBottom: '6px' }}>Subject</label>
                      <input
                        style={s.input}
                        value={emailSubject}
                        onChange={e => {
                          setEmailSubject(e.target.value);
                          setEmailDrafts(prev => ({ ...prev, [emailNote.id]: { ...prev[emailNote.id], subject: e.target.value } }));
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ ...s.label, display: 'block', marginBottom: '6px' }}>Body</label>
                      <textarea
                        style={{ ...s.textarea, minHeight: '220px' }}
                        value={emailBody}
                        onChange={e => {
                          setEmailBody(e.target.value);
                          setEmailDrafts(prev => ({ ...prev, [emailNote.id]: { ...prev[emailNote.id], body: e.target.value } }));
                        }}
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