// src/components/public/PublicHeader.js
// Shared header for all public-facing pages.

import { Link } from 'react-router-dom';
import {
  FONT_DISPLAY, FONT_BODY,
  PUB_TEXT_MUTED,
  FW_LIGHT, FW_MEDIUM,
} from '../../utils/publicConstants';

export default function PublicHeader() {
  return (
    <header style={s.header}>
      <style>{`
        .pub-logo:hover     { opacity: 0.7 !important; }
        .pub-nav-link:hover { opacity: 0.7 !important; }
      `}</style>

      <Link to="/" style={s.logoLink} className="pub-logo">
        <span style={s.logo}>Allez HQ</span>
      </Link>

      <nav style={s.nav}>
        <Link to="/product"     className="pub-nav-link" style={s.navLink}>Product</Link>
        <Link to="/company"     className="pub-nav-link" style={s.navLink}>Company</Link>
        <Link to="/get-started" className="pub-nav-link" style={s.navLink}>Get Started</Link>
        <Link to="/sign-in"     className="pub-nav-link" style={s.navLink}>Sign In</Link>
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
    fontFamily: FONT_DISPLAY, fontSize: '22px', fontWeight: FW_LIGHT,
    color: PUB_TEXT_MUTED, letterSpacing: '0.06em',
  },
  nav: { display: 'flex', alignItems: 'center', gap: '36px' },
  navLink: {
    fontFamily: FONT_BODY, fontSize: '12px', fontWeight: FW_MEDIUM,
    color: PUB_TEXT_MUTED, textDecoration: 'none', textTransform: 'uppercase',
    letterSpacing: '0.1em', transition: 'opacity 0.2s',
  },
};