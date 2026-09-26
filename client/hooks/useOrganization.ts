import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useOrgStore } from "../store/orgStore";
import { supabase } from "../../shared/supabase";

export function useOrganization() {
  const { user } = useAuth();
  const { activeOrganizationId, setActiveOrganizationId } = useOrgStore();
  const [orgId, setOrgId] = useState<string | null>(activeOrganizationId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeOrganizationId) {
      setOrgId(activeOrganizationId);
      setLoading(false);
    }
  }, [activeOrganizationId]);

  useEffect(() => {
    async function fetchOrg() {
      if (!user) {
        setOrgId(null);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("users")
        .select("organization_id")
        .eq("id", user.id)
        .maybeSingle();
        
      if (data?.organization_id) {
        setOrgId(data.organization_id);
        if (!activeOrganizationId) {
          setActiveOrganizationId(data.organization_id);
        }
      }
      setLoading(false);
    }
    
    fetchOrg();
  }, [user, activeOrganizationId, setActiveOrganizationId]);

  return { orgId: activeOrganizationId || orgId, loading };
}
