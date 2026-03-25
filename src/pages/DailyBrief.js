import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import CalendarView from '../components/CalendarView';
import {
  FONT_DISPLAY, FONT_BODY,
  FW_LIGHT, FW_REGULAR, FW_MEDIUM, FW_SEMIBOLD,
  RADIUS_LG,
  SHADOW_MD,
  FULL_ACCESS_ROLES,
  COLOR_INFO,
  ACCENT, ACCENT_MUTED,
  pageStyles,
  MOBILE_BREAKPOINT,
} from '../utils/hqConstants';
import { useTokens } from '../context/ThemeContext';
import { useOrg } from '../context/OrgContext';
import useWindowWidth from '../hooks/useWindowWidth';

// ── Date helpers ─────────────────────────────────────────────────────────────

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
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}
function isOverdue(dateStr)  { return dateStr < todayStr(); }
function isDueToday(dateStr) { return dateStr === todayStr(); }
function isDueSoon(dateStr)  { return dateStr > todayStr() && dateStr <= localDateStr(2); }

// ── CheckCircle ───────────────────────────────────────────────────────────────

function CheckCircle({ completing, onClick }) {
  const t = useTokens();
  const [hovered, setHovered] = useState(false);
  const active = completing || hovered;
  return (
    <button
      onClick={onClick}
      disabled={completing}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
        border: `1.5px solid ${active ? ACCENT : t.BORDER}`,
        background: active ? ACCENT_MUTED : 'transparent',
        cursor: 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: 'center', transition: 'all 0.15s', padding: 0,
      }}
    >
      {active && (
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M2 5.5L4.5 8L9 3" stroke={ACCENT} strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DailyBrief() {
  const navigate  = useNavigate();
  const t         = useTokens();
  const { orgId, userId, userRole, isDemoOrg } = useOrg();
  const windowWidth = useWindowWidth();
  const isMobile    = windowWidth < MOBILE_BREAKPOINT;
  const isNarrow    = windowWidth < 1100; // collapse to single col before sidebar squish

  const isFullAccess = isDemoOrg || FULL_ACCESS_ROLES.includes(userRole);

  const [orgName,          setOrgName]          = useState('');
  const [meetings,         setMeetings]         = useState([]);
  const [clients,          setClients]          = useState([]);
  const [tasks,            setTasks]            = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [completing,       setCompleting]       = useState(null);
  const [dayMeetingCount,  setDayMeetingCount]  = useState(0);

  const load = useCallback(async () => {
    if (!orgId || !userRole || !userId) return;
    setLoading(true);

    const dueSoonEnd  = localDateStr(2);
    const windowStart = new Date(); windowStart.setDate(windowStart.getDate() - 30);
    const windowEnd   = new Date(); windowEnd.setDate(windowEnd.getDate() + 60);
    const pad         = n => String(n).padStart(2, '0');
    const fmt         = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    const fetchStart  = `${fmt(windowStart)}T00:00:00`;
    const fetchEnd    = `${fmt(windowEnd)}T23:59:59`;

    const { data: orgData } = await supabase
      .from('organizations').select('name').eq('org_id', orgId).single();
    setOrgName(orgData?.name || '');

    if (isFullAccess) {
      const [{ data: meetingsData }, { data: clientsData }, { data: tasksData }] = await Promise.all([
        supabase.from('meetings')
          .select('id, client_id, category, meeting_type, status, scheduled_at, duration_mins, description')
          .eq('org_id', orgId).is('deleted_at', null)
          .gte('scheduled_at', fetchStart).lte('scheduled_at', fetchEnd)
          .order('scheduled_at', { ascending: true }),
        supabase.from('clients')
          .select('id, first_name, last_name').eq('org_id', orgId).is('deleted_at', null),
        supabase.from('client_tasks')
          .select('id, title, due_date, client_id, completed')
          .eq('org_id', orgId).eq('completed', false).is('deleted_at', null)
          .lte('due_date', dueSoonEnd).order('due_date', { ascending: true }),
      ]);
      setMeetings(meetingsData || []);
      setClients(clientsData || []);
      const map = {};
      (clientsData || []).forEach(c => { map[c.id] = `${c.first_name} ${c.last_name}`; });
      setTasks((tasksData || []).map(tk => ({ ...tk, clientName: map[tk.client_id] || '—' })));

    } else {
      const { data: advisorClients } = await supabase
        .from('client_advisors').select('client_id').eq('user_id', userId);
      const myClientIds = (advisorClients || []).map(r => r.client_id);
      if (myClientIds.length === 0) {
        setMeetings([]); setClients([]); setTasks([]);
        setLoading(false); return;
      }
      const [{ data: meetingsData }, { data: clientsData }, { data: tasksData }] = await Promise.all([
        supabase.from('meetings')
          .select('id, client_id, category, meeting_type, status, scheduled_at, duration_mins, description')
          .eq('org_id', orgId).is('deleted_at', null).in('client_id', myClientIds)
          .gte('scheduled_at', fetchStart).lte('scheduled_at', fetchEnd)
          .order('scheduled_at', { ascending: true }),
        supabase.from('clients')
          .select('id, first_name, last_name').eq('org_id', orgId).is('deleted_at', null)
          .in('id', myClientIds),
        supabase.from('client_tasks')
          .select('id, title, due_date, client_id, completed')
          .eq('org_id', orgId).eq('completed', false).is('deleted_at', null)
          .in('client_id', myClientIds)
          .lte('due_date', dueSoonEnd).order('due_date', { ascending: true }),
      ]);
      setMeetings(meetingsData || []);
      setClients(clientsData || []);
      const map = {};
      (clientsData || []).forEach(c => { map[c.id] = `${c.first_name} ${c.last_name}`; });
      const extraIds = [...new Set((tasksData || []).map(tk => tk.client_id).filter(id => !map[id]))];
      if (extraIds.length > 0) {
        const { data: extra } = await supabase.from('clients')
          .select('id, first_name, last_name').in('id', extraIds);
        (extra || []).forEach(c => { map[c.id] = `${c.first_name} ${c.last_name}`; });
      }
      setTasks((tasksData || []).map(tk => ({ ...tk, clientName: map[tk.client_id] || '—' })));
    }
    setLoading(false);
  }, [orgId, userId, userRole, isFullAccess]);

  useEffect(() => { load(); }, [load]);

  async function completeTask(taskId) {
    setCompleting(taskId);
    await supabase.from('client_tasks')
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq('id', taskId);
    setTasks(prev => prev.filter(tk => tk.id !== taskId));
    setCompleting(null);
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const pastDueTasks = tasks.filter(tk => isOverdue(tk.due_date));
  const todayTasks   = tasks.filter(tk => isDueToday(tk.due_date));
  const dueSoonTasks = tasks.filter(tk => isDueSoon(tk.due_date));

  const clientMap = {};
  clients.forEach(c => { clientMap[c.id] = `${c.first_name} ${c.last_name}`; });

  // ── Styles ────────────────────────────────────────────────────────────────
  const s = {
    ...pageStyles(t, isMobile),
    pageHeader: {
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'flex-end', marginBottom: '8px',
    },
    headerDate: {
      fontFamily: FONT_DISPLAY, fontSize: isMobile ? '22px' : '28px',
      fontWeight: FW_LIGHT, color: t.TEXT, letterSpacing: '0.01em',
    },
    headerOrg: { fontSize: '13px', fontWeight: FW_LIGHT, color: t.TEXT_MUTED },
    divider:   { height: '1px', background: t.BORDER, marginBottom: '32px' },
    columns: {
      display: 'grid',
      gridTemplateColumns: isNarrow ? '1fr' : '3fr 2fr',
      gap: isNarrow ? '24px' : '36px', alignItems: 'start',
    },
    colHeader: {
      display: 'flex', justifyContent: 'flex-start',
      alignItems: 'baseline', gap: '8px', marginBottom: '4px',
    },
    colHeaderLabel: {
      fontSize: '13px', fontWeight: FW_SEMIBOLD, letterSpacing: '0.06em',
      textTransform: 'uppercase', color: t.ACCENT,
    },
    colHeaderCount: {
      fontSize: '13px', fontWeight: FW_REGULAR,
      color: t.TEXT_MUTED, fontFamily: FONT_BODY,
    },

    // ── Shared card geometry ───────────────────────────────────────────────
    // Both meeting and task cards: height: 64px, left col 48px, right col flex.
    // This makes them align as a true grid across the two columns.

    meetingCard: {
      background: t.SURFACE, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_LG, boxShadow: SHADOW_MD,
      marginBottom: '8px', overflow: 'hidden',
      display: 'flex', alignItems: 'stretch', height: '64px',
      minWidth: 0, width: '100%',
    },
    meetingCardInner: {
      display: 'flex', alignItems: 'center',
      padding: '0 14px 0 16px', flex: 1, gap: '0', minWidth: 0,
    },
    taskCard: () => ({
      background: t.SURFACE, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_LG, boxShadow: SHADOW_MD,
      marginBottom: '8px', overflow: 'hidden',
      display: 'flex', alignItems: 'stretch', height: '64px',
      minWidth: 0, width: '100%',
    }),
    taskStrip: (color) => ({
      width: '4px', flexShrink: 0, background: color,
    }),
    taskCardInner: {
      display: 'flex', alignItems: 'center',
      padding: '0 14px 0 12px', flex: 1, gap: '10px', minWidth: 0,
    },

    // Left element — fixed 48px column
    leftCol: {
      width: isMobile ? '56px' : '104px', flexShrink: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      paddingLeft: isMobile ? '14px' : '14px', paddingRight: isMobile ? '8px' : '12px',
    },
    meetingTimeText: {
      fontSize: '13px', fontWeight: FW_MEDIUM, color: t.TEXT_MUTED,
      fontFamily: FONT_BODY, lineHeight: 1.2, whiteSpace: 'nowrap',
      textAlign: 'center',
    },

    // Right content — two lines
    cardContent: {
      flex: 1, minWidth: 0,
      display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1px',
    },
    cardClientName: {
      fontSize: '13px', fontWeight: FW_MEDIUM, color: t.TEXT,
      fontFamily: FONT_BODY, margin: 0,
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    },
    cardDetail: {
      fontSize: '13px', fontWeight: FW_LIGHT, color: t.TEXT_MUTED,
      fontFamily: FONT_BODY, margin: 0,
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    },
    cardLink: { color: t.ACCENT, textDecoration: 'none' },

    // Legend
    legendRow: {
      display: 'flex', alignItems: 'center', gap: '16px',
      height: '36px', marginBottom: '12px',
    },
    legendItem: {
      display: 'flex', alignItems: 'center', gap: '6px',
      fontSize: '12px', fontWeight: FW_REGULAR, color: t.TEXT_MUTED, fontFamily: FONT_BODY,
    },
    legendDot: (color) => ({
      width: '8px', height: '8px', borderRadius: '2px',
      background: color, flexShrink: 0,
    }),
    emptyState: {
      fontSize: '13px', fontWeight: FW_LIGHT,
      color: t.TEXT_SUBTLE, padding: '16px 0',
    },
  };

  // Task strip colors
  const STRIP_OVERDUE  = 'rgba(210, 120, 100, 0.75)'; // dusty pastel red
  const STRIP_TODAY    = ACCENT;                        // green
  const STRIP_SOON     = COLOR_INFO;                    // blue

  // ── Sub-components ────────────────────────────────────────────────────────

  function MeetingCard({ meeting }) {
    const timeStr = new Date(meeting.scheduled_at)
      .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const clientName = clientMap[meeting.client_id] || '—';
    const detail = meeting.description || meeting.category || '—';
    return (
      <div style={s.meetingCard}>
        {/* Left: time as link to CRM calendar */}
        <div style={s.leftCol}>
          <Link
            to="/hq/crm"
            state={{ from: '/hq/brief' }}
            style={{ ...s.meetingTimeText, textDecoration: 'none', color: t.TEXT_MUTED }}
          >
            {timeStr}
          </Link>
        </div>
        {/* Right: two lines */}
        <div style={s.meetingCardInner}>
          <div style={s.cardContent}>
            <p style={s.cardClientName}>
              {meeting.client_id ? (
                <Link to={`/hq/clients/${meeting.client_id}`}
                  state={{ from: '/hq/brief' }} style={s.cardLink}>
                  {clientName}
                </Link>
              ) : clientName}
            </p>
            <p style={s.cardDetail}>{detail}</p>
          </div>
        </div>
      </div>
    );
  }

  function TaskCard({ task, stripColor }) {
    return (
      <div style={s.taskCard()}>
        <div style={s.taskStrip(stripColor)} />
        {/* Left: circle centered */}
        <div style={{ ...s.leftCol, paddingLeft: '10px' }}>
          <CheckCircle
            completing={completing === task.id}
            onClick={() => completeTask(task.id)}
          />
        </div>
        {/* Right: two lines */}
        <div style={s.taskCardInner}>
          <div style={s.cardContent}>
            <p style={s.cardClientName}>
              {task.client_id ? (
                <Link to={`/hq/clients/${task.client_id}`}
                  state={{ from: '/hq/brief' }} style={s.cardLink}>
                  {task.clientName}
                </Link>
              ) : task.clientName}
            </p>
            <p style={s.cardDetail}>{task.title}</p>
          </div>
        </div>
      </div>
    );
  }

  function TaskSection({ tasks: sectionTasks, stripColor }) {
    return sectionTasks.map(tk => (
      <TaskCard key={tk.id} task={tk} stripColor={stripColor} />
    ));
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={s.pageWrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
      `}</style>
      <div style={s.page}>

        <div style={s.pageHeader}>
          <p style={s.headerDate}>{formatDate(todayStr())}</p>
          {orgName && <p style={s.headerOrg}>{orgName}</p>}
        </div>
        <div style={s.divider} />

        {loading ? (
          <p style={{ fontSize: '13px', fontWeight: FW_LIGHT, color: t.TEXT_MUTED, padding: '40px 0' }}>
            Loading your brief…
          </p>
        ) : (
          <div style={s.columns}>

            {/* ── Meetings ─────────────────────────────────────────── */}
            <div style={{ minWidth: 0 }}>
              <div style={s.colHeader}>
                <span style={s.colHeaderLabel}>Meetings</span>
                {dayMeetingCount > 0 && (
                  <span style={s.colHeaderCount}>· {dayMeetingCount}</span>
                )}
              </div>

              <CalendarView
                meetings={meetings}
                clients={clients}
                navigate={navigate}
                defaultView="day"
                defaultDate={new Date()}
                hideViewToggle={true}
                cardContent={(dayMeetings) => {
                  // Sync count to header — runs on every day navigation
                  if (dayMeetings.length !== dayMeetingCount) {
                    setDayMeetingCount(dayMeetings.length);
                  }
                  return dayMeetings.length === 0 ? (
                    <p style={s.emptyState}>No meetings scheduled.</p>
                  ) : (
                    <div style={{ marginTop: '4px' }}>
                      {dayMeetings.map(m => <MeetingCard key={m.id} meeting={m} />)}
                    </div>
                  );
                }}
              />
            </div>

            {/* ── Tasks ────────────────────────────────────────────── */}
            <div style={{ minWidth: 0 }}>
              <div style={s.colHeader}>
                <span style={s.colHeaderLabel}>Open Tasks</span>
                {tasks.length > 0 && (
                  <span style={s.colHeaderCount}>· {tasks.length}</span>
                )}
              </div>

              {/* Legend — sits in same vertical space as CalendarView nav */}
              <div style={s.legendRow}>
                {pastDueTasks.length  > 0 && (
                  <div style={s.legendItem}>
                    <div style={s.legendDot(STRIP_OVERDUE)} />
                    <span>Past due</span>
                  </div>
                )}
                {todayTasks.length   > 0 && (
                  <div style={s.legendItem}>
                    <div style={s.legendDot(STRIP_TODAY)} />
                    <span>Due today</span>
                  </div>
                )}
                {dueSoonTasks.length > 0 && (
                  <div style={s.legendItem}>
                    <div style={s.legendDot(STRIP_SOON)} />
                    <span>Due soon</span>
                  </div>
                )}
              </div>

              {tasks.length === 0 ? (
                <p style={s.emptyState}>No overdue or upcoming tasks. You're all caught up.</p>
              ) : (
                <>
                  <TaskSection tasks={pastDueTasks}  stripColor={STRIP_OVERDUE} />
                  <TaskSection tasks={todayTasks}    stripColor={STRIP_TODAY}   />
                  <TaskSection tasks={dueSoonTasks}  stripColor={STRIP_SOON}    />
                </>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}