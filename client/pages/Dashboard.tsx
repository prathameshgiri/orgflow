import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useOrganization } from "../hooks/useOrganization";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckSquare, AlertCircle, Clock, CheckCircle2, 
  ArrowRight, Search, Menu, Bell, LayoutDashboard,
  MessageSquare, Settings, Activity, Briefcase, Folder, Calendar
} from "lucide-react";
import { supabase } from "../../shared/supabase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { formatDistanceToNow, format, subDays } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
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

  const pendingTasks = tasks.filter(t => !['done', 'Resolved', 'Closed'].includes(t.status));
  const completedTasks = tasks.filter(t => ['done', 'Resolved', 'Closed'].includes(t.status));
  
  const pendingPTasks = pendingTasks.filter(t => t._type === 'PTASK');
  const pendingSCTasks = pendingTasks.filter(t => t._type === 'SCTASK');
  const pendingIncidents = pendingTasks.filter(t => t._type === 'INCIDENT');

  const activeProjectsCount = allProjects.filter(p => p.status === 'In Progress').length;
  const completedProjectsCount = allProjects.filter(p => p.status === 'Completed').length;
  const maintenanceProjectsCount = allProjects.filter(p => p.status === 'Maintenance').length;

  const chartData = React.useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'MMM dd');
      const resolvedCount = completedTasks.filter(t => 
        format(new Date(t.updated_at || t.created_at || new Date()), 'MMM dd') === dateStr
      ).length;
      data.push({ name: dateStr, resolved: resolvedCount });
    }
    return data;
  }, [completedTasks]);

  const priorityData = React.useMemo(() => {
    const high = pendingTasks.filter(t => t.priority?.includes('urgent') || t.priority?.includes('p1') || t.priority?.includes('high') || t.priority?.includes('p2')).length;
    const medium = pendingTasks.filter(t => t.priority?.includes('medium') || t.priority?.includes('p3')).length;
    const low = pendingTasks.filter(t => t.priority?.includes('low') || t.priority?.includes('p4') || !t.priority).length;
    
    return [
      { name: 'High/Urgent', value: high, color: '#ef4444' },
      { name: 'Medium', value: medium, color: '#3b82f6' },
      { name: 'Low/Normal', value: low, color: '#10b981' }
    ].filter(d => d.value > 0);
  }, [pendingTasks]);

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

  // Determine greeting based on IST (Indian Standard Time) hour
  const hour = parseInt(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Asia/Kolkata' }).format(new Date()), 10);
  const greeting = (hour >= 5 && hour < 12) ? 'Good Morning' : (hour >= 12 && hour < 17) ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="bg-zinc-50/50 dark:bg-zinc-950 min-h-screen p-4 md:p-8 animate-in fade-in duration-500">
      
      {/* Greeting & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            {greeting}, {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-zinc-500 mt-1">Here is what's happening in your organization today.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 pb-2 md:pb-0">
          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl mr-2 shadow-sm">
            <div className={`w-2.5 h-2.5 rounded-full ${pendingIncidents.length > 0 ? 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></div>
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {pendingIncidents.length > 0 ? 'Degraded System' : 'All Systems Go'}
            </span>
          </div>
          
          <Button onClick={() => navigate('/dashboard/tasks')} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl shadow-sm whitespace-nowrap">
            <CheckSquare className="mr-2 h-4 w-4 text-blue-500" /> New Task
          </Button>
          <Button onClick={() => navigate('/dashboard/incidents')} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl shadow-sm whitespace-nowrap">
            <AlertCircle className="mr-2 h-4 w-4 text-red-500" /> Report Incident
          </Button>
          <Button onClick={() => navigate('/dashboard/projects/create')} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md whitespace-nowrap">
            <Folder className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>
      </div>
      

      
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Productivity Trends */}
        <Card className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400"><Activity size={18} /></div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Productivity Trend</h3>
                <p className="text-xs text-zinc-500">Tasks resolved over the last 7 days</p>
              </div>
            </div>
          </div>
          
          <div className="h-56 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-zinc-800" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tw-colors-white)' }}
                  itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="resolved" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Priority Distribution Donut Chart */}
        <Card className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg text-orange-600 dark:text-orange-400"><LayoutDashboard size={18} /></div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Task Priorities</h3>
              <p className="text-xs text-zinc-500">Breakdown of your pending work</p>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-[200px] flex items-center justify-center relative">
            {priorityData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={priorityData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                  <span className="text-2xl font-black text-zinc-800 dark:text-zinc-200">{pendingTasks.length}</span>
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Tasks</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-zinc-400">
                <CheckCircle2 size={32} className="mb-2 opacity-20" />
                <span className="text-sm font-medium">No pending tasks</span>
              </div>
            )}
          </div>
          
          {priorityData.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              {priorityData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></div>
                  <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">{d.name} <span className="text-zinc-400 dark:text-zinc-500 ml-0.5">({d.value})</span></span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Team Activity Feed */}
        <Card className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg"><MessageSquare size={18} className="text-zinc-600 dark:text-zinc-400" /></div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Org Activity Feed</h3>
              <p className="text-xs text-zinc-500">Stay updated with recent task updates.</p>
            </div>
          </div>
          
          <div className="space-y-5">
            {recentOrgActivity.map((act, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                  {act.assignee?.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-[13px] text-zinc-800 dark:text-zinc-200 leading-tight">
                    <span className="font-semibold">{act.assignee?.full_name || 'Unassigned'}</span> updated task <span className="font-semibold">"{act.title}"</span> to {act.status}.
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1.5 font-medium">{formatDistanceToNow(new Date(act.updated_at || act.created_at || new Date()), { addSuffix: true })}</p>
                </div>
              </div>
            ))}
            {recentOrgActivity.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-zinc-400">
                <Activity size={24} className="mb-2 opacity-20" />
                <span className="text-sm">No recent activity.</span>
              </div>
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
                <th className="py-4 px-6 font-semibold text-zinc-600 dark:text-zinc-400 font-sans text-xs w-[40%]">Task Details</th>
                <th className="py-4 px-6 font-semibold text-zinc-600 dark:text-zinc-400 font-sans text-xs w-[25%]">Status & Type</th>
                <th className="py-4 px-6 font-semibold text-zinc-600 dark:text-zinc-400 font-sans text-xs w-[25%]">Timeline & Priority</th>
                <th className="py-4 px-6 font-semibold text-zinc-600 dark:text-zinc-400 font-sans text-xs text-right w-[10%]">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingTasks.map((task) => (
                <tr 
                  key={task.id} 
                  className="border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer group"
                  onClick={() => {
                    if (task._type === 'PTASK') navigate(`/dashboard/tasks/${task.id}`);
                    else if (task._type === 'INCIDENT' || task._type === 'SCTASK') navigate(`/dashboard/incidents/${task.id}`);
                    else navigate(`/dashboard/tasks/${task.id}/update`);
                  }}
                >
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 text-[14px] leading-tight">{task.title}</span>
                      <span className="text-[12px] font-medium text-zinc-500 truncate max-w-[300px]">{task.projects?.name || 'Service Desk'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col items-start gap-1.5">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        task.status === 'in_progress' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' :
                        task.status === 'done' || task.status === 'Resolved' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' :
                        task.status === 'blocked' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 text-zinc-300'
                      }`}>
                        {task.status === 'todo' ? 'New' : task.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </span>
                      <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-wider rounded-sm text-zinc-400 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-1.5 py-0">
                        {task._type}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1.5">
                      <span className={`text-[11px] font-bold ${
                        task.priority?.includes('urgent') || task.priority?.includes('p1') ? 'text-red-600' :
                        task.priority?.includes('high') || task.priority?.includes('p2') ? 'text-orange-500' :
                        task.priority?.includes('medium') || task.priority?.includes('p3') ? 'text-blue-500' : 'text-zinc-500'
                      }`}>
                        {task.priority?.split('_').pop()?.toUpperCase() || 'NORMAL'} PRIORITY
                      </span>
                      <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" /> {format(new Date(task.created_at || new Date()), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </td>
                </tr>
              ))}
              {pendingTasks.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-zinc-500">
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
                <th className="py-3 px-6 font-semibold text-zinc-400 dark:text-zinc-500 font-sans text-xs w-[40%]">Task Details</th>
                <th className="py-3 px-6 font-semibold text-zinc-400 dark:text-zinc-500 font-sans text-xs w-[25%]">Status & Type</th>
                <th className="py-3 px-6 font-semibold text-zinc-400 dark:text-zinc-500 font-sans text-xs w-[25%]">Timeline & Priority</th>
                <th className="py-3 px-6 font-semibold text-zinc-400 dark:text-zinc-500 font-sans text-xs text-right w-[10%]">Action</th>
              </tr>
            </thead>
            <tbody>
              {completedTasks.slice(0, 10).map((task) => (
                <tr 
                  key={task.id} 
                  className="border-b border-zinc-50 dark:border-zinc-800/30 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer group"
                  onClick={() => {
                    if (task._type === 'PTASK') navigate(`/dashboard/tasks/${task.id}`);
                    else if (task._type === 'INCIDENT' || task._type === 'SCTASK') navigate(`/dashboard/incidents/${task.id}`);
                    else navigate(`/dashboard/tasks/${task.id}/update`);
                  }}
                >
                  <td className="py-3 px-6">
                    <div className="flex flex-col gap-1 opacity-70">
                      <span className="font-bold text-zinc-500 dark:text-zinc-400 text-[14px] leading-tight line-through">{task.title}</span>
                      <span className="text-[12px] font-medium text-zinc-400 dark:text-zinc-600 truncate max-w-[300px]">{task.projects?.name || 'Service Desk'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex flex-col items-start gap-1.5 opacity-80">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-500">
                        {task.status === 'todo' ? 'New' : task.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </span>
                      <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-wider rounded-sm text-zinc-400 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-1.5 py-0">
                        {task._type}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex flex-col gap-1.5 opacity-80">
                      <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-600">
                        {task.priority?.split('_').pop()?.toUpperCase() || 'NORMAL'} PRIORITY
                      </span>
                      <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" /> {format(new Date(task.updated_at || task.created_at || new Date()), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-500 transition-colors">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </td>
                </tr>
              ))}
              {completedTasks.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-zinc-400 text-xs">
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
