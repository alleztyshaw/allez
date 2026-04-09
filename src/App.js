import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { OrgProvider } from './context/OrgContext';
import { ThemeProvider } from './context/ThemeContext';
import HomePage from './pages/HomePage';
import SignIn from './pages/SignIn';
import ProductPage from './pages/ProductPage';
import CompanyPage from './pages/CompanyPage';
import GetStarted from './pages/GetStarted';
import BookADemo from './pages/BookADemo';
import StayInTouch from './pages/StayInTouch';
import NotesPage from './pages/product/NotesPage';
import DailyBriefPage from './pages/product/DailyBriefPage';
import ClientProfilesPage from './pages/product/ClientProfilesPage';
import CRMPage from './pages/product/CRMPage';
import CompliancePage from './pages/product/CompliancePage';
import SearchPage from './pages/product/SearchPage';
import TeamPage from './pages/product/TeamPage';
import ResetPassword from './pages/ResetPassword';
import Signup from './pages/Signup';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import SecurityPage from './pages/SecurityPage';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Notes from './pages/Notes';
import CRM from './pages/CRM';
import HQ from './pages/HQ';
import DailyBrief from './pages/DailyBrief';
import Welcome from './pages/Welcome';
import Settings from './pages/Settings';
import Orgs from './pages/Orgs';
import OrgDetail from './pages/OrgDetail';
import AuditLog from './pages/AuditLog';
import OnboardingPage from './pages/OnboardingPage';
import OnboardingGate from './components/onboarding/OnboardingGate';
import StandardLayout from './components/StandardLayout';
import MobilePreviewLayout from './components/MobilePreviewLayout';
import SearchOverlay from './components/SearchOverlay';
import { useOrg } from './context/OrgContext';
import './App.css';

// Thin router — delegates to the appropriate layout based on dev mode state.
// OnboardingGate intercepts any /hq/* route and redirects to /onboarding
// if the current user has not completed onboarding.
function ProtectedLayout({ children }) {
  const { devMobileOverride } = useOrg();
  return (
    <OnboardingGate>
      {devMobileOverride
        ? <MobilePreviewLayout>{children}</MobilePreviewLayout>
        : <StandardLayout>{children}</StandardLayout>}
    </OnboardingGate>
  );
}

// Resets scroll on every navigation — covers all routes including pre-auth pages
function ScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function App() {
  return (
    <HelmetProvider>
    <ThemeProvider>
      <OrgProvider>
        <Router>
          <ScrollReset />
          <SearchOverlay />
          <div className="App">
            <Routes>
              <Route path="/"                          element={<HomePage />} />
              <Route path="/sign-in"                   element={<SignIn />} />
              <Route path="/product"                   element={<ProductPage />} />
              <Route path="/product/notes"             element={<NotesPage />} />
              <Route path="/product/daily-brief"       element={<DailyBriefPage />} />
              <Route path="/product/clients"           element={<ClientProfilesPage />} />
              <Route path="/product/crm"               element={<CRMPage />} />
              <Route path="/product/compliance"        element={<CompliancePage />} />
              <Route path="/product/search"            element={<SearchPage />} />
              <Route path="/product/team"              element={<TeamPage />} />
              <Route path="/company"                   element={<CompanyPage />} />
              <Route path="/get-started"               element={<GetStarted />} />
              <Route path="/book-a-demo"               element={<BookADemo />} />
              <Route path="/stay-in-touch"             element={<StayInTouch />} />
              <Route path="/reset-password"            element={<ResetPassword />} />
              <Route path="/signup"                    element={<Signup />} />
              <Route path="/welcome"                   element={<Welcome />} />
              <Route path="/contact"                   element={<Contact />} />
              <Route path="/legal/privacy-policy"      element={<PrivacyPolicy />} />
              <Route path="/legal/terms-of-service"    element={<TermsOfService />} />
              <Route path="/security"                  element={<SecurityPage />} />
              <Route path="/onboarding"                element={<OnboardingPage />} />
              <Route path="/hq"              element={<ProtectedLayout><HQ           /></ProtectedLayout>} />
              <Route path="/hq/brief"        element={<ProtectedLayout><DailyBrief   /></ProtectedLayout>} />
              <Route path="/hq/clients"      element={<ProtectedLayout><Clients      /></ProtectedLayout>} />
              <Route path="/hq/clients/:id"  element={<ProtectedLayout><ClientDetail /></ProtectedLayout>} />
              <Route path="/hq/notes"        element={<ProtectedLayout><Notes        /></ProtectedLayout>} />
              <Route path="/hq/crm"          element={<ProtectedLayout><CRM          /></ProtectedLayout>} />
              <Route path="/hq/settings"     element={<ProtectedLayout><Settings     /></ProtectedLayout>} />
              <Route path="/hq/orgs"         element={<ProtectedLayout><Orgs         /></ProtectedLayout>} />
              <Route path="/hq/orgs/:orgId"  element={<ProtectedLayout><OrgDetail    /></ProtectedLayout>} />
              <Route path="/hq/audit"        element={<ProtectedLayout><AuditLog     /></ProtectedLayout>} />
            </Routes>
          </div>
        </Router>
      </OrgProvider>
    </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;