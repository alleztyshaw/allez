import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../App.css';

function Navigation() {
  const navigate = useNavigate();

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
          <button onClick={handleLogout}>Log Out</button>
        </nav>
      </div>
    </header>
  );
}

export default Navigation;