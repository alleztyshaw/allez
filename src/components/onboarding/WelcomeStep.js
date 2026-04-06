import { useEffect, useState } from 'react';
import { FONT_BODY, FW_LIGHT, L_TEXT, L_TEXT_MUTED, ACCENT_LIGHT } from '../../utils/hqConstants';

// Duration constants — all in ms
const HEADLINE_DELAY    = 300;   // pause before headline starts
const HEADLINE_DURATION = 1500;  // left-to-right fade across the text
const SUBTEXT_DELAY     = 2000;  // pause before subtext appears
const SUBTEXT_DURATION  = 800;   // subtext fade in duration
const CTA_DELAY         = 3200;  // pause before continue prompt appears

export default function WelcomeStep({ isFlowB, orgName, onNext }) {
  const [headlineVisible, setHeadlineVisible] = useState(false);
  const [subtextVisible,  setSubtextVisible]  = useState(false);
  const [ctaVisible,      setCtaVisible]      = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setHeadlineVisible(true), HEADLINE_DELAY);
    const t2 = setTimeout(() => setSubtextVisible(true),  SUBTEXT_DELAY);
    const t3 = setTimeout(() => setCtaVisible(true),      CTA_DELAY);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div style={styles.wrap}>

      {/* Headline — "Welcome to Allez." fades in left to right via clip-path */}
      <div style={styles.headlineWrap}>
        <h1
          style={{
            ...styles.headline,
            clipPath:   headlineVisible ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
            opacity:    headlineVisible ? 1 : 0,
            transition: `clip-path ${HEADLINE_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1),
                         opacity   ${HEADLINE_DURATION * 0.4}ms ease`,
          }}
        >
          Welcome to Allez.
        </h1>
      </div>

      {/* Subtext — Flow B only */}
      {isFlowB && orgName && (
        <p
          style={{
            ...styles.subtext,
            opacity:    subtextVisible ? 1 : 0,
            transform:  subtextVisible ? 'translateY(0)' : 'translateY(6px)',
            transition: `opacity   ${SUBTEXT_DURATION}ms ease,
                         transform ${SUBTEXT_DURATION}ms ease`,
          }}
        >
          You're joining {orgName}.
        </p>
      )}

      {/* Continue prompt */}
      <div
        style={{
          ...styles.ctaWrap,
          opacity:    ctaVisible ? 1 : 0,
          transition: `opacity 600ms ease`,
        }}
      >
        <button style={styles.cta} onClick={onNext}>
          Continue
          <span style={styles.arrow} />
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
    textAlign:      'center',
  },
  headlineWrap: {
    overflow: 'hidden', // clips the left-to-right reveal cleanly
  },
  headline: {
    fontFamily:    FONT_BODY,
    fontSize:      'clamp(36px, 6vw, 72px)',
    fontWeight:    FW_LIGHT,
    fontStyle:     'italic',
    color:         L_TEXT,
    margin:        0,
    letterSpacing: '-0.01em',
    lineHeight:    1.1,
    whiteSpace:    'nowrap',
  },
  subtext: {
    fontFamily:  FONT_BODY,
    fontSize:    'clamp(16px, 2vw, 22px)',
    fontWeight:  FW_LIGHT,
    fontStyle:   'italic',
    color:       L_TEXT_MUTED,
    margin:      '16px 0 0',
    letterSpacing: '0.01em',
  },
  ctaWrap: {
    marginTop: '48px',
  },
  cta: {
    display:     'inline-flex',
    alignItems:  'center',
    gap:         '10px',
    background:  'none',
    border:      'none',
    cursor:      'pointer',
    fontFamily:  FONT_BODY,
    fontSize:    '15px',
    fontWeight:  '400',
    color:       L_TEXT_MUTED,
    padding:     0,
    letterSpacing: '0.02em',
  },
  arrow: {
    display:     'inline-block',
    width:       0,
    height:      0,
    borderTop:   '5px solid transparent',
    borderBottom:'5px solid transparent',
    borderLeft:  `7px solid ${L_TEXT_MUTED}`,
  },
};