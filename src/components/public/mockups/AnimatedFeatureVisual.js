// src/components/public/mockups/AnimatedFeatureVisual.js
// Scroll-triggered animation wrapper. Plays once on scroll into view,
// stops on final frame, then fades in a semi-opaque white overlay with
// a centered cycle-arrow replay button.

import { useState, useEffect, useRef } from 'react';
import { PUB_ACCENT } from '../../../utils/publicConstants';

export default function AnimatedFeatureVisual({ children, onPlay }) {
  const [status,       setStatus]       = useState('idle');
  const [overlayAlpha, setOverlayAlpha] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && status === 'idle') {
          setStatus('playing');
          onPlay && onPlay();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [status, onPlay]);

  // When done fires: hold for 600ms then fade overlay in over 500ms
  function handleDone() {
    setStatus('done');
    setTimeout(() => setOverlayAlpha(1), 600);
  }

  function handleReplay() {
    setOverlayAlpha(0);
    setStatus('idle');
    setTimeout(() => {
      setStatus('playing');
      onPlay && onPlay();
    }, 50);
  }

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      {children({ status, onDone: handleDone })}

      {/* White overlay — fades in after animation ends */}
      {status === 'done' && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `rgba(255,255,255,${overlayAlpha * 0.82})`,
          transition: 'background 0.5s ease',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10,
        }}>
          <button
            onClick={handleReplay}
            aria-label="Replay animation"
            style={{
              width: '40px', height: '40px',
              background: `rgba(255,255,255,${0.5 + overlayAlpha * 0.4})`,
              border: `1px solid rgba(0,0,0,${0.06 + overlayAlpha * 0.06})`,
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
              padding: 0,
              opacity: overlayAlpha,
              transition: 'opacity 0.5s ease',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M13 8A5 5 0 1 1 8 3" stroke={PUB_ACCENT} strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M8 1l2.5 2L8 5" stroke={PUB_ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}