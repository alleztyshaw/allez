// src/pages/BookADemo.js
// Public-facing demo booking page at /book-a-demo.
// Submits to /api/book-a-demo → Supabase leads table.
// Turnstile CAPTCHA wired but inactive until REACT_APP_TURNSTILE_SITE_KEY is set.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PUB_BG, PUB_TEXT, PUB_TEXT_MUTED, PUB_TEXT_SUBTLE, PUB_ACCENT,
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

const FEATURES = [
  'AI Note-taker',
  'Daily Brief',
  'Client CRM',
  'Pipeline Management',
  'Compliance Layer',
  'Team & Access Control',
];

const CURRENT_TOOLS = [
  'Redtail',
  'Wealthbox',
  'Salesforce',
  'Practifi',
  'Spreadsheets / No dedicated CRM',
];

const NUM_ADVISORS = ['1', '2–5', '6–15', '15+'];

export default function BookADemo() {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < MOBILE_BREAKPOINT;

  const [form, setForm] = useState({
    name: '', email: '', firmName: '', phone: '',
    features: [], currentTools: [], otherTools: '',
    numAdvisors: '', message: '',
    honeypot: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function toggleArray(field, value) {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter(v => v !== value)
        : [...f[field], value],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/book-a-demo', {
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
        title="Book a Demo — Allez HQ"
        description="Request a demo of Allez HQ with our team."
        path="/book-a-demo" noindex
      />
      <PublicHeader />
        <div style={{ ...s.page, padding: isMobile ? '64px 24px 80px' : '100px 40px 120px' }}>
          <p style={s.eyebrow}>We'll be in touch</p>
          <p style={s.successTitle}>Request received.</p>
          <p style={s.successBody}>
            Thanks for your interest in Allez HQ. Someone from our team will reach
            out within one business day.
          </p>
          <Link to="/product" style={s.successLink}>Back to the platform overview</Link>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div style={s.root}>
      <style>{`
        ${PUB_FONTS_AND_KEYFRAMES}
        .submit-btn:hover  { filter: brightness(1.06); }
        .pill-btn:hover    { opacity: 0.8; }
        .form-input:focus  {
          border-color: #6366f1 !important; outline: none;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
      `}</style>

      <div style={s.meshWrap}>
        <div style={s.mesh1} />
        <div style={s.mesh2} />
      </div>

      <PublicHeader />

      <div style={{ ...s.page, padding: isMobile ? '56px 24px 80px' : '80px 40px 120px' }}>

        <p style={s.eyebrow}>Book a Demo</p>
        <p style={s.pageTitle}>Let's find a time to connect.</p>
        <p style={s.pageSubtitle}>
          Tell us a bit about your practice and we'll reach out to schedule a
          walkthrough tailored to your needs.
        </p>

        <form onSubmit={handleSubmit} style={{ ...s.form, maxWidth: isMobile ? '100%' : '560px' }}>

          {/* Honeypot — hidden from real users, bots fill this */}
          <input
            type="text" name="honeypot" value={form.honeypot}
            onChange={handleChange} tabIndex={-1}
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0 }}
            autoComplete="off"
          />

          <div style={{ ...s.row, flexDirection: isMobile ? 'column' : 'row' }}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Name <span style={s.required}>*</span></label>
              <input className="form-input" name="name" type="text" value={form.name}
                onChange={handleChange} required placeholder="Your name" style={s.input} />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Firm Name <span style={s.required}>*</span></label>
              <input className="form-input" name="firmName" type="text" value={form.firmName}
                onChange={handleChange} required placeholder="Your firm" style={s.input} />
            </div>
          </div>

          <div style={{ ...s.row, flexDirection: isMobile ? 'column' : 'row' }}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Email <span style={s.required}>*</span></label>
              <input className="form-input" name="email" type="email" value={form.email}
                onChange={handleChange} required placeholder="you@example.com" style={s.input} />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Phone <span style={s.optional}>optional</span></label>
              <input className="form-input" name="phone" type="tel" value={form.phone}
                onChange={handleChange} placeholder="+1 (555) 000-0000" style={s.input} />
            </div>
          </div>

          <div style={s.fieldGroupFull}>
            <label style={s.label}>Number of Advisors <span style={s.optional}>optional</span></label>
            <div style={s.pillGroup}>
              {NUM_ADVISORS.map(n => (
                <button key={n} type="button" className="pill-btn"
                  onClick={() => setForm(f => ({ ...f, numAdvisors: f.numAdvisors === n ? '' : n }))}
                  style={{ ...s.pill, ...(form.numAdvisors === n ? s.pillActive : {}) }}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div style={s.fieldGroupFull}>
            <label style={s.label}>Features of Interest <span style={s.optional}>optional</span></label>
            <div style={s.pillGroup}>
              {FEATURES.map(f => (
                <button key={f} type="button" className="pill-btn"
                  onClick={() => toggleArray('features', f)}
                  style={{ ...s.pill, ...(form.features.includes(f) ? s.pillActive : {}) }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div style={s.fieldGroupFull}>
            <label style={s.label}>Current Tools <span style={s.optional}>optional</span></label>
            <div style={s.pillGroup}>
              {CURRENT_TOOLS.map(t => (
                <button key={t} type="button" className="pill-btn"
                  onClick={() => toggleArray('currentTools', t)}
                  style={{ ...s.pill, ...(form.currentTools.includes(t) ? s.pillActive : {}) }}>
                  {t}
                </button>
              ))}
            </div>
            <input className="form-input" name="otherTools" type="text" value={form.otherTools}
              onChange={handleChange} placeholder="Other (please specify)"
              style={{ ...s.input, marginTop: '10px' }} />
          </div>

          <div style={s.fieldGroupFull}>
            <label style={s.label}>Anything else? <span style={s.optional}>optional</span></label>
            <textarea className="form-input" name="message" value={form.message}
              onChange={handleChange} rows={4}
              placeholder="Tell us about your practice or anything you'd like us to know"
              style={{ ...s.input, resize: 'vertical', lineHeight: 1.65 }} />
          </div>

          {/* TODO: Turnstile CAPTCHA — add REACT_APP_TURNSTILE_SITE_KEY env var to activate */}

          {error && <p style={s.errorText}>{error}</p>}

          <p style={s.reassurance}>
            After you submit, someone from our team will reach out within one business day
            to schedule a walkthrough tailored to your practice.
          </p>

          <button type="submit" className="submit-btn" disabled={loading} style={s.submitBtn}>
            {loading ? 'Sending…' : 'Request a Demo'}
          </button>

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
  row: { display: 'flex', gap: '16px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  fieldGroupFull: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: {
    fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase',
    letterSpacing: '0.08em', color: PUB_TEXT_MUTED,
  },
  required: { color: PUB_ACCENT, marginLeft: '2px' },
  optional: {
    fontSize: '10px', fontWeight: FW_LIGHT, textTransform: 'none',
    letterSpacing: 0, color: PUB_TEXT_SUBTLE, marginLeft: '6px',
  },
  input: {
    border: `1px solid ${PUB_BORDER}`, borderRadius: '10px', padding: '11px 14px',
    fontSize: '14px', color: PUB_TEXT, background: 'rgba(255,255,255,0.7)',
    fontFamily: FONT_BODY, transition: 'border-color 0.2s, box-shadow 0.2s', width: '100%',
    boxSizing: 'border-box',
  },
  pillGroup: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  pill: {
    padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: FW_MEDIUM,
    fontFamily: FONT_BODY, cursor: 'pointer', transition: 'all 0.15s',
    background: 'rgba(255,255,255,0.7)', border: `1px solid ${PUB_BORDER}`, color: PUB_TEXT_MUTED,
  },
  pillActive: {
    background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.35)', color: PUB_ACCENT,
  },
  errorText: { fontSize: '13px', color: '#e53e3e', margin: 0 },
  reassurance: {
    fontSize: '13px', fontWeight: FW_LIGHT, lineHeight: 1.65,
    color: PUB_TEXT_SUBTLE, margin: 0,
  },
  submitBtn: {
    background: PUB_GRADIENT, color: 'white', border: 'none', borderRadius: '10px',
    padding: '14px 32px', fontSize: '14px', fontWeight: FW_SEMIBOLD, cursor: 'pointer',
    fontFamily: FONT_BODY, letterSpacing: '0.03em', transition: 'filter 0.2s', alignSelf: 'flex-start',
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