// src/components/public/mockups/AnimatedFeatureVisual.js
// Scroll-triggered animation wrapper. Plays once on scroll into view,
// stops on final frame, shows circular cycle-arrow replay tile.

import { useState, useEffect, useRef } from 'react';
import {
  PUB_ACCENT,
} from '../../../utils/publicConstants';

// status: 'idle' | 'playing' | 'done'

export default function AnimatedFeatureVisual({ children, onPlay }) {
  const [status, setStatus] = useState('idle');
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

  function handleReplay() {
    setStatus('idle');
    // Small delay so children reset before re-triggering
    setTimeout(() => {
      setStatus('playing');
      onPlay && onPlay();
    }, 50);
  }

  function handleDone() {
    setStatus('done');
  }

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      {children({ status, onDone: handleDone })}
      {status === 'done' && (
        <button
          onClick={handleReplay}
          aria-label="Replay animation"
          style={{
            position: 'absolute', bottom: '12px', right: '12px',
            width: '32px', height: '32px',
            background: 'rgba(255,255,255,0.88)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
            padding: 0,
          }}
        >
          {/* Cycle arrow SVG */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M13 8A5 5 0 1 1 8 3"
              stroke={PUB_ACCENT} strokeWidth="1.5" strokeLinecap="round"
            />
            <path
              d="M8 1l2.5 2L8 5"
              stroke={PUB_ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}