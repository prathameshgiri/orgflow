import React, { useEffect, useState } from "react";
import { Megaphone, AlertCircle, Plus, Clock, Trash2, ShieldAlert, Sparkles, Pin, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { useOrganization } from "../hooks/useOrganization";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../../shared/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function OrgUpdates() {
  const { orgId } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [canPost, setCanPost] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`read_updates_${user.id}`);
      if (stored) setReadIds(JSON.parse(stored));
    }
  }, [user]);

  useEffect(() => {
    if (!orgId || !user) return;
    fetchUpdates();
    checkPermissions();

    const channel = supabase
      .channel('public:org_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'org_updates', filter: `organization_id=eq.${orgId}` }, () => {
        fetchUpdates();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orgId, user]);

  const checkPermissions = async () => {
    // Check if user is something other than Member or Readonly
    const { data, error } = await supabase
      .from('users')
      .select('roles(name)')
      .eq('id', user?.id)
      .single();

    if (data && data.roles) {
      const roleName = (data.roles as any).name.toLowerCase();
      const hasPrivilegedRole = !['member', 'readonly', 'read-only', 'end-user'].includes(roleName);
      setCanPost(hasPrivilegedRole);
    } else {
      // If no roles, assume they can't post
      setCanPost(false);
    }
  };

  const fetchUpdates = async () => {
    const { data, error } = await supabase
      .from("org_updates")
      .select(`
        id, title, content, priority, created_at,
        author:users!author_id(full_name, email)
      `)
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    if (data) {
      setUpdates(data);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("org_updates").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "The update was removed." });
    }
  };

  const markAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newReadIds = [...readIds, id];
    setReadIds(newReadIds);
    if (user) {
      localStorage.setItem(`read_updates_${user.id}`, JSON.stringify(newReadIds));
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const newUpdates = updates.filter(u => !readIds.includes(u.id));
  const recentUpdates = updates.filter(u => readIds.includes(u.id));

  const priorityColors = {
    high: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400",
    medium: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/50 text-orange-700 dark:text-orange-400",
    low: "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
  };

  const priorityBadges = {
    high: <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 uppercase tracking-wider"><AlertCircle size={10} /> Critical</span>,
    medium: <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400 uppercase tracking-wider"><AlertCircle size={10} /> Important</span>,
    low: <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 uppercase tracking-wider"><Pin size={10} /> Notice</span>
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-4xl mx-auto pb-20">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6 pt-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
            <Megaphone className="h-8 w-8 text-indigo-600" />
            Org Updates
          </h1>
          <p className="text-zinc-500 mt-2 text-lg">Stay informed with the latest announcements and platform updates.</p>
        </div>
        
        {canPost && (
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md px-6"
            onClick={() => navigate("/dashboard/updates/create")}
          >
            <Plus className="mr-2 h-4 w-4" /> Post Update
          </Button>
        )}
      </div>

      {/* Feed Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-zinc-500 font-medium">Loading feed...</p>
        </div>
      ) : updates.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/20">
          <div className="h-16 w-16 bg-white dark:bg-zinc-900 rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 border border-zinc-100 dark:border-zinc-800">
            <Sparkles className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">No updates yet</h3>
          <p className="text-zinc-500 max-w-sm mx-auto mt-2">When admins post important announcements or platform updates, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* New Updates Section */}
          {newUpdates.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                New Updates
                <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 text-xs px-2 py-0.5 rounded-full font-bold">
                  {newUpdates.length}
                </span>
              </h2>
              <div className="space-y-4">
                <AnimatePresence>
                  {newUpdates.map((update, idx) => (
                    <motion.div 
                      key={update.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`rounded-2xl border shadow-sm cursor-pointer transition-all hover:shadow-md ${priorityColors[update.priority as keyof typeof priorityColors]}`}
                      onClick={() => toggleExpand(update.id)}
                    >
                      <div className="p-5 sm:p-6">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              {priorityBadges[update.priority as keyof typeof priorityBadges]}
                              <span className="text-xs font-medium text-zinc-500 flex items-center gap-1">
                                <Clock size={12} /> {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            
                            <h3 className="text-xl font-bold mb-2 pr-12">{update.title}</h3>
                            
                            <div className={`text-sm leading-relaxed opacity-90 transition-all duration-300 overflow-hidden ${expandedIds.includes(update.id) ? 'max-h-[1000px] opacity-100' : 'max-h-11 opacity-80'}`}>
                              <p className="whitespace-pre-wrap">{update.content}</p>
                            </div>
                            
                            {!expandedIds.includes(update.id) && update.content.length > 100 && (
                              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-2 flex items-center gap-1">
                                Read more <ChevronDown size={14} />
                              </p>
                            )}
                            {expandedIds.includes(update.id) && (
                              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-4 flex items-center gap-1">
                                Show less <ChevronUp size={14} />
                              </p>
                            )}
                            
                            <div className="mt-6 flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-[10px] font-bold uppercase">
                                {update.author?.full_name?.charAt(0) || "A"}
                              </div>
                              <span className="text-xs font-medium opacity-75">Posted by {update.author?.full_name || "Admin"}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2 items-end shrink-0">
                            <Button 
                              size="sm"
                              className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl shadow-sm"
                              onClick={(e) => markAsRead(update.id, e)}
                            >
                              <CheckCircle2 className="mr-1.5 h-4 w-4 text-green-500" />
                              Mark as Read
                            </Button>
                            
                            {canPost && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDelete(update.id); }}
                                className="h-8 w-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors mt-2"
                                title="Delete Update"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Recent Updates Section */}
          {recentUpdates.length > 0 && (
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden mt-8">
              <div className="p-5 sm:p-6 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-zinc-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Previously Read</h2>
                    <p className="text-sm text-zinc-500">Archived and read organization updates</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="hidden sm:flex rounded-full text-xs font-semibold px-4">
                  View All History
                </Button>
              </div>
              
              <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-6">
                <AnimatePresence>
                  {recentUpdates.map((update, idx) => (
                    <div 
                      key={update.id}
                      className={`group cursor-pointer ${idx !== recentUpdates.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800/50 pb-6' : ''}`}
                      onClick={() => toggleExpand(update.id)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                           <span className="bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                             UPDATE
                           </span>
                           <h3 className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors">{update.title}</h3>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                           <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                             update.priority === 'high' ? 'border-red-200 text-red-600 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30' : 
                             update.priority === 'medium' ? 'border-orange-200 text-orange-600 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-950/30' : 
                             'border-zinc-200 text-zinc-600 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900'
                           }`}>
                             {update.priority}
                           </span>
                           <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-zinc-200 text-zinc-500 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                             READ
                           </span>
                        </div>
                      </div>
                      
                      <div className={`text-sm text-zinc-500 dark:text-zinc-400 mb-4 transition-all duration-300 overflow-hidden ${expandedIds.includes(update.id) ? 'max-h-[1000px]' : 'max-h-10 line-clamp-2'}`}>
                        <p className="whitespace-pre-wrap">{update.content}</p>
                      </div>

                      <div className="flex items-center flex-wrap gap-4 text-xs font-medium text-zinc-500">
                         <div className="flex items-center gap-1.5">
                            <div className="h-5 w-5 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[9px] font-bold text-zinc-700 dark:text-zinc-300">
                               {update.author?.full_name?.charAt(0) || "A"}
                            </div>
                            <span>{update.author?.full_name || "Admin"}</span>
                         </div>
                         <div className="h-3 w-px bg-zinc-300 dark:bg-zinc-700"></div>
                         <div className="flex items-center gap-1.5">
                            <Clock size={12} />
                            <span>{formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}</span>
                         </div>
                         
                         {canPost && expandedIds.includes(update.id) && (
                           <>
                             <div className="h-3 w-px bg-zinc-300 dark:bg-zinc-700"></div>
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleDelete(update.id); }}
                                className="text-red-500 hover:text-red-700 hover:underline flex items-center gap-1"
                             >
                                <Trash2 size={12} /> Delete
                             </button>
                           </>
                         )}
                      </div>
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
