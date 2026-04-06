import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

// Wraps all /hq/* routes. On mount, checks whether the current user
// has completed onboarding. If not, redirects to /onboarding.
// Renders nothing until the check resolves to avoid a flash of protected content.
export default function OnboardingGate({ children }) {
  const navigate  = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkOnboarding() {
      const { data: { session } } = await supabase.auth.getSession();

      // No session — let the existing auth flow handle the redirect
      if (!session) {
        if (!cancelled) setChecked(true);
        return;
      }

      const { data, error } = await supabase
        .from('org_members')
        .select('onboarding_complete')
        .eq('user_id', session.user.id)
        .single();

      if (cancelled) return;

      if (error || !data) {
        // Row missing or query failed — send to onboarding as a safe default
        navigate('/onboarding', { replace: true });
        return;
      }

      if (!data.onboarding_complete) {
        navigate('/onboarding', { replace: true });
        return;
      }

      setChecked(true);
    }

    checkOnboarding();
    return () => { cancelled = true; };
  }, [navigate]);

  // Hold rendering until the check completes — prevents a flash of app content
  if (!checked) return null;

  return children;
}