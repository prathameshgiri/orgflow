import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrganization } from "../hooks/useOrganization";
import { supabase } from "../../shared/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export default function CreateTask() {
  const navigate = useNavigate();
  const { orgId } = useOrganization();
  const { user, session } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [priority, setPriority] = useState("medium");
  const [description, setDescription] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [teamId, setTeamId] = useState("none");
  const [assigneeId, setAssigneeId] = useState("none");
  const [teams, setTeams] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!orgId) return;
      // Fetch Projects
      const { data: projData } = await supabase.from("projects").select("id, name");
      setProjects(projData || []);
      
      if (!session) return;
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
    fetchData();
  }, [orgId, session]);

  const assignableUsers = teamId && teamId !== "none"
    ? users.filter(u => {
        const team = teams.find(t => t.id === teamId);
        return team?.team_members?.some((tm: any) => tm.user_id === u.id);
      })
    : users;

  // Reset assignee when team changes if current assignee is not in new team
  useEffect(() => {
    if (teamId === "none") return;
    const isInTeam = assignableUsers.some(u => u.id === assigneeId);
    if (!isInTeam) setAssigneeId("none");
  }, [teamId, assignableUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !user) return;
    
    // Convert state to valid DB enum values ('todo', 'in_progress', etc. and 'low', 'medium', 'high', 'urgent')
    const { data, error } = await supabase.from("tasks").insert([
      {
        organization_id: orgId,
        project_id: projectId === "none" ? null : (projectId || null),
        team_id: teamId === "none" ? null : teamId,
        assignee_id: assigneeId === "none" ? null : assigneeId,
        title,
        description,
        status: "todo",
        priority
      }
    ]);

    if (error) {
      console.error(error);
      toast({ title: "Failed to create task", description: error.message, variant: "destructive" });
    } else {
      // If a task is assigned, send a notification email
      if (assigneeId && assigneeId !== "none") {
        try {
          await fetch("/api/notify/assignment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
              "x-org-id": orgId,
            },
            body: JSON.stringify({
              assigneeId,
              type: "Task",
              itemTitle: title,
              itemDescription: description,
              linkUrl: `${window.location.origin}/dashboard/tasks`
            })
          });
        } catch (notifyErr) {
          console.error("Failed to send notification", notifyErr);
        }
      }

      toast({ title: "Task created successfully" });
      navigate("/dashboard/tasks");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard/tasks">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Task</h1>
          <p className="text-zinc-500">Assign work to yourself or a team member.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="title">Task Title <span className="text-red-500">*</span></Label>
            <Input 
              id="title" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="e.g. Design landing page" 
              required 
              className="w-full"
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add more details about this task..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="project">Project (Optional)</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Project</SelectItem>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Priority" />
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
            <div className="space-y-3">
              <Label htmlFor="team">Assign to Team</Label>
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Team</SelectItem>
                  {teams.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="assignee">Assign to Person</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a person" />
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

          <div className="flex justify-end gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Link to="/dashboard/tasks">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <CheckSquare className="mr-2 h-4 w-4" /> Create Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
