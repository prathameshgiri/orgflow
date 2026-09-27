import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useOrgStore } from "../store/orgStore";
import { ShieldCheck, Users as UsersIcon, CheckCircle2, Lock, Search, Shield, Plus, Activity } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const Roles = () => {
  const { session } = useAuth();
  const { activeOrganizationId } = useOrgStore();
  
  const [roles, setRoles] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!activeOrganizationId) return;
      try {
        const headers = {
          Authorization: `Bearer ${session?.access_token}`,
          "x-org-id": activeOrganizationId,
        };

        const [rolesRes, usersRes] = await Promise.all([
          fetch("/api/roles", { headers }),
          fetch("/api/users", { headers })
        ]);

        const rolesData = await rolesRes.json();
        const usersData = await usersRes.json();

        if (rolesRes.ok) setRoles(rolesData.roles || []);
        if (usersRes.ok) setMembers(usersData.members || []);

        if (rolesData.roles?.length > 0) {
          setSelectedRole(rolesData.roles[0]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeOrganizationId, session]);

  const getCapabilities = (roleName: string) => {
    if (['Superadmin', 'Administrator', 'Manager'].includes(roleName)) {
      return [
        "View all users and projects",
        "Invite new users to the organization",
        "Update user roles",
        "Remove users from the organization",
        "Create, edit, and delete projects",
        "Manage automations and configurations",
      ];
    }
    return [
      "View users in the organization",
      "View projects",
      "Cannot invite or remove users",
      "Cannot create or delete projects",
      "Read-only access to system configurations",
    ];
  };

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const assignedMembers = members.filter(m => m.roles?.id === selectedRole?.id);
  const capabilities = selectedRole ? getCapabilities(selectedRole.name) : [];

  const totalRoles = roles.length;
  const systemRolesCount = roles.filter(r => r.is_system_role).length;
  const totalAssignedUsers = members.filter(m => m.roles?.id).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6 pt-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Roles & Permissions
          </h1>
          <p className="text-zinc-500 mt-2 text-lg">Define capabilities and manage access levels.</p>
        </div>
        <Button asChild className="group relative h-11 overflow-hidden rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-md">
          <button>
            <span className="relative z-10 flex items-center justify-center">
              <Plus className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-90" /> 
              Create Custom Role
            </span>
          </button>
        </Button>
      </div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm overflow-hidden divide-y md:divide-y-0 md:divide-x divide-zinc-200/80 dark:divide-zinc-800/80"
      >
        <div className="p-6 relative group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors flex flex-col justify-between min-h-[140px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Total Roles</p>
              <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{totalRoles}</h3>
            </div>
            <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-sm text-zinc-500 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400" /> Active in organization
          </div>
        </div>

        <div className="p-6 relative group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors flex flex-col justify-between min-h-[140px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-1">System Roles</p>
              <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{systemRolesCount}</h3>
            </div>
            <div className="h-12 w-12 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform duration-300">
              <Lock className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-sm text-zinc-500 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-rose-400" /> Immutable defaults
          </div>
        </div>

        <div className="p-6 relative group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors flex flex-col justify-between min-h-[140px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Assigned Users</p>
              <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{totalAssignedUsers}</h3>
            </div>
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
              <UsersIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-sm text-zinc-500 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-blue-400" /> Mapped to roles
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center">
          <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-zinc-500 font-medium">Loading roles data...</p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid gap-6 lg:grid-cols-[300px_1fr]"
        >
          {/* Left Sidebar: Roles List */}
          <Card className="rounded-2xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                  <Search size={16} />
                </div>
                <Input 
                  placeholder="Find a role..." 
                  className="h-10 pl-9 rounded-lg bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:ring-indigo-500/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="p-2 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
              {filteredRoles.map(role => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full text-left flex flex-col p-3.5 rounded-xl transition-all border ${
                    selectedRole?.id === role.id 
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md border-zinc-900 dark:border-white' 
                      : 'bg-transparent border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300 hover:border-zinc-200 dark:hover:border-zinc-800'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-bold text-sm tracking-tight">{role.name}</span>
                    {role.is_system_role && (
                      <Shield className={`h-3.5 w-3.5 ${selectedRole?.id === role.id ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-400'}`} />
                    )}
                  </div>
                  <span className={`text-xs mt-1.5 line-clamp-2 leading-relaxed ${
                    selectedRole?.id === role.id 
                      ? 'text-zinc-400 dark:text-zinc-500' 
                      : 'text-zinc-500'
                  }`}>
                    {role.description || "No description provided."}
                  </span>
                </button>
              ))}
              
              {filteredRoles.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-zinc-500 text-sm">No roles found.</p>
                </div>
              )}
            </div>
          </Card>

          {/* Right Area: Overview */}
          <Card className="rounded-2xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden flex flex-col h-[600px] relative">
            
            {/* Banner Header */}
            <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none text-indigo-900 dark:text-indigo-100">
                <ShieldCheck size={180} />
              </div>
              <div className="relative z-10 flex items-start gap-4">
                <div className="h-14 w-14 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-extrabold text-2xl text-zinc-900 dark:text-zinc-100 tracking-tight">{selectedRole?.name || "Select a role"}</h3>
                    {selectedRole?.is_system_role && (
                      <span className="px-2.5 py-1 rounded-md bg-zinc-200/50 dark:bg-zinc-800 text-[10px] uppercase tracking-widest font-bold text-zinc-600 dark:text-zinc-400">
                        System Role
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 max-w-lg">{selectedRole?.description || "This role defines specific permissions and access levels across the platform."}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid gap-10 md:grid-cols-2">
                
                {/* Capabilities Area */}
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-5 flex items-center gap-2 uppercase tracking-wider">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    Capabilities
                  </h4>
                  <ul className="space-y-3">
                    {capabilities.map((cap, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
                        <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="leading-relaxed">{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Assigned Members Area */}
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-5 flex items-center gap-2 uppercase tracking-wider">
                    <UsersIcon size={16} className="text-blue-500" />
                    Assigned Users ({assignedMembers.length})
                  </h4>
                  
                  {assignedMembers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-zinc-100 dark:border-zinc-800 border-dashed">
                      <UsersIcon className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mb-3" />
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No assigned users</p>
                      <p className="text-xs text-zinc-500 mt-1">Users can be assigned this role from the People page.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {assignedMembers.map(member => (
                        <div key={member.id} className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors group">
                          <Avatar className="h-10 w-10 border border-zinc-200 dark:border-zinc-700">
                            <AvatarImage src={member.users?.avatar_url} />
                            <AvatarFallback className="bg-indigo-50 text-indigo-700">{member.users?.full_name?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{member.users?.full_name}</span>
                            <span className="text-xs text-zinc-500 truncate">{member.users?.email}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Roles;
