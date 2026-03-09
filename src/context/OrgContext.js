import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const OrgContext = createContext({});

export function OrgProvider({ children }) {
  const [orgId,           setOrgId]           = useState(null);
  const [userRole,        setUserRole]        = useState(null);
  const [isAdmin,         setIsAdmin]         = useState(false);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [orgLoading,      setOrgLoading]      = useState(true);

  useEffect(() => {
    async function load() {
      setOrgLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setOrgLoading(false); return; }

      // SECURITY DEFINER RPCs — bypass RLS to avoid circular reference 500s
      const [{ data: resolvedOrgId }, { data: platAdmin }] = await Promise.all([
        supabase.rpc('get_user_org_id'),
        supabase.rpc('is_platform_admin'),
      ]);

      if (!resolvedOrgId) { setOrgLoading(false); return; }
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
    }

    load();
  }, []);

  return (
    <OrgContext.Provider value={{ orgId, userRole, isAdmin, isPlatformAdmin, orgLoading }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  return useContext(OrgContext);
}