import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useOrg } from '../context/OrgContext';
import { useTheme } from '../context/ThemeContext';
import '../App.css';

function Navigation() {
  const [displayName, setDisplayName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { isAdmin, isPlatformAdmin, orgLoading } = useOrg();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isDarkPage = location.pathname.startsWith('/hq');
  const linkColor = (isDarkPage && theme === 'dark') ? '#f0ece0' : '#1a1a2e';

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setDisplayName(session.user.user_metadata.display_name);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const close = () => setMenuOpen(false);

  return (
    <header className="header" style={{ background: 'transparent', boxShadow: 'none', borderBottom: 'none' }}>
      <div className="container">
        <h1 style={{ margin: 0 }}>
          <Link to="/hq" style={{
            color: linkColor, textDecoration: 'none',
            fontSize: '26px', fontWeight: '300',
            fontFamily: "'Cormorant Garamond', serif",
            letterSpacing: '0.04em',
          }}>
            Allez HQ
          </Link>
        </h1>

        <div className="nav-right">
          {displayName && (
            <span className="welcome-message" style={{ color: linkColor, opacity: 0.8, fontSize: '16px' }}>
              {getGreeting()}, {displayName}
            </span>
          )}

          <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
              <span style={{ background: linkColor }}></span>
              <span style={{ background: linkColor }}></span>
              <span style={{ background: linkColor }}></span>
            </button>

            {menuOpen && (
              <nav className="dropdown-menu">
                <Link to="/hq/clients"  onClick={close} style={{ ...styles.menuLink, color: linkColor }}>Clients</Link>
                <Link to="/hq/notes"    onClick={close} style={{ ...styles.menuLink, color: linkColor }}>Notes</Link>
                <Link to="/hq/crm" onClick={close} style={{ ...styles.menuLink, color: linkColor }}>CRM</Link>
                {!orgLoading && isAdmin && (
                  <Link to="/hq/team" onClick={close} style={{ ...styles.menuLink, color: linkColor }}>Team</Link>
                )}
                {!orgLoading && isPlatformAdmin && (
                  <Link to="/hq/orgs" onClick={close} style={{ ...styles.menuLink, color: linkColor }}>Orgs</Link>
                )}
                <Link to="/hq/settings" onClick={close} style={{ ...styles.menuLink, color: linkColor }}>Settings</Link>
                <Link to="/contact"     onClick={close} style={{ ...styles.menuLink, color: linkColor }}>Contact</Link>
                <button onClick={handleLogout} className="logout-link">Log Out</button>
              </nav>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

const styles = {
  menuLink: {
    color: '#f0ece0', textDecoration: 'none', display: 'block',
  },
  soonTag: {
    fontSize: '10px', background: 'rgba(255,255,255,0.08)',
    color: '#6b7280', padding: '2px 7px', borderRadius: '8px',
  },
};

export default Navigation;