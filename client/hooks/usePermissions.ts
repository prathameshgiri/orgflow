import { useState, useEffect } from "react";
import { useOrganization } from "./useOrganization";
import { useAuth } from "../context/AuthContext";

export function usePermissions() {
  const { orgId } = useOrganization();
  const { session } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roleName, setRoleName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPermissions() {
      if (!orgId || !session?.access_token) {
        setPermissions([]);
        setRoleName(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/me/permissions", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "x-org-id": orgId,
          }
        });

        if (response.ok) {
          const data = await response.json();
          setPermissions(data.permissions || []);
          setRoleName(data.role || null);
        }
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPermissions();
  }, [orgId, session]);

  const hasPermission = (permission: string) => {
    return permissions.includes(permission);
  };

  return { permissions, roleName, loading, hasPermission };
}
