import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrganization } from "../hooks/useOrganization";
import { supabase } from "../../shared/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export default function CreateProblem() {
  const navigate = useNavigate();
  const { orgId } = useOrganization();
  const { toast } = useToast();

  const [teams, setTeams] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [workaround, setWorkaround] = useState("");
  const [teamId, setTeamId] = useState("none");
  const [assigneeId, setAssigneeId] = useState("none");
  const [status, setStatus] = useState("new");

  useEffect(() => {
    async function fetchData() {
      if (!orgId) return;
      const [orgTeamsRes, usersRes] = await Promise.all([
        supabase.from("teams").select("*").eq("organization_id", orgId),
        supabase.from("users").select("*").eq("organization_id", orgId)
      ]);
      setTeams(orgTeamsRes.data || []);
      setUsers(usersRes.data || []);
      setLoading(false);
    }
    fetchData();
  }, [orgId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !title) return;
    
    setIsSubmitting(true);
    
    const payload = {
      organization_id: orgId,
      title,
      root_cause: rootCause || null,
      workaround: workaround || null,
      team_id: teamId === "none" ? null : teamId,
      assignee_id: assigneeId === "none" ? null : assigneeId,
      status
    };

    const { error } = await supabase.from("problems").insert([payload]);

    setIsSubmitting(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Problem reported successfully" });
      navigate("/dashboard/problems");
    }
  };

  const assignableUsers = useMemo(() => {
    return users; // For MVP, show all org users
  }, [users]);

  if (loading) {
    return <div className="p-8 text-center text-zinc-500">Loading form...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <Link to="/dashboard/problems">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Report Problem</h1>
          <p className="text-zinc-500 text-sm">Log a new problem for investigation.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Problem Title <span className="text-red-500">*</span></Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Brief description of the problem" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select 
                id="status" 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus:ring-zinc-300"
              >
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="team">Assigned Team</Label>
              <select 
                id="team" 
                value={teamId} 
                onChange={(e) => {
                  setTeamId(e.target.value);
                  if (e.target.value === "none") setAssigneeId("none");
                }}
                className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus:ring-zinc-300"
              >
                <option value="none">Unassigned</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee">Assignee</Label>
            <select 
              id="assignee" 
              value={assigneeId} 
              onChange={(e) => setAssigneeId(e.target.value)}
              disabled={teamId === "none"}
              className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus:ring-zinc-300"
            >
              <option value="none">Unassigned</option>
              {assignableUsers.map(u => (
                <option key={u.id} value={u.id}>{u.full_name}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rootCause">Root Cause (Optional)</Label>
            <Input id="rootCause" value={rootCause} onChange={(e) => setRootCause(e.target.value)} placeholder="Known root cause..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workaround">Workaround (Optional)</Label>
            <Input id="workaround" value={workaround} onChange={(e) => setWorkaround(e.target.value)} placeholder="Temporary fix..." />
          </div>
          
          <div className="pt-4 flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
            <Button type="button" variant="outline" asChild>
              <Link to="/dashboard/problems">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Report Problem"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
