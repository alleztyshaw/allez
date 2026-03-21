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
  const { isDevMode, isDemoMode, demoRoleOverride, isOrgSwitched, switchedOrgName } = useOrg();
  useIdleTimeout();

  const showIndicator = isOrgSwitched || isDemoMode;

  // Build indicator label: "Viewing Demo Org as Advisor" or "Viewing Demo Org" or "Viewing as Advisor"
  let indicatorLabel = '';
  if (isOrgSwitched && isDemoMode) {
    indicatorLabel = `Viewing ${switchedOrgName} as ${demoRoleOverride?.charAt(0).toUpperCase()}${demoRoleOverride?.slice(1)}`;
  } else if (isOrgSwitched) {
    indicatorLabel = `Viewing ${switchedOrgName}`;
  } else if (isDemoMode) {
    indicatorLabel = `Viewing as ${demoRoleOverride?.charAt(0).toUpperCase()}${demoRoleOverride?.slice(1)}`;
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

        {/* Demo / org-switch indicator — fixed card, always visible */}
        {showIndicator && (
          <div style={{
            position:     'fixed',
            bottom:       '20px',
            left:         '50%',
            transform:    'translateX(-50%)',
            background:   isOrgSwitched ? `rgba(102,126,234,0.92)` : `rgba(41,196,122,0.92)`,
            backdropFilter: 'blur(8px)',
            borderRadius: RADIUS_LG,
            padding:      '8px 18px',
            zIndex:       500,
            pointerEvents: 'none',
          }}>
            <span style={{
              fontSize:   '12px',
              fontWeight: FW_SEMIBOLD,
              color:      '#ffffff',
              fontFamily: FONT_BODY,
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
            }}>
              {indicatorLabel}
            </span>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}