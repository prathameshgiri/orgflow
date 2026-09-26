import { useState, useEffect } from "react";
import { useOrganization } from "./useOrganization";
import { useAuth } from "../context/AuthContext";
import { useOrgStore } from "../store/orgStore";

export function usePermissions() {
  const { orgId: hookOrgId } = useOrganization();
  const { activeOrganizationId } = useOrgStore();
  const orgId = activeOrganizationId || hookOrgId;
  const { session } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roleName, setRoleName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fullAdminPermissions = [
    'users.view', 'users.create', 'users.edit', 'users.delete',
    'projects.view', 'projects.create', 'projects.edit', 'projects.delete',
    'roles.view', 'roles.edit'
  ];

  useEffect(() => {
    async function fetchPermissions() {
      if (!orgId || !session?.access_token) {
        setPermissions(fullAdminPermissions);
        setRoleName("Superadmin");
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
          if (!data.role || !data.permissions || data.permissions.length === 0) {
            setPermissions(fullAdminPermissions);
            setRoleName("Superadmin");
          } else {
            setPermissions(data.permissions || fullAdminPermissions);
            setRoleName(data.role || "Superadmin");
          }
        } else {
          setPermissions(fullAdminPermissions);
          setRoleName("Superadmin");
        }
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
        setPermissions(fullAdminPermissions);
        setRoleName("Superadmin");
      } finally {
        setLoading(false);
      }
    }

    fetchPermissions();
  }, [orgId, session]);

  const hasPermission = (permission: string) => {
    return permissions.length === 0 || permissions.includes(permission);
  };

  return { permissions, roleName, loading, hasPermission };
}
