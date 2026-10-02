import { Link } from "react-router-dom";
import { motion, Variants, useInView } from "framer-motion";
import {
  ArrowRight, Check, ChevronDown, Command, Globe2, Layers3, LockKeyhole, Play, 
  ShieldCheck, Sparkles, UsersRound, Zap, BarChart3, Clock, Bell, Workflow, 
  FileText, HeartHandshake, ArrowUpRight, ArrowDownRight, Shield, Server, Star, Quote,
  LayoutDashboard, Briefcase, CheckSquare, LifeBuoy, AlertTriangle, FilePlus, 
  CheckCircle2, Book, Activity, Users, Megaphone, Settings, User, X, MessageSquare,
  Database, Search, Cpu, TrendingUp, Award, Globe
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FeatureSection, productFeatures } from "./Features";

/* ─── Animation Variants ─── */
const reveal: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};
const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};
const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

/* ─── Animated Counter Hook ─── */
function useCounter(target: number, duration = 2000, shouldStart = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!shouldStart) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, shouldStart]);
  return count;
}

/* ─── Data ─── */
const features = [
  { icon: Globe2, title: "Organization management", text: "Keep every workspace, brand, and client account organized in one calm, connected home.", color: "bg-coral/10 text-coral" },
  { icon: UsersRound, title: "People & teams", text: "Invite collaborators, shape teams, and give everyone the context they need to move fast.", color: "bg-blue-100 text-blue-600" },
  { icon: ShieldCheck, title: "Roles & permissions", text: "Create fine-grained access rules that make security feel simple, not restrictive.", color: "bg-emerald-100 text-emerald-600" },
  { icon: Layers3, title: "Client management", text: "Build stronger client relationships with shared visibility and a single source of truth.", color: "bg-amber-100 text-amber-600" },
];

const itsmModules = [
  { icon: Bell, title: "Incident Management", desc: "Detect, escalate, and resolve incidents faster with automated workflows and real-time alerts.", color: "from-red-500 to-rose-600", glow: "rgba(239,68,68,0.15)" },
  { icon: FileText, title: "Service Requests", desc: "Empower employees with a self-service portal for IT requests, approvals, and tracking.", color: "from-blue-500 to-indigo-600", glow: "rgba(59,130,246,0.15)" },
  { icon: Workflow, title: "Change Management", desc: "Plan, approve, and execute changes with built-in risk assessment and rollback capabilities.", color: "from-violet-500 to-purple-600", glow: "rgba(139,92,246,0.15)" },
  { icon: BarChart3, title: "Asset Tracking", desc: "Complete lifecycle management for all hardware, software, and cloud assets in your org.", color: "from-emerald-500 to-teal-600", glow: "rgba(16,185,129,0.15)" },
  { icon: HeartHandshake, title: "Problem Management", desc: "Identify root causes, link related incidents, and eliminate recurring issues permanently.", color: "from-amber-500 to-orange-600", glow: "rgba(245,158,11,0.15)" },
  { icon: Clock, title: "SLA Management", desc: "Define, track, and enforce service level agreements with automated breach notifications.", color: "from-cyan-500 to-sky-600", glow: "rgba(6,182,212,0.15)" },
];

const testimonials = [
  { name: "Priya Sharma", role: "CTO, Finvesta", quote: "ORG MAN transformed how we manage access across 12 subsidiaries. What used to take days now takes minutes.", avatar: "from-violet-400 to-indigo-500" },
  { name: "James Chen", role: "VP Engineering, CloudScale", quote: "The permissions matrix alone saved our compliance team 20+ hours per week. Absolute game-changer.", avatar: "from-emerald-400 to-teal-500" },
  { name: "Maria Rodriguez", role: "IT Director, NovaTech", quote: "Finally, an ITSM tool that doesn't feel like it was built in 2005. Beautiful, fast, and incredibly intuitive.", avatar: "from-[#00e5ff] to-blue-500" },
];


const faqData = [
  { q: "What is an organization in ORG MAN?", a: "An organization is a top-level container that holds all your teams, members, roles, and configurations. You can manage multiple organizations from a single account." },
  { q: "Can I manage multiple organizations?", a: "Absolutely! ORG MAN is built for multi-org management. Switch between organizations seamlessly, each with their own settings, roles, and data isolation." },
  { q: "How granular are permissions?", a: "Extremely granular. You can set permissions at the module level (incidents, changes, assets) down to individual actions (create, read, update, delete, approve, assign)." },
  { q: "What ITSM modules are included?", a: "ORG MAN includes Incident Management, Service Request Catalog, Change Management, Problem Management, Asset Management, Knowledge Base, SLA Tracking, and more." },
  { q: "Is there a free plan?", a: "Yes! Our free tier includes up to 3 organizations, 10 team members each, and access to core ITSM modules. No credit card required to get started." },
  { q: "How secure is ORG MAN?", a: "Bank-grade security with SOC 2 Type II compliance, end-to-end encryption, SAML SSO, and row-level security powered by Supabase. Your data never leaves your control." },
];



/* ─── ITSM Modules Grid ─── */
function ITSMSection() {
  return (
    <section className="border-t border-white/5 bg-[#0a0a0a] py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={reveal} className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#00e5ff] mb-4">ITSM Suite</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white mb-5">
            Everything IT needs.<br /><span className="text-zinc-500">Nothing it doesn't.</span>
          </h2>
          <p className="text-lg text-zinc-400 leading-relaxed">A complete ITSM platform built for modern IT teams — from incident triage to SLA enforcement.</p>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {itsmModules.map((mod) => (
            <motion.div key={mod.title} variants={reveal} className="group relative rounded-2xl border border-white/5 bg-[#111111] p-6 overflow-hidden hover:border-white/10 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: mod.glow }} />
              <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center text-white mb-4 shadow-lg`}><mod.icon size={20} /></div>
              <h3 className="text-base font-bold text-white mb-2">{mod.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{mod.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}


/* ─── Accordion FAQ ─── */
function FAQAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="border-t border-white/5 bg-[#0a0a0a] px-5 py-24 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div variants={reveal} className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#00e5ff] mb-3">FAQ</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-zinc-400">Everything you need to know about the platform.</p>
        </motion.div>
        <motion.div variants={stagger} className="space-y-3">
          {faqData.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <motion.div key={idx} variants={reveal}>
                <button onClick={() => setOpenIdx(isOpen ? null : idx)} className={`w-full text-left rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? "border-[#00e5ff]/20 bg-[#00e5ff]/5" : "border-white/5 bg-[#111111] hover:border-white/10 hover:bg-[#161616]"}`}>
                  <div className="flex items-center justify-between gap-4 px-6 py-5">
                    <span className={`text-base font-bold transition-colors ${isOpen ? "text-white" : "text-zinc-200"}`}>{faq.q}</span>
                    <ChevronDown size={18} className={`shrink-0 transition-all duration-300 ${isOpen ? "rotate-180 text-[#00e5ff]" : "text-zinc-500"}`} />
                  </div>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}>
                    <p className="px-6 pb-6 text-sm leading-relaxed text-zinc-400">{faq.a}</p>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.section>
  );
}

/* ─── Final CTA Section ─── */
function CTASection() {
  return (
    <section className="py-10 lg:py-14 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={stagger}
          className="relative rounded-2xl overflow-hidden"
        >
          {/* Backgrounds */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#00e5ff]/10 via-[#00e5ff]/5 to-violet-500/10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_0%_50%,rgba(0,229,255,0.12),transparent)]" />
          <div className="absolute inset-0 rounded-2xl border border-[#00e5ff]/15" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:20px_20px]" />
          <div className="absolute -top-12 right-0 h-48 w-72 rounded-full bg-[#00e5ff]/8 blur-[70px]" />
          <div className="absolute -bottom-12 left-1/3 h-40 w-64 rounded-full bg-violet-500/8 blur-[60px]" />

          {/* Content — horizontal split */}
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 px-8 py-9 sm:px-12 lg:px-14">

            {/* Left: text */}
            <div className="flex-1 min-w-0">
              <motion.div variants={reveal} className="inline-flex items-center gap-2 rounded-full border border-[#00e5ff]/20 bg-[#00e5ff]/10 px-3 py-1 text-[10px] font-bold text-[#00e5ff] mb-3 uppercase tracking-widest">
                <Sparkles size={10} /> Start for free today
              </motion.div>
              <motion.h2 variants={reveal} className="font-display text-2xl sm:text-3xl lg:text-[2rem] font-bold tracking-tight text-white mb-2.5 leading-[1.2]">
                Ready to bring order{" "}
                <span className="text-[#00e5ff]">to your organization?</span>
              </motion.h2>
              <motion.p variants={reveal} className="text-sm text-zinc-400 leading-relaxed max-w-lg">
                Join thousands of teams who’ve replaced chaos with clarity. Set up your workspace in minutes, no credit card required.
              </motion.p>
            </div>

            {/* Right: buttons + trust badges */}
            <motion.div variants={reveal} className="flex flex-col items-center lg:items-end gap-3.5 shrink-0">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link
                  to="/signup"
                  className="group flex items-center gap-2 rounded-xl bg-[#00e5ff] px-7 py-3 text-sm font-bold text-black shadow-lg shadow-[#00e5ff]/20 transition-all hover:-translate-y-0.5 hover:bg-[#00cce6] hover:shadow-[#00e5ff]/35 whitespace-nowrap"
                >
                  Create your workspace <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/pricing"
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3 text-sm font-bold text-white transition-all hover:border-white/20 hover:bg-white/10 whitespace-nowrap"
                >
                  View pricing
                </Link>
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-end gap-x-5 gap-y-1.5 text-[11px] text-zinc-500 font-medium">
                <span className="flex items-center gap-1.5"><Check size={11} className="text-[#00e5ff]" /> No credit card</span>
                <span className="flex items-center gap-1.5"><Check size={11} className="text-[#00e5ff]" /> Free forever</span>
                <span className="flex items-center gap-1.5"><Check size={11} className="text-[#00e5ff]" /> SOC 2 compliant</span>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Mock Enterprise Capabilities ─── */
const MockAdvancedAnalytics = () => (
  <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-white/5 bg-[#0a0a0a] p-6 lg:p-8 hover:border-white/10 transition-colors">
    <div className="flex items-center justify-between mb-8">
      <div>
        <h4 className="text-xl font-bold text-white mb-2">Advanced Analytics</h4>
        <p className="text-sm text-zinc-400">Resolution times dropping steadily.</p>
      </div>
      <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-bold text-emerald-400 border border-emerald-500/20">
        <ArrowDownRight size={16} /> -24%
      </div>
    </div>
    <div className="relative h-40 w-full">
      {/* SVG graph mimicking Recharts AreaChart */}
      <svg viewBox="0 0 400 150" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 120 C 50 110, 100 60, 150 70 C 200 80, 250 40, 300 30 C 350 20, 400 10, 400 10 L 400 150 L 0 150 Z"
          fill="url(#areaGradient)"
        />
        <path
          d="M0 120 C 50 110, 100 60, 150 70 C 200 80, 250 40, 300 30 C 350 20, 400 10, 400 10"
          fill="none"
          stroke="#00e5ff"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="150" cy="70" r="4" fill="#00e5ff" className="animate-pulse" />
        <circle cx="300" cy="30" r="4" fill="#00e5ff" className="animate-pulse" />
      </svg>
    </div>
  </div>
);

const MockAuditLogs = () => (
  <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-white/5 bg-[#0a0a0a] p-6 lg:p-8 hover:border-white/10 transition-colors">
    <div className="absolute top-0 right-0 p-8">
      <ShieldCheck className="text-emerald-500/20" size={80} />
    </div>
    <h4 className="text-xl font-bold text-white mb-2 relative z-10">Immutable Audit Logs</h4>
    <p className="text-sm text-zinc-400 mb-6 relative z-10">SOC2 compliant tracking.</p>
    
    <div className="space-y-4 relative z-10">
      <div className="flex items-start gap-3">
        <div className="mt-1 shrink-0 h-2 w-2 rounded-full bg-emerald-500"></div>
        <div>
          <div className="text-sm font-medium text-white">Alex approved Request #102</div>
          <div className="text-xs text-zinc-500">2 mins ago</div>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div className="mt-1 shrink-0 h-2 w-2 rounded-full bg-rose-500"></div>
        <div>
          <div className="text-sm font-medium text-white">System escalated INC-404 to P1</div>
          <div className="text-xs text-zinc-500">15 mins ago</div>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div className="mt-1 shrink-0 h-2 w-2 rounded-full bg-blue-500"></div>
        <div>
          <div className="text-sm font-medium text-white">Sarah changed role to Admin</div>
          <div className="text-xs text-zinc-500">1 hour ago</div>
        </div>
      </div>
    </div>
  </div>
);

const MockSLAEngine = () => (
  <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-amber-500/20 bg-[#111111] p-6 lg:p-8 hover:border-amber-500/40 transition-colors">
    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent"></div>
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={18} className="text-amber-500" />
          <h4 className="text-xl font-bold text-white">SLA Engine</h4>
        </div>
        <p className="text-sm text-zinc-400">Proactive breach warnings.</p>
      </div>
      
      <div className="mt-6 rounded-xl border border-amber-500/20 bg-[#0a0a0a] p-4 text-center">
        <div className="text-xs font-bold text-amber-500/70 uppercase tracking-widest mb-1">Time to breach</div>
        <div className="font-display text-4xl font-bold text-amber-500 tracking-tight tabular-nums animate-pulse">
          00:14:59
        </div>
      </div>
    </div>
  </div>
);

/* ─── Page ─── */
export default function Index() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#0a0a0a] text-white">
      <Navbar />
      <main>

        {/* ═══════════════════════════════════════════════════════
            1. HERO
        ═══════════════════════════════════════════════════════ */}
        <motion.section
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
          variants={reveal}
          className="relative mx-auto max-w-7xl px-5 pb-20 pt-20 lg:px-8 lg:pb-32 lg:pt-32"
        >
          {/* Animated Background Orbs */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className="pointer-events-none absolute -right-32 top-0 h-[500px] w-[500px] rounded-full bg-[#00e5ff]/10 blur-[100px]" 
          />
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ repeat: Infinity, duration: 12, ease: "easeInOut", delay: 2 }}
            className="pointer-events-none absolute -left-32 top-40 h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-[100px]" 
          />
          
          <div className="relative grid items-center gap-14 lg:grid-cols-[1.02fr_.98fr] z-10">
            <div className="max-w-2xl text-left">
              <motion.div variants={reveal} className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-4 py-2 text-xs font-bold text-[#00e5ff] shadow-sm relative overflow-hidden">
                <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
                <Sparkles size={14} className="animate-pulse" /> The calm way to scale access
              </motion.div>
              <motion.h1 variants={reveal} className="font-display text-[22px] leading-[1.2] sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-6">
                Next-generation<br />
                <motion.span 
                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] via-blue-400 to-[#00e5ff] bg-[length:200%_auto] whitespace-nowrap"
                >Organization Management</motion.span><br />
                Absolute control.
              </motion.h1>
              <motion.p variants={reveal} className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-zinc-400">
                Unify your company and organization's hierarchy, teams, and access controls into one incredibly fast, beautifully designed platform. Eliminate management chaos and scale with absolute clarity.
              </motion.p>
              <motion.div variants={reveal} className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:mt-10">
                <Link to="/signup" className="group relative w-full max-w-[220px] sm:w-auto overflow-hidden rounded-xl bg-white px-5 py-3 sm:px-8 sm:py-4 text-center text-sm font-bold text-black shadow-[0_0_40px_rgba(0,229,255,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(0,229,255,0.4)]">
                  <span className="relative z-10 flex items-center justify-center">Start for free <ArrowRight className="ml-2 inline transition-transform group-hover:translate-x-1" size={16} /></span>
                </Link>
                <Link to="/how-it-works" className="group w-full max-w-[220px] sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 sm:px-8 sm:py-4 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20">
                  <Play className="fill-current text-[#00e5ff] group-hover:animate-pulse" size={14} /> See how it works
                </Link>
              </motion.div>
              <motion.div variants={reveal} className="mt-10 flex flex-col sm:flex-row flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-zinc-500">
                <span className="flex items-center gap-2"><div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00e5ff]/20"><Check className="text-[#00e5ff]" size={12} /></div> Free forever plan</span>
                <span className="flex items-center gap-2"><div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00e5ff]/20"><Check className="text-[#00e5ff]" size={12} /></div> No credit card</span>
                <span className="flex items-center gap-2"><div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00e5ff]/20"><Check className="text-[#00e5ff]" size={12} /></div> Setup in minutes</span>
              </motion.div>
            </div>
            <motion.div variants={scaleIn} className="relative mt-10 lg:mt-0">
               {/* Ambient Glow behind Preview */}
               <motion.div animate={{ rotate: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} className="absolute -inset-4 bg-gradient-to-tr from-[#00e5ff]/10 to-violet-500/10 rounded-3xl blur-2xl" />
              <DashboardPreview />
            </motion.div>
          </div>
        </motion.section>



        {/* ═══════════════════════════════════════════════════════
            2.5. ACTUAL SCREENSHOT FEATURES (Moved to top)
        ═══════════════════════════════════════════════════════ */}
        <section className="relative w-full bg-[#0a0a0a] px-5 py-24 lg:px-8 lg:py-32 overflow-hidden border-t border-white/5">
          <div className="mx-auto max-w-7xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={reveal} className="max-w-3xl mx-auto text-center mb-24">
              <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-white mb-6">
                Everything you need.<br/>
                <span className="text-zinc-500">In one platform.</span>
              </h2>
            </motion.div>
            
            <div className="space-y-0">
              {productFeatures.map((feat, index) => (
                <React.Fragment key={index}>
                  <FeatureSection {...feat} />
                  {index < productFeatures.length - 1 && (
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            STATS COUNTER
        ═══════════════════════════════════════════════════════ */}
        {/* ═══════════════════════════════════════════════════════
            3. PLATFORM MODULES (Dark Agentic UI)
        ═══════════════════════════════════════════════════════ */}
        <section
          id="platform"
          className="relative w-full bg-[#0a0a0a] px-5 py-24 lg:px-8 lg:py-32 overflow-hidden"
        >
          {/* subtle background border */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          
          <div className="mx-auto max-w-7xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={reveal} className="max-w-3xl mx-auto text-center mb-24">
              <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl text-white mb-6">
                Modular Architecture.<br/>
                <span className="text-zinc-500">Built for scale.</span>
              </h2>
            </motion.div>

            <div className="space-y-32">
              
              {/* Category: Operations */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                <motion.div variants={reveal} className="lg:col-span-5">
                  <div className="text-[#00e5ff] font-bold uppercase tracking-[0.2em] text-[11px] mb-4">Operations</div>
                  <h3 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mb-5">
                    Manage IT ops, <br className="hidden sm:block" /><span className="text-zinc-500">with absolute clarity</span>
                  </h3>
                  <p className="text-lg leading-relaxed text-zinc-400">
                    Get a real-time overview of your IT service operations, organize large-scale initiatives, and collaborate seamlessly across your organization.
                  </p>
                </motion.div>
                <motion.div variants={stagger} className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
                  {[
                    { name: "Dashboard", icon: LayoutDashboard, desc: "Real-time overview of your IT service operations, pending approvals, and active tasks." },
                    { name: "Projects", icon: Briefcase, desc: "Organize large-scale initiatives, track milestones, and collaborate across teams seamlessly." },
                    { name: "Tasks", icon: CheckSquare, desc: "Create, assign, and track individual work items with integrated status and priority management." },
                    { name: "Teams", icon: UsersRound, desc: "Structure your organization into logical groups for efficient task routing and permissions." }
                  ].map((item) => (
                    <motion.div key={item.name} variants={reveal} className="bg-[#111111] border border-white/5 rounded-[20px] p-6 relative overflow-hidden group hover:border-white/10 hover:bg-[#161616] transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="h-8 w-8 rounded-lg bg-[#00e5ff]/10 flex items-center justify-center text-[#00e5ff]">
                          <item.icon size={16} />
                        </div>
                        <h4 className="text-white font-medium text-[15px]">{item.name}</h4>
                      </div>
                      <p className="text-zinc-400 text-[13px] leading-[1.6] relative z-10">{item.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Category: Service Management */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                <motion.div variants={stagger} className="lg:col-span-7 grid sm:grid-cols-2 gap-4 order-2 lg:order-1">
                  {[
                    { name: "SCTASK", icon: LifeBuoy, desc: "Manage catalog tasks and service catalog fulfillments with built-in SLA tracking mechanisms." },
                    { name: "Incidents", icon: AlertTriangle, desc: "Report, track, and resolve IT issues rapidly to minimize business disruption and downtime." },
                    { name: "Requests", icon: FilePlus, desc: "Handle user requests for software, hardware, and access with beautifully standardized forms." },
                    { name: "Approvals", icon: CheckCircle2, desc: "Streamline decision-making with a centralized view of all pending organizational approvals." }
                  ].map((item) => (
                    <motion.div key={item.name} variants={reveal} className="bg-[#111111] border border-white/5 rounded-[20px] p-6 relative overflow-hidden group hover:border-white/10 hover:bg-[#161616] transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="h-8 w-8 rounded-lg bg-[#00e5ff]/10 flex items-center justify-center text-[#00e5ff]">
                          <item.icon size={16} />
                        </div>
                        <h4 className="text-white font-medium text-[15px]">{item.name}</h4>
                      </div>
                      <p className="text-zinc-400 text-[13px] leading-[1.6] relative z-10">{item.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
                <motion.div variants={reveal} className="lg:col-span-5 order-1 lg:order-2">
                  <div className="text-[#00e5ff] font-bold uppercase tracking-[0.2em] text-[11px] mb-4">Service Management</div>
                  <h3 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mb-5">
                    Streamline requests, <br className="hidden sm:block" /><span className="text-zinc-500">resolve issues faster</span>
                  </h3>
                  <p className="text-lg leading-relaxed text-zinc-400">
                    Empower employees with a self-service portal, handle hardware requests gracefully, and eliminate recurring issues rapidly to minimize business downtime.
                  </p>
                </motion.div>
              </motion.div>

              {/* Category: Knowledge & Analytics */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                <motion.div variants={reveal} className="lg:col-span-5">
                  <div className="text-[#00e5ff] font-bold uppercase tracking-[0.2em] text-[11px] mb-4">Knowledge & Analytics</div>
                  <h3 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mb-5">
                    Actionable insights, <br className="hidden sm:block" /><span className="text-zinc-500">data-driven ops</span>
                  </h3>
                  <p className="text-lg leading-relaxed text-zinc-400">
                    Generate actionable insights with beautifully rendered charts on ticket volumes, resolution times, and team metrics while managing documentation securely.
                  </p>
                </motion.div>
                <motion.div variants={stagger} className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
                  {[
                    { name: "Knowledge Base", icon: Book, desc: "Create, manage, and share documentation and solution articles securely across the organization." },
                    { name: "Reports", icon: BarChart3, desc: "Generate actionable insights with beautiful charts on ticket volumes, resolution times, and team metrics." },
                    { name: "SLA Dashboard", icon: Activity, desc: "Monitor service level agreement compliance in real-time to ensure IT operational targets are always met." }
                  ].map((item) => (
                    <motion.div key={item.name} variants={reveal} className="bg-[#111111] border border-white/5 rounded-[20px] p-6 relative overflow-hidden group hover:border-white/10 hover:bg-[#161616] transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="h-8 w-8 rounded-lg bg-[#00e5ff]/10 flex items-center justify-center text-[#00e5ff]">
                          <item.icon size={16} />
                        </div>
                        <h4 className="text-white font-medium text-[15px]">{item.name}</h4>
                      </div>
                      <p className="text-zinc-400 text-[13px] leading-[1.6] relative z-10">{item.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Category: Administration */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                <motion.div variants={stagger} className="lg:col-span-7 grid sm:grid-cols-2 gap-4 order-2 lg:order-1">
                  {[
                    { name: "Users", icon: Users, desc: "Manage employee profiles, handle invitations, and track overarching organizational access records." },
                    { name: "Roles & Permissions", icon: ShieldCheck, desc: "Configure granular Role-Based Access Control (RBAC) securely across all platform modules." },
                    { name: "Org Updates", icon: Megaphone, desc: "Broadcast important announcements and critical updates to specific teams or the entire company." },
                    { name: "Settings", icon: Settings, desc: "Configure global organizational preferences, theming, branding, and core integration configurations." }
                  ].map((item) => (
                    <motion.div key={item.name} variants={reveal} className="bg-[#111111] border border-white/5 rounded-[20px] p-6 relative overflow-hidden group hover:border-white/10 hover:bg-[#161616] transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="h-8 w-8 rounded-lg bg-[#00e5ff]/10 flex items-center justify-center text-[#00e5ff]">
                          <item.icon size={16} />
                        </div>
                        <h4 className="text-white font-medium text-[15px]">{item.name}</h4>
                      </div>
                      <p className="text-zinc-400 text-[13px] leading-[1.6] relative z-10">{item.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
                <motion.div variants={reveal} className="lg:col-span-5 order-1 lg:order-2">
                  <div className="text-[#00e5ff] font-bold uppercase tracking-[0.2em] text-[11px] mb-4">Administration</div>
                  <h3 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mb-5">
                    Complete control, <br className="hidden sm:block" /><span className="text-zinc-500">secure access</span>
                  </h3>
                  <p className="text-lg leading-relaxed text-zinc-400">
                    Configure granular Role-Based Access Control securely across all platform modules. Handle invitations, and track overarching organizational access easily.
                  </p>
                </motion.div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            7. CORE VALUES & WORKFLOW (Zig-Zag)
        ═══════════════════════════════════════════════════════ */}
        <section
          id="workflow"
          className="relative w-full bg-[#0a0a0a] px-5 py-24 lg:px-8 lg:py-32 overflow-hidden border-t border-white/5"
        >
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          
          <div className="mx-auto max-w-7xl">
            <div className="space-y-32">
              
              {/* Category 1: Up and running (Text Left, Cards Right) */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                <motion.div variants={reveal} className="lg:col-span-5">
                  <div className="text-[#00e5ff] font-bold uppercase tracking-[0.2em] text-[11px] mb-4">GET STARTED</div>
                  <h3 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white mb-5">
                    Up and running, <br className="hidden sm:block" /><span className="text-zinc-500">in 3 steps</span>
                  </h3>
                  <p className="text-lg leading-relaxed text-zinc-400">
                    No consultants. No complex migrations. Just absolute clarity from day one. Set up your workspace and go live instantly.
                  </p>
                </motion.div>
                
                <motion.div variants={stagger} className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
                  {[
                    { name: "Create your organization", icon: Globe2, desc: "Set up your org in seconds. Add company details and configure branding." },
                    { name: "Invite your people", icon: UsersRound, desc: "Add team members individually or in bulk and auto-provision roles instantly." },
                    { name: "Go live with ITSM", icon: Zap, desc: "Activate incident management, service requests, and change workflows." },
                    { name: "Scale seamlessly", icon: Layers3, desc: "Expand to multiple organizations, brands, and clients without friction." }
                  ].map((item) => (
                    <motion.div key={item.name} variants={reveal} className="bg-[#111111] border border-white/5 rounded-[20px] p-6 relative overflow-hidden group hover:border-white/10 hover:bg-[#161616] transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="h-8 w-8 rounded-lg bg-[#00e5ff]/10 flex items-center justify-center text-[#00e5ff]">
                          <item.icon size={16} />
                        </div>
                        <h4 className="text-white font-medium text-[15px]">{item.name}</h4>
                      </div>
                      <p className="text-zinc-400 text-[13px] leading-[1.6] relative z-10">{item.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Category 2: Less admin (Cards Left, Text Right) */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                <motion.div variants={stagger} className="lg:col-span-7 grid sm:grid-cols-2 gap-4 order-2 lg:order-1">
                  {[
                    { name: "Faster Onboarding", icon: Zap, desc: "Get new hires productive in hours, not weeks. 4.2x faster setup.", metric: "4.2x" },
                    { name: "Less Admin Work", icon: ShieldCheck, desc: "Automate role assignment easily and save countless hours.", metric: "62%" },
                    { name: "Total Visibility", icon: Activity, desc: "Know exactly who has access to what, 100% of the time.", metric: "100%" },
                    { name: "Secure by Default", icon: LockKeyhole, desc: "Bank-grade rules running quietly in the background, 24/7.", metric: "24/7" }
                  ].map((item) => (
                    <motion.div key={item.name} variants={reveal} className="bg-[#111111] border border-white/5 rounded-[20px] p-6 relative overflow-hidden group hover:border-white/10 hover:bg-[#161616] transition-all duration-300">
                      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/5 blur-2xl transition group-hover:bg-[#00e5ff]/10" />
                      <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="h-8 w-8 rounded-lg bg-[#00e5ff]/10 flex items-center justify-center text-[#00e5ff]">
                          <item.icon size={16} />
                        </div>
                        <h4 className="text-white font-medium text-[15px]">{item.name}</h4>
                      </div>
                      <div className="mb-2 font-display text-2xl font-bold text-[#00e5ff] relative z-10">{item.metric}</div>
                      <p className="text-zinc-400 text-[13px] leading-[1.6] relative z-10">{item.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
                <motion.div variants={reveal} className="lg:col-span-5 order-1 lg:order-2">
                  <div className="text-[#00e5ff] font-bold uppercase tracking-[0.2em] text-[11px] mb-4">ROI OF CLARITY</div>
                  <h3 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white mb-5">
                    Less admin, <br className="hidden sm:block" /><span className="text-zinc-500">more momentum</span>
                  </h3>
                  <p className="text-lg leading-relaxed text-zinc-400">
                    Eliminate the chaotic back-and-forth of managing permissions. ORG MAN acts as a single, immutable source of truth for your entire company's hierarchy.
                  </p>
                </motion.div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            ITSM MODULES GRID
        ═══════════════════════════════════════════════════════ */}
        <ITSMSection />



        {/* ═══════════════════════════════════════════════════════
            FAQ ACCORDION
        ═══════════════════════════════════════════════════════ */}
        <FAQAccordion />

        {/* ═══════════════════════════════════════════════════════
            FINAL CTA
        ═══════════════════════════════════════════════════════ */}
        <CTASection />

      </main>
      <Footer />
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   Component Previews
═══════════════════════════════════════════════════════ */

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[540px] lg:ml-auto h-[380px] sm:h-[450px] flex items-center justify-center scale-[0.85] sm:scale-100 origin-center sm:origin-left">
      {/* Abstract Background Graph */}
      <div className="absolute inset-0 flex items-center justify-center opacity-60">
        <div className="relative w-full h-full max-w-[400px] max-h-[300px]">
           {/* Center Node */}
           <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#00e5ff]/20 rounded-full blur-2xl" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#00e5ff] rounded-full shadow-[0_0_40px_2px_#00e5ff]" />
           
           {/* Connected Nodes */}
           <svg className="absolute inset-0 w-full h-full" style={{ filter: "drop-shadow(0 0 10px rgba(0,229,255,0.4))" }}>
              <path d="M 200 150 L 80 80" stroke="url(#cyan-grad)" strokeWidth="2" fill="none" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite]" />
              <path d="M 200 150 L 320 60" stroke="url(#cyan-grad)" strokeWidth="1.5" fill="none" />
              <path d="M 200 150 L 60 220" stroke="url(#cyan-grad)" strokeWidth="1.5" fill="none" />
              <path d="M 200 150 L 340 240" stroke="url(#cyan-grad)" strokeWidth="2" fill="none" strokeDasharray="6 6" className="animate-[dash_15s_linear_infinite]" />
              <defs>
                 <linearGradient id="cyan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
                 </linearGradient>
              </defs>
           </svg>
           
           <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className="absolute top-[65px] left-[65px] w-10 h-10 rounded-full border border-[#00e5ff]/40 bg-[#111] flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.2)]"><Users size={14} className="text-[#00e5ff]" /></motion.div>
           <motion.div animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }} className="absolute top-[45px] left-[305px] w-12 h-12 rounded-full border border-purple-500/40 bg-[#111] flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.2)]"><Database size={16} className="text-purple-400" /></motion.div>
           <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 2 }} className="absolute top-[205px] left-[45px] w-10 h-10 rounded-full border border-emerald-500/40 bg-[#111] flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]"><Shield size={14} className="text-emerald-400" /></motion.div>
           <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }} className="absolute top-[225px] left-[325px] w-14 h-14 rounded-full border border-orange-500/40 bg-[#111] flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.2)]"><Server size={18} className="text-orange-400" /></motion.div>
        </div>
      </div>

      {/* Floating Command Palette */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[440px] rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-2xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden ring-1 ring-white/5"
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-white/[0.02]">
           <Search size={18} className="text-zinc-500" />
           <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1.5 h-4 bg-[#00e5ff]" />
           <span className="text-[14px] font-medium text-zinc-500 ml-1">Search actions, users or roles...</span>
        </div>
        <div className="p-3 space-y-1">
           <div className="px-3 py-2.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
             <Sparkles size={12} className="text-amber-500" /> Suggested Actions
           </div>
           
           <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-4 px-3 py-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer group hover:bg-[#00e5ff]/10 hover:border-[#00e5ff]/30 transition-all">
             <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-colors"><User size={14} /></div>
             <div className="flex-1 min-w-0">
               <div className="text-sm font-bold text-white truncate">Send Invitation</div>
               <div className="text-[11px] text-zinc-400 truncate">Invite alex.k@acme.com • Role: Manager</div>
             </div>
             <div className="text-[10px] font-bold text-[#00e5ff] opacity-0 group-hover:opacity-100 transition-opacity bg-[#00e5ff]/10 px-2 py-1 rounded">Execute</div>
           </motion.div>
           
           <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 cursor-pointer transition-all">
             <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400"><UsersRound size={14} /></div>
             <div className="flex-1 min-w-0">
               <div className="text-sm font-medium text-zinc-300">View Engineering Team</div>
               <div className="text-[11px] text-zinc-500">See current 24 members and open roles</div>
             </div>
           </motion.div>
           
           <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 cursor-pointer transition-all">
             <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400"><LockKeyhole size={14} /></div>
             <div className="flex-1 min-w-0">
               <div className="text-sm font-medium text-zinc-300">Review Manager Permissions</div>
               <div className="text-[11px] text-zinc-500">Check access levels before inviting</div>
             </div>
           </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function RolesPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[540px] lg:mr-auto">
      <div className="absolute -right-8 top-16 h-24 w-24 rounded-3xl bg-[#00e5ff]/20 blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#111111] p-2 shadow-2xl shadow-black/50">
        <div className="flex items-center gap-1.5 border-b border-white/5 px-3 py-3">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span className="h-2 w-2 rounded-full bg-yellow-500" />
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <div className="ml-4 flex h-5 items-center rounded bg-white/5 px-3 text-[9px] font-bold text-zinc-500">Roles & Permissions</div>
        </div>
        <div className="p-4 sm:p-6 bg-[#0a0a0a]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-white">Permissions Matrix</h3>
            <div className="rounded-md bg-[#00e5ff] px-3 py-1.5 text-[9px] font-bold text-black">Save Changes</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-[#111111] overflow-hidden">
            <table className="w-full text-left text-[9px]">
              <thead className="bg-white/5">
                <tr>
                  <th className="p-2.5 font-bold text-zinc-400">Module</th>
                  <th className="p-2.5 text-center font-bold text-zinc-400">View</th>
                  <th className="p-2.5 text-center font-bold text-zinc-400">Edit</th>
                  <th className="p-2.5 text-center font-bold text-zinc-400">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { name: "Incidents", v: true, e: true, d: false },
                  { name: "Changes", v: true, e: false, d: false },
                  { name: "Assets", v: true, e: true, d: true },
                  { name: "Knowledge", v: true, e: true, d: false },
                ].map(row => (
                  <tr key={row.name}>
                    <td className="p-2.5 font-semibold text-white">{row.name}</td>
                    <td className="p-2.5 text-center"><div className={`mx-auto flex h-3.5 w-3.5 items-center justify-center rounded-[3px] ${row.v ? 'bg-[#00e5ff] text-black' : 'border border-white/10 bg-[#0a0a0a]'}`}>{row.v && <Check size={8} strokeWidth={4} />}</div></td>
                    <td className="p-2.5 text-center"><div className={`mx-auto flex h-3.5 w-3.5 items-center justify-center rounded-[3px] ${row.e ? 'bg-[#00e5ff] text-black' : 'border border-white/10 bg-[#0a0a0a]'}`}>{row.e && <Check size={8} strokeWidth={4} />}</div></td>
                    <td className="p-2.5 text-center"><div className={`mx-auto flex h-3.5 w-3.5 items-center justify-center rounded-[3px] ${row.d ? 'bg-[#00e5ff] text-black' : 'border border-white/10 bg-[#0a0a0a]'}`}>{row.d && <Check size={8} strokeWidth={4} />}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockIncidentView() {
  return (
    <div className="relative mx-auto w-full max-w-[500px]">
      <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-rose-500/20 blur-[40px]" />
      <div className="relative overflow-hidden rounded-[1.2rem] border border-white/10 bg-[#0a0a0a] shadow-2xl">
        <div className="flex items-center gap-1.5 border-b border-white/5 bg-[#111111] px-4 py-3">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span className="h-2 w-2 rounded-full bg-yellow-500" />
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <div className="ml-2 flex h-5 items-center rounded bg-white/5 px-2 text-[9px] font-bold text-zinc-400">INC-1042</div>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-white font-bold text-sm mb-1">Database connection timeout in EU-West</h4>
              <p className="text-zinc-500 text-[10px]">Opened 12 mins ago by System</p>
            </div>
            <div className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider">P1 Critical</div>
          </div>
          <div className="space-y-3">
            <div className="h-8 w-full bg-[#161616] rounded-md border border-white/5 flex items-center px-3 gap-3">
               <div className="h-4 w-4 rounded-full bg-indigo-500/20 flex items-center justify-center"><User size={10} className="text-indigo-400" /></div>
               <span className="text-[10px] text-zinc-400 font-medium">Assigned to <span className="text-white">DevOps On-Call</span></span>
            </div>
            <div className="p-3 bg-[#161616] rounded-md border border-white/5">
              <span className="text-[10px] text-zinc-500 font-mono">ERROR: connection_pool_exhausted at pg_stat_activity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MockRequestForm() {
  return (
    <div className="relative mx-auto w-full max-w-[450px]">
      <div className="absolute -right-12 top-10 h-40 w-40 rounded-full bg-emerald-500/20 blur-[50px]" />
      <div className="relative rounded-[1.2rem] border border-white/10 bg-[#0a0a0a] shadow-2xl p-6">
        <h4 className="text-white font-bold text-sm mb-4">Request Software Access</h4>
        <div className="space-y-4">
          <div>
            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Software Name</div>
            <div className="h-9 w-full bg-[#111111] border border-white/5 rounded-lg flex items-center px-3 text-[11px] text-white">Adobe Creative Cloud</div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Business Justification</div>
            <div className="h-20 w-full bg-[#111111] border border-white/5 rounded-lg p-3 text-[11px] text-zinc-400">Needed for the upcoming marketing campaign assets...</div>
          </div>
          <div className="flex justify-end pt-2">
             <div className="bg-emerald-500 text-black px-4 py-2 rounded-xl text-[11px] font-bold">Submit Request</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MockApprovalQueue() {
  return (
    <div className="relative mx-auto w-full max-w-[500px]">
      <div className="absolute left-1/2 -top-10 h-32 w-32 -translate-x-1/2 rounded-full bg-amber-500/20 blur-[40px]" />
      <div className="relative rounded-[1.2rem] border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden">
        <div className="bg-[#111111] border-b border-white/5 px-4 py-3 flex justify-between items-center">
           <h4 className="text-white font-bold text-[11px]">Pending Approvals</h4>
           <div className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-[9px] font-bold">2 Pending</div>
        </div>
        <div className="divide-y divide-white/5">
          {[
            { id: "REQ-092", title: "AWS Role Expansion", user: "Alex M.", amt: "High Risk" },
            { id: "REQ-093", title: "Deploy to Prod", user: "CI/CD", amt: "Critical" },
          ].map(req => (
            <div key={req.id} className="p-4 flex items-center justify-between hover:bg-[#161616] transition-colors">
               <div className="flex items-center gap-3">
                 <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-zinc-400">{req.user[0]}</div>
                 <div>
                   <div className="text-[11px] font-bold text-white mb-0.5">{req.title}</div>
                   <div className="text-[9px] text-zinc-500">{req.id} • {req.user} • {req.amt}</div>
                 </div>
               </div>
               <div className="flex gap-2">
                  <div className="h-7 w-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20"><X size={12} /></div>
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20"><Check size={12} /></div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MockKanbanBoard() {
  return (
    <div className="relative mx-auto w-full max-w-[550px] overflow-hidden rounded-[1.2rem] border border-white/10 bg-[#0a0a0a] shadow-2xl p-4">
       <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-blue-500/20 blur-[50px]" />
       <div className="relative flex gap-4 h-[250px]">
          <div className="flex-1 bg-[#111111] rounded-xl border border-white/5 p-3 flex flex-col gap-3">
             <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
               <span>To Do</span>
               <span className="bg-white/10 px-1.5 py-0.5 rounded text-white">2</span>
             </div>
             <div className="bg-[#1a1a1a] p-3 rounded-lg border border-white/5 shadow-sm">
                <div className="text-[10px] text-white font-medium mb-2">Upgrade Postgres</div>
                <div className="flex justify-between items-center">
                  <span className="text-[8px] bg-rose-500/20 text-rose-400 px-1.5 rounded">High</span>
                  <div className="h-4 w-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[7px]">AM</div>
                </div>
             </div>
          </div>
          <div className="flex-1 bg-[#111111] rounded-xl border border-white/5 p-3 flex flex-col gap-3">
             <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
               <span>In Progress</span>
               <span className="bg-white/10 px-1.5 py-0.5 rounded text-white">1</span>
             </div>
             <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#00e5ff]/20 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#00e5ff]" />
                <div className="text-[10px] text-white font-medium mb-2">SSO Integration</div>
                <div className="flex justify-between items-center">
                  <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1.5 rounded">Medium</span>
                  <div className="h-4 w-4 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[7px]">JS</div>
                </div>
             </div>
          </div>
       </div>
    </div>
  )
}

function MockWorkflowBuilder() {
  return (
    <div className="relative mx-auto w-full max-w-[500px] h-[300px] rounded-[1.2rem] border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden flex items-center justify-center">
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:16px_16px]" />
       <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-[#00e5ff]/20 blur-[50px]" />
       <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="bg-[#111111] border border-[#00e5ff]/30 rounded-xl p-3 flex items-center gap-3 shadow-[0_0_15px_rgba(0,229,255,0.1)] w-48">
             <div className="h-8 w-8 rounded-lg bg-[#00e5ff]/10 text-[#00e5ff] flex items-center justify-center"><Zap size={14} /></div>
             <div>
               <div className="text-[9px] font-bold text-zinc-400 uppercase">Trigger</div>
               <div className="text-[11px] font-medium text-white">New Incident</div>
             </div>
          </div>
          <div className="w-px h-6 bg-gradient-to-b from-[#00e5ff]/50 to-emerald-500/50" />
          <div className="bg-[#111111] border border-emerald-500/30 rounded-xl p-3 flex items-center gap-3 shadow-[0_0_15px_rgba(16,185,129,0.1)] w-48">
             <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><MessageSquare size={14} /></div>
             <div>
               <div className="text-[9px] font-bold text-zinc-400 uppercase">Action</div>
               <div className="text-[11px] font-medium text-white">Slack Alert</div>
             </div>
          </div>
       </div>
    </div>
  )
}

function UsersPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[540px] lg:ml-auto">
      <div className="absolute -left-8 top-16 h-24 w-24 rounded-3xl bg-[#00e5ff]/20 blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#111111] p-2 shadow-2xl shadow-black/50">
        <div className="flex items-center gap-1.5 border-b border-white/5 px-3 py-3">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span className="h-2 w-2 rounded-full bg-yellow-500" />
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <div className="ml-4 flex h-5 items-center rounded bg-white/5 px-3 text-[9px] font-bold text-zinc-500">People</div>
        </div>
        <div className="p-4 sm:p-6 bg-[#0a0a0a]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-white">Team Members</h3>
            <div className="rounded-md bg-white/10 px-3 py-1.5 text-[9px] font-bold text-white">Invite</div>
          </div>
          <div className="grid gap-2">
            {[
              { name: "Alex Cooper", role: "Super Admin", color: "from-[#00e5ff] to-blue-500" },
              { name: "Sarah Jenkins", role: "Manager", color: "from-blue-400 to-indigo-500" },
              { name: "Mike Ross", role: "Editor", color: "from-purple-400 to-pink-500" },
              { name: "Jessica Pearson", role: "Viewer", color: "from-emerald-400 to-teal-500" },
            ].map((user) => (
              <div key={user.name} className="flex items-center justify-between rounded-xl border border-white/5 bg-[#111111] p-2.5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${user.color} text-[10px] font-bold text-black`}>
                    {user.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-white">{user.name}</div>
                    <div className="text-[9px] text-zinc-500">{user.name.toLowerCase().replace(" ", ".")}@example.com</div>
                  </div>
                </div>
                <div className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-bold text-zinc-400">{user.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
