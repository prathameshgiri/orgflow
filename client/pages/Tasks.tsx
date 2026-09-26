import React, { useState, useEffect } from "react";
import { CheckSquare, Plus, Search, MoreHorizontal, History, Edit3, Clock, AlertCircle, LayoutList, Layers } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useOrganization } from "../hooks/useOrganization";
import { supabase } from "../../shared/supabase";
import { useAuth } from "../context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const { orgId } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'todo':
      case 'new': 
      case 'created':
        return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-900/50 dark:text-zinc-300 dark:border-zinc-800';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-800';
      case 'review': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/50 dark:text-purple-400 dark:border-purple-800';
      case 'done':
      case 'closed': 
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-400 dark:border-emerald-800';
      default: return 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority?.toLowerCase()) {
      case 'urgent': return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/50 dark:text-rose-400 dark:border-rose-800 shadow-sm';
      case 'high': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-400 dark:border-amber-800';
      case 'medium': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800';
    }
  };

  const getDisplayStatus = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'todo' || s === 'new' || s === 'created') return 'CREATED';
    if (s === 'done' || s === 'closed') return 'CLOSED';
    return status?.replace('_', ' ').toUpperCase();
  };

  const fetchData = async () => {
    if (!orgId) return;
    setLoading(true);
    
    const [tasksRes, projectsRes] = await Promise.all([
      supabase.from("tasks").select("*, assignee:users(full_name), team:teams(name)").order("created_at", { ascending: false }),
      supabase.from("projects").select("id, name")
    ]);
      
    if (tasksRes.error) {
      console.error("Error fetching tasks:", tasksRes.error);
    }
    
    const projectsMap = new Map(projectsRes.data?.map(p => [p.id, p.name]) || []);
    setProjects(projectsRes.data || []);
    const tasksWithProjects = (tasksRes.data || []).map(t => ({
      ...t,
      projects: { name: t.project_id ? projectsMap.get(t.project_id) : null }
    }));
      
    setTasks(tasksWithProjects);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [orgId]);

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Stats calculation
  const totalTasks = tasks.length;
  const inProgress = tasks.filter(t => t.status?.toLowerCase() === 'in_progress').length;
  const inReview = tasks.filter(t => t.status?.toLowerCase() === 'review').length;
  const closed = tasks.filter(t => t.status?.toLowerCase() === 'done' || t.status?.toLowerCase() === 'closed').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6 pt-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
            <CheckSquare className="h-8 w-8 text-indigo-600" /> Tasks
          </h1>
          <p className="text-zinc-500 mt-2 text-lg">Manage, assign and track work items across your organization.</p>
        </div>
        
        <Button asChild className="group relative h-11 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25">
          <Link to="/dashboard/tasks/create">
            <span className="relative z-10 flex items-center justify-center">
              <Plus className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-90" /> 
              Create Task
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
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md bg-white dark:bg-zinc-950 overflow-hidden flex flex-col transition-all duration-300">
          <div className="p-6 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center shrink-0 shadow-sm">
              <Layers className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[15px] font-medium text-zinc-500 dark:text-zinc-400">Total Tasks</p>
              <h4 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight mt-0.5">{totalTasks}</h4>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md bg-white dark:bg-zinc-950 overflow-hidden flex flex-col transition-all duration-300">
          <div className="p-6 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 shadow-sm">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[15px] font-medium text-zinc-500 dark:text-zinc-400">In Progress</p>
              <h4 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight mt-0.5">{inProgress}</h4>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md bg-white dark:bg-zinc-950 overflow-hidden flex flex-col transition-all duration-300">
          <div className="p-6 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl border border-purple-100 dark:border-purple-900/30 bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0 shadow-sm">
              <AlertCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[15px] font-medium text-zinc-500 dark:text-zinc-400">In Review</p>
              <h4 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight mt-0.5">{inReview}</h4>
            </div>
          </div>
        </Card>
        
        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md bg-white dark:bg-zinc-950 overflow-hidden flex flex-col transition-all duration-300">
          <div className="p-6 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0 shadow-sm">
              <CheckSquare className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[15px] font-medium text-zinc-500 dark:text-zinc-400">Closed</p>
              <h4 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight mt-0.5">{closed}</h4>
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
              <LayoutList className="h-5 w-5 text-indigo-500" /> Task Backlog
            </div>
            
            <div className="relative w-full sm:w-80 group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                <Search size={18} />
              </div>
              <Input 
                placeholder="Search by title..." 
                className="h-11 pl-10 rounded-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus-visible:ring-4 focus-visible:ring-blue-500/10 transition-all shadow-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center">
              <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-zinc-500 font-medium">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-24 flex flex-col items-center justify-center text-center">
              <div className="h-24 w-24 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-6 border border-zinc-100 dark:border-zinc-800">
                <CheckSquare className="h-10 w-10 text-zinc-400" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-zinc-100">No tasks found</h3>
              <p className="text-zinc-500 max-w-sm mx-auto mb-6">
                {searchQuery ? "No tasks matched your search." : "You are all caught up! Create a new task to get started."}
              </p>
              {!searchQuery && (
                <Button asChild className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                  <Link to="/dashboard/tasks/create">Create your first task</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <Table>
                <TableHeader className="bg-white dark:bg-zinc-950">
                  <TableRow className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-transparent">
                    <TableHead className="py-5 font-semibold text-zinc-500 uppercase tracking-wider text-xs w-[30%]">Task Details</TableHead>
                    <TableHead className="py-5 font-semibold text-zinc-500 uppercase tracking-wider text-xs">Project & Team</TableHead>
                    <TableHead className="py-5 font-semibold text-zinc-500 uppercase tracking-wider text-xs">Status</TableHead>
                    <TableHead className="py-5 font-semibold text-zinc-500 uppercase tracking-wider text-xs">Assignee</TableHead>
                    <TableHead className="py-5 font-semibold text-zinc-500 uppercase tracking-wider text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors group cursor-pointer" onClick={() => navigate(`/dashboard/tasks/${task.id}/update`)}>
                      <TableCell className="py-4 align-top">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">{task.title}</span>
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md w-fit border ${getPriorityColor(task.priority)}`}>
                            {task.priority?.toUpperCase()} PRIORITY
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-4 align-top">
                        <div className="flex flex-col gap-1 text-sm">
                          {task.projects?.name ? (
                            <span className="font-medium text-zinc-800 dark:text-zinc-200">{task.projects.name}</span>
                          ) : (
                            <span className="italic text-zinc-400">No Project</span>
                          )}
                          
                          {task.team_id ? (
                            <span className="text-zinc-500 text-xs font-medium">Team: {task.team?.name}</span>
                          ) : (
                            <span className="text-zinc-400 text-xs italic">No Team</span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-4 align-top">
                        <span className={`text-xs px-3 py-1.5 rounded-full border font-bold tracking-wide whitespace-nowrap shadow-sm ${getStatusColor(task.status)}`}>
                          {getDisplayStatus(task.status)}
                        </span>
                      </TableCell>
                      
                      <TableCell className="py-4 align-top">
                        {task.assignee_id ? (
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border-2 border-white dark:border-zinc-900 shadow-sm">
                              <AvatarFallback className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold">
                                {getInitials(task.assignee?.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{task.assignee?.full_name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-zinc-400 dark:text-zinc-500">
                            <div className="h-8 w-8 rounded-full bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                              <span className="text-xs font-bold text-zinc-300 dark:text-zinc-600">?</span>
                            </div>
                            <span className="text-sm font-medium italic">Unassigned</span>
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell className="py-4 align-top text-right">
                        <div className="flex items-center justify-end gap-2 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30"
                            onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/tasks/${task.id}/update`); }}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl p-1">
                              <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5" onClick={(e) => e.stopPropagation()}>
                                <Link to={`/dashboard/tasks/${task.id}/update`} className="flex items-center">
                                  <Edit3 className="mr-3 h-4 w-4 text-blue-500" /> <span className="font-medium">Update Task</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5" onClick={(e) => e.stopPropagation()}>
                                <Link to={`/dashboard/tasks/${task.id}/history`} className="flex items-center">
                                  <History className="mr-3 h-4 w-4 text-zinc-500" /> <span className="font-medium">View History</span>
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
