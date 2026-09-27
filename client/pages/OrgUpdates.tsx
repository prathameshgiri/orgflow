import React, { useEffect, useState } from "react";
import { Megaphone, AlertCircle, Plus, Clock, Trash2, ShieldAlert, Sparkles, Pin } from "lucide-react";
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
        <div className="space-y-6">
          <AnimatePresence>
            {updates.map((update, idx) => (
              <motion.div 
                key={update.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className={`p-6 rounded-2xl border shadow-sm ${priorityColors[update.priority as keyof typeof priorityColors]}`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {priorityBadges[update.priority as keyof typeof priorityBadges]}
                      <span className="text-xs font-medium text-zinc-500 flex items-center gap-1">
                        <Clock size={12} /> {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">{update.title}</h3>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed opacity-90">{update.content}</p>
                    
                    <div className="mt-6 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-[10px] font-bold uppercase">
                        {update.author?.full_name?.charAt(0) || "A"}
                      </div>
                      <span className="text-xs font-medium opacity-75">Posted by {update.author?.full_name || "Admin"}</span>
                    </div>
                  </div>
                  
                  {canPost && (
                    <button 
                      onClick={() => handleDelete(update.id)}
                      className="h-8 w-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      title="Delete Update"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
