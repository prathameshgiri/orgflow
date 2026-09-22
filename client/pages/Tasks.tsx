import React, { useState, useEffect } from "react";
import { CheckSquare, Plus, Search, MoreHorizontal, History, Edit3 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useOrganization } from "../hooks/useOrganization";
import { supabase } from "../../shared/supabase";
import { useAuth } from "../context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const { orgId } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'todo': return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'review': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
      case 'done': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      default: return 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
    }
  };

  const fetchData = async () => {
    if (!orgId) return;
    setLoading(true);
    
    // Fetch tasks and projects in parallel to avoid relation name ambiguity errors
    const [tasksRes, projectsRes] = await Promise.all([
      supabase.from("tasks").select("*, assignee:users(full_name), team:teams(name)").order("created_at", { ascending: false }),
      supabase.from("projects").select("id, name")
    ]);
      
    if (tasksRes.error) {
      console.error("Error fetching tasks:", tasksRes.error);
    }
    
    // Map project names to tasks
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-zinc-500 text-sm sm:text-base">Manage and track your daily tasks.</p>
        </div>
        
        <Link to="/dashboard/tasks/create" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white transition-colors">
            <Plus className="mr-2 h-4 w-4" /> Create Task
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <Input 
            placeholder="Search tasks..." 
            className="max-w-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {loading ? (
          <div className="p-12 text-center text-zinc-500">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <CheckSquare className="h-12 w-12 text-zinc-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
            <p className="text-zinc-500 max-w-sm">You are all caught up! Create a new task to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <Table>
              <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                <TableRow>
                  <TableHead className="whitespace-nowrap min-w-[200px]">Task</TableHead>
                  <TableHead className="whitespace-nowrap">Project</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Priority</TableHead>
                  <TableHead className="whitespace-nowrap">Team</TableHead>
                  <TableHead className="whitespace-nowrap">Assignee</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium min-w-[200px]">{task.title}</TableCell>
                    <TableCell className="text-zinc-500 whitespace-nowrap">{task.projects?.name || '-'}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold whitespace-nowrap ${getStatusColor(task.status)}`}>
                        {task.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${task.priority === 'urgent' ? 'bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:border-purple-800' : task.priority === 'high' ? 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:border-red-800' : task.priority === 'medium' ? 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-800' : 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800'}`}>
                        {task.priority?.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {task.team_id ? (
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{task.team?.name || '-'}</span>
                      ) : (
                        <span className="text-sm italic text-zinc-400 dark:text-zinc-500">-</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {task.assignee_id ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <AvatarFallback className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium">
                              {getInitials(task.assignee?.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{task.assignee?.full_name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                          <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
                            <span className="text-[10px]">-</span>
                          </div>
                          <span className="text-sm italic">Unassigned</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/dashboard/tasks/${task.id}/update`} className="flex items-center cursor-pointer">
                              <Edit3 className="mr-2 h-4 w-4 text-blue-500" /> Update Task
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/dashboard/tasks/${task.id}/history`} className="flex items-center cursor-pointer">
                              <History className="mr-2 h-4 w-4 text-zinc-500" /> View History
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
