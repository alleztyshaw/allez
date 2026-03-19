import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const IDLE_TIMEOUT_MS = 12 * 60 * 60 * 1000; // 12 hours

// Events that count as "user is active"
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

export default function useIdleTimeout() {
  const navigate   = useNavigate();
  const timerRef   = useRef(null);

  useEffect(() => {
    function resetTimer() {
      // Clear whatever timer is running and start a fresh 1-hour countdown
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(handleIdle, IDLE_TIMEOUT_MS);
    }

    async function handleIdle() {
      // Sign out, then send to login with a reason so the user knows why
      await supabase.auth.signOut();
      navigate('/?reason=idle', { replace: true });
    }

    // Attach activity listeners to the whole window
    ACTIVITY_EVENTS.forEach(event => window.addEventListener(event, resetTimer, { passive: true }));

    // Start the initial timer as soon as the hook mounts
    resetTimer();

    // Cleanup: remove listeners and clear timer when user navigates away or logs out
    return () => {
      ACTIVITY_EVENTS.forEach(event => window.removeEventListener(event, resetTimer));
      clearTimeout(timerRef.current);
    };
  }, [navigate]);
}