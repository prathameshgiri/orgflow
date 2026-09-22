import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[100px] w-full rounded-lg border border-slate-200/80 bg-white px-5 py-4 text-sm text-slate-900 shadow-none transition-all duration-300 placeholder:text-slate-400 hover:border-slate-300 focus-visible:outline-none focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-zinc-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-700 dark:focus-visible:border-indigo-500 dark:focus-visible:ring-indigo-500/20",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
