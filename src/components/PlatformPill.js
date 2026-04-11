// src/components/PlatformPill.js
//
// Floating bottom-center pill for platform admins when Dev or Demo Mode is active.
//
// Small state (demo only):   [ Viewing as [Role ▾] ]
// Full state (dev mode on):  [ Desktop/Mobile [▾]  |  Viewing as [Role ▾] ]

import { useState, useEffect } from 'react';
import { useOrg } from '../context/OrgContext';
import { useTokens } from '../context/ThemeContext';
import { Dropdown } from './Dropdown';
import {
  FONT_BODY,
  FW_REGULAR, FW_MEDIUM,
  RADIUS_LG, RADIUS_PILL,
  ROLE_OPTIONS,
} from '../utils/hqConstants';

const VIEWPORT_OPTIONS = [
  { value: 'desktop', label: 'Desktop' },
  { value: 'mobile',  label: 'Mobile'  },
];

const ROLE_DROPDOWN_OPTIONS = ROLE_OPTIONS.map(r => ({
  value: r,
  label: r.charAt(0).toUpperCase() + r.slice(1),
}));

const ENTER_MS = 220;
const EXIT_MS  = 160;

export default function PlatformPill() {
  const {
    isDevMode,
    devMobileOverride, setDevMobileOverride,
    devRoleOverride,   setDevRoleOverride,
    demoRoleOverride,  setDemoRoleOverride,
    isOrgSwitched,     isDemoOrg,
    userRole,
  } = useOrg();

  const t = useTokens();

  const isDemoActive = isOrgSwitched && isDemoOrg;
  const showPill     = isDevMode || isDemoActive;
  const showFull     = isDevMode;

  // ── Delayed unmount for exit animation ───────────────────────────────────
  const [mounted, setMounted] = useState(showPill);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (showPill) {
      setMounted(true);
      setExiting(false);
    } else if (mounted) {
      setExiting(true);
      const timer = setTimeout(() => {
        setMounted(false);
        setExiting(false);
      }, EXIT_MS);
      return () => clearTimeout(timer);
    }
  }, [showPill]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) return null;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const currentRole = userRole || 'admin';

  function handleRoleChange(role) {
    if (!role) return;
    if (isDevMode) {
      setDevRoleOverride(role);
    } else {
      setDemoRoleOverride(role);
    }
  }

  const currentViewport = devMobileOverride ? 'mobile' : 'desktop';

  function handleViewportChange(val) {
    if (!val) return;
    setDevMobileOverride(val === 'mobile');
  }

  // ── Styles ────────────────────────────────────────────────────────────────

  const s = {
    wrapper: {
      position:  'fixed',
      bottom:    '24px',
      left:      '50%',
      transform: 'translateX(-50%)',
      zIndex:    500,
      animation: exiting
        ? `pillExit ${EXIT_MS}ms cubic-bezier(0.4, 0, 1, 1) both`
        : `pillEnter ${ENTER_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) both`,
    },

    // No overflow:hidden — dropdown panels must escape upward.
    // pillBg carries its own borderRadius to stay visually contained.
    pill: {
      position:     'relative',
      display:      'flex',
      alignItems:   'center',
      gap:          '4px',
      padding:      '6px 10px',
      borderRadius: RADIUS_LG,
      border:       `1px solid ${t.BORDER}`,
      boxShadow:    '0 2px 8px rgba(0,0,0,0.12)',
      fontFamily:   FONT_BODY,
    },

    pillBg: {
      position:             'absolute',
      inset:                0,
      background:           t.SURFACE,
      opacity:              0.92,
      backdropFilter:       'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      borderRadius:         RADIUS_LG,
      zIndex:               0,
    },

    pillContent: {
      position:   'relative',
      zIndex:     1,
      display:    'flex',
      alignItems: 'center',
      gap:        '4px',
    },

    divider: {
      width:      '1px',
      height:     '16px',
      background: t.BORDER,
      flexShrink: 0,
      margin:     '0 6px',
    },

    label: {
      fontSize:   '12px',
      fontWeight: FW_REGULAR,
      color:      t.TEXT_MUTED,
      whiteSpace: 'nowrap',
      userSelect: 'none',
    },
  };

  // Compact trigger style — transparent, pill-shaped, fits the floating pill context
  const dropdownTriggerStyle = {
    padding:      '4px 8px',
    fontSize:     '12px',
    fontWeight:   FW_MEDIUM,
    border:       '1px solid transparent',
    background:   'transparent',
    borderRadius: RADIUS_PILL,
  };

  return (
    <>
      <style>{`
        @keyframes pillEnter {
          from { opacity: 0; transform: translateX(-50%) scale(0.95); }
          to   { opacity: 1; transform: translateX(-50%) scale(1); }
        }
        @keyframes pillExit {
          from { opacity: 1; transform: translateX(-50%) scale(1); }
          to   { opacity: 0; transform: translateX(-50%) scale(0.95); }
        }
      `}</style>

      <div style={s.wrapper}>
        <div style={s.pill}>
          <div style={s.pillBg} />
          <div style={s.pillContent}>

            {/* Viewport toggle — dev mode only */}
            {showFull && (
              <>
                <Dropdown
                  options={VIEWPORT_OPTIONS}
                  value={currentViewport}
                  onChange={handleViewportChange}
                  placeholder="Viewport"
                  style={dropdownTriggerStyle}
                  dropUp
                  compact
                />
                <div style={s.divider} />
              </>
            )}

            {/* Viewing as role */}
            <span style={s.label}>Viewing as</span>
            <Dropdown
              options={ROLE_DROPDOWN_OPTIONS}
              value={currentRole}
              onChange={handleRoleChange}
              placeholder="Role"
              style={dropdownTriggerStyle}
              dropUp
              compact
            />

          </div>
        </div>
      </div>
    </>
  );
}