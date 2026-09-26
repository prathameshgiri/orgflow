import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckSquare, Briefcase, Flag, Users, UserPlus, FileText } from "lucide-react";
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
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useOrganization } from "../hooks/useOrganization";
import { supabase } from "../../shared/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

export default function CreateTask() {
  const navigate = useNavigate();
  const { orgId } = useOrganization();
  const { user, session } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("none");
  const [priority, setPriority] = useState("medium");
  const [description, setDescription] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [teamId, setTeamId] = useState("none");
  const [assigneeId, setAssigneeId] = useState("none");
  const [teams, setTeams] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!orgId) return;
      const { data: projData } = await supabase.from("projects").select("id, name");
      setProjects(projData || []);
      
      if (!session) return;
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
    fetchData();
  }, [orgId, session]);

  const assignableUsers = teamId && teamId !== "none"
    ? users.filter(u => {
        const team = teams.find(t => t.id === teamId);
        return team?.team_members?.some((tm: any) => tm.user_id === u.id);
      })
    : users;

  useEffect(() => {
    if (teamId === "none") return;
    const isInTeam = assignableUsers.some(u => u.id === assigneeId);
    if (!isInTeam) setAssigneeId("none");
  }, [teamId, assignableUsers, assigneeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !user) return;
    setSubmitting(true);
    
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
      setSubmitting(false);
    } else {
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
          <span className="text-zinc-900 dark:text-zinc-100">Create New</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-full h-10 w-10 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 shadow-sm shrink-0">
            <Link to="/dashboard/tasks">
              <ArrowLeft className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </Link>
          </Button>
          <div className="flex items-center gap-4 flex-1">
            <div className="h-14 w-14 rounded-2xl border-2 border-white dark:border-zinc-950 shadow-sm bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 flex items-center justify-center">
              <CheckSquare className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Create New Task
              </h1>
              <p className="text-zinc-500 text-sm mt-1">Assign work to yourself or a team member.</p>
            </div>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 sm:p-8 space-y-8">
              
              {/* Basic Info */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-4">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-200">Basic Information</h3>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Task Title <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    id="title" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="e.g. Design new landing page mockups" 
                    required 
                    className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-4 focus-visible:ring-blue-500/10 text-base"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Add more details, requirements, or acceptance criteria..."
                    className="min-h-[120px] rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-4 focus-visible:ring-blue-500/10 resize-y p-4 text-base"
                  />
                </div>
              </div>

              {/* Classification */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-4 mt-8">
                  <Briefcase className="h-5 w-5 text-indigo-500" />
                  <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-200">Classification</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="project" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Project (Optional)</Label>
                    <Select value={projectId} onValueChange={setProjectId}>
                      <SelectTrigger className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-4 focus:ring-blue-500/10">
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="none" className="py-2.5">No Project</SelectItem>
                        {projects.map(p => (
                          <SelectItem key={p.id} value={p.id} className="py-2.5">{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="priority" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Flag className="h-4 w-4 text-zinc-400" /> Priority
                    </Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-4 focus:ring-blue-500/10">
                        <SelectValue placeholder="Priority" />
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
                  <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-200">Assignment</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="team" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Assign to Team</Label>
                    <Select value={teamId} onValueChange={setTeamId}>
                      <SelectTrigger className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-4 focus:ring-blue-500/10">
                        <SelectValue placeholder="Select a team" />
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
                    <Label htmlFor="assignee" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <UserPlus className="h-4 w-4 text-zinc-400" /> Assign to Person
                    </Label>
                    <Select value={assigneeId} onValueChange={setAssigneeId}>
                      <SelectTrigger className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-4 focus:ring-blue-500/10">
                        <SelectValue placeholder="Select a person" />
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
            </div>

            <div className="flex items-center justify-end gap-4 p-6 sm:p-8 bg-zinc-50/50 dark:bg-zinc-900/30 border-t border-zinc-100 dark:border-zinc-800">
              <Button type="button" variant="ghost" asChild className="rounded-xl font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <Link to="/dashboard/tasks">Cancel</Link>
              </Button>
              <Button 
                type="submit" 
                disabled={submitting || !title.trim()} 
                className="h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
              >
                {submitting ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CheckSquare className="mr-2 h-5 w-5" /> Create Task
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
