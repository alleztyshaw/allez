import { useState, useEffect } from 'react';
import { useTokens } from '../context/ThemeContext';
import {
  FONT_BODY, FONT_DISPLAY,
  RADIUS_MD, RADIUS_LG,
  SHADOW_LG,
  FW_LIGHT, FW_REGULAR, FW_MEDIUM, FW_SEMIBOLD,
} from '../utils/hqConstants';

// ── Calendar helpers ──────────────────────────────────────────────────────────

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Returns midnight-normalised copy of a Date so comparisons are date-only.
function toDay(d) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function sameDay(a, b) {
  if (!a || !b) return false;
  return a.toDateString() === b.toDateString();
}

// Build the 42-cell grid (6 rows × 7 cols) for a given year + month.
// Each cell is { date: Date, inMonth: boolean }.
function buildGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const offset       = firstOfMonth.getDay();          // 0 = Sun
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const cells        = [];

  // Filler cells from previous month
  for (let i = offset - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month, -i), inMonth: false });
  }
  // Days in current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  // Filler cells from next month to complete the grid
  let next = 1;
  while (cells.length < 42) {
    cells.push({ date: new Date(year, month + 1, next++), inMonth: false });
  }
  return cells;
}

// Format a Date as MM/DD/YYYY for the text input.
function fmt(d) {
  if (!d) return '';
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
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
 *   open          boolean                     — controls visibility
 *   onClose       () => void                  — called on Cancel or backdrop click
 *   onApply       (start: Date, end: Date) => void — called when advisor confirms range
 *   initialRange  { start: Date, end: Date }? — pre-fill if a custom range already exists
 */
export default function DateRangeModal({ open, onClose, onApply, initialRange }) {
  const t     = useTokens();
  const today = toDay(new Date());

  // Calendar view state
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // Selection state — managed internally, committed on Apply
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd,   setRangeEnd]   = useState(null);
  const [hoverDate,  setHoverDate]  = useState(null);

  // Text input state
  const [textInput, setTextInput] = useState('');
  const [textError, setTextError] = useState('');

  // Initialise / reset when modal opens
  useEffect(() => {
    if (!open) return;
    if (initialRange?.start && initialRange?.end) {
      setRangeStart(toDay(initialRange.start));
      setRangeEnd(toDay(initialRange.end));
      setTextInput(`${fmt(initialRange.start)} - ${fmt(initialRange.end)}`);
      setViewYear(initialRange.start.getFullYear());
      setViewMonth(initialRange.start.getMonth());
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
    if (!date) return;
    const d = toDay(date);

    // If no start yet, or both ends already chosen → start a new selection
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(d);
      setRangeEnd(null);
      setTextInput(fmt(d));
      setTextError('');
      return;
    }

    // Start chosen, end not yet — complete the range
    if (d < rangeStart) {
      // Clicked before the start: treat as new start, let them pick end
      setRangeStart(d);
      setRangeEnd(null);
      setTextInput(fmt(d));
    } else {
      setRangeEnd(d);
      setTextInput(`${fmt(rangeStart)} - ${fmt(d)}`);
      setTextError('');
    }
  }

  // ── Text input ──────────────────────────────────────────────────────────────

  function handleTextChange(e) {
    const val = e.target.value;
    setTextInput(val);
    setTextError('');

    // Only parse once it looks complete (rough length check)
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
    if (!textInput.trim()) return;
    const parsed = parseText(textInput);
    if (!parsed) {
      setTextError('Please use MM/DD/YYYY - MM/DD/YYYY format, and ensure the end date is after the start.');
    }
  }

  // ── Apply ───────────────────────────────────────────────────────────────────

  function handleApply() {
    if (!rangeStart || !rangeEnd) return;
    onApply(rangeStart, rangeEnd);
  }

  // ── Cell classification ─────────────────────────────────────────────────────

  // The "preview end" is either the confirmed rangeEnd or the hoverDate
  // (when only rangeStart is selected and the user is hovering).
  const previewEnd = rangeEnd || (rangeStart && hoverDate && hoverDate >= rangeStart ? hoverDate : null);

  function cellRole(date) {
    const d = toDay(date);
    if (sameDay(d, rangeStart) || sameDay(d, rangeEnd)) return 'endpoint';
    if (rangeStart && previewEnd && d > rangeStart && d < previewEnd) return 'inRange';
    return 'default';
  }

  // ── Grid ────────────────────────────────────────────────────────────────────

  const grid = buildGrid(viewYear, viewMonth);

  // ── Styles ──────────────────────────────────────────────────────────────────

  const overlay = {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.65)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '20px',
  };

  const card = {
    background: t.SURFACE,
    border: `1px solid ${t.BORDER}`,
    borderRadius: RADIUS_LG,
    boxShadow: SHADOW_LG,
    width: '100%',
    maxWidth: '360px',
    overflow: 'hidden',
    animation: 'drFadeUp 0.18s ease both',
  };

  const header = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '18px 22px', borderBottom: `1px solid ${t.BORDER}`,
  };

  const body   = { padding: '20px 22px' };
  const footer = {
    display: 'flex', justifyContent: 'flex-end', gap: '10px',
    padding: '14px 22px', borderTop: `1px solid ${t.BORDER}`,
  };

  const navButton = {
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: RADIUS_MD, color: t.TEXT_MUTED,
  };

  const monthLabel = {
    fontFamily: FONT_BODY, fontSize: '14px', fontWeight: FW_MEDIUM,
    color: t.TEXT, letterSpacing: '0.02em',
  };

  const dayLabelStyle = {
    textAlign: 'center', fontSize: '10px', fontWeight: FW_SEMIBOLD,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: t.TEXT_MUTED, paddingBottom: '8px',
    fontFamily: FONT_BODY,
  };

  function cellStyle(date, inMonth) {
    if (!inMonth) return { visibility: 'hidden' };
    const role      = cellRole(date);
    const isToday   = sameDay(toDay(date), today);
    const isEndpoint = role === 'endpoint';
    const isInRange  = role === 'inRange';

    return {
      width: '36px', height: '36px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: RADIUS_MD,
      cursor: 'pointer',
      fontFamily: FONT_BODY,
      fontSize: '13px',
      fontWeight: isEndpoint ? FW_SEMIBOLD : isToday ? FW_MEDIUM : FW_LIGHT,
      background: isEndpoint ? t.ACCENT : isInRange ? t.ACCENT_MUTED : 'transparent',
      color: isEndpoint ? '#ffffff' : isInRange ? t.ACCENT : t.TEXT,
      border: isToday && !isEndpoint ? `1px solid ${t.ACCENT_BORDER}` : 'none',
      transition: 'background 0.1s, color 0.1s',
      position: 'relative',
      userSelect: 'none',
    };
  }

  const canApply = !!(rangeStart && rangeEnd);

  return (
    <>
      <style>{`
        @keyframes drFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dr-day:hover { background: var(--dr-hover) !important; }
        .dr-nav-btn:hover { background: var(--dr-hover) !important; }
      `}</style>

      {/* Overlay — click outside to close */}
      <div
        style={overlay}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Inject hover token for CSS class */}
        <div style={{ '--dr-hover': t.SURFACE_ALT, ...card }}>

          {/* Header */}
          <div style={header}>
            <h2 style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: '20px', fontWeight: FW_REGULAR, color: t.TEXT, letterSpacing: '0.01em' }}>
              Custom range
            </h2>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.TEXT_MUTED, fontSize: '18px', lineHeight: 1, padding: '4px', fontFamily: FONT_BODY }} onClick={onClose}>
              ✕
            </button>
          </div>

          <div style={body}>

            {/* ── Month navigation ─────────────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <button className="dr-nav-btn" style={navButton} onClick={prevMonth} aria-label="Previous month">
                {/* CSS left-pointing triangle */}
                <span style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderRight: `6px solid ${t.TEXT_MUTED}` }} />
              </button>
              <span style={monthLabel}>{MONTH_NAMES[viewMonth]} {viewYear}</span>
              <button className="dr-nav-btn" style={navButton} onClick={nextMonth} aria-label="Next month">
                {/* CSS right-pointing triangle */}
                <span style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: `6px solid ${t.TEXT_MUTED}` }} />
              </button>
            </div>

            {/* ── Day-of-week labels ───────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '4px' }}>
              {DAY_LABELS.map(d => (
                <div key={d} style={dayLabelStyle}>{d}</div>
              ))}
            </div>

            {/* ── Calendar grid ────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
              {grid.map(({ date, inMonth }, i) => (
                <div
                  key={i}
                  className={inMonth ? 'dr-day' : ''}
                  style={cellStyle(date, inMonth)}
                  onClick={() => inMonth && handleDayClick(date)}
                  onMouseEnter={() => inMonth && rangeStart && !rangeEnd && setHoverDate(toDay(date))}
                  onMouseLeave={() => setHoverDate(null)}
                >
                  {inMonth ? date.getDate() : ''}
                </div>
              ))}
            </div>

            {/* ── Range summary ────────────────────────────────────────── */}
            {(rangeStart || rangeEnd) && (
              <div style={{ marginTop: '16px', padding: '10px 14px', background: t.SURFACE_ALT, borderRadius: RADIUS_MD, border: `1px solid ${t.BORDER}` }}>
                <p style={{ margin: 0, fontSize: '12px', color: t.TEXT_MUTED, fontFamily: FONT_BODY, fontWeight: FW_LIGHT }}>
                  {rangeStart && !rangeEnd
                    ? `From ${fmt(rangeStart)} — select end date`
                    : rangeStart && rangeEnd
                      ? `${fmt(rangeStart)} – ${fmt(rangeEnd)}`
                      : ''}
                </p>
              </div>
            )}

            {/* ── Divider ──────────────────────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0 14px' }}>
              <div style={{ flex: 1, height: '1px', background: t.BORDER }} />
              <span style={{ fontSize: '11px', color: t.TEXT_MUTED, fontFamily: FONT_BODY, fontWeight: FW_LIGHT, whiteSpace: 'nowrap' }}>or enter manually</span>
              <div style={{ flex: 1, height: '1px', background: t.BORDER }} />
            </div>

            {/* ── Text input ───────────────────────────────────────────── */}
            <input
              type="text"
              value={textInput}
              onChange={handleTextChange}
              onBlur={handleTextBlur}
              placeholder="MM/DD/YYYY - MM/DD/YYYY"
              style={{
                width: '100%', boxSizing: 'border-box',
                border: `1px solid ${textError ? '#f87171' : t.BORDER}`,
                borderRadius: RADIUS_MD,
                padding: '9px 12px',
                fontSize: '13px', color: t.TEXT,
                background: t.SURFACE_ALT,
                fontFamily: FONT_BODY, fontWeight: FW_LIGHT,
                outline: 'none',
                letterSpacing: '0.03em',
              }}
            />
            {textError && (
              <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#f87171', fontFamily: FONT_BODY, fontWeight: FW_LIGHT, lineHeight: '1.4' }}>
                {textError}
              </p>
            )}
          </div>

          {/* Footer */}
          <div style={footer}>
            <button
              onClick={onClose}
              style={{ padding: '9px 20px', borderRadius: RADIUS_MD, border: `1px solid ${t.BORDER}`, background: 'transparent', fontSize: '13px', cursor: 'pointer', color: t.TEXT_MUTED, fontFamily: FONT_BODY }}
            >
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