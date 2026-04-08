import {
  FONT_BODY, FONT_DISPLAY, FW_LIGHT, FW_REGULAR, FW_MEDIUM,
  ACCENT_LIGHT, INDIGO,
  L_TEXT, L_TEXT_MUTED,
} from '../../utils/hqConstants';
import useWindowWidth from '../../hooks/useWindowWidth';
import DailyBriefIllustration from './DailyBriefIllustration';

const DOT_ACTIVE   = ACCENT_LIGHT;
const DOT_INACTIVE = 'transparent';
const DOT_BORDER   = ACCENT_LIGHT;

// ─── Illustrations ────────────────────────────────────────────────────────────

function NotesIllustration() {
  return (
    <svg viewBox="0 0 240 188" width="100%" style={{ maxWidth: 320 }}
      fill="none" stroke={ACCENT_LIGHT} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="108" y="12" width="24" height="50" rx="12"/>
      <path d="M94 62Q94 90 120 90Q146 90 146 62"/>
      <line x1="120" y1="90" x2="120" y2="106"/>
      <line x1="104" y1="106" x2="136" y2="106"/>
      <path d="M28 132 C31,114 37,114 40,132 C43,150 49,150 52,132 C55,116 61,116 64,132
               C67,148 73,148 76,132 C79,120 85,120 88,132 C91,144 97,144 100,132
               C103,124 109,124 112,132 C115,140 121,140 124,132 C127,128 133,128 136,132
               C139,136 145,136 148,132 L212,132"/>
      <line x1="28" y1="150" x2="196" y2="150"/>
      <line x1="28" y1="165" x2="182" y2="165"/>
      <circle cx="219" cy="132" r="3.5" fill={ACCENT_LIGHT}/>
      <circle cx="204" cy="150" r="3.5" fill={ACCENT_LIGHT}/>
      <circle cx="190" cy="165" r="3.5"/>
    </svg>
  );
}

function ProfilesIllustration() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="60 60 380 380" width="100%" style={{ maxWidth: 340 }} fill="none">
      {/* Ring with gaps at icon positions */}
      <g stroke={INDIGO} strokeWidth="1.8" strokeLinecap="round" fill="none">
        <path d="M 395.0,182.4 A 160,160 0 0,1 395.0,317.6"/>
        <path d="M 317.6,395.0 A 160,160 0 0,1 182.4,395.0"/>
        <path d="M 105.0,317.6 A 160,160 0 0,1 105.0,182.4"/>
        <path d="M 182.4,105.0 A 160,160 0 0,1 317.6,105.0"/>
      </g>
      {/* Central figure */}
      <g transform="translate(205,205) scale(3.75)" fill={INDIGO}>
        <path d="M12,12c3.309,0,6-2.691,6-6S15.309,0,12,0,6,2.691,6,6s2.691,6,6,6Zm0-11c2.757,0,5,2.243,5,5s-2.243,5-5,5-5-2.243-5-5S9.243,1,12,1Zm9,22v.5c0,.276-.224,.5-.5,.5s-.5-.224-.5-.5v-.5c0-4.411-3.589-8-8-8s-8,3.589-8,8v.5c0,.276-.224,.5-.5,.5s-.5-.224-.5-.5v-.5c0-4.962,4.038-9,9-9s9,4.038,9,9Z"/>
      </g>
      {/* Top-left: chart-histogram */}
      <g transform="translate(115,115) scale(1.833)" fill={INDIGO}>
        <path d="m24,23.524c0,.276-.225.5-.5.5h0l-20-.024c-1.929,0-3.5-1.57-3.5-3.5V.5C0,.224.224,0,.5,0s.5.224.5.5v20c0,1.378,1.122,2.5,2.5,2.5l20.001.024c.275,0,.499.225.499.5ZM5,12.524v6.976c0,.276.224.5.5.5s.5-.224.5-.5v-6.976c0-.276-.224-.5-.5-.5s-.5.224-.5.5Zm5-2v8.976c0,.276.224.5.5.5s.5-.224.5-.5v-8.976c0-.276-.224-.5-.5-.5s-.5.224-.5.5Zm5,3v5.976c0,.276.224.5.5.5s.5-.224.5-.5v-5.976c0-.276-.224-.5-.5-.5s-.5.224-.5.5Zm5-4.024v10c0,.276.224.5.5.5s.5-.224.5-.5v-10c0-.276-.224-.5-.5-.5s-.5.224-.5.5Zm-15.5-.5c.128,0,.256-.049.354-.146l4.474-4.474c.371-.371.974-.371,1.345,0l2.948,2.949c.762.759,1.998.759,2.76,0L22.854.854c.195-.195.195-.512,0-.707s-.512-.195-.707,0l-6.474,6.474c-.371.371-.975.371-1.346,0l-2.948-2.948c-.761-.761-1.998-.761-2.759,0l-4.474,4.474c-.195.195-.195.512,0,.707.098.098.226.146.354.146Z"/>
      </g>
      {/* Top-right: users-alt */}
      <g transform="translate(341,115) scale(1.833)" fill={INDIGO}>
        <path d="m17.979,23.359c.078.265-.073.542-.339.62-.047.014-.094.021-.141.021-.217,0-.416-.141-.479-.359-.631-2.144-2.695-3.641-5.021-3.641s-4.39,1.497-5.021,3.641c-.077.266-.357.416-.62.339-.266-.078-.417-.355-.339-.62.754-2.567,3.213-4.359,5.979-4.359s5.226,1.792,5.979,4.359Zm6-9c-.754-2.567-3.213-4.359-5.979-4.359-.276,0-.5.224-.5.5s.224.5.5.5c2.325,0,4.39,1.497,5.021,3.641.063.219.263.359.479.359.047,0,.094-.007.141-.021.266-.078.417-.355.339-.62Zm-17.479-3.859c0-.276-.224-.5-.5-.5C3.233,10,.774,11.792.021,14.359c-.078.265.073.542.339.62.047.014.094.021.141.021.217,0,.416-.141.479-.359.631-2.144,2.695-3.641,5.021-3.641.276,0,.5-.224.5-.5Zm5.5-1.5c2.206,0,4,1.794,4,4s-1.794,4-4,4-4-1.794-4-4,1.794-4,4-4Zm-3,4c0,1.654,1.346,3,3,3s3-1.346,3-3-1.346-3-3-3-3,1.346-3,3Zm5-9c0-2.206,1.794-4,4-4s4,1.794,4,4-1.794,4-4,4-4-1.794-4-4Zm1,0c0,1.654,1.346,3,3,3s3-1.346,3-3-1.346-3-3-3-3,1.346-3,3Zm-13,0C2,1.794,3.794,0,6,0s4,1.794,4,4-1.794,4-4,4-4-1.794-4-4Zm1,0c0,1.654,1.346,3,3,3s3-1.346,3-3-1.346-3-3-3-3,1.346-3,3Z"/>
      </g>
      {/* Bottom-left: messages */}
      <g transform="translate(115,341) scale(1.833)" fill={INDIGO}>
        <path d="m19.5,3.998h-1.528C17.723,1.751,15.812-.002,13.5-.002H4.5C2.019-.002,0,2.017,0,4.498v13.854c0,.609.333,1.166.871,1.453.244.131.511.195.777.195.319,0,.638-.093.914-.277l3.524-2.349c.409,2.063,2.233,3.623,4.414,3.623h6.849l4.089,2.726c.276.185.594.277.914.277.266,0,.533-.064.777-.195.537-.287.871-.844.871-1.453v-13.854c0-2.481-2.019-4.5-4.5-4.5ZM2.007,18.892c-.203.135-.45.148-.665.032-.214-.114-.342-.328-.342-.571V4.498c0-1.93,1.57-3.5,3.5-3.5h9c1.93,0,3.5,1.57,3.5,3.5v8c0,1.93-1.57,3.5-3.5,3.5h-6.937c-.154,0-.285.054-.345.087l-4.211,2.806Zm20.993,3.461c0,.243-.128.457-.342.571-.214.115-.463.102-.665-.032l-4.215-2.81c-.082-.055-.179-.084-.277-.084h-7c-1.76,0-3.221-1.306-3.464-3h6.464c2.481,0,4.5-2.019,4.5-4.5v-7.5h1.5c1.93,0,3.5,1.57,3.5,3.5v13.854Z"/>
      </g>
      {/* Bottom-right: calendar-lines */}
      <g transform="translate(341,341) scale(1.833)" fill={INDIGO}>
        <path d="M19.5,2h-1.5V.5c0-.276-.224-.5-.5-.5s-.5,.224-.5,.5v1.5H7V.5c0-.276-.224-.5-.5-.5s-.5,.224-.5,.5v1.5h-1.5C2.019,2,0,4.019,0,6.5v13c0,2.481,2.019,4.5,4.5,4.5h15c2.481,0,4.5-2.019,4.5-4.5V6.5c0-2.481-2.019-4.5-4.5-4.5ZM4.5,3h15c1.93,0,3.5,1.57,3.5,3.5v1.5H1v-1.5c0-1.93,1.57-3.5,3.5-3.5Zm15,20H4.5c-1.93,0-3.5-1.57-3.5-3.5V9H23v10.5c0,1.93-1.57,3.5-3.5,3.5Zm-.5-9.5c0,.276-.224,.5-.5,.5H5.5c-.276,0-.5-.224-.5-.5s.224-.5,.5-.5h13c.276,0,.5,.224,.5,.5Zm-7,5c0,.276-.224,.5-.5,.5H5.5c-.276,0-.5-.224-.5-.5s.224-.5,.5-.5h6c.276,0,.5,.224,.5,.5Z"/>
      </g>
    </svg>
  );
}

function BriefIllustration() {
  return <DailyBriefIllustration />;
}

const ILLUSTRATIONS = {
  notes:    <NotesIllustration />,
  profiles: <ProfilesIllustration />,
  brief:    <BriefIllustration />,
};

// ─── Progress dots ────────────────────────────────────────────────────────────
function ProgressDots({ dotIndex }) {
  return (
    <div style={styles.dots}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            ...styles.dot,
            background:  i === dotIndex ? DOT_ACTIVE : DOT_INACTIVE,
            borderColor: DOT_BORDER,
          }}
        />
      ))}
    </div>
  );
}

// ─── OrientationStep ──────────────────────────────────────────────────────────
export default function OrientationStep({ content, dotIndex, isFirst, onNext, onBack }) {
  const width    = useWindowWidth();
  const isMobile  = width < 1024;

  const { eyebrow, headline, body, feature, illustration } = content;

  return (
    <div style={styles.wrap}>

      <ProgressDots dotIndex={dotIndex} />

      <div style={{
        ...styles.inner,
        flexDirection: isMobile ? 'column' : 'row',
        gap:           isMobile ? '40px' : '80px',
      }}>

        <div style={{
          ...styles.copyPanel,
          alignItems: isMobile ? 'center' : 'flex-start',
          textAlign:  isMobile ? 'center' : 'left',
          maxWidth:   isMobile ? '480px' : '400px',
        }}>
          <p style={styles.eyebrow}>{eyebrow}</p>
          <h2 style={styles.headline}>{headline}</h2>
          <p style={styles.body}>{body}</p>
          <p style={styles.feature}>{feature}</p>
        </div>

        <div style={{
          ...styles.illustrationPanel,
          maxWidth: isMobile ? '420px' : '540px',
        }}>
          {ILLUSTRATIONS[illustration]}
        </div>

      </div>

      <div style={styles.nav}>
        {!isFirst && (
          <button style={styles.navBtn} onClick={onBack}>
            <span style={styles.arrowLeft} />
            Go back
          </button>
        )}
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
    padding:        '80px 32px 100px',
    boxSizing:      'border-box',
  },
  dots: {
    display:   'flex',
    gap:       '10px',
    position:  'fixed',
    top:       '32px',
    left:      '50%',
    transform: 'translateX(-50%)',
    zIndex:    10,
  },
  dot: {
    width:        '10px',
    height:       '10px',
    borderRadius: '50%',
    border:       `1.5px solid ${DOT_BORDER}`,
    transition:   'background 300ms ease',
  },
  inner: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    width:          '100%',
    maxWidth:       '900px',
  },
  copyPanel: {
    display:       'flex',
    flexDirection: 'column',
    flex:          '2 1 0',
  },
  eyebrow: {
    fontFamily:    FONT_BODY,
    fontSize:      '13px',
    fontWeight:    FW_MEDIUM,
    color:         ACCENT_LIGHT,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    margin:        '0 0 16px',
  },
  headline: {
    fontFamily:    FONT_DISPLAY,
    fontSize:      'clamp(22px, 3vw, 42px)',
    fontWeight:    FW_LIGHT,
    fontStyle:     'normal',
    color:         L_TEXT,
    margin:        '0 0 20px',
    lineHeight:    1.25,
    letterSpacing: '0.01em',
  },
  body: {
    fontFamily: FONT_BODY,
    fontSize:   'clamp(14px, 1.6vw, 19px)',
    fontWeight: FW_REGULAR,
    color:      L_TEXT_MUTED,
    lineHeight: 1.7,
    margin:     '0 0 20px',
  },
  feature: {
    fontFamily:    FONT_BODY,
    fontSize:      'clamp(14px, 1.6vw, 16px)',
    fontWeight:    FW_MEDIUM,
    color:         L_TEXT,
    margin:        0,
    letterSpacing: '0.01em',
  },
  illustrationPanel: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flex:           '1 1 0',
    maxHeight:      '45vh',
    overflow:       'hidden',
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
    zIndex:         10,
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