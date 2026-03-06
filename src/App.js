import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { OrgProvider } from './context/OrgContext';
import { ThemeProvider, useTokens } from './context/ThemeContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Contact from './pages/Contact';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Notes from './pages/Notes';
import HQ from './pages/HQ';
import Team from './pages/Team';
import Welcome from './pages/Welcome';
import Settings from './pages/Settings';
import Orgs from './pages/Orgs';
import './App.css';

function ProtectedLayout({ children }) {
  const t = useTokens();
  return (
    <ProtectedRoute>
      <Navigation />
      <main className="main">{children}</main>
      <p style={{
        position: 'fixed', bottom: '24px', left: 0, right: 0,
        textAlign: 'center', fontSize: '12px', fontWeight: 300,
        color: t.TEXT_SUBTLE, letterSpacing: '0.04em',
        zIndex: 5, pointerEvents: 'none', margin: 0,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        © 2026 Allez HQ · All rights reserved · Built for wealth management professionals
      </p>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <ThemeProvider>
      <OrgProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
                <Route path="/contact" element={<ProtectedLayout><Contact /></ProtectedLayout>} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/hq" element={<ProtectedLayout><HQ /></ProtectedLayout>} />
              <Route path="/hq/clients" element={<ProtectedLayout><Clients /></ProtectedLayout>} />
              <Route path="/hq/clients/:id" element={<ProtectedLayout><ClientDetail /></ProtectedLayout>} />
              <Route path="/hq/notes" element={<ProtectedLayout><Notes /></ProtectedLayout>} />
              <Route path="/hq/team" element={<ProtectedLayout><Team /></ProtectedLayout>} />
            <Route path="/hq/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
            <Route path="/hq/orgs" element={<ProtectedLayout><Orgs /></ProtectedLayout>} />
            </Routes>
          </div>
        </Router>
      </OrgProvider>
    </ThemeProvider>
  );
}

export default App;