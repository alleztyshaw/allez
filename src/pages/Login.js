import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Login() {
  const navigate = useNavigate();
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
      navigate('/hq');
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
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sign-in-btn:hover  { background: rgba(0,0,0,0.06) !important; }
        .close-btn:hover    { opacity: 0.4 !important; }
        .submit-btn:hover   { filter: brightness(1.06); }
        .login-input:focus  {
          border-color: #6366f1 !important;
          outline: none;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
      `}</style>

      <div style={s.meshWrap}>
        <div style={s.mesh1} />
        <div style={s.mesh2} />
        <div style={s.mesh3} />
        <div style={s.mesh4} />
      </div>

      <header style={s.header}>
        <span style={s.logo}>Allez</span>
        <button className="sign-in-btn" style={s.signInBtn} onClick={() => setShowLogin(!showLogin)}>
          {showLogin ? 'Close' : 'Sign In'}
        </button>
      </header>

      {showLogin && (
        <div style={s.cardWrapper}>
          <div style={s.card}>
            <button className="close-btn" style={s.closeBtn} onClick={() => { setShowLogin(false); setError(''); }}>
              ✕
            </button>
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

      <main style={s.hero}>
        <p style={s.eyebrow}>Private client platform</p>
        <p style={s.tagline}>Relationships, refined.</p>
      </main>
    </div>
  );
}

const s = {
  root: {
    minHeight: '100vh',
    fontFamily: "'DM Sans', sans-serif",
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    background: '#f8f8f5',
  },
  meshWrap: { position: 'absolute', inset: 0, zIndex: 0 },
  mesh1: {
    position: 'absolute', width: '900px', height: '900px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, rgba(99,102,241,0.06) 50%, transparent 70%)',
    top: '-350px', left: '-250px', filter: 'blur(50px)',
    animation: 'mesh1 20s ease-in-out infinite',
  },
  mesh2: {
    position: 'absolute', width: '800px', height: '800px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(236,72,153,0.20) 0%, rgba(236,72,153,0.05) 50%, transparent 70%)',
    top: '-150px', right: '-250px', filter: 'blur(60px)',
    animation: 'mesh2 24s ease-in-out infinite',
  },
  mesh3: {
    position: 'absolute', width: '700px', height: '700px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(20,184,166,0.18) 0%, rgba(20,184,166,0.05) 50%, transparent 70%)',
    bottom: '-250px', left: '5%', filter: 'blur(55px)',
    animation: 'mesh3 28s ease-in-out infinite',
  },
  mesh4: {
    position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(251,146,60,0.16) 0%, rgba(251,146,60,0.04) 50%, transparent 70%)',
    bottom: '-150px', right: '0%', filter: 'blur(60px)',
    animation: 'mesh4 22s ease-in-out infinite',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '32px 48px', position: 'relative', zIndex: 10,
  },
  logo: {
    fontFamily: "'Cormorant Garamond', serif", fontSize: '28px',
    fontWeight: '600', color: '#1a1a1a', letterSpacing: '0.06em',
  },
  signInBtn: {
    background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.10)',
    borderRadius: '20px', padding: '8px 22px', fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px', fontWeight: '500', color: '#1a1a1a',
    cursor: 'pointer', transition: 'background 0.2s', letterSpacing: '0.02em',
  },
  cardWrapper: {
    position: 'absolute', top: '80px', right: '48px',
    zIndex: 100, animation: 'fadeDown 0.22s ease both',
  },
  card: {
    background: 'white', border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: '20px', padding: '36px 40px', width: '320px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.05)',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute', top: '16px', right: '18px',
    background: 'none', border: 'none', fontSize: '13px',
    color: '#bbb', cursor: 'pointer', transition: 'opacity 0.15s',
  },
  cardEyebrow: {
    fontSize: '11px', fontWeight: '500', textTransform: 'uppercase',
    letterSpacing: '0.12em', color: '#6366f1', margin: '0 0 6px',
  },
  cardTitle: {
    fontFamily: "'Cormorant Garamond', serif", fontSize: '26px',
    fontWeight: '600', color: '#1a1a1a', margin: '0 0 28px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  fieldLabel: {
    fontSize: '11px', fontWeight: '500', color: '#999',
    letterSpacing: '0.05em', textTransform: 'uppercase',
  },
  input: {
    border: '1.5px solid #e8e8e4', borderRadius: '10px', padding: '10px 14px',
    fontSize: '14px', color: '#1a1a1a', background: '#fafaf8',
    fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  errorText: { fontSize: '12px', color: '#e53e3e', margin: 0 },
  submitBtn: {
    background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
    color: 'white', border: 'none', borderRadius: '10px', padding: '12px',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.03em',
    transition: 'filter 0.2s', marginTop: '4px',
  },
  hero: {
    flex: 1, display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center', textAlign: 'center',
    padding: '0 40px 120px', position: 'relative', zIndex: 1,
    animation: 'fadeIn 1s ease 0.2s both',
  },
  eyebrow: {
    fontSize: '12px', fontWeight: '500', textTransform: 'uppercase',
    letterSpacing: '0.2em', color: '#aaa', margin: '0 0 16px',
  },
  tagline: {
    fontFamily: "'roboto', serif",
    fontSize: 'clamp(36px, 5vw, 64px)', fontStyle: 'italic',
    fontWeight: '300', color: '#1a1a1a', margin: 0, letterSpacing: '0.02em',
  },
};