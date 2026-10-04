import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Ticket, Edit3, Clock, Users, User, History, CheckCircle2, AlertTriangle, ShieldAlert, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useOrganization } from "../hooks/useOrganization";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../../shared/supabase";
import { formatDistanceToNow, format } from "date-fns";

export default function IncidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { orgId } = useOrganization();
  const { session } = useAuth();

  useEffect(() => {
    const fetchDetails = async () => {
      if (!orgId || !id) return;
      try {
        const { data, error } = await supabase
          .from("incidents")
          .select(`
            *,
            assignee:users!incidents_assignee_id_fkey(full_name, email),
            reporter:users!incidents_reporter_id_fkey(full_name, email),
            team:teams!incidents_team_id_fkey(name)
          `)
          .eq("id", id)
          .single();
          
        if (!error && data) {
          setIncident(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetails();
  }, [id, orgId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
      case 'in_progress': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      case 'resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
      case 'closed': return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'p1_critical': return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
      case 'p2_high': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
      case 'p3_medium': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      case 'p4_low': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in">
        <div className="h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-500 font-medium">Loading ticket details...</p>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="h-20 w-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="h-10 w-10 text-zinc-400" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Ticket Not Found</h2>
        <p className="text-zinc-500 max-w-sm mb-8">The ticket you are looking for does not exist or you don't have permission to view it.</p>
        <Button onClick={() => navigate(-1)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
          Return Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-8 pt-4">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
          <button onClick={() => navigate(-1)} className="hover:text-indigo-600 transition-colors">Tickets</button>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100">Details</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-xl h-10 w-10 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 shadow-sm shrink-0">
              <ArrowLeft className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl border-2 border-white dark:border-zinc-950 shadow-sm bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Ticket className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {incident.title.replace('[SCTASK] ', '')}
                </h1>
                <p className="text-zinc-500 text-sm mt-1 uppercase tracking-wider font-semibold">
                  INC-{incident?.id?.substring(0, 8)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
             <Button variant="outline" asChild className="h-11 rounded-xl shadow-sm border-zinc-200 dark:border-zinc-800 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900">
                <Link to={`/dashboard/incidents/${incident.id}/history`}>
                  <History className="h-4 w-4 mr-2" /> View History
                </Link>
             </Button>
             <Button asChild className="h-11 rounded-xl shadow-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                <Link to={`/dashboard/incidents/${incident.id}/update`}>
                  <Edit3 className="h-4 w-4 mr-2" /> Update
                </Link>
             </Button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-sm relative overflow-hidden">
            
            {/* Properties & People Banner */}
            <div className="p-8 md:p-10 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/20">
              
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <Badge variant="secondary" className={`font-bold capitalize px-4 py-1.5 rounded-lg text-sm shadow-sm border ${getStatusColor(incident?.status || '')}`}>
                  {(incident?.status || '').replace('_', ' ')}
                </Badge>
                <Badge variant="secondary" className={`font-bold capitalize px-4 py-1.5 rounded-lg text-sm shadow-sm border ${getPriorityColor(incident?.priority || '')}`}>
                  {(incident?.priority || '').split('_')[1] || incident?.priority}
                </Badge>
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-sm font-semibold ml-auto bg-white dark:bg-zinc-900 px-4 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <Clock className="h-4 w-4" />
                  {incident?.created_at ? format(new Date(incident.created_at), "MMM d, yyyy h:mm a") : 'Unknown Date'}
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
                {/* Raised By */}
                <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex-1">
                  <Avatar className="h-10 w-10 border border-zinc-100 dark:border-zinc-800">
                    <AvatarFallback className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-bold text-sm">
                      {getInitials(Array.isArray(incident.reporter) ? incident.reporter[0]?.full_name : incident.reporter?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Raised By</p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]">
                      {Array.isArray(incident.reporter) ? incident.reporter[0]?.full_name : incident.reporter?.full_name || "Unknown"}
                    </p>
                  </div>
                </div>

                {/* Assigned Team */}
                <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex-1">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 border border-blue-100 dark:border-blue-900">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Assigned Team</p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]">
                      {incident.team ? (Array.isArray(incident.team) ? incident.team[0]?.name : incident.team?.name) : "Unassigned"}
                    </p>
                  </div>
                </div>

                {/* Assignee */}
                <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex-1">
                  <Avatar className="h-10 w-10 border border-zinc-100 dark:border-zinc-800">
                    <AvatarFallback className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-bold text-sm">
                      {incident.assignee ? getInitials(Array.isArray(incident.assignee) ? incident.assignee[0]?.full_name : incident.assignee?.full_name) : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Assignee</p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]">
                      {incident.assignee ? (Array.isArray(incident.assignee) ? incident.assignee[0]?.full_name : incident.assignee?.full_name) : "Unassigned"}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Description */}
            <div className="p-8 md:p-10 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
              <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-6 flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-500" /> Description
              </h4>
              <div className="w-full bg-zinc-50/80 dark:bg-zinc-900/30 rounded-2xl p-8 border border-zinc-100 dark:border-zinc-800 text-left shadow-inner">
                <p className="text-zinc-700 dark:text-zinc-300 text-[16px] leading-relaxed whitespace-pre-wrap break-words">
                  {incident.description || <span className="italic text-zinc-400">No description provided.</span>}
                </p>
              </div>
            </div>
            
          </div>
        </motion.div>
      </div>
    </div>
  );
}
