import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, History, Edit, UserPlus, Users, AlertTriangle, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useOrganization } from "../hooks/useOrganization";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../shared/supabase";

export default function IncidentHistory() {
  const { id } = useParams();
  const [incident, setIncident] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressText, setProgressText] = useState("");
  const [pastedImages, setPastedImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [teamsMap, setTeamsMap] = useState<Record<string, string>>({});

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'closed': return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'p1_critical': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'p2_high': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
      case 'p3_medium': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      case 'p4_low': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const { orgId } = useOrganization();
  const { session } = useAuth();
  const { toast } = useToast();

  const fetchHistory = async () => {
    if (!orgId || !session || !id) return;
    
    try {
      // Fetch incident summary
      const { data: incData, error: incError } = await supabase
          .from("incidents")
          .select("*")
          .eq("id", id)
          .single();
          
      if (!incError && incData) {
        setIncident(incData);
      }

      const res = await fetch(`/api/incidents/${id}/history`, {
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "x-org-id": orgId
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }

      // Fetch users and teams for resolving UUIDs to names
      const { data: usersData } = await supabase.from('users').select('id, full_name').eq('organization_id', orgId);
      if (usersData) {
        const uMap: Record<string, string> = {};
        usersData.forEach(u => { uMap[u.id] = u.full_name || 'Unknown User'; });
        setUsersMap(uMap);
      }
      const { data: teamsData } = await supabase.from('teams').select('id, name').eq('organization_id', orgId);
      if (teamsData) {
        const tMap: Record<string, string> = {};
        teamsData.forEach(t => { tMap[t.id] = t.name; });
        setTeamsMap(tMap);
      }
    } catch (err) {
      toast({ title: "Failed to load history", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [id, orgId, session]);

  const submitProgress = async () => {
    if ((!progressText.trim() && pastedImages.length === 0) || !orgId || !session || !id) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/incidents/${id}/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "x-org-id": orgId
        },
        body: JSON.stringify({ explanation: progressText, images: pastedImages })
      });
      if (res.ok) {
        toast({ title: "Progress tracked successfully!" });
        setProgressText("");
        setPastedImages([]);
        fetchHistory();
      } else {
        const data = await res.json();
        toast({ title: "Failed to track progress", description: data.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setPastedImages(prev => [...prev, event.target!.result as string]);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const removeImage = (index: number) => {
    setPastedImages(prev => prev.filter((_, i) => i !== index));
  };

  const resolveName = (type: string, id: string) => {
    if (!id || id === 'none') return 'Unassigned';
    if (type === 'team_id') return teamsMap[id] || id;
    if (type === 'assignee_id') return usersMap[id] || id;
    return id.replace('_', ' ');
  };

  const renderChanges = (changes: any) => {
      if (!changes) return null;
      return (
          <div className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              {changes.status && changes.status.from !== changes.status.to && (
                  <div>Status changed: <strong className="capitalize">{resolveName('status', changes.status.from)}</strong> ➔ <strong className="capitalize">{resolveName('status', changes.status.to)}</strong></div>
              )}
              {changes.priority && changes.priority.from !== changes.priority.to && (
                  <div>Priority changed: <strong className="capitalize">{resolveName('priority', changes.priority.from)}</strong> ➔ <strong className="capitalize">{resolveName('priority', changes.priority.to)}</strong></div>
              )}
              {changes.team_id && changes.team_id.from !== changes.team_id.to && (
                  <div>Team changed: <strong>{resolveName('team_id', changes.team_id.from)}</strong> ➔ <strong>{resolveName('team_id', changes.team_id.to)}</strong></div>
              )}
              {changes.assignee_id && changes.assignee_id.from !== changes.assignee_id.to && (
                  <div>Assignee changed: <strong>{resolveName('assignee_id', changes.assignee_id.from)}</strong> ➔ <strong>{resolveName('assignee_id', changes.assignee_id.to)}</strong></div>
              )}
          </div>
      );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard/incidents">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ticket History</h1>
          <p className="text-zinc-500">
            {incident ? incident.title : `INC-${id?.substring(0, 8)}`}
          </p>
        </div>
      </div>

      {/* Update Progress Box */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
        <h3 className="text-lg font-semibold mb-3 tracking-tight">Update Progress</h3>
        <div className="relative">
          <textarea 
            value={progressText}
            onChange={e => setProgressText(e.target.value)}
            onPaste={handlePaste}
            placeholder="Enter your progress update, notes, or explanation here... (You can also paste images)"
            className="w-full min-h-[100px] p-4 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y mb-4"
          />
        </div>
        {pastedImages.length > 0 && (
          <div className="flex flex-wrap gap-4 mb-4">
            {pastedImages.map((img, idx) => (
              <div key={idx} className="relative group rounded-md border border-zinc-200 overflow-hidden w-24 h-24">
                <img src={img} alt="pasted" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => setPastedImages(prev => prev.filter((_, i) => i !== idx))} className="text-white hover:text-red-400">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end">
          <Button onClick={submitProgress} disabled={submitting || (!progressText.trim() && pastedImages.length === 0)} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 shadow-md shadow-blue-500/20 rounded-full transition-all">
            {submitting ? "Updating..." : "Update Progress"}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-zinc-500">Loading history...</div>
        ) : (
          <div>
            {history.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-zinc-500">
                <History className="h-10 w-10 mb-3 text-zinc-300" />
                <p>No activity logged yet.</p>
              </div>
            ) : (
              <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-4 space-y-8 pb-4">
                {history.map((log, index) => (
                  <div key={log.id} className="relative pl-8">
                    <div className="absolute -left-[17px] top-1 h-8 w-8 rounded-full bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-sm">
                      {log.action === 'update_incident' ? (
                        <Edit className="h-3.5 w-3.5 text-blue-500" />
                      ) : log.action === 'progress_update' ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                      ) : (
                        <History className="h-3.5 w-3.5 text-zinc-400" />
                      )}
                    </div>
                
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-4 border border-zinc-100 dark:border-zinc-800/50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={log.user?.avatar_url} />
                            <AvatarFallback className="text-[10px]">{getInitials(log.user?.full_name)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                            {log.user?.full_name || 'System User'}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-500">
                          {format(new Date(log.occurred_at), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                      
                      <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                        {log.details?.explanation && (
                          <div><span className="font-semibold text-zinc-900 dark:text-zinc-100">Explanation:</span> {log.details.explanation}</div>
                        )}
                        {log.details?.images && log.details.images.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-4">
                            {log.details.images.map((img: string, idx: number) => (
                              <img 
                                key={idx} 
                                src={img} 
                                alt="attachment" 
                                className="max-w-xs rounded-md border border-zinc-200 dark:border-zinc-700 shadow-sm cursor-pointer hover:opacity-90 transition-opacity" 
                                onClick={() => setViewingImage(img)}
                              />
                            ))}
                          </div>
                        )}
                        {!log.details?.explanation && (!log.details?.images || log.details.images.length === 0) && (
                          <div><span className="font-semibold text-zinc-900 dark:text-zinc-100">Explanation:</span> No explanation provided</div>
                        )}
                      </div>
                      
                      {renderChanges(log.details?.changes)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>


      {viewingImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setViewingImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button 
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              onClick={(e) => { e.stopPropagation(); setViewingImage(null); }}
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={viewingImage} 
              alt="Fullscreen attachment" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
