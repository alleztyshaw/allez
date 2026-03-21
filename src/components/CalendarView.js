// src/components/CalendarView.js
// Reusable calendar component used by CRM and Daily Brief.
// Props:
//   meetings    — array of meeting objects (with scheduled_at, duration_mins, etc.)
//   clients     — array of client objects (for name lookup)
//   navigate    — react-router navigate function
//   hourHeight  — px per hour row (default 56)
//   maxHours    — how many hours to show in the scrollable window (default 12)

import React, { useState } from 'react';
import { useTokens } from '../context/ThemeContext';
import useWindowWidth from '../hooks/useWindowWidth';
import {
  FONT_BODY,
  RADIUS_LG, RADIUS_MD,
  FW_LIGHT, FW_REGULAR, FW_MEDIUM, FW_SEMIBOLD,
  MOBILE_BREAKPOINT,
  COLOR_ERROR,
  L_TEXT,
} from '../utils/hqConstants';

// ── Helpers ───────────────────────────────────────────────────────────────────

function startOf(view, anchor) {
  const d = new Date(anchor);
  if (view === 'day') { d.setHours(0,0,0,0); return d; }
  if (view === 'week') {
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0,0,0,0); return d;
  }
  d.setDate(1); d.setHours(0,0,0,0); return d;
}

function getDays(view, anchor) {
  const start = startOf(view, anchor);
  const days = view === 'day' ? 1 : view === 'week' ? 7
    : new Date(anchor.getFullYear(), anchor.getMonth()+1, 0).getDate();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(start); d.setDate(start.getDate() + i); return d;
  });
}

function isCalToday(day) {
  const now = new Date();
  return day.getFullYear() === now.getFullYear() &&
         day.getMonth()    === now.getMonth()    &&
         day.getDate()     === now.getDate();
}

function meetingsForDay(meetings, day) {
  return meetings.filter(m => {
    const md = new Date(m.scheduled_at);
    return md.getFullYear() === day.getFullYear() &&
           md.getMonth()    === day.getMonth()    &&
           md.getDate()     === day.getDate();
  }).sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
}

function clientName(clients, id) {
  const c = clients.find(c => c.id === id);
  return c ? `${c.first_name} ${c.last_name}` : '—';
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CalendarView({
  meetings = [],
  clients  = [],
  navigate,
  hourHeight = 56,
  maxHours   = 12,
}) {
  const t = useTokens();
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < MOBILE_BREAKPOINT;

  const [view,   setView]   = useState('week');
  const [anchor, setAnchor] = useState(new Date());

  const HOURS   = Array.from({ length: 24 }, (_, i) => i);
  const HEADER_H = 52; // px — sticky day header row height
  const calDays = getDays(view, anchor);
  const tz      = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tzLabel = new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop();

  function nav(dir) {
    setAnchor(prev => {
      const d = new Date(prev);
      if (view === 'day')   d.setDate(d.getDate() + dir);
      else if (view === 'week') d.setDate(d.getDate() + dir * 7);
      else d.setMonth(d.getMonth() + dir);
      return d;
    });
  }

  function title() {
    if (view === 'week') {
      const days  = getDays('week', anchor);
      const start = days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end   = days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${start} – ${end}`;
    }
    const opts = view === 'month'
      ? { month: 'long', year: 'numeric' }
      : { month: 'short', day: 'numeric', year: 'numeric' };
    return anchor.toLocaleDateString('en-US', opts);
  }

  // ── Shared button styles ───────────────────────────────────────────────────
  const navBtn = {
    background: 'none', border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD,
    padding: '5px 12px', color: t.TEXT_MUTED, cursor: 'pointer',
    fontSize: '14px', fontFamily: FONT_BODY,
  };

  // ── Month view ─────────────────────────────────────────────────────────────
  function renderMonth() {
    const firstDay  = startOf('month', anchor).getDay();
    const blanks    = Array.from({ length: firstDay }, (_, i) => i);
    const allCells  = [...blanks.map(() => null), ...calDays];
    while (allCells.length % 7 !== 0) allCells.push(null);

    return (
      <div>
        {!isMobile && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '2px' }}>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: FW_SEMIBOLD, color: t.TEXT_MUTED, padding: '4px 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{d}</div>
            ))}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
          {allCells.map((day, i) => {
            if (!day) return <div key={`blank-${i}`} style={{ minHeight: '80px', background: t.SURFACE_ALT, borderRadius: RADIUS_MD, opacity: 0.3 }} />;
            const dayMeetings = meetingsForDay(meetings, day);
            const today = isCalToday(day);
            return (
              <div key={day.toISOString()} style={{ minHeight: '80px', background: t.SURFACE, border: `1px solid ${today ? t.ACCENT_BORDER : t.BORDER}`, borderRadius: RADIUS_MD, padding: '6px', overflow: 'hidden' }}>
                <span style={{ fontSize: '12px', fontWeight: today ? FW_SEMIBOLD : FW_LIGHT, color: today ? t.ACCENT : t.TEXT_MUTED, display: 'block', marginBottom: '4px' }}>{day.getDate()}</span>
                {dayMeetings.slice(0, isMobile ? 1 : 3).map(m => (
                  <div key={m.id}
                    title={`${m.category}${m.client_id ? ' · ' + clientName(clients, m.client_id) : ''}`}
                    onClick={() => m.client_id && navigate(`/hq/clients/${m.client_id}`)}
                    style={{ fontSize: '10px', fontWeight: FW_MEDIUM, color: t.ACCENT, background: t.CALENDAR_TILE, borderLeft: `2px solid ${t.ACCENT}`, borderRadius: '3px', padding: '2px 4px', marginBottom: '2px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', cursor: 'pointer' }}
                  >
                    {new Date(m.scheduled_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} {m.category}
                  </div>
                ))}
                {dayMeetings.length > (isMobile ? 1 : 3) && (
                  <span style={{ fontSize: '10px', color: t.TEXT_MUTED }}>+{dayMeetings.length - (isMobile ? 1 : 3)} more</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Day / Week view ────────────────────────────────────────────────────────
  function renderTimeGrid() {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', color: t.TEXT_SUBTLE, fontWeight: FW_LIGHT, fontFamily: FONT_BODY }}>
            {tz} · {tzLabel}
          </span>
        </div>

        <div
          style={{ overflowY: 'auto', maxHeight: `${maxHours * hourHeight + HEADER_H}px`, background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG }}
          ref={el => { if (el && !el.dataset.scrolled) { el.scrollTop = 6 * hourHeight + HEADER_H; el.dataset.scrolled = '1'; } }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: `52px repeat(${calDays.length}, 1fr)`, position: 'relative' }}>

            {/* Sticky day headers */}
            <div style={{ position: 'sticky', top: 0, zIndex: 10, background: t.SURFACE, height: `${HEADER_H}px` }} />
            {calDays.map(day => {
              const today = isCalToday(day);
              return (
                <div key={`hdr-${day.toISOString()}`} style={{ position: 'sticky', top: 0, zIndex: 10, background: today ? t.SURFACE_ALT : t.SURFACE, borderBottom: `2px solid ${today ? t.ACCENT : t.BORDER}`, textAlign: 'center', padding: '6px 4px 12px', height: `${HEADER_H}px`, boxSizing: 'border-box' }}>
                  <span style={{ fontSize: '11px', fontWeight: FW_SEMIBOLD, color: today ? t.ACCENT : t.TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: today ? FW_MEDIUM : FW_LIGHT, color: today ? t.ACCENT : t.TEXT }}>
                    {day.getDate()}
                  </span>
                </div>
              );
            })}

            {/* Hour background rows */}
            {HOURS.map(hour => (
              <React.Fragment key={hour}>
                <div style={{ height: hourHeight, borderTop: `1px solid ${t.BORDER}`, paddingTop: '4px', paddingRight: '8px', textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontSize: '12px', color: t.TEXT_MUTED, fontWeight: FW_REGULAR, fontFamily: FONT_BODY, lineHeight: 1 }}>
                    {hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour-12}pm`}
                  </span>
                </div>
                {calDays.map(day => {
                  const today = isCalToday(day);
                  return (
                    <div key={`${day.toISOString()}-${hour}`} style={{ height: hourHeight, borderTop: `1px solid ${t.BORDER}`, borderLeft: `1px solid ${today ? t.ACCENT_BORDER : t.BORDER}`, background: today && hour >= 6 && hour < 20 ? `${t.ACCENT_MUTED}33` : t.SURFACE }} />
                  );
                })}
              </React.Fragment>
            ))}

            {/* Meeting tiles — absolutely positioned, span freely across hour lines */}
            {calDays.map((day, colIdx) =>
              meetingsForDay(meetings, day).map(m => {
                const dt = new Date(m.scheduled_at);
                const statusColor = m.status === 'cancelled' ? COLOR_ERROR : t.ACCENT;
                const topPx = HEADER_H + (dt.getHours() + dt.getMinutes() / 60) * hourHeight;
                const blockHeight = Math.max(24, (m.duration_mins / 60) * hourHeight - 2);
                const cName = m.client_id ? clientName(clients, m.client_id) : null;
                return (
                  <div
                    key={`tile-${m.id}`}
                    onClick={() => m.client_id && navigate(`/hq/clients/${m.client_id}`)}
                    title={`${m.category}${cName ? ' · ' + cName : ''}\n${dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                    style={{
                      position:    'absolute',
                      top:         topPx,
                      left:        `calc(52px + ${colIdx} * ((100% - 52px) / ${calDays.length}) + 2px)`,
                      width:       `calc((100% - 52px) / ${calDays.length} - 4px)`,
                      height:      blockHeight,
                      background:  t.CALENDAR_TILE,
                      borderLeft:  `3px solid ${statusColor}`,
                      borderRadius: '3px',
                      padding:     '3px 6px',
                      cursor:      m.client_id ? 'pointer' : 'default',
                      overflow:    'hidden',
                      zIndex:      2,
                      boxSizing:   'border-box',
                      boxShadow:   '0 1px 4px rgba(0,0,0,0.15)',
                    }}
                  >
                    <p style={{ fontSize: '11px', fontWeight: FW_SEMIBOLD, color: statusColor, margin: 0, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} {m.category}
                    </p>
                    {blockHeight > 30 && cName && (
                      <p style={{ fontSize: '11px', fontWeight: FW_REGULAR, color: L_TEXT, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {cName}
                      </p>
                    )}
                  </div>
                );
              })
            )}

          </div>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => nav(-1)} style={navBtn}>‹</button>
          <span style={{ fontSize: '15px', fontWeight: FW_MEDIUM, color: t.TEXT, fontFamily: FONT_BODY, minWidth: isMobile ? 'auto' : '220px', textAlign: 'center' }}>{title()}</span>
          <button onClick={() => nav(1)}  style={navBtn}>›</button>
          {/* Jump to date */}
          <label style={{ position: 'relative', cursor: 'pointer' }} title={`Jump to ${view}`}>
            <span style={{ display: 'flex', alignItems: 'center', background: 'none', border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '5px 9px', color: t.TEXT_MUTED, userSelect: 'none' }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="3" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
                <line x1="1" y1="6.5" x2="14" y2="6.5" stroke="currentColor" strokeWidth="1.1" />
                <line x1="4.5" y1="1.5" x2="4.5" y2="4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <line x1="10.5" y1="1.5" x2="10.5" y2="4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type={view === 'month' ? 'month' : 'date'}
              style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', top: 0, left: 0, cursor: 'pointer' }}
              onChange={e => {
                if (!e.target.value) return;
                const d = new Date(e.target.value + (view === 'month' ? '-01' : '') + 'T12:00:00');
                if (!isNaN(d)) setAnchor(d);
              }}
            />
          </label>
        </div>
        {/* View toggle */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {['Day', 'Week', 'Month'].map(v => (
            <button
              key={v}
              onClick={() => setView(v.toLowerCase())}
              style={{ padding: '5px 14px', borderRadius: RADIUS_MD, border: `1px solid ${view === v.toLowerCase() ? t.ACCENT_BORDER : t.BORDER}`, background: view === v.toLowerCase() ? t.ACCENT_MUTED : 'none', color: view === v.toLowerCase() ? t.ACCENT : t.TEXT_MUTED, fontSize: '12px', fontWeight: FW_MEDIUM, fontFamily: FONT_BODY, cursor: 'pointer' }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === 'month' ? renderMonth() : renderTimeGrid()}
    </div>
  );
}