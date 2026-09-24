import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { useAuth } from "../context/AuthContext";
import { useOrganization } from "../hooks/useOrganization";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../shared/supabase";

export default function CreateApproval() {
  const navigate = useNavigate();
  const { orgId } = useOrganization();
  const { session, user: currentUser } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    approval_type: "general",
    assignee_id: "",
  });

  useEffect(() => {
    if (!orgId || !session) return;
    
    const fetchUsersAndTeams = async () => {
      try {
        // Fetch users
        const usersRes = await fetch(`/api/users`, {
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "x-org-id": orgId
          }
        });
        if (usersRes.ok) {
          const data = await usersRes.json();
          const formattedUsers = (data.members || []).map((m: any) => ({
            id: m.users?.id || m.id,
            full_name: m.users?.full_name || m.full_name
          }));
          setUsers(formattedUsers);
        }

        // Fetch teams
        const teamsRes = await fetch(`/api/teams`, {
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "x-org-id": orgId
          }
        });
        if (teamsRes.ok) {
          const data = await teamsRes.json();
          setTeams(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch approvers:", err);
      }
    };
    
    fetchUsersAndTeams();
  }, [orgId, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.assignee_id) {
      toast({ title: "Error", description: "Title and Approver are required", variant: "destructive" });
      return;
    }

    setLoading(true);

    let approver_id = null;
    let team_id = null;
    
    if (formData.assignee_id.startsWith('user_')) {
      approver_id = formData.assignee_id.replace('user_', '');
    } else if (formData.assignee_id.startsWith('team_')) {
      team_id = formData.assignee_id.replace('team_', '');
    }

    try {
      // Create the approval in the database (Mock or Real depending on API setup)
      const { data, error } = await supabase
        .from('approvals')
        .insert([{
          organization_id: orgId,
          requester_id: currentUser?.id,
          approver_id: approver_id,
          team_id: team_id,
          title: formData.title,
          description: formData.description,
          approval_type: formData.approval_type,
          status: 'pending'
        }])
        .select();

      if (error) throw error;

      // Notify approver
      if (approver_id) {
        try {
          await fetch("/api/notify/assignment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
              "x-org-id": orgId,
            },
            body: JSON.stringify({
              assigneeId: approver_id,
              type: "Approval Request",
              itemTitle: formData.title,
              itemDescription: formData.description,
              linkUrl: `${window.location.origin}/dashboard/approvals`
            })
          });
        } catch (notifyErr) {
          console.error("Failed to send notification", notifyErr);
        }
      }

      toast({ title: "Success", description: "Approval request submitted successfully." });
      navigate('/dashboard/approvals');
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: error.message || "Failed to submit approval", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/dashboard/approvals">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Approval Request</h1>
          <p className="text-zinc-500">Submit a request for leave, expenses, or general approval.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          <div className="space-y-6">
            
            <div className="grid gap-2">
              <Label htmlFor="type" className="text-base font-semibold">Approval Type</Label>
              <Select 
                value={formData.approval_type} 
                onValueChange={(val) => setFormData({...formData, approval_type: val})}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leave">Leave Request (Vacation, Sick, etc.)</SelectItem>
                  <SelectItem value="expense">Expense Reimbursement</SelectItem>
                  <SelectItem value="asset">Hardware / Asset Request</SelectItem>
                  <SelectItem value="general">General Approval</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-base font-semibold">Title</Label>
              <Input 
                id="title" 
                className="h-11"
                placeholder="e.g. Annual Leave (Dec 20-30)" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="approver" className="text-base font-semibold">Who should approve this?</Label>
              <Select 
                value={formData.assignee_id} 
                onValueChange={(val) => setFormData({...formData, assignee_id: val})}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select an approver..." />
                </SelectTrigger>
                <SelectContent>
                  {users.length === 0 && teams.length === 0 && (
                    <SelectItem value="admin">Platform Admin</SelectItem>
                  )}
                  
                  {teams.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Teams</SelectLabel>
                      {teams.map(t => {
                        const membersStr = (t.team_members || [])
                          .map((m: any) => m.users?.full_name)
                          .filter(Boolean)
                          .join(', ');
                        
                        return (
                          <SelectItem key={`team_${t.id}`} value={`team_${t.id}`}>
                            {t.name} {membersStr ? `(${membersStr})` : ''}
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  )}
                  
                  {users.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>People</SelectLabel>
                      {users.map(u => (
                        <SelectItem key={`user_${u.id}`} value={`user_${u.id}`}>{u.full_name}</SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-zinc-500">The selected person or team will be notified to review your request.</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-base font-semibold">Details / Justification</Label>
              <Textarea 
                id="description" 
                placeholder="Provide detailed justification or context for the approver..." 
                className="resize-none min-h-[120px]"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard/approvals')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 min-w-[140px]">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  <span>Submit Request</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
