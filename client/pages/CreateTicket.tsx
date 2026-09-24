import React, { useState, useEffect } from "react";
import { ArrowLeft, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useOrganization } from "../hooks/useOrganization";
import { supabase } from "../../shared/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export default function CreateTicket() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("p3_medium");
  const [teamId, setTeamId] = useState("");
  const [teams, setTeams] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { orgId } = useOrganization();
  const { user, session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeams = async () => {
      if (!orgId || !user) return;
      try {
        const res = await fetch(`/api/teams`, {
          headers: {
            "Authorization": `Bearer ${session?.access_token}`,
            "x-org-id": orgId
          }
        });
        if (res.ok) {
          const data = await res.json();
          setTeams(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTeams();
  }, [orgId, user, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !user) return;
    
    setIsSubmitting(true);
    const { data, error } = await supabase.from("incidents").insert([
      {
        organization_id: orgId,
        title,
        description,
        priority,
        reporter_id: user.id,
        team_id: teamId || null,
      }
    ]).select();
    setIsSubmitting(false);

    if (error) {
      console.error(error);
      toast({ title: "Failed to create ticket", variant: "destructive" });
    } else {
      toast({ title: "Ticket created successfully" });
      
      // Trigger workflow engine
      if (data && data.length > 0) {
        try {
          await fetch("/api/workflows/trigger", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({
              event: "incident_created",
              organization_id: orgId,
              payload: data[0]
            })
          });
        } catch (e) {
          console.error("Failed to trigger workflows:", e);
        }
      }

      navigate("/dashboard/service-desk");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out max-w-2xl mx-auto">
      <div className="flex items-center space-x-4 mb-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link to="/dashboard/service-desk">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Ticket</h1>
          <p className="text-zinc-500">Report a new IT issue or service request.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-[24px] p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Summary</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="e.g. Email not syncing" 
              className="h-12"
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Details</Label>
            <textarea 
              id="description" 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide more context about the issue..."
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-sm font-medium">Priority</Label>
            <select 
              id="priority" 
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="p1_critical">P1 Critical</option>
              <option value="p2_high">P2 High</option>
              <option value="p3_medium">P3 Medium</option>
              <option value="p4_low">P4 Low</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="team" className="text-sm font-medium">Assign to Team (Optional)</Label>
            <select 
              id="team" 
              value={teamId}
              onChange={e => setTeamId(e.target.value)}
              className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Unassigned</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100 dark:border-zinc-800">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/dashboard/service-desk")}
              className="h-11 px-6"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Ticket className="h-4 w-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit Ticket"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
