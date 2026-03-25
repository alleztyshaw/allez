// src/components/public/PublicHeader.js
// Shared header for all public-facing pages (Login, ProductPage).
// No auth context — purely presentational.

import { Link } from 'react-router-dom';
import {
  FONT_DISPLAY, FONT_BODY,
  L_TEXT,
  FW_LIGHT, FW_MEDIUM,
} from '../../utils/hqConstants';

export default function PublicHeader({ onSignIn }) {
  return (
    <header style={s.header}>
      <style>{`
        .pub-nav-link:hover  { opacity: 0.6 !important; }
        .pub-sign-in:hover   { opacity: 0.6 !important; }
        .pub-logo:hover      { opacity: 0.75 !important; }
      `}</style>

      <Link to="/" style={s.logoLink} className="pub-logo">
        <span style={s.logo}>Allez HQ</span>
      </Link>

      <nav style={s.nav}>
        <Link to="/product" className="pub-nav-link" style={s.navLink}>Product</Link>
        {onSignIn && (
          <button className="pub-sign-in" style={s.signInBtn} onClick={onSignIn}>
            Sign In
          </button>
        )}
      </nav>
    </header>
  );
}

const s = {
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '22px 48px', position: 'relative', zIndex: 10,
  },
  logoLink: { textDecoration: 'none', transition: 'opacity 0.2s' },
  logo: {
    fontFamily: FONT_DISPLAY,
    fontSize: '22px',
    fontWeight: FW_LIGHT,
    color: L_TEXT,
    letterSpacing: '0.06em',
  },
  nav: { display: 'flex', alignItems: 'center', gap: '36px' },
  navLink: {
    fontFamily: FONT_BODY,
    fontSize: '15px',
    fontWeight: FW_MEDIUM,
    color: L_TEXT,
    textDecoration: 'none',
    letterSpacing: '0.01em',
    transition: 'opacity 0.2s',
  },
  signInBtn: {
    background: 'none', border: 'none', padding: 0,
    fontFamily: FONT_BODY,
    fontSize: '15px',
    fontWeight: FW_MEDIUM,
    color: L_TEXT,
    cursor: 'pointer',
    letterSpacing: '0.01em',
    transition: 'opacity 0.2s',
  },
};