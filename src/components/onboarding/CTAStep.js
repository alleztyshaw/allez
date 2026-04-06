import {
  FONT_BODY, FW_REGULAR, FW_MEDIUM,
  ACCENT_LIGHT, L_TEXT_MUTED,
  L_SURFACE, COLOR_ERROR, INDIGO,
} from '../../utils/hqConstants';
import useWindowWidth from '../../hooks/useWindowWidth';

// Small inline mic icon — line drawing style matching illustration language
function MicIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none"
      stroke={L_SURFACE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="1" width="6" height="10" rx="3" />
      <path d="M4 9Q4 14 10 14Q16 14 16 9" />
      <line x1="10" y1="14" x2="10" y2="18" />
      <line x1="7" y1="18" x2="13" y2="18" />
    </svg>
  );
}

export default function CTAStep({ saving, saveError, onNote, onApp, onBack }) {
  const width    = useWindowWidth();
  const isMobile = width < 900;

  return (
    <div style={styles.wrap}>

      <div style={styles.inner}>

        <h2 style={styles.headline}>You're ready.</h2>
        <p style={styles.subtext}>Where would you like to start?</p>

        {/* Primary CTA */}
        <button
          style={{
            ...styles.primaryBtn,
            opacity: saving ? 0.6 : 1,
            cursor:  saving ? 'not-allowed' : 'pointer',
          }}
          onClick={onNote}
          disabled={saving}
        >
          <MicIcon />
          Record your first note
        </button>

        {/* Divider */}
        <div style={styles.dividerWrap}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <div style={styles.dividerLine} />
        </div>

        {/* Secondary CTA — plain text link */}
        <button
          style={{
            ...styles.secondaryLink,
            opacity: saving ? 0.6 : 1,
            cursor:  saving ? 'not-allowed' : 'pointer',
          }}
          onClick={onApp}
          disabled={saving}
        >
          Take me to the app
        </button>

        {saveError && (
          <p style={styles.error}>
            Something went wrong saving your progress. Please try again.
          </p>
        )}

      </div>

      {/* Back nav */}
      <div style={{
        ...styles.nav,
        bottom: isMobile ? '32px' : '48px',
      }}>
        <button style={styles.navBtn} onClick={onBack} disabled={saving}>
          <span style={styles.arrowLeft} />
          Go back
        </button>
      </div>

    </div>
  );
}

const styles = {
  wrap: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    width:          '100%',
    height:         '100vh',
    padding:        '0 24px',
    boxSizing:      'border-box',
    position:       'relative',
  },
  inner: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    textAlign:      'center',
    maxWidth:       '420px',
    width:          '100%',
  },
  headline: {
    fontFamily:    FONT_BODY,
    fontSize:      'clamp(28px, 4vw, 48px)',
    fontWeight:    '700',
    fontStyle:     'italic',
    color:         INDIGO,
    margin:        '0 0 20px',
    letterSpacing: '-0.01em',
    lineHeight:    1.1,
  },
  subtext: {
    fontFamily:  FONT_BODY,
    fontSize:    '16px',
    fontWeight:  FW_REGULAR,
    color:       L_TEXT_MUTED,
    margin:      '0 0 48px',
    lineHeight:  1.5,
  },
  primaryBtn: {
    display:        'inline-flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            '10px',
    width:          '100%',
    padding:        '16px 28px',
    background:     ACCENT_LIGHT,
    border:         'none',
    borderRadius:   '10px',
    fontFamily:     FONT_BODY,
    fontSize:       '16px',
    fontWeight:     FW_MEDIUM,
    color:          L_SURFACE,
    letterSpacing:  '0.01em',
    transition:     'background 200ms ease',
  },
  dividerWrap: {
    display:    'flex',
    alignItems: 'center',
    gap:        '12px',
    width:      '100%',
    margin:     '20px 0',
  },
  dividerLine: {
    flex:       1,
    height:     '1px',
    background: L_TEXT_MUTED,
  },
  dividerText: {
    fontFamily:    FONT_BODY,
    fontSize:      '12px',
    fontWeight:    FW_REGULAR,
    color:         L_TEXT_MUTED,
    letterSpacing: '0.05em',
  },
  secondaryLink: {
    background:    'none',
    border:        'none',
    fontFamily:    FONT_BODY,
    fontSize:      '15px',
    fontWeight:    FW_REGULAR,
    color:         L_TEXT_MUTED,
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
    padding:       0,
    letterSpacing: '0.01em',
  },
  error: {
    fontFamily:  FONT_BODY,
    fontSize:    '13px',
    fontWeight:  FW_REGULAR,
    color:       COLOR_ERROR,
    margin:      '20px 0 0',
    lineHeight:  1.5,
  },
  nav: {
    position:  'absolute',
    left:      '50%',
    transform: 'translateX(-50%)',
  },
  navBtn: {
    display:       'inline-flex',
    alignItems:    'center',
    gap:           '10px',
    background:    'none',
    border:        'none',
    cursor:        'pointer',
    fontFamily:    FONT_BODY,
    fontSize:      '15px',
    fontWeight:    FW_REGULAR,
    color:         L_TEXT_MUTED,
    padding:       0,
    letterSpacing: '0.02em',
  },
  arrowLeft: {
    display:      'inline-block',
    width:        0,
    height:       0,
    borderTop:    '5px solid transparent',
    borderBottom: '5px solid transparent',
    borderRight:  `7px solid ${L_TEXT_MUTED}`,
  },
};