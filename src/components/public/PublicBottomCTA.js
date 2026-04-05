// src/components/public/PublicBottomCTA.js
// Shared bottom CTA section for public pages.
// Provides a primary "Book a Demo" action and a secondary "Stay in touch" link.
// Drop in above PublicFooter on any public page.

import { Link } from 'react-router-dom';
import {
  PUB_TEXT, PUB_BODY_MUTED, PUB_ACCENT, PUB_DIVIDER, PUB_GRADIENT,
  FONT_DISPLAY, FONT_BODY,
  FW_LIGHT, FW_MEDIUM, FW_SEMIBOLD,
  MOBILE_BREAKPOINT,
} from '../../utils/publicConstants';
import useWindowWidth from '../../hooks/useWindowWidth';

export default function PublicBottomCTA() {
  const isMobile = useWindowWidth() < MOBILE_BREAKPOINT;

  return (
    <div style={{ ...s.wrap, padding: isMobile ? '64px 24px' : '80px 40px' }}>
      <p style={s.eyebrow}>Get started</p>
      <p style={{ ...s.headline, fontSize: isMobile ? '28px' : '40px' }}>
        Ready to see Allez HQ in action?
      </p>
      <p style={s.sub}>
        Book a demo and we'll walk you through the platform — tailored to your practice.
      </p>
      <div style={{ ...s.actions, flexDirection: isMobile ? 'column' : 'row' }}>
        <Link to="/book-a-demo" className="bottom-cta-primary" style={s.primary}>
          Book a Demo
        </Link>
        <Link to="/stay-in-touch" className="bottom-cta-secondary" style={s.secondary}>
          Stay in touch
        </Link>
      </div>
      <style>{`
        .bottom-cta-primary:hover  { filter: brightness(1.06); }
        .bottom-cta-secondary:hover { opacity: 0.6; }
      `}</style>
    </div>
  );
}

const s = {
  wrap: {
    borderTop: `1px solid ${PUB_DIVIDER}`,
    textAlign: 'center',
    maxWidth: '1100px',
    margin: '0 auto',
    width: '100%',
  },
  eyebrow: {
    fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase',
    letterSpacing: '0.18em', color: PUB_ACCENT, margin: '0 0 16px',
  },
  headline: {
    fontFamily: FONT_DISPLAY, fontWeight: FW_LIGHT,
    lineHeight: 1.15, letterSpacing: '0.01em',
    color: PUB_TEXT, margin: '0 0 16px',
  },
  sub: {
    fontSize: '15px', fontWeight: FW_LIGHT, lineHeight: 1.75,
    color: PUB_BODY_MUTED, margin: '0 0 36px',
  },
  actions: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px',
  },
  primary: {
    display: 'inline-block', background: PUB_GRADIENT, color: 'white',
    borderRadius: '10px', padding: '13px 32px', fontSize: '14px',
    fontWeight: FW_SEMIBOLD, fontFamily: FONT_BODY, letterSpacing: '0.03em',
    textDecoration: 'none', transition: 'filter 0.2s',
  },
  secondary: {
    display: 'inline-block', fontSize: '14px', fontWeight: FW_MEDIUM,
    color: PUB_ACCENT, textDecoration: 'none', fontFamily: FONT_BODY,
    letterSpacing: '0.02em', transition: 'opacity 0.2s',
  },
};