// src/components/MeetingModal.js
// Shared meeting creation/edit modal.
// Used by ClientDetail (meetings tab) and Clients (cadence quick-schedule).
//
// Props:
//   isOpen         — bool — whether modal is rendered
//   onClose        — fn() — called on cancel or X
//   onSaved        — fn() — called after successful DB save (parent re-fetches)
//   editingMeeting — null = new meeting | object = edit existing
//   orgId, userId, clientId
//   initialForm    — optional partial form object to pre-fill new meetings
//   isMobile       — bool

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useTokens } from '../context/ThemeContext';
import {
  FONT_DISPLAY, FONT_BODY,
  RADIUS_LG, RADIUS_MD,
  SHADOW_LG, OVERLAY_BG,
  FW_LIGHT, FW_SEMIBOLD,
  MEETING_CATEGORIES, MEETING_TYPES, MEETING_STATUSES,
  MEETING_RECURRENCES, MEETING_DURATION_OPTIONS,
  COLOR_ERROR,
} from '../utils/hqConstants';

const BLANK_MEETING = {
  category:       MEETING_CATEGORIES[0],
  meeting_type:   MEETING_TYPES[0].value,
  status:         'scheduled',
  scheduled_date: '',
  scheduled_time: '',
  duration_mins:  60,
  description:    '',
  recurrence:     'none',
  meeting_link:   '',
};

export default function MeetingModal({
  isOpen,
  onClose,
  onSaved,
  editingMeeting = null,
  orgId,
  userId,
  clientId,
  initialForm    = null,
  isMobile       = false,
}) {
  const t = useTokens();
  const [form,   setForm]   = useState(BLANK_MEETING);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (editingMeeting) {
      const dt  = editingMeeting.scheduled_at ? new Date(editingMeeting.scheduled_at) : null;
      const pad = n => String(n).padStart(2, '0');
      setForm({
        category:       editingMeeting.category,
        meeting_type:   editingMeeting.meeting_type,
        status:         editingMeeting.status,
        scheduled_date: dt ? `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}` : '',
        scheduled_time: dt ? `${pad(dt.getHours())}:${pad(dt.getMinutes())}` : '',
        duration_mins:  editingMeeting.duration_mins,
        description:    editingMeeting.description || '',
        recurrence:     editingMeeting.recurrence,
        meeting_link:   editingMeeting.meeting_link || '',
      });
    } else {
      setForm(initialForm ? { ...BLANK_MEETING, ...initialForm } : BLANK_MEETING);
    }
    setError('');
  }, [isOpen, editingMeeting, initialForm]);

  async function handleSave() {
    if (!form.scheduled_date || !form.scheduled_time) {
      setError('Please set a date and time.');
      return;
    }
    setSaving(true);
    setError('');
    const scheduled_at = new Date(`${form.scheduled_date}T${form.scheduled_time}`).toISOString();
    const { scheduled_date, scheduled_time, ...rest } = form;
    const payload = {
      ...rest, scheduled_at,
      org_id:        orgId,
      user_id:       userId,
      client_id:     clientId,
      duration_mins: Number(form.duration_mins),
      meeting_link:  form.meeting_link || null,
    };
    const { error: saveError } = editingMeeting
      ? await supabase.from('meetings').update(payload).eq('id', editingMeeting.id)
      : await supabase.from('meetings').insert([payload]);
    if (saveError) {
      setError('Could not save meeting. Please try again.');
      console.error(saveError);
    } else {
      onSaved();
      onClose();
    }
    setSaving(false);
  }

  if (!isOpen) return null;

  const inp = {
    width: '100%', boxSizing: 'border-box',
    border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_MD,
    padding: '8px 12px', fontSize: '14px', outline: 'none',
    color: t.TEXT, background: t.SURFACE_ALT, fontFamily: FONT_BODY,
  };
  const lbl = {
    display: 'block', fontSize: '12px', fontWeight: FW_SEMIBOLD,
    color: t.TEXT_MUTED, letterSpacing: '0.02em', marginBottom: '6px', fontFamily: FONT_BODY,
  };

  return (
    <div style={{ position: isMobile ? 'absolute' : 'fixed', inset: 0, background: OVERLAY_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ background: t.SURFACE, border: `1px solid ${t.BORDER}`, borderRadius: RADIUS_LG, width: '100%', maxWidth: isMobile ? '100%' : '520px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: SHADOW_LG }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${t.BORDER}` }}>
          <h2 style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: '24px', fontWeight: '400', color: t.TEXT, letterSpacing: '0.01em' }}>
            {editingMeeting ? 'Edit Meeting' : 'Schedule Meeting'}
          </h2>
          <button style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: t.TEXT_MUTED, padding: '4px 8px' }} onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '24px', flex: 1, background: t.SURFACE }}>
          {error && <p style={{ color: COLOR_ERROR, fontSize: '13px', margin: '0 0 16px' }}>{error}</p>}

          <div style={{ marginBottom: '16px' }}>
            <label style={lbl}>Category</label>
            <select style={inp} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {MEETING_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={isMobile ? { gridColumn: '1 / -1' } : {}}>
              <label style={lbl}>Date</label>
              <input style={inp} type="date" value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Time</label>
              <input style={inp} type="time" value={form.scheduled_time} onChange={e => setForm(f => ({ ...f, scheduled_time: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>Duration</label>
              <select style={inp} value={form.duration_mins} onChange={e => setForm(f => ({ ...f, duration_mins: e.target.value }))}>
                {MEETING_DURATION_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : editingMeeting ? '1fr 1fr 1fr' : '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={lbl}>Type</label>
              <select style={inp} value={form.meeting_type} onChange={e => setForm(f => ({ ...f, meeting_type: e.target.value }))}>
                {MEETING_TYPES.map(mt => <option key={mt.value} value={mt.value}>{mt.label}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Recurrence</label>
              <select style={inp} value={form.recurrence} onChange={e => setForm(f => ({ ...f, recurrence: e.target.value }))}>
                {MEETING_RECURRENCES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            {editingMeeting && (
              <div>
                <label style={lbl}>Status</label>
                <select style={inp} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {MEETING_STATUSES.map(ms => <option key={ms.value} value={ms.value}>{ms.label}</option>)}
                </select>
              </div>
            )}
          </div>

          {['video', 'phone'].includes(form.meeting_type) && (
            <div style={{ marginBottom: '16px' }}>
              <label style={lbl}>
                {form.meeting_type === 'video' ? 'Video Link' : 'Phone Number'}
                <span style={{ fontWeight: FW_LIGHT, opacity: 0.6 }}> — optional</span>
              </label>
              <input
                style={inp}
                type={form.meeting_type === 'phone' ? 'tel' : 'url'}
                placeholder={form.meeting_type === 'video' ? 'https://zoom.us/j/...' : '+1 (555) 000-0000'}
                value={form.meeting_link}
                onChange={e => setForm(f => ({ ...f, meeting_link: e.target.value }))}
              />
            </div>
          )}

          <div>
            <label style={lbl}>Agenda <span style={{ fontWeight: FW_LIGHT, opacity: 0.6 }}>— optional</span></label>
            <textarea
              style={{ ...inp, minHeight: '72px', resize: 'vertical' }}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What needs to be covered..."
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: `1px solid ${t.BORDER}`, display: 'flex', justifyContent: 'flex-end', gap: '10px', background: t.SURFACE }}>
          <button style={{ padding: '9px 20px', borderRadius: RADIUS_MD, border: `1px solid ${t.BORDER}`, background: 'transparent', fontSize: '14px', cursor: 'pointer', color: t.TEXT_MUTED, fontFamily: FONT_BODY }} onClick={onClose}>
            Cancel
          </button>
          <button style={{ padding: '9px 20px', borderRadius: RADIUS_MD, border: `1px solid ${t.ACCENT_BORDER}`, background: t.ACCENT_MUTED, color: t.ACCENT, fontSize: '14px', fontWeight: FW_SEMIBOLD, cursor: 'pointer', fontFamily: FONT_BODY }} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : editingMeeting ? 'Save Changes' : 'Schedule'}
          </button>
        </div>

      </div>
    </div>
  );
}