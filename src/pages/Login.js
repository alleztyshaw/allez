import { useState } from 'react';
import {
  ACCENT, ACCENT_MUTED, ACCENT_BORDER,
  SITE_ACCENT, SITE_ACCENT_MUTED, SITE_ACCENT_BORDER,
  L_BG, L_SURFACE, L_TEXT, L_TEXT_MUTED, L_TEXT_SUBTLE, L_BORDER,
  FONT_BODY, FONT_DISPLAY,
  FW_LIGHT, FW_REGULAR, FW_MEDIUM, FW_SEMIBOLD,
  RADIUS_MD, RADIUS_LG,
} from '../utils/hqConstants';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const wasIdled  = new URLSearchParams(location.search).get('reason') === 'idle';
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          25%       { transform: translate(60px, -80px) scale(1.08); }
          50%       { transform: translate(-40px, 60px) scale(0.95); }
          75%       { transform: translate(80px, 40px) scale(1.05); }
        }
        @keyframes mesh2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          25%       { transform: translate(-70px, 50px) scale(1.06); }
          50%       { transform: translate(50px, -70px) scale(0.97); }
          75%       { transform: translate(-30px, -30px) scale(1.04); }
        }
        @keyframes mesh3 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33%       { transform: translate(50px, 60px) scale(1.07); }
          66%       { transform: translate(-60px, -40px) scale(0.96); }
        }
        @keyframes mesh4 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          40%       { transform: translate(-80px, 30px) scale(1.05); }
          80%       { transform: translate(40px, -60px) scale(0.98); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50%       { transform: translateY(6px); opacity: 1; }
        }

        .sign-in-btn:hover    { opacity: 1 !important; }
        .close-btn:hover      { opacity: 0.4 !important; }
        .submit-btn:hover     { filter: brightness(1.06); }
        .login-input:focus    {
          border-color: #6366f1 !important;
          outline: none;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .feature-card:hover {
          background: rgba(255,255,255,0.18) !important;
          transform: translateY(-2px);
        }
        .scroll-cue {
          animation: scrollBounce 2s ease-in-out infinite;
        }
      `}</style>

      {/* Orbs — untouched */}
      <div style={s.meshWrap}>
        <div style={s.mesh1} />
        <div style={s.mesh2} />
        <div style={s.mesh3} />
        <div style={s.mesh4} />
      </div>

      {/* Header */}
      <header style={s.header}>
        <span style={s.logo}>Allez</span>
        <button className="sign-in-btn" style={s.signInBtn} onClick={() => setShowLogin(!showLogin)}>
          {showLogin ? 'Close' : 'Sign In'}
        </button>
      </header>

      {/* Idle timeout notice */}
      {wasIdled && (
        <div style={{
          position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '8px',
          padding: '12px 20px',
          fontSize: '13px',
          color: 'rgba(255,255,255,0.6)',
          fontFamily: "'DM Sans', sans-serif",
          whiteSpace: 'nowrap',
          zIndex: 100,
        }}>
          You were signed out due to inactivity. Please sign in again.
        </div>
      )}

      {/* Login card */}
      {showLogin && (
        <div style={s.cardWrapper}>
          <div style={s.card}>
            <button className="close-btn" style={s.closeBtn} onClick={() => { setShowLogin(false); setError(''); }}>✕</button>
            <p style={s.cardEyebrow}>Welcome back</p>
            <h2 style={s.cardTitle}>Sign in</h2>
            <form onSubmit={handleLogin} style={s.form}>
              <div style={s.fieldGroup}>
                <label style={s.fieldLabel}>Email</label>
                <input className="login-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required style={s.input} />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.fieldLabel}>Password</label>
                <input className="login-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={s.input} />
              </div>
              {error && <p style={s.errorText}>{error}</p>}
              <button type="submit" className="submit-btn" disabled={loading} style={s.submitBtn}>
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Hero — viewport-height, centred */}
      <main style={s.hero}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ animation: 'fadeIn 1s ease 0.2s both' }}>
          <p style={s.eyebrow}>Private client platform</p>
          <p style={s.tagline}>Relationships,<br />refined.</p>
        </div>
        </div>

        {/* Scroll cue */}
        <div className="scroll-cue" style={s.scrollCue}>
          <svg width="36" height="36" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="rgba(26,26,26,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </main>

      {/* ── Scroll content ── */}
      <section style={s.scrollSection}>

        {/* Pronunciation + definition */}
        <div style={s.definitionBlock}>
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

        {/* Divider */}
        <div style={s.divider} />

        {/* What's inside */}
        <div style={s.featuresBlock}>
          <p style={s.featuresEyebrow}>What's inside</p>
          <h2 style={s.featuresTitle}>
            Everything a modern advisor<br />practice actually needs.
          </h2>
          <p style={s.featuresSubtitle}>
            Not a spreadsheet. Not a legacy CRM built for sales teams.
            Something built specifically for wealth management — where the
            relationship <em>is</em> the product.
          </p>

          <div style={s.featureGrid}>
            {[
              {
                label: 'Daily Brief',
                desc: 'Your morning overview — upcoming client reviews, open tasks, and everything you need to start the day informed.',
                status: 'Live',
              },
              {
                label: 'Client Profiles',
                desc: 'Every detail about every client — risk tolerance, asset levels, communication preferences, family notes — in one place.',
                status: 'Live',
              },
              {
                label: 'AI Notes',
                desc: 'Capture meeting notes, transcribe calls, and let the platform surface what matters — action items, securities mentions, compliance flags.',
                status: 'Live',
              },
              {
                label: 'CRM',
                desc: 'Track touchpoints, log interactions, and see the full arc of a client relationship at a glance.',
                status: 'Live',
              },
            ].map((f) => (
              <div key={f.label} className="feature-card" style={s.featureCard}>
                <div style={s.featureCardTop}>
                  <span style={{
                    ...s.featureBadge,
                    background: f.status === 'Live' ? ACCENT_MUTED : 'rgba(0,0,0,0.06)',
                    color: f.status === 'Live' ? ACCENT : L_TEXT_SUBTLE,
                  }}>
                    {f.status}
                  </span>
                </div>
                <p style={s.featureLabel}>{f.label}</p>
                <p style={s.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div style={s.footer}>
          <span style={s.footerLogo}>Allez</span>
          <p style={s.footerNote}>
            Built for advisors who believe the relationship is the product.
          </p>
        </div>

      </section>
    </div>
  );
}

const s = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    position: 'relative',
    background: L_BG,
    overflowX: 'hidden',
  },

  // ── Orbs ──────────────────────────────────────
  meshWrap: { position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' },
  mesh1: {
    position: 'absolute', width: '900px', height: '900px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.55) 0%, rgba(99,102,241,0.20) 50%, transparent 70%)',
    top: '-350px', left: '-250px', filter: 'blur(40px)',
    animation: 'mesh1 20s ease-in-out infinite',
  },
  mesh2: {
    position: 'absolute', width: '800px', height: '800px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(236,72,153,0.50) 0%, rgba(236,72,153,0.18) 50%, transparent 70%)',
    top: '-150px', right: '-250px', filter: 'blur(45px)',
    animation: 'mesh2 24s ease-in-out infinite',
  },
  mesh3: {
    position: 'absolute', width: '700px', height: '700px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(20,184,166,0.48) 0%, rgba(20,184,166,0.16) 50%, transparent 70%)',
    bottom: '-250px', left: '5%', filter: 'blur(40px)',
    animation: 'mesh3 28s ease-in-out infinite',
  },
  mesh4: {
    position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(251,146,60,0.45) 0%, rgba(251,146,60,0.15) 50%, transparent 70%)',
    bottom: '-150px', right: '0%', filter: 'blur(45px)',
    animation: 'mesh4 22s ease-in-out infinite',
  },

  // ── Header ────────────────────────────────────
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 48px', position: 'relative', zIndex: 10,
  },
  logo: {
    fontFamily: "'Cormorant Garamond', serif", fontSize: '28px',
    fontWeight: FW_LIGHT, color: L_TEXT, letterSpacing: '0.06em',
  },
  signInBtn: {
    background: 'none', border: 'none', padding: 0,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px', fontWeight: FW_REGULAR, color: L_TEXT,
    cursor: 'pointer', letterSpacing: '0.04em', opacity: 0.6,
    transition: 'opacity 0.2s',
  },

  // ── Login card ────────────────────────────────
  cardWrapper: {
    position: 'fixed', top: '80px', right: '48px',
    zIndex: 100, animation: 'fadeDown 0.22s ease both',
  },
  card: {
    background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '20px', padding: '36px 40px', width: '320px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)', position: 'relative',
  },
  closeBtn: {
    position: 'absolute', top: '16px', right: '18px', background: 'none',
    border: 'none', fontSize: '13px', color: L_TEXT_MUTED, cursor: 'pointer', transition: 'opacity 0.15s',
  },
  cardEyebrow: {
    fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase',
    letterSpacing: '0.12em', color: SITE_ACCENT, margin: '0 0 6px',
  },
  cardTitle: {
    fontFamily: "'Cormorant Garamond', serif", fontSize: '26px',
    fontWeight: FW_SEMIBOLD, color: L_TEXT, margin: '0 0 28px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  fieldLabel: {
    fontSize: '11px', fontWeight: FW_MEDIUM, color: L_TEXT_MUTED,
    letterSpacing: '0.05em', textTransform: 'uppercase',
  },
  input: {
    border: '1px solid rgba(0,0,0,0.12)', borderRadius: '10px', padding: '10px 14px',
    fontSize: '14px', color: L_TEXT, background: `rgba(255,255,255,0.6)`,
    fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  errorText: { fontSize: '12px', color: '#e53e3e', margin: 0 },
  submitBtn: {
    background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
    color: 'white', border: 'none', borderRadius: '10px', padding: '12px',
    fontSize: '14px', fontWeight: FW_SEMIBOLD, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.03em',
    transition: 'filter 0.2s', marginTop: '4px',
  },

  // ── Hero ──────────────────────────────────────
  hero: {
    height: 'calc(100dvh - 64px)', minHeight: 'calc(100svh - 64px)',
    display: 'flex', flexDirection: 'column',
    justifyContent: 'space-between', alignItems: 'center', textAlign: 'center',
    padding: '0 40px 80px', position: 'relative', zIndex: 1,
  },
  eyebrow: {
    fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase',
    letterSpacing: '0.22em', color: 'rgba(26,26,26,0.45)', margin: '0 0 20px',
  },
  tagline: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 'clamp(48px, 6.5vw, 88px)', fontStyle: 'italic',
    fontWeight: FW_LIGHT, color: L_TEXT, margin: 0,
    letterSpacing: '0.01em', lineHeight: 1.1,
  },
  scrollCue: {
    display: 'flex', justifyContent: 'center',
    width: '100%', flexShrink: 0,
    cursor: 'default',
  },

  // ── Scroll section ────────────────────────────
  scrollSection: {
    position: 'relative', zIndex: 1,
    background: 'rgba(248,248,245,0.35)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid rgba(0,0,0,0.04)',
  },

  // Definition block
  definitionBlock: {
    maxWidth: '1100px', margin: '0 auto',
    padding: '100px 40px 80px',
  },
  phonetic: {
    display: 'flex', alignItems: 'baseline', flexWrap: 'wrap',
    marginBottom: '8px',
  },
  word: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '52px', fontWeight: FW_LIGHT,
    color: L_TEXT, letterSpacing: '0.02em',
  },
  pronunciation: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '16px', fontWeight: FW_LIGHT,
    color: 'rgba(26,26,26,0.45)', letterSpacing: '0.04em',
  },
  partOfSpeech: {
    fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase',
    letterSpacing: '0.14em', color: SITE_ACCENT,
    margin: '0 0 28px',
  },
  definition: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '26px', fontWeight: FW_LIGHT, lineHeight: 1.6,
    color: L_TEXT, margin: '0 0 20px',
  },
  definitionSub: {
    fontSize: '15px', fontWeight: FW_LIGHT, lineHeight: 1.75,
    color: 'rgba(26,26,26,0.55)', margin: 0,
  },

  divider: {
    height: '1px',
    background: 'rgba(0,0,0,0.07)',
    margin: '0 40px',
  },

  // Features block
  featuresBlock: {
    maxWidth: '1100px', margin: '0 auto',
    padding: '80px 40px 100px',
  },
  featuresEyebrow: {
    fontSize: '11px', fontWeight: FW_MEDIUM, textTransform: 'uppercase',
    letterSpacing: '0.18em', color: SITE_ACCENT,
    margin: '0 0 16px',
  },
  featuresTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: FW_LIGHT,
    color: L_TEXT, margin: '0 0 20px', lineHeight: 1.2,
    letterSpacing: '0.01em',
  },
  featuresSubtitle: {
    fontSize: '15px', fontWeight: FW_LIGHT, lineHeight: 1.75,
    color: 'rgba(26,26,26,0.55)',
    maxWidth: '560px', margin: '0 0 56px',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '16px',
  },
  featureCard: {
    background: 'rgba(255,255,255,0.3)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.5)',
    borderRadius: '16px', padding: '28px',
    transition: 'background 0.2s, transform 0.2s',
  },
  featureCardTop: { marginBottom: '16px' },
  featureBadge: {
    fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase',
    letterSpacing: '0.1em', padding: '3px 10px',
    borderRadius: '999px',
  },
  featureLabel: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '22px', fontWeight: FW_REGULAR,
    color: L_TEXT, margin: '0 0 10px',
    letterSpacing: '0.01em',
  },
  featureDesc: {
    fontSize: '13px', fontWeight: FW_LIGHT, lineHeight: 1.7,
    color: 'rgba(26,26,26,0.6)', margin: 0,
  },

  // Footer
  footer: {
    borderTop: '1px solid rgba(0,0,0,0.07)',
    padding: '40px 48px',
    display: 'flex', alignItems: 'center', gap: '20px',
  },
  footerLogo: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '20px', fontWeight: FW_SEMIBOLD,
    color: 'rgba(26,26,26,0.35)', letterSpacing: '0.06em',
  },
  footerNote: {
    fontSize: '13px', fontWeight: FW_LIGHT,
    color: 'rgba(26,26,26,0.35)', margin: 0,
  },
};