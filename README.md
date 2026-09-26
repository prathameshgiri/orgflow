# 🌟 ORG MAN (ORG MAN) - ENTERPRISE MULTI-TENANT WORKSPACE & ITSM PLATFORM 🌟

<p align="center">
  <em>A next-generation digital workspace and Service Management (ITSM) platform built for scale, security, and seamless collaboration.</em>
</p>

---

# 🚀 INTRODUCTION: WHAT DOES THIS PLATFORM DO?

**ORG MAN** (also known as ORG MAN) is a centralized, comprehensive digital workspace designed to replace fragmented toolchains. Instead of using separate applications for project management, IT ticketing, internal communication, and document storage, ORG MAN brings everything under one unified, secure umbrella.

It is built on a **Multi-Tenant Architecture**, meaning multiple organizations can register on the same platform while keeping their data completely isolated, secure, and independent. 

Within their secure workspace, each organization can independently manage:
- **Users, Roles & Granular Permissions (RBAC):** Complete control over who can see and do what.
- **Teams, Departments & Clients:** Organizing the workforce and external stakeholders efficiently.
- **Projects & Tasks:** Agile boards, Kanban views, and detailed task tracking.
- **Service Management & ITSM:** Handling Incidents, Service Requests, Problems, and Changes.
- **Approvals, SLAs, and Workflows:** Ensuring tasks and requests are resolved within time limits.
- **Knowledge Base, Assets, and Configuration Items (CMDB):** Centralizing information and IT infrastructure.
- **Internal Chat, Announcements & Notifications:** Seamless, real-time communication.

Think of ORG MAN as a powerful combination of **Jira, ServiceNow, ClickUp, and Notion**—tailored for enterprise-level operations and collaboration, but with a beautiful, modern, and lightning-fast user interface.

---

# 🎯 TARGET AUDIENCE: WHO IS THIS BUILT FOR?

This platform is specifically engineered for **B2B (Business-to-Business)** environments. The ideal customers and organizations include:

1. **IT Service Companies & Managed Service Providers (MSPs):**
   - Need a robust ITSM system to track client incidents, service requests, and SLAs.
   - Require a CMDB to track client assets.

2. **Startups & Scaling Enterprises:**
   - Need an internal tool for project management, bug tracking, and sprint planning.
   - Want a unified workspace to manage their teams, departments, and cross-functional collaborations without paying for 10 different SaaS subscriptions.

3. **Colleges, Universities & Educational Institutions:**
   - Managing faculty requests, IT lab incidents, and campus facility management.

4. **NGOs & Non-Profit Organizations:**
   - Organizing volunteers (users), tracking campaigns (projects), and managing donors (clients).

---

# 🏁 THE ACTUAL GOAL OF THE PLATFORM

The core philosophy and actual goal of ORG MAN is **Consolidation and Automation**. 

### 1. Eliminating Tool Fatigue
Modern workers suffer from "Context Switching"—moving between Slack for chat, Jira for tickets, Notion for docs, and Asana for tasks. ORG MAN's goal is to provide a **Single Source of Truth**. By having tasks, docs, chat, and tickets in one place, productivity skyrockets.

### 2. Uncompromising Security & Isolation
With B2B SaaS, data leaks are catastrophic. The goal is to provide **Bank-Grade Security** via PostgreSQL Row Level Security (RLS). Even if a developer makes a mistake in the backend API, the database itself will mathematically refuse to serve Data from Organization A to a User in Organization B.

### 3. Enterprise Power with Startup UX
Enterprise software (like ServiceNow or SAP) is famously difficult to use and visually outdated. ORG MAN aims to deliver the extreme power and configurability of enterprise software, but packaged in a **premium, consumer-grade User Experience (UX)**.

---

# 🎨 USER EXPERIENCE (UX) & UI DESIGN PHILOSOPHY

The UI/UX is built to wow the user at first glance. It feels like a **modern, premium SaaS product**.

### Visual Excellence
- **Aesthetics:** Clean, professional, and enterprise-ready. It features beautiful micro-animations, smooth gradients, glassmorphism effects, and a modern color palette.
- **Typography:** Utilizing modern, highly legible fonts (Inter/Geist) for maximum readability during long working sessions.
- **Themes:** First-class support for both Light and Dark modes. Dark mode is specifically tailored to reduce eye strain for power users.

### Intuitive Navigation
- **Sidebar & Layout:** A collapsible, context-aware sidebar that adapts based on the user's current module (e.g., switching from Project Management to IT Service Desk changes the available options).
- **Command Palette (Cmd+K):** A universal search and action palette. Users can navigate anywhere or trigger actions instantly using only their keyboard.
- **Breadcrumbs:** Deep hierarchical navigation is always visible so users never feel lost.

### State Management & Feedback
- **Optimistic UI Updates:** When a user marks a task as complete, the UI updates instantly without waiting for the network, making the app feel incredibly fast.
- **Loading States:** Thoughtful loading skeletons prevent jarring layout shifts.
- **Empty States:** Beautiful illustrations and "Call to Action" buttons guide users when a list is empty.
- **Toast Notifications:** Non-intrusive alerts (powered by Sonner) ensure the user always knows the result of their actions.

---

# ⚙️ TECHNICAL DECISIONS & ARCHITECTURE

Building a multi-tenant SaaS requires strict data isolation, scalable architecture, and maintainable code. Here are the core decisions that define ORG MAN:

### 1. Multi-Tenancy Strategy (Row Level Security)
Every table in the database contains an `organization_id` column. We use **Row Level Security (RLS)** in PostgreSQL. This means we write policies directly in the database that state: *"Only allow the `SELECT`, `INSERT`, `UPDATE`, or `DELETE` operation if the `organization_id` of the row matches the `organization_id` of the currently authenticated user's JWT."* This guarantees 100% data isolation.

### 2. Frontend: Single Page Application (SPA)
We chose React 18 with Vite and React Router (SPA mode). This provides a highly responsive, app-like feel. Once the initial bundle is loaded, navigating between pages is instantaneous because there are no full page reloads.

### 3. Backend: Express Integrated with Vite
The backend runs on Node.js/Express. For the best developer experience, the Express API is integrated directly into the Vite dev server. This allows developers to run `pnpm dev` and have both the frontend and backend running on a single port with Hot Module Replacement (HMR). For production, it easily compiles into standard Node.js scripts or Serverless functions.

### 4. End-to-End Type Safety (Zod & TypeScript)
We use TypeScript universally. Using **Zod**, we define schemas in a `shared/` directory. These schemas validate forms on the frontend and simultaneously validate incoming API payloads on the backend. If a database schema changes, TypeScript will immediately throw errors across the entire stack until it is fixed.

---

# 🛠 TECH STACK & TOOLS

### Frontend Ecosystem
- **Core Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router 6
- **Styling:** TailwindCSS 4 (Utility-first CSS framework for rapid UI development)
- **UI Components:** Radix UI (Unstyled, accessible components customized with Tailwind)
- **Icons:** Lucide React
- **Animations:** Framer Motion (For fluid layout animations and page transitions)
- **Global State:** Zustand (Lightweight, boilerplate-free state management)
- **Server State & Caching:** React Query (TanStack Query)
- **Forms & Validation:** React Hook Form combined with Zod

### Backend & API
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Authentication:** Supabase Auth (Secure, JWT-based authentication)
- **Authorization:** Custom RBAC (Role-Based Access Control) Middlewares

### Database & Storage
- **Database:** PostgreSQL (Hosted via Supabase)
- **Security:** Advanced Row Level Security (RLS)
- **File Storage:** Supabase Storage (for avatars, document attachments, and task assets)

---

# 🤖 DEEP DIVE: WHAT IS AUTOMATION IN ORG MAN?

Enterprise software is only as good as the time it saves. **Automation** in ORG MAN is a powerful rules engine designed to remove manual, repetitive tasks, enforce organizational standards, and ensure nothing falls through the cracks. 

Here is exactly what Automation means in this project:

### 1. SLA (Service Level Agreement) Management
SLAs are automated timers that guarantee a certain level of service. 
- **Time to First Response:** If a high-priority incident is logged by a client, the system automatically starts a timer. If an agent hasn't replied within 30 minutes, the automation triggers an escalation.
- **Time to Resolution:** Ensures tickets are closed within a business-mandated timeframe.
- **Automated Escalations:** If an SLA is breached, the automation engine can automatically reassign the ticket to a senior manager and send a high-priority email/SMS alert.

### 2. Workflow Automations (Triggers & Actions)
ORG MAN allows administrators to define "If This, Then That" (IFTTT) style rules.
- **Triggers:** Events that occur in the system (e.g., "A new Employee is created", "A Task status changes to 'Done'", "A High Priority Incident is logged").
- **Conditions:** Rules that must be met (e.g., "...AND the Department is 'Engineering'").
- **Actions:** Automated system behaviors (e.g., "...THEN assign an onboarding task list, send a welcome email, and post a message in the internal chat").

### 3. Automated Routing & Assignment Rules
When a ticket or request is created, it shouldn't sit unassigned. 
- **Skill-based Routing:** Automatically assigns an incident to the agent with the lowest workload who has the specific skill required (e.g., Database errors go to the DBA team).
- **Round Robin:** Evenly distributes incoming requests among a team of agents automatically.

### 4. Approval Workflows
In large organizations, you can't just change a production server or purchase new equipment without permission.
- **Multi-stage Approvals:** If a user requests a "New MacBook Pro" from the Service Catalog, automation instantly blocks the request and sends an approval notification to their direct Manager. If approved, it automatically forwards to the Finance Department. Once Finance approves, it automatically assigns a task to IT to procure the laptop.

### 5. Automated Notifications
The system intelligently knows when to notify people without spamming them. Push notifications, emails, and in-app toasts are triggered automatically based on mention tags, status changes, and approaching deadlines.

---

# 📖 DETAILED GUIDE: HOW TO USE ORG MAN

This section provides a comprehensive step-by-step walkthrough of how an organization uses ORG MAN from Day 1 to daily operations.

### Phase 1: Onboarding & Initialization
1. **Registration:** You (the founder or IT head) visit the site and sign up. Since you are the first user, the system prompts you to create your "Organization Workspace". 
2. **Organization Owner:** You are automatically assigned the "Organization Owner" role. You have ultimate power over this workspace.
3. **Branding:** Navigate to **Settings > Organization**. Upload your company logo, set your primary brand colors, and configure your timezone and business hours.

### Phase 2: Building the Hierarchy
1. **Departments & Teams:** Go to the **Teams** module. Create departments (Engineering, HR, Sales). Inside Engineering, create teams (Frontend, Backend, DevOps).
2. **Custom Roles:** Go to **Settings > Roles**. Create a new role called "Senior Developer". Give them granular permissions: `tasks.manage`, `projects.view`, `code.deploy`, but restrict `billing.manage` and `users.delete`.
3. **Inviting Users:** Go to the **Users** module. Click "Invite User". Enter the email addresses of your employees. Select their Role, Department, and Team. They will receive an email invite with a secure link to join your isolated workspace.

### Phase 3: Project & Task Management
1. **Creating a Project:** Navigate to **Projects > Create**. Define the project scope, add team members, and set milestones.
2. **Kanban Boards:** Open the project. Create columns like "Backlog", "In Progress", "In Review", "Done".
3. **Managing Tasks:** Create tasks. Assign them to users. Set Due Dates and Priorities. Users can click on a task to open a side-drawer where they can upload files, write descriptions in rich text, and communicate in the comments section.

### Phase 4: Setting up the IT Service Desk (ITSM)
1. **Service Catalog:** Go to **Catalog**. Create actionable items employees can request. Examples: "Request Software License", "Report Broken Monitor", "Request Server Access".
2. **Handling Incidents:** When something breaks (e.g., "Website is down"), users raise an Incident. The IT team views this in their dedicated dashboard.
3. **Knowledge Base Linking:** If a user tries to raise a ticket for "How to reset my VPN", the system automatically suggests Knowledge Base articles to deflect the ticket and save time.
4. **Change Management:** If an incident requires replacing a server, IT logs a "Change Request" to document the risk, backout plan, and get necessary approvals before executing.

### Phase 5: Daily Collaboration
1. **Internal Chat:** Users can click the Chat icon to DM colleagues or chat in Project-specific channels.
2. **Announcements:** The HR team pins an announcement to the main dashboard: "Office Party this Friday!". Everyone sees it upon logging in.
3. **Personal Dashboard:** Every user logs in to a personalized dashboard showing *their* pending tasks, *their* active tickets, and *their* upcoming deadlines.

---

# 💻 DEVELOPER GUIDE: HOW TO CLONE AND RUN THE PROJECT

This project is open-source and easy to run on your local machine. Follow these detailed steps to get a complete local development environment running.

### 📋 Prerequisites
Before you begin, ensure you have the following installed on your system:
- **Node.js** (v18 or higher recommended)
- **Git** (Command line tool)
- **PNPM** (Package manager). Install it via `npm install -g pnpm`.
- A free account on **Supabase** (for the database and authentication).

### 🚀 Step 1: Clone the Repository
Open your terminal or command prompt and run the following command using the real GitHub link:

```bash
git clone https://github.com/prathameshgiri/ORG MAN.git
```

Navigate into the cloned directory:

```bash
cd ORG MAN
```

### 📦 Step 2: Install Dependencies
We use PNPM for incredibly fast, disk-efficient package management. Run:

```bash
pnpm install
```
*(This will download all necessary packages for both the frontend React app and the backend Express server).*

### 🔐 Step 3: Environment Variables Configuration
The application requires connection strings to communicate with your Supabase database. 

1. Create a new file in the root directory named `.env`.
2. Go to your Supabase project dashboard -> Settings -> API.
3. Copy the URL and the `anon` public key. Add them to your `.env` file like this:

```env
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 🗄️ Step 4: Database Setup (Supabase)
To set up the necessary tables, schema, and Row Level Security policies:
1. Navigate to the SQL Editor in your Supabase dashboard.
2. Open the file located at `supabase/migrations/20260911180338_core_architecture.sql` in the repository.
3. Copy the entire contents of that SQL file.
4. Paste it into the Supabase SQL Editor and hit "Run". 
*(This will instantly create all tables for Users, Organizations, Tasks, Tickets, etc., and apply all security rules).*

### 🏃 Step 5: Run the Development Server
Now you are ready to start the application! Run:

```bash
pnpm dev
```
- The Vite development server will start.
- It concurrently runs both the React Frontend and the Express Backend.
- Open your browser and navigate to `http://localhost:8080` (or the port specified in your terminal).
- You can now register a new user, create an organization, and start exploring the platform!

---

# 🏭 PRODUCTION DEPLOYMENT (BUILDING)

When you are ready to deploy the application to a production environment (like Netlify, Vercel, or your own server):

1. **Build the Application:**
   ```bash
   pnpm build
   ```
   *This command compiles the React frontend into highly optimized static assets (HTML/CSS/JS) and transpiles the Express TypeScript backend into plain Node.js JavaScript.*

2. **Start Production Server:**
   ```bash
   pnpm start
   ```
   *This runs the compiled Node.js backend which serves both the API endpoints and the static frontend files.*

---

# 🤝 CONTRIBUTING

We welcome contributions to ORG MAN! If you want to help make this platform even better:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes using descriptive commit messages (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request on GitHub.

Please ensure your code follows the existing formatting rules (`pnpm format.fix`) and passes all type checks (`pnpm typecheck`).

---

# 📜 LICENSE

This project is licensed under the MIT License. You are free to use, modify, and distribute this software for both personal and commercial purposes.

---
<p align="center">
  <b>ORG MAN</b> — <i>Built with Prathamesh Giri for modern organizations.</i>
</p>
