// src/components/public/mockups/AnimatedPipelineMockup.js
// Full pipeline journey: stages light up one by one, then onboarding
// steps appear (send welcome email, complete KYC, etc.), then the
// prospect card transitions to Active highlighted in emerald.
// Timing is 3x slower than base to give viewers time to absorb each step.

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
} from '../../../utils/publicConstants';

const STAGES = ['Lead', 'Proposal', 'Agreement', 'Onboarding', 'Active'];

// Onboarding checklist steps
const ONBOARDING_STEPS = [
  'Send welcome email',
  'Collect signed agreement',
  'Complete KYC documentation',
  'Fund account transfer',
];

// Timing constants (ms) — 3x slower than base
const STAGE_INTERVAL  = 900;   // time between each stage lighting up
const STAGE_PAUSE     = 1200;  // pause after all stages lit before onboarding steps appear
const STEP_INTERVAL   = 1000;  // time between each onboarding step checking off
const ACTIVE_DELAY    = 800;   // pause after all steps before transitioning to Active
const CARD_DELAY      = 600;   // delay before active card appears
const DONE_DELAY      = 900;   // delay after active card before marking done

function CheckIcon({ checked, color }) {
  return (
    <div style={{
      width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
      border: `1.5px solid ${checked ? color : 'rgba(0,0,0,0.18)'}`,
      background: checked ? `${color}18` : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.4s ease',
    }}>
      {checked && (
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
          <path d="M1.5 4.5l2 2L7.5 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );
}

function PipelineContent({ status, onDone }) {
  const [activeStage,    setActiveStage]    = useState(-1);  // which stage is highlighted
  const [litUpTo,        setLitUpTo]        = useState(-1);  // how many stages are filled
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

    // Phase 1: light up stages Lead → Onboarding one by one
    STAGES.slice(0, 4).forEach((_, i) => {
      const t = setTimeout(() => {
        setLitUpTo(i);
        setActiveStage(i);
      }, i * STAGE_INTERVAL);
      timeouts.current.push(t);
    });

    // Phase 2: show onboarding checklist
    const stepsStart = 3 * STAGE_INTERVAL + STAGE_PAUSE;
    const t1 = setTimeout(() => setShowSteps(true), stepsStart);
    timeouts.current.push(t1);

    // Phase 3: check off each onboarding step
    ONBOARDING_STEPS.forEach((_, i) => {
      const t = setTimeout(
        () => setCheckedSteps(i + 1),
        stepsStart + STEP_INTERVAL + i * STEP_INTERVAL
      );
      timeouts.current.push(t);
    });

    // Phase 4: transition to Active — highlight stage 4 in emerald
    const activeStart = stepsStart + STEP_INTERVAL + ONBOARDING_STEPS.length * STEP_INTERVAL + ACTIVE_DELAY;
    const t2 = setTimeout(() => {
      setActiveStage(4);
      setLitUpTo(4);
    }, activeStart);
    timeouts.current.push(t2);

    // Phase 5: show active client card
    const t3 = setTimeout(() => setShowActiveCard(true), activeStart + CARD_DELAY);
    timeouts.current.push(t3);

    // Done
    const t4 = setTimeout(() => onDone(), activeStart + CARD_DELAY + DONE_DELAY);
    timeouts.current.push(t4);

    return () => timeouts.current.forEach(clearTimeout);
  }, [status, onDone]);

  const isOnboarding = activeStage === 3;
  const isActive     = activeStage === 4;

  return (
    <div style={{ padding: '28px', background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
      <p style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.1em', color: L_TEXT_MUTED, margin: '0 0 20px', fontFamily: FONT_BODY }}>
        Prospect pipeline
      </p>

      {/* Pipeline stages */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        {STAGES.map((stage, i) => {
          const isCurrentActive = i === activeStage;
          const isFilled = i <= litUpTo && !isCurrentActive;
          const color = isCurrentActive && i === 4 ? EMERALD : ACCENT;
          const borderColor = isCurrentActive && i === 4 ? `${EMERALD}60` : ACCENT_BORDER;
          const bgColor = isCurrentActive
            ? (i === 4 ? EMERALD : ACCENT)
            : isFilled ? ACCENT_MUTED : '#f5f5f3';
          const textColor = isCurrentActive
            ? '#fff'
            : isFilled ? ACCENT : L_TEXT_MUTED;

          return (
            <div key={stage} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  padding: '7px 4px', borderRadius: '6px', fontSize: '11px',
                  fontWeight: (isCurrentActive || isFilled) ? FW_SEMIBOLD : FW_REGULAR,
                  fontFamily: FONT_BODY, whiteSpace: 'nowrap',
                  background: bgColor,
                  color: textColor,
                  border: `1px solid ${isCurrentActive ? borderColor : isFilled ? ACCENT_BORDER : 'rgba(0,0,0,0.07)'}`,
                  transition: 'all 0.5s ease',
                  boxShadow: isCurrentActive && i === 4 ? `0 0 12px ${EMERALD}40` : 'none',
                }}>
                  {stage}
                </div>
              </div>
              {i < STAGES.length - 1 && (
                <div style={{
                  width: '12px', flexShrink: 0, height: '1px',
                  background: i < litUpTo ? ACCENT : 'rgba(0,0,0,0.1)',
                  transition: 'background 0.4s ease',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Onboarding checklist — shown during onboarding phase */}
      <div style={{
        overflow: 'hidden', maxHeight: (showSteps && !isActive) ? '200px' : '0px',
        transition: 'max-height 0.5s ease',
        marginBottom: (showSteps && !isActive) ? '16px' : '0',
      }}>
        <p style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.1em', color: L_TEXT_MUTED, margin: '0 0 10px', fontFamily: FONT_BODY }}>
          Onboarding checklist — Rebecca Sterling
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {ONBOARDING_STEPS.map((step, i) => {
            const checked = i < checkedSteps;
            return (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#fafaf8', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '6px' }}>
                <CheckIcon checked={checked} color={ACCENT} />
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
  return (
    <AnimatedFeatureVisual onPlay={() => setPlayKey(k => k + 1)}>
      {({ status, onDone }) => (
        <PipelineContent key={playKey} status={status} onDone={onDone} />
      )}
    </AnimatedFeatureVisual>
  );
}