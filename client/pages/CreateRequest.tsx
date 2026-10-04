import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, MessageSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10 bg-zinc-50/30 dark:bg-zinc-950/30 min-h-screen pt-4">
      <div className="flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 shrink-0" asChild>
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
            <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
              {/* Basic Info */}
              <div className="flex flex-col w-full space-y-6 bg-card p-6 sm:p-8 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800/50">
                <div className="flex flex-col space-y-1.5 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-bold text-xl text-zinc-800 dark:text-zinc-100 tracking-tight">Basic Information</h3>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm ml-12">Provide a clear and concise summary along with additional details for this request.</p>
                </div>
                
                <div className="w-full space-y-5 text-left pt-1">
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-base font-bold text-zinc-700 dark:text-zinc-300">
                      Request Summary <span className="text-rose-500">*</span>
                    </Label>
                    <Input 
                      id="title" 
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      placeholder="e.g. Need access to GitHub" 
                      required 
                      className="h-14 rounded-xl text-lg font-medium px-5"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="details" className="text-base font-bold text-zinc-700 dark:text-zinc-300">
                      Additional Details
                    </Label>
                    <Textarea
                      id="details" 
                      value={details}
                      onChange={e => setDetails(e.target.value)}
                      placeholder="Why do you need this? Any approvals?"
                      className="min-h-[160px] rounded-xl resize-y p-5 text-base"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 p-6 sm:p-8 bg-zinc-50/50 dark:bg-zinc-900/30 border-t border-zinc-100 dark:border-zinc-800 rounded-3xl mt-8">
                <Button type="button" variant="ghost" asChild className="rounded-xl font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  <Link to="/dashboard/requests">Cancel</Link>
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting || !title.trim()} 
                  className="h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
                >
                  {submitting ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Submit Request
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
