import React, { useState, useEffect } from "react";
import { Folder, Plus, MoreHorizontal, Calendar, Activity, Target, AlertTriangle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrganization } from "../hooks/useOrganization";
import { supabase } from "../../shared/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";

const getStatusColor = (status: string) => {
  switch (status) {
    case "In Progress": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "Planning": return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400";
    case "Completed": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "On Hold": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    case "Maintenance": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    case "Cancelled": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case "At Risk": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default: return "bg-zinc-100 text-zinc-700";
  }
};

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const { orgId } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProjects = async () => {
    if (!orgId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error(error);
      toast({ title: "Error loading projects", variant: "destructive" });
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, [orgId]);

  const updateProjectStatus = async (projectId: string, newStatus: string, oldStatus: string) => {
    if (newStatus === oldStatus) return;
    
    let progressUpdate = null;
    if (newStatus === "Completed") progressUpdate = 100;
    if (newStatus === "Planning") progressUpdate = 0;
    
    const updatePayload: any = { status: newStatus };
    if (progressUpdate !== null) {
      updatePayload.progress = progressUpdate;
    }
    
    const { error } = await supabase
      .from("projects")
      .update(updatePayload)
      .eq("id", projectId);
      
    if (error) {
      console.error(error);
      toast({ title: "Failed to update status", variant: "destructive" });
    } else {
      toast({ title: "Status updated successfully" });
      setProjects(projects.map(p => p.id === projectId ? { ...p, ...updatePayload } : p));
      
      // Log activity
      if (orgId && user) {
        await supabase.from("activity_logs").insert([{
          organization_id: orgId,
          user_id: user.id,
          action: "update_status",
          resource: "projects",
          details: { project_id: projectId, old_value: oldStatus, new_value: newStatus, auto_progress: progressUpdate }
        }]);
      }
    }
  };

  const updateProjectProgress = async (projectId: string, newProgress: number, oldProgress: number, currentStatus: string) => {
    if (newProgress === oldProgress) return;
    
    let statusUpdate = null;
    if (newProgress === 100 && currentStatus !== "Completed") statusUpdate = "Completed";
    if (newProgress < 100 && currentStatus === "Completed") statusUpdate = "In Progress";
    if (newProgress > 0 && currentStatus === "Planning") statusUpdate = "In Progress";
    
    const updatePayload: any = { progress: newProgress };
    if (statusUpdate !== null) {
      updatePayload.status = statusUpdate;
    }

    const { error } = await supabase
      .from("projects")
      .update(updatePayload)
      .eq("id", projectId);
      
    if (error) {
      console.error(error);
      toast({ title: "Failed to update progress", variant: "destructive" });
    } else {
      toast({ title: "Progress updated successfully" });
      setProjects(projects.map(p => p.id === projectId ? { ...p, ...updatePayload } : p));
      
      // Log activity
      if (orgId && user) {
        await supabase.from("activity_logs").insert([{
          organization_id: orgId,
          user_id: user.id,
          action: "update_progress",
          resource: "projects",
          details: { project_id: projectId, old_value: oldProgress, new_value: newProgress, auto_status: statusUpdate }
        }]);
      }
    }
  };


  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-zinc-500">Manage and track your organization's projects.</p>
        </div>
        <Link to="/dashboard/projects/create">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between col-span-2 lg:col-span-1">
          <div>
            <p className="text-sm font-medium text-zinc-500">Active Projects</p>
            <h3 className="text-2xl font-bold mt-1">{projects.filter(p => p.status === 'In Progress').length}</h3>
          </div>
          <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600">
            <Activity className="h-5 w-5" />
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between col-span-2 lg:col-span-1">
          <div>
            <p className="text-sm font-medium text-zinc-500">Completed</p>
            <h3 className="text-2xl font-bold mt-1">{projects.filter(p => p.status === 'Completed').length}</h3>
          </div>
          <div className="h-10 w-10 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600">
            <Target className="h-5 w-5" />
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between col-span-2 lg:col-span-1">
          <div>
            <p className="text-sm font-medium text-zinc-500">Maintenance</p>
            <h3 className="text-2xl font-bold mt-1">{projects.filter(p => p.status === 'Maintenance').length}</h3>
          </div>
          <div className="h-10 w-10 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center text-purple-600">
            <Settings className="h-5 w-5" />
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between col-span-2 lg:col-span-1">
          <div>
            <p className="text-sm font-medium text-zinc-500">At Risk</p>
            <h3 className="text-2xl font-bold mt-1">{projects.filter(p => p.status === 'At Risk').length}</h3>
          </div>
          <div className="h-10 w-10 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between col-span-2 lg:col-span-1">
          <div>
            <p className="text-sm font-medium text-zinc-500">Total Projects</p>
            <h3 className="text-2xl font-bold mt-1">{projects.length}</h3>
          </div>
          <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-600">
            <Folder className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <Input 
            placeholder="Search projects..." 
            className="max-w-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {loading ? (
          <div className="p-12 text-center text-zinc-500">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <Folder className="h-12 w-12 text-zinc-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-zinc-500 max-w-sm">Create your first project to start organizing tasks and teams.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
              <TableRow>
                <TableHead className="whitespace-nowrap min-w-[200px]">Project Name</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap min-w-[150px]">Progress</TableHead>
                <TableHead className="whitespace-nowrap">Created</TableHead>
                <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium min-w-[200px]">{project.name}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <select
                      value={project.status}
                      onChange={(e) => updateProjectStatus(project.id, e.target.value, project.status)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium appearance-none cursor-pointer outline-none border-none whitespace-nowrap ${getStatusColor(project.status)}`}
                    >
                      <option value="Planning" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Planning</option>
                      <option value="In Progress" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">In Progress</option>
                      <option value="On Hold" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">On Hold</option>
                      <option value="Completed" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Completed</option>
                      <option value="Maintenance" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Maintenance</option>
                      <option value="Cancelled" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Cancelled</option>
                      <option value="At Risk" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">At Risk</option>
                    </select>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {project.status === 'Planning' ? (
                      <div className="flex items-center gap-2 text-zinc-400">
                        <div className="h-2 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden"></div>
                        <span className="text-xs">0%</span>
                      </div>
                    ) : project.status === 'Completed' ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <div className="h-2 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                           <div className="h-full bg-green-500 rounded-full w-full" />
                        </div>
                        <span className="text-xs font-semibold">100%</span>
                      </div>
                    ) : project.status === 'Cancelled' ? (
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-24 bg-red-500 rounded-full"></div>
                        <span className="text-xs text-red-500 font-medium">Cancelled</span>
                      </div>
                    ) : project.status === 'Maintenance' ? (
                      <div className="flex items-center gap-2 text-purple-600">
                        <div className="h-2 w-24 bg-purple-100 dark:bg-purple-900/30 rounded-full overflow-hidden relative">
                          <div className="absolute inset-0 bg-purple-500 opacity-50 animate-pulse" />
                        </div>
                        <span className="text-xs font-medium flex items-center gap-1">
                          <Settings className="h-3 w-3 animate-spin" /> Maint
                        </span>
                      </div>
                    ) : project.status === 'At Risk' ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="range" min="0" max="100" 
                          value={project.progress || 0}
                          onChange={(e) => setProjects(projects.map(p => p.id === project.id ? { ...p, progress: parseInt(e.target.value) } : p))}
                          onMouseUp={(e) => updateProjectProgress(project.id, parseInt((e.target as HTMLInputElement).value), project.progress || 0, project.status)}
                          onTouchEnd={(e) => updateProjectProgress(project.id, parseInt((e.target as HTMLInputElement).value), project.progress || 0, project.status)}
                          className="w-24 h-2 bg-red-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                        />
                        <span className="text-xs text-red-600 font-bold flex items-center gap-1">
                          {project.progress}% <AlertTriangle className="h-3 w-3 animate-pulse text-red-500" />
                        </span>
                      </div>
                    ) : project.status === 'On Hold' ? (
                      <div className="flex items-center gap-2 opacity-50">
                        <input 
                          type="range" min="0" max="100" 
                          value={project.progress || 0}
                          disabled
                          className="w-24 h-2 bg-zinc-200 rounded-lg appearance-none cursor-not-allowed accent-zinc-500"
                        />
                        <span className="text-xs text-zinc-500 font-medium">{project.progress}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <input 
                          type="range" min="0" max="100" 
                          value={project.progress || 0}
                          onChange={(e) => setProjects(projects.map(p => p.id === project.id ? { ...p, progress: parseInt(e.target.value) } : p))}
                          onMouseUp={(e) => updateProjectProgress(project.id, parseInt((e.target as HTMLInputElement).value), project.progress || 0, project.status)}
                          onTouchEnd={(e) => updateProjectProgress(project.id, parseInt((e.target as HTMLInputElement).value), project.progress || 0, project.status)}
                          className="w-24 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-800 accent-blue-600"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-blue-600">{project.progress}%</span>
                          <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                            {(project.progress || 0) < 50 ? 'Development' : ((project.progress || 0) < 90 ? 'Testing' : 'Finalizing')}
                          </span>
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-zinc-500 text-sm whitespace-nowrap">
                    {new Date(project.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link to={`/dashboard/projects/${project.id}/history`}>
                          <DropdownMenuItem className="cursor-pointer">
                            View History
                          </DropdownMenuItem>
                        </Link>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
