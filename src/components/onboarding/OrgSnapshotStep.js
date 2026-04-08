import {
  FONT_BODY, FONT_DISPLAY, FW_LIGHT, FW_REGULAR,
  L_TEXT_MUTED, INDIGO,
  ONBOARDING_HEADLINE_GRADIENT,
} from '../../utils/hqConstants';
import useWindowWidth from '../../hooks/useWindowWidth';

function ColleaguesIcon() {
  return (
    <svg viewBox="0 0 48 48" width="52" height="52" fill="none"
      stroke={L_TEXT_MUTED} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="14" r="6" />
      <path d="M12 38c0-7 5-11 12-11s12 4 12 11" />
      <circle cx="36" cy="16" r="4" />
      <path d="M36 28c4 1 7 4 7 10" />
      <circle cx="12" cy="16" r="4" />
      <path d="M12 28c-4 1-7 4-7 10" />
    </svg>
  );
}

function ClientsIcon() {
  return (
    <svg viewBox="0 0 48 48" width="52" height="52" fill="none"
      stroke={L_TEXT_MUTED} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="16" r="7" />
      <path d="M10 42c0-8 6-13 14-13s14 5 14 13" />
    </svg>
  );
}

function NotesIcon() {
  return (
    <svg viewBox="0 0 48 48" width="52" height="52" fill="none"
      stroke={L_TEXT_MUTED} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="10" y="8" width="28" height="34" rx="3" />
      <line x1="16" y1="18" x2="32" y2="18" />
      <line x1="16" y1="25" x2="32" y2="25" />
      <line x1="16" y1="32" x2="26" y2="32" />
    </svg>
  );
}

function StatTile({ icon, count, label, softMessage, isMobile }) {
  const hasCount = count > 0;
  const show     = hasCount || softMessage;
  if (!show) return null;

  return (
    <div style={styles.tile}>
      <div style={styles.iconWrap}>{icon}</div>
      {hasCount
        ? <span style={{ ...styles.count, fontSize: isMobile ? 'clamp(40px, 10vw, 64px)' : 'clamp(64px, 8vw, 96px)' }}>{count}</span>
        : <span style={styles.soft}>{softMessage}</span>
      }
      {hasCount && <span style={styles.label}>{label}</span>}
    </div>
  );
}

export default function OrgSnapshotStep({ snapshot, onNext, onBack }) {
  const width    = useWindowWidth();
  const isMobile = width < 900;

  const { colleagues, clients, notes } = snapshot || {};

  return (
    <div style={styles.wrap}>
      <style>{`
        .snapshot-headline {
          background: ${ONBOARDING_HEADLINE_GRADIENT};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Headline */}
      <div style={styles.topZone}>
        <h2 className="snapshot-headline" style={styles.headline}>
          Your team is already here
        </h2>
        <div style={styles.rule} />
      </div>

      {/* Stats — always horizontal, scale down on mobile */}
      <div style={styles.middleZone}>
        {colleagues > 0 && (
          <div style={styles.tile}>
            <div style={styles.iconWrap}><ColleaguesIcon /></div>
            <span style={{ ...styles.count, fontSize: isMobile ? 'clamp(40px, 10vw, 64px)' : 'clamp(64px, 8vw, 96px)' }}>{colleagues}</span>
            <span style={styles.label}>{colleagues === 1 ? 'colleague' : 'colleagues'}</span>
          </div>
        )}
        <StatTile
          icon={<ClientsIcon />}
          count={clients}
          label={clients === 1 ? 'client' : 'clients'}
          softMessage={clients === 0 ? 'Your client roster is on its way' : null}
          isMobile={isMobile}
        />
        <StatTile
          icon={<NotesIcon />}
          count={notes}
          label={notes === 1 ? 'note' : 'notes'}
          softMessage={notes === 0 ? 'Your first note is just around the corner' : null}
          isMobile={isMobile}
        />
      </div>

      {/* Context */}
      <div style={styles.bottomZone}>
        <p style={styles.context}>A running start, from day one</p>
      </div>

      {/* Nav — inline flow, not absolute, so it never overlaps */}
      <div style={styles.nav}>
        <button style={styles.navBtn} onClick={onBack}>
          <span style={styles.arrowLeft} />
          Go back
        </button>
        <button style={styles.navBtn} onClick={onNext}>
          Continue
          <span style={styles.arrowRight} />
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
    minHeight:      '100dvh',
    padding:        '60px 24px 120px',
    boxSizing:      'border-box',
    gap:            '0',
  },
  topZone: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    width:          '100%',
    paddingBottom:  '40px',
  },
  headline: {
    fontFamily:    FONT_DISPLAY,
    fontSize:      'clamp(22px, 3.5vw, 52px)',
    fontWeight:    FW_LIGHT,
    color:         'transparent',
    margin:        '0 0 32px',
    letterSpacing: '0.02em',
    lineHeight:    1.2,
    textAlign:     'center',
  },
  rule: {
    width:      '128px',
    height:     '1px',
    background: L_TEXT_MUTED,
  },
  middleZone: {
    display:        'flex',
    flexDirection:  'row',
    alignItems:     'flex-start',
    justifyContent: 'space-around',
    width:          '100%',
    maxWidth:       '1000px',
    padding:        '0 16px',
    boxSizing:      'border-box',
    marginBottom:   '40px',
  },
  tile: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    flex:           '1 1 0',
  },
  iconWrap: {
    marginBottom: '4px',
  },
  count: {
    fontFamily:    FONT_DISPLAY,
    fontWeight:    FW_LIGHT,
    color:         INDIGO,
    lineHeight:    1,
    letterSpacing: '-0.01em',
    marginBottom:  '30px',
  },
  soft: {
    fontFamily:  FONT_BODY,
    fontSize:    '13px',
    fontWeight:  FW_REGULAR,
    color:       L_TEXT_MUTED,
    maxWidth:    '100px',
    textAlign:   'center',
    lineHeight:  1.4,
  },
  label: {
    fontFamily:    FONT_BODY,
    fontSize:      '13px',
    fontWeight:    FW_REGULAR,
    color:         L_TEXT_MUTED,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  bottomZone: {
    display:    'flex',
    alignItems: 'center',
    marginBottom: '40px',
  },
  context: {
    fontFamily:    FONT_DISPLAY,
    fontSize:      'clamp(16px, 2vw, 26px)',
    fontWeight:    FW_LIGHT,
    fontStyle:     'italic',
    color:         L_TEXT_MUTED,
    margin:        0,
    letterSpacing: '0.01em',
    textAlign:     'center',
  },
  nav: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            '32px',
    position:       'fixed',
    bottom:         '40px',
    left:           '50%',
    transform:      'translateX(-50%)',
  },
  navBtn: {
    display:       'inline-flex',
    alignItems:    'center',
    gap:           '10px',
    background:    'none',
    border:        'none',
    cursor:        'pointer',
    fontFamily:    FONT_BODY,
    fontSize:      '16px',
    fontWeight:    FW_REGULAR,
    color:         L_TEXT_MUTED,
    padding:       0,
    letterSpacing: '0.02em',
    whiteSpace:    'nowrap',
  },
  arrowLeft: {
    display:      'inline-block',
    width:        0,
    height:       0,
    borderTop:    '5px solid transparent',
    borderBottom: '5px solid transparent',
    borderRight:  `7px solid ${L_TEXT_MUTED}`,
  },
  arrowRight: {
    display:      'inline-block',
    width:        0,
    height:       0,
    borderTop:    '5px solid transparent',
    borderBottom: '5px solid transparent',
    borderLeft:   `7px solid ${L_TEXT_MUTED}`,
  },
};