import React, { useState, useEffect } from "react";
import { AlertCircle, Plus, MoreHorizontal, Filter, Search, Edit3, Users, User, AlertTriangle, CheckCircle, Ticket, History, Clock, Activity } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { useOrganization } from "../hooks/useOrganization";
import { supabase } from "../../shared/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "p1_critical": return "text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400";
    case "p2_high": return "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400";
    case "p3_medium": return "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400";
    case "p4_low": return "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400";
    default: return "text-zinc-600 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400";
  }
};

const getDisplayPriority = (priority: string) => {
  return priority.split('_')[1] || priority;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "new": return "border-rose-200 text-rose-700 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400";
    case "in_progress": return "border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400";
    case "resolved": return "border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400";
    case "closed": return "border-zinc-200 text-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-zinc-400";
    default: return "border-zinc-200 text-zinc-700";
  }
};

export default function Incidents() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const { orgId } = useOrganization();
  const { session } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const fetchIncidents = async () => {
    if (!orgId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("incidents")
      .select(`*, assignee:users!incidents_assignee_id_fkey(full_name), team:teams!incidents_team_id_fkey(name)`)
      .order("created_at", { ascending: false });
      
    if (data) {
      const incidentsOnly = data.filter((inc: any) => 
        inc.ticket_type !== 'sctask' && !inc.title.toLowerCase().includes('sctask')
      );
      setIncidents(incidentsOnly);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIncidents();
  }, [orgId, session]);

  const filteredIncidents = incidents.filter(i => 
    i.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (i.description && i.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeCount = incidents.filter(i => i.status !== 'closed' && i.status !== 'resolved').length;
  const criticalCount = incidents.filter(i => i.priority === 'p1_critical' && i.status !== 'closed' && i.status !== 'resolved').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-8 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl border-2 border-white dark:border-zinc-950 shadow-sm bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 flex items-center justify-center">
              <Ticket className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Incidents & Tickets
              </h1>
              <p className="text-zinc-500 text-sm mt-1">
                Manage and track service requests and issues.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button asChild className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all font-bold active:scale-[0.98]">
              <Link to="/dashboard/incidents/create">
                <Plus className="mr-2 h-5 w-5" /> Create Incident
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <Card className="p-6 rounded-3xl border-zinc-200/80 dark:border-zinc-800/80 shadow-sm bg-white dark:bg-zinc-950">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Total Tickets</p>
              <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-100">{incidents.length}</h3>
            </div>
            <div className="h-12 w-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-500">
              <Ticket className="h-6 w-6" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 rounded-3xl border-zinc-200/80 dark:border-zinc-800/80 shadow-sm bg-white dark:bg-zinc-950">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Active Tickets</p>
              <h3 className="text-3xl font-black text-blue-600 dark:text-blue-400">{activeCount}</h3>
            </div>
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600">
              <Activity className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border-rose-200/80 dark:border-rose-900/40 shadow-sm bg-white dark:bg-zinc-950 relative overflow-hidden">
          <div className="absolute inset-0 bg-rose-500/5" />
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-1">Critical (Active)</p>
              <h3 className="text-3xl font-black text-rose-700 dark:text-rose-500">{criticalCount}</h3>
            </div>
            <div className="h-12 w-12 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center gap-4 bg-zinc-50/50 dark:bg-zinc-900/30 justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="Search tickets by title or description..." 
                className="pl-9 h-11 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm focus-visible:ring-indigo-500 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="h-11 rounded-xl border-zinc-200 dark:border-zinc-800 shadow-sm font-semibold text-zinc-600 dark:text-zinc-300">
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center">
              <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-zinc-500 font-medium">Loading tickets...</p>
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="p-20 flex flex-col items-center justify-center text-center">
              <div className="h-20 w-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                <Ticket className="h-8 w-8 text-zinc-400 dark:text-zinc-600" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">No tickets found</h3>
              <p className="text-zinc-500 text-sm mt-1 max-w-xs">We couldn't find any tickets matching your search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800">
                    <TableHead className="h-12 font-bold text-xs uppercase tracking-wider text-zinc-500">Ticket Details</TableHead>
                    <TableHead className="h-12 font-bold text-xs uppercase tracking-wider text-zinc-500">Priority</TableHead>
                    <TableHead className="h-12 font-bold text-xs uppercase tracking-wider text-zinc-500">Status</TableHead>
                    <TableHead className="h-12 font-bold text-xs uppercase tracking-wider text-zinc-500">Assignment</TableHead>
                    <TableHead className="h-12 font-bold text-xs uppercase tracking-wider text-zinc-500 text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncidents.map((incident) => (
                    <TableRow 
                      key={incident.id} 
                      className="group border-zinc-100 dark:border-zinc-800/80 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors cursor-pointer"
                      onClick={() => navigate(`/dashboard/incidents/${incident.id}`)}
                    >
                      <TableCell className="py-4 align-top">
                        <div className="flex flex-col max-w-md">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 text-[15px] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                            {incident.title}
                          </span>
                          <span className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" /> 
                            {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-4 align-top">
                        <Badge variant="secondary" className={`font-bold capitalize px-2.5 py-0.5 rounded-md ${getPriorityColor(incident.priority)}`}>
                          {getDisplayPriority(incident.priority)}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-4 align-top">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border uppercase tracking-wider ${getStatusColor(incident.status)}`}>
                          {incident.status.replace('_', ' ')}
                        </span>
                      </TableCell>
                      
                      <TableCell className="py-4 align-top">
                        {incident.assignee ? (
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border-2 border-white dark:border-zinc-900 shadow-sm">
                              <AvatarFallback className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold">
                                {getInitials(incident.assignee.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{incident.assignee.full_name}</span>
                          </div>
                        ) : incident.team ? (
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                              <Users className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{incident.team.name}</span>
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
                      
                      <TableCell className="py-4 align-top text-right pr-6">
                        <div className="flex items-center justify-end gap-2 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30"
                            onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/incidents/${incident.id}/update`); }}
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
                                <Link to={`/dashboard/incidents/${incident.id}/update`} className="flex items-center">
                                  <Edit3 className="mr-3 h-4 w-4 text-indigo-500" /> <span className="font-medium">Update Ticket</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5" onClick={(e) => e.stopPropagation()}>
                                <Link to={`/dashboard/incidents/${incident.id}/history`} className="flex items-center">
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
