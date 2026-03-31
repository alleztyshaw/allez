// src/components/public/mockups/AnimatedPipelineMockup.js
// Responsive: horizontal pipeline on desktop, vertical on mobile.
// Full onboarding journey at 3x speed ending on Active in emerald.

import { useState, useEffect, useRef } from 'react';
import AnimatedFeatureVisual from './AnimatedFeatureVisual';
import {
  PUB_APP_ACCENT as ACCENT,
  PUB_APP_ACCENT_MUTED as ACCENT_MUTED,
  PUB_APP_ACCENT_BORDER as ACCENT_BORDER,
  PUB_TIER_STARTER as EMERALD,
  PUB_TEXT as L_TEXT,
  PUB_TEXT_MUTED as L_TEXT_MUTED,
  FONT_BODY,
  FW_LIGHT, FW_REGULAR, FW_MEDIUM, FW_SEMIBOLD,
  MOBILE_BREAKPOINT,
} from '../../../utils/publicConstants';
import useWindowWidth from '../../../hooks/useWindowWidth';

const STAGES = ['Lead', 'Proposal', 'Agreement', 'Onboarding', 'Active'];

const ONBOARDING_STEPS = [
  'Send welcome email',
  'Collect signed agreement',
  'Complete KYC documentation',
  'Fund account transfer',
];

const STAGE_INTERVAL  = 900;
const STAGE_PAUSE     = 1200;
const STEP_INTERVAL   = 1000;
const ACTIVE_DELAY    = 800;
const CARD_DELAY      = 600;
const DONE_DELAY      = 900;

function CheckIcon({ checked }) {
  return (
    <div style={{
      width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
      border: `1.5px solid ${checked ? ACCENT : 'rgba(0,0,0,0.18)'}`,
      background: checked ? `${ACCENT}18` : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.4s ease',
    }}>
      {checked && (
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
          <path d="M1.5 4.5l2 2L7.5 2" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );
}

function PipelineContent({ status, onDone, isMobile }) {
  const [activeStage,    setActiveStage]    = useState(-1);
  const [litUpTo,        setLitUpTo]        = useState(-1);
  const [checkedSteps,   setCheckedSteps]   = useState(0);
  const [showSteps,      setShowSteps]      = useState(false);
  const [showActiveCard, setShowActiveCard] = useState(false);
  const timeouts = useRef([]);

  useEffect(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    setActiveStage(-1);
    setLitUpTo(-1);
    setCheckedSteps(0);
    setShowSteps(false);
    setShowActiveCard(false);

    if (status !== 'playing') return;

    STAGES.slice(0, 4).forEach((_, i) => {
      const t = setTimeout(() => {
        setLitUpTo(i);
        setActiveStage(i);
      }, i * STAGE_INTERVAL);
      timeouts.current.push(t);
    });

    const stepsStart = 3 * STAGE_INTERVAL + STAGE_PAUSE;
    const t1 = setTimeout(() => setShowSteps(true), stepsStart);
    timeouts.current.push(t1);

    ONBOARDING_STEPS.forEach((_, i) => {
      const t = setTimeout(
        () => setCheckedSteps(i + 1),
        stepsStart + STEP_INTERVAL + i * STEP_INTERVAL
      );
      timeouts.current.push(t);
    });

    const activeStart = stepsStart + STEP_INTERVAL + ONBOARDING_STEPS.length * STEP_INTERVAL + ACTIVE_DELAY;
    const t2 = setTimeout(() => { setActiveStage(4); setLitUpTo(4); }, activeStart);
    timeouts.current.push(t2);

    const t3 = setTimeout(() => setShowActiveCard(true), activeStart + CARD_DELAY);
    timeouts.current.push(t3);

    const t4 = setTimeout(() => onDone(), activeStart + CARD_DELAY + DONE_DELAY);
    timeouts.current.push(t4);

    return () => timeouts.current.forEach(clearTimeout);
  }, [status, onDone]);

  const isActive = activeStage === 4;

  // ── Stage rendering helpers ───────────────────────────────────────────────

  function stageStyles(i) {
    const isCurrentActive = i === activeStage;
    const isFilled = i <= litUpTo && !isCurrentActive;
    return {
      label: STAGES[i],
      bg: isCurrentActive ? (i === 4 ? EMERALD : ACCENT) : isFilled ? ACCENT_MUTED : '#f5f5f3',
      color: isCurrentActive ? '#fff' : isFilled ? ACCENT : L_TEXT_MUTED,
      border: isCurrentActive
        ? (i === 4 ? `${EMERALD}60` : ACCENT_BORDER)
        : isFilled ? ACCENT_BORDER : 'rgba(0,0,0,0.07)',
      fontWeight: (isCurrentActive || isFilled) ? FW_SEMIBOLD : FW_REGULAR,
      glow: isCurrentActive && i === 4 ? `0 0 12px ${EMERALD}40` : 'none',
      connectorBg: i < litUpTo ? ACCENT : 'rgba(0,0,0,0.1)',
    };
  }

  // ── Horizontal pipeline (desktop) ────────────────────────────────────────

  const horizontalPipeline = (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
      {STAGES.map((_, i) => {
        const st = stageStyles(i);
        return (
          <div key={st.label} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                padding: '7px 4px', borderRadius: '6px', fontSize: '11px',
                fontWeight: st.fontWeight, fontFamily: FONT_BODY, whiteSpace: 'nowrap',
                background: st.bg, color: st.color,
                border: `1px solid ${st.border}`,
                boxShadow: st.glow, transition: 'all 0.5s ease',
              }}>
                {st.label}
              </div>
            </div>
            {i < STAGES.length - 1 && (
              <div style={{ width: '12px', flexShrink: 0, height: '1px', background: st.connectorBg, transition: 'background 0.4s ease' }} />
            )}
          </div>
        );
      })}
    </div>
  );

  // ── Vertical pipeline (mobile) ────────────────────────────────────────────

  const verticalPipeline = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '20px' }}>
      {STAGES.map((_, i) => {
        const st = stageStyles(i);
        return (
          <div key={st.label} style={{ display: 'flex', alignItems: 'stretch', minHeight: '36px' }}>
            {/* Left: connector line + dot */}
            <div style={{ width: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              {/* Top connector */}
              <div style={{ width: '2px', flex: i === 0 ? '0 0 8px' : '1', background: i <= litUpTo && i > 0 ? ACCENT : 'rgba(0,0,0,0.1)', transition: 'background 0.4s ease' }} />
              {/* Dot */}
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                background: i === activeStage ? (i === 4 ? EMERALD : ACCENT) : i <= litUpTo ? ACCENT_MUTED : '#e5e5e2',
                border: `1.5px solid ${i <= litUpTo ? (i === 4 && i === activeStage ? EMERALD : ACCENT) : 'rgba(0,0,0,0.15)'}`,
                transition: 'all 0.5s ease',
              }} />
              {/* Bottom connector */}
              {i < STAGES.length - 1 && (
                <div style={{ width: '2px', flex: 1, background: i < litUpTo ? ACCENT : 'rgba(0,0,0,0.1)', transition: 'background 0.4s ease' }} />
              )}
            </div>
            {/* Right: label */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingLeft: '10px', paddingTop: i === 0 ? '8px' : '0' }}>
              <span style={{
                fontSize: '12px', fontWeight: i === activeStage ? FW_SEMIBOLD : FW_REGULAR,
                fontFamily: FONT_BODY,
                color: i === activeStage ? (i === 4 ? EMERALD : ACCENT) : i <= litUpTo ? ACCENT : L_TEXT_MUTED,
                transition: 'all 0.5s ease',
              }}>
                {STAGES[i]}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{ padding: isMobile ? '20px' : '28px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
      <p style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.1em', color: L_TEXT_MUTED, margin: '0 0 20px', fontFamily: FONT_BODY }}>
        Prospect pipeline
      </p>

      {isMobile ? verticalPipeline : horizontalPipeline}

      {/* Onboarding checklist */}
      <div style={{
        overflow: 'hidden',
        maxHeight: (showSteps && !isActive) ? '220px' : '0px',
        transition: 'max-height 0.5s ease',
        marginBottom: (showSteps && !isActive) ? '16px' : '0',
      }}>
        <p style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.1em', color: L_TEXT_MUTED, margin: '0 0 10px', fontFamily: FONT_BODY }}>
          Onboarding — Rebecca Sterling
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {ONBOARDING_STEPS.map((step, i) => {
            const checked = i < checkedSteps;
            return (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#fafaf8', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '6px' }}>
                <CheckIcon checked={checked} />
                <span style={{ fontSize: '12px', fontWeight: FW_LIGHT, color: checked ? L_TEXT_MUTED : L_TEXT, fontFamily: FONT_BODY, textDecoration: checked ? 'line-through' : 'none', transition: 'all 0.4s ease' }}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active client card */}
      <div style={{
        opacity: showActiveCard ? 1 : 0,
        transform: showActiveCard ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 14px',
          background: `${EMERALD}08`,
          border: `1px solid ${EMERALD}30`,
          borderRadius: '8px',
        }}>
          <div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: FW_MEDIUM, color: L_TEXT, fontFamily: FONT_BODY }}>Rebecca Sterling</p>
            <p style={{ margin: 0, fontSize: '11px', color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>$5M–$10M · Onboarding complete</p>
          </div>
          <span style={{
            fontSize: '10px', padding: '3px 10px', borderRadius: '999px',
            background: `${EMERALD}18`, color: EMERALD,
            fontWeight: FW_SEMIBOLD, fontFamily: FONT_BODY,
            border: `1px solid ${EMERALD}40`,
          }}>
            Active
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AnimatedPipelineMockup() {
  const [playKey, setPlayKey] = useState(0);
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < MOBILE_BREAKPOINT;

  return (
    <AnimatedFeatureVisual onPlay={() => setPlayKey(k => k + 1)}>
      {({ status, onDone }) => (
        <PipelineContent key={playKey} status={status} onDone={onDone} isMobile={isMobile} />
      )}
    </AnimatedFeatureVisual>
  );
}