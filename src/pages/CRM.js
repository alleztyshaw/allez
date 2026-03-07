import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useOrg } from '../context/OrgContext';
import {
  ACCENT, ACCENT_BORDER, ACCENT_MUTED,
  FONT_BODY, FONT_DISPLAY,
  RADIUS_LG, RADIUS_MD, RADIUS_PILL,
  SHADOW_MD, STATUS_COLORS,
} from '../utils/hqConstants';
import { useTokens } from '../context/ThemeContext';

const TABS = ['Tasks', 'Activity', 'Pipeline'];

const PIPELINE_STAGES = [
  { key: 'Prospect',  label: 'Prospect' },
  { key: 'Active',    label: 'Active'   },
  { key: 'Inactive',  label: 'Inactive' },
];

function formatAUM(val) {
  if (!val) return '—';
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000)     return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val}`;
}

function formatDate(str) {
  if (!str) return '—';
  return new Date(str + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatRelativeTime(isoStr) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  <  1) return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  <  7) return `${days}d ago`;
  return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isToday(dateStr) {
  if (!dateStr) return false;
  return dateStr === localToday();
}

function isDueSoon(dateStr) {
  if (!dateStr) return false;
  if (isToday(dateStr)) return false;
  const due = new Date(dateStr + 'T12:00:00');
  const today = new Date(localToday() + 'T00:00:00');
  const diff = due - today;
  return diff > 0 && diff < 3 * 86400000;
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  if (isToday(dateStr)) return false;
  return new Date(dateStr + 'T12:00:00') < new Date(localToday() + 'T00:00:00');
}

export default function CRM() {
  const t = useTokens();
  const navigate = useNavigate();
  const { orgId } = useOrg();

  const [tab, setTab] = useState('Tasks');
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Task form
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ client_id: '', title: '', due_date: '', notes: '' });
  const [taskSaving, setTaskSaving] = useState(false);
  const [taskError, setTaskError] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editTaskForm, setEditTaskForm] = useState({ title: '', due_date: '', client_id: '', notes: '' });
  const [editTaskSaving, setEditTaskSaving] = useState(false);

  const fetchData = useCallback(async () => {
    if (!orgId) return;
    const [{ data: c }, { data: tk }, { data: n }] = await Promise.all([
      supabase.from('clients').select('id, first_name, last_name, status, aum, fee_rate, next_review_date, custodian, aum_source, aum_synced_at').eq('org_id', orgId).is('deleted_at', null).order('last_name'),
      supabase.from('client_tasks').select('id, org_id, client_id, title, due_date, notes, completed, completed_at, created_at').eq('org_id', orgId).is('deleted_at', null).order('due_date', { ascending: true, nullsFirst: false }),
      supabase.from('notes').select('id, title, note_type, client_id, created_at').eq('org_id', orgId).is('deleted_at', null).order('created_at', { ascending: false }).limit(50),
    ]);
    setClients(c || []);
    setTasks(tk || []);
    setNotes(n || []);
    setLoading(false);
  }, [orgId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // BI summary
  const totalAUM = clients.reduce((sum, c) => sum + (c.aum || 0), 0);
  const estRevenue = clients.reduce((sum, c) => sum + (c.aum || 0) * (c.fee_rate || 0), 0);
  const activeClients = clients.filter(c => c.status === 'Active').length;
  const openTasks = tasks.filter(t => !t.completed).length;
  const overdueTaskCount = tasks.filter(t => !t.completed && isOverdue(t.due_date)).length;

  function clientName(id) {
    const c = clients.find(c => c.id === id);
    return c ? `${c.first_name} ${c.last_name}` : '—';
  }

  async function handleSaveTask() {
    if (!taskForm.title.trim()) { setTaskError('Please enter a task title.'); return; }
    setTaskSaving(true); setTaskError('');
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from('client_tasks').insert([{
      org_id: orgId,
      client_id: taskForm.client_id || null,
      title: taskForm.title,
      due_date: taskForm.due_date || null,
      notes: taskForm.notes || null,
      created_by: session?.user?.id,
    }]);
    if (error) { setTaskError('Something went wrong.'); }
    else {
      setTaskForm({ client_id: '', title: '', due_date: '' });
      setShowTaskForm(false);
      fetchData();
    }
    setTaskSaving(false);
  }

  async function handleCompleteTask(taskId) {
    await supabase.from('client_tasks').update({
      completed: true,
      completed_at: new Date().toISOString(),
    }).eq('id', taskId);
    fetchData();
  }

  async function handleDeleteTask(taskId) {
    await supabase.from('client_tasks').update({ deleted_at: new Date().toISOString() }).eq('id', taskId);
    fetchData();
  }

  function openEditTask(task) {
    setEditingTask(task);
    setEditTaskForm({ title: task.title, due_date: task.due_date || '', client_id: task.client_id || '', notes: task.notes || '' });
  }

  async function handleSaveEditTask() {
    if (!editTaskForm.title.trim()) return;
    setEditTaskSaving(true);
    const { error } = await supabase.from('client_tasks').update({
      title: editTaskForm.title,
      due_date: editTaskForm.due_date || null,
      client_id: editTaskForm.client_id || null,
      notes: editTaskForm.notes || null,
    }).eq('id', editingTask.id);
    if (!error) { setEditingTask(null); fetchData(); }
    setEditTaskSaving(false);
  }

  // Activity feed: merge notes + completed tasks, sort by recency
  const activityFeed = [
    ...notes.map(n => ({ type: 'note', id: n.id, label: n.title, sub: n.note_type, client_id: n.client_id, time: n.created_at })),
    ...tasks.filter(t => t.completed).map(t => ({ type: 'task', id: t.id, label: t.title, sub: 'Task completed', client_id: t.client_id, time: t.completed_at })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 40);

  const s = {
    pageWrapper: { background: t.BG, minHeight: '100vh', width: '100%' },
    page: { maxWidth: '1200px', margin: '0 auto', padding: '120px 40px 80px', fontFamily: FONT_BODY, color: t.TEXT },
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' },
    title: { fontFamily: FONT_DISPLAY, fontSize: '44px', fontWeight: '300', color: t.TEXT, margin: '0 0 6px', letterSpacing: '0.01em', lineHeight: 1.1 },
    subtitle: { fontSize: '13px', color: t.TEXT_MUTED, margin: 0, fontWeight: '300' },
    addButton: { background: 'transparent', color: ACCENT, border: `1px solid ${ACCENT_BORDER}`, borderRadius: RADIUS_MD, padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: FONT_BODY },

    // BI bar
    biBar: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '32px' },
    biCard: { background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, padding: '18px 20px', boxShadow: SHADOW_MD },
    biLabel: { fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: t.TEXT_MUTED, margin: '0 0 6px' },
    biValue: { fontSize: '22px', fontWeight: '300', fontFamily: FONT_DISPLAY, color: t.TEXT, margin: 0, letterSpacing: '0.01em' },
    biSub: { fontSize: '11px', color: t.TEXT_SUBTLE, margin: '4px 0 0', fontWeight: '300' },

    // Tabs
    tabRow: { display: 'flex', gap: '4px', marginBottom: '28px', borderBottom: `1px solid ${t.BORDER}`, paddingBottom: '0' },
    tab: (active) => ({
      padding: '10px 20px', fontSize: '13px', fontWeight: '500',
      color: active ? ACCENT : t.TEXT_MUTED,
      background: 'none', border: 'none', cursor: 'pointer',
      borderBottom: active ? `2px solid ${ACCENT}` : '2px solid transparent',
      marginBottom: '-1px', fontFamily: FONT_BODY,
      transition: 'color 0.15s',
    }),

    // Pipeline table
    tableWrap: { border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, overflow: 'hidden', boxShadow: SHADOW_MD },
    tableHead: { display: 'grid', gridTemplateColumns: '1fr 110px 110px 120px 110px', padding: '10px 20px', background: t.SURFACE_ALT, borderBottom: `1px solid ${t.BORDER}` },
    tableHeadCell: { fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: t.TEXT_MUTED },
    tableRow: { display: 'grid', gridTemplateColumns: '1fr 110px 110px 120px 110px', padding: '14px 20px', borderBottom: `1px solid ${t.BORDER}`, background: t.SURFACE, cursor: 'pointer', transition: 'background 0.15s' },
    tableCell: { fontSize: '13px', color: t.TEXT, display: 'flex', alignItems: 'center' },
    tableCellMuted: { fontSize: '12px', color: t.TEXT_MUTED, display: 'flex', alignItems: 'center', fontWeight: '300' },

    // Tasks
    taskCard: { background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, padding: '16px 20px', marginBottom: '10px', boxShadow: SHADOW_MD, display: 'flex', alignItems: 'center', gap: '14px' },
    taskCheck: { width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${t.BORDER}`, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.15s' },
    taskTitle: { flex: 1, fontSize: '14px', color: t.TEXT, margin: 0, fontWeight: '400' },
    taskMeta: { fontSize: '11px', color: t.TEXT_MUTED, margin: '3px 0 0', fontWeight: '300' },
    dueBadge: (today, soon, overdue) => ({
      fontSize: '10px', fontWeight: '600', padding: '2px 10px',
      borderRadius: RADIUS_PILL,
      background: overdue ? 'rgba(248,113,113,0.12)' : today ? ACCENT_MUTED : soon ? 'rgba(251,191,36,0.12)' : 'rgba(96,165,250,0.12)',
      color: overdue ? '#f87171' : today ? ACCENT : soon ? '#fbbf24' : '#60a5fa',
      border: `1px solid ${overdue ? 'rgba(248,113,113,0.3)' : today ? ACCENT_BORDER : soon ? 'rgba(251,191,36,0.3)' : 'rgba(96,165,250,0.3)'}`,
      flexShrink: 0,
    }),
    deleteAction: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: t.TEXT_SUBTLE, padding: 0, fontFamily: FONT_BODY },

    // Task form
    formCard: { background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, padding: '20px 24px', marginBottom: '20px', boxShadow: SHADOW_MD },
    formRow: { display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' },
    formField: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '160px' },
    label: { fontSize: '12px', fontWeight: '500', color: t.TEXT_MUTED },
    input: { border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '8px 12px', fontSize: '14px', outline: 'none', color: t.TEXT, background: t.SURFACE_ALT, fontFamily: FONT_BODY },
    formFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
    cancelButton: { padding: '8px 18px', borderRadius: RADIUS_MD, border: `1px solid ${t.BORDER}`, background: 'transparent', fontSize: '13px', cursor: 'pointer', color: t.TEXT_MUTED, fontFamily: FONT_BODY },
    saveButton: { padding: '8px 18px', borderRadius: RADIUS_MD, border: `1px solid ${ACCENT_BORDER}`, background: ACCENT_MUTED, color: ACCENT, fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: FONT_BODY },

    // Activity
    activityCard: { background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, padding: '14px 20px', marginBottom: '8px', boxShadow: SHADOW_MD, display: 'flex', alignItems: 'center', gap: '14px' },
    activityDot: (type) => ({ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: type === 'note' ? ACCENT : '#60a5fa' }),
    activityLabel: { flex: 1, fontSize: '14px', color: t.TEXT, margin: 0 },
    activitySub: { fontSize: '11px', color: t.TEXT_MUTED, margin: '2px 0 0', fontWeight: '300' },
    activityTime: { fontSize: '11px', color: t.TEXT_SUBTLE, flexShrink: 0, fontWeight: '300' },

    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
    modal: { background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, width: '100%', maxWidth: '580px', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: `1px solid ${t.BORDER}` },
    modalTitle: { margin: 0, fontFamily: FONT_DISPLAY, fontSize: '22px', fontWeight: '400', color: t.TEXT, letterSpacing: '0.01em' },
    closeButton: { background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: t.TEXT_MUTED, padding: '2px 6px' },
    modalBody: { padding: '20px 22px' },
    modalFooter: { padding: '14px 22px', borderTop: `1px solid ${t.BORDER}`, display: 'flex', justifyContent: 'flex-end', gap: '10px' },
    emptyState: { background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, padding: '48px', textAlign: 'center', color: t.TEXT_MUTED, fontSize: '14px', fontWeight: '300' },
    errorText: { color: '#f87171', fontSize: '12px', marginBottom: '8px' },
    sectionLabel: { fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: t.TEXT_MUTED, margin: '0 0 12px' },
  };

  return (
    <div style={s.pageWrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        .task-check:hover { border-color: ${ACCENT} !important; }
      `}</style>
      <div style={s.page}>

        {/* Header */}
        <div style={s.pageHeader}>
          <div>
            <h1 style={s.title}>CRM</h1>
            <p style={s.subtitle}>{activeClients} active clients · {openTasks} open task{openTasks !== 1 ? 's' : ''}{overdueTaskCount > 0 ? ` · ${overdueTaskCount} overdue` : ''}</p>
          </div>
          {tab === 'Tasks' && (
            <button style={s.addButton} onClick={() => setShowTaskForm(v => !v)}>
              {showTaskForm ? 'Cancel' : '+ New Task'}
            </button>
          )}
        </div>

        {/* BI Summary Bar */}
        <div style={s.biBar}>
          <div style={s.biCard}>
            <p style={s.biLabel}>Total AUM</p>
            <p style={s.biValue}>{formatAUM(totalAUM)}</p>
            <p style={s.biSub}>{clients.filter(c => c.aum).length} clients reporting</p>
          </div>
          <div style={s.biCard}>
            <p style={s.biLabel}>Est. Annual Revenue</p>
            <p style={s.biValue}>{formatAUM(estRevenue)}</p>
            <p style={s.biSub}>Based on fee rates</p>
          </div>
          <div style={s.biCard}>
            <p style={s.biLabel}>Active Clients</p>
            <p style={s.biValue}>{activeClients}</p>
            <p style={s.biSub}>{clients.length} total</p>
          </div>
          <div style={s.biCard}>
            <p style={s.biLabel}>Open Tasks</p>
            <p style={{ ...s.biValue, color: overdueTaskCount > 0 ? '#f87171' : t.TEXT }}>{openTasks}</p>
            <p style={s.biSub}>{overdueTaskCount > 0 ? `${overdueTaskCount} overdue` : 'All on track'}</p>
          </div>
          <div style={s.biCard}>
            <p style={s.biLabel}>Reviews Due</p>
            <p style={s.biValue}>{clients.filter(c => c.next_review_date && new Date(c.next_review_date + 'T12:00:00') <= new Date(Date.now() + 30 * 86400000)).length}</p>
            <p style={s.biSub}>Within 30 days</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={s.tabRow}>
          {TABS.map(tb => (
            <button key={tb} style={s.tab(tab === tb)} onClick={() => setTab(tb)}>{tb}</button>
          ))}
        </div>

        {loading ? (
          <div style={s.emptyState}>Loading...</div>
        ) : (

          <>
            {/* PIPELINE TAB */}
            {tab === 'Pipeline' && (
              <PipelineTable clients={clients} navigate={navigate} s={s} t={t} />
            )}

            {/* TASKS TAB */}
            {tab === 'Tasks' && (
              <div>
                {/* New task form */}
                {showTaskForm && (
                  <div style={s.formCard}>
                    <p style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.12em', color: ACCENT, margin: '0 0 14px' }}>New Task</p>
                    <div style={s.formRow}>
                      <div style={{ ...s.formField, flex: 3, minWidth: '220px' }}>
                        <label style={s.label}>Task *</label>
                        <input style={s.input} placeholder="e.g. Send Q2 review summary" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
                      </div>
                      <div style={{ ...s.formField, minWidth: '180px' }}>
                        <label style={s.label}>Client (optional)</label>
                        <select style={s.input} value={taskForm.client_id} onChange={e => setTaskForm({ ...taskForm, client_id: e.target.value })}>
                          <option value="">— No client —</option>
                          {clients.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                        </select>
                      </div>
                      <div style={{ ...s.formField, minWidth: '150px' }}>
                        <label style={s.label}>Due Date</label>
                        <input type="date" style={s.input} value={taskForm.due_date} onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })} />
                      </div>
                    </div>
                    <div style={s.formRow}>
                      <div style={{ ...s.formField, flex: 1, minWidth: '100%' }}>
                        <label style={s.label}>Notes (optional)</label>
                        <textarea style={{ ...s.input, minHeight: '70px', resize: 'vertical', fontFamily: FONT_BODY }} placeholder="Additional context, links, details..." value={taskForm.notes} onChange={e => setTaskForm({ ...taskForm, notes: e.target.value })} />
                      </div>
                    </div>
                    {taskError && <p style={s.errorText}>{taskError}</p>}
                    <div style={s.formFooter}>
                      <button style={s.cancelButton} onClick={() => { setShowTaskForm(false); setTaskError(''); }}>Cancel</button>
                      <button style={s.saveButton} onClick={handleSaveTask} disabled={taskSaving}>{taskSaving ? 'Saving…' : 'Save Task'}</button>
                    </div>
                  </div>
                )}

                {/* Overdue */}
                {tasks.filter(t => !t.completed && isOverdue(t.due_date)).length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <p style={{ ...s.sectionLabel, color: '#f87171' }}>Overdue</p>
                    {tasks.filter(t => !t.completed && isOverdue(t.due_date)).map(task => (
                      <TaskRow key={task.id} task={task} clientName={clientName} onComplete={handleCompleteTask} onDelete={handleDeleteTask} onEdit={openEditTask} s={s} t={t} navigate={navigate} clients={clients} />
                    ))}
                  </div>
                )}

                {/* Due Today */}
                {tasks.filter(t => !t.completed && isToday(t.due_date)).length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <p style={{ ...s.sectionLabel, color: ACCENT }}>Due Today</p>
                    {tasks.filter(t => !t.completed && isToday(t.due_date)).map(task => (
                      <TaskRow key={task.id} task={task} clientName={clientName} onComplete={handleCompleteTask} onDelete={handleDeleteTask} onEdit={openEditTask} s={s} t={t} navigate={navigate} clients={clients} />
                    ))}
                  </div>
                )}

                {/* Due Soon */}
                {tasks.filter(t => !t.completed && isDueSoon(t.due_date)).length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <p style={{ ...s.sectionLabel, color: '#fbbf24' }}>Due Soon</p>
                    {tasks.filter(t => !t.completed && isDueSoon(t.due_date)).map(task => (
                      <TaskRow key={task.id} task={task} clientName={clientName} onComplete={handleCompleteTask} onDelete={handleDeleteTask} onEdit={openEditTask} s={s} t={t} navigate={navigate} clients={clients} />
                    ))}
                  </div>
                )}

                {/* Upcoming & no date */}
                {tasks.filter(t => !t.completed && !isOverdue(t.due_date) && !isToday(t.due_date) && !isDueSoon(t.due_date)).length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <p style={s.sectionLabel}>Upcoming</p>
                    {tasks.filter(t => !t.completed && !isOverdue(t.due_date) && !isToday(t.due_date) && !isDueSoon(t.due_date)).map(task => (
                      <TaskRow key={task.id} task={task} clientName={clientName} onComplete={handleCompleteTask} onDelete={handleDeleteTask} onEdit={openEditTask} s={s} t={t} navigate={navigate} clients={clients} />
                    ))}
                  </div>
                )}

                {/* Completed */}
                {tasks.filter(t => t.completed).length > 0 && (
                  <div>
                    <p style={{ ...s.sectionLabel, opacity: 0.6 }}>Completed</p>
                    {tasks.filter(t => t.completed).slice(0, 10).map(task => (
                      <div key={task.id} style={{ ...s.taskCard, opacity: 0.5 }}>
                        <div style={{ ...s.taskCheck, background: ACCENT_MUTED, borderColor: ACCENT }}>
                          <span style={{ fontSize: '9px', color: ACCENT }}>✓</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ ...s.taskTitle, textDecoration: 'line-through', color: t.TEXT_MUTED }}>{task.title}</p>
                          {task.client_id && <p style={s.taskMeta}>{clientName(task.client_id)}</p>}
                        </div>
                        <span style={{ fontSize: '11px', color: t.TEXT_SUBTLE }}>{task.completed_at ? formatRelativeTime(task.completed_at) : ''}</span>
                        <button style={s.deleteAction} onClick={() => handleDeleteTask(task.id)}>Remove</button>
                      </div>
                    ))}
                  </div>
                )}

                {tasks.length === 0 && (
                  <div style={s.emptyState}>No tasks yet. Create your first task above.</div>
                )}
              </div>
            )}

            {/* EDIT TASK MODAL */}
            {editingTask && (
              <div style={s.overlay}>
                <div style={{ ...s.modal, maxWidth: '520px' }}>
                  <div style={s.modalHeader}>
                    <h2 style={s.modalTitle}>Edit Task</h2>
                    <button style={s.closeButton} onClick={() => setEditingTask(null)}>✕</button>
                  </div>
                  <div style={s.modalBody}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                      <label style={s.label}>Task *</label>
                      <input style={s.input} value={editTaskForm.title} onChange={e => setEditTaskForm({ ...editTaskForm, title: e.target.value })} placeholder="Task title" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                      <label style={s.label}>Notes (optional)</label>
                      <textarea style={{ ...s.input, minHeight: '70px', resize: 'vertical', fontFamily: FONT_BODY }} placeholder="Additional context, links, details..." value={editTaskForm.notes} onChange={e => setEditTaskForm({ ...editTaskForm, notes: e.target.value })} />
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                        <label style={s.label}>Client</label>
                        <select style={s.input} value={editTaskForm.client_id} onChange={e => setEditTaskForm({ ...editTaskForm, client_id: e.target.value })}>
                          <option value="">— No client —</option>
                          {clients.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                        </select>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                        <label style={s.label}>Due Date</label>
                        <input type="date" style={s.input} value={editTaskForm.due_date} onChange={e => setEditTaskForm({ ...editTaskForm, due_date: e.target.value })} />
                      </div>
                    </div>
                  </div>
                  <div style={s.modalFooter}>
                    <button style={s.cancelButton} onClick={() => setEditingTask(null)}>Cancel</button>
                    <button style={s.saveButton} onClick={handleSaveEditTask} disabled={editTaskSaving}>
                      {editTaskSaving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ACTIVITY TAB */}
            {tab === 'Activity' && (
              <div>
                {activityFeed.length === 0 ? (
                  <div style={s.emptyState}>No activity yet. Notes and completed tasks will appear here.</div>
                ) : (
                  activityFeed.map(item => (
                    <div key={`${item.type}-${item.id}`} style={s.activityCard}>
                      <div style={s.activityDot(item.type)} />
                      <div style={{ flex: 1 }}>
                        <p style={s.activityLabel}>{item.label}</p>
                        <p style={s.activitySub}>
                          {item.type === 'note' ? item.sub : 'Task completed'}
                          {item.client_id && ` · `}
                          {item.client_id && (
                            <Link to={`/hq/clients/${item.client_id}`} state={{ from: '/hq/crm' }} style={{ color: ACCENT, textDecoration: 'none' }}>
                              {clientName(item.client_id)}
                            </Link>
                          )}
                        </p>
                      </div>
                      <span style={s.activityTime}>{formatRelativeTime(item.time)}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TaskRow({ task, clientName, onComplete, onDelete, onEdit, s, t, navigate, clients }) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const overdue = isOverdue(task.due_date);
  const soon = isDueSoon(task.due_date);
  const today = isToday(task.due_date);
  const checkColor = overdue ? '#f87171' : today ? ACCENT : soon ? '#fbbf24' : '#60a5fa';
  const hasNotes = task.notes && task.notes.trim().length > 0;
  return (
    <div style={{ background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, marginBottom: '10px', boxShadow: SHADOW_MD, overflow: 'hidden' }}>
      {/* Main row — fixed height */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '0 20px', height: '60px' }}>
        {/* Circle */}
        <div
          className="task-check"
          style={{ ...s.taskCheck, border: `2px solid ${hovered ? checkColor : t.BORDER}`, background: hovered ? `${checkColor}18` : 'transparent', flexShrink: 0 }}
          onClick={() => onComplete(task.id)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          title="Mark as done"
        >
          {hovered && <span style={{ fontSize: '10px', color: checkColor }}>✓</span>}
        </div>
        {/* Title / client / note — all in one natural flow */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '0' }}>
          <div style={{ flexShrink: 0, marginRight: '16px' }}>
            <p style={{ ...s.taskTitle, margin: 0, whiteSpace: 'nowrap' }}>{task.title}</p>
            {task.client_id && (
              <p style={{ ...s.taskMeta, margin: '1px 0 0', whiteSpace: 'nowrap' }}>
                <span style={{ color: '#60a5fa', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); navigate(`/hq/clients/${task.client_id}`, { state: { from: '/hq/crm' } }); }}>
                  {clientName(task.client_id)}
                </span>
              </p>
            )}
          </div>
          {hasNotes && (
            <p style={{ fontSize: '12px', color: t.TEXT_SUBTLE, fontWeight: '300', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>
              {task.notes}
            </p>
          )}
          {hasNotes && task.notes.length > 50 && (
            <button style={{ ...s.deleteAction, color: t.TEXT_SUBTLE, flexShrink: 0, marginLeft: '8px' }} onClick={() => setExpanded(v => !v)}>
              {expanded ? 'Read less' : 'Read more'}
              <span style={{ display: 'inline-block', transition: 'transform 0.2s ease', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', fontSize: '9px', marginLeft: '3px' }}>▶</span>
            </button>
          )}
        </div>
        {/* Badge + actions */}
        {task.due_date && (
          <span style={{ fontSize: '12px', color: t.TEXT_MUTED, fontWeight: '300', flexShrink: 0, whiteSpace: 'nowrap' }}>
            Due {formatDate(task.due_date)}
          </span>
        )}
        <button style={{ ...s.deleteAction, flexShrink: 0 }} onClick={() => onEdit(task)}>Edit</button>
        <button style={{ ...s.deleteAction, color: '#f87171', flexShrink: 0 }} onClick={() => onDelete(task.id)}>Delete</button>
      </div>
      {/* Expandable full note */}
      {hasNotes && expanded && (
        <div style={{ borderTop: `1px solid ${t.BORDER}`, padding: '12px 20px 14px 52px', animation: 'fadeUp 0.25s ease both' }}>
          <p style={{ fontSize: '13px', color: t.TEXT_MUTED, fontWeight: '300', lineHeight: '1.65', margin: 0, whiteSpace: 'pre-wrap' }}>
            {task.notes}
          </p>
        </div>
      )}
    </div>
  );
}

function PipelineTable({ clients, navigate, s, t }) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortKey, setSortKey] = useState('last_name');
  const [sortDir, setSortDir] = useState('asc');

  const statuses = ['All', ...PIPELINE_STAGES.map(s => s.key)];

  const filtered = clients
    .filter(c => statusFilter === 'All' || c.status === statusFilter)
    .sort((a, b) => {
      let av = a[sortKey] ?? '';
      let bv = b[sortKey] ?? '';
      if (sortKey === 'aum') { av = a.aum || 0; bv = b.aum || 0; }
      if (sortKey === 'next_review_date') { av = a.next_review_date || 'zzz'; bv = b.next_review_date || 'zzz'; }
      if (sortKey === 'last_name') { av = `${a.last_name} ${a.first_name}`; bv = `${b.last_name} ${b.first_name}`; }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  const arrow = (key) => sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  const stageAUM = (key) => clients.filter(c => c.status === key).reduce((sum, c) => sum + (c.aum || 0), 0);

  return (
    <div>
      {/* Status filter + AUM summary */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        {statuses.map(st => {
          const active = statusFilter === st;
          const color = STATUS_COLORS?.[st]?.color || ACCENT;
          return (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '5px 14px', borderRadius: RADIUS_PILL, fontSize: '12px', fontWeight: '600',
                cursor: 'pointer', fontFamily: FONT_BODY, border: `1px solid ${active ? color : 'transparent'}`,
                background: active ? `${color}18` : t.SURFACE_ALT,
                color: active ? color : t.TEXT_MUTED,
                transition: 'all 0.15s',
              }}
            >
              {st === 'All' ? `All (${clients.length})` : `${st} (${clients.filter(c => c.status === st).length})`}
            </button>
          );
        })}
        {statusFilter !== 'All' && stageAUM(statusFilter) > 0 && (
          <span style={{ fontSize: '12px', color: ACCENT, marginLeft: '8px', fontWeight: '500' }}>
            {formatAUM(stageAUM(statusFilter))} AUM in stage
          </span>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={s.emptyState}>No clients in this stage.</div>
      ) : (
        <div style={s.tableWrap}>
          <div style={s.tableHead}>
            <button onClick={() => toggleSort('last_name')} style={{ ...s.tableHeadCell, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: FONT_BODY, padding: 0 }}>Client{arrow('last_name')}</button>
            <button onClick={() => toggleSort('status')} style={{ ...s.tableHeadCell, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: FONT_BODY, padding: 0 }}>Status{arrow('status')}</button>
            <button onClick={() => toggleSort('aum')} style={{ ...s.tableHeadCell, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: FONT_BODY, padding: 0 }}>AUM{arrow('aum')}</button>
            <button onClick={() => toggleSort('next_review_date')} style={{ ...s.tableHeadCell, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: FONT_BODY, padding: 0 }}>Next Review{arrow('next_review_date')}</button>
            <div style={s.tableHeadCell}>Custodian</div>
          </div>
          {filtered.map((client, i) => {
            const sc = STATUS_COLORS?.[client.status];
            const reviewSoon = client.next_review_date && isToday(client.next_review_date);
            const reviewOverdue = client.next_review_date && isOverdue(client.next_review_date);
            return (
              <div
                key={client.id}
                style={{ ...s.tableRow, background: i % 2 === 0 ? t.SURFACE : t.SURFACE_ALT, borderBottom: i === filtered.length - 1 ? 'none' : `1px solid ${t.BORDER}` }}
                onClick={() => navigate(`/hq/clients/${client.id}`, { state: { from: '/hq/crm' } })}
                onMouseEnter={e => e.currentTarget.style.background = `${ACCENT}08`}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? t.SURFACE : t.SURFACE_ALT}
              >
                <div style={s.tableCell}>
                  <span style={{ fontWeight: '500' }}>{client.last_name}, {client.first_name}</span>
                </div>
                <div style={s.tableCell}>
                  {client.status ? (
                    <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 10px', borderRadius: RADIUS_PILL, background: sc ? `${sc.color}18` : t.SURFACE_ALT, color: sc?.color || t.TEXT_MUTED, border: `1px solid ${sc ? `${sc.color}44` : t.BORDER}` }}>
                      {client.status}
                    </span>
                  ) : <span style={s.tableCellMuted}>—</span>}
                </div>
                <div style={{ ...s.tableCell, color: client.aum ? ACCENT : t.TEXT_SUBTLE, fontWeight: client.aum ? '500' : '300' }}>
                  {formatAUM(client.aum)}
                  {client.aum_source === 'api' && <span style={{ fontSize: '9px', color: t.TEXT_SUBTLE, marginLeft: '4px' }}>sync</span>}
                </div>
                <div style={{ ...s.tableCell, color: reviewOverdue ? '#f87171' : reviewSoon ? '#fbbf24' : t.TEXT_MUTED, fontWeight: '300', fontSize: '12px' }}>
                  {client.next_review_date ? formatDate(client.next_review_date) : <span style={{ color: t.TEXT_SUBTLE }}>—</span>}
                </div>
                <div style={s.tableCellMuted}>
                  {client.custodian || '—'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}