import React, { useState, useEffect } from "react";
import { 
  ActivitySquare, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Settings2,
  BarChart3,
  CalendarDays
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "../../shared/supabase";
import { useOrganization } from "../hooks/useOrganization";

// Mock SLAs (Target in hours)
const SLA_TARGETS = {
  'p1_critical': 4,
  'p2_high': 8,
  'p3_medium': 24,
  'p4_low': 48
};

const formatPriority = (p: string) => {
  if (p === 'p1_critical') return 'P1 - Critical';
  if (p === 'p2_high') return 'P2 - High';
  if (p === 'p3_medium') return 'P3 - Medium';
  if (p === 'p4_low') return 'P4 - Low';
  return p;
};

export default function SLA() {
  const { orgId } = useOrganization();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    compliance: 100,
    withinSLA: 0,
    breached: 0,
    atRisk: 0,
    avgResolutionP1: "0h 0m",
  });
  
  const [trendData, setTrendData] = useState<any[]>([]);
  const [priorityData, setPriorityData] = useState<any[]>([]);
  const [recentBreaches, setRecentBreaches] = useState<any[]>([]);
  const [assigneeStats, setAssigneeStats] = useState<any[]>([]);
  const [resolutionDistribution, setResolutionDistribution] = useState<any[]>([]);

  useEffect(() => {
    if (!orgId) return;

    const fetchSLADetails = async () => {
      try {
        setLoading(true);
        // Fetch all incidents
        const { data: incidents, error } = await supabase
          .from("incidents")
          .select("*")
          .eq("organization_id", orgId);
          
        if (error) throw error;
        
        let within = 0;
        let breached = 0;
        let atRisk = 0;
        let p1ResTimes: number[] = [];
        let breachedList: any[] = [];

        const now = new Date();
        const past7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return {
            dateStr: d.toISOString().split('T')[0],
            day: d.toLocaleDateString('en-US', { weekday: 'short' }),
            total: 0,
            breached: 0
          };
        });

        const priorityStats: Record<string, { total: number, breached: number }> = {
          'p1_critical': { total: 0, breached: 0 },
          'p2_high': { total: 0, breached: 0 },
          'p3_medium': { total: 0, breached: 0 },
          'p4_low': { total: 0, breached: 0 },
        };

        (incidents || []).forEach(inc => {
          const priority = inc.priority || 'p3_medium';
          const targetHours = SLA_TARGETS[priority as keyof typeof SLA_TARGETS] || 24;
          const targetMs = targetHours * 60 * 60 * 1000;
          
          const created = new Date(inc.created_at);
          let resolvedOrCurrent = now;
          let isResolved = ['resolved', 'closed'].includes(inc.status);
          
          if (isResolved && inc.updated_at) {
            resolvedOrCurrent = new Date(inc.updated_at);
          }
          
          const elapsed = resolvedOrCurrent.getTime() - created.getTime();
          const isBreached = elapsed > targetMs;
          
          // Tickets that have consumed 80% of their SLA target time but aren't resolved
          const isAtRisk = !isResolved && !isBreached && (elapsed > targetMs * 0.8);

          // Global metrics
          if (isBreached) {
            breached++;
            breachedList.push({ ...inc, elapsed, targetMs });
          } else {
            within++;
            if (isAtRisk) atRisk++;
          }

          // P1 Avg Resolution
          if (priority === 'p1_critical' && isResolved) {
            p1ResTimes.push(elapsed);
          }

          // Priority Stats
          if (priorityStats[priority]) {
            priorityStats[priority].total++;
            if (isBreached) priorityStats[priority].breached++;
          }

          // Trend Stats (based on created_at for simplicity)
          const createdStr = created.toISOString().split('T')[0];
          const trendDay = past7Days.find(d => d.dateStr === createdStr);
          if (trendDay) {
            trendDay.total++;
            if (isBreached) trendDay.breached++;
          }
        });

        // Group by Assignee
        const assigneeMap: Record<string, { total: number, breached: number, name: string }> = {};
        const assigneeIds = new Set(incidents.map(i => i.assignee_id).filter(Boolean));
        
        let usersDict: Record<string, string> = {};
        if (assigneeIds.size > 0) {
          const { data: usersData } = await supabase.from('users').select('id, full_name').in('id', Array.from(assigneeIds));
          if (usersData) {
            usersData.forEach(u => usersDict[u.id] = u.full_name);
          }
        }

        incidents.forEach(inc => {
          const priority = inc.priority || 'p3_medium';
          const targetHours = SLA_TARGETS[priority as keyof typeof SLA_TARGETS] || 24;
          const targetMs = targetHours * 60 * 60 * 1000;
          
          const created = new Date(inc.created_at);
          let resolvedOrCurrent = now;
          let isResolved = ['resolved', 'closed'].includes(inc.status);
          if (isResolved && inc.updated_at) resolvedOrCurrent = new Date(inc.updated_at);
          
          const elapsed = resolvedOrCurrent.getTime() - created.getTime();
          const isBreached = elapsed > targetMs;

          const aid = inc.assignee_id || 'unassigned';
          if (!assigneeMap[aid]) {
            assigneeMap[aid] = { total: 0, breached: 0, name: usersDict[aid] || 'Unassigned' };
          }
          assigneeMap[aid].total++;
          if (isBreached) assigneeMap[aid].breached++;
        });

        const assigneeArr = Object.values(assigneeMap)
          .map(a => ({
            name: a.name,
            compliance: a.total > 0 ? ((a.total - a.breached) / a.total) * 100 : 100,
            total: a.total,
            breached: a.breached
          }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5); // top 5 by volume
          
        setAssigneeStats(assigneeArr);

        // Resolution Distribution (Only for resolved tickets)
        const dist = { '< 1h': 0, '1-4h': 0, '4-8h': 0, '8-24h': 0, '> 24h': 0 };
        incidents.filter(i => ['resolved', 'closed'].includes(i.status)).forEach(inc => {
          const created = new Date(inc.created_at);
          const resolved = new Date(inc.updated_at || inc.created_at);
          const hours = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60);
          
          if (hours < 1) dist['< 1h']++;
          else if (hours <= 4) dist['1-4h']++;
          else if (hours <= 8) dist['4-8h']++;
          else if (hours <= 24) dist['8-24h']++;
          else dist['> 24h']++;
        });
        
        setResolutionDistribution(
          Object.entries(dist).map(([name, count]) => ({ name, count }))
        );

        // Sort breaches by created_at desc
        breachedList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setRecentBreaches(breachedList.slice(0, 5));

        const total = within + breached;
        const compliance = total > 0 ? ((within / total) * 100).toFixed(1) : 100;
        
        let avgP1 = "0h 0m";
        if (p1ResTimes.length > 0) {
          const avgMs = p1ResTimes.reduce((a, b) => a + b, 0) / p1ResTimes.length;
          const hours = Math.floor(avgMs / (1000 * 60 * 60));
          const mins = Math.floor((avgMs % (1000 * 60 * 60)) / (1000 * 60));
          avgP1 = `${hours}h ${mins}m`;
        }

        setStats({
          compliance: Number(compliance),
          withinSLA: within,
          breached,
          atRisk,
          avgResolutionP1: avgP1,
        });

        const finalTrend = past7Days.map(d => {
          const c = d.total > 0 ? ((d.total - d.breached) / d.total) * 100 : 100;
          return { day: d.day, compliance: Number(c.toFixed(1)) };
        });
        setTrendData(finalTrend);

        const colors = {
          'p1_critical': '#ef4444',
          'p2_high': '#f97316',
          'p3_medium': '#eab308',
          'p4_low': '#3b82f6',
        };
        const finalPriority = Object.keys(priorityStats).map(p => {
          const t = priorityStats[p].total;
          const b = priorityStats[p].breached;
          const c = t > 0 ? ((t - b) / t) * 100 : 100;
          return {
            name: formatPriority(p),
            target: p === 'p1_critical' ? 99 : p === 'p2_high' ? 98 : p === 'p3_medium' ? 95 : 90,
            current: Number(c.toFixed(1)),
            color: colors[p as keyof typeof colors]
          };
        });
        setPriorityData(finalPriority);

      } catch (err) {
        console.error("Failed to load SLA details", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSLADetails();

    // Setup realtime subscription
    const subscription = supabase
      .channel('sla_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents', filter: `organization_id=eq.${orgId}` }, () => {
        fetchSLADetails();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [orgId]);

  if (loading) {
    return <div className="p-16 text-center text-zinc-500 animate-pulse">Loading SLA metrics...</div>;
  }
  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6 pt-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
            <ActivitySquare className="h-8 w-8 text-indigo-600" /> 
            SLA Dashboard
          </h1>
          <p className="text-zinc-500 mt-2 font-medium">Monitor and analyze Service Level Agreement performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 shadow-sm">
            <CalendarDays className="h-4 w-4 text-zinc-500" />
            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Last 7 Days</span>
          </div>
          <Button variant="outline" className="rounded-xl font-bold bg-white dark:bg-zinc-900 h-10 shadow-sm border-zinc-200 dark:border-zinc-800">
            <Settings2 className="h-4 w-4 mr-2 text-zinc-500" /> Configure SLAs
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl">
              <ShieldCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
              <TrendingUp className="h-3 w-3 mr-1" /> +1.2%
            </span>
          </div>
          <div className="relative">
            <h3 className="text-zinc-500 font-semibold mb-1">Overall Compliance</h3>
            <p className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">{stats.compliance}%</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="relative">
            <h3 className="text-zinc-500 font-semibold mb-1">Within SLA</h3>
            <p className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">{stats.withinSLA}</p>
            <p className="text-sm text-zinc-400 font-medium mt-1">Tickets resolved on time</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative">
            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-2xl">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            {stats.atRisk > 0 && (
              <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-lg animate-pulse">
                <AlertTriangle className="h-3 w-3 mr-1" /> At Risk
              </span>
            )}
          </div>
          <div className="relative">
            <h3 className="text-zinc-500 font-semibold mb-1">SLA At Risk</h3>
            <p className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">{stats.atRisk}</p>
            <p className="text-sm text-zinc-400 font-medium mt-1">Nearing target time</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative">
            <div className="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-2xl">
              <AlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            {stats.breached > 0 && (
              <span className="flex items-center text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-lg">
                <AlertTriangle className="h-3 w-3 mr-1" /> Action Needed
              </span>
            )}
          </div>
          <div className="relative">
            <h3 className="text-zinc-500 font-semibold mb-1">Breached SLAs</h3>
            <p className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">{stats.breached}</p>
            <p className="text-sm text-zinc-400 font-medium mt-1">Missed target times</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-500" /> Compliance Trend
            </h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" strokeOpacity={0.2} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12, fontWeight: 600 }} domain={[0, 100]} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '16px', border: '1px solid rgba(228, 228, 231, 0.5)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="compliance" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCompliance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm flex flex-col">
          <h2 className="text-xl font-bold mb-2">Current Status</h2>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Within SLA', value: stats.withinSLA - stats.atRisk, color: '#10b981' },
                    { name: 'At Risk', value: stats.atRisk, color: '#f59e0b' },
                    { name: 'Breached', value: stats.breached, color: '#f43f5e' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {
                    [
                      { name: 'Within SLA', value: stats.withinSLA - stats.atRisk, color: '#10b981' },
                      { name: 'At Risk', value: stats.atRisk, color: '#f59e0b' },
                      { name: 'Breached', value: stats.breached, color: '#f43f5e' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))
                  }
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid rgba(228, 228, 231, 0.5)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Breakdown */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm">
          <h2 className="text-xl font-bold mb-6">Compliance by Priority</h2>
          <div className="space-y-6 mt-4">
            {priorityData.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-zinc-700 dark:text-zinc-300">{item.name}</span>
                  <span className={`${item.current < item.target ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {item.current}%
                  </span>
                </div>
                <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${item.current}%`, backgroundColor: item.color }}
                  />
                </div>
                <div className="text-[11px] font-medium text-zinc-500 text-right">Target: {item.target}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Breaches */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-rose-600 dark:text-rose-400">Recent Breaches</h2>
            <Button variant="outline" size="sm" className="rounded-lg h-8 px-3 text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700">View All</Button>
          </div>
          <div className="flex-1 space-y-4">
            {recentBreaches.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-emerald-500 min-h-[200px]">
                <ShieldCheck className="h-10 w-10 mb-3 opacity-50" />
                <p className="font-bold">No recent breaches</p>
                <p className="text-xs mt-1 text-zinc-400">All tickets are meeting their SLA targets.</p>
              </div>
            ) : (
              recentBreaches.map((breach) => {
                const targetHours = Math.floor(breach.targetMs / (1000 * 60 * 60));
                const delayMs = breach.elapsed - breach.targetMs;
                const delayHours = Math.floor(delayMs / (1000 * 60 * 60));
                
                return (
                  <Link to={`/dashboard/service-desk/tickets/${breach.id}`} key={breach.id} className="block p-4 border border-rose-100 dark:border-rose-900/30 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-900/40 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm line-clamp-1 group-hover:text-rose-600">{breach.title}</h4>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500 font-medium">
                          <span className="text-rose-600">{formatPriority(breach.priority || 'p3_medium')}</span>
                          <span>•</span>
                          <span>Target: {targetHours}h</span>
                        </div>
                      </div>
                      <span className="shrink-0 bg-white dark:bg-zinc-900 text-rose-600 px-2 py-1 rounded-md text-xs font-bold border border-rose-100 dark:border-rose-900 shadow-sm">
                        +{delayHours}h late
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignee Performance */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm">
          <h2 className="text-xl font-bold mb-6">Assignee Performance (Top 5)</h2>
          <div className="space-y-6 mt-4">
            {assigneeStats.map((assignee, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-sm font-bold">
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                      {assignee.name.charAt(0)}
                    </div>
                    {assignee.name}
                  </div>
                  <span className={`${assignee.compliance < 95 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {assignee.compliance.toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${assignee.compliance < 95 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${assignee.compliance}%` }}
                  />
                </div>
                <div className="text-[11px] font-medium text-zinc-500 text-right">
                  {assignee.total} tickets ({assignee.breached} breached)
                </div>
              </div>
            ))}
            {assigneeStats.length === 0 && (
              <div className="text-center text-zinc-500 text-sm py-4">No data available</div>
            )}
          </div>
        </div>

        {/* Resolution Time Distribution */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm flex flex-col">
          <h2 className="text-xl font-bold mb-6">Resolution Time Distribution</h2>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resolutionDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" strokeOpacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12, fontWeight: 600 }} />
                <RechartsTooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid rgba(228, 228, 231, 0.5)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                  {resolutionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#3b82f6' : index === 2 ? '#6366f1' : index === 3 ? '#f59e0b' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SLA Policies List */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
          <h2 className="text-xl font-bold">Active SLA Policies</h2>
          <Button variant="outline" size="sm" className="rounded-lg font-bold">View All</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-900/30 border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-extrabold tracking-wider">Policy Name</th>
                <th className="px-6 py-4 font-extrabold tracking-wider">Metric Type</th>
                <th className="px-6 py-4 font-extrabold tracking-wider">Priority Level</th>
                <th className="px-6 py-4 font-extrabold tracking-wider">Target Time</th>
                <th className="px-6 py-4 font-extrabold tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {/* Active SLA Policies configured in code */}
              {[
                { id: 1, name: "Critical Incident Resolution", type: "Resolution Time", target: "4 hours", priority: "P1", status: "Active" },
                { id: 2, name: "High Priority Resolution", type: "Resolution Time", target: "8 hours", priority: "P2", status: "Active" },
                { id: 3, name: "Standard Support Resolution", type: "Resolution Time", target: "24 hours", priority: "P3", status: "Active" },
                { id: 4, name: "Low Priority Resolution", type: "Resolution Time", target: "48 hours", priority: "P4", status: "Active" },
              ].map((policy) => (
                <tr key={policy.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">{policy.name}</td>
                  <td className="px-6 py-4 font-medium text-zinc-600 dark:text-zinc-400">{policy.type}</td>
                  <td className="px-6 py-4">
                    <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      {policy.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold">{policy.target}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                      <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                      {policy.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
