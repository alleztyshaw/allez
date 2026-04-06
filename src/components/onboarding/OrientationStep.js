import {
  FONT_BODY, FW_LIGHT, FW_REGULAR, FW_MEDIUM,
  ACCENT_LIGHT, INDIGO, AMBER, ONBOARDING_ICON_FILL,
  L_TEXT, L_TEXT_MUTED,
} from '../../utils/hqConstants';
import useWindowWidth from '../../hooks/useWindowWidth';

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
    <svg viewBox="0 0 240 222" width="100%" style={{ maxWidth: 320 }}
      fill="none" stroke={INDIGO} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="120" cy="111" r="97" strokeWidth="1.4"/>
      <circle cx="46" cy="48" r="28" fill={ONBOARDING_ICON_FILL}/>
      <line x1="28" y1="63" x2="64" y2="63"/>
      <line x1="28" y1="30" x2="28" y2="63"/>
      <polyline points="30,61 37,55 43,59 49,47 55,52 61,41 65,36" strokeWidth="2.2"/>
      <circle cx="194" cy="48" r="28" fill={ONBOARDING_ICON_FILL}/>
      <circle cx="204" cy="32" r="5"/>
      <path d="M198 57C198 45 201 41 204 41C207 41 210 45 210 57"/>
      <circle cx="184" cy="35" r="4"/>
      <path d="M180 57C180 47 182 44 184 44C186 44 188 47 188 57"/>
      <circle cx="195" cy="41" r="3" fill={ONBOARDING_ICON_FILL}/>
      <path d="M192 57C192 52 194 50 195 50C196 50 198 52 198 57"
        fill={ONBOARDING_ICON_FILL} stroke={INDIGO}/>
      <circle cx="46" cy="174" r="28" fill={ONBOARDING_ICON_FILL}/>
      <rect x="28" y="160" width="36" height="28" rx="2"/>
      <line x1="28" y1="169" x2="64" y2="169"/>
      <line x1="37" y1="156" x2="37" y2="162"/>
      <line x1="55" y1="156" x2="55" y2="162"/>
      <line x1="34" y1="176" x2="58" y2="176"/>
      <line x1="34" y1="182" x2="58" y2="182"/>
      <circle cx="194" cy="174" r="28" fill={ONBOARDING_ICON_FILL}/>
      <path d="M179 183 L192 176 L211 176 Q218 176 218 170 L218 162 Q218 156 212 156
               L188 156 Q183 156 183 162 L183 176 Z"/>
      <path d="M215 190 L207 181 L193 181 Q187 181 187 175 L187 167 Q187 160 193 160
               L212 160 Q217 160 217 166 L217 181 Z" fill={ONBOARDING_ICON_FILL}/>
      <circle cx="120" cy="100" r="18"/>
      <path d="M94 143C100 131 108 127 120 127C132 127 140 131 146 143"/>
    </svg>
  );
}

function BriefIllustration() {
  return (
    <svg viewBox="200 80 900 500" width="100%" style={{ maxWidth: 340 }}
      fill="none" stroke={AMBER} strokeWidth="4"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M285 212C286 205 281 201 278 196C274 189 269 182 263 176C254 166 244 160 230 161C215 162 203 169 193 180C178 195 171 215 168 236C167 242 167 247 168 253"/>
      <path d="M398 259C401 251 401 243 400 236C399 221 395 208 387 195C376 181 364 170 346 168C334 167 324 171 315 178C306 187 300 198 296 210"/>
      <path d="M460 370C476 355 490 339 496 317C500 299 494 284 478 274C459 264 440 263 420 269C416 270 412 271 408 274"/>
      <path d="M452 473C446 488 437 502 434 518C433 522 432 526 434 530C437 537 446 541 454 539C465 538 474 527 475 515C475 501 470 489 460 480C458 477 455 474 452 472"/>
      <path d="M186 516C183 521 183 527 184 533C185 553 194 570 208 585C222 597 237 604 255 607C275 611 294 608 312 599C330 588 343 574 350 554"/>
      <path d="M161 260C155 252 146 250 137 251C115 254 99 266 88 286C81 299 82 313 88 327"/>
      <path d="M285 212C286 205 296 210 296 210"/>
      <path d="M408 274C401 251 398 259 398 259"/>
      <path d="M147 373C147 370 147 368 147 365C145 347 150 332 160 317C162 316 163 314 163 311"/>
      <path d="M452 472C457 452 457 452 460 480"/>
      <line x1="466" y1="377" x2="1239" y2="377"/>
      <line x1="635" y1="377" x2="635" y2="295"/>
      <line x1="824" y1="377" x2="824" y2="222"/>
      <line x1="1012" y1="377" x2="1012" y2="237"/>
      <ellipse cx="622" cy="268" rx="10" ry="6" transform="rotate(-30 622 268)"/>
      <ellipse cx="648" cy="290" rx="10" ry="6" transform="rotate(-30 648 290)"/>
      <path d="M628 272 C636 278 638 284 642 288"/>
      <rect x="793" y="222" width="62" height="54" rx="3"/>
      <line x1="793" y1="238" x2="855" y2="238"/>
      <line x1="813" y1="212" x2="813" y2="226"/>
      <line x1="835" y1="212" x2="835" y2="226"/>
      <line x1="803" y1="252" x2="845" y2="252"/>
      <line x1="803" y1="264" x2="838" y2="264"/>
      <rect x="975" y="222" width="74" height="50" rx="2"/>
      <line x1="975" y1="244" x2="1049" y2="244"/>
      <line x1="987" y1="210" x2="987" y2="224"/>
      <line x1="1037" y1="210" x2="1037" y2="224"/>
      <circle cx="1085" cy="218" r="14"/>
      <path d="M1063 280C1063 256 1070 248 1085 248C1100 248 1107 256 1107 280"/>
      <line x1="1070" y1="256" x2="1049" y2="244"/>
    </svg>
  );
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
  const { width } = useWindowWidth();
  const isMobile  = width < 900;

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
          maxWidth: isMobile ? '280px' : '360px',
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
    height:         '100vh',
    padding:        '0 40px',
    boxSizing:      'border-box',
    position:       'relative',
  },
  dots: {
    display:   'flex',
    gap:       '10px',
    position:  'absolute',
    top:       '40px',
    left:      '50%',
    transform: 'translateX(-50%)',
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
    flex:          '1 1 0',
  },
  eyebrow: {
    fontFamily:    FONT_BODY,
    fontSize:      '11px',
    fontWeight:    FW_MEDIUM,
    color:         ACCENT_LIGHT,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    margin:        '0 0 12px',
  },
  headline: {
    fontFamily:    FONT_BODY,
    fontSize:      'clamp(20px, 2.5vw, 30px)',
    fontWeight:    FW_LIGHT,
    fontStyle:     'italic',
    color:         L_TEXT,
    margin:        '0 0 16px',
    lineHeight:    1.3,
    letterSpacing: '-0.01em',
  },
  body: {
    fontFamily: FONT_BODY,
    fontSize:   'clamp(14px, 1.5vw, 16px)',
    fontWeight: FW_REGULAR,
    color:      L_TEXT_MUTED,
    lineHeight: 1.7,
    margin:     '0 0 20px',
  },
  feature: {
    fontFamily:    FONT_BODY,
    fontSize:      '13px',
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
  },
  nav: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            '32px',
    position:       'absolute',
    bottom:         '48px',
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
    fontSize:      '15px',
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