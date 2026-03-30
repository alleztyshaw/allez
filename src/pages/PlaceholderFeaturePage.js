// src/pages/PlaceholderFeaturePage.js
// Placeholder destination for /product/:feature routes.

import { useParams, Link } from 'react-router-dom';
import {
  PUB_BG, PUB_TEXT, PUB_TEXT_MUTED, PUB_ACCENT, PUB_BODY_MUTED,
  PUB_MESH_INDIGO, PUB_MESH_TEAL, PUB_FONTS_AND_KEYFRAMES,
  FONT_DISPLAY, FONT_BODY,
  FW_LIGHT, FW_MEDIUM,
  MOBILE_BREAKPOINT,
} from '../utils/publicConstants';
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
      <style>{PUB_FONTS_AND_KEYFRAMES}</style>

      <div style={s.meshWrap}>
        <div style={s.mesh1} />
        <div style={s.mesh2} />
      </div>

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
  root: { fontFamily: FONT_BODY, background: PUB_BG, minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'hidden' },
  meshWrap: { position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' },
  mesh1: {
    position: 'absolute', width: '700px', height: '700px', borderRadius: '50%',
    background: PUB_MESH_INDIGO, top: '-200px', left: '-200px',
    filter: 'blur(50px)', animation: 'mesh1 24s ease-in-out infinite',
  },
  mesh2: {
    position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
    background: PUB_MESH_TEAL, top: '200px', right: '-150px',
    filter: 'blur(50px)', animation: 'mesh2 28s ease-in-out infinite',
  },
  body: { flex: 1, position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', width: '100%' },
  eyebrow: {
    fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase',
    letterSpacing: '0.18em', color: PUB_ACCENT, margin: '0 0 20px',
  },
  title: {
    fontFamily: FONT_DISPLAY, fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: FW_LIGHT,
    color: PUB_TEXT, margin: '0 0 24px', lineHeight: 1.1, letterSpacing: '0.01em',
  },
  sub: { fontSize: '16px', fontWeight: FW_LIGHT, lineHeight: 1.8, color: PUB_BODY_MUTED, maxWidth: '520px', margin: '0 0 40px' },
  actions: { display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' },
  linkPrimary: { fontSize: '13px', fontWeight: FW_MEDIUM, color: PUB_ACCENT, textDecoration: 'none', fontFamily: FONT_BODY, letterSpacing: '0.04em' },
  linkSecondary: { fontSize: '13px', fontWeight: FW_LIGHT, color: PUB_TEXT_MUTED, textDecoration: 'none', fontFamily: FONT_BODY },
};