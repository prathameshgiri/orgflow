import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, UserPlus, UserMinus, Shield, ShieldCheck, Mail, Calendar, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrganization } from "../hooks/useOrganization";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
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
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { supabase } from "../../shared/supabase";

export default function TeamMembers() {
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const { orgId } = useOrganization();
  const { session } = useAuth();
  const { toast } = useToast();

  const fetchTeamDetails = async () => {
    if (!id) return;
    try {
      const { data, error } = await supabase.from('teams').select('*').eq('id', id).single();
      if (data) setTeam(data);
    } catch (error) {
      console.error("Error fetching team", error);
    }
  };

  const fetchMembers = async () => {
    if (!orgId || !session?.access_token || !id) return;
    try {
      const res = await fetch(`/api/teams/${id}/members`, {
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "x-org-id": orgId
        }
      });
      if (!res.ok) throw new Error("Failed to fetch team members");
      const data = await res.json();
      setMembers(data);
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const fetchUsers = async () => {
    if (!orgId || !session?.access_token) return;
    try {
      const res = await fetch(`/api/users`, {
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "x-org-id": orgId
        }
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setAvailableUsers(data.members || []);
    } catch (error: any) {
      console.error(error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchTeamDetails(), fetchMembers(), fetchUsers()]);
      setLoading(false);
    };
    init();
  }, [orgId, id, session]);

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/teams/${id}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
          "x-org-id": orgId || ""
        },
        body: JSON.stringify({ userId: selectedUserId })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add member");
      }
      
      toast({ title: "Member added successfully" });
      setSelectedUserId("");
      await fetchMembers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    
    try {
      const res = await fetch(`/api/teams/${id}/members/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${session?.access_token}`,
          "x-org-id": orgId || ""
        }
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to remove member");
      }
      
      toast({ title: "Member removed successfully" });
      fetchMembers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const unassignedUsers = availableUsers.filter(u => !members.find(m => m.user_id === u.id));

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-10 min-h-screen bg-zinc-50/30 dark:bg-zinc-950/30">
      
      {/* Header with Breadcrumb and Team Info */}
      <div className="flex flex-col gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-8 pt-4">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
          <Link to="/dashboard/teams" className="hover:text-indigo-600 transition-colors">Teams</Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100">{team?.name || 'Loading...'}</span>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100">Members</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-full h-10 w-10 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 shadow-sm shrink-0">
            <Link to="/dashboard/teams">
              <ArrowLeft className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </Link>
          </Button>
          <div className="flex items-center gap-4 flex-1">
            <Avatar className="h-14 w-14 rounded-2xl border-2 border-white dark:border-zinc-950 shadow-sm bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400">
              <AvatarFallback className="bg-transparent font-bold text-xl">
                {team ? getInitials(team.name) : <Users className="h-6 w-6" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {team?.name || 'Team Members'}
              </h1>
              <p className="text-zinc-500 text-sm mt-1 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Manage roster and permissions for this team.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center justify-between bg-gradient-to-r from-indigo-50/50 to-transparent dark:from-indigo-950/10">
            <div className="w-full md:w-1/3">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Add New Member</h3>
              <p className="text-sm text-zinc-500 mt-1">Select an existing organization user to join this team.</p>
            </div>
            
            <div className="flex-1 flex flex-col sm:flex-row items-center gap-4 w-full">
              <div className="w-full">
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm focus:ring-4 focus:ring-indigo-500/10 w-full">
                    <SelectValue placeholder="Select a user to add" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {unassignedUsers.map(u => (
                      <SelectItem key={u.id} value={u.id} className="py-2.5 cursor-pointer rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px] bg-zinc-100 text-zinc-600">{getInitials(u.users?.full_name)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{u.users?.full_name || u.users?.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                    {unassignedUsers.length === 0 && (
                      <SelectItem value="none" disabled className="py-2.5 rounded-lg text-zinc-400">All users are already in this team</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleAddMember}
                disabled={!selectedUserId || selectedUserId === "none" || actionLoading}
                className="h-12 w-full sm:w-auto px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98]"
              >
                {actionLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    Add Member
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Members Table Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500" />
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Team Members</h3>
              <span className="ml-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold px-2 py-0.5 rounded-full">
                {members.length}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center">
              <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-zinc-500 font-medium">Loading roster...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="p-24 flex flex-col items-center justify-center text-center">
              <div className="h-24 w-24 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-6">
                <UserMinus className="h-10 w-10 text-zinc-400" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-zinc-100">No Members</h3>
              <p className="text-zinc-500 max-w-sm mx-auto">This team is currently empty. Use the form above to add members.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white dark:bg-zinc-950">
                  <TableRow className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-transparent">
                    <TableHead className="py-5 font-semibold text-zinc-500 uppercase tracking-wider text-xs">User</TableHead>
                    <TableHead className="py-5 font-semibold text-zinc-500 uppercase tracking-wider text-xs">Role</TableHead>
                    <TableHead className="py-5 font-semibold text-zinc-500 uppercase tracking-wider text-xs">Added On</TableHead>
                    <TableHead className="py-5 font-semibold text-zinc-500 uppercase tracking-wider text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.user_id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors group">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 border border-zinc-200 dark:border-zinc-800">
                            <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold text-sm">
                              {getInitials(member.users?.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">{member.users?.full_name || 'Unknown User'}</span>
                            <span className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3" /> {member.users?.email || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          Member
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 font-medium">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(member.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveMember(member.user_id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-medium rounded-lg h-9"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
