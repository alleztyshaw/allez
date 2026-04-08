import { useEffect, useState } from 'react';
import {
  FONT_BODY, FONT_DISPLAY, FW_LIGHT,
  L_TEXT_MUTED, AI_COLOR,
  ONBOARDING_HEADLINE_GRADIENT,
} from '../../utils/hqConstants';

const HEADLINE_DELAY    = 100;
const HEADLINE_DURATION = 3000;
const SUBTEXT_DELAY     = 2000;
const SUBTEXT_DURATION  = 800;
const CTA_DELAY         = 3000;

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

      {/* Gradient text requires background-clip technique */}
      <style>{`
        .allez-welcome-headline {
          background: ${ONBOARDING_HEADLINE_GRADIENT};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .allez-welcome-cta {
          background: ${ONBOARDING_HEADLINE_GRADIENT};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <div style={styles.headlineWrap}>
        <h1
          className="allez-welcome-headline"
          style={{
            ...styles.headline,
            clipPath:   headlineVisible ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
            opacity:    headlineVisible ? 1 : 0,
            transition: `clip-path ${HEADLINE_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1),
                         opacity   ${HEADLINE_DURATION * 0.4}ms ease`,
          }}
        >
          Welcome to Allez HQ
        </h1>
      </div>

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

      <div
        style={{
          ...styles.ctaWrap,
          opacity:    ctaVisible ? 1 : 0,
          transition: 'opacity 600ms ease',
        }}
      >
        <button style={styles.cta} onClick={onNext}>
          <span className="allez-welcome-cta">Get started</span>
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
    minHeight:      '100dvh',
    padding:        '0 24px 20vh',
    boxSizing:      'border-box',
    textAlign:      'center',
    position:       'relative',
  },
  headlineWrap: {
    width:     '100%',
    maxWidth:  '90vw',
    textAlign: 'center',
  },
  headline: {
    fontFamily:    FONT_DISPLAY,
    fontSize:      'clamp(36px, 6vw, 72px)',
    fontWeight:    FW_LIGHT,
    fontStyle:     'normal',
    margin:        0,
    letterSpacing: '-0.01em',
    lineHeight:    1.1,
  },
  subtext: {
    fontFamily:    FONT_BODY,
    fontSize:      'clamp(16px, 2vw, 22px)',
    fontWeight:    FW_LIGHT,
    fontStyle:     'italic',
    color:         L_TEXT_MUTED,
    margin:        '16px 0 0',
    letterSpacing: '0.01em',
  },
  ctaWrap: {
    position:  'absolute',
    top:       '66%',
    left:      '50%',
    transform: 'translateX(-50%)',
    width:     'max-content',
  },
  cta: {
    display:       'inline-flex',
    alignItems:    'center',
    gap:           '10px',
    background:    'none',
    border:        'none',
    cursor:        'pointer',
    fontFamily:    FONT_DISPLAY,
    fontSize:      '22px',
    fontWeight:    FW_LIGHT,
    fontStyle:     'normal',
    padding:       0,
    letterSpacing: '0.02em',
    whiteSpace:    'nowrap',
  },
  arrow: {
    display:      'inline-block',
    width:        0,
    height:       0,
    borderTop:    '7px solid transparent',
    borderBottom: '7px solid transparent',
    borderLeft:   `9px solid ${AI_COLOR}`,
  },
};