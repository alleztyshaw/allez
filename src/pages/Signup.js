import { useNavigate } from 'react-router-dom';
import {
  FONT_DISPLAY, FONT_BODY,
  FW_LIGHT, FW_REGULAR,
  ACCENT, ACCENT_MUTED, ACCENT_BORDER,
} from '../utils/hqConstants';

export default function Signup() {
  const navigate = useNavigate();

  const s = {
    root: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0f1117',
      fontFamily: FONT_BODY,
      padding: '40px 24px',
    },
    card: {
      maxWidth: '420px',
      width: '100%',
      textAlign: 'center',
    },
    wordmark: {
      fontFamily: FONT_DISPLAY,
      fontSize: '28px',
      fontWeight: FW_LIGHT,
      color: '#ffffff',
      letterSpacing: '0.04em',
      marginBottom: '40px',
    },
    iconWrap: {
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      backgroundColor: ACCENT_MUTED,
      border: `1px solid ${ACCENT_BORDER}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 24px',
    },
    icon: {
      width: '24px',
      height: '24px',
    },
    heading: {
      fontFamily: FONT_DISPLAY,
      fontSize: '24px',
      fontWeight: FW_LIGHT,
      color: '#ffffff',
      marginBottom: '12px',
      letterSpacing: '0.02em',
    },
    body: {
      fontSize: '14px',
      fontWeight: FW_REGULAR,
      color: 'rgba(255,255,255,0.5)',
      lineHeight: '1.6',
      marginBottom: '32px',
    },
    divider: {
      height: '1px',
      backgroundColor: 'rgba(255,255,255,0.08)',
      marginBottom: '28px',
    },
    backLabel: {
      fontSize: '13px',
      fontWeight: FW_REGULAR,
      color: 'rgba(255,255,255,0.4)',
      marginBottom: '10px',
    },
    backBtn: {
      display: 'inline-block',
      fontSize: '14px',
      fontWeight: FW_REGULAR,
      color: ACCENT,
      cursor: 'pointer',
      background: 'none',
      border: 'none',
      padding: 0,
      fontFamily: FONT_BODY,
    },
  };

  return (
    <div style={s.root}>
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=DM+Sans:wght@300;400;500&display=swap');`}</style>

      <div style={s.card}>

        {/* Wordmark */}
        <div style={s.wordmark}>Allez HQ</div>

        {/* Lock icon */}
        <div style={s.iconWrap}>
          <svg style={s.icon} viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        {/* Heading + body */}
        <div style={s.heading}>Invitation only</div>
        <div style={s.body}>
          Allez HQ is currently available by invitation only.<br />
          If you've received an invite, check your email for a setup link.<br />
          Otherwise, reach out to your firm's administrator.
        </div>

        <div style={s.divider} />

        {/* Back to login */}
        <div style={s.backLabel}>Already have an account?</div>
        <button style={s.backBtn} onClick={() => navigate('/')}>
          Sign in →
        </button>

      </div>
    </div>
  );
}