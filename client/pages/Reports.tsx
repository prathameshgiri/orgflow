import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { 
  LayoutDashboard, TrendingUp, AlertCircle, CheckCircle2, Clock, 
  ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { useOrganization } from "../hooks/useOrganization";
import { supabase } from "../../shared/supabase";
import { format, subDays, isAfter, startOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

// Colors for charts
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const PRIORITY_COLORS: Record<string, string> = {
  'p1_critical': '#ef4444',
  'p2_high': '#f59e0b',
  'p3_medium': '#3b82f6',
  'p4_low': '#10b981'
};

export default function Reports() {
  const { orgId } = useOrganization();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    total: 0,
    open: 0,
    resolved: 0,
    avgResolutionTime: 0,
    recentGrowth: 0 // percentage growth in last 7 days vs previous 7 days
  });
  const [statusData, setStatusData] = useState<any[]>([]);
  const [priorityData, setPriorityData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    if (!orgId) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // Fetch all tickets (Incidents, Requests, Tasks)
        // In a real massive enterprise app, you'd aggregate this on the server (e.g. Postgres views/functions)
        // Here we fetch raw data for rich client-side analytics
        const [incidentsRes, requestsRes, tasksRes] = await Promise.all([
          supabase.from("incidents").select("id, status, priority, created_at, updated_at").eq("organization_id", orgId),
          supabase.from("service_requests").select("id, status, created_at, updated_at").eq("organization_id", orgId),
          supabase.from("tasks").select("id, status, created_at, updated_at").eq("organization_id", orgId)
        ]);

        if (incidentsRes.error) throw incidentsRes.error;
        
        const incidents = incidentsRes.data || [];
        const requests = requestsRes.data || [];
        const tasks = tasksRes.data || [];

        // Combine for overall metrics
        const allTickets = [
          ...incidents.map(i => ({ ...i, type: 'incident' })),
          ...requests.map(r => ({ ...r, type: 'request' })),
          ...tasks.map(t => ({ ...t, type: 'task' }))
        ];

        // 1. KPI Metrics
        const total = allTickets.length;
        const resolvedTickets = allTickets.filter(t => t.status === 'resolved' || t.status === 'closed');
        const openTickets = allTickets.filter(t => t.status !== 'resolved' && t.status !== 'closed');
        
        // Calculate average resolution time (hours)
        let totalTime = 0;
        resolvedTickets.forEach(t => {
          const created = new Date(t.created_at).getTime();
          const updated = new Date(t.updated_at).getTime();
          totalTime += (updated - created) / (1000 * 60 * 60); // in hours
        });
        const avgResolutionTime = resolvedTickets.length > 0 ? totalTime / resolvedTickets.length : 0;

        // Growth metric (Last 7 days vs Previous 7 days)
        const now = new Date();
        const sevenDaysAgo = subDays(now, 7);
        const fourteenDaysAgo = subDays(now, 14);
        
        const last7DaysCount = allTickets.filter(t => isAfter(new Date(t.created_at), sevenDaysAgo)).length;
        const prev7DaysCount = allTickets.filter(t => 
          isAfter(new Date(t.created_at), fourteenDaysAgo) && !isAfter(new Date(t.created_at), sevenDaysAgo)
        ).length;
        
        let recentGrowth = 0;
        if (prev7DaysCount > 0) {
          recentGrowth = ((last7DaysCount - prev7DaysCount) / prev7DaysCount) * 100;
        } else if (last7DaysCount > 0) {
          recentGrowth = 100; // infinite growth from 0
        }

        setMetrics({
          total,
          open: openTickets.length,
          resolved: resolvedTickets.length,
          avgResolutionTime,
          recentGrowth
        });

        // 2. Status Distribution (Pie Chart)
        const statusCounts = allTickets.reduce((acc, curr) => {
          acc[curr.status] = (acc[curr.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        setStatusData(Object.entries(statusCounts).map(([name, value]) => ({
          name: name.replace('_', ' ').toUpperCase(),
          value
        })));

        // 3. Incidents by Priority (Bar Chart)
        const priorityCounts = incidents.reduce((acc, curr) => {
          const p = curr.priority || 'Unassigned';
          acc[p] = (acc[p] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setPriorityData(Object.entries(priorityCounts).map(([name, value]) => ({
          name: name.replace('p1_', '').replace('p2_', '').replace('p3_', '').replace('p4_', '').toUpperCase(),
          value,
          fill: PRIORITY_COLORS[name] || '#94a3b8'
        })));

        // 4. Volume Over Time (Area Chart - Last 30 Days)
        const thirtyDaysAgo = subDays(now, 30);
        const dateMap: Record<string, { date: string, created: number, resolved: number }> = {};
        
        // Initialize last 30 days
        for (let i = 30; i >= 0; i--) {
          const d = format(subDays(now, i), 'MMM dd');
          dateMap[d] = { date: d, created: 0, resolved: 0 };
        }

        allTickets.forEach(t => {
          const createdDate = new Date(t.created_at);
          if (isAfter(createdDate, thirtyDaysAgo)) {
            const formatted = format(createdDate, 'MMM dd');
            if (dateMap[formatted]) dateMap[formatted].created += 1;
          }

          if (t.status === 'resolved' || t.status === 'closed') {
            const resolvedDate = new Date(t.updated_at);
            if (isAfter(resolvedDate, thirtyDaysAgo)) {
              const formatted = format(resolvedDate, 'MMM dd');
              if (dateMap[formatted]) dateMap[formatted].resolved += 1;
            }
          }
        });

        setTrendData(Object.values(dateMap));

      } catch (err) {
        console.error(err);
        toast({ title: "Failed to load analytics", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [orgId]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-zinc-500">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-coral" />
          <p>Compiling enterprise analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Reports & Analytics</h1>
        <p className="text-zinc-500 mt-1">Comprehensive overview of your service management operations.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
              {metrics.recentGrowth >= 0 ? (
                <><span className="text-emerald-500 flex items-center"><ArrowUpRight size={14} /> +{metrics.recentGrowth.toFixed(1)}%</span> from last week</>
              ) : (
                <><span className="text-rose-500 flex items-center"><ArrowDownRight size={14} /> {metrics.recentGrowth.toFixed(1)}%</span> from last week</>
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-500">{metrics.open}</div>
            <p className="text-xs text-zinc-500 mt-1">Currently active & unresolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Tickets</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">{metrics.resolved}</div>
            <p className="text-xs text-zinc-500 mt-1">Successfully closed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgResolutionTime.toFixed(1)} <span className="text-sm font-normal text-zinc-500">hours</span></div>
            <p className="text-xs text-zinc-500 mt-1">Across all resolved tickets</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Ticket Volume Over Time */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Ticket Volume (Last 30 Days)</CardTitle>
            <CardDescription>Comparison of created vs resolved tickets over time</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Area type="monotone" dataKey="created" name="Created" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCreated)" />
                  <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-400">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Status Distribution</CardTitle>
            <CardDescription>Breakdown of all tickets by current status</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col items-center justify-center">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: number) => [`${value} tickets`, 'Count']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-zinc-400">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Incidents by Priority */}
        <Card>
          <CardHeader>
            <CardTitle>Incidents by Priority</CardTitle>
            <CardDescription>Total incidents classified by priority level</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <RechartsTooltip 
                    cursor={{fill: '#f3f4f6'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" name="Incidents" radius={[4, 4, 0, 0]}>
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-400">No data available</div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
