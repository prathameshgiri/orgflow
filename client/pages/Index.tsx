import { Link } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Command,
  Globe2,
  Layers3,
  LockKeyhole,
  Play,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Zap,
  BarChart3,
  Clock,
  Bell,
  Workflow,
  FileText,
  HeartHandshake,
  ArrowUpRight,
  Shield,
  Server,
  Star,
  Quote,
} from "lucide-react";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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

/* ─── Data ─── */
const features = [
  { icon: Globe2, title: "Organization management", text: "Keep every workspace, brand, and client account organized in one calm, connected home.", color: "bg-coral/10 text-coral" },
  { icon: UsersRound, title: "People & teams", text: "Invite collaborators, shape teams, and give everyone the context they need to move fast.", color: "bg-blue-100 text-blue-600" },
  { icon: ShieldCheck, title: "Roles & permissions", text: "Create fine-grained access rules that make security feel simple, not restrictive.", color: "bg-emerald-100 text-emerald-600" },
  { icon: Layers3, title: "Client management", text: "Build stronger client relationships with shared visibility and a single source of truth.", color: "bg-amber-100 text-amber-600" },
];

const itsmModules = [
  { icon: Bell, title: "Incident Management", desc: "Detect, escalate, and resolve incidents faster with automated workflows and real-time alerts.", color: "from-red-500 to-rose-600" },
  { icon: FileText, title: "Service Requests", desc: "Empower employees with a self-service portal for IT requests, approvals, and tracking.", color: "from-blue-500 to-indigo-600" },
  { icon: Workflow, title: "Change Management", desc: "Plan, approve, and execute changes with built-in risk assessment and rollback capabilities.", color: "from-violet-500 to-purple-600" },
  { icon: BarChart3, title: "Asset Tracking", desc: "Complete lifecycle management for all hardware, software, and cloud assets in your org.", color: "from-emerald-500 to-teal-600" },
  { icon: HeartHandshake, title: "Problem Management", desc: "Identify root causes, link related incidents, and eliminate recurring issues permanently.", color: "from-amber-500 to-orange-600" },
  { icon: Clock, title: "SLA Management", desc: "Define, track, and enforce service level agreements with automated breach notifications.", color: "from-cyan-500 to-sky-600" },
];

const testimonials = [
  { name: "Priya Sharma", role: "CTO, Finvesta", quote: "OrgTask transformed how we manage access across 12 subsidiaries. What used to take days now takes minutes.", avatar: "from-violet-400 to-indigo-500" },
  { name: "James Chen", role: "VP Engineering, CloudScale", quote: "The permissions matrix alone saved our compliance team 20+ hours per week. Absolute game-changer.", avatar: "from-emerald-400 to-teal-500" },
  { name: "Maria Rodriguez", role: "IT Director, NovaTech", quote: "Finally, an ITSM tool that doesn't feel like it was built in 2005. Beautiful, fast, and incredibly intuitive.", avatar: "from-coral to-rose-500" },
];

const integrations = [
  { name: "Slack", color: "bg-[#611f69]" },
  { name: "Teams", color: "bg-[#464EB8]" },
  { name: "Jira", color: "bg-[#0052CC]" },
  { name: "GitHub", color: "bg-[#1B1F23]" },
  { name: "AWS", color: "bg-[#FF9900]" },
  { name: "Azure", color: "bg-[#0078D4]" },
  { name: "Okta", color: "bg-[#007DC1]" },
  { name: "Zendesk", color: "bg-[#03363D]" },
];

const faqData = [
  { q: "What is an organization in OrgTask?", a: "An organization is a top-level container that holds all your teams, members, roles, and configurations. You can manage multiple organizations from a single account." },
  { q: "Can I manage multiple organizations?", a: "Absolutely! OrgTask is built for multi-org management. Switch between organizations seamlessly, each with their own settings, roles, and data isolation." },
  { q: "How granular are permissions?", a: "Extremely granular. You can set permissions at the module level (incidents, changes, assets) down to individual actions (create, read, update, delete, approve, assign)." },
  { q: "What ITSM modules are included?", a: "OrgTask includes Incident Management, Service Request Catalog, Change Management, Problem Management, Asset Management, Knowledge Base, SLA Tracking, and more." },
  { q: "Is there a free plan?", a: "Yes! Our free tier includes up to 3 organizations, 10 team members each, and access to core ITSM modules. No credit card required to get started." },
  { q: "How secure is OrgTask?", a: "Bank-grade security with SOC 2 Type II compliance, end-to-end encryption, SAML SSO, and row-level security powered by Supabase. Your data never leaves your control." },
];

/* ─── Page ─── */
export default function Index() {
  return (
    <div className="min-h-screen overflow-hidden bg-cream text-ink">
      <Navbar />
      <main>

        {/* ═══════════════════════════════════════════════════════
            1. HERO
        ═══════════════════════════════════════════════════════ */}
        <motion.section
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
          variants={reveal}
          className="relative mx-auto max-w-7xl px-5 pb-20 pt-20 lg:px-8 lg:pb-28 lg:pt-28"
        >
          <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-coral/10 blur-3xl" />
          <div className="relative grid items-center gap-14 lg:grid-cols-[1.02fr_.98fr]">
            <div className="max-w-2xl">
              <motion.div variants={reveal} className="mb-7 inline-flex items-center gap-2 rounded-full border border-coral/20 bg-white/70 px-3 py-1.5 text-xs font-bold text-coral shadow-sm">
                <Sparkles size={13} /> The calm way to scale access
              </motion.div>
              <motion.h1 variants={reveal} className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
                One platform.<br /><span className="text-coral">Multiple organizations.</span><br />Complete control.
              </motion.h1>
              <motion.p variants={reveal} className="mt-7 max-w-xl text-lg leading-8 text-ink/60">
                OrgTask brings your organizations, people, teams, and permissions into one beautifully simple workspace — with a built-in ITSM engine to run your entire service desk.
              </motion.p>
              <motion.div variants={reveal} className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to="/signup" className="rounded-full bg-ink px-6 py-3.5 text-center text-sm font-bold text-white shadow-xl shadow-ink/15 transition hover:-translate-y-1">Start for free <ArrowRight className="ml-2 inline" size={16} /></Link>
                <a href="#platform" className="rounded-full border border-ink/10 bg-white/60 px-6 py-3.5 text-center text-sm font-bold text-ink transition hover:border-ink/25"><Play className="mr-2 inline fill-current" size={14} /> See how it works</a>
              </motion.div>
              <motion.div variants={reveal} className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-ink/45">
                <span><Check className="mr-1 inline text-emerald-500" size={14} /> Free forever plan</span>
                <span><Check className="mr-1 inline text-emerald-500" size={14} /> No credit card</span>
                <span><Check className="mr-1 inline text-emerald-500" size={14} /> Setup in minutes</span>
              </motion.div>
            </div>
            <motion.div variants={scaleIn}>
              <DashboardPreview />
            </motion.div>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════
            2. TRUSTED BY (Logos Banner)
        ═══════════════════════════════════════════════════════ */}
        <motion.section
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }}
          variants={reveal}
          className="border-y border-ink/5 bg-white/30 py-10"
        >
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <p className="mb-8 text-center text-xs font-bold uppercase tracking-[.25em] text-ink/30">Trusted by forward-thinking teams</p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {["Acme Corp", "Globex Inc", "Initech", "Umbrella Co", "Stark Industries", "Wayne Enterprises"].map((name) => (
                <div key={name} className="font-display text-lg font-bold tracking-tight text-ink/20 transition hover:text-ink/40">
                  {name}
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════
            3. CORE FEATURES (4 cards)
        ═══════════════════════════════════════════════════════ */}
        <motion.section
          id="platform"
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
          className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32"
        >
          <motion.div variants={reveal} className="max-w-2xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-coral">Everything in its place</p>
            <h2 className="font-display text-4xl font-bold tracking-[-.05em] sm:text-5xl">The operating system for your organizations.</h2>
            <p className="mt-5 text-lg leading-8 text-ink/55">A flexible foundation for the way your business actually works — from the first invite to your hundredth team.</p>
          </motion.div>
          <motion.div variants={stagger} className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, text, color }) => (
              <motion.div key={title} variants={reveal} className="group rounded-3xl border border-ink/8 bg-white/65 p-6 transition duration-300 hover:-translate-y-1 hover:border-coral/20 hover:shadow-xl hover:shadow-ink/5">
                <div className={`mb-12 flex h-11 w-11 items-center justify-center rounded-2xl ${color}`}><Icon size={21} /></div>
                <h3 className="font-display text-xl font-bold tracking-[-.03em]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink/55">{text}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════
            4. ITSM MODULES (Dark gradient section) — moved up
        ═══════════════════════════════════════════════════════ */}
        <motion.section
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}
          className="relative overflow-hidden bg-gradient-to-br from-ink via-ink to-[#1a1f3d] px-5 py-12 text-white lg:px-8 lg:py-14"
        >
          <div className="absolute -right-1/4 top-0 h-[800px] w-[800px] rounded-full bg-coral/8 blur-[150px]" />
          <div className="absolute -bottom-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-violet-500/8 blur-[120px]" />

          <div className="relative mx-auto max-w-7xl">
            {/* Top row: heading left + first 3 cards right */}
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.5fr]">
              <motion.div variants={reveal}>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-coral/30 bg-coral/10 px-4 py-1.5 text-xs font-bold text-coral-light shadow-sm backdrop-blur-md">
                  <Zap size={14} /> Enterprise ITSM
                </div>
                <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:leading-[1.15]">
                  A complete service desk,<br />
                  <span className="bg-gradient-to-r from-coral-light to-amber-200 bg-clip-text text-transparent">built right in.</span>
                </h2>
                <p className="mt-4 max-w-md text-[15px] leading-7 text-white/55">
                  No more juggling separate tools. OrgTask includes a full ITSM suite — from incident response to change management — all connected to your org's permissions engine.
                </p>
                <ul className="mt-6 space-y-3">
                  {["Automated ticket routing & escalation", "Built-in SLA tracking with breach alerts", "Knowledge base for self-service resolution", "Real-time dashboards & analytics"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm font-medium text-white/70">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-coral/20 text-coral-light"><Check size={10} strokeWidth={3} /></div>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/signup" className="mt-8 inline-flex items-center rounded-full bg-white/10 border border-white/15 px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/20">
                  Explore ITSM <ArrowRight className="ml-2" size={15} />
                </Link>
              </motion.div>

              <div className="flex flex-col gap-3">
                <motion.div variants={stagger} className="grid gap-3 sm:grid-cols-3">
                  {itsmModules.slice(0, 3).map(({ icon: Icon, title, desc, color }) => (
                    <motion.div key={title} variants={reveal} className="group rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08]">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${color} text-white`}>
                          <Icon size={15} />
                        </div>
                        <h3 className="font-display text-[13px] font-bold leading-tight">{title}</h3>
                      </div>
                      <p className="text-xs leading-5 text-white/45">{desc}</p>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div variants={stagger} className="grid gap-3 sm:grid-cols-3">
                  {itsmModules.slice(3).map(({ icon: Icon, title, desc, color }) => (
                    <motion.div key={title} variants={reveal} className="group rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08]">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${color} text-white`}>
                          <Icon size={15} />
                        </div>
                        <h3 className="font-display text-[13px] font-bold leading-tight">{title}</h3>
                      </div>
                      <p className="text-xs leading-5 text-white/45">{desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════
            7. HOW IT WORKS (3 Steps)
        ═══════════════════════════════════════════════════════ */}
        <motion.section
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
          className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32"
        >
          <motion.div variants={reveal} className="mx-auto max-w-2xl text-center">
            <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-coral">Simple by design</p>
            <h2 className="font-display text-4xl font-bold tracking-[-.05em] sm:text-5xl">Up and running in 3 steps.</h2>
            <p className="mt-5 text-lg leading-8 text-ink/55">No consultants. No complex migrations. Just clarity from day one.</p>
          </motion.div>

          <motion.div variants={stagger} className="relative mt-16 grid gap-8 md:grid-cols-3">
            {/* Connector line */}
            <div className="pointer-events-none absolute left-0 right-0 top-[60px] hidden h-px bg-gradient-to-r from-transparent via-ink/10 to-transparent md:block" />

            {[
              { step: "01", title: "Create your organization", desc: "Set up your org in seconds. Add your company details, configure branding, and define your workspace structure.", icon: Globe2 },
              { step: "02", title: "Invite your people", desc: "Add team members individually or in bulk. Assign them to teams and auto-provision the right roles instantly.", icon: UsersRound },
              { step: "03", title: "Go live with ITSM", desc: "Activate incident management, service requests, and change workflows. Your service desk is ready to operate.", icon: Zap },
            ].map(({ step, title, desc, icon: StepIcon }) => (
              <motion.div key={step} variants={reveal} className="relative text-center">
                <div className="mx-auto mb-6 flex h-[120px] w-[120px] items-center justify-center rounded-[2rem] border border-ink/8 bg-white/80 shadow-xl shadow-ink/5">
                  <StepIcon size={40} className="text-coral" strokeWidth={1.5} />
                </div>
                <div className="mb-3 font-display text-xs font-bold uppercase tracking-[.2em] text-coral">{step}</div>
                <h3 className="font-display text-xl font-bold tracking-tight">{title}</h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-ink/55">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════
            8. STATS / WHY SECTION
        ═══════════════════════════════════════════════════════ */}
        <motion.section
          id="why"
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
          className="relative overflow-hidden bg-ink px-5 py-16 text-white lg:px-8 lg:py-24"
        >
          <div className="absolute -right-1/4 top-0 h-[800px] w-[800px] rounded-full bg-coral/10 blur-[120px]" />
          <div className="absolute -bottom-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[100px]" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-1 md:grid-cols-2">
            <motion.div variants={reveal}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-coral/30 bg-coral/10 px-4 py-1.5 text-xs font-bold text-coral-light shadow-sm backdrop-blur-md">
                <Sparkles size={14} /> The ROI of Clarity
              </div>
              <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:leading-[1.1]">
                Less admin.<br />
                <span className="bg-gradient-to-r from-coral-light to-amber-200 bg-clip-text text-transparent">More momentum.</span>
              </h2>
              <p className="mt-6 max-w-lg text-lg leading-7 text-white/65">
                Eliminate the chaotic back-and-forth of managing permissions. OrgTask acts as a single, immutable source of truth for your entire company's hierarchy.
              </p>
              <Link to="/dashboard" className="mt-8 inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-bold text-ink shadow-lg shadow-white/10 transition hover:-translate-y-1 hover:bg-coral-light hover:text-white hover:shadow-coral/20">
                Explore the dashboard <ArrowRight className="ml-2" size={16} />
              </Link>
            </motion.div>

            <motion.div variants={stagger} className="grid gap-3 sm:grid-cols-2">
              {[
                { num: "4.2x", label: "Faster Onboarding", desc: "Get new hires productive in hours.", color: "text-emerald-400" },
                { num: "62%", label: "Less Admin Work", desc: "Automate role assignment easily.", color: "text-coral-light" },
                { num: "100%", label: "Visibility", desc: "Know who has access to what.", color: "text-blue-400" },
                { num: "24/7", label: "Security", desc: "Bank-grade rules running quietly.", color: "text-amber-300" },
              ].map((item, i) => (
                <motion.div variants={reveal} key={item.label} className={`group relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 p-6 backdrop-blur-md transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 ${i % 2 !== 0 ? "sm:mt-4" : ""}`}>
                  <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/5 blur-2xl transition group-hover:bg-white/10" />
                  <div className={`font-display text-3xl font-bold ${item.color}`}>{item.num}</div>
                  <div className="mt-2 text-sm font-bold text-white">{item.label}</div>
                  <div className="mt-1 text-xs leading-relaxed text-white/50">{item.desc}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════
            10. TESTIMONIALS
        ═══════════════════════════════════════════════════════ */}
        <motion.section
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
          className="border-y border-ink/5 bg-gradient-to-b from-cream to-white/60 px-5 py-24 lg:px-8 lg:py-32"
        >
          <motion.div variants={reveal} className="mx-auto max-w-2xl text-center">
            <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-coral">What people say</p>
            <h2 className="font-display text-4xl font-bold tracking-[-.05em] sm:text-5xl">Loved by teams worldwide.</h2>
          </motion.div>

          <motion.div variants={stagger} className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <motion.div key={t.name} variants={reveal} className="relative rounded-[1.6rem] border border-ink/8 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/5">
                <Quote size={28} className="mb-4 text-coral/20" />
                <p className="text-sm leading-7 text-ink/65">{t.quote}</p>
                <div className="mt-6 flex items-center gap-3 border-t border-ink/5 pt-5">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.avatar} text-sm font-bold text-white`}>
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-bold">{t.name}</div>
                    <div className="text-xs text-ink/45">{t.role}</div>
                  </div>
                </div>
                <div className="mt-4 flex gap-0.5">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════
            11. CTA BANNER
        ═══════════════════════════════════════════════════════ */}
        <motion.section
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
          variants={reveal}
          className="relative overflow-hidden bg-gradient-to-br from-ink via-ink to-[#1c2347] px-5 py-14 text-center text-white lg:px-8 lg:py-16"
        >
          <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-coral/20 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-violet-500/15 blur-[80px]" />

          <div className="relative mx-auto max-w-3xl">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to bring clarity to your organization?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[15px] text-white/60">
              Join thousands of teams using OrgTask to simplify access control and power their service desk.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/signup" className="rounded-full bg-coral px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-coral/30 transition hover:-translate-y-1 hover:bg-coral-dark">
                Get started for free <ArrowRight className="ml-2 inline" size={16} />
              </Link>
              <Link to="/pricing" className="rounded-full border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/20">
                View pricing
              </Link>
            </div>
            <p className="mt-5 text-xs text-white/40">No credit card required · Free plan available · Cancel anytime</p>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════
            12. FAQ
        ═══════════════════════════════════════════════════════ */}
        <motion.section
          id="faq"
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
          className="border-t border-ink/5 bg-white/40 px-5 py-24 lg:px-8"
        >
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.7fr_1.3fr]">
            <motion.div variants={reveal}>
              <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-coral">Questions, answered</p>
              <h2 className="font-display text-4xl font-bold tracking-[-.05em]">Good to know.</h2>
              <p className="mt-4 text-sm leading-6 text-ink/50">Can't find what you're looking for? Reach out to our support team anytime.</p>
            </motion.div>
            <motion.div variants={stagger} className="grid gap-3">
              {faqData.map(({ q, a }) => (
                <motion.details variants={reveal} key={q} className="group rounded-2xl border border-ink/8 bg-white px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-bold">
                    {q}<ChevronDown className="shrink-0 transition group-open:rotate-180" size={18} />
                  </summary>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-ink/55">{a}</p>
                </motion.details>
              ))}
            </motion.div>
          </div>
        </motion.section>

      </main>
      <Footer />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Component Previews
═══════════════════════════════════════════════════════ */

function DashboardPreview() {
  return <div className="relative mx-auto w-full max-w-[540px] lg:ml-auto"><div className="absolute -left-8 top-16 h-24 w-24 rounded-3xl bg-coral/20 blur-2xl" /><div className="relative overflow-hidden rounded-[1.6rem] border border-white/70 bg-white/90 p-2 shadow-2xl shadow-ink/15 backdrop-blur-xl"><div className="flex items-center gap-1.5 border-b border-ink/5 px-3 py-3"><span className="h-2 w-2 rounded-full bg-red-300" /><span className="h-2 w-2 rounded-full bg-amber-300" /><span className="h-2 w-2 rounded-full bg-emerald-300" /><div className="ml-4 h-5 w-36 rounded bg-ink/5" /></div><div className="grid grid-cols-[118px_1fr]"><div className="border-r border-ink/5 bg-cream/60 p-3"><div className="mb-7 flex items-center gap-1.5 text-[10px] font-bold"><span className="flex h-5 w-5 items-center justify-center rounded-md bg-ink text-white"><Command size={10} /></span> orgtask</div>{["Overview", "Organizations", "People", "Teams", "Permissions"].map((item, i) => <div key={item} className={`mb-2 rounded-lg px-2 py-2 text-[9px] font-semibold ${i === 0 ? "bg-ink text-white" : "text-ink/40"}`}>{item}</div>)}</div><div className="p-4 sm:p-6"><div className="flex items-start justify-between"><div><div className="text-[9px] font-bold uppercase tracking-widest text-coral">Monday, June 24</div><h3 className="mt-1 font-display text-xl font-bold tracking-tight">Good morning, Alex</h3></div><div className="h-7 w-7 rounded-full bg-gradient-to-br from-coral to-amber-300" /></div><div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-2 sm:grid-cols-4">{[["Organizations", "24"], ["Active users", "1,284"], ["Teams", "86"], ["Clients", "312"]].map(([label, value]) => <div key={label} className="rounded-xl border border-ink/5 bg-cream/50 p-2"><div className="text-[8px] text-ink/40">{label}</div><div className="mt-1 font-display text-lg font-bold">{value}</div></div>)}</div><div className="mt-4 rounded-xl border border-ink/5 p-3"><div className="flex justify-between text-[9px] font-bold"><span>Organization growth</span><span className="text-emerald-500">+18.4%</span></div><div className="mt-3 flex h-20 items-end gap-1.5">{[20, 34, 29, 45, 40, 56, 50, 67, 72, 64, 82, 92].map((h, i) => <div key={i} className={`flex-1 rounded-t-sm ${i === 11 ? "bg-coral" : "bg-coral/20"}`} style={{ height: `${h}%` }} />)}</div></div></div></div></div></div>;
}

function RolesPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[540px] lg:mr-auto">
      <div className="absolute -right-8 top-16 h-24 w-24 rounded-3xl bg-emerald-500/20 blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.6rem] border border-white/70 bg-white/90 p-2 shadow-2xl shadow-ink/15 backdrop-blur-xl">
        <div className="flex items-center gap-1.5 border-b border-ink/5 px-3 py-3">
          <span className="h-2 w-2 rounded-full bg-red-300" />
          <span className="h-2 w-2 rounded-full bg-amber-300" />
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
          <div className="ml-4 flex h-5 items-center rounded bg-ink/5 px-3 text-[9px] font-bold text-ink/40">Roles & Permissions</div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Permissions Matrix</h3>
            <div className="rounded-md bg-coral px-3 py-1.5 text-[9px] font-bold text-white shadow-md shadow-coral/30">Save Changes</div>
          </div>
          <div className="rounded-xl border border-ink/5 bg-cream/50 overflow-hidden">
            <table className="w-full text-left text-[9px]">
              <thead className="bg-ink/5">
                <tr>
                  <th className="p-2.5 font-bold text-ink/50">Module</th>
                  <th className="p-2.5 text-center font-bold text-ink/50">View</th>
                  <th className="p-2.5 text-center font-bold text-ink/50">Edit</th>
                  <th className="p-2.5 text-center font-bold text-ink/50">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {[
                  { name: "Incidents", v: true, e: true, d: false },
                  { name: "Changes", v: true, e: false, d: false },
                  { name: "Assets", v: true, e: true, d: true },
                  { name: "Knowledge", v: true, e: true, d: false },
                ].map(row => (
                  <tr key={row.name}>
                    <td className="p-2.5 font-semibold">{row.name}</td>
                    <td className="p-2.5 text-center"><div className={`mx-auto flex h-3.5 w-3.5 items-center justify-center rounded-[3px] ${row.v ? 'bg-coral text-white' : 'border border-ink/15 bg-white'}`}>{row.v && <Check size={8} strokeWidth={4} />}</div></td>
                    <td className="p-2.5 text-center"><div className={`mx-auto flex h-3.5 w-3.5 items-center justify-center rounded-[3px] ${row.e ? 'bg-coral text-white' : 'border border-ink/15 bg-white'}`}>{row.e && <Check size={8} strokeWidth={4} />}</div></td>
                    <td className="p-2.5 text-center"><div className={`mx-auto flex h-3.5 w-3.5 items-center justify-center rounded-[3px] ${row.d ? 'bg-coral text-white' : 'border border-ink/15 bg-white'}`}>{row.d && <Check size={8} strokeWidth={4} />}</div></td>
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

function UsersPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[540px] lg:ml-auto">
      <div className="absolute -left-8 top-16 h-24 w-24 rounded-3xl bg-blue-500/20 blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.6rem] border border-white/70 bg-white/90 p-2 shadow-2xl shadow-ink/15 backdrop-blur-xl">
        <div className="flex items-center gap-1.5 border-b border-ink/5 px-3 py-3">
          <span className="h-2 w-2 rounded-full bg-red-300" />
          <span className="h-2 w-2 rounded-full bg-amber-300" />
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
          <div className="ml-4 flex h-5 items-center rounded bg-ink/5 px-3 text-[9px] font-bold text-ink/40">People</div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Team Members</h3>
            <div className="rounded-md bg-ink px-3 py-1.5 text-[9px] font-bold text-white shadow-md shadow-ink/20">Invite</div>
          </div>
          <div className="grid gap-2">
            {[
              { name: "Alex Cooper", role: "Super Admin", color: "from-coral to-amber-300" },
              { name: "Sarah Jenkins", role: "Manager", color: "from-blue-400 to-indigo-400" },
              { name: "Mike Ross", role: "Editor", color: "from-emerald-400 to-teal-400" },
              { name: "Jessica Pearson", role: "Viewer", color: "from-rose-400 to-pink-400" },
            ].map((user) => (
              <div key={user.name} className="flex items-center justify-between rounded-xl border border-ink/5 bg-cream/50 p-2.5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${user.color} text-[10px] font-bold text-white`}>
                    {user.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold">{user.name}</div>
                    <div className="text-[9px] text-ink/45">{user.name.toLowerCase().replace(" ", ".")}@example.com</div>
                  </div>
                </div>
                <div className="rounded-md border border-ink/10 bg-white px-2.5 py-1 text-[9px] font-bold text-ink/60">{user.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
