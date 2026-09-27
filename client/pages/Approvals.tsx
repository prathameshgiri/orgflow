import React, { useState, useEffect } from "react";
import { CheckSquare, Plus, Clock, CheckCircle2, XCircle, FileText, User, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useOrganization } from "../hooks/useOrganization";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow, format } from "date-fns";
import { supabase } from "../../shared/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

export default function Approvals() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { orgId } = useOrganization();
  const { session, user: currentUser } = useAuth();
  const { toast } = useToast();

  const fetchApprovals = async () => {
    if (!orgId || !currentUser) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("approvals")
        .select(`
          *,
          requester:users!approvals_requester_id_fkey(full_name, avatar_url),
          approver:users!approvals_approver_id_fkey(full_name, avatar_url),
          team:teams!approvals_team_id_fkey(name)
        `)
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Foreign key disambiguation failed, trying simplified query...", error.message);
        const fallbackRes = await supabase
          .from("approvals")
          .select(`*`)
          .eq("organization_id", orgId)
          .order("created_at", { ascending: false });
          
        if (fallbackRes.error) throw fallbackRes.error;
        setApprovals(fallbackRes.data || []);
      } else {
        setApprovals(data || []);
      }
    } catch (error: any) {
      console.error("Failed to fetch approvals:", error);
      toast({ title: "Failed to load approvals", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [orgId, currentUser]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-rose-500 mr-2" />;
      default: return <Clock className="h-4 w-4 text-amber-500 mr-2" />;
    }
  };
  
  const getTypeBadge = (type: string) => {
    switch(type) {
      case 'leave': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Leave</Badge>;
      case 'expense': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Expense</Badge>;
      case 'asset': return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Asset Request</Badge>;
      default: return <Badge variant="outline" className="bg-zinc-100 text-zinc-700 border-zinc-200">General</Badge>;
    }
  };

  const myRequests = approvals.filter(a => a.requester_id === currentUser?.id);
  const needsMyApproval = approvals.filter(a => a.approver_id === currentUser?.id);

  const totalPending = approvals.filter(a => a.status === 'pending').length;
  const totalApproved = approvals.filter(a => a.status === 'approved').length;
  const totalRejected = approvals.filter(a => a.status === 'rejected').length;
  const pendingMyApproval = needsMyApproval.filter(a => a.status === 'pending').length;

  const ApproverCard = ({ approval }: { approval: any }) => (
    <Link 
      to={`/dashboard/approvals/${approval.id}?view=approver`}
      className="group block relative overflow-hidden bg-white dark:bg-zinc-950 p-4 sm:px-5 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <Avatar className="hidden sm:flex h-11 w-11 border border-zinc-200 dark:border-zinc-800 shadow-sm mt-0.5 shrink-0 rounded-2xl">
            <AvatarFallback className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-sm rounded-2xl">
              {approval.requester?.full_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors">
                {approval.title}
              </h4>
              {getTypeBadge(approval.approval_type)}
            </div>
            <p className="text-zinc-500 line-clamp-1 mb-1">
              {approval.description || "No description provided."}
            </p>
            <div className="flex items-center flex-wrap gap-3 text-sm text-zinc-500 mt-1">
              <span className="font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {approval.requester?.full_name || "Unknown"}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="h-3.5 w-3.5" />
                {formatDistanceToNow(new Date(approval.created_at), { addSuffix: true })}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">•</span>
              <Badge variant="secondary" className="capitalize flex items-center gap-1.5 px-2.5 py-0.5 shadow-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-[11px] font-bold whitespace-nowrap">
                {getStatusIcon(approval.status)}
                {approval.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  const RequesterCard = ({ approval }: { approval: any }) => (
    <Link 
      to={`/dashboard/approvals/${approval.id}?view=requester`}
      className="group block p-4 sm:px-5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="hidden sm:flex h-11 w-11 rounded-2xl bg-zinc-100 dark:bg-zinc-900 items-center justify-center text-zinc-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0 mt-0.5 shadow-sm">
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors">{approval.title}</h4>
              {getTypeBadge(approval.approval_type)}
            </div>
            <p className="text-zinc-500 line-clamp-1 mb-1">
              {approval.description || "No description provided."}
            </p>
            <div className="flex items-center flex-wrap gap-3 text-sm text-zinc-500 mt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Users className="h-3.5 w-3.5" />
                Sent to <span className="text-zinc-700 dark:text-zinc-300 ml-0.5">{approval.approver?.full_name || approval.team?.name || "Unassigned"}</span>
              </span>
              <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="h-3.5 w-3.5" />
                {formatDistanceToNow(new Date(approval.created_at), { addSuffix: true })}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">•</span>
              <Badge variant="secondary" className="capitalize flex items-center gap-1.5 px-2.5 py-0.5 shadow-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-[11px] font-bold whitespace-nowrap">
                {getStatusIcon(approval.status)}
                {approval.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6 pt-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
            <CheckSquare className="h-8 w-8 text-indigo-600" /> Approvals
          </h1>
          <p className="text-zinc-500 mt-2 text-lg">Manage your pending requests and required sign-offs.</p>
        </div>
        
        <Button asChild className="group relative h-11 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25">
          <Link to="/dashboard/approvals/create">
            <span className="relative z-10 flex items-center justify-center">
              <Plus className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-90" /> 
              Request Approval
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
        className="grid grid-cols-1 md:grid-cols-4 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm overflow-hidden divide-y md:divide-y-0 md:divide-x divide-zinc-200/80 dark:divide-zinc-800/80"
      >
        <div className="p-5 xl:p-6 relative group hover:bg-amber-50/50 dark:hover:bg-amber-900/20 transition-colors flex flex-col justify-between min-h-[140px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-1">Needs My Approval</p>
              <h3 className="text-3xl font-black text-amber-700 dark:text-amber-500 tracking-tight">{pendingMyApproval}</h3>
            </div>
            <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-300">
              <AlertCircle className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" /> Action required
          </div>
        </div>

        <div className="p-5 xl:p-6 relative group hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors flex flex-col justify-between min-h-[140px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">All Pending</p>
              <h3 className="text-3xl font-black text-blue-700 dark:text-blue-500 tracking-tight">{totalPending}</h3>
            </div>
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-blue-500" /> Organization pending
          </div>
        </div>

        <div className="p-5 xl:p-6 relative group hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors flex flex-col justify-between min-h-[140px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Approved</p>
              <h3 className="text-3xl font-black text-emerald-700 dark:text-emerald-500 tracking-tight">{totalApproved}</h3>
            </div>
            <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" /> Granted
          </div>
        </div>

        <div className="p-5 xl:p-6 relative group hover:bg-rose-50/50 dark:hover:bg-rose-900/20 transition-colors flex flex-col justify-between min-h-[140px]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-1">Rejected</p>
              <h3 className="text-3xl font-black text-rose-900 dark:text-rose-400 tracking-tight">{totalRejected}</h3>
            </div>
            <div className="h-12 w-12 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform duration-300">
              <XCircle className="h-6 w-6 opacity-80" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-sm text-rose-600 dark:text-rose-400 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-rose-400" /> Declined
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
          <Tabs defaultValue="needs_approval" className="w-full">
            <div className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 px-6">
              <TabsList className="h-16 w-full justify-start bg-transparent p-0 gap-6">
                <TabsTrigger 
                  value="needs_approval" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-2 py-5 data-[state=active]:bg-transparent font-bold text-zinc-600 dark:text-zinc-400 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 relative transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  Needs My Approval
                  {pendingMyApproval > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold h-5 w-5 rounded-full shadow-sm">
                      {pendingMyApproval}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="my_requests" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-2 py-5 data-[state=active]:bg-transparent font-bold text-zinc-600 dark:text-zinc-400 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  My Requests
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="needs_approval" className="m-0 focus-visible:outline-none">
                <div className="w-full">
                  {loading ? (
                    <div className="p-12 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /></div>
                  ) : needsMyApproval.length === 0 ? (
                    <div className="p-16 flex flex-col items-center justify-center text-center">
                      <div className="h-20 w-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                        <CheckSquare className="h-10 w-10 text-emerald-500" />
                      </div>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">You're all caught up!</h3>
                      <p className="text-zinc-500 max-w-sm mt-1">No pending requests require your approval right now.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {needsMyApproval.map((approval) => (
                        <ApproverCard key={approval.id} approval={approval} />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="my_requests" className="m-0 focus-visible:outline-none">
                <div className="w-full">
                  {loading ? (
                    <div className="p-12 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /></div>
                  ) : myRequests.length === 0 ? (
                    <div className="p-16 flex flex-col items-center justify-center text-center">
                      <div className="h-20 w-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                        <FileText className="h-10 w-10 text-zinc-400" />
                      </div>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">No requests found</h3>
                      <p className="text-zinc-500 max-w-sm mt-1">You haven't requested any approvals yet.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {myRequests.map((approval) => (
                        <RequesterCard key={approval.id} approval={approval} />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
}
