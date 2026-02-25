import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../App.css';

function Navigation() {
  const [displayName, setDisplayName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setDisplayName(session.user.user_metadata.display_name);
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <h1>Allez</h1>
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
                <Link to="/home" onClick={() => setMenuOpen(false)}>Home</Link>
                <Link to="/projects" onClick={() => setMenuOpen(false)}>Projects</Link>
                <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
                <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
                <button onClick={handleLogout} className="logout-link">Log Out</button>
              </nav>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navigation;