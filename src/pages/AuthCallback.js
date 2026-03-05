import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const DARK = '#0f1117';
const GOLD = '#c9a84c';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase automatically processes the token from the URL hash
    // We just need to wait for the session to be established
    async function handleCallback() {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth callback error:', error);
        navigate('/');
        return;
      }

      if (session) {
        const onboardingComplete = session.user?.user_metadata?.onboarding_complete;
        if (onboardingComplete) {
          navigate('/hq');
        } else {
          navigate('/welcome');
        }
      } else {
        // Session not ready yet — listen for it
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (session) {
            subscription.unsubscribe();
            const onboardingComplete = session.user?.user_metadata?.onboarding_complete;
            if (onboardingComplete) {
              navigate('/hq');
            } else {
              navigate('/welcome');
            }
          } else if (event === 'SIGNED_OUT') {
            navigate('/');
          }
        });
      }
    }

    handleCallback();
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      background: DARK,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: GOLD, fontSize: '22px', fontFamily: "'Cormorant Garamond', serif", marginBottom: '12px' }}>
          Allez HQ
        </p>
        <p style={{ color: '#7a7d8a', fontSize: '14px' }}>Signing you in…</p>
      </div>
    </div>
  );
}