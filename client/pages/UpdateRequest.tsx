import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useOrganization } from "../hooks/useOrganization";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../shared/supabase";

export default function UpdateRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);

  // Update State
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateTeam, setUpdateTeam] = useState("unassigned");
  const [updateAssignee, setUpdateAssignee] = useState("unassigned");
  
  // Progress State
  const [progressText, setProgressText] = useState("");
  const [pastedImages, setPastedImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { orgId } = useOrganization();
  const { user, session } = useAuth();
  const { toast } = useToast();

  const fetchDetails = async () => {
    if (!orgId || !id) return;
    
    try {
      const { data, error } = await supabase
          .from("service_requests")
          .select("*, requester:requester_id(full_name), assignee:assignee_id(full_name)")
          .eq("id", id)
          .single();
          
      if (!error && data) {
        setRequest(data);
        setUpdateStatus(data.status || "new");
        setUpdateAssignee(data.assignee_id || "unassigned");
        setUpdateTeam(data.team_id || "unassigned");
      }

      // Fetch users for assignment
      const { data: usersData } = await supabase
        .from("organization_members")
        .select("user_id, users(full_name)")
        .eq("organization_id", orgId);
      
      if (usersData) {
        setUsers(usersData.map((u: any) => ({ id: u.user_id, name: u.users?.full_name })));
      }

      // Fetch teams with members
      const res = await fetch(`/api/teams`, {
        headers: { 
          "x-org-id": orgId,
          "Authorization": `Bearer ${session?.access_token}`
        }
      });
      if (res.ok) {
        const teamsData = await res.json();
        setTeams(teamsData);
      }
    } catch (err) {
      toast({ title: "Failed to load details", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, orgId]);

  // Compute assignable members: if a team is selected, use team's members directly; else all users
  const teamMembers = React.useMemo(() => {
    if (!updateTeam || updateTeam === "unassigned") return users;
    const team = teams.find(t => t.id === updateTeam);
    if (!team || !team.team_members || team.team_members.length === 0) return users;
    // Use the team_members data directly (already has user_id + users.full_name from API)
    return team.team_members
      .map((m: any) => ({ id: m.user_id, name: m.users?.full_name }))
      .filter((u: any) => u.name);
  }, [updateTeam, teams, users]);

  // Reset assignee when team changes if current assignee is not in new team
  useEffect(() => {
    if (updateTeam === "unassigned") return;
    const isInTeam = teamMembers.some(u => u.id === updateAssignee);
    if (!isInTeam) setUpdateAssignee("unassigned");
  }, [updateTeam, teamMembers]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !user || !request) return;
    
    setSubmitting(true);
    try {
      // 1. Update Request
      const updates: any = {};
      let changed = false;
      if (updateStatus !== request.status) { updates.status = updateStatus; changed = true; }
      const newAssigneeId = updateAssignee === "unassigned" ? null : updateAssignee;
      const newTeamId = updateTeam === "unassigned" ? null : updateTeam;
      if (newAssigneeId !== request.assignee_id) { updates.assignee_id = newAssigneeId; changed = true; }
      if (newTeamId !== request.team_id) { updates.team_id = newTeamId; changed = true; }
      
      if (changed) {
        const { error } = await supabase.from("service_requests").update(updates).eq("id", request.id);
        if (error) throw error;
        
        // 2. Log History
        const logPromises = [];
        if (updateStatus !== request.status) {
          logPromises.push(supabase.from("activity_logs").insert([{
            organization_id: orgId,
            user_id: user.id,
            action: `updated request status`,
            resource: `request:${request.id}`,
            details: { old: request.status, new: updateStatus }
          }]));
        }
        if (newAssigneeId !== request.assignee_id) {
          logPromises.push(supabase.from("activity_logs").insert([{
            organization_id: orgId,
            user_id: user.id,
            action: `updated request assignee`,
            resource: `request:${request.id}`,
            details: { old: request.assignee_id, new: newAssigneeId }
          }]));
        }
        if (newTeamId !== request.team_id) {
          logPromises.push(supabase.from("activity_logs").insert([{
            organization_id: orgId,
            user_id: user.id,
            action: `updated request team`,
            resource: `request:${request.id}`,
            details: { old: request.team_id, new: newTeamId }
          }]));
        }
        
        await Promise.all(logPromises);

        // Send Email Notification if Reassigned
        if (newAssigneeId && newAssigneeId !== request.assignee_id) {
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
                type: "Service Request",
                itemTitle: request.title,
                itemDescription: request.details,
                linkUrl: `${window.location.origin}/dashboard/requests/${request.id}`
              })
            });
          } catch (notifyErr) {
            console.error("Failed to send notification", notifyErr);
          }
        }

        toast({ title: "Request updated successfully" });
      }
      
      navigate(`/dashboard/requests/${request.id}/history`);
    } catch(err) {
      toast({ title: "Failed to update request", variant: "destructive" });
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
        resource: `request:${id}`,
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen pt-4">
      <div className="flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <Button variant="outline" size="icon" className="rounded-full h-10 w-10 shrink-0" asChild>
          <Link to="/dashboard/requests">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
            Update Request
          </h1>
          <p className="text-zinc-500 mt-1">
            {request ? request.title : `REQ-${id?.substring(0, 8)}`}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="py-12 text-center text-zinc-500">Loading details...</div>
        ) : (
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-8 shadow-sm relative overflow-hidden">
            <div className="flex flex-col items-center w-full mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4 text-center">
                {request?.title}
              </h2>
              
              <div className="flex gap-2 justify-center mb-6">
                <span className={`px-4 py-1.5 rounded-full text-[13px] font-bold border ${
                  request?.status === 'new' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
                  request?.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800' :
                  request?.status === 'resolved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
                  request?.status === 'closed' ? 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700' :
                  'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                }`}>
                  {request?.status?.replace('_', ' ').toUpperCase() || 'NEW'}
                </span>
              </div>

              {request?.details && (
                <div className="w-full bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 text-left mb-8 shadow-sm">
                  <p className="text-zinc-600 dark:text-zinc-300 text-[15px] whitespace-pre-wrap break-words leading-relaxed">
                    {request.details}
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleUpdate} className="space-y-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Update Request Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="update-status" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Status</Label>
                  <Select value={updateStatus} onValueChange={setUpdateStatus}>
                    <SelectTrigger id="update-status" className="h-12 w-full rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-team" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Team</Label>
                  <Select value={updateTeam} onValueChange={v => { setUpdateTeam(v); }}>
                    <SelectTrigger id="update-team" className="h-12 w-full rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="unassigned">No Team</SelectItem>
                      {teams.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="update-assignee" className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    Assignee (Person) {updateTeam !== "unassigned" && <span className="text-zinc-400 font-normal text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">filtered to team members</span>}
                  </Label>
                  <Select value={updateAssignee} onValueChange={setUpdateAssignee}>
                    <SelectTrigger id="update-assignee" className="h-12 w-full rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-indigo-500">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {teamMembers.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 px-8 rounded-xl h-12 font-bold transition-all">
                  {submitting ? "Updating..." : "Confirm Update"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
