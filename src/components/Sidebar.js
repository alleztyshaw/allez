import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useOrg } from '../context/OrgContext';
import { useTokens, useTheme } from '../context/ThemeContext';
import {
  FONT_DISPLAY, FONT_BODY,
  FW_LIGHT, FW_REGULAR, FW_MEDIUM, FW_SEMIBOLD,
  TOGGLE_SUN, TOGGLE_MOON,
  TOPBAR_HEIGHT, SIDEBAR_WIDTH,
  RADIUS_PILL,
} from '../utils/hqConstants';

const DEMO_ORG_ID = 'e11ef58c-9a1f-4f15-b525-1d1e10be3687';

// ── Icon components ───────────────────────────────────────────────────────────

function SunIcon({ color }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.5" strokeLinecap="round"
      style={{ display: 'block', flexShrink: 0 }}>
      <circle cx="12" cy="12" r="4"/>
      <line x1="12" y1="2"    x2="12" y2="5"/>
      <line x1="12" y1="19"   x2="12" y2="22"/>
      <line x1="2"  y1="12"   x2="5"  y2="12"/>
      <line x1="19" y1="12"   x2="22" y2="12"/>
      <line x1="4.22"  y1="4.22"  x2="6.34"  y2="6.34"/>
      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
      <line x1="19.78" y1="4.22"  x2="17.66" y2="6.34"/>
      <line x1="6.34"  y1="17.66" x2="4.22"  y2="19.78"/>
    </svg>
  );
}

function MoonIcon({ color }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.5" strokeLinecap="round"
      style={{ display: 'block', flexShrink: 0 }}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const [displayName, setDisplayName] = useState('');
  const [open,        setOpen]        = useState(false);

  const {
    isAdmin, isPlatformAdmin, orgLoading, userRole,
    orgId,
    isDevMode, devMobileOverride,
    isDemoOrg, isOrgSwitched,
    exitDevMode,     setDevRoleOverride,
    exitSwitchedOrg, switchOrg,
  } = useOrg();

  const t               = useTokens();
  const { toggleTheme } = useTheme();
  const navigate        = useNavigate();
  const location        = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setDisplayName(session.user.user_metadata.display_name || '');
    });
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/hq') return location.pathname === '/hq';
    return location.pathname.startsWith(path);
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h >= 5  && h < 12) return 'Good morning';
    if (h >= 12 && h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const isDemoActive = isOrgSwitched && isDemoOrg;

  // ── Nav links ─────────────────────────────────────────────────────────────

  const workspaceLinks = [
    { to: '/hq/brief',   label: 'Daily Brief' },
    { to: '/hq/clients', label: 'Clients'     },
    { to: '/hq/notes',   label: 'Notes'       },
    { to: '/hq/crm',     label: 'CRM'         },
  ];

  const firmLinks = [
    ...(!orgLoading && (isAdmin || userRole === 'compliance')
      ? [{ to: '/hq/audit', label: 'Audit Log' }]
      : []),
    ...(!orgLoading && (isPlatformAdmin || isAdmin)
      ? [{ to: isPlatformAdmin ? '/hq/orgs' : `/hq/orgs/${orgId}`, label: 'Org' }]
      : []),
    { to: '/hq/settings', label: 'Settings' },
  ];

  // Stagger timing derived from link count — total window ~180ms
  const totalNavLinks = workspaceLinks.length + firmLinks.length;
  const navGapMs      = Math.round(180 / Math.max(totalNavLinks, 1));

  function navStagger(index) {
    if (!open) return {};
    return {
      animation:      'sidebarNavFadeIn 0.2s ease both',
      animationDelay: `${index * navGapMs}ms`,
    };
  }

  // ── Styles ────────────────────────────────────────────────────────────────

  const s = {
    topbar: {
      position:   devMobileOverride ? 'relative' : 'fixed',
      top:        devMobileOverride ? undefined : 0,
      left:       devMobileOverride ? undefined : 0,
      right:      devMobileOverride ? undefined : 0,
      height:     TOPBAR_HEIGHT,
      background: t.BG,
      display:    'flex', alignItems: 'center', justifyContent: 'space-between',
      padding:    '0 24px',
      zIndex:     300,
      fontFamily: FONT_BODY,
    },
    topbarLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
    hamburger: {
      background: 'none', border: 'none', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', gap: '4px',
      padding: '4px', flexShrink: 0,
    },
    hamburgerLine: {
      width: '18px', height: '1px',
      background: t.TEXT, borderRadius: '2px', display: 'block',
    },
    topbarLogo: {
      fontFamily: FONT_DISPLAY, fontSize: '20px', fontWeight: FW_LIGHT,
      color: t.TEXT, letterSpacing: '0.04em', textDecoration: 'none',
    },
    greeting:     { fontSize: '15px', fontWeight: FW_LIGHT, color: t.TEXT_MUTED },
    greetingName: { color: t.TEXT_MUTED, fontWeight: FW_REGULAR },

    backdrop: {
      position:             devMobileOverride ? 'absolute' : 'fixed',
      inset:                0,
      background:           'rgba(0,0,0,0.45)',
      backdropFilter:       'blur(2px)',
      WebkitBackdropFilter: 'blur(2px)',
      zIndex:               199,
    },

    sidebar: {
      position:        devMobileOverride ? 'absolute' : 'fixed',
      top:             devMobileOverride ? 0 : TOPBAR_HEIGHT,
      left:            0,
      height:          devMobileOverride ? '100%' : `calc(100dvh - ${TOPBAR_HEIGHT}px)`,
      width:           SIDEBAR_WIDTH,
      background:      t.SURFACE,
      borderRight:     `1px solid ${t.BORDER}`,
      display:         'flex',
      flexDirection:   'column',
      zIndex:          200,
      overflow:        'hidden',
      transform:       open ? 'translateX(0) scale(1)' : 'translateX(-100%) scale(0.97)',
      transformOrigin: 'left center',
      transition:      open
        ? 'transform 0.36s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        : 'transform 0.18s cubic-bezier(0.32, 0.72, 0, 1)',
    },

    // Nav — natural height, scrolls if needed
    nav: {
      padding:   '20px 0',
      overflowY: 'auto',
      overflowX: 'hidden',
    },

    group:      { marginBottom: '24px' },
    groupLabel: {
      display:       'block',
      fontSize:      '10px', fontWeight: FW_SEMIBOLD,
      textTransform: 'uppercase', letterSpacing: '0.1em',
      color:         t.TEXT_MUTED,
      padding:       '0 20px 6px',
      whiteSpace:    'nowrap',
    },

    // Nav links — pages
    link: (active) => ({
      display:        'block', padding: '9px 20px',
      fontSize:       '14px',
      fontWeight:     active ? FW_MEDIUM : FW_REGULAR,
      color:          active ? t.ACCENT : t.TEXT,
      borderLeft:     `2px solid ${active ? t.ACCENT : 'transparent'}`,
      background:     active ? t.ACCENT_MUTED : 'transparent',
      textDecoration: 'none', whiteSpace: 'nowrap',
      transition:     'background 0.15s, color 0.15s, border-color 0.15s',
    }),

    // Platform mode buttons — same geometry as nav links, accent when active
    modeButton: (active) => ({
      display:    'block', padding: '9px 20px',
      fontSize:   '14px', fontWeight: active ? FW_MEDIUM : FW_REGULAR,
      color:      active ? t.ACCENT : t.TEXT,
      background: 'none', border: 'none', cursor: 'pointer',
      fontFamily: FONT_BODY, textAlign: 'left',
      width:      '100%', whiteSpace: 'nowrap',
      transition: 'color 0.15s',
    }),

    // Log Out — below nav, visually separated
    logoutSection: {
      flex:          '0 0 auto',
      borderTop:     `1px solid ${t.BORDER}`,
      paddingTop:    '8px',
      paddingBottom: '8px',
    },
    bottomLink: {
      display:    'block', padding: '8px 20px',
      fontSize:   '13px', fontWeight: FW_REGULAR,
      color:      t.TEXT_MUTED,
      background: 'none', border: 'none', cursor: 'pointer',
      fontFamily: FONT_BODY, textAlign: 'left',
      width:      '100%', whiteSpace: 'nowrap',
      transition: 'color 0.15s',
    },

    // Toggle zone — truly bottom-anchored
    toggleZone: {
      flex:           '0 0 auto',
      padding:        '20px 0 18px',
      display:        'flex',
      justifyContent: 'center',
    },
    togglePill: {
      position:     'relative',
      width:        '56px',
      height:       '28px',
      borderRadius: RADIUS_PILL,
      background:   t.SURFACE_ALT,
      border:       `1px solid ${t.BORDER}`,
      userSelect:   'none',
      flexShrink:   0,
    },
    toggleIndicator: {
      position:       'absolute',
      width:          '22px',
      height:         '22px',
      borderRadius:   '50%',
      top:            '3px',
      left:           t.isDark ? '31px' : '3px',
      background:     t.isDark ? t.SURFACE_ALT : t.SURFACE,
      boxShadow:      t.isDark
        ? '0 1px 3px rgba(0,0,0,0.4)'
        : '0 1px 3px rgba(0,0,0,0.15)',
      transition:     'left 0.25s cubic-bezier(0.32, 0.72, 0, 1)',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      zIndex:         1,
      pointerEvents:  'none',
    },
    toggleIconsRow: {
      position:       'absolute',
      inset:          0,
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-between',
      padding:        '0 7px',
      zIndex:         2,
    },
  };

  return (
    <>
      <style>{`
        @keyframes sidebarNavFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <header style={s.topbar}>
        <div style={s.topbarLeft}>
          <button
            style={s.hamburger}
            onClick={() => setOpen(v => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <span style={s.hamburgerLine} />
            <span style={s.hamburgerLine} />
            <span style={s.hamburgerLine} />
          </button>
          <Link to="/hq" style={s.topbarLogo}>Allez HQ</Link>
        </div>
        {displayName && (
          <span style={s.greeting}>
            {getGreeting()}, <span style={s.greetingName}>{displayName}</span>
          </span>
        )}
      </header>

      {/* ── Backdrop ─────────────────────────────────────────────────────── */}
      {open && <div style={s.backdrop} onClick={() => setOpen(false)} />}

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside style={s.sidebar}>

        {/* ── Nav — natural height, three sections ─────────────────────── */}
        <nav style={s.nav}>

          <div style={s.group}>
            <span style={s.groupLabel}>Workspace</span>
            {workspaceLinks.map(({ to, label }, i) => (
              <Link key={to} to={to} style={{ ...s.link(isActive(to)), ...navStagger(i) }}>
                {label}
              </Link>
            ))}
          </div>

          <div style={s.group}>
            <span style={s.groupLabel}>Firm</span>
            {firmLinks.map(({ to, label }, i) => (
              <Link key={to} to={to} style={{ ...s.link(isActive(to)), ...navStagger(workspaceLinks.length + i) }}>
                {label}
              </Link>
            ))}
          </div>

          {/* Platform — plain section header, modes always visible, no expand */}
          {isPlatformAdmin && (
            <div style={s.group}>
              <span style={s.groupLabel}>Platform</span>
              <button
                style={s.modeButton(isDevMode)}
                onClick={isDevMode
                  ? exitDevMode
                  : () => setDevRoleOverride(userRole || 'advisor')}
              >
                Dev Mode
              </button>
              <button
                style={s.modeButton(isDemoActive)}
                onClick={isDemoActive
                  ? exitSwitchedOrg
                  : () => switchOrg(DEMO_ORG_ID, 'Demo', true)}
              >
                Demo Mode
              </button>
            </div>
          )}

        </nav>

        {/* Spacer — fills gap between nav and logout */}
        <div style={{ flex: 1 }} />

        {/* ── Log Out ───────────────────────────────────────────────────── */}
        <div style={s.logoutSection}>
          <button style={s.bottomLink} onClick={handleLogout}>Log Out</button>
        </div>

        {/* ── Light / dark toggle ───────────────────────────────────────── */}
        <div style={s.toggleZone}>
          <div style={s.togglePill} role="group" aria-label="Light or dark mode toggle">
            <div style={s.toggleIndicator}>
              {t.isDark ? <MoonIcon color={TOGGLE_MOON} /> : <SunIcon color={TOGGLE_SUN} />}
            </div>
            <div style={s.toggleIconsRow}>
              <div
                onClick={() => { if (t.isDark) toggleTheme(); }}
                style={{ cursor: t.isDark ? 'pointer' : 'default', padding: '4px', margin: '-4px' }}
              >
                <SunIcon color={t.isDark ? t.TEXT_SUBTLE : TOGGLE_SUN} />
              </div>
              <div
                onClick={() => { if (!t.isDark) toggleTheme(); }}
                style={{ cursor: !t.isDark ? 'pointer' : 'default', padding: '4px', margin: '-4px' }}
              >
                <MoonIcon color={t.isDark ? TOGGLE_MOON : t.TEXT_SUBTLE} />
              </div>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}