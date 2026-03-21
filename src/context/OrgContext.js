import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

// Exported so useWindowWidth can read devMobileOverride without a circular dep
export const OrgContext = createContext({});

export function OrgProvider({ children }) {
  const [orgId,           setOrgId]           = useState(null);
  const [userId,          setUserId]          = useState(null);
  const [realRole,        setRealRole]        = useState(null);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [isDemoOrg,       setIsDemoOrg]       = useState(false);
  const [orgLoading,      setOrgLoading]      = useState(true);

  // Dev overrides — platform admin only
  const [devRoleOverride,   setDevRoleOverride]   = useState(null);
  const [devMobileOverride, setDevMobileOverride] = useState(false);

  // Demo role override — available to all members of a demo org
  const [demoRoleOverride, setDemoRoleOverride] = useState(null);

  // Org switcher — platform admin only, in-memory context switch
  const [switchedOrgId,   setSwitchedOrgId]   = useState(null);
  const [switchedOrgName, setSwitchedOrgName] = useState(null);
  const [switchedIsDemo,  setSwitchedIsDemo]  = useState(false);

  const isDevMode  = devRoleOverride !== null || devMobileOverride;
  const isDemoMode = demoRoleOverride !== null;
  const isOrgSwitched = switchedOrgId !== null;

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
    const { org_id, role, is_platform_admin, is_demo } = data[0];
    setOrgId(org_id);
    setRealRole(role);
    setIsPlatformAdmin(!!is_platform_admin);
    setIsDemoOrg(!!is_demo);
    setOrgLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') load();
      if (event === 'SIGNED_OUT') {
        setOrgId(null); setUserId(null); setRealRole(null);
        setIsPlatformAdmin(false); setIsDemoOrg(false); setOrgLoading(false);
        setDevRoleOverride(null); setDevMobileOverride(false);
        setDemoRoleOverride(null);
        setSwitchedOrgId(null); setSwitchedOrgName(null); setSwitchedIsDemo(false);
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

  // Effective values — switched org takes priority over real org
  const effectiveOrgId   = switchedOrgId ?? orgId;
  const effectiveIsDemo  = isOrgSwitched ? switchedIsDemo : isDemoOrg;

  // Effective role — dev override → demo override → real role
  // When org-switched, default to admin so platform admin has full access
  const userRole         = devRoleOverride ?? demoRoleOverride ?? (isOrgSwitched ? 'admin' : realRole);
  const effectiveIsAdmin = userRole === 'admin';

  function exitDevMode() {
    setDevRoleOverride(null);
    setDevMobileOverride(false);
  }

  function exitDemoRole() {
    setDemoRoleOverride(null);
  }

  function switchOrg(id, name, isDemo) {
    setSwitchedOrgId(id);
    setSwitchedOrgName(name);
    setSwitchedIsDemo(!!isDemo);
    // Reset role overrides when switching org
    setDemoRoleOverride(null);
    setDevRoleOverride(null);
  }

  function exitSwitchedOrg() {
    setSwitchedOrgId(null);
    setSwitchedOrgName(null);
    setSwitchedIsDemo(false);
    setDemoRoleOverride(null);
  }

  return (
    <OrgContext.Provider value={{
      orgId:          effectiveOrgId,
      realOrgId:      orgId,
      userId,
      orgLoading,
      userRole,
      isAdmin:          effectiveIsAdmin,
      isPlatformAdmin,
      isDemoOrg:        effectiveIsDemo,
      isDevMode,
      isDemoMode,
      isOrgSwitched,
      switchedOrgName,
      devRoleOverride,
      devMobileOverride,
      demoRoleOverride,
      setDevRoleOverride,
      setDevMobileOverride,
      setDemoRoleOverride,
      exitDevMode,
      exitDemoRole,
      switchOrg,
      exitSwitchedOrg,
    }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  return useContext(OrgContext);
}