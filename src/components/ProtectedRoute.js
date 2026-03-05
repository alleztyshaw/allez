import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  // Still loading
  if (session === undefined) return null;

  // Not logged in — send to login
  if (!session) return <Navigate to="/" />;

  // Logged in but onboarding not complete — send to welcome
  // Skip redirect if already on /welcome to avoid a loop
  const onboardingComplete = session.user?.user_metadata?.onboarding_complete;
  if (!onboardingComplete && location.pathname !== '/welcome') {
    return <Navigate to="/welcome" />;
  }

  return children;
}

export default ProtectedRoute;