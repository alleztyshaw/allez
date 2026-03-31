// src/components/public/mockups/AnimatedNotesMockup.js
// Full story: record button → soundwave → processing → note appears → holds.
// Self-contained phases, uses AnimatedFeatureVisual for scroll trigger + replay.

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

// ── Timing constants (ms) ────────────────────────────────────────────────────

const RECORD_BUTTON_DELAY = 600;   // pause before button gets "pressed"
const RECORDING_DURATION  = 2800;  // soundwave runs for this long
const PROCESSING_DURATION = 1200;  // "Processing..." state
const NOTE_HEADER_DELAY   = 400;   // header fades in
const NOTE_SUMMARY_DELAY  = 900;   // summary fades in
const NOTE_ACTION_1_DELAY = 1500;  // first action item
const NOTE_ACTION_2_DELAY = 2100;  // second action item
const NOTE_FLAG_DELAY     = 2800;  // compliance flag
const HOLD_BEFORE_DONE    = 1200;  // hold on completed note before done

// ── Soundwave bars ───────────────────────────────────────────────────────────
// 14 bars with pre-defined height patterns so the animation feels organic

const BAR_HEIGHTS = [0.4, 0.7, 0.5, 0.9, 0.6, 1.0, 0.8, 0.5, 0.9, 0.6, 0.7, 0.4, 0.8, 0.5];

function Soundwave({ active }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '3px', height: '32px',
      opacity: active ? 1 : 0,
      transition: 'opacity 0.3s ease',
    }}>
      <style>{`
        ${BAR_HEIGHTS.map((h, i) => `
          @keyframes bar${i} {
            0%,100% { transform: scaleY(${h * 0.4 + 0.1}); }
            50%      { transform: scaleY(${h}); }
          }
        `).join('')}
      `}</style>
      {BAR_HEIGHTS.map((h, i) => (
        <div key={i} style={{
          width: '3px',
          height: '24px',
          borderRadius: '2px',
          background: '#ef4444',
          transformOrigin: 'center',
          transform: `scaleY(${active ? h : 0.15})`,
          animation: active ? `bar${i} ${0.5 + (i % 4) * 0.12}s ease-in-out infinite` : 'none',
          transition: 'transform 0.3s ease',
        }} />
      ))}
    </div>
  );
}

// ── Warning icon (no emoji) ───────────────────────────────────────────────────

function WarningIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, color: '#fbbf24' }}>
      <path d="M7 2L1.5 11.5h11L7 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <line x1="7" y1="6" x2="7" y2="9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="7" cy="10.5" r="0.6" fill="currentColor"/>
    </svg>
  );
}

// ── Phase enum ────────────────────────────────────────────────────────────────
// idle → ready → recording → processing → note

const PHASE = { IDLE: 'idle', READY: 'ready', RECORDING: 'recording', PROCESSING: 'processing', NOTE: 'note' };

// ── Main content component ────────────────────────────────────────────────────

function NotesContent({ status, onDone }) {
  const [phase,          setPhase]          = useState(PHASE.IDLE);
  const [showHeader,     setShowHeader]      = useState(false);
  const [showSummary,    setShowSummary]     = useState(false);
  const [visibleActions, setVisibleActions]  = useState(0);
  const [showFlag,       setShowFlag]        = useState(false);
  const timeouts = useRef([]);

  useEffect(() => {
    if (status !== 'playing') return;

    // Reset for fresh play
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    setPhase(PHASE.IDLE);
    setShowHeader(false);
    setShowSummary(false);
    setVisibleActions(0);
    setShowFlag(false);

    // Phase 1: show ready state immediately
    setPhase(PHASE.READY);

    // Phase 2: "press" record button
    const t1 = setTimeout(() => setPhase(PHASE.RECORDING), RECORD_BUTTON_DELAY);
    timeouts.current.push(t1);

    // Phase 3: stop recording → processing
    const t2 = setTimeout(() => setPhase(PHASE.PROCESSING), RECORD_BUTTON_DELAY + RECORDING_DURATION);
    timeouts.current.push(t2);

    // Phase 4: switch to note view
    const noteStart = RECORD_BUTTON_DELAY + RECORDING_DURATION + PROCESSING_DURATION;
    const t3 = setTimeout(() => setPhase(PHASE.NOTE), noteStart);
    timeouts.current.push(t3);

    // Note elements appear sequentially
    const t4 = setTimeout(() => setShowHeader(true),        noteStart + NOTE_HEADER_DELAY);
    const t5 = setTimeout(() => setShowSummary(true),       noteStart + NOTE_SUMMARY_DELAY);
    const t6 = setTimeout(() => setVisibleActions(1),       noteStart + NOTE_ACTION_1_DELAY);
    const t7 = setTimeout(() => setVisibleActions(2),       noteStart + NOTE_ACTION_2_DELAY);
    const t8 = setTimeout(() => setShowFlag(true),          noteStart + NOTE_FLAG_DELAY);
    const t9 = setTimeout(() => onDone(),                   noteStart + NOTE_FLAG_DELAY + HOLD_BEFORE_DONE);
    timeouts.current.push(t4, t5, t6, t7, t8, t9);

    return () => timeouts.current.forEach(clearTimeout);
  }, [status, onDone]);

  const isRecording  = phase === PHASE.RECORDING;
  const isProcessing = phase === PHASE.PROCESSING;
  const isNote       = phase === PHASE.NOTE;

  // ── Recording UI ─────────────────────────────────────────────────────────

  const recordingUI = (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      {/* Context */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: FW_MEDIUM, color: L_TEXT, fontFamily: FONT_BODY }}>Annual Review — Margaret Chen</p>
        <p style={{ margin: 0, fontSize: '11px', color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>Mar 25, 2026</p>
      </div>

      {/* Soundwave */}
      <Soundwave active={isRecording} />

      {/* Record / processing button */}
      <button style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 20px', borderRadius: '10px',
        background: isRecording
          ? 'rgba(239,68,68,0.10)'
          : isProcessing
            ? 'rgba(99,102,241,0.10)'
            : ACCENT,
        color: isRecording ? '#ef4444' : isProcessing ? ACCENT : '#fff',
        border: `1px solid ${isRecording ? 'rgba(239,68,68,0.25)' : isProcessing ? 'rgba(99,102,241,0.25)' : 'transparent'}`,
        cursor: 'default',
        fontFamily: FONT_BODY,
        fontSize: '13px',
        fontWeight: FW_SEMIBOLD,
        letterSpacing: '0.02em',
        transition: 'all 0.3s ease',
        minWidth: '160px',
        justifyContent: 'center',
      }}>
        {/* Icon */}
        {isRecording ? (
          /* Stop square */
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="2" y="2" width="8" height="8" rx="1.5" fill="#ef4444"/>
          </svg>
        ) : isProcessing ? (
          /* Spinner circle */
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ animation: 'spin 0.9s linear infinite' }}>
            <circle cx="6.5" cy="6.5" r="5" stroke={ACCENT} strokeWidth="1.5" strokeDasharray="20 12" strokeLinecap="round"/>
          </svg>
        ) : (
          /* Mic icon */
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="4.5" y="1" width="4" height="6" rx="2" stroke="white" strokeWidth="1.3"/>
            <path d="M2 6.5a4.5 4.5 0 009 0" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
            <line x1="6.5" y1="11" x2="6.5" y2="12.5" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        )}
        {isRecording ? 'Recording...' : isProcessing ? 'Processing...' : 'Start Recording'}
      </button>

      {/* Pulse dot when recording */}
      {isRecording && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444',
            animation: 'pulse 1.2s ease-in-out infinite',
          }} />
          <span style={{ fontSize: '11px', color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>Live recording in progress</span>
        </div>
      )}
    </div>
  );

  // ── Note UI ───────────────────────────────────────────────────────────────

  const noteUI = (
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
          {['Prepare rebalancing proposal by April 1', 'Send updated RMD projection for 2026'].map((item, i) => (
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
        opacity: showFlag ? 1 : 0,
        transform: showFlag ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}>
        <WarningIcon />
        <div>
          <p style={{ margin: '0 0 2px', fontSize: '11px', fontWeight: FW_SEMIBOLD, color: COLOR_WARNING, fontFamily: FONT_BODY }}>Compliance flag · Medium</p>
          <p style={{ margin: 0, fontSize: '11px', fontWeight: FW_LIGHT, color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>Performance comparison referenced without full benchmark disclosure.</p>
        </div>
      </div>
    </div>
  );

  return (
    <MockWindow label="AI Note-taker — Margaret Chen · Annual Review">
      <style>{`
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes spin  { to { transform: rotate(360deg); } }
      `}</style>
      {/* Fixed container — note panel always in DOM to hold height.
          Recording panel sits absolute on top and fades out. */}
      <div style={{ position: 'relative' }}>
        {/* Recording panel — absolute, fades out when note appears */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          opacity: isNote ? 0 : 1,
          transition: 'opacity 0.5s ease',
          pointerEvents: isNote ? 'none' : 'auto',
          zIndex: isNote ? 0 : 1,
        }}>
          {recordingUI}
        </div>
        {/* Note panel — always rendered to hold height, fades in */}
        <div style={{
          opacity: isNote ? 1 : 0,
          transition: 'opacity 0.5s ease',
          visibility: isNote ? 'visible' : 'hidden',
          pointerEvents: isNote ? 'auto' : 'none',
          zIndex: 1,
        }}>
          {noteUI}
        </div>
      </div>
    </MockWindow>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

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