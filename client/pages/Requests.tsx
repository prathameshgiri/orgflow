import React, { useState, useEffect } from "react";
import { ListPlus, Plus, Search, MoreHorizontal, Edit3, History, MessageSquare, Clock, AlertCircle, CheckSquare, Target, Activity, FileText } from "lucide-react";
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
import { Card } from "@/components/ui/card";
import { useOrganization } from "../hooks/useOrganization";
import { supabase } from "../../shared/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Requests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const { orgId } = useOrganization();
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
      case 'closed': return 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
      default: return 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
    }
  };

  const fetchRequests = async () => {
    if (!orgId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("service_requests")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error(error);
      toast({ title: "Error loading requests", variant: "destructive" });
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [orgId]);

  const filteredRequests = requests.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Stats
  const newCount = requests.filter(r => r.status?.toLowerCase() === 'new' || !r.status).length;
  const inProgressCount = requests.filter(r => r.status?.toLowerCase() === 'in_progress').length;
  const resolvedCount = requests.filter(r => r.status?.toLowerCase() === 'resolved').length;
  const closedCount = requests.filter(r => r.status?.toLowerCase() === 'closed').length;
  const totalCount = requests.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6 pt-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-indigo-600" /> Service Requests
          </h1>
          <p className="text-zinc-500 mt-2 text-lg">Track and manage employee service requests.</p>
        </div>
        
        <Button asChild className="group relative h-11 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25">
          <Link to="/dashboard/requests/create">
            <span className="relative z-10 flex items-center justify-center">
              <Plus className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-90" /> 
              New Request
            </span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-5 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm overflow-hidden divide-y md:divide-y-0 md:divide-x divide-zinc-200/80 dark:divide-zinc-800/80"
      >
        <div className="p-5 xl:p-6 relative group hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors flex flex-col justify-between min-h-[140px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">New</p>
              <h3 className="text-3xl font-black text-blue-700 dark:text-blue-500 tracking-tight">{newCount}</h3>
            </div>
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
              <AlertCircle className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" /> Awaiting review
          </div>
        </div>

        <div className="p-5 xl:p-6 relative group hover:bg-yellow-50/50 dark:hover:bg-yellow-900/20 transition-colors flex flex-col justify-between min-h-[140px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 mb-1">In Progress</p>
              <h3 className="text-3xl font-black text-yellow-700 dark:text-yellow-500 tracking-tight">{inProgressCount}</h3>
            </div>
            <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform duration-300">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-sm text-yellow-600 dark:text-yellow-400 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-yellow-500" /> Being worked on
          </div>
        </div>

        <div className="p-5 xl:p-6 relative group hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors flex flex-col justify-between min-h-[140px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Resolved</p>
              <h3 className="text-3xl font-black text-emerald-700 dark:text-emerald-500 tracking-tight">{resolvedCount}</h3>
            </div>
            <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
              <CheckSquare className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" /> Fixed / Done
          </div>
        </div>

        <div className="p-5 xl:p-6 relative group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors flex flex-col justify-between min-h-[140px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Closed</p>
              <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{closedCount}</h3>
            </div>
            <div className="h-12 w-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-500 group-hover:scale-110 transition-transform duration-300">
              <CheckSquare className="h-6 w-6 opacity-50" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-sm text-zinc-500 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-zinc-400" /> Verified
          </div>
        </div>

        <div className="p-5 xl:p-6 relative group hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors flex flex-col justify-between min-h-[140px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Total</p>
              <h3 className="text-3xl font-black text-indigo-700 dark:text-indigo-500 tracking-tight">{totalCount}</h3>
            </div>
            <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
              <FileText className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500" /> All requests
          </div>
        </div>
      </motion.div>

      {/* Main Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-lg">
              <ListPlus className="h-5 w-5 text-indigo-500" /> Request Directory
            </div>
            <div className="relative max-w-sm w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="Search requests..." 
                className="pl-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-full focus-visible:ring-indigo-500 h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center text-zinc-500">
              <Activity className="h-8 w-8 animate-spin text-indigo-500 mb-4" />
              <p>Loading requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="h-20 w-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                <ListPlus className="h-10 w-10 text-zinc-400" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">No requests found</h3>
              <p className="text-zinc-500 max-w-sm mb-6">There are currently no active service requests matching your criteria.</p>
              <Button onClick={() => setSearchQuery('')} variant="outline" className="rounded-full">
                Clear search
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                  <TableRow className="border-zinc-100 dark:border-zinc-800 hover:bg-transparent">
                    <TableHead className="whitespace-nowrap font-semibold text-zinc-900 dark:text-zinc-100 min-w-[300px]">Request Summary</TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-zinc-900 dark:text-zinc-100">Status</TableHead>
                    <TableHead className="whitespace-nowrap font-semibold text-zinc-900 dark:text-zinc-100">Created</TableHead>
                    <TableHead className="text-right whitespace-nowrap font-semibold text-zinc-900 dark:text-zinc-100">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((req) => (
                    <TableRow key={req.id} className="border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <TableCell className="font-medium min-w-[300px]">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4 text-zinc-500" />
                          </div>
                          <div>
                            <span className="block text-zinc-900 dark:text-zinc-100">{req.title}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold border whitespace-nowrap ${getStatusColor(req.status)}`}>
                          {req.status?.replace('_', ' ').toUpperCase() || 'NEW'}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-zinc-500 whitespace-nowrap font-medium">
                        {new Date(req.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl">
                            <DropdownMenuItem asChild className="rounded-lg m-1 cursor-pointer">
                              <Link to={`/dashboard/requests/${req.id}/update`} className="flex items-center">
                                <Edit3 className="mr-2 h-4 w-4 text-blue-500" /> Edit Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="rounded-lg m-1 cursor-pointer">
                              <Link to={`/dashboard/requests/${req.id}/history`} className="flex items-center">
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
        </Card>
      </motion.div>
    </div>
  );
}
