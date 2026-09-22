import React from "react";
import { Scale, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";

export default function Rules() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Rules</h1>
          <p className="text-zinc-500">Enforce data integrity and compliance policies.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm col-span-2">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Scale className="h-5 w-5 text-indigo-600" /> Active Policies
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-start gap-4">
              <div className="mt-1">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Mandatory Incident Categorization</h4>
                <p className="text-sm text-zinc-500 mt-1">Prevents agents from closing an incident without selecting a root cause category.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">Validation</span>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-start gap-4">
              <div className="mt-1">
                <ShieldAlert className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">VIP User Segregation</h4>
                <p className="text-sm text-zinc-500 mt-1">Automatically flags any tickets submitted by C-level executives as Priority 2 (High).</p>
              </div>
              <div className="flex gap-2">
                <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">Routing</span>
              </div>
            </div>
            
            <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-start gap-4 opacity-50">
              <div className="mt-1">
                <AlertCircle className="h-5 w-5 text-zinc-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium line-through">Require Asset Tag for Hardware</h4>
                <p className="text-sm text-zinc-500 mt-1">All hardware requests must include a scanned asset tag.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded">Disabled</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-6">
            <h3 className="text-indigo-900 dark:text-indigo-200 font-semibold mb-2">Need a custom rule?</h3>
            <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-4">
              Business rules require administrative access to the database layer for triggers.
            </p>
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
