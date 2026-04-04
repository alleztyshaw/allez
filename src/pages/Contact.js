// src/pages/Contact.js
// Public-facing contact page at /contact.

import { Link } from 'react-router-dom';
import {
  PUB_BG, PUB_TEXT, PUB_ACCENT,
  PUB_BODY_MUTED, PUB_BORDER, PUB_CARD_BG,
  PUB_MESH_INDIGO, PUB_MESH_TEAL, PUB_FONTS_AND_KEYFRAMES,
  FONT_DISPLAY, FONT_BODY,
  FW_LIGHT, FW_MEDIUM, FW_SEMIBOLD,
  MOBILE_BREAKPOINT,
} from '../utils/publicConstants';
import useWindowWidth from '../hooks/useWindowWidth';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';
import PublicHelmet from '../components/public/PublicHelmet';

function Contact() {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < MOBILE_BREAKPOINT;

  return (
    <div style={s.root}>
      <style>{PUB_FONTS_AND_KEYFRAMES}</style>

      <div style={s.meshWrap}>
        <div style={s.mesh1} />
        <div style={s.mesh2} />
      </div>

      <PublicHelmet
        title="Contact — Allez HQ"
        description="Get in touch with the Allez HQ team for product inquiries, early access, and partnership discussions."
        path="/contact"
      />
      <PublicHeader />

      <div style={{ ...s.page, padding: isMobile ? '64px 24px' : '100px 40px' }}>

        <div style={s.headlineBlock}>
          <p style={s.eyebrow}>Get in touch</p>
          <h1 style={{ ...s.title, fontSize: isMobile ? '36px' : '52px' }}>
            Built for advisors.<br />Let's talk.
          </h1>
          <p style={s.subtitle}>
            Whether you're exploring what a purpose-built platform could look like
            for your practice, interested in early access, or want to discuss a partnership
            — we'd like to hear from you.
          </p>
        </div>

        <div style={s.optionCard}>
          <p style={s.optionLabel}>Email</p>
          <p style={s.optionValue}>hello@allezhq.com</p>
          <p style={s.optionNote}>For product inquiries, early access, and partnership discussions.</p>
        </div>

        <p style={s.demoPrompt}>
          Ready to see the platform?{' '}
          <Link to="/book-a-demo" style={s.demoLink}>Book a demo</Link>
          {' '}and we'll be in touch within one business day.
        </p>

      </div>

      <PublicFooter />
    </div>
  );
}

export default Contact;

const s = {
  root: {
    fontFamily: FONT_BODY, position: 'relative', background: PUB_BG,
    overflowX: 'hidden', minHeight: '100vh', display: 'flex', flexDirection: 'column',
  },
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
  page: {
    flex: 1, position: 'relative', zIndex: 1,
    maxWidth: '800px', margin: '0 auto', width: '100%',
  },
  headlineBlock: { marginBottom: '48px' },
  eyebrow: {
    fontSize: '11px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase',
    letterSpacing: '0.18em', color: PUB_ACCENT, margin: '0 0 20px',
  },
  title: {
    fontFamily: FONT_DISPLAY, fontWeight: FW_LIGHT,
    lineHeight: 1.1, margin: '0 0 20px', letterSpacing: '0.01em', color: PUB_TEXT,
  },
  subtitle: {
    fontSize: '16px', lineHeight: 1.8, fontWeight: FW_LIGHT,
    margin: 0, color: PUB_BODY_MUTED,
  },
  optionCard: {
    border: `1px solid ${PUB_BORDER}`, borderRadius: '12px', padding: '28px',
    background: PUB_CARD_BG, backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)', marginBottom: '32px',
    maxWidth: '400px',
  },
  optionLabel: {
    fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase',
    letterSpacing: '0.12em', color: PUB_ACCENT, margin: '0 0 10px',
  },
  optionValue: {
    fontSize: '18px', fontWeight: FW_MEDIUM, margin: '0 0 10px',
    letterSpacing: '0.01em', color: PUB_TEXT,
  },
  optionNote: {
    fontSize: '13px', lineHeight: 1.6, fontWeight: FW_LIGHT,
    margin: 0, color: PUB_BODY_MUTED,
  },
  demoPrompt: {
    fontSize: '14px', fontWeight: FW_LIGHT, lineHeight: 1.7,
    color: PUB_BODY_MUTED, margin: 0,
  },
  demoLink: {
    color: PUB_ACCENT, textDecoration: 'none', fontWeight: FW_MEDIUM,
    fontFamily: FONT_BODY,
  },
};