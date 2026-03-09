import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const OrgContext = createContext({});

export function OrgProvider({ children }) {
  const [orgId,           setOrgId]           = useState(null);
  const [userRole,        setUserRole]        = useState(null);
  const [isAdmin,         setIsAdmin]         = useState(false);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [orgLoading,      setOrgLoading]      = useState(true);

  // Hoisted with useCallback so both useEffects can reference the same function
  const load = useCallback(async () => {
    setOrgLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setOrgLoading(false); return; }

    // SECURITY DEFINER RPCs — bypass RLS to avoid circular reference 500s
    const [{ data: resolvedOrgId }, { data: platAdmin }] = await Promise.all([
      supabase.rpc('get_user_org_id'),
      supabase.rpc('is_platform_admin'),
    ]);

    // If org membership is gone (e.g. removed while app was open), sign out immediately
    if (!resolvedOrgId) {
      await supabase.auth.signOut();
      setOrgLoading(false);
      return;
    }

    setOrgId(resolvedOrgId);
    setIsPlatformAdmin(!!platAdmin);

    // Fetch role directly — safe now that org_id is resolved
    const { data: memberRow } = await supabase
      .from('org_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('org_id', resolvedOrgId)
      .single();

    if (memberRow?.role) {
      setUserRole(memberRow.role);
      setIsAdmin(memberRow.role === 'admin');
    }

    setOrgLoading(false);
  }, []);

  // Run once on mount
  useEffect(() => {
    load();
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
    <OrgContext.Provider value={{ orgId, userRole, isAdmin, isPlatformAdmin, orgLoading }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  return useContext(OrgContext);
}