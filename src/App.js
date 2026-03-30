import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { OrgProvider } from './context/OrgContext';
import { ThemeProvider } from './context/ThemeContext';
import HomePage from './pages/HomePage';
import SignIn from './pages/SignIn';
import ProductPage from './pages/ProductPage';
import PlaceholderFeaturePage from './pages/PlaceholderFeaturePage';
import CompanyPage from './pages/CompanyPage';
import GetStarted from './pages/GetStarted';
import BookADemo from './pages/BookADemo';
import ResetPassword from './pages/ResetPassword';
import Signup from './pages/Signup';
import Contact from './pages/Contact';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Notes from './pages/Notes';
import CRM from './pages/CRM';
import HQ from './pages/HQ';
import DailyBrief from './pages/DailyBrief';
import Team from './pages/Team';
import Welcome from './pages/Welcome';
import Settings from './pages/Settings';
import Orgs from './pages/Orgs';
import AuditLog from './pages/AuditLog';
import StandardLayout from './components/StandardLayout';
import MobilePreviewLayout from './components/MobilePreviewLayout';
import SearchOverlay from './components/SearchOverlay';
import { useOrg } from './context/OrgContext';
import './App.css';

// Thin router — delegates to the appropriate layout based on dev mode state
function ProtectedLayout({ children }) {
  const { devMobileOverride } = useOrg();
  return devMobileOverride
    ? <MobilePreviewLayout>{children}</MobilePreviewLayout>
    : <StandardLayout>{children}</StandardLayout>;
}

// Resets scroll on every navigation — covers all routes including pre-auth pages
function ScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function App() {
  return (
    <ThemeProvider>
      <OrgProvider>
        <Router>
          <ScrollReset />
          <SearchOverlay />
          <div className="App">
            <Routes>
              <Route path="/"                element={<HomePage />} />
              <Route path="/sign-in"         element={<SignIn />} />
              <Route path="/product"         element={<ProductPage />} />
              <Route path="/product/:feature" element={<PlaceholderFeaturePage />} />
              <Route path="/company"          element={<CompanyPage />} />
              <Route path="/get-started"      element={<GetStarted />} />
              <Route path="/book-a-demo"      element={<BookADemo />} />
              <Route path="/reset-password"  element={<ResetPassword />} />
              <Route path="/signup"          element={<Signup />} />
              <Route path="/welcome"         element={<Welcome />} />
              <Route path="/contact"         element={<Contact />} />
              <Route path="/hq"              element={<ProtectedLayout><HQ           /></ProtectedLayout>} />
              <Route path="/hq/brief"        element={<ProtectedLayout><DailyBrief   /></ProtectedLayout>} />
              <Route path="/hq/clients"      element={<ProtectedLayout><Clients      /></ProtectedLayout>} />
              <Route path="/hq/clients/:id"  element={<ProtectedLayout><ClientDetail /></ProtectedLayout>} />
              <Route path="/hq/notes"        element={<ProtectedLayout><Notes        /></ProtectedLayout>} />
              <Route path="/hq/crm"          element={<ProtectedLayout><CRM          /></ProtectedLayout>} />
              <Route path="/hq/team"         element={<ProtectedLayout><Team         /></ProtectedLayout>} />
              <Route path="/hq/settings"     element={<ProtectedLayout><Settings     /></ProtectedLayout>} />
              <Route path="/hq/orgs"         element={<ProtectedLayout><Orgs         /></ProtectedLayout>} />
              <Route path="/hq/audit"        element={<ProtectedLayout><AuditLog     /></ProtectedLayout>} />
            </Routes>
          </div>
        </Router>
      </OrgProvider>
    </ThemeProvider>
  );
}

export default App;