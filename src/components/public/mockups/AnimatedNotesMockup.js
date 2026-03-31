// src/components/public/mockups/AnimatedNotesMockup.js
// Three phases: summary appears, then action items one by one, then compliance flag.

import { useState, useEffect, useRef } from 'react';
import MockWindow from './MockWindow';
import AnimatedFeatureVisual from './AnimatedFeatureVisual';
import {
  PUB_APP_ACCENT as ACCENT,
  PUB_COLOR_WARNING as COLOR_WARNING,
  PUB_TEXT as L_TEXT,
  PUB_TEXT_MUTED as L_TEXT_MUTED,
  FONT_BODY,
  FW_LIGHT, FW_MEDIUM, FW_SEMIBOLD,
} from '../../../utils/publicConstants';

const ACTION_ITEMS = [
  'Prepare rebalancing proposal by April 1',
  'Send updated RMD projection for 2026',
];

function NotesContent({ status, onDone }) {
  const [showHeader,     setShowHeader]     = useState(false);
  const [showSummary,    setShowSummary]    = useState(false);
  const [visibleActions, setVisibleActions] = useState(0);
  const [showCompliance, setShowCompliance] = useState(false);
  const timeouts = useRef([]);

  useEffect(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    setShowHeader(false);
    setShowSummary(false);
    setVisibleActions(0);
    setShowCompliance(false);

    if (status !== 'playing') return;

    const t1 = setTimeout(() => setShowHeader(true), 400);
    const t2 = setTimeout(() => setShowSummary(true), 1200);

    ACTION_ITEMS.forEach((_, i) => {
      const t = setTimeout(() => setVisibleActions(i + 1), 2400 + i * 800);
      timeouts.current.push(t);
    });

    const t3 = setTimeout(() => setShowCompliance(true), 2400 + ACTION_ITEMS.length * 800 + 800);
    const t4 = setTimeout(() => onDone(), 2400 + ACTION_ITEMS.length * 800 + 1800);

    timeouts.current.push(t1, t2, t3, t4);
    return () => timeouts.current.forEach(clearTimeout);
  }, [status, onDone]);

  return (
    <MockWindow label="AI Note — Margaret Chen · Annual Review">
      <div style={{ padding: '20px 24px' }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px',
          opacity: showHeader ? 1 : 0, transition: 'opacity 0.4s ease',
        }}>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: FW_MEDIUM, color: L_TEXT, fontFamily: FONT_BODY }}>Annual Review – March 2026</p>
            <p style={{ margin: 0, fontSize: '11px', color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>03/25/2026 · AI Note</p>
          </div>
          <span style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, padding: '2px 9px', borderRadius: '999px', background: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)', fontFamily: FONT_BODY, letterSpacing: '0.06em' }}>AI</span>
        </div>

        {/* Summary */}
        <div style={{ opacity: showSummary ? 1 : 0, transition: 'opacity 0.5s ease', marginBottom: '16px' }}>
          <p style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.1em', color: ACCENT, margin: '0 0 8px', fontFamily: FONT_BODY }}>Summary</p>
          <p style={{ fontSize: '12px', fontWeight: FW_LIGHT, lineHeight: 1.65, color: L_TEXT, margin: 0, fontFamily: FONT_BODY }}>
            Reviewed full portfolio allocation. Client pleased with bond ladder performance. Discussed rebalancing equities from 58% to 55% given approaching retirement horizon.
          </p>
        </div>

        {/* Action items */}
        <div style={{ marginBottom: '16px' }}>
          <p style={{
            fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.1em',
            color: ACCENT, margin: '0 0 8px', fontFamily: FONT_BODY,
            opacity: visibleActions > 0 ? 1 : 0, transition: 'opacity 0.3s ease',
          }}>Action Items</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {ACTION_ITEMS.map((item, i) => (
              <div key={item} style={{
                display: 'flex', gap: '8px', alignItems: 'flex-start',
                opacity: i < visibleActions ? 1 : 0,
                transform: i < visibleActions ? 'translateY(0)' : 'translateY(6px)',
                transition: 'opacity 0.35s ease, transform 0.35s ease',
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: ACCENT, flexShrink: 0, marginTop: '5px' }} />
                <span style={{ fontSize: '12px', fontWeight: FW_LIGHT, color: L_TEXT, fontFamily: FONT_BODY }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance flag */}
        <div style={{
          display: 'flex', gap: '8px', padding: '10px 12px',
          background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '8px', alignItems: 'flex-start',
          opacity: showCompliance ? 1 : 0,
          transform: showCompliance ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
        }}>
          <span style={{ color: '#fbbf24', display: 'flex', flexShrink: 0 }}><svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
              <path d="M7 2L1.5 11.5h11L7 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              <line x1="7" y1="6" x2="7" y2="9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <circle cx="7" cy="10.5" r="0.6" fill="currentColor"/>
            </svg></span>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: '11px', fontWeight: FW_SEMIBOLD, color: COLOR_WARNING, fontFamily: FONT_BODY }}>Compliance flag · Medium</p>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: FW_LIGHT, color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>Performance comparison referenced without full benchmark disclosure.</p>
          </div>
        </div>
      </div>
    </MockWindow>
  );
}

export default function AnimatedNotesMockup() {
  const [playKey, setPlayKey] = useState(0);
  return (
    <AnimatedFeatureVisual onPlay={() => setPlayKey(k => k + 1)}>
      {({ status, onDone }) => (
        <NotesContent key={playKey} status={status} onDone={onDone} />
      )}
    </AnimatedFeatureVisual>
  );
}