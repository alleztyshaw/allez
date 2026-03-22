import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import CalendarView from '../components/CalendarView';
import {
  FONT_DISPLAY, FONT_BODY,
  FW_LIGHT, FW_REGULAR, FW_MEDIUM, FW_SEMIBOLD,
  RADIUS_MD,
  FULL_ACCESS_ROLES,
  COLOR_ERROR,
  pageStyles,
  MOBILE_BREAKPOINT,
} from '../utils/hqConstants';
import { useTokens } from '../context/ThemeContext';
import { useOrg } from '../context/OrgContext';
import useWindowWidth from '../hooks/useWindowWidth';

// Build YYYY-MM-DD from LOCAL time — never use toISOString() for dates,
// as it returns UTC which can be a different calendar day than the user's timezone
function localDateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
function todayStr()    { return localDateStr(0); }
function formatDate(d) {
  // Append T00:00:00 to force local time parsing — bare date strings parse as UTC
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}
function isOverdue(dateStr) {
  return dateStr < todayStr();
}

export default function DailyBrief() {
  const navigate  = useNavigate();
  const t         = useTokens();
  const { orgId, userId, userRole, isDemoOrg } = useOrg();
  const windowWidth = useWindowWidth();
  const isMobile    = windowWidth < MOBILE_BREAKPOINT;

  // In demo orgs, always show org-wide data regardless of role —
  // demo users aren't in client_advisors so the scoped query returns nothing
  const isFullAccess = isDemoOrg || FULL_ACCESS_ROLES.includes(userRole);

  const [orgName,    setOrgName]    = useState('');
  const [meetings,   setMeetings]   = useState([]);
  const [clients,    setClients]    = useState([]);
  const [tasks,      setTasks]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [completing, setCompleting] = useState(null); // task id being completed

  const load = useCallback(async () => {
    if (!orgId || !userRole || !userId) return;
    setLoading(true);

    const today      = todayStr();

    // Broad window so CalendarView can navigate days freely
    const windowStart = new Date(); windowStart.setDate(windowStart.getDate() - 30);
    const windowEnd   = new Date(); windowEnd.setDate(windowEnd.getDate() + 60);
    const fetchStart  = `${windowStart.getFullYear()}-${String(windowStart.getMonth()+1).padStart(2,'0')}-${String(windowStart.getDate()).padStart(2,'0')}T00:00:00`;
    const fetchEnd    = `${windowEnd.getFullYear()}-${String(windowEnd.getMonth()+1).padStart(2,'0')}-${String(windowEnd.getDate()).padStart(2,'0')}T23:59:59`;

    // ── Fetch org name ────────────────────────────────────────────────────
    const { data: orgData } = await supabase
      .from('organizations')
      .select('name')
      .eq('org_id', orgId)
      .single();
    setOrgName(orgData?.name || '');

    if (isFullAccess) {
      // ── Admin / Manager / Compliance / Demo — org-wide ────────────────
      const [{ data: meetingsData }, { data: clientsData }, { data: tasksData }] = await Promise.all([
        supabase
          .from('meetings')
          .select('id, client_id, category, meeting_type, status, scheduled_at, duration_mins, description')
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .gte('scheduled_at', fetchStart)
          .lte('scheduled_at', fetchEnd)
          .order('scheduled_at', { ascending: true }),
        supabase
          .from('clients')
          .select('id, first_name, last_name')
          .eq('org_id', orgId)
          .is('deleted_at', null),
        supabase
          .from('client_tasks')
          .select('id, title, due_date, client_id, completed')
          .eq('org_id', orgId)
          .eq('completed', false)
          .is('deleted_at', null)
          .lte('due_date', today)
          .order('due_date', { ascending: true }),
      ]);

      setMeetings(meetingsData || []);
      setClients(clientsData || []);

      // Attach client names to tasks
      const clientNameMap = {};
      (clientsData || []).forEach(c => { clientNameMap[c.id] = `${c.first_name} ${c.last_name}`; });
      setTasks((tasksData || []).map(t => ({ ...t, clientName: clientNameMap[t.client_id] || '—' })));

    } else {
      // ── Advisor / Associate — scoped to their assigned clients ────────
      const { data: advisorClients } = await supabase
        .from('client_advisors')
        .select('client_id')
        .eq('user_id', userId);

      const myClientIds = (advisorClients || []).map(r => r.client_id);

      if (myClientIds.length === 0) {
        setMeetings([]);
        setClients([]);
        setTasks([]);
        setLoading(false);
        return;
      }

      const [{ data: meetingsData }, { data: clientsData }, { data: tasksData }] = await Promise.all([
        supabase
          .from('meetings')
          .select('id, client_id, category, meeting_type, status, scheduled_at, duration_mins, description')
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .in('client_id', myClientIds)
          .gte('scheduled_at', fetchStart)
          .lte('scheduled_at', fetchEnd)
          .order('scheduled_at', { ascending: true }),
        supabase
          .from('clients')
          .select('id, first_name, last_name')
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .in('id', myClientIds),
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

      setMeetings(meetingsData || []);
      setClients(clientsData || []);

      // Attach client names to tasks
      const clientNameMap = {};
      (clientsData || []).forEach(c => { clientNameMap[c.id] = `${c.first_name} ${c.last_name}`; });
      // Some tasks may belong to clients not in clients list — fetch those too
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
  }, [orgId, userId, userRole, isFullAccess]);

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

    // Tasks
    taskTitle: {
      fontSize: '14px', fontWeight: FW_REGULAR, color: t.TEXT, margin: 0,
    },
    taskMeta: {
      fontSize: '12px', fontWeight: FW_LIGHT, color: t.TEXT_MUTED, margin: 0,
    },
    overdueBadge: {
      fontSize: '10px', fontWeight: FW_SEMIBOLD, letterSpacing: '0.06em',
      color: COLOR_ERROR, textTransform: 'uppercase',
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
              <p style={s.sectionLabel}>Today's Schedule</p>
              <CalendarView
                meetings={meetings}
                clients={clients}
                navigate={navigate}
                defaultView="day"
                defaultDate={new Date()}
                hideViewToggle={true}
                hourHeight={48}
                maxHours={14}
              />
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