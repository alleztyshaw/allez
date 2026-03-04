import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../App.css';

const HQ_SUBMENU = [
  { label: 'Clients', path: '/hq/clients' },
  { label: 'AI Note Taker', path: '/hq/notes', comingSoon: true },
  { label: 'CRM', path: '/hq/crm', comingSoon: true },
];

function Navigation() {
  const [displayName, setDisplayName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [hqHovered, setHqHovered] = useState(false);
  const [submenuLeft, setSubmenuLeft] = useState(false);
  const hqRef = useRef(null);
  const navigate = useNavigate();

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
                <Link to="/home" onClick={() => setMenuOpen(false)} style={styles.menuLink}>
                  Home
                </Link>

                {/* HQ with flyout submenu */}
                <div
                  ref={hqRef}
                  style={styles.menuItemWrapper}
                  onMouseEnter={() => setHqHovered(true)}
                  onMouseLeave={() => setHqHovered(false)}
                >
                  <Link
                    to="/hq"
                    onClick={() => setMenuOpen(false)}
                    style={styles.menuLinkWithArrow}
                  >
                    HQ
                  </Link>

                  {hqHovered && (
                    <div
                      style={{
                        ...styles.submenu,
                        ...(submenuLeft ? styles.submenuLeft : styles.submenuRight),
                      }}
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
                            style={styles.submenuItem}
                          >
                            {item.label}
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </div>

                <Link to="/projects" onClick={() => setMenuOpen(false)} style={styles.menuLink}>
                  Projects
                </Link>
                <Link to="/about" onClick={() => setMenuOpen(false)} style={styles.menuLink}>
                  About
                </Link>
                <Link to="/contact" onClick={() => setMenuOpen(false)} style={styles.menuLink}>
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
    background: '#1e2330',
    border: '1px solid rgba(201,168,76,0.25)',
    borderRadius: '10px',
    padding: '6px',
    minWidth: '180px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    zIndex: 1000,
  },
  submenuRight: {
    left: '100%',
    marginLeft: '6px',
  },
  submenuLeft: {
    right: '100%',
    marginRight: '6px',
  },
  submenuItem: {
    display: 'block',
    padding: '9px 14px',
    color: '#f0ece0',
    textDecoration: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'background 0.15s',
  },
  submenuItemDisabled: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '9px 14px',
    color: '#6b7280',
    fontSize: '14px',
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