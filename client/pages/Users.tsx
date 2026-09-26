import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useOrgStore } from "../store/orgStore";
import { usePermissions } from "../hooks/usePermissions";
import { supabase } from "../../shared/supabase";
import { Plus, MoreHorizontal, UserCheck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Users = () => {
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const { activeOrganizationId } = useOrgStore();
  const { hasPermission, loading: permsLoading } = usePermissions();
  const { toast } = useToast();
  
  const [members, setMembers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!activeOrganizationId) {
      setLoading(false);
      return;
    }
    try {
      let fetchedMembers: any[] = [];
      let fetchedRoles: any[] = [];

      // 1. Try fetching through Express API if session token is available
      if (session?.access_token) {
        try {
          const headers = {
            Authorization: `Bearer ${session.access_token}`,
            "x-org-id": activeOrganizationId,
          };

          const [usersRes, rolesRes] = await Promise.all([
            fetch("/api/users", { headers }),
            fetch("/api/roles", { headers })
          ]);

          if (usersRes.ok) {
            const data = await usersRes.json();
            fetchedMembers = data.members || [];
          }

          if (rolesRes.ok) {
            const data = await rolesRes.json();
            fetchedRoles = data.roles || [];
          }
        } catch (apiErr) {
          console.warn("API fetch error, falling back to direct Supabase query:", apiErr);
        }
      }

      // 2. Direct Supabase Fallback for members
      if (fetchedMembers.length === 0) {
        const { data: directUsers, error: usersErr } = await supabase
          .from("users")
          .select(`
            id, full_name, email, avatar_url, created_at, role_id,
            roles ( id, name, is_system_role )
          `)
          .eq("organization_id", activeOrganizationId);

        if (directUsers && directUsers.length > 0) {
          fetchedMembers = directUsers.map((u: any) => ({
            id: u.id,
            joined_at: u.created_at,
            users: {
              id: u.id,
              full_name: u.full_name,
              email: u.email,
              avatar_url: u.avatar_url
            },
            roles: u.roles || { name: 'Superadmin', is_system_role: true }
          }));
        } else if (usersErr) {
          // If relationship join failed, fetch plain users
          const { data: plainUsers } = await supabase
            .from("users")
            .select("id, full_name, email, avatar_url, created_at, role_id")
            .eq("organization_id", activeOrganizationId);
          if (plainUsers && plainUsers.length > 0) {
            fetchedMembers = plainUsers.map((u: any) => ({
              id: u.id,
              joined_at: u.created_at,
              users: {
                id: u.id,
                full_name: u.full_name,
                email: u.email,
                avatar_url: u.avatar_url
              },
              roles: { name: 'Superadmin', is_system_role: true }
            }));
          }
        }
      }

      // 3. Direct Supabase Fallback for roles
      if (fetchedRoles.length === 0) {
        const { data: directRoles } = await supabase
          .from("roles")
          .select("id, name, description, is_system_role")
          .eq("organization_id", activeOrganizationId);

        if (directRoles && directRoles.length > 0) {
          fetchedRoles = directRoles;
        } else {
          fetchedRoles = [
            { id: "superadmin", name: "Superadmin", is_system_role: true },
            { id: "administrator", name: "Administrator", is_system_role: true },
            { id: "manager", name: "Manager", is_system_role: true },
            { id: "member", name: "Member", is_system_role: true },
            { id: "read_only", name: "Read Only", is_system_role: true }
          ];
        }
      }

      setMembers(fetchedMembers);
      setRoles(fetchedRoles);
    } catch (error) {
      console.error("Users page load error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeOrganizationId, session]);

  const handleRoleChange = async (memberId: string, newRoleId: string) => {
    try {
      let updated = false;
      if (session?.access_token) {
        const response = await fetch(`/api/users/${memberId}/role`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            "x-org-id": activeOrganizationId!,
          },
          body: JSON.stringify({ roleId: newRoleId }),
        });
        if (response.ok) {
          updated = true;
        }
      }

      if (!updated) {
        const { error } = await supabase
          .from("users")
          .update({ role_id: newRoleId })
          .eq("id", memberId);
        if (!error) updated = true;
      }

      if (updated) {
        toast({ title: "Role Updated", description: "User role has been updated." });
        fetchData(); // Refresh list
      } else {
        toast({ title: "Error", description: "Could not update user role.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading || permsLoading) return <div>Loading People...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">People</h1>
          <p className="text-zinc-500">Manage members in your organization.</p>
        </div>
        
        {hasPermission('users.create') && (
          <Button onClick={() => navigate("/dashboard/users/invite")}>
            <Plus className="mr-2 h-4 w-4" /> Invite member
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50 dark:bg-zinc-900">
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              {hasPermission('users.delete') && <TableHead className="w-[100px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-zinc-500">
                  No members found in this organization.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={member.users?.avatar_url} />
                        <AvatarFallback>{member.users?.full_name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{member.users?.full_name}</span>
                        <span className="text-xs text-zinc-500">{member.users?.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Select 
                        value={member.roles?.id} 
                        onValueChange={(val) => handleRoleChange(member.id, val)}
                        disabled={!hasPermission('users.edit')}
                      >
                        <SelectTrigger className="w-[180px] h-8 text-xs">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map(role => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {member.roles?.is_system_role && (
                        <Shield className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-500">
                    {new Date(member.joined_at).toLocaleDateString()}
                  </TableCell>
                  {hasPermission('users.delete') && (
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Users;
