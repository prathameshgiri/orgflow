import React, { useState, useEffect } from "react";
import { AlertTriangle, Clock, CheckCircle2, Ticket, BarChart3, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrganization } from "../hooks/useOrganization";
import { Link } from "react-router-dom";
import { supabase } from "../../shared/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

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
          setIncidents(data.incidents || []);
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
      case 'new': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'closed': return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const unassignedCount = incidents.filter(i => !i.assignee).length;
  const resolvedCount = incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Desk</h1>
          <p className="text-zinc-500">Overview of your IT service operations and SLAs.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
            <Link to="/dashboard/service-desk/create">
              <Ticket className="mr-2 h-4 w-4" /> New Ticket
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">Unassigned Tickets</p>
            <h3 className="text-2xl font-bold mt-1">{unassignedCount}</h3>
          </div>
          <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-500">
            <Ticket className="h-5 w-5" />
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-red-200 dark:border-red-900/50 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-600 dark:text-red-400">SLA Breached</p>
            <h3 className="text-2xl font-bold mt-1 text-red-700 dark:text-red-400">0</h3>
          </div>
          <div className="h-10 w-10 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">Avg Resolution Time</p>
            <h3 className="text-2xl font-bold mt-1">0h</h3>
          </div>
          <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">Resolved Today</p>
            <h3 className="text-2xl font-bold mt-1">{resolvedCount}</h3>
          </div>
          <div className="h-10 w-10 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-zinc-500" />
            <h3 className="text-lg font-semibold">Ticket Volume</h3>
          </div>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-lg">
            <p className="text-zinc-500">Not enough data to display chart.</p>
          </div>
        </div>

        {/* Action Required / New Tickets */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Action Required (New)</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar max-h-64">
            {incidents.filter(i => i.status === 'new').length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                <p>No new tickets requiring action.</p>
              </div>
            ) : (
              incidents.filter(i => i.status === 'new').map(incident => (
                <div key={incident.id} className="p-3 rounded-lg border border-orange-100 dark:border-orange-900/30 bg-orange-50/50 dark:bg-orange-900/10 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">{incident.title}</h4>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
                    <span>{formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}</span>
                    <Link to="/dashboard/incidents" className="text-blue-600 hover:underline font-medium">Review &rarr;</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity (Full Width) */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center p-8 text-zinc-500">Loading tickets...</div>
            ) : incidents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-zinc-500">
                <p>No recent activity found.</p>
              </div>
            ) : (
              incidents.filter(i => i.status !== 'new').slice(0, 10).map(incident => (
                <div key={incident.id} className="p-4 rounded-lg border border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{incident.title}</h4>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${getStatusColor(incident.status)} uppercase tracking-wider`}>
                      {incident.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <p className="text-sm text-zinc-500 mb-3 line-clamp-2">
                    {incident.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-4">
                      {/* Reporter */}
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={incident.reporter?.avatar_url} />
                          <AvatarFallback className="text-[10px]">{getInitials(incident.reporter?.full_name)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-zinc-500">
                          Raised by <span className="font-medium text-zinc-700 dark:text-zinc-300">{incident.reporter?.full_name || 'Unknown'}</span>
                        </span>
                      </div>
                      
                      {/* Assignee / Team */}
                      <div className="flex items-center space-x-2 border-l border-zinc-200 dark:border-zinc-800 pl-4">
                        <span className="text-xs text-zinc-500">
                          Assigned to:{' '}
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {incident.assignee ? incident.assignee.full_name : incident.team ? incident.team.name : 'Unassigned'}
                          </span>
                        </span>
                      </div>
                    </div>
                    
                    <span className="text-xs text-zinc-400">
                      {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
