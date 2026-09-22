import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrganization } from "../hooks/useOrganization";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export default function CreateTeam() {
  const navigate = useNavigate();
  const { orgId } = useOrganization();
  const { session } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!orgId || !session?.access_token) return;
      try {
        const res = await fetch("/api/users", {
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "x-org-id": orgId
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data.members || []);
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, [orgId, session]);

  const toggleUser = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !session?.access_token) return;
    if (!name.trim()) {
      toast({ title: "Team name is required", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "x-org-id": orgId
        },
        body: JSON.stringify({ name, userIds: selectedUserIds })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create team");
      }

      toast({ title: "Team created successfully" });
      navigate("/dashboard/teams");
    } catch (error: any) {
      console.error(error);
      toast({ title: "Failed to create team", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out py-8">
      <div className="flex items-center space-x-4 mb-8">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link to="/dashboard/teams">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Create New Team</h1>
          <p className="text-slate-500 mt-1">Define a new team and add members.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-[24px] p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="space-y-3">
            <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 block mb-1">
              Team Name <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. Frontend Engineering" 
              required 
              autoFocus
            />
          </div>
          
          <div className="space-y-3">
            <Label className="text-slate-700 dark:text-slate-300 block mb-1">
              Select Members
            </Label>
            <div className="border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden max-h-64 overflow-y-auto bg-slate-50 dark:bg-zinc-900/50 p-2">
              {users.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">No users found.</div>
              ) : (
                <div className="space-y-1">
                  {users.map(u => (
                    <label key={u.id} className="flex items-center p-3 rounded-md hover:bg-white dark:hover:bg-zinc-800 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-zinc-700 shadow-sm">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-[#4f6bff] rounded focus:ring-[#4f6bff]" 
                        checked={selectedUserIds.includes(u.id)}
                        onChange={() => toggleUser(u.id)}
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{u.users?.full_name || 'Unknown User'}</p>
                        <p className="text-xs text-slate-500">{u.users?.email || ''}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-zinc-800 mt-8 pt-8">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => navigate("/dashboard/teams")}
              className="rounded-full px-6 text-slate-500"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !name.trim()}
              className="bg-[#4f6bff] hover:bg-[#435be0] text-white rounded-full px-8 shadow-md"
            >
              {isSubmitting ? "Creating..." : "Create Team"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
