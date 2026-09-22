import React from "react";
import { ActivitySquare } from "lucide-react";

export default function SLA() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SLA Dashboard</h1>
          <p className="text-zinc-500">Monitor Service Level Agreement compliance across your organization.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
        <ActivitySquare className="h-12 w-12 text-zinc-300 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No active SLAs</h3>
        <p className="text-zinc-500 max-w-sm">Define SLA policies in settings to start tracking compliance metrics.</p>
      </div>
    </div>
  );
}
