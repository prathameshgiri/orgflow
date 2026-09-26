import React, { useState, useEffect } from "react";
import { Folder, Plus, MoreHorizontal, Calendar, Activity, Target, AlertTriangle, Settings, Search, Edit3, History, LineChart } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useOrganization } from "../hooks/useOrganization";
import { supabase } from "../../shared/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const getStatusColor = (status: string) => {
  switch (status) {
    case "In Progress": return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-800";
    case "Planning": return "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-900/50 dark:text-zinc-300 dark:border-zinc-800";
    case "Completed": return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-400 dark:border-emerald-800";
    case "On Hold": return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-400 dark:border-amber-800";
    case "Maintenance": return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/50 dark:text-purple-400 dark:border-purple-800";
    case "Cancelled": return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/50 dark:text-rose-400 dark:border-rose-800";
    case "At Risk": return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-400 dark:border-red-800 shadow-sm";
    default: return "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";
  }
};

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const { orgId } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const updateProjectProgress = async (projectId: string, newProgress: number, _, currentStatus: string) => {
    // Fetch the real current progress from the DB since local state is already updated by the slider's onChange
    const { data: currentProject } = await supabase.from("projects").select("progress").eq("id", projectId).single();
    const realOldProgress = currentProject?.progress || 0;
    
    if (newProgress === realOldProgress) return;
    
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
      
      if (orgId && user) {
        await supabase.from("activity_logs").insert([{
          organization_id: orgId,
          user_id: user.id,
          action: "update_progress",
          resource: "projects",
          details: { project_id: projectId, old_value: realOldProgress, new_value: newProgress, auto_status: statusUpdate }
        }]);
      }
    }
  };

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Stats
  const activeCount = projects.filter(p => p.status === 'In Progress').length;
  const completedCount = projects.filter(p => p.status === 'Completed').length;
  const maintenanceCount = projects.filter(p => p.status === 'Maintenance').length;
  const atRiskCount = projects.filter(p => p.status === 'At Risk').length;
  const totalCount = projects.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6 pt-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
            <Folder className="h-8 w-8 text-indigo-600" /> Projects
          </h1>
          <p className="text-zinc-500 mt-2 text-lg">Manage and track your organization's projects.</p>
        </div>
        
        <Button asChild className="group relative h-11 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25">
          <Link to="/dashboard/projects/create">
            <span className="relative z-10 flex items-center justify-center">
              <Plus className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-90" /> 
              New Project
            </span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-5"
      >
        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md bg-white dark:bg-zinc-950 overflow-hidden flex flex-col transition-all duration-300">
          <div className="p-5 xl:p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 shadow-sm">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[13px] xl:text-[14px] font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap">Active</p>
              <h4 className="text-2xl xl:text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{activeCount}</h4>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md bg-white dark:bg-zinc-950 overflow-hidden flex flex-col transition-all duration-300">
          <div className="p-5 xl:p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0 shadow-sm">
              <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[13px] xl:text-[14px] font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap">Completed</p>
              <h4 className="text-2xl xl:text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{completedCount}</h4>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md bg-white dark:bg-zinc-950 overflow-hidden flex flex-col transition-all duration-300">
          <div className="p-5 xl:p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl border border-purple-100 dark:border-purple-900/30 bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0 shadow-sm">
              <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[13px] xl:text-[14px] font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap">Maintenance</p>
              <h4 className="text-2xl xl:text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{maintenanceCount}</h4>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md bg-white dark:bg-zinc-950 overflow-hidden flex flex-col transition-all duration-300">
          <div className="p-5 xl:p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0 shadow-sm">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[13px] xl:text-[14px] font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap">At Risk</p>
              <h4 className="text-2xl xl:text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{atRiskCount}</h4>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md bg-white dark:bg-zinc-950 overflow-hidden flex flex-col transition-all duration-300">
          <div className="p-5 xl:p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0 shadow-sm">
              <Folder className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[13px] xl:text-[14px] font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap">Total</p>
              <h4 className="text-2xl xl:text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{totalCount}</h4>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Main Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-lg">
              <LineChart className="h-5 w-5 text-indigo-500" /> Project Portfolio
            </div>
            
            <div className="relative w-full sm:w-80 group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                <Search size={18} />
              </div>
              <Input 
                placeholder="Search projects..." 
                className="h-11 pl-10 rounded-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus-visible:ring-4 focus-visible:ring-blue-500/10 transition-all shadow-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center">
              <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-zinc-500 font-medium">Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-24 flex flex-col items-center justify-center text-center">
              <div className="h-24 w-24 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-6 border border-zinc-100 dark:border-zinc-800">
                <Folder className="h-10 w-10 text-zinc-400" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-zinc-100">No projects found</h3>
              <p className="text-zinc-500 max-w-sm mx-auto mb-6">
                {searchQuery ? "No projects matched your search." : "Create your first project to start organizing tasks and teams."}
              </p>
              {!searchQuery && (
                <Button asChild className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                  <Link to="/dashboard/projects/create">Create your first project</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <Table>
                <TableHeader className="bg-white dark:bg-zinc-950">
                  <TableRow className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-transparent">
                    <TableHead className="py-5 font-semibold text-zinc-500 uppercase tracking-wider text-xs min-w-[250px]">Project Details</TableHead>
                    <TableHead className="py-5 font-semibold text-zinc-500 uppercase tracking-wider text-xs">Status</TableHead>
                    <TableHead className="py-5 font-semibold text-zinc-500 uppercase tracking-wider text-xs min-w-[200px]">Progress</TableHead>
                    <TableHead className="py-5 font-semibold text-zinc-500 uppercase tracking-wider text-xs">Created</TableHead>
                    <TableHead className="py-5 font-semibold text-zinc-500 uppercase tracking-wider text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors group cursor-pointer" onClick={() => navigate(`/dashboard/projects/${project.id}/history`)}>
                      <TableCell className="py-4 align-top">
                        <div className="flex items-center gap-4">
                          <div className="relative h-12 w-12 flex items-center justify-center shrink-0">
                            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="16" fill="none" className="stroke-zinc-100 dark:stroke-zinc-800" strokeWidth="3" />
                              <motion.circle 
                                initial={{ strokeDasharray: "0, 100" }}
                                animate={{ strokeDasharray: `${project.progress || 0}, 100` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                cx="18" cy="18" r="16" fill="none" 
                                className={project.status === 'Completed' ? "stroke-emerald-500" : project.status === 'At Risk' ? "stroke-red-500" : "stroke-indigo-500"} 
                                strokeWidth="3" strokeLinecap="round" pathLength="100"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                              {project.progress || 0}%
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-1.5">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-base">{project.name}</span>
                            <span className="text-xs text-zinc-500 truncate max-w-xs">{project.description || "No description provided."}</span>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-4 align-top" onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={project.status}
                          onValueChange={(val) => updateProjectStatus(project.id, val, project.status)}
                        >
                          <SelectTrigger className={`h-8 px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap shadow-sm w-[140px] focus:ring-2 focus:ring-offset-1 focus:ring-blue-500/20 ${getStatusColor(project.status)}`}>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="Planning" className="py-2.5">Planning</SelectItem>
                            <SelectItem value="In Progress" className="py-2.5">In Progress</SelectItem>
                            <SelectItem value="On Hold" className="py-2.5">On Hold</SelectItem>
                            <SelectItem value="Completed" className="py-2.5">Completed</SelectItem>
                            <SelectItem value="Maintenance" className="py-2.5">Maintenance</SelectItem>
                            <SelectItem value="Cancelled" className="py-2.5 text-rose-500 font-medium">Cancelled</SelectItem>
                            <SelectItem value="At Risk" className="py-2.5 text-red-500 font-bold">At Risk</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      
                      <TableCell className="py-4 align-top" onClick={(e) => e.stopPropagation()}>
                        {project.status === 'Planning' ? (
                          <div className="flex items-center gap-3 text-zinc-400 mt-1">
                            <div className="h-2 w-32 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner"></div>
                            <span className="text-xs font-medium">0%</span>
                          </div>
                        ) : project.status === 'Completed' ? (
                          <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mt-1">
                            <div className="h-2 w-32 bg-emerald-100 dark:bg-emerald-900/30 rounded-full overflow-hidden shadow-inner">
                               <div className="h-full bg-emerald-500 rounded-full w-full" />
                            </div>
                            <span className="text-xs font-bold">100%</span>
                          </div>
                        ) : project.status === 'Cancelled' ? (
                          <div className="flex items-center gap-3 mt-1">
                            <div className="h-1.5 w-32 bg-rose-500/20 rounded-full shadow-inner overflow-hidden">
                              <div className="h-full w-full bg-rose-500 rounded-full" />
                            </div>
                            <span className="text-xs text-rose-500 font-bold">Cancelled</span>
                          </div>
                        ) : project.status === 'Maintenance' ? (
                          <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400 mt-1">
                            <div className="h-2 w-32 bg-purple-100 dark:bg-purple-900/30 rounded-full overflow-hidden relative shadow-inner">
                              <div className="absolute inset-0 bg-purple-500 opacity-60 animate-pulse" />
                            </div>
                            <span className="text-xs font-bold flex items-center gap-1.5">
                              <Settings className="h-3.5 w-3.5 animate-[spin_3s_linear_infinite]" /> Maint
                            </span>
                          </div>
                        ) : project.status === 'At Risk' ? (
                          <div className="flex items-center gap-3 mt-1 group/slider">
                            <input 
                              type="range" min="0" max="100" 
                              value={project.progress || 0}
                              onChange={(e) => setProjects(projects.map(p => p.id === project.id ? { ...p, progress: parseInt(e.target.value) } : p))}
                              onMouseUp={(e) => updateProjectProgress(project.id, parseInt((e.target as HTMLInputElement).value), project.progress || 0, project.status)}
                              onTouchEnd={(e) => updateProjectProgress(project.id, parseInt((e.target as HTMLInputElement).value), project.progress || 0, project.status)}
                              className="w-32 h-2 bg-red-100 dark:bg-red-900/30 rounded-lg appearance-none cursor-pointer accent-red-600 hover:h-2.5 transition-all shadow-inner text-red-500"
                              style={{ backgroundImage: `linear-gradient(to right, currentColor ${project.progress || 0}%, transparent ${project.progress || 0}%)` }}
                            />
                            <span className="text-xs text-red-600 font-bold flex items-center gap-1">
                              {project.progress}% <AlertTriangle className="h-3.5 w-3.5 animate-pulse text-red-500" />
                            </span>
                          </div>
                        ) : project.status === 'On Hold' ? (
                          <div className="flex items-center gap-3 opacity-60 mt-1">
                            <input 
                              type="range" min="0" max="100" 
                              value={project.progress || 0}
                              disabled
                              className="w-32 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-not-allowed accent-zinc-500 shadow-inner text-zinc-400 dark:text-zinc-500"
                              style={{ backgroundImage: `linear-gradient(to right, currentColor ${project.progress || 0}%, transparent ${project.progress || 0}%)` }}
                            />
                            <span className="text-xs text-zinc-500 font-bold">{project.progress}%</span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 mt-0.5 w-36">
                            <div className="relative pt-1">
                              <input 
                                type="range" min="0" max="100" 
                                value={project.progress || 0}
                                onChange={(e) => setProjects(projects.map(p => p.id === project.id ? { ...p, progress: parseInt(e.target.value) } : p))}
                                onMouseUp={(e) => updateProjectProgress(project.id, parseInt((e.target as HTMLInputElement).value), project.progress || 0, project.status)}
                                onTouchEnd={(e) => updateProjectProgress(project.id, parseInt((e.target as HTMLInputElement).value), project.progress || 0, project.status)}
                                className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:h-2.5 transition-all shadow-inner text-blue-500"
                                style={{ backgroundImage: `linear-gradient(to right, currentColor ${project.progress || 0}%, transparent ${project.progress || 0}%)` }}
                              />
                            </div>
                            <div className="flex items-center justify-between w-full px-1">
                              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                                {(project.progress || 0) < 50 ? 'Development' : ((project.progress || 0) < 90 ? 'Testing' : 'Finalizing')}
                              </span>
                              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">{project.progress}%</span>
                            </div>
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell className="py-4 align-top">
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                            {new Date(project.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-4 align-top text-right">
                        <div className="flex items-center justify-end gap-2 transition-opacity mt-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl p-1">
                              <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5" onClick={(e) => e.stopPropagation()}>
                                <Link to={`/dashboard/projects/${project.id}/history`} className="flex items-center">
                                  <History className="mr-3 h-4 w-4 text-blue-500" /> <span className="font-medium">View History</span>
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
