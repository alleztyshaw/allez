// src/pages/Contact.js
// Public-facing contact page at /contact.

import {
  SITE_ACCENT,
  L_BG, L_TEXT, L_TEXT_MUTED,
  FONT_DISPLAY, FONT_BODY,
  FW_LIGHT, FW_MEDIUM, FW_SEMIBOLD,
  MOBILE_BREAKPOINT,
} from '../utils/hqConstants';
import useWindowWidth from '../hooks/useWindowWidth';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';

function Contact() {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < MOBILE_BREAKPOINT;

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes mesh1 {
          0%,100% { transform:translate(0,0) scale(1); }
          25%      { transform:translate(60px,-80px) scale(1.08); }
          50%      { transform:translate(-40px,60px) scale(0.95); }
          75%      { transform:translate(80px,40px) scale(1.05); }
        }
        @keyframes mesh2 {
          0%,100% { transform:translate(0,0) scale(1); }
          25%      { transform:translate(-70px,50px) scale(1.06); }
          50%      { transform:translate(50px,-70px) scale(0.97); }
          75%      { transform:translate(-30px,-30px) scale(1.04); }
        }
      `}</style>

      <div style={s.meshWrap}>
        <div style={s.mesh1} />
        <div style={s.mesh2} />
      </div>

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

        <div style={{ ...s.optionsGrid, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
          <div style={s.optionCard}>
            <p style={s.optionLabel}>Email</p>
            <p style={s.optionValue}>hello@allezhq.com</p>
            <p style={s.optionNote}>For product inquiries, early access, and partnership discussions.</p>
          </div>
          <div style={s.optionCard}>
            <p style={s.optionLabel}>Phone</p>
            <p style={s.optionValue}>Coming soon</p>
            <p style={s.optionNote}>We're a small team. Email is the best way to reach us right now.</p>
          </div>
        </div>

      </div>

      <PublicFooter />
    </div>
  );
}

export default Contact;

const s = {
  root: {
    fontFamily: FONT_BODY, position: 'relative', background: L_BG,
    overflowX: 'hidden', minHeight: '100vh', display: 'flex', flexDirection: 'column',
  },

  meshWrap: { position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' },
  mesh1: {
    position: 'absolute', width: '700px', height: '700px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.30) 0%, rgba(99,102,241,0.10) 50%, transparent 70%)',
    top: '-200px', left: '-200px', filter: 'blur(50px)', animation: 'mesh1 24s ease-in-out infinite',
  },
  mesh2: {
    position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(20,184,166,0.25) 0%, rgba(20,184,166,0.08) 50%, transparent 70%)',
    top: '200px', right: '-150px', filter: 'blur(50px)', animation: 'mesh2 28s ease-in-out infinite',
  },

  page: {
    flex: 1, position: 'relative', zIndex: 1,
    maxWidth: '800px', margin: '0 auto', width: '100%',
  },

  headlineBlock: { marginBottom: '56px' },
  eyebrow: {
    fontSize: '11px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase',
    letterSpacing: '0.18em', color: SITE_ACCENT, margin: '0 0 20px',
  },
  title: {
    fontFamily: FONT_DISPLAY, fontWeight: FW_LIGHT,
    lineHeight: 1.1, margin: '0 0 20px', letterSpacing: '0.01em', color: L_TEXT,
  },
  subtitle: {
    fontSize: '16px', lineHeight: 1.8, fontWeight: FW_LIGHT,
    maxWidth: '520px', margin: 0, color: 'rgba(26,26,26,0.65)',
  },

  optionsGrid: {
    display: 'grid', gap: '16px', marginBottom: '48px',
  },
  optionCard: {
    border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '28px',
    background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  },
  optionLabel: {
    fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase',
    letterSpacing: '0.12em', color: SITE_ACCENT, margin: '0 0 10px',
  },
  optionValue: {
    fontSize: '18px', fontWeight: FW_MEDIUM, margin: '0 0 10px',
    letterSpacing: '0.01em', color: L_TEXT,
  },
  optionNote: {
    fontSize: '13px', lineHeight: 1.6, fontWeight: FW_LIGHT,
    margin: 0, color: L_TEXT_MUTED,
  },
};