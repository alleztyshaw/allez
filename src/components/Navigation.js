import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../App.css';

function Navigation() {
  const [displayName, setDisplayName] = useState('');
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
        <nav>
          <Link to="/home">Home</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          {displayName && (
            <div className="user-info">
              <span className="welcome-message">Welcome, {displayName}!</span>
              <button onClick={handleLogout} className="logout-link">Log Out</button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navigation;