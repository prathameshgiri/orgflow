import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useOrganization } from "../hooks/useOrganization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, CheckSquare, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "../../shared/supabase";

export default function Dashboard() {
  const { user } = useAuth();
  const { orgId, loading: orgLoading } = useOrganization();
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeProjects: 0,
    pendingTasks: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!orgId) return;
      
      setLoading(true);
      setError("");

      try {
        // Fetch user count for this org
        const { count: userCount, error: userError } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true });
          // Note: RLS implicitly filters by current_user_org_id()

        // Fetch active projects count
        const { count: projectCount, error: projectError } = await supabase
          .from("projects")
          .select("*", { count: "exact", head: true })
          .eq("status", "In Progress");

        // Fetch pending tasks count
        const { count: taskCount, error: taskError } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .neq("status", "Completed");

        if (userError) throw userError;

        setStats({
          totalMembers: userCount || 0,
          activeProjects: projectCount || 0,
          pendingTasks: taskCount || 0
        });
        
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch dashboard stats. Check console for details.");
      } finally {
        setLoading(false);
      }
    };

    if (!orgLoading) {
      fetchDashboardStats();
    }
  }, [orgId, orgLoading]);

  if (orgLoading) return <div>Loading context...</div>;

  if (!orgId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
        <Building2 className="h-16 w-16 text-zinc-300 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Welcome to OrgTask</h2>
        <p className="text-zinc-500 max-w-md">
          You don't belong to any organization yet. Please ask an administrator to invite you or create a new organization if you are a Super Admin.
        </p>
      </div>
    );
  }

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-zinc-500">Here's what's happening in your organization today.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Total Members</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Active Projects</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Pending Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTasks}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
