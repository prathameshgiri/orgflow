import React, { useState, useEffect } from "react";
import { AlertCircle, Plus, MoreHorizontal, Filter, Search, Edit2, Users, User, AlertTriangle, CheckCircle } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrganization } from "../hooks/useOrganization";
import { supabase } from "../../shared/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "p1_critical": return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
    case "p2_high": return "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400";
    case "p3_medium": return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "p4_low": return "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400";
    default: return "text-zinc-600 bg-zinc-100";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "new": return "border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400";
    case "in_progress": return "border-yellow-200 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400";
    case "resolved": return "border-green-200 text-green-700 bg-green-50 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400";
    case "closed": return "border-zinc-200 text-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-zinc-400";
    default: return "border-zinc-200 text-zinc-700";
  }
};

export default function Incidents() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [teams, setTeams] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [assignableUsers, setAssignableUsers] = useState<any[]>([]);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("p3_medium");

  const { orgId } = useOrganization();
  const { user, session } = useAuth();
  const { toast } = useToast();

  const fetchIncidents = async () => {
    if (!orgId) return;
    setLoading(true);
    // Modified to fetch assignee and team info
    const { data, error } = await supabase
      .from("incidents")
      .select(`*, assignee:users!incidents_assignee_id_fkey(full_name), team:teams!incidents_team_id_fkey(name)`)
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error(error);
      toast({ title: "Error loading incidents", variant: "destructive" });
    } else {
      setIncidents(data || []);
    }
    setLoading(false);
  };

  const fetchTeamsAndUsers = async () => {
    if (!orgId || !session) return;
    // Fetch Teams
    const resTeams = await fetch('/api/teams', { headers: { 'Authorization': `Bearer ${session.access_token}`, 'x-org-id': orgId } });
    if (resTeams.ok) {
        const data = await resTeams.json();
        setTeams(Array.isArray(data) ? data : (data.teams || []));
    }
    // Fetch Users
    const resUsers = await fetch('/api/users', { headers: { 'Authorization': `Bearer ${session.access_token}`, 'x-org-id': orgId } });
    if (resUsers.ok) {
        const data = await resUsers.json();
        setUsers(Array.isArray(data) ? data : (data.users || []));
    }
  };

  useEffect(() => {
    fetchIncidents();
    fetchTeamsAndUsers();
  }, [orgId, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !user) return;
    
    const { data, error } = await supabase.from("incidents").insert([
      {
        organization_id: orgId,
        title,
        description,
        priority,
        reporter_id: user.id,
      }
    ]);

    if (error) {
      console.error(error);
      toast({ title: "Failed to create incident", variant: "destructive" });
    } else {
      toast({ title: "Incident created successfully" });
      setIsDialogOpen(false);
      setTitle("");
      setDescription("");
      setPriority("p3_medium");
      fetchIncidents();
    }
  };

  const filteredIncidents = incidents.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incidents</h1>
          <p className="text-zinc-500">Track and resolve IT issues and outages.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-zinc-200 dark:border-zinc-800">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700 text-white transition-colors">
                <Plus className="mr-2 h-4 w-4" /> Report Incident
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Report New Incident</DialogTitle>
                <DialogDescription>
                  Provide details about the issue. Critical priority will page on-call staff.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Issue Title</Label>
                    <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Database connection timeout" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea 
                      id="description" 
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Include error logs or steps to reproduce..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <select 
                      id="priority" 
                      value={priority}
                      onChange={e => setPriority(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="p1_critical">P1 Critical (Outage)</option>
                      <option value="p2_high">P2 High</option>
                      <option value="p3_medium">P3 Medium</option>
                      <option value="p4_low">P4 Low</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">Create Incident</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Open Incidents</p>
          <h3 className="text-2xl font-bold mt-1">{incidents.filter(i => i.status !== 'Resolved').length}</h3>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-red-200 dark:border-red-900/50 shadow-sm">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">Critical (P1)</p>
          <h3 className="text-2xl font-bold mt-1 text-red-700 dark:text-red-400">{incidents.filter(i => i.priority === 'p1_critical' && i.status !== 'closed').length}</h3>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Unassigned</p>
          <h3 className="text-2xl font-bold mt-1">{incidents.filter(i => !i.assignee_id).length}</h3>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">Resolved Today</p>
          <h3 className="text-2xl font-bold mt-1">0</h3>
        </div>
  </div>


      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Search incidents..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Table>
          <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
            <TableRow>
              <TableHead className="whitespace-nowrap min-w-[200px]">Incident</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Priority</TableHead>
              <TableHead className="whitespace-nowrap">Assignee</TableHead>
              <TableHead className="whitespace-nowrap">Created</TableHead>
              <TableHead className="text-right whitespace-nowrap">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow>
                 <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                   Loading...
                 </TableCell>
               </TableRow>
            ) : filteredIncidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                  <div className="flex flex-col items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-zinc-400 mb-2" />
                    <p>No incidents found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredIncidents.map((incident) => (
                <TableRow key={incident.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <TableCell className="min-w-[200px]">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">{incident.title}</div>
                    <div className="text-xs text-zinc-500">INC-{incident.id.substring(0, 8)}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(incident.status)}`}>
                      {incident.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getPriorityColor(incident.priority)}`}>
                      {incident.priority.split('_')[1].toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex flex-col gap-1.5">
                      {incident.assignee_id ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <AvatarFallback className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium">
                              {getInitials(incident.assignee?.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{incident.assignee?.full_name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                          <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
                            <User className="h-3 w-3" />
                          </div>
                          <span className="text-sm italic">Unassigned</span>
                        </div>
                      )}
                      
                      {incident.team_id && (
                        <div className="flex items-center gap-1.5 pl-[32px] text-xs text-zinc-500 dark:text-zinc-400">
                          <Users className="h-3 w-3" />
                          <span>{incident.team?.name}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-500 text-sm whitespace-nowrap">
                    {new Date(incident.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-900">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/dashboard/incidents/${incident.id}/update`}>
                            Update / Assign
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/dashboard/incidents/${incident.id}/history`}>
                            View History
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

    </div>
  );
}
