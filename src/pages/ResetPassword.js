// src/pages/ResetPassword.js
// Handles the password reset flow after a user clicks the link in the email.
// Supabase injects the session via URL hash on landing — we then call
// updateUser to set the new password.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  SITE_ACCENT,
  L_BG, L_TEXT, L_TEXT_MUTED,
  FONT_DISPLAY, FONT_BODY,
  FW_LIGHT, FW_MEDIUM, FW_SEMIBOLD,
} from '../utils/hqConstants';
import PublicHeader from '../components/public/PublicHeader';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [validLink, setValidLink] = useState(false);
  const [checking,  setChecking]  = useState(true);

  // Supabase fires onAuthStateChange with event SIGNED_IN when the
  // recovery link is followed — that's our signal the link is valid.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
        setValidLink(true);
      }
      setChecking(false);
    });
    // Timeout fallback — if no auth event fires within 3s, link is invalid/expired
    const timeout = setTimeout(() => setChecking(false), 3000);
    return () => { subscription.unsubscribe(); clearTimeout(timeout); };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/hq/brief'), 2500);
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
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .reset-input:focus {
          border-color:#6366f1 !important; outline:none;
          box-shadow:0 0 0 3px rgba(99,102,241,0.12);
        }
        .submit-btn:hover { filter:brightness(1.06); }
      `}</style>

      {/* Orbs */}
      <div style={s.meshWrap}>
        <div style={s.mesh1} />
        <div style={s.mesh2} />
      </div>

      <PublicHeader />

      <main style={s.main}>
        <div style={{ animation: 'fadeIn 0.4s ease both' }}>

          {checking ? (
            <div style={s.card}>
              <p style={s.muted}>Verifying your link…</p>
            </div>

          ) : success ? (
            <div style={s.card}>
              <p style={s.eyebrow}>All done</p>
              <div style={s.accentRule} />
              <h1 style={s.title}>Password updated.</h1>
              <p style={s.body}>You're being signed in — redirecting now.</p>
            </div>

          ) : !validLink ? (
            <div style={s.card}>
              <p style={s.eyebrow}>Link expired</p>
              <div style={s.accentRule} />
              <h1 style={s.title}>This link is no longer valid.</h1>
              <p style={s.body}>Password reset links expire after 1 hour. Return to the login page and request a new one.</p>
              <button style={s.submitBtn} className="submit-btn" onClick={() => navigate('/?signin=true')}>
                Back to Sign In
              </button>
            </div>

          ) : (
            <div style={s.card}>
              <p style={s.eyebrow}>Password reset</p>
              <div style={s.accentRule} />
              <h1 style={s.title}>Choose a new<br />password</h1>
              <form onSubmit={handleSubmit} style={s.form}>
                <div style={s.fieldGroup}>
                  <label style={s.fieldLabel}>New Password</label>
                  <input
                    className="reset-input"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    style={s.input}
                  />
                </div>
                <div style={s.fieldGroup}>
                  <label style={s.fieldLabel}>Confirm Password</label>
                  <input
                    className="reset-input"
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat your new password"
                    required
                    style={s.input}
                  />
                </div>
                {error && <p style={s.errorText}>{error}</p>}
                <button type="submit" className="submit-btn" disabled={loading} style={s.submitBtn}>
                  {loading ? 'Saving…' : 'Set New Password →'}
                </button>
              </form>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

const s = {
  root: { fontFamily: FONT_BODY, position: 'relative', background: L_BG, minHeight: '100vh', overflowX: 'hidden' },

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

  main: {
    position: 'relative', zIndex: 1,
    minHeight: 'calc(100vh - 68px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px 20px',
  },
  card: {
    background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '20px', padding: '44px 48px', width: '100%', maxWidth: '400px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
  },
  eyebrow: {
    fontSize: '10px', fontWeight: FW_MEDIUM, textTransform: 'uppercase',
    letterSpacing: '0.18em', color: SITE_ACCENT, margin: '0 0 14px',
  },
  accentRule: { width: '36px', height: '2px', background: SITE_ACCENT, borderRadius: '1px', marginBottom: '24px' },
  title: {
    fontFamily: FONT_DISPLAY, fontSize: '36px', fontWeight: FW_LIGHT,
    color: L_TEXT, margin: '0 0 16px', lineHeight: 1.15, letterSpacing: '0.01em',
  },
  body: {
    fontSize: '14px', fontWeight: FW_LIGHT, lineHeight: 1.75,
    color: L_TEXT_MUTED, margin: '0 0 24px',
  },
  muted: { fontSize: '14px', color: L_TEXT_MUTED, fontWeight: FW_LIGHT, margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  fieldLabel: {
    fontSize: '11px', fontWeight: FW_MEDIUM, color: L_TEXT_MUTED,
    letterSpacing: '0.05em', textTransform: 'uppercase',
  },
  input: {
    border: '1px solid rgba(0,0,0,0.12)', borderRadius: '10px', padding: '10px 14px',
    fontSize: '14px', color: L_TEXT, background: 'rgba(255,255,255,0.6)',
    fontFamily: FONT_BODY, transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  errorText: { fontSize: '12px', color: '#e53e3e', margin: 0 },
  submitBtn: {
    background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
    color: 'white', border: 'none', borderRadius: '10px', padding: '12px',
    fontSize: '14px', fontWeight: FW_SEMIBOLD, cursor: 'pointer',
    fontFamily: FONT_BODY, letterSpacing: '0.03em',
    transition: 'filter 0.2s', marginTop: '4px',
  },
};