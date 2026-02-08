import { Link } from 'react-router-dom';
import '../App.css';

function Navigation() {
  return (
    <header className="header">
      <div className="container">
        <h1>Allez</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </div>
    </header>
  );
}

export default Navigation;