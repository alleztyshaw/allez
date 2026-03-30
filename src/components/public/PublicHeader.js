// src/components/public/PublicHeader.js
// Shared header for all public-facing pages.
// Desktop: horizontal nav. Mobile: hamburger (right) + full-screen overlay.

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FONT_DISPLAY, FONT_BODY,
  PUB_TEXT_MUTED, PUB_BG, PUB_TEXT, PUB_DIVIDER,
  FW_LIGHT, FW_MEDIUM, FW_SEMIBOLD,
  MOBILE_BREAKPOINT,
} from '../../utils/publicConstants';
import useWindowWidth from '../../hooks/useWindowWidth';

const NAV_LINKS = [
  { to: '/product',     label: 'Product'     },
  { to: '/company',     label: 'Company'     },
  { to: '/get-started', label: 'Get Started' },
];

export default function PublicHeader() {
  const [open, setOpen] = useState(false);
  const windowWidth     = useWindowWidth();
  const location        = useLocation();
  const isMobile        = windowWidth < MOBILE_BREAKPOINT;

  // Close overlay on navigation
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <style>{`
        .pub-logo:hover    { opacity: 0.7 !important; }
        .pub-nav-link:hover { opacity: 0.7 !important; }
        .pub-overlay-link:hover { opacity: 0.6 !important; }
        .pub-hamburger:hover { opacity: 0.7; }
      `}</style>

      <header style={s.header}>
        {/* Logo */}
        <Link to="/" style={s.logoLink} className="pub-logo">
          <span style={s.logo}>Allez HQ</span>
        </Link>

        {isMobile ? (
          /* ── Mobile: hamburger button ──────────────────────────────── */
          <button
            className="pub-hamburger"
            style={s.hamburger}
            onClick={() => setOpen(v => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? (
              /* X icon */
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 4l12 12M16 4L4 16" stroke={PUB_TEXT_MUTED} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            ) : (
              /* Hamburger icon */
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5h14M3 10h14M3 15h14" stroke={PUB_TEXT_MUTED} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        ) : (
          /* ── Desktop: horizontal nav ───────────────────────────────── */
          <nav style={s.nav}>
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} className="pub-nav-link" style={s.navLink}>{label}</Link>
            ))}
            <Link to="/sign-in" className="pub-nav-link" style={s.navLink}>Sign In</Link>
          </nav>
        )}
      </header>

      {/* ── Mobile overlay ──────────────────────────────────────────────── */}
      {isMobile && open && (
        <div style={s.overlay}>
          <nav style={s.overlayNav}>
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="pub-overlay-link"
                style={s.overlayLink}
              >
                {label}
              </Link>
            ))}
            <div style={s.overlayDivider} />
            <Link
              to="/sign-in"
              className="pub-overlay-link"
              style={s.overlaySignIn}
            >
              Sign In
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}

const s = {
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '22px 24px', position: 'relative', zIndex: 200,
  },
  logoLink: { textDecoration: 'none', transition: 'opacity 0.2s' },
  logo: {
    fontFamily:     FONT_DISPLAY,
    fontSize:       '22px',
    fontWeight:     FW_LIGHT,
    color:          PUB_TEXT_MUTED,
    letterSpacing:  '0.06em',
    whiteSpace:     'nowrap',
  },
  nav: { display: 'flex', alignItems: 'center', gap: '36px' },
  navLink: {
    fontFamily:     FONT_BODY,
    fontSize:       '12px',
    fontWeight:     FW_MEDIUM,
    color:          PUB_TEXT_MUTED,
    textDecoration: 'none',
    textTransform:  'uppercase',
    letterSpacing:  '0.1em',
    transition:     'opacity 0.2s',
  },
  hamburger: {
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'opacity 0.2s',
  },

  // Full-screen overlay
  overlay: {
    position:   'fixed',
    inset:      0,
    background: PUB_BG,
    zIndex:     199,
    display:    'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: '80px', // offset from vertical center slightly upward
  },
  overlayNav: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '8px',
  },
  overlayLink: {
    fontFamily:     FONT_BODY,
    fontSize:       '13px',
    fontWeight:     FW_MEDIUM,
    color:          PUB_TEXT_MUTED,
    textDecoration: 'none',
    textTransform:  'uppercase',
    letterSpacing:  '0.14em',
    padding:        '14px 0',
    transition:     'opacity 0.2s',
  },
  overlayDivider: {
    width: '32px', height: '1px',
    background: PUB_DIVIDER,
    margin: '8px 0',
  },
  overlaySignIn: {
    fontFamily:     FONT_DISPLAY,
    fontSize:       '32px',
    fontWeight:     FW_LIGHT,
    color:          PUB_TEXT,
    textDecoration: 'none',
    letterSpacing:  '0.04em',
    padding:        '14px 0',
    transition:     'opacity 0.2s',
  },
};