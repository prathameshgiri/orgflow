import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit3, Settings, ShieldAlert, CheckCircle2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useOrganization } from "../hooks/useOrganization";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../shared/supabase";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

export default function UpdateIncident() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Update State
  const [updateStatus, setUpdateStatus] = useState("");
  const [updatePriority, setUpdatePriority] = useState("");
  const [updateTeam, setUpdateTeam] = useState("");
  const [updateAssignee, setUpdateAssignee] = useState("");
  const [teams, setTeams] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [assignableUsers, setAssignableUsers] = useState<any[]>([]);

  const { orgId } = useOrganization();
  const { session } = useAuth();
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
      case 'in_progress': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      case 'resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
      case 'closed': return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'p1_critical': return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
      case 'p2_high': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
      case 'p3_medium': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      case 'p4_low': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
    }
  };

  const fetchDetails = async () => {
    if (!orgId || !session || !id) return;
    
    try {
      const { data: incData, error: incError } = await supabase
          .from("incidents")
          .select("*")
          .eq("id", id)
          .single();
          
      if (!incError && incData) {
        setIncident(incData);
        setUpdateStatus(incData.status || "");
        setUpdatePriority(incData.priority || "");
        setUpdateTeam(incData.team_id || "");
        setUpdateAssignee(incData.assignee_id || "");
      }
      
      const resTeams = await fetch('/api/teams', { headers: { 'Authorization': `Bearer ${session.access_token}`, 'x-org-id': orgId } });
      if (resTeams.ok) {
          const data = await resTeams.json();
          setTeams(Array.isArray(data) ? data : (data.teams || []));
      }
      const resUsers = await fetch('/api/users', { headers: { 'Authorization': `Bearer ${session.access_token}`, 'x-org-id': orgId } });
      if (resUsers.ok) {
          const data = await resUsers.json();
          setUsers(Array.isArray(data) ? data : (data.users || []));
      }
    } catch (err) {
      toast({ title: "Failed to load details", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, orgId, session]);

  useEffect(() => {
    if (!updateTeam || updateTeam === "unassigned") {
      setAssignableUsers(users);
      return;
    }
    const team = teams.find(t => t.id === updateTeam);
    if (team) {
       const mappedUsers = (team.team_members || []).map((tm: any) => ({
           id: tm.user_id,
           users: tm.users || { full_name: 'Unknown Member' }
       }));
       setAssignableUsers(mappedUsers);
       
       if (updateAssignee && updateAssignee !== "unassigned" && !mappedUsers.find((u: any) => u.id === updateAssignee)) {
         setUpdateAssignee("");
       }
    } else if (teams.length > 0) {
       setAssignableUsers([]);
       if (updateAssignee && updateAssignee !== "unassigned") setUpdateAssignee("");
    }
  }, [updateTeam, users, teams]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !session || !incident) return;
    try {
        const res = await fetch(`/api/incidents/${incident.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'x-org-id': orgId
            },
            body: JSON.stringify({
                status: updateStatus,
                priority: updatePriority,
                team_id: updateTeam && updateTeam !== "unassigned" ? updateTeam : null,
                assignee_id: updateAssignee && updateAssignee !== "unassigned" ? updateAssignee : null,
                explanation: "Updated incident details via dashboard"
            })
        });
        
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || "Failed to update");
        }
        
        toast({ title: "Incident updated successfully" });
        navigate(-1);
    } catch(err: any) {
        toast({ title: "Failed to update incident", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-8 pt-4">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
          <button onClick={() => navigate(-1)} className="hover:text-indigo-600 transition-colors">Tickets</button>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100">Update Incident</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-full h-10 w-10 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 shadow-sm shrink-0">
            <ArrowLeft className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          </Button>
          <div className="flex items-center gap-4 flex-1">
            <div className="h-14 w-14 rounded-2xl border-2 border-white dark:border-zinc-950 shadow-sm bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 flex items-center justify-center">
              <Edit3 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Update Ticket
              </h1>
              <p className="text-zinc-500 text-sm mt-1">
                {incident ? incident.title.replace('[SCTASK] ', '') : `INC-${id?.substring(0, 8)}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
        {loading ? (
          <div className="py-12 text-center text-zinc-500">
             <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
             Loading details...
          </div>
        ) : (
          <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            
            <div className="p-8">
              <div className="flex flex-col items-center w-full mb-10">
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4 text-center">
                  {incident?.title.replace('[SCTASK] ', '')}
                </h2>
                
                <div className="flex gap-3 justify-center mb-8">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider shadow-sm ${incident ? getStatusColor(incident.status) : ''}`}>
                    {incident?.status?.replace('_', ' ')}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider shadow-sm ${incident ? getPriorityColor(incident.priority) : ''}`}>
                    {incident?.priority?.split('_')[1]}
                  </span>
                </div>

                <div className="w-full bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 text-left shadow-inner">
                  <p className="text-zinc-600 dark:text-zinc-300 text-base leading-relaxed whitespace-pre-wrap break-words">
                    {incident?.description}
                  </p>
                </div>
              </div>

              {/* Update Form */}
              <form onSubmit={handleUpdate} className="space-y-8 pt-8 border-t border-zinc-100 dark:border-zinc-800/50">
                <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                   <Settings className="h-5 w-5 text-indigo-500" /> Update Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50/50 dark:bg-zinc-900/30 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <div className="space-y-3">
                    <Label htmlFor="update-status" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Status</Label>
                    <Select value={updateStatus} onValueChange={setUpdateStatus}>
                      <SelectTrigger id="update-status" className="h-12 w-full rounded-xl bg-white dark:bg-zinc-950 shadow-sm border-zinc-200 dark:border-zinc-800">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="new" className="py-2.5 font-medium text-rose-600">New</SelectItem>
                        <SelectItem value="in_progress" className="py-2.5 font-medium text-amber-600">In Progress</SelectItem>
                        <SelectItem value="resolved" className="py-2.5 font-medium text-emerald-600">Resolved</SelectItem>
                        <SelectItem value="closed" className="py-2.5 font-medium text-zinc-600">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="update-priority" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Priority</Label>
                    <Select value={updatePriority} onValueChange={setUpdatePriority}>
                      <SelectTrigger id="update-priority" className="h-12 w-full rounded-xl bg-white dark:bg-zinc-950 shadow-sm border-zinc-200 dark:border-zinc-800">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="p1_critical" className="py-2.5 font-bold text-rose-600">P1 Critical</SelectItem>
                        <SelectItem value="p2_high" className="py-2.5 font-bold text-orange-500">P2 High</SelectItem>
                        <SelectItem value="p3_medium" className="py-2.5 font-bold text-amber-500">P3 Medium</SelectItem>
                        <SelectItem value="p4_low" className="py-2.5 font-bold text-blue-500">P4 Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="update-team" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Team Assignment</Label>
                    <Select value={updateTeam} onValueChange={setUpdateTeam}>
                      <SelectTrigger id="update-team" className="h-12 w-full rounded-xl bg-white dark:bg-zinc-950 shadow-sm border-zinc-200 dark:border-zinc-800">
                        <SelectValue placeholder="-- Unassigned --" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="unassigned" className="py-2.5 italic text-zinc-500">-- Unassigned --</SelectItem>
                        {teams.map(t => (
                          <SelectItem key={t.id} value={t.id} className="py-2.5 font-medium">{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="update-assignee" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Assignee (Person)</Label>
                    <Select value={updateAssignee} onValueChange={setUpdateAssignee}>
                      <SelectTrigger id="update-assignee" className="h-12 w-full rounded-xl bg-white dark:bg-zinc-950 shadow-sm border-zinc-200 dark:border-zinc-800 disabled:opacity-50" disabled={!updateTeam}>
                        <SelectValue placeholder={updateTeam ? "-- Unassigned --" : "Select team first"} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="unassigned" className="py-2.5 italic text-zinc-500">-- Unassigned --</SelectItem>
                        {assignableUsers.map(u => (
                          <SelectItem key={u.id} value={u.id} className="py-2.5 font-medium">{u.users?.full_name || u.users?.email || u.id}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" className="h-12 px-8 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98]">
                    <Save className="h-4 w-4 mr-2" /> Confirm Update
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
