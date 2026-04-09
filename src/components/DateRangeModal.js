import { useState, useEffect } from 'react';
import { useTokens } from '../context/ThemeContext';
import {
  FONT_BODY, FONT_DISPLAY,
  RADIUS_MD, RADIUS_LG,
  SHADOW_LG,
  FW_LIGHT, FW_REGULAR, FW_MEDIUM, FW_SEMIBOLD,
} from '../utils/hqConstants';

// ── Calendar helpers ──────────────────────────────────────────────────────────

const DAY_LABELS  = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toDay(d) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function sameDay(a, b) {
  return a && b && a.toDateString() === b.toDateString();
}

// Build the 42-cell (6 × 7) grid for a given year + month.
function buildGrid(year, month) {
  const first       = new Date(year, month, 1);
  const offset      = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells       = [];

  for (let i = offset - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month, -i), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  let next = 1;
  while (cells.length < 42) {
    cells.push({ date: new Date(year, month + 1, next++), inMonth: false });
  }
  return cells;
}

// Format Date → MM/DD/YYYY
function fmt(d) {
  if (!d) return '';
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

// Build the combined range string written to the single input.
function buildRangeText(start, end) {
  if (start && end) return `${fmt(start)} - ${fmt(end)}`;
  if (start)        return `${fmt(start)} - `;
  return '';
}

// Parse "MM/DD/YYYY - MM/DD/YYYY" → { start, end } or null.
function parseText(text) {
  const parts = text.split(' - ');
  if (parts.length !== 2) return null;
  const start = toDay(new Date(parts[0].trim()));
  const end   = toDay(new Date(parts[1].trim()));
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  if (end < start) return null;
  return { start, end };
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * DateRangeModal
 *
 * Props:
 *   open          boolean
 *   onClose       () => void
 *   onApply       (start: Date, end: Date) => void
 *   initialRange  { start: Date, end: Date }?
 */
export default function DateRangeModal({ open, onClose, onApply, initialRange }) {
  const t     = useTokens();
  const today = toDay(new Date());

  const [viewYear,   setViewYear]   = useState(today.getFullYear());
  const [viewMonth,  setViewMonth]  = useState(today.getMonth());
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd,   setRangeEnd]   = useState(null);
  const [hoverDate,  setHoverDate]  = useState(null);
  const [textInput,  setTextInput]  = useState('');
  const [textError,  setTextError]  = useState('');

  // Reset / pre-fill whenever modal opens
  useEffect(() => {
    if (!open) return;
    if (initialRange?.start && initialRange?.end) {
      const s = toDay(initialRange.start);
      const e = toDay(initialRange.end);
      setRangeStart(s);
      setRangeEnd(e);
      setTextInput(buildRangeText(s, e));
      setViewYear(s.getFullYear());
      setViewMonth(s.getMonth());
    } else {
      setRangeStart(null);
      setRangeEnd(null);
      setTextInput('');
      setViewYear(today.getFullYear());
      setViewMonth(today.getMonth());
    }
    setHoverDate(null);
    setTextError('');
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  // ── Navigation ──────────────────────────────────────────────────────────────

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  // ── Day click ───────────────────────────────────────────────────────────────

  function handleDayClick(date) {
    const d = toDay(date);
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(d);
      setRangeEnd(null);
      setTextInput(buildRangeText(d, null));
      setTextError('');
      return;
    }
    if (d < rangeStart) {
      setRangeStart(d);
      setRangeEnd(null);
      setTextInput(buildRangeText(d, null));
    } else {
      setRangeEnd(d);
      setTextInput(buildRangeText(rangeStart, d));
      setTextError('');
    }
  }

  // ── Text input ──────────────────────────────────────────────────────────────

  function handleTextChange(e) {
    const val = e.target.value;
    setTextInput(val);
    setTextError('');
    if (val.length >= 23) {
      const parsed = parseText(val);
      if (parsed) {
        setRangeStart(parsed.start);
        setRangeEnd(parsed.end);
        setViewYear(parsed.start.getFullYear());
        setViewMonth(parsed.start.getMonth());
      }
    }
  }

  function handleTextBlur() {
    if (!textInput.trim() || textInput.endsWith('- ')) return;
    const parsed = parseText(textInput);
    if (!parsed) {
      setTextError('Use MM/DD/YYYY - MM/DD/YYYY and ensure the end date is after the start.');
    }
  }

  // ── Apply ───────────────────────────────────────────────────────────────────

  function handleApply() {
    if (rangeStart && rangeEnd) onApply(rangeStart, rangeEnd);
  }

  // ── Cell role ───────────────────────────────────────────────────────────────

  // Preview end: confirmed end or hover position while mid-selection.
  const previewEnd = rangeEnd
    || (rangeStart && hoverDate && hoverDate >= rangeStart ? hoverDate : null);

  // Returns: 'start' | 'end' | 'both' | 'inRange' | 'default'
  function cellRole(date) {
    const d       = toDay(date);
    const isStart = sameDay(d, rangeStart);
    const isEnd   = sameDay(d, previewEnd);
    if (isStart && isEnd)                                                  return 'both';
    if (isStart)                                                           return 'start';
    if (isEnd)                                                             return 'end';
    if (rangeStart && previewEnd && d > rangeStart && d < previewEnd)     return 'inRange';
    return 'default';
  }

  // ── Cell rendering helpers ──────────────────────────────────────────────────

  // The outer div carries the horizontal band — no border-radius so it bleeds
  // edge-to-edge across adjacent cells. Endpoints use a half-gradient so the
  // band only covers the interior side of the circle.
  function bandStyle(role) {
    if (role === 'inRange') return { background: t.ACCENT_MUTED };
    if (role === 'start')   return { background: `linear-gradient(to right, transparent 50%, ${t.ACCENT_MUTED} 50%)` };
    if (role === 'end')     return { background: `linear-gradient(to left,  transparent 50%, ${t.ACCENT_MUTED} 50%)` };
    return { background: 'transparent' };
  }

  // The inner div is the visible circle on top of the band.
  function circleStyle(role, date) {
    const isEndpoint = role === 'start' || role === 'end' || role === 'both';
    const isToday    = sameDay(toDay(date), today);
    return {
      width: '32px', height: '32px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: RADIUS_MD,
      fontFamily: FONT_BODY, fontSize: '13px',
      fontWeight: isEndpoint ? FW_SEMIBOLD : isToday ? FW_MEDIUM : FW_LIGHT,
      background: isEndpoint ? t.ACCENT : 'transparent',
      color: isEndpoint ? '#ffffff' : t.TEXT,
      border: isToday && !isEndpoint ? `1px solid ${t.ACCENT_BORDER}` : 'none',
      cursor: 'pointer',
      userSelect: 'none',
      transition: 'background 0.1s',
      flexShrink: 0,
    };
  }

  const grid     = buildGrid(viewYear, viewMonth);
  const canApply = !!(rangeStart && rangeEnd);

  return (
    <>
      <style>{`
        @keyframes drFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dr-circle:hover           { background: var(--dr-hover)   !important; }
        .dr-circle.endpoint:hover  { background: var(--dr-accent)  !important; }
      `}</style>

      {/* Overlay */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div style={{
          '--dr-hover':  t.ACCENT_MUTED,
          '--dr-accent': t.ACCENT,
          background: t.SURFACE, border: `1px solid ${t.BORDER}`,
          borderRadius: RADIUS_LG, boxShadow: SHADOW_LG,
          width: '100%', maxWidth: '360px', overflow: 'hidden',
          animation: 'drFadeUp 0.18s ease both',
        }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: `1px solid ${t.BORDER}` }}>
            <h2 style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: '20px', fontWeight: FW_REGULAR, color: t.TEXT, letterSpacing: '0.01em' }}>
              Custom range
            </h2>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.TEXT_MUTED, fontSize: '18px', lineHeight: 1, padding: '4px', fontFamily: FONT_BODY }} onClick={onClose}>
              ✕
            </button>
          </div>

          <div style={{ padding: '20px 22px' }}>

            {/* Month navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <button onClick={prevMonth} aria-label="Previous month" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', borderRadius: RADIUS_MD, color: t.TEXT_MUTED }}>
                <span style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderRight: '6px solid currentColor' }} />
              </button>
              <span style={{ fontFamily: FONT_BODY, fontSize: '14px', fontWeight: FW_MEDIUM, color: t.TEXT }}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <button onClick={nextMonth} aria-label="Next month" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', borderRadius: RADIUS_MD, color: t.TEXT_MUTED }}>
                <span style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '6px solid currentColor' }} />
              </button>
            </div>

            {/* Day-of-week labels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '2px' }}>
              {DAY_LABELS.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.TEXT_MUTED, paddingBottom: '6px', fontFamily: FONT_BODY }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {grid.map(({ date, inMonth }, i) => {
                if (!inMonth) return <div key={i} style={{ height: '36px' }} />;

                const role       = cellRole(date);
                const isEndpoint = role === 'start' || role === 'end' || role === 'both';

                return (
                  // Outer: band layer — fills the full cell width for continuous color
                  <div
                    key={i}
                    style={{ ...bandStyle(role), display: 'flex', alignItems: 'center', justifyContent: 'center', height: '36px' }}
                    onClick={() => handleDayClick(date)}
                    onMouseEnter={() => rangeStart && !rangeEnd && setHoverDate(toDay(date))}
                    onMouseLeave={() => setHoverDate(null)}
                  >
                    {/* Inner: circle layer — sits on top of the band */}
                    <div
                      className={`dr-circle${isEndpoint ? ' endpoint' : ''}`}
                      style={circleStyle(role, date)}
                    >
                      {date.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Single input — calendar writes to it; typing updates calendar ── */}
            <div style={{ marginTop: '16px' }}>
              <input
                type="text"
                value={textInput}
                onChange={handleTextChange}
                onBlur={handleTextBlur}
                placeholder="MM/DD/YYYY - MM/DD/YYYY"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  border: `1px solid ${textError ? '#f87171' : t.BORDER}`,
                  borderRadius: RADIUS_MD, padding: '9px 12px',
                  fontSize: '13px', color: t.TEXT,
                  background: t.SURFACE_ALT, fontFamily: FONT_BODY,
                  fontWeight: FW_LIGHT, outline: 'none', letterSpacing: '0.03em',
                  textAlign: 'center',
                }}
              />
              {textError && (
                <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#f87171', fontFamily: FONT_BODY, fontWeight: FW_LIGHT, lineHeight: '1.4' }}>
                  {textError}
                </p>
              )}
            </div>

          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '14px 22px', borderTop: `1px solid ${t.BORDER}` }}>
            <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: RADIUS_MD, border: `1px solid ${t.BORDER}`, background: 'transparent', fontSize: '13px', cursor: 'pointer', color: t.TEXT_MUTED, fontFamily: FONT_BODY }}>
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!canApply}
              style={{ padding: '9px 20px', borderRadius: RADIUS_MD, border: `1px solid ${canApply ? t.ACCENT_BORDER : t.BORDER}`, background: canApply ? t.ACCENT_MUTED : t.SURFACE_ALT, color: canApply ? t.ACCENT : t.TEXT_MUTED, fontSize: '13px', fontWeight: FW_SEMIBOLD, cursor: canApply ? 'pointer' : 'default', fontFamily: FONT_BODY, transition: 'all 0.15s' }}
            >
              Apply
            </button>
          </div>

        </div>
      </div>
    </>
  );
}