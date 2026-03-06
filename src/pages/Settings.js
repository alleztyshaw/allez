import { useTheme } from '../context/ThemeContext';
import {
  ACCENT, ACCENT_MUTED, ACCENT_BORDER,
  FONT_DISPLAY, FONT_BODY,
  RADIUS_MD, RADIUS_LG, RADIUS_PILL,
  SHADOW_MD,
} from '../utils/hqConstants';
import { useTokens } from '../context/ThemeContext';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const t = useTokens();

  const s = {
    pageWrapper: { background: t.BG, minHeight: '100vh', width: '100%' },
    page: {
      maxWidth: '1200px', margin: '0 auto',
      padding: '120px 40px 80px',
      fontFamily: FONT_BODY, color: t.TEXT,
    },
    title: {
      fontFamily: FONT_DISPLAY, fontSize: '44px', fontWeight: '300',
      color: t.TEXT, margin: '0 0 6px', letterSpacing: '0.01em', lineHeight: 1.1,
    },
    subtitle: { fontSize: '13px', color: t.TEXT_MUTED, margin: '0 0 48px', fontWeight: '300' },
    section: {
      background: t.SURFACE, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_LG, overflow: 'hidden',
      boxShadow: SHADOW_MD, marginBottom: '24px',
    },
    sectionLabel: {
      fontSize: '10px', fontWeight: '600', textTransform: 'uppercase',
      letterSpacing: '0.12em', color: ACCENT,
      padding: '20px 24px 0', margin: '0 0 4px',
    },
    row: {
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 24px',
    },
    rowDivider: { height: '1px', background: t.BORDER, margin: '0 24px' },
    rowLeft: { display: 'flex', flexDirection: 'column', gap: '3px' },
    rowTitle: { fontSize: '14px', fontWeight: '400', color: t.TEXT, margin: 0 },
    rowDesc: { fontSize: '12px', color: t.TEXT_MUTED, margin: 0, fontWeight: '300' },
  };

  const isDark = theme === 'dark';

  // iPhone-style toggle styles
  const track = {
    position: 'relative',
    width: '51px', height: '31px',
    borderRadius: '31px',
    background: isDark ? ACCENT : t.BORDER,
    border: `2px solid ${isDark ? ACCENT : t.BORDER}`,
    cursor: 'pointer',
    transition: 'background 0.25s ease, border-color 0.25s ease',
    flexShrink: 0,
  };

  const thumb = {
    position: 'absolute',
    top: '2px',
    left: isDark ? '22px' : '2px',
    width: '23px', height: '23px',
    borderRadius: '50%',
    background: '#ffffff',
    boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
    transition: 'left 0.25s ease',
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
              <p style={s.rowDesc}>
                {isDark ? 'Currently using dark mode' : 'Currently using light mode'}
              </p>
            </div>
            {/* iPhone-style toggle */}
            <div style={track} onClick={toggleTheme} role="switch" aria-checked={isDark}>
              <div style={thumb} />
            </div>
          </div>
        </div>

        {/* Placeholders for future settings */}
        <div style={s.section}>
          <p style={s.sectionLabel}>Account</p>
          <div style={s.row}>
            <div style={s.rowLeft}>
              <p style={s.rowTitle}>Display name</p>
              <p style={s.rowDesc}>Coming soon — edit how your name appears across HQ</p>
            </div>
          </div>
          <div style={s.rowDivider} />
          <div style={s.row}>
            <div style={s.rowLeft}>
              <p style={s.rowTitle}>Password</p>
              <p style={s.rowDesc}>Coming soon — update your login credentials</p>
            </div>
          </div>
        </div>

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