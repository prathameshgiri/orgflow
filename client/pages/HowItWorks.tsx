import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { 
  Book, ChevronRight, Hash, Menu, X, ArrowRight, ShieldCheck, 
  UsersRound, Globe2, Briefcase, LayoutDashboard, LifeBuoy, 
  AlertTriangle, FilePlus, Activity, History, Settings, Lock, 
  CheckCircle2, Clock, Terminal, Database, Code, Info, Sparkles,
  Search, Sliders, Smartphone, Webhook
} from "lucide-react";

// Neumorphic shadow constants
const shadowRaised = "shadow-[4px_4px_10px_rgba(0,0,0,0.6),-4px_-4px_10px_rgba(255,255,255,0.03)]";
const shadowPressedInput = "shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]";
const shadowRaisedHover = "hover:shadow-[2px_2px_5px_rgba(0,0,0,0.6),-2px_-2px_5px_rgba(255,255,255,0.03)] hover:translate-y-[1px]";

// ══════════════════════════════════════════════════════════════════════════════
// REUSABLE UI COMPONENTS FOR DOCUMENTATION
// ══════════════════════════════════════════════════════════════════════════════

const DocSection = ({ id, title, icon: Icon, children }: { id: string, title: string, icon?: any, children: React.ReactNode }) => (
  <div id={id} className="scroll-mt-32 mb-20 border-t border-white/5 pt-12 mt-12">
    <div className="flex items-center gap-3 mb-6 pb-2 border-b border-white/10">
      {Icon && <Icon className="text-[#00e5ff]" size={28} />}
      <h2 className="text-4xl font-display font-bold text-white group cursor-pointer hover:text-[#00e5ff] transition-colors">
        <a href={`#${id}`} className="flex items-center gap-2">
          {title} <Hash size={20} className="opacity-0 group-hover:opacity-100 text-zinc-500" />
        </a>
      </h2>
    </div>
    <div className="space-y-6 text-zinc-300 leading-relaxed text-lg">
      {children}
    </div>
  </div>
);

const DocSubSection = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (
  <div id={id} className="scroll-mt-32 mt-16 mb-8 pl-4 border-l-2 border-white/5 hover:border-[#00e5ff]/50 transition-colors">
    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 group cursor-pointer hover:text-[#00e5ff] transition-colors">
      <a href={`#${id}`} className="flex items-center gap-2">
        {title} <Hash size={16} className="opacity-0 group-hover:opacity-100 text-zinc-500" />
      </a>
    </h3>
    <div className="space-y-5 text-zinc-400 text-base leading-7">
      {children}
    </div>
  </div>
);

const InfoAlert = ({ title, children, type = "info" }: { title: string, children: React.ReactNode, type?: "info" | "warning" | "success" | "danger" }) => {
  const colors = {
    info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    danger: "bg-rose-500/10 border-rose-500/20 text-rose-400"
  };
  return (
    <div className={`p-6 rounded-xl border ${colors[type]} my-8 shadow-lg`}>
      <div className="flex items-start gap-4">
        <Info size={24} className="shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold mb-2 text-lg">{title}</h4>
          <div className="text-sm opacity-90 leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
};

const CodeBlock = ({ code, language = "json" }: { code: string, language?: string }) => (
  <div className={`my-8 rounded-xl overflow-hidden border-none bg-[#141414] ${shadowRaised} border-none shadow-2xl`}>
    <div className={`flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#141414] ${shadowRaised} border-none`}>
      <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">{language} snippet</span>
      <div className="flex gap-2">
        <div className="w-3 h-3 rounded-full bg-rose-500/50"></div>
        <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
        <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
      </div>
    </div>
    <div className="p-6 overflow-x-auto">
      <pre className="text-sm font-mono text-[#00e5ff]/90 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  </div>
);

const StepBox = ({ number, title, children }: { number: number, title: string, children: React.ReactNode }) => (
  <div className={`flex gap-5 p-6 rounded-2xl border-none bg-[#141414] ${shadowRaised} border-none hover:bg-[#151515] hover:border-white/10 transition-all shadow-md`}>
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#00e5ff]/10 border border-[#00e5ff]/20 flex items-center justify-center text-[#00e5ff] font-bold text-lg">
      {number}
    </div>
    <div>
      <h4 className="text-white font-bold text-lg mb-2">{title}</h4>
      <div className="text-sm text-zinc-400 leading-relaxed">{children}</div>
    </div>
  </div>
);

const DataTable = ({ headers, rows }: { headers: string[], rows: React.ReactNode[][] }) => (
  <div className={`overflow-x-auto my-8 rounded-xl border-none bg-[#141414] ${shadowRaised} border-none shadow-xl`}>
    <table className="w-full text-left text-sm whitespace-nowrap">
      <thead className={`bg-[#141414] ${shadowPressedInput} border-none text-zinc-300 font-medium tracking-wide`}>
        <tr>
          {headers.map((h, i) => (
            <th key={i} className="px-6 py-4 border-b border-white/5 uppercase text-xs">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="text-zinc-400">
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors">
            {row.map((cell, j) => (
              <td key={j} className="px-6 py-4">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const StatusBadge = ({ status, color }: { status: string, color: string }) => {
  const colorMap: Record<string, string> = {
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    zinc: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${colorMap[color] || colorMap.zinc}`}>
      {status}
    </span>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SIDEBAR NAVIGATION DATA (40 SECTIONS TOTAL)
// ══════════════════════════════════════════════════════════════════════════════

const navGroups = [
  {
    title: "1. Core Platform",
    links: [
      { id: "introduction", label: "Platform Introduction" },
      { id: "architecture", label: "System Architecture" },
      { id: "tenancy-model", label: "Strict Multi-Tenancy" },
      { id: "security-compliance", label: "Security & Compliance" }
    ]
  },
  {
    title: "2. Organization Setup",
    links: [
      { id: "creating-orgs", label: "Creating Organizations" },
      { id: "editing-orgs", label: "Managing Org Settings" },
      { id: "custom-branding", label: "Custom Branding & Logos" },
      { id: "archiving-orgs", label: "Archiving Organizations" },
      { id: "org-history", label: "Organization Audit Logs" }
    ]
  },
  {
    title: "3. Identity & Users",
    links: [
      { id: "inviting-users", label: "Inviting New Users" },
      { id: "user-statuses", label: "User Status Lifecycle" },
      { id: "bulk-invites", label: "CSV Bulk Imports" },
      { id: "removing-users", label: "Offboarding & Suspension" },
      { id: "user-history", label: "User Action Audit Trail" }
    ]
  },
  {
    title: "4. Access Control (RBAC)",
    links: [
      { id: "rbac-overview", label: "RBAC Overview" },
      { id: "system-vs-org", label: "System vs Org Roles" },
      { id: "custom-roles", label: "Creating Custom Roles" },
      { id: "permission-scopes", label: "Permission Scopes" },
      { id: "role-history", label: "Role Modification Logs" }
    ]
  },
  {
    title: "5. Teams & Structuring",
    links: [
      { id: "creating-teams", label: "Creating Teams" },
      { id: "team-roles", label: "Team Leads & Permissions" },
      { id: "cross-functional", label: "Cross-Functional Teams" },
      { id: "team-history", label: "Team Membership Logs" }
    ]
  },
  {
    title: "6. Projects & Tasks",
    links: [
      { id: "project-lifecycle", label: "Project Lifecycle" },
      { id: "task-management", label: "Task Management" },
      { id: "sub-tasks", label: "Sub-Tasks & Nesting" },
      { id: "task-statuses", label: "Task Status Flow" },
      { id: "task-dependencies", label: "Task Dependencies" },
      { id: "time-tracking", label: "Time Tracking & Boards" },
      { id: "task-comments", label: "Comments & Attachments" },
      { id: "task-history", label: "Task Audit Log" }
    ]
  },
  {
    title: "7. ITSM: Incidents",
    links: [
      { id: "incident-management", label: "Incident Management" },
      { id: "incident-priority", label: "Priority Matrix Calculation" },
      { id: "incident-statuses", label: "Incident Status Flow" },
      { id: "incident-history", label: "Resolution & Root Cause" }
    ]
  },
  {
    title: "8. ITSM: Service Requests",
    links: [
      { id: "service-requests", label: "Service Request Catalog" },
      { id: "approval-workflows", label: "Multi-Level Approvals" },
      { id: "fulfillment", label: "Request Fulfillment" },
      { id: "request-history", label: "Request Audit Logs" }
    ]
  },
  {
    title: "9. Knowledge Base",
    links: [
      { id: "knowledge-base", label: "Knowledge Base Authoring" },
      { id: "kb-permissions", label: "Article Permissions" },
      { id: "kb-versioning", label: "Article Version History" }
    ]
  },
  {
    title: "10. Analytics & SLAs",
    links: [
      { id: "dashboards", label: "Real-Time Dashboards" },
      { id: "sla-tracking", label: "SLA Definition & Tracking" },
      { id: "sla-breaches", label: "SLA Breach Escalations" }
    ]
  },
  {
    title: "11. Advanced Integrations",
    links: [
      { id: "sso-saml", label: "SSO, SAML & OIDC Setup" },
      { id: "webhooks", label: "Outgoing Webhooks" },
      { id: "rest-api", label: "REST API & Tokens" },
      { id: "automation-rules", label: "Event-Driven Automation" }
    ]
  }
];

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function HowItWorks() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("introduction");

  // Intersection Observer to highlight active section in sidebar
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -50% 0px", threshold: 0 }
    );

    const sections = document.querySelectorAll("div[id]");
    sections.forEach((section) => observer.observe(section));

    return () => sections.forEach((section) => observer.unobserve(section));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#00e5ff]/30 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 flex pt-16 relative">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-md"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar Navigation */}
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: isSidebarOpen ? 0 : window.innerWidth >= 1024 ? 0 : -300 }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="fixed lg:sticky top-16 left-0 z-50 h-[calc(100vh-4rem)] w-80 shrink-0 border-r border-white/10 bg-[#0a0a0a] overflow-y-auto shadow-2xl custom-scrollbar"
        >
          <div className="p-8">
            <h3 className="font-display text-xl font-bold text-white mb-8 flex items-center gap-3 border-b border-white/5 pb-4">
              <Book size={20} className="text-[#00e5ff]" /> Organization Docs
            </h3>
            <div className="space-y-10">
              {navGroups.map((group, idx) => (
                <div key={idx}>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-4">{group.title}</h4>
                  <ul className="space-y-2">
                    {group.links.map((link) => (
                      <li key={link.id}>
                        <a 
                          href={`#${link.id}`}
                          onClick={(e) => {
                            setIsSidebarOpen(false);
                            setActiveSection(link.id);
                          }}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                            activeSection === link.id ? `bg-[#141414] ${shadowRaised} ${shadowRaisedHover} text-[#00e5ff] font-bold` : 'text-zinc-400 hover:text-white hover:bg-[#141414] hover:shadow-[2px_2px_5px_rgba(0,0,0,0.6),-2px_-2px_5px_rgba(255,255,255,0.03)] border-l-2 border-transparent'
                          }`}
                        >
                          {activeSection === link.id && <ChevronRight size={14} className="shrink-0" />}
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {/* Pad bottom of sidebar */}
            <div className="h-32"></div>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 bg-[#0a0a0a]">
          {/* Mobile Header Toggle */}
          <div className="lg:hidden sticky top-16 z-30 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md">
            <span className="font-display font-bold flex items-center gap-2"><Book size={16} className="text-[#00e5ff]" /> Documentation</span>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 -mr-2 text-zinc-400 hover:text-white transition-colors">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <div className="max-w-5xl mx-auto px-6 py-16 lg:px-16 lg:py-24">
            
            {/* Page Header */}
            <div className="mb-24 relative">
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#00e5ff]/5 rounded-full blur-[100px] pointer-events-none"></div>
              <div className={`inline-flex items-center gap-2 rounded-full border-none bg-[#141414] ${shadowRaised} border-none px-4 py-2 text-xs font-bold text-[#00e5ff] shadow-sm mb-8`}>
                <Sparkles size={14} /> Official Technical Manual v2.0
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-8 leading-[1.1]">
                Organization Management <br /> Documentation
              </h1>
              <p className="text-xl text-zinc-400 leading-relaxed max-w-3xl">
                The exhaustive, deeply detailed guide to configuring, managing, and scaling your organization using the ORG MAN platform. This manual covers every feature from multi-tenant architecture setup to advanced ITSM SLA logic, webhook integrations, and cryptographic audit trails.
              </p>
            </div>


            {/* =======================================================================================
                GROUP 1: CORE PLATFORM
            ======================================================================================= */}
            
            <DocSection id="introduction" title="Platform Introduction" icon={Terminal}>
              <p>
                ORG MAN is an enterprise-grade multi-tenant platform designed to handle complex organizational structures, identity management, Role-Based Access Control (RBAC), and IT Service Management (ITSM). 
              </p>
              <p>
                Whether you are a single company looking to formalize your IT desk, or a conglomerate managing dozens of subsidiary brands, ORG MAN provides the infrastructure to map your exact real-world hierarchy into a digital, permissioned environment.
              </p>
              <p>
                The platform is designed around the principle of <strong>Absolute Clarity</strong>. Every action is logged, every ticket is tracked against SLAs, and every permission is explicit.
              </p>
            </DocSection>

            <DocSubSection id="architecture" title="System Architecture">
              <p>The platform is built on a modern, robust tech stack ensuring extreme security and sub-100ms response speeds:</p>
              <div className="grid sm:grid-cols-2 gap-6 my-8">
                <StepBox number={1} title="Frontend SPA">React 18, Vite, TailwindCSS, and Framer Motion for a fluid, instantaneous user interface. Rendered globally via edge networks.</StepBox>
                <StepBox number={2} title="API Layer">Express.js Node server handling complex business logic, background job queues, and transactional email dispatching.</StepBox>
                <StepBox number={3} title="Database">Advanced PostgreSQL ensuring strict ACID compliance, complex relational integrity, and materialized views for analytics.</StepBox>
                <StepBox number={4} title="Security Engine">Row-Level Security (RLS) ensuring strict data isolation between tenants directly at the database engine level.</StepBox>
              </div>
            </DocSubSection>

            <DocSubSection id="tenancy-model" title="Strict Multi-Tenancy Model">
              <p>ORG MAN utilizes a strict <strong>Logical Isolation</strong> model. All organizations live in the same highly-available physical database infrastructure, but are strictly partitioned via PostgreSQL Row-Level Security (RLS) policies.</p>
              <InfoAlert title="Database-Level Guarantee" type="success">
                A user in "Organization A" can NEVER query data belonging to "Organization B", even if they somehow bypass the entire application API layer and run raw SQL against the database. The Postgres engine evaluates the authenticated user's JWT on every query and enforces the <code>organization_id</code> constraint automatically.
              </InfoAlert>
              <CodeBlock 
                language="sql" 
                code={`-- Example Postgres RLS Policy securing the tickets table
CREATE POLICY "Users can only view tickets in their organization"
ON tickets FOR SELECT
USING (
  organization_id = auth.jwt()->>'app_metadata'->>'org_id'
);`} 
              />
            </DocSubSection>

            <DocSubSection id="security-compliance" title="Security & Compliance">
              <p>The platform is built from day one to pass enterprise vendor security reviews:</p>
              <ul className="list-disc pl-6 space-y-3 mt-4">
                <li><strong>SOC 2 Type II:</strong> All access, changes, and approvals are cryptographically stamped.</li>
                <li><strong>Encryption:</strong> Data is encrypted at rest (AES-256) and in transit (TLS 1.3).</li>
                <li><strong>Passwords:</strong> Hashed using bcrypt with high cost factors. We encourage SSO via SAML instead.</li>
                <li><strong>Sessions:</strong> Managed via short-lived JWTs with automatic revocation on suspension.</li>
              </ul>
            </DocSubSection>


            {/* =======================================================================================
                GROUP 2: ORGANIZATION SETUP
            ======================================================================================= */}
            
            <DocSection id="creating-orgs" title="Creating Organizations" icon={Globe2}>
              <p>
                The Organization is the root node of the platform. Every user, team, role, project, and ticket belongs explicitly to an Organization. A single physical user account (an email address) can belong to multiple organizations and switch between them instantly.
              </p>
              <h4 className="text-white font-bold text-xl mt-10 mb-6">Step-by-Step Creation Guide</h4>
              <div className="space-y-6">
                <div className={`p-6 bg-[#141414] ${shadowRaised} border-none border-none rounded-xl`}>
                  <h5 className="font-bold text-[#00e5ff] mb-2">Step 1: Initiation</h5>
                  <p className="text-zinc-400">Log into your account. If your account is completely orphaned (belongs to zero organizations), the system will force you into the onboarding flow. Otherwise, click your avatar and select <strong>"Create New Workspace"</strong>.</p>
                </div>
                <div className={`p-6 bg-[#141414] ${shadowRaised} border-none border-none rounded-xl`}>
                  <h5 className="font-bold text-[#00e5ff] mb-2">Step 2: Configuration</h5>
                  <p className="text-zinc-400">Enter the <strong>Organization Name</strong> (e.g., "Stark Industries"). Select the primary timezone—this is critical as it dictates business hours and SLA breach calculations.</p>
                </div>
                <div className={`p-6 bg-[#141414] ${shadowRaised} border-none border-none rounded-xl`}>
                  <h5 className="font-bold text-[#00e5ff] mb-2">Step 3: Provisioning</h5>
                  <p className="text-zinc-400">Click Submit. The system generates a unique UUID <code>org_id</code>, creates default roles (Admin, Member, Read-Only), and assigns you the immutable system role of <strong>Organization Owner</strong>.</p>
                </div>
              </div>
            </DocSection>

            <DocSubSection id="editing-orgs" title="Managing Org Settings">
              <p>Organization settings dictate the behavior of the entire tenant. These can only be edited by users holding the <code>manage_organization</code> permission (typically Owners and Admins).</p>
              <DataTable 
                headers={["Setting Category", "Description", "System Impact"]}
                rows={[
                  [<strong className="text-white">General Info</strong>, "Name, Legal Entity, Industry.", "Updates UI text globally."],
                  [<strong className="text-white">Localization</strong>, "Timezone, Currency, Date Format.", "Alters SLA countdowns and financial reports."],
                  [<strong className="text-white">Security</strong>, "Session timeouts, 2FA enforcement.", "Forces users to re-authenticate or setup OTP."],
                  [<strong className="text-white">SSO Domains</strong>, "Allowed SAML/OIDC domains.", "Restricts who can join via email domain matching."]
                ]}
              />
            </DocSubSection>

            <DocSubSection id="custom-branding" title="Custom Branding & Logos">
              <p>White-label the platform to match your corporate identity. Go to <strong>Settings &gt; Branding</strong>.</p>
              <ul className="list-disc pl-6 space-y-3 mt-4">
                <li><strong>Logo:</strong> Upload an SVG or PNG. This replaces the default ORG MAN logo in the top navbar.</li>
                <li><strong>Brand Color:</strong> Provide a HEX code. This color is injected into CSS variables, styling buttons, active states, and focus rings.</li>
                <li><strong>Email Templates:</strong> Outgoing transactional emails (invites, ticket updates) via Resend.com will automatically adopt your logo and brand color.</li>
              </ul>
            </DocSubSection>

            <DocSubSection id="archiving-orgs" title="Archiving Organizations">
              <p>To prevent catastrophic accidental data loss, ORG MAN does not allow immediate hard deletion of organizations.</p>
              <InfoAlert title="Soft Delete Mechanism" type="warning">
                When an org is "deleted", it is actually <strong>Archived</strong>. Its <code>status</code> flag changes to <code>ARCHIVED</code>. Users cannot log in, APIs reject requests, and no new tickets can be created. The data sits in cold storage for 30 days before a background cron job permanently drops the relational rows from the database. You have 30 days to click "Restore".
              </InfoAlert>
            </DocSubSection>

            <DocSubSection id="org-history" title="Organization Audit Logs">
              <p>To maintain SOC 2 compliance, absolutely every change to the organization's settings is logged immutably in the <code>organization_audit_logs</code> table.</p>
              <CodeBlock 
                language="json" 
                code={`{
  "event_id": "evt_9001abc",
  "timestamp": "2026-10-02T10:00:00Z",
  "actor_id": "usr_9x8c7v...",
  "actor_name": "Tony Stark",
  "action": "UPDATE_ORG_SETTINGS",
  "ip_address": "192.168.1.100",
  "changes": {
    "brand_color": { "old": "#00e5ff", "new": "#ff0000" },
    "timezone": { "old": "America/New_York", "new": "America/Los_Angeles" }
  }
}`}
              />
            </DocSubSection>


            {/* =======================================================================================
                GROUP 3: IDENTITY & USERS
            ======================================================================================= */}

            <DocSection id="inviting-users" title="Inviting New Users" icon={UsersRound}>
              <p>
                Users must be explicitly invited to join your organization. We use a Magic Link system by default to ensure email ownership verification.
              </p>
              <h4 className="text-white font-bold text-xl mt-10 mb-6">The Deep Invitation Flow</h4>
              <div className="space-y-4">
                <StepBox number={1} title="Admin Initiation">An Admin navigates to <code>/dashboard/users/invite</code>, inputs one or more email addresses, selects a specific Role (e.g., "IT Agent"), and submits.</StepBox>
                <StepBox number={2} title="Record Creation">The backend creates a record in <code>organization_members</code> with status <StatusBadge status="PENDING" color="amber" />. A secure, cryptographically random token is generated and stored in Redis with a 48-hour TTL.</StepBox>
                <StepBox number={3} title="Email Dispatch">Our Node.js worker dispatches a transactional email via Resend API containing the magic link: <code>https://app.orgman.com/invite?token=XYZ</code>.</StepBox>
                <StepBox number={4} title="User Acceptance">The user clicks the link. The frontend verifies the token with the backend. If valid, the user sets a password (if they don't have an account) or just accepts (if they do). Status changes to <StatusBadge status="ACTIVE" color="green" />.</StepBox>
              </div>
            </DocSection>

            <DocSubSection id="user-statuses" title="User Status Lifecycle">
              <p>A member's access rights are dictated by their current status within that specific organization.</p>
              <DataTable 
                headers={["Database Status", "Visual Badge", "Meaning", "Login Allowed?"]}
                rows={[
                  [<span className="font-mono text-zinc-300">PENDING</span>, <StatusBadge status="PENDING" color="amber" />, "Invite sent, token is active, waiting for acceptance.", "No"],
                  [<span className="font-mono text-zinc-300">ACTIVE</span>, <StatusBadge status="ACTIVE" color="green" />, "User has accepted and is fully active in the org.", "Yes"],
                  [<span className="font-mono text-zinc-300">SUSPENDED</span>, <StatusBadge status="SUSPENDED" color="rose" />, "Admin has temporarily or permanently disabled access.", "No"],
                  [<span className="font-mono text-zinc-300">LEFT</span>, <StatusBadge status="LEFT" color="zinc" />, "User voluntarily left the org. Cannot rejoin without re-invite.", "No"]
                ]}
              />
            </DocSubSection>

            <DocSubSection id="bulk-invites" title="CSV Bulk Imports">
              <p>For enterprise migrations, inviting users one-by-one is impossible. Admins can upload a standard CSV file to invite up to 10,000 users at once.</p>
              <p className="mt-4">The CSV must contain specific headers: <code>email</code>, <code>first_name</code>, <code>last_name</code>, <code>department</code>, <code>role_name</code>.</p>
              <InfoAlert title="Background Processing" type="info">
                Because sending 10,000 emails synchronously would crash the HTTP request and hit API rate limits, the CSV upload merely queues the data into a Redis queue. A background worker processes the queue at a rate of 50 emails per second, providing the Admin with a real-time progress bar via WebSockets.
              </InfoAlert>
            </DocSubSection>

            <DocSubSection id="removing-users" title="Offboarding & Suspension">
              <p>When an employee leaves the company, you should <strong>Revoke Access (Suspend)</strong> rather than delete their account entirely.</p>
              <InfoAlert title="Why revoke instead of delete?" type="danger">
                Deleting a user from the database would trigger SQL cascading deletes or break foreign keys (e.g., "Who created this ticket? Who approved this expense?"). Revoking changes their status to <code>SUSPENDED</code>, killing their active JWT sessions instantly, while perfectly preserving the historical audit trail for compliance.
              </InfoAlert>
            </DocSubSection>

            <DocSubSection id="user-history" title="User Action Audit Trail">
              <p>Every login attempt, role change, team assignment, and suspension is logged in the user's specific audit trail.</p>
              <ul className="list-disc pl-6 space-y-3 mt-4 text-zinc-400">
                <li><code>USER_LOGIN_SUCCESS</code>: Logs IP address, User Agent, and geographic location.</li>
                <li><code>USER_LOGIN_FAILED</code>: Logs invalid password attempts to detect brute-force attacks.</li>
                <li><code>USER_ROLE_CHANGED</code>: Logs the admin who changed the role, the old role, and the new role.</li>
                <li><code>USER_SUSPENDED</code>: Logs the admin who performed the action and the mandatory provided reason string.</li>
              </ul>
            </DocSubSection>


            {/* =======================================================================================
                GROUP 4: ACCESS CONTROL (RBAC)
            ======================================================================================= */}

            <DocSection id="rbac-overview" title="Access Control (RBAC)" icon={ShieldCheck}>
              <p>
                ORG MAN uses an advanced, granular Role-Based Access Control (RBAC) system. The relationship is strictly defined: A <strong>User</strong> is assigned exactly one <strong>Role</strong> per organization. That <strong>Role</strong> contains many <strong>Permissions</strong>.
              </p>
              <p className="mt-4">
                When a user attempts an action (e.g., deleting a ticket), the backend API middleware evaluates if their assigned Role contains the exact required Permission (e.g., <code>tickets:delete</code>). If not, it throws a 403 Forbidden.
              </p>
            </DocSection>

            <DocSubSection id="system-vs-org" title="System vs Org Roles">
              <p>There are two tiers of roles to handle both platform administration and daily operations:</p>
              <div className="grid sm:grid-cols-2 gap-8 mt-6">
                <div className="p-8 border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent rounded-2xl shadow-lg">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                    <Database size={24} className="text-purple-400" />
                  </div>
                  <h4 className="text-xl text-white font-bold mb-3">System Roles</h4>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-4">Hardcoded, immutable roles that exist across the entire platform. Cannot be edited.</p>
                  <ul className="text-sm space-y-2 text-zinc-300 border-t border-white/10 pt-4">
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-400"/> <strong>Super Admin:</strong> Platform maintainers only.</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-400"/> <strong>Org Owner:</strong> The billing owner of a specific tenant.</li>
                  </ul>
                </div>
                <div className="p-8 border border-[#00e5ff]/20 bg-gradient-to-br from-[#00e5ff]/10 to-transparent rounded-2xl shadow-lg">
                  <div className="w-12 h-12 bg-[#00e5ff]/20 rounded-xl flex items-center justify-center mb-6">
                    <UsersRound size={24} className="text-[#00e5ff]" />
                  </div>
                  <h4 className="text-xl text-white font-bold mb-3">Organization Roles</h4>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-4">Roles defined entirely within a specific tenant. Fully customizable by Org Admins.</p>
                  <ul className="text-sm space-y-2 text-zinc-300 border-t border-white/10 pt-4">
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#00e5ff]"/> <strong>Admin:</strong> Has <code>*:*</code> permissions locally.</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#00e5ff]"/> <strong>IT Agent:</strong> Can resolve and manage tickets.</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#00e5ff]"/> <strong>Employee:</strong> Default. Can only submit requests.</li>
                  </ul>
                </div>
              </div>
            </DocSubSection>

            <DocSubSection id="custom-roles" title="Creating Custom Roles">
              <p>Every company operates differently. Go to <strong>Administration &gt; Roles</strong> to create a custom role.</p>
              <p className="mt-4">You must provide a Name (e.g., "Network Engineer", "Financial Auditor", "HR Lead") and explicitly toggle the exact permission scopes they require. For example, a Financial Auditor might have <code>reports:view</code> and <code>approvals:view</code> but absolutely no <code>tickets:create</code> permissions.</p>
            </DocSubSection>

            <DocSubSection id="permission-scopes" title="Detailed Permission Scopes">
              <p>Permissions are formatted strictly as <code>module:action</code>. Below is a subset of the hundreds of available scopes:</p>
              <DataTable 
                headers={["Module", "Permission Scope", "Description & Impact"]}
                rows={[
                  ["Identity", <code className="text-[#00e5ff] bg-[#00e5ff]/10 px-1 py-0.5 rounded">users:invite</code>, "Allows sending invites. High risk if misused."],
                  ["Identity", <code className="text-[#00e5ff] bg-[#00e5ff]/10 px-1 py-0.5 rounded">users:suspend</code>, "Allows cutting off access. Admin only usually."],
                  ["ITSM", <code className="text-[#00e5ff] bg-[#00e5ff]/10 px-1 py-0.5 rounded">incidents:create</code>, "Allows reporting a new broken asset/service."],
                  ["ITSM", <code className="text-[#00e5ff] bg-[#00e5ff]/10 px-1 py-0.5 rounded">incidents:resolve</code>, "Allows marking an incident as fixed. Agents only."],
                  ["Settings", <code className="text-[#00e5ff] bg-[#00e5ff]/10 px-1 py-0.5 rounded">roles:manage</code>, "Allows creating/editing roles. Extreme risk."]
                ]}
              />
            </DocSubSection>

            <DocSubSection id="role-history" title="Role Modification Logs">
              <p>If someone alters the permissions of the "Employee" role to suddenly include <code>incidents:resolve</code>, that is a massive security event. Every modification to a role's permissions is saved in <code>role_audit_logs</code>, storing the exact diff of added/removed scopes.</p>
            </DocSubSection>


            {/* =======================================================================================
                GROUP 5: TEAMS & STRUCTURING
            ======================================================================================= */}

            <DocSection id="creating-teams" title="Teams & Structuring" icon={Briefcase}>
              <p>
                While Roles dictate <strong>what</strong> you can do, Teams dictate <strong>where</strong> you belong and <strong>how work is routed</strong>. Teams group users together logically (e.g., "Database Team", "HR Onboarding Team", "L1 Helpdesk").
              </p>
              <p className="mt-4">
                Routing a ticket to "The Database Team" is vastly superior to assigning it to "John Doe", because if John goes on vacation, the team queue still surfaces the ticket to available members.
              </p>
            </DocSection>

            <DocSubSection id="team-roles" title="Team Leads & Permissions">
              <p>Within a team, users have internal team designations that grant localized permissions without needing global Admin rights:</p>
              <ul className="list-disc pl-6 space-y-4 mt-6 text-zinc-300">
                <li>
                  <strong className="text-white">Team Lead:</strong> 
                  <p className="text-sm mt-1 text-zinc-400">Can add/remove members from the team, edit the team description, and force-reassign tickets within the team queue to specific members to balance workload.</p>
                </li>
                <li>
                  <strong className="text-white">Member:</strong> 
                  <p className="text-sm mt-1 text-zinc-400">Standard participant. Can view the team queue, pick up unassigned team tickets, and collaborate on team projects.</p>
                </li>
              </ul>
            </DocSubSection>

            <DocSubSection id="cross-functional" title="Cross-Functional Teams">
              <p>A user can belong to multiple teams simultaneously. For example, a senior developer might be in the "Frontend Engineering" team and the "Security Triage Taskforce" team. They will see unified ticket queues on their dashboard.</p>
            </DocSubSection>

            <DocSubSection id="team-history" title="Team Membership Logs">
              <p>Every addition, removal, or promotion (to Lead) within a team is logged.</p>
              <CodeBlock 
                language="sql" 
                code={`SELECT actor_name, action, target_user, created_at 
FROM team_audit_logs 
WHERE team_id = 'tm_999' 
ORDER BY created_at DESC;

/* 
Result:
"Bruce Wayne" | "PROMOTED_TO_LEAD" | "Peter Parker" | "2026-10-02"
"Bruce Wayne" | "ADDED_MEMBER"     | "Clark Kent"   | "2026-10-01"
*/`}
              />
            </DocSubSection>


            {/* =======================================================================================
                GROUP 6: PROJECTS & TASKS
            ======================================================================================= */}

            <DocSection id="project-lifecycle" title="Projects & Tasks" icon={LayoutDashboard}>
              <p>
                Projects are large-scale initiatives (e.g., "Q3 Office Relocation", "Server Migration to AWS"). They act as heavy-duty containers for hundreds of underlying tasks, providing timeline tracking, budgeting, and phase milestones.
              </p>
            </DocSection>

            <DocSubSection id="task-management" title="Task Management Details">
              <p>Tasks are the atomic units of work in the system. A fully fleshed out task contains:</p>
              <ul className="list-disc pl-6 space-y-3 mt-4 text-zinc-400">
                <li><strong>Title & Description:</strong> Markdown supported text explaining the work required.</li>
                <li><strong>Assignee:</strong> The specific user doing the work.</li>
                <li><strong>Parent Project:</strong> Optional link to a macro project.</li>
                <li><strong>Due Date & Estimations:</strong> Hard deadlines and story-point/hour estimations.</li>
                <li><strong>Priority:</strong> <StatusBadge status="LOW" color="zinc" /> <StatusBadge status="MEDIUM" color="blue" /> <StatusBadge status="HIGH" color="amber" /> <StatusBadge status="URGENT" color="rose" /></li>
              </ul>
            </DocSubSection>

            <DocSubSection id="task-statuses" title="Task Status Flow Matrix">
              <p>Tasks move through a strict state machine. Moving backward is possible, but logged.</p>
              <div className={`flex flex-wrap items-center gap-3 mt-6 p-6 bg-[#141414] ${shadowRaised} border-none rounded-xl border-none shadow-inner`}>
                <StatusBadge status="TODO" color="zinc" />
                <ArrowRight size={16} className="text-zinc-600" />
                <StatusBadge status="IN_PROGRESS" color="blue" />
                <ArrowRight size={16} className="text-zinc-600" />
                <StatusBadge status="IN_REVIEW" color="amber" />
                <ArrowRight size={16} className="text-zinc-600" />
                <StatusBadge status="DONE" color="green" />
              </div>
            </DocSubSection>

            <DocSubSection id="sub-tasks" title="Sub-Tasks & Nesting">
              <p>Large tasks can be broken down into Sub-Tasks. A Parent Task tracks the overall progress based on the completion ratio of its Sub-Tasks.</p>
              <ul className="list-disc pl-6 space-y-3 mt-4 text-zinc-400">
                <li>A Parent Task cannot be marked as <code>DONE</code> until all Sub-Tasks are <code>DONE</code>.</li>
                <li>Sub-tasks have their own assignees, due dates, and distinct chat threads.</li>
              </ul>
            </DocSubSection>

            <DocSubSection id="task-dependencies" title="Task Dependencies">
              <p>Tasks can be linked using Dependency Types. If Task B depends on Task A, Task B cannot be moved to IN_PROGRESS until Task A is marked DONE. The system enforces this block natively.</p>
              <p className="mt-2 text-sm text-zinc-500">Types: <code>BLOCKS</code>, <code>BLOCKED_BY</code>, <code>RELATES_TO</code>, <code>DUPLICATES</code>.</p>
            </DocSubSection>

            <DocSubSection id="time-tracking" title="Time Tracking & Boards">
              <p>ORG MAN natively supports agile methodologies.</p>
              <ul className="list-disc pl-6 space-y-3 mt-4 text-zinc-400">
                <li><strong>Kanban Boards:</strong> View tasks as cards organized by status columns. Drag-and-drop instantly updates the database status.</li>
                <li><strong>Time Tracking:</strong> Users can manually log hours worked against a specific task, or use the built-in Start/Stop stopwatch widget on the task detail page.</li>
              </ul>
            </DocSubSection>

            <DocSubSection id="task-comments" title="Comments & Attachments">
              <p>Collaboration happens directly on the task.</p>
              <ul className="list-disc pl-6 space-y-3 mt-4 text-zinc-400">
                <li><strong>Comments:</strong> Fully rich-text (Markdown) supporting <code>@mentions</code>. Mentioning a user triggers a real-time WebSocket notification to their dashboard and sends an email.</li>
                <li><strong>Attachments:</strong> Securely upload images, PDFs, and files directly to a task via integrated encrypted cloud storage.</li>
              </ul>
            </DocSubSection>

            <DocSubSection id="task-history" title="Task Audit Log">
              <p>Every state transition, comment, description edit, and reassignment is recorded chronologically in the task's history timeline, visible at the bottom of the Task Details page.</p>
            </DocSubSection>


            {/* =======================================================================================
                GROUP 7: ITSM INCIDENTS
            ======================================================================================= */}

            <DocSection id="incident-management" title="ITSM: Incidents" icon={AlertTriangle}>
              <p>
                In ITIL framework terminology, an Incident is an unplanned interruption to an IT service or reduction in the quality of an IT service. The sole goal of Incident Management is to restore normal service operation as quickly as possible.
              </p>
              <p className="mt-4">Example: "The main office WiFi is down" or "I cannot log into my email".</p>
            </DocSection>

            <DocSubSection id="incident-priority" title="Priority Matrix Calculation">
              <p>Priority is NOT guessed by the user. The user selects <strong>Impact</strong> (How many people are affected? Me, My Team, Entire Company) and <strong>Urgency</strong> (Is work completely stopped?). The system calculates Priority automatically:</p>
              <DataTable 
                headers={["Calculated Priority", "Target Resolution Time", "Notification Protocol"]}
                rows={[
                  [<StatusBadge status="P1 - Critical" color="rose" />, "4 Hours", "Immediate SMS & PagerDuty alert to IT Leads"],
                  [<StatusBadge status="P2 - High" color="amber" />, "8 Hours", "Urgent Email to assigned Team Lead"],
                  [<StatusBadge status="P3 - Moderate" color="blue" />, "24 Hours", "Dashboard Notification & standard queue"],
                  [<StatusBadge status="P4 - Low" color="zinc" />, "48 Hours", "Standard visual queue"]
                ]}
              />
            </DocSubSection>

            <DocSubSection id="incident-statuses" title="Incident Status Flow">
              <p>Incidents follow a highly specific ITIL-compliant lifecycle:</p>
              <ul className="list-disc pl-6 space-y-4 mt-6 text-zinc-300">
                <li><StatusBadge status="NEW" color="purple" /> <span className="ml-2 text-zinc-400">Created by the user, waiting in the general queue for triage.</span></li>
                <li><StatusBadge status="ASSIGNED" color="cyan" /> <span className="ml-2 text-zinc-400">Triage complete, assigned to a specific IT agent or team.</span></li>
                <li><StatusBadge status="IN_PROGRESS" color="blue" /> <span className="ml-2 text-zinc-400">Agent is actively investigating the issue. SLA timer is ticking.</span></li>
                <li><StatusBadge status="ON_HOLD" color="amber" /> <span className="ml-2 text-zinc-400">Waiting for third-party vendor or user input. SLA timer pauses.</span></li>
                <li><StatusBadge status="RESOLVED" color="emerald" /> <span className="ml-2 text-zinc-400">Fix applied, waiting for the user to confirm it works.</span></li>
                <li><StatusBadge status="CLOSED" color="zinc" /> <span className="ml-2 text-zinc-400">Confirmed resolved. The ticket is permanently locked to preserve data.</span></li>
              </ul>
            </DocSubSection>

            <DocSubSection id="incident-history" title="Resolution & Root Cause">
              <p>When an incident is moved to RESOLVED, the agent MUST provide a <strong>Resolution Code</strong> (e.g., "Hardware Replaced", "Software Patched") and <strong>Resolution Notes</strong>. This data automatically populates the Knowledge Base over time to help future agents.</p>
            </DocSubSection>


            {/* =======================================================================================
                GROUP 8: ITSM REQUESTS
            ======================================================================================= */}

            <DocSection id="service-requests" title="ITSM: Requests & Approvals" icon={FilePlus}>
              <p>
                Unlike incidents (where something is broken), Service Requests are formal requests for something new. Examples include: "I need a new Macbook Pro", "I need access to the AWS Production environment", or "Requesting a software license for Adobe Creative Cloud".
              </p>
            </DocSection>

            <DocSubSection id="approval-workflows" title="Multi-Level Approvals">
              <p>Many requests require managerial or financial approval before IT is allowed to fulfill them. ORG MAN handles this via automated, conditional workflows.</p>
              <div className="p-8 bg-[#0a0a0a] rounded-2xl border-none mt-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00e5ff]/5 rounded-bl-full"></div>
                <div className="space-y-8 relative z-10">
                  <div className="flex items-start gap-5">
                    <div className="mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-zinc-500/20"><UsersRound size={16} className="text-zinc-400"/></div>
                    <div>
                      <h5 className="font-bold text-white text-lg">1. Request Submitted</h5>
                      <p className="text-sm text-zinc-400 mt-1">Employee requests a $2000 software license via the self-service portal.</p>
                    </div>
                  </div>
                  <div className="absolute left-[34px] top-[40px] w-[2px] h-12 bg-white/10"></div>
                  
                  <div className="flex items-start gap-5">
                    <div className="mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20"><CheckCircle2 size={16} className="text-amber-400"/></div>
                    <div>
                      <h5 className="font-bold text-white text-lg">2. Financial Approval</h5>
                      <p className="text-sm text-zinc-400 mt-1">Because cost &gt; $500, an email is automatically routed to the Department Head for financial sign-off.</p>
                    </div>
                  </div>
                  <div className="absolute left-[34px] top-[120px] w-[2px] h-12 bg-white/10"></div>

                  <div className="flex items-start gap-5">
                    <div className="mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20"><ShieldCheck size={16} className="text-blue-400"/></div>
                    <div>
                      <h5 className="font-bold text-white text-lg">3. IT Fulfillment</h5>
                      <p className="text-sm text-zinc-400 mt-1">Once approved, the ticket routes to the IT team queue for actual software provisioning.</p>
                    </div>
                  </div>
                </div>
              </div>
            </DocSubSection>

            <DocSubSection id="fulfillment" title="Request Fulfillment">
              <p>Once approved, the request behaves similarly to a standard task. IT agents pick it up, provision the requested asset or access, and mark the request as FULFILLED.</p>
            </DocSubSection>

            <DocSubSection id="request-history" title="Request Audit Logs">
              <p>Approvals are the most heavily audited aspect of the system. An approval action is cryptographically stamped with the approver's user ID, IP address, and timestamp to ensure bulletproof SOX/SOC2 compliance audits during financial reviews.</p>
            </DocSubSection>


            {/* =======================================================================================
                GROUP 9: KNOWLEDGE BASE
            ======================================================================================= */}

            <DocSection id="knowledge-base" title="Knowledge Base" icon={Book}>
              <p>
                The Knowledge Base (KB) allows IT agents and HR to author rich, Markdown-based articles. It serves dual purposes: standardizing IT procedures, and allowing employees to self-resolve issues without filing tickets.
              </p>
            </DocSection>

            <DocSubSection id="kb-permissions" title="Article Permissions">
              <p>Articles can be scoped via permissions:</p>
              <ul className="list-disc pl-6 space-y-3 mt-4 text-zinc-400">
                <li><strong>Public (Internal):</strong> Visible to all logged-in employees for self-service (e.g., "How to connect to Office WiFi").</li>
                <li><strong>Restricted:</strong> Visible only to specific Teams (e.g., "Server Reboot Protocol", visible only to the Infrastructure Team).</li>
              </ul>
            </DocSubSection>

            <DocSubSection id="kb-versioning" title="Article Version History">
              <p>Every time an article is updated, a new version is created. Admins can view the diff between versions and rollback if necessary.</p>
            </DocSubSection>



            {/* =======================================================================================
                GROUP 10: ANALYTICS & SLAS
            ======================================================================================= */}

            <DocSection id="dashboards" title="Analytics & SLAs" icon={Activity}>
              <p>
                The Analytics Dashboard provides real-time metrics of your entire organization's health. We use Postgres Materialized Views to pre-calculate heavy aggregations, ensuring the dashboard loads in milliseconds even with millions of tickets.
              </p>
            </DocSection>

            <DocSubSection id="sla-tracking" title="SLA Definition & Tracking">
              <p>Service Level Agreements (SLAs) define the maximum acceptable time to respond to or resolve a ticket. SLAs only tick during defined Business Hours based on the Organization's Timezone setting.</p>
            </DocSubSection>

            <DocSubSection id="sla-breaches" title="SLA Breach Escalations">
              <p>A Node.js cron job runs continuously to check ticket timestamps.</p>
              <InfoAlert title="Breach Escalation Mechanics" type="danger">
                If an incident remains in the <code>NEW</code> state beyond its Target Response Time, it is marked as <StatusBadge status="SLA BREACHED" color="rose" />. The system will automatically email the Team Lead, highlight the ticket in red on the dashboard, and bump its priority up by one level.
              </InfoAlert>
            </DocSubSection>


            {/* =======================================================================================
                GROUP 11: ADVANCED INTEGRATIONS
            ======================================================================================= */}

            <DocSection id="sso-saml" title="Advanced Integrations" icon={Sliders}>
              <p>
                ORG MAN is designed to slot into existing enterprise infrastructure. We do not want to be another isolated silo.
              </p>
            </DocSection>

            <DocSubSection id="sso-saml" title="SSO, SAML & OIDC Setup">
              <p>We strongly recommend disabling email/password logins and enabling SSO. Go to Settings &gt; Security to input your Identity Provider (IdP) metadata XML. We natively support Okta, Microsoft Entra ID (Azure AD), and Google Workspace.</p>
            </DocSubSection>

            <DocSubSection id="webhooks" title="Outgoing Webhooks">
              <p>Webhooks allow you to build custom integrations. When an event occurs (e.g., ticket resolved, user suspended), we fire an HTTP POST request to your specified URL.</p>
              <CodeBlock 
                language="json" 
                code={`// Example Webhook Payload sent to your server
{
  "event": "incident.resolved",
  "timestamp": "2026-10-02T15:30:00Z",
  "data": { 
    "ticket_id": "INC-404",
    "resolved_by": "usr_999",
    "resolution_code": "NETWORK_RESET"
  }
}`} 
              />
            </DocSubSection>

            <DocSubSection id="rest-api" title="REST API & Tokens">
              <p>Generate Personal Access Tokens (PATs) from your profile settings. You can use these tokens to programmatically interact with the ORG MAN API. Rate limits are set to 1000 requests per minute per IP.</p>
            </DocSubSection>

            <DocSubSection id="automation-rules" title="Event-Driven Automation">
              <p>Set up IF/THEN rules without writing code.</p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-zinc-400">
                <li><strong>IF</strong> Ticket Title contains "Password Reset" <strong>THEN</strong> Assign to "L1 Helpdesk Team".</li>
                <li><strong>IF</strong> Ticket Priority is "P1" <strong>THEN</strong> Fire Webhook to PagerDuty.</li>
              </ul>
            </DocSubSection>

            {/* Bottom Padding */}
            <div className="h-64"></div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
