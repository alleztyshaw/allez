import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const OrgContext = createContext(null);

export function OrgProvider({ children }) {
  const [orgId, setOrgId] = useState(null);
  const [orgLoading, setOrgLoading] = useState(true);

  useEffect(() => {
    async function fetchOrg() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setOrgLoading(false); return; }

      const { data } = await supabase
        .from('org_members')
        .select('org_id')
        .eq('user_id', session.user.id)
        .single();

      setOrgId(data?.org_id || null);
      setOrgLoading(false);
    }

    fetchOrg();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchOrg();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <OrgContext.Provider value={{ orgId, orgLoading }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  return useContext(OrgContext);
}