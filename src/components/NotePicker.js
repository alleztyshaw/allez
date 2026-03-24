// src/components/NotePicker.js
// Modal for linking an existing note to a meeting.
// Notes are sorted by proximity to the meeting date — closest first.
//
// Props:
//   isOpen       — bool
//   onClose      — fn()
//   onSelect     — fn(noteId) — called with the selected note's id
//   notes        — array of note objects for this client
//   meetingDate  — ISO string of the meeting's scheduled_at

import { useState } from 'react';
import { useTokens } from '../context/ThemeContext';
import {
  FONT_BODY, FONT_DISPLAY,
  RADIUS_LG, RADIUS_MD, RADIUS_PILL,
  SHADOW_LG, OVERLAY_BG,
  FW_LIGHT, FW_REGULAR, FW_MEDIUM, FW_SEMIBOLD,
} from '../utils/hqConstants';

function formatDate(isoStr) {
  return new Date(isoStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function daysBetween(a, b) {
  return Math.abs(Math.round((new Date(a) - new Date(b)) / 86400000));
}

export default function NotePicker({ isOpen, onClose, onSelect, notes = [], meetingDate }) {
  const t = useTokens();
  const [hoveredId, setHoveredId] = useState(null);

  if (!isOpen) return null;

  const sorted = [...notes].sort((a, b) => {
    if (!meetingDate) return 0;
    return daysBetween(a.created_at, meetingDate) - daysBetween(b.created_at, meetingDate);
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, background: OVERLAY_BG,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      zIndex: 1100, padding: '60px 20px 20px',
    }}>
      <div style={{
        background: t.SURFACE, border: `1px solid ${t.BORDER}`,
        borderRadius: RADIUS_LG, width: '100%', maxWidth: '520px',
        maxHeight: '75vh', display: 'flex', flexDirection: 'column',
        boxShadow: SHADOW_LG,
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${t.BORDER}`, flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: '22px', fontWeight: FW_REGULAR, color: t.TEXT, letterSpacing: '0.01em' }}>
            Link a note to this meeting
          </h2>
          <button style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: t.TEXT_MUTED, padding: '4px 8px' }} onClick={onClose}>✕</button>
        </div>

        {/* Note list */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {sorted.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: t.TEXT_MUTED, fontSize: '14px', fontWeight: FW_LIGHT, fontFamily: FONT_BODY }}>
              No notes recorded for this client yet.
            </div>
          ) : sorted.map((note, i) => {
            const isLast    = i === sorted.length - 1;
            const isHovered = hoveredId === note.id;
            const daysAway  = meetingDate ? daysBetween(note.created_at, meetingDate) : null;
            return (
              <div
                key={note.id}
                onClick={() => onSelect(note.id)}
                onMouseEnter={() => setHoveredId(note.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  padding: '14px 24px',
                  borderBottom: isLast ? 'none' : `1px solid ${t.BORDER}`,
                  background: isHovered ? t.SURFACE_ALT : t.SURFACE,
                  cursor: 'pointer', transition: 'background 0.1s',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: FW_REGULAR, color: t.TEXT, fontFamily: FONT_DISPLAY, letterSpacing: '0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {note.title}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: t.TEXT_MUTED, fontWeight: FW_LIGHT, fontFamily: FONT_BODY }}>
                    {formatDate(note.created_at)}
                    {daysAway !== null && (
                      <span style={{ marginLeft: '8px', color: daysAway <= 3 ? t.ACCENT : t.TEXT_SUBTLE }}>
                        · {daysAway === 0 ? 'Same day' : `${daysAway} day${daysAway === 1 ? '' : 's'} away`}
                      </span>
                    )}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  {note.note_type && (
                    <span style={{ fontSize: '10px', fontWeight: FW_SEMIBOLD, padding: '2px 8px', borderRadius: RADIUS_PILL, background: t.ACCENT_MUTED, color: t.ACCENT, border: `1px solid ${t.ACCENT_BORDER}`, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: FONT_BODY }}>
                      {note.note_type}
                    </span>
                  )}
                  <span style={{ fontSize: '13px', color: isHovered ? t.ACCENT : t.TEXT_SUBTLE, fontFamily: FONT_BODY, fontWeight: FW_MEDIUM }}>
                    {isHovered ? 'Select →' : '→'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: `1px solid ${t.BORDER}`, flexShrink: 0 }}>
          <button style={{ background: 'none', border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD, padding: '8px 16px', fontSize: '13px', color: t.TEXT_MUTED, cursor: 'pointer', fontFamily: FONT_BODY }} onClick={onClose}>
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}