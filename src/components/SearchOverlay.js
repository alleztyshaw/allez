// src/components/SearchOverlay.js
// Global search overlay — triggered by Cmd+K / Ctrl+K.
// Searches clients, notes, and tasks via search_org_records RPC.
// Mounted once in App.js above all routes.

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useTokens } from '../context/ThemeContext';
import { useOrg } from '../context/OrgContext';
import {
  FONT_BODY, FONT_DISPLAY,
  RADIUS_LG, RADIUS_MD,
  FW_LIGHT, FW_REGULAR, FW_MEDIUM, FW_SEMIBOLD,
  OVERLAY_BG, SHADOW_LG,
} from '../utils/hqConstants';

const TYPE_LABELS = {
  client: 'Client',
  note:   'Note',
  task:   'Task',
};

const TYPE_ORDER = ['client', 'note', 'task'];

function groupResults(results) {
  const groups = {};
  TYPE_ORDER.forEach(type => { groups[type] = []; });
  results.forEach(r => {
    if (groups[r.result_type]) groups[r.result_type].push(r);
  });
  return groups;
}

export default function SearchOverlay() {
  const t          = useTokens();
  const navigate   = useNavigate();
  const { orgId }  = useOrg();
  const inputRef   = useRef(null);

  const [open,     setOpen]     = useState(false);
  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [active,   setActive]   = useState(0); // keyboard nav index

  // ── Open / close ──────────────────────────────────────────────────────────
  const openOverlay = useCallback(() => {
    setOpen(true);
    setQuery('');
    setResults([]);
    setActive(0);
  }, []);

  const closeOverlay = useCallback(() => {
    setOpen(false);
    setQuery('');
    setResults([]);
  }, []);

  // ── Keyboard shortcut — Cmd+K / Ctrl+K ───────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        open ? closeOverlay() : openOverlay();
      }
      if (e.key === 'Escape' && open) closeOverlay();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, openOverlay, closeOverlay]);

  // ── Focus input when opened ───────────────────────────────────────────────
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  // ── Search ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults([]); return; }
    const timeout = setTimeout(async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc('search_org_records', { query: query.trim() });
      if (!error) {
        setResults(data || []);
        setActive(0);
      }
      setLoading(false);
    }, 220);
    return () => clearTimeout(timeout);
  }, [query, orgId]);

  // ── Navigate to result ────────────────────────────────────────────────────
  function handleSelect(result) {
    closeOverlay();
    if (result.result_type === 'client') {
      navigate(`/hq/clients/${result.client_id}`);
    } else if (result.result_type === 'note') {
      navigate(`/hq/clients/${result.client_id}`, { state: { activeTab: 'notes' } });
    } else if (result.result_type === 'task') {
      navigate(`/hq/clients/${result.client_id}`, { state: { activeTab: 'overview' } });
    }
  }

  // ── Arrow key navigation ──────────────────────────────────────────────────
  function handleKeyUp(e) {
    if (e.key === 'ArrowDown') setActive(a => Math.min(a + 1, results.length - 1));
    if (e.key === 'ArrowUp')   setActive(a => Math.max(a - 1, 0));
    if (e.key === 'Enter' && results[active]) handleSelect(results[active]);
  }

  if (!open) return null;

  const grouped = groupResults(results);
  const flatResults = TYPE_ORDER.flatMap(type => grouped[type]);

  const s = {
    overlay: {
      position: 'fixed', inset: 0, background: OVERLAY_BG,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      zIndex: 2000, padding: '80px 20px 20px',
    },
    panel: {
      background: t.SURFACE, border: `1px solid ${t.BORDER}`,
      borderRadius: RADIUS_LG, width: '100%', maxWidth: '580px',
      boxShadow: SHADOW_LG, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      maxHeight: 'calc(100vh - 120px)',
    },
    inputRow: {
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '16px 20px', borderBottom: `1px solid ${t.BORDER}`,
    },
    searchIcon: {
      color: t.TEXT_MUTED, flexShrink: 0, fontSize: '16px',
    },
    input: {
      flex: 1, background: 'none', border: 'none', outline: 'none',
      fontSize: '16px', color: t.TEXT, fontFamily: FONT_BODY,
      fontWeight: FW_LIGHT,
    },
    kbdHint: {
      fontSize: '11px', color: t.TEXT_MUTED, fontFamily: FONT_BODY,
      flexShrink: 0,
    },
    results: {
      overflowY: 'auto', flex: 1,
    },
    groupLabel: {
      fontSize: '10px', fontWeight: FW_SEMIBOLD, letterSpacing: '0.1em',
      textTransform: 'uppercase', color: t.TEXT_MUTED,
      padding: '10px 20px 4px', fontFamily: FONT_BODY,
    },
    resultRow: (isActive) => ({
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '10px 20px', cursor: 'pointer',
      background: isActive ? t.SURFACE_ALT : 'transparent',
      borderBottom: `1px solid ${t.BORDER}`,
      transition: 'background 0.1s',
    }),
    typeDot: (type) => ({
      width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
      background: type === 'client' ? t.ACCENT
        : type === 'note' ? t.TEXT_MUTED
        : t.TEXT_SUBTLE,
    }),
    label: {
      fontSize: '14px', fontWeight: FW_REGULAR,
      color: t.TEXT, fontFamily: FONT_DISPLAY,
      letterSpacing: '0.01em', flex: 1,
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    },
    sublabel: {
      fontSize: '12px', color: t.TEXT_MUTED,
      fontWeight: FW_LIGHT, fontFamily: FONT_BODY, flexShrink: 0,
    },
    emptyState: {
      padding: '32px 20px', textAlign: 'center',
      color: t.TEXT_MUTED, fontSize: '14px',
      fontWeight: FW_LIGHT, fontFamily: FONT_BODY,
    },
    footer: {
      padding: '10px 20px', borderTop: `1px solid ${t.BORDER}`,
      display: 'flex', gap: '16px', alignItems: 'center',
    },
    footerHint: {
      fontSize: '11px', color: t.TEXT_MUTED,
      fontFamily: FONT_BODY, fontWeight: FW_LIGHT,
    },
  };

  const hasResults = results.length > 0;
  const showEmpty  = query.length >= 2 && !loading && !hasResults;

  let flatIdx = 0;

  return (
    <div style={s.overlay} onClick={closeOverlay}>
      <div style={s.panel} onClick={e => e.stopPropagation()}>

        {/* Input row */}
        <div style={s.inputRow}>
          <span style={s.searchIcon}>⌕</span>
          <input
            ref={inputRef}
            style={s.input}
            placeholder="Search clients, notes, tasks…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyUp}
          />
          {loading && (
            <span style={{ ...s.kbdHint }}>Searching…</span>
          )}
          {!loading && (
            <span style={s.kbdHint}>ESC to close</span>
          )}
        </div>

        {/* Results */}
        <div style={s.results}>
          {showEmpty && (
            <div style={s.emptyState}>No results for "{query}"</div>
          )}

          {!query && (
            <div style={s.emptyState}>Type to search across your clients, notes, and tasks</div>
          )}

          {hasResults && TYPE_ORDER.map(type => {
            const group = grouped[type];
            if (group.length === 0) return null;
            return (
              <div key={type}>
                <div style={s.groupLabel}>{TYPE_LABELS[type]}s</div>
                {group.map(result => {
                  const idx = flatIdx++;
                  const isActive = idx === active;
                  return (
                    <div
                      key={result.result_id}
                      style={s.resultRow(isActive)}
                      onClick={() => handleSelect(result)}
                      onMouseEnter={() => setActive(idx)}
                    >
                      <span style={s.typeDot(result.result_type)} />
                      <span style={s.label}>{result.label}</span>
                      {result.sublabel && (
                        <span style={s.sublabel}>{result.sublabel}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer hints */}
        {hasResults && (
          <div style={s.footer}>
            <span style={s.footerHint}>↑↓ navigate</span>
            <span style={s.footerHint}>↵ open</span>
            <span style={s.footerHint}>ESC close</span>
          </div>
        )}

      </div>
    </div>
  );
}