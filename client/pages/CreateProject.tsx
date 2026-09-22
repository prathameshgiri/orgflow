import React, { useState } from "react";
import { ArrowLeft, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useOrganization } from "../hooks/useOrganization";
import { supabase } from "../../shared/supabase";
import { useAuth } from "../context/AuthContext";

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
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/projects">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
          <p className="text-zinc-500">Define the scope and start planning your new project.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Project Details</h3>
              <p className="text-sm text-zinc-500">Enter the core information for your project.</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">Project Name <span className="text-red-500">*</span></Label>
            <Input 
              id="name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. Q4 Marketing Campaign" 
              required 
              className="max-w-md"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
            <textarea 
              id="description" 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this project about?"
              className="flex min-h-[120px] w-full max-w-lg rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-semibold">Initial Status</Label>
            <select 
              id="status" 
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <p className="text-xs text-zinc-500 mt-1">You can update the status later as the project evolves.</p>
          </div>
          
          <div className="pt-4 flex items-center gap-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
            <Link to="/dashboard/projects">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
