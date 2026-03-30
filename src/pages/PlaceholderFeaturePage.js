// src/pages/PlaceholderFeaturePage.js
// Placeholder destination for /product/:feature routes.
// Renders an on-brand shell until each feature subpage is built out.

import { useParams, Link } from 'react-router-dom';
import {
  SITE_ACCENT,
  L_BG, L_TEXT, L_TEXT_MUTED,
  FONT_DISPLAY, FONT_BODY,
  FW_LIGHT, FW_MEDIUM,
  MOBILE_BREAKPOINT,
} from '../utils/hqConstants';
import useWindowWidth from '../hooks/useWindowWidth';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';

const FEATURE_NAMES = {
  'notes':       'AI Note-taker',
  'daily-brief': 'Daily Brief',
  'clients':     'Client Profiles',
  'crm':         'CRM & Pipeline',
  'compliance':  'Compliance Layer',
  'search':      'Global Search',
  'team':        'Team & Access Control',
};

export default function PlaceholderFeaturePage() {
  const { feature } = useParams();
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < MOBILE_BREAKPOINT;

  const featureName = FEATURE_NAMES[feature] ?? 'Feature Detail';

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
      `}</style>

      <PublicHeader />

      <div style={{ ...s.body, padding: isMobile ? '80px 24px 120px' : '120px 40px 160px' }}>
        <p style={s.eyebrow}>Feature</p>
        <h1 style={s.title}>{featureName}</h1>
        <p style={s.sub}>
          A full walkthrough of this feature is on its way. In the meantime, you can explore the
          platform overview or get in touch to learn more.
        </p>
        <div style={s.actions}>
          <Link to="/product" style={s.linkPrimary}>Back to overview</Link>
          <Link to="/contact" style={s.linkSecondary}>Get in touch</Link>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}

const s = {
  root: { fontFamily: FONT_BODY, background: L_BG, minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  body: { flex: 1, maxWidth: '1100px', margin: '0 auto', width: '100%' },
  eyebrow: { fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase', letterSpacing: '0.18em', color: SITE_ACCENT, margin: '0 0 20px' },
  title: { fontFamily: FONT_DISPLAY, fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: FW_LIGHT, color: L_TEXT, margin: '0 0 24px', lineHeight: 1.1, letterSpacing: '0.01em' },
  sub: { fontSize: '16px', fontWeight: FW_LIGHT, lineHeight: 1.8, color: L_TEXT_MUTED, maxWidth: '520px', margin: '0 0 40px' },
  actions: { display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' },
  linkPrimary: { fontSize: '13px', fontWeight: FW_MEDIUM, color: SITE_ACCENT, textDecoration: 'none', fontFamily: FONT_BODY, letterSpacing: '0.04em' },
  linkSecondary: { fontSize: '13px', fontWeight: FW_LIGHT, color: L_TEXT_MUTED, textDecoration: 'none', fontFamily: FONT_BODY },
};