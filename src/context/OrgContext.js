import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const OrgContext = createContext(null);

export function OrgProvider({ children }) {
  const [orgId, setOrgId]       = useState(null);
  const [role, setRole]         = useState(null);
  const [features, setFeatures] = useState({});
  const [orgLoading, setOrgLoading] = useState(true);

  useEffect(() => {
    async function fetchOrg() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setOrgLoading(false); return; }

      // Fetch membership (org_id + role in one query)
      const { data: member } = await supabase
        .from('org_members')
        .select('org_id, role')
        .eq('user_id', session.user.id)
        .single();

      if (!member) { setOrgLoading(false); return; }

      setOrgId(member.org_id);
      setRole(member.role);

      // Fetch feature flags for this org
      const { data: settings } = await supabase
        .from('org_settings')
        .select('features')
        .eq('org_id', member.org_id)
        .single();

      setFeatures(settings?.features || {});
      setOrgLoading(false);
    }

    fetchOrg();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchOrg();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Convenience helpers
  const isAdmin        = role === 'admin';
  const hasFeature     = (flag) => Boolean(features[flag]);

  return (
    <OrgContext.Provider value={{ orgId, role, features, orgLoading, isAdmin, hasFeature }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  return useContext(OrgContext);
}