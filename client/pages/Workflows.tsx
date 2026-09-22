import React, { useState, useEffect } from "react";
import { GitMerge, Plus, Search, Play, Pause, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useOrganization } from "../hooks/useOrganization";
import { supabase } from "../../shared/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export default function Workflows() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [name, setName] = useState("");
  const [triggerEvent, setTriggerEvent] = useState("incident_created");

  const { orgId } = useOrganization();
  const { toast } = useToast();

  const fetchWorkflows = async () => {
    if (!orgId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("workflows")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error(error);
      toast({ title: "Error loading workflows", variant: "destructive" });
    } else {
      setWorkflows(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkflows();
  }, [orgId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;
    
    const { data, error } = await supabase.from("workflows").insert([
      {
        organization_id: orgId,
        name,
        trigger_event: triggerEvent,
        is_active: true,
      }
    ]);

    if (error) {
      console.error(error);
      toast({ title: "Failed to create workflow", variant: "destructive" });
    } else {
      toast({ title: "Workflow created successfully" });
      setIsDialogOpen(false);
      setName("");
      setTriggerEvent("incident_created");
      fetchWorkflows();
    }
  };

  const filteredWorkflows = workflows.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
          <p className="text-zinc-500">Design approval chains and business processes.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
              <Plus className="mr-2 h-4 w-4" /> Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
              <DialogDescription>
                Define the trigger event and process for this workflow.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Workflow Name</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Hardware Request Approval" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="trigger">Trigger Event</Label>
                  <select 
                    id="trigger" 
                    value={triggerEvent}
                    onChange={e => setTriggerEvent(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="incident_created">Incident Created</option>
                    <option value="request_created">Service Request Created</option>
                    <option value="change_requested">Change Requested</option>
                    <option value="user_joined">New User Joined</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Workflow</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Search workflows..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-zinc-500">Loading workflows...</div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <GitMerge className="h-10 w-10 text-zinc-300 mb-3" />
            <p className="font-medium text-zinc-900 dark:text-zinc-100">No workflows found</p>
            <p className="text-sm mt-1">Click 'Create Workflow' to get started.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
              <TableRow>
                <TableHead>Workflow Name</TableHead>
                <TableHead>Trigger Event</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkflows.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell className="font-medium">{workflow.name}</TableCell>
                  <TableCell className="text-zinc-500">{workflow.trigger_event}</TableCell>
                  <TableCell>
                    {workflow.is_active ? (
                      <span className="flex items-center text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full w-fit">
                        <Play className="h-3 w-3 mr-1" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center text-xs font-medium text-zinc-600 bg-zinc-100 px-2 py-1 rounded-full w-fit">
                        <Pause className="h-3 w-3 mr-1" /> Paused
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-zinc-500">{new Date(workflow.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
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
