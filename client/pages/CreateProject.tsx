import React, { useState } from "react";
import { ArrowLeft, Target, FolderPlus, FileText, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useOrganization } from "../hooks/useOrganization";
import { supabase } from "../../shared/supabase";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function CreateProject() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Planning");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { orgId } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !user) return;
    
    setIsSubmitting(true);
    
    const { data, error } = await supabase.from("projects").insert([
      {
        organization_id: orgId,
        name,
        description,
        status,
        progress: 0
      }
    ]);

    setIsSubmitting(false);

    if (error) {
      console.error(error);
      toast({ title: "Failed to create project", variant: "destructive" });
    } else {
      toast({ title: "Project created successfully" });
      navigate("/dashboard/projects");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-8 pt-4">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
          <Link to="/dashboard/projects" className="hover:text-indigo-600 transition-colors">Projects</Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100">Create New</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-full h-10 w-10 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 shadow-sm shrink-0">
            <Link to="/dashboard/projects">
              <ArrowLeft className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </Link>
          </Button>
          <div className="flex items-center gap-4 flex-1">
            <div className="h-14 w-14 rounded-2xl border-2 border-white dark:border-zinc-950 shadow-sm bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 flex items-center justify-center">
              <FolderPlus className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Create New Project
              </h1>
              <p className="text-zinc-500 text-sm mt-1">Define the scope and start planning your new project.</p>
            </div>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 sm:p-8 space-y-8">
              
              {/* Basic Info */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-4">
                  <FileText className="h-5 w-5 text-indigo-500" />
                  <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-200">Project Information</h3>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Project Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="e.g. Q4 Marketing Campaign" 
                    required 
                    className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-4 focus-visible:ring-indigo-500/10 text-base"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Description
                  </Label>
                  <textarea 
                    id="description" 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="What is this project about? Define the scope and goals..."
                    className="flex min-h-[120px] w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/10"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-4 mt-8">
                  <Settings2 className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-200">Initial Settings</h3>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="status" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-12 w-full md:w-1/2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-4 focus:ring-indigo-500/10">
                      <SelectValue placeholder="Select initial status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Planning" className="py-2.5 font-medium text-zinc-700 dark:text-zinc-300">Planning</SelectItem>
                      <SelectItem value="In Progress" className="py-2.5 font-medium text-blue-600 dark:text-blue-400">In Progress</SelectItem>
                      <SelectItem value="On Hold" className="py-2.5 font-medium text-amber-600 dark:text-amber-400">On Hold</SelectItem>
                      <SelectItem value="Completed" className="py-2.5 font-medium text-emerald-600 dark:text-emerald-400">Completed</SelectItem>
                      <SelectItem value="Maintenance" className="py-2.5 font-medium text-purple-600 dark:text-purple-400">Maintenance</SelectItem>
                      <SelectItem value="Cancelled" className="py-2.5 font-bold text-rose-500">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs font-medium text-zinc-500 mt-1.5 ml-1">You can update the status later as the project evolves.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 p-6 sm:p-8 bg-zinc-50/50 dark:bg-zinc-900/30 border-t border-zinc-100 dark:border-zinc-800">
              <Button type="button" variant="ghost" asChild className="rounded-xl font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <Link to="/dashboard/projects">Cancel</Link>
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !name.trim()} 
                className="h-11 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Target className="mr-2 h-5 w-5" /> Create Project
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
