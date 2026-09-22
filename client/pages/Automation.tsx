import React, { useState, useEffect } from "react";
import { Zap, Plus, Search, MoreHorizontal } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";

export default function Automation() {
  const [automations, setAutomations] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [workflowId, setWorkflowId] = useState("");
  const [actionType, setActionType] = useState("send_email");

  const { orgId } = useOrganization();
  const { toast } = useToast();

  const fetchAutomations = async () => {
    if (!orgId) return;
    setLoading(true);
    // Fetch rules
    const { data: rulesData } = await supabase
      .from("automation_rules")
      .select("*, workflows(name)")
      .order("step_order", { ascending: true });
      
    // Fetch workflows for the dropdown
    const { data: workflowsData } = await supabase
      .from("workflows")
      .select("id, name");

    setAutomations(rulesData || []);
    setWorkflows(workflowsData || []);
    if (workflowsData && workflowsData.length > 0 && !workflowId) {
      setWorkflowId(workflowsData[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAutomations();
  }, [orgId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !workflowId) {
      toast({ title: "Please select a workflow first", variant: "destructive" });
      return;
    }
    
    const { error } = await supabase.from("automation_rules").insert([
      {
        organization_id: orgId,
        workflow_id: workflowId,
        action_type: actionType,
        condition_json: { "condition": "always" },
        action_payload: { "target": "admin" },
        step_order: automations.length + 1
      }
    ]);

    if (error) {
      console.error(error);
      toast({ title: "Failed to create rule", variant: "destructive" });
    } else {
      toast({ title: "Automation rule created" });
      setIsDialogOpen(false);
      fetchAutomations();
    }
  };

  const filteredAutomations = automations.filter(a => a.workflows?.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automation</h1>
          <p className="text-zinc-500">Configure automated actions to reduce manual work.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
              <Plus className="mr-2 h-4 w-4" /> New Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Automation Rule</DialogTitle>
              <DialogDescription>
                Attach an automated action to an existing workflow.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="workflow">Target Workflow</Label>
                  <select 
                    id="workflow" 
                    value={workflowId}
                    onChange={e => setWorkflowId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  >
                    {workflows.length === 0 && <option value="">No workflows found</option>}
                    {workflows.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="action">Action to Perform</Label>
                  <select 
                    id="action" 
                    value={actionType}
                    onChange={e => setActionType(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="send_email">Send Email Notification</option>
                    <option value="update_status">Update Record Status</option>
                    <option value="assign_user">Assign to User</option>
                    <option value="trigger_webhook">Trigger Webhook</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Rule</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/20">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Search automation rules..." 
              className="pl-9 bg-white dark:bg-zinc-950"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-zinc-500">Loading rules...</div>
        ) : filteredAutomations.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-indigo-500" />
            </div>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No automations created yet</h3>
            <p className="text-sm mt-1 max-w-sm">Automate repetitive tasks like auto-assigning tickets or sending custom notifications based on conditions.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
              <TableRow>
                <TableHead>Workflow</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Step</TableHead>
                <TableHead className="text-right">Manage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAutomations.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.workflows?.name || 'Unknown'}</TableCell>
                  <TableCell className="text-zinc-500">{item.action_type}</TableCell>
                  <TableCell className="text-zinc-500">{item.step_order}</TableCell>
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
