import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrganization } from "../hooks/useOrganization";
import { supabase } from "../../shared/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export default function CreateChange() {
  const navigate = useNavigate();
  const { orgId } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();

  const [teams, setTeams] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [riskLevel, setRiskLevel] = useState("low");
  const [teamId, setTeamId] = useState("none");
  const [requesterId, setRequesterId] = useState("none");
  const [status, setStatus] = useState("draft");

  useEffect(() => {
    async function fetchData() {
      if (!orgId) return;
      const [orgTeamsRes, usersRes] = await Promise.all([
        supabase.from("teams").select("*").eq("organization_id", orgId),
        supabase.from("users").select("*").eq("organization_id", orgId)
      ]);
      setTeams(orgTeamsRes.data || []);
      setUsers(usersRes.data || []);
      setRequesterId(user?.id || "none");
      setLoading(false);
    }
    fetchData();
  }, [orgId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !title) return;
    
    setIsSubmitting(true);
    
    const payload = {
      organization_id: orgId,
      title,
      description: description || null,
      risk_level: riskLevel,
      team_id: teamId === "none" ? null : teamId,
      requester_id: requesterId === "none" ? null : requesterId,
      status
    };

    const { error } = await supabase.from("changes").insert([payload]);

    setIsSubmitting(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Change request created successfully" });
      navigate("/dashboard/changes");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-500">Loading form...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <Link to="/dashboard/changes">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">New Change Request</h1>
          <p className="text-zinc-500 text-sm">Submit a new change for CAB approval.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Change Title <span className="text-red-500">*</span></Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Brief description of the change" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description (Optional)</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Full technical details..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="riskLevel">Risk Level</Label>
              <select 
                id="riskLevel" 
                value={riskLevel} 
                onChange={(e) => setRiskLevel(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus:ring-zinc-300"
              >
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select 
                id="status" 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus:ring-zinc-300"
              >
                <option value="draft">Draft</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="team">Assigned Team</Label>
              <select 
                id="team" 
                value={teamId} 
                onChange={(e) => setTeamId(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus:ring-zinc-300"
              >
                <option value="none">Unassigned</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="requester">Requester</Label>
              <select 
                id="requester" 
                value={requesterId} 
                onChange={(e) => setRequesterId(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus:ring-zinc-300"
              >
                <option value="none">Unknown</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.full_name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
            <Button type="button" variant="outline" asChild>
              <Link to="/dashboard/changes">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
