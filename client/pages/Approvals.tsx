import React, { useState, useEffect } from "react";
import { CheckSquare, Plus, Clock, CheckCircle2, XCircle, FileText, User, Users } from "lucide-react";
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

      // Fallback query if the specific foreign key names fail (some setups use different fk names)
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

  // Status update now handled on ApprovalDetails page

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

  const ApproverCard = ({ approval }: { approval: any }) => (
    <Link 
      to={`/dashboard/approvals/${approval.id}?view=approver`}
      className="group block relative overflow-hidden bg-white dark:bg-zinc-950 p-4 sm:px-5 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-5">
          <Avatar className="h-10 w-10 border border-zinc-200 dark:border-zinc-800 shadow-sm mt-0.5">
            <AvatarFallback className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-medium text-xs">
              {approval.requester?.full_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-base text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors">
                {approval.title}
              </h4>
              {getTypeBadge(approval.approval_type)}
            </div>
            <p className="text-zinc-500 line-clamp-1 mb-1">
              {approval.description || "No description provided."}
            </p>
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <span className="font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {approval.requester?.full_name || "Unknown"}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {formatDistanceToNow(new Date(approval.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center sm:self-center pl-17 sm:pl-0">
          <Badge variant="secondary" className="capitalize flex items-center gap-2 px-3 py-1.5 shadow-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm">
            {getStatusIcon(approval.status)}
            {approval.status}
          </Badge>
        </div>
      </div>
    </Link>
  );

  const RequesterCard = ({ approval }: { approval: any }) => (
    <Link 
      to={`/dashboard/approvals/${approval.id}?view=requester`}
      className="group block p-4 sm:px-5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4 flex-1">
          <div className="hidden sm:flex h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 items-center justify-center text-zinc-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-base text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors">{approval.title}</h4>
              {getTypeBadge(approval.approval_type)}
            </div>
            <p className="text-zinc-500 line-clamp-1 mb-1">
              {approval.description || "No description provided."}
            </p>
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Sent to <span className="font-medium text-zinc-700 dark:text-zinc-300 ml-0.5">{approval.approver?.full_name || approval.team?.name || "Unassigned"}</span>
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {formatDistanceToNow(new Date(approval.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center self-start sm:self-center pl-[68px] sm:pl-0">
          <Badge variant="secondary" className="capitalize flex items-center gap-2 px-3 py-1.5 shadow-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm">
            {getStatusIcon(approval.status)}
            {approval.status}
          </Badge>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Approvals</h1>
          <p className="text-zinc-500">Manage your pending requests and required sign-offs.</p>
        </div>

        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" asChild>
          <Link to="/dashboard/approvals/create">
            <Plus className="mr-2 h-4 w-4" /> Request Approval
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="needs_approval" className="w-full">
        <TabsList className="mb-6 w-full justify-start border-b border-zinc-200 dark:border-zinc-800 rounded-none bg-transparent p-0 h-auto overflow-x-auto">
          <TabsTrigger 
            value="needs_approval" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-4 py-3 data-[state=active]:bg-transparent relative"
          >
            Needs My Approval
            {needsMyApproval.filter(a => a.status === 'pending').length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold h-4 w-4 rounded-full">
                {needsMyApproval.filter(a => a.status === 'pending').length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="my_requests" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-4 py-3 data-[state=active]:bg-transparent"
          >
            My Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="needs_approval" className="m-0">
          <div className="w-full">
            {loading ? (
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 flex justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /></div>
            ) : needsMyApproval.length === 0 ? (
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 flex flex-col items-center justify-center text-center">
                <CheckSquare className="h-12 w-12 text-zinc-300 mb-4" />
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">You're all caught up!</h3>
                <p className="text-zinc-500 max-w-sm mt-1">No pending requests require your approval right now.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {needsMyApproval.map((approval) => (
                  <ApproverCard key={approval.id} approval={approval} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="my_requests" className="m-0">
          <div className="w-full">
            {loading ? (
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 flex justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /></div>
            ) : myRequests.length === 0 ? (
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 flex flex-col items-center justify-center text-center">
                <FileText className="h-12 w-12 text-zinc-300 mb-4" />
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No requests found</h3>
                <p className="text-zinc-500 max-w-sm mt-1">You haven't requested any approvals yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {myRequests.map((approval) => (
                  <RequesterCard key={approval.id} approval={approval} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
