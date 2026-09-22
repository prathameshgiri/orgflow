import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useOrgStore } from "../store/orgStore";
import { ShieldCheck, Users, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Roles = () => {
  const { session } = useAuth();
  const { activeOrganizationId } = useOrgStore();
  
  const [roles, setRoles] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<any>(null);

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
      ];
    }
    return [
      "View users in the organization",
      "View projects",
      "Cannot invite or remove users",
      "Cannot create or delete projects",
    ];
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <ShieldCheck size={48} className="text-zinc-300" />
        <div className="text-sm text-zinc-500 font-medium">Loading Roles...</div>
      </div>
    </div>
  );

  const assignedMembers = members.filter(m => m.roles?.id === selectedRole?.id);
  const capabilities = selectedRole ? getCapabilities(selectedRole.name) : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-white">Roles</h1>
          <p className="text-sm text-zinc-500 mt-1">View role capabilities and assigned members.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        
        {/* Left Sidebar: Roles List */}
        <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-[calc(100vh-160px)]">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
            <h3 className="font-semibold text-sm text-ink dark:text-white">Available Roles</h3>
          </div>
          <div className="p-2 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
            {roles.map(role => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`w-full text-left flex flex-col p-3 rounded-lg transition-all ${
                  selectedRole?.id === role.id 
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-md' 
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-ink dark:text-zinc-300'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold text-sm tracking-tight">{role.name}</span>
                </div>
                <span className={`text-[11px] mt-1.5 line-clamp-2 leading-relaxed ${
                  selectedRole?.id === role.id 
                    ? 'text-zinc-300 dark:text-zinc-600' 
                    : 'text-zinc-500'
                }`}>
                  {role.description || "No description provided."}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Right Area: Overview */}
        <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-[calc(100vh-160px)]">
          {/* Header */}
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-start bg-zinc-50 dark:bg-zinc-900/50">
            <div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-coral/10 flex items-center justify-center text-coral">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-ink dark:text-white">{selectedRole?.name || "Select a role"}</h3>
                  <p className="text-sm text-zinc-500 mt-0.5">{selectedRole?.description}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-zinc-50/30 dark:bg-zinc-950/30">
            <div className="grid gap-8 lg:grid-cols-1 md:grid-cols-2">
              
              {/* Capabilities */}
              <div>
                <h4 className="font-bold text-sm text-ink dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  What this role can do
                </h4>
                <ul className="space-y-3">
                  {capabilities.map((cap, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 shadow-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 mt-1.5 shrink-0" />
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Assigned Members */}
              <div>
                <h4 className="font-bold text-sm text-ink dark:text-white mb-4 flex items-center gap-2">
                  <Users size={16} className="text-blue-500" />
                  Assigned Members ({assignedMembers.length})
                </h4>
                
                {assignedMembers.length === 0 ? (
                  <div className="text-sm text-zinc-500 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-100 dark:border-zinc-800 text-center">
                    No users have this role.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignedMembers.map(member => (
                      <div key={member.id} className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 shadow-sm">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.users?.avatar_url} />
                          <AvatarFallback>{member.users?.full_name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{member.users?.full_name}</span>
                          <span className="text-xs text-zinc-500">{member.users?.email}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Roles;
