// src/components/StandardLayout.js
import Sidebar from './Sidebar';
import ProtectedRoute from './ProtectedRoute';
import { useTokens } from '../context/ThemeContext';
import useIdleTimeout from '../hooks/useIdleTimeout';
import {
  TOPBAR_HEIGHT, FONT_BODY, FW_LIGHT,
  FOOTER_TEXT,
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
  useIdleTimeout();

  return (
    <ProtectedRoute>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: t.BG }}>
        <Sidebar />
        <div style={{
          marginTop:     TOPBAR_HEIGHT,
          flex:          1,
          display:       'flex',
          flexDirection: 'column',
          minWidth:      0,
        }}>
          <main style={{ flex: 1 }}>{children}</main>
          <p style={{ ...footerStyle, color: t.TEXT_SUBTLE }}>{FOOTER_TEXT}</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}