import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useOrganization } from "../hooks/useOrganization";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckSquare, AlertCircle, Clock, CheckCircle2, 
  ArrowRight, Search, Menu, Bell, LayoutDashboard,
  MessageSquare, Settings, Activity, Briefcase, Folder
} from "lucide-react";
import { supabase } from "../../shared/supabase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { user } = useAuth();
  const { orgId, loading: orgLoading } = useOrganization();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [recentOrgActivity, setRecentOrgActivity] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    if (!orgId || !user) {
      setLoading(false); // Don't spin forever if no org
      return;
    }
    
    setLoading(true);
    try {
      // 1. Fetch exactly what is assigned to this user
      const [
        tasksRes,
        pTasksRes,
        incidentsRes,
        projectsRes,
        orgTasksRes // For activity feed
      ] = await Promise.all([
        supabase.from("tasks").select("*, projects(name)").eq('assignee_id', user.id).order('updated_at', { ascending: false }),
        supabase.from("project_tasks").select("*, projects(name)").eq('assignee_id', user.id).order('updated_at', { ascending: false }),
        supabase.from("incidents").select("*").eq('assignee_id', user.id).order('updated_at', { ascending: false }),
        supabase.from("projects").select("*").eq('organization_id', orgId),
        supabase.from("tasks").select("id, title, updated_at, status, assignee:users(full_name)").eq('organization_id', orgId).order('updated_at', { ascending: false }).limit(5)
      ]);

      const scTasks = (tasksRes.data || []).map(t => ({ ...t, _type: 'SCTASK' }));
      const pTasks = (pTasksRes.data || []).map(t => ({ ...t, _type: 'PTASK' }));
      const incTasks = (incidentsRes.data || []).map(t => ({ 
        ...t, 
        _type: t.ticket_type === 'sctask' ? 'SCTASK' : 'INCIDENT',
        projects: { name: 'Service Desk' } 
      }));

      const allMyTasks = [...scTasks, ...pTasks, ...incTasks].sort((a, b) => 
        new Date(b.created_at || b.updated_at).getTime() - new Date(a.created_at || a.updated_at).getTime()
      );

      setTasks(allMyTasks);
      setAllProjects(projectsRes.data || []);
      setRecentOrgActivity(orgTasksRes.data || []);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    if (orgId && user) {
      const channel = supabase.channel('dashboard-realtime-strict')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `organization_id=eq.${orgId}` }, () => fetchDashboardData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'project_tasks', filter: `organization_id=eq.${orgId}` }, () => fetchDashboardData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `organization_id=eq.${orgId}` }, () => fetchDashboardData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents', filter: `organization_id=eq.${orgId}` }, () => fetchDashboardData())
        .subscribe();
        
      return () => { supabase.removeChannel(channel); };
    }
  }, [orgId, orgLoading, user]);

  if (orgLoading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
    </div>
  );

  if (!orgId) return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
        <Briefcase className="h-8 w-8 text-indigo-400" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">No Organization Found</h2>
        <p className="text-sm text-zinc-500 mt-1">Your account isn't linked to an organization yet.<br/>Please contact your admin or sign up again.</p>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
    </div>
  );

  const pendingTasks = tasks.filter(t => !['done', 'Resolved', 'Closed'].includes(t.status));
  const completedTasks = tasks.filter(t => ['done', 'Resolved', 'Closed'].includes(t.status));
  
  const pendingPTasks = pendingTasks.filter(t => t._type === 'PTASK');
  const pendingSCTasks = pendingTasks.filter(t => t._type === 'SCTASK');
  const pendingIncidents = pendingTasks.filter(t => t._type === 'INCIDENT');

  const activeProjectsCount = allProjects.filter(p => p.status === 'In Progress').length;
  const completedProjectsCount = allProjects.filter(p => p.status === 'Completed').length;
  const maintenanceProjectsCount = allProjects.filter(p => p.status === 'Maintenance').length;



  return (
    <div className="bg-zinc-50/50 dark:bg-zinc-950 min-h-screen p-4 md:p-8 animate-in fade-in duration-500">
      

      
      {/* 4 Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* Card 1: Pending PTASKs */}
        <Card className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-[15px]">Pending PTASKs</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Project Tasks</p>
            </div>
            <div className="bg-blue-500 text-white p-2 rounded-lg"><CheckSquare size={18} /></div>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-zinc-900 dark:text-white">{pendingPTasks.length}</h2>
            <div className="mt-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <span className="text-xs text-zinc-500">Real-time sync</span>
              <button onClick={() => navigate('/dashboard/projects')} className="text-xs font-semibold flex items-center text-zinc-600 dark:text-zinc-400 hover:text-blue-600">
                View <ArrowRight size={14} className="ml-1" />
              </button>
            </div>
          </div>
        </Card>

        {/* Card 2: Pending SCTASKs */}
        <Card className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-[15px]">Pending SCTASKs</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Service/Standard Tasks</p>
            </div>
            <div className="bg-orange-500 text-white p-2 rounded-lg"><Clock size={18} /></div>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-zinc-900 dark:text-white">{pendingSCTasks.length}</h2>
            <div className="mt-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <span className="text-xs text-zinc-500">Real-time sync</span>
              <button onClick={() => navigate('/dashboard/tasks')} className="text-xs font-semibold flex items-center text-zinc-600 dark:text-zinc-400 hover:text-orange-600">
                View <ArrowRight size={14} className="ml-1" />
              </button>
            </div>
          </div>
        </Card>

        {/* Card 3: Pending Incidents */}
        <Card className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-[15px]">Active Incidents</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Service Desk Tickets</p>
            </div>
            <div className="bg-red-500 text-white p-2 rounded-lg"><AlertCircle size={18} /></div>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-zinc-900 dark:text-white">{pendingIncidents.length}</h2>
            <div className="mt-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <span className="text-xs text-zinc-500">Real-time sync</span>
              <button onClick={() => navigate('/dashboard/incidents')} className="text-xs font-semibold flex items-center text-zinc-600 dark:text-zinc-400 hover:text-red-600">
                View <ArrowRight size={14} className="ml-1" />
              </button>
            </div>
          </div>
        </Card>

        {/* Card 4: Completed Tasks */}
        <Card className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-[15px]">Tasks Completed</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Your lifetime resolved work</p>
            </div>
            <div className="bg-emerald-500 text-white p-2 rounded-lg"><CheckCircle2 size={18} /></div>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-zinc-900 dark:text-white">{completedTasks.length}</h2>
            <div className="mt-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <span className="text-xs text-emerald-600 font-medium">Great job!</span>
              <ArrowRight size={14} className="text-emerald-600" />
            </div>
          </div>
        </Card>

      </div>

      {/* Projects Overview Row */}
      <div className="mb-6">
        <Card className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-32 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 dark:bg-indigo-900/50 p-2 rounded-lg border border-indigo-100 dark:border-indigo-800">
                <Folder size={20} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">Organization Projects</h3>
                <p className="text-xs text-zinc-500">Real-time overview of all initiatives.</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/projects')} className="rounded-xl h-9 text-xs font-semibold">
              View All Projects
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Active</span>
              </div>
              <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">{activeProjectsCount}</span>
            </div>
            
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Completed</span>
              </div>
              <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">{completedProjectsCount}</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Maintenance</span>
              </div>
              <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">{maintenanceProjectsCount}</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Total Projects</span>
              </div>
              <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">{allProjects.length}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Middle Row: Progress & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Project Progress Widget */}
        <Card className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg"><Activity size={18} className="text-zinc-600 dark:text-zinc-400" /></div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Workload Progress</h3>
              <p className="text-xs text-zinc-500">An overview of your task completion status.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-6">
            <div className="flex-1 h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex">
              {tasks.length > 0 ? (
                <div 
                  className="h-full bg-orange-500" 
                  style={{ width: `${(completedTasks.length / tasks.length) * 100}%` }}
                />
              ) : (
                <div className="h-full w-full bg-zinc-200 dark:bg-zinc-700" />
              )}
            </div>
            <span className="text-xs font-bold text-orange-600 ml-2">
              {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}% Completed
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <CheckCircle2 size={16} className="text-emerald-500" /> Resolved Tasks
              </div>
              <span className="font-semibold text-emerald-600">{completedTasks.length}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <Clock size={16} className="text-blue-500" /> Pending Work
              </div>
              <span className="font-semibold text-blue-600">{pendingTasks.length}</span>
            </div>
            <div className="flex justify-between items-center text-sm pb-1">
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <AlertCircle size={16} className="text-red-500" /> Pending Incidents
              </div>
              <span className="font-semibold text-zinc-500">{pendingIncidents.length}</span>
            </div>
          </div>
        </Card>

        {/* Team Activity Feed */}
        <Card className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg"><MessageSquare size={18} className="text-zinc-600 dark:text-zinc-400" /></div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Org Activity Feed</h3>
              <p className="text-xs text-zinc-500">Stay updated with recent task updates in your org.</p>
            </div>
          </div>
          
          <div className="space-y-5">
            {recentOrgActivity.map((act, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {act.assignee?.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-[13px] text-zinc-800 dark:text-zinc-200">
                    <span className="font-semibold">{act.assignee?.full_name || 'Unassigned'}</span> updated task <span className="font-semibold">"{act.title}"</span> to {act.status}.
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">{formatDistanceToNow(new Date(act.updated_at), { addSuffix: true })}</p>
                </div>
              </div>
            ))}
            {recentOrgActivity.length === 0 && (
              <p className="text-sm text-zinc-500">No recent activity found.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Table: Tasks Assigned to Me */}
      <Card className="rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="bg-white dark:bg-zinc-800 p-1.5 rounded border border-zinc-200 dark:border-zinc-700 shadow-sm">
            <Menu size={16} className="text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-[15px]">Tasks Assigned to Me</h3>
            <p className="text-xs text-zinc-500">View and manage all your active and pending tasks</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <th className="py-4 px-6 font-semibold text-zinc-600 dark:text-zinc-400 font-sans text-xs">Type</th>
                <th className="py-4 px-6 font-semibold text-zinc-600 dark:text-zinc-400 font-sans text-xs">Status</th>
                <th className="py-4 px-6 font-semibold text-zinc-600 dark:text-zinc-400 font-sans text-xs">Task Title</th>
                <th className="py-4 px-6 font-semibold text-zinc-600 dark:text-zinc-400 font-sans text-xs">Project</th>
                <th className="py-4 px-6 font-semibold text-zinc-600 dark:text-zinc-400 font-sans text-xs">Date</th>
                <th className="py-4 px-6 font-semibold text-zinc-600 dark:text-zinc-400 font-sans text-xs">Priority</th>
                <th className="py-4 px-6 font-semibold text-zinc-600 dark:text-zinc-400 font-sans text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingTasks.map((task) => (
                <tr 
                  key={task.id} 
                  className="border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
                  onClick={() => {
                    if (task._type === 'PTASK') navigate(`/dashboard/projects/${task.project_id}/history`);
                    else if (task._type === 'INCIDENT' || task._type === 'SCTASK') navigate(`/dashboard/incidents/${task.id}`);
                    else navigate(`/dashboard/tasks/${task.id}/update`);
                  }}
                >
                  <td className="py-4 px-6">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider rounded-md text-zinc-500 border-zinc-200 dark:border-zinc-700">
                      {task._type}
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-xs font-semibold ${
                      task.status === 'in_progress' ? 'text-orange-500' :
                      task.status === 'done' || task.status === 'Resolved' ? 'text-emerald-500' :
                      task.status === 'blocked' ? 'text-red-500' : 'text-zinc-500'
                    }`}>
                      {task.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-medium text-zinc-800 dark:text-zinc-200">{task.title}</td>
                  <td className="py-4 px-6 text-zinc-500">{task.projects?.name || 'Service Desk'}</td>
                  <td className="py-4 px-6 text-zinc-500">{format(new Date(task.created_at || new Date()), 'MMM dd, yyyy')}</td>
                  <td className="py-4 px-6">
                    <span className={`text-[13px] font-semibold ${
                      task.priority?.includes('urgent') || task.priority?.includes('p1') ? 'text-red-600' :
                      task.priority?.includes('high') || task.priority?.includes('p2') ? 'text-orange-500' :
                      task.priority?.includes('medium') || task.priority?.includes('p3') ? 'text-blue-500' : 'text-zinc-500'
                    }`}>
                      {task.priority?.split('_').pop()?.toUpperCase() || 'NORMAL'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-semibold underline underline-offset-2">
                      View
                    </span>
                  </td>
                </tr>
              ))}
              {pendingTasks.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    No active tasks assigned to you right now. You're all caught up!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Completed Tasks Table */}
      <Card className="rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden mt-6 opacity-75 hover:opacity-100 transition-opacity">
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/30 dark:bg-zinc-900/10">
          <div className="bg-white dark:bg-zinc-800 p-1.5 rounded border border-zinc-200 dark:border-zinc-700 shadow-sm">
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-[15px]">My Completed Work</h3>
            <p className="text-xs text-zinc-500">History of tasks and tickets you've recently resolved</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <th className="py-3 px-6 font-semibold text-zinc-400 dark:text-zinc-500 font-sans text-xs">Type</th>
                <th className="py-3 px-6 font-semibold text-zinc-400 dark:text-zinc-500 font-sans text-xs">Status</th>
                <th className="py-3 px-6 font-semibold text-zinc-400 dark:text-zinc-500 font-sans text-xs">Task Title</th>
                <th className="py-3 px-6 font-semibold text-zinc-400 dark:text-zinc-500 font-sans text-xs">Project</th>
                <th className="py-3 px-6 font-semibold text-zinc-400 dark:text-zinc-500 font-sans text-xs">Completed On</th>
                <th className="py-3 px-6 font-semibold text-zinc-400 dark:text-zinc-500 font-sans text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {completedTasks.slice(0, 10).map((task) => (
                <tr 
                  key={task.id} 
                  className="border-b border-zinc-50 dark:border-zinc-800/30 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
                  onClick={() => {
                    if (task._type === 'PTASK') navigate(`/dashboard/projects/${task.project_id}/history`);
                    else if (task._type === 'INCIDENT' || task._type === 'SCTASK') navigate(`/dashboard/incidents/${task.id}`);
                    else navigate(`/dashboard/tasks/${task.id}/update`);
                  }}
                >
                  <td className="py-3 px-6">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider rounded-md text-zinc-400 border-zinc-200 dark:border-zinc-800">
                      {task._type}
                    </Badge>
                  </td>
                  <td className="py-3 px-6">
                    <span className="text-xs font-semibold text-emerald-500">
                      {task.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="py-3 px-6 font-medium text-zinc-500 line-through decoration-zinc-300 dark:decoration-zinc-700">{task.title}</td>
                  <td className="py-3 px-6 text-zinc-400">{task.projects?.name || 'Service Desk'}</td>
                  <td className="py-3 px-6 text-zinc-400">{format(new Date(task.updated_at || task.created_at || new Date()), 'MMM dd, yyyy')}</td>
                  <td className="py-3 px-6">
                    <span className="text-blue-500 hover:text-blue-700 text-sm font-semibold underline underline-offset-2">
                      View
                    </span>
                  </td>
                </tr>
              ))}
              {completedTasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-400 text-xs">
                    No completed tasks found in your history.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
