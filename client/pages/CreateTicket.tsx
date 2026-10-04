import React, { useState, useEffect } from "react";
import { ArrowLeft, Ticket, AlertCircle, FileText, Activity, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "react-router-dom";
import { useOrganization } from "../hooks/useOrganization";
import { supabase } from "../../shared/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CreateTicket() {
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
        title: `[SCTASK] ${title}`,
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
      navigate("/dashboard/service-desk");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-8 pt-4">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
          <Link to="/dashboard/service-desk" className="hover:text-blue-600 transition-colors">Service Desk (SCTASK)</Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100">Create Ticket</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-xl h-10 w-10 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 shadow-sm shrink-0">
            <Link to="/dashboard/service-desk">
              <ArrowLeft className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </Link>
          </Button>
          <div className="flex items-center gap-4 flex-1">
            <div className="h-14 w-14 rounded-2xl border-2 border-white dark:border-zinc-950 shadow-sm bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 flex items-center justify-center">
              <Ticket className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Create Service Desk Ticket (SCTASK)
              </h1>
              <p className="text-zinc-500 text-sm mt-1">
                Report a new IT issue, service request, or task.
              </p>
            </div>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          
          <div className="p-4 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Basic Info */}
              <div className="flex flex-col w-full space-y-6 bg-card p-6 sm:p-8 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800/50">
                <div className="flex flex-col space-y-1.5 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-bold text-xl text-zinc-800 dark:text-zinc-100 tracking-tight">Basic Information</h3>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm ml-12">Provide a clear and concise summary along with detailed context for this ticket.</p>
                </div>
                
                <div className="w-full space-y-5 text-left pt-1">
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-base font-bold text-zinc-700 dark:text-zinc-300">
                      Ticket Summary <span className="text-rose-500">*</span>
                    </Label>
                    <Input 
                      id="title" 
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      placeholder="e.g. Cannot access the staging database..." 
                      className="h-14 text-base rounded-xl px-5"
                      required 
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-base font-bold text-zinc-700 dark:text-zinc-300">
                      Details & Context <span className="text-rose-500">*</span>
                    </Label>
                    <Textarea
                      id="description" 
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Provide detailed information, steps to reproduce, or any relevant context..."
                      className="min-h-[160px] rounded-xl resize-y p-5 text-base"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Left/Right Grid for Classification and Assignment */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pt-6">
                
                {/* Left side: Ticket Properties */}
                <div className="bg-card p-8 sm:p-10 rounded-3xl space-y-8 flex flex-col h-full border border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex flex-col gap-2 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-xl">
                        <Activity className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h3 className="font-bold text-xl text-zinc-800 dark:text-zinc-100">Ticket Properties</h3>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Set the priority level for this ticket.</p>
                  </div>
                  
                  <div className="flex flex-col gap-6 flex-1">
                    <div className="space-y-3">
                      <Label htmlFor="priority" className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-rose-500" /> Priority Level
                      </Label>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger className="h-14 rounded-xl">
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
                  </div>
                </div>

                {/* Right side: Assignment */}
                <div className="bg-card p-8 sm:p-10 rounded-3xl space-y-8 flex flex-col h-full border border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex flex-col gap-2 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2.5 rounded-xl">
                        <Ticket className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="font-bold text-xl text-zinc-800 dark:text-zinc-100">Assignment</h3>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Assign this ticket to a specific team.</p>
                  </div>
                  
                  <div className="flex flex-col gap-6 flex-1">
                    <div className="space-y-3">
                      <Label htmlFor="team" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Assign to Team (Optional)</Label>
                      <Select value={teamId} onValueChange={setTeamId}>
                        <SelectTrigger className="h-14 rounded-xl">
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
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 p-6 sm:p-8 bg-zinc-50/50 dark:bg-zinc-900/30 border-t border-zinc-100 dark:border-zinc-800 rounded-3xl mt-8">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => navigate("/dashboard/service-desk")}
                  className="rounded-xl font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !title.trim() || !description.trim()}
                  className="h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 font-bold transition-all active:scale-[0.98]"
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
