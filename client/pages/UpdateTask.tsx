import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit3, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useOrganization } from "../hooks/useOrganization";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../shared/supabase";

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
  
  // Progress State
  const [progressText, setProgressText] = useState("");
  const [pastedImages, setPastedImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Data State
  const [teams, setTeams] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const { orgId } = useOrganization();
  const { user, session } = useAuth();
  const { toast } = useToast();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
      case 'high': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
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
    // Fetch Teams
    const resTeams = await fetch('/api/teams', { headers: { 'Authorization': `Bearer ${session.access_token}`, 'x-org-id': orgId } });
    if (resTeams.ok) {
        const data = await resTeams.json();
        setTeams(Array.isArray(data) ? data : (data.teams || []));
    }
    
    // Fetch Users
    const resUsers = await fetch('/api/users', { headers: { 'Authorization': `Bearer ${session.access_token}`, 'x-org-id': orgId } });
    if (resUsers.ok) {
        const data = await resUsers.json();
        // Extract the users property from the members array objects returned by /api/users
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

  // Reset assignee when team changes if current assignee is not in new team
  useEffect(() => {
    if (updateTeamId === "none") return;
    if (users.length === 0 || teams.length === 0) return; // Wait for data to load
    const isInTeam = assignableUsers.some(u => u.id === updateAssigneeId);
    if (!isInTeam && updateAssigneeId !== "none") setUpdateAssigneeId("none");
  }, [updateTeamId, assignableUsers, users.length, teams.length, updateAssigneeId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !user || !task) return;
    
    setSubmitting(true);
    try {
      // 1. Update Task
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
        
        // 2. Log History
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

        // Send Email Notification if Reassigned
        const newAssigneeId = updateAssigneeId === "none" ? null : updateAssigneeId;
        if (newAssigneeId && newAssigneeId !== task.assignee_id) {
          try {
            await fetch("/api/notify/assignment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session?.access_token}`,
                "x-org-id": orgId,
              },
              body: JSON.stringify({
                assigneeId: newAssigneeId,
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

  const submitProgress = async () => {
    if ((!progressText.trim() && pastedImages.length === 0) || !orgId || !user || !id) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("activity_logs").insert([{
        organization_id: orgId,
        user_id: user.id,
        action: `progress_update`,
        resource: `task:${id}`,
        details: { explanation: progressText.trim(), images: pastedImages }
      }]);
      
      if (error) throw error;
      toast({ title: "Progress tracked successfully!" });
      setProgressText("");
      setPastedImages([]);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setPastedImages(prev => [...prev, event.target!.result as string]);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const removeImage = (index: number) => {
    setPastedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard/tasks">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Update Task</h1>
          <p className="text-zinc-500">
            {task ? task.title : `TASK-${id?.substring(0, 8)}`}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-zinc-500">Loading details...</div>
        ) : (
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm relative overflow-hidden">
            <div className="flex flex-col items-center w-full">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-3 text-center">
                {task?.title}
              </h2>
              
              <div className="flex gap-2 justify-center mb-6">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                  task?.status === 'todo' || task?.status === 'new' || task?.status === 'created' ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800' :
                  task?.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800' :
                  task?.status === 'review' ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' :
                  task?.status === 'done' || task?.status === 'closed' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                  'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                }`}>
                  {(task?.status === 'todo' || task?.status === 'new' || task?.status === 'created') ? 'CREATED' : (task?.status === 'done' || task?.status === 'closed') ? 'CLOSED' : task?.status?.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${task ? getPriorityColor(task.priority) : ''}`}>
                  {task?.priority?.toUpperCase()}
                </span>
              </div>

              {task?.description && (
                <div className="w-full bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-5 border border-zinc-100 dark:border-zinc-800 text-left mb-8">
                  <p className="text-zinc-600 dark:text-zinc-300 text-sm whitespace-pre-wrap break-words">
                    {task.description}
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleUpdate} className="space-y-6 pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
              <h3 className="text-lg font-semibold tracking-tight">Update Task Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label htmlFor="update-status" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Status</Label>
                  <Select value={updateStatus} onValueChange={setUpdateStatus}>
                    <SelectTrigger id="update-status" className="h-10 w-full rounded-lg bg-white dark:bg-zinc-950 shadow-sm border-zinc-200 dark:border-zinc-800">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">Created</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="review">Needs Review</SelectItem>
                      <SelectItem value="done">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="update-priority" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Priority</Label>
                  <Select value={updatePriority} onValueChange={setUpdatePriority}>
                    <SelectTrigger id="update-priority" className="h-10 w-full rounded-lg bg-white dark:bg-zinc-950 shadow-sm border-zinc-200 dark:border-zinc-800">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label htmlFor="update-team" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Assign to Team</Label>
                  <Select value={updateTeamId} onValueChange={setUpdateTeamId}>
                    <SelectTrigger id="update-team" className="h-10 w-full rounded-lg bg-white dark:bg-zinc-950 shadow-sm border-zinc-200 dark:border-zinc-800">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Team</SelectItem>
                      {teams.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="update-assignee" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Assign to Person</Label>
                  <Select value={updateAssigneeId} onValueChange={setUpdateAssigneeId}>
                    <SelectTrigger id="update-assignee" className="h-10 w-full rounded-lg bg-white dark:bg-zinc-950 shadow-sm border-zinc-200 dark:border-zinc-800">
                      <SelectValue placeholder="Select person" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {assignableUsers.map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all">
                  Confirm Update
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
