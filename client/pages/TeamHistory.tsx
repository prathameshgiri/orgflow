import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useOrganization } from "../hooks/useOrganization";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Activity, FileText } from "lucide-react";

export default function TeamHistory() {
  const { id } = useParams<{ id: string }>();
  const { orgId } = useOrganization();
  const { session } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!orgId || !id || !session?.access_token) return;
      setLoading(true);

      try {
        const res = await fetch(`/api/teams/${id}/history`, {
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "x-org-id": orgId
          }
        });
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (error) {
        console.error("Failed to load history", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [orgId, id, session]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard/teams">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Team History
          </h1>
          <p className="text-zinc-500">
            Audit log and activity timeline for this team.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Activity Timeline</h2>
            <p className="text-sm text-zinc-500">All changes and updates made to this team.</p>
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
              <p className="text-zinc-500 max-w-sm">There are no recorded activities for this team yet.</p>
            </div>
          ) : (
            <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-4 space-y-8 pb-4">
              {history.map((log) => (
                <div key={log.id} className="relative pl-8">
                  {/* Timeline dot */}
                  <div className="absolute -left-[1.35rem] top-1 h-10 w-10 rounded-full bg-white dark:bg-zinc-950 border-4 border-white dark:border-zinc-950 flex items-center justify-center">
                    <div className="h-full w-full rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-sm shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
                      {log.users?.full_name?.charAt(0) || 'S'}
                    </div>
                  </div>
                  
                  {/* Content card */}
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-4 border border-zinc-100 dark:border-zinc-800/80 shadow-sm transition-all hover:shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                        {log.users?.full_name || 'System / Unknown User'}
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
                      {log.action === 'created' ? (
                        <span>Created team <strong>{log.details.name}</strong></span>
                      ) : log.action === 'member_added' ? (
                        <span>Added <strong>{log.details.target_user_name || "a user"}</strong> to the team</span>
                      ) : log.action === 'member_removed' ? (
                        <span>Removed <strong>{log.details.target_user_name || "a user"}</strong> from the team</span>
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
    </div>
  );
}
