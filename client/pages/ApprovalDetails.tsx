import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, Clock, FileText, Send, User, Users, ShieldAlert } from "lucide-react";
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
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-zinc-500">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-600" />
          <p>Loading details...</p>
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
      case 'approved': return { icon: <CheckCircle2 className="h-5 w-5" />, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
      case 'rejected': return { icon: <XCircle className="h-5 w-5" />, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" };
      default: return { icon: <Clock className="h-5 w-5" />, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
    }
  };
  
  const statusConfig = getStatusConfig(approval.status);

  // ---------------------------------------------------------
  // REQUESTER VIEW UI
  // ---------------------------------------------------------
  if (isRequesterView) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-20">
        <Button variant="ghost" className="mb-2 -ml-2 text-zinc-500 hover:text-zinc-900" asChild>
          <Link to="/dashboard/approvals"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Approvals</Link>
        </Button>

        {/* Status Hero */}
        <div className={`p-8 rounded-2xl border ${statusConfig.border} ${statusConfig.bg} dark:bg-zinc-900/50 flex flex-col items-center justify-center text-center space-y-4 shadow-sm`}>
          <div className={`p-4 rounded-full bg-white dark:bg-zinc-950 shadow-sm ${statusConfig.color}`}>
            {statusConfig.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 capitalize">Request {approval.status}</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              Submitted on {format(new Date(approval.created_at), "PPP")}
              {approval.status !== 'pending' && (
                <> • {approval.status === 'approved' ? 'Approved' : 'Rejected'} on {format(new Date(approval.updated_at), "PPP")}</>
              )}
            </p>
          </div>
        </div>

        {/* Request Details */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/80">
            <Badge variant="outline" className="mb-3 uppercase tracking-wider text-[10px]">{approval.approval_type}</Badge>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{approval.title}</h2>
          </div>
          
          <div className="p-6 bg-zinc-50/50 dark:bg-zinc-900/30">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-zinc-400" /> Description
            </h4>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {approval.description || "No description provided."}
            </p>
          </div>

          {approval.comments && (
            <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/10 border-t border-indigo-100 dark:border-indigo-800/30">
              <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-500" /> Approver Comment
              </h4>
              <p className="text-indigo-800 dark:text-indigo-200 leading-relaxed whitespace-pre-wrap text-[14px]">
                {approval.comments}
              </p>
            </div>
          )}
          
          <div className="p-6 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-zinc-200 dark:border-zinc-800">
                <AvatarFallback className="bg-indigo-50 text-indigo-700"><User className="h-4 w-4" /></AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Reviewing Party</p>
                <p className="text-xs text-zinc-500">{approval.approver?.full_name || approval.team?.name || "Unassigned"}</p>
              </div>
            </div>
            
            {approval.status === 'pending' && (
              <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50" onClick={handleDelete} disabled={updating}>
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
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Button variant="ghost" className="mb-4 -ml-2 text-zinc-500 hover:text-zinc-900" asChild>
            <Link to="/dashboard/approvals"><ArrowLeft className="h-4 w-4 mr-2" /> Back</Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Review Approval</h1>
          <p className="text-zinc-500 mt-1">Review the details below and make a decision.</p>
        </div>
        
        {approval.status === 'pending' ? (
          <Badge className="px-4 py-1.5 bg-amber-100 text-amber-800 hover:bg-amber-100 text-sm border-none shadow-none flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" /> Action Required
          </Badge>
        ) : (
          <Badge className={`px-4 py-1.5 ${statusConfig.bg} ${statusConfig.color} hover:${statusConfig.bg} text-sm border-none shadow-none capitalize flex items-center gap-2`}>
            {statusConfig.icon} {approval.status}
          </Badge>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-8">
            <Badge variant="outline" className="mb-4 text-indigo-600 bg-indigo-50 border-indigo-200">{approval.approval_type} Request</Badge>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">{approval.title}</h2>
            
            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-500" /> Full Description
              </h4>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap text-[15px]">
                {approval.description || <span className="italic text-zinc-400">No additional details provided.</span>}
              </p>
            </div>

            {approval.comments && (
              <div className="mt-6 bg-indigo-50/80 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-500" /> Your Comment
                </h4>
                <p className="text-indigo-800 dark:text-indigo-200 leading-relaxed whitespace-pre-wrap text-[15px]">
                  {approval.comments}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info & Actions */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-zinc-400" /> Requester Info
            </h3>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-white dark:border-zinc-900 shadow-sm">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-medium">
                  {approval.requester?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{approval.requester?.full_name || "Unknown"}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{format(new Date(approval.created_at), "MMM d, yyyy")}</p>
              </div>
            </div>
          </div>

            {approval.status === 'pending' && (
              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl shadow-sm p-6 space-y-4">
                <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 text-sm">Your Decision</h3>
                <p className="text-xs text-indigo-700/70 dark:text-indigo-400/70 mb-4">You are assigned to review this request. Once decided, the requester will be notified.</p>
                
                <div className="mb-4">
                  <Textarea 
                    placeholder="Add an optional comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[80px] bg-white dark:bg-zinc-900 border-indigo-200 dark:border-indigo-800 focus-visible:ring-indigo-500/20 resize-none text-sm placeholder:text-indigo-300 dark:placeholder:text-indigo-700"
                  />
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button 
                    className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                    onClick={() => handleStatusUpdate('approved')}
                    disabled={updating}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Request
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full h-11 text-rose-600 border-rose-200 hover:bg-rose-50"
                    onClick={() => handleStatusUpdate('rejected')}
                    disabled={updating}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                </div>
              </div>
            )}
            
            {approval.status !== 'pending' && (
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
                 <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3 text-sm flex items-center gap-2">
                   <Clock className="h-4 w-4 text-zinc-400" /> Decision Timeline
                 </h3>
                 <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 dark:before:via-zinc-800 before:to-transparent">
                    <div className="relative flex items-center justify-between gap-4 z-10">
                      <div className="text-xs font-medium text-zinc-500">{format(new Date(approval.created_at), "MMM d, h:mm a")}</div>
                      <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">Requested</div>
                    </div>
                    <div className="relative flex items-center justify-between gap-4 z-10">
                      <div className="text-xs font-medium text-zinc-500">{format(new Date(approval.updated_at), "MMM d, h:mm a")}</div>
                      <div className={`text-xs font-bold capitalize ${approval.status === 'approved' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {approval.status}
                      </div>
                    </div>
                 </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
