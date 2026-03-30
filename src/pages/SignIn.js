// src/pages/SignIn.js
// Public-facing sign-in page at /sign-in.
// Handles all auth — login, forgot password, idle notice.
// Post-auth redirect uses REACT_APP_APP_URL so the destination
// is a config swap when app.allezhq.com goes live.

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  SITE_ACCENT,
  L_BG, L_TEXT, L_TEXT_MUTED,
  FONT_BODY,
  FW_LIGHT, FW_MEDIUM, FW_SEMIBOLD,
  MOBILE_BREAKPOINT,
} from '../utils/hqConstants';
import useWindowWidth from '../hooks/useWindowWidth';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';

const APP_URL = process.env.REACT_APP_APP_URL || '/hq/brief';

export default function SignIn() {
  const location    = useLocation();
  const windowWidth = useWindowWidth();
  const isMobile    = windowWidth < MOBILE_BREAKPOINT;
  const wasIdled    = new URLSearchParams(location.search).get('reason') === 'idle';

  const [email,         setEmail]         = useState('');
  const [password,      setPassword]      = useState('');
  const [error,         setError]         = useState('');
  const [loading,       setLoading]       = useState(false);
  const [showForgot,    setShowForgot]    = useState(false);
  const [forgotEmail,   setForgotEmail]   = useState('');
  const [forgotSent,    setForgotSent]    = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      window.location.href = APP_URL;
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    setForgotLoading(true);
    await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
    });
    setForgotSent(true);
    setForgotLoading(false);
  }

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
        .signin-input:focus {
          border-color: #6366f1 !important; outline: none;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .submit-btn:hover { filter: brightness(1.06); }
        .text-link:hover  { opacity: 0.7; }
      `}</style>

      <div style={s.meshWrap}>
        <div style={s.mesh1} />
        <div style={s.mesh2} />
      </div>

      <PublicHeader />

      {wasIdled && (
        <div style={s.idleNotice}>
          You were signed out due to inactivity. Please sign in again.
        </div>
      )}

      <div style={{ ...s.page, padding: isMobile ? '56px 24px 80px' : '80px 40px 100px' }}>

        {!showForgot ? (
          <>
            <p style={s.eyebrow}>Welcome back</p>
            <form onSubmit={handleLogin} style={s.form}>
              <div style={s.fieldGroup}>
                <label style={s.fieldLabel}>Email</label>
                <input
                  className="signin-input" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required style={s.input}
                />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.fieldLabel}>Password</label>
                <input
                  className="signin-input" type="password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required style={s.input}
                />
              </div>
              {error && <p style={s.errorText}>{error}</p>}
              <button type="submit" className="submit-btn" disabled={loading} style={s.submitBtn}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
            <button
              style={s.forgotLink}
              onClick={() => { setShowForgot(true); setForgotEmail(email); setError(''); }}
            >
              Forgot password?
            </button>
          </>
        ) : forgotSent ? (
          <>
            <p style={s.eyebrow}>Check your inbox</p>
            <p style={s.forgotConfirmText}>
              If an account exists for that email, you'll receive a reset link shortly.
            </p>
            <button style={s.forgotLink} onClick={() => { setShowForgot(false); setForgotSent(false); }}>
              Back to sign in
            </button>
          </>
        ) : (
          <>
            <p style={s.eyebrow}>Forgot password</p>
            <form onSubmit={handleForgot} style={s.form}>
              <div style={s.fieldGroup}>
                <label style={s.fieldLabel}>Email</label>
                <input
                  className="signin-input" type="email" value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="you@example.com" required style={s.input}
                />
              </div>
              <button type="submit" className="submit-btn" disabled={forgotLoading} style={s.submitBtn}>
                {forgotLoading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
            <button style={s.forgotLink} onClick={() => setShowForgot(false)}>
              Back to sign in
            </button>
          </>
        )}

        <div style={s.divider} />

        {/* CTA strip */}
        <div style={s.ctaStrip}>
          <p style={s.ctaLabel}>Not yet a member?</p>
          <div style={s.ctaActions}>
            <a
              href="mailto:hello@allezhq.com?subject=Demo Request"
              className="text-link"
              style={s.ctaLink}
            >
              Book a Demo
            </a>
            <span style={s.ctaDot}>·</span>
            <span style={s.ctaOr}>or</span>
            <span style={s.ctaDot}>·</span>
            <Link to="/contact" className="text-link" style={s.ctaLink}>
              Get in touch
            </Link>
          </div>
        </div>

      </div>

      <PublicFooter />
    </div>
  );
}

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

  idleNotice: {
    position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.10)',
    borderRadius: '8px', padding: '12px 20px', fontSize: '13px',
    color: L_TEXT_MUTED, fontFamily: FONT_BODY, whiteSpace: 'nowrap', zIndex: 100,
  },

  page: {
    flex: 1, position: 'relative', zIndex: 1,
    maxWidth: '480px', margin: '0 auto', width: '100%',
  },

  eyebrow: {
    fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase',
    letterSpacing: '0.18em', color: SITE_ACCENT, margin: '0 0 16px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '16px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  fieldLabel: {
    fontSize: '11px', fontWeight: FW_MEDIUM, color: L_TEXT_MUTED,
    letterSpacing: '0.08em', textTransform: 'uppercase',
  },
  input: {
    border: '1px solid rgba(0,0,0,0.12)', borderRadius: '10px', padding: '12px 16px',
    fontSize: '15px', color: L_TEXT, background: 'rgba(255,255,255,0.7)',
    fontFamily: FONT_BODY, transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  errorText: { fontSize: '12px', color: '#e53e3e', margin: 0 },
  submitBtn: {
    background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
    color: 'white', border: 'none', borderRadius: '10px', padding: '14px',
    fontSize: '15px', fontWeight: FW_SEMIBOLD, cursor: 'pointer',
    fontFamily: FONT_BODY, letterSpacing: '0.03em',
    transition: 'filter 0.2s', marginTop: '4px',
  },
  forgotLink: {
    background: 'none', border: 'none', padding: '12px 0 0',
    fontSize: '13px', color: L_TEXT_MUTED, cursor: 'pointer',
    fontFamily: FONT_BODY, textDecoration: 'underline',
    textUnderlineOffset: '2px', display: 'block',
  },
  forgotConfirmText: {
    fontSize: '15px', fontWeight: FW_LIGHT, color: L_TEXT_MUTED,
    lineHeight: 1.7, margin: '0 0 20px',
  },

  divider: { height: '1px', background: 'rgba(0,0,0,0.07)', margin: '40px 0' },

  ctaStrip: {},
  ctaLabel: {
    fontSize: '13px', fontWeight: FW_LIGHT, color: L_TEXT_MUTED, margin: '0 0 14px',
  },
  ctaActions: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  ctaLink: {
    fontSize: '13px', fontWeight: FW_MEDIUM, color: SITE_ACCENT,
    textDecoration: 'none', fontFamily: FONT_BODY, letterSpacing: '0.02em',
    transition: 'opacity 0.15s',
  },
  ctaDot: { fontSize: '13px', color: L_TEXT_MUTED },
  ctaOr:  { fontSize: '13px', fontWeight: FW_LIGHT, color: L_TEXT_MUTED },
};