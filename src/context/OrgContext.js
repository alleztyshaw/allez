import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const OrgContext = createContext(null);

export function OrgProvider({ children }) {
  const [orgId, setOrgId]               = useState(null);
  const [role, setRole]                 = useState(null);
  const [features, setFeatures]         = useState({});
  const [isPlatformOrg, setIsPlatformOrg] = useState(false);
  const [orgLoading, setOrgLoading]     = useState(true);

  useEffect(() => {
    async function fetchOrg() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setOrgLoading(false); return; }

      const { data: member } = await supabase
        .from('org_members')
        .select('org_id, role')
        .eq('user_id', session.user.id)
        .single();

      if (!member) { setOrgLoading(false); return; }

      setOrgId(member.org_id);
      setRole(member.role);

      // Check if this user belongs to the platform org
      const { data: org } = await supabase
        .from('organizations')
        .select('is_platform_org')
        .eq('org_id', member.org_id)
        .single();

      setIsPlatformOrg(org?.is_platform_org || false);

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

  // ─── Role hierarchy ───────────────────────────────────────────────────────
  const isAdmin      = role === 'admin';
  const isManager    = role === 'manager' || isAdmin;
  const isAdvisor    = role === 'advisor' || isManager;
  const isAssociate  = role === 'associate' || isAdvisor;
  const isCompliance = role === 'compliance';

  // Platform admin — Allez org member with admin role
  const isPlatformAdmin = isPlatformOrg && isAdmin;

  // ─── Permission helpers ───────────────────────────────────────────────────
  const canCreateClients  = isAdvisor    || isPlatformAdmin;
  const canEditClients    = isAdvisor    || isPlatformAdmin;
  const canDeleteClients  = isManager    || isPlatformAdmin;
  const canCreateNotes    = isAssociate  || isPlatformAdmin;
  const canEditNotes      = isAssociate  || isPlatformAdmin;
  const canDeleteNotes    = isManager    || isPlatformAdmin;
  const canManageUsers    = isAdmin      || isPlatformAdmin;
  const canViewAllClients = isManager    || isCompliance || isPlatformAdmin;
  const canManageAllOrgs  = isPlatformAdmin;

  // ─── Feature flags ────────────────────────────────────────────────────────
  const hasFeature = (flag) => Boolean(features[flag]);

  return (
    <OrgContext.Provider value={{
      orgId, role, features, orgLoading,
      // Role booleans
      isAdmin, isManager, isAdvisor, isAssociate, isCompliance,
      isPlatformAdmin,
      // Permission helpers
      canCreateClients, canEditClients, canDeleteClients,
      canCreateNotes, canEditNotes, canDeleteNotes,
      canManageUsers, canViewAllClients, canManageAllOrgs,
      // Feature flags
      hasFeature,
    }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  return useContext(OrgContext);
}