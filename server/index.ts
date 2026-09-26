import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo.ts";
import { requireAuth, AuthenticatedRequest } from "./middleware/auth.ts";
import { requireOrgAccess } from "./middleware/orgContext.ts";
import { getOrganizations, createOrganization } from "./routes/organizations.ts";
import { getOrgDashboard } from "./routes/dashboard.ts";
import { getRoles, createRole, getPermissions, updateRolePermissions, getCurrentUserPermissions } from "./routes/roles.ts";
import { getOrgUsers, inviteUser, updateUserRole } from "./routes/users.ts";
import { getTeams, createTeam, addTeamMember, removeTeamMember, getTeamMembers, getTeamHistory } from "./routes/teams.ts";
import { getIncidents, updateIncident, getIncidentHistory, addIncidentProgress } from "./routes/incidents.ts";
import { triggerWorkflow } from "./routes/workflows.ts";
import notifyRoutes from "./routes/notify.ts";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Protected route example
  app.get("/api/me", requireAuth, (req: AuthenticatedRequest, res: express.Response) => {
    res.json({ user: req.user });
  });

  // Current user's org permissions
  app.get("/api/me/permissions", requireAuth, requireOrgAccess, getCurrentUserPermissions);

  // Organization management (Super Admin & User context)
  app.get("/api/organizations", requireAuth, getOrganizations);
  app.post("/api/organizations", requireAuth, createOrganization);

  // Org Dashboard (requires org context)
  app.get("/api/dashboard", requireAuth, requireOrgAccess, getOrgDashboard);

  // Roles & Permissions (requires org context)
  app.get("/api/roles", requireAuth, requireOrgAccess, getRoles);
  app.post("/api/roles", requireAuth, requireOrgAccess, createRole);
  app.get("/api/permissions", requireAuth, requireOrgAccess, getPermissions);
  app.put("/api/roles/:roleId/permissions", requireAuth, requireOrgAccess, updateRolePermissions);

  // Users (requires org context)
  app.get("/api/users", requireAuth, requireOrgAccess, getOrgUsers);
  app.post("/api/users/invite", requireAuth, requireOrgAccess, inviteUser);
  app.put("/api/users/:memberId/role", requireAuth, requireOrgAccess, updateUserRole);

  // Teams
  app.get("/api/teams", requireAuth, requireOrgAccess, getTeams);
  app.post("/api/teams", requireAuth, requireOrgAccess, createTeam);
  app.get("/api/teams/:id/members", requireAuth, requireOrgAccess, getTeamMembers);
  app.post("/api/teams/:id/members", requireAuth, requireOrgAccess, addTeamMember);
  app.delete("/api/teams/:id/members/:userId", requireAuth, requireOrgAccess, removeTeamMember);
  app.get("/api/teams/:id/history", requireAuth, requireOrgAccess, getTeamHistory);

  // Incidents Routes
  app.get("/api/incidents", requireAuth, requireOrgAccess, getIncidents);
  app.put("/api/incidents/:id", requireAuth, requireOrgAccess, updateIncident);
  app.get("/api/incidents/:id/history", requireAuth, requireOrgAccess, getIncidentHistory);
  app.post("/api/incidents/:id/progress", requireAuth, requireOrgAccess, addIncidentProgress);

  // Workflow & Automation Engine
  // We use requireAuth to ensure only valid users can trigger it, but you could also secure this with a secret for internal system calls.
  app.post("/api/workflows/trigger", requireAuth, triggerWorkflow);

  // Email Notifications
  app.use("/api/notify", requireAuth, requireOrgAccess, notifyRoutes);

  // ==========================================
  // ORG MAN ITSM MODULES (Stubs for Phase 2+)
  // ==========================================
  
  // Incidents
  // app.use("/api/incidents", requireAuth, requireOrgAccess, incidentRoutes);
  
  // Service Requests
  // app.use("/api/requests", requireAuth, requireOrgAccess, requestRoutes);
  
  // Projects & Tasks
  // app.use("/api/projects", requireAuth, requireOrgAccess, projectRoutes);
  // app.use("/api/tasks", requireAuth, requireOrgAccess, taskRoutes);
  
  // Assets & CI
  // app.use("/api/assets", requireAuth, requireOrgAccess, assetRoutes);

  return app;
}
