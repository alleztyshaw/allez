import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const GOLD = '#c9a84c';
const DARK = '#0f1117';
const CARD_BG = '#1e2330';
const BORDER = 'rgba(201,168,76,0.18)';
const TEXT_PRIMARY = '#f0ece0';
const TEXT_MUTED = '#7a7d8a';
const INPUT_BG = '#2a3347';

export default function Welcome() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    display_name: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      // Auto-populate display_name from first_name unless user has edited it
      if (name === 'first_name' && !prev.display_name_edited) {
        updated.display_name = value;
      }
      return updated;
    });
  }

  function handleDisplayNameChange(e) {
    setForm(prev => ({ ...prev, display_name: e.target.value, display_name_edited: true }));
  }

  async function handleSubmit() {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError('First and last name are required.');
      return;
    }
    setSaving(true);
    setError('');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate('/'); return; }

    const displayName = form.display_name.trim() || form.first_name.trim();

    // 1. Update auth user metadata (display_name for greeting)
    const { error: metaError } = await supabase.auth.updateUser({
      data: { display_name: displayName, onboarding_complete: true },
    });

    if (metaError) {
      setError('Something went wrong. Please try again.');
      setSaving(false);
      return;
    }

    // 2. Update org_members with first/last/display name
    const { error: memberError } = await supabase
      .from('org_members')
      .update({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        display_name: displayName,
      })
      .eq('user_id', session.user.id);

    if (memberError) {
      setError('Something went wrong saving your profile.');
      setSaving(false);
      return;
    }

    navigate('/hq');
  }

  const s = {
    page: {
      minHeight: '100vh',
      background: DARK,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: '40px 20px',
    },
    card: {
      background: CARD_BG,
      border: `1px solid ${BORDER}`,
      borderRadius: '20px',
      padding: '48px',
      width: '100%',
      maxWidth: '440px',
    },
    logo: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: '22px',
      color: GOLD,
      margin: '0 0 32px',
      letterSpacing: '0.04em',
    },
    title: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: '28px',
      fontWeight: '600',
      color: TEXT_PRIMARY,
      margin: '0 0 8px',
    },
    subtitle: {
      fontSize: '14px',
      color: TEXT_MUTED,
      margin: '0 0 32px',
      lineHeight: '1.5',
    },
    fieldGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
      marginBottom: '16px',
    },
    label: {
      fontSize: '11px',
      fontWeight: '500',
      color: TEXT_MUTED,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
    input: {
      background: INPUT_BG,
      border: `1px solid ${BORDER}`,
      borderRadius: '10px',
      padding: '11px 14px',
      fontSize: '14px',
      color: TEXT_PRIMARY,
      fontFamily: "'DM Sans', sans-serif",
      outline: 'none',
      width: '100%',
      boxSizing: 'border-box',
    },
    hint: {
      fontSize: '11px',
      color: TEXT_MUTED,
      margin: '4px 0 0',
      fontStyle: 'italic',
    },
    divider: {
      height: '1px',
      background: BORDER,
      margin: '24px 0',
    },
    submitBtn: {
      width: '100%',
      background: `linear-gradient(135deg, ${GOLD} 0%, #e8b95a 100%)`,
      border: 'none',
      borderRadius: '10px',
      padding: '13px',
      fontSize: '14px',
      fontWeight: '600',
      color: DARK,
      cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif",
      letterSpacing: '0.03em',
      marginTop: '8px',
    },
    error: {
      fontSize: '13px',
      color: '#f87171',
      margin: '12px 0 0',
    },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <p style={s.logo}>Allez HQ</p>

        <h1 style={s.title}>Welcome aboard.</h1>
        <p style={s.subtitle}>
          Let's get your profile set up before you dive in.
          This only takes a moment.
        </p>

        <div style={s.fieldGroup}>
          <label style={s.label}>First Name</label>
          <input
            style={s.input}
            name="first_name"
            placeholder="Jane"
            value={form.first_name}
            onChange={handleChange}
          />
        </div>

        <div style={s.fieldGroup}>
          <label style={s.label}>Last Name</label>
          <input
            style={s.input}
            name="last_name"
            placeholder="Smith"
            value={form.last_name}
            onChange={handleChange}
          />
        </div>

        <div style={s.divider} />

        <div style={s.fieldGroup}>
          <label style={s.label}>Display Name</label>
          <input
            style={s.input}
            name="display_name"
            placeholder="Jane"
            value={form.display_name}
            onChange={handleDisplayNameChange}
          />
          <p style={s.hint}>This is how we'll greet you — "Good morning, Jane."</p>
        </div>

        {error && <p style={s.error}>{error}</p>}

        <button
          style={s.submitBtn}
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Enter HQ →'}
        </button>
      </div>
    </div>
  );
}