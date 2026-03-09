import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useOrg } from '../context/OrgContext';
import {
  ACCENT, ACCENT_BORDER, ACCENT_MUTED,
  FONT_BODY, FONT_DISPLAY,
  PIPELINE_STAGES, PIPELINE_STAGE_COLORS,
  RADIUS_LG, RADIUS_MD, RADIUS_PILL,
  SHADOW_MD,
  pageStyles,
} from '../utils/hqConstants';
import { useTokens } from '../context/ThemeContext';

const TABS = ['Tasks', 'Activity', 'Pipeline'];

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

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

export default function CRM() {
  const t = useTokens();
  const navigate = useNavigate();
  const { orgId } = useOrg();
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 600;
  const isTablet = windowWidth < 900;

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
      supabase.from('clients').select('id, first_name, last_name, status, pipeline_stage, is_reactivation, aum, fee_rate, next_review_date, custodian, aum_source, aum_synced_at').eq('org_id', orgId).is('deleted_at', null).order('last_name'),
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
    if (!taskForm.client_id) { setTaskError('Please select a client for this task.'); return; }
    setTaskSaving(true); setTaskError('');
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from('client_tasks').insert([{
      org_id: orgId,
      client_id: taskForm.client_id,
      title: taskForm.title,
      due_date: taskForm.due_date || null,
      notes: taskForm.notes || null,
      created_by: session?.user?.id,
    }]);
    if (error) {
      console.error('handleSaveTask error:', error);
      setTaskError('Something went wrong. Please try again.');
    } else {
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
    ...pageStyles(t, isMobile),
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '12px' : '0', marginBottom: '32px' },
    addButton: { background: 'transparent', color: ACCENT, border: `1px solid ${ACCENT_BORDER}`, borderRadius: RADIUS_MD, padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: FONT_BODY },

    // BI bar
    biBar: { display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : isTablet ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)', gap: '12px', marginBottom: '32px' },
    biCard: { background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, padding: '18px 20px', boxShadow: SHADOW_MD },
    biLabel: { fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: t.TEXT_MUTED, margin: '0 0 6px' },
    biValue: { fontSize: '18px', fontWeight: '300', fontFamily: FONT_BODY, color: t.TEXT, margin: 0, letterSpacing: '0.01em' },
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
    tableWrap: { border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, overflow: 'hidden', boxShadow: SHADOW_MD, overflowX: 'auto' },
    tableHead: { display: 'grid', gridTemplateColumns: isMobile ? '1fr 100px' : '1fr 110px 110px 120px 110px', padding: '10px 20px', background: t.SURFACE_ALT, borderBottom: `1px solid ${t.BORDER}`, minWidth: isMobile ? 'unset' : '600px' },
    tableHeadCell: { fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: t.TEXT_MUTED },
    tableRow: { display: 'grid', gridTemplateColumns: isMobile ? '1fr 100px' : '1fr 110px 110px 120px 110px', padding: '14px 20px', borderBottom: `1px solid ${t.BORDER}`, background: t.SURFACE, cursor: 'pointer', transition: 'background 0.15s', minWidth: isMobile ? 'unset' : '600px' },
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
    deleteAction: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: t.TEXT_MUTED, padding: 0, fontFamily: FONT_BODY },

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
              <PipelineTable clients={clients} navigate={navigate} s={s} t={t} isMobile={isMobile} orgId={orgId} onStageChange={fetchData} />
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
  const dueDateColor = overdue ? '#f87171' : today ? ACCENT : soon ? '#fbbf24' : t.TEXT_MUTED;

  return (
    <div style={{ background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, marginBottom: '10px', boxShadow: SHADOW_MD, overflow: 'hidden' }}>

      {/* Row 1: complete circle + title + due date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px 6px' }}>
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
        <p style={{ ...s.taskTitle, flex: 1, margin: 0 }}>{task.title}</p>
        {task.due_date && (
          <span style={{ fontSize: '12px', color: dueDateColor, fontWeight: overdue || today ? '500' : '300', flexShrink: 0, whiteSpace: 'nowrap' }}>
            {overdue ? 'Overdue · ' : today ? 'Today · ' : ''}{formatDate(task.due_date)}
          </span>
        )}
      </div>

      {/* Row 2: client link + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '2px 20px 12px 52px' }}>
        {task.client_id ? (
          <span
            style={{ fontSize: '12px', color: t.TEXT, fontWeight: '400', cursor: 'pointer', flex: 1 }}
            onClick={e => { e.stopPropagation(); navigate(`/hq/clients/${task.client_id}`, { state: { from: '/hq/crm' } }); }}
          >
            {clientName(task.client_id)}
          </span>
        ) : (
          <span style={{ flex: 1 }} />
        )}
        {hasNotes && (
          <>
            <button
              style={{ ...s.deleteAction, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '3px' }}
              onClick={() => setExpanded(v => !v)}
            >
              Expand
              <span style={{
                display: 'inline-block',
                width: 0, height: 0,
                borderTop: '4px solid transparent',
                borderBottom: '4px solid transparent',
                borderLeft: `5px solid ${t.TEXT_MUTED}`,
                transition: 'transform 0.2s ease',
                transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                flexShrink: 0,
              }} />
            </button>
            <span style={{ fontSize: '10px', color: t.TEXT_MUTED }}>·</span>
          </>
        )}
        <button style={{ ...s.deleteAction, fontSize: '12px' }} onClick={() => onEdit(task)}>Edit</button>
        <span style={{ fontSize: '10px', color: t.TEXT_MUTED }}>·</span>
        <button style={{ ...s.deleteAction, fontSize: '12px', color: '#f87171' }} onClick={() => onDelete(task.id)}>Delete</button>
      </div>

      {/* Expandable note */}
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

function PipelineTable({ clients, navigate, s, t, isMobile, orgId, onStageChange }) {
  const [stageFilter, setStageFilter] = useState('All');
  const [sortKey, setSortKey]         = useState('last_name');
  const [sortDir, setSortDir]         = useState('asc');
  const [savingId, setSavingId]       = useState(null);
  const [tooltip, setTooltip]         = useState(null);

  // Prospects + reactivating clients only (not Active or Inactive without a stage)
  const pipelineClients = clients.filter(c =>
    c.pipeline_stage && c.pipeline_stage !== 'Active'
  );

  const stageCount = (key) => pipelineClients.filter(c => c.pipeline_stage === key).length;

  const filtered = pipelineClients
    .filter(c => stageFilter === 'All' || c.pipeline_stage === stageFilter)
    .sort((a, b) => {
      let av = a[sortKey] ?? '';
      let bv = b[sortKey] ?? '';
      if (sortKey === 'aum') { av = a.aum || 0; bv = b.aum || 0; }
      if (sortKey === 'last_name') { av = `${a.last_name} ${a.first_name}`; bv = `${b.last_name} ${b.first_name}`; }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  const arrow = (key) => {
    if (sortKey !== key) return null;
    return (
      <span style={{
        display: 'inline-block', width: 0, height: 0, marginLeft: '4px',
        borderLeft: '4px solid transparent', borderRight: '4px solid transparent',
        ...(sortDir === 'asc'
          ? { borderBottom: `5px solid currentColor`, verticalAlign: 'middle' }
          : { borderTop: `5px solid currentColor`, verticalAlign: 'middle' }),
      }} />
    );
  };

  async function handleStageChange(client, newStage) {
    // Reactivation guard on the frontend too
    if (client.is_reactivation && newStage === 'Lead') return;
    setSavingId(client.id);
    const { error } = await supabase.rpc('update_pipeline_stage', {
      p_client_id: client.id,
      p_org_id:    orgId,
      p_new_stage: newStage,
    });
    if (error) console.error('update_pipeline_stage error:', error);
    else onStageChange();
    setSavingId(null);
  }

  const gridCols = isMobile ? '1fr 130px' : '1fr 130px 100px 120px 160px';

  return (
    <div>
      {/* Stage filter pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => setStageFilter('All')}
          style={{
            padding: '5px 14px', borderRadius: RADIUS_PILL, fontSize: '12px', fontWeight: '600',
            cursor: 'pointer', fontFamily: FONT_BODY, border: `1px solid ${stageFilter === 'All' ? ACCENT : 'transparent'}`,
            background: stageFilter === 'All' ? ACCENT_MUTED : t.SURFACE_ALT,
            color: stageFilter === 'All' ? ACCENT : t.TEXT_MUTED, transition: 'all 0.15s',
          }}
        >
          All ({pipelineClients.length})
        </button>
        {PIPELINE_STAGES.filter(st => st.key !== 'Active').map(st => {
          const active = stageFilter === st.key;
          const sc = PIPELINE_STAGE_COLORS[st.key];
          return (
            <button
              key={st.key}
              onClick={() => setStageFilter(st.key)}
              style={{
                padding: '5px 14px', borderRadius: RADIUS_PILL, fontSize: '12px', fontWeight: '600',
                cursor: 'pointer', fontFamily: FONT_BODY,
                border: `1px solid ${active ? sc.color : 'transparent'}`,
                background: active ? sc.bg : t.SURFACE_ALT,
                color: active ? sc.color : t.TEXT_MUTED, transition: 'all 0.15s',
              }}
            >
              {st.label} ({stageCount(st.key)})
            </button>
          );
        })}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={s.emptyState}>No prospects in this stage.</div>
      ) : (
        <div style={s.tableWrap}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: gridCols, padding: '10px 20px', background: t.SURFACE_ALT, borderBottom: `1px solid ${t.BORDER}`, minWidth: isMobile ? 'unset' : '640px' }}>
            {[
              { key: 'last_name', label: 'Prospect' },
              { key: 'pipeline_stage', label: 'Stage' },
              ...(!isMobile ? [
                { key: 'is_reactivation', label: 'Type' },
                { key: 'aum', label: 'AUM' },
                { key: null, label: 'Move Stage' },
              ] : []),
            ].map(col => (
              <div
                key={col.label}
                onClick={() => col.key && toggleSort(col.key)}
                style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', color: t.TEXT_MUTED, cursor: col.key ? 'pointer' : 'default', display: 'flex', alignItems: 'center' }}
              >
                {col.label}{col.key && arrow(col.key)}
              </div>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((client, i) => {
            const sc = PIPELINE_STAGE_COLORS[client.pipeline_stage] || {};
            const isSaving = savingId === client.id;
            // Stages this client can move to
            const allStages = PIPELINE_STAGES.filter(st => st.key !== 'Active');
            const availableStages = client.is_reactivation
              ? allStages.filter(st => st.key !== 'Lead')
              : allStages;
            const currentIdx = availableStages.findIndex(st => st.key === client.pipeline_stage);
            const nextStage  = availableStages[currentIdx + 1] || { key: 'Active', label: 'Active' };
            const prevStage  = availableStages[currentIdx - 1] || null;

            return (
              <div
                key={client.id}
                style={{
                  display: 'grid', gridTemplateColumns: gridCols,
                  padding: '14px 20px',
                  background: i % 2 === 0 ? t.SURFACE : t.SURFACE_ALT,
                  borderBottom: i === filtered.length - 1 ? 'none' : `1px solid ${t.BORDER}`,
                  minWidth: isMobile ? 'unset' : '640px',
                  alignItems: 'center',
                  opacity: isSaving ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = `${ACCENT}08`}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? t.SURFACE : t.SURFACE_ALT}
              >
                {/* Name — clickable */}
                <div
                  style={{ fontSize: '13px', color: t.TEXT, fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => navigate(`/hq/clients/${client.id}`, { state: { from: '/hq/crm' } })}
                >
                  {client.last_name}, {client.first_name}
                </div>

                {/* Stage pill */}
                <div>
                  <span style={{
                    fontSize: '11px', fontWeight: '600', padding: '2px 10px',
                    borderRadius: RADIUS_PILL,
                    background: sc.bg || t.SURFACE_ALT,
                    color: sc.color || t.TEXT_MUTED,
                    border: `1px solid ${sc.color ? `${sc.color}44` : t.BORDER}`,
                  }}>
                    {client.pipeline_stage}
                  </span>
                </div>

                {/* Type — new vs reactivation */}
                {!isMobile && (
                  <div style={{ position: 'relative' }}>
                    {client.is_reactivation ? (
                      <span
                        style={{ fontSize: '11px', color: '#fbbf24', fontWeight: '500', cursor: 'default' }}
                        onMouseEnter={() => setTooltip(client.id)}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        Prospect *
                        {tooltip === client.id && (
                          <span style={{
                            position: 'absolute', left: 0, top: '22px', zIndex: 10,
                            background: t.SURFACE, border: `1px solid ${t.BORDER}`,
                            borderRadius: RADIUS_MD, padding: '6px 10px',
                            fontSize: '11px', color: t.TEXT_MUTED, fontWeight: '300',
                            whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          }}>
                            * Former client — reactivation prospect
                          </span>
                        )}
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: t.TEXT_MUTED, fontWeight: '300' }}>New</span>
                    )}
                  </div>
                )}

                {/* AUM */}
                {!isMobile && (
                  <div style={{ fontSize: '13px', color: client.aum ? ACCENT : t.TEXT_SUBTLE, fontWeight: client.aum ? '500' : '300' }}>
                    {formatAUM(client.aum)}
                  </div>
                )}

                {/* Move stage buttons */}
                {!isMobile && (
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {prevStage && (
                      <button
                        onClick={() => handleStageChange(client, prevStage.key)}
                        disabled={isSaving}
                        style={{
                          background: 'none', border: `1px solid ${t.BORDER}`,
                          borderRadius: RADIUS_MD, padding: '3px 8px',
                          fontSize: '11px', color: t.TEXT_MUTED,
                          cursor: 'pointer', fontFamily: FONT_BODY,
                          display: 'flex', alignItems: 'center', gap: '3px',
                        }}
                        title={`Move back to ${prevStage.label}`}
                      >
                        <span style={{ display: 'inline-block', width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderRight: `5px solid currentColor` }} />
                        {prevStage.label}
                      </button>
                    )}
                    <button
                      onClick={() => handleStageChange(client, nextStage.key)}
                      disabled={isSaving}
                      style={{
                        background: ACCENT_MUTED, border: `1px solid ${ACCENT_BORDER}`,
                        borderRadius: RADIUS_MD, padding: '3px 8px',
                        fontSize: '11px', color: ACCENT, fontWeight: '600',
                        cursor: 'pointer', fontFamily: FONT_BODY,
                        display: 'flex', alignItems: 'center', gap: '3px',
                      }}
                      title={`Advance to ${nextStage.label}`}
                    >
                      {nextStage.label}
                      <span style={{ display: 'inline-block', width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: `5px solid currentColor` }} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}