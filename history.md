# Project Architecture & Codebase History

## Folder Structure & File Details

📄 `.dockerignore` - *62 lines* - Project asset or config.
📄 `.env` - *10 lines* - Project asset or config.
📄 `.gitignore` - *44 lines* - Project asset or config.
📄 `.npmrc` - *1 lines* - Project asset or config.
📄 `.prettierrc` - *6 lines* - Project asset or config.
📄 `AGENTS.md` - *167 lines* - Documentation or notes.
📄 `brain.md` - *69 lines* - Documentation or notes.
📄 `builder.config.json` - *8 lines* - Configuration file.
📁 **client/**
  📄 `App.tsx` - *150 lines* - React component for UI rendering and logic.
  📁 **components/**
    📄 `AppSidebar.tsx` - *179 lines* - React component for UI rendering and logic.
    📄 `DashboardLayout.tsx` - *180 lines* - Manages the main layout, sidebar, and auto-fetching of the active organization.
    📄 `Footer.tsx` - *91 lines* - React component for UI rendering and logic.
    📄 `Navbar.tsx` - *127 lines* - React component for UI rendering and logic.
    📄 `ProtectedRoute.tsx` - *24 lines* - React component for UI rendering and logic.
    📁 **ui/**
      📄 `accordion.tsx` - *57 lines* - React component for UI rendering and logic.
      📄 `alert-dialog.tsx` - *140 lines* - React component for UI rendering and logic.
      📄 `alert.tsx` - *60 lines* - React component for UI rendering and logic.
      📄 `aspect-ratio.tsx` - *6 lines* - React component for UI rendering and logic.
      📄 `avatar.tsx` - *49 lines* - React component for UI rendering and logic.
      📄 `badge.tsx` - *38 lines* - React component for UI rendering and logic.
      📄 `breadcrumb.tsx` - *116 lines* - React component for UI rendering and logic.
      📄 `button.tsx` - *58 lines* - React component for UI rendering and logic.
      📄 `calendar.tsx` - *69 lines* - React component for UI rendering and logic.
      📄 `card.tsx` - *87 lines* - React component for UI rendering and logic.
      📄 `carousel.tsx` - *261 lines* - React component for UI rendering and logic.
      📄 `chart.tsx` - *370 lines* - React component for UI rendering and logic.
      📄 `checkbox.tsx` - *29 lines* - React component for UI rendering and logic.
      📄 `collapsible.tsx` - *10 lines* - React component for UI rendering and logic.
      📄 `command.tsx` - *154 lines* - React component for UI rendering and logic.
      📄 `context-menu.tsx` - *199 lines* - React component for UI rendering and logic.
      📄 `dialog.tsx` - *121 lines* - React component for UI rendering and logic.
      📄 `drawer.tsx` - *117 lines* - React component for UI rendering and logic.
      📄 `dropdown-menu.tsx` - *199 lines* - React component for UI rendering and logic.
      📄 `form.tsx` - *178 lines* - React component for UI rendering and logic.
      📄 `hover-card.tsx` - *28 lines* - React component for UI rendering and logic.
      📄 `input-otp.tsx` - *70 lines* - React component for UI rendering and logic.
      📄 `input.tsx` - *23 lines* - React component for UI rendering and logic.
      📄 `label.tsx` - *25 lines* - React component for UI rendering and logic.
      📄 `menubar.tsx` - *235 lines* - React component for UI rendering and logic.
      📄 `navigation-menu.tsx` - *129 lines* - React component for UI rendering and logic.
      📄 `pagination.tsx` - *118 lines* - React component for UI rendering and logic.
      📄 `popover.tsx` - *30 lines* - React component for UI rendering and logic.
      📄 `progress.tsx` - *27 lines* - React component for UI rendering and logic.
      📄 `radio-group.tsx` - *43 lines* - React component for UI rendering and logic.
      📄 `resizable.tsx` - *44 lines* - React component for UI rendering and logic.
      📄 `scroll-area.tsx` - *47 lines* - React component for UI rendering and logic.
      📄 `select.tsx` - *159 lines* - React component for UI rendering and logic.
      📄 `separator.tsx` - *30 lines* - React component for UI rendering and logic.
      📄 `sheet.tsx` - *140 lines* - React component for UI rendering and logic.
      📄 `sidebar.tsx` - *770 lines* - React component for UI rendering and logic.
      📄 `skeleton.tsx` - *16 lines* - React component for UI rendering and logic.
      📄 `slider.tsx` - *27 lines* - React component for UI rendering and logic.
      📄 `sonner.tsx` - *30 lines* - React component for UI rendering and logic.
      📄 `switch.tsx` - *28 lines* - React component for UI rendering and logic.
      📄 `table.tsx` - *118 lines* - React component for UI rendering and logic.
      📄 `tabs.tsx` - *54 lines* - React component for UI rendering and logic.
      📄 `textarea.tsx` - *24 lines* - React component for UI rendering and logic.
      📄 `toast.tsx` - *141 lines* - React component for UI rendering and logic.
      📄 `toaster.tsx` - *71 lines* - React component for UI rendering and logic.
      📄 `toggle-group.tsx` - *60 lines* - React component for UI rendering and logic.
      📄 `toggle.tsx` - *44 lines* - React component for UI rendering and logic.
      📄 `tooltip.tsx` - *29 lines* - React component for UI rendering and logic.
      📄 `use-toast.ts` - *4 lines* - Utility or logic script.
  📁 **context/**
    📄 `AuthContext.tsx` - *50 lines* - Provides global authentication state (user, session) to the React app.
  📄 `global.css` - *72 lines* - Styles and Tailwind configuration.
  📁 **hooks/**
    📄 `use-mobile.tsx` - *22 lines* - React component for UI rendering and logic.
    📄 `use-toast.ts` - *189 lines* - Utility or logic script.
    📄 `useOrganization.ts` - *49 lines* - Utility or logic script.
    📄 `usePermissions.ts` - *69 lines* - Utility or logic script.
  📁 **lib/**
    📄 `utils.spec.ts` - *33 lines* - Utility or logic script.
    📄 `utils.ts` - *7 lines* - Utility or logic script.
  📁 **pages/**
    📄 `ApprovalDetails.tsx` - *349 lines* - React component for UI rendering and logic.
    📄 `Approvals.tsx` - *252 lines* - React component for UI rendering and logic.
    📄 `ArticleView.tsx` - *188 lines* - React component for UI rendering and logic.
    📄 `CreateApproval.tsx` - *275 lines* - React component for UI rendering and logic.
    📄 `CreateArticle.tsx` - *210 lines* - React component for UI rendering and logic.
    📄 `CreateIncident.tsx` - *232 lines* - React component for UI rendering and logic.
    📄 `CreateProject.tsx` - *175 lines* - React component for UI rendering and logic.
    📄 `CreateRequest.tsx` - *106 lines* - React component for UI rendering and logic.
    📄 `CreateTask.tsx` - *318 lines* - React component for UI rendering and logic.
    📄 `CreateTeam.tsx` - *166 lines* - React component for UI rendering and logic.
    📄 `CreateTicket.tsx` - *232 lines* - React component for UI rendering and logic.
    📄 `CreateWorkflow.tsx` - *309 lines* - React component for UI rendering and logic.
    📄 `Dashboard.tsx` - *438 lines* - React component for UI rendering and logic.
    📄 `ForgotPassword.tsx` - *238 lines* - React component for UI rendering and logic.
    📄 `IncidentDetails.tsx` - *288 lines* - React component for UI rendering and logic.
    📄 `IncidentHistory.tsx` - *402 lines* - React component for UI rendering and logic.
    📄 `Incidents.tsx` - *314 lines* - React component for UI rendering and logic.
    📄 `Index.tsx` - *524 lines* - React component for UI rendering and logic.
    📄 `InviteUser.tsx` - *186 lines* - React component for UI rendering and logic.
    📄 `KnowledgeBase.tsx` - *116 lines* - React component for UI rendering and logic.
    📄 `Login.tsx` - *280 lines* - React component for UI rendering and logic.
    📄 `NotFound.tsx` - *28 lines* - React component for UI rendering and logic.
    📄 `Placeholder.tsx` - *9 lines* - React component for UI rendering and logic.
    📄 `Pricing.tsx` - *77 lines* - React component for UI rendering and logic.
    📄 `ProjectHistory.tsx` - *803 lines* - React component for UI rendering and logic.
    📄 `Projects.tsx` - *475 lines* - React component for UI rendering and logic.
    📄 `Reports.tsx` - *352 lines* - React component for UI rendering and logic.
    📄 `RequestHistory.tsx` - *289 lines* - React component for UI rendering and logic.
    📄 `Requests.tsx` - *155 lines* - React component for UI rendering and logic.
    📄 `Roles.tsx` - *194 lines* - React component for UI rendering and logic.
    📄 `ServiceDesk.tsx` - *357 lines* - React component for UI rendering and logic.
    📄 `Settings.tsx` - *347 lines* - React component for UI rendering and logic.
    📄 `Signup.tsx` - *377 lines* - Handles user registration and passes metadata to Supabase Auth.
    📄 `SLA.tsx` - *22 lines* - React component for UI rendering and logic.
    📄 `SuperAdmin.tsx` - *274 lines* - React component for UI rendering and logic.
    📄 `TaskDetails.tsx` - *515 lines* - React component for UI rendering and logic.
    📄 `TaskHistory.tsx` - *383 lines* - React component for UI rendering and logic.
    📄 `Tasks.tsx` - *346 lines* - React component for UI rendering and logic.
    📄 `TeamHistory.tsx` - *225 lines* - React component for UI rendering and logic.
    📄 `TeamMembers.tsx` - *332 lines* - React component for UI rendering and logic.
    📄 `Teams.tsx` - *351 lines* - React component for UI rendering and logic.
    📄 `UpdateIncident.tsx` - *290 lines* - React component for UI rendering and logic.
    📄 `UpdateRequest.tsx` - *342 lines* - React component for UI rendering and logic.
    📄 `UpdateTask.tsx` - *406 lines* - React component for UI rendering and logic.
    📄 `Users.tsx` - *281 lines* - React component for UI rendering and logic.
    📄 `WorkflowDetails.tsx` - *448 lines* - React component for UI rendering and logic.
    📄 `Workflows.tsx` - *175 lines* - React component for UI rendering and logic.
  📁 **store/**
    📄 `orgStore.ts` - *12 lines* - Zustand store for managing the globally active organization ID.
  📄 `vite-env.d.ts` - *2 lines* - Utility or logic script.
📄 `components.json` - *21 lines* - Configuration file.
📄 `debug.ts` - *35 lines* - Utility or logic script.
📄 `generate-history.cjs` - *69 lines* - Project asset or config.
📄 `index.html` - *16 lines* - Project asset or config.
📁 **netlify/**
  📁 **functions/**
    📄 `api.ts` - *6 lines* - Utility or logic script.
📄 `netlify.toml` - *20 lines* - Project asset or config.
📄 `package-lock.json` - *9337 lines* - Configuration file.
📄 `package.json` - *110 lines* - Configuration file.
📄 `pnpm-lock.yaml` - *6482 lines* - Project asset or config.
📄 `postcss.config.js` - *6 lines* - Utility or logic script.
📄 `prd.md` - *2677 lines* - Documentation or notes.
📁 **public/**
  📄 `robots.txt` - *15 lines* - Project asset or config.
📄 `README.md` - *299 lines* - Documentation or notes.
📁 **server/**
  📄 `index.ts` - *98 lines* - Utility or logic script.
  📁 **middleware/**
    📄 `auth.ts` - *92 lines* - Utility or logic script.
    📄 `orgContext.ts` - *58 lines* - Utility or logic script.
  📄 `node-build.ts` - *41 lines* - Utility or logic script.
  📁 **routes/**
    📄 `dashboard.ts` - *35 lines* - Utility or logic script.
    📄 `demo.ts` - *10 lines* - Utility or logic script.
    📄 `incidents.ts` - *238 lines* - Utility or logic script.
    📄 `notify.ts` - *61 lines* - Utility or logic script.
    📄 `organizations.ts` - *52 lines* - Utility or logic script.
    📄 `roles.ts` - *184 lines* - Utility or logic script.
    📄 `teams.ts` - *236 lines* - Utility or logic script.
    📄 `users.ts` - *118 lines* - Utility or logic script.
    📄 `workflows.ts` - *164 lines* - Utility or logic script.
  📁 **utils/**
    📄 `email.ts` - *114 lines* - Utility or logic script.
📁 **shared/**
  📄 `api.ts` - *13 lines* - Utility or logic script.
  📄 `models.ts` - *85 lines* - Utility or logic script.
  📄 `supabase.ts` - *20 lines* - Utility or logic script.
📄 `skills-lock.json` - *18 lines* - Configuration file.
📁 **supabase/**
  📁 **.temp/**
    📄 `cli-latest` - *1 lines* - Project asset or config.
  📄 `config.toml` - *416 lines* - Project asset or config.
  📁 **email_templates/**
    📄 `1_confirm_signup.html` - *54 lines* - Project asset or config.
    📄 `2_invite_user.html` - *54 lines* - Project asset or config.
    📄 `3_magic_link.html` - *54 lines* - Project asset or config.
    📄 `4_change_email.html` - *55 lines* - Project asset or config.
    📄 `5_reset_password.html` - *55 lines* - Project asset or config.
    📄 `6_reauth_code.html` - *55 lines* - Project asset or config.
  📁 **migrations/**
    📄 `20260911180338_core_architecture.sql` - *1131 lines* - Defines the entire Postgres database schema, RLS policies, and Auth triggers.
  📄 `supabase_email_setup.md` - *119 lines* - Documentation or notes.
📄 `tailwind.config.ts` - *102 lines* - Utility or logic script.
📄 `test-db.js` - *25 lines* - Utility or logic script.
📄 `test-flow.mjs` - *36 lines* - Project asset or config.
📄 `tsconfig.json` - *41 lines* - Configuration file.
📄 `vite.config.server.ts` - *54 lines* - Utility or logic script.
📄 `vite.config.ts` - *40 lines* - Utility or logic script.

## Summary Statistics
- **Total Folders (inc. subfolders):** 20
- **Total Files:** 167
- **Total Lines of Code:** 42978
