import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useOrganization } from "../hooks/useOrganization";
import { Card } from "@/components/ui/card";
import { Users, Building2, CheckSquare, AlertCircle, AlertTriangle, FileText, CheckCircle, Clock, Activity, Briefcase, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "../../shared/supabase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useAuth();
  const { orgId, loading: orgLoading } = useOrganization();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeProjects: 0,
    totalProjects: 0,
    totalTasks: 0,
    pendingTasks: 0,
    myPendingTasks: 0,
    myTotalTasks: 0,
    activeIncidents: 0,
    totalIncidents: 0,
    openRequests: 0,
    totalRequests: 0,
    pendingApprovals: 0,
    totalApprovals: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentTasks, setRecentTasks] = useState<any[]>([]);

  const getDisplayStatus = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'todo' || s === 'new' || s === 'created') return 'CREATED';
    if (s === 'done' || s === 'closed') return 'CLOSED';
    return status?.replace('_', ' ').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'todo':
      case 'new': 
      case 'created':
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'review': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
      case 'done':
      case 'closed': 
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      default: return 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
    }
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!orgId || !user) return;
      
      setLoading(true);
      setError("");

      try {
        const [
          usersRes,
          projectsActiveRes,
          projectsTotalRes,
          tasksTotalRes,
          tasksPendingRes,
          tasksMyPendingRes,
          tasksMyTotalRes,
          incidentsActiveRes,
          incidentsTotalRes,
          requestsOpenRes,
          requestsTotalRes,
          approvalsPendingRes,
          approvalsTotalRes,
          recentTasksRes
        ] = await Promise.all([
          supabase.from("users").select("*", { count: "exact", head: true }),
          supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "In Progress"),
          supabase.from("projects").select("*", { count: "exact", head: true }),
          supabase.from("tasks").select("*", { count: "exact", head: true }),
          supabase.from("tasks").select("*", { count: "exact", head: true }).neq("status", "done"),
          supabase.from("tasks").select("*", { count: "exact", head: true }).neq("status", "done").eq("assignee_id", user.id),
          supabase.from("tasks").select("*", { count: "exact", head: true }).eq("assignee_id", user.id),
          supabase.from("incidents").select("*", { count: "exact", head: true }).neq("status", "Resolved"),
          supabase.from("incidents").select("*", { count: "exact", head: true }),
          supabase.from("requests").select("*", { count: "exact", head: true }).neq("status", "Closed"),
          supabase.from("requests").select("*", { count: "exact", head: true }),
          supabase.from("approvals").select("*", { count: "exact", head: true }).eq("status", "Pending"),
          supabase.from("approvals").select("*", { count: "exact", head: true }),
          supabase.from("tasks").select("*, projects(name)").neq("status", "done").order("created_at", { ascending: false }).limit(5)
        ]);

        if (usersRes.error) throw usersRes.error;
        
        setRecentTasks(recentTasksRes?.data || []);

        setStats({
          totalMembers: usersRes.count || 0,
          activeProjects: projectsActiveRes.count || 0,
          totalProjects: projectsTotalRes.count || 0,
          totalTasks: tasksTotalRes.count || 0,
          pendingTasks: tasksPendingRes.count || 0,
          myPendingTasks: tasksMyPendingRes.count || 0,
          myTotalTasks: tasksMyTotalRes.count || 0,
          activeIncidents: incidentsActiveRes.count || 0,
          totalIncidents: incidentsTotalRes.count || 0,
          openRequests: requestsOpenRes.count || 0,
          totalRequests: requestsTotalRes.count || 0,
          pendingApprovals: approvalsPendingRes.count || 0,
          totalApprovals: approvalsTotalRes.count || 0
        });
        
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch dashboard stats. Check console for details.");
      } finally {
        setLoading(false);
      }
    };

    if (!orgLoading) {
      fetchDashboardStats();
    }
  }, [orgId, orgLoading, user]);

  if (orgLoading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );

  if (!orgId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
        <Building2 className="h-20 w-20 text-indigo-300 mb-6" />
        <h2 className="text-3xl font-bold mb-3 tracking-tight">Welcome to OrgTask</h2>
        <p className="text-zinc-500 max-w-md text-lg">
          You don't belong to any organization yet. Please ask an administrator to invite you or create a new organization if you are a Super Admin.
        </p>
      </div>
    );
  }

  if (loading) return (
    <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      <p className="text-zinc-500 font-medium">Gathering your workspace data...</p>
    </div>
  );

  const statCards = [
    { title: "My Pending Tasks", value: stats.myPendingTasks, total: stats.myTotalTasks, totalLabel: "Total Assigned", icon: Clock, dotColor: "bg-amber-500", textColor: "text-amber-600", route: "/dashboard/tasks" },
    { title: "Active Incidents", value: stats.activeIncidents, total: stats.totalIncidents, totalLabel: "Total Reported", icon: AlertTriangle, dotColor: "bg-red-500", textColor: "text-red-600", route: "/dashboard/incidents" },
    { title: "Open Requests", value: stats.openRequests, total: stats.totalRequests, totalLabel: "Total Submitted", icon: FileText, dotColor: "bg-blue-500", textColor: "text-blue-600", route: "/dashboard/requests" },
    { title: "Pending Approvals", value: stats.pendingApprovals, total: stats.totalApprovals, totalLabel: "Total Requested", icon: CheckCircle, dotColor: "bg-emerald-500", textColor: "text-emerald-600", route: "/dashboard/approvals" },
    { title: "Total Pending Tasks", value: stats.pendingTasks, total: stats.totalTasks, totalLabel: "Total Created", icon: CheckSquare, dotColor: "bg-violet-500", textColor: "text-violet-600", route: "/dashboard/tasks" },
    { title: "Active Projects", value: stats.activeProjects, total: stats.totalProjects, totalLabel: "Total Projects", icon: Briefcase, dotColor: "bg-cyan-500", textColor: "text-cyan-600", route: "/dashboard/projects" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6 pt-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Workspace Overview
          </h1>
          <p className="text-zinc-500 mt-2 text-lg">Your organization's operational pulse at a glance.</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="border-red-500/50 bg-red-500/10 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Stats Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {statCards.map((stat, i) => (
          <motion.div key={i} variants={itemVariants} className="cursor-pointer" onClick={() => navigate(stat.route)}>
            <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md bg-white dark:bg-zinc-950 overflow-hidden flex flex-col group transition-all duration-300">
              {/* Top Section */}
              <div className="p-6 flex items-center gap-4 bg-white dark:bg-zinc-950">
                <div className="h-14 w-14 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center shrink-0 shadow-sm">
                  <stat.icon className="h-6 w-6 text-zinc-600 dark:text-zinc-400" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[15px] font-medium text-zinc-500 dark:text-zinc-400">{stat.title}</p>
                  <h4 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight mt-0.5">{stat.value.toLocaleString()}</h4>
                </div>
              </div>
              
              {/* Middle Section */}
              <div className="px-6 py-3.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-950">
                <div className="flex items-center gap-2.5">
                  <div className={`h-2.5 w-2.5 rounded-full ${stat.dotColor}`}></div>
                  <span className="text-[15px] text-zinc-600 dark:text-zinc-400">{stat.totalLabel}</span>
                </div>
                <span className={`text-[15px] font-semibold ${stat.textColor}`}>{stat.total.toLocaleString()}</span>
              </div>
              
              {/* Bottom Section */}
              <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/30 mt-auto group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900/50 transition-colors">
                <span className="text-[15px] font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">See in details</span>
                <ArrowRight className="h-5 w-5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" strokeWidth={1.5} />
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      
      {/* Recent Active Tasks Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="mt-8"
      >
        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
            <h3 className="text-xl font-bold tracking-tight">Recent Pending Tasks</h3>
            <button onClick={() => navigate('/dashboard/tasks')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {recentTasks.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">No active tasks found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/30">
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTasks.map((task) => (
                    <TableRow key={task.id} className="cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors" onClick={() => navigate(`/dashboard/tasks/${task.id}/update`)}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell className="text-zinc-500">{task.projects?.name || '-'}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold whitespace-nowrap ${getStatusColor(task.status)}`}>
                          {getDisplayStatus(task.status)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${task.priority === 'urgent' ? 'bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:border-purple-800' : task.priority === 'high' ? 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:border-red-800' : task.priority === 'medium' ? 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-800' : 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800'}`}>
                          {task.priority?.toUpperCase()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </motion.div>
      
      {/* Secondary Metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="grid gap-6 md:grid-cols-2 mt-8"
      >
        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden flex flex-col">
          <div className="p-6 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0 shadow-sm">
              <Activity className="h-6 w-6 text-indigo-600 dark:text-indigo-400" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[15px] font-medium text-zinc-500 dark:text-zinc-400">Total System Activity</p>
              <h4 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight mt-0.5">
                {(stats.totalTasks + stats.totalIncidents + stats.totalRequests).toLocaleString()}
              </h4>
            </div>
          </div>
          <div className="px-6 py-3.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-950">
            <div className="flex items-center gap-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-indigo-500"></div>
              <span className="text-[15px] text-zinc-600 dark:text-zinc-400">All Items Tracked</span>
            </div>
          </div>
        </Card>
        
        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden flex flex-col cursor-pointer group hover:shadow-md transition-all" onClick={() => navigate("/dashboard/users")}>
          <div className="p-6 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl border border-violet-100 dark:border-violet-900/30 bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center shrink-0 shadow-sm">
              <Users className="h-6 w-6 text-violet-600 dark:text-violet-400" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[15px] font-medium text-zinc-500 dark:text-zinc-400">Organization Members</p>
              <h4 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight mt-0.5">
                {stats.totalMembers.toLocaleString()}
              </h4>
            </div>
          </div>
          <div className="px-6 py-3.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-950">
            <div className="flex items-center gap-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-violet-500"></div>
              <span className="text-[15px] text-zinc-600 dark:text-zinc-400">Active Users</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
