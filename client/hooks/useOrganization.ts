import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../../shared/supabase";

export function useOrganization() {
  const { user } = useAuth();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
        .single();
        
      if (data) {
        setOrgId(data.organization_id);
      }
      setLoading(false);
    }
    
    fetchOrg();
  }, [user]);

  return { orgId, loading };
}
