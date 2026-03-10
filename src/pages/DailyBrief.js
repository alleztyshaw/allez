import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  FONT_DISPLAY, FONT_BODY,
  FW_LIGHT, FW_REGULAR, FW_MEDIUM, FW_SEMIBOLD,
  RADIUS_MD, RADIUS_LG,
  SHADOW_SM,
  FULL_ACCESS_ROLES,
  pageStyles,
  MOBILE_BREAKPOINT,
} from '../utils/hqConstants';
import { useTokens } from '../context/ThemeContext';
import { useOrg } from '../context/OrgContext';

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler, { passive: true });
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

function todayStr() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}
function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}
function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}
function reviewLabel(dateStr) {
  if (dateStr === todayStr()) return 'Today';
  if (dateStr === tomorrowStr()) return 'Tomorrow';
  return dateStr;
}
function isOverdue(dateStr) {
  return dateStr < todayStr();
}

export default function DailyBrief() {
  const navigate  = useNavigate();
  const t         = useTokens();
  const { orgId, userRole } = useOrg();
  const windowWidth = useWindowWidth();
  const isMobile    = windowWidth < MOBILE_BREAKPOINT;

  const isFullAccess = FULL_ACCESS_ROLES.includes(userRole);

  const [orgName,    setOrgName]    = useState('');
  const [meetings,   setMeetings]   = useState([]);
  const [tasks,      setTasks]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [completing, setCompleting] = useState(null); // task id being completed

  const load = useCallback(async () => {
    if (!orgId || !userRole) return;
    setLoading(true);

    const today    = todayStr();
    const tomorrow = tomorrowStr();

    // ── Fetch org name ────────────────────────────────────────────────────
    const { data: orgData } = await supabase
      .from('organizations')
      .select('name')
      .eq('org_id', orgId)
      .single();
    setOrgName(orgData?.name || '');

    if (isFullAccess) {
      // ── Admin / Manager / Compliance — org-wide ───────────────────────
      const [{ data: clientsData }, { data: tasksData }] = await Promise.all([
        supabase
          .from('clients')
          .select('id, first_name, last_name, next_review_date')
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .in('next_review_date', [today, tomorrow])
          .order('next_review_date', { ascending: true }),
        supabase
          .from('client_tasks')
          .select('id, title, due_date, client_id, completed')
          .eq('org_id', orgId)
          .eq('completed', false)
          .is('deleted_at', null)
          .lte('due_date', today)
          .order('due_date', { ascending: true }),
      ]);
      setMeetings(clientsData || []);

      // Attach client names to tasks
      const allClientIds = [...new Set((tasksData || []).map(t => t.client_id))];
      let clientNameMap = {};
      if (allClientIds.length > 0) {
        const { data: names } = await supabase
          .from('clients')
          .select('id, first_name, last_name')
          .in('id', allClientIds);
        (names || []).forEach(c => { clientNameMap[c.id] = `${c.first_name} ${c.last_name}`; });
      }
      setTasks((tasksData || []).map(t => ({ ...t, clientName: clientNameMap[t.client_id] || '—' })));

    } else {
      // ── Advisor / Associate — scoped to their clients ─────────────────
      const { data: advisorClients } = await supabase
        .from('client_advisors')
        .select('client_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user.id);

      const myClientIds = (advisorClients || []).map(r => r.client_id);

      if (myClientIds.length === 0) {
        setMeetings([]);
        setTasks([]);
        setLoading(false);
        return;
      }

      const [{ data: clientsData }, { data: tasksData }] = await Promise.all([
        supabase
          .from('clients')
          .select('id, first_name, last_name, next_review_date')
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .in('id', myClientIds)
          .in('next_review_date', [today, tomorrow])
          .order('next_review_date', { ascending: true }),
        supabase
          .from('client_tasks')
          .select('id, title, due_date, client_id, completed')
          .eq('org_id', orgId)
          .eq('completed', false)
          .is('deleted_at', null)
          .in('client_id', myClientIds)
          .lte('due_date', today)
          .order('due_date', { ascending: true }),
      ]);
      setMeetings(clientsData || []);

      // Attach client names to tasks
      const clientNameMap = {};
      (clientsData || []).forEach(c => { clientNameMap[c.id] = `${c.first_name} ${c.last_name}`; });
      // Some tasks may belong to clients not in meeting list — fetch those too
      const extraIds = [...new Set((tasksData || []).map(t => t.client_id).filter(id => !clientNameMap[id]))];
      if (extraIds.length > 0) {
        const { data: extra } = await supabase
          .from('clients')
          .select('id, first_name, last_name')
          .in('id', extraIds);
        (extra || []).forEach(c => { clientNameMap[c.id] = `${c.first_name} ${c.last_name}`; });
      }
      setTasks((tasksData || []).map(t => ({ ...t, clientName: clientNameMap[t.client_id] || '—' })));
    }

    setLoading(false);
  }, [orgId, userRole, isFullAccess]);

  useEffect(() => { load(); }, [load]);

  async function completeTask(taskId) {
    setCompleting(taskId);
    await supabase
      .from('client_tasks')
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq('id', taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setCompleting(null);
  }

  // ── Styles ──────────────────────────────────────────────────────────────
  const s = {
    ...pageStyles(t, isMobile),

    header: {
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'flex-end', marginBottom: '8px',
    },
    headerDate: {
      fontFamily: FONT_DISPLAY, fontSize: isMobile ? '22px' : '28px',
      fontWeight: FW_LIGHT, color: t.TEXT, letterSpacing: '0.01em',
    },
    headerOrg: {
      fontSize: '13px', fontWeight: FW_LIGHT,
      color: t.TEXT_MUTED, letterSpacing: '0.03em',
    },
    divider: { height: '1px', background: t.BORDER, marginBottom: '32px' },

    // Two-column layout
    columns: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: '24px',
    },

    // Section
    sectionLabel: {
      fontSize: '10px', fontWeight: FW_SEMIBOLD, letterSpacing: '0.12em',
      textTransform: 'uppercase', color: t.ACCENT, marginBottom: '12px',
    },

    // Cards
    card: {
      background: t.SURFACE, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_LG, padding: '16px 20px',
      boxShadow: SHADOW_SM, marginBottom: '10px',
      display: 'flex', flexDirection: 'column', gap: '6px',
    },
    cardRow: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px',
    },
    clientName: {
      fontSize: '15px', fontWeight: FW_REGULAR, color: t.TEXT,
      fontFamily: FONT_BODY, margin: 0,
    },
    reviewLabel: {
      fontSize: '11px', fontWeight: FW_MEDIUM, color: t.ACCENT,
      letterSpacing: '0.05em',
    },
    logBtn: {
      background: 'none', border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD, padding: '5px 12px',
      fontSize: '12px', fontWeight: FW_MEDIUM,
      color: t.TEXT_MUTED, cursor: 'pointer',
      fontFamily: FONT_BODY, flexShrink: 0,
      transition: 'border-color 0.15s, color 0.15s',
    },

    // Tasks
    taskTitle: {
      fontSize: '14px', fontWeight: FW_REGULAR, color: t.TEXT, margin: 0,
    },
    taskMeta: {
      fontSize: '12px', fontWeight: FW_LIGHT, color: t.TEXT_MUTED, margin: 0,
    },
    overdueBadge: {
      fontSize: '10px', fontWeight: FW_SEMIBOLD, letterSpacing: '0.06em',
      color: '#f87171', textTransform: 'uppercase',
    },
    completeBtn: {
      background: 'none', border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD, padding: '5px 12px',
      fontSize: '12px', fontWeight: FW_MEDIUM,
      color: t.TEXT_MUTED, cursor: 'pointer',
      fontFamily: FONT_BODY, flexShrink: 0,
    },

    emptyState: {
      fontSize: '13px', fontWeight: FW_LIGHT,
      color: t.TEXT_SUBTLE, padding: '20px 0',
    },

    loadingText: {
      fontSize: '13px', fontWeight: FW_LIGHT,
      color: t.TEXT_MUTED, padding: '40px 0',
    },
  };

  return (
    <div style={s.pageWrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        .brief-log-btn:hover { border-color: ${t.ACCENT} !important; color: ${t.ACCENT} !important; }
        .brief-complete-btn:hover { border-color: ${t.ACCENT} !important; color: ${t.ACCENT} !important; }
      `}</style>

      <div style={s.page}>

        {/* Header */}
        <div style={s.header}>
          <p style={s.headerDate}>{formatDate(todayStr())}</p>
          {orgName && <p style={s.headerOrg}>{orgName}</p>}
        </div>
        <div style={s.divider} />

        {loading ? (
          <p style={s.loadingText}>Loading your brief…</p>
        ) : (
          <div style={s.columns}>

            {/* ── Schedule ───────────────────────────────────────────── */}
            <div>
              <p style={s.sectionLabel}>Schedule</p>
              {meetings.length === 0 ? (
                <p style={s.emptyState}>No reviews scheduled for today or tomorrow.</p>
              ) : (
                meetings.map(client => (
                  <div key={client.id} style={s.card}>
                    <div style={s.cardRow}>
                      <div>
                        <p style={s.clientName}>{client.first_name} {client.last_name}</p>
                        <p style={s.reviewLabel}>{reviewLabel(client.next_review_date)} — Review</p>
                      </div>
                      <button
                        className="brief-log-btn"
                        style={s.logBtn}
                        onClick={() => navigate(`/hq/notes?client_id=${client.id}`)}
                      >
                        Log note
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ── Tasks ──────────────────────────────────────────────── */}
            <div>
              <p style={s.sectionLabel}>
                Open Tasks {tasks.length > 0 && `· ${tasks.length}`}
              </p>
              {tasks.length === 0 ? (
                <p style={s.emptyState}>No overdue or due-today tasks. You're all caught up.</p>
              ) : (
                tasks.map(task => (
                  <div key={task.id} style={s.card}>
                    <div style={s.cardRow}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={s.taskTitle}>{task.title}</p>
                        <p style={s.taskMeta}>{task.clientName}</p>
                        {isOverdue(task.due_date) ? (
                          <p style={s.overdueBadge}>Overdue · {task.due_date}</p>
                        ) : (
                          <p style={{ ...s.taskMeta, marginTop: '2px' }}>Due today</p>
                        )}
                      </div>
                      <button
                        className="brief-complete-btn"
                        style={s.completeBtn}
                        disabled={completing === task.id}
                        onClick={() => completeTask(task.id)}
                      >
                        {completing === task.id ? '…' : 'Done'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}