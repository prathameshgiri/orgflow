import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Zap, AlertCircle, Settings2, Play, Pause, ExternalLink } from "lucide-react";
import { useOrganization } from "../hooks/useOrganization";
import { supabase } from "../../shared/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

export default function Workflows() {
  const { orgId } = useOrganization();
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkflows = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("workflows")
        .select(`
          id, name, description, trigger_event, is_active, created_at,
          automation_rules (count)
        `)
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (err: any) {
      console.error(err);
      toast({ title: "Failed to load workflows", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [orgId]);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("workflows")
        .update({ is_active: !currentStatus })
        .eq("id", id);
      
      if (error) throw error;
      setWorkflows(workflows.map(w => w.id === id ? { ...w, is_active: !currentStatus } : w));
      toast({ title: `Workflow ${!currentStatus ? 'activated' : 'paused'}` });
    } catch (err: any) {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Zap className="h-8 w-8 text-amber-500" fill="currentColor" opacity={0.2} />
            Automations & Workflows
          </h1>
          <p className="text-zinc-500 mt-1">Build real-time rules that trigger actions automatically.</p>
        </div>
        <Link 
          to="/dashboard/workflows/new"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-zinc-50 shadow hover:bg-zinc-900/90 h-9 px-4 py-2 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Automation
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-100">Active Workflows</CardTitle>
            <Play className="h-4 w-4 text-amber-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{workflows.filter(w => w.is_active).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paused Workflows</CardTitle>
            <Pause className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{workflows.filter(w => !w.is_active).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rules Configured</CardTitle>
            <Settings2 className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {workflows.reduce((acc, curr) => acc + (curr.automation_rules?.[0]?.count || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configured Automations</CardTitle>
          <CardDescription>Manage your organization's business rules and triggers.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" /></div>
          ) : workflows.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg border-zinc-200 dark:border-zinc-800">
              <Zap className="h-12 w-12 text-zinc-300 mb-4" />
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No Automations Yet</h3>
              <p className="text-sm text-zinc-500 max-w-sm mt-1 mb-4">Create your first workflow to automate repetitive tasks and notifications.</p>
              <Link 
                to="/dashboard/workflows/new"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-zinc-100 text-zinc-900 hover:bg-zinc-200 h-9 px-4 py-2 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
              >
                <Plus className="mr-2 h-4 w-4" /> Get Started
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {workflows.map((wf) => (
                <Link 
                  to={`/dashboard/workflows/${wf.id}`} 
                  key={wf.id} 
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start gap-4 mb-4 sm:mb-0">
                    <div className={`p-2 rounded-lg ${wf.is_active ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                      <Zap size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">{wf.name}</h4>
                      <p className="text-sm text-zinc-500 mt-1 line-clamp-1">{wf.description || "No description provided."}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="inline-flex items-center px-2 py-0.5 rounded font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                          Trigger: {wf.trigger_event}
                        </span>
                        <span className="text-zinc-400">
                          {wf.automation_rules?.[0]?.count || 0} Actions
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 pt-4 sm:pt-0 border-zinc-200 dark:border-zinc-800" onClick={(e) => e.preventDefault()}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-500">{wf.is_active ? 'Active' : 'Paused'}</span>
                      <Switch 
                        checked={wf.is_active} 
                        onCheckedChange={() => toggleStatus(wf.id, wf.is_active)}
                      />
                    </div>
                    <div className="text-zinc-400 group-hover:text-amber-500 transition-colors p-2">
                      <ExternalLink size={18} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
