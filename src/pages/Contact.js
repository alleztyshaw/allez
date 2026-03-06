import '../App.css';
import {
  SITE_ACCENT, SITE_ACCENT_MUTED, SITE_ACCENT_BORDER,
  FONT_DISPLAY, FONT_BODY,
  RADIUS_LG,
  MAX_WIDTH,
} from '../utils/hqConstants';

function Contact() {
  return (
    <div style={s.pageWrapper}>
      <div style={s.page}>

        <div style={s.headlineBlock}>
          <p style={s.eyebrow}>Get in touch</p>
          <h2 style={s.title}>Built for advisors.<br />Let's talk.</h2>
          <p style={s.subtitle}>
            Whether you're a solo RIA, a boutique firm, or exploring what a purpose-built
            CRM could look like for your practice — we'd like to hear from you.
          </p>
        </div>

        <div style={s.optionsGrid}>
          <div style={s.optionCard}>
            <p style={s.optionLabel}>Email</p>
            <p style={s.optionValue}>hello@allezcapital.com</p>
            <p style={s.optionNote}>For product inquiries, early access, and partnership discussions.</p>
          </div>
          <div style={s.optionCard}>
            <p style={s.optionLabel}>Phone</p>
            <p style={s.optionValue}>Coming soon</p>
            <p style={s.optionNote}>We're a small team. Email is the best way to reach us right now.</p>
          </div>
        </div>

        <p style={s.footerNote}>
          Allez Capital is based in the United States. Allez HQ is currently in early development.
        </p>

      </div>
    </div>
  );
}

const s = {
  pageWrapper: {
    minHeight: '100vh',
    width: '100%',
    fontFamily: FONT_BODY,
  },
  page: {
    maxWidth: MAX_WIDTH,
    margin: '0 auto',
    padding: '120px 40px 80px',
    boxSizing: 'border-box',
  },
  headlineBlock: {
    marginBottom: '56px',
  },
  eyebrow: {
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: SITE_ACCENT,
    margin: '0 0 16px',
  },
  title: {
    fontFamily: FONT_DISPLAY,
    fontSize: '52px',
    fontWeight: '300',
    lineHeight: 1.15,
    margin: '0 0 20px',
    letterSpacing: '0.01em',
  },
  subtitle: {
    fontSize: '16px',
    lineHeight: '1.7',
    fontWeight: '300',
    maxWidth: '520px',
    margin: 0,
    opacity: 0.75,
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '48px',
    maxWidth: '720px',
  },
  optionCard: {
    border: `1px solid ${SITE_ACCENT_BORDER}`,
    borderRadius: RADIUS_LG,
    padding: '28px',
    background: SITE_ACCENT_MUTED,
  },
  optionLabel: {
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: SITE_ACCENT,
    margin: '0 0 10px',
  },
  optionValue: {
    fontSize: '18px',
    fontWeight: '500',
    margin: '0 0 10px',
    letterSpacing: '0.01em',
  },
  optionNote: {
    fontSize: '13px',
    lineHeight: '1.6',
    fontWeight: '300',
    margin: 0,
    opacity: 0.6,
  },
  footerNote: {
    fontSize: '12px',
    fontWeight: '300',
    opacity: 0.4,
    margin: 0,
    letterSpacing: '0.02em',
  },
};

export default Contact;