import React, { useState } from "react";
import { Megaphone, ArrowLeft } from "lucide-react";
import { useOrganization } from "../hooks/useOrganization";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../../shared/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function CreateOrgUpdate() {
  const { orgId } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("low");
  const [submitting, setSubmitting] = useState(false);

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    const { error } = await supabase.from("org_updates").insert({
      organization_id: orgId,
      author_id: user?.id,
      title,
      content,
      priority
    });

    setSubmitting(false);

    if (error) {
      toast({ title: "Error posting update", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Update Posted", description: "Your organization update is now live." });
      navigate("/dashboard/updates");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-3xl mx-auto pb-20">
      
      {/* Header Area */}
      <div className="flex flex-col border-b border-zinc-200 dark:border-zinc-800 pb-6 pt-4">
        <div className="mb-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard/updates")}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Updates
          </Button>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
          <Megaphone className="h-8 w-8 text-indigo-600" />
          Broadcast New Update
        </h1>
        <p className="text-zinc-500 mt-2 text-lg">Create a new announcement for everyone in the organization.</p>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handlePostUpdate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Headline</label>
            <Input 
              placeholder="e.g. Server Maintenance this Weekend" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="h-12 text-lg"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Message</label>
            <Textarea 
              placeholder="Provide details about the update..." 
              value={content} 
              onChange={e => setContent(e.target.value)}
              className="min-h-[200px] resize-y text-base p-4"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Priority Level</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['low', 'medium', 'high'].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-3 px-4 text-sm font-bold uppercase rounded-xl border transition-all ${
                    priority === p 
                      ? p === 'high' ? 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900/50 dark:text-red-400' 
                      : p === 'medium' ? 'bg-orange-100 border-orange-500 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400'
                      : 'bg-indigo-100 border-indigo-500 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100 dark:bg-zinc-900 dark:border-zinc-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          
          <div className="pt-6 mt-6 flex justify-end gap-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="button" variant="outline" className="px-6" onClick={() => navigate("/dashboard/updates")}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !title || !content} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">
              {submitting ? "Broadcasting..." : "Publish Update"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
