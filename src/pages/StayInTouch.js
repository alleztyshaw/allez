// src/pages/StayInTouch.js
// Public-facing stay-in-touch page at /stay-in-touch.
// Collects name and email only. Submits to /api/stay-in-touch → leads table.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PUB_BG, PUB_TEXT, PUB_ACCENT,
  PUB_BODY_MUTED, PUB_BORDER, PUB_GRADIENT,
  PUB_MESH_INDIGO, PUB_MESH_TEAL, PUB_FONTS_AND_KEYFRAMES,
  FONT_BODY,
  FW_LIGHT, FW_MEDIUM, FW_SEMIBOLD,
  MOBILE_BREAKPOINT,
} from '../utils/publicConstants';
import useWindowWidth from '../hooks/useWindowWidth';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';
import PublicHelmet from '../components/public/PublicHelmet';

export default function StayInTouch() {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < MOBILE_BREAKPOINT;

  const [form, setForm] = useState({ name: '', email: '', honeypot: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/stay-in-touch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again or email us at hello@allezhq.com.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div style={s.root}>
        <style>{PUB_FONTS_AND_KEYFRAMES}</style>
        <div style={s.meshWrap}><div style={s.mesh1} /><div style={s.mesh2} /></div>
        <PublicHelmet
          title="Stay in Touch — Allez HQ"
          description="Stay up to date on Allez HQ product news and early access opportunities."
          path="/stay-in-touch"
          noindex
        />
        <PublicHeader />
        <div style={{ ...s.page, padding: isMobile ? '64px 24px 80px' : '100px 40px 120px' }}>
          <p style={s.eyebrow}>You're in</p>
          <p style={s.successTitle}>We'll keep you in the loop.</p>
          <p style={s.successBody}>
            You'll be first to know when new access opens up and we share product updates.
            No noise — just the updates that matter.
          </p>
          <Link to="/" style={s.successLink}>Back to home</Link>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div style={s.root}>
      <style>{`
        ${PUB_FONTS_AND_KEYFRAMES}
        .submit-btn:hover { filter: brightness(1.06); }
        .form-input:focus {
          border-color: #6366f1 !important; outline: none;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
      `}</style>

      <div style={s.meshWrap}>
        <div style={s.mesh1} />
        <div style={s.mesh2} />
      </div>

      <PublicHelmet
        title="Stay in Touch — Allez HQ"
        description="Stay up to date on Allez HQ product news and early access opportunities."
        path="/stay-in-touch"
        noindex
      />
      <PublicHeader />

      <div style={{ ...s.page, padding: isMobile ? '56px 24px 80px' : '80px 40px 120px' }}>
        <p style={s.eyebrow}>Stay in touch</p>
        <p style={s.pageTitle}>Be the first to know.</p>
        <p style={s.pageSubtitle}>
          Leave your name and email and we'll keep you updated on product news,
          early access opportunities, and what we're building next. No noise — just
          the updates that matter.
        </p>

        <form onSubmit={handleSubmit} style={{ ...s.form, maxWidth: isMobile ? '100%' : '400px' }}>

          {/* Honeypot */}
          <input
            type="text" name="honeypot" value={form.honeypot}
            onChange={handleChange} tabIndex={-1}
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0 }}
            autoComplete="off"
          />

          <div style={s.fieldGroup}>
            <label style={s.label}>Name <span style={s.required}>*</span></label>
            <input className="form-input" name="name" type="text" value={form.name}
              onChange={handleChange} required placeholder="Your name" style={s.input} />
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>Email <span style={s.required}>*</span></label>
            <input className="form-input" name="email" type="email" value={form.email}
              onChange={handleChange} required placeholder="you@example.com" style={s.input} />
          </div>

          {error && <p style={s.errorText}>{error}</p>}

          <button type="submit" className="submit-btn" disabled={loading} style={s.submitBtn}>
            {loading ? 'Sending…' : 'Stay in Touch'}
          </button>

          <p style={s.demoPrompt}>
            Ready for a full walkthrough?{' '}
            <Link to="/book-a-demo" style={s.demoLink}>Book a demo</Link>
          </p>

        </form>
      </div>

      <PublicFooter />
    </div>
  );
}

const s = {
  root: {
    fontFamily: FONT_BODY, position: 'relative', background: PUB_BG,
    overflowX: 'hidden', minHeight: '100vh', display: 'flex', flexDirection: 'column',
  },
  meshWrap: { position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' },
  mesh1: {
    position: 'absolute', width: '700px', height: '700px', borderRadius: '50%',
    background: PUB_MESH_INDIGO,
    top: '-200px', left: '-200px', filter: 'blur(50px)', animation: 'mesh1 24s ease-in-out infinite',
  },
  mesh2: {
    position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
    background: PUB_MESH_TEAL,
    top: '200px', right: '-150px', filter: 'blur(50px)', animation: 'mesh2 28s ease-in-out infinite',
  },
  page: {
    flex: 1, position: 'relative', zIndex: 1,
    maxWidth: '800px', margin: '0 auto', width: '100%',
  },
  eyebrow: {
    fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase',
    letterSpacing: '0.18em', color: PUB_ACCENT, margin: '0 0 16px',
  },
  pageTitle: {
    fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: FW_LIGHT,
    color: PUB_TEXT, margin: '0 0 12px', lineHeight: 1.15, letterSpacing: '0.01em',
  },
  pageSubtitle: {
    fontSize: '15px', fontWeight: FW_LIGHT, lineHeight: 1.8,
    color: PUB_BODY_MUTED, margin: '0 0 48px', maxWidth: '480px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '24px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: {
    fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase',
    letterSpacing: '0.08em', color: PUB_TEXT,
  },
  required: { color: PUB_ACCENT, marginLeft: '2px' },
  input: {
    border: `1px solid ${PUB_BORDER}`, borderRadius: '10px', padding: '11px 14px',
    fontSize: '14px', color: PUB_TEXT, background: 'rgba(255,255,255,0.7)',
    fontFamily: FONT_BODY, transition: 'border-color 0.2s, box-shadow 0.2s', width: '100%',
    boxSizing: 'border-box',
  },
  errorText: { fontSize: '13px', color: '#e53e3e', margin: 0 },
  submitBtn: {
    background: PUB_GRADIENT, color: 'white', border: 'none', borderRadius: '10px',
    padding: '14px 32px', fontSize: '14px', fontWeight: FW_SEMIBOLD, cursor: 'pointer',
    fontFamily: FONT_BODY, letterSpacing: '0.03em', transition: 'filter 0.2s', alignSelf: 'flex-start',
  },
  demoPrompt: {
    fontSize: '13px', fontWeight: FW_LIGHT, lineHeight: 1.65,
    color: PUB_BODY_MUTED, margin: 0,
  },
  demoLink: {
    color: PUB_ACCENT, textDecoration: 'none', fontWeight: FW_MEDIUM, fontFamily: FONT_BODY,
  },
  successTitle: {
    fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: FW_LIGHT,
    color: PUB_TEXT, margin: '0 0 16px', lineHeight: 1.15,
  },
  successBody: {
    fontSize: '16px', fontWeight: FW_LIGHT, lineHeight: 1.85,
    color: PUB_BODY_MUTED, margin: '0 0 32px', maxWidth: '480px',
  },
  successLink: {
    fontSize: '13px', fontWeight: FW_MEDIUM, color: PUB_ACCENT,
    textDecoration: 'none', fontFamily: FONT_BODY,
  },
};