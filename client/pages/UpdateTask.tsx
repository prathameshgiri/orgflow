import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit3, Settings2, ShieldAlert, Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useOrganization } from "../hooks/useOrganization";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../shared/supabase";
import { motion } from "framer-motion";

export default function UpdateTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Update State
  const [updateStatus, setUpdateStatus] = useState("");
  const [updatePriority, setUpdatePriority] = useState("");
  const [updateTeamId, setUpdateTeamId] = useState("none");
  const [updateAssigneeId, setUpdateAssigneeId] = useState<string>("none");
  const [submitting, setSubmitting] = useState(false);

  // Data State
  const [teams, setTeams] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const { orgId } = useOrganization();
  const { user, session } = useAuth();
  const { toast } = useToast();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800 shadow-sm';
      case 'high': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      case 'medium': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'low': return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
    }
  };

  const fetchDetails = async () => {
    if (!orgId || !id) return;
    
    try {
      const { data, error } = await supabase
          .from("tasks")
          .select("*, projects(name)")
          .eq("id", id)
          .single();
          
      if (!error && data) {
        setTask(data);
        setUpdateStatus(data.status || "");
        setUpdatePriority(data.priority || "");
        setUpdateTeamId(data.team_id || "none");
        setUpdateAssigneeId(data.assignee_id || "none");
      }
    } catch (err) {
      toast({ title: "Failed to load details", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamsAndUsers = async () => {
    if (!orgId || !session) return;
    const resTeams = await fetch('/api/teams', { headers: { 'Authorization': `Bearer ${session.access_token}`, 'x-org-id': orgId } });
    if (resTeams.ok) {
        const data = await resTeams.json();
        setTeams(Array.isArray(data) ? data : (data.teams || []));
    }
    
    const resUsers = await fetch('/api/users', { headers: { 'Authorization': `Bearer ${session.access_token}`, 'x-org-id': orgId } });
    if (resUsers.ok) {
        const data = await resUsers.json();
        const membersList = Array.isArray(data) ? data : (data.members || data.users || []);
        setUsers(membersList.map((m: any) => m.users || m));
    }
  };

  useEffect(() => {
    fetchDetails();
    fetchTeamsAndUsers();
  }, [id, orgId, session]);

  const assignableUsers = React.useMemo(() => {
    return updateTeamId && updateTeamId !== "none"
      ? users.filter(u => {
          const team = teams.find(t => t.id === updateTeamId);
          return team?.team_members?.some((tm: any) => tm.user_id === u.id);
        })
      : users;
  }, [updateTeamId, users, teams]);

  useEffect(() => {
    if (updateTeamId === "none") return;
    if (users.length === 0 || teams.length === 0) return;
    const isInTeam = assignableUsers.some(u => u.id === updateAssigneeId);
    if (!isInTeam && updateAssigneeId !== "none") setUpdateAssigneeId("none");
  }, [updateTeamId, assignableUsers, users.length, teams.length, updateAssigneeId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !user || !task) return;
    
    setSubmitting(true);
    try {
      const updates: any = {};
      let changed = false;
      if (updateStatus !== task.status) { updates.status = updateStatus; changed = true; }
      if (updatePriority !== task.priority) { updates.priority = updatePriority; changed = true; }
      
      const newTeamId = updateTeamId === "none" ? null : updateTeamId;
      if (newTeamId !== task.team_id) { updates.team_id = newTeamId; changed = true; }
      
      const newAssigneeId = updateAssigneeId === "none" ? null : updateAssigneeId;
      if (newAssigneeId !== task.assignee_id) { updates.assignee_id = newAssigneeId; changed = true; }
      
      if (changed) {
        const { data: updateData, error } = await supabase.from("tasks").update(updates).eq("id", task.id).select();
        if (error) throw error;
        if (!updateData || updateData.length === 0) {
           throw new Error("Failed to update task. You might not have permission.");
        }
        
        const logPromises = [];
        if (updateStatus !== task.status) {
          logPromises.push(supabase.from("activity_logs").insert([{
            organization_id: orgId,
            user_id: user.id,
            action: `updated task status`,
            resource: `task:${task.id}`,
            details: { old: task.status, new: updateStatus }
          }]).select());
        }
        if (updatePriority !== task.priority) {
          logPromises.push(supabase.from("activity_logs").insert([{
            organization_id: orgId,
            user_id: user.id,
            action: `updated task priority`,
            resource: `task:${task.id}`,
            details: { old: task.priority, new: updatePriority }
          }]).select());
        }
        if ((updateTeamId === "none" ? null : updateTeamId) !== task.team_id) {
          logPromises.push(supabase.from("activity_logs").insert([{
            organization_id: orgId,
            user_id: user.id,
            action: `updated task team`,
            resource: `task:${task.id}`,
            details: { old: task.team_id, new: updateTeamId === "none" ? null : updateTeamId }
          }]).select());
        }
        if ((updateAssigneeId === "none" ? null : updateAssigneeId) !== task.assignee_id) {
          logPromises.push(supabase.from("activity_logs").insert([{
            organization_id: orgId,
            user_id: user.id,
            action: `reassigned task`,
            resource: `task:${task.id}`,
            details: { old: task.assignee_id, new: updateAssigneeId === "none" ? null : updateAssigneeId }
          }]).select());
        }

        const newAssigneeIdToNotify = updateAssigneeId === "none" ? null : updateAssigneeId;
        if (newAssigneeIdToNotify && newAssigneeIdToNotify !== task.assignee_id) {
          try {
            await fetch("/api/notify/assignment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session?.access_token}`,
                "x-org-id": orgId,
              },
              body: JSON.stringify({
                assigneeId: newAssigneeIdToNotify,
                type: "Task",
                itemTitle: task.title,
                itemDescription: task.description,
                linkUrl: `${window.location.origin}/dashboard/tasks/${task.id}`
              })
            });
          } catch (notifyErr) {
            console.error("Failed to send notification", notifyErr);
          }
        }
        
        const logResults = await Promise.all(logPromises);
        const logError = logResults.find(r => r.error);
        if (logError) {
          console.error("Failed to save history log:", logError.error);
          throw new Error("Task updated, but failed to save history: " + logError.error.message);
        }

        toast({ title: "Task updated successfully" });
      }
      
      navigate(`/dashboard/tasks/${task.id}/history`);
    } catch(err: any) {
      console.error(err);
      toast({ title: "Failed to update task", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-8 pt-4">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
          <Link to="/dashboard/tasks" className="hover:text-blue-600 transition-colors">Tasks</Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] sm:max-w-xs">{task?.title || 'Loading...'}</span>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100">Update</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-full h-10 w-10 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 shadow-sm shrink-0">
            <Link to="/dashboard/tasks">
              <ArrowLeft className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </Link>
          </Button>
          <div className="flex items-center gap-4 flex-1">
            <div className="h-14 w-14 rounded-2xl border-2 border-white dark:border-zinc-950 shadow-sm bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 flex items-center justify-center">
              <Edit3 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Update Task
              </h1>
              <p className="text-zinc-500 text-sm mt-1">Modify status, priority, or reasssign members.</p>
            </div>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="h-10 w-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-zinc-500 font-medium">Loading details...</p>
          </div>
        ) : (
          <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
            <div className="p-6 sm:p-8 space-y-8">
              
              {/* Task Summary Banner */}
              <div className="bg-zinc-50/80 dark:bg-zinc-900/40 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800/80 flex flex-col items-center text-center">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4 max-w-xl">
                  {task?.title}
                </h2>
                
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${
                    task?.status === 'todo' || task?.status === 'new' || task?.status === 'created' ? 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700' :
                    task?.status === 'in_progress' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800' :
                    task?.status === 'review' ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-400 dark:border-purple-800' :
                    task?.status === 'done' || task?.status === 'closed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800' :
                    'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                  }`}>
                    {(task?.status === 'todo' || task?.status === 'new' || task?.status === 'created') ? 'CREATED' : (task?.status === 'done' || task?.status === 'closed') ? 'CLOSED' : task?.status?.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm uppercase ${task ? getPriorityColor(task.priority) : ''}`}>
                    {task?.priority}
                  </span>
                </div>

                {task?.description && (
                  <div className="w-full text-left mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 text-[15px] leading-relaxed whitespace-pre-wrap">
                    {task.description}
                  </div>
                )}
              </div>

              <form onSubmit={handleUpdate} className="space-y-8">
                
                {/* Properties */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-4">
                    <Settings2 className="h-5 w-5 text-indigo-500" />
                    <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-200">Task Properties</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="update-status" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Status</Label>
                      <Select value={updateStatus} onValueChange={setUpdateStatus}>
                        <SelectTrigger id="update-status" className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-4 focus:ring-blue-500/10">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="todo" className="py-2.5">Created</SelectItem>
                          <SelectItem value="in_progress" className="py-2.5">In Progress</SelectItem>
                          <SelectItem value="review" className="py-2.5">Needs Review</SelectItem>
                          <SelectItem value="done" className="py-2.5">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="update-priority" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <ShieldAlert className="h-4 w-4 text-zinc-400" /> Priority
                      </Label>
                      <Select value={updatePriority} onValueChange={setUpdatePriority}>
                        <SelectTrigger id="update-priority" className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-4 focus:ring-blue-500/10">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="urgent" className="py-2.5 font-bold text-rose-600 dark:text-rose-400">Urgent</SelectItem>
                          <SelectItem value="high" className="py-2.5 font-semibold text-amber-600 dark:text-amber-400">High</SelectItem>
                          <SelectItem value="medium" className="py-2.5 font-medium text-blue-600 dark:text-blue-400">Medium</SelectItem>
                          <SelectItem value="low" className="py-2.5 text-zinc-600 dark:text-zinc-400">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Assignment */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-4 mt-8">
                    <Users className="h-5 w-5 text-emerald-500" />
                    <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-200">Reassignment</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="update-team" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Assign to Team</Label>
                      <Select value={updateTeamId} onValueChange={setUpdateTeamId}>
                        <SelectTrigger id="update-team" className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-4 focus:ring-blue-500/10">
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="none" className="py-2.5">No Team</SelectItem>
                          {teams.map(t => (
                            <SelectItem key={t.id} value={t.id} className="py-2.5">{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="update-assignee" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <UserPlus className="h-4 w-4 text-zinc-400" /> Assign to Person
                      </Label>
                      <Select value={updateAssigneeId} onValueChange={setUpdateAssigneeId}>
                        <SelectTrigger id="update-assignee" className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-4 focus:ring-blue-500/10">
                          <SelectValue placeholder="Select person" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="none" className="py-2.5">Unassigned</SelectItem>
                          {assignableUsers.map(u => (
                            <SelectItem key={u.id} value={u.id} className="py-2.5">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5 border border-zinc-200 dark:border-zinc-800">
                                  <AvatarFallback className="text-[9px] bg-zinc-100 text-zinc-600">{getInitials(u.full_name)}</AvatarFallback>
                                </Avatar>
                                {u.full_name || u.email}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                  <Button type="button" variant="ghost" asChild className="rounded-xl font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <Link to="/dashboard/tasks">Cancel</Link>
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting} 
                    className="h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
                  >
                    {submitting ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Edit3 className="mr-2 h-4 w-4" /> Save Changes
                      </>
                    )}
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
