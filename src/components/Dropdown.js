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
 * Dropdown — generic custom dropdown, usable on any page.
 *
 * Props:
 *   options     [{ value, label, description? }]   — list of selectable options
 *   value       string | null                       — currently selected value
 *   onChange    (value) => void                     — called on selection
 *   placeholder string                              — shown when value is null/empty
 *   style       object?                             — optional overrides on the trigger pill
 *   panelWidth  string?                             — optional override e.g. '240px'
 */
export function Dropdown({ options = [], value, onChange, placeholder = 'Select...', style = {}, panelWidth }) {
  const t = useTokens();
  const [open,    setOpen]    = useState(false);
  const [hovered, setHovered] = useState(null);
  const ref = useRef(null);

  const selected = options.find(o => o.value === value);

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

  // ── Frosted panel — two-layer approach ───────────────────────────────────
  //
  // The problem with `opacity` on the panel element: it makes ALL children
  // (text, pills, everything) semi-transparent too. At opacity 0.1, text
  // nearly vanishes — so the change looked invisible, not frosted.
  //
  // The correct approach: the panel wrapper has no background of its own.
  // An absolutely-positioned child div carries the background + blur at
  // reduced opacity. All option content renders above it at full opacity,
  // so text stays crisp while only the surface is translucent.

  const panel = {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    zIndex: 200,
    // No background here — handled by panelBg layer below
    border: `1px solid ${t.BORDER}`,
    borderRadius: RADIUS_LG,
    boxShadow: SHADOW_LG,
    minWidth: '180px',
    width: panelWidth || 'auto',
    padding: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    animation: 'ddFadeDown 0.12s ease both',
    overflow: 'hidden', // clips the bg layer to the panel's border-radius
  };

  // Background layer — only this is translucent. Sits behind options via z-index.
  const panelBg = {
    position: 'absolute',
    inset: 0,
    background: t.SURFACE,
    opacity:0.9,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    zIndex: 0,
    // No border-radius needed — parent overflow:hidden clips it
  };

  // Each option pill — z-index 1 so it renders above the bg layer.
  function optionStyle(opt) {
    const isSelected = opt.value === value;
    const isHovered  = hovered === opt.value;
    return {
      position: 'relative',
      zIndex: 1,
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
            {/* Background layer — translucent, sits behind options */}
            <div style={panelBg} />

            {/* Options — full opacity, above bg layer */}
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