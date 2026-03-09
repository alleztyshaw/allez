import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { OrgProvider } from './context/OrgContext';
import { ThemeProvider, useTokens } from './context/ThemeContext';
import { SidebarProvider, useSidebar } from './context/SidebarContext';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Contact from './pages/Contact';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Notes from './pages/Notes';
import CRM from './pages/CRM';
import HQ from './pages/HQ';
import Team from './pages/Team';
import Welcome from './pages/Welcome';
import Settings from './pages/Settings';
import Orgs from './pages/Orgs';
import AuditLog from './pages/AuditLog';
import {
  TOPBAR_HEIGHT, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_BREAKPOINT,
} from './utils/hqConstants';
import './App.css';

function ProtectedLayout({ children }) {
  const t = useTokens();
  const { collapsed } = useSidebar();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handler = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const isMobile  = windowWidth < SIDEBAR_BREAKPOINT;
  const sidebarW  = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  const marginLeft = isMobile ? 0 : sidebarW;

  return (
    <ProtectedRoute>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: t.BG }}>
        <Sidebar />
        <div style={{
          marginTop:     TOPBAR_HEIGHT,
          marginLeft,
          flex:          1,
          display:       'flex',
          flexDirection: 'column',
          minWidth:      0,
          transition:    'margin-left 0.22s cubic-bezier(0.4,0,0.2,1)',
        }}>
          <main style={{ flex: 1 }}>{children}</main>
          <p style={{
            textAlign:     'center',
            fontSize:      '12px',
            fontWeight:    300,
            color:         t.TEXT_SUBTLE,
            letterSpacing: '0.04em',
            padding:       '24px 20px',
            margin:        0,
            fontFamily:    "'DM Sans', sans-serif",
          }}>
            © 2026 Allez HQ · All rights reserved · Built for wealth management professionals
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <ThemeProvider>
      <OrgProvider>
        <SidebarProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/"        element={<Login />} />
                <Route path="/signup"  element={<Signup />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/contact"          element={<ProtectedLayout><Contact    /></ProtectedLayout>} />
                <Route path="/hq"               element={<ProtectedLayout><HQ         /></ProtectedLayout>} />
                <Route path="/hq/clients"       element={<ProtectedLayout><Clients    /></ProtectedLayout>} />
                <Route path="/hq/clients/:id"   element={<ProtectedLayout><ClientDetail /></ProtectedLayout>} />
                <Route path="/hq/notes"         element={<ProtectedLayout><Notes      /></ProtectedLayout>} />
                <Route path="/hq/crm"           element={<ProtectedLayout><CRM        /></ProtectedLayout>} />
                <Route path="/hq/team"          element={<ProtectedLayout><Team       /></ProtectedLayout>} />
                <Route path="/hq/settings"      element={<ProtectedLayout><Settings   /></ProtectedLayout>} />
                <Route path="/hq/orgs"          element={<ProtectedLayout><Orgs       /></ProtectedLayout>} />
                <Route path="/hq/audit"         element={<ProtectedLayout><AuditLog   /></ProtectedLayout>} />
              </Routes>
            </div>
          </Router>
        </SidebarProvider>
      </OrgProvider>
    </ThemeProvider>
  );
}

export default App;