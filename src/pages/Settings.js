import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseClient';
import {
  FONT_BODY,
  RADIUS_MD, RADIUS_LG,
  SHADOW_MD,
  pageStyles,
  MOBILE_BREAKPOINT,
  FW_LIGHT, FW_REGULAR, FW_SEMIBOLD} from '../utils/hqConstants';
import { useTokens } from '../context/ThemeContext';
import { useOrg } from '../context/OrgContext';
import useWindowWidth from '../hooks/useWindowWidth';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const t = useTokens();
  const { userRole } = useOrg();
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < MOBILE_BREAKPOINT;
  const [displayName, setDisplayName] = useState('');
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [displayNameEditing, setDisplayNameEditing] = useState(false);
  const [displayNameSaving, setDisplayNameSaving] = useState(false);
  const [displayNameSuccess, setDisplayNameSuccess] = useState(false);

  // Password
  const [passwordEditing, setPasswordEditing] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const name = session.user.user_metadata.display_name || '';
        setDisplayName(name);
        setDisplayNameInput(name);
      }
    });
  }, []);

  async function handleSaveDisplayName() {
    if (!displayNameInput.trim()) return;
    setDisplayNameSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { display_name: displayNameInput.trim() }
    });
    if (!error) {
      // Also update org_members table
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from('org_members')
          .update({ display_name: displayNameInput.trim() })
          .eq('user_id', session.user.id);
      }
      setDisplayName(displayNameInput.trim());
      setDisplayNameEditing(false);
      setDisplayNameSuccess(true);
      setTimeout(() => setDisplayNameSuccess(false), 3000);
    }
    setDisplayNameSaving(false);
  }

  async function handleSavePassword() {
    setPasswordError('');
    if (!newPassword) { setPasswordError('Please enter a new password.'); return; }
    if (newPassword.length < 8) { setPasswordError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match.'); return; }
    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordEditing(false);
            setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
    setPasswordSaving(false);
  }

  const isDark = theme === 'dark';

  const s = {
    ...pageStyles(t, isMobile),
    subtitle: { fontSize: '13px', color: t.TEXT_MUTED, margin: '0 0 48px', fontWeight: FW_LIGHT },
    section: {
      background: t.SURFACE, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_LG, overflow: 'hidden',
      boxShadow: SHADOW_MD, marginBottom: '24px'
    },
    sectionLabel: {
      fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase',
      letterSpacing: '0.12em', color: t.ACCENT,
      padding: '20px 24px 0', margin: '0 0 4px'
    },
    row: {
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 24px', gap: '16px'
    },
    rowDivider: { height: '1px', background: t.BORDER, margin: '0 24px' },
    rowLeft: { display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 },
    rowTitle: { fontSize: '14px', fontWeight: FW_REGULAR, color: t.TEXT, margin: 0 },
    rowDesc: { fontSize: '12px', color: t.TEXT_MUTED, margin: 0, fontWeight: FW_LIGHT },
    editButton: {
      background: 'none', border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD, padding: '6px 14px',
      fontSize: '12px', color: t.TEXT_MUTED,
      cursor: 'pointer', fontFamily: FONT_BODY, flexShrink: 0
    },
    input: {
      background: t.SURFACE_ALT, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD, padding: '9px 14px',
      fontSize: '14px', color: t.TEXT, fontFamily: FONT_BODY,
      outline: 'none', width: '100%', boxSizing: 'border-box'
    },
    saveButton: {
      background: t.ACCENT_MUTED, border: `1px solid ${t.ACCENT_BORDER}`,
      borderRadius: RADIUS_MD, padding: '7px 16px',
      fontSize: '12px', color: t.ACCENT, fontWeight: FW_SEMIBOLD,
      cursor: 'pointer', fontFamily: FONT_BODY, flexShrink: 0
    },
    cancelButton: {
      background: 'none', border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_MD, padding: '7px 16px',
      fontSize: '12px', color: t.TEXT_MUTED,
      cursor: 'pointer', fontFamily: FONT_BODY, flexShrink: 0
    },
    successText: { fontSize: '12px', color: t.ACCENT, margin: 0, fontWeight: FW_REGULAR },
    errorText: { fontSize: '12px', color: '#f87171', margin: '8px 0 0' },
    track: {
      position: 'relative', width: '51px', height: '31px',
      borderRadius: '31px',
      background: isDark ? t.ACCENT : t.BORDER,
      border: `2px solid ${isDark ? t.ACCENT : t.BORDER}`,
      cursor: 'pointer', flexShrink: 0,
      transition: 'background 0.25s ease, border-color 0.25s ease'
    },
    thumb: {
      position: 'absolute', top: '2px',
      left: isDark ? '22px' : '2px',
      width: '23px', height: '23px', borderRadius: '50%',
      background: '#ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
      transition: 'left 0.25s ease'
    }
  };

  return (
    <div style={s.pageWrapper}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>
      <div style={s.page}>

        <h1 style={s.title}>Settings</h1>
        <p style={s.subtitle}>Manage your preferences</p>

        {/* Appearance */}
        <div style={s.section}>
          <p style={s.sectionLabel}>Appearance</p>
          <div style={s.row}>
            <div style={s.rowLeft}>
              <p style={s.rowTitle}>Dark mode</p>
              <p style={s.rowDesc}>{isDark ? 'Currently using dark mode' : 'Currently using light mode'}</p>
            </div>
            <div style={s.track} onClick={toggleTheme} role="switch" aria-checked={isDark}>
              <div style={s.thumb} />
            </div>
          </div>
        </div>

        {/* Account */}
        <div style={s.section}>
          <p style={s.sectionLabel}>Account</p>

          {/* Display name */}
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: displayNameEditing ? '12px' : 0 }}>
              <div style={s.rowLeft}>
                <p style={s.rowTitle}>Display name</p>
                {!displayNameEditing && (
                  <p style={s.rowDesc}>{displayName || 'Not set'}</p>
                )}
              </div>
              {!displayNameEditing && (
                displayNameSuccess
                  ? <p style={s.successText}>✓ Saved</p>
                  : <button style={s.editButton} onClick={() => setDisplayNameEditing(true)}>Edit</button>
              )}
            </div>
            {displayNameEditing && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  style={s.input}
                  value={displayNameInput}
                  onChange={e => setDisplayNameInput(e.target.value)}
                  placeholder="Your display name"
                />
                <button style={s.saveButton} onClick={handleSaveDisplayName} disabled={displayNameSaving}>
                  {displayNameSaving ? 'Saving…' : 'Save'}
                </button>
                <button style={s.cancelButton} onClick={() => { setDisplayNameEditing(false); setDisplayNameInput(displayName); }}>
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div style={s.rowDivider} />

          {/* Role */}
          <div style={s.row}>
            <div style={s.rowLeft}>
              <p style={s.rowTitle}>Role</p>
              <p style={s.rowDesc}>Assigned by your organisation administrator</p>
            </div>
            <p style={{ ...s.rowDesc, margin: 0, flexShrink: 0 }}>{userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : '—'}</p>
          </div>

          <div style={s.rowDivider} />
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: passwordEditing ? '12px' : 0 }}>
              <div style={s.rowLeft}>
                <p style={s.rowTitle}>Password</p>
                {!passwordEditing && (
                  <p style={s.rowDesc}>••••••••</p>
                )}
              </div>
              {!passwordEditing && (
                passwordSuccess
                  ? <p style={s.successText}>✓ Updated</p>
                  : <button style={s.editButton} onClick={() => setPasswordEditing(true)}>Change</button>
              )}
            </div>
            {passwordEditing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input style={s.input} type="password" placeholder="New password" value={newPassword} onChange={e => { setNewPassword(e.target.value); setPasswordError(''); }} />
                <input style={s.input} type="password" placeholder="Confirm new password" value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setPasswordError(''); }} />
                {passwordError && <p style={s.errorText}>{passwordError}</p>}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={s.saveButton} onClick={handleSavePassword} disabled={passwordSaving}>
                    {passwordSaving ? 'Saving…' : 'Update password'}
                  </button>
                  <button style={s.cancelButton} onClick={() => { setPasswordEditing(false); setNewPassword(''); setConfirmPassword(''); setPasswordError(''); }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notifications placeholder */}
        <div style={s.section}>
          <p style={s.sectionLabel}>Notifications</p>
          <div style={s.row}>
            <div style={s.rowLeft}>
              <p style={s.rowTitle}>Email notifications</p>
              <p style={s.rowDesc}>Coming soon — control when and how you're notified</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}