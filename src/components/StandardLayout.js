// src/components/StandardLayout.js
// Desktop layout — fixed topbar, full-width content, dev banner when active.

import Sidebar from './Sidebar';
import DevBanner, { DEV_BANNER_HEIGHT } from './DevBanner';
import ProtectedRoute from './ProtectedRoute';
import { useOrg } from '../context/OrgContext';
import { useTokens } from '../context/ThemeContext';
import useIdleTimeout from '../hooks/useIdleTimeout';
import {
  TOPBAR_HEIGHT, FONT_BODY, FW_LIGHT, FW_MEDIUM, FOOTER_TEXT, SITE_ACCENT,
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
          <p style={{ ...footerStyle, color: t.TEXT_SUBTLE }}>
            {FOOTER_TEXT}
            {isOrgSwitched && (
              <span style={{ color: SITE_ACCENT, fontWeight: FW_MEDIUM, marginLeft: '12px' }}>
                Viewing: {switchedOrgName}
              </span>
            )}
            {isDemoMode && !isOrgSwitched && (
              <span style={{ color: t.ACCENT, fontWeight: FW_MEDIUM, marginLeft: '12px' }}>
                Viewing as {demoRoleOverride?.charAt(0).toUpperCase()}{demoRoleOverride?.slice(1)}
              </span>
            )}
            {isOrgSwitched && isDemoMode && (
              <span style={{ color: t.ACCENT, fontWeight: FW_MEDIUM, marginLeft: '8px' }}>
                · Viewing as {demoRoleOverride?.charAt(0).toUpperCase()}{demoRoleOverride?.slice(1)}
              </span>
            )}
          </p>
        </div>
        <DevBanner />
      </div>
    </ProtectedRoute>
  );
}