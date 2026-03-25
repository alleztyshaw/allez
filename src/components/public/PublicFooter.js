// src/components/public/PublicFooter.js
// Shared footer for all public-facing pages (Login, ProductPage).

import { Link } from 'react-router-dom';
import {
  FONT_DISPLAY, FONT_BODY,
  FW_LIGHT, FW_MEDIUM, FW_SEMIBOLD,
} from '../../utils/hqConstants';

export default function PublicFooter() {
  return (
    <footer style={s.footer}>
      <div style={s.left}>
        <Link to="/" style={s.logoLink}>
          <span style={s.logo}>Allez HQ</span>
        </Link>
        <p style={s.tagline}>
          Built for advisors who believe the relationship is the product.
        </p>
      </div>
      <div style={s.right}>
        <p style={s.meta}>Currently in early access · Invite only</p>
      </div>
    </footer>
  );
}

const s = {
  footer: {
    borderTop: '1px solid rgba(0,0,0,0.07)',
    padding: '36px 48px',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
  },
  left: { display: 'flex', alignItems: 'center', gap: '20px' },
  logoLink: { textDecoration: 'none' },
  logo: {
    fontFamily: FONT_DISPLAY,
    fontSize: '20px', fontWeight: FW_SEMIBOLD,
    color: 'rgba(26,26,26,0.35)', letterSpacing: '0.06em',
  },
  tagline: {
    fontFamily: FONT_BODY,
    fontSize: '13px', fontWeight: FW_LIGHT,
    color: 'rgba(26,26,26,0.35)', margin: 0,
  },
  right: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' },
  meta: {
    fontFamily: FONT_BODY,
    fontSize: '11px', fontWeight: FW_MEDIUM,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    color: 'rgba(26,26,26,0.25)', margin: 0,
  },
};