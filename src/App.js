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
import Clients from './pages/Clients';
import HQ from './pages/HQ';
import './App.css';

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <Navigation />
      <main className="main">{children}</main>
      <Footer />
    </ProtectedRoute>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>

          {/* Public routes — no login required */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes — login required */}
          <Route path="/home" element={<ProtectedLayout><Home /></ProtectedLayout>} />
          <Route path="/projects" element={<ProtectedLayout><Projects /></ProtectedLayout>} />
          <Route path="/about" element={<ProtectedLayout><About /></ProtectedLayout>} />
          <Route path="/contact" element={<ProtectedLayout><Contact /></ProtectedLayout>} />

          {/* HQ and nested pages */}
          <Route path="/hq" element={<ProtectedLayout><HQ /></ProtectedLayout>} />
          <Route path="/hq/clients" element={<ProtectedLayout><Clients /></ProtectedLayout>} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;