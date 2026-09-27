import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, Clock, FileText, Send, User, Users, ShieldAlert, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "../context/AuthContext";
import { useOrganization } from "../hooks/useOrganization";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { supabase } from "../../shared/supabase";

export default function ApprovalDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { orgId } = useOrganization();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const [approval, setApproval] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!orgId || !id) return;

    const fetchApproval = async () => {
      try {
        const { data, error } = await supabase
          .from("approvals")
          .select(`
            *,
            requester:users!approvals_requester_id_fkey(full_name, avatar_url),
            approver:users!approvals_approver_id_fkey(full_name, avatar_url),
            team:teams!approvals_team_id_fkey(name)
          `)
          .eq("id", id)
          .eq("organization_id", orgId)
          .single();

        if (error) {
          console.warn("Foreign key disambiguation failed, trying fallback...");
          const fallbackRes = await supabase
            .from("approvals")
            .select(`*`)
            .eq("id", id)
            .eq("organization_id", orgId)
            .single();
            
          if (fallbackRes.error) throw fallbackRes.error;
          setApproval(fallbackRes.data);
        } else {
          setApproval(data);
        }
      } catch (error: any) {
        console.error("Failed to fetch approval:", error);
        toast({ title: "Failed to load approval", description: error.message, variant: "destructive" });
        navigate("/dashboard/approvals");
      } finally {
        setLoading(false);
      }
    };

    fetchApproval();
  }, [orgId, id]);

  const handleStatusUpdate = async (newStatus: 'approved' | 'rejected') => {
    setUpdating(true);
    try {
      const updateData: any = { status: newStatus };
      if (comment.trim()) {
        updateData.comments = comment.trim();
      }

      const { error } = await supabase
        .from("approvals")
        .update(updateData)
        .eq("id", id);
        
      if (error) throw error;
      
      toast({ title: `Approval ${newStatus}` });
      setApproval({ ...approval, status: newStatus, comments: comment.trim() || approval.comments });
    } catch (error: any) {
      console.error(error);
      toast({ title: "Failed to update status", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete or cancel this request?")) return;
    
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("approvals")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      toast({ title: "Request deleted successfully" });
      navigate("/dashboard/approvals");
    } catch (error: any) {
      console.error(error);
      toast({ title: "Failed to delete request", variant: "destructive" });
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50/30 dark:bg-zinc-950/30">
        <div className="flex flex-col items-center gap-4 text-zinc-500">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-600" />
          <p className="font-medium text-lg">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!approval) return null;

  const viewMode = searchParams.get('view');
  const isRequesterView = viewMode === 'requester' || (!viewMode && approval.requester_id === currentUser?.id);
  const isApproverView = viewMode === 'approver' || (!viewMode && approval.approver_id === currentUser?.id && !isRequesterView);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved': return { icon: <CheckCircle2 className="h-6 w-6" />, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", gradient: "from-emerald-500 to-emerald-400" };
      case 'rejected': return { icon: <XCircle className="h-6 w-6" />, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", gradient: "from-rose-500 to-rose-400" };
      default: return { icon: <Clock className="h-6 w-6" />, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", gradient: "from-amber-400 to-amber-300" };
    }
  };
  
  const statusConfig = getStatusConfig(approval.status);

  // ---------------------------------------------------------
  // REQUESTER VIEW UI
  // ---------------------------------------------------------
  if (isRequesterView) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen pt-4">
        <div className="flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <Button variant="outline" size="icon" className="rounded-full h-10 w-10 shrink-0" asChild>
            <Link to="/dashboard/approvals"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
              Request Details
            </h1>
            <p className="text-zinc-500 mt-1">Review your submitted request.</p>
          </div>
        </div>

        {/* Status Hero */}
        <div className={`p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 flex flex-col items-center justify-center text-center space-y-5 shadow-sm relative overflow-hidden`}>
          <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${statusConfig.gradient}`}></div>
          <div className={`p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 shadow-sm border ${statusConfig.border} ${statusConfig.color}`}>
            {statusConfig.icon}
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 capitalize">Request {approval.status}</h2>
            <p className="text-zinc-500 font-medium mt-2">
              Submitted on {format(new Date(approval.created_at), "PPP")}
              {approval.status !== 'pending' && (
                <> • {approval.status === 'approved' ? 'Approved' : 'Rejected'} on {format(new Date(approval.updated_at), "PPP")}</>
              )}
            </p>
          </div>
        </div>

        {/* Request Details */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-8 border-b border-zinc-100 dark:border-zinc-800/80">
            <Badge variant="outline" className="mb-4 uppercase tracking-wider text-xs font-bold px-3 py-1 bg-zinc-50 dark:bg-zinc-900/50">{approval.approval_type}</Badge>
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">{approval.title}</h2>
          </div>
          
          <div className="p-8 bg-zinc-50/50 dark:bg-zinc-900/30">
            <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-zinc-400" /> Description
            </h4>
            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap text-[15px]">
              {approval.description || "No description provided."}
            </p>
          </div>

          {approval.comments && (
            <div className="p-8 bg-indigo-50/50 dark:bg-indigo-900/10 border-t border-indigo-100 dark:border-indigo-800/30">
              <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-500" /> Approver Comment
              </h4>
              <p className="text-indigo-800 dark:text-indigo-200 leading-relaxed whitespace-pre-wrap text-[15px]">
                {approval.comments}
              </p>
            </div>
          )}
          
          <div className="p-8 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-950">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border border-zinc-200 dark:border-zinc-800">
                <AvatarFallback className="bg-indigo-50 text-indigo-700 font-bold"><User className="h-5 w-5" /></AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">Reviewing Party</p>
                <p className="text-sm text-zinc-500 font-medium">{approval.approver?.full_name || approval.team?.name || "Unassigned"}</p>
              </div>
            </div>
            
            {approval.status === 'pending' && (
              <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 font-bold h-11 px-6 rounded-xl" onClick={handleDelete} disabled={updating}>
                Cancel Request
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // APPROVER VIEW UI
  // ---------------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen pt-4">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-full h-10 w-10 shrink-0" asChild>
            <Link to="/dashboard/approvals"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">Review Approval</h1>
            <p className="text-zinc-500 mt-1">Review the details below and make a decision.</p>
          </div>
        </div>
        
        {approval.status === 'pending' ? (
          <Badge className="px-5 py-2 bg-amber-100 text-amber-800 hover:bg-amber-100 text-sm font-bold border-none shadow-sm flex items-center gap-2 rounded-xl">
            <ShieldAlert className="h-5 w-5" /> Action Required
          </Badge>
        ) : (
          <Badge className={`px-5 py-2 ${statusConfig.bg} ${statusConfig.color} hover:${statusConfig.bg} text-sm font-bold border-none shadow-sm capitalize flex items-center gap-2 rounded-xl`}>
            {statusConfig.icon} {approval.status}
          </Badge>
        )}
      </div>

      <div className="space-y-8">
        {/* Main Content - Request Details + Requester Info */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="p-8 md:p-10 border-b border-zinc-100 dark:border-zinc-800/80">
            <Badge variant="outline" className="mb-6 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50 px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider">{approval.approval_type} Request</Badge>
            <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-8">{approval.title}</h2>
            
            {/* Requester Info Integrated Here */}
            <div className="flex items-center gap-3 mt-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold text-xs">
                  {approval.requester?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Requested By</p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{approval.requester?.full_name || "Unknown"}</p>
              </div>
              <div className="ml-4 pl-4 border-l border-zinc-200 dark:border-zinc-800">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Date</p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{format(new Date(approval.created_at), "MMM d, yyyy")}</p>
              </div>
            </div>
          </div>
          
          <div className="p-8 md:p-10 bg-zinc-50/30 dark:bg-zinc-950">
            <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-500" /> Full Description
            </h4>
            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap text-[16px]">
              {approval.description || <span className="italic text-zinc-400">No additional details provided.</span>}
            </p>
          </div>

          {approval.comments && (
            <div className="p-8 md:p-10 bg-indigo-50/50 dark:bg-indigo-900/10 border-t border-indigo-100 dark:border-indigo-800/30">
              <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-500" /> Your Comment
              </h4>
              <p className="text-indigo-800 dark:text-indigo-200 leading-relaxed whitespace-pre-wrap text-[16px]">
                {approval.comments}
              </p>
            </div>
          )}
        </div>

        {/* Action Panel */}
        {approval.status === 'pending' && (
          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-3xl shadow-sm p-8 md:p-10 space-y-6">
            <div>
              <h3 className="font-extrabold text-indigo-900 dark:text-indigo-300 text-xl mb-2">Your Decision</h3>
              <p className="text-sm text-indigo-700/80 dark:text-indigo-400/80 font-medium">You are assigned to review this request. Once decided, the requester will be notified.</p>
            </div>
            
            <div>
              <Textarea 
                placeholder="Add an optional comment to explain your decision..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[120px] bg-white dark:bg-zinc-900 border-indigo-200 dark:border-indigo-800 focus-visible:ring-indigo-500 resize-none text-[15px] placeholder:text-indigo-300 dark:placeholder:text-indigo-700 rounded-2xl p-5 shadow-sm"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="h-10 px-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-sm shadow-emerald-500/25 rounded-xl font-bold text-sm w-fit"
                onClick={() => handleStatusUpdate('approved')}
                disabled={updating}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Request
              </Button>
              <Button 
                variant="outline"
                className="h-10 px-8 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 rounded-xl font-bold bg-white dark:bg-zinc-950 text-sm w-fit"
                onClick={() => handleStatusUpdate('rejected')}
                disabled={updating}
              >
                <XCircle className="w-4 h-4 mr-2" /> Reject
              </Button>
            </div>
          </div>
        )}
        
        {approval.status !== 'pending' && (
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-sm p-8 flex items-center justify-between">
             <div className="flex items-center gap-5">
               <div className={`p-4 rounded-2xl ${statusConfig.bg} ${statusConfig.color}`}>
                 {statusConfig.icon}
               </div>
               <div>
                 <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1">Final Decision</p>
                 <h3 className={`text-2xl font-black capitalize ${approval.status === 'approved' ? 'text-emerald-600' : 'text-rose-600'}`}>
                   {approval.status}
                 </h3>
               </div>
             </div>
             <div className="text-right border-l border-zinc-200 dark:border-zinc-800 pl-6">
                <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1">Decision Date</p>
                <p className="font-bold text-zinc-900 dark:text-zinc-100">{format(new Date(approval.updated_at), "MMM d, yyyy h:mm a")}</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
