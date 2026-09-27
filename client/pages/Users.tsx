import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useOrgStore } from "../store/orgStore";
import { usePermissions } from "../hooks/usePermissions";
import { supabase } from "../../shared/supabase";
import { Plus, MoreHorizontal, Users as UsersIcon, Shield, Search, Activity, UserPlus, TrendingUp, History, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { motion } from "framer-motion";

const Users = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { activeOrganizationId } = useOrgStore();
  const { hasPermission, loading: permsLoading } = usePermissions();
  const { toast } = useToast();
  
  const [members, setMembers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const fetchUserHistory = async (user: any) => {
    setSelectedUser(user);
    setIsHistoryOpen(true);
    
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          created_at,
          teams ( id, name, description )
        `)
        .eq('user_id', user.id);
        
      if (data) {
        setUserTeams(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async () => {
    if (!activeOrganizationId) {
      setLoading(false);
      return;
    }
    try {
      let fetchedMembers: any[] = [];
      let fetchedRoles: any[] = [];

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
        fetchData();
      } else {
        toast({ title: "Error", description: "Could not update user role.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const totalMembers = members.length;
  const adminMembers = members.filter(m => m.roles?.name?.toLowerCase().includes("admin")).length;
  const standardMembers = totalMembers - adminMembers;

  let processedMembers = members.filter(m => 
    m.users?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.users?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (sortBy === "newest") {
    processedMembers.sort((a, b) => new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime());
  } else if (sortBy === "oldest") {
    processedMembers.sort((a, b) => new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime());
  } else if (sortBy === "role") {
    processedMembers.sort((a, b) => (a.roles?.name || "").localeCompare(b.roles?.name || ""));
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6 pt-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            People
          </h1>
          <p className="text-zinc-500 mt-2 text-lg">Manage members and roles in your organization.</p>
        </div>
        {hasPermission('users.create') && (
          <Button asChild className="group relative h-11 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 font-bold text-white hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-500/25">
            <Link to="/dashboard/users/invite">
              <span className="relative z-10 flex items-center justify-center">
                <Plus className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-90" /> 
                Invite member
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
            </Link>
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-4 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm overflow-hidden divide-y md:divide-y-0 md:divide-x divide-zinc-200/80 dark:divide-zinc-800/80"
      >
        <div className="p-6 relative group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors flex flex-col justify-between min-h-[140px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Total Members</p>
              <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{totalMembers}</h3>
            </div>
            <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
              <UsersIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-sm text-zinc-500 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400" /> Across organization
          </div>
        </div>

        <div className="p-6 relative group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors flex flex-col justify-between min-h-[140px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Administrators</p>
              <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{adminMembers}</h3>
            </div>
            <div className="h-12 w-12 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform duration-300">
              <Shield className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-sm text-zinc-500 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-violet-400" /> Full access
          </div>
        </div>

        <div className="p-6 relative group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors flex flex-col justify-between min-h-[140px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Standard Users</p>
              <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{standardMembers}</h3>
            </div>
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
              <UserPlus className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-sm text-zinc-500 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-blue-400" /> Limited access
          </div>
        </div>
        
        <div className="p-6 relative group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors flex flex-col justify-between min-h-[140px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-1">System Status</p>
              <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                Active
              </h3>
            </div>
            <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-sm text-zinc-500 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> All systems normal
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
          {/* Toolbar */}
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="relative w-full sm:w-80 group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                <Search size={18} />
              </div>
              <Input 
                placeholder="Search people by name or email..." 
                className="h-11 pl-10 rounded-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus-visible:ring-4 focus-visible:ring-indigo-500/10 transition-all shadow-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-sm font-medium text-zinc-500">Sort:</span>
              <select 
                className="h-11 px-4 rounded-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="role">Role</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading || permsLoading ? (
            <div className="p-20 flex flex-col items-center justify-center">
              <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-zinc-500 font-medium">Loading people data...</p>
            </div>
          ) : processedMembers.length === 0 ? (
            <div className="p-24 flex flex-col items-center justify-center text-center">
              <div className="h-24 w-24 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-6">
                <UsersIcon className="h-10 w-10 text-zinc-400" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-zinc-100">No people found</h3>
              <p className="text-zinc-500 max-w-sm mx-auto mb-6">
                {searchQuery ? "No members matched your search criteria. Try a different term." : "Your organization doesn't have any members yet."}
              </p>
              {!searchQuery && hasPermission('users.create') && (
                <Button asChild className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                  <Link to="/dashboard/users/invite">Invite your first member</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white dark:bg-zinc-950">
                  <TableRow className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-transparent">
                    <TableHead className="py-5 font-semibold text-zinc-500 uppercase tracking-wider text-xs">User</TableHead>
                    <TableHead className="py-5 font-semibold text-zinc-500 uppercase tracking-wider text-xs">Role</TableHead>
                    <TableHead className="py-5 font-semibold text-zinc-500 uppercase tracking-wider text-xs">Joined</TableHead>
                    {hasPermission('users.delete') && <TableHead className="w-[80px]"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedMembers.map((member) => (
                    <TableRow key={member.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors border-zinc-100 dark:border-zinc-800">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                            <AvatarImage src={member.users?.avatar_url} />
                            <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold">{member.users?.full_name?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{member.users?.full_name}</span>
                            <span className="text-xs text-zinc-500">{member.users?.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Select 
                            value={member.roles?.id} 
                            onValueChange={(val) => handleRoleChange(member.id, val)}
                            disabled={!hasPermission('users.edit')}
                          >
                            <SelectTrigger className="w-[180px] h-9 text-xs rounded-lg border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500/20">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map(role => (
                                <SelectItem key={role.id} value={role.id} className="text-sm">
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {member.roles?.is_system_role && (
                            <div className="h-6 w-6 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 tooltip-trigger" title="System Role">
                              <Shield className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        {new Date(member.joined_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      {hasPermission('users.delete') && (
                        <TableCell className="py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => fetchUserHistory(member.users)} className="cursor-pointer">
                                <History className="mr-2 h-4 w-4" /> User History
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600 cursor-pointer">
                                Remove from Org
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </motion.div>

      {/* History Sheet */}
      <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>User History</SheetTitle>
            <SheetDescription>
              Activity and team memberships for this user.
            </SheetDescription>
          </SheetHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                <Avatar className="h-12 w-12 border border-zinc-200 dark:border-zinc-700">
                  <AvatarImage src={selectedUser.avatar_url} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 text-lg font-bold">{selectedUser.full_name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedUser.full_name}</h4>
                  <p className="text-sm text-zinc-500">{selectedUser.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-2">Timeline</h4>
                
                <div className="relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-3 space-y-6 pb-4">
                  {/* Join Event */}
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-zinc-950 bg-emerald-500" />
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Joined Organization</p>
                    <p className="text-xs text-zinc-500 mt-1">Added by System Admin</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {new Date(members.find(m => m.id === selectedUser.id)?.joined_at || new Date()).toLocaleString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Team Memberships */}
                  {userTeams.length > 0 ? userTeams.map((ut, idx) => (
                    <div key={idx} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-zinc-950 bg-indigo-500" />
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Assigned to Team</p>
                      <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 text-xs font-medium border border-indigo-100 dark:border-indigo-800/30">
                        <Briefcase className="h-3 w-3" />
                        {ut.teams?.name}
                      </div>
                      <p className="text-xs text-zinc-400 mt-2">
                        {new Date(ut.created_at).toLocaleString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'
                        })}
                      </p>
                    </div>
                  )) : (
                    <div className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-zinc-950 bg-zinc-300 dark:bg-zinc-700" />
                      <p className="text-sm font-medium text-zinc-500 italic">No teams assigned yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Users;
