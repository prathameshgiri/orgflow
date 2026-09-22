import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useOrgStore } from "../store/orgStore";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const InviteUser = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { activeOrganizationId } = useOrgStore();
  const { toast } = useToast();
  
  const [roles, setRoles] = useState<any[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!activeOrganizationId) return;
      try {
        const response = await fetch("/api/roles", {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "x-org-id": activeOrganizationId,
          }
        });
        if (response.ok) {
          const data = await response.json();
          setRoles(data.roles || []);
        }
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, [activeOrganizationId, session]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteRole) {
      toast({ title: "Validation Error", description: "Please select a role.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/users/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
          "x-org-id": activeOrganizationId!,
        },
        body: JSON.stringify({ email: inviteEmail, roleId: inviteRole }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({ title: "Invite Sent", description: data.message });
        navigate("/dashboard/users");
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Breadcrumb / Header */}
      <div className="flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/users")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invite Team Member</h1>
          <p className="text-zinc-500 text-sm mt-1">Send an invitation email to join this organization.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <form onSubmit={handleInvite} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input 
              type="email" 
              required 
              placeholder="name@example.com" 
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="max-w-md"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <Select value={inviteRole} onValueChange={setInviteRole} required disabled={loadingRoles}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder={loadingRoles ? "Loading roles..." : "Select a role"} />
              </SelectTrigger>
              <SelectContent>
                {roles.length === 0 && !loadingRoles ? (
                  <SelectItem value="none" disabled>No roles available</SelectItem>
                ) : (
                  roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-zinc-500">
              The role determines what permissions the user will have in the organization.
            </p>
          </div>
          
          <div className="pt-4 flex gap-3">
            <Button 
              type="submit" 
              disabled={submitting}
              className="bg-coral hover:bg-coral-light text-white"
            >
              {submitting ? "Sending..." : "Send Invitation"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/dashboard/users")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteUser;
