// src/components/public/mockups/AnimatedDailyBriefMockup.js
// Meeting cards and task rows appear staggered, as if populating.

import { useState, useEffect, useRef } from 'react';
import MockWindow from './MockWindow';
import AnimatedFeatureVisual from './AnimatedFeatureVisual';
import {
  PUB_APP_ACCENT as ACCENT,
  PUB_APP_ACCENT_MUTED as ACCENT_MUTED,
  PUB_COLOR_ERROR as COLOR_ERROR,
  PUB_TEXT as L_TEXT,
  PUB_TEXT_MUTED as L_TEXT_MUTED,
  FONT_DISPLAY, FONT_BODY,
  FW_LIGHT, FW_MEDIUM, FW_SEMIBOLD,
} from '../../../utils/publicConstants';

const MEETINGS = [
  { time: '9:00 AM', name: 'Margaret Chen', type: 'Annual Review', duration: '60 min' },
  { time: '11:30 AM', name: 'Robert Sullivan', type: 'Portfolio Review', duration: '45 min' },
  { time: '2:00 PM', name: 'Priya Patel', type: 'Quarterly Check-in', duration: '30 min' },
];

const TASKS = [
  { client: 'James Kowalski', task: 'Send estate planning summary' },
  { client: 'Catherine Liu', task: 'Follow up on rebalance proposal' },
];

function BriefContent({ status, onDone }) {
  const [visibleMeetings, setVisibleMeetings] = useState(0);
  const [visibleTasks, setVisibleTasks] = useState(0);
  const timeouts = useRef([]);

  useEffect(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    setVisibleMeetings(0);
    setVisibleTasks(0);

    if (status !== 'playing') return;

    // Stagger meeting cards
    MEETINGS.forEach((_, i) => {
      const t = setTimeout(() => setVisibleMeetings(i + 1), 600 + i * 500);
      timeouts.current.push(t);
    });

    // Tasks after meetings
    const taskStart = 600 + MEETINGS.length * 500 + 400;
    TASKS.forEach((_, i) => {
      const t = setTimeout(() => setVisibleTasks(i + 1), taskStart + i * 500);
      timeouts.current.push(t);
    });

    // Done
    const t = setTimeout(() => onDone(), taskStart + TASKS.length * 500 + 600);
    timeouts.current.push(t);

    return () => timeouts.current.forEach(clearTimeout);
  }, [status, onDone]);

  return (
    <MockWindow label="Daily Brief — Tuesday, March 25">
      <div style={{ padding: '20px 24px' }}>
        <p style={{ fontFamily: FONT_DISPLAY, fontSize: '22px', fontWeight: FW_LIGHT, color: L_TEXT, margin: '0 0 4px' }}>Good morning.</p>
        <p style={{ fontFamily: FONT_BODY, fontSize: '12px', fontWeight: FW_LIGHT, color: L_TEXT_MUTED, margin: '0 0 20px' }}>3 meetings today · 2 tasks overdue · 4 clients due for review</p>

        <p style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.1em', color: L_TEXT_MUTED, margin: '0 0 10px', fontFamily: FONT_BODY }}>Today's Schedule</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {MEETINGS.map((m, i) => (
            <div key={m.name} style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
              background: '#fafaf8', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '8px',
              opacity: i < visibleMeetings ? 1 : 0,
              transform: i < visibleMeetings ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.3s ease, transform 0.3s ease',
            }}>
              <span style={{ fontSize: '11px', fontWeight: FW_MEDIUM, color: L_TEXT_MUTED, fontFamily: FONT_BODY, minWidth: '62px' }}>{m.time}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: FW_MEDIUM, color: L_TEXT, fontFamily: FONT_BODY }}>{m.name}</p>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: FW_LIGHT, color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>{m.type} · {m.duration}</p>
              </div>
              <span style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, padding: '2px 8px', borderRadius: '999px', background: ACCENT_MUTED, color: ACCENT, fontFamily: FONT_BODY }}>Prep brief</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, textTransform: 'uppercase', letterSpacing: '0.1em', color: L_TEXT_MUTED, margin: '0 0 10px', fontFamily: FONT_BODY }}>Overdue Tasks</p>
        {TASKS.map((t, i) => (
          <div key={t.task} style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', marginBottom: '6px',
            background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: '8px',
            opacity: i < visibleTasks ? 1 : 0,
            transform: i < visibleTasks ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: COLOR_ERROR, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: FW_MEDIUM, color: L_TEXT, fontFamily: FONT_BODY }}>{t.task}</p>
              <p style={{ margin: 0, fontSize: '11px', color: L_TEXT_MUTED, fontFamily: FONT_BODY }}>{t.client}</p>
            </div>
          </div>
        ))}
      </div>
    </MockWindow>
  );
}

export default function AnimatedDailyBriefMockup() {
  const [playKey, setPlayKey] = useState(0);
  return (
    <AnimatedFeatureVisual onPlay={() => setPlayKey(k => k + 1)}>
      {({ status, onDone }) => (
        <BriefContent key={playKey} status={status} onDone={onDone} />
      )}
    </AnimatedFeatureVisual>
  );
}