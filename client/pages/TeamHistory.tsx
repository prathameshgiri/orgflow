import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useOrganization } from "../hooks/useOrganization";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Activity, FileText, UserPlus, UserMinus, PlusCircle, Settings, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { supabase } from "../../shared/supabase";

export default function TeamHistory() {
  const { id } = useParams<{ id: string }>();
  const { orgId } = useOrganization();
  const { session } = useAuth();
  
  const [team, setTeam] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamAndHistory = async () => {
      if (!orgId || !id || !session?.access_token) return;
      setLoading(true);

      try {
        // Fetch team details for header
        const { data: teamData } = await supabase.from('teams').select('*').eq('id', id).single();
        if (teamData) setTeam(teamData);

        // Fetch history
        const res = await fetch(`/api/teams/${id}/history`, {
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "x-org-id": orgId
          }
        });
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (error) {
        console.error("Failed to load history", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamAndHistory();
  }, [orgId, id, session]);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getActionDetails = (action: string) => {
    switch (action) {
      case 'created':
        return { icon: PlusCircle, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/40', border: 'border-indigo-200 dark:border-indigo-800' };
      case 'member_added':
        return { icon: UserPlus, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/40', border: 'border-emerald-200 dark:border-emerald-800' };
      case 'member_removed':
        return { icon: UserMinus, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/40', border: 'border-rose-200 dark:border-rose-800' };
      default:
        return { icon: Settings, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/40', border: 'border-amber-200 dark:border-amber-800' };
    }
  };

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen">
      
      {/* Header with Breadcrumb */}
      <div className="flex flex-col gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-8 pt-4">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
          <Link to="/dashboard/teams" className="hover:text-indigo-600 transition-colors">Teams</Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100">{team?.name || 'Loading...'}</span>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100">History</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-full h-10 w-10 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 shadow-sm shrink-0">
            <Link to="/dashboard/teams">
              <ArrowLeft className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </Link>
          </Button>
          <div className="flex items-center gap-4 flex-1">
            <Avatar className="h-14 w-14 rounded-2xl border-2 border-white dark:border-zinc-950 shadow-sm bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400">
              <AvatarFallback className="bg-transparent font-bold text-xl">
                {team ? getInitials(team.name) : <Users className="h-6 w-6" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Team History
              </h1>
              <p className="text-zinc-500 text-sm mt-1 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Audit log and activity timeline.
              </p>
            </div>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Activity Timeline</h2>
                <p className="text-sm font-medium text-zinc-500">Track all changes and updates</p>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">{history.length} Records</span>
            </div>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-zinc-500 font-medium">Loading history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="h-24 w-24 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-6">
                  <FileText className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-zinc-100">No History Yet</h3>
                <p className="text-zinc-500 max-w-sm">Activities will appear here once members are added or the team is updated.</p>
              </div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="relative border-l-2 border-zinc-100 dark:border-zinc-800/80 ml-6 sm:ml-8 space-y-10 pb-4"
              >
                {history.map((log) => {
                  const { icon: ActionIcon, color, bg, border } = getActionDetails(log.action);
                  
                  return (
                    <motion.div variants={itemVariants} key={log.id} className="relative pl-10 sm:pl-12">
                      {/* Timeline Node */}
                      <div className="absolute -left-[1.35rem] top-1 h-10 w-10 rounded-full bg-white dark:bg-zinc-950 border-4 border-white dark:border-zinc-950 flex items-center justify-center z-10 shadow-sm">
                        <div className={`h-full w-full rounded-full flex items-center justify-center shadow-sm ${bg} ${color} ${border} border`}>
                          <ActionIcon className="h-4 w-4" />
                        </div>
                      </div>
                      
                      {/* Action Card */}
                      <div className="group bg-white dark:bg-zinc-950 rounded-2xl p-5 sm:p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm">
                              <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs">
                                {getInitials(log.users?.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                                {log.users?.full_name || 'System'}
                              </span>
                              <span className="text-xs text-zinc-500 font-medium">
                                {log.users?.email || 'Automated Action'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-100 dark:border-zinc-800">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(log.occurred_at).toLocaleString(undefined, {
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        
                        <div className="text-[15px] text-zinc-600 dark:text-zinc-300 leading-relaxed bg-zinc-50/50 dark:bg-zinc-900/30 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                          {log.action === 'created' ? (
                            <span>Created the team <strong className="text-indigo-600 dark:text-indigo-400">{log.details.name}</strong></span>
                          ) : log.action === 'member_added' ? (
                            <span>Added user <strong className="text-emerald-600 dark:text-emerald-400">{log.details.target_user_name || "Unknown"}</strong> to the team</span>
                          ) : log.action === 'member_removed' ? (
                            <span>Removed user <strong className="text-rose-600 dark:text-rose-400">{log.details.target_user_name || "Unknown"}</strong> from the team</span>
                          ) : (
                            <span>Performed action: <strong className="text-zinc-800 dark:text-zinc-200">{log.action}</strong></span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
