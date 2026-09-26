import React, { useState, useEffect } from "react";
import { Users, Plus, Search, MoreHorizontal, Briefcase, Activity, Target, Shield, Settings, AlertCircle, ArrowUpRight, TrendingUp } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useOrganization } from "../hooks/useOrganization";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Users as UsersIcon, History } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

export default function Teams() {
  const [teams, setTeams] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);

  const { orgId } = useOrganization();
  const { session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchData = async () => {
    if (!orgId || !session?.access_token) return;
    setLoading(true);
    
    try {
      const res = await fetch("/api/teams", {
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "x-org-id": orgId
        }
      });
      if (!res.ok) throw new Error("Failed to fetch teams");
      const data = await res.json();
      setTeams(data || []);
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error loading teams", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orgId]);

  // Derived Stats
  const totalTeams = teams.length;
  const totalMembers = teams.reduce((acc, team) => acc + (team.team_members?.length || 0), 0);
  const avgMembers = totalTeams > 0 ? Math.round(totalMembers / totalTeams) : 0;
  
  // Sort and filter logic
  let processedTeams = teams.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
  
  if (sortBy === "newest") {
    processedTeams.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (sortBy === "oldest") {
    processedTeams.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } else if (sortBy === "most_members") {
    processedTeams.sort((a, b) => (b.team_members?.length || 0) - (a.team_members?.length || 0));
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Color palette for team avatars
  const avatarColors = [
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
    "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400",
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
    "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400",
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6 pt-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Teams
          </h1>
          <p className="text-zinc-500 mt-2 text-lg">Organize your workforce and track departmental metrics.</p>
        </div>
        <Button asChild className="group relative h-11 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 font-bold text-white hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-500/25">
          <Link to="/dashboard/teams/create">
            <span className="relative z-10 flex items-center justify-center">
              <Plus className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-90" /> 
              Create Team
            </span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md bg-white dark:bg-zinc-950 overflow-hidden flex flex-col group transition-all duration-300">
          <div className="p-6 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0 shadow-sm">
              <Briefcase className="h-6 w-6 text-indigo-600 dark:text-indigo-400" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[15px] font-medium text-zinc-500 dark:text-zinc-400">Total Teams</p>
              <h4 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight mt-0.5">{totalTeams}</h4>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md bg-white dark:bg-zinc-950 overflow-hidden flex flex-col group transition-all duration-300">
          <div className="p-6 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl border border-violet-100 dark:border-violet-900/30 bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center shrink-0 shadow-sm">
              <UsersIcon className="h-6 w-6 text-violet-600 dark:text-violet-400" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[15px] font-medium text-zinc-500 dark:text-zinc-400">Total Members</p>
              <h4 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight mt-0.5">{totalMembers}</h4>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md bg-white dark:bg-zinc-950 overflow-hidden flex flex-col group transition-all duration-300">
          <div className="p-6 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 shadow-sm">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[15px] font-medium text-zinc-500 dark:text-zinc-400">Avg. Team Size</p>
              <h4 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight mt-0.5">{avgMembers}</h4>
            </div>
          </div>
        </Card>
        
        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md bg-white dark:bg-zinc-950 overflow-hidden flex flex-col group transition-all duration-300">
          <div className="p-6 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0 shadow-sm">
              <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[15px] font-medium text-zinc-500 dark:text-zinc-400">System Status</p>
              <h4 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight mt-0.5 flex items-center gap-2">
                Active <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
              </h4>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Main Content Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
          {/* Toolbar */}
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="relative w-full sm:w-80 group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                <Search size={18} />
              </div>
              <Input 
                placeholder="Search teams by name..." 
                className="h-11 pl-10 rounded-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus-visible:ring-4 focus-visible:ring-indigo-500/10 transition-all shadow-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-sm font-medium text-zinc-500">Sort:</span>
              <select 
                className="h-11 px-4 rounded-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most_members">Most Members</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center">
              <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-zinc-500 font-medium">Loading teams data...</p>
            </div>
          ) : processedTeams.length === 0 ? (
            <div className="p-24 flex flex-col items-center justify-center text-center">
              <div className="h-24 w-24 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-6">
                <Users className="h-10 w-10 text-zinc-400" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-zinc-100">No teams found</h3>
              <p className="text-zinc-500 max-w-sm mx-auto mb-6">
                {searchQuery ? "No teams matched your search criteria. Try a different term." : "Your organization doesn't have any teams yet."}
              </p>
              {!searchQuery && (
                <Button asChild className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                  <Link to="/dashboard/teams/create">Create your first team</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white dark:bg-zinc-950">
                  <TableRow className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-transparent">
                    <TableHead className="py-5 font-semibold text-zinc-500 uppercase tracking-wider text-xs">Team</TableHead>
                    <TableHead className="py-5 font-semibold text-zinc-500 uppercase tracking-wider text-xs">Members</TableHead>
                    <TableHead className="py-5 font-semibold text-zinc-500 uppercase tracking-wider text-xs">Created</TableHead>
                    <TableHead className="py-5 font-semibold text-zinc-500 uppercase tracking-wider text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedTeams.map((team, idx) => {
                    const colorClass = avatarColors[idx % avatarColors.length];
                    const membersCount = team.team_members?.length || 0;
                    
                    return (
                      <TableRow key={team.id} className="cursor-pointer hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors group">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-4">
                            <Avatar className={`h-12 w-12 rounded-2xl border-2 border-white dark:border-zinc-950 shadow-sm ${colorClass}`}>
                              <AvatarFallback className="bg-transparent font-bold text-lg">
                                {getInitials(team.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-zinc-900 dark:text-zinc-100 text-base">{team.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                  Active
                                </span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-3">
                              {/* Create dummy avatars for visual effect if members exist */}
                              {membersCount > 0 ? (
                                Array.from({ length: Math.min(3, membersCount) }).map((_, i) => (
                                  <Avatar key={i} className="h-10 w-10 border-2 border-white dark:border-zinc-950 shadow-sm ring-2 ring-transparent group-hover:ring-indigo-100 dark:group-hover:ring-indigo-900 transition-all">
                                    <AvatarFallback className={`text-xs font-semibold ${avatarColors[(i + 2) % avatarColors.length]}`}>
                                      U{i+1}
                                    </AvatarFallback>
                                  </Avatar>
                                ))
                              ) : (
                                <div className="h-10 w-10 rounded-full border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/50">
                                  <Users className="h-4 w-4 text-zinc-400" />
                                </div>
                              )}
                              
                              {membersCount > 3 && (
                                <div className="h-10 w-10 rounded-full border-2 border-white dark:border-zinc-950 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center z-10 shadow-sm">
                                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">+{membersCount - 3}</span>
                                </div>
                              )}
                            </div>
                            <span className="text-sm font-medium text-zinc-500">
                              {membersCount === 0 ? "Empty team" : `${membersCount} total`}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">
                              {new Date(team.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="text-xs text-zinc-500 mt-0.5">
                              {new Date(team.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 rounded-full hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100"
                              onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/teams/${team.id}/members`); }}
                              title="Add Members"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                                  <MoreHorizontal className="h-5 w-5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 rounded-xl p-1">
                                <DropdownMenuItem onClick={() => navigate(`/dashboard/teams/${team.id}/members`)} className="rounded-lg cursor-pointer py-2.5">
                                  <UsersIcon className="h-4 w-4 mr-3 text-indigo-500" /> 
                                  <span className="font-medium">Manage Members</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/dashboard/teams/${team.id}/history`)} className="rounded-lg cursor-pointer py-2.5">
                                  <History className="h-4 w-4 mr-3 text-zinc-500" /> 
                                  <span className="font-medium">View History</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
