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
 *   dropUp      boolean?                            — opens panel above trigger
 *   compact     boolean?                            — panel fits content width; options align with trigger text
 */
export function Dropdown({ options = [], value, onChange, placeholder = 'Select...', style = {}, panelWidth, dropUp = false, compact = false }) {
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

  // dropUp gap is larger (10px) to give breathing room from the pill edge
  const panelGap = dropUp ? '10px' : '6px';

  // compact: uniform 4px panel padding on all sides so option pills have
  // breathing room from the panel edge. 4px gap → option pill radius = RADIUS_LG(14) - 4
  // = RADIUS_MD(10) for concentric curves. panel(4px) + option(4px) = 8px from
  // wrapper left = trigger text position (trigger padding: '4px 8px').

  const panel = {
    position: 'absolute',
    ...(dropUp
      ? { bottom: `calc(100% + ${panelGap})`, top: 'auto' }
      : { top:    `calc(100% + ${panelGap})`, bottom: 'auto' }
    ),
    left: 0,
    zIndex: 200,
    border: `1px solid ${t.BORDER}`,
    borderRadius: RADIUS_LG,
    boxShadow: SHADOW_LG,
    minWidth: compact ? 0 : '180px',
    width: compact ? 'max-content' : (panelWidth || 'auto'),
    padding: compact ? '4px' : '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    animation: dropUp ? 'ddFadeUp 0.12s ease both' : 'ddFadeDown 0.12s ease both',
    overflow: 'hidden',
  };

  const panelBg = {
    position:             'absolute',
    inset:                0,
    background:           t.SURFACE,
    opacity:              .95,
    backdropFilter:       'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    zIndex:               0,
  };

  function optionStyle(opt) {
    const isSelected = opt.value === value;
    const isHov      = hovered === opt.value;
    return {
      position:      'relative',
      zIndex:        1,
      // compact: 4px left padding aligns text with trigger (panel 4px + option 4px = 8px)
      // option radius = RADIUS_MD (concentric with panel RADIUS_LG at 4px gap)
      padding:       compact ? '5px 4px' : '5px 12px',
      cursor:        'pointer',
      fontFamily:    FONT_BODY,
      fontSize:      '13px',
      fontWeight:    isSelected ? FW_SEMIBOLD : FW_MEDIUM,
      color:         isSelected ? t.ACCENT : t.TEXT,
      display:       'flex',
      flexDirection: 'column',
      gap:           '2px',
      borderRadius:  compact ? RADIUS_MD : RADIUS_LG,
      background:    isSelected ? t.ACCENT_MUTED : isHov ? t.SURFACE_ALT : 'transparent',
      transition:    'background 0.1s',
      whiteSpace:    'nowrap',
    };
  }

  return (
    <>
      <style>{`
        @keyframes ddFadeDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ddFadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ position: 'relative', display: 'inline-block' }} ref={ref}>

        {/* Trigger */}
        <div style={trigger} onClick={() => setOpen(o => !o)}>
          <span style={{ flex: 1 }}>{selected ? selected.label : placeholder}</span>

          {/* Clear — only for non-default selections */}
          {!compact && selected && selected.value !== '' && (
            <span
              onClick={e => { e.stopPropagation(); onChange(''); setOpen(false); }}
              style={{
                flexShrink: 0, cursor: 'pointer', userSelect: 'none',
                fontSize: '11px', fontWeight: FW_LIGHT,
                color: t.TEXT_MUTED, lineHeight: 1,
                fontFamily: FONT_BODY, padding: '0 2px',
              }}
            >
              ✕
            </span>
          )}

          {/* Chevron */}
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

        {/* Panel */}
        {open && (
          <div style={panel}>
            <div style={panelBg} />
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