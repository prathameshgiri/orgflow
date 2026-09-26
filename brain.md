# ORG FLOW - Project Brain 🧠

This file (`brain.md`) serves as the central nervous system for the ORG FLOW project. **Any AI assistant working on this project MUST read this file first** to understand the architecture, context, and current state of the application. 

Whenever new features are added, database schemas are modified, or major UI changes are made, this file **MUST** be updated to reflect those changes.

---

## 🏗️ 1. Architecture & Tech Stack
- **Project Name:** ORG FLOW
- **Frontend:** React 18, React Router 6 (SPA mode), Vite, TypeScript, TailwindCSS 3.
- **Backend:** Express.js (integrated into Vite dev server, running on port 8080).
- **Database:** Supabase (PostgreSQL) with strict Multi-Tenant Row Level Security (RLS).
- **Styling:** Premium, modern 3D UI. High-contrast gradients (Indigo/Purple/Pink), glassmorphism, soft drop shadows, and Lucide React icons.

---

## 🗄️ 2. Database Schema (Supabase)
All tables use `organization_id` for tenant isolation. RLS policies enforce that users can only see and interact with data belonging to their organization.

### Core Entities:
- **`organizations`**: The top-level tenant.
- **`users`**: Platform users. (Cannot be deleted via frontend API due to security rules; must be managed via Supabase Dashboard).
- **`teams`**: Logical grouping of users.
- **`projects`**: High-level initiatives.
- **`tasks`**: Standard tasks.
- **`project_tasks` (PTASK)**: Tasks specifically bound to a project.
- **`service_requests` (SCTASK)**: IT service catalog requests.
- **`incidents` (INCIDENT)**: IT issues or outages.
- **`knowledge_articles` & `article_categories`**: KB documentation.
- **`workflows` & `automation_rules`**: System automation logic.

---

## 📧 3. Notification & Email System
- **SMTP Backend:** `server/utils/email.ts` uses Nodemailer with `.env` credentials (`SMTP_HOST`, `SMTP_USER`, etc.).
- **UI Design:** All emails use a premium, mobile-responsive HTML wrapper featuring a vibrant 3D gradient header and embossed buttons.
- **API Endpoint:** `/api/notify/assignment` triggers backend emails for new tasks/incidents.
- **Auth Emails:** Supabase Authentication (Signup, Reset Password, Magic Link) templates are stored in `supabase/email_templates/`. These HTML files must be manually copied into the Supabase Dashboard.

---

## 🚦 4. Development Rules & Guidelines
1. **Never break Tenant Isolation:** Always ensure queries and inserts include `organization_id` context where required, though RLS handles most of the security.
2. **Keep the UI Premium:** This is a high-end SaaS product. Always use rich Tailwind gradients, smooth transitions (`animate-in fade-in`), and proper padding/shadows. Never use basic/flat designs.
3. **No Direct User Deletion:** Do not build UI buttons that attempt to run `.delete()` on the `users` table via the anonymous client. RLS blocks this. 
4. **Update the Brain:** If you create a new table, new page, or new core feature, you MUST add it to this `brain.md` document.
5. **Update SQL Schema:** "Supabase me jo bhi change karna ho, main wale sql file me dalein". ANY time you make a change to the database schema, functions, triggers, or RLS, you MUST update `supabase/migrations/20260911180338_core_architecture.sql` so that the project remains reproducible.
6. **Typescript Strictness:** The project uses `strict: false` to allow rapid prototyping. If third-party libraries (like `framer-motion` or `nodemailer`) throw namespace errors, casting to `any` is an acceptable temporary workaround to keep the build running.

---

## 📝 5. Recent Major Changes (Changelog)
- **[Sep 26, 2026]**: Replaced Ethereal email with real SMTP. Upgraded all email templates (Supabase Auth & Backend) to a premium 3D UI with gradients. 
- **[Sep 26, 2026]**: Dashboard overhauled to include a unified view of PTASK, SCTASK, and INCIDENTs using real-time Supabase subscriptions.
- **[Sep 25, 2026]**: Implemented complete ITSM schema (`core_architecture.sql`).

---
*End of Brain.*
