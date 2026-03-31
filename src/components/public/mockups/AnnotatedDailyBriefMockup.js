// src/components/public/mockups/AnnotatedDailyBriefMockup.js
// Interactive annotated Daily Brief. Dots are rendered inline with
// the elements they annotate — no absolute positioning guesswork.

import { useState, useRef, useEffect } from 'react';
import MockWindow from './MockWindow';
import {
  PUB_APP_ACCENT as ACCENT,
  PUB_APP_ACCENT_MUTED as ACCENT_MUTED,
  PUB_ACCENT,
  PUB_TIER_STARTER as EMERALD,
  PUB_TEXT as L_TEXT,
  PUB_TEXT_MUTED as L_TEXT_MUTED,
  FONT_DISPLAY, FONT_BODY,
  FW_LIGHT, FW_MEDIUM, FW_SEMIBOLD,
  MOBILE_BREAKPOINT,
} from '../../../utils/publicConstants';
import useWindowWidth from '../../../hooks/useWindowWidth';

// ── Dot data ──────────────────────────────────────────────────────────────────

const DOT_DATA = {
  snapshot: {
    label: 'Your day at a glance',
    copy: 'See everything that needs your attention before you open a single client record. Meetings, overdue tasks, and clients due for a touchpoint — all counted and ready.',
  },
  schedule: {
    label: "Today's schedule",
    copy: 'Your calendar lives alongside your client data — not in a separate tool. Meeting type, duration, and client context in one view.',
  },
  prep: {
    label: 'Walk in prepared',
    copy: 'Every meeting surfaces the client context you need before you say hello. One tap pulls up their history, open tasks, and last note.',
  },
  tasks: {
    label: 'Nothing slips',
    copy: 'Tasks from across your entire book surface here automatically, organized by urgency. Anything overdue or due today is front and center.',
  },
};

// ── Inline dot ────────────────────────────────────────────────────────────────
//
// The `dotRef` prop lets the parent store a reference to this button element.
// We need that reference later to measure where on screen the button lives
// so we can anchor the mobile callout right below it.

function Dot({ id, activeDot, onDotClick, dotRef }) {
  const isActive = activeDot === id;
  const color = isActive ? EMERALD : 'rgba(99,102,241,0.55)';
  return (
    <button
      ref={dotRef}
      onClick={e => { e.stopPropagation(); onDotClick(id); }}
      aria-label={DOT_DATA[id].label}
      style={{
        flexShrink: 0,
        width: '27px', height: '27px',
        background: 'none', border: 'none',
        cursor: 'pointer', padding: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}
    >
      {!isActive && (
        <span style={{
          position: 'absolute',
          width: '27px', height: '27px', borderRadius: '50%',
          background: 'rgba(99,102,241,0.18)',
          animation: 'dotPulse 2s ease-out infinite',
          pointerEvents: 'none',
        }} />
      )}
      <span style={{
        width: '15px', height: '15px', borderRadius: '50%',
        background: color,
        border: '2px solid white',
        boxShadow: `0 0 0 1px ${color}`,
        transition: 'background 0.2s ease, box-shadow 0.2s ease',
        display: 'block', position: 'relative', zIndex: 1,
      }} />
    </button>
  );
}

// ── Desktop callout ───────────────────────────────────────────────────────────
// Rendered inside the MockWindow content area as an absolutely-positioned box.
// top/left/right values were manually tuned to float toward the center of the mockup.

const CALLOUT_STYLE = {
  snapshot: { top: '40px',  right: '80px'  },
  schedule: { top: '100px', left:  '190px' },
  prep:     { top: '155px', right: '160px' },
  tasks:    { top: '350px', left:  '160px' },
};

function DesktopCallout({ id, onClose }) {
  const dot = DOT_DATA[id];
  const style = CALLOUT_STYLE[id];
  return (
    <div style={{
      position: 'absolute',
      ...style,
      width: '220px',
      background: 'rgba(255,255,255,0.75)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(0,0,0,0.09)',
      borderRadius: '10px',
      padding: '14px 16px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.09)',
      zIndex: 30,
      animation: 'calloutIn 0.18s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: FW_SEMIBOLD, color: PUB_ACCENT, fontFamily: FONT_BODY }}>{dot.label}</p>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, color: L_TEXT_MUTED, fontSize: '16px', flexShrink: 0 }}>×</button>
      </div>
      <p style={{ margin: 0, fontSize: '12px', fontWeight: FW_LIGHT, lineHeight: 1.7, color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>{dot.copy}</p>
    </div>
  );
}

// ── Mobile callout ────────────────────────────────────────────────────────────
//
// Rendered with `position: fixed` so it escapes the MockWindow's scroll/overflow
// context and lands exactly on screen. We receive the viewport coordinates of the
// tapped dot (top + center-x) and place the callout 8px below it, clamping
// horizontally so it never bleeds off the screen edge.

function MobileCallout({ id, anchorRect, onClose }) {
  const dot = DOT_DATA[id];

  // anchorRect is the getBoundingClientRect() result of the dot button.
  // We want the callout to start 8px below the bottom of the dot,
  // horizontally centered on the dot's center point.
  const top  = anchorRect.bottom + 8;
  const left = anchorRect.left + anchorRect.width / 2;

  // The callout is 260px wide. We shift it left by half (130px) to center it
  // on the dot, then clamp so it stays at least 16px from either screen edge.
  const CALLOUT_WIDTH = 260;
  const EDGE_MARGIN   = 16;
  const clampedLeft = Math.min(
    Math.max(left - CALLOUT_WIDTH / 2, EDGE_MARGIN),
    window.innerWidth - CALLOUT_WIDTH - EDGE_MARGIN
  );

  return (
    <div style={{
      position: 'fixed',
      top,
      left: clampedLeft,
      width: `${CALLOUT_WIDTH}px`,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(0,0,0,0.09)',
      borderRadius: '10px',
      padding: '14px 16px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
      zIndex: 9999,
      animation: 'calloutIn 0.18s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: FW_SEMIBOLD, color: PUB_ACCENT, fontFamily: FONT_BODY }}>{dot.label}</p>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, color: L_TEXT_MUTED, fontSize: '16px', flexShrink: 0 }}>×</button>
      </div>
      <p style={{ margin: 0, fontSize: '12px', fontWeight: FW_LIGHT, lineHeight: 1.7, color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>{dot.copy}</p>
    </div>
  );
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const MEETINGS = [
  { time: '9:00 AM',  name: 'Margaret Chen',  type: 'Annual Review',      duration: '60 min' },
  { time: '11:30 AM', name: 'Robert Sullivan', type: 'Portfolio Review',   duration: '45 min' },
  { time: '2:00 PM',  name: 'Priya Patel',     type: 'Quarterly Check-in', duration: '30 min' },
];

const TASKS = [
  { client: 'James Kowalski', task: 'Send estate planning summary' },
  { client: 'Catherine Liu',  task: 'Follow up on rebalance proposal' },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function AnnotatedDailyBriefMockup() {
  const [activeDot, setActiveDot]       = useState(null);
  // anchorRect stores the bounding box of the last tapped dot so MobileCallout
  // knows where to render itself on screen.
  const [anchorRect, setAnchorRect]     = useState(null);

  // dotRefs is a plain object (not state) that maps each dot id → its DOM node.
  // useRef wraps it so the value persists across renders without triggering re-renders.
  const dotRefs = useRef({});

  const windowWidth = useWindowWidth();
  const isMobile    = windowWidth < MOBILE_BREAKPOINT;

  function handleDotClick(id) {
    if (activeDot === id) {
      // Tapping the same dot a second time dismisses the callout.
      setActiveDot(null);
      setAnchorRect(null);
      return;
    }
    setActiveDot(id);
    // Read the dot button's position in the viewport at the moment of the tap.
    // getBoundingClientRect() returns { top, bottom, left, right, width, height }
    // relative to the visible screen — perfect for fixed positioning.
    if (dotRefs.current[id]) {
      setAnchorRect(dotRefs.current[id].getBoundingClientRect());
    }
  }

  // Dismiss the callout when the user scrolls — otherwise the fixed callout
  // drifts away from its dot as the page moves.
  useEffect(() => {
    if (!isMobile || !activeDot) return;
    const dismiss = () => { setActiveDot(null); setAnchorRect(null); };
    window.addEventListener('scroll', dismiss, { passive: true });
    return () => window.removeEventListener('scroll', dismiss);
  }, [isMobile, activeDot]);

  function dismissCallout() {
    setActiveDot(null);
    setAnchorRect(null);
  }

  return (
    <div>
      <style>{`
        @keyframes dotPulse {
          0%   { transform: scale(1);   opacity: 0.8; }
          70%  { transform: scale(2.2); opacity: 0;   }
          100% { transform: scale(2.2); opacity: 0;   }
        }
        @keyframes calloutIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Mobile callout — rendered fixed to the viewport, anchored to the tapped dot */}
      {isMobile && activeDot && anchorRect && (
        <MobileCallout id={activeDot} anchorRect={anchorRect} onClose={dismissCallout} />
      )}

      {/* Outer wrapper */}
      <div style={{ position: 'relative' }}>
        <MockWindow label="Daily Brief — Tuesday, March 25">
          <div style={{ padding: '20px 24px', position: 'relative' }}>

            {/* Desktop callout — inside content area, floats toward center */}
            {!isMobile && activeDot && (
              <DesktopCallout id={activeDot} onClose={dismissCallout} />
            )}

            {/* Greeting */}
            <p style={{ fontFamily: FONT_DISPLAY, fontSize: '22px', fontWeight: FW_LIGHT, color: L_TEXT, margin: '0 0 4px' }}>
              Good morning.
            </p>

            {/* Summary line + snapshot dot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '0 0 20px' }}>
              <p style={{ fontFamily: FONT_BODY, fontSize: '12px', fontWeight: FW_LIGHT, color: L_TEXT_MUTED, margin: 0 }}>
                3 meetings today · 2 tasks due today · 4 clients due for review
              </p>
              <Dot id="snapshot" activeDot={activeDot} onDotClick={handleDotClick}
                dotRef={el => { dotRefs.current['snapshot'] = el; }} />
            </div>

            {/* TODAY'S SCHEDULE label + schedule dot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 10px' }}>
              <p style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.1em', color: L_TEXT_MUTED, margin: 0, fontFamily: FONT_BODY }}>
                Today's Schedule
              </p>
              <Dot id="schedule" activeDot={activeDot} onDotClick={handleDotClick}
                dotRef={el => { dotRefs.current['schedule'] = el; }} />
            </div>

            {/* Meeting cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {MEETINGS.map((m, i) => (
                <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: '#fafaf8', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: FW_MEDIUM, color: L_TEXT_MUTED, fontFamily: FONT_BODY, minWidth: '62px' }}>{m.time}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: FW_MEDIUM, color: L_TEXT, fontFamily: FONT_BODY }}>{m.name}</p>
                    <p style={{ margin: 0, fontSize: '11px', fontWeight: FW_LIGHT, color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>{m.type} · {m.duration}</p>
                  </div>

                  {/*
                    ── RIGHT-END GROUP ──────────────────────────────────────────
                    The dot and the "Prep brief" pill are wrapped together in a
                    single flex container. Every row renders this same container,
                    so the pill is always flush-right and the columns stay aligned.

                    Row 0 (first meeting): show the annotation dot, then the pill.
                    Rows 1+               : show an invisible 27px spacer where the
                                           dot would be, then the pill — keeping the
                                           pill in exactly the same horizontal slot.
                  */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    {i === 0
                      ? <Dot id="prep" activeDot={activeDot} onDotClick={handleDotClick}
                          dotRef={el => { dotRefs.current['prep'] = el; }} />
                      : <span style={{ width: '27px', flexShrink: 0 }} />
                    }
                    <span style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, padding: '2px 8px', borderRadius: '999px', background: ACCENT_MUTED, color: ACCENT, fontFamily: FONT_BODY, flexShrink: 0 }}>Prep brief</span>
                  </div>

                </div>
              ))}
            </div>

            {/* DUE TODAY label + tasks dot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 10px' }}>
              <p style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.1em', color: L_TEXT_MUTED, margin: 0, fontFamily: FONT_BODY }}>
                Due Today
              </p>
              <Dot id="tasks" activeDot={activeDot} onDotClick={handleDotClick}
                dotRef={el => { dotRefs.current['tasks'] = el; }} />
            </div>

            {/* Task rows */}
            {TASKS.map(t => (
              <div key={t.task} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', marginBottom: '6px', background: '#fafaf8', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '8px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ACCENT, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: FW_MEDIUM, color: L_TEXT, fontFamily: FONT_BODY }}>{t.task}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>{t.client}</p>
                </div>
              </div>
            ))}

          </div>
        </MockWindow>
      </div>
    </div>
  );
}