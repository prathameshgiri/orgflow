import React, { useState, useEffect } from "react";
import { Activity, Clock, CheckCircle2, FileText, Users, User, ArrowRight, CheckCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrganization } from "../hooks/useOrganization";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { supabase } from "../../shared/supabase";

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'p1_critical': return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
    case 'p2_high': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
    case 'p3_medium': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
    case 'p4_low': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
    default: return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new': return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
    case 'in_progress': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
    case 'resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
    case 'closed': return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
    default: return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
  }
};

const getInitials = (name?: string) => {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
};

export default function ServiceActivity() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { orgId } = useOrganization();
  const { session } = useAuth();
  const navigate = useNavigate();

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
          setIncidents(data.incidents || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchIncidents();

    if (orgId && session?.user) {
      const channel = supabase.channel('service-activity-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents', filter: `organization_id=eq.${orgId}` }, () => {
           fetchIncidents();
        })
        .subscribe();
        
      return () => { supabase.removeChannel(channel); };
    }
  }, [orgId, session]);

  const activeActivity = incidents.filter(i => ['new', 'in_progress', 'resolved'].includes(i.status));
  const closedActivity = incidents.filter(i => i.status === 'closed');

  const renderActivityList = (activityList: any[]) => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-500 space-y-4">
          <div className="h-8 w-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="font-medium">Loading activity...</p>
        </div>
      );
    }
    
    if (activityList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-500 space-y-4">
          <div className="h-16 w-16 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center">
             <FileText className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
          </div>
          <div className="text-center">
            <p className="font-bold text-zinc-800 dark:text-zinc-300">No activity found</p>
          </div>
        </div>
      );
    }

    return (
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
        {activityList.map(incident => (
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
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-3 text-zinc-500" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">All Recent Activity</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Detailed view of all updates across tickets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Active & Resolved */}
        <Card className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Active & Resolved</h3>
                <p className="text-xs font-medium text-zinc-500">Tickets currently in progress or recently resolved</p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
            {renderActivityList(activeActivity)}
          </div>
        </Card>

        {/* Closed */}
        <Card className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[500px] opacity-80 hover:opacity-100 transition-opacity">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-600 dark:text-zinc-400 shadow-sm">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Closed Tickets</h3>
                <p className="text-xs font-medium text-zinc-500">Archived and fully closed tickets</p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
            {renderActivityList(closedActivity)}
          </div>
        </Card>
      </div>
    </div>
  );
}
