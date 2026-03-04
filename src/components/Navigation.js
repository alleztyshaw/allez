import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../App.css';

const HQ_SUBMENU = [
  { label: 'Clients', path: '/hq/clients' },
  { label: 'Notes', path: '/hq/notes', comingSoon: true },
  { label: 'CRM', path: '/hq/crm', comingSoon: true },
];

function Navigation() {
  const [displayName, setDisplayName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [hqHovered, setHqHovered] = useState(false);
  const hqHoverTimeout = useRef(null);

  const handleHqEnter = () => {
    clearTimeout(hqHoverTimeout.current);
    setHqHovered(true);
  };

  const handleHqLeave = () => {
    hqHoverTimeout.current = setTimeout(() => setHqHovered(false), 150);
  };
  const [submenuLeft, setSubmenuLeft] = useState(false);
  const hqRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Use light text on dark pages (HQ and nested), dark text everywhere else
  const isDarkPage = location.pathname.startsWith('/hq');
  const linkColor = isDarkPage ? '#f0ece0' : '#1a1a2e';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setDisplayName(session.user.user_metadata.display_name);
      }
    });
  }, []);

  // Detect if submenu would overflow off the right edge of the window
  useEffect(() => {
    if (hqHovered && hqRef.current) {
      const rect = hqRef.current.getBoundingClientRect();
      const submenuWidth = 180;
      const wouldOverflow = rect.right + submenuWidth > window.innerWidth - 16;
      setSubmenuLeft(wouldOverflow);
    }
  }, [hqHovered]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <h1>
          <Link to="/home" style={{ color: 'white', textDecoration: 'none' }}>
            Allez
          </Link>
        </h1>
        <div className="nav-right">
          {displayName && (
            <span className="welcome-message">Welcome, {displayName}!</span>
          )}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
              <span></span>
              <span></span>
              <span></span>
            </button>

            {menuOpen && (
              <nav className="dropdown-menu">
                <Link to="/home" onClick={() => setMenuOpen(false)} style={{...styles.menuLink, color: linkColor}}>
                  Home
                </Link>

                {/* HQ with flyout submenu */}
                <div
                  ref={hqRef}
                  style={styles.menuItemWrapper}
                  onMouseEnter={handleHqEnter}
                  onMouseLeave={handleHqLeave}
                >
                  <Link
                    to="/hq"
                    onClick={() => setMenuOpen(false)}
                    style={{...styles.menuLinkWithArrow, color: linkColor}}
                  >
                    HQ
                  </Link>

                  {hqHovered && (
                    <div
                      style={{
                        ...styles.submenu,
                        ...(submenuLeft ? styles.submenuLeft : styles.submenuRight),
                      }}
                      onMouseEnter={handleHqEnter}
                      onMouseLeave={handleHqLeave}
                    >
                      {HQ_SUBMENU.map((item) =>
                        item.comingSoon ? (
                          <span key={item.path} style={styles.submenuItemDisabled}>
                            {item.label}
                            <span style={styles.soonTag}>Soon</span>
                          </span>
                        ) : (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => { setMenuOpen(false); setHqHovered(false); }}
                            style={{...styles.submenuItem, color: linkColor}}
                          >
                            {item.label}
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </div>

                <Link to="/projects" onClick={() => setMenuOpen(false)} style={{...styles.menuLink, color: linkColor}}>
                  Projects
                </Link>
                <Link to="/about" onClick={() => setMenuOpen(false)} style={{...styles.menuLink, color: linkColor}}>
                  About
                </Link>
                <Link to="/contact" onClick={() => setMenuOpen(false)} style={{...styles.menuLink, color: linkColor}}>
                  Contact
                </Link>
                <button onClick={handleLogout} className="logout-link">
                  Log Out
                </button>
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
    color: '#f0ece0',
    textDecoration: 'none',
    display: 'block',
  },
  menuLinkWithArrow: {
    color: '#f0ece0',
    textDecoration: 'none',
    display: 'block',
    position: 'relative',
  },
  menuItemWrapper: {
    position: 'relative',
  },
  submenu: {
    position: 'absolute',
    top: 0,
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(8px)',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
    gap: '0.5rem',
    minWidth: '180px',
    zIndex: 200,
    fontSize: '1rem',
  },
  submenuRight: {
    left: '170px',
  },
  submenuLeft: {
    right: '170px',
  },
  submenuItem: {
    display: 'block',
    padding: '0.5rem 1rem',
    color: '#444',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: '500',
    textAlign: 'right',
    transition: 'background 0.2s',
  },
  submenuItemDisabled: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0.5rem 1rem',
    color: '#999',
    fontSize: '1rem',
    cursor: 'default',
    borderRadius: '6px',
  },
  soonTag: {
    fontSize: '10px',
    background: 'rgba(255,255,255,0.08)',
    color: '#6b7280',
    padding: '2px 7px',
    borderRadius: '8px',
    marginLeft: '8px',
  },
};

export default Navigation;