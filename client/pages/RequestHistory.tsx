import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../shared/supabase";
import { useOrganization } from "../hooks/useOrganization";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Activity, FileText, X } from "lucide-react";

export default function RequestHistory() {
  const { id } = useParams<{ id: string }>();
  const { orgId } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  const [history, setHistory] = useState<any[]>([]);
  const [request, setRequest] = useState<any>(null);
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

    const { data: requestData } = await supabase
      .from("service_requests")
      .select("*")
      .eq("id", id)
      .single();
      
    if (requestData) setRequest(requestData);

    const { data, error } = await supabase
      .from("activity_logs")
      .select(`*, user:users!activity_logs_user_id_fkey (full_name)`)
      .eq("resource", `request:${id}`)
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
    if (action.includes('assignee') || action === 'reassigned request') return usersMap[id] || id;
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
        resource: `request:${id}`,
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard/requests">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Request History
          </h1>
          <p className="text-zinc-500">
            {request ? `Audit log for request: ${request.title}` : 'Loading request details...'}
          </p>
        </div>
      </div>

      {/* Update Progress Box */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
        <h3 className="text-lg font-semibold mb-3 tracking-tight">Update Progress</h3>
        <textarea
          value={progressText}
          onChange={e => setProgressText(e.target.value)}
          onPaste={handlePaste}
          placeholder="Enter your progress update, notes, or explanation here... (You can also paste images)"
          className="w-full min-h-[100px] p-4 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y mb-4"
        />
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
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Activity Timeline</h2>
            <p className="text-sm text-zinc-500">All status and assignee changes made to this request.</p>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-12 text-center text-zinc-500 flex flex-col items-center justify-center">
              <Activity className="h-8 w-8 animate-pulse text-zinc-400 mb-4" />
              Loading history...
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 flex flex-col items-center justify-center">
              <FileText className="h-12 w-12 text-zinc-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No history found</h3>
              <p className="text-zinc-500 max-w-sm">There are no recorded activities for this request yet.</p>
            </div>
          ) : (
            <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-4 space-y-8 pb-4">
              {history.map((log, index) => (
                <div key={log.id} className="relative pl-8">
                  {/* Timeline dot */}
                  <div className="absolute -left-[1.35rem] top-1 h-10 w-10 rounded-full bg-white dark:bg-zinc-950 border-4 border-white dark:border-zinc-950 flex items-center justify-center">
                    <div className="h-full w-full rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-sm shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                      {log.user?.full_name?.charAt(0) || '?'}
                    </div>
                  </div>
                  
                  {/* Content card */}
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-4 border border-zinc-100 dark:border-zinc-800/80 shadow-sm transition-all hover:shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                        {log.user?.full_name || 'Unknown User'}
                      </span>
                      <span className="text-xs text-zinc-400 bg-white dark:bg-zinc-950 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-800">
                        {new Date(log.occurred_at).toLocaleString(undefined, {
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    <div className="text-sm text-zinc-600 dark:text-zinc-300">
                      {log.action.startsWith('updated request') || log.action === 'reassigned request' ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span>Changed <strong className="capitalize">{log.action === 'reassigned request' ? 'assignee' : log.action.replace('updated request ', '')}</strong> from</span>
                            <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-xs capitalize">
                              {resolveName(log.action, log.details.old)}
                            </span>
                            <span>to</span>
                            <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium text-xs border border-indigo-200 dark:border-indigo-800/50 capitalize">
                              {resolveName(log.action, log.details.new)}
                            </span>
                          </div>
                          {log.details.reason && (
                            <div className="bg-white dark:bg-zinc-950 p-3 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 italic shadow-sm relative">
                              <div className="absolute top-3 left-3 text-zinc-300 dark:text-zinc-700 text-xl leading-none font-serif">"</div>
                              <p className="pl-6 text-sm whitespace-pre-wrap">{log.details.reason}</p>
                            </div>
                          )}
                        </div>
                      ) : log.action === 'progress_update' ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                             <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium text-xs border border-blue-200 dark:border-blue-800/50">Progress Update</span>
                          </div>
                          {log.details.explanation && (
                            <div className="bg-white dark:bg-zinc-950 p-3 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 italic shadow-sm relative">
                              <p className="text-sm whitespace-pre-wrap">{log.details.explanation}</p>
                            </div>
                          )}
                          {log.details.images && log.details.images.length > 0 && (
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
                        </div>
                      ) : (
                        <span>Performed action: <strong className="text-zinc-800 dark:text-zinc-200">{log.action}</strong></span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {viewingImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setViewingImage(null)}
        >
          <div className="max-w-5xl max-h-screen p-4 relative" onClick={e => e.stopPropagation()}>
            <img src={viewingImage} alt="Fullscreen preview" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
            <button 
              className="absolute top-6 right-6 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              onClick={() => setViewingImage(null)}
            >
              <FileText className="w-6 h-6 hidden" />
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
