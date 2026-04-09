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
  const [open,    setOpen]    = useState(false);
  const [hovered, setHovered] = useState(null);
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
    setHovered(null);
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

  // Frosted panel — slightly transparent + blur gives premium depth.
  // opacity: 0.97 keeps it nearly opaque while allowing the blur to register.
  const panel = {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    zIndex: 200,
    background: t.SURFACE,
    opacity: 0.97,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: `1px solid ${t.BORDER}`,
    borderRadius: RADIUS_LG,
    boxShadow: SHADOW_LG,
    minWidth: '180px',
    width: panelWidth || 'auto',
    // Inner padding + flex so pills sit inside the panel with gap between them
    padding: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    animation: 'ddFadeDown 0.12s ease both',
  };

  // Each option renders as a pill — RADIUS_LG matches the panel corners.
  function optionStyle(opt) {
    const isSelected = opt.value === value;
    const isHovered  = hovered === opt.value;
    return {
      padding: '5px 12px',
      cursor: 'pointer',
      fontFamily: FONT_BODY,
      fontSize: '13px',
      fontWeight: isSelected ? FW_SEMIBOLD : FW_MEDIUM,
      color: isSelected ? t.ACCENT : t.TEXT,
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      borderRadius: RADIUS_LG,
      background: isSelected
        ? t.ACCENT_MUTED
        : isHovered
          ? t.SURFACE_ALT
          : 'transparent',
      transition: 'background 0.1s',
    };
  }

  return (
    <>
      <style>{`
        @keyframes ddFadeDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ position: 'relative', display: 'inline-block' }} ref={ref}>

        {/* Trigger pill */}
        <div style={trigger} onClick={() => setOpen(o => !o)}>
          <span style={{ flex: 1 }}>{selected ? selected.label : placeholder}</span>

          {/* CSS border triangle — no Unicode */}
          <span style={{
            width: 0, height: 0,
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
            {options.map(opt => (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                onMouseEnter={() => setHovered(opt.value)}
                onMouseLeave={() => setHovered(null)}
                style={optionStyle(opt)}
              >
                <span>{opt.label}</span>
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