import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, History, Edit, UserPlus, Users, AlertTriangle, X, Image as ImageIcon, Send, Clock, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, formatDistanceToNow } from "date-fns";
import { useOrganization } from "../hooks/useOrganization";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../shared/supabase";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function IncidentHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
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
      case 'new': return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
      case 'in_progress': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      case 'resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
      case 'closed': return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'p1_critical': return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800';
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
          <div className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
              {changes.status && changes.status.from !== changes.status.to && (
                  <div className="flex items-center gap-2">
                     <span className="text-zinc-400">&bull;</span>
                     Status changed: <Badge variant="outline" className="capitalize border-zinc-200">{resolveName('status', changes.status.from)}</Badge> ➔ <Badge variant="secondary" className="capitalize bg-indigo-100 text-indigo-700">{resolveName('status', changes.status.to)}</Badge>
                  </div>
              )}
              {changes.priority && changes.priority.from !== changes.priority.to && (
                  <div className="flex items-center gap-2">
                     <span className="text-zinc-400">&bull;</span>
                     Priority changed: <Badge variant="outline" className="capitalize border-zinc-200">{resolveName('priority', changes.priority.from)}</Badge> ➔ <Badge variant="secondary" className="capitalize bg-amber-100 text-amber-700">{resolveName('priority', changes.priority.to)}</Badge>
                  </div>
              )}
              {changes.team_id && changes.team_id.from !== changes.team_id.to && (
                  <div className="flex items-center gap-2">
                     <span className="text-zinc-400">&bull;</span>
                     Team changed: <strong>{resolveName('team_id', changes.team_id.from)}</strong> ➔ <strong>{resolveName('team_id', changes.team_id.to)}</strong>
                  </div>
              )}
              {changes.assignee_id && changes.assignee_id.from !== changes.assignee_id.to && (
                  <div className="flex items-center gap-2">
                     <span className="text-zinc-400">&bull;</span>
                     Assignee changed: <strong>{resolveName('assignee_id', changes.assignee_id.from)}</strong> ➔ <strong>{resolveName('assignee_id', changes.assignee_id.to)}</strong>
                  </div>
              )}
          </div>
      );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-8 pt-4">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
          <button onClick={() => navigate(-1)} className="hover:text-indigo-600 transition-colors">Tickets</button>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100">History</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-full h-10 w-10 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 shadow-sm shrink-0">

              <ArrowLeft className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />

          </Button>
          <div className="flex items-center gap-4 flex-1">
            <div className="h-14 w-14 rounded-2xl border-2 border-white dark:border-zinc-950 shadow-sm bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 flex items-center justify-center">
              <History className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Ticket History
              </h1>
              <p className="text-zinc-500 text-sm mt-1 flex items-center gap-2">
                <Ticket className="h-3.5 w-3.5" />
                {incident ? incident.title.replace('[SCTASK] ', '') : `INC-${id?.substring(0, 8)}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Progress Input Section */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
          <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            
            <div className="p-6">
              <h3 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2">
                <Edit className="h-5 w-5 text-indigo-500" /> Add Progress Update
              </h3>
              
              <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all shadow-inner">
                <textarea
                  value={progressText}
                  onChange={(e) => setProgressText(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="Enter your progress update, notes, or explanation here... (You can also paste images)"
                  className="w-full min-h-[120px] p-4 bg-transparent outline-none resize-y text-sm dark:text-zinc-100 placeholder:text-zinc-400"
                />
                
                {/* Pasted Images Preview */}
                {pastedImages.length > 0 && (
                  <div className="px-4 pb-4 flex flex-wrap gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-4 bg-white dark:bg-zinc-950">
                    {pastedImages.map((src, idx) => (
                      <div key={idx} className="relative group rounded-xl border border-zinc-200 dark:border-zinc-800 p-1 shadow-sm overflow-hidden bg-zinc-50 dark:bg-zinc-900">
                        <img src={src} alt="Pasted" className="h-16 w-16 object-cover rounded-lg" />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-4">
                <Button 
                  onClick={submitProgress} 
                  disabled={submitting || (!progressText.trim() && pastedImages.length === 0)}
                  className="h-11 px-6 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98]"
                >
                  {submitting ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Update Progress
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* History Timeline */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <h3 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <History className="h-5 w-5 text-indigo-500" /> Timeline
          </h3>
          
          {loading ? (
            <div className="py-20 text-center text-zinc-500 flex flex-col items-center">
              <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              Loading activity history...
            </div>
          ) : history.length === 0 ? (
            <Card className="py-20 text-center text-zinc-500 rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 flex flex-col items-center">
              <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                <History className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">No activity logged yet</h3>
              <p className="text-sm mt-1 max-w-sm">Updates and changes will appear here chronologically.</p>
            </Card>
          ) : (
            <div className="relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-4 space-y-8 pb-8">
              {history.map((log, index) => {
                const actionIcons: any = {
                  'status_changed': <AlertTriangle className="h-4 w-4 text-amber-500" />,
                  'assigned': <UserPlus className="h-4 w-4 text-blue-500" />,
                  'team_assigned': <Users className="h-4 w-4 text-purple-500" />,
                  'progress_updated': <Edit className="h-4 w-4 text-indigo-500" />,
                  'created': <Ticket className="h-4 w-4 text-emerald-500" />
                };
                
                const actionIcon = actionIcons[log.action] || <History className="h-4 w-4 text-zinc-500" />;

                return (
                  <div key={log.id} className="relative pl-8 animate-in slide-in-from-left-4 fade-in duration-500" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}>
                    <div className="absolute -left-[17px] top-1 h-8 w-8 rounded-full bg-white dark:bg-zinc-950 border-4 border-zinc-50 dark:border-zinc-900 shadow-sm flex items-center justify-center ring-1 ring-zinc-200 dark:ring-zinc-800">
                      {actionIcon}
                    </div>
                    
                    <Card className="p-5 rounded-2xl border-zinc-200/80 dark:border-zinc-800/80 shadow-sm bg-white dark:bg-zinc-950 hover:shadow-md transition-shadow relative group">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 capitalize">
                              {(log?.action || 'Unknown').replace('_', ' ')}
                            </span>
                            <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
                            <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {log?.created_at ? formatDistanceToNow(new Date(log.created_at), { addSuffix: true }) : 'Unknown time'}
                            </span>
                          </div>
                          
                          {/* Log Explanation */}
                          {log.details?.explanation && (
                            <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 whitespace-pre-wrap break-words shadow-inner">
                              {log.details.explanation}
                            </div>
                          )}
                          
                          {/* Log Changes rendering */}
                          {log.details?.changes && renderChanges(log.details.changes)}

                          {/* Render Images if any */}
                          {log.details?.images && log.details.images.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-3">
                              {log.details.images.map((img: string, i: number) => (
                                <div key={i} className="relative group/img cursor-pointer" onClick={() => setViewingImage(img)}>
                                  <img src={img} alt="Update" className="h-24 w-24 object-cover rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm group-hover/img:shadow-md transition-all group-hover/img:scale-105" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                    <ImageIcon className="h-6 w-6 text-white" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 sm:flex-col sm:items-end shrink-0">
                          <Avatar className="h-8 w-8 border-2 border-white dark:border-zinc-900 shadow-sm">
                            <AvatarFallback className="text-[10px] bg-zinc-100 text-zinc-600 font-bold">{getInitials(usersMap[log?.actor_id] || '')}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-zinc-500">{usersMap[log?.actor_id] || "System"}</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setViewingImage(null)}
        >
          <div className="relative max-w-5xl max-h-screen">
            <button 
              className="absolute -top-12 right-0 text-white hover:text-zinc-300 transition-colors bg-black/50 hover:bg-black/80 p-2 rounded-full"
              onClick={() => setViewingImage(null)}
            >
              <X className="h-6 w-6" />
            </button>
            <img src={viewingImage} alt="Full view" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
          </div>
        </div>
      )}
    </div>
  );
}
