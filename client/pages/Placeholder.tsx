import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Command, Sparkles } from "lucide-react";

export default function Placeholder() {
  const location = useLocation();
  const label = location.pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "page";
  return <div className="flex min-h-screen items-center justify-center bg-cream px-5 text-center"><div className="max-w-md"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-white shadow-xl shadow-ink/15"><Command size={24} /></div><div className="mt-7 inline-flex items-center gap-2 rounded-full bg-coral/10 px-3 py-1.5 text-xs font-bold capitalize text-coral"><Sparkles size={13} /> Coming next</div><h1 className="mt-5 font-display text-4xl font-bold capitalize tracking-[-.05em]">{label}</h1><p className="mt-4 leading-7 text-ink/55">This OrgTask workspace is ready for the next layer of detail. Continue prompting to build out this area with the same connected experience.</p><Link to="/dashboard" className="mt-8 inline-flex items-center rounded-full bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-coral"><ArrowLeft className="mr-2" size={16} /> Back to overview</Link></div></div>;
}
