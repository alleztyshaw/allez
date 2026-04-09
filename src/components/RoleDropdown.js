import { useState, useRef, useEffect } from 'react';
import { useTokens } from '../context/ThemeContext';
import {
  FONT_BODY,
  FW_LIGHT, FW_REGULAR, FW_SEMIBOLD,
  RADIUS_MD, RADIUS_LG,
  SHADOW_MD,
} from '../utils/hqConstants';

export const ROLES = ['admin', 'manager', 'advisor', 'associate', 'compliance'];

export const ROLE_DESCRIPTIONS = {
  admin:      'Full access — org settings, all clients, user management',
  manager:    'View all clients and advisors, cannot manage org settings',
  advisor:    'Full access to assigned clients and notes',
  associate:  'View and add notes on assigned clients',
  compliance: 'Read-only access to all clients and notes',
};

export default function RoleDropdown({ value, onChange, disabled = false }) {
  const t              = useTokens();
  const [open, setOpen] = useState(false);
  const ref            = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const label = value
    ? value.charAt(0).toUpperCase() + value.slice(1)
    : 'Select role';

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <button
        disabled={disabled}
        onClick={() => !disabled && setOpen(v => !v)}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px',
          background: t.SURFACE_ALT, border: `1px solid ${t.BORDER}`,
          borderRadius: RADIUS_MD, cursor: disabled ? 'default' : 'pointer',
          fontSize: '14px', color: disabled ? t.TEXT_MUTED : t.TEXT,
          fontFamily: FONT_BODY, fontWeight: FW_REGULAR,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <span>{label}</span>
        <span style={{
          display:     'inline-block',
          width:       0,
          height:      0,
          borderLeft:  '4px solid transparent',
          borderRight: '4px solid transparent',
          color:       t.TEXT_MUTED,
          ...(open
            ? { borderBottom: '5px solid currentColor' }
            : { borderTop:    '5px solid currentColor' }),
        }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: t.SURFACE, border: `1px solid ${t.BORDER}`,
          borderRadius: RADIUS_LG, boxShadow: SHADOW_MD,
          zIndex: 300, overflow: 'hidden',
        }}>
          {ROLES.map(role => (
            <button
              key={role}
              onClick={() => { onChange(role); setOpen(false); }}
              style={{
                width: '100%', textAlign: 'left',
                padding: '12px 16px', border: 'none',
                background: role === value ? t.ACCENT_MUTED : 'transparent',
                cursor: 'pointer', fontFamily: FONT_BODY,
              }}
            >
              <div style={{
                fontSize: '13px', fontWeight: FW_SEMIBOLD,
                color: role === value ? t.ACCENT : t.TEXT,
                marginBottom: '2px',
              }}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </div>
              <div style={{
                fontSize: '11px', color: t.TEXT_MUTED,
                fontWeight: FW_LIGHT, fontFamily: FONT_BODY,
              }}>
                {ROLE_DESCRIPTIONS[role]}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}