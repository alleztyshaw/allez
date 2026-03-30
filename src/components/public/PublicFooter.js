// src/components/public/PublicFooter.js
// Shared footer for all public-facing pages.

import { Link } from 'react-router-dom';
import {
  FONT_DISPLAY, FONT_BODY,
  PUB_TEXT_SUBTLE, PUB_DIVIDER,
  FW_LIGHT, FW_MEDIUM, FW_SEMIBOLD,
  MOBILE_BREAKPOINT,
} from '../../utils/publicConstants';
import useWindowWidth from '../../hooks/useWindowWidth';

export default function PublicFooter() {
  const isMobile = useWindowWidth() < MOBILE_BREAKPOINT;

  return (
    <footer style={{ ...s.footer, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', padding: isMobile ? '28px 24px' : '36px 48px' }}>
      <div style={s.left}>
        <Link to="/" style={s.logoLink}>
          <span style={{ ...s.logo, fontSize: isMobile ? '16px' : '20px' }}>Allez HQ</span>
        </Link>
        <p style={s.tagline}>
          Built for advisors who believe the relationship is the product.
        </p>
      </div>
      <div style={{ ...s.right, alignItems: isMobile ? 'flex-start' : 'flex-end', marginTop: isMobile ? '16px' : 0 }}>
        <p style={s.meta}>Currently in early access · Invite only</p>
      </div>
    </footer>
  );
}

const s = {
  footer: {
    borderTop: `1px solid ${PUB_DIVIDER}`,
    display: 'flex', flexWrap: 'wrap', gap: '8px',
  },
  left: { display: 'flex', alignItems: 'center', gap: '16px', flex: 1 },
  logoLink: { textDecoration: 'none', flexShrink: 0 },
  logo: {
    fontFamily: FONT_DISPLAY,
    fontWeight: FW_SEMIBOLD,
    color: PUB_TEXT_SUBTLE,
    letterSpacing: '0.06em',
    whiteSpace: 'nowrap',
  },
  tagline: {
    fontFamily: FONT_BODY,
    fontSize: '13px', fontWeight: FW_LIGHT,
    color: PUB_TEXT_SUBTLE, margin: 0,
  },
  right: { display: 'flex', flexDirection: 'column', gap: '4px' },
  meta: {
    fontFamily: FONT_BODY,
    fontSize: '11px', fontWeight: FW_MEDIUM,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    color: 'rgba(26,26,26,0.25)', margin: 0,
  },
};