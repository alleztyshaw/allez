import { useState, useEffect } from 'react';
import {
  ACCENT,
  FONT_DISPLAY,
  RADIUS_LG, SHADOW_MD,
  pageStyles,
  MOBILE_BREAKPOINT,
  FW_LIGHT, FW_REGULAR, FW_MEDIUM, FW_SEMIBOLD} from '../utils/hqConstants';
import { useTokens } from '../context/ThemeContext';
import useWindowWidth from '../hooks/useWindowWidth';

function Contact() {
  const t = useTokens();
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < MOBILE_BREAKPOINT;

  const s = {
    ...pageStyles(t, isMobile),
    headlineBlock: { marginBottom: '56px' },
    eyebrow: { fontSize: '11px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.12em', color: ACCENT, margin: '0 0 16px' },
    optionsGrid: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '48px', maxWidth: '720px' },
    optionCard: { border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, padding: '28px', background: t.SURFACE, boxShadow: SHADOW_MD },
    optionLabel: { fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.12em', color: ACCENT, margin: '0 0 10px' },
    optionValue: { fontSize: '18px', fontWeight: FW_MEDIUM, margin: '0 0 10px', letterSpacing: '0.01em', color: t.TEXT },
    optionNote: { fontSize: '13px', lineHeight: '1.6', fontWeight: FW_LIGHT, margin: 0, color: t.TEXT_MUTED },
  };
  // Override title/subtitle after spread — Contact uses larger hero typography
  s.title    = { fontFamily: FONT_DISPLAY, fontSize: isMobile ? '36px' : '52px', fontWeight: FW_LIGHT, lineHeight: 1.15, margin: '0 0 20px', letterSpacing: '0.01em', color: t.TEXT };
  s.subtitle = { fontSize: '16px', lineHeight: '1.7', fontWeight: FW_LIGHT, maxWidth: '520px', margin: 0, color: t.TEXT_MUTED };

  return (
    <div style={s.pageWrapper}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>
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

      </div>
    </div>
  );
}

export default Contact;