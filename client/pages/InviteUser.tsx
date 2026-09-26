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
  const [inviteLink, setInviteLink] = useState("");

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
        } else {
          const errData = await response.json().catch(() => ({}));
          toast({ 
            title: "Error fetching roles", 
            description: errData.error || `Server returned ${response.status}`, 
            variant: "destructive" 
          });
          console.error("Failed to fetch roles:", response.status, errData);
        }
      } catch (error: any) {
        toast({ 
          title: "Network Error", 
          description: error.message || "Failed to reach server", 
          variant: "destructive" 
        });
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
        toast({ title: "Invite Generated", description: data.message });
        if (data.token) {
          const link = `${window.location.origin}/signup?invite=${data.token}`;
          setInviteLink(link);
        } else {
          navigate("/dashboard/users");
        }
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {submitting ? "Generating..." : "Generate Invite Link"}
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

        {inviteLink && (
          <div className="mt-8 p-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-xl">
            <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-2">Invitation Generated Successfully!</h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-4">
              Since email delivery is not configured in this environment, please copy the link below and send it to the user.
            </p>
            <div className="flex gap-2">
              <Input value={inviteLink} readOnly className="bg-white dark:bg-zinc-900" />
              <Button 
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink);
                  toast({ title: "Copied to clipboard" });
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Copy Link
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteUser;
