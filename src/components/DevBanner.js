// src/components/DevBanner.js
// Fixed bottom-center banner shown when dev mode is active.
// Role and viewport are inline dropdowns — toggle directly without reopening the toolbar.
// Exit Dev Mode resets all overrides.

import { useOrg } from '../context/OrgContext';
import {
  FONT_BODY,
  FW_LIGHT, FW_MEDIUM, FW_SEMIBOLD,
  SITE_ACCENT,
  RADIUS_PILL, RADIUS_MD,
  ROLE_OPTIONS,
} from '../utils/hqConstants';

export const DEV_BANNER_HEIGHT = 48; // px — used by ProtectedLayout for paddingBottom

export default function DevBanner() {
  const {
    isDevMode, isPlatformAdmin,
    devRoleOverride, devMobileOverride,
    setDevRoleOverride, setDevMobileOverride,
    exitDevMode,
  } = useOrg();

  if (!isPlatformAdmin || !isDevMode) return null;

  const s = {
    banner: {
      position:       'fixed',
      bottom:         0, left: 0, right: 0,
      height:         DEV_BANNER_HEIGHT,
      background:     'rgba(8, 6, 20, 0.96)',
      borderTop:      `1px solid ${SITE_ACCENT}44`,
      display:        'flex', alignItems: 'center',
      justifyContent: 'center',
      gap:            '10px',
      zIndex:         500,
      fontFamily:     FONT_BODY,
      backdropFilter: 'blur(8px)',
    },
    label: {
      fontSize:      '11px', fontWeight: FW_LIGHT,
      color:         `${SITE_ACCENT}88`, letterSpacing: '0.08em',
      textTransform: 'uppercase', flexShrink: 0,
    },
    select: {
      padding:    '4px 8px',
      background: `${SITE_ACCENT}18`,
      border:     `1px solid ${SITE_ACCENT}44`,
      borderRadius: RADIUS_MD,
      color:      SITE_ACCENT,
      fontSize:   '12px', fontWeight: FW_MEDIUM,
      fontFamily: FONT_BODY, cursor: 'pointer',
      outline:    'none',
    },
    divider: {
      width: '1px', height: '16px',
      background: `${SITE_ACCENT}30`,
      flexShrink: 0,
    },
    exitBtn: {
      background:   'none',
      border:       `1px solid ${SITE_ACCENT}44`,
      borderRadius: RADIUS_PILL,
      padding:      '4px 14px',
      fontSize:     '12px', fontWeight: FW_SEMIBOLD,
      color:        SITE_ACCENT, cursor: 'pointer',
      fontFamily:   FONT_BODY,
      flexShrink:   0,
    },
  };

  return (
    <div style={s.banner}>
      <span style={s.label}>Dev Mode</span>

      {/* Role dropdown */}
      <select
        style={s.select}
        value={devRoleOverride || ''}
        onChange={e => setDevRoleOverride(e.target.value || null)}
      >
        {ROLE_OPTIONS.map(r => (
          <option key={r} value={r}>
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </option>
        ))}
      </select>

      {/* Viewport dropdown */}
      <select
        style={s.select}
        value={devMobileOverride ? 'mobile' : 'desktop'}
        onChange={e => setDevMobileOverride(e.target.value === 'mobile')}
      >
        <option value="desktop">Desktop</option>
        <option value="mobile">Mobile</option>
      </select>

      <div style={s.divider} />

      <button style={s.exitBtn} onClick={exitDevMode}>
        Exit Dev Mode
      </button>
    </div>
  );
}