// src/components/public/mockups/AnimatedSearchMockup.js
// Type 'chen', results appear, 2-beat pause, Margaret Chen selected,
// crossfade to a purpose-built client record final frame — same height.
// Uses AnimatedFeatureVisual for consistent scroll trigger and replay.

import { useState, useEffect, useRef } from 'react';
import MockWindow from './MockWindow';
import AnimatedFeatureVisual from './AnimatedFeatureVisual';
import {
  PUB_APP_ACCENT as ACCENT,
  PUB_APP_ACCENT_MUTED as ACCENT_MUTED,
  PUB_TEXT as L_TEXT,
  PUB_TEXT_MUTED as L_TEXT_MUTED,
  PUB_TEXT_SUBTLE as L_TEXT_SUBTLE,
  FONT_BODY,
  FW_LIGHT, FW_MEDIUM, FW_SEMIBOLD,
} from '../../../utils/publicConstants';

const QUERY          = 'chen';
const CHAR_INTERVAL  = 240;
const RESULTS_DELAY  = 600;
const NOTES_DELAY    = 600;
const REGISTER_PAUSE = 1800;
const SELECT_PAUSE   = 500;
const FADE_DURATION  = 400;
const PROFILE_LINGER = 1200;

// Purpose-built client record — designed to match search overlay height exactly.
// Four data rows, no section headers, clean and minimal.
const CLIENT_FIELDS = [
  { label: 'AUM',           value: '$3.2M'     },
  { label: 'Risk Tolerance',value: 'Moderate'  },
  { label: 'Next Review',   value: '05/10/2026'},
  { label: 'Last Meeting',  value: 'Mar 25'    },
];

function SearchContent({ status, onDone }) {
  const [typedChars,       setTypedChars]       = useState(0);
  const [showClients,      setShowClients]       = useState(false);
  const [showNotes,        setShowNotes]         = useState(false);
  const [selectedMargaret, setSelectedMargaret]  = useState(false);
  const [showProfile,      setShowProfile]       = useState(false);
  const timeouts = useRef([]);

  useEffect(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    setTypedChars(0);
    setShowClients(false);
    setShowNotes(false);
    setSelectedMargaret(false);
    setShowProfile(false);

    if (status !== 'playing') return;

    // Phase 1: type
    QUERY.split('').forEach((_, i) => {
      const t = setTimeout(() => setTypedChars(i + 1), (i + 1) * CHAR_INTERVAL);
      timeouts.current.push(t);
    });

    const afterTyping = QUERY.length * CHAR_INTERVAL;

    // Phase 2: results
    const t1 = setTimeout(() => setShowClients(true), afterTyping + RESULTS_DELAY);
    const t2 = setTimeout(() => setShowNotes(true),   afterTyping + RESULTS_DELAY + NOTES_DELAY);
    timeouts.current.push(t1, t2);

    // Phase 3: 2-beat pause, then select
    const selectAt = afterTyping + RESULTS_DELAY + NOTES_DELAY + REGISTER_PAUSE;
    const t3 = setTimeout(() => setSelectedMargaret(true), selectAt);
    timeouts.current.push(t3);

    // Phase 4: crossfade to profile
    const profileAt = selectAt + SELECT_PAUSE;
    const t4 = setTimeout(() => setShowProfile(true), profileAt);
    timeouts.current.push(t4);

    // Done
    const t5 = setTimeout(() => onDone(), profileAt + FADE_DURATION + PROFILE_LINGER);
    timeouts.current.push(t5);

    return () => timeouts.current.forEach(clearTimeout);
  }, [status, onDone]);

  const displayQuery = QUERY.slice(0, typedChars);

  return (
    // Profile panel always in DOM — holds container height from the start.
    // Search sits absolute on top and fades out during crossfade.
    <div style={{ position: 'relative', width: '100%' }}>
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>

      {/* Search panel — absolute so it doesn't affect layout height */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        opacity: showProfile ? 0 : 1,
        transition: `opacity ${FADE_DURATION}ms ease`,
        pointerEvents: showProfile ? 'none' : 'auto',
        zIndex: showProfile ? 0 : 1,
      }}>
        <MockWindow label="Global Search">
          <div>
            {/* Search bar */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="6" stroke={L_TEXT_MUTED} strokeWidth="1.5"/>
                <path d="M13.5 13.5L17 17" stroke={L_TEXT_MUTED} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: '13px', color: L_TEXT, fontFamily: FONT_BODY, minWidth: '40px' }}>
                {displayQuery}
                {status === 'playing' && typedChars < QUERY.length && (
                  <span style={{ borderRight: `1px solid ${L_TEXT}`, marginLeft: '1px', animation: 'blink 0.7s step-end infinite' }}>&nbsp;</span>
                )}
              </span>
              <span style={{ marginLeft: 'auto', fontSize: '10px', color: L_TEXT_SUBTLE, fontFamily: FONT_BODY, border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', padding: '1px 5px' }}>Esc</span>
            </div>

            {/* Clients */}
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

            {/* Notes */}
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

      {/* Profile panel — always rendered, holds height, fades in */}
      <div style={{
        opacity: showProfile ? 1 : 0,
        transition: `opacity ${FADE_DURATION}ms ease`,
        visibility: showProfile ? 'visible' : 'hidden',
        pointerEvents: showProfile ? 'auto' : 'none',
      }}>
        <MockWindow label="Margaret Chen — Client">
          <div>
            {/* Name row */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: FW_MEDIUM, color: L_TEXT, fontFamily: FONT_BODY }}>Margaret Chen</p>
                <p style={{ margin: 0, fontSize: '11px', color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>margaret.chen@email.com</p>
              </div>
              <span style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, padding: '2px 9px', borderRadius: '999px', background: ACCENT_MUTED, color: ACCENT, fontFamily: FONT_BODY, letterSpacing: '0.06em' }}>Active</span>
            </div>

            {/* Key fields — four rows matching search overlay height */}
            {CLIENT_FIELDS.map((f, i) => (
              <div key={f.label} style={{
                padding: '10px 16px',
                borderBottom: i < CLIENT_FIELDS.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: '12px', color: L_TEXT_MUTED, fontFamily: FONT_BODY, fontWeight: FW_LIGHT }}>{f.label}</span>
                <span style={{ fontSize: '12px', color: L_TEXT, fontFamily: FONT_BODY, fontWeight: FW_MEDIUM }}>{f.value}</span>
              </div>
            ))}

            {/* Footer */}
            <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: L_TEXT_SUBTLE, fontFamily: FONT_BODY }}>Press arrow keys to navigate · Enter to open</span>
              <span style={{ fontSize: '10px', color: ACCENT, fontFamily: FONT_BODY, fontWeight: FW_MEDIUM }}>Open profile →</span>
            </div>
          </div>
        </MockWindow>
      </div>
    </div>
  );
}

export default function AnimatedSearchMockup() {
  const [playKey, setPlayKey] = useState(0);
  return (
    <>
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
      <AnimatedFeatureVisual onPlay={() => setPlayKey(k => k + 1)}>
        {({ status, onDone }) => (
          <SearchContent key={playKey} status={status} onDone={onDone} />
        )}
      </AnimatedFeatureVisual>
    </>
  );
}