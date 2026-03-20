import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const OrgContext = createContext({});

export function OrgProvider({ children }) {
  const [orgId,           setOrgId]           = useState(null);
  const [userId,          setUserId]          = useState(null);
  const [userRole,        setUserRole]        = useState(null);
  const [isAdmin,         setIsAdmin]         = useState(false);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [orgLoading,      setOrgLoading]      = useState(true);

  // Hoisted with useCallback so both useEffects can reference the same function
  const load = useCallback(async () => {
    setOrgLoading(true);

    // getSession reads from local storage — no network round trip
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setOrgLoading(false); return; }

    setUserId(session.user.id);

    // Single RPC returns org_id, role, and is_platform_admin in one call
    const { data, error } = await supabase.rpc('get_my_org_context');

    if (error || !data?.length) {
      // Org membership gone — sign out
      await supabase.auth.signOut();
      setOrgLoading(false);
      return;
    }

    const { org_id, role, is_platform_admin } = data[0];

    setOrgId(org_id);
    setUserRole(role);
    setIsAdmin(role === 'admin');
    setIsPlatformAdmin(!!is_platform_admin);
    setOrgLoading(false);
  }, []);

  // Run once on mount
  useEffect(() => {
    load();
  }, [load]);

  // Re-load when auth state changes — catches sign-in after redirect
  // This is what makes roles/org load without a refresh after signing in
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') load();
      if (event === 'SIGNED_OUT') {
        setOrgId(null);
        setUserId(null);
        setUserRole(null);
        setIsAdmin(false);
        setIsPlatformAdmin(false);
        setOrgLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [load]);

  // Re-check membership whenever the user returns to this tab
  // Catches the case where an admin removed this user while the app was open
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === 'visible') load();
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [load]);

  return (
    <OrgContext.Provider value={{ orgId, userId, userRole, isAdmin, isPlatformAdmin, orgLoading }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  return useContext(OrgContext);
}