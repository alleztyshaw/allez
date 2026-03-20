// src/components/MobilePreviewLayout.js
// Dev-only layout — constrains content to a 390px phone frame centered in the browser.
// Only rendered when devMobileOverride is active for platform admins.

import Sidebar from './Sidebar';
import DevBanner, { DEV_BANNER_HEIGHT } from './DevBanner';
import ProtectedRoute from './ProtectedRoute';
import { useTokens } from '../context/ThemeContext';
import useIdleTimeout from '../hooks/useIdleTimeout';
import {
  FONT_BODY, FW_LIGHT, FOOTER_TEXT,
} from '../utils/hqConstants';

const MOBILE_PREVIEW_WIDTH = 390; // iPhone 14 width

const footerStyle = {
  textAlign:     'center',
  fontSize:      '12px',
  fontWeight:    FW_LIGHT,
  letterSpacing: '0.04em',
  padding:       '24px 20px',
  margin:        0,
  fontFamily:    FONT_BODY,
};

export default function MobilePreviewLayout({ children }) {
  const t = useTokens();
  useIdleTimeout();

  return (
    <ProtectedRoute>
      {/* Outer frame — dimmed browser background with padding around phone */}
      <div style={{
        minHeight:      '100vh',
        background:     t.SURFACE_ALT,
        display:        'flex',
        justifyContent: 'center',
        padding:        `32px 0 calc(32px + ${DEV_BANNER_HEIGHT}px)`,
      }}>
        {/* Phone frame — 390px container, all content inside including topbar */}
        <div style={{
          position:      'relative',
          width:          MOBILE_PREVIEW_WIDTH,
          maxWidth:       '100%',
          background:     t.BG,
          borderRadius:   '16px',
          overflow:       'hidden',
          boxShadow:      `0 0 0 1px ${t.BORDER}, 0 24px 64px rgba(0,0,0,0.4)`,
          display:        'flex',
          flexDirection:  'column',
          minHeight:      'calc(100vh - 64px)',
        }}>
          <Sidebar />
          <main style={{ flex: 1 }}>{children}</main>
          <p style={{ ...footerStyle, color: t.TEXT_SUBTLE }}>{FOOTER_TEXT}</p>
        </div>
      </div>
      <DevBanner />
    </ProtectedRoute>
  );
}