import React from "react";
import { motion, Variants } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Static imports for Vite asset bundling
import dashboardImg from '../img/dashboard.jpeg';
import rAImg from '../img/rA.jpeg';
import sladashImg from '../img/sladash.jpeg';
import rolesImg from '../img/roles.jpeg';
import rolePImg from '../img/roleP.jpeg';
import teamsImg from '../img/teams.jpeg';
import projectsImg from '../img/projects.jpeg';
import ptaskImg from '../img/ptask.jpeg';
import incidentImg from '../img/incident.jpeg';
import incident2Img from '../img/incident2.jpeg';
import servicerequestImg from '../img/servicerequest.jpeg';
import sctaskImg from '../img/sctask.jpeg';
import assignedtaskImg from '../img/assignedtask.jpeg';
import taskImg from '../img/task.jpeg';
import approvalsImg from '../img/approvals.jpeg';
import kbaseImg from '../img/kbase.jpeg';
import orgupdatesImg from '../img/orgupdates.jpeg';
import settingsImg from '../img/settings.jpeg';

const reveal: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export interface FeatureProps {
  title: string;
  category: string;
  description: string;
  image: string;
  points: string[];
  align?: "left" | "right" | "center";
}

export const FeatureSection = ({ title, category, description, image, points, align = "left" }: FeatureProps) => {
// Center layout removed

  return (
    <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} className="py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className={cn("grid lg:grid-cols-2 gap-16 lg:gap-24 items-center", align === "right" ? "lg:grid-flow-col-dense" : "")}>
          <motion.div variants={reveal} className={cn("flex flex-col justify-center", align === "right" ? "lg:col-start-2" : "")}>
            <div className="text-[#00e5ff] font-bold uppercase tracking-[0.2em] text-[11px] mb-4">{category}</div>
            <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
              {title}
            </h3>
            <p className="text-lg leading-relaxed text-zinc-400 mb-8">{description}</p>
            <ul className="space-y-4">
              {points.map((p, i) => (
                <li key={i} className="flex items-start gap-3 text-base font-medium text-zinc-300">
                  <CheckCircle2 size={20} className="text-[#00e5ff] shrink-0 mt-0.5" /> 
                  {p}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div variants={reveal} className={cn("relative", align === "right" ? "lg:col-start-1" : "")}>
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#00e5ff]/20 to-transparent blur-3xl rounded-full opacity-30"></div>
            <div className="relative rounded-[2rem] border border-white/10 bg-[#111111] p-2 shadow-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#00e5ff]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none"></div>
              
              {/* MacOS style window header */}
              <div className="flex items-center gap-1.5 px-3 py-3 relative z-20">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
                <div className="ml-4 flex h-6 items-center rounded-md bg-white/5 px-3 text-[10px] font-bold text-zinc-400">
                  {category}
                </div>
              </div>

              <img src={image} alt={title} className="w-full h-auto rounded-[1.5rem] relative z-10 border border-white/5 transition-transform duration-700 group-hover:scale-[1.01]" />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export const productFeatures: FeatureProps[] = [
    {
      category: "Command Center",
      title: "The ultimate view of your operations.",
      description: "Get a real-time, comprehensive overview of organizational health, pending tasks, and critical incidents right from your dashboard.",
      image: dashboardImg,
      align: "left" as const,
      points: ["Real-time productivity trends", "Priority distribution analytics", "Unified activity feed"]
    },
    {
      category: "Analytics",
      title: "Real-time Analytics.",
      description: "Data-driven insights at your fingertips. Generate reports on ticket volume, resolution times, and team workload.",
      image: rAImg,
      align: "right" as const,
      points: ["Automated operational insights", "Resolution time analytics", "Volume trend forecasting"]
    },
    {
      category: "Service Level Agreements",
      title: "SLA Management.",
      description: "Never miss a deadline. Ensure every ticket is handled on time with real-time countdowns and proactive breach warnings.",
      image: sladashImg,
      align: "left" as const,
      points: ["Real-time countdowns", "Breach warnings", "Historical SLA performance"]
    },
    {
      category: "SECURITY",
      title: "Granular permissions, that scale with you.",
      description: "Say goodbye to chaotic permission matrices. Create custom roles, group people into teams, and define precise access policies down to the module level.",
      image: rolesImg,
      align: "right" as const,
      points: ["Role-based access control (RBAC)", "Team-based routing", "Automated invite management"]
    },
    {
      category: "Security & Access",
      title: "Precise Module Controls",
      description: "Define exactly who can View, Edit, or Delete records in every module of the application with a simple matrix interface.",
      image: rolePImg,
      align: "left" as const,
      points: ["Module-level visibility toggles", "Create, Read, Update, Delete controls", "Live permission updates"]
    },
    {
      category: "Organization",
      title: "Manage your workforce.",
      description: "Structure your company efficiently with hierarchical teams and automated routing. Keep your directory clean and up-to-date.",
      image: teamsImg,
      align: "right" as const,
      points: ["Hierarchical team structures", "Member directory", "Automated ticket routing by team"]
    },
    {
      category: "Project Execution",
      title: "Turn chaos into structured workflows.",
      description: "Organize massive workloads into distinct projects, track progress in real-time, and ensure every team member knows exactly what to do.",
      image: projectsImg,
      align: "left" as const,
      points: ["Project status tracking", "Unified milestone boards", "Visual progress indicators"]
    },
    {
      category: "Project Execution",
      title: "Track every milestone.",
      description: "Break down complex projects into manageable tasks, assign them to team members, and monitor completion seamlessly.",
      image: ptaskImg,
      align: "right" as const,
      points: ["Dedicated project tasks (PTASK)", "Dependency tracking", "Task state progression"]
    },
    {
      category: "ITSM CORE",
      title: "Turn chaos into rapid resolution.",
      description: "Detect, assign, and resolve critical incidents faster. With real-time alerts and severity tracking, your IT team will never miss a beat.",
      image: incidentImg,
      align: "left" as const,
      points: ["Automated escalation policies", "Real-time status tracking", "Detailed post-mortem history"]
    },
    {
      category: "IT Service Management",
      title: "Deep dive into issues.",
      description: "Manage SLAs, add work notes, communicate with reporters, and track the full timeline of every incident from a single pane.",
      image: incident2Img,
      align: "right" as const,
      points: ["Activity timeline", "Internal work notes", "SLA tracking per incident"]
    },
    {
      category: "Service Desk",
      title: "Streamlined service catalog.",
      description: "Make it easy for employees to request hardware, software access, and HR services through a unified portal.",
      image: servicerequestImg,
      align: "left" as const,
      points: ["Unified request catalog", "Approval-driven workflows", "Automated fulfillment tasks"]
    },
    {
      category: "Service Desk",
      title: "Fulfill requests flawlessly.",
      description: "Catalog tasks (SCTASK) allow your teams to work systematically on fulfilling complex, multi-step service requests.",
      image: sctaskImg,
      align: "right" as const,
      points: ["Multi-step fulfillment", "SCTASK dependency", "Request-driven data"]
    },
    {
      category: "Productivity",
      title: "Focus on what matters.",
      description: "A personalized queue showing every task assigned directly to you across all modules, so you never miss an action item.",
      image: assignedtaskImg,
      align: "left" as const,
      points: ["Unified task queue", "Cross-module visibility", "One-click actions"]
    },
    {
      category: "Productivity",
      title: "Ad-hoc task tracking.",
      description: "Create independent tasks for quick reminders, minor fixes, or follow-ups outside of major projects and incidents.",
      image: taskImg,
      align: "right" as const,
      points: ["Quick task creation", "Due dates & reminders", "Simple status states"]
    },
    {
      category: "Workflows",
      title: "Automated Approvals.",
      description: "Streamline decision-making with automated approval routing and clear audit trails for sensitive requests and changes.",
      image: approvalsImg,
      align: "left" as const,
      points: ["Single-click approve/reject", "Multi-stage approvals", "Complete audit history"]
    },
    {
      category: "Knowledge Management",
      title: "Knowledge Base.",
      description: "Deflect tickets before they happen. Empower your workforce with a rich, searchable knowledge base for FAQs and SOPs.",
      image: kbaseImg,
      align: "right" as const,
      points: ["Rich text article editing", "Categorized documentation", "Instant search & discovery"]
    },
    {
      category: "Communication",
      title: "Organization Updates.",
      description: "Keep everyone aligned. Broadcast critical maintenance windows or announcements directly to targeted teams.",
      image: orgupdatesImg,
      align: "left" as const,
      points: ["Global announcements", "Maintenance alerts", "Rich media support"]
    },
    {
      category: "Administration",
      title: "Super Admin Console.",
      description: "Complete control from a single pane of glass. Monitor platform health, manage global settings, and oversee all user activity.",
      image: settingsImg,
      align: "right" as const,
      points: ["System-wide configurations", "Security policies", "Audit logging"]
    }
];

export default function Features() {

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#00e5ff]/30 selection:text-white">
      <Navbar />
      
      <main>
        {/* HERO */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00e5ff]/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="mx-auto max-w-7xl px-5 text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-6">
                Everything you need to <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-blue-500">run your organization.</span>
              </h1>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                From granular permissions to automated IT service management, OrgMan provides a unified platform to scale your operations securely.
              </p>
            </motion.div>
          </div>
        </section>

        {/* 18 FEATURES MAP */}
        {productFeatures.map((feat, index) => (
          <React.Fragment key={index}>
            <FeatureSection {...feat} />
            {index < productFeatures.length - 1 && (
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            )}
          </React.Fragment>
        ))}

        {/* CTA */}
        <section className="relative py-32 text-center overflow-hidden border-t border-white/5 bg-[#050505]">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[500px] bg-[#00e5ff]/5 blur-[100px] pointer-events-none rounded-full"></div>
          
          <div className="relative z-10 mx-auto max-w-3xl px-5">
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              Ready to transform your org?
            </h2>
            <p className="text-xl text-zinc-400 mb-10">
              Join forward-thinking companies building better operations with OrgMan.
            </p>
            <Link to="/signup" className="inline-flex rounded-xl bg-[#00e5ff] px-8 py-4 text-lg font-bold text-black shadow-[0_0_40px_rgba(0,229,255,0.3)] transition hover:-translate-y-1 hover:shadow-[0_0_60px_rgba(0,229,255,0.5)]">
              Start your free trial <ArrowRight className="ml-2 mt-1" size={20} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
