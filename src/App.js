import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Projects from './pages/Projects';
import About from './pages/About';
import Contact from './pages/Contact';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>

          {/* Public routes — no login required */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes — login required */}
          <Route path="/home" element={
            <ProtectedRoute>
              <Navigation />
              <main className="main"><Home /></main>
              <Footer />
            </ProtectedRoute>
          } />

          <Route path="/projects" element={
            <ProtectedRoute>
              <Navigation />
              <main className="main"><Projects /></main>
              <Footer />
            </ProtectedRoute>
          } />

          <Route path="/about" element={
            <ProtectedRoute>
              <Navigation />
              <main className="main"><About /></main>
              <Footer />
            </ProtectedRoute>
          } />

          <Route path="/contact" element={
            <ProtectedRoute>
              <Navigation />
              <main className="main"><Contact /></main>
              <Footer />
            </ProtectedRoute>
          } />

        </Routes>
      </div>
    </Router>
  );
}

export default App;