import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useOrg } from '../context/OrgContext';
import { useTokens } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import {
  FONT_DISPLAY, FONT_BODY,
  FW_LIGHT, FW_REGULAR, FW_MEDIUM, FW_SEMIBOLD,
  TOPBAR_HEIGHT, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_BREAKPOINT,
  RADIUS_MD,
} from '../utils/hqConstants';

export default function Sidebar() {
  const [displayName, setDisplayName] = useState('');
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const { isAdmin, isPlatformAdmin, orgLoading, userRole } = useOrg();
  const { collapsed, setCollapsed } = useSidebar();
  const t        = useTokens();
  const navigate = useNavigate();
  const location = useLocation();

  const isMobile = windowWidth < SIDEBAR_BREAKPOINT;

  useEffect(() => {
    const handler = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setDisplayName(session.user.user_metadata.display_name || '');
    });
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

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
    { to: '/hq',         label: 'Daily Brief' },
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

  const sidebarW = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  const s = {
    topbar: {
      position: 'fixed', top: 0, left: 0, right: 0,
      height: TOPBAR_HEIGHT,
      background: t.SURFACE,
      borderBottom: `1px solid ${t.BORDER}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: isMobile ? '0 20px' : '0 28px',
      zIndex: 300,
      fontFamily: FONT_BODY,
    },
    topbarLogo: {
      fontFamily: FONT_DISPLAY, fontSize: '20px', fontWeight: '300',
      color: t.TEXT, letterSpacing: '0.04em', textDecoration: 'none',
    },
    greeting: { fontSize: '13px', fontWeight: FW_LIGHT, color: t.TEXT_MUTED },
    greetingName: { color: t.TEXT, fontWeight: FW_REGULAR },
    hamburger: {
      background: 'none', border: 'none', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', gap: '4px', padding: '4px',
    },
    hamburgerLine: {
      width: '18px', height: '1.5px', background: t.TEXT,
      borderRadius: '2px', display: 'block',
    },
    sidebar: {
      position: 'fixed', top: TOPBAR_HEIGHT, left: 0,
      height: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
      width: isMobile ? SIDEBAR_WIDTH : sidebarW,
      background: t.SURFACE,
      borderRight: `1px solid ${t.BORDER}`,
      display: 'flex', flexDirection: 'column',
      zIndex: 200, overflow: 'hidden',
      transition: isMobile
        ? 'transform 0.25s cubic-bezier(0.4,0,0.2,1)'
        : 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
      transform: isMobile && !mobileOpen ? 'translateX(-100%)' : 'translateX(0)',
    },
    nav: { flex: 1, padding: '20px 0', overflowY: 'auto', overflowX: 'hidden' },
    group: { marginBottom: '24px' },
    groupLabel: {
      fontSize: '10px', fontWeight: FW_SEMIBOLD,
      textTransform: 'uppercase', letterSpacing: '0.1em',
      color: t.TEXT_MUTED, padding: '0 20px 6px',
      whiteSpace: 'nowrap', overflow: 'hidden',
      opacity: collapsed && !isMobile ? 0 : 1,
      transition: 'opacity 0.15s',
      display: 'block',
    },
    link: (active) => ({
      display: 'block', padding: '9px 20px',
      fontSize: '14px', fontWeight: active ? FW_MEDIUM : FW_REGULAR,
      color: active ? t.ACCENT : t.TEXT,
      borderLeft: `2px solid ${active ? t.ACCENT : 'transparent'}`,
      background: active ? t.ACCENT_MUTED : 'transparent',
      textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden',
      transition: 'background 0.15s, color 0.15s, border-color 0.15s',
      opacity: collapsed && !isMobile ? 0 : 1,
      pointerEvents: collapsed && !isMobile ? 'none' : 'auto',
    }),
    sidebarBottom: {
      padding: '12px 0 20px', borderTop: `1px solid ${t.BORDER}`,
      overflow: 'hidden',
      opacity: collapsed && !isMobile ? 0 : 1,
      transition: 'opacity 0.15s',
      pointerEvents: collapsed && !isMobile ? 'none' : 'auto',
    },
    bottomLink: {
      display: 'block', padding: '8px 20px',
      fontSize: '13px', fontWeight: FW_REGULAR, color: t.TEXT_MUTED,
      textDecoration: 'none', background: 'none', border: 'none',
      cursor: 'pointer', fontFamily: FONT_BODY, textAlign: 'left',
      width: '100%', whiteSpace: 'nowrap', transition: 'color 0.15s',
    },
    collapseToggle: {
      position: 'absolute', top: '50%', right: 0,
      transform: 'translateY(-50%)',
      width: '16px', height: '40px',
      background: t.SURFACE_ALT,
      border: `1px solid ${t.BORDER}`, borderRight: 'none',
      borderRadius: `${RADIUS_MD} 0 0 ${RADIUS_MD}`,
      cursor: 'pointer', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: 0, zIndex: 10,
    },
    chevron: (pointRight) => ({
      display: 'inline-block', width: 0, height: 0,
      borderTop: '4px solid transparent', borderBottom: '4px solid transparent',
      ...(pointRight
        ? { borderLeft:  `5px solid ${t.TEXT_MUTED}`, marginLeft:  '2px'  }
        : { borderRight: `5px solid ${t.TEXT_MUTED}`, marginLeft: '-2px'  }
      ),
    }),
    backdrop: {
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 199,
    },
  };

  const sidebarContent = (
    <>
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
        <Link to="/contact" style={s.bottomLink}>Contact</Link>
        <button style={s.bottomLink} onClick={handleLogout}>Log Out</button>
      </div>

      {!isMobile && (
        <button
          style={s.collapseToggle}
          onClick={() => setCollapsed(v => !v)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span style={s.chevron(collapsed)} />
        </button>
      )}
    </>
  );

  return (
    <>
      {/* Top Bar */}
      <header style={s.topbar}>
        {isMobile ? (
          <>
            <button style={s.hamburger} onClick={() => setMobileOpen(v => !v)} aria-label="Open menu">
              <span style={s.hamburgerLine} />
              <span style={s.hamburgerLine} />
              <span style={s.hamburgerLine} />
            </button>
            <Link to="/hq" style={s.topbarLogo}>Allez HQ</Link>
          </>
        ) : (
          <Link to="/hq" style={s.topbarLogo}>Allez HQ</Link>
        )}
        {displayName && (
          <span style={s.greeting}>
            {getGreeting()}, <span style={s.greetingName}>{displayName}</span>
          </span>
        )}
      </header>

      {/* Mobile backdrop */}
      {isMobile && mobileOpen && (
        <div style={s.backdrop} onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside style={s.sidebar}>
        {sidebarContent}
      </aside>
    </>
  );
}