import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, UserPlus, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrganization } from "../hooks/useOrganization";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TeamMembers() {
  const { id } = useParams<{ id: string }>();
  const [members, setMembers] = useState<any[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const { orgId } = useOrganization();
  const { session } = useAuth();
  const { toast } = useToast();

  const fetchMembers = async () => {
    if (!orgId || !session?.access_token || !id) return;
    try {
      const res = await fetch(`/api/teams/${id}/members`, {
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "x-org-id": orgId
        }
      });
      if (!res.ok) throw new Error("Failed to fetch team members");
      const data = await res.json();
      setMembers(data);
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const fetchUsers = async () => {
    if (!orgId || !session?.access_token) return;
    try {
      const res = await fetch(`/api/users`, {
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "x-org-id": orgId
        }
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setAvailableUsers(data.members || []);
    } catch (error: any) {
      console.error(error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchMembers(), fetchUsers()]);
      setLoading(false);
    };
    init();
  }, [orgId, id, session]);

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    
    try {
      const res = await fetch(`/api/teams/${id}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
          "x-org-id": orgId || ""
        },
        body: JSON.stringify({ userId: selectedUserId })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add member");
      }
      
      toast({ title: "Member added successfully" });
      setSelectedUserId("");
      fetchMembers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    
    try {
      const res = await fetch(`/api/teams/${id}/members/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${session?.access_token}`,
          "x-org-id": orgId || ""
        }
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to remove member");
      }
      
      toast({ title: "Member removed successfully" });
      fetchMembers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Filter out users that are already in the team
  const unassignedUsers = availableUsers.filter(u => !members.find(m => m.user_id === u.id));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex items-center space-x-4 mb-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link to="/dashboard/teams">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-zinc-500">Manage users in this team.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-[24px] p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2 w-full">
            <label className="text-sm font-medium">Add New Member</label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user to add" />
              </SelectTrigger>
              <SelectContent>
                {unassignedUsers.map(u => (
                  <SelectItem key={u.id} value={u.id}>{u.users?.full_name || u.users?.email}</SelectItem>
                ))}
                {unassignedUsers.length === 0 && (
                  <SelectItem value="none" disabled>All users are already in this team</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleAddMember}
            disabled={!selectedUserId || selectedUserId === "none"}
            className="bg-[#4f6bff] hover:bg-[#435be0] text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-zinc-500">Loading members...</div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">No members found in this team.</div>
        ) : (
          <Table>
            <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Added On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.user_id}>
                  <TableCell className="font-medium">{member.users?.full_name || 'Unknown'}</TableCell>
                  <TableCell className="text-zinc-500">{member.users?.email || 'N/A'}</TableCell>
                  <TableCell className="text-sm text-zinc-500">{new Date(member.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      onClick={() => handleRemoveMember(member.user_id)}
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
