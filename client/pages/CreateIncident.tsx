import React, { useState, useEffect } from "react";
import { ArrowLeft, Ticket, AlertCircle, FileText, Activity, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useOrganization } from "../hooks/useOrganization";
import { supabase } from "../../shared/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CreateIncident() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("p3_medium");
  const [teamId, setTeamId] = useState("unassigned");
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
        team_id: teamId === "unassigned" ? null : teamId,
        status: 'new'
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
      navigate("/dashboard/incidents");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-8 pt-4">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
          <Link to="/dashboard/incidents" className="hover:text-blue-600 transition-colors">Incidents</Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100">Create Incident</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-full h-10 w-10 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 shadow-sm shrink-0">
            <Link to="/dashboard/incidents">
              <ArrowLeft className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </Link>
          </Button>
          <div className="flex items-center gap-4 flex-1">
            <div className="h-14 w-14 rounded-2xl border-2 border-white dark:border-zinc-950 shadow-sm bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 flex items-center justify-center">
              <Ticket className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Create New Incident
              </h1>
              <p className="text-zinc-500 text-sm mt-1">
                Report a new incident, IT issue, or service request.
              </p>
            </div>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-sm font-bold flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <FileText className="h-4 w-4 text-blue-500" /> Ticket Summary
                  </Label>
                  <Input 
                    id="title" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="e.g. Cannot access the staging database..." 
                    className="h-14 text-base rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-blue-500 shadow-sm"
                    required 
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-sm font-bold flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <Activity className="h-4 w-4 text-indigo-500" /> Details & Context
                  </Label>
                  <textarea 
                    id="description" 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Provide detailed information, steps to reproduce, or any relevant context..."
                    className="flex min-h-[160px] w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-4 text-base shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 resize-y"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <div className="space-y-3">
                  <Label htmlFor="priority" className="text-sm font-bold flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <AlertCircle className="h-4 w-4 text-rose-500" /> Priority Level
                  </Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="h-12 rounded-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="p1_critical" className="py-3 text-rose-600 font-bold">P1 Critical</SelectItem>
                      <SelectItem value="p2_high" className="py-3 text-orange-500 font-bold">P2 High</SelectItem>
                      <SelectItem value="p3_medium" className="py-3 text-amber-500 font-bold">P3 Medium</SelectItem>
                      <SelectItem value="p4_low" className="py-3 text-blue-500 font-bold">P4 Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="team" className="text-sm font-bold flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <Ticket className="h-4 w-4 text-emerald-500" /> Assign to Team (Optional)
                  </Label>
                  <Select value={teamId} onValueChange={setTeamId}>
                    <SelectTrigger className="h-12 rounded-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="unassigned" className="py-3 italic text-zinc-500">Unassigned (Queue)</SelectItem>
                      {teams.map(team => (
                        <SelectItem key={team.id} value={team.id} className="py-3 font-medium">{team.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/dashboard/service-desk")}
                  className="h-12 px-8 rounded-xl font-bold border-zinc-200 dark:border-zinc-800 shadow-sm"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !title.trim() || !description.trim()}
                  className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 font-bold transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Submit Ticket
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
