import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrganization } from "../hooks/useOrganization";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../shared/supabase";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

export default function CreateRequest() {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { orgId } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !user) return;
    
    setSubmitting(true);
    const { error } = await supabase.from("service_requests").insert([
      {
        organization_id: orgId,
        title,
        details,
        requester_id: user.id,
      }
    ]);

    setSubmitting(false);

    if (error) {
      console.error(error);
      toast({ title: "Failed to submit request", variant: "destructive" });
    } else {
      toast({ title: "Request submitted successfully" });
      navigate("/dashboard/requests");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen pt-4">
      <div className="flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <Button variant="outline" size="icon" className="rounded-full h-10 w-10 shrink-0" asChild>
          <Link to="/dashboard/requests">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
            Submit Service Request
          </h1>
          <p className="text-zinc-500 mt-1">Need something? Let IT know.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card className="rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-8 space-y-8">
              <div className="grid gap-2">
                <Label htmlFor="title" className="font-bold text-zinc-900 dark:text-zinc-100 text-base flex items-center gap-2">
                  Request Summary
                </Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="e.g. Need access to GitHub" 
                  required 
                  className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-indigo-500"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="details" className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                  Additional Details
                </Label>
                <textarea 
                  id="details" 
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  className="flex min-h-[200px] w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all resize-y"
                  placeholder="Why do you need this? Any approvals?"
                />
              </div>
            </div>
            
            <div className="p-6 bg-zinc-50/50 dark:bg-zinc-900/30 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <Button 
                type="submit" 
                disabled={submitting || !title.trim()} 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 px-8 rounded-xl h-12 font-bold"
              >
                {submitting ? "Submitting..." : (
                  <>
                    <Send className="mr-2 h-5 w-5" /> Submit Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
