import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useOrg } from '../context/OrgContext';
import { useTokens } from '../context/ThemeContext';
import DevToolbar from './DevToolbar';
import DemoRolePicker from './DemoRolePicker';
import {
  FONT_DISPLAY, FONT_BODY,
  FW_LIGHT, FW_REGULAR, FW_MEDIUM, FW_SEMIBOLD,
  SITE_ACCENT,
  TOPBAR_HEIGHT, SIDEBAR_WIDTH,
} from '../utils/hqConstants';

// Fixed demo org ID — used for the platform admin "Go to Demo" shortcut
const DEMO_ORG_ID = 'e11ef58c-9a1f-4f15-b525-1d1e10be3687';

export default function Sidebar() {
  const [displayName, setDisplayName] = useState('');
  const [open, setOpen]               = useState(false);
  const [devToolbarOpen, setDevToolbarOpen] = useState(false);
  const [demoPickerOpen, setDemoPickerOpen] = useState(false);

  const {
    isAdmin, isPlatformAdmin, orgLoading, userRole,
    isDevMode, devMobileOverride,
    isDemoOrg, isDemoMode, demoRoleOverride,
    isOrgSwitched,
    exitSwitchedOrg, switchOrg,
  } = useOrg();
  const t        = useTokens();
  const navigate = useNavigate();
  const location = useLocation();

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

  const workspaceLinks = [
    { to: '/hq/brief',   label: 'Daily Brief' },
    { to: '/hq/clients', label: 'Clients'     },
    { to: '/hq/notes',   label: 'Notes'       },
    { to: '/hq/crm',     label: 'CRM'         },
  ];

  const firmLinks = [
    ...(!orgLoading && isAdmin                                ? [{ to: '/hq/team',  label: 'Team'      }] : []),
    ...(!orgLoading && (isAdmin || userRole === 'compliance') ? [{ to: '/hq/audit', label: 'Audit Log' }] : []),
    { to: '/hq/settings', label: 'Settings' },
    ...(!orgLoading && isPlatformAdmin ? [{ to: '/hq/orgs', label: 'Orgs' }] : []),
  ];

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
    topbarLeft: {
      display: 'flex', alignItems: 'center', gap: '12px',
    },
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
      fontFamily:     FONT_DISPLAY,
      fontSize:       '20px', fontWeight: FW_LIGHT,
      color:          t.TEXT, letterSpacing: '0.04em',
      textDecoration: 'none',
    },
    greeting: {
      fontSize: '15px', fontWeight: FW_LIGHT, color: t.TEXT_MUTED,
    },
    greetingName: {
      color: t.TEXT_MUTED, fontWeight: FW_REGULAR,
    },
    backdrop: {
      position: devMobileOverride ? 'absolute' : 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.45)',
      zIndex: 199,
    },
    sidebar: {
      position:      devMobileOverride ? 'absolute' : 'fixed',
      top:           devMobileOverride ? 0 : TOPBAR_HEIGHT, left: 0,
      height:        devMobileOverride ? '100%' : `calc(100vh - ${TOPBAR_HEIGHT}px)`,
      width:         SIDEBAR_WIDTH,
      background:    t.SURFACE,
      borderRight:   `1px solid ${t.BORDER}`,
      display:       'flex', flexDirection: 'column',
      zIndex:        200,
      overflow:      'hidden',
      transform:     open ? 'translateX(0)' : 'translateX(-100%)',
      transition:    'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
    },
    nav: {
      padding: '20px 0', overflowY: 'auto', overflowX: 'hidden',
    },
    group: { marginBottom: '24px' },
    groupLabel: {
      display:       'block',
      fontSize:      '10px', fontWeight: FW_SEMIBOLD,
      textTransform: 'uppercase', letterSpacing: '0.1em',
      color:         t.TEXT_MUTED,
      padding:       '0 20px 6px',
      whiteSpace:    'nowrap',
    },
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
    sidebarBottom: {
      padding:   '24px 0 20px',
      borderTop: `1px solid ${t.BORDER}`,
      marginTop: '8px',
    },
    bottomLink: {
      display:        'block', padding: '8px 20px',
      fontSize:       '13px', fontWeight: FW_REGULAR,
      color:          t.TEXT_MUTED, textDecoration: 'none',
      background:     'none', border: 'none', cursor: 'pointer',
      fontFamily:     FONT_BODY, textAlign: 'left',
      width:          '100%', whiteSpace: 'nowrap',
      transition:     'color 0.15s',
    },
    devBadge: {
      display:     'flex', alignItems: 'center', gap: '6px',
      margin:      '8px 20px 0',
      padding:     '5px 10px',
      background:  isDevMode ? 'rgba(251,191,36,0.12)' : 'transparent',
      border:      `1px solid ${isDevMode ? 'rgba(251,191,36,0.4)' : t.BORDER}`,
      borderRadius: '6px',
      cursor:      'pointer',
      transition:  'all 0.15s',
    },
    devDot: {
      width: '6px', height: '6px', borderRadius: '50%',
      background: isDevMode ? SITE_ACCENT : t.TEXT_SUBTLE,
      flexShrink: 0, transition: 'background 0.15s',
    },
    devLabel: {
      fontSize: '11px', fontWeight: FW_MEDIUM,
      color: isDevMode ? SITE_ACCENT : t.TEXT_SUBTLE,
      fontFamily: FONT_BODY, letterSpacing: '0.04em',
    },
    viewingDemoBadge: {
      display:      'flex', alignItems: 'center', gap: '6px',
      margin:       '6px 20px 0',
      padding:      '5px 10px',
      background:   'transparent',
      border:       `1px solid ${t.BORDER}`,
      borderRadius: '6px',
    },
    viewingDemoDot: {
      width: '6px', height: '6px', borderRadius: '50%',
      background: t.ACCENT, flexShrink: 0,
    },
    viewingDemoLabel: {
      fontSize: '11px', fontWeight: FW_MEDIUM,
      color: t.TEXT_SUBTLE,
      fontFamily: FONT_BODY, letterSpacing: '0.04em',
      flex: 1,
    },
    viewingDemoX: {
      background: 'none', border: 'none', cursor: 'pointer',
      padding: '0 0 0 2px', lineHeight: 1,
      fontSize: '14px', color: t.TEXT_SUBTLE,
      fontFamily: FONT_BODY, flexShrink: 0,
    },
    demoBadge: {
      display:     'flex', alignItems: 'center', gap: '6px',
      margin:      '6px 20px 0',
      padding:     '5px 10px',
      background:  'transparent',
      border:      `1px solid ${isDemoMode ? t.ACCENT_BORDER : t.BORDER}`,
      borderRadius: '6px',
      cursor:      'pointer',
      transition:  'border-color 0.15s',
    },
    demoDot: {
      width: '6px', height: '6px', borderRadius: '50%',
      background: isDemoMode ? t.ACCENT : t.TEXT_SUBTLE,
      flexShrink: 0, transition: 'background 0.15s',
    },
    demoLabel: {
      fontSize: '11px', fontWeight: FW_MEDIUM,
      color: isDemoMode ? t.ACCENT : t.TEXT_SUBTLE,
      fontFamily: FONT_BODY, letterSpacing: '0.04em',
      flex: 1,
    },
    demoBadgeX: {
      background: 'none', border: 'none', cursor: 'pointer',
      padding: '0 0 0 2px', lineHeight: 1,
      fontSize: '14px', color: t.TEXT_SUBTLE,
      fontFamily: FONT_BODY, flexShrink: 0,
    },
    goDemoButton: {
      display:        'block', padding: '8px 20px',
      fontSize:       '13px', fontWeight: FW_REGULAR,
      color:          t.ACCENT, textDecoration: 'none',
      background:     'none', border: 'none', cursor: 'pointer',
      fontFamily:     FONT_BODY, textAlign: 'left',
      width:          '100%', whiteSpace: 'nowrap',
      transition:     'color 0.15s',
    },
  };

  return (
    <>
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
        <nav style={s.nav}>
          <div style={s.group}>
            <span style={s.groupLabel}>Workspace</span>
            {workspaceLinks.map(({ to, label }) => (
              <Link key={to} to={to} style={s.link(isActive(to))}>{label}</Link>
            ))}
          </div>
          <div style={s.group}>
            <span style={s.groupLabel}>Firm</span>
            {firmLinks.map(({ to, label }) => (
              <Link key={to} to={to} style={s.link(isActive(to))}>{label}</Link>
            ))}
          </div>
        </nav>

        <div style={s.sidebarBottom}>
          <button style={s.bottomLink} onClick={handleLogout}>Log Out</button>

          {/* Dev mode — platform admin only */}
          {isPlatformAdmin && (
            <button style={s.devBadge} onClick={() => setDevToolbarOpen(true)}>
              <span style={s.devDot} />
              <span style={s.devLabel}>{isDevMode ? 'Dev Mode On' : 'Dev Mode'}</span>
            </button>
          )}

          {/* "Viewing Demo" — platform admin switched into demo, with X to exit */}
          {isPlatformAdmin && isOrgSwitched && isDemoOrg && (
            <div style={s.viewingDemoBadge}>
              <span style={s.viewingDemoDot} />
              <span style={s.viewingDemoLabel}>Viewing Demo</span>
              <button style={s.viewingDemoX} onClick={exitSwitchedOrg} aria-label="Exit demo">×</button>
            </div>
          )}

          {/* "Go to Demo" — platform admin, not currently in demo */}
          {isPlatformAdmin && !isOrgSwitched && (
            <button
              style={s.goDemoButton}
              onClick={() => switchOrg(DEMO_ORG_ID, 'Demo', true)}
            >
              Go to Demo
            </button>
          )}

          {/* Switch Role picker — platform admin in demo only (not shown to real demo users) */}
          {isPlatformAdmin && isDemoOrg && (
            <button style={s.demoBadge} onClick={() => setDemoPickerOpen(true)}>
              <span style={s.demoDot} />
              <span style={s.demoLabel}>
                {isDemoMode ? `Viewing as ${demoRoleOverride}` : 'Switch Role'}
              </span>
              <span
                style={s.demoBadgeX}
                onClick={e => { e.stopPropagation(); exitSwitchedOrg(); }}
                aria-label="Exit demo"
              >×</span>
            </button>
          )}
        </div>
      </aside>

      {devToolbarOpen && (
        <DevToolbar onClose={() => setDevToolbarOpen(false)} />
      )}
      {demoPickerOpen && (
        <DemoRolePicker onClose={() => setDemoPickerOpen(false)} />
      )}
    </>
  );
}