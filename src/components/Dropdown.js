import { useState, useRef, useEffect } from 'react';
import { useTokens } from '../context/ThemeContext';
import {
  FONT_BODY,
  RADIUS_MD,
  RADIUS_LG,
  SHADOW_LG,
  FW_LIGHT,
  FW_MEDIUM,
  FW_SEMIBOLD,
} from '../utils/hqConstants';

/**
 * Dropdown — generic custom dropdown pill, usable on any page.
 *
 * Props:
 *   options     [{ value, label, description? }]   — list of selectable options
 *   value       string | null                       — currently selected value
 *   onChange    (value) => void                     — called on selection
 *   placeholder string                              — shown when value is null/empty
 *   style       object?                             — optional overrides on the trigger pill
 *   panelWidth  string?                             — optional override e.g. '240px' (defaults to 'auto', min 180px)
 */
export function Dropdown({ options = [], value, onChange, placeholder = 'Select...', style = {}, panelWidth }) {
  const t = useTokens();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = options.find(o => o.value === value);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelect(optValue) {
    onChange(optValue);
    setOpen(false);
  }

  // ── Styles ────────────────────────────────────────────────────────────────

  const trigger = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 10px',
    borderRadius: RADIUS_MD,
    border: `1px solid ${open ? t.ACCENT_BORDER : t.BORDER}`,
    background: open ? t.ACCENT_MUTED : t.SURFACE,
    color: selected ? t.TEXT : t.TEXT_MUTED,
    fontSize: '13px',
    fontFamily: FONT_BODY,
    fontWeight: FW_LIGHT,
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    transition: 'border-color 0.15s, background 0.15s',
    ...style,
  };

  const panel = {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    zIndex: 200,
    background: t.SURFACE,
    border: `1px solid ${t.BORDER}`,
    borderRadius: RADIUS_LG,
    boxShadow: SHADOW_LG,
    minWidth: '180px',
    width: panelWidth || 'auto',
    overflow: 'hidden',
    animation: 'ddFadeDown 0.12s ease both',
  };

  const optionBase = {
    padding: '10px 14px',
    cursor: 'pointer',
    fontFamily: FONT_BODY,
    fontSize: '13px',
    fontWeight: FW_LIGHT,
    color: t.TEXT,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    transition: 'background 0.1s',
  };

  return (
    <>
      <style>{`
        @keyframes ddFadeDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dd-option:hover { background: var(--dd-hover) !important; }
      `}</style>

      {/* Inject hover var so CSS can reach the token without hardcoding */}
      <div style={{ '--dd-hover': t.SURFACE_ALT, position: 'relative', display: 'inline-block' }} ref={ref}>

        {/* Trigger pill */}
        <div style={trigger} onClick={() => setOpen(o => !o)}>
          <span style={{ flex: 1 }}>{selected ? selected.label : placeholder}</span>

          {/* CSS border triangle — no Unicode */}
          <span style={{
            width: 0,
            height: 0,
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderTop: `5px solid ${t.TEXT_MUTED}`,
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.18s ease',
          }} />
        </div>

        {/* Dropdown panel */}
        {open && (
          <div style={panel}>
            {options.map((opt, i) => (
              <div
                key={opt.value}
                className="dd-option"
                onClick={() => handleSelect(opt.value)}
                style={{
                  ...optionBase,
                  background: opt.value === value ? t.ACCENT_MUTED : t.SURFACE,
                  color: opt.value === value ? t.ACCENT : t.TEXT,
                  borderBottom: i < options.length - 1 ? `1px solid ${t.BORDER}` : 'none',
                }}
              >
                <span style={{ fontWeight: opt.value === value ? FW_SEMIBOLD : FW_MEDIUM }}>
                  {opt.label}
                </span>
                {opt.description && (
                  <span style={{ fontSize: '11px', color: t.TEXT_MUTED, fontWeight: FW_LIGHT }}>
                    {opt.description}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}