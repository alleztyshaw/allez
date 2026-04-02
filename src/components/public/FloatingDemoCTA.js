// src/components/public/FloatingDemoCTA.js
// Fixed-position pill CTA that fades in after scrolling past the hero
// and fades out before the footer comes into view.
// Drop into any public page that warrants a persistent demo prompt.

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PUB_ACCENT, PUB_BORDER,
  FONT_BODY, FW_MEDIUM,
  MOBILE_BREAKPOINT,
} from '../../utils/publicConstants';
import useWindowWidth from '../../hooks/useWindowWidth';

const SCROLL_THRESHOLD = 300; // px before pill appears
const FOOTER_OFFSET    = 0;   // fade out when footer top reaches viewport bottom

export default function FloatingDemoCTA() {
  const [visible, setVisible] = useState(false);
  const isMobile = useWindowWidth() < MOBILE_BREAKPOINT;

  useEffect(() => {
    function handleScroll() {
      const scrollY    = window.scrollY;
      const footer     = document.querySelector('footer');
      const nearFooter = footer
        ? footer.getBoundingClientRect().top < window.innerHeight + FOOTER_OFFSET
        : false;
      setVisible(scrollY > SCROLL_THRESHOLD && !nearFooter);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <style>{`
        .floating-cta-pill:hover {
          background: rgba(255,255,255,0.98) !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.10) !important;
        }
      `}</style>
      <div style={{
        position: 'fixed',
        bottom: isMobile ? '24px' : '32px',
        right:  isMobile ? '16px' : '32px',
        zIndex: 100,
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}>
        <Link to="/book-a-demo" className="floating-cta-pill" style={s.pill}>
          Book a Demo
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 6h7M6.5 3.5L9 6l-2.5 2.5"
              stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </>
  );
}

const s = {
  pill: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '10px 18px', borderRadius: '999px',
    background: 'rgba(255,255,255,0.88)',
    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    border: `1px solid ${PUB_BORDER}`,
    color: PUB_ACCENT, fontSize: '12px', fontWeight: FW_MEDIUM,
    fontFamily: FONT_BODY, letterSpacing: '0.04em',
    textDecoration: 'none', whiteSpace: 'nowrap',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    transition: 'box-shadow 0.2s, background 0.2s',
  },
};