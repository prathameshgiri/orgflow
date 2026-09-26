import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../shared/supabase";
import { useOrganization } from "../hooks/useOrganization";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Activity, FileText, X, MessageSquare, Image as ImageIcon, Send, CheckSquare, Settings2, RefreshCcw, History } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";

export default function TaskHistory() {
  const { id } = useParams<{ id: string }>();
  const { orgId } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [history, setHistory] = useState<any[]>([]);
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [progressText, setProgressText] = useState("");
  const [pastedImages, setPastedImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [teamsMap, setTeamsMap] = useState<Record<string, string>>({});

  const fetchHistory = async () => {
    if (!orgId || !id) return;
    setLoading(true);

    const { data: taskData } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .single();
      
    if (taskData) setTask(taskData);

    const { data, error } = await supabase
      .from("activity_logs")
      .select(`*, user:users!activity_logs_user_id_fkey (full_name)`)
      .eq("resource", `task:${id}`)
      .order("occurred_at", { ascending: false });
      
    if (!error && data) setHistory(data);

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

    setLoading(false);
  };

  const resolveName = (action: string, id: string) => {
    if (!id || id === 'none') return 'Unassigned';
    if (action.includes('team')) return teamsMap[id] || id;
    if (action.includes('assignee') || action === 'reassigned task') return usersMap[id] || id;
    return id.replace('_', ' ');
  };

  useEffect(() => {
    fetchHistory();
  }, [orgId, id]);

  const submitProgress = async () => {
    if ((!progressText.trim() && pastedImages.length === 0) || !orgId || !user || !id) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("activity_logs").insert([{
        organization_id: orgId,
        user_id: user.id,
        action: `progress_update`,
        resource: `task:${id}`,
        details: { explanation: progressText.trim(), images: pastedImages }
      }]);
      if (error) throw error;
      toast({ title: "Progress tracked successfully!" });
      setProgressText("");
      setPastedImages([]);
      fetchHistory();
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
          reader.onload = (ev) => {
            if (ev.target?.result) setPastedImages(prev => [...prev, ev.target!.result as string]);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getActionDetails = (action: string) => {
    if (action === 'progress_update') {
      return { icon: MessageSquare, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/40', border: 'border-blue-200 dark:border-blue-800' };
    }
    if (action === 'reassigned task' || action.includes('assignee')) {
      return { icon: RefreshCcw, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/40', border: 'border-emerald-200 dark:border-emerald-800' };
    }
    if (action.includes('status') || action.includes('priority')) {
      return { icon: Settings2, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/40', border: 'border-amber-200 dark:border-amber-800' };
    }
    return { icon: Activity, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/40', border: 'border-indigo-200 dark:border-indigo-800' };
  };

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-8 pt-4">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
          <Link to="/dashboard/tasks" className="hover:text-blue-600 transition-colors">Tasks</Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] sm:max-w-xs">{task?.title || 'Loading...'}</span>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100">History</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-full h-10 w-10 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 shadow-sm shrink-0">
            <Link to="/dashboard/tasks">
              <ArrowLeft className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </Link>
          </Button>
          <div className="flex items-center gap-4 flex-1">
            <div className="h-14 w-14 rounded-2xl border-2 border-white dark:border-zinc-950 shadow-sm bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 flex items-center justify-center">
              <History className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Task History
              </h1>
              <p className="text-zinc-500 text-sm mt-1 truncate max-w-sm md:max-w-xl">
                {task ? `Audit log for: ${task.title}` : 'Loading task details...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
        {/* Update Progress Card */}
        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden relative mb-8 group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Update Progress</h3>
            </div>
            
            <div className="relative">
              <textarea
                value={progressText}
                onChange={e => setProgressText(e.target.value)}
                onPaste={handlePaste}
                placeholder="Enter your progress update, notes, or explanation here... (You can also paste images directly)"
                className="w-full min-h-[120px] p-4 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all resize-y"
              />
              <div className="absolute bottom-3 right-3 text-zinc-400 pointer-events-none opacity-50 hidden sm:flex items-center gap-1 text-xs">
                <ImageIcon className="h-4 w-4" /> Ctrl+V to paste images
              </div>
            </div>
            
            {pastedImages.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-4">
                {pastedImages.map((img, idx) => (
                  <div key={idx} className="relative group/img rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden w-28 h-28 shadow-sm">
                    <img src={img} alt="pasted" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                      <button onClick={() => setPastedImages(prev => prev.filter((_, i) => i !== idx))} className="text-white hover:text-rose-400 bg-white/10 rounded-full p-2 hover:bg-white/20 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <Button 
                onClick={submitProgress} 
                disabled={submitting || (!progressText.trim() && pastedImages.length === 0)} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-8 rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
              >
                {submitting ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Post Update
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Timeline Card */}
        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Activity Timeline</h2>
                <p className="text-sm font-medium text-zinc-500">Track all updates and progress</p>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">{history.length} Logs</span>
            </div>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-zinc-500 font-medium">Loading history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="h-24 w-24 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-6">
                  <FileText className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-zinc-100">No History Yet</h3>
                <p className="text-zinc-500 max-w-sm">Activities will appear here once progress is made or the task is updated.</p>
              </div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="relative border-l-2 border-zinc-100 dark:border-zinc-800/80 ml-6 sm:ml-8 space-y-10 pb-4"
              >
                {history.map((log) => {
                  const { icon: ActionIcon, color, bg, border } = getActionDetails(log.action);
                  
                  return (
                    <motion.div variants={itemVariants} key={log.id} className="relative pl-10 sm:pl-12">
                      {/* Timeline Node */}
                      <div className="absolute -left-[1.35rem] top-1 h-10 w-10 rounded-full bg-white dark:bg-zinc-950 border-4 border-white dark:border-zinc-950 flex items-center justify-center z-10 shadow-sm">
                        <div className={`h-full w-full rounded-full flex items-center justify-center shadow-sm ${bg} ${color} ${border} border`}>
                          <ActionIcon className="h-4 w-4" />
                        </div>
                      </div>
                      
                      {/* Action Card */}
                      <div className="group bg-white dark:bg-zinc-950 rounded-2xl p-5 sm:p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm">
                              <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs">
                                {getInitials(log.user?.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                                {log.user?.full_name || 'System'}
                              </span>
                              <span className="text-xs text-zinc-500 font-medium capitalize">
                                {log.action.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-100 dark:border-zinc-800">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(log.occurred_at).toLocaleString(undefined, {
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        
                        <div className="text-[15px] text-zinc-600 dark:text-zinc-300 leading-relaxed bg-zinc-50/50 dark:bg-zinc-900/30 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                          {log.action.startsWith('updated task') || log.action === 'reassigned task' ? (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span>Changed <strong className="capitalize">{log.action === 'reassigned task' ? 'assignee' : log.action.replace('updated task ', '')}</strong> from</span>
                                <span className="px-2.5 py-1 rounded-md bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 font-semibold text-sm border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                  {resolveName(log.action, log.details?.old)}
                                </span>
                                <ArrowLeft className="h-4 w-4 rotate-180 text-zinc-400" />
                                <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-bold text-sm border border-blue-200 dark:border-blue-800/50 shadow-sm">
                                  {resolveName(log.action, log.details?.new)}
                                </span>
                              </div>
                            </div>
                          ) : log.action === 'progress_update' ? (
                            <div className="space-y-4">
                              {log.details?.explanation && (
                                <div className="text-zinc-700 dark:text-zinc-300 relative">
                                  <p className="whitespace-pre-wrap">{log.details.explanation}</p>
                                </div>
                              )}
                              {log.details?.images && log.details.images.length > 0 && (
                                <div className="flex flex-wrap gap-4 pt-2">
                                  {log.details.images.map((img: string, idx: number) => (
                                    <div key={idx} className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-zoom-in" onClick={() => setViewingImage(img)}>
                                      <img src={img} alt="attachment" className="w-40 h-32 object-cover" />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span>Performed action: <strong className="text-zinc-800 dark:text-zinc-200">{log.action}</strong></span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Image Modal */}
      {viewingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setViewingImage(null)}>
          <div className="relative max-w-5xl w-full flex justify-center" onClick={e => e.stopPropagation()}>
            <img src={viewingImage} alt="Fullscreen" className="max-h-[85vh] max-w-full rounded-xl shadow-2xl object-contain border-2 border-white/10" />
            <button 
              className="absolute -top-12 right-0 text-white hover:text-rose-400 bg-white/10 rounded-full p-2 hover:bg-white/20 transition-colors"
              onClick={() => setViewingImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
