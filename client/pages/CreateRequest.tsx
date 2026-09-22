import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrganization } from "../hooks/useOrganization";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../shared/supabase";

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
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard/requests">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Submit Service Request</h1>
          <p className="text-zinc-500">Need something? Let IT know.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="font-semibold text-zinc-900 dark:text-zinc-100">Request Summary</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="e.g. Need access to GitHub" 
                required 
                className="h-11 rounded-lg"
              />
            </div>
            
            <div className="grid gap-2 mt-4">
              <Label htmlFor="details" className="font-semibold text-zinc-900 dark:text-zinc-100">Additional Details</Label>
              <textarea 
                id="details" 
                value={details}
                onChange={e => setDetails(e.target.value)}
                className="flex min-h-[150px] w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all resize-y"
                placeholder="Why do you need this? Any approvals?"
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button 
              type="submit" 
              disabled={submitting || !title.trim()} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 px-8 rounded-full h-11"
            >
              {submitting ? "Submitting..." : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
