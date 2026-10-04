import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, X, Settings, Ticket, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen pt-4">
      <div className="flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 shrink-0" asChild>
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
          <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
              {/* Request Summary Banner */}
              <div className="bg-zinc-50/80 dark:bg-zinc-900/40 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800/80 flex flex-col items-center text-center">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4 max-w-xl">
                  {request?.title}
                </h2>
                
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${
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
                  <div className="w-full text-left mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 text-[15px] leading-relaxed whitespace-pre-wrap">
                    {request.details}
                  </div>
                )}
              </div>

            <form onSubmit={handleUpdate} className="space-y-8 pt-10 border-t border-zinc-100 dark:border-zinc-800/50">
              {/* Left/Right Grid for Classification and Assignment */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pt-6">
                
                {/* Left side: Request Properties */}
                <div className="bg-card p-8 sm:p-10 rounded-3xl space-y-8 flex flex-col h-full border border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex flex-col gap-2 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-xl">
                        <Settings className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h3 className="font-bold text-xl text-zinc-800 dark:text-zinc-100">Request Properties</h3>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Update the current status of this request.</p>
                  </div>
                  
                  <div className="flex flex-col gap-6 flex-1">
                    <div className="space-y-3">
                      <Label htmlFor="update-status" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Status</Label>
                      <Select value={updateStatus} onValueChange={setUpdateStatus}>
                        <SelectTrigger id="update-status" className="h-14 rounded-xl">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="new" className="py-3 font-medium text-rose-600">New</SelectItem>
                          <SelectItem value="in_progress" className="py-3 font-medium text-amber-600">In Progress</SelectItem>
                          <SelectItem value="resolved" className="py-3 font-medium text-emerald-600">Resolved</SelectItem>
                          <SelectItem value="closed" className="py-3 font-medium text-zinc-600">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Right side: Reassignment / Assignment */}
                <div className="bg-card p-8 sm:p-10 rounded-3xl space-y-8 flex flex-col h-full border border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex flex-col gap-2 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2.5 rounded-xl">
                        <Ticket className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="font-bold text-xl text-zinc-800 dark:text-zinc-100">Reassignment</h3>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Transfer ownership of this request to a different team or person.</p>
                  </div>
                  
                  <div className="flex flex-col gap-6 flex-1">
                    <div className="space-y-3">
                      <Label htmlFor="update-team" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Assign to Team</Label>
                      <Select value={updateTeam} onValueChange={setUpdateTeam}>
                        <SelectTrigger id="update-team" className="h-14 rounded-xl">
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="unassigned" className="py-3 italic text-zinc-500">-- Unassigned --</SelectItem>
                          {teams.map(t => (
                            <SelectItem key={t.id} value={t.id} className="py-3 font-medium">{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="update-assignee" className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                        Assign to Person {updateTeam !== "unassigned" && <span className="text-zinc-400 font-normal text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">filtered</span>}
                      </Label>
                      <Select value={updateAssignee} onValueChange={setUpdateAssignee}>
                        <SelectTrigger id="update-assignee" className="h-14 rounded-xl disabled:opacity-50" disabled={!updateTeam}>
                          <SelectValue placeholder={updateTeam ? "Select person" : "Select team first"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="unassigned" className="py-3 italic text-zinc-500">-- Unassigned --</SelectItem>
                          {teamMembers.map(u => (
                            <SelectItem key={u.id} value={u.id} className="py-3 font-medium">{u.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={submitting} className="h-12 px-8 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98]">
                  {submitting ? "Updating..." : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Confirm Update
                    </>
                  )}
                </Button>
              </div>
            </form>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
