import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  ACCENT, ACCENT_MUTED, ACCENT_BORDER,
  D_BG, D_SURFACE, D_SURFACE_ALT, D_BORDER,
  D_TEXT, D_TEXT_MUTED,
  FONT_DISPLAY, FONT_BODY,
  RADIUS_MD, RADIUS_LG,
} from '../utils/hqConstants';

export default function Welcome() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    display_name: '',
    password: '',
    confirm_password: '',
  });
  const [displayNameEdited, setDisplayNameEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) { setSession(session); setLoading(false); }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSession(session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'first_name' && !displayNameEdited) updated.display_name = value;
      return updated;
    });
  }

  function handleDisplayNameChange(e) {
    setDisplayNameEdited(true);
    setForm(prev => ({ ...prev, display_name: e.target.value }));
  }

  async function handleSubmit() {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError('First and last name are required.'); return;
    }
    if (!form.password || form.password.length < 8) {
      setError('Password must be at least 8 characters.'); return;
    }
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.'); return;
    }
    setSaving(true);
    setError('');
    const displayName = form.display_name.trim() || form.first_name.trim();
    const { error: updateError } = await supabase.auth.updateUser({
      password: form.password,
      data: { display_name: displayName, onboarding_complete: true },
    });
    if (updateError) {
      setError('Something went wrong. Please try again.');
      setSaving(false);
      return;
    }
    if (session) {
      await supabase.from('org_members').update({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        display_name: displayName,
      }).eq('user_id', session.user.id);
    }
    navigate('/hq');
  }

  if (loading) {
    return (
      <div style={s.page}>
        <p style={s.loadingText}>Setting up your account…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <p style={s.logo}>Allez HQ</p>
          <h1 style={s.title}>Invalid or expired link.</h1>
          <p style={s.subtitle}>
            This invite link has expired or already been used.
            Please ask your admin to send a new invite.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
      `}</style>
      <div style={s.card}>
        <p style={s.logo}>Allez HQ</p>

        <h1 style={s.title}>Welcome aboard.</h1>
        <p style={s.subtitle}>Set up your profile and create a password to get started.</p>

        <div style={s.fieldGroup}>
          <label style={s.label}>First Name</label>
          <input style={s.input} name="first_name" placeholder="Jane" value={form.first_name} onChange={handleChange} />
        </div>

        <div style={s.fieldGroup}>
          <label style={s.label}>Last Name</label>
          <input style={s.input} name="last_name" placeholder="Smith" value={form.last_name} onChange={handleChange} />
        </div>

        <div style={s.fieldGroup}>
          <label style={s.label}>Display Name</label>
          <input style={s.input} name="display_name" placeholder="Jane" value={form.display_name} onChange={handleDisplayNameChange} />
          <p style={s.hint}>How we'll greet you — "Good morning, Jane."</p>
        </div>

        <div style={s.divider} />

        <div style={s.fieldGroup}>
          <label style={s.label}>Password</label>
          <input style={s.input} name="password" type="password" placeholder="At least 8 characters" value={form.password} onChange={handleChange} />
        </div>

        <div style={s.fieldGroup}>
          <label style={s.label}>Confirm Password</label>
          <input style={s.input} name="confirm_password" type="password" placeholder="Repeat your password" value={form.confirm_password} onChange={handleChange} />
        </div>

        {error && <p style={s.error}>{error}</p>}

        <button style={s.submitBtn} onClick={handleSubmit} disabled={saving}>
          {saving ? 'Setting up…' : 'Enter HQ →'}
        </button>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    width: '100%',
    background: D_BG,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: FONT_BODY,
    padding: '40px 20px',
    boxSizing: 'border-box',
  },
  card: {
    background: D_SURFACE,
    border: `1px solid ${D_BORDER}`,
    borderRadius: RADIUS_LG,
    padding: '48px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
  },
  logo: {
    fontFamily: FONT_DISPLAY,
    fontSize: '20px',
    fontWeight: '300',
    color: ACCENT,
    margin: '0 0 32px',
    letterSpacing: '0.06em',
  },
  title: {
    fontFamily: FONT_DISPLAY,
    fontSize: '32px',
    fontWeight: '300',
    color: D_TEXT,
    margin: '0 0 8px',
    letterSpacing: '0.01em',
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: '14px',
    fontWeight: '300',
    color: D_TEXT_MUTED,
    margin: '0 0 32px',
    lineHeight: '1.6',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    marginBottom: '16px',
  },
  label: {
    fontSize: '10px',
    fontWeight: '600',
    color: D_TEXT_MUTED,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  input: {
    background: D_SURFACE_ALT,
    border: `1px solid ${D_BORDER}`,
    borderRadius: RADIUS_MD,
    padding: '11px 14px',
    fontSize: '14px',
    color: D_TEXT,
    fontFamily: FONT_BODY,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  hint: {
    fontSize: '11px',
    color: D_TEXT_MUTED,
    margin: '4px 0 0',
    fontStyle: 'italic',
    fontWeight: '300',
  },
  divider: {
    height: '1px',
    background: D_BORDER,
    margin: '24px 0',
  },
  submitBtn: {
    width: '100%',
    background: ACCENT_MUTED,
    border: `1px solid ${ACCENT_BORDER}`,
    borderRadius: RADIUS_MD,
    padding: '13px',
    fontSize: '14px',
    fontWeight: '600',
    color: ACCENT,
    cursor: 'pointer',
    fontFamily: FONT_BODY,
    letterSpacing: '0.03em',
    marginTop: '8px',
  },
  error: {
    fontSize: '13px',
    color: '#f87171',
    margin: '12px 0 0',
  },
  loadingText: {
    color: D_TEXT_MUTED,
    fontSize: '14px',
    textAlign: 'center',
    fontWeight: '300',
  },
};