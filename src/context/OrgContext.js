import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

// Exported so useWindowWidth can read devMobileOverride without a circular dep
export const OrgContext = createContext({});

export function OrgProvider({ children }) {
  const [orgId,           setOrgId]           = useState(null);
  const [userId,          setUserId]          = useState(null);
  const [realRole,        setRealRole]        = useState(null);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [orgLoading,      setOrgLoading]      = useState(true);

  // Dev overrides — only available to platform admins, purely cosmetic (no DB writes)
  const [devRoleOverride,   setDevRoleOverride]   = useState(null);   // string | null
  const [devMobileOverride, setDevMobileOverride] = useState(false);  // boolean

  const isDevMode = devRoleOverride !== null || devMobileOverride;

  const load = useCallback(async () => {
    setOrgLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setOrgLoading(false); return; }
    setUserId(session.user.id);
    const { data, error } = await supabase.rpc('get_my_org_context');
    if (error || !data?.length) {
      await supabase.auth.signOut();
      setOrgLoading(false);
      return;
    }
    const { org_id, role, is_platform_admin } = data[0];
    setOrgId(org_id);
    setRealRole(role);
    setIsPlatformAdmin(!!is_platform_admin);
    setOrgLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') load();
      if (event === 'SIGNED_OUT') {
        setOrgId(null); setUserId(null); setRealRole(null);
        setIsPlatformAdmin(false); setOrgLoading(false);
        setDevRoleOverride(null); setDevMobileOverride(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [load]);

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === 'visible') load();
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [load]);

  const userRole         = devRoleOverride ?? realRole;
  const effectiveIsAdmin = userRole === 'admin';

  function exitDevMode() {
    setDevRoleOverride(null);
    setDevMobileOverride(false);
  }

  return (
    <OrgContext.Provider value={{
      orgId, userId, orgLoading,
      userRole,
      isAdmin:         effectiveIsAdmin,
      isPlatformAdmin,
      isDevMode,
      devRoleOverride,
      devMobileOverride,
      setDevRoleOverride,
      setDevMobileOverride,
      exitDevMode,
    }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  return useContext(OrgContext);
}