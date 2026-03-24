import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useOrg } from '../context/OrgContext';
import {
  FONT_BODY,
  RADIUS_LG, RADIUS_MD, RADIUS_PILL,
  SHADOW_MD,
  FULL_ACCESS_ROLES,
  pageStyles,
  FW_LIGHT, FW_REGULAR, FW_MEDIUM, FW_SEMIBOLD,
  MOBILE_BREAKPOINT,
  COLOR_ERROR, COLOR_WARNING, COLOR_INFO,
  ACCENT, ACCENT_MUTED, ACCENT_BORDER,
} from '../utils/hqConstants';
import { useTokens } from '../context/ThemeContext';
import useWindowWidth from '../hooks/useWindowWidth';

// ── Constants ───────────────────────────────────────────────────────────────

const ACTION_META = {
  INSERT: {
    label: 'Created',
    color: ACCENT,
    bg:    ACCENT_MUTED,
    border: ACCENT_BORDER,
  },
  UPDATE: {
    label: 'Updated',
    color: COLOR_INFO,
    bg:    'rgba(96,165,250,0.10)',
    border: 'rgba(96,165,250,0.30)',
  },
  DELETE: {
    label: 'Deleted',
    color: COLOR_ERROR,
    bg:    'rgba(248,113,113,0.10)',
    border: 'rgba(248,113,113,0.30)',
  },
};

const SEVERITY_META = {
  high:   { color: COLOR_ERROR,   bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.30)' },
  medium: { color: COLOR_WARNING, bg: 'rgba(251,191,36,0.10)',  border: 'rgba(251,191,36,0.30)'  },
  low:    { color: ACCENT,        bg: ACCENT_MUTED,             border: ACCENT_BORDER            },
};

const TABLE_LABELS = {
  clients:      'Client',
  notes:        'Note',
  client_tasks: 'Task',
};

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

// ── Helpers ─────────────────────────────────────────────────────────────────

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

function formatDateTime(isoStr) {
  const d = new Date(isoStr);
  const today     = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate();

  const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (sameDay(d, today))     return { date: 'Today',     time: timeStr };
  if (sameDay(d, yesterday)) return { date: 'Yesterday', time: timeStr };
  return {
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: timeStr,
  };
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AuditLog() {
  const t           = useTokens();
  const { orgId, userRole: contextRole } = useOrg();
  const windowWidth = useWindowWidth();
  const isMobile    = windowWidth < MOBILE_BREAKPOINT;

  const [logs,           setLogs]           = useState([]);
  const [members,        setMembers]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [expanded,       setExpanded]       = useState({});
  const [activeTab,      setActiveTab]      = useState('audit'); // 'audit' | 'flagged'
  const [flaggedNotes,   setFlaggedNotes]   = useState([]);
  const [flaggedLoading, setFlaggedLoading] = useState(false);
  const [flaggedClients, setFlaggedClients] = useState({});
  const [expandedFlags,  setExpandedFlags]  = useState({});

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

  useEffect(() => {
    if (!orgId) return;
    supabase.rpc('get_org_members', { target_org_id: orgId })
      .then(({ data }) => setMembers(data || []));
  }, [orgId]);

  useEffect(() => { if (contextRole) fetchLogs(); }, [fetchLogs, contextRole]);

  useEffect(() => {
    if (!orgId || activeTab !== 'flagged') return;
    async function fetchFlagged() {
      setFlaggedLoading(true);
      const { data: notes } = await supabase
        .from('notes')
        .select('id, title, body, note_type, client_id, created_at, compliance_severity, compliance_reasons, compliance_flagged_at')
        .eq('org_id', orgId)
        .eq('compliance_flagged', true)
        .is('deleted_at', null)
        .order('compliance_flagged_at', { ascending: false });
      setFlaggedNotes(notes || []);
      const clientIds = [...new Set((notes || []).map(n => n.client_id).filter(Boolean))];
      if (clientIds.length) {
        const { data: clients } = await supabase
          .from('clients')
          .select('id, first_name, last_name')
          .in('id', clientIds);
        const map = {};
        (clients || []).forEach(c => { map[c.id] = `${c.first_name} ${c.last_name}`; });
        setFlaggedClients(map);
      }
      setFlaggedLoading(false);
    }
    fetchFlagged();
  }, [orgId, activeTab]);

  function memberName(userId) {
    const m = members.find(mb => mb.user_id === userId);
    if (!m || !m.first_name) return 'Unknown user';
    return `${m.first_name} ${m.last_name}`;
  }

  function toggleExpand(id) {
    setExpanded(e => ({ ...e, [id]: !e[id] }));
  }

  function toggleFlagExpand(id) {
    setExpandedFlags(e => ({ ...e, [id]: !e[id] }));
  }

  // ── Access gate ─────────────────────────────────────────────────────────
  if (contextRole && !FULL_ACCESS_ROLES.includes(contextRole)) {
    return (
      <div style={{ padding: '80px 32px', textAlign: 'center' }}>
        <p style={{ color: t.TEXT_MUTED, fontFamily: FONT_BODY }}>
          You don't have permission to view audit logs.
        </p>
      </div>
    );
  }

  const hasFilters = filterTable !== 'all' || filterAction !== 'all' || filterUser !== 'all' || filterFrom || filterTo;

  // Column grid — different widths for mobile vs desktop
  const auditCols    = isMobile ? '100px 86px 1fr'        : '140px 100px 86px 1fr 160px 80px';
  const flaggedCols  = isMobile ? '1fr 86px'              : '1fr 160px 90px 140px 80px';

  // ── Styles ───────────────────────────────────────────────────────────────
  const s = {
    ...pageStyles(t, isMobile),
    tabRow: {
      display: 'flex', gap: '4px', marginBottom: '28px',
      borderBottom: `1px solid ${t.BORDER}`,
    },
    tab: {
      padding: '8px 20px', fontSize: '13px', fontWeight: FW_MEDIUM,
      fontFamily: FONT_BODY, cursor: 'pointer', background: 'none', border: 'none',
      borderBottom: '2px solid transparent', color: t.TEXT_MUTED, marginBottom: '-1px',
    },
    tabActive: { color: t.TEXT, borderBottom: `2px solid ${t.ACCENT}` },

    // Filters
    filterRow:   { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'flex-end' },
    filterGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
    filterLabel: { fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.TEXT_MUTED, fontFamily: FONT_BODY },
    filterSelect:{ fontFamily: FONT_BODY, fontSize: '13px', background: t.SURFACE, color: t.TEXT, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '7px 10px', cursor: 'pointer' },
    filterInput: { fontFamily: FONT_BODY, fontSize: '13px', background: t.SURFACE, color: t.TEXT, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '7px 10px' },
    clearBtn:    { background: 'none', border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '7px 14px', fontSize: '12px', color: t.TEXT_MUTED, cursor: 'pointer', fontFamily: FONT_BODY },

    // Table shared
    tableWrap: { border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, overflow: 'hidden', boxShadow: SHADOW_MD },
    tableHead: (cols) => ({
      display: 'grid', gridTemplateColumns: cols,
      padding: '10px 20px', background: t.SURFACE_ALT,
      borderBottom: `1px solid ${t.BORDER}`, gap: '8px', alignItems: 'center',
    }),
    colHeader: {
      fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase',
      letterSpacing: '0.08em', color: t.TEXT_MUTED, fontFamily: FONT_BODY,
    },
    tableRow: (cols, isLast) => ({
      display: 'grid', gridTemplateColumns: cols,
      padding: '13px 20px', background: t.SURFACE, gap: '8px', alignItems: 'center',
      borderBottom: isLast ? 'none' : `1px solid ${t.BORDER}`,
    }),
    expandPanel: {
      padding: '12px 20px 14px', background: t.SURFACE_ALT,
      borderBottom: `1px solid ${t.BORDER}`,
    },

    // Badges
    actionBadge: (action) => {
      const m = ACTION_META[action] || {};
      return {
        display: 'inline-block', fontSize: '10px', fontWeight: FW_SEMIBOLD,
        padding: '2px 9px', borderRadius: RADIUS_PILL, fontFamily: FONT_BODY,
        background: m.bg || t.SURFACE_ALT, color: m.color || t.TEXT_MUTED,
        border: `1px solid ${m.border || t.BORDER}`,
        textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
      };
    },
    typeBadge: {
      display: 'inline-block', fontSize: '10px', fontWeight: FW_SEMIBOLD,
      padding: '2px 9px', borderRadius: RADIUS_PILL, fontFamily: FONT_BODY,
      background: t.SURFACE_ALT, color: t.TEXT_MUTED,
      border: `1px solid ${t.BORDER}`,
      letterSpacing: '0.04em', whiteSpace: 'nowrap',
    },
    severityBadge: (sev) => {
      const m = SEVERITY_META[sev] || SEVERITY_META.low;
      return {
        display: 'inline-block', fontSize: '10px', fontWeight: FW_SEMIBOLD,
        padding: '2px 9px', borderRadius: RADIUS_PILL, fontFamily: FONT_BODY,
        background: m.bg, color: m.color, border: `1px solid ${m.border}`,
        textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
      };
    },

    // Cell text
    cellPrimary: { fontSize: '13px', fontWeight: FW_REGULAR, color: t.TEXT, fontFamily: FONT_BODY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    cellMuted:   { fontSize: '11px', fontWeight: FW_LIGHT,   color: t.TEXT_MUTED, fontFamily: FONT_BODY },
    detailsBtn:  { background: 'none', border: 'none', color: t.ACCENT, fontSize: '11px', fontWeight: FW_SEMIBOLD, cursor: 'pointer', padding: 0, fontFamily: FONT_BODY, whiteSpace: 'nowrap' },

    // Change diff rows
    changeRow:   { display: 'flex', gap: '8px', alignItems: 'baseline', padding: '5px 0', borderBottom: `1px solid ${t.BORDER}` },
    changeField: { fontSize: '11px', fontWeight: FW_SEMIBOLD, color: t.TEXT_MUTED, fontFamily: FONT_BODY, minWidth: '140px', flexShrink: 0 },
    changeOld:   { fontSize: '12px', color: COLOR_ERROR, fontWeight: FW_LIGHT, fontFamily: FONT_BODY, textDecoration: 'line-through', flex: 1 },
    changeArrow: { fontSize: '11px', color: t.TEXT_SUBTLE, flexShrink: 0, padding: '0 4px' },
    changeNew:   { fontSize: '12px', color: ACCENT, fontWeight: FW_REGULAR, fontFamily: FONT_BODY, flex: 1 },

    emptyState: {
      background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG,
      padding: '48px', textAlign: 'center', color: t.TEXT_MUTED,
      fontSize: '14px', fontWeight: FW_LIGHT, fontFamily: FONT_BODY,
    },
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={s.pageWrapper}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        .audit-row:hover > div { background: ${t.SURFACE_ALT} !important; }
      `}</style>
      <div style={s.page}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Audit Log</h1>
            <p style={s.subtitle}>
              A complete record of all writes to client, note, and task data across your organization.
              Visible to admin and compliance roles only.
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div style={s.tabRow}>
          {[['audit', 'Audit Log'], ['flagged', 'Flagged Notes']].map(([key, label]) => (
            <button
              key={key}
              style={{ ...s.tab, ...(activeTab === key ? s.tabActive : {}) }}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Flagged Notes tab ─────────────────────────────────────────── */}
        {activeTab === 'flagged' && (
          flaggedLoading ? (
            <div style={s.emptyState}>Loading flagged notes…</div>
          ) : flaggedNotes.length === 0 ? (
            <div style={s.emptyState}>
              No flagged notes. Run a compliance scan on any AI note from the Notes page.
            </div>
          ) : (
            <div style={s.tableWrap}>
              {/* Header */}
              <div style={s.tableHead(flaggedCols)}>
                <span style={s.colHeader}>Note</span>
                {!isMobile && <span style={s.colHeader}>Client</span>}
                <span style={s.colHeader}>Severity</span>
                {!isMobile && <span style={s.colHeader}>Flagged</span>}
                {!isMobile && <span style={s.colHeader}>Reasons</span>}
              </div>

              {/* Rows */}
              {flaggedNotes.map((note, idx) => {
                const isLast    = idx === flaggedNotes.length - 1;
                const isExpanded = expandedFlags[note.id];
                const reasons   = note.compliance_reasons || [];
                const flaggedDate = note.compliance_flagged_at
                  ? new Date(note.compliance_flagged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '—';
                const clientName = flaggedClients[note.client_id] || '—';

                return (
                  <div key={note.id} className="audit-row">
                    <div style={s.tableRow(flaggedCols, isLast && !isExpanded)}>
                      {/* Note title */}
                      <div style={{ overflow: 'hidden' }}>
                        <div style={s.cellPrimary}>{note.title}</div>
                        {isMobile && (
                          <div style={s.cellMuted}>{clientName} · {flaggedDate}</div>
                        )}
                      </div>
                      {!isMobile && <div style={s.cellPrimary}>{clientName}</div>}
                      {/* Severity */}
                      <div>
                        <span style={s.severityBadge(note.compliance_severity)}>
                          {note.compliance_severity || 'flagged'}
                        </span>
                      </div>
                      {!isMobile && <div style={s.cellMuted}>{flaggedDate}</div>}
                      {/* Reasons toggle */}
                      {!isMobile && (
                        <div>
                          {reasons.length > 0 ? (
                            <button style={s.detailsBtn} onClick={() => toggleFlagExpand(note.id)}>
                              {isExpanded ? 'Hide' : `${reasons.length} reason${reasons.length > 1 ? 's' : ''}`}
                            </button>
                          ) : (
                            <span style={s.cellMuted}>—</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Expanded reasons */}
                    {isExpanded && reasons.length > 0 && (
                      <div style={{ ...s.expandPanel, borderBottom: isLast ? 'none' : `1px solid ${t.BORDER}` }}>
                        {reasons.map((r, i) => (
                          <p key={i} style={{ ...s.cellMuted, margin: '3px 0', lineHeight: '1.6' }}>· {r}</p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ── Audit Log tab ────────────────────────────────────────────── */}
        {activeTab === 'audit' && (
          <div>

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

            {/* Table */}
            {loading ? (
              <div style={s.emptyState}>Loading audit log…</div>
            ) : logs.length === 0 ? (
              <div style={s.emptyState}>
                No activity found{hasFilters ? ' for these filters' : ''}.
              </div>
            ) : (
              <div style={s.tableWrap}>

                {/* Header row */}
                <div style={s.tableHead(auditCols)}>
                  <span style={s.colHeader}>Date &amp; Time</span>
                  <span style={s.colHeader}>Action</span>
                  {!isMobile && <span style={s.colHeader}>Type</span>}
                  <span style={s.colHeader}>Description</span>
                  {!isMobile && <span style={s.colHeader}>User</span>}
                  {!isMobile && <span style={s.colHeader}>Changes</span>}
                </div>

                {/* Data rows */}
                {logs.map((log, idx) => {
                  const isLast     = idx === logs.length - 1;
                  const isExpanded = expanded[log.id];
                  const changeKeys = log.changes ? Object.keys(log.changes) : [];
                  const { date, time } = formatDateTime(log.changed_at);
                  const typeLabel  = TABLE_LABELS[log.table_name] || log.table_name;
                  const user       = memberName(log.changed_by);

                  return (
                    <div key={log.id} className="audit-row">
                      {/* Main row */}
                      <div style={s.tableRow(auditCols, isLast && !isExpanded)}>

                        {/* Date & Time */}
                        <div>
                          <div style={s.cellPrimary}>{date}</div>
                          <div style={s.cellMuted}>{time}</div>
                        </div>

                        {/* Action badge */}
                        <div>
                          <span style={s.actionBadge(log.action)}>
                            {ACTION_META[log.action]?.label || log.action}
                          </span>
                        </div>

                        {/* Record type badge */}
                        {!isMobile && (
                          <div>
                            <span style={s.typeBadge}>{typeLabel}</span>
                          </div>
                        )}

                        {/* Description */}
                        <div style={{ overflow: 'hidden' }}>
                          <div style={s.cellPrimary}>{log.record_label || 'Unknown record'}</div>
                          {isMobile && (
                            <div style={s.cellMuted}>{typeLabel} · {user}</div>
                          )}
                        </div>

                        {/* User */}
                        {!isMobile && (
                          <div style={{ ...s.cellPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user}
                          </div>
                        )}

                        {/* Changes toggle */}
                        {!isMobile && (
                          <div>
                            {log.action === 'UPDATE' && changeKeys.length > 0 ? (
                              <button style={s.detailsBtn} onClick={() => toggleExpand(log.id)}>
                                {isExpanded
                                  ? 'Hide'
                                  : `${changeKeys.length} field${changeKeys.length > 1 ? 's' : ''}`
                                }
                              </button>
                            ) : (
                              <span style={s.cellMuted}>—</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Expanded field diff — UPDATE only */}
                      {isExpanded && changeKeys.length > 0 && (
                        <div style={{ ...s.expandPanel, borderBottom: isLast ? 'none' : `1px solid ${t.BORDER}` }}>
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
                                <span style={s.changeArrow}>→</span>
                                <span style={s.changeNew}>
                                  {formatFieldValue(field, newVal)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}