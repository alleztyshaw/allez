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
  const [linkError, setLinkError] = useState(false);
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
    // Check if Supabase put an error in the URL hash (e.g. expired token)
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', '?'));
    if (params.get('error_description')) {
      setLinkError(true);
      setLoading(false);
      return;
    }

    // Listen for the auth state change that fires when Supabase exchanges
    // the invite token from the URL hash into a real session.
    // We wait for this rather than calling getSession() immediately,
    // because getSession() returns null until the hash token is processed.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        // If they've already completed onboarding, send straight to HQ
        if (session.user?.user_metadata?.onboarding_complete) {
          navigate('/hq');
          return;
        }
        setSession(session);
        setLoading(false);
      }
      if (event === 'SIGNED_OUT') {
        setLinkError(true);
        setLoading(false);
      }
    });

    // Fallback: check for an existing session (e.g. user refreshes the page
    // after the hash token has already been exchanged)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        if (session.user?.user_metadata?.onboarding_complete) {
          navigate('/hq');
          return;
        }
        setSession(session);
        setLoading(false);
      } else if (!hash.includes('access_token')) {
        // No session and no token — link is invalid or already used
        setLinkError(true);
        setLoading(false);
      }
      // If hash has access_token, stay loading and let onAuthStateChange fire
    });

    // Safety net — if nothing resolves in 8 seconds, show the error state
    const timeout = setTimeout(() => {
      setLoading(prev => {
        if (prev) { setLinkError(true); return false; }
        return prev;
      });
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      console.error('updateUser error:', updateError);
      if (updateError.message?.toLowerCase().includes('session')) {
        setError('Your session has expired. Please ask your admin to resend the invite.');
      } else if (updateError.message?.toLowerCase().includes('password')) {
        setError('Password does not meet requirements. Please try a different password.');
      } else {
        setError(`Something went wrong: ${updateError.message || 'Please try again.'}`);
      }
      setSaving(false);
      return;
    }

    if (session) {
      const { error: memberError } = await supabase.from('org_members').update({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        display_name: displayName,
      }).eq('user_id', session.user.id);

      if (memberError) {
        // Non-fatal — user can update their profile later
        console.error('org_members update error:', memberError);
      }
    }

    navigate('/hq');
  }

  // ── Render states ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <p style={s.logo}>Allez HQ</p>
          <p style={s.loadingText}>Setting up your account…</p>
        </div>
      </div>
    );
  }

  if (linkError || !session) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <p style={s.logo}>Allez HQ</p>
          <h1 style={s.title}>Invalid or expired link.</h1>
          <p style={s.subtitle}>
            This invite link has expired or has already been used.
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
    minHeight: '100vh', width: '100%', background: D_BG,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: FONT_BODY, padding: '40px 20px', boxSizing: 'border-box',
  },
  card: {
    background: D_SURFACE, border: `1px solid ${D_BORDER}`,
    borderRadius: RADIUS_LG, padding: '48px', width: '100%', maxWidth: '440px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
  },
  logo: { fontFamily: FONT_DISPLAY, fontSize: '20px', fontWeight: '300', color: ACCENT, margin: '0 0 32px', letterSpacing: '0.06em' },
  title: { fontFamily: FONT_DISPLAY, fontSize: '32px', fontWeight: '300', color: D_TEXT, margin: '0 0 8px', letterSpacing: '0.01em', lineHeight: 1.2 },
  subtitle: { fontSize: '14px', fontWeight: '300', color: D_TEXT_MUTED, margin: '0 0 32px', lineHeight: '1.6' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '16px' },
  label: { fontSize: '10px', fontWeight: '600', color: D_TEXT_MUTED, letterSpacing: '0.12em', textTransform: 'uppercase' },
  input: { background: D_SURFACE_ALT, border: `1px solid ${D_BORDER}`, borderRadius: RADIUS_MD, padding: '11px 14px', fontSize: '14px', color: D_TEXT, fontFamily: FONT_BODY, outline: 'none', width: '100%', boxSizing: 'border-box' },
  hint: { fontSize: '11px', color: D_TEXT_MUTED, margin: '4px 0 0', fontStyle: 'italic', fontWeight: '300' },
  divider: { height: '1px', background: D_BORDER, margin: '24px 0' },
  submitBtn: { width: '100%', background: ACCENT_MUTED, border: `1px solid ${ACCENT_BORDER}`, borderRadius: RADIUS_MD, padding: '13px', fontSize: '14px', fontWeight: '600', color: ACCENT, cursor: 'pointer', fontFamily: FONT_BODY, letterSpacing: '0.03em', marginTop: '8px' },
  error: { fontSize: '13px', color: '#f87171', margin: '12px 0 0' },
  loadingText: { color: D_TEXT_MUTED, fontSize: '14px', textAlign: 'center', fontWeight: '300', margin: 0 },
};