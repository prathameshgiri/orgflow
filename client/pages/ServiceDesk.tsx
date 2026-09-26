import React, { useState, useEffect } from "react";
import { AlertTriangle, Clock, CheckCircle2, Ticket, BarChart3, Plus, ArrowRight, ShieldAlert, Sparkles, Filter, ChevronRight, Activity, Zap, FileText, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrganization } from "../hooks/useOrganization";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ServiceDesk() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { orgId } = useOrganization();
  const { user, session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchIncidents = async () => {
      if (!orgId || !session) return;
      try {
        const res = await fetch(`/api/incidents`, {
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "x-org-id": orgId
          }
        });
        if (res.ok) {
          const data = await res.json();
          const allIncidents = data.incidents || [];
          setIncidents(allIncidents);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchIncidents();
  }, [orgId, session]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
      case 'in_progress': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      case 'resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
      case 'closed': return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'p1_critical': return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
      case 'p2_high': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
      case 'p3_medium': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      case 'p4_low': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  };

  const unassignedCount = incidents.filter(i => !i.assignee).length;
  const resolvedCount = incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length;
  const newTickets = incidents.filter(i => i.status === 'new');
  const recentActivity = incidents.slice(0, 10);

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-8 pt-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl border-2 border-white dark:border-zinc-950 shadow-sm bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 flex items-center justify-center">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Service Desk</h1>
            <p className="text-zinc-500 text-sm mt-1">Overview of your IT service operations and SLAs.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button asChild className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all font-bold active:scale-[0.98]">
            <Link to="/dashboard/service-desk/create">
              <Ticket className="mr-2 h-4 w-4" /> New Ticket
            </Link>
          </Button>
        </div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div variants={itemVariants}>
          <Card className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Unassigned Tickets</p>
                <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{loading ? "-" : unassignedCount}</h3>
              </div>
              <div className="h-12 w-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:scale-110 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-all duration-300">
                <Ticket className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-sm text-zinc-500 font-medium">
              <span className="flex h-2 w-2 rounded-full bg-zinc-400" /> Awaiting triage
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-rose-200/80 dark:border-rose-900/40 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="absolute inset-0 bg-rose-500/5 group-hover:bg-rose-500/10 transition-colors" />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-1">SLA Breached</p>
                <h3 className="text-3xl font-black text-rose-700 dark:text-rose-500 tracking-tight">0</h3>
              </div>
              <div className="h-12 w-12 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-sm text-rose-600 dark:text-rose-500 font-medium relative z-10">
              <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" /> Critical attention
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-blue-200/80 dark:border-blue-900/40 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">Avg Resolution</p>
                <h3 className="text-3xl font-black text-blue-700 dark:text-blue-500 tracking-tight">0<span className="text-xl">h</span></h3>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300">
                <Clock className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 font-medium">
              <span className="flex h-2 w-2 rounded-full bg-blue-500" /> Optimal performance
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 rotate-12 transform-gpu pointer-events-none group-hover:rotate-45 transition-transform duration-700">
               <CheckCircle2 className="h-32 w-32 text-emerald-500" />
             </div>
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Resolved Today</p>
                <h3 className="text-3xl font-black text-emerald-700 dark:text-emerald-500 tracking-tight">{loading ? "-" : resolvedCount}</h3>
              </div>
              <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-all duration-300">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 font-medium relative z-10">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" /> Great job!
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* Action Required / New Tickets */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-1">
          <Card className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Action Required</h3>
                  <p className="text-xs font-medium text-zinc-500">New tickets</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-white dark:bg-zinc-900 border-rose-200 dark:border-rose-900 text-rose-600 font-bold px-2 py-0.5 rounded-full">{newTickets.length}</Badge>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-zinc-50/20 dark:bg-zinc-950/20">
              {loading ? (
                 <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
                   <div className="h-8 w-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
                   <p className="font-medium">Loading...</p>
                 </div>
              ) : newTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
                  <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center">
                     <CheckCircle2 className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-zinc-800 dark:text-zinc-300">All caught up!</p>
                    <p className="text-sm mt-1">No new tickets require action.</p>
                  </div>
                </div>
              ) : (
                newTickets.map(incident => (
                  <Link key={incident.id} to={`/dashboard/incidents/${incident.id}`} className="group relative p-4 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md hover:border-rose-300 dark:hover:border-rose-700 transition-all block">
                    <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <div className="h-8 w-8 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center hover:bg-rose-200 dark:hover:bg-rose-900/60 transition-colors">
                         <ChevronRight className="h-4 w-4" />
                       </div>
                    </div>
                    <div className="pr-10">
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{incident.title.replace('[SCTASK] ', '')}</h4>
                      <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{incident.description || "No description provided."}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                       <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2.5 py-1 rounded-md border border-rose-100 dark:border-rose-900/50">
                         <Clock className="h-3 w-3" />
                         {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
                       </div>
                       <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider rounded-md border-rose-200 text-rose-600">New</Badge>
                       {incident.priority && (
                         <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider rounded-md ${getPriorityColor(incident.priority)}`}>
                           {incident.priority.split('_')[1]}
                         </Badge>
                       )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <Card className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-sm overflow-hidden h-[500px] flex flex-col">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between">
               <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Recent Activity</h3>
                  <p className="text-xs font-medium text-zinc-500">Latest updates across tickets</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild className="rounded-full h-8 text-xs font-bold border-zinc-200 dark:border-zinc-800">
                <Link to="/dashboard/incidents">View All</Link>
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-0 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
                  <div className="h-8 w-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="font-medium">Loading activity...</p>
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
                  <div className="h-16 w-16 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center">
                     <FileText className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-zinc-800 dark:text-zinc-300">No recent activity</p>
                    <p className="text-sm mt-1">Updates will appear here.</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {recentActivity.map(incident => (
                    <Link key={incident.id} to={`/dashboard/incidents/${incident.id}`} className="p-5 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors group block">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 pr-4">
                          <h4 className="font-bold text-[15px] text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{incident.title.replace('[SCTASK] ', '')}</h4>
                          <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{incident.description || "No description provided."}</p>
                        </div>
                        <div className="flex gap-2">
                          {incident.priority && (
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getPriorityColor(incident.priority)} uppercase tracking-wider`}>
                              {incident.priority.split('_')[1]}
                            </span>
                          )}
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getStatusColor(incident.status)} uppercase tracking-wider`}>
                            {incident.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4">

                          
                          {/* Team */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5">
                               {incident.team ? (
                                 <><Users className="h-3.5 w-3.5" /> {incident.team.name}</>
                               ) : (
                                 <><Users className="h-3.5 w-3.5" /> No Team</>
                               )}
                            </span>
                          </div>

                          {/* Assignee */}
                          <div className="flex items-center gap-2 border-l border-zinc-200 dark:border-zinc-800 pl-4">
                            <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5">
                              {incident.assignee ? (
                                <>
                                  <Avatar className="h-5 w-5"><AvatarFallback className="text-[8px] bg-indigo-100 text-indigo-700 font-bold">{getInitials(incident.assignee.full_name)}</AvatarFallback></Avatar>
                                  {incident.assignee.full_name}
                                </>
                              ) : (
                                <><User className="h-3.5 w-3.5" /> Unassigned</>
                              )}
                            </span>
                          </div>
                          
                          {/* Last Updated */}
                          <div className="flex items-center gap-1.5 border-l border-zinc-200 dark:border-zinc-800 pl-4 text-xs font-semibold text-zinc-500">
                             <Clock className="h-3.5 w-3.5" />
                             {formatDistanceToNow(new Date(incident.updated_at || incident.created_at), { addSuffix: true })}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                           <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                             Details <ArrowRight className="h-3 w-3" />
                           </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
