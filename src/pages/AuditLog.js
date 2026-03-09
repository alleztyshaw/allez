import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useOrg } from '../context/OrgContext';
import {
  FONT_BODY, FONT_DISPLAY,
  RADIUS_LG, RADIUS_MD, RADIUS_PILL,
  SHADOW_MD,
  FULL_ACCESS_ROLES,
  pageStyles,
  FW_LIGHT, FW_REGULAR, FW_SEMIBOLD,
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

const ACTION_COLORS = {
  INSERT: { color: '#34d399', bg: 'rgba(52,211,153,0.10)', label: 'Created'  },
  UPDATE: { color: '#60a5fa', bg: 'rgba(96,165,250,0.10)', label: 'Updated'  },
  DELETE: { color: '#f87171', bg: 'rgba(248,113,113,0.10)', label: 'Deleted' },
};

const TABLE_LABELS = {
  clients:      'Client',
  notes:        'Note',
  client_tasks: 'Task',
};

// Field names → readable labels for the change diff
const FIELD_LABELS = {
  first_name:               'First Name',
  last_name:                'Last Name',
  email:                    'Email',
  phone:                    'Phone',
  date_of_birth:            'Date of Birth',
  status:                   'Status',
  pipeline_stage:           'Pipeline Stage',
  is_reactivation:          'Reactivation Flag',
  asset_level:              'Asset Level',
  aum:                      'AUM',
  fee_rate:                 'Fee Rate',
  custodian:                'Custodian',
  risk_tolerance:           'Risk Tolerance',
  investment_objective:     'Investment Objective',
  time_horizon:             'Time Horizon',
  tax_bracket:              'Tax Bracket',
  liquidity_needs:          'Liquidity Needs',
  referral_source:          'Referral Source',
  client_since:             'Client Since',
  next_review_date:         'Next Review Date',
  preferred_contact_method: 'Preferred Contact',
  communication_frequency:  'Communication Frequency',
  notes:                    'Notes',
  title:                    'Title',
  body:                     'Body',
  note_type:                'Note Type',
  due_date:                 'Due Date',
  completed:                'Completed',
  completed_at:             'Completed At',
  assigned_to:              'Assigned To',
};

function formatFieldValue(field, val) {
  if (val === null || val === undefined || val === '') return '—';
  const raw = typeof val === 'object' ? JSON.stringify(val) : String(val);
  if (field === 'aum') {
    const n = Number(raw);
    if (!isNaN(n)) {
      if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
      if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
      return `$${n.toLocaleString()}`;
    }
  }
  if (field === 'fee_rate') {
    const n = Number(raw);
    if (!isNaN(n)) return `${(n * 100).toFixed(2)}%`;
  }
  if (field === 'completed') return raw === 'true' ? 'Yes' : 'No';
  return raw;
}

function formatTime(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDate(isoStr) {
  const d = new Date(isoStr);
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(d, today))     return 'Today';
  if (sameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function groupByDate(logs) {
  const groups = {};
  logs.forEach(log => {
    const key = new Date(log.changed_at).toDateString();
    if (!groups[key]) groups[key] = { label: formatDate(log.changed_at), items: [] };
    groups[key].items.push(log);
  });
  return Object.values(groups);
}

export default function AuditLog() {
  const t = useTokens();
  const { orgId, userRole: contextRole } = useOrg();
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < MOBILE_BREAKPOINT;

  const [logs, setLogs]           = useState([]);
  const [members, setMembers]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState({});

  // Filters
  const [filterTable,  setFilterTable]  = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [filterUser,   setFilterUser]   = useState('all');
  const [filterFrom,   setFilterFrom]   = useState('');
  const [filterTo,     setFilterTo]     = useState('');

  const fetchLogs = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    let query = supabase
      .from('activity_log')
      .select('*')
      .eq('org_id', orgId)
      .order('changed_at', { ascending: false })
      .limit(500);

    if (filterTable  !== 'all') query = query.eq('table_name', filterTable);
    if (filterAction !== 'all') query = query.eq('action', filterAction);
    if (filterUser   !== 'all') query = query.eq('changed_by', filterUser);
    if (filterFrom)             query = query.gte('changed_at', filterFrom);
    if (filterTo)               query = query.lte('changed_at', filterTo + 'T23:59:59');

    const { data, error } = await query;
    if (error) {
      console.error('audit_log fetch error:', error.message || error);
      setLogs([]);
    } else {
      setLogs(data || []);
    }
    setLoading(false);
  }, [orgId, filterTable, filterAction, filterUser, filterFrom, filterTo]);

  // Fetch org members for the user filter dropdown via SECURITY DEFINER RPC
  // Direct org_members query only returns the current user's row due to RLS
  useEffect(() => {
    if (!orgId) return;
    supabase.rpc('get_org_members', { target_org_id: orgId })
      .then(({ data }) => setMembers(data || []));
  }, [orgId]);

  useEffect(() => { if (contextRole) fetchLogs(); }, [fetchLogs, contextRole]);

  function memberName(userId) {
    const m = members.find(m => m.user_id === userId);
    if (!m || !m.first_name) return 'Unknown user';
    return `${m.first_name} ${m.last_name}`;
  }

  function toggleExpand(id) {
    setExpanded(e => ({ ...e, [id]: !e[id] }));
  }

  // ── Access gate ─────────────────────────────────────────────────────────────
  if (contextRole && !FULL_ACCESS_ROLES.includes(contextRole)) {
    return (
      <div style={{ padding: '80px 32px', textAlign: 'center' }}>
        <p style={{ color: t.TEXT_MUTED, fontFamily: FONT_BODY }}>
          You don't have permission to view audit logs.
        </p>
      </div>
    );
  }

  const grouped = groupByDate(logs);

  const s = {
    ...pageStyles(t, isMobile),
    filterRow:    { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '32px', alignItems: 'flex-end' },
    filterGroup:  { display: 'flex', flexDirection: 'column', gap: '4px' },
    filterLabel:  { fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.TEXT_MUTED, fontFamily: FONT_BODY },
    filterSelect: { fontFamily: FONT_BODY, fontSize: '13px', background: t.SURFACE, color: t.TEXT, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '7px 10px', cursor: 'pointer' },
    filterInput:  { fontFamily: FONT_BODY, fontSize: '13px', background: t.SURFACE, color: t.TEXT, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '7px 10px' },
    dateLabel:    { fontSize: '11px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.TEXT_MUTED, margin: '0 0 10px', fontFamily: FONT_BODY },
    logCard:      { background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, padding: '14px 18px', marginBottom: '8px', boxShadow: SHADOW_MD },
    logRow:       { display: 'flex', alignItems: 'flex-start', gap: '12px' },
    actionBadge:  (action) => ({
      fontSize: '10px', fontWeight: FW_SEMIBOLD, padding: '2px 9px', fontFamily: FONT_BODY,
      borderRadius: RADIUS_PILL, flexShrink: 0, marginTop: '2px',
      background: ACTION_COLORS[action]?.bg || t.SURFACE_ALT,
      color: ACTION_COLORS[action]?.color || t.TEXT_MUTED,
      border: `1px solid ${ACTION_COLORS[action]?.color || t.BORDER}44`,
      textTransform: 'uppercase', letterSpacing: '0.06em',
    }),
    tableBadge:   { fontSize: '10px', fontWeight: FW_SEMIBOLD, padding: '2px 9px', borderRadius: RADIUS_PILL, fontFamily: FONT_BODY, background: t.SURFACE_ALT, color: t.TEXT_MUTED, border: `1px solid ${t.BORDER}`, flexShrink: 0, marginTop: '2px', letterSpacing: '0.04em' },
    logMain:      { flex: 1, minWidth: 0 },
    logLabel:     { fontSize: '15px', fontWeight: FW_REGULAR, color: t.TEXT, margin: '0 0 2px', fontFamily: FONT_DISPLAY, letterSpacing: '0.01em' },
    logMeta:      { fontSize: '12px', color: t.TEXT_MUTED, fontWeight: FW_LIGHT, fontFamily: FONT_BODY },
    expandBtn:    { background: 'none', border: 'none', color: t.ACCENT, fontSize: '11px', fontWeight: FW_SEMIBOLD, cursor: 'pointer', padding: '4px 0 0', fontFamily: FONT_BODY },
    changeRow:    { display: 'flex', gap: '8px', alignItems: 'baseline', padding: '4px 0', borderBottom: `1px solid ${t.BORDER}` },
    changeField:  { fontSize: '11px', fontWeight: FW_SEMIBOLD, color: t.TEXT_MUTED, fontFamily: FONT_BODY, minWidth: '140px', flexShrink: 0 },
    changeOld:    { fontSize: '12px', color: '#f87171', fontWeight: FW_LIGHT, fontFamily: FONT_BODY, textDecoration: 'line-through', flex: 1 },
    changeNew:    { fontSize: '12px', color: '#34d399', fontWeight: FW_REGULAR, fontFamily: FONT_BODY, flex: 1 },
    emptyState:   { background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, padding: '48px', textAlign: 'center', color: t.TEXT_MUTED, fontSize: '14px', fontWeight: FW_LIGHT, fontFamily: FONT_BODY },
    clearBtn:     { background: 'none', border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '7px 14px', fontSize: '12px', color: t.TEXT_MUTED, cursor: 'pointer', fontFamily: FONT_BODY },
  };

  const hasFilters = filterTable !== 'all' || filterAction !== 'all' || filterUser !== 'all' || filterFrom || filterTo;

  return (
    <div style={s.pageWrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div style={s.page}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Audit Log</h1>
            <p style={s.subtitle}>
              A record of all writes to client, note, and task data across your organization.
              Visible to admin and compliance roles only.
            </p>
          </div>
        </div>

      {/* Filters */}
      <div style={s.filterRow}>
        <div style={s.filterGroup}>
          <span style={s.filterLabel}>Record Type</span>
          <select style={s.filterSelect} value={filterTable} onChange={e => setFilterTable(e.target.value)}>
            <option value="all">All types</option>
            <option value="clients">Clients</option>
            <option value="notes">Notes</option>
            <option value="client_tasks">Tasks</option>
          </select>
        </div>
        <div style={s.filterGroup}>
          <span style={s.filterLabel}>Action</span>
          <select style={s.filterSelect} value={filterAction} onChange={e => setFilterAction(e.target.value)}>
            <option value="all">All actions</option>
            <option value="INSERT">Created</option>
            <option value="UPDATE">Updated</option>
            <option value="DELETE">Deleted</option>
          </select>
        </div>
        <div style={s.filterGroup}>
          <span style={s.filterLabel}>User</span>
          <select style={s.filterSelect} value={filterUser} onChange={e => setFilterUser(e.target.value)}>
            <option value="all">All users</option>
            {members.filter(m => m.first_name).map(m => (
              <option key={m.user_id} value={m.user_id}>
                {m.first_name} {m.last_name}
              </option>
            ))}
          </select>
        </div>
        {!isMobile && (
          <>
            <div style={s.filterGroup}>
              <span style={s.filterLabel}>From</span>
              <input type="date" style={s.filterInput} value={filterFrom} onChange={e => setFilterFrom(e.target.value)} />
            </div>
            <div style={s.filterGroup}>
              <span style={s.filterLabel}>To</span>
              <input type="date" style={s.filterInput} value={filterTo} onChange={e => setFilterTo(e.target.value)} />
            </div>
          </>
        )}
        {hasFilters && (
          <div style={s.filterGroup}>
            <span style={s.filterLabel}>&nbsp;</span>
            <button style={s.clearBtn} onClick={() => {
              setFilterTable('all'); setFilterAction('all');
              setFilterUser('all'); setFilterFrom(''); setFilterTo('');
            }}>
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Log entries */}
      {loading ? (
        <div style={s.emptyState}>Loading audit log…</div>
      ) : logs.length === 0 ? (
        <div style={s.emptyState}>No activity found{hasFilters ? ' for these filters' : ''}.</div>
      ) : (
        grouped.map(group => (
          <div key={group.label} style={{ marginBottom: '28px' }}>
            <p style={s.dateLabel}>{group.label}</p>
            {group.items.map(log => {
              const ac = ACTION_COLORS[log.action];
              const isExpanded = expanded[log.id];
              const changeKeys = log.changes ? Object.keys(log.changes) : [];
              return (
                <div key={log.id} style={s.logCard}>
                  <div style={s.logRow}>
                    <span style={s.actionBadge(log.action)}>
                      {ac?.label || log.action}
                    </span>
                    <span style={s.tableBadge}>
                      {TABLE_LABELS[log.table_name] || log.table_name}
                    </span>
                    <div style={s.logMain}>
                      <p style={s.logLabel}>{log.record_label || 'Unknown record'}</p>
                      <p style={s.logMeta}>
                        {memberName(log.changed_by)} · {formatTime(log.changed_at)}
                        {log.action === 'UPDATE' && changeKeys.length > 0 && (
                          <> · {changeKeys.length} field{changeKeys.length > 1 ? 's' : ''} changed</>
                        )}
                      </p>
                      {/* Expandable field diff for UPDATE */}
                      {log.action === 'UPDATE' && changeKeys.length > 0 && (
                        <>
                          <button style={s.expandBtn} onClick={() => toggleExpand(log.id)}>
                            {isExpanded ? 'Hide changes' : 'View changes'}
                          </button>
                          {isExpanded && (
                            <div style={{ marginTop: '10px', borderTop: `1px solid ${t.BORDER}`, paddingTop: '10px' }}>
                              {changeKeys.map(field => {
                                const { old: oldVal, new: newVal } = log.changes[field];
                                return (
                                  <div key={field} style={s.changeRow}>
                                    <span style={s.changeField}>
                                      {FIELD_LABELS[field] || field}
                                    </span>
                                    <span style={s.changeOld}>
                                      {formatFieldValue(field, oldVal)}
                                    </span>
                                    <span style={{ fontSize: '11px', color: t.TEXT_SUBTLE, flexShrink: 0, padding: '0 4px' }}>→</span>
                                    <span style={s.changeNew}>
                                      {formatFieldValue(field, newVal)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))
      )}
      </div>
    </div>
  );
}