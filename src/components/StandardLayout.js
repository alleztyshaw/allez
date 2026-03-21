// src/components/StandardLayout.js
import Sidebar from './Sidebar';
import DevBanner, { DEV_BANNER_HEIGHT } from './DevBanner';
import ProtectedRoute from './ProtectedRoute';
import { useOrg } from '../context/OrgContext';
import { useTokens } from '../context/ThemeContext';
import useIdleTimeout from '../hooks/useIdleTimeout';
import {
  TOPBAR_HEIGHT, FONT_BODY, FW_LIGHT, FW_SEMIBOLD,
  FOOTER_TEXT, RADIUS_LG,
  SITE_ACCENT, SITE_ACCENT_MUTED, SITE_ACCENT_BORDER,
} from '../utils/hqConstants';

const footerStyle = {
  textAlign:     'center',
  fontSize:      '12px',
  fontWeight:    FW_LIGHT,
  letterSpacing: '0.04em',
  padding:       '24px 20px',
  margin:        0,
  fontFamily:    FONT_BODY,
};

export default function StandardLayout({ children }) {
  const t = useTokens();
  const {
    isDevMode, isDemoMode, demoRoleOverride,
    isOrgSwitched, isPlatformAdmin, isDemoOrg,
    exitSwitchedOrg,
  } = useOrg();
  useIdleTimeout();

  // Only show to platform admins viewing the demo org
  const showIndicator = isPlatformAdmin && isDemoOrg;

  // Build label: "Viewing Demo as Advisor" or just "Viewing Demo"
  let indicatorLabel = 'Viewing Demo';
  if (isDemoMode && demoRoleOverride) {
    const role = demoRoleOverride.charAt(0).toUpperCase() + demoRoleOverride.slice(1);
    indicatorLabel = `Viewing Demo as ${role}`;
  }

  return (
    <ProtectedRoute>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: t.BG }}>
        <Sidebar />
        <div style={{
          marginTop:     TOPBAR_HEIGHT,
          paddingBottom: isDevMode ? DEV_BANNER_HEIGHT : 0,
          flex:          1,
          display:       'flex',
          flexDirection: 'column',
          minWidth:      0,
        }}>
          <main style={{ flex: 1 }}>{children}</main>
          <p style={{ ...footerStyle, color: t.TEXT_SUBTLE }}>{FOOTER_TEXT}</p>
        </div>
        <DevBanner />

        {/* Demo indicator — platform admin in demo org only */}
        {showIndicator && (
          <div style={{
            position:       'fixed',
            bottom:         '20px',
            left:           '50%',
            transform:      'translateX(-50%)',
            background:     SITE_ACCENT_MUTED,
            border:         `1px solid ${SITE_ACCENT_BORDER}`,
            backdropFilter: 'blur(8px)',
            borderRadius:   RADIUS_LG,
            padding:        '8px 12px 8px 18px',
            zIndex:         500,
            display:        'flex',
            alignItems:     'center',
            gap:            '10px',
            pointerEvents:  'auto',
          }}>
            <span style={{
              fontSize:      '12px',
              fontWeight:    FW_SEMIBOLD,
              color:         SITE_ACCENT,
              fontFamily:    FONT_BODY,
              letterSpacing: '0.02em',
              whiteSpace:    'nowrap',
            }}>
              {indicatorLabel}
            </span>
            {isOrgSwitched && (
              <button
                onClick={exitSwitchedOrg}
                aria-label="Exit demo"
                style={{
                  background: 'none',
                  border:     'none',
                  cursor:     'pointer',
                  color:      SITE_ACCENT,
                  fontSize:   '16px',
                  lineHeight: 1,
                  padding:    '0 2px',
                  fontFamily: FONT_BODY,
                  flexShrink: 0,
                }}
              >×</button>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}