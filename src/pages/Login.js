import { useState, useEffect } from 'react';
import {
  SITE_ACCENT,
  L_BG, L_TEXT, L_TEXT_MUTED,
  FONT_DISPLAY, FONT_BODY,
  FW_LIGHT, FW_REGULAR, FW_MEDIUM, FW_SEMIBOLD,
  MOBILE_BREAKPOINT,
} from '../utils/hqConstants';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import useWindowWidth from '../hooks/useWindowWidth';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < MOBILE_BREAKPOINT;
  const wasIdled   = new URLSearchParams(location.search).get('reason') === 'idle';
  const [showLogin, setShowLogin] = useState(false);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showForgot,      setShowForgot]      = useState(false);
  const [forgotEmail,     setForgotEmail]     = useState('');
  const [forgotSent,      setForgotSent]      = useState(false);
  const [forgotLoading,   setForgotLoading]   = useState(false);

  // Open the login card whenever ?signin=true appears in the URL —
  // including when the user is already on / and clicks Sign In
  useEffect(() => {
    if (new URLSearchParams(location.search).get('signin') === 'true') {
      setShowLogin(true);
    }
  }, [location.search]);

  async function handleForgot(e) {
    e.preventDefault();
    setForgotLoading(true);
    await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
    });
    // Always show success — don't leak whether email exists
    setForgotSent(true);
    setForgotLoading(false);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/hq/brief');
    }
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
        @keyframes mesh3 {
          0%,100% { transform:translate(0,0) scale(1); }
          33%      { transform:translate(50px,60px) scale(1.07); }
          66%      { transform:translate(-60px,-40px) scale(0.96); }
        }
        @keyframes mesh4 {
          0%,100% { transform:translate(0,0) scale(1); }
          40%      { transform:translate(-80px,30px) scale(1.05); }
          80%      { transform:translate(40px,-60px) scale(0.98); }
        }
        @keyframes fadeDown {
          from { opacity:0; transform:translateY(-10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes scrollBounce {
          0%,100% { transform:translateY(0); opacity:0.5; }
          50%      { transform:translateY(6px); opacity:1; }
        }
        .submit-btn:hover  { filter:brightness(1.06); }
        .login-input:focus {
          border-color:#6366f1 !important; outline:none;
          box-shadow:0 0 0 3px rgba(99,102,241,0.12);
        }
        .value-card:hover {
          background:rgba(255,255,255,0.20) !important;
          transform:translateY(-2px);
        }
        .scroll-cue { animation:scrollBounce 2s ease-in-out infinite; }
      `}</style>

      {/* Orbs */}
      <div style={s.meshWrap}>
        <div style={{ ...s.mesh1, width: isMobile ? '500px' : '900px', height: isMobile ? '500px' : '900px' }} />
        <div style={{ ...s.mesh2, width: isMobile ? '400px' : '800px', height: isMobile ? '400px' : '800px' }} />
        {!isMobile && <div style={s.mesh3} />}
        {!isMobile && <div style={s.mesh4} />}
      </div>

      <PublicHeader />

      {wasIdled && <div style={s.idleNotice}>You were signed out due to inactivity. Please sign in again.</div>}

      {/* Login card */}
      {showLogin && (
        <div style={{ ...s.cardWrapper, right: isMobile ? '12px' : '48px', left: isMobile ? '12px' : 'auto' }}>
          <div style={s.card}>
            <button style={s.closeBtn} onClick={() => { setShowLogin(false); setError(''); setShowForgot(false); setForgotSent(false); }}>✕</button>

            {!showForgot ? (
              <>
                <p style={s.cardEyebrow}>Welcome back</p>
                <h2 style={s.cardTitle}>Sign in</h2>
                <form onSubmit={handleLogin} style={s.form}>
                  <div style={s.fieldGroup}>
                    <label style={s.fieldLabel}>Email</label>
                    <input className="login-input" type="email" value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" required style={s.input} />
                  </div>
                  <div style={s.fieldGroup}>
                    <label style={s.fieldLabel}>Password</label>
                    <input className="login-input" type="password" value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••" required style={s.input} />
                  </div>
                  {error && <p style={s.errorText}>{error}</p>}
                  <button type="submit" className="submit-btn" disabled={loading} style={s.submitBtn}>
                    {loading ? 'Signing in…' : 'Sign In →'}
                  </button>
                </form>
                <button style={s.forgotLink} onClick={() => { setShowForgot(true); setForgotEmail(email); setError(''); }}>
                  Forgot password?
                </button>
              </>
            ) : forgotSent ? (
              <>
                <p style={s.cardEyebrow}>Check your inbox</p>
                <h2 style={s.cardTitle}>Email sent</h2>
                <p style={{ fontSize: '13px', fontWeight: FW_LIGHT, color: L_TEXT_MUTED, lineHeight: 1.65, margin: '0 0 20px' }}>
                  If an account exists for that email, you'll receive a reset link shortly.
                </p>
                <button style={s.forgotLink} onClick={() => { setShowForgot(false); setForgotSent(false); }}>
                  ← Back to sign in
                </button>
              </>
            ) : (
              <>
                <p style={s.cardEyebrow}>Forgot password</p>
                <h2 style={s.cardTitle}>Reset</h2>
                <form onSubmit={handleForgot} style={s.form}>
                  <div style={s.fieldGroup}>
                    <label style={s.fieldLabel}>Email</label>
                    <input className="login-input" type="email" value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="you@example.com" required style={s.input} />
                  </div>
                  <button type="submit" className="submit-btn" disabled={forgotLoading} style={s.submitBtn}>
                    {forgotLoading ? 'Sending…' : 'Send Reset Link →'}
                  </button>
                </form>
                <button style={s.forgotLink} onClick={() => setShowForgot(false)}>
                  ← Back to sign in
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hero */}
      <main style={{ ...s.hero, padding: isMobile ? '0 24px 80px' : '0 40px 100px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ animation: 'fadeIn 1s ease 0.2s both' }}>
            <p style={s.eyebrow}>For independent advisors, RIAs &amp; wealth management firms</p>
            <p style={s.tagline}>Relationships,<br />refined.</p>
            <p style={s.heroSub}>
              The practice management platform that keeps you ahead<br />
              of every client relationship — not catching up to it.
            </p>
          </div>
        </div>
        <div className="scroll-cue" style={s.scrollCue}>
          <svg width="36" height="36" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="rgba(26,26,26,0.35)"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </main>

      {/* Scroll content */}
      <section style={s.scrollSection}>

        {/* Definition */}
        <div style={{ ...s.definitionBlock, padding: isMobile ? '60px 24px 48px' : '100px 40px 80px' }}>
          <div style={s.phonetic}>
            <span style={s.word}>Allez</span>
            <span style={s.pronunciation}>&nbsp;&nbsp;/a·ˈlɛ/&nbsp;&nbsp;·&nbsp;&nbsp;ah-LAY</span>
          </div>
          <p style={s.partOfSpeech}>French, verb imperative</p>
          <p style={s.definition}>
            <em>"Go."</em> The word a coach shouts from the sideline.
            The word a crowd roars at the finish line. A single syllable
            that means: <em>don't wait, move forward, the moment is now.</em>
          </p>
          <p style={s.definitionSub}>
            We thought it fit for a platform built around momentum —
            keeping advisors ahead of the relationship, not behind it.
          </p>
        </div>

        <div style={s.divider} />

        {/* Value section */}
        <div style={{ ...s.valueBlock, padding: isMobile ? '48px 24px 64px' : '80px 40px 100px' }}>
          <p style={s.valueEyebrow}>Built in partnership with working advisors</p>
          <h2 style={s.valueTitle}>
            Your clients deserve an advisor<br />
            who's always prepared.
          </h2>
          <p style={s.valueSubtitle}>
            Allez HQ connects your client data, meeting notes, tasks, and
            compliance workflow into a single platform — so the intelligence
            you've built over years of relationships is always at your fingertips,
            not buried in three different tools.
          </p>
          <div style={s.valueGrid}>
            {[
              {
                headline: 'Walk into every meeting prepared.',
                body: 'AI-generated briefs pull from your notes, open tasks, and client history. You know the relationship before you say hello.',
              },
              {
                headline: 'Never let a relationship go cold.',
                body: 'Cadence signals flag clients who are overdue for contact. Your book stays warm — not by memory, but by design.',
              },
              {
                headline: 'From transcript to action items in seconds.',
                body: 'Record or paste a meeting transcript and the platform surfaces decisions made, next steps, and compliance signals automatically.',
              },
              {
                headline: 'One platform, not four.',
                body: 'CRM, notes, task management, and compliance — natively unified. No context-switching. No data falling between tools.',
              },
            ].map(item => (
              <div key={item.headline} className="value-card" style={s.valueCard}>
                <p style={s.valueCardHeadline}>{item.headline}</p>
                <p style={s.valueCardBody}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={s.divider} />

        {/* Trust / compliance section */}
        <div style={{ ...s.trustBlock, padding: isMobile ? '48px 24px 64px' : '80px 40px 100px' }}>
          <p style={s.trustEyebrow}>Data security &amp; privacy</p>
          <h2 style={s.trustTitle}>Your client data stays yours.</h2>
          <p style={s.trustSubtitle}>
            Client relationships are built on trust. We take that seriously at the infrastructure level.
          </p>
          <div style={s.trustGrid}>
            {[
              {
                icon: '🔒',
                heading: 'Never used for model training.',
                body: 'Your data is never shared with AI providers for training purposes. What happens in your practice stays in your practice.',
              },
              {
                icon: '🪪',
                heading: 'Client PII is de-identified before AI processing.',
                body: 'Before any transcript or note reaches an AI model, client names and identifying details are replaced with anonymized tokens. They are re-identified only when results are returned to you.',
              },
              {
                icon: '🏛️',
                heading: 'Enterprise-grade infrastructure.',
                body: 'Allez HQ is built on Supabase, hosted on secure cloud infrastructure. Data is encrypted at rest and in transit. Row-level security ensures each firm\'s data is fully isolated.',
              },
              {
                icon: '📋',
                heading: 'You control your data.',
                body: 'Client records can be soft-deleted at any time. Nothing is silently retained. Your data is yours — not a training asset, not a product.',
              },
            ].map(item => (
              <div key={item.heading} style={s.trustCard}>
                <span style={s.trustIcon}>{item.icon}</span>
                <p style={s.trustHeading}>{item.heading}</p>
                <p style={s.trustBody}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <PublicFooter />
      </section>
    </div>
  );
}

const s = {
  root: { fontFamily: FONT_BODY, position: 'relative', background: L_BG, overflowX: 'hidden' },

  meshWrap: { position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' },
  mesh1: {
    position: 'absolute', width: '900px', height: '900px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.55) 0%, rgba(99,102,241,0.20) 50%, transparent 70%)',
    top: '-350px', left: '-250px', filter: 'blur(40px)', animation: 'mesh1 20s ease-in-out infinite',
  },
  mesh2: {
    position: 'absolute', width: '800px', height: '800px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(236,72,153,0.50) 0%, rgba(236,72,153,0.18) 50%, transparent 70%)',
    top: '-150px', right: '-250px', filter: 'blur(45px)', animation: 'mesh2 24s ease-in-out infinite',
  },
  mesh3: {
    position: 'absolute', width: '700px', height: '700px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(20,184,166,0.48) 0%, rgba(20,184,166,0.16) 50%, transparent 70%)',
    bottom: '-250px', left: '5%', filter: 'blur(40px)', animation: 'mesh3 28s ease-in-out infinite',
  },
  mesh4: {
    position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(251,146,60,0.45) 0%, rgba(251,146,60,0.15) 70%)',
    bottom: '-150px', right: '0%', filter: 'blur(45px)', animation: 'mesh4 22s ease-in-out infinite',
  },

  idleNotice: {
    position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
    backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px', padding: '12px 20px', fontSize: '13px',
    color: 'rgba(255,255,255,0.6)', fontFamily: FONT_BODY, whiteSpace: 'nowrap', zIndex: 100,
  },

  cardWrapper: { position: 'fixed', top: '72px', right: '48px', zIndex: 100, animation: 'fadeDown 0.22s ease both' },
  card: {
    background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '20px', padding: '36px 40px', width: '320px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)', position: 'relative',
  },
  closeBtn: { position: 'absolute', top: '16px', right: '18px', background: 'none', border: 'none', fontSize: '13px', color: L_TEXT_MUTED, cursor: 'pointer' },
  cardEyebrow: { fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase', letterSpacing: '0.12em', color: SITE_ACCENT, margin: '0 0 6px' },
  cardTitle: { fontFamily: FONT_DISPLAY, fontSize: '26px', fontWeight: FW_SEMIBOLD, color: L_TEXT, margin: '0 0 28px' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  fieldLabel: { fontSize: '11px', fontWeight: FW_MEDIUM, color: L_TEXT_MUTED, letterSpacing: '0.05em', textTransform: 'uppercase' },
  input: {
    border: '1px solid rgba(0,0,0,0.12)', borderRadius: '10px', padding: '10px 14px',
    fontSize: '14px', color: L_TEXT, background: 'rgba(255,255,255,0.6)',
    fontFamily: FONT_BODY, transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  errorText: { fontSize: '12px', color: '#e53e3e', margin: 0 },
  forgotLink: {
    background: 'none', border: 'none', padding: '10px 0 0',
    fontSize: '12px', color: L_TEXT_MUTED, cursor: 'pointer',
    fontFamily: FONT_BODY, textDecoration: 'underline',
    textUnderlineOffset: '2px', display: 'block',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
    color: 'white', border: 'none', borderRadius: '10px', padding: '12px',
    fontSize: '14px', fontWeight: FW_SEMIBOLD, cursor: 'pointer',
    fontFamily: FONT_BODY, letterSpacing: '0.03em', transition: 'filter 0.2s', marginTop: '4px',
  },

  hero: {
    height: 'calc(100dvh - 64px)', minHeight: 'calc(100svh - 64px)',
    display: 'flex', flexDirection: 'column',
    justifyContent: 'space-between', alignItems: 'center', textAlign: 'center',
    padding: '0 40px 100px', position: 'relative', zIndex: 1,
  },
  eyebrow: { fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(26,26,26,0.45)', margin: '0 0 20px' },
  tagline: {
    fontFamily: FONT_DISPLAY, fontSize: 'clamp(48px, 6.5vw, 88px)', fontStyle: 'italic',
    fontWeight: FW_LIGHT, color: L_TEXT, margin: '0 0 24px', letterSpacing: '0.01em', lineHeight: 1.1,
  },
  heroSub: { fontSize: '15px', fontWeight: FW_LIGHT, lineHeight: 1.75, color: 'rgba(26,26,26,0.5)', margin: 0 },
  scrollCue: { display: 'flex', justifyContent: 'center', width: '100%', flexShrink: 0, cursor: 'default' },

  scrollSection: {
    position: 'relative', zIndex: 1,
    background: 'rgba(248,248,245,0.35)', backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)', borderTop: '1px solid rgba(0,0,0,0.04)',
  },

  definitionBlock: { maxWidth: '1100px', margin: '0 auto', padding: '100px 40px 80px' },
  phonetic: { display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', marginBottom: '8px' },
  word: { fontFamily: FONT_DISPLAY, fontSize: '52px', fontWeight: FW_LIGHT, color: L_TEXT, letterSpacing: '0.02em' },
  pronunciation: { fontFamily: FONT_BODY, fontSize: '16px', fontWeight: FW_LIGHT, color: 'rgba(26,26,26,0.45)', letterSpacing: '0.04em' },
  partOfSpeech: { fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase', letterSpacing: '0.14em', color: SITE_ACCENT, margin: '0 0 28px' },
  definition: { fontFamily: FONT_DISPLAY, fontSize: '26px', fontWeight: FW_LIGHT, lineHeight: 1.6, color: L_TEXT, margin: '0 0 20px' },
  definitionSub: { fontSize: '15px', fontWeight: FW_LIGHT, lineHeight: 1.75, color: 'rgba(26,26,26,0.55)', margin: 0 },

  divider: { height: '1px', background: 'rgba(0,0,0,0.07)', margin: '0 40px' },

  valueBlock: { maxWidth: '1100px', margin: '0 auto', padding: '80px 40px 100px' },
  valueEyebrow: { fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase', letterSpacing: '0.18em', color: SITE_ACCENT, margin: '0 0 16px' },
  valueTitle: {
    fontFamily: FONT_DISPLAY, fontSize: 'clamp(28px, 3.5vw, 44px)',
    fontWeight: FW_LIGHT, color: L_TEXT, margin: '0 0 20px', lineHeight: 1.2, letterSpacing: '0.01em',
  },
  valueSubtitle: { fontSize: '15px', fontWeight: FW_LIGHT, lineHeight: 1.75, color: 'rgba(26,26,26,0.55)', maxWidth: '600px', margin: '0 0 56px' },
  valueGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' },
  valueCard: {
    background: 'rgba(255,255,255,0.28)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.48)', borderRadius: '16px', padding: '28px',
    transition: 'background 0.2s, transform 0.2s',
  },
  valueCardHeadline: { fontFamily: FONT_DISPLAY, fontSize: '20px', fontWeight: FW_REGULAR, color: L_TEXT, margin: '0 0 12px', letterSpacing: '0.01em', lineHeight: 1.3 },
  valueCardBody: { fontSize: '13px', fontWeight: FW_LIGHT, lineHeight: 1.75, color: 'rgba(26,26,26,0.58)', margin: 0 },

  // Trust section
  trustBlock: { maxWidth: '1100px', margin: '0 auto', padding: '80px 40px 100px' },
  trustEyebrow: { fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase', letterSpacing: '0.18em', color: SITE_ACCENT, margin: '0 0 16px' },
  trustTitle: {
    fontFamily: FONT_DISPLAY, fontSize: 'clamp(28px, 3.5vw, 44px)',
    fontWeight: FW_LIGHT, color: L_TEXT, margin: '0 0 16px', lineHeight: 1.2, letterSpacing: '0.01em',
  },
  trustSubtitle: { fontSize: '15px', fontWeight: FW_LIGHT, lineHeight: 1.75, color: 'rgba(26,26,26,0.55)', maxWidth: '520px', margin: '0 0 48px' },
  trustGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' },
  trustCard: {
    background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.40)', borderRadius: '16px', padding: '28px',
  },
  trustIcon: { fontSize: '22px', display: 'block', marginBottom: '14px' },
  trustHeading: { fontSize: '14px', fontWeight: FW_MEDIUM, color: L_TEXT, margin: '0 0 10px', lineHeight: 1.4 },
  trustBody: { fontSize: '13px', fontWeight: FW_LIGHT, lineHeight: 1.75, color: 'rgba(26,26,26,0.58)', margin: 0 },
};