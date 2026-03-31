// src/components/public/mockups/AnimatedSearchMockup.js
// Fully self-contained — scroll trigger, replay, and animation all inline.
// No AnimatedFeatureVisual wrapper to avoid height/layout issues.

import { useState, useEffect, useRef } from 'react';
import MockWindow from './MockWindow';
import {
  PUB_APP_ACCENT as ACCENT,
  PUB_APP_ACCENT_MUTED as ACCENT_MUTED,
  PUB_APP_ACCENT_BORDER as ACCENT_BORDER,
  PUB_TEXT as L_TEXT,
  PUB_TEXT_MUTED as L_TEXT_MUTED,
  PUB_TEXT_SUBTLE as L_TEXT_SUBTLE,
  PUB_ACCENT,
  FONT_DISPLAY, FONT_BODY,
  FW_LIGHT, FW_MEDIUM, FW_SEMIBOLD,
} from '../../../utils/publicConstants';

const QUERY          = 'chen';
const CHAR_INTERVAL  = 240;
const RESULTS_DELAY  = 600;
const NOTES_DELAY    = 600;
const REGISTER_PAUSE = 1800;
const SELECT_PAUSE   = 600;
const FADE_DURATION  = 450;
const PROFILE_LINGER = 1200;

export default function AnimatedSearchMockup() {
  const [status,           setStatus]           = useState('idle'); // idle | playing | done
  const [typedChars,       setTypedChars]        = useState(0);
  const [showClients,      setShowClients]       = useState(false);
  const [showNotes,        setShowNotes]         = useState(false);
  const [selectedMargaret, setSelectedMargaret]  = useState(false);
  const [showProfile,      setShowProfile]       = useState(false);
  const timeouts = useRef([]);
  const containerRef = useRef(null);

  // Scroll trigger — fires once when 30% visible
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && status === 'idle') play();
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function resetState() {
    setTypedChars(0);
    setShowClients(false);
    setShowNotes(false);
    setSelectedMargaret(false);
    setShowProfile(false);
  }

  function play() {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    resetState();
    setStatus('playing');

    QUERY.split('').forEach((_, i) => {
      const t = setTimeout(() => setTypedChars(i + 1), (i + 1) * CHAR_INTERVAL);
      timeouts.current.push(t);
    });

    const afterTyping = QUERY.length * CHAR_INTERVAL;

    const t1 = setTimeout(() => setShowClients(true), afterTyping + RESULTS_DELAY);
    const t2 = setTimeout(() => setShowNotes(true),   afterTyping + RESULTS_DELAY + NOTES_DELAY);
    timeouts.current.push(t1, t2);

    const selectAt = afterTyping + RESULTS_DELAY + NOTES_DELAY + REGISTER_PAUSE;
    const t3 = setTimeout(() => setSelectedMargaret(true), selectAt);
    timeouts.current.push(t3);

    const profileAt = selectAt + SELECT_PAUSE;
    const t4 = setTimeout(() => setShowProfile(true), profileAt);
    timeouts.current.push(t4);

    const doneAt = profileAt + FADE_DURATION + PROFILE_LINGER;
    const t5 = setTimeout(() => setStatus('done'), doneAt);
    timeouts.current.push(t5);
  }

  function replay() {
    timeouts.current.forEach(clearTimeout);
    resetState();
    setStatus('idle');
    setTimeout(() => play(), 50);
  }

  const displayQuery = QUERY.slice(0, typedChars);
  const isPlaying = status === 'playing';

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>

      {/* Both panels always in DOM — profile holds the container height.
          Search sits absolute on top and fades out; profile fades in below. */}

      {/* Search panel */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        opacity: showProfile ? 0 : 1,
        transition: `opacity ${FADE_DURATION}ms ease`,
        pointerEvents: showProfile ? 'none' : 'auto',
        zIndex: showProfile ? 0 : 1,
      }}>
        <MockWindow label="Global Search">
          <div>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="6" stroke={L_TEXT_MUTED} strokeWidth="1.5"/>
                <path d="M13.5 13.5L17 17" stroke={L_TEXT_MUTED} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: '13px', color: L_TEXT, fontFamily: FONT_BODY, minWidth: '40px' }}>
                {displayQuery}
                {isPlaying && typedChars < QUERY.length && (
                  <span style={{ borderRight: `1px solid ${L_TEXT}`, marginLeft: '1px', animation: 'blink 0.7s step-end infinite' }}>&nbsp;</span>
                )}
              </span>
              <span style={{ marginLeft: 'auto', fontSize: '10px', color: L_TEXT_SUBTLE, fontFamily: FONT_BODY, border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', padding: '1px 5px' }}>Esc</span>
            </div>

            <div style={{ opacity: showClients ? 1 : 0, transition: 'opacity 0.3s ease' }}>
              <p style={{ fontSize: '9px', fontWeight: FW_MEDIUM, textTransform: 'uppercase', letterSpacing: '0.12em', color: L_TEXT_SUBTLE, margin: 0, padding: '10px 16px 4px', fontFamily: FONT_BODY }}>Clients</p>
              {[
                { label: 'Margaret Chen', sub: 'Active · $3.2M AUM' },
                { label: 'David Chen',    sub: 'Prospect · Lead stage' },
              ].map((item, i) => {
                const isMargaret = i === 0;
                const isSelected = isMargaret && selectedMargaret;
                return (
                  <div key={item.label} style={{
                    padding: '8px 16px',
                    background: isSelected ? ACCENT : isMargaret ? ACCENT_MUTED : 'transparent',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'background 0.25s ease',
                  }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '12px', fontWeight: FW_MEDIUM, color: isSelected ? '#fff' : L_TEXT, fontFamily: FONT_BODY, transition: 'color 0.25s ease' }}>{item.label}</p>
                      <p style={{ margin: 0, fontSize: '10px', color: isSelected ? 'rgba(255,255,255,0.7)' : L_TEXT_MUTED, fontFamily: FONT_BODY, transition: 'color 0.25s ease' }}>{item.sub}</p>
                    </div>
                    <span style={{ fontSize: '10px', color: isSelected ? '#fff' : ACCENT, fontFamily: FONT_BODY, transition: 'color 0.25s ease' }}>→</span>
                  </div>
                );
              })}
            </div>

            <div style={{ opacity: showNotes ? 1 : 0, transition: 'opacity 0.3s ease' }}>
              <p style={{ fontSize: '9px', fontWeight: FW_MEDIUM, textTransform: 'uppercase', letterSpacing: '0.12em', color: L_TEXT_SUBTLE, margin: 0, padding: '10px 16px 4px', fontFamily: FONT_BODY }}>Notes</p>
              <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: FW_MEDIUM, color: L_TEXT, fontFamily: FONT_BODY }}>Annual Review – Margaret Chen</p>
                  <p style={{ margin: 0, fontSize: '10px', color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>Mar 25, 2026 · Meeting</p>
                </div>
                <span style={{ fontSize: '10px', color: ACCENT, fontFamily: FONT_BODY }}>→</span>
              </div>
            </div>

            <div style={{ padding: '8px 16px 12px', opacity: showNotes ? 1 : 0, transition: 'opacity 0.3s ease' }}>
              <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', marginBottom: '8px' }} />
              <p style={{ margin: 0, fontSize: '10px', color: L_TEXT_SUBTLE, fontFamily: FONT_BODY }}>Press arrow keys to navigate · Enter to open</p>
            </div>
          </div>
        </MockWindow>
      </div>

      {/* Profile panel — always in DOM to hold container height */}
      <div style={{
        opacity: showProfile ? 1 : 0,
        transition: `opacity ${FADE_DURATION}ms ease`,
        visibility: showProfile ? 'visible' : 'hidden',
        pointerEvents: showProfile ? 'auto' : 'none',
        zIndex: 1,
      }}>
        <MockWindow label="Client — Margaret Chen">
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <p style={{ fontFamily: FONT_DISPLAY, fontSize: '28px', fontWeight: FW_LIGHT, color: L_TEXT, margin: '0 0 4px', lineHeight: 1.1 }}>Margaret Chen</p>
                <p style={{ fontSize: '12px', color: L_TEXT_MUTED, fontFamily: FONT_BODY, fontWeight: FW_LIGHT, margin: 0 }}>margaret.chen@email.com · (415) 882-3301</p>
              </div>
              <span style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, padding: '3px 10px', borderRadius: '999px', background: ACCENT_MUTED, color: ACCENT, fontFamily: FONT_BODY, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Active</span>
            </div>
            <p style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.1em', color: L_TEXT_MUTED, margin: '0 0 8px', fontFamily: FONT_BODY }}>Assigned Advisors</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <span style={{ padding: '4px 12px', background: ACCENT_MUTED, border: `1px solid ${ACCENT_BORDER}`, borderRadius: '8px', fontSize: '12px', color: L_TEXT, fontFamily: FONT_BODY }}>
                T. Shaw <span style={{ fontSize: '10px', color: ACCENT, marginLeft: '4px' }}>Primary</span>
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                ['AUM', '$3.2M'],         ['Asset Level', '$2M – $5M'],
                ['Risk Tolerance', 'Moderate'], ['Tax Bracket', '32%'],
                ['Communication', 'Quarterly'], ['Next Review', '05/10/2026'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#fafaf8', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <span style={{ fontSize: '11px', color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>{label}</span>
                  <span style={{ fontSize: '11px', color: L_TEXT, fontWeight: FW_MEDIUM, fontFamily: FONT_BODY }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </MockWindow>
      </div>

      {/* Replay tile — only shown when done */}
      {status === 'done' && (
        <button
          onClick={replay}
          aria-label="Replay animation"
          style={{
            position: 'absolute', bottom: '12px', right: '12px',
            width: '32px', height: '32px',
            background: 'rgba(255,255,255,0.88)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '8px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
            padding: 0, zIndex: 2,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13 8A5 5 0 1 1 8 3" stroke={PUB_ACCENT} strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M8 1l2.5 2L8 5" stroke={PUB_ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </div>
  );
}