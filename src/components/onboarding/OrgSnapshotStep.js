import { FONT_BODY, FW_LIGHT, FW_REGULAR, ACCENT_LIGHT, L_TEXT, L_TEXT_MUTED } from '../../utils/hqConstants';
import useWindowWidth from '../../hooks/useWindowWidth';

// ─── Icon SVGs ────────────────────────────────────────────────────────────────

function ColleaguesIcon() {
  return (
    <svg viewBox="0 0 48 48" width="36" height="36" fill="none"
      stroke={ACCENT_LIGHT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
    <svg viewBox="0 0 48 48" width="36" height="36" fill="none"
      stroke={ACCENT_LIGHT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="16" r="7" />
      <path d="M10 42c0-8 6-13 14-13s14 5 14 13" />
      <polyline points="30,28 33,32 40,24" strokeWidth="2" />
    </svg>
  );
}

function NotesIcon() {
  return (
    <svg viewBox="0 0 48 48" width="36" height="36" fill="none"
      stroke={ACCENT_LIGHT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="10" y="8" width="28" height="34" rx="3" />
      <line x1="16" y1="18" x2="32" y2="18" />
      <line x1="16" y1="25" x2="32" y2="25" />
      <line x1="16" y1="32" x2="26" y2="32" />
    </svg>
  );
}

// ─── Single stat tile ─────────────────────────────────────────────────────────
function StatTile({ icon, count, label, softMessage }) {
  const show = count > 0 || softMessage;
  if (!show) return null;

  return (
    <div style={styles.tile}>
      <div style={styles.iconWrap}>{icon}</div>
      {count > 0
        ? <span style={styles.count}>{count}</span>
        : <span style={styles.soft}>{softMessage}</span>
      }
      {count > 0 && <span style={styles.label}>{label}</span>}
    </div>
  );
}

// ─── OrgSnapshotStep ─────────────────────────────────────────────────────────
export default function OrgSnapshotStep({ snapshot, onNext, onBack }) {
  const { width } = useWindowWidth();
  const isMobile  = width < 900;

  const { colleagues, clients, notes } = snapshot || {};

  return (
    <div style={styles.wrap}>

      <div style={styles.inner}>
        <h2 style={styles.headline}>Your team is already here.</h2>

        <div style={{ ...styles.tiles, flexDirection: isMobile ? 'column' : 'row' }}>

          {colleagues > 0 && (
            <div style={styles.tile}>
              <div style={styles.iconWrap}><ColleaguesIcon /></div>
              <span style={styles.count}>{colleagues}</span>
              <span style={styles.label}>{colleagues === 1 ? 'colleague' : 'colleagues'}</span>
            </div>
          )}

          <StatTile
            icon={<ClientsIcon />}
            count={clients}
            label={clients === 1 ? 'client' : 'clients'}
            softMessage={clients === 0 ? 'Your client roster is on its way.' : null}
          />

          <StatTile
            icon={<NotesIcon />}
            count={notes}
            label={notes === 1 ? 'note' : 'notes'}
            softMessage={notes === 0 ? 'Your first note is just around the corner.' : null}
          />

        </div>

        <p style={styles.context}>A running start, from day one.</p>
      </div>

      <div style={{ ...styles.nav, gap: isMobile ? '20px' : '32px' }}>
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
    height:         '100vh',
    padding:        '0 24px',
    boxSizing:      'border-box',
  },
  inner: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    textAlign:      'center',
    maxWidth:       '640px',
    width:          '100%',
  },
  headline: {
    fontFamily:    FONT_BODY,
    fontSize:      'clamp(24px, 3.5vw, 40px)',
    fontWeight:    FW_LIGHT,
    fontStyle:     'italic',
    color:         L_TEXT,
    margin:        '0 0 48px',
    letterSpacing: '-0.01em',
    lineHeight:    1.2,
  },
  tiles: {
    display:        'flex',
    justifyContent: 'center',
    alignItems:     'flex-start',
    gap:            '40px',
    width:          '100%',
    marginBottom:   '48px',
  },
  tile: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    gap:            '10px',
    minWidth:       '100px',
  },
  iconWrap: {
    marginBottom: '4px',
  },
  count: {
    fontFamily:  FONT_BODY,
    fontSize:    '36px',
    fontWeight:  FW_LIGHT,
    color:       L_TEXT,
    lineHeight:  1,
  },
  soft: {
    fontFamily:  FONT_BODY,
    fontSize:    '13px',
    fontWeight:  FW_REGULAR,
    color:       L_TEXT_MUTED,
    maxWidth:    '120px',
    textAlign:   'center',
    lineHeight:  1.4,
  },
  label: {
    fontFamily:    FONT_BODY,
    fontSize:      '13px',
    fontWeight:    FW_REGULAR,
    color:         L_TEXT_MUTED,
    letterSpacing: '0.03em',
  },
  context: {
    fontFamily:  FONT_BODY,
    fontSize:    '15px',
    fontWeight:  FW_LIGHT,
    fontStyle:   'italic',
    color:       L_TEXT_MUTED,
    margin:      0,
  },
  nav: {
    display:     'flex',
    alignItems:  'center',
    marginTop:   '56px',
  },
  navBtn: {
    display:     'inline-flex',
    alignItems:  'center',
    gap:         '10px',
    background:  'none',
    border:      'none',
    cursor:      'pointer',
    fontFamily:  FONT_BODY,
    fontSize:    '15px',
    fontWeight:  FW_REGULAR,
    color:       L_TEXT_MUTED,
    padding:     0,
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
  arrowRight: {
    display:      'inline-block',
    width:        0,
    height:       0,
    borderTop:    '5px solid transparent',
    borderBottom: '5px solid transparent',
    borderLeft:   `7px solid ${L_TEXT_MUTED}`,
  },
};