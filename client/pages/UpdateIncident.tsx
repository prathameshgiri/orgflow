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

  // Progress State
  const [progressText, setProgressText] = useState("");
  const [pastedImages, setPastedImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { orgId } = useOrganization();
  const { session } = useAuth();
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'closed': return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'p1_critical': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
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
                assignee_id: updateAssignee && updateAssignee !== "unassigned" ? updateAssignee : null
            })
        });
        
        if (!res.ok) throw new Error("Failed to update");
        
        toast({ title: "Incident updated successfully" });
        navigate("/dashboard/incidents");
    } catch(err) {
        toast({ title: "Failed to update incident", variant: "destructive" });
    }
  };

  const submitProgress = async () => {
    if ((!progressText.trim() && pastedImages.length === 0) || !orgId || !session || !id) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/incidents/${id}/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "x-org-id": orgId
        },
        body: JSON.stringify({ explanation: progressText, images: pastedImages })
      });
      if (res.ok) {
        toast({ title: "Progress tracked successfully!" });
        setProgressText("");
        setPastedImages([]);
      } else {
        const data = await res.json();
        toast({ title: "Failed to track progress", description: data.error, variant: "destructive" });
      }
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
          <Link to="/dashboard/incidents">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Update Incident</h1>
          <p className="text-zinc-500">
            {incident ? incident.title : `INC-${id?.substring(0, 8)}`}
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
                {incident?.title}
              </h2>
              
              <div className="flex gap-2 justify-center mb-6">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${incident ? getStatusColor(incident.status) : ''}`}>
                  {incident?.status?.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${incident ? getPriorityColor(incident.priority) : ''}`}>
                  {incident?.priority?.split('_')[1].toUpperCase()}
                </span>
              </div>

              <div className="w-full bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-5 border border-zinc-100 dark:border-zinc-800 text-left mb-8">
                <p className="text-zinc-600 dark:text-zinc-300 text-sm whitespace-pre-wrap break-words">
                  {incident?.description}
                </p>
              </div>
            </div>

            {/* Update Form */}
            <form onSubmit={handleUpdate} className="space-y-6 pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
              <h3 className="text-lg font-semibold tracking-tight">Update Incident Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label htmlFor="update-status" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Status</Label>
                  <Select value={updateStatus} onValueChange={setUpdateStatus}>
                    <SelectTrigger id="update-status" className="h-10 w-full rounded-lg bg-white dark:bg-zinc-950 shadow-sm border-zinc-200 dark:border-zinc-800">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
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
                      <SelectItem value="p1_critical">P1 Critical</SelectItem>
                      <SelectItem value="p2_high">P2 High</SelectItem>
                      <SelectItem value="p3_medium">P3 Medium</SelectItem>
                      <SelectItem value="p4_low">P4 Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="update-team" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Team</Label>
                  <Select value={updateTeam} onValueChange={setUpdateTeam}>
                    <SelectTrigger id="update-team" className="h-10 w-full rounded-lg bg-white dark:bg-zinc-950 shadow-sm border-zinc-200 dark:border-zinc-800">
                      <SelectValue placeholder="-- Unassigned --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">-- Unassigned --</SelectItem>
                      {teams.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="update-assignee" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Assignee (Person)</Label>
                  <Select value={updateAssignee} onValueChange={setUpdateAssignee}>
                    <SelectTrigger id="update-assignee" className="h-10 w-full rounded-lg bg-white dark:bg-zinc-950 shadow-sm border-zinc-200 dark:border-zinc-800 disabled:opacity-50" disabled={!updateTeam}>
                      <SelectValue placeholder={updateTeam ? "-- Unassigned --" : "Select team first"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">-- Unassigned --</SelectItem>
                      {assignableUsers.map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.users?.full_name || u.users?.email || u.id}</SelectItem>
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
